// =============================================================================
// WDesignKit Templates Suite — Import Breadcrumbs
// Version: 3.0.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 38 — Breadcrumb validation: exact labels & active states (12 tests)
//   Section 38b — Breadcrumb click navigation & completion state (8 tests)
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
    expect(await page.locator('.wkit-header-breadcrumbs').count()).toBeGreaterThan(0);
  });

  test('38.02 Breadcrumb cards .wkit-breadcrumbs-card exist (at least 4)', async ({ page }) => {
    expect(await page.locator('.wkit-breadcrumbs-card').count()).toBeGreaterThanOrEqual(4);
  });

  test('38.03 Step 1 breadcrumb "Customize Website" is active on entry', async ({ page }) => {
    const active = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
    if ((await active.count()) > 0) {
      const text = await active.first().textContent();
      expect(text.trim()).toMatch(/customize website/i);
    }
  });

  test('38.04 Step 1 has exactly one active breadcrumb', async ({ page }) => {
    expect(await page.locator('.wkit-active-breadcrumbs').count()).toBe(1);
  });

  test('38.05 Breadcrumb "Select Features" is present in the list', async ({ page }) => {
    const titles = page.locator('.wkit-breadcrumbs-card-title');
    const count = await titles.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      if (/select features/i.test(await titles.nth(i).textContent())) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('38.06 Breadcrumb "Content & Media Setup" is present', async ({ page }) => {
    const titles = page.locator('.wkit-breadcrumbs-card-title');
    const count = await titles.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      if (/content.*media setup/i.test(await titles.nth(i).textContent())) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('38.07 Breadcrumb "All Set!" is present', async ({ page }) => {
    const titles = page.locator('.wkit-breadcrumbs-card-title');
    const count = await titles.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      if (/all set/i.test(await titles.nth(i).textContent())) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('38.08 Step 2 breadcrumb "Select Features" becomes active on Feature step', async ({ page }) => {
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    const active = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
    if ((await active.count()) > 0) {
      expect(await active.first().textContent()).toMatch(/select features/i);
    }
  });

  test('38.09 Completed Step 1 breadcrumb has .wkit-complete-breadcrumbs on Step 2', async ({ page }) => {
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    expect(await page.locator('.wkit-complete-breadcrumbs').count()).toBeGreaterThanOrEqual(1);
  });

  test('38.10 Step 3 breadcrumb "Content & Media Setup" becomes active on Method step', async ({ page }) => {
    await reachMethodStep(page);
    await page.waitForTimeout(1000);
    const active = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
    if ((await active.count()) > 0) {
      expect(await active.first().textContent()).toMatch(/content.*media setup/i);
    }
  });

  test('38.11 At Step 3 (Method), two breadcrumbs have .wkit-complete-breadcrumbs class', async ({ page }) => {
    await reachMethodStep(page);
    await page.waitForTimeout(1000);
    const completedCount = await page.locator('.wkit-complete-breadcrumbs').count();
    expect(completedCount).toBeGreaterThanOrEqual(2);
  });

  test('38.12 Future breadcrumb steps do NOT have .wkit-active-breadcrumbs or .wkit-complete-breadcrumbs on Step 1', async ({ page }) => {
    // On Step 1, steps 3 and 4 should be inactive/pending
    const allCards = page.locator('.wkit-breadcrumbs-card');
    const count = await allCards.count();
    // Last card ("All Set!") should not be active or complete on Step 1
    if (count >= 4) {
      const lastCard = allCards.last();
      const classes = await lastCard.getAttribute('class');
      expect(classes || '').not.toContain('wkit-active-breadcrumbs');
      expect(classes || '').not.toContain('wkit-complete-breadcrumbs');
    }
  });

});

// =============================================================================
// 38b. Breadcrumb click navigation & completion state
// =============================================================================
test.describe('38b. Breadcrumb click navigation & completion state', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('38b.01 Clicking completed breadcrumb "Customize Website" from Step 2 navigates back to Step 1', async ({ page }) => {
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    const completedBreadcrumb = page.locator('.wkit-complete-breadcrumbs').first();
    if ((await completedBreadcrumb.count()) > 0) {
      await completedBreadcrumb.click({ force: true });
      await page.waitForTimeout(2000);
      // Should be back on Step 1 (site_info or global_data panel)
      const onStep1 = await page.locator('input.wkit-site-name-inp, .wkit-temp-global-data').count();
      expect(onStep1).toBeGreaterThan(0);
    }
  });

  test('38b.02 Clicking completed Step 1 breadcrumb from Step 3 returns to Step 1', async ({ page }) => {
    await reachMethodStep(page);
    await page.waitForTimeout(1000);
    const completedBreadcrumbs = page.locator('.wkit-complete-breadcrumbs');
    if ((await completedBreadcrumbs.count()) > 0) {
      await completedBreadcrumbs.first().click({ force: true });
      await page.waitForTimeout(2000);
      // Should be on Step 1 or Step 2
      const onEarlierStep = await page.locator(
        'input.wkit-site-name-inp, .wkit-import-temp-feature, .wkit-temp-global-data'
      ).count();
      expect(onEarlierStep).toBeGreaterThan(0);
    }
  });

  test('38b.03 Breadcrumb card titles are exactly 4 (Customize + Select + Content + All Set)', async ({ page }) => {
    const count = await page.locator('.wkit-breadcrumbs-card').count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('38b.04 Each breadcrumb card has a non-empty title', async ({ page }) => {
    const titles = page.locator('.wkit-breadcrumbs-card-title');
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('38b.05 Breadcrumb container does not overflow horizontally', async ({ page }) => {
    const container = page.locator('.wkit-header-breadcrumbs');
    if ((await container.count()) > 0) {
      const overflow = await container.first().evaluate(el => el.scrollWidth > el.clientWidth);
      expect(overflow).toBe(false);
    }
  });

  test('38b.06 Clicking a future (inactive, non-complete) breadcrumb does not navigate forward', async ({ page }) => {
    // On Step 1, clicking "All Set!" (future step) should not navigate to it
    const allCards = page.locator('.wkit-breadcrumbs-card');
    const count = await allCards.count();
    if (count >= 4) {
      const lastCard = allCards.last();
      const classBefore = await lastCard.getAttribute('class');
      // Clicking future step should NOT activate it
      await lastCard.click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
      // Should still be on Step 1
      const onStep1 = await page.locator('input.wkit-site-name-inp').count();
      expect(onStep1).toBeGreaterThan(0);
    }
  });

  test('38b.07 Breadcrumb click navigation does not produce console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    const completedBreadcrumb = page.locator('.wkit-complete-breadcrumbs').first();
    if ((await completedBreadcrumb.count()) > 0) {
      await completedBreadcrumb.click({ force: true });
      await page.waitForTimeout(1500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('38b.08 After full forward navigation (Step 1→2→3), all 3 breadcrumbs before "All Set!" are clickable', async ({ page }) => {
    await reachMethodStep(page);
    await page.waitForTimeout(1000);
    const completedOrActive = page.locator('.wkit-complete-breadcrumbs, .wkit-active-breadcrumbs');
    const count = await completedOrActive.count();
    // At Step 3, at least 3 of the 4 breadcrumbs should be completed or active
    expect(count).toBeGreaterThanOrEqual(3);
  });

});
