// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

type OpenMode = 'always' | 'never' | 'on-failure';
const HEADLESS = !!(process.env.CI || process.env.HEADLESS); 
const IS_CI = !!process.env.CI;
const IS_PREVERSION = !!process.env.PREVERSION;  // default to headed unless CI or HEADLESS env var
const OPEN_REPORT: OpenMode =
  (process.env.OPEN_REPORT as OpenMode) ??
  ((IS_CI || IS_PREVERSION) ? 'never' : 'on-failure');


export default defineConfig({
  testDir: './tests',                               // where tests live
  fullyParallel: true,                              // run files in parallel
  forbidOnly: !!process.env.CI,                     // fail CI if `test.only` is present
  retries: process.env.CI ? 2 : 0,                  // flake buffer on CI, none locally
  workers: process.env.CI ? 1 : undefined,          // fewer workers on CI for stability
  globalTimeout: process.env.CI ? 5 * 60 * 1000 : undefined, // cap total run time on CI
  quiet: !!process.env.CI,                          // less noisy logs on CI
  timeout: 30_000,                                  // per-test timeout (ms)
  expect: { timeout: 5_000 },                       // `expect()` polling timeout (ms)

  
  reporter: [
    ['list'],                                       // console reporter
    ['html', { outputFolder: 'artifacts/report/playwright-report', 
      open: OPEN_REPORT
    }],
  ],
  outputDir: 'artifacts/traces',                           // this controls where traces/videos/screenshots go

  use: {
    baseURL: 'http://localhost:4000',               // base for page/request
    headless: HEADLESS,                             // default; UI projects override below
    viewport: { width: 1280, height: 720 },         // default browser size
    ignoreHTTPSErrors: true,                        // tolerate self-signed certs, etc.
  },

  webServer: {
    command: 'npm run dev:server',                  // start your API/server
    url: 'http://localhost:4000',                   // wait until this URL is ready
    timeout: 120_000,                               // server boot allowance
    env: { PORT: '4000' },                          // force port to 4000
    reuseExistingServer: !IS_CI || IS_PREVERSION,
  },

  projects: [
    // ---------- API (no artifacts, unauth by default)
    {
      name: 'API',                                  // API-only project
      testMatch: /.*api\.spec\.ts$/,                // runs *api.spec.ts
      use: {
        storageState: { cookies: [], origins: [] }, // start unauthenticated
        trace: 'off',                               // no trace for API
        video: 'off',                               // no video for API
        screenshot: 'off',                          // no screenshots for API
      },
    },

    // ---------- UI: Microsoft Edge (headed locally)
    {
      name: 'Microsoft Edge',
      testMatch: /.*(ui|e2e)\.spec\.ts$/,           // runs *ui.spec.ts or *e2e.spec.ts
      testIgnore: ['**/*screenshots*.spec.ts'],     // skip screenshots tests
      use: {
        ...devices['Desktop Edge'],                 // Edge presets
        channel: 'msedge',                          // use system Edge (no download)
        storageState: 'tests/auth-state.json',      // start signed-in
        headless: HEADLESS,                         // headed locally, headless on CI
        trace: IS_CI ? 'retain-on-failure' : 'on',  // ← nicer on CI
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        launchOptions: { slowMo: 200 },          // (optional) slow down UI for visibility
      },
    },

    // ---------- UI: Google Chrome (headed locally)
    {
      name: 'Google Chrome',
      testMatch: /.*(ui|e2e)\.spec\.ts$/,           // runs same UI files
      use: {
        ...devices['Desktop Chrome'],               // Chrome presets
        channel: 'chrome',                          // use system Chrome (no download)
        storageState: 'tests/auth-state.json',      // start signed-in
        headless: HEADLESS,                         // headed locally, headless on CI
        trace: IS_CI ? 'retain-on-failure' : 'on',  // ← nicer on CI
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',                 // hiDPI (retina) for Chrome
        launchOptions: { slowMo: 200 },          // (optional)
      },
    },
  ],

  globalSetup: require.resolve('./tests/global.setup'),     // one-time setup
  globalTeardown: require.resolve('./tests/global.teardown')// one-time teardown
});
