// tests/ui-screenshots.spec.ts
import { test, expect } from '@playwright/test';


test.use({ headless: true, deviceScaleFactor: 2 });


test.describe('Visual baselines (Chrome only)', () => {
  // (Optional but recommended) keep screenshots consistent
  test.use({
    colorScheme: 'light',
    locale: 'en-US',
    // If you want *super* stable snaps, force headless just for this file:
    // headless: true,
  });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    // Kill animations/caret + hide scrollbars for stable diffs
    await page.addStyleTag({ content: `
      * { animation: none !important; transition: none !important; }
      input, textarea { caret-color: transparent !important; }
      ::-webkit-scrollbar { display: none !important; }
    `});
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main.card')).toBeVisible();
    // Ensure no hover styles are active
    await page.mouse.move(0, 0);
  });

  test('login — initial', async ({ page }, testInfo) => {
    // Run these only in the "Google Chrome" project
    test.skip(testInfo.project.name !== 'Google Chrome', 'Screenshots only in the Google Chrome project');
    await expect(page.locator('main.card')).toHaveScreenshot('login-initial.png', {
      maxDiffPixelRatio: 0.005,
    });
  });

  test('login — filled', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Google Chrome', 'Screenshots only in the Google Chrome project');
    await page.getByLabel('Username').fill('user');
    await page.getByLabel('Password').fill('password');
    await page.mouse.move(0, 0);
    await expect(page.locator('main.card')).toHaveScreenshot('login-filled.png', {
      maxDiffPixelRatio: 0.005,
    });
  });

  test('dashboard — after sign-in', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Google Chrome', 'Screenshots only in the Google Chrome project');
    await page.getByLabel('Username').fill('user');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.mouse.move(0, 0);
    await expect(page.locator('main.card')).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.005,
    });
  });
});
