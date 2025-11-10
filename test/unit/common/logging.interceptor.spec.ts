import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from '../../../src/common/interceptors/logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  const createMockExecutionContext = (
    method: string = 'GET',
    url: string = '/test',
    statusCode: number = 200,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          url,
          ip: '127.0.0.1',
          get: jest.fn().mockReturnValue('test-user-agent'),
        }),
        getResponse: () => ({
          statusCode,
        }),
      }),
    } as ExecutionContext;
  };

  const createMockCallHandler = (shouldError: boolean = false): CallHandler => {
    return {
      handle: () =>
        shouldError
          ? throwError(() => new Error('Test error'))
          : of({ data: 'test' }),
    } as CallHandler;
  };

  describe('intercept', () => {
    it('should log incoming request and successful response', (done) => {
      const context = createMockExecutionContext('GET', '/test', 200);
      const next = createMockCallHandler(false);
      const logSpy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Incoming request',
              method: 'GET',
              url: '/test',
            }),
          );
          expect(logSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Request completed',
              method: 'GET',
              url: '/test',
              statusCode: 200,
            }),
          );
          done();
        },
      });
    });

    it('should log incoming request and error', (done) => {
      const context = createMockExecutionContext('POST', '/error', 500);
      const next = createMockCallHandler(true);
      const logSpy = jest.spyOn(interceptor['logger'], 'log');
      const errorSpy = jest.spyOn(interceptor['logger'], 'error');

      interceptor.intercept(context, next).subscribe({
        error: () => {
          expect(logSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Incoming request',
              method: 'POST',
              url: '/error',
            }),
          );
          expect(errorSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Request failed',
              method: 'POST',
              url: '/error',
              error: 'Test error',
            }),
          );
          done();
        },
      });
    });

    it('should include IP and user agent in logs', (done) => {
      const context = createMockExecutionContext('GET', '/test', 200);
      const next = createMockCallHandler(false);
      const logSpy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              ip: '127.0.0.1',
              userAgent: 'test-user-agent',
            }),
          );
          done();
        },
      });
    });

    it('should calculate response time', (done) => {
      const context = createMockExecutionContext('GET', '/test', 200);
      const next = createMockCallHandler(false);
      const logSpy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(context, next).subscribe({
        next: () => {
          const completedCall = logSpy.mock.calls.find(
            (call) => call[0].message === 'Request completed',
          );
          expect(completedCall).toBeDefined();
          if (completedCall) {
            expect(completedCall[0].responseTime).toMatch(/\d+ms/);
          }
          done();
        },
      });
    });
  });
});
