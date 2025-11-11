import { ExecutionContext } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../../../../src/auth/guards/optional-jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;

  beforeEach(() => {
    guard = new OptionalJwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user when user exists', () => {
      const mockUser = { userId: '123', email: 'test@test.com' };
      const result = guard.handleRequest(null, mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user does not exist', () => {
      const result = guard.handleRequest(null, null);

      expect(result).toBeNull();
    });

    it('should return null when user is undefined', () => {
      const result = guard.handleRequest(null, undefined);

      expect(result).toBeNull();
    });

    it('should return null even with error present', () => {
      const mockError = new Error('Auth failed');
      const result = guard.handleRequest(mockError, null);

      expect(result).toBeNull();
    });

    it('should return user even with error present if user exists', () => {
      const mockError = new Error('Some error');
      const mockUser = { userId: '123', email: 'test@test.com' };
      const result = guard.handleRequest(mockError, mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user is false', () => {
      const result = guard.handleRequest(null, false);

      expect(result).toBeNull();
    });
  });

  describe('canActivate', () => {
    it('should call super.canActivate', () => {
      const mockContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Bearer token' },
          }),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      };

      const superSpy = jest
        .spyOn(
          Object.getPrototypeOf(OptionalJwtAuthGuard.prototype),
          'canActivate',
        )
        .mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(superSpy).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);

      superSpy.mockRestore();
    });
  });
});
