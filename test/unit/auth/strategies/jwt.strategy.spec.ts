import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../../../../src/auth/strategies/jwt.strategy';
import { UsersService } from '../../../../src/users/users.service';
import { mockUser } from '../../mocks/user.mock';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user data when user exists', async () => {
      const payload = { sub: mockUser.id, email: mockUser.email };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload = { sub: 'non-existent-id', email: 'test@test.com' };
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle undefined user gracefully', async () => {
      const payload = { sub: 'some-id', email: 'test@test.com' };
      mockUsersService.findOne.mockResolvedValue(undefined);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should extract correct userId and email from payload', async () => {
      const payload = {
        sub: '12345-abcde',
        email: 'user@example.com',
        iat: 1234567890,
        exp: 1234567899,
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result.userId).toBe(payload.sub);
      expect(result.email).toBe(payload.email);
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
    });
  });
});
