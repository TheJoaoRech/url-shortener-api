import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../../../src/app.controller';
import { AppService } from '../../../../src/app.service';
import { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should redirect to /api/docs', () => {
      const redirectMock = jest.fn();
      const mockResponse = {
        redirect: redirectMock,
      } as unknown as Response;

      appController.redirectToDocs(mockResponse);

      expect(redirectMock).toHaveBeenCalledWith('/api/docs');
    });
  });

  describe('api info', () => {
    it('should return API information', () => {
      const result = appController.getApiInfo();

      expect(result).toHaveProperty('name', 'URL Shortener API');
      expect(result).toHaveProperty('version', '2.0');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('documentation', '/api/docs');
      expect(result).toHaveProperty('repository');
    });
  });

  describe('health', () => {
    it('should return health status with all fields', () => {
      const result = appController.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
    });

    it('should return current environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const result = appController.getHealth();

      expect(result.environment).toBe('test');

      process.env.NODE_ENV = originalEnv;
    });

    it('should return development as default environment when NODE_ENV is not set', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const result = appController.getHealth();

      expect(result.environment).toBe('development');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
