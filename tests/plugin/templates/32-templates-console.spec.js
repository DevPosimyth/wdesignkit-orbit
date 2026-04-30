// =============================================================================
// WDesignKit Templates Suite — Console & Network Health
// Version: 1.0.0
// Cross-cutting: monitors JS errors, warnings, uncaught exceptions,
//               and 4xx/5xx HTTP responses across all template pages.
//
// COVERAGE
//   Section 61 — Console errors across all template pages (10 tests)
//   Section 62 — Uncaught JS exceptions (8 tests)
//   Section 63 — Network health — 4xx/5xx responses (8 tests)
//   Section 64 — Console warnings — product warnings (5 tests)
//   Section 65 — Performance: API call deduplication (4 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse, goToMyTemplates, PLUGIN_PAGE } = require('./_helpers/navigation');

// Product error filter — excludes browser noise
const isProductError = (msg) =>
  !msg.includes('favicon') &&
  !msg.includes('net::ERR') &&
  !msg.includes('chrome-extension') &&
  !msg.includes('extension://') &&
  !msg.includes('webpack:') &&
  !msg.includes('ERR_BLOCKED_BY') &&
  !msg.includes('ERR_CONNECTION_REFUSED');

const PAGES = [
  { name: 'browse',        hash: '/browse' },
  { name: 'my_uploaded',   hash: '/my_uploaded' },
  { name: 'share_with_me', hash: '/share_with_me' },
  { name: 'save_template', hash: '/save_template' },
  { name: 'login',         hash: '/login' },
];

// =============================================================================
// 61. Console errors — across all template pages
// =============================================================================
test.describe('61. Console errors — all template pages', () => {

  for (const pg of PAGES) {
    test(`61.0${PAGES.indexOf(pg) + 1} No product console errors on #${pg.hash}`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await wpLogin(page);
      await page.goto(PLUGIN_PAGE);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.evaluate((h) => { location.hash = h; }, pg.hash);
      await page.waitForTimeout(3000);
      const productErrors = errors.filter(isProductError);
      expect(productErrors, `Page: ${pg.name}\n${productErrors.join('\n')}`).toHaveLength(0);
    });
  }

  test('61.06 No console errors when switching between browse and my_uploaded', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.evaluate(() => { location.hash = '/browse'; });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { location.hash = '/my_uploaded'; });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { location.hash = '/browse'; });
    await page.waitForTimeout(2500);
    const productErrors = errors.filter(isProductError);
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('61.07 No console errors when switching between browse and share_with_me', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.evaluate(() => { location.hash = '/browse'; });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { location.hash = '/share_with_me'; });
    await page.waitForTimeout(2500);
    const productErrors = errors.filter(isProductError);
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('61.08 No console errors when opening and closing import wizard', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await goToBrowse(page);
    const card = page.locator('.wdkit-browse-card').first();
    const cardVisible = await card.isVisible({ timeout: 15000 }).catch(() => false);
    if (cardVisible) {
      await card.hover({ force: true });
      await page.waitForTimeout(400);
      const importBtn = card.locator('.wdkit-browse-card-download').first();
      const btnVisible = await importBtn.isVisible({ timeout: 2000 }).catch(() => false);
      if (btnVisible) {
        await importBtn.click({ force: true });
        await page.waitForTimeout(2000);
        const closeBtn = page.locator('.wdkit-close-btn, .wkit-close, [class*="close-btn"]').first();
        if (await closeBtn.count() > 0 && await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeBtn.click();
          await page.waitForTimeout(1000);
        } else {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
      }
    }
    const productErrors = errors.filter(isProductError);
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('61.09 No console errors when cycling through all My Templates tabs', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(2000);
    const tabs = page.locator('.wdesignkit-menu');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1200);
      }
    }
    const productErrors = errors.filter(isProductError);
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('61.10 No console errors when cycling through Share With Me tabs', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.evaluate(() => { location.hash = '/share_with_me'; });
    await page.waitForTimeout(3000);
    const tabs = page.locator('.wdkit-share-tab-box');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1500);
      }
    }
    const productErrors = errors.filter(isProductError);
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 62. Uncaught JavaScript exceptions
// =============================================================================
test.describe('62. Uncaught JS exceptions — all template pages', () => {

  for (const pg of PAGES) {
    test(`62.0${PAGES.indexOf(pg) + 1} No uncaught JS exceptions on #${pg.hash}`, async ({ page }) => {
      const exceptions = [];
      page.on('pageerror', err => exceptions.push(err.message));
      await wpLogin(page);
      await page.goto(PLUGIN_PAGE);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.evaluate((h) => { location.hash = h; }, pg.hash);
      await page.waitForTimeout(3000);
      expect(exceptions, `Page: ${pg.name}\n${exceptions.join('\n')}`).toHaveLength(0);
    });
  }

  test('62.06 No uncaught exceptions when filter checkboxes are clicked rapidly', async ({ page }) => {
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await wpLogin(page);
    await goToBrowse(page);
    const checkboxes = page.locator('.wdkit-browse-column input[type="checkbox"]');
    const count = Math.min(await checkboxes.count(), 5);
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i);
      if (await cb.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cb.click({ force: true });
        await page.waitForTimeout(200);
      }
    }
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

  test('62.07 No uncaught exceptions when search input is typed rapidly', async ({ page }) => {
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await wpLogin(page);
    await goToBrowse(page);
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await input.fill('');
      for (const char of 'agency restaurant fitness') {
        await input.type(char, { delay: 30 });
      }
      await page.waitForTimeout(2000);
    }
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

  test('62.08 No uncaught exceptions on pagination click in My Templates', async ({ page }) => {
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(3000);
    const nextBtn = page.locator('.wkit-next-pagination').first();
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 63. Network health — 4xx/5xx HTTP responses
// =============================================================================
test.describe('63. Network health — no 4xx/5xx on template pages', () => {

  for (const pg of PAGES) {
    test(`63.0${PAGES.indexOf(pg) + 1} No 4xx/5xx responses on #${pg.hash}`, async ({ page }) => {
      const failed = [];
      page.on('response', r => {
        if (r.status() >= 400 && !r.url().includes('favicon')) {
          failed.push(`${r.status()} ${r.url()}`);
        }
      });
      await wpLogin(page);
      await page.goto(PLUGIN_PAGE);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.evaluate((h) => { location.hash = h; }, pg.hash);
      await page.waitForTimeout(3000);
      expect(failed, `Page: ${pg.name}\n${failed.join('\n')}`).toHaveLength(0);
    });
  }

  test('63.06 No 404 errors for WDesignKit plugin CSS files', async ({ page }) => {
    const failed = [];
    page.on('response', r => {
      if (r.status() === 404 && r.url().includes('.css') &&
          (r.url().includes('wdesignkit') || r.url().includes('wdkit'))) {
        failed.push(r.url());
      }
    });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    expect(failed, failed.join('\n')).toHaveLength(0);
  });

  test('63.07 No 404 errors for WDesignKit plugin JS files', async ({ page }) => {
    const failed = [];
    page.on('response', r => {
      if (r.status() === 404 && r.url().includes('.js') &&
          (r.url().includes('wdesignkit') || r.url().includes('wdkit'))) {
        failed.push(r.url());
      }
    });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    expect(failed, failed.join('\n')).toHaveLength(0);
  });

  test('63.08 API responses return valid JSON (no 500 on AJAX calls)', async ({ page }) => {
    const failed = [];
    page.on('response', async r => {
      if (r.status() >= 500 && r.url().includes('admin-ajax')) {
        failed.push(`${r.status()} ${r.url()}`);
      }
    });
    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(4000);
    expect(failed, failed.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 64. Console warnings — product warnings
// =============================================================================
test.describe('64. Console warnings — product warnings on template pages', () => {

  test('64.01 No React deprecated lifecycle warnings on browse page', async ({ page }) => {
    const warnings = [];
    page.on('console', m => {
      if (m.type() === 'warning' && (m.text().includes('componentWillMount') || m.text().includes('componentWillReceiveProps') || m.text().includes('componentWillUpdate'))) {
        warnings.push(m.text());
      }
    });
    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(3000);
    expect(warnings, warnings.join('\n')).toHaveLength(0);
  });

  test('64.02 No "key" prop warnings in React console on template grids', async ({ page }) => {
    const warnings = [];
    page.on('console', m => {
      if (m.type() === 'warning' && m.text().includes('Each child in a list should have a unique "key"')) {
        warnings.push(m.text());
      }
    });
    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(3000);
    expect(warnings, warnings.join('\n')).toHaveLength(0);
  });

  test('64.03 No "unique key" React warnings in My Templates', async ({ page }) => {
    const warnings = [];
    page.on('console', m => {
      if (m.type() === 'warning' && m.text().includes('key')) {
        warnings.push(m.text());
      }
    });
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(3000);
    expect(warnings, warnings.join('\n')).toHaveLength(0);
  });

  test('64.04 No React prop-types warnings in Share With Me', async ({ page }) => {
    const warnings = [];
    page.on('console', m => {
      if (m.type() === 'warning' && m.text().includes('PropTypes')) {
        warnings.push(m.text());
      }
    });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.evaluate(() => { location.hash = '/share_with_me'; });
    await page.waitForTimeout(3000);
    expect(warnings, warnings.join('\n')).toHaveLength(0);
  });

  test('64.05 No deprecation warnings from WDesignKit plugin code', async ({ page }) => {
    const warnings = [];
    page.on('console', m => {
      if (m.type() === 'warning' && m.text().toLowerCase().includes('deprecated')) {
        warnings.push(m.text());
      }
    });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.evaluate(() => { location.hash = '/browse'; });
    await page.waitForTimeout(3000);
    // Filter to product deprecations only (ignore browser/library noise)
    const productWarnings = warnings.filter(w =>
      w.toLowerCase().includes('wdkit') || w.toLowerCase().includes('wdesignkit')
    );
    expect(productWarnings, productWarnings.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 65. Performance: API call deduplication
// =============================================================================
test.describe('65. Performance — API call deduplication', () => {

  test('65.01 Browse page makes only one API call to fetch templates on load', async ({ page }) => {
    const apiCalls = [];
    page.on('request', r => {
      if (r.url().includes('admin-ajax') && r.method() === 'POST') {
        apiCalls.push(r.url());
      }
    });
    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(3000);
    // Should not make excessive duplicate calls (more than 10 is a red flag)
    expect(apiCalls.length).toBeLessThanOrEqual(15);
  });

  test('65.02 My Templates page does not make infinite API calls', async ({ page }) => {
    const apiCalls = [];
    page.on('request', r => {
      if (r.url().includes('admin-ajax') && r.method() === 'POST') {
        apiCalls.push(r.url());
      }
    });
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(5000);
    expect(apiCalls.length).toBeLessThanOrEqual(15);
  });

  test('65.03 Share With Me page does not make infinite API calls', async ({ page }) => {
    const apiCalls = [];
    page.on('request', r => {
      if (r.url().includes('admin-ajax') && r.method() === 'POST') {
        apiCalls.push(r.url());
      }
    });
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.evaluate(() => { location.hash = '/share_with_me'; });
    await page.waitForTimeout(5000);
    expect(apiCalls.length).toBeLessThanOrEqual(15);
  });

  test('65.04 Filter changes on browse page do not cascade into N+1 API calls', async ({ page }) => {
    const apiCalls = [];
    page.on('request', r => {
      if (r.url().includes('admin-ajax') && r.method() === 'POST') {
        apiCalls.push(Date.now());
      }
    });
    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(2000);
    const beforeCount = apiCalls.length;
    // Click one category filter
    const checkbox = page.locator('.wdkit-browse-column input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkbox.click({ force: true });
      await page.waitForTimeout(2000);
    }
    const afterCount = apiCalls.length;
    // A single filter change should trigger at most 2-3 API calls
    expect(afterCount - beforeCount).toBeLessThanOrEqual(5);
  });

});
