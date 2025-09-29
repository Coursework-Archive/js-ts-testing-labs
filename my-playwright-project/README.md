# 🎭 My Playwright Project

End-to-end tests using [Playwright](https://playwright.dev/) with TypeScript.  
This project demonstrates global setup/teardown, authentication state, example tests, and CI integration via GitHub Actions.

---

## 📑 Table of Contents
- [📦 Setup](#-setup)
- [🚀 Running Tests](#-running-tests)
- [🔑 Authentication State (Global Setup)](#-authentication-state-global-setup)
- [📊 Reports & Traces](#-reports--traces)
- [📝 Example Tests](#-example-tests)
- [⚙️ Configuration](#️-configuration)
- [🤖 Continuous Integration](#-continuous-integration)
- [🛠 Useful Scripts](#-useful-scripts)
- [📚 Resources](#-resources)
- [📂 Project Structure](#-project-structure)

---

## 📦 Setup

> ⚠️ Note: Browser installation (`npx playwright install`) is intentionally excluded from scripts.  
> At work environments, browsers are pre-installed or restricted from download.  

Clone the repo and install dependencies:


Skip browser downloads at install and allow manual installs later:

**PowerShell (Windows)**:
```shell
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1; npm ci
```

**Bash (Linux/macOS):**
```bash 
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
```

## 🚀 Running Tests

* Run all tests:
```shell
npm test
```

* Run tests in headed mode (see the browser):
```shell
npm run test:headed
```

* Run tests in UI mode (interactive test runner):
```shell
npm run test:ui
```

* Run in debug mode:
```shell
npm run test:debug
```

## 🔑 Authentication State (Global Setup)

The project uses `global.setup.ts` to log in once before running tests and saves the auth state to `auth-state.json`.
Your tests (like `example.spec.ts`) automatically reuse this stored session.

To reset authentication, delete `auth-state.json` and re-run tests.


## 📊 Reports & Traces

* Generate HTML report:
```shell
npm run report

```

* Open a saved trace:
```shell
npm run trace:open

```

* Update snapshots:
```shell
npm run update-snapshots

```

## 📝 Example Tests

* [`example.spec.ts`](./tests/example.spec.ts): Basic title and navigation checks.
* [`demo-todo-app.spec.ts`](./tests-examples/demo-todo-app.spec.ts): Full CRUD tests against the TodoMVC demo app.
* [`global.setup.ts`](./tests/global.setup.ts): Auth login before tests.
* [`global.teardown.ts`](./tests/global.teardown.ts): Cleanup after all tests.


## ⚙️ Configuration

* Playwright settings are in [`playwright.config.ts`](./playwright.config.ts):
* Retries on CI
* Global timeout
* Parallel workers
* Reporters (list + html)
* Traces, screenshots, and videos on failures
* Browsers: Chromium, Firefox, WebKit
TypeScript settings are in [`tsconfig.json`](./tsconfig.json).


## 🤖 Continuous Integration

This repo includes GitHub Actions to run tests on:
* Pushes to main / master
* Pull requests to main / master

Reports are uploaded as build artifacts.

🛠 Useful Scripts
```shell
npm run codegen        # Generate tests by recording user actions
npm run version:patch  # Bump version patch (1.0.0 -> 1.0.1)
npm run commit -- "msg" # Quick git add + commit
npm run push           # Push commits & tags


```

📚 Resources
- [Playwright Docs – Introduction](https://playwright.dev/docs/intro)
- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Test API Reference](https://playwright.dev/docs/api/class-test)
- [Trace Viewer Guide](https://playwright.dev/docs/trace-viewer-intro)
- [Reporters](https://playwright.dev/docs/test-reporters)
- [GitHub Actions with Playwright](https://playwright.dev/docs/ci-intro)


## 📂 Project Structure
```text
my-playwright-project/
├── .github/
│   └── workflows/
│       └── playwright.yml       # GitHub Actions CI workflow
├── node_modules/                # Installed dependencies
├── tests/                       # Your test suite
│   ├── example.spec.ts          # Basic example test
│   ├── global.setup.ts          # Global login/authentication
│   ├── global.teardown.ts       # Global cleanup
│   └── auth-state.json          # Saved session state (generated)
├── tests-examples/              # Extra demo specs (TodoMVC, etc.)
│   └── demo-todo-app.spec.ts
├── playwright.config.ts         # Playwright configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Project metadata & scripts
└── .gitignore
```
