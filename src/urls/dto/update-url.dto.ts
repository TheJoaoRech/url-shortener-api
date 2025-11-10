import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @ApiProperty({
    example: 'https://new-url.com',
    description: 'New original URL',
  })
  @IsUrl({}, { message: 'Must be a valid URL with http:// or https://' })
  originalUrl: string;
}
