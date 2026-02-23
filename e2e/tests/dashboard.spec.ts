import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";
import { TEST_INSIGHTS } from "../fixtures/test-data";

test.describe("לוח בקרה — Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock all analytics endpoints
    await page.route("**/api/analytics/trends*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { month: "2025-07", total: 5200, count: 45 },
          { month: "2025-08", total: 4800, count: 42 },
          { month: "2025-09", total: 6100, count: 55 },
          { month: "2025-10", total: 5500, count: 48 },
          { month: "2025-11", total: 4900, count: 40 },
          { month: "2025-12", total: 5800, count: 52 },
        ]),
      });
    });

    await page.route("**/api/analytics/categories*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { categoryId: "cat-1", categoryName: "מזון ומסעדות", icon: "🍽️", color: "#ef4444", total: 3200, count: 25, percentage: 35 },
          { categoryId: "cat-2", categoryName: "סופרמרקט", icon: "🛒", color: "#f97316", total: 2100, count: 12, percentage: 23 },
        ]),
      });
    });

    await page.route("**/api/analytics/merchants*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { merchant: "רמי לוי", total: 1500, count: 8 },
          { merchant: "שופרסל", total: 1200, count: 6 },
          { merchant: "סופר פארם", total: 800, count: 10 },
        ]),
      });
    });

    await page.route("**/api/analytics/comparison*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/insights*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(TEST_INSIGHTS),
      });
    });

    await login(page);
  });

  test("should display dashboard with all widgets", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "לוח בקרה" })).toBeVisible();
    await expect(page.getByText("מגמות הוצאות")).toBeVisible();
    await expect(page.getByText("פילוח לפי קטגוריות")).toBeVisible();
    await expect(page.getByText("בתי עסק מובילים")).toBeVisible();
  });

  test("should have month filter dropdown", async ({ page }) => {
    const monthSelect = page.getByLabel("סנן לפי חודש");
    await expect(monthSelect).toBeVisible();
    await expect(monthSelect).toContainText("כל התקופה");
  });

  test("should display category legend instead of pie labels", async ({ page }) => {
    // Legend items should have colored dots with category names inside the category breakdown section
    const categorySection = page.locator("text=פילוח לפי קטגוריות").locator("..");
    const legend = categorySection.locator(".rounded-full");
    await expect(legend.first()).toBeVisible();
    expect(await legend.count()).toBeGreaterThanOrEqual(2);
  });

  test("should display top merchants", async ({ page }) => {
    await expect(page.getByText("רמי לוי")).toBeVisible();
    await expect(page.getByText("שופרסל")).toBeVisible();
    await expect(page.getByText("סופר פארם")).toBeVisible();
  });

  test("should display card comparison section", async ({ page }) => {
    await expect(page.getByText("השוואת כרטיסים")).toBeVisible();
  });

  test("should show message when less than 2 cards for comparison", async ({
    page,
  }) => {
    await expect(page.getByText("נדרשים לפחות 2 כרטיסים")).toBeVisible();
  });

  test("should show transaction drill-down when clicking category legend", async ({ page }) => {
    // Mock transactions for drill-down
    await page.route("**/api/transactions*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          transactions: [
            {
              id: "txn-1", date: "2025-10-01", description: "מסעדת טעם", chargedAmount: -120,
              originalAmount: -120, currency: "ILS", categoryId: "cat-1", categorySource: "ai",
              merchant: "מסעדת טעם",
              card: { id: "c1", lastFourDigits: "1234", cardName: null, provider: "isracard" },
              category: { id: "cat-1", name: "מזון ומסעדות", icon: "🍽️", color: "#ef4444", isDefault: true },
            },
          ],
          pagination: { page: 1, limit: 100, total: 1, pages: 1 },
        }),
      });
    });

    // Click the first legend item (מזון ומסעדות)
    const legendButtons = page.locator("button").filter({ hasText: "מזון ומסעדות" });
    await legendButtons.first().click();

    // Should show drill-down panel with transactions
    await expect(page.getByText("עסקאות בקטגוריה:")).toBeVisible();
    await expect(page.getByText("מסעדת טעם")).toBeVisible();

    // Close the drill-down
    await page.getByRole("button", { name: /סגור/ }).click();
    await expect(page.getByText("עסקאות בקטגוריה:")).not.toBeVisible();
  });
});
