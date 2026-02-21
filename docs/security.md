# Security Documentation

## Threat Model

CardWise handles sensitive financial data. This document outlines the security measures in place.

## Credential Handling

### Isracard Credentials
- **Never stored** in database, files, logs, or cookies
- Passed in HTTP request body (POST `/api/scrape`) over HTTPS
- Exist only in Node.js process memory during the scrape operation
- Discarded immediately after `israeli-bank-scrapers` completes
- Frontend clears input fields after successful scrape
- `autoComplete="off"` on credential input fields

### App Password
- Hashed with bcrypt (12 salt rounds) before comparison
- Original password stored only as environment variable
- Never logged or exposed in API responses

## Authentication & Sessions

- Session-based auth with `express-session`
- HTTP-only cookies (not accessible via JavaScript)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- 1-hour session TTL
- Session destroyed on logout

## Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| General API | 100 requests | 15 minutes |
| Scrape | 5 requests | 1 hour |
| AI endpoints | 30 requests | 15 minutes |

## Network Security

- **CORS**: Restricted to configured `FRONTEND_URL` origin
- **Helmet**: Sets security headers (X-Frame-Options, CSP, etc.)
- **HTTPS**: Enforced in production via PaaS (Azure/AWS)
- **Database**: Encrypted at rest (PaaS-managed)

## Log Sanitization

The `sanitizeForLog()` utility strips sensitive fields (password, username, token, secret, apiKey) from objects before logging. All request logging must use this utility.

## Environment Variables

All secrets are managed via environment variables, never committed to source:
- `APP_PASSWORD` — App login password
- `SESSION_SECRET` — Session signing key
- `DATABASE_URL` — PostgreSQL connection string
- `AZURE_OPENAI_API_KEY` — Azure OpenAI key

In production, use Azure Key Vault or AWS Secrets Manager.

## Dependency Security

- Dependencies are pinned in `package-lock.json`
- GitHub Dependabot enabled for security updates
- No credential-containing packages in the dependency tree
