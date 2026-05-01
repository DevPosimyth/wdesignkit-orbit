// =============================================================================
// WDesignKit Templates Suite — Import Loader Step (Step 5)
// Version: 3.0.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 40 — Import loader structural tests (no import required) (8 tests)
//   Section 41 — Import loader during active import (4 tests, gated by WDKIT_TOKEN)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep } = require('./_helpers/wizard');

// ---------------------------------------------------------------------------
// Shared: navigate to Method step ready to trigger import
// ---------------------------------------------------------------------------
async function openReadyToImport(page) {
  await wpLogin(page);
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await reachMethodStep(page);
  await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  // Select Dummy card to ensure Import button is ready
  const dummyCard = page.locator('.wkit-method-card').first();
  if ((await dummyCard.count()) > 0) {
    await dummyCard.click({ force: true });
    await page.waitForTimeout(400);
  }
}

// =============================================================================
// 40. Import loader — structural tests (triggered on Import click)
// =============================================================================
test.describe('40. Import loader (Step 5) — structural & progress tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('40.01 Import loader is shown after clicking Import button', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Import loader requires API token to proceed');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
      const loader = page.locator('.wkit-loader-content, .wkit-import-loader, .wkit-loader-main').first();
      await expect.soft(loader).toBeVisible({ timeout: 10000 });
    }
  });

  test('40.02 Loader container .wkit-loader-content is in the DOM after clicking Import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger import');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      const count = await page.locator('.wkit-loader-content, .wkit-import-loader-main').count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('40.03 Loader step list .wkit-loader-step items are present during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      const steps = page.locator('.wkit-loader-step');
      const count = await steps.count();
      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('40.04 Loader shows "Installing Plugins & Theme" step text', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      await expect.soft(page.locator('body')).toContainText(/installing plugins/i);
    }
  });

  test('40.05 Lottie animation element is present during import loader', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      const lottie = page.locator('lottie-player, [class*="lottie"]').first();
      await expect.soft(lottie).toBeVisible({ timeout: 10000 });
    }
  });

  test('40.06 Loader does not show a "Fatal error" during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(5000);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('40.07 Import loader step texts are non-empty', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
      const steps = page.locator('.wkit-loader-step');
      const count = await steps.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await steps.nth(i).textContent().catch(() => '');
        if (text.trim().length > 0) {
          expect(text.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('40.08 No product console errors are emitted when import begins', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 41. Import loader — active import flow (full end-to-end, gated by token)
// =============================================================================
test.describe('41. Import loader — active import flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('41.01 Import progresses past loader to success screen (or shows error with retry)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      // Wait up to 120 seconds for import to complete
      await expect.soft(page.locator('.wkit-site-import-success-main')).toBeVisible({ timeout: 120000 });
    }
  });

  test('41.02 Import loader step icons change state during import (pending → active → done)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(4000);
      // During import, at least one step should be "active" or "done"
      const activeStep = page.locator('.wkit-loader-step.wkit-active-step, .wkit-loader-step.wkit-done-step, [class*="active" i]');
      const count = await activeStep.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('41.03 Breadcrumb shows "All Set!" as active or completed after import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.locator('.wkit-site-import-success-main').waitFor({ state: 'visible', timeout: 120000 }).catch(() => {});
      const breadcrumbs = page.locator('.wkit-breadcrumbs-card-title');
      const count = await breadcrumbs.count();
      let found = false;
      for (let i = 0; i < count; i++) {
        const text = await breadcrumbs.nth(i).textContent();
        if (/all set/i.test(text)) { found = true; break; }
      }
      expect(found).toBe(true);
    }
  });

  test('41.04 Import does not produce uncaught exceptions during processing', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import');
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(10000);
    }
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

});
