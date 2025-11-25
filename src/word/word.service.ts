import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

@Injectable()
export class WordService {
  private readonly logger = new Logger(WordService.name);

  /**
   * 将 Word 文档按段落分割成多个文档
   * @param inputPath 输入文件路径
   * @param outputDir 输出目录
   */
  async splitWordDocumentByParagraphs(
    inputPath: string,
    outputDir: string,
  ): Promise<{ success: boolean; count: number; files: string[] }> {
    try {
      // 确保输出目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 读取 Word 文档
      const result = await mammoth.extractRawText({ path: inputPath });
      const paragraphs = result.value.split('2025年济南市第一次模拟考试成绩单');

      // 如果没有段落，尝试按单行分割
      const textLines = result.value.split('\n').filter((line) => line.trim());
      const segments =
        paragraphs.length > 1
          ? paragraphs
          : textLines.length > 0
            ? textLines
            : [result.value];

      const outputFiles: string[] = [];

      // 为每个段落创建新文档
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment) continue;

        // 创建新文档
        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: segment,
                    }),
                  ],
                }),
              ],
            },
          ],
        });

        // 生成文件名
        const inputFileName = path.basename(inputPath, path.extname(inputPath));
        const outputFileName = `${inputFileName}_段落${i + 1}.docx`;
        const outputPath = path.join(outputDir, outputFileName);

        // 保存文档
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);

        outputFiles.push(outputPath);
        this.logger.log(`已生成文档: ${outputFileName}`);
      }

      this.logger.log(`成功分割文档，共生成 ${outputFiles.length} 个文件`);

      return {
        success: true,
        count: outputFiles.length,
        files: outputFiles,
      };
    } catch (error) {
      this.logger.error(`处理 Word 文档时出错: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理 test 目录下的 Word 文档
   */
  async processTestWordDocument(): Promise<{
    success: boolean;
    count: number;
    files: string[];
  }> {
    const testDir = path.join(process.cwd(), 'test');
    const outputDir = path.join(process.cwd(), 'file');

    // 查找 test 目录下的所有 .docx 文件
    const files = fs.readdirSync(testDir);
    const docxFiles = files.filter((file) => file.endsWith('.docx'));

    if (docxFiles.length === 0) {
      throw new Error('test 目录下没有找到 Word 文档');
    }

    // 处理第一个找到的 Word 文档
    const inputPath = path.join(testDir, docxFiles[0]);
    this.logger.log(`开始处理文档: ${docxFiles[0]}`);

    return await this.splitWordDocumentByParagraphs(inputPath, outputDir);
  }
}
