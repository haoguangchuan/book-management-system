import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, LoggerService } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // 使用 Winston 日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 注册全局拦截器（统一成功响应格式）
  app.useGlobalInterceptors(new TransformInterceptor());

  // 注册全局异常过滤器（统一错误响应格式）
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置静态文件服务，使 uploads 文件夹可以通过 /uploads 路径访问
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // 记录应用启动日志
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
