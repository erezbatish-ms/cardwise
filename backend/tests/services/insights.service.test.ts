import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup.js";
import { mockPrisma, mockOpenAI } from "../helpers/setup.js";

const { insightsService } = await import(
  "../../src/services/insights.service.js"
);

describe("InsightsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AZURE_OPENAI_ENDPOINT = "https://test.openai.azure.com";
    process.env.AZURE_OPENAI_API_KEY = "test-key";
  });

  describe("getInsights", () => {
    it("should return cached insights if not expired", async () => {
      const cached = {
        content: JSON.stringify([
          { type: "tip", title: "טיפ", content: "תוכן", severity: "tip" },
        ]),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };
      mockPrisma.insightCache.findUnique.mockResolvedValue(cached);

      const result = await insightsService.getInsights();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("טיפ");
      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    });

    it("should generate new insights when cache is expired", async () => {
      mockPrisma.insightCache.findUnique.mockResolvedValue({
        content: "[]",
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      // Mock analytics data
      const { analyticsService } = await import(
        "../../src/services/analytics.service.js"
      );
      vi.spyOn(analyticsService, "getMonthlyTrends").mockResolvedValue([]);
      vi.spyOn(analyticsService, "getCategoryBreakdown").mockResolvedValue([]);
      vi.spyOn(analyticsService, "getTopMerchants").mockResolvedValue([]);

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify([
                { type: "tip", title: "חסכו", content: "נסו לחסוך", severity: "tip" },
              ]),
            },
          },
        ],
      });
      mockPrisma.insightCache.upsert.mockResolvedValue({});

      const result = await insightsService.generateInsights();

      expect(result).toHaveLength(1);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    });

    it("should return default insights on AI error", async () => {
      mockPrisma.insightCache.findUnique.mockResolvedValue(null);

      const { analyticsService } = await import(
        "../../src/services/analytics.service.js"
      );
      vi.spyOn(analyticsService, "getMonthlyTrends").mockResolvedValue([]);
      vi.spyOn(analyticsService, "getCategoryBreakdown").mockResolvedValue([]);
      vi.spyOn(analyticsService, "getTopMerchants").mockResolvedValue([]);

      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error("AI error")
      );

      const result = await insightsService.generateInsights();

      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("לא ניתן");
    });
  });
});
