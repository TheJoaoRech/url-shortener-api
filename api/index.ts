import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { loggerConfig } from '../src/config/logger.config';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import express, { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

const expressApp = express();
let cachedApp: INestApplication | null = null;
let isInitializing = false;
let initializationError: Error | null = null;

const createNestServer = async (expressInstance: express.Express) => {
  if (cachedApp) {
    return cachedApp;
  }

  if (isInitializing) {
    let attempts = 0;
    while (isInitializing && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (cachedApp) return cachedApp;
    if (initializationError) throw initializationError;
  }

  isInitializing = true;

  try {
    console.log('Starting NestJS application initialization...');

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressInstance),
      {
        logger: loggerConfig,
        abortOnError: false,
      },
    );

    console.log('NestJS application created successfully');

    app.useGlobalInterceptors(new LoggingInterceptor());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors();

    const config = new DocumentBuilder()
      .setTitle('URL Shortener API')
      .setDescription('RESTful API for URL shortening with JWT authentication')
      .setVersion('2.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log('Initializing NestJS application...');
    await app.init();
    console.log('NestJS application initialized successfully');

    cachedApp = app;
    isInitializing = false;
    return app;
  } catch (error) {
    console.error('Fatal error during NestJS initialization:', error);
    initializationError =
      error instanceof Error ? error : new Error(String(error));
    isInitializing = false;
    throw error;
  }
};

export default async (req: Request, res: Response) => {
  try {
    await createNestServer(expressApp);
    return expressApp(req, res);
  } catch (error) {
    console.error('Error handling request:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      });
    }
  }
};
