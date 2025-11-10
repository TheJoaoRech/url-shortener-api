import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { loggerConfig } from '../src/config/logger.config';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import express from 'express';

const expressApp = express();
const createNestServer = async (expressInstance: express.Express) => {
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

  return app;
};

createNestServer(expressApp)
  .then(() => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

export default expressApp;
