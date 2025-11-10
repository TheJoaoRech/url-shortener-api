import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${context || 'Application'}] ${level}: ${message} ${metaStr}`;
  }),
);

const getTransports = () => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
  ];

  if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
      }),
    );
  }

  return transports;
};

export const loggerConfig = WinstonModule.createLogger({
  transports: getTransports(),
});
