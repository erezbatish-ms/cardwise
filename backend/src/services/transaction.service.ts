import { PrismaClient } from "@prisma/client";
import { ScrapeAccount } from "./scraper.service.js";

const prisma = new PrismaClient();

export interface StoreResult {
  totalTransactions: number;
  newTransactions: number;
  duplicateSkipped: number;
  cardCount: number;
}

class TransactionService {
  async storeTransactions(accounts: ScrapeAccount[]): Promise<StoreResult> {
    let totalTransactions = 0;
    let newTransactions = 0;
    let duplicateSkipped = 0;
    const cardIds = new Set<string>();

    for (const account of accounts) {
      // Find or create card by last 4 digits
      const lastFour = account.accountNumber.slice(-4);
      const card = await prisma.card.upsert({
        where: { id: lastFour },
        update: {},
        create: {
          id: lastFour,
          lastFourDigits: lastFour,
          provider: "isracard",
        },
      });
      cardIds.add(card.id);

      for (const txn of account.txns) {
        totalTransactions++;

        // Generate dedup key from transaction data
        const scraperTxnId =
          txn.identifier ||
          `${txn.date}_${txn.chargedAmount}_${txn.description}`.replace(
            /\s+/g,
            "_"
          );

        // Skip duplicates
        const existing = await prisma.transaction.findUnique({
          where: { scraperTxnId },
        });
        if (existing) {
          duplicateSkipped++;
          continue;
        }

        await prisma.transaction.create({
          data: {
            cardId: card.id,
            date: new Date(txn.date),
            processedDate: txn.processedDate
              ? new Date(txn.processedDate)
              : null,
            description: txn.description,
            originalAmount: txn.originalAmount,
            chargedAmount: txn.chargedAmount,
            currency: txn.originalCurrency || "ILS",
            merchant: txn.description,
            installmentNum: txn.installments?.number ?? null,
            installmentTotal: txn.installments?.total ?? null,
            memo: txn.memo ?? null,
            scraperTxnId,
          },
        });
        newTransactions++;
      }

      // Log the scrape
      await prisma.scrapeLog.create({
        data: {
          cardId: card.id,
          status: "success",
          txnCount: account.txns.length,
          startDate: new Date(
            Math.min(...account.txns.map((t) => new Date(t.date).getTime()))
          ),
          endDate: new Date(
            Math.max(...account.txns.map((t) => new Date(t.date).getTime()))
          ),
        },
      });
    }

    return {
      totalTransactions,
      newTransactions,
      duplicateSkipped,
      cardCount: cardIds.size,
    };
  }
}

export const transactionService = new TransactionService();
