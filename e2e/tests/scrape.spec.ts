import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe("סריקה — Scrape", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: /סריקת נתונים/ }).click();
  });

  test("should display scrape form with security notice", async ({ page }) => {
    await expect(page.getByText("סריקת נתוני ישראכרט")).toBeVisible();
    await expect(page.getByText("פרטי ההתחברות שלך לא נשמרים")).toBeVisible();
    await expect(page.getByLabel("שם משתמש ישראכרט")).toBeVisible();
    await expect(page.getByLabel("סיסמת ישראכרט")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.getByRole("button", { name: /התחל סריקה/ }).click();
    // HTML5 validation prevents submission
    await expect(page.getByLabel("שם משתמש ישראכרט")).toBeFocused();
  });

  test("should show loading state during scrape", async ({ page }) => {
    // Mock the scrape API to simulate delay
    await page.route("**/api/scrape", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          message: "נסרקו 25 עסקאות מ-1 כרטיסים",
        }),
      });
    });

    await page.getByLabel("שם משתמש ישראכרט").fill("testuser");
    await page.getByLabel("סיסמת ישראכרט").fill("testpass");
    await page.getByRole("button", { name: /התחל סריקה/ }).click();

    await expect(page.getByText("סורק")).toBeVisible();
  });

  test("should show success message after scrape", async ({ page }) => {
    await page.route("**/api/scrape", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          message: "נסרקו 25 עסקאות מ-1 כרטיסים",
        }),
      });
    });

    await page.getByLabel("שם משתמש ישראכרט").fill("testuser");
    await page.getByLabel("סיסמת ישראכרט").fill("testpass");
    await page.getByRole("button", { name: /התחל סריקה/ }).click();

    await expect(page.getByText("נסרקו 25 עסקאות")).toBeVisible();
  });

  test("should clear credentials from inputs after successful scrape", async ({
    page,
  }) => {
    await page.route("**/api/scrape", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", message: "סריקה הצליחה" }),
      });
    });

    await page.getByLabel("שם משתמש ישראכרט").fill("testuser");
    await page.getByLabel("סיסמת ישראכרט").fill("testpass");
    await page.getByRole("button", { name: /התחל סריקה/ }).click();

    await expect(page.getByText("סריקה הצליחה")).toBeVisible();
    await expect(page.getByLabel("שם משתמש ישראכרט")).toHaveValue("");
    await expect(page.getByLabel("סיסמת ישראכרט")).toHaveValue("");
  });
});
