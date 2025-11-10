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

const createNestServer = async (expressInstance: express.Express) => {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    {
      logger: loggerConfig,
    },
  );

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
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();

  cachedApp = app;
  return app;
};

// Initialize the app
createNestServer(expressApp)
  .then(() => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

// Export for Vercel
export default async (req: Request, res: Response) => {
  await createNestServer(expressApp);
  expressApp(req, res);
};
