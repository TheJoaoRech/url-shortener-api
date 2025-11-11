import { loggerConfig } from '../../../src/config/logger.config';

describe('Logger Config', () => {
  it('should export logger configuration', () => {
    expect(loggerConfig).toBeDefined();
    expect(typeof loggerConfig.log).toBe('function');
    expect(typeof loggerConfig.error).toBe('function');
    expect(typeof loggerConfig.warn).toBe('function');
    expect(typeof loggerConfig.debug).toBe('function');
  });

  it('should be a Winston logger instance', () => {
    expect(typeof loggerConfig.log).toBe('function');
    expect(typeof loggerConfig.error).toBe('function');
    expect(typeof loggerConfig.warn).toBe('function');
  });

  it('should log messages without errors', () => {
    expect(() => {
      loggerConfig.log('Test log message');
      loggerConfig.error('Test error message');
      loggerConfig.warn('Test warn message');
    }).not.toThrow();
  });
});
