import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('URLs E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let _userId: string;
  let createdUrlId: string;
  let shortCode: string;

  const testUser = {
    email: `urltest-${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    authToken = registerRes.body.access_token;
    _userId = registerRes.body.userId;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('POST /shorten', () => {
    it('should create short URL without authentication (anonymous)', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: 'https://github.com/nestjs/nest',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty(
            'originalUrl',
            'https://github.com/nestjs/nest',
          );
          expect(res.body).toHaveProperty('shortCode');
          expect(res.body).toHaveProperty('shortUrl');
          expect(res.body).toHaveProperty('clickCount', 0);
          expect(res.body.shortCode).toHaveLength(6);
        });
    });

    it('should create short URL with authentication', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://docs.nestjs.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty(
            'originalUrl',
            'https://docs.nestjs.com',
          );
          expect(res.body).toHaveProperty('shortCode');
          expect(res.body).toHaveProperty('shortUrl');
          createdUrlId = res.body.id;
          shortCode = res.body.shortCode;
        });
    });

    it('should create short URL with custom alias', () => {
      const customAlias = `custom-${Date.now()}`;
      return request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://www.typescriptlang.org',
          customAlias,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.shortCode).toBe(customAlias);
        });
    });

    it('should fail with duplicate custom alias', () => {
      const customAlias = `duplicate-${Date.now()}`;

      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: 'https://example1.com',
          customAlias,
        })
        .expect(201)
        .then(() => {
          return request(app.getHttpServer())
            .post('/shorten')
            .send({
              originalUrl: 'https://example2.com',
              customAlias,
            })
            .expect(409);
        });
    });

    it('should fail with reserved route as custom alias', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: 'https://example.com',
          customAlias: 'auth',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('reserved');
        });
    });

    it('should fail with invalid URL format', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: 'not-a-valid-url',
        })
        .expect(400);
    });

    it('should fail with URL without http/https', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: 'www.example.com',
        })
        .expect(400);
    });

    it('should fail with invalid custom alias format', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: 'https://example.com',
          customAlias: 'invalid alias with spaces',
        })
        .expect(400);
    });

    it('should fail with too short custom alias', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: 'https://example.com',
          customAlias: 'ab',
        })
        .expect(400);
    });

    it('should fail with too long URL', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          originalUrl: longUrl,
        })
        .expect(400);
    });
  });

  describe('GET /my-urls', () => {
    it('should get all URLs for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/my-urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/my-urls').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/my-urls')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PUT /my-urls/:id', () => {
    it('should update URL', () => {
      return request(app.getHttpServer())
        .put(`/my-urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://updated-url.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.originalUrl).toBe('https://updated-url.com');
          expect(res.body.id).toBe(createdUrlId);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .put(`/my-urls/${createdUrlId}`)
        .send({
          originalUrl: 'https://updated-url.com',
        })
        .expect(401);
    });

    it('should fail with non-existent URL', () => {
      return request(app.getHttpServer())
        .put('/my-urls/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://updated-url.com',
        })
        .expect(404);
    });
  });

  describe('GET /:shortCode (redirect)', () => {
    it('should redirect to original URL', () => {
      return request(app.getHttpServer())
        .get(`/${shortCode}`)
        .expect(302)
        .expect('Location', /https:\/\//);
    });

    it('should increment click count on redirect', async () => {
      await request(app.getHttpServer()).get(`/${shortCode}`).expect(302);

      await request(app.getHttpServer()).get(`/${shortCode}`).expect(302);

      return request(app.getHttpServer())
        .get('/my-urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const url = res.body.find(
            (u: { id: string }) => u.id === createdUrlId,
          );
          expect(url.clickCount).toBeGreaterThan(0);
        });
    });

    it('should return 404 for non-existent short code', () => {
      return request(app.getHttpServer()).get('/nonexistent').expect(404);
    });
  });

  describe('DELETE /my-urls/:id', () => {
    it('should soft delete URL', () => {
      return request(app.getHttpServer())
        .delete(`/my-urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not find deleted URL on redirect', () => {
      return request(app.getHttpServer()).get(`/${shortCode}`).expect(404);
    });

    it('should not show deleted URL in my-urls', () => {
      return request(app.getHttpServer())
        .get('/my-urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const url = res.body.find(
            (u: { id: string }) => u.id === createdUrlId,
          );
          expect(url).toBeUndefined();
        });
    });

    it('should allow creating new URL with same alias after deletion', () => {
      const alias = `reuse-${Date.now()}`;

      return request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://example1.com',
          customAlias: alias,
        })
        .expect(201)
        .then((res) => {
          const urlId = res.body.id;
          return request(app.getHttpServer())
            .delete(`/my-urls/${urlId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        })
        .then(() => {
          return request(app.getHttpServer())
            .post('/shorten')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              originalUrl: 'https://example2.com',
              customAlias: alias,
            })
            .expect(201);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/my-urls/${createdUrlId}`)
        .expect(401);
    });
  });
});
