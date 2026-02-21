import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";
import { TEST_TRANSACTIONS } from "../fixtures/test-data";

test.describe("עסקאות — Transactions", () => {
  test.beforeEach(async ({ page }) => {
    // Mock transactions API
    await page.route("**/api/transactions*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          transactions: TEST_TRANSACTIONS.map((t, i) => ({
            id: `txn-${i}`,
            ...t,
            cardId: "1234",
            originalAmount: t.chargedAmount,
            currency: "ILS",
            categoryId: null,
            categorySource: "ai",
            merchant: t.description,
            card: { id: "1234", lastFourDigits: "1234", cardName: null, provider: "isracard" },
            category: null,
          })),
          pagination: { page: 1, limit: 50, total: 3, pages: 1 },
        }),
      });
    });

    await page.route("**/api/cards", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "1234", lastFourDigits: "1234", cardName: null, provider: "isracard" },
        ]),
      });
    });

    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "cat-1", name: "מזון ומסעדות", icon: "🍽️", color: "#ef4444", isDefault: true },
          { id: "cat-2", name: "סופרמרקט", icon: "🛒", color: "#f97316", isDefault: true },
        ]),
      });
    });

    await login(page);
    await page.getByRole("link", { name: /עסקאות/ }).click();
  });

  test("should display transaction list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "עסקאות" })).toBeVisible();
    await expect(page.getByText("מסעדת שווארמה")).toBeVisible();
    await expect(page.getByText("רמי לוי")).toBeVisible();
    await expect(page.getByText("דן אוטובוסים")).toBeVisible();
  });

  test("should show card filter dropdown", async ({ page }) => {
    const select = page.getByLabel("סנן לפי כרטיס");
    await expect(select).toBeVisible();
    await expect(select).toContainText("כל הכרטיסים");
  });

  test("should have search input", async ({ page }) => {
    const search = page.getByLabel("חיפוש עסקאות");
    await expect(search).toBeVisible();
    await search.fill("שווארמה");
  });

  test("should show auto-categorize button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /סווג אוטומטית/ })
    ).toBeVisible();
  });

  test("should display transaction amounts", async ({ page }) => {
    // Check amounts are displayed (formatted as ILS currency)
    await expect(page.getByText("₪")).toHaveCount(3);
  });
});
