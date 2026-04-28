// =============================================================================
// WDesignKit Orbit — Playwright Configuration
//
// Test Types:
//   server  → tests/server/      — wdesignkit.com (SaaS web app)
//   plugin  → tests/plugin/          — WordPress plugin (local / staging WP)
//   learn   → tests/learning-center/ — learn.wdesignkit.com
//
// Projects:
//   server  → wdk-desktop · wdk-mobile · wdk-tablet
//   plugin  → plugin-desktop · plugin-mobile · plugin-tablet
//   learn   → learning-desktop
// =============================================================================

require('dotenv').config();

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({

  // ── Test Directory ──────────────────────────────────────────────────────────
  testDir: './tests',

  // ── Run tests in parallel ───────────────────────────────────────────────────
  fullyParallel: false,

  // ── Fail the build on CI if test.only is accidentally left in ───────────────
  forbidOnly: !!process.env.CI,

  // ── Retry failed tests once on CI ───────────────────────────────────────────
  retries: process.env.CI ? 1 : 0,

  // ── Number of parallel workers ──────────────────────────────────────────────
  workers: 1,

  // ── Reporter ────────────────────────────────────────────────────────────────
  reporter: [
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['list'],
  ],

  // ── Global test settings ────────────────────────────────────────────────────
  use: {
    baseURL: process.env.WDK_URL || 'https://wdesignkit.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: false,
  },

  // ── Output folder for test artifacts ────────────────────────────────────────
  outputDir: 'test-results',

  // ── Snapshot directory for visual regression ────────────────────────────────
  snapshotDir: 'tests/snapshots',

  // ── Expect timeout ──────────────────────────────────────────────────────────
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03,
    },
  },

  // ── Global timeout per test ──────────────────────────────────────────────────
  timeout: 60000,

  // ── Projects ─────────────────────────────────────────────────────────────────
  projects: [

    // ==========================================================================
    // SERVER — wdesignkit.com (SaaS web app)
    // ==========================================================================

    {
      name: 'wdk-desktop',
      testMatch: 'tests/server/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WDK_URL || 'https://wdesignkit.com',
        viewport: { width: 1440, height: 900 },
      },
    },

    {
      name: 'wdk-mobile',
      testMatch: 'tests/server/**/*.spec.js',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.WDK_URL || 'https://wdesignkit.com',
        viewport: { width: 375, height: 812 },
      },
    },

    {
      name: 'wdk-tablet',
      testMatch: 'tests/server/**/*.spec.js',
      use: {
        ...devices['iPad (gen 7)'],
        baseURL: process.env.WDK_URL || 'https://wdesignkit.com',
        viewport: { width: 768, height: 1024 },
      },
    },

    // ==========================================================================
    // PLUGIN — WordPress plugin (local or staging WordPress install)
    // Set PLUGIN_URL in .env — e.g. http://localhost:8881 or https://staging.site.com
    // Set WP_ADMIN_USER and WP_ADMIN_PASS in .env
    // ==========================================================================

    {
      name: 'plugin-desktop',
      testMatch: 'tests/plugin/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLUGIN_URL || 'http://localhost:8881',
        viewport: { width: 1440, height: 900 },
        ignoreHTTPSErrors: true,
      },
    },

    {
      name: 'plugin-mobile',
      testMatch: 'tests/plugin/**/*.spec.js',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.PLUGIN_URL || 'http://localhost:8881',
        viewport: { width: 375, height: 812 },
        ignoreHTTPSErrors: true,
      },
    },

    {
      name: 'plugin-tablet',
      testMatch: 'tests/plugin/**/*.spec.js',
      use: {
        ...devices['iPad (gen 7)'],
        baseURL: process.env.PLUGIN_URL || 'http://localhost:8881',
        viewport: { width: 768, height: 1024 },
        ignoreHTTPSErrors: true,
      },
    },

    // ==========================================================================
    // LEARNING CENTER — learn.wdesignkit.com
    // ==========================================================================

    {
      name: 'learning-desktop',
      testMatch: 'tests/learning-center/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.LEARNING_URL || 'https://learn.wdesignkit.com',
        viewport: { width: 1440, height: 900 },
      },
    },

  ],

});
