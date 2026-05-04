// =============================================================================
// WDesignKit Widgets Suite — Navigation Helpers
// Provides goToBrowseWidget() and goToMyWidgets() helpers.
//
// Both routes require:
//   1. WP admin login (wpLogin)
//   2. WDKit cloud auth injected into localStorage BEFORE SPA boot (wdkitLogin)
//      Without step 2, both pages redirect to /login.
// =============================================================================

const { expect } = require('@playwright/test');
const { wdkitLogin } = require('./auth');

const PLUGIN_PAGE    = '/wp-admin/admin.php?page=wdesign-kit';
const SCREENSHOT_DIR = 'reports/bugs/screenshots/widgets';

// ---------------------------------------------------------------------------
// goToBrowseWidget
//   Navigates to #/widget-browse and waits for the card grid or skeleton.
// ---------------------------------------------------------------------------
async function goToBrowseWidget(page) {
  // Inject WDKit cloud auth BEFORE SPA initialises so the auth guard passes
  await wdkitLogin(page);
  await page.goto(PLUGIN_PAGE);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '/widget-browse'; });
  await page.waitForTimeout(3000);
  // Wait for the root widget-browse container (skeleton or loaded)
  await page.waitForSelector('.wkit-browse-widget-wrap, .wdkit-browse-card', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// goToMyWidgets
//   Navigates to #/widget-listing and waits for the My Widgets listing.
// ---------------------------------------------------------------------------
async function goToMyWidgets(page) {
  // Inject WDKit cloud auth BEFORE SPA initialises so the auth guard passes
  await wdkitLogin(page);
  await page.goto(PLUGIN_PAGE);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '/widget-listing'; });
  await page.waitForTimeout(3500);
  // Wait for the root My Widgets container
  await page.waitForSelector('.wb-widget-main-container, .wkit-login-main, #wdesignkit-app', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// screenshot — save a screenshot to the bug screenshots directory
// ---------------------------------------------------------------------------
async function screenshot(page, name) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png` }).catch(() => {});
}

module.exports = {
  PLUGIN_PAGE,
  SCREENSHOT_DIR,
  goToBrowseWidget,
  goToMyWidgets,
  screenshot,
};
