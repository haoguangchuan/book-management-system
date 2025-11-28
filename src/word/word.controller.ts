import { Controller, Get, Post, Logger } from '@nestjs/common';
import { WordService } from './word.service';

@Controller('word')
export class WordController {
  private readonly logger = new Logger(WordController.name);

  constructor(private readonly wordService: WordService) {}

  @Post('split')
  async splitWordDocument() {
    this.logger.log('开始处理 Word 文档分割请求');
    try {
      const result = await this.wordService.processTestWordDocument();
      return {
        code: 200,
        message: 'success',
        data: {
          success: result.success,
          count: result.count,
          files: result.files,
        },
      };
    } catch (error) {
      this.logger.error(`处理失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('status')
  async getStatus() {
    return {
      code: 200,
      message: 'success',
      data: {
        service: 'Word Document Split Service',
        status: 'ready',
      },
    };
  }
}
