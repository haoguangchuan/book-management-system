import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const responseMessage = (
          exceptionResponse as { message?: string | string[] }
        ).message;
        message = Array.isArray(responseMessage)
          ? responseMessage[0]
          : typeof responseMessage === 'string'
            ? responseMessage
            : exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // 记录错误日志
    const errorLog = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      stack,
      body: request.body as Record<string, unknown>,
      query: request.query as Record<string, unknown>,
      params: request.params as Record<string, unknown>,
    };

    // 根据错误级别记录日志
    const statusCode = typeof status === 'number' ? status : Number(status);
    if (statusCode >= 500) {
      // 服务器错误，记录为 error 级别
      this.logger.error(
        `${request.method} ${request.url} - ${statusCode} - ${message}`,
        stack || JSON.stringify(errorLog),
        HttpExceptionFilter.name,
      );
    } else if (statusCode >= 400) {
      // 客户端错误，记录为 warn 级别
      this.logger.warn(
        `${request.method} ${request.url} - ${statusCode} - ${message}`,
        JSON.stringify(errorLog),
        HttpExceptionFilter.name,
      );
    }

    const errorResponse: ApiResponse = {
      code: status,
      message: typeof message === 'string' ? message : String(message),
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}
