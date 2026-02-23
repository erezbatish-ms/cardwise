/*
  Multi-user authentication migration.
  1. Create users and accounts tables
  2. Create a legacy user for existing data
  3. Add user_id columns (nullable first)
  4. Backfill existing data to legacy user
  5. Make user_id NOT NULL
  6. Add indexes and constraints
*/

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "accounts_provider_provider_id_key" ON "accounts"("provider", "provider_id");

-- Create legacy user for existing data
INSERT INTO "users" ("id", "email", "display_name", "updated_at")
VALUES ('legacy-user-00000000', 'legacy@cardwise.local', 'Legacy User', CURRENT_TIMESTAMP);

-- Step 1: Add user_id columns as NULLABLE
ALTER TABLE "cards" ADD COLUMN "user_id" TEXT;
ALTER TABLE "transactions" ADD COLUMN "user_id" TEXT;
ALTER TABLE "scrape_logs" ADD COLUMN "user_id" TEXT;
ALTER TABLE "insight_cache" ADD COLUMN "user_id" TEXT;
ALTER TABLE "categories" ADD COLUMN "user_id" TEXT;

-- Step 2: Backfill existing data to legacy user
UPDATE "cards" SET "user_id" = 'legacy-user-00000000' WHERE "user_id" IS NULL;
UPDATE "transactions" SET "user_id" = 'legacy-user-00000000' WHERE "user_id" IS NULL;
UPDATE "scrape_logs" SET "user_id" = 'legacy-user-00000000' WHERE "user_id" IS NULL;
UPDATE "insight_cache" SET "user_id" = 'legacy-user-00000000' WHERE "user_id" IS NULL;
-- Categories: system defaults stay NULL (userId=null), no backfill needed

-- Step 3: Make user_id NOT NULL (except categories where null = system default)
ALTER TABLE "cards" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "transactions" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "scrape_logs" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "insight_cache" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Drop old unique constraints and add new ones
DROP INDEX IF EXISTS "categories_name_key";
DROP INDEX IF EXISTS "insight_cache_type_card_scope_period_key";

CREATE UNIQUE INDEX "categories_name_user_id_key" ON "categories"("name", "user_id");
CREATE UNIQUE INDEX "insight_cache_user_id_type_card_scope_period_key" ON "insight_cache"("user_id", "type", "card_scope", "period");

-- Step 5: Add indexes
CREATE INDEX "cards_user_id_idx" ON "cards"("user_id");
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX "scrape_logs_user_id_idx" ON "scrape_logs"("user_id");
CREATE INDEX "insight_cache_user_id_idx" ON "insight_cache"("user_id");

-- Step 6: Add foreign keys
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scrape_logs" ADD CONSTRAINT "scrape_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "insight_cache" ADD CONSTRAINT "insight_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
