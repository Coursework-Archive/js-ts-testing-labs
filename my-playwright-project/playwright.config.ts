// playwright.config.ts
import { defineConfig, devices, FullConfig } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  /* Where your tests are located. */
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you leave `test.only` in the code. Useful in CI */
  forbidOnly: !!process.env.CI,

  /* Retry on CI builds, none locally */
  retries: process.env.CI ? 2 : 0,

  /* How many workers (parallel test runners). */
  workers: process.env.CI ? 1 : undefined,

  // Timeout per test 
  timeout: 30 * 1000, 

  // Gloabal timeout for the entire test suite
  globalTimeout: process.env.CI ? 5 * 60 * 1000 : undefined,

  // Global setup/teardown files
  globalSetup: require.resolve('./tests/global.setup'),
  globalTeardown: require.resolve('./tests/global.teardown'),

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  quiet: !!process.env.CI,


  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',      // capture trace on first retry
    video: 'retain-on-failure',   // keep video only for failed tests
    screenshot: 'only-on-failure',

    // Example browser / context options
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev:server',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  /* Projects: run tests under different browsers / environments */
  projects: [
    { name: 'Microsoft Edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'Google Chrome',  use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],


});
