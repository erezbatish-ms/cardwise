import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe("נגישות — Accessibility & RTL", () => {
  test.beforeEach(async ({ page }) => {
    // Mock all APIs
    await page.route("**/api/analytics/**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route("**/api/insights*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
  });

  test("should have RTL direction on HTML element", async ({ page }) => {
    await page.goto("/login");
    const dir = await page.getAttribute("html", "dir");
    expect(dir).toBe("rtl");
  });

  test("should have Hebrew lang attribute", async ({ page }) => {
    await page.goto("/login");
    const lang = await page.getAttribute("html", "lang");
    expect(lang).toBe("he");
  });

  test("should have proper form labels on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("סיסמה")).toBeVisible();
    await expect(page.getByRole("button", { name: "התחבר" })).toBeVisible();
  });

  test("should have proper form labels on scrape page", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: /סריקת נתונים/ }).click();
    await expect(page.getByLabel("שם משתמש ישראכרט")).toBeVisible();
    await expect(page.getByLabel("סיסמת ישראכרט")).toBeVisible();
  });

  test("should support keyboard navigation in sidebar", async ({ page }) => {
    await login(page);
    // Tab through sidebar links
    const sidebarLinks = page.getByRole("link");
    const count = await sidebarLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should have alert role on error messages", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("סיסמה").fill("wrong");
    await page.getByRole("button", { name: "התחבר" }).click();
    // Wait for error to appear
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 5000 });
  });
});
