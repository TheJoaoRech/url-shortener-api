import { Controller, Get, UseGuards } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OptionalAuth } from '../../../src/auth/decorators/optional-auth.decorator';
import { OptionalJwtAuthGuard } from '../../../src/auth/guards/optional-jwt-auth.guard';

@Controller('test-decorator')
class TestDecoratorController {
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  testEndpoint(@OptionalAuth() user: any) {
    return { user };
  }
}

describe('OptionalAuth Decorator Integration', () => {
  let controller: TestDecoratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestDecoratorController],
    }).compile();

    controller = module.get<TestDecoratorController>(TestDecoratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should extract user from request when present', () => {
    const mockUser = { userId: '123', email: 'test@test.com' };

    const result = controller.testEndpoint(mockUser);

    expect(result).toEqual({ user: mockUser });
  });

  it('should return null when user not present', () => {
    const result = controller.testEndpoint(null);

    expect(result).toEqual({ user: null });
  });

  it('should handle undefined user', () => {
    const result = controller.testEndpoint(undefined);

    expect(result).toEqual({ user: undefined });
  });
});
