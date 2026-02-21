import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe("קטגוריות — Categories", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/categories", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            { id: "cat-1", name: "מזון ומסעדות", icon: "🍽️", color: "#ef4444", isDefault: true, _count: { transactions: 15 } },
            { id: "cat-2", name: "סופרמרקט", icon: "🛒", color: "#f97316", isDefault: true, _count: { transactions: 8 } },
          ]),
        });
      }
    });

    await page.route("**/api/transactions*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            transactions: [
              {
                id: "txn-1",
                description: "בית קפה",
                chargedAmount: 25,
                date: "2025-12-15",
                cardId: "1234",
                originalAmount: 25,
                currency: "ILS",
                categoryId: null,
                categorySource: "ai",
                merchant: "בית קפה",
                card: { id: "1234", lastFourDigits: "1234", cardName: null, provider: "isracard" },
                category: null,
              },
            ],
            pagination: { page: 1, limit: 50, total: 1, pages: 1 },
          }),
        });
      }
    });

    await page.route("**/api/cards", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await login(page);
  });

  test("should allow manual category assignment on transaction page", async ({
    page,
  }) => {
    await page.getByRole("link", { name: /עסקאות/ }).click();
    await expect(page.getByText("לא מסווג")).toBeVisible();

    // Click to open category editor
    await page.getByText("לא מסווג").click();
    await expect(page.getByLabel("בחר קטגוריה")).toBeVisible();
  });

  test("should show cancel button in category editor", async ({ page }) => {
    await page.getByRole("link", { name: /עסקאות/ }).click();
    await page.getByText("לא מסווג").click();
    await expect(page.getByText("ביטול")).toBeVisible();

    await page.getByText("ביטול").click();
    await expect(page.getByText("לא מסווג")).toBeVisible();
  });
});
