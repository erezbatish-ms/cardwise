# AGENTS.md — AI Coding Agent Context

## What This Project Does

CardWise is an open-source personal finance tool that:
1. Connects to **Isracard** (Israeli credit card provider) via `israeli-bank-scrapers`
2. Pulls credit card transactions with **human-in-the-loop** authentication (credentials never stored)
3. Stores and deduplicates transactions in **PostgreSQL**
4. Auto-categorizes transactions using **Azure OpenAI** (with manual override)
5. Provides spending analytics: trends, category breakdowns, merchant rankings, card comparisons
6. Generates **AI-powered tips** for reducing expenses
7. Full **Hebrew RTL** interface

## Architecture

```
Browser (React SPA, Hebrew RTL)
    │
    ├── /api/auth/*         → OAuth (Google, Microsoft, Facebook via Passport.js)
    ├── /api/scrape         → Scraper (israeli-bank-scrapers → Isracard)
    ├── /api/transactions/* → CRUD + AI categorization
    ├── /api/analytics/*    → Trends, categories, merchants, card comparison
    └── /api/insights       → AI tips (Azure OpenAI)
    │
Express Backend (Node.js + TypeScript)
    │
    ├── Prisma ORM → PostgreSQL
    └── Azure OpenAI SDK → GPT-4o
```

## File Map

| File | Purpose |
|---|---|
| `backend/src/app.ts` | Express app entry point |
| `backend/src/routes/auth.ts` | OAuth login/logout/status + provider callbacks |
| `backend/src/auth/passport.ts` | Passport.js strategies (Google, Microsoft, Facebook) |
| `backend/src/routes/scrape.ts` | Trigger Isracard scrape |
| `backend/src/routes/transactions.ts` | Transaction CRUD + category update + AI categorize |
| `backend/src/routes/analytics.ts` | Trends, category breakdown, merchants, card comparison |
| `backend/src/routes/insights.ts` | AI-generated spending tips |
| `backend/src/services/scraper.service.ts` | Wraps `israeli-bank-scrapers` for Isracard |
| `backend/src/services/transaction.service.ts` | Store/deduplicate scraped transactions |
| `backend/src/services/categorization.service.ts` | Azure OpenAI transaction categorization |
| `backend/src/services/analytics.service.ts` | Aggregation queries for trends/breakdowns |
| `backend/src/services/insights.service.ts` | AI tip generation with caching |
| `backend/src/prisma/schema.prisma` | Database schema (User, Account, Card, Transaction, Category, ScrapeLog, InsightCache) |
| `backend/src/prisma/seed.ts` | Seeds 16 Hebrew categories |
| `frontend/src/App.tsx` | Router + auth gate |
| `frontend/src/components/layout/*` | AppShell, Sidebar, LoginForm |
| `frontend/src/components/dashboard/*` | SpendingTrends, CategoryBreakdown, TopMerchants, CardComparison, AiInsights |
| `frontend/src/components/transactions/*` | TransactionList, CategoryEditor |
| `frontend/src/components/scrape/*` | ScrapeForm |
| `frontend/src/lib/api.ts` | API client with all endpoint methods |
| `frontend/src/hooks/useApi.ts` | Generic data fetching hook |
| `e2e/tests/*.spec.ts` | Playwright E2E test suites |
| `infra/docker/docker-compose.yml` | Local deployment |
| `infra/azure/main.bicep` | Azure infrastructure |
| `infra/aws/template.yaml` | AWS infrastructure |

## Common Tasks

### Adding a new API endpoint
1. Create route handler in `backend/src/routes/`
2. Add service logic in `backend/src/services/`
3. Register route in `backend/src/app.ts`
4. Add API method in `frontend/src/lib/api.ts`
5. Write backend unit test
6. Write Playwright E2E test

### Adding a new transaction category
1. Add to `DEFAULT_CATEGORIES` array in `backend/src/prisma/seed.ts`
2. Run `npx tsx src/prisma/seed.ts`

### Modifying the database schema
1. Edit `backend/src/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate`
4. Update affected services and routes

## Key Constraints

- **Multi-user**: All data queries MUST include `userId` filter. Use `(req as any).userId` in routes.
- **OAuth**: Authentication via Google, Microsoft, Facebook. No password login. Test-only endpoint at POST `/api/auth/test-login` (dev mode).
- **Data isolation**: Each user sees only their own cards, transactions, analytics, and insights. Categories with `userId=null` are system defaults shared by all users.
- **Credentials**: Isracard credentials never stored, logged, or persisted. In-memory only during scrape.
- **Hebrew**: All user-facing strings in Hebrew. Code in English.
- **RTL**: Frontend is `dir="rtl"`. Test RTL layout in Playwright.
- **AI costs**: Categorization and insights responses are cached. Batch transactions for categorization (20 per API call).
- **Scraper fragility**: `israeli-bank-scrapers` may break when Isracard changes their site. Handle errors gracefully.

## Test & Validate

```bash
cd backend && npm test                          # Backend unit tests
cd frontend && npm test                         # Frontend component tests
cd e2e && npx playwright test                   # E2E tests
cd e2e && npx playwright test --reporter=html   # E2E with HTML report
```
