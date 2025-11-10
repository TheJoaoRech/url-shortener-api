import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UrlsService } from '../../../src/urls/urls.service';
import { Url } from '../../../src/urls/entities/url.entity';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: Repository<Url>;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create URL with auto-generated slug', async () => {
      const createUrlDto = {
        originalUrl: 'https://github.com/TheJoaoRech',
      };

      const mockUrl = {
        id: '123',
        originalUrl: createUrlDto.originalUrl,
        shortCode: 'aB3Xy9',
        userId: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUrl);
      mockRepository.save.mockResolvedValue(mockUrl);

      const result = await service.create(createUrlDto);

      expect(result).toHaveProperty('shortUrl');
      expect(result.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create URL with custom alias for authenticated user', async () => {
      const createUrlDto = {
        originalUrl: 'https://github.com/TheJoaoRech',
        customAlias: 'meu-github',
      };
      const userId = 'user-123';

      const mockUrl = {
        id: '123',
        originalUrl: createUrlDto.originalUrl,
        shortCode: 'meu-github',
        userId,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUrl);
      mockRepository.save.mockResolvedValue(mockUrl);

      const result = await service.create(createUrlDto, userId);

      expect(result.shortCode).toBe('meu-github');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { shortCode: 'meu-github' },
        withDeleted: false,
      });
    });

    it('should throw ConflictException if custom alias already exists', async () => {
      const createUrlDto = {
        originalUrl: 'https://github.com/TheJoaoRech',
        customAlias: 'existing-alias',
      };

      const existingUrl = {
        id: '456',
        originalUrl: 'https://other.com',
        shortCode: 'existing-alias',
        userId: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(existingUrl);

      await expect(service.create(createUrlDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for reserved route alias', async () => {
      const createUrlDto = {
        originalUrl: 'https://github.com/TheJoaoRech',
        customAlias: 'auth',
      };

      await expect(service.create(createUrlDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOneByShortCode', () => {
    it('should return URL by shortCode', async () => {
      const shortCode = 'aB3Xy9';
      const mockUrl = {
        id: '123',
        originalUrl: 'https://github.com',
        shortCode,
        userId: null,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUrl);

      const result = await service.findOneByShortCode(shortCode);

      expect(result).toEqual(mockUrl);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
      });
    });

    it('should return null if URL not found', async () => {
      const shortCode = 'notfound';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneByShortCode(shortCode);

      expect(result).toBeNull();
    });
  });

  describe('incrementClickCount', () => {
    it('should increment click count', async () => {
      const urlId = '123';

      await service.incrementClickCount(urlId);

      expect(repository.increment).toHaveBeenCalledWith(
        { id: urlId },
        'clickCount',
        1,
      );
    });
  });

  describe('findAllByUser', () => {
    it('should return all URLs for authenticated user', async () => {
      const userId = 'user-123';
      const mockUrls = [
        {
          id: '1',
          originalUrl: 'https://github.com',
          shortCode: 'aB3Xy9',
          userId,
          clickCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: '2',
          originalUrl: 'https://google.com',
          shortCode: 'xY9aB3',
          userId,
          clickCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockRepository.find.mockResolvedValue(mockUrls);

      const result = await service.findAllByUser(userId);

      expect(result).toHaveLength(2);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete URL', async () => {
      const urlId = '123';
      const userId = 'user-123';
      const mockUrl = {
        id: urlId,
        originalUrl: 'https://github.com',
        shortCode: 'aB3Xy9',
        userId,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUrl);

      await service.remove(urlId, userId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: urlId },
      });
      expect(repository.softDelete).toHaveBeenCalledWith(urlId);
    });

    it('should throw NotFoundException if URL not found', async () => {
      const urlId = 'notfound';
      const userId = 'user-123';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(urlId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user tries to delete URL owned by another user', async () => {
      const urlId = 'url-123';
      const userId = 'user-123';
      const differentUserId = 'different-user';
      const mockUrl = {
        id: urlId,
        originalUrl: 'https://github.com',
        shortCode: 'aB3Xy9',
        userId: differentUserId,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUrl);

      await expect(service.remove(urlId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update URL original URL', async () => {
      const urlId = '123';
      const userId = 'user-123';
      const updateUrlDto = {
        originalUrl: 'https://new-url.com',
      };
      const mockUrl = {
        id: urlId,
        originalUrl: 'https://old-url.com',
        shortCode: 'aB3Xy9',
        userId,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUrl);
      mockRepository.save.mockResolvedValue({
        ...mockUrl,
        originalUrl: updateUrlDto.originalUrl,
      });

      const result = await service.update(urlId, updateUrlDto, userId);

      expect(result.originalUrl).toBe('https://new-url.com');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: urlId } });
    });

    it('should throw NotFoundException if URL not found for update', async () => {
      const urlId = 'notfound';
      const userId = 'user-123';
      const updateUrlDto = { originalUrl: 'https://new-url.com' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(urlId, updateUrlDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own URL for update', async () => {
      const urlId = 'url-123';
      const userId = 'user-123';
      const differentUserId = 'different-user';
      const updateUrlDto = { originalUrl: 'https://new-url.com' };
      const mockUrl = {
        id: urlId,
        originalUrl: 'https://github.com',
        shortCode: 'aB3Xy9',
        userId: differentUserId,
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUrl);

      await expect(service.update(urlId, updateUrlDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('generateUniqueSlug - collision handling', () => {
    it('should generate unique slug after collision', async () => {
      const firstSlug = 'ABC123';
      const secondSlug = 'XYZ789';
      const existingUrl = {
        id: 'existing-id',
        originalUrl: 'https://example.com',
        shortCode: firstSlug,
        userId: 'user-123',
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      let callCount = 0;
      mockRepository.findOne.mockImplementation(() => {
        callCount++;
        return callCount === 1
          ? Promise.resolve(existingUrl)
          : Promise.resolve(null);
      });

      const createUrlDto = {
        originalUrl: 'https://newurl.com',
      };

      const savedUrl = {
        id: 'new-id',
        originalUrl: createUrlDto.originalUrl,
        shortCode: secondSlug,
        userId: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.create.mockReturnValue(savedUrl as any);
      mockRepository.save.mockResolvedValue(savedUrl);

      const result = await service.create(createUrlDto);

      expect(result).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max attempts to generate unique slug', async () => {
      const existingUrl = {
        id: 'existing-id',
        originalUrl: 'https://example.com',
        shortCode: 'ABCDEF',
        userId: 'user-123',
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(existingUrl);

      const createUrlDto = {
        originalUrl: 'https://newurl.com',
      };

      await expect(service.create(createUrlDto)).rejects.toThrow(
        'Failed to generate unique slug after multiple attempts',
      );

      expect(repository.findOne).toHaveBeenCalled();
    });
  });

  describe('toResponseDto - BASE_URL configuration', () => {
    it('should use BASE_URL from config when available', async () => {
      const customBaseUrl = 'https://short.link';
      mockConfigService.get.mockReturnValue(customBaseUrl);

      const createUrlDto = {
        originalUrl: 'https://example.com',
      };

      const shortCode = 'ABC123';
      const savedUrl = {
        id: 'url-id',
        originalUrl: createUrlDto.originalUrl,
        shortCode,
        userId: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUrl as any);
      mockRepository.save.mockResolvedValue(savedUrl);

      const result = await service.create(createUrlDto);

      expect(result.shortUrl).toBe(`${customBaseUrl}/${shortCode}`);
    });

    it('should use default BASE_URL when config not available', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      const createUrlDto = {
        originalUrl: 'https://example.com',
      };

      const shortCode = 'ABC123';
      const savedUrl = {
        id: 'url-id',
        originalUrl: createUrlDto.originalUrl,
        shortCode,
        userId: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUrl as any);
      mockRepository.save.mockResolvedValue(savedUrl);

      const result = await service.create(createUrlDto);

      expect(result.shortUrl).toBe(`http://localhost:3000/${shortCode}`);
    });
  });
});
