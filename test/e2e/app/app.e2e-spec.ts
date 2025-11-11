import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('App E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should redirect to /api/docs', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(302)
        .expect('Location', '/api/docs');
    });
  });

  describe('GET /api', () => {
    it('should return API information', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'URL Shortener API');
          expect(res.body).toHaveProperty('version', '2.0');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('documentation', '/api/docs');
          expect(res.body).toHaveProperty('repository');
        });
    });
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('environment');
          expect(typeof res.body.uptime).toBe('number');
          expect(res.body.uptime).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', () => {
      return request(app.getHttpServer())
        .get('/unknown-route-that-does-not-exist')
        .expect(404);
    });

    it('should handle invalid JSON gracefully', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);
    });
  });
});
