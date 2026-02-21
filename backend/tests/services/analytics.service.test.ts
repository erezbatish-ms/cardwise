import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup.js";
import { mockPrisma } from "../helpers/setup.js";
import { FIXTURES } from "../helpers/fixtures.js";

const { analyticsService } = await import(
  "../../src/services/analytics.service.js"
);

describe("AnalyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMonthlyTrends", () => {
    it("should aggregate transactions by month", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { date: new Date("2025-12-15"), chargedAmount: 100 },
        { date: new Date("2025-12-20"), chargedAmount: 200 },
        { date: new Date("2025-11-10"), chargedAmount: 150 },
      ]);

      const result = await analyticsService.getMonthlyTrends(undefined, 12);

      expect(result).toHaveLength(2);
      const dec = result.find((t) => t.month === "2025-12");
      expect(dec?.total).toBe(300);
      expect(dec?.count).toBe(2);
    });

    it("should filter by card ID", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      await analyticsService.getMonthlyTrends("1234", 6);

      const call = mockPrisma.transaction.findMany.mock.calls[0][0];
      expect(call.where.cardId).toBe("1234");
    });

    it("should return empty array for no transactions", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      const result = await analyticsService.getMonthlyTrends();
      expect(result).toEqual([]);
    });
  });

  describe("getCategoryBreakdown", () => {
    it("should return categories with percentages", async () => {
      mockPrisma.transaction.groupBy.mockResolvedValue([
        { categoryId: "cat-1", _sum: { chargedAmount: 300 }, _count: 10 },
        { categoryId: "cat-2", _sum: { chargedAmount: 200 }, _count: 5 },
      ]);
      mockPrisma.category.findMany.mockResolvedValue(FIXTURES.categories);

      const result = await analyticsService.getCategoryBreakdown();

      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(60);
      expect(result[1].percentage).toBe(40);
    });
  });

  describe("getTopMerchants", () => {
    it("should return top merchants sorted by total", async () => {
      mockPrisma.transaction.groupBy.mockResolvedValue([
        { merchant: "רמי לוי", _sum: { chargedAmount: 1500 }, _count: 8 },
        { merchant: "שופרסל", _sum: { chargedAmount: 1200 }, _count: 6 },
      ]);

      const result = await analyticsService.getTopMerchants(undefined, 10);

      expect(result).toHaveLength(2);
      expect(result[0].merchant).toBe("רמי לוי");
    });
  });

  describe("getCardComparison", () => {
    it("should compare cards by total spending", async () => {
      mockPrisma.card.findMany.mockResolvedValue([
        {
          ...FIXTURES.cards[0],
          transactions: [{ chargedAmount: 100 }, { chargedAmount: 200 }],
        },
        {
          ...FIXTURES.cards[1],
          transactions: [{ chargedAmount: 150 }],
        },
      ]);

      const result = await analyticsService.getCardComparison();

      expect(result).toHaveLength(2);
      expect(result[0].total).toBe(300);
      expect(result[0].avgTransaction).toBe(150);
      expect(result[1].total).toBe(150);
    });
  });
});
