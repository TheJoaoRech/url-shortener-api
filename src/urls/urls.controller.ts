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
  @ApiOperation({ summary: 'Shorten a URL (with or without authentication)' })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Custom alias already in use' })
  @ApiBearerAuth()
  async shorten(@Body() createUrlDto: CreateUrlDto, @OptionalAuth() user: any) {
    const userId = user?.userId || null;
    return this.urlsService.create(createUrlDto, userId);
  }

  @Get('my-urls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all URLs created by authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of user URLs',
    type: [UrlResponseDto],
  })
  async findMyUrls(@Request() req: any) {
    return this.urlsService.findAllByUser(req.user.userId);
  }

  @Put('my-urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update original URL' })
  @ApiResponse({
    status: 200,
    description: 'URL successfully updated',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @ApiResponse({ status: 403, description: 'Not allowed to update this URL' })
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req: any,
  ) {
    return this.urlsService.update(id, updateUrlDto, req.user.userId);
  }

  @Delete('my-urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a URL' })
  @ApiResponse({ status: 200, description: 'URL successfully deleted' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @ApiResponse({ status: 403, description: 'Not allowed to delete this URL' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.urlsService.remove(id, req.user.userId);
    return { message: 'URL successfully deleted' };
  }

  @Get(':shortCode')
  @ApiOperation({
    summary: 'Redirect to original URL and increment click count',
  })
  @ApiResponse({ status: 302, description: 'Redirect to original URL' })
  @ApiResponse({ status: 404, description: 'URL not found or deleted' })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const url = await this.urlsService.findOneByShortCode(shortCode);

    if (!url || url.deletedAt) {
      throw new NotFoundException('URL not found');
    }

    await this.urlsService.incrementClickCount(url.id);

    return res.redirect(HttpStatus.FOUND, url.originalUrl);
  }
}
