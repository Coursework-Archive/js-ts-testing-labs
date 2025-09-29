// tests/landing-ui.spec.ts
import { test, expect } from '@playwright/test';

// Start this spec without any stored session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Landing & Login (UI only)', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test('landing page renders expected fields and button', async ({ page }) => {
    const username = page.getByLabel('Username');
    const password = page.getByLabel('Password');
    const submit   = page.getByRole('button', { name: 'Sign in' });

    await expect(username).toBeVisible();
    await expect(password).toBeVisible();
    await expect(submit).toBeVisible();

    // a11y/semantics sanity
    await expect(password).toHaveAttribute('type', 'password');

    // optional DOM checks (still UI, not API)
    const form = page.locator('form.form');
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(form).toHaveAttribute('action', '/login');

    // basic interactions
    await username.fill('demo');
    await password.fill('secret');
    await expect(submit).toBeEnabled();
  });

  test('successful login navigates to dashboard (UI flow)', async ({ page }) => {
    await page.getByLabel('Username').fill('user');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();

    // Optional: visible copy on the dashboard
    await expect(page.getByText('You are logged in', { exact: false })).toBeVisible();

    // Optional: navigate back via visible control
    await page.getByRole('link', { name: 'Back to login' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
