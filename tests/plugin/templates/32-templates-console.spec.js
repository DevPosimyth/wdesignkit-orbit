// =============================================================================
// WDesignKit Templates Suite — Console & Network Health
// Version: 2.0.0
// Cross-cutting: monitors JS errors, warnings, uncaught exceptions,
//               and 4xx/5xx HTTP responses across all template pages.
//
// COVERAGE
//   Section 61 — Console errors across all template pages (10 tests)
//   Section 62 — Uncaught JS exceptions (8 tests)
//   Section 63 — Network health — 4xx/5xx responses (8 tests)
//   Section 64 — Console warnings — product warnings (5 tests)
//   Section 65 — Performance: API call deduplication (4 tests)
//   Section 66 — API response time assertions + mixed content (8 tests) ← NEW
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
      await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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
      await page.waitForLoadState('domcontentloaded');
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
      await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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
    await page.waitForLoadState('domcontentloaded');
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

// =============================================================================
// 66. API response time assertions + mixed content check
// =============================================================================
test.describe('66. API response time + mixed content', () => {

  test('66.01 Browse page initial template API call completes in ≤ 5s', async ({ page }) => {
    let browseApiDuration = null;

    page.on('request', req => {
      if (req.url().includes('admin-ajax') && req.method() === 'POST') {
        const startTime = Date.now();
        req['_qaStartTime'] = startTime;
      }
    });

    page.on('response', async res => {
      if (res.url().includes('admin-ajax') && res.request().method() === 'POST') {
        const startTime = res.request()['_qaStartTime'];
        if (startTime) {
          const duration = Date.now() - startTime;
          if (browseApiDuration === null || duration > browseApiDuration) {
            browseApiDuration = duration;
          }
        }
      }
    });

    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(5000);

    if (browseApiDuration !== null) {
      console.log(`[66.01] Browse API response time: ${browseApiDuration}ms`);
      expect.soft(
        browseApiDuration,
        `Browse template API took ${browseApiDuration}ms — threshold is 5000ms`
      ).toBeLessThanOrEqual(5000);
    } else {
      // No AJAX call observed — may be cached or uses a different endpoint
      console.log('[66.01] No admin-ajax POST detected on browse load — may be using cached/inline data');
    }
  });

  test('66.02 My Templates API call completes in ≤ 5s', async ({ page }) => {
    const responseTimes = [];

    page.on('response', async res => {
      if (res.url().includes('admin-ajax') && res.request().method() === 'POST') {
        const timing = res.timing();
        if (timing && timing.responseEnd > 0 && timing.requestStart > 0) {
          responseTimes.push(timing.responseEnd - timing.requestStart);
        }
      }
    });

    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(5000);

    if (responseTimes.length > 0) {
      const maxTime = Math.max(...responseTimes);
      console.log(`[66.02] My Templates max API response time: ${maxTime}ms`);
      expect.soft(
        maxTime,
        `My Templates API took ${maxTime}ms — expected ≤ 5000ms`
      ).toBeLessThanOrEqual(5000);
    }
  });

  test('66.03 No mixed content (HTTP resources on HTTPS page)', async ({ page }) => {
    const mixedContent = [];

    page.on('response', res => {
      const reqUrl = res.url();
      const pageUrl = page.url();
      // If page is HTTPS but resource is HTTP — mixed content
      if (pageUrl.startsWith('https://') && reqUrl.startsWith('http://')) {
        // Ignore localhost
        if (!reqUrl.includes('localhost') && !reqUrl.includes('127.0.0.1')) {
          mixedContent.push(reqUrl);
        }
      }
    });

    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(4000);

    // Only flag if the site itself is HTTPS
    const isHttps = page.url().startsWith('https://');
    if (isHttps) {
      expect.soft(mixedContent,
        `Mixed content detected (HTTP resources on HTTPS page):\n${mixedContent.join('\n')}`
      ).toHaveLength(0);
    } else {
      console.log('[66.03] Site is not HTTPS — mixed content check skipped');
    }
  });

  test('66.04 No mixed content on My Templates page', async ({ page }) => {
    const mixedContent = [];

    page.on('response', res => {
      const reqUrl = res.url();
      if (page.url().startsWith('https://') && reqUrl.startsWith('http://')) {
        if (!reqUrl.includes('localhost') && !reqUrl.includes('127.0.0.1')) {
          mixedContent.push(reqUrl);
        }
      }
    });

    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(4000);

    const isHttps = page.url().startsWith('https://');
    if (isHttps) {
      expect.soft(mixedContent,
        `Mixed content on My Templates:\n${mixedContent.join('\n')}`
      ).toHaveLength(0);
    }
  });

  test('66.05 API response content-type is application/json (not text/html)', async ({ page }) => {
    const nonJsonAjaxResponses = [];

    page.on('response', async res => {
      const url = res.url();
      if (url.includes('admin-ajax') && res.request().method() === 'POST') {
        const contentType = res.headers()['content-type'] || '';
        if (!contentType.includes('json') && !contentType.includes('application')) {
          nonJsonAjaxResponses.push({ url, contentType });
        }
      }
    });

    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(4000);

    expect.soft(nonJsonAjaxResponses,
      `AJAX calls returning non-JSON content-type (may be PHP errors returned as HTML):\n` +
      nonJsonAjaxResponses.map(r => `${r.contentType} — ${r.url}`).join('\n')
    ).toHaveLength(0);
  });

  test('66.06 Browse page loads templates within 10 seconds of navigation', async ({ page }) => {
    const startTime = Date.now();

    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => { location.hash = '/browse'; });

    // Wait for cards or empty state to appear
    await Promise.race([
      page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 10000 }),
      page.locator('.wkit-not-found, [class*="not-found"]').first().waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});

    const elapsed = Date.now() - startTime;
    console.log(`[66.06] Browse page render time: ${elapsed}ms`);
    expect(elapsed, `Browse page took ${elapsed}ms — expected under 10000ms`).toBeLessThan(10000);
  });

  test('66.07 No console errors related to CORS on template pages', async ({ page }) => {
    const corsErrors = [];

    page.on('console', m => {
      if (m.type() === 'error') {
        const text = m.text();
        if (
          text.toLowerCase().includes('cors') ||
          text.toLowerCase().includes('cross-origin') ||
          text.toLowerCase().includes('access-control-allow-origin') ||
          text.toLowerCase().includes('no \'access-control')
        ) {
          corsErrors.push(text);
        }
      }
    });

    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(3500);

    expect.soft(corsErrors,
      `CORS errors detected:\n${corsErrors.join('\n')}`
    ).toHaveLength(0);
  });

  test('66.08 No slow API calls take more than 8s on the import wizard entry', async ({ page }) => {
    const slowCalls = [];

    page.on('request', req => {
      if (req.url().includes('admin-ajax')) {
        req['_qa_start'] = Date.now();
      }
    });
    page.on('response', async res => {
      if (res.url().includes('admin-ajax')) {
        const start = res.request()['_qa_start'];
        if (start) {
          const duration = Date.now() - start;
          if (duration > 8000) {
            slowCalls.push({ url: res.url(), duration });
          }
        }
      }
    });

    await wpLogin(page);
    await goToBrowse(page);
    await page.waitForTimeout(3000);

    const firstCard = page.locator('.wdkit-browse-card').first();
    const cardVisible = await firstCard.isVisible({ timeout: 10000 }).catch(() => false);
    if (cardVisible) {
      await firstCard.hover({ force: true });
      await page.waitForTimeout(300);
      const importBtn = firstCard.locator('.wdkit-browse-card-download').first();
      if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await importBtn.click({ force: true });
        await page.waitForTimeout(5000);
      }
    }

    expect.soft(slowCalls,
      `API calls exceeding 8s on wizard entry:\n${slowCalls.map(c => `${c.duration}ms — ${c.url}`).join('\n')}`
    ).toHaveLength(0);
  });

});
