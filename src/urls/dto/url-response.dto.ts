import { ApiProperty } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier (UUID) of the shortened URL',
  })
  id: string;

  @ApiProperty({
    example: 'https://github.com/TheJoaoRech/url-shortener-api/tree/main',
    description: 'The original long URL that was shortened',
  })
  originalUrl: string;

  @ApiProperty({
    example: 'aZbKq7',
    description:
      'Short code (6 alphanumeric characters or custom alias) used for redirection',
  })
  shortCode: string;

  @ApiProperty({
    example: 'http://localhost:3000/aZbKq7',
    description: 'Complete shortened URL ready to share and use',
  })
  shortUrl: string;

  @ApiProperty({
    example: 0,
    description: 'Number of times this shortened URL has been accessed',
  })
  clickCount: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the URL was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the URL was last updated',
  })
  updatedAt: Date;
}
