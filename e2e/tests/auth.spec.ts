import { test, expect } from "@playwright/test";
import { login, logout } from "../helpers/auth";

test.describe("אימות — Authentication", () => {
  test("should show login page when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("CardWise")).toBeVisible();
    await expect(page.getByText("התחבר באמצעות")).toBeVisible();
  });

  test("should login via test endpoint and see dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "לוח בקרה" })).toBeVisible();
  });

  test("should show user info in sidebar after login", async ({ page }) => {
    await login(page);
    // User display name is shown in sidebar (either "Legacy User" or "Test User")
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText(/@cardwise\.local/)).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    await login(page);
    await logout(page);
    await expect(page).toHaveURL("/login");
  });

  test("should redirect to login after session expires", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page).toHaveURL("/login");
  });
});
