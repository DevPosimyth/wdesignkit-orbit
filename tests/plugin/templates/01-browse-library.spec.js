// =============================================================================
// WDesignKit Templates Suite — Browse Library
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 1 — Browse Templates navigation & sidebar (10 tests)
//   Section 2 — Template library initial render & grid (10 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse, goToBrowseViaNav, PLUGIN_PAGE } = require('./_helpers/navigation');

// =============================================================================
// 1. Browse Templates — navigation & sidebar
// =============================================================================
test.describe('1. Browse Templates — navigation & sidebar', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
  });

  test('1.01 Templates menu item is present in the left sidebar', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
    await expect(menu).toBeVisible({ timeout: 10000 });
  });

  test('1.02 Templates menu icon .wdkit-i-templates is rendered', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const icon = page.locator('.wdkit-i-templates').first();
    await expect(icon).toBeAttached({ timeout: 10000 });
  });

  test('1.03 Clicking Templates menu expands to show submenu links', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
    await menu.click();
    await page.waitForTimeout(500);
    const count = await page.locator('.wdkit-submenu-link').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('1.04 Browse Templates submenu link has href="#/browse"', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
    await menu.click();
    await page.waitForTimeout(400);
    const link = page.locator('.wdkit-submenu-link[href="#/browse"]');
    const count = await link.count();
    expect(count).toBeGreaterThan(0);
  });

  test('1.05 My Templates submenu link has href="#/my_uploaded"', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
    await menu.click();
    await page.waitForTimeout(400);
    const link = page.locator('.wdkit-submenu-link[href="#/my_uploaded"]');
    const count = await link.count();
    expect(count).toBeGreaterThan(0);
  });

  test('1.06 Clicking Browse Templates nav link navigates to hash #/browse', async ({ page }) => {
    await goToBrowseViaNav(page);
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toBe('#/browse');
  });

  test('1.07 Plugin root #wdesignkit-app is present on the plugin page', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const count = await page.locator('#wdesignkit-app').count();
    expect(count).toBeGreaterThan(0);
  });

  test('1.08 Plugin page renders without "Fatal error" text', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('1.09 Plugin page renders without "You do not have permission" message', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('do not have permission');
  });

  test('1.10 No product JavaScript console errors on plugin page load', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 2. Template library — initial render & grid
// =============================================================================
test.describe('2. Template library — initial render & grid', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('2.01 .wdkit-browse-templates container is visible', async ({ page }) => {
    await expect(page.locator('.wdkit-browse-templates')).toBeVisible({ timeout: 10000 });
  });

  test('2.02 .wdkit-browse-main is rendered inside browse container', async ({ page }) => {
    await expect(page.locator('.wdkit-browse-main')).toBeVisible({ timeout: 10000 });
  });

  test('2.03 At least one .wdkit-browse-card is visible in the grid', async ({ page }) => {
    const card = page.locator('.wdkit-browse-card').first();
    await expect(card).toBeVisible({ timeout: 15000 });
  });

  test('2.04 Grid renders 3+ cards on initial load', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('.wdkit-browse-card').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('2.05 Grid wrapper has class .wdkit-grid-3col', async ({ page }) => {
    const count = await page.locator('.wdkit-templates-card-main.wdkit-grid-3col').count();
    expect(count).toBeGreaterThan(0);
  });

  test('2.06 Filter column sidebar .wdkit-browse-column is visible alongside the grid', async ({ page }) => {
    await expect(page.locator('.wdkit-browse-column')).toBeVisible({ timeout: 10000 });
  });

  test('2.07 Filter inner container .wdkit-browse-column-inner is present', async ({ page }) => {
    const count = await page.locator('.wdkit-browse-column-inner').count();
    expect(count).toBeGreaterThan(0);
  });

  test('2.08 Each card has a container element .wdkit-temp-card-container', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const containers = page.locator('.wdkit-temp-card-container');
    const count = await containers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('2.09 Card grid is not empty after initial load (no empty-state placeholder only)', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const emptyCount = await page.locator('.wdkit-no-template, .wdkit-empty-state').count();
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect(cardCount).toBeGreaterThan(0);
    expect(emptyCount).toBe(0);
  });

  test('2.10 No 4xx/5xx network responses on browse page load', async ({ page }) => {
    const failed = [];
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await goToBrowse(page);
    await page.waitForTimeout(2000);
    expect(failed, failed.join('\n')).toHaveLength(0);
  });

});
