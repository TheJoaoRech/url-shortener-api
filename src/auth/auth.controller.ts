import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email and password. Password is hashed using bcrypt (10 rounds) before storage. ' +
      'Returns a JWT token upon successful registration.',
  })
  @ApiResponse({
    status: 201,
    description:
      'User successfully registered. Returns JWT token and user info.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input - Email must be valid format, password must be at least 6 characters',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already registered by another user',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates a user with email and password. Password is verified using bcrypt. ' +
      'Returns a JWT token valid for the configured expiration time (default: 1 hour).',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns JWT token and user info.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input - Email must be valid format, password required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
