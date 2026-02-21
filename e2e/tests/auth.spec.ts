import { test, expect } from "@playwright/test";
import { login, logout } from "../helpers/auth";

test.describe("אימות — Authentication", () => {
  test("should show login page when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("CardWise")).toBeVisible();
    await expect(page.getByLabel("סיסמה")).toBeVisible();
  });

  test("should login with correct password", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "לוח בקרה" })).toBeVisible();
  });

  test("should show error for wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("סיסמה").fill("wrong-password");
    await page.getByRole("button", { name: "התחבר" }).click();
    await expect(page.getByRole("alert")).toContainText("סיסמה שגויה");
  });

  test("should logout successfully", async ({ page }) => {
    await login(page);
    await logout(page);
    await expect(page).toHaveURL("/login");
  });

  test("should redirect to login after session expires", async ({ page }) => {
    // Access protected route without session
    await page.goto("/transactions");
    await expect(page).toHaveURL("/login");
  });
});
