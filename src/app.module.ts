import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DbModule } from './db/db.module';
import { BookModule } from './book/book.module';
import { WordModule } from './word/word.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/winston.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    UserModule,
    DbModule,
    BookModule,
    WordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
