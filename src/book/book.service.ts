import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DbService } from '../db/db.service';
import { Book } from './entities/book.entity';

const generateId = () => Math.floor(Math.random() * 1000000);

@Injectable()
export class BookService {
  @Inject()
  dbService: DbService;

  async list() {
    const books: Book[] = (await this.dbService.read()) as Book[];
    return books;
  }

  async findById(id: number) {
    const books: Book[] = (await this.dbService.read()) as Book[];
    return books.find((book) => book.id === id);
  }

  async create(createBookDto: CreateBookDto) {
    const books: Book[] = (await this.dbService.read()) as Book[];

    const book = new Book();
    book.id = generateId();
    book.name = createBookDto.name;
    book.author = createBookDto.author;
    book.description = createBookDto.description;
    book.coverImage = createBookDto.coverImage;
    book.bookFile = createBookDto.bookFile;
    books.push(book);
    await this.dbService.write(books);
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const books: Book[] = (await this.dbService.read()) as Book[];

    const foundBook: Book | undefined = books.find(
      (book) => book.id === id,
    );
    if (!foundBook) {
      throw new BadRequestException({ message: '书籍不存在' });
    }
    foundBook.name = updateBookDto.name;
    foundBook.author = updateBookDto.author;
    foundBook.coverImage = updateBookDto.coverImage;
    foundBook.bookFile = updateBookDto.bookFile;
    foundBook.description = updateBookDto.description;
    await this.dbService.write(books);
    return foundBook;
  }

  async delete(id: number) {
    const books: Book[] = (await this.dbService.read()) as Book[];
    const index = books.findIndex((book) => book.id === id);
    if (index !== -1) {
      books.splice(index, 1);
      await this.dbService.write(books);
    }
    return { message: '删除成功' };
  }
}
