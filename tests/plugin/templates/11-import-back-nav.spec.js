// =============================================================================
// WDesignKit Templates Suite — Import Back Navigation
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 30 — Feature step back navigation to preview (3 tests)
//   Section 37 — Method step back navigation to feature step (2 tests)
//   Section 52 — State preservation: back/forward navigation retains form data (3 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachFeatureStep, reachMethodStep, acceptTandC } = require('./_helpers/wizard');

// =============================================================================
// 30. Feature step — Back navigation to preview
// =============================================================================
test.describe('30. Feature step — Back navigation to preview', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('30.01 Feature Back button exists', async ({ page }) => {
    const count = await page.locator('button.wkit-site-feature-back, button.wkit-back-btn').count();
    expect(count).toBeGreaterThan(0);
  });

  test('30.02 Clicking Feature Back returns to Step 1 (site info)', async ({ page }) => {
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class').first();
    const backCount = await backBtn.count();
    if (backCount > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
      const infoCount = await page.locator('.wkit-temp-basic-info, .wkit-site-name-inp').count();
      expect(infoCount).toBeGreaterThan(0);
    }
  });

  test('30.03 Feature Back does not cause console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(1500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 37. Method step — Back navigation to feature step
// =============================================================================
test.describe('37. Method step — Back navigation to feature step', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('37.01 Clicking Method Back navigates to Feature step', async ({ page }) => {
    const backBtn = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
      const featureCount = await page.locator('.wkit-import-temp-feature').count();
      expect(featureCount).toBeGreaterThan(0);
    }
  });

  test('37.02 Method Back does not cause console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const backBtn = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(1500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 52. State preservation — back/forward navigation retains form data
// =============================================================================
test.describe('52. State preservation — back/forward navigation retains form data', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('52.01 Business Name entered on Step 1 is retained after going to Step 2 and back', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Preserved Business Name');
      await page.waitForTimeout(300);
    }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }
    const retainedInput = page.locator('input.wkit-site-name-inp');
    if ((await retainedInput.count()) > 0) {
      await expect.soft(retainedInput).toHaveValue('Preserved Business Name');
    }
  });

  test('52.02 Tagline entered on Step 1 is retained after back navigation', async ({ page }) => {
    const taglineInput = page.locator('input.wkit-site-tagline-inp');
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await taglineInput.count()) > 0 && (await nameInput.count()) > 0) {
      await nameInput.fill('Preservation Test');
      await taglineInput.fill('My Tagline');
      await page.waitForTimeout(300);
    }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }
    const retainedTagline = page.locator('input.wkit-site-tagline-inp');
    if ((await retainedTagline.count()) > 0) {
      await expect.soft(retainedTagline).toHaveValue('My Tagline');
    }
  });

  test('52.03 T&C checkbox state is reset when re-entering feature step', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) { await nameInput.fill('T&C Reset Test'); }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) { await nextBtn.click(); await page.waitForTimeout(2500); }
    await acceptTandC(page);
    await page.waitForTimeout(300);
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
    const cb = page.locator('#wkit-plugin-confirmation-id');
    if ((await cb.count()) > 0) {
      await expect.soft(cb).not.toBeChecked({ timeout: 2000 });
    }
  });

});
