# URL Shortener API

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

---

## 📝 Overview

A **modern and scalable RESTful API** built with **NestJS** for URL shortening with advanced management and security features, optimized for serverless deployment.

### ✨ Key Features

- 🔗 **URL Shortening** - Automatic generation of short codes with nanoid
- 🔐 **JWT Authentication** - Complete registration and login system with stateless tokens
- 🗄️ **TypeORM Persistence** - PostgreSQL as relational database
- 📊 **Access Tracking** - Automatic tracking of each redirect
- 🗑️ **Soft Delete** - Preservation of historical data without physical removal
- 📚 **Swagger Documentation** - Fully documented and testable API via web interface
- ☁️ **Serverless Ready** - Optimized for Vercel deployment
- 🧪 **Test Coverage** - Unit and E2E tests with high coverage
- 🛡️ **Security** - CORS, robust validations, and route protection

---

## 🚀 Technologies Used

| Technology            | Description                                                 | Version              |
| --------------------- | ----------------------------------------------------------- | -------------------- |
| **Node.js**           | JavaScript runtime server-side                              | LTS (v20+)           |
| **NestJS**            | Progressive Node.js framework for scalable server-side apps | ^11.x                |
| **TypeScript**        | JavaScript superset with static typing                      | ^5.x                 |
| **TypeORM**           | ORM for TypeScript and Node.js                              | ^0.3.x               |
| **PostgreSQL**        | Open-source relational database                             | 15+                  |
| **JWT**               | JSON Web Tokens for stateless authentication                | via @nestjs/jwt      |
| **Passport**          | Authentication middleware for Node.js                       | via @nestjs/passport |
| **Jest**              | Unit and E2E testing framework                              | ^30.x                |
| **Swagger / OpenAPI** | Interactive API documentation                               | via @nestjs/swagger  |
| **class-validator**   | Declarative validation based on decorators                  | ^0.14.x              |
| **bcrypt**            | Secure password hashing                                     | ^6.x                 |
| **nanoid**            | Unique short ID generator                                   | ^3.x                 |

---

## 📦 System Requirements and Business Rules

### Main Functional Requirements

#### ✅ 1. User Registration and Authentication

- Registration via email and password
- Login returns JWT token with configurable expiration
- Password hashed with bcrypt (10 salt rounds)
- Unique email validation in the system

#### ✅ 2. URL Shortening

- Functionality available **with or without authentication**
- URLs are associated with the logged-in user (`userId` field) when authenticated
- **Automatic shortCode generation with nanoid (exactly 6 characters)**
- **Custom alias support (3-30 characters) for authenticated users**
- Valid original URL validation

#### ✅ 3. URL Management (authenticated users)

- List all own URLs
- Update original URL
- Delete URLs (soft delete maintains history)
- View access statistics

#### ✅ 4. Redirection

- Public endpoint `GET /:shortCode` redirects to original URL
- Support for both shortCode and customAlias
- Returns 404 if URL was deleted or doesn't exist

#### ✅ 5. Soft Delete

- Records are not physically removed from database
- `deletedAt` field marks logical deletion
- Deleted URLs are not accessible via redirection
- Preserves referential integrity and history

---

### URL Business Rules

| Rule                     | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| **URL Validation**       | Must contain valid `http://` or `https://` protocol                         |
| **Short Code**           | **Automatically generated with nanoid (exactly 6 alphanumeric characters)** |
| **Custom Alias**         | Optional for authenticated users (3-30 characters, [a-z0-9_-])              |
| **shortCode Generation** | nanoid algorithm guarantees statistical uniqueness ([A-Za-z0-9]{6})         |
| **Redirection**          | HTTP Status **302 Found** (temporary redirect with tracking)                |
| **Deleted URLs**         | Return **404 Not Found** when attempting to access                          |
| **Timestamps**           | `createdAt`, `updatedAt`, `deletedAt` automatic via TypeORM                 |
| **Reserved Routes**      | Aliases cannot use reserved words (auth, docs, my-urls, etc.)               |

---

### API Endpoints

| Method   | Endpoint         | Description                    | Auth |
| -------- | ---------------- | ------------------------------ | ---- |
| `POST`   | `/auth/register` | Register new user              | ❌   |
| `POST`   | `/auth/login`    | Authenticate and return JWT    | ❌   |
| `POST`   | `/urls`          | Shorten a URL                  | ✅   |
| `GET`    | `/urls`          | List authenticated user's URLs | ✅   |
| `GET`    | `/urls/:id`      | Get specific URL by ID         | ✅   |
| `PATCH`  | `/urls/:id`      | Update original URL            | ✅   |
| `DELETE` | `/urls/:id`      | Soft delete URL                | ✅   |
| `GET`    | `/:shortCode`    | Redirect to original URL       | ❌   |

**Legend:**

- ✅ = Requires JWT token in header `Authorization: Bearer <token>`
- ❌ = Public (no authentication)

---

## ⚙️ Application Architecture

The application follows **Clean Architecture** and **SOLID** principles, ensuring:

- 🎯 Clear separation of responsibilities
- 🔄 Easy maintenance and testing
- 📈 Horizontal and vertical scalability
- 🧩 Low coupling between modules

### Layer Organization

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app.controller.ts          # Root controller
├── app.service.ts             # Root service
│
├── auth/                      # 🔐 Authentication Module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/            # JWT Strategy
│   ├── guards/                # Authentication Guards
│   ├── decorators/            # Custom Decorators
│   └── dto/                   # Authentication DTOs
│
├── users/                     # 👤 Users Module
│   ├── users.service.ts
│   ├── entities/              # User Entity (TypeORM)
│   └── dto/                   # User DTOs
│
├── urls/                      # 🔗 URLs Module
│   ├── urls.controller.ts
│   ├── urls.service.ts
│   ├── entities/              # URL Entity (TypeORM)
│   └── dto/                   # URL DTOs
│
├── common/                    # 🛠️ Shared Resources
│   ├── interceptors/          # Logging Interceptor
│   ├── filters/               # Exception Filters
│   └── middlewares/           # Global Middlewares
│
└── config/                    # ⚙️ Configuration
    └── logger.config.ts       # Winston Configuration

api/
└── index.ts                   # ☁️ Serverless Entry Point (Vercel)
```

### Applied Principles

- ✅ **Separation of Concerns** - Each module has a well-defined single responsibility
- ✅ **Dependency Injection** - NestJS IoC Container manages all dependencies
- ✅ **Repository Pattern** - Complete abstraction of data access via TypeORM
- ✅ **DTO Pattern** - Input/output data validation and transformation
- ✅ **Strategy Pattern** - Passport JWT Strategy for extensible authentication
- ✅ **Guard Pattern** - Declarative protection of authenticated routes
- ✅ **SOLID Principles** - Clean, testable, and maintainable code

---

## 🏗️ Architecture Diagram

_Layered architecture showing the complete serverless stack:_

![Architecture Diagram](./docs/architecture-diagram.svg)

### **🌐 Client Layer**

- Web Browsers, Mobile Apps, API Clients (Postman, cURL)
- HTTP/HTTPS communication

### **⚡ Edge Layer (Vercel)**

- 🌍 CDN Global Distribution
- 🚀 Auto-scaling serverless functions
- 🛡️ DDoS Protection
- 🔒 SSL/TLS Termination

### **🔴 API Layer (NestJS Modules)**

- **Auth Module** - JWT Strategy, Login/Register, bcrypt password hashing
- **Users Module** - User Management, CRUD operations, soft delete
- **URLs Module** - URL shortening, redirection (302), nanoid generation
- **Common Module** - Winston logging, Interceptors, Rate Limiting, CORS, Helmet
- **Redis Cache** _(future)_ - Cache layer for URLs

### **🐘 Data Layer**

- PostgreSQL (Neon/Supabase) with TypeORM
- Connection Pooling optimized for serverless
- Tables: `users` (1:N) `urls` with soft delete support

### **📊 Observability**

- Vercel Analytics (edge metrics)
- Application Logs (Winston)
- Error Tracking

---

## 🔗 Flow Diagram - URL Shortening

```mermaid
flowchart TD
    Start([Client makes POST /urls + JWT])
    A[Validate JWT Token]
    B{Valid token?}
    C[Return 401 Unauthorized]
    D[Extract userId from token]
    E[Validate original URL]
    F{Valid URL?}
    G[Return 400 Bad Request]
    H[Generate shortCode with nanoid<br/>exactly 6 characters]
    I{Unique shortCode?}
    J[Save URL in database<br/>with associated userId]
    K[Return 201 Created<br/>with shortUrl]
    End([End])

    Start --> A
    A --> B
    B -->|No| C --> End
    B -->|Yes| D
    D --> E
    E --> F
    F -->|No| G --> End
    F -->|Yes| H
    H --> I
    I -->|No| H
    I -->|Yes| J
    J --> K
    K --> End
```

---

## Entity-Relationship Model

```mermaid
erDiagram
    USER {
        UUID id PK
        STRING email UK "Unique, not null"
        STRING password "Hash bcrypt"
        TIMESTAMP createdAt "default: now()"
        TIMESTAMP updatedAt "auto-update"
        TIMESTAMP deletedAt "nullable"
    }

    URL {
        UUID id PK
        TEXT originalUrl "Complete URL"
        STRING shortCode UK "exactly 6 chars [A-Za-z0-9], unique"
        TIMESTAMP createdAt "default: now()"
        TIMESTAMP updatedAt "auto-update"
        TIMESTAMP deletedAt "nullable"
        UUID userId FK "not null"
    }

    USER ||--o{ URL : "owns"
```

**Constraints and Indexes:**

- `email` → UNIQUE, NOT NULL, VARCHAR(255)
- `shortCode` → UNIQUE, NOT NULL, INDEX
- `userId` → FK to `users.id`, ON DELETE CASCADE, INDEX

---

## 🧰 Installation and Execution

### Prerequisites

Make sure you have installed:

- **Node.js** v20+ LTS ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

---

### Step by Step

#### **1️⃣ Clone the repository**

```bash
git clone https://github.com/TheJoaoRech/url-shortener-api.git
cd url-shortener-api
```

#### **2️⃣ Install dependencies**

```bash
npm install
```

#### **3️⃣ Configure environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file as needed:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/url_shortener"

# JWT
JWT_SECRET=your-super-secure-secret-key-here

# Application
PORT=3000
NODE_ENV=development
```

⚠️ **IMPORTANT:** Change `JWT_SECRET` for production with a strong key!

#### **4️⃣ Configure the database**

```bash
# Create PostgreSQL database
createdb url_shortener

# Run migrations
npm run typeorm migration:run

# Or if you prefer automatic synchronization (development only)
# Set synchronize: true in app.module.ts
```

#### **5️⃣ Start the application**

```bash
# Development with hot-reload
npm run start:dev

# Or in production mode
npm run build
npm run start:prod
```

#### **6️⃣ Access the application**

- 🌐 **API:** [http://localhost:3000](http://localhost:3000)
- 📚 **Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🐳 Running with Docker

### Using Docker Compose

The easiest way to run the entire stack (API + PostgreSQL) locally:

#### **1️⃣ Start all services**

```bash
docker-compose up -d
```

This will start:

- 🐘 PostgreSQL database on port `5432`
- 🚀 NestJS API on port `3000`

#### **2️⃣ View logs**

```bash
# All services
docker-compose logs -f

# Only API
docker-compose logs -f api

# Only database
docker-compose logs -f db
```

#### **3️⃣ Stop services**

```bash
docker-compose down
```

#### **4️⃣ Stop and remove volumes (⚠️ deletes data)**

```bash
docker-compose down -v
```

### Environment Variables for Docker

Create a `.env` file in the project root:

```env
# Database (Docker)
DATABASE_URL=postgresql://postgres:password@db:5432/url_shortener

# JWT
JWT_SECRET=your-super-secure-secret-key-here
JWT_EXPIRATION=1h

# Application
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

> **Note:** When using Docker Compose, the database host should be `db` (service name), not `localhost`.

### Docker Commands

```bash
# Build images
docker-compose build

# Start in detached mode
docker-compose up -d

# Restart a specific service
docker-compose restart api

# Access API container bash
docker-compose exec api sh

# Access PostgreSQL
docker-compose exec db psql -U postgres -d url_shortener
```

---

## 🚦 Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Watch mode (development)
npm run test:watch

# With code coverage
npm run test:cov
```

### E2E Tests (End-to-End)

```bash
# Run E2E tests
npm run test:e2e
```

### Test Structure

```
test/
├── unit/                           # Isolated unit tests
│   ├── auth/
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.service.spec.ts
│   │   └── jwt.strategy.spec.ts
│   ├── users/
│   │   └── users.service.spec.ts
│   ├── urls/
│   │   ├── urls.controller.spec.ts
│   │   └── urls.service.spec.ts
│   └── common/
│       └── logging.interceptor.spec.ts
│
├── e2e/                            # End-to-end tests
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── urls.e2e-spec.ts
│
└── jest-e2e.json                   # E2E Configuration
```

### Test Coverage

**Minimum required coverage:** 80% (branches, functions, lines, statements)

Tests cover:

- ✅ Authentication (registration, login, JWT validation)
- ✅ URL shortening (with validations)
- ✅ Redirection and correct HTTP codes
- ✅ Complete CRUD of authenticated URLs
- ✅ Soft delete and queries with `deletedAt`
- ✅ Authentication guards and decorators
- ✅ Logging interceptors
- ✅ Error handling and edge cases

---

## 📘 API Documentation (Swagger)

After starting the application, access the interactive documentation:

🔗 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Documentation Features:

- ✅ **All endpoints** with detailed descriptions
- ✅ **Request/response schemas** with validations
- ✅ **Payload examples** ready to use
- ✅ **JWT Authentication** via "Authorize" button
- ✅ **Interactive testing** directly from browser
- ✅ **HTTP status codes** documented
- ✅ **Data models** with TypeScript types

### How to test via Swagger:

1. Access http://localhost:3000/api/docs
2. Register a user at `POST /auth/register`
3. Login at `POST /auth/login` and copy the token
4. Click "Authorize" and paste the token in format: `Bearer <your-token>`
5. Test the protected endpoints!

---

## 🌐 Environment Variables

| Variable       | Description                           | Default Value |
| -------------- | ------------------------------------- | ------------- |
| `NODE_ENV`     | Execution environment                 | `development` |
| `PORT`         | Application port                      | `3000`        |
| `DATABASE_URL` | Complete PostgreSQL connection string | -             |
| `JWT_SECRET`   | Secret key for JWT tokens             | -             |

### Complete `.env` example:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/url_shortener"
JWT_SECRET=your-super-secure-key-change-in-production
```

---

## ☁️ Vercel Deployment

This project is optimized for serverless deployment on Vercel.

### **1️⃣ Install Vercel CLI**

```bash
npm i -g vercel
```

### **2️⃣ Configure environment variables**

In the Vercel dashboard, add:

- `DATABASE_URL` - PostgreSQL connection string (recommended: Neon, Supabase, Railway)
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - `production`

### **3️⃣ Deploy**

```bash
vercel --prod
```

### Serverless Optimizations:

- ✅ Optimized logger (no disk writes)
- ✅ Connection pooling configured for serverless
- ✅ Adjusted timeouts (5s)
- ✅ Swagger disabled in production
- ✅ Optimized TypeScript build

---

## 🧪 Project Quality Criteria

### Code Quality

- ✅ **TypeScript Strict Mode** active for maximum type safety
- ✅ **ESLint** configured with NestJS recommended rules
- ✅ **Prettier** for consistent code formatting
- ✅ **Zero warnings** in production build

### Tests

- ✅ **Coverage ≥ 80%** in unit tests
- ✅ **E2E tests** covering all main flows
- ✅ **Integration tests** with real database

### Documentation

- ✅ **Swagger/OpenAPI** complete and automatically updated
- ✅ **README.md** detailed with diagrams and examples
- ✅ **Mermaid diagrams** for architecture and flows
- ✅ **JSDoc comments** in complex functions
- ✅ **Inline documentation** in code when necessary

### DevOps

- ✅ **Vercel Deployment** configured and optimized
- ✅ **TypeORM Migrations** (when necessary)
- ✅ **Environment variables** documented
- ✅ **Structured logs** with Winston

### Security

- ✅ **Hashed passwords** with bcrypt (10 salt rounds)
- ✅ **Stateless JWT** with configurable expiration
- ✅ **Strict input validation** with class-validator
- ✅ **CORS** properly configured
- ✅ **SQL Injection** prevented via TypeORM
- ✅ **XSS Protection** via input validation

### Performance

- ✅ **Connection Pooling** optimized for serverless
- ✅ **Database indexes** on frequently queried fields
- ✅ **Optimized queries** with TypeORM
- ✅ **Lazy Loading** of modules when applicable

---

## ☁️ Scalability Solution

The application was designed to ensure high availability, optimized performance, and expansion capacity as the user base grows.

### 🔄 Scalability Strategies

#### **Horizontal Scalability**

The application follows the **stateless architecture** principle, allowing multiple instances to be added without state sharing.

**Stateless API with JWT:**

- Self-contained tokens eliminate need for server sessions
- Any instance can validate any request
- No need for sticky sessions

**Serverless Deployment on Vercel:**

- Automatic auto-scaling based on demand
- Optimized cold start (< 500ms)
- Global edge network with low latency
- Zero infrastructure configuration

**Optimized Connection Pooling:**

- Limited pool for serverless (max: 1 connection per function)
- Aggressive timeouts (5s) to avoid hanging connections
- Support for serverless databases (Neon, Supabase)

```mermaid
flowchart LR
    A[Vercel Edge Network] --> B[Function 1]
    A --> C[Function 2]
    A --> D[Function N]
    B --> E[(PostgreSQL)]
    C --> E
    D --> E

    style A fill:#0070f3
    style E fill:#336791
```

#### **Vertical Scalability**

Optimizations to extract maximum performance:

**1. Database Optimizations**

```typescript
extra: {
  max: 1,
  min: 0,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
}
```

**2. Strategic Indexes**

```sql
CREATE INDEX idx_urls_shortcode ON urls(short_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_urls_userid ON urls(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email);
```

**3. Optimized Logging**

- No disk writes (read-only filesystem on Vercel)
- Only console.log in production
- Structured logs for observability

---

### 🚧 Main Challenges and Solutions

#### **Challenge 1: Cold Start in Serverless**

**Problem:** First request after idle may take time

**Solutions:**

- ✅ NestJS instance cache (`cachedApp`)
- ✅ Optimized build without source maps
- ✅ Swagger disabled in production
- ✅ Lazy loading of modules

#### **Challenge 2: Database Connections in Serverless**

**Problem:** Each function creates new connection, potentially exhausting pool

**Solutions:**

- ✅ Limited connection pooling (max: 1)
- ✅ Serverless databases (Neon with auto-scaling)
- ✅ Aggressive timeouts to release connections

#### **Challenge 3: Consistency in Multiple Instances**

**Problem:** Concurrent operations may cause collisions

**Solutions:**

- ✅ UNIQUE constraints in database (shortCode, email)
- ✅ ID generation with nanoid (collision statistically impossible)
- ✅ Atomic transactions via TypeORM

---

### 📊 Estimated Capacity

| Metric                 | Estimated Capacity | Observation                       |
| ---------------------- | ------------------ | --------------------------------- |
| **Requests/sec**       | 10,000+            | With Vercel auto-scaling          |
| **Simultaneous Users** | 50,000+            | Stateless allows high concurrency |
| **Stored URLs**        | Millions           | Limited by database storage       |
| **Average Latency**    | < 200ms            | With edge network                 |
| **Cold Start**         | < 500ms            | With applied optimizations        |
| **Availability**       | 99.9%+             | Vercel + database SLA             |

---

## 📝 License

This project is under the MIT license.

## 👨‍💻 Author

**João Rech**

- 🐙 **GitHub:** [@TheJoaoRech](https://github.com/TheJoaoRech)

---
