import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';

// 日志文件存储路径
const logDir = join(process.cwd(), 'logs');

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// 控制台格式（开发环境使用）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
  }),
);

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),

    // 错误日志文件
    new winston.transports.File({
      filename: join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 所有日志文件
    new winston.transports.File({
      filename: join(logDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
};
