# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-10

### Added

- Complete URL shortener RESTful API with NestJS
- User authentication with JWT (register, login, token validation)
- URL shortening with auto-generated 6-character slugs
- Custom alias support (3-30 characters, alphanumeric with dashes/underscores)
- Click tracking and analytics for shortened URLs
- Soft delete functionality for URLs
- Protected and public endpoint support (authenticated/anonymous URL creation)
- Reserved routes protection (api, docs, health, etc.)
- PostgreSQL database integration with TypeORM
- Comprehensive input validation with class-validator
- OpenAPI/Swagger documentation at `/api/docs`
- Docker and Docker Compose support
- Winston logging with structured logs
- HTTP request/response logging interceptor
- Health check endpoint at `/health`
- Environment-based configuration (.env support)
- 98.73% unit test coverage (84 tests)
- 37 E2E tests covering all major flows
- Modular test structure organized by feature
- GitHub Actions CI/CD pipeline for automated testing
- Multi-stage Docker build for optimized images

### Security

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication with configurable expiration
- Input sanitization and validation
- SQL injection protection via TypeORM
- CORS enabled with configurable origins

### Performance

- Database connection pooling
- Efficient query optimization with TypeORM
- Unique index on shortCode for fast lookups
- Partial unique index for soft delete support

### Developer Experience

- TypeScript with strict mode enabled
- ESLint and Prettier configured
- Comprehensive API documentation
- Environment variable validation
- Clear separation of concerns (modules, services, controllers)
- Mock factories for testing
- Hot reload in development mode

[1.0.0]: https://github.com/TheJoaoRech/url-shortener-api/releases/tag/v1.0.0
