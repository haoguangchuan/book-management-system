import { IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @IsNotEmpty({ message: '作者不能为空' })
  author: string;

  @IsNotEmpty({ message: '描述不能为空' })
  description: string;

  coverImage: string;
  bookFile: string;
}
