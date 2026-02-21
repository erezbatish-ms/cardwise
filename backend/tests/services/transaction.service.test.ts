import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup.js";
import { mockPrisma } from "../helpers/setup.js";
import { FIXTURES } from "../helpers/fixtures.js";

// Import after mocks
const { transactionService } = await import(
  "../../src/services/transaction.service.js"
);

describe("TransactionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("storeTransactions", () => {
    it("should store new transactions and create cards", async () => {
      mockPrisma.card.upsert.mockResolvedValue(FIXTURES.cards[0]);
      mockPrisma.transaction.findUnique.mockResolvedValue(null);
      mockPrisma.transaction.create.mockResolvedValue(FIXTURES.transactions[0]);
      mockPrisma.scrapeLog.create.mockResolvedValue({});

      const result = await transactionService.storeTransactions(
        FIXTURES.scrapeAccounts
      );

      expect(result.totalTransactions).toBe(1);
      expect(result.newTransactions).toBe(1);
      expect(result.duplicateSkipped).toBe(0);
      expect(result.cardCount).toBe(1);
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });

    it("should skip duplicate transactions", async () => {
      mockPrisma.card.upsert.mockResolvedValue(FIXTURES.cards[0]);
      mockPrisma.transaction.findUnique.mockResolvedValue(
        FIXTURES.transactions[0]
      );
      mockPrisma.scrapeLog.create.mockResolvedValue({});

      const result = await transactionService.storeTransactions(
        FIXTURES.scrapeAccounts
      );

      expect(result.duplicateSkipped).toBe(1);
      expect(result.newTransactions).toBe(0);
      expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
    });

    it("should handle empty accounts array", async () => {
      const result = await transactionService.storeTransactions([]);

      expect(result.totalTransactions).toBe(0);
      expect(result.cardCount).toBe(0);
    });
  });
});
