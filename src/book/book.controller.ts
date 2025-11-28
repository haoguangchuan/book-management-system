import * as path from 'path';
import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Body,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { storage } from './book-file-storage';

@Controller('books')
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

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: 'uploads',
      limits: {
        fileSize: 1024 * 1024 * 50, // 50MB
      },
      storage: storage,
    }),
  )
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 从 FormData 中提取文本字段
    const createBookDto: CreateBookDto = {
      name: body.name,
      author: body.author,
      description: body.description || '',
      coverImage: '',
      bookFile: '',
    };

    // 处理上传的文件
    if (files && files.length > 0) {
      files.forEach((file) => {
        const filePath = `uploads/${file.filename}`;
        // 根据字段名区分封面图片和图书文件
        if (file.fieldname === 'coverImage') {
          createBookDto.coverImage = filePath;
        } else if (file.fieldname === 'bookFile') {
          createBookDto.bookFile = filePath;
        }
      });
    }

    return this.bookService.create(createBookDto);
  }

  @Put(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: 'uploads',
      limits: {
        fileSize: 1024 * 1024 * 50, // 50MB
      },
      storage: storage,
    }),
  )
  async update(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 先获取原有书籍信息，用于保留未更新的文件路径
    const existingBook = await this.bookService.findById(id);

    // 从 FormData 中提取文本字段
    const updateBookDto: UpdateBookDto = {
      name: body.name,
      author: body.author,
      description: body.description || '',
      // 默认使用原有文件路径
      coverImage: existingBook?.coverImage || '',
      bookFile: existingBook?.bookFile || '',
    };

    // 处理上传的新文件，如果有新文件则覆盖原有路径
    if (files && files.length > 0) {
      files.forEach((file) => {
        const filePath = `uploads/${file.filename}`;
        // 根据字段名区分封面图片和图书文件
        if (file.fieldname === 'coverImage') {
          updateBookDto.coverImage = filePath;
        } else if (file.fieldname === 'bookFile') {
          updateBookDto.bookFile = filePath;
        }
      });
    }

    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
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
