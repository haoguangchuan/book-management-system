import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 注册全局拦截器（统一成功响应格式）
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 注册全局异常过滤器（统一错误响应格式）
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置静态文件服务，使 uploads 文件夹可以通过 /uploads 路径访问
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
