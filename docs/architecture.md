# Architecture

## Overview

CardWise is a monorepo web application with separate frontend and backend packages.

```
┌─────────────┐     REST API     ┌──────────────────┐
│   Frontend   │ ◄──────────────► │     Backend       │
│ React + Vite │                  │ Express + Node.js │
│ Port 5173    │                  │ Port 3001         │
└─────────────┘                  └────────┬─────────┘
                                          │
                              ┌───────────┼───────────┐
                              │           │           │
                         ┌────▼───┐  ┌────▼───┐  ┌───▼────┐
                         │PostgreSQL│ │Isracard │ │Azure   │
                         │ Prisma  │ │Scraper  │ │OpenAI  │
                         └────────┘  └────────┘  └────────┘
```

## Data Flow

1. **Scrape**: User enters Isracard credentials → backend passes to `israeli-bank-scrapers` → transactions returned → stored in PostgreSQL → credentials discarded
2. **Categorize**: Uncategorized transactions → sent to Azure OpenAI in batches of 20 → categories assigned → user can override manually
3. **Analytics**: Prisma aggregation queries → trends, breakdowns, comparisons → rendered as charts
4. **Insights**: Analytics data → Azure OpenAI prompt → tips and recommendations → cached for 24 hours

## Security Layers

1. **App Password**: bcrypt-hashed, verified on login
2. **Sessions**: HTTP-only secure cookies, 1-hour TTL
3. **Credentials**: Never stored, in-memory only during scrape
4. **Rate Limiting**: 5 scrapes/hour, 30 AI requests/15 min, 100 general/15 min
5. **HTTPS**: Enforced in production
6. **CORS**: Restricted to frontend origin
7. **Helmet**: Security headers on all responses
