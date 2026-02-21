import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";
import { TEST_INSIGHTS } from "../fixtures/test-data";

test.describe("תובנות AI — Insights", () => {
  test.beforeEach(async ({ page }) => {
    // Mock analytics for dashboard
    await page.route("**/api/analytics/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/insights*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(TEST_INSIGHTS),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            ...TEST_INSIGHTS,
            {
              type: "tip",
              title: "תובנה חדשה",
              content: "נוספה תובנה חדשה לאחר רענון",
              severity: "info",
            },
          ]),
        });
      }
    });

    await login(page);
  });

  test("should display AI insights section", async ({ page }) => {
    await expect(page.getByText("תובנות וטיפים")).toBeVisible();
  });

  test("should show insight cards with correct content", async ({ page }) => {
    await expect(page.getByText("חסכו במזון")).toBeVisible();
    await expect(page.getByText("עלייה בהוצאות")).toBeVisible();
    await expect(
      page.getByText("ההוצאה על מזון ומסעדות עלתה")
    ).toBeVisible();
  });

  test("should have refresh button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /רענן/ })).toBeVisible();
  });

  test("should display severity icons correctly", async ({ page }) => {
    // tip severity
    await expect(page.getByText("💡")).toBeVisible();
    // warning severity
    await expect(page.getByText("⚠️")).toBeVisible();
  });
});
