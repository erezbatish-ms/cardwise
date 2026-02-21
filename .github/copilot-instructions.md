# Copilot Instructions — CardWise

## Project Overview

CardWise is an open-source Hebrew-language web application for analyzing Isracard credit card expenses using AI. It connects to Isracard via `israeli-bank-scrapers`, stores transactions in PostgreSQL, and provides AI-powered categorization and spending insights via Azure OpenAI.

- **Languages**: TypeScript (frontend + backend)
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Azure OpenAI (GPT-4o)
- **UI Language**: Hebrew (RTL)

## Repository Layout

| Path | Purpose |
|---|---|
| `frontend/` | React SPA (Vite, Tailwind, Recharts) |
| `backend/` | Express API server |
| `backend/src/routes/` | API route handlers |
| `backend/src/services/` | Business logic (scraper, categorization, analytics, insights) |
| `backend/src/prisma/` | Prisma schema and seed data |
| `backend/src/middleware/` | Auth and security middleware |
| `e2e/` | Playwright E2E tests |
| `infra/azure/` | Azure Bicep templates |
| `infra/aws/` | AWS CloudFormation templates |
| `infra/docker/` | Docker Compose for local deployment |
| `docs/` | Documentation |

## Build & Test Commands

```bash
# Backend
cd backend && npm install && npm run dev        # Dev server
cd backend && npm run build                      # TypeScript compile
cd backend && npm test                           # Vitest unit tests
cd backend && npm run lint                       # ESLint

# Frontend
cd frontend && npm install && npm run dev       # Vite dev server
cd frontend && npm run build                     # Production build
cd frontend && npm test                          # Vitest + RTL tests
cd frontend && npm run lint                      # ESLint

# E2E (Playwright)
cd e2e && npm install && npx playwright install
cd e2e && npx playwright test                    # Run all E2E tests
cd e2e && npx playwright test --ui               # Interactive UI mode

# Database
cd backend && npx prisma migrate dev             # Run migrations
cd backend && npx prisma studio                  # GUI for database
cd backend && npx tsx src/prisma/seed.ts         # Seed categories

# Docker (local)
docker compose -f infra/docker/docker-compose.yml up -d
```

## Key Conventions

- **Hebrew UI**: All user-facing text is in Hebrew. Variable names and code remain in English.
- **RTL**: The entire frontend uses `dir="rtl"`. Use `border-l` for right-side borders in RTL context.
- **Security**: Isracard credentials are NEVER stored — they exist only in-memory during scrape operations.
- **AI categorization**: Uses Azure OpenAI. Always provide a manual override option.
- **Prisma**: Schema is at `backend/src/prisma/schema.prisma`. Run `npx prisma generate` after schema changes.
- **API pattern**: All routes return JSON. Errors use `{ error: "Hebrew message" }` format.

## Testing Rules

- Backend unit tests mock Prisma and Azure OpenAI — never make live API calls in tests.
- Frontend tests use React Testing Library with `vitest` and `jsdom`.
- E2E tests use Playwright with a test PostgreSQL database and mocked external services.
- All tests must pass before merging to `main`.

## Security Checklist

- [ ] No credentials in source code or logs
- [ ] `sanitizeForLog()` used before logging request bodies
- [ ] Rate limiting on scrape and AI endpoints
- [ ] Session cookies are httpOnly and secure in production
- [ ] CORS restricted to frontend origin
