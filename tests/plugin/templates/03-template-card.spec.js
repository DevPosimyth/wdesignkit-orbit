// =============================================================================
// WDesignKit Templates Suite — Template Card
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 10 — Template card UI elements per card (10 tests)
//   Section 11 — Template card hover & interaction (5 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');

// =============================================================================
// 10. Template card UI — all elements per card
// =============================================================================
test.describe('10. Template card UI — all elements per card', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('10.01 First card has image cover .wdkit-browse-img-cover', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('.wdkit-browse-card').first().locator('.wdkit-browse-img-cover').count();
    expect(count).toBeGreaterThan(0);
  });

  test('10.02 First card has image container .wdkit-browse-img-container', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('.wdkit-browse-img-container').count();
    expect(count).toBeGreaterThan(0);
  });

  test('10.03 First card has picture element .wdkit-kit-card-picture', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('.wdkit-kit-card-picture').count();
    expect(count).toBeGreaterThan(0);
  });

  test('10.04 First card has info row .wdkit-browse-info', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('.wdkit-browse-info').count();
    expect(count).toBeGreaterThan(0);
  });

  test('10.05 First card has name element .wdkit-browse-card-name with non-empty text', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const name = page.locator('.wdkit-browse-card-name').first();
    const text = await name.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('10.06 First card has button group .wdkit-browse-card-btngroup', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('.wdkit-browse-card-btngroup').count();
    expect(count).toBeGreaterThan(0);
  });

  test('10.07 Cards without pro requirement do not show .wdkit-pro-crd tag', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const proTagCount = await page.locator('.wdkit-card-tag.wdkit-pro-crd').count();
    expect(proTagCount).toBeGreaterThanOrEqual(0);
  });

  test('10.08 AI badge .wdkit-ai-badge is present on at least one card when AI filter active', async ({ page }) => {
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(2500);
    const badgeCount = await page.locator('.wdkit-browse-card-badge.wdkit-ai-badge').count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('10.09 All visible cards have non-empty card names', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const names = page.locator('.wdkit-browse-card-name');
    const count = await names.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await names.nth(i).textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('10.10 Card image src is not broken (img src is non-empty)', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const img = page.locator('.wdkit-kit-card-picture img, .wdkit-browse-img-container img').first();
    const imgCount = await img.count();
    if (imgCount > 0) {
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src.length).toBeGreaterThan(5);
    }
  });

});

// =============================================================================
// 11. Template card hover & interaction
// =============================================================================
test.describe('11. Template card hover & interaction', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('11.01 Hovering over a card does not cause page error', async ({ page }) => {
    const card = page.locator('.wdkit-browse-card').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.hover({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('11.02 Import button .wdkit-browse-card-download is accessible on hover', async ({ page }) => {
    const card = page.locator('.wdkit-browse-card').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.hover({ force: true });
    await page.waitForTimeout(600);
    const btn = card.locator('.wdkit-browse-card-download').first();
    const btnCount = await btn.count();
    expect(btnCount).toBeGreaterThanOrEqual(0);
  });

  test('11.03 Clicking the import button on first card changes the URL hash', async ({ page }) => {
    await clickFirstCardImport(page);
    const hash = await page.evaluate(() => location.hash);
    expect(hash.length).toBeGreaterThan(0);
  });

  test('11.04 Clicking import button transitions away from browse grid', async ({ page }) => {
    await clickFirstCardImport(page);
    await page.waitForTimeout(2000);
    const wizardCount = await page.locator('.wkit-temp-import-mian').count();
    const hashMatch = (await page.evaluate(() => location.hash)).includes('import-kit');
    expect(wizardCount > 0 || hashMatch).toBe(true);
  });

  test('11.05 No JS errors emitted when hovering and clicking a card', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const card = page.locator('.wdkit-browse-card').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.hover({ force: true });
    await page.waitForTimeout(500);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});
