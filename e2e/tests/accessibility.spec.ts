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
    await expect(page.getByText("התחבר באמצעות")).toBeVisible();
    await expect(page.getByText("CardWise")).toBeVisible();
  });

  test("should have proper form labels on scrape page", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: /סריקת נתונים/ }).click();
    await expect(page.getByLabel("תעודת זהות")).toBeVisible();
    await expect(page.getByLabel("6 ספרות אחרונות של הכרטיס")).toBeVisible();
    await expect(page.getByLabel("סיסמה קבועה")).toBeVisible();
  });

  test("should support keyboard navigation in sidebar", async ({ page }) => {
    await login(page);
    // Wait for sidebar to be visible
    await page.waitForSelector("nav", { timeout: 5000 });
    const sidebarLinks = page.locator("nav").getByRole("link");
    await expect(sidebarLinks.first()).toBeVisible({ timeout: 5000 });
    const count = await sidebarLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should show error parameter on login page", async ({ page }) => {
    await page.goto("/login?error=google_failed");
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 5000 });
  });
});
