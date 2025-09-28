// tests/local-smoke.spec.ts
import { test, expect } from '@playwright/test';

test('home renders and login form exists', async ({ page }) => {
  await page.goto('/'); // uses baseURL from playwright.config.ts
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test('can log in and reach dashboard', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[name="username"]', 'user');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type=submit]');

  // Wait for redirect, then assert URL & content
  await page.waitForURL('**/dashboard');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
});
