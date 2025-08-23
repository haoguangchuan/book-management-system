import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from './book-file-storage';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async list() {
    return this.bookService.list();
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.bookService.findById(id);
  }

  @Post('create')
  async create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Post('update')
  async update(@Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(updateBookDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return this.bookService.delete(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      limits: {
        fileSize: 1024 * 1024 * 10,
      },
      storage: storage,
      fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          cb(new Error('File type is not supported'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename,
      filePath: `uploads/${file.filename}`,
    };
  }
}
