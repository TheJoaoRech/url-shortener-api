import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { customAlphabet } from 'nanoid';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';

@Injectable()
export class UrlsService {
  private readonly nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    6,
  );
  private readonly reservedRoutes = [
    'auth',
    'api',
    'docs',
    'my-urls',
    'shorten',
    'login',
    'register',
    'swagger',
    'health',
    'status',
    'admin',
    'user',
    'users',
    'dashboard',
    'static',
    'public',
    'assets',
  ];

  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    private configService: ConfigService,
  ) {}

  async create(
    createUrlDto: CreateUrlDto,
    userId?: string,
  ): Promise<UrlResponseDto> {
    let shortCode: string;

    if (createUrlDto.customAlias) {
      if (
        this.reservedRoutes.includes(createUrlDto.customAlias.toLowerCase())
      ) {
        throw new BadRequestException(
          'This alias is reserved and cannot be used',
        );
      }

      const existing = await this.urlsRepository.findOne({
        where: { shortCode: createUrlDto.customAlias },
        withDeleted: false,
      });

      if (existing) {
        throw new ConflictException('Custom alias already in use');
      }

      shortCode = createUrlDto.customAlias;
    } else {
      shortCode = await this.generateUniqueSlug();
    }

    const url = this.urlsRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      userId: userId || null,
    });

    const savedUrl = await this.urlsRepository.save(url);
    return this.toResponseDto(savedUrl);
  }

  async findAllByUser(userId: string): Promise<UrlResponseDto[]> {
    const urls = await this.urlsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return urls.map((url) => this.toResponseDto(url));
  }

  async findOneByShortCode(shortCode: string): Promise<Url | null> {
    return this.urlsRepository.findOne({
      where: { shortCode },
    });
  }

  async update(
    id: string,
    updateUrlDto: UpdateUrlDto,
    userId: string,
  ): Promise<UrlResponseDto> {
    const url = await this.urlsRepository.findOne({
      where: { id },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (url.userId !== userId) {
      throw new ForbiddenException('You can only update your own URLs');
    }

    url.originalUrl = updateUrlDto.originalUrl;
    const updatedUrl = await this.urlsRepository.save(url);

    return this.toResponseDto(updatedUrl);
  }

  async remove(id: string, userId: string): Promise<void> {
    const url = await this.urlsRepository.findOne({
      where: { id },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (url.userId !== userId) {
      throw new ForbiddenException('You can only delete your own URLs');
    }

    await this.urlsRepository.softDelete(id);
  }

  async incrementClickCount(id: string): Promise<void> {
    await this.urlsRepository.increment({ id }, 'clickCount', 1);
  }

  private async generateUniqueSlug(): Promise<string> {
    let slug: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      slug = this.nanoid();
      attempts++;

      const existing = await this.urlsRepository.findOne({
        where: { shortCode: slug },
        withDeleted: false,
      });

      if (!existing) {
        return slug;
      }

      if (attempts >= maxAttempts) {
        throw new Error(
          'Failed to generate unique slug after multiple attempts',
        );
      }
    } while (true);
  }

  private toResponseDto(url: Url): UrlResponseDto {
    const baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';

    return {
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }
}
