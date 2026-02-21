# Local Development Setup

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Azure OpenAI API access (for AI features)

## Quick Start

### 1. Clone and configure

```bash
git clone https://github.com/erezbatish-ms/cardwise.git
cd cardwise
cp .env.example .env
```

Edit `.env` with your values:
- `APP_PASSWORD` — your chosen app login password
- `SESSION_SECRET` — random string for session signing
- `AZURE_OPENAI_*` — your Azure OpenAI credentials

### 2. Start PostgreSQL

```bash
docker compose -f infra/docker/docker-compose.yml up db -d
```

### 3. Setup Backend

```bash
cd backend
npm install
npx prisma migrate dev
npx tsx src/prisma/seed.ts   # Seed Hebrew categories
npm run dev                   # Starts on port 3001
```

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev                   # Starts on port 5173
```

### 5. Open the app

Navigate to http://localhost:5173 and log in with your `APP_PASSWORD`.

## Running with Docker Compose (Full Stack)

```bash
# Set environment variables
export APP_PASSWORD=yourpassword
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
export AZURE_OPENAI_API_KEY=your-key

# Start everything
docker compose -f infra/docker/docker-compose.yml up --build
```

App will be available at http://localhost

## Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# E2E tests (requires backend + frontend running)
cd e2e
npm install
npx playwright install
npx playwright test

# E2E with UI mode
npx playwright test --ui
```
