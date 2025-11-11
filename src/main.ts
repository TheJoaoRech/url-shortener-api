import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loggerConfig } from './config/logger.config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

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
        description:
          'Enter JWT token obtained from /auth/login or /auth/register',
        in: 'header',
      },
      'JWT',
    )
    .addTag('auth', 'Authentication endpoints - Register and login:')
    .addTag(
      'urls',
      'URL management endpoints - Shorten, redirect, and manage URLs:',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
void bootstrap();
