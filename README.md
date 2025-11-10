# API de Encurtamento de URLs

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

---

## 📝 Descrição Geral

Uma **API RESTful moderna e escalável** feita em **NestJS** para encurtamento de URLs com recursos avançados de gerenciamento e segurança, otimizada para deployment serverless.

### ✨ Principais Funcionalidades

- 🔗 **Encurtamento de URLs** - Geração automática de códigos curtos com nanoid
- 🔐 **Autenticação JWT** - Sistema completo de registro e login com tokens stateless
- 🗄️ **Persistência com TypeORM** - PostgreSQL como banco de dados relacional
- 📊 **Contagem de Acessos** - Tracking automático de cada redirecionamento
- 🗑️ **Soft Delete** - Preservação de dados históricos sem remoção física
- 📚 **Documentação Swagger** - API totalmente documentada e testável via interface web
- ☁️ **Serverless Ready** - Otimizado para deployment em Vercel
- 🧪 **Cobertura de Testes** - Testes unitários e E2E com alta cobertura
- 🛡️ **Segurança** - CORS, validações robustas e proteção de rotas

---

## 🚀 Tecnologias Utilizadas

| Tecnologia            | Descrição                                                            | Versão               |
| --------------------- | -------------------------------------------------------------------- | -------------------- |
| **Node.js**           | Runtime JavaScript server-side                                       | LTS (v20+)           |
| **NestJS**            | Framework progressivo Node.js para aplicações server-side escaláveis | ^11.x                |
| **TypeScript**        | Superset JavaScript com tipagem estática                             | ^5.x                 |
| **TypeORM**           | ORM para TypeScript e Node.js                                        | ^0.3.x               |
| **PostgreSQL**        | Banco de dados relacional open-source                                | 15+                  |
| **JWT**               | JSON Web Tokens para autenticação stateless                          | via @nestjs/jwt      |
| **Passport**          | Middleware de autenticação para Node.js                              | via @nestjs/passport |
| **Jest**              | Framework de testes unitários e E2E                                  | ^30.x                |
| **Swagger / OpenAPI** | Documentação interativa de APIs                                      | via @nestjs/swagger  |
| **class-validator**   | Validação declarativa baseada em decorators                          | ^0.14.x              |
| **bcrypt**            | Hash seguro de senhas                                                | ^6.x                 |
| **nanoid**            | Gerador de IDs curtos únicos                                         | ^3.x                 |

---

## 📦 Requisitos do Sistema e Regras de Negócio

### Requisitos Funcionais Principais

#### ✅ 1. Cadastro e Autenticação de Usuários

- Registro via e-mail e senha
- Login retorna token JWT com expiração configurável
- Senha hasheada com bcrypt (10 salt rounds)
- Validação de e-mail único no sistema

#### ✅ 2. Encurtamento de URLs

- Funcionalidade disponível **apenas com autenticação**
- URLs são associadas ao usuário logado (campo `userId`)
- Geração automática de shortCode com nanoid (6-10 caracteres)
- Validação de URL original válida

#### ✅ 3. Gestão de URLs (usuários autenticados)

- Listar todas as URLs próprias
- Atualizar URL original
- Excluir URLs (soft delete mantém histórico)
- Visualizar estatísticas de acessos

#### ✅ 4. Redirecionamento

- Endpoint público `GET /:shortCode` redireciona para URL original
- Suporte tanto para shortCode quanto customAlias
- Retorna 404 se URL foi deletada ou não existe

#### ✅ 5. Soft Delete

- Registros não são removidos fisicamente do banco
- Campo `deletedAt` marca exclusão lógica
- URLs deletadas não são acessíveis via redirecionamento
- Preserva integridade referencial e histórico

---

### Regras de Negócio das URLs

| Regra                        | Descrição                                                         |
| ---------------------------- | ----------------------------------------------------------------- |
| **Validação de URL**         | Deve conter protocolo `http://` ou `https://` válido              |
| **Código Curto (shortCode)** | Gerado automaticamente com nanoid (6-10 caracteres alfanuméricos) |
| **Geração de shortCode**     | Algoritmo nanoid garante unicidade estatística                    |
| **Redirecionamento**         | HTTP Status **301 Moved Permanently** (redirect permanente)       |
| **URLs Deletadas**           | Retornam **404 Not Found** ao tentar acessar                      |
| **Timestamps**               | `createdAt`, `updatedAt`, `deletedAt` automáticos via TypeORM     |

---

### Endpoints da API

| Método   | Endpoint         | Descrição                         | Auth |
| -------- | ---------------- | --------------------------------- | ---- |
| `POST`   | `/auth/register` | Registra novo usuário             | ❌   |
| `POST`   | `/auth/login`    | Autentica e retorna JWT           | ❌   |
| `POST`   | `/urls`          | Encurta uma URL                   | ✅   |
| `GET`    | `/urls`          | Lista URLs do usuário autenticado | ✅   |
| `GET`    | `/urls/:id`      | Busca uma URL específica por ID   | ✅   |
| `PATCH`  | `/urls/:id`      | Atualiza URL original             | ✅   |
| `DELETE` | `/urls/:id`      | Soft delete de URL                | ✅   |
| `GET`    | `/:shortCode`    | Redireciona para URL original     | ❌   |

**Legenda:**

- ✅ = Requer token JWT no header `Authorization: Bearer <token>`
- ❌ = Público (sem autenticação)

---

## ⚙️ Arquitetura da Aplicação

A aplicação segue os princípios de **Clean Architecture** e **SOLID**, garantindo:

- 🎯 Separação clara de responsabilidades
- 🔄 Facilidade de manutenção e testes
- 📈 Escalabilidade horizontal e vertical
- 🧩 Baixo acoplamento entre módulos

### Organização de Camadas

```
src/
├── main.ts                    # Entry point da aplicação
├── app.module.ts              # Módulo raiz
├── app.controller.ts          # Controller raiz
├── app.service.ts             # Service raiz
│
├── auth/                      # 🔐 Módulo de Autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/            # JWT Strategy
│   ├── guards/                # Guards de autenticação
│   ├── decorators/            # Decorators customizados
│   └── dto/                   # DTOs de autenticação
│
├── users/                     # 👤 Módulo de Usuários
│   ├── users.service.ts
│   ├── entities/              # User Entity (TypeORM)
│   └── dto/                   # DTOs de usuário
│
├── urls/                      # 🔗 Módulo de URLs
│   ├── urls.controller.ts
│   ├── urls.service.ts
│   ├── entities/              # URL Entity (TypeORM)
│   └── dto/                   # DTOs de URL
│
├── common/                    # 🛠️ Recursos Compartilhados
│   ├── interceptors/          # Logging Interceptor
│   ├── filters/               # Exception Filters
│   └── middlewares/           # Middlewares globais
│
└── config/                    # ⚙️ Configurações
    └── logger.config.ts       # Configuração Winston

api/
└── index.ts                   # ☁️ Entry point Serverless (Vercel)
```

### Princípios Aplicados

- ✅ **Separation of Concerns** - Cada módulo tem responsabilidade única bem definida
- ✅ **Dependency Injection** - NestJS IoC Container gerencia todas as dependências
- ✅ **Repository Pattern** - Abstração completa do acesso a dados via TypeORM
- ✅ **DTO Pattern** - Validação e transformação de dados de entrada/saída
- ✅ **Strategy Pattern** - Passport JWT Strategy para autenticação extensível
- ✅ **Guard Pattern** - Proteção declarativa de rotas autenticadas
- ✅ **SOLID Principles** - Código limpo, testável e manutenível

---

## 🧱 Diagrama de Arquitetura

> 📊 **Diagrama visual completo disponível em:** [Link do Miro] (em construção)

### Arquitetura Simplificada

```mermaid
flowchart TD
    subgraph Client["Clientes"]
        A["Cliente HTTP (Browser/Postman)"]
    end

    subgraph Edge["Vercel Edge Network"]
        B["CDN Global + Auto-scaling"]
    end

    subgraph API["API NestJS - Serverless"]
        C1["Auth Module<br/>(JWT, Login/Register)"]
        C2["Users Module<br/>(User Service)"]
        C3["URLs Module<br/>(CRUD URLs)"]
        C4["Common Module<br/>(Interceptors, Logging)"]
    end

    subgraph DB["Banco de Dados"]
        D[(PostgreSQL<br/>Neon/Supabase)]
    end

    subgraph Monitor["Observabilidade"]
        E1["Vercel Analytics"]
        E2["Application Logs"]
    end

    A -->|HTTP/JSON| B
    B --> C1
    B --> C3
    C1 -->|Valida| C2
    C1 --> C4
    C3 --> C4
    C2 -->|TypeORM| D
    C3 -->|TypeORM| D
    C1 -.logs.-> E2
    C3 -.logs.-> E2
    B -.metrics.-> E1

    style B fill:#0070f3
    style D fill:#336791
    style API fill:#e0234e
```

---

## 🔗 Diagrama de Fluxo - Encurtamento de URL

```mermaid
flowchart TD
    Start([Cliente faz POST /urls + JWT])
    A[Valida JWT Token]
    B{Token válido?}
    C[Retorna 401 Unauthorized]
    D[Extrai userId do token]
    E[Valida URL original]
    F{URL válida?}
    G[Retorna 400 Bad Request]
    H[Gera shortCode com nanoid<br/>6-10 caracteres]
    I{shortCode único?}
    J[Salva URL no banco<br/>com userId associado]
    K[Retorna 201 Created<br/>com shortUrl]
    End([Fim])

    Start --> A
    A --> B
    B -->|Não| C --> End
    B -->|Sim| D
    D --> E
    E --> F
    F -->|Não| G --> End
    F -->|Sim| H
    H --> I
    I -->|Não| H
    I -->|Sim| J
    J --> K
    K --> End
```

---

## �🧮 Modelo Entidade-Relacionamento

```mermaid
erDiagram
    USER {
        UUID id PK
        STRING email UK "Único, not null"
        STRING password "Hash bcrypt"
        TIMESTAMP createdAt "default: now()"
        TIMESTAMP updatedAt "auto-update"
        TIMESTAMP deletedAt "nullable"
    }

    URL {
        UUID id PK
        TEXT originalUrl "URL completa"
        STRING shortCode UK "6-10 chars nanoid, unique"
        TIMESTAMP createdAt "default: now()"
        TIMESTAMP updatedAt "auto-update"
        TIMESTAMP deletedAt "nullable"
        UUID userId FK "not null"
    }

    USER ||--o{ URL : "possui"
```

**Constraints e Índices:**

- `email` → UNIQUE, NOT NULL, VARCHAR(255)
- `shortCode` → UNIQUE, NOT NULL, INDEX
- `userId` → FK para `users.id`, ON DELETE CASCADE, INDEX

---

## 🧰 Instalação e Execução

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** v20+ LTS ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

---

### Passo a Passo

#### **1️⃣ Clone o repositório**

```bash
git clone https://github.com/TheJoaoRech/url-shortener-api.git
cd url-shortener-api
```

#### **2️⃣ Instale as dependências**

```bash
npm install
```

#### **3️⃣ Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/url_shortener"

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui

# Application
PORT=3000
NODE_ENV=development
```

⚠️ **IMPORTANTE:** Altere `JWT_SECRET` para produção com uma chave forte!

#### **4️⃣ Configure o banco de dados**

```bash
# Criar banco de dados PostgreSQL
createdb url_shortener

# Executar migrations
npm run typeorm migration:run

# Ou se preferir sincronização automática (apenas desenvolvimento)
# Configure synchronize: true no app.module.ts
```

#### **5️⃣ Inicie a aplicação**

```bash
# Desenvolvimento com hot-reload
npm run start:dev

# Ou em modo produção
npm run build
npm run start:prod
```

#### **6️⃣ Acesse a aplicação**

- 🌐 **API:** [http://localhost:3000](http://localhost:3000)
- 📚 **Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🚦 Testes

### Testes Unitários

```bash
# Rodar todos os testes unitários
npm run test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura de código
npm run test:cov
```

### Testes E2E (End-to-End)

```bash
# Rodar testes E2E
npm run test:e2e
```

### Estrutura de Testes

```
test/
├── unit/                           # Testes unitários isolados
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
├── e2e/                            # Testes end-to-end
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── urls.e2e-spec.ts
│
└── jest-e2e.json                   # Configuração E2E
```

### Cobertura de Testes

**Cobertura mínima exigida:** 80% (branches, functions, lines, statements)

Os testes cobrem:

- ✅ Autenticação (registro, login, validação JWT)
- ✅ Encurtamento de URLs (com validações)
- ✅ Redirecionamento e códigos HTTP corretos
- ✅ CRUD completo de URLs autenticadas
- ✅ Soft delete e queries com `deletedAt`
- ✅ Guards e decorators de autenticação
- ✅ Interceptors de logging
- ✅ Tratamento de erros e edge cases

---

## 📘 Documentação da API (Swagger)

Após iniciar a aplicação, acesse a documentação interativa:

🔗 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Recursos da Documentação:

- ✅ **Todos os endpoints** com descrições detalhadas
- ✅ **Schemas de request/response** com validações
- ✅ **Exemplos de payloads** prontos para usar
- ✅ **Autenticação JWT** via botão "Authorize"
- ✅ **Testagem interativa** direto pelo navegador
- ✅ **Códigos de status HTTP** documentados
- ✅ **Modelos de dados** com tipos TypeScript

### Como testar via Swagger:

1. Acesse http://localhost:3000/api/docs
2. Registre um usuário em `POST /auth/register`
3. Faça login em `POST /auth/login` e copie o token
4. Clique em "Authorize" e cole o token no formato: `Bearer <seu-token>`
5. Teste os endpoints protegidos!

---

## 🌐 Variáveis de Ambiente

| Variável       | Descrição                             | Valor Padrão  |
| -------------- | ------------------------------------- | ------------- |
| `NODE_ENV`     | Ambiente de execução                  | `development` |
| `PORT`         | Porta da aplicação                    | `3000`        |
| `DATABASE_URL` | String de conexão PostgreSQL completa | -             |
| `JWT_SECRET`   | Chave secreta para tokens JWT         | -             |

### Exemplo completo de `.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/url_shortener"
JWT_SECRET=sua-chave-super-segura-mude-em-producao
```

---

## ☁️ Deploy no Vercel

Este projeto está otimizado para deployment serverless no Vercel.

### **1️⃣ Instale o Vercel CLI**

```bash
npm i -g vercel
```

### **2️⃣ Configure as variáveis de ambiente**

No painel do Vercel, adicione:

- `DATABASE_URL` - String de conexão PostgreSQL (recomendado: Neon, Supabase, Railway)
- `JWT_SECRET` - Sua chave secreta JWT
- `NODE_ENV` - `production`

### **3️⃣ Deploy**

```bash
vercel --prod
```

### Otimizações para Serverless:

- ✅ Logger otimizado (sem escrita em disco)
- ✅ Connection pooling configurado para serverless
- ✅ Timeouts ajustados (5s)
- ✅ Swagger desabilitado em produção
- ✅ Build otimizado com TypeScript

---

## 🧪 Critérios de Qualidade do Projeto

### Qualidade de Código

- ✅ **TypeScript Strict Mode** ativo para máxima segurança de tipos
- ✅ **ESLint** configurado com regras recomendadas NestJS
- ✅ **Prettier** para formatação consistente do código
- ✅ **Zero warnings** no build de produção

### Testes

- ✅ **Cobertura ≥ 80%** em testes unitários
- ✅ **Testes E2E** cobrindo todos os fluxos principais
- ✅ **Testes de integração** com banco de dados real

### Documentação

- ✅ **Swagger/OpenAPI** completo e atualizado automaticamente
- ✅ **README.md** detalhado com diagramas e exemplos
- ✅ **Diagramas Mermaid** para arquitetura e fluxos
- ✅ **Comentários JSDoc** em funções complexas
- ✅ **Documentação inline** no código quando necessário

### DevOps

- ✅ **Vercel Deployment** configurado e otimizado
- ✅ **TypeORM Migrations** (quando necessário)
- ✅ **Variáveis de ambiente** documentadas
- ✅ **Logs estruturados** com Winston

### Segurança

- ✅ **Senhas hasheadas** com bcrypt (10 salt rounds)
- ✅ **JWT stateless** com expiração configurável
- ✅ **Validação de entrada** rigorosa com class-validator
- ✅ **CORS** configurado adequadamente
- ✅ **SQL Injection** prevenido via TypeORM
- ✅ **XSS Protection** via validação de entrada

### Performance

- ✅ **Connection Pooling** otimizado para serverless
- ✅ **Índices de banco** em campos frequentemente consultados
- ✅ **Queries otimizadas** com TypeORM
- ✅ **Lazy Loading** de módulos quando aplicável

---

## ☁️ Escalabilidade da Solução

> 📊 **Diagrama de arquitetura completo disponível em:** [Link do Miro] (em construção)

A aplicação foi projetada para garantir alta disponibilidade, desempenho otimizado e capacidade de expansão conforme o crescimento da base de usuários.

### 🔄 Estratégias de Escalabilidade

#### **Escalabilidade Horizontal**

A aplicação segue o princípio de **arquitetura stateless**, permitindo adicionar múltiplas instâncias sem compartilhamento de estado.

**Stateless API com JWT:**

- Tokens autocontidos eliminam necessidade de sessões no servidor
- Qualquer instância pode validar qualquer requisição
- Sem necessidade de sticky sessions

**Deployment Serverless no Vercel:**

- Auto-scaling automático baseado em demanda
- Cold start otimizado (< 500ms)
- Edge network global com baixa latência
- Zero configuração de infraestrutura

**Connection Pooling Otimizado:**

- Pool limitado para serverless (max: 1 conexão por função)
- Timeouts agressivos (5s) para evitar conexões penduradas
- Suporte a databases serverless (Neon, Supabase)

```mermaid
flowchart LR
    A[Vercel Edge Network] --> B[Função 1]
    A --> C[Função 2]
    A --> D[Função N]
    B --> E[(PostgreSQL)]
    C --> E
    D --> E

    style A fill:#0070f3
    style E fill:#336791
```

#### **Escalabilidade Vertical**

Otimizações para extrair máximo desempenho:

**1. Otimizações de Banco de Dados**

```typescript
// Connection pooling otimizado
extra: {
  max: 1,                        // 1 conexão por função serverless
  min: 0,                        // Não manter conexões idle
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
}
```

**2. Índices Estratégicos**

```sql
CREATE INDEX idx_urls_shortcode ON urls(short_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_urls_userid ON urls(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email);
```

**3. Logging Otimizado**

- Sem escrita em disco (filesystem read-only no Vercel)
- Apenas console.log em produção
- Logs estruturados para observabilidade

---

### 🚧 Principais Desafios e Soluções

#### **Desafio 1: Cold Start em Serverless**

**Problema:** Primeira requisição após idle pode demorar

**Soluções:**

- ✅ Cache de instância NestJS (`cachedApp`)
- ✅ Build otimizado sem source maps
- ✅ Swagger desabilitado em produção
- ✅ Lazy loading de módulos

#### **Desafio 2: Conexões de Banco em Serverless**

**Problema:** Cada função cria nova conexão, podendo esgotar pool

**Soluções:**

- ✅ Connection pooling limitado (max: 1)
- ✅ Databases serverless (Neon com auto-scaling)
- ✅ Timeouts agressivos para liberar conexões

#### **Desafio 3: Consistência em Múltiplas Instâncias**

**Problema:** Operações concorrentes podem causar colisões

**Soluções:**

- ✅ Constraints UNIQUE no banco (shortCode, email)
- ✅ Geração de IDs com nanoid (colisão estatisticamente impossível)
- ✅ Transações atômicas via TypeORM

---

### 📊 Capacidade Estimada

| Métrica                  | Capacidade Estimada | Observação                          |
| ------------------------ | ------------------- | ----------------------------------- |
| **Requisições/seg**      | 10,000+             | Com auto-scaling Vercel             |
| **Usuários Simultâneos** | 50,000+             | Stateless permite alta concorrência |
| **URLs Armazenadas**     | Milhões             | Limitado pelo storage do banco      |
| **Latência Média**       | < 200ms             | Com edge network                    |
| **Cold Start**           | < 500ms             | Com otimizações aplicadas           |
| **Disponibilidade**      | 99.9%+              | SLA do Vercel + database            |

---

## 📋 Padrão de Commits

Este projeto segue **[Conventional Commits](https://www.conventionalcommits.org/)**:

```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
test: adiciona ou corrige testes
refactor: refatora código sem mudar comportamento
perf: melhora performance
style: formatação, ponto e vírgula, etc
chore: atualiza dependências ou configurações
ci: mudanças em CI/CD
```

### Checklist antes do Commit:

- [ ] Código segue o style guide (ESLint + Prettier)
- [ ] Testes unitários passando (`npm test`)
- [ ] Testes E2E passando (`npm run test:e2e`)
- [ ] Cobertura de testes ≥ 80%
- [ ] Documentação atualizada (se aplicável)
- [ ] Commit message segue Conventional Commits

---

## 📝 License

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**João Rech**

- 🐙 **GitHub:** [@TheJoaoRech](https://github.com/TheJoaoRech)

---
