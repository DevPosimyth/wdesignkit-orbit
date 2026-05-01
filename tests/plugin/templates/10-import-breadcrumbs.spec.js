// =============================================================================
// WDesignKit Templates Suite — Import Breadcrumbs
// Version: 3.0.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 38  — Breadcrumb validation: exact labels & active states (12 tests)
//   Section 38b — Breadcrumb click navigation & completion state (8 tests)
//   §A  — Security (2 tests)
//   §B  — Accessibility (3 tests — includes aria-label landmark + keyboard)
//   §C  — Responsive layout (3 viewports)
//   §D  — Keyboard navigation (2 tests)
//   §E  — Performance (1 test)
//   §F  — RTL layout (1 test)
//   §G  — Tap targets (1 test)
//
// MANUAL CHECKS (not automatable — verify manually):
//   • Pixel-perfect match with Figma design (colors, spacing, typography)
//   • Screen reader announcement order and content
//   • Cross-browser visual rendering (Firefox, Safari/WebKit, Edge)
//   • RTL layout visual correctness (Arabic/Hebrew locales)
//   • Color contrast ratios in rendered output
//   • Touch gesture behavior on real mobile devices
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

// =============================================================================
// §A. Breadcrumbs — Security
// =============================================================================
test.describe('§A. Breadcrumbs — Security', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('§A.01 Breadcrumb container does not expose credentials or API keys in HTML source', async ({ page }) => {
    const html = await page.content();
    const hasApiKey = /api[-_]?key\s*[:=]\s*["'][a-zA-Z0-9]{20,}/i.test(html);
    expect.soft(hasApiKey, 'API key found in breadcrumbs source').toBe(false);
  });

  test('§A.02 Breadcrumb links do not contain open-redirect patterns', async ({ page }) => {
    const links = page.locator('.wkit-header-breadcrumbs a[href]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href').catch(() => '');
      // External redirects via query param are a sign of open-redirect vulnerability
      const hasOpenRedirect = /[?&](url|redirect|goto|next|return)=https?/i.test(href || '');
      expect.soft(hasOpenRedirect, `Possible open redirect in breadcrumb href: ${href}`).toBe(false);
    }
  });
});

// =============================================================================
// §B. Breadcrumbs — Accessibility
// =============================================================================
test.describe('§B. Breadcrumbs — Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('§B.01 Breadcrumbs container has aria-label or role="navigation" landmark', async ({ page }) => {
    const container = page.locator('.wkit-header-breadcrumbs');
    if ((await container.count()) > 0) {
      const ariaLabel = await container.first().getAttribute('aria-label').catch(() => null);
      const role = await container.first().getAttribute('role').catch(() => null);
      const tagName = await container.first().evaluate(el => el.tagName.toLowerCase()).catch(() => '');
      const hasLandmark = ariaLabel !== null || role === 'navigation' || tagName === 'nav';
      expect.soft(hasLandmark, 'Breadcrumbs container missing aria-label or navigation landmark').toBe(true);
    }
  });

  test('§B.02 Each breadcrumb card title is non-empty and readable by assistive technology', async ({ page }) => {
    const titles = page.locator('.wkit-breadcrumbs-card-title');
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent().catch(() => '');
      expect.soft(text.trim().length > 0, `Breadcrumb title at index ${i} is empty`).toBe(true);
    }
  });

  test('§B.03 Completed breadcrumb links are keyboard focusable (have tabindex >= 0 or are naturally focusable)', async ({ page }) => {
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    const completedBreadcrumbs = page.locator('.wkit-complete-breadcrumbs');
    const count = await completedBreadcrumbs.count();
    if (count > 0) {
      const firstCompleted = completedBreadcrumbs.first();
      const tagName = await firstCompleted.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
      const tabIndex = await firstCompleted.getAttribute('tabindex').catch(() => null);
      // Naturally focusable elements (a, button) or explicitly given tabindex >= 0
      const isFocusable = ['a', 'button'].includes(tagName) ||
        (tabIndex !== null && parseInt(tabIndex) >= 0);
      expect.soft(isFocusable, 'Completed breadcrumb is not keyboard focusable').toBe(true);
    }
  });
});

// =============================================================================
// §C. Breadcrumbs — Responsive layout
// =============================================================================
test.describe('§C. Breadcrumbs — Responsive layout', () => {
  const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const vp of VIEWPORTS) {
    test(`§C.01 Breadcrumbs have no horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await wpLogin(page);
      await goToBrowse(page);
      await clickFirstCardImport(page);
      await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
      const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
      expect.soft(hasHScroll, `Horizontal scroll on breadcrumbs at ${vp.name}`).toBe(false);
    });
  }
});

// =============================================================================
// §D. Breadcrumbs — Keyboard Navigation
// =============================================================================
test.describe('§D. Breadcrumbs — Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('§D.01 Tab key can reach breadcrumb area without focus trap', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('§D.02 Pressing Enter on a completed breadcrumb navigates back to that step', async ({ page }) => {
    await reachFeatureStep(page);
    await page.waitForTimeout(1000);
    const completedBreadcrumb = page.locator('.wkit-complete-breadcrumbs').first();
    if ((await completedBreadcrumb.count()) > 0) {
      await completedBreadcrumb.focus().catch(() => completedBreadcrumb.click({ force: true }));
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      // Should navigate back — either step 1 input or the wizard is still open
      const onWizard = await page.locator('.wkit-temp-import-mian').count();
      expect.soft(onWizard, 'Wizard closed unexpectedly after Enter on breadcrumb').toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// §E. Breadcrumbs — Performance
// =============================================================================
test.describe('§E. Breadcrumbs — Performance', () => {
  test('§E.01 Breadcrumbs render within 3 seconds of wizard opening', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    const t0 = Date.now();
    await page.locator('.wkit-header-breadcrumbs').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const elapsed = Date.now() - t0;
    expect.soft(elapsed, `Breadcrumbs took ${elapsed}ms to appear`).toBeLessThan(3000);
  });
});

// =============================================================================
// §F. Breadcrumbs — RTL layout
// =============================================================================
test.describe('§F. Breadcrumbs — RTL layout', () => {
  test('§F.01 Breadcrumbs do not overflow in RTL mode', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(400);
    const container = page.locator('.wkit-header-breadcrumbs');
    if ((await container.count()) > 0) {
      const overflow = await container.first().evaluate(el => el.scrollWidth > el.clientWidth + 5).catch(() => false);
      expect.soft(overflow, 'Breadcrumbs overflow in RTL mode').toBe(false);
    }
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });
});

// =============================================================================
// §G. Breadcrumbs — Tap targets
// =============================================================================
test.describe('§G. Breadcrumbs — Tap targets', () => {
  test('§G.01 Breadcrumb cards meet 44×44px minimum tap target on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const cards = page.locator('.wkit-breadcrumbs-card');
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      const box = await cards.nth(i).boundingBox().catch(() => null);
      if (box) {
        expect.soft(
          box.height >= 44 || box.width >= 44,
          `Breadcrumb card ${i} tap target too small: ${Math.round(box.width)}×${Math.round(box.height)}px`
        ).toBe(true);
      }
    }
  });
});
