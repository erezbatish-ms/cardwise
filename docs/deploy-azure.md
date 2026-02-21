# Deploy to Azure

## Prerequisites

- Azure subscription
- Azure CLI (`az`) installed
- Azure Developer CLI (`azd`) installed

## Resources Created

| Resource | SKU | Purpose |
|---|---|---|
| App Service (Linux) | B1 | Backend API |
| Static Web Apps | Free | Frontend SPA |
| PostgreSQL Flexible Server | B1ms | Database |
| Azure OpenAI | S0 | GPT-4o for categorization + insights |
| Key Vault | Standard | Secrets management |

## Deploy with Azure Developer CLI

```bash
# Login
azd auth login

# Initialize (first time)
azd init

# Deploy everything
azd up

# Teardown
azd down --purge --force
```

## Deploy with GitHub Actions

1. Create Azure service principal:
   ```bash
   az ad sp create-for-rbac --name cardwise-deploy --role contributor --sdk-auth
   ```

2. Add GitHub secrets:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_SWA_TOKEN`

3. Push to `main` — the `deploy-azure.yml` workflow runs automatically.

## Post-Deploy

1. Run database migrations:
   ```bash
   az webapp ssh --name app-cardwise-backend
   npx prisma migrate deploy
   npx tsx src/prisma/seed.ts
   ```

2. Configure Key Vault secrets:
   ```bash
   az keyvault secret set --vault-name kv-cardwise --name app-password --value "your-password"
   ```
