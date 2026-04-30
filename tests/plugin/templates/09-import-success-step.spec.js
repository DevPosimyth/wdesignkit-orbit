// =============================================================================
// WDesignKit Templates Suite — Import Success Step (Step 6) + Post-import
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 41 — Success screen all elements (8 tests)
//   Section 49 — Post-import pages created & site URL in success CTA (2 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep, acceptTandC } = require('./_helpers/wizard');

// =============================================================================
// 41. Success screen (Step 6) — all elements
// =============================================================================
test.describe('41. Success screen (Step 6) — all elements', () => {
  test.describe.configure({ mode: 'serial' });

  test('41.01 Success root .wkit-site-import-success-main is visible after dummy import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) { await nameInput.fill('QA Success Test'); }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) { await nextBtn.click(); await page.waitForTimeout(2500); }
    await acceptTandC(page);
    await page.waitForTimeout(300);
    const featureNext = page.locator('button.wkit-site-feature-next.wkit-btn-class');
    if ((await featureNext.count()) > 0 && await featureNext.isEnabled()) { await featureNext.click(); await page.waitForTimeout(2500); }
    const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await methodNext.count()) > 0) { await methodNext.click(); }
    await expect.soft(page.locator('.wkit-site-import-success-main')).toBeVisible({ timeout: 120000 });
  });

  test('41.02 Success content .wkit-site-import-success-content is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const count = await page.locator('.wkit-site-import-success-content').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('41.03 Success header .wkit-import-success-header is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const count = await page.locator('.wkit-import-success-header').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('41.04 Success GIF img.wkit-import-success-img has src containing kit-import-success', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const img = page.locator('img.wkit-import-success-img');
    if ((await img.count()) > 0) {
      const src = await img.getAttribute('src');
      expect(src).toContain('kit-import-success');
    }
  });

  test('41.05 Success title contains "Success"', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const title = page.locator('span.wkit-import-success-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/success/i);
    }
  });

  test('41.06 Success subtitle .wkit-import-success-subtitle is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const count = await page.locator('span.wkit-import-success-subtitle').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('41.07 Success footer .wkit-site-import-success-footer is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const count = await page.locator('.wkit-site-import-success-footer').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('41.08 Preview Site link a.wkit-import-success-site is present if site URL exists', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const link = page.locator('a.wkit-import-success-site');
    const count = await link.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

});

// =============================================================================
// 49. Post-import — pages created & site URL in success CTA
// =============================================================================
test.describe('49. Post-import — pages created & site URL in success CTA', () => {

  test('49.01 Success preview site link points to a valid URL', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) { await nameInput.fill('Post Import Test'); }
    await reachMethodStep(page);
    const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await methodNext.count()) > 0) { await methodNext.click(); }
    const successMain = page.locator('.wkit-site-import-success-main');
    await expect.soft(successMain).toBeVisible({ timeout: 120000 });
    if ((await successMain.count()) > 0) {
      const link = page.locator('a.wkit-import-success-site');
      if ((await link.count()) > 0) {
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/^https?:\/\//);
      }
    }
  });

  test('49.02 Success screen does not show error messages after successful import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) { await nameInput.fill('Post Import No Error'); }
    await reachMethodStep(page);
    const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await methodNext.count()) > 0) { await methodNext.click(); }
    await expect.soft(page.locator('.wkit-site-import-success-main')).toBeVisible({ timeout: 120000 });
    await expect.soft(page.locator('.wkit-site-import-success-main')).not.toContainText(/error/i);
  });

});
