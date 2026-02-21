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

## Local Development

### Prerequisites
- Node.js 22+, Docker Desktop running
- PostgreSQL via Docker: `docker compose -f infra/docker/docker-compose.yml up -d db`
- Backend `.env` file (see `.env.example`); `dotenv/config` auto-loads it

### Starting Services
```bash
# Option 1: Startup script (recommended)
pwsh start-local.ps1

# Option 2: Manual
cd backend && npm run dev    # Port 3001 (reads .env via dotenv)
cd frontend && npm run dev   # Port 5173 (proxies /api to backend)
```

### Verifying Services (ALWAYS do this after starting or making changes)
```bash
# Quick smoke test — run after every restart or code change
curl http://localhost:3001/api/health                    # Should return {"status":"ok"}
curl http://localhost:5173                                # Should return 200
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"testpassword"}' -v                    # Should return Set-Cookie header
```
**Important**: Always verify the backend is responding after restarting it. The backend loads environment variables from `backend/.env` via `dotenv/config`. If the `.env` file is missing, session cookies will not work and login will appear to succeed but immediately redirect back.

### Default Test Credentials
- App password: `testpassword` (set via `APP_PASSWORD` in `.env`)

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
