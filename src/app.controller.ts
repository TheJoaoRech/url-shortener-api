import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Response } from 'express';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint()
  redirectToDocs(@Res() res: Response): void {
    res.redirect('/api/docs');
  }

  @Get('api')
  @ApiOperation({ summary: 'API info and redirect to documentation' })
  getApiInfo() {
    return {
      name: 'URL Shortener API',
      version: '2.0',
      description: 'RESTful API for URL shortening with JWT authentication',
      documentation: '/api/docs',
      repository: 'https://github.com/TheJoaoRech/url-shortener-api',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Application health status' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
