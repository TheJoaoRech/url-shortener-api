import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';

@ApiTags('urls')
@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Shorten a URL (with or without authentication)',
    description:
      'Creates a shortened URL with a random 6-character code or custom alias. ' +
      'Authentication is optional - authenticated users can manage their URLs later, ' +
      'while anonymous users create URLs that cannot be edited or deleted.',
  })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid URL format or custom alias does not meet requirements (3-30 chars, lowercase, numbers, dash, underscore)',
  })
  @ApiResponse({
    status: 409,
    description: 'Custom alias already in use (excluding soft-deleted URLs)',
  })
  @ApiBearerAuth()
  async shorten(
    @Body() createUrlDto: CreateUrlDto,
    @OptionalAuth() user: { userId?: string } | undefined,
  ) {
    const userId = user?.userId;
    return this.urlsService.create(createUrlDto, userId);
  }

  @Get('my-urls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all URLs created by authenticated user',
    description:
      'Returns all active (non-deleted) shortened URLs created by the authenticated user. ' +
      'Soft-deleted URLs are automatically excluded from the results.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user URLs (excludes soft-deleted)',
    type: [UrlResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  async findMyUrls(@Request() req: { user: { userId: string } }) {
    return this.urlsService.findAllByUser(req.user.userId);
  }

  @Put('my-urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update original URL',
    description:
      'Updates the destination URL of a shortened link. The short code remains the same. ' +
      'Only the owner of the URL can update it.',
  })
  @ApiResponse({
    status: 200,
    description: 'URL successfully updated',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not allowed to update this URL (not the owner)',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found or has been deleted',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.urlsService.update(id, updateUrlDto, req.user.userId);
  }

  @Delete('my-urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft delete a URL',
    description:
      'Performs a soft delete on the shortened URL by setting deletedAt timestamp. ' +
      'The URL will no longer redirect and will return 404. The short code can be ' +
      'reused after deletion. Only the owner of the URL can delete it.',
  })
  @ApiResponse({
    status: 200,
    description: 'URL successfully soft deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'URL successfully deleted',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not allowed to delete this URL (not the owner)',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found or already deleted',
  })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    await this.urlsService.remove(id, req.user.userId);
    return { message: 'URL successfully deleted' };
  }

  @Get(':shortCode')
  @ApiOperation({
    summary: 'Redirect to original URL and increment click count',
    description:
      'Public endpoint that redirects to the original URL using the short code. ' +
      'Automatically increments the click counter. Returns 404 if the URL does not exist ' +
      'or has been soft-deleted. No authentication required.',
  })
  @ApiResponse({
    status: 302,
    description:
      'Successfully redirected to original URL (HTTP 302 Found). Click count incremented.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Short code not found, URL has been deleted, or invalid short code format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'URL not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const url = await this.urlsService.findOneByShortCode(shortCode);

    if (!url || url.deletedAt) {
      throw new NotFoundException('URL not found');
    }

    await this.urlsService.incrementClickCount(url.id);

    return res.redirect(HttpStatus.FOUND, url.originalUrl);
  }
}
