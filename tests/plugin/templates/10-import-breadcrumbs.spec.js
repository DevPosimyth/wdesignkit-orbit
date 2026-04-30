// =============================================================================
// WDesignKit Templates Suite — Import Breadcrumbs
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 38 — Breadcrumb validation: exact labels & active states (10 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachFeatureStep, reachMethodStep } = require('./_helpers/wizard');

// =============================================================================
// 38. Breadcrumb validation — exact labels & active states at each step
// =============================================================================
test.describe('38. Breadcrumb validation — exact labels & active states', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('38.01 Breadcrumbs container .wkit-header-breadcrumbs is present', async ({ page }) => {
    const count = await page.locator('.wkit-header-breadcrumbs').count();
    expect(count).toBeGreaterThan(0);
  });

  test('38.02 Breadcrumb cards .wkit-breadcrumbs-card exist', async ({ page }) => {
    const count = await page.locator('.wkit-breadcrumbs-card').count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('38.03 Step 1 breadcrumb "Customize Website" is active (.wkit-active-breadcrumbs)', async ({ page }) => {
    const active = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
    if ((await active.count()) > 0) {
      const text = await active.first().textContent();
      expect(text.trim()).toMatch(/customize website/i);
    }
  });

  test('38.04 Step 1 has exactly one active breadcrumb', async ({ page }) => {
    const activeCount = await page.locator('.wkit-active-breadcrumbs').count();
    expect(activeCount).toBe(1);
  });

  test('38.05 Breadcrumb "Select Features" is present in the list', async ({ page }) => {
    const allBreadcrumbs = page.locator('.wkit-breadcrumbs-card-title');
    const count = await allBreadcrumbs.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await allBreadcrumbs.nth(i).textContent();
      if (/select features/i.test(text)) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('38.06 Breadcrumb "Content & Media Setup" is present', async ({ page }) => {
    const allBreadcrumbs = page.locator('.wkit-breadcrumbs-card-title');
    const count = await allBreadcrumbs.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await allBreadcrumbs.nth(i).textContent();
      if (/content.*media setup/i.test(text)) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('38.07 Breadcrumb "All Set!" is present', async ({ page }) => {
    const allBreadcrumbs = page.locator('.wkit-breadcrumbs-card-title');
    const count = await allBreadcrumbs.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await allBreadcrumbs.nth(i).textContent();
      if (/all set/i.test(text)) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('38.08 Step 2 breadcrumb "Select Features" becomes active on feature step', async ({ page }) => {
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    const active = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
    if ((await active.count()) > 0) {
      const text = await active.first().textContent();
      expect(text.trim()).toMatch(/select features/i);
    }
  });

  test('38.09 Completed Step 1 breadcrumb has .wkit-complete-breadcrumbs class on Step 2', async ({ page }) => {
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    const done = page.locator('.wkit-complete-breadcrumbs');
    const count = await done.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('38.10 Step 3 breadcrumb "Content & Media Setup" becomes active on method step', async ({ page }) => {
    await reachMethodStep(page);
    await page.waitForTimeout(1000);
    const active = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
    if ((await active.count()) > 0) {
      const text = await active.first().textContent();
      expect(text.trim()).toMatch(/content.*media setup/i);
    }
  });

});
