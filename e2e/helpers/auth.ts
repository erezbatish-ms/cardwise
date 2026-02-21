import { Page, expect } from "@playwright/test";

const APP_PASSWORD = process.env.APP_PASSWORD || "testpassword";

export async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("סיסמה").fill(APP_PASSWORD);
  await page.getByRole("button", { name: "התחבר" }).click();
  await page.waitForURL("/");
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: /התנתק/ }).click();
  await expect(page).toHaveURL(/\/login/);
}
