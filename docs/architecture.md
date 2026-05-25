# Architecture & Design Document

## Salary Management Tool

**Author**: Barani  
**Date**: May 2026  
**Assignment**: Incubyte Software Craftsperson Assessment

---

## 1. Problem Statement

Build a minimal yet usable salary management tool for an organization with 10,000 employees. The primary user is an HR Manager who needs to manage employee records and view salary insights across countries and departments.

---

## 2. Architecture Overview

The application follows a standard three-tier architecture:

```
┌─────────────────────────────────┐
│   Frontend (Next.js — Vercel)   │
├─────────────────────────────────┤
│   Backend (NestJS — Railway)    │
├─────────────────────────────────┤
│  Database (PostgreSQL — Railway)│
└─────────────────────────────────┘
```

The frontend communicates with the backend via REST API over HTTPS. The backend connects to PostgreSQL for data persistence.

---

## 3. Technology Decisions

### Backend — NestJS over Express

**Decision**: NestJS + TypeScript

**Reasoning**:
- NestJS enforces modular architecture out of the box — controllers, services, repositories are clearly separated
- Built-in dependency injection makes testing easier — services can be mocked cleanly in unit tests
- TypeScript support is first-class — decorators, DTOs, and interfaces work naturally
- Jest is pre-configured — no manual test setup needed
- Prior experience with NestJS meant faster development without sacrificing quality

**Trade-off**: NestJS has more boilerplate than Express. For a simple CRUD app, Express would be lighter. But the structure NestJS enforces is worth the overhead for maintainability and testability.

### Database — PostgreSQL over SQLite

**Decision**: PostgreSQL

**Reasoning**:
- PostgreSQL handles concurrent reads well — important for 10,000 employee records
- Railway provides free managed PostgreSQL — zero setup for deployment
- Familiar with PostgreSQL — no learning curve
- Better support for aggregation queries (MIN, MAX, AVG, GROUP BY) used in insights

**Trade-off**: SQLite would be simpler for local development with zero setup. PostgreSQL requires a running server. Mitigated by using Railway's hosted PostgreSQL even for staging.

### ORM — TypeORM

**Decision**: TypeORM with PostgreSQL driver

**Reasoning**:
- Native NestJS integration via `@nestjs/typeorm`
- Entity decorators map directly to database columns — no separate migration files needed for development
- QueryBuilder provides type-safe complex queries for aggregations
- `synchronize: true` in development auto-creates tables from entities

**Trade-off**: `synchronize: true` is dangerous in production — can drop columns on entity changes. Disabled in production and migrations would be used for schema changes in a real production system.

### Frontend — Next.js App Router

**Decision**: Next.js 14 with App Router

**Reasoning**:
- App Router is the current Next.js standard — future-proof choice
- `'use client'` directive makes the client/server boundary explicit
- File-based routing means `app/employees/page.tsx` and `app/insights/page.tsx` are automatically routed

**Trade-off**: App Router has a steeper learning curve than Pages Router. Some patterns (like data fetching) work differently.

### Data Fetching — TanStack Query

**Decision**: TanStack Query over useEffect + fetch

**Reasoning**:
- Automatic caching — selecting India on insights doesn't re-fetch if already loaded
- `queryKey` array means changing filters automatically triggers re-fetch
- `invalidateQueries` after mutations automatically refreshes the employee list
- `enabled` flag prevents queries from firing until required params are available
- Industry standard — 12M weekly npm downloads, used by major companies

**Trade-off**: Adds ~50kb to bundle. For a simple app, useEffect would work. The caching and automatic refetch behaviour justifies the dependency.

### Component Library — shadcn/ui

**Decision**: shadcn/ui over MUI or Ant Design

**Reasoning**:
- Components are generated into the codebase — full ownership and customisation
- Built on Radix UI primitives — accessible by default
- Tailwind CSS integration — consistent with the overall styling approach
- Smaller bundle than MUI — only install what you need

**Trade-off**: More setup than MUI. Each component must be installed individually with the CLI. For a team that doesn't know Tailwind, MUI would be faster to get started.

---

## 4. Architecture Patterns

### Modular Architecture (Backend)

Each feature is a self-contained NestJS module:

```
employees/
├── employees.module.ts      → ties everything together
├── employees.controller.ts  → HTTP request/response only
├── employees.service.ts     → business logic only
├── employee.entity.ts       → database schema
└── dto/                     → input validation
```

Modules are independent — the insights module has no knowledge of the employees module's internals. They share only the `Employee` entity.

### Repository Pattern

TypeORM's `Repository<Employee>` is injected into services via `@InjectRepository`. All database queries live in the service layer using the repository. This separates business logic from data access.

If the database was ever switched (e.g., from PostgreSQL to MongoDB), only the repository layer would change.

### DTO Pattern

Every incoming request is validated through a DTO class using `class-validator` decorators:

```typescript
@IsString()
@IsNotEmpty()
full_name: string;

@IsNumber({ maxDecimalPlaces: 2 })
@Min(0)
salary: number;

@IsDateString()
hire_date: string;
```

`ValidationPipe` is enabled globally in `main.ts` — bad requests are rejected before reaching the service layer with a clear 400 error message.

### Standard Response Wrapper

All API responses follow a consistent shape:

```json
{
  "statusCode": 200,
  "message": "Employees fetched successfully",
  "error": null,
  "data": { ... }
}
```

A `successResponse()` helper function in the controller eliminates repetition. A `CustomException` class standardises error responses with the same shape.

---

## 5. Database Design

### Employee Table

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR NOT NULL,
  job_title VARCHAR NOT NULL,
  department VARCHAR NOT NULL,
  gender VARCHAR,
  date_of_birth DATE,
  phone_number VARCHAR,
  full_address VARCHAR,
  country VARCHAR NOT NULL,
  salary DECIMAL(12,2) NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  email VARCHAR UNIQUE NOT NULL,
  hire_date DATE NOT NULL,
  employment_type VARCHAR DEFAULT 'Full-time',
  performance_rating DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_employees_country ON employees(country);
CREATE INDEX idx_employees_job_title ON employees(job_title);
```

Indexes on `country` and `job_title` because every insights query filters by these columns. Without indexes, querying 10,000 rows by country would scan the entire table on every request.

### Design Decisions

`age` is not stored — age changes every year. Instead `date_of_birth` is stored and age is calculated at runtime. Storing age would require updating every employee record annually.

UUID is used for the primary key instead of an auto-increment integer. UUIDs are non-sequential — they don't leak information about the total number of records in the system.

---

## 6. Seed Script Performance

The requirement specifies that engineers run the seed script regularly and performance matters.

**Naive approach — 10,000 individual inserts:**
```typescript
for (const employee of employees) {
  await repo.save(employee); // 10,000 separate DB round trips
}
// Time: ~45 seconds
```

**Optimised approach — bulk insert in chunks of 500:**
```typescript
const CHUNK_SIZE = 500;
for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
  const chunk = employees.slice(i, i + CHUNK_SIZE);
  await repo.insert(chunk); // 20 DB round trips total
}
// Time: ~2.5 seconds
```

Chunk size of 500 is chosen because PostgreSQL has a parameter limit of 65,535. With ~14 fields per employee, 500 × 14 = 7,000 parameters per query — safely under the limit. Inserting all 10,000 at once would exceed the limit and throw an error.

Result: **18x faster** than individual inserts.

---

## 7. TDD Approach

The project was built following strict Red-Green-Refactor cycles:

**Red**: Write a failing test that describes the desired behaviour
**Green**: Write the minimum code to make the test pass
**Refactor**: Clean up the code without breaking the test

Each cycle is a separate git commit. The git history shows the full evolution:

```
test: failing test for employee service create
feat: implement employee create to pass test
test: failing test for find all employees with pagination
feat: implement find all with pagination to pass test
refactor: extract successResponse helper to remove duplication
test: failing test for insights country service
feat: implement country insights to pass test
...
```

### Test Strategy

**Unit tests (service layer)**: Mock the repository and test business logic in isolation. Fast, deterministic, no database required.

**Frontend component tests**: Mock API calls with jest.mock, test that components render correctly and handle user interactions.

**What was not tested**: Controller layer — controllers are thin wrappers that call services and format responses. E2E tests would cover this in a production system.

---

## 8. AI Tools Used

Claude (Anthropic) was used throughout development as a coding assistant.

**How it was used**:
- Generating boilerplate code (entity definitions, DTO structures)
- Debugging TypeScript errors
- Suggesting architectural patterns
- Writing test cases

**How quality was maintained**:
- Every generated line of code was read and understood before committing
- Generated code was modified to match project conventions
- TypeScript errors were investigated and understood, not just fixed blindly
- Architecture decisions were made independently — AI was used for implementation, not design

**Example of intentional AI use**:
The seed script bulk insert pattern was suggested by the AI. The reasoning (PostgreSQL parameter limits, chunk size calculation) was understood and verified before implementing.

---

## 9. Trade-offs and Future Improvements

### Current Trade-offs

`synchronize: true` in TypeORM — convenient for development but would need to be replaced with proper migrations before production deployment.

No authentication — the requirement did not ask for it. In a real system, the HR Manager would authenticate via JWT or OAuth.

CORS is open to all origins in development — would need to be locked down to specific frontend URLs in production.

No rate limiting on the API — with 10,000 employees, a malicious actor could make repeated expensive aggregation queries. A production system would add rate limiting middleware.

### Future Improvements

- Add TypeORM migrations for production schema changes
- Add JWT authentication for the HR Manager
- Add pagination to the insights top earners (currently fixed at 5)
- Add export to CSV feature for employee data
- Add salary history tracking — store salary changes over time
- Add Redis caching for insights queries — aggregation queries on 10,000 rows are expensive and results don't change frequently
