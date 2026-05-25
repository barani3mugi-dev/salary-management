# Salary Management Tool

A full-stack salary management application for HR Managers to manage 10,000 employees and view salary insights.

## Live Demo

- **Frontend**: https://salary-mgmt.vercel.app
- **Backend API**: https://salary-mgmt-backend.up.railway.app
- **Demo Video**: https://loom.com/share/your-video-link

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- TanStack Query (data fetching)
- shadcn/ui (component library)
- Recharts (charts)
- Tailwind CSS

**Backend**
- NestJS + TypeScript
- TypeORM
- PostgreSQL
- Pino Logger
- Jest + Supertest

## Features

- Add, view, edit, and delete employees
- Search by name, filter by country and department
- Paginated employee list (20 per page, 10,000 employees)
- Salary insights — min, max, avg salary by country
- Average salary by job title in a country
- Department salary breakdown (bar chart)
- Top earners by country

## Project Structure

```
salary-mgmt/
├── backend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── employee/
│   │   │   │   ├── employee.controller.ts
│   │   │   │   ├── employee.service.ts
│   │   │   │   ├── employee.entity.ts
│   │   │   │   ├── employee.module.ts
│   │   │   │   └── dto/
│   │   │   └── insights/
│   │   │       ├── insights.controller.ts
│   │   │       ├── insights.service.ts
│   │   │       └── insights.module.ts
│   │   ├── common/
│   │   │   ├── api-response.ts
│   │   │   └── helpers/
│   │   └── seed/
│   │       ├── seed.ts
│   │       ├── first_names.txt
│   │       └── last_names.txt
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── employees/
│   │   │   └── page.tsx
│   │   └── insights/
│   │       └── page.tsx
│   ├── components/
│   ├── lib/
│   │   └── api.ts
│   └── types/
└── docs/
    ├── architecture.md
    └── design.md
```

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/your-username/salary-mgmt.git
cd salary-mgmt/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations (TypeORM synchronize handles this automatically)
npm run start:dev

# Seed 10,000 employees
npm run seed
```

### Environment Variables (backend/.env)

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=salary_mgmt
PORT=3001
```

### Frontend Setup

```bash
cd salary-mgmt/frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit with your backend URL

# Start development server
npm run dev
```

### Environment Variables (frontend/.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Backend test coverage
cd backend
npm run test:coverage
```

## API Endpoints

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/employees | List employees (paginated) |
| GET | /api/v1/employees/:id | Get single employee |
| POST | /api/v1/employees | Create employee |
| PATCH | /api/v1/employees/:id | Update employee |
| DELETE | /api/v1/employees/:id | Delete employee |

### Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/insights/country/:country | Min/max/avg salary by country |
| GET | /api/v1/insights/job-title?title=&country= | Avg salary by job title |
| GET | /api/v1/insights/department?country= | Salary breakdown by department |
| GET | /api/v1/insights/top-earners?country=&limit= | Top earners in a country |

## Seed Script

The seed script inserts 10,000 employees using bulk insert with chunks of 500 rows per transaction — reducing 10,000 individual DB calls to 20, completing in under 3 seconds.

```bash
cd backend
npm run seed
```

## Development Approach

This project was built using Test-Driven Development (TDD):

1. Write a failing test (Red)
2. Write minimum code to pass the test (Green)
3. Refactor the code (Refactor)

Each TDD cycle is a separate commit. See git history for the full evolution.

AI tools (Claude) were used to accelerate development while maintaining code quality and understanding of every decision made.
