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
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

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
      .setDescription(
        '🔗 A modern URL shortening service with JWT authentication, built with NestJS, TypeScript, and PostgreSQL!\n\n' +
          '**Features:**\n' +
          '- User authentication with JWT\n' +
          '- URL shortening with random or custom aliases\n' +
          '- Click tracking for each URL\n' +
          '- Update and soft delete URLs\n' +
          '- Public redirection endpoint (no auth required)\n' +
          '- Soft delete with alias reuse capability\n\n' +
          '**Getting Started:**\n' +
          '1. Register a user at `/auth/register`\n' +
          '2. Login at `/auth/login` to get your JWT token\n' +
          '3. Click the "Authorize" button and enter: `Bearer <your-token>`\n' +
          '4. Start shortening URLs!\n\n' +
          '**Repository:** https://github.com/TheJoaoRech/url-shortener-api',
      )
      .setVersion('2.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
        'JWT',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'URL Shortener API',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
    });

    console.log('Initializing NestJS application...');
    await app.init();
    console.log('NestJS application initialized successfully');
    console.log('Swagger documentation available at: /api/docs');

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
