import { ApiProperty } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({
    example: 'https://github.com/TheJoaoRech/url-shortener-api/tree/main',
  })
  originalUrl: string;

  @ApiProperty({ example: 'aZbKq7' })
  shortCode: string;

  @ApiProperty({ example: 'http://localhost:3000/aZbKq7' })
  shortUrl: string;

  @ApiProperty({ example: 0 })
  clickCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
