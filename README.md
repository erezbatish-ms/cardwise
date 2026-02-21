# CardWise — ניתוח חכם של הוצאות כרטיס אשראי

<div dir="rtl">

אפליקציית קוד פתוח לחיבור לישראכרט, משיכת נתוני עסקאות וניתוח חכם של הוצאות באמצעות בינה מלאכותית.

</div>

## Features

- 🔗 **Isracard Integration** — Connect to your Isracard account via `israeli-bank-scrapers`
- 🔒 **Security First** — Credentials are never stored; human-in-the-loop authentication every time
- 📊 **Expense Analytics** — 12+ months of spending trends, category breakdowns, top merchants
- 🤖 **AI-Powered** — Auto-categorization and personalized spending tips via Azure OpenAI
- 💳 **Multi-Card** — Individual and combined analysis across all your credit cards
- 🇮🇱 **Hebrew UI** — Full RTL Hebrew interface

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| AI | Azure OpenAI (GPT-4o) |
| Data Source | `israeli-bank-scrapers` (Isracard adapter) |

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Azure OpenAI API key

### Setup

```bash
# Clone the repository
git clone https://github.com/erezbatish-ms/cardwise.git
cd cardwise

# Copy environment template
cp .env.example .env
# Edit .env with your Azure OpenAI credentials and app password

# Start with Docker Compose
docker compose -f infra/docker/docker-compose.yml up -d

# Or run locally for development:

# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## Deployment

- **Local**: [Docker Compose guide](docs/setup-local.md)
- **Azure**: [Azure PaaS deployment](docs/deploy-azure.md) — App Service + Static Web Apps + PostgreSQL Flexible + OpenAI
- **AWS**: [AWS PaaS deployment](docs/deploy-aws.md) — ECS Fargate + S3/CloudFront + RDS

## Security

- Isracard credentials are entered per-scrape and **never stored** (in-memory only)
- App protected by bcrypt-hashed password
- HTTPS enforced in production
- All secrets via environment variables
- See [Security Documentation](docs/security.md)

## License

MIT — see [LICENSE](LICENSE)
