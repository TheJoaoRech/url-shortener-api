import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, Matches, Length } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://github.com/TheJoaoRech/url-shortener-api/tree/main',
    description: 'Original URL to be shortened',
  })
  @IsUrl({}, { message: 'Must be a valid URL with http:// or https://' })
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
  @Length(3, 30)
  @Matches(/^[a-z0-9_-]+$/, {
    message:
      'Custom alias must contain only lowercase letters, numbers, dash and underscore',
  })
  customAlias?: string;
}
