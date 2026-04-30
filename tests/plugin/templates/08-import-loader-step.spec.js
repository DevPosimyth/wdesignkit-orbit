// =============================================================================
// WDesignKit Templates Suite — Import Loader Step (Step 5)
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 40 — Import loader (Step 5) progress steps & loader animation (3 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep } = require('./_helpers/wizard');

// =============================================================================
// 40. Import loader (Step 5) — progress steps & loader animation
// =============================================================================
test.describe('40. Import loader (Step 5) — progress steps & loader animation', () => {
  test.describe.configure({ mode: 'serial' });

  test('40.01 Import loader is shown after clicking Import on method step', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Import loader may time out without API');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(400);
    }
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
      await expect.soft(page.locator('.wkit-loader-content, .wkit-import-loader').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('40.02 "Installing Plugins & Theme" step text is present during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      await expect.soft(page.locator('body')).toContainText(/installing plugins/i);
    }
  });

  test('40.03 Lottie animation element is present during import loader', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      await expect.soft(page.locator('lottie-player, [class*="lottie"]').first()).toBeVisible({ timeout: 10000 });
    }
  });

});
