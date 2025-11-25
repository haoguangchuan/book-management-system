import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiResponse } from '../interfaces/response.interface';
import { Request } from 'express';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        // 记录请求成功日志（仅在开发环境或需要时记录）
        if (process.env.NODE_ENV !== 'production') {
          this.logger.log(
            `${method} ${url} - ${duration}ms`,
            TransformInterceptor.name,
          );
        }
      }),
      map((data) => ({
        code: 200,
        message: 'success',
        data,
      })),
      catchError((error) => {
        const duration = Date.now() - startTime;
        // 记录请求失败日志
        this.logger.error(
          `${method} ${url} - ${duration}ms - Error: ${error.message}`,
          error.stack,
          TransformInterceptor.name,
        );
        return throwError(() => error);
      }),
    );
  }
}
