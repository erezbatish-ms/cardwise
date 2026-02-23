import { Page, expect } from "@playwright/test";

const BACKEND_URL = "http://localhost:3001";

export async function login(page: Page): Promise<void> {
  // Use test-only login endpoint (dev mode only)
  const response = await page.request.post(`${BACKEND_URL}/api/auth/test-login`, {
    data: {},
  });
  expect(response.ok()).toBeTruthy();

  // Navigate to app — session cookie is now set
  await page.goto("/");
  await page.waitForURL("/");
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: /התנתק/ }).click();
  await expect(page).toHaveURL(/\/login/);
}
