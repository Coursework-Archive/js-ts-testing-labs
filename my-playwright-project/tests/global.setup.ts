// global.setup.ts
import { chromium, type FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  // Example: launch browser, login once, save storage state
  const { baseURL } = config.projects[0].use;
  const channel = process.env.PWBROWSER || 'msedge'; // or 'chrome'
  const headed = !!process.env.PWDEBUG || process.env.SHOW_BROWSER === '1';
  
  const browser = await chromium.launch({
    channel,
    headless: !headed,
    slowMo: headed ? 200 : 0,
  });

  const page = await browser.newPage();
  await page.goto(baseURL as string);
  await page.fill('input[name="username"]', 'user');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type=submit]');

    // Wait for the post-login navigation (adjust to '**/' if you redirect back to root)
  await page.waitForURL('**/dashboard');

  // Save authenticated state where your tests expect it
  await page.context().storageState({ path: 'tests/auth-state.json' });

  await browser.close();
}
