import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from '../../../../src/urls/urls.controller';
import { UrlsService } from '../../../../src/urls/urls.service';
import { Response } from 'express';
import { NotFoundException } from '@nestjs/common';

describe('UrlsController', () => {
  let controller: UrlsController;

  const mockUrlsService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOneByShortCode: jest.fn(),
    incrementClickCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: mockUrlsService,
        },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('shorten', () => {
    it('should create a shortened URL without authentication', async () => {
      const createUrlDto = {
        originalUrl: 'https://github.com',
      };

      const expectedResult = {
        id: '123',
        originalUrl: 'https://github.com',
        shortCode: 'aB3Xy9',
        shortUrl: 'http://localhost:3000/aB3Xy9',
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlsService.create.mockResolvedValue(expectedResult);

      const result = await controller.shorten(createUrlDto, undefined);

      expect(result).toEqual(expectedResult);
      expect(mockUrlsService.create).toHaveBeenCalledWith(
        createUrlDto,
        undefined,
      );
    });

    it('should create a shortened URL with authentication', async () => {
      const createUrlDto = {
        originalUrl: 'https://github.com',
        customAlias: 'meu-link',
      };

      const user = { userId: 'user-123' };

      const expectedResult = {
        id: '123',
        originalUrl: 'https://github.com',
        shortCode: 'meu-link',
        shortUrl: 'http://localhost:3000/meu-link',
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlsService.create.mockResolvedValue(expectedResult);

      const result = await controller.shorten(createUrlDto, user);

      expect(result).toEqual(expectedResult);
      expect(mockUrlsService.create).toHaveBeenCalledWith(
        createUrlDto,
        'user-123',
      );
    });
  });

  describe('findMyUrls', () => {
    it('should return all URLs for authenticated user', async () => {
      const req = { user: { userId: 'user-123' } };

      const expectedResult = [
        {
          id: '1',
          originalUrl: 'https://github.com',
          shortCode: 'aB3Xy9',
          shortUrl: 'http://localhost:3000/aB3Xy9',
          clickCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUrlsService.findAllByUser.mockResolvedValue(expectedResult);

      const result = await controller.findMyUrls(req);

      expect(result).toEqual(expectedResult);
      expect(mockUrlsService.findAllByUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('update', () => {
    it('should update a URL', async () => {
      const req = { user: { userId: 'user-123' } };
      const urlId = 'url-id';
      const updateUrlDto = {
        originalUrl: 'https://new-url.com',
      };

      const expectedResult = {
        id: urlId,
        originalUrl: 'https://new-url.com',
        shortCode: 'aB3Xy9',
        shortUrl: 'http://localhost:3000/aB3Xy9',
        clickCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(urlId, updateUrlDto, req);

      expect(result).toEqual(expectedResult);
      expect(mockUrlsService.update).toHaveBeenCalledWith(
        urlId,
        updateUrlDto,
        'user-123',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a URL', async () => {
      const req = { user: { userId: 'user-123' } };
      const urlId = 'url-id';

      mockUrlsService.remove.mockResolvedValue(undefined);

      await controller.remove(urlId, req);

      expect(mockUrlsService.remove).toHaveBeenCalledWith(urlId, 'user-123');
    });
  });

  describe('redirect', () => {
    it('should redirect to original URL and increment click count', async () => {
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
        user: null,
      };

      const redirectMock = jest.fn();
      const mockResponse = {
        redirect: redirectMock,
      } as unknown as Response;

      mockUrlsService.findOneByShortCode.mockResolvedValue(mockUrl);
      mockUrlsService.incrementClickCount.mockResolvedValue(undefined);

      await controller.redirect(shortCode, mockResponse);

      expect(mockUrlsService.findOneByShortCode).toHaveBeenCalledWith(
        shortCode,
      );
      expect(mockUrlsService.incrementClickCount).toHaveBeenCalledWith('123');
      expect(redirectMock).toHaveBeenCalledWith(302, 'https://github.com');
    });

    it('should throw NotFoundException if URL not found', async () => {
      const shortCode = 'notfound';
      const mockResponse = {} as Response;

      mockUrlsService.findOneByShortCode.mockResolvedValue(null);

      await expect(
        controller.redirect(shortCode, mockResponse),
      ).rejects.toThrow(NotFoundException);

      expect(mockUrlsService.findOneByShortCode).toHaveBeenCalledWith(
        shortCode,
      );
      expect(mockUrlsService.incrementClickCount).not.toHaveBeenCalled();
    });

    it('should handle soft deleted URLs correctly', async () => {
      const shortCode = 'deleted';
      const mockResponse = {} as Response;

      mockUrlsService.findOneByShortCode.mockResolvedValue(null);

      await expect(
        controller.redirect(shortCode, mockResponse),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('edge cases', () => {
    it('should handle empty user object in shorten', async () => {
      const createUrlDto = {
        originalUrl: 'https://github.com',
      };

      const expectedResult = {
        id: '123',
        originalUrl: 'https://github.com',
        shortCode: 'aB3Xy9',
        shortUrl: 'http://localhost:3000/aB3Xy9',
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlsService.create.mockResolvedValue(expectedResult);

      const result = await controller.shorten(createUrlDto, undefined);

      expect(result).toEqual(expectedResult);
      expect(mockUrlsService.create).toHaveBeenCalledWith(
        createUrlDto,
        undefined,
      );
    });

    it('should handle very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      const createUrlDto = {
        originalUrl: longUrl,
      };

      const expectedResult = {
        id: '123',
        originalUrl: longUrl,
        shortCode: 'aB3Xy9',
        shortUrl: 'http://localhost:3000/aB3Xy9',
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlsService.create.mockResolvedValue(expectedResult);

      const result = await controller.shorten(createUrlDto, undefined);

      expect(result.originalUrl.length).toBeGreaterThan(2000);
    });
  });
});
