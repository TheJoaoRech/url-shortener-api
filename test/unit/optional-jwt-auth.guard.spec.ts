import { ExecutionContext } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../../src/auth/guards/optional-jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;

  beforeEach(() => {
    guard = new OptionalJwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user when user exists', () => {
      const mockUser = { userId: '123', email: 'test@test.com' };
      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user does not exist', () => {
      const result = guard.handleRequest(null, null, null);

      expect(result).toBeNull();
    });

    it('should return null when user is undefined', () => {
      const result = guard.handleRequest(null, undefined, null);

      expect(result).toBeNull();
    });

    it('should return null even with error present', () => {
      const mockError = new Error('Auth failed');
      const result = guard.handleRequest(mockError, null, null);

      expect(result).toBeNull();
    });

    it('should return user even with error present if user exists', () => {
      const mockError = new Error('Some error');
      const mockUser = { userId: '123', email: 'test@test.com' };
      const result = guard.handleRequest(mockError, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should return null with info present', () => {
      const mockInfo = { message: 'No auth token' };
      const result = guard.handleRequest(null, null, mockInfo);

      expect(result).toBeNull();
    });
  });

  describe('canActivate', () => {
    it('should call super.canActivate', () => {
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Bearer token' },
          }),
        }),
      } as any as ExecutionContext;

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
