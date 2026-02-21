# Deploy to AWS

## Prerequisites

- AWS account
- AWS CLI configured
- Docker installed

## Resources Created

| Resource | Type | Purpose |
|---|---|---|
| ECS Fargate | Container | Backend API |
| S3 + CloudFront | Static hosting | Frontend SPA |
| RDS PostgreSQL | db.t3.micro | Database |
| Secrets Manager | — | Credentials storage |
| VPC + Subnets | Networking | Isolation |

## Deploy with CloudFormation

```bash
# Create ECR repository
aws ecr create-repository --repository-name cardwise-backend

# Build and push backend image
cd backend
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -f ../infra/docker/Dockerfile.backend -t <account>.dkr.ecr.<region>.amazonaws.com/cardwise-backend:latest .
docker push <account>.dkr.ecr.<region>.amazonaws.com/cardwise-backend:latest

# Deploy stack
aws cloudformation deploy \
  --template-file infra/aws/template.yaml \
  --stack-name cardwise \
  --parameter-overrides \
    BackendImage=<account>.dkr.ecr.<region>.amazonaws.com/cardwise-backend:latest \
    DBPassword=your-db-password \
    AppPassword=your-app-password \
  --capabilities CAPABILITY_IAM
```

## Deploy with GitHub Actions

1. Create IAM role for GitHub Actions with OIDC
2. Add GitHub secrets:
   - `AWS_ROLE_ARN`
   - `AWS_ACCOUNT_ID`
   - `CLOUDFRONT_DISTRIBUTION_ID`

3. Push to `main` — the `deploy-aws.yml` workflow runs automatically.

## Build Frontend and Upload to S3

```bash
cd frontend
npm ci && npm run build
aws s3 sync dist/ s3://cardwise-frontend-<account-id>/ --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```
