-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "last_four_digits" TEXT NOT NULL,
    "card_name" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'isracard',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "processed_date" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "original_amount" DECIMAL(65,30) NOT NULL,
    "charged_amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "category_id" TEXT,
    "category_source" TEXT NOT NULL DEFAULT 'ai',
    "merchant" TEXT,
    "installment_num" INTEGER,
    "installment_total" INTEGER,
    "memo" TEXT,
    "scraper_txn_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_logs" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "txn_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrape_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_cache" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "card_scope" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insight_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_scraper_txn_id_key" ON "transactions"("scraper_txn_id");

-- CreateIndex
CREATE INDEX "transactions_card_id_date_idx" ON "transactions"("card_id", "date");

-- CreateIndex
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "insight_cache_type_card_scope_period_key" ON "insight_cache"("type", "card_scope", "period");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrape_logs" ADD CONSTRAINT "scrape_logs_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
