// tests/auth-state.spec.ts
import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/auth-state.json' });


test('already authenticated session loads dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
});
