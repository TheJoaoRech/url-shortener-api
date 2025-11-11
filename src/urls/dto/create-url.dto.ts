import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://github.com/TheJoaoRech/url-shortener-api/tree/main',
    description: 'Original URL to be shortened (http:// or https:// required)',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(2048, { message: 'URL must not exceed 2048 characters' })
  @Matches(/^https?:\/\/.+/, {
    message: 'URL must start with http:// or https://',
  })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'Must be a valid URL with http:// or https://' },
  )
  originalUrl: string;

  @ApiPropertyOptional({
    example: 'my-custom-link',
    description:
      'Custom alias (3-30 chars, only lowercase, numbers, dash, underscore)',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @Matches(/^[a-z0-9_-]{3,30}$/i, {
    message:
      'Custom alias must be 3-30 characters long and contain only letters, numbers, dash and underscore',
  })
  customAlias?: string;
}
