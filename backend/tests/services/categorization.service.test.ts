import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup.js";
import { mockPrisma, mockOpenAI } from "../helpers/setup.js";
import { FIXTURES } from "../helpers/fixtures.js";

const { categorizationService } = await import(
  "../../src/services/categorization.service.js"
);

describe("CategorizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AZURE_OPENAI_ENDPOINT = "https://test.openai.azure.com";
    process.env.AZURE_OPENAI_API_KEY = "test-key";
  });

  describe("categorize", () => {
    it("should categorize transactions using AI", async () => {
      mockPrisma.category.findMany.mockResolvedValue(FIXTURES.categories);
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify([
                { index: 1, category: "מזון ומסעדות" },
              ]),
            },
          },
        ],
      });
      mockPrisma.transaction.update.mockResolvedValue({});

      const result = await categorizationService.categorize([
        {
          id: "txn-1",
          description: "מסעדת שווארמה",
          chargedAmount: 85,
          merchant: "מסעדת שווארמה",
        },
      ]);

      expect(result.categorized).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            categoryId: "cat-1",
            categorySource: "ai",
          }),
        })
      );
    });

    it("should handle AI errors gracefully", async () => {
      mockPrisma.category.findMany.mockResolvedValue(FIXTURES.categories);
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error("API error")
      );

      const result = await categorizationService.categorize([
        { id: "txn-1", description: "test", chargedAmount: 50, merchant: null },
      ]);

      expect(result.failed).toBe(1);
      expect(result.categorized).toBe(0);
    });

    it("should handle empty transaction list", async () => {
      const result = await categorizationService.categorize([]);
      expect(result.categorized).toBe(0);
      expect(result.failed).toBe(0);
    });
  });
});
