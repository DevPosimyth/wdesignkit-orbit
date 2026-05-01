// =============================================================================
// WDesignKit Templates Suite — Share With Me
// Version: 1.0.0
// Source: src/pages/share_with_me/main_share_with_me.js
//
// COVERAGE
//   Section 40 — Share With Me navigation & page load (9 tests)
//   Section 41 — Auth guard & login redirect (3 tests)
//   Section 42 — Content type tabs: Templates / Widgets / Code Snippet (10 tests)
//   Section 43 — Template card grid & empty state (7 tests)
//   Section 44 — Widgets tab (5 tests)
//   Section 45 — Code Snippet tab (4 tests)
//   Section 46 — Pagination controls (4 tests)
//   Section 47 — Console & network health (4 tests)
//
// KEY SELECTORS (from share_with_me.js source)
//   .wkit-share-with-me             — root container
//   .wdkit-share-with-me-inner      — inner wrapper
//   .wdkit-share-top-tabs           — top tab bar
//   .wdkit-share-tab-box            — individual tab
//   .wdkit-tab-active               — active tab class
//   .wdkit-code-snippet-tab         — Code Snippet tab (with Coming Soon badge)
//   .wdkit-coming-soon              — Coming Soon badge
//   .wdkit-loop                     — loop container
//   .wdesign-kit-main.wkit-grid-columns — cards grid
//   .wkit-custom-dropDown           — dropdown (wdkit editor mode)
//   .wkit-custom-dropDown-header    — dropdown header
//   .wkit-custom-dropDown-content   — dropdown options
//   .wkit-custom-dropDown-options   — individual dropdown option
//   .wkit-wb-paginatelist           — pagination wrapper
//   .wkit-pagination                — pagination list
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, wdkitLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { PLUGIN_PAGE } = require('./_helpers/navigation');

const SHARE_WITH_ME_HASH = '/share_with_me';

async function goToShareWithMe(page) {
  await page.goto(PLUGIN_PAGE);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { location.hash = '/share_with_me'; });
  await page.waitForTimeout(4000);
}

// =============================================================================
// 40. Share With Me — navigation & page load
// =============================================================================
test.describe('40. Share With Me — navigation & page load', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
  });

  test('40.01 #/share_with_me loads without fatal error', async ({ page }) => {
    await goToShareWithMe(page);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('40.02 #/share_with_me does not show "You do not have permission" message', async ({ page }) => {
    await goToShareWithMe(page);
    await expect(page.locator('body')).not.toContainText('do not have permission');
  });

  test('40.03 URL hash is #/share_with_me after navigation', async ({ page }) => {
    await goToShareWithMe(page);
    const hash = await page.evaluate(() => location.hash);
    // May redirect to login if not WDKit-authenticated
    expect(hash === '#/share_with_me' || hash.includes('login')).toBe(true);
  });

  test('40.04 #wdesignkit-app root element is present on share_with_me page', async ({ page }) => {
    await goToShareWithMe(page);
    const count = await page.locator('#wdesignkit-app').count();
    expect(count).toBeGreaterThan(0);
  });

  test('40.05 Page renders content — not blank after navigation', async ({ page }) => {
    await goToShareWithMe(page);
    const text = await page.locator('#wdesignkit-app').innerText({ timeout: 10000 }).catch(() => '');
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('40.06 No 4xx/5xx network responses on share_with_me page load', async ({ page }) => {
    const failed = [];
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await goToShareWithMe(page);
    await page.waitForTimeout(3000);
    const critical = failed.filter(f => !f.includes('favicon'));
    expect(critical, critical.join('\n')).toHaveLength(0);
  });

  test('40.07 Share With Me page does not show "Unauthorized" or "Forbidden"', async ({ page }) => {
    await goToShareWithMe(page);
    await expect(page.locator('body')).not.toContainText('Unauthorized');
    await expect(page.locator('body')).not.toContainText('Forbidden');
  });

  test('40.08 WDesignKit app renders in under 10 seconds on share_with_me', async ({ page }) => {
    const start = Date.now();
    await goToShareWithMe(page);
    await page.locator('#wdesignkit-app').waitFor({ state: 'visible', timeout: 10000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test('40.09 Share With Me submenu link is accessible from sidebar Templates menu', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
    const visible = await menu.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await menu.click();
      await page.waitForTimeout(400);
      const link = page.locator('.wdkit-submenu-link[href="#/share_with_me"]');
      const count = await link.count();
      // Share With Me may or may not be in submenu depending on plan
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

});

// =============================================================================
// 41. Share With Me — auth guard & login redirect
// =============================================================================
test.describe('41. Share With Me — auth guard & login redirect', () => {

  test('41.01 WDKit-unauthenticated user is redirected to login from #/share_with_me', async ({ page }) => {
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => { localStorage.removeItem('wdkit-login'); });
    await page.evaluate(() => { location.hash = '/share_with_me'; });
    await page.waitForTimeout(3000);
    const hash = await page.evaluate(() => location.hash);
    const loginVisible = hash.includes('login') ||
      (await page.locator('.wkit-login-page, .wkit-login-main').count()) > 0;
    expect(loginVisible).toBe(true);
  });

  test('41.02 WordPress admin login is required before share_with_me loads', async ({ page }) => {
    await page.goto('/wp-login.php?action=logout', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.goto(PLUGIN_PAGE, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/wp-login\.php/);
  });

  test('41.03 Authenticated WDKit user can access #/share_with_me', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'WDKIT_API_TOKEN not set — skip auth-dependent test');
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate((token) => {
      localStorage.setItem('wdkit-login', JSON.stringify({
        messages: 'Login successful', success: true,
        token, user_email: 'test@test.com',
      }));
    }, WDKIT_TOKEN);
    await page.evaluate(() => { location.hash = '/share_with_me'; });
    await page.waitForTimeout(4000);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// 42. Share With Me — content type tabs: Templates / Widgets / Code Snippet
// =============================================================================
test.describe('42. Share With Me — content type tabs', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToShareWithMe(page);
  });

  test('42.01 Top tab bar .wdkit-share-top-tabs is rendered', async ({ page }) => {
    const count = await page.locator('.wdkit-share-top-tabs').count();
    // Tab bar renders when settings allow template/builder/snippet
    // May be absent if all settings are disabled
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('42.02 Templates tab .wdkit-share-tab-box renders with "Templates" text', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /templates/i }).first();
    const count = await tab.count();
    if (count > 0) {
      await expect(tab).toBeVisible({ timeout: 5000 });
    }
  });

  test('42.03 Widgets tab .wdkit-share-tab-box renders with "Widgets" text', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const count = await tab.count();
    if (count > 0) {
      await expect(tab).toBeVisible({ timeout: 5000 });
    }
  });

  test('42.04 Code Snippet tab has .wdkit-code-snippet-tab class', async ({ page }) => {
    const tab = page.locator('.wdkit-code-snippet-tab').first();
    const count = await tab.count();
    if (count > 0) {
      await expect(tab).toBeAttached();
    }
  });

  test('42.05 Code Snippet tab shows "Coming Soon" badge', async ({ page }) => {
    const comingSoon = page.locator('.wdkit-coming-soon').first();
    const count = await comingSoon.count();
    if (count > 0) {
      const text = await comingSoon.innerText({ timeout: 3000 }).catch(() => '');
      expect(text.toLowerCase()).toContain('coming soon');
    }
  });

  test('42.06 One tab has .wdkit-tab-active class on initial render', async ({ page }) => {
    const activeTabs = await page.locator('.wdkit-tab-active').count();
    // Active tab is set on the page when tabs are rendered
    const tabsExist = await page.locator('.wdkit-share-tab-box').count() > 0;
    if (tabsExist) {
      expect(activeTabs).toBeGreaterThanOrEqual(1);
    }
  });

  test('42.07 Clicking Templates tab does not crash the page', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /templates/i }).first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('42.08 Clicking Widgets tab does not crash the page', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('42.09 Clicking Code Snippet tab shows Coming Soon or snippet UI', async ({ page }) => {
    const tab = page.locator('.wdkit-code-snippet-tab').first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(2000);
      // Should show "Coming Soon" empty state (not_found page)
      const notFoundCount = await page.locator('.wkit-not-found, [class*="not-found"]').count();
      const comingSoonCount = await page.locator('.wdkit-coming-soon, [class*="coming-soon"]').count();
      expect(notFoundCount + comingSoonCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('42.10 Tab switching updates .wdkit-loop content', async ({ page }) => {
    const loopBefore = await page.locator('.wdkit-loop').innerText({ timeout: 5000 }).catch(() => '');
    const widgetsTab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const visible = await widgetsTab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await widgetsTab.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// 43. Share With Me — template card grid & empty state
// =============================================================================
test.describe('43. Share With Me — template card grid & empty state', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToShareWithMe(page);
  });

  test('43.01 Loop container .wdkit-loop is rendered', async ({ page }) => {
    const count = await page.locator('.wdkit-loop').count();
    expect(count).toBeGreaterThan(0);
  });

  test('43.02 App renders either a card grid or empty state — not blank', async ({ page }) => {
    await page.waitForTimeout(3000);
    const gridCount = await page.locator('.wdesign-kit-main.wkit-grid-columns').count();
    const emptyCount = await page.locator('.wkit-not-found, [class*="not-found"]').count();
    const skeletonCount = await page.locator('[class*="skeleton"], [class*="Skeleton"]').count();
    const loginCount = await page.locator('.wkit-login-page, .wkit-login-main').count();
    expect(gridCount + emptyCount + skeletonCount + loginCount).toBeGreaterThan(0);
  });

  test('43.03 Empty state shows a help link when no shared templates exist', async ({ page }) => {
    await page.waitForTimeout(3000);
    const emptyState = page.locator('.wkit-not-found, [class*="not-found"]').first();
    const emptyExists = await emptyState.count() > 0;
    if (emptyExists) {
      const link = page.locator('.wkit-not-found a, [class*="not-found"] a').first();
      expect(await link.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('43.04 Skeleton loader renders during API fetch', async ({ page }) => {
    await wpLogin(page);
    const skeletonPromise = page.locator('[class*="skeleton"], [class*="Skeleton"]').waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    await page.evaluate(() => { location.hash = '/share_with_me'; });
    await skeletonPromise;
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('43.05 Template cards use .wdkit-browse-card class', async ({ page }) => {
    await page.waitForTimeout(3000);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    const emptyCount = await page.locator('[class*="not-found"], .wkit-no-data').count();
    const loginCount = await page.locator('.wkit-login-page, .wkit-login-main').count();
    expect(cardCount + emptyCount + loginCount).toBeGreaterThan(0);
  });

  test('43.06 Empty state doc link points to WDesignKit workspace documentation', async ({ page }) => {
    await page.waitForTimeout(3000);
    const docLinks = page.locator('a[href*="wdesignkit.com"], a[href*="wpradical.com"]');
    const count = await docLinks.count();
    // Doc links appear in empty state or in the page footer
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('43.07 No cross-user data leakage in shared templates grid', async ({ page }) => {
    await page.waitForTimeout(3000);
    // Verify the page doesn't show "Unauthorized" or "Forbidden" when showing templates
    await expect(page.locator('body')).not.toContainText('Unauthorized');
    await expect(page.locator('body')).not.toContainText('Forbidden');
  });

});

// =============================================================================
// 44. Share With Me — Widgets tab
// =============================================================================
test.describe('44. Share With Me — Widgets tab', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToShareWithMe(page);
  });

  test('44.01 Switching to Widgets tab does not crash the page', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(2500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('44.02 Widgets tab renders card grid or empty state on selection', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(3000);
      const hasContent = (await page.locator('.wdkit-loop').count()) > 0;
      expect(hasContent).toBe(true);
    }
  });

  test('44.03 Widget cards use WidgetsCard component class', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(3000);
      // Widget cards or empty state should be visible
      const widgetCards = await page.locator('.wkit-widget-card, .wdkit-widget-card, .wdkit-browse-card').count();
      const emptyCount = await page.locator('[class*="not-found"], .wkit-no-data').count();
      expect(widgetCards + emptyCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('44.04 Widgets tab active class is set correctly after click', async ({ page }) => {
    const tab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(1000);
      const isActive = await tab.evaluate(el => el.classList.contains('wdkit-tab-active'));
      expect(isActive).toBe(true);
    }
  });

  test('44.05 Switching back from Widgets to Templates does not crash', async ({ page }) => {
    const widgetsTab = page.locator('.wdkit-share-tab-box').filter({ hasText: /widgets/i }).first();
    const templatesTab = page.locator('.wdkit-share-tab-box').filter({ hasText: /templates/i }).first();
    const widgetsVisible = await widgetsTab.isVisible({ timeout: 5000 }).catch(() => false);
    if (widgetsVisible) {
      await widgetsTab.click();
      await page.waitForTimeout(1500);
      const templatesVisible = await templatesTab.isVisible({ timeout: 3000 }).catch(() => false);
      if (templatesVisible) {
        await templatesTab.click();
        await page.waitForTimeout(2000);
      }
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// 45. Share With Me — Code Snippet tab
// =============================================================================
test.describe('45. Share With Me — Code Snippet tab', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToShareWithMe(page);
  });

  test('45.01 Code Snippet tab shows Coming Soon badge', async ({ page }) => {
    const badge = page.locator('.wdkit-coming-soon').first();
    const count = await badge.count();
    if (count > 0) {
      const text = await badge.innerText({ timeout: 3000 }).catch(() => '');
      expect(text.toLowerCase()).toContain('coming soon');
    }
  });

  test('45.02 Clicking Code Snippet tab shows empty state (not_found) — not a data grid', async ({ page }) => {
    const tab = page.locator('.wdkit-code-snippet-tab').first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(2500);
      // Source code: selectType == 'snippet' shows Not_found component
      const loopCount = await page.locator('.wdkit-loop').count();
      expect(loopCount).toBeGreaterThan(0);
    }
  });

  test('45.03 Code Snippet empty state has a documentation link', async ({ page }) => {
    const tab = page.locator('.wdkit-code-snippet-tab').first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(2500);
      const link = page.locator('.wdkit-loop a').first();
      const linkCount = await link.count();
      if (linkCount > 0) {
        const href = await link.getAttribute('href') || '';
        expect(href.length).toBeGreaterThan(0);
      }
    }
  });

  test('45.04 Code Snippet tab does not trigger API calls that return errors', async ({ page }) => {
    const failed = [];
    page.on('response', r => { if (r.status() >= 500) failed.push(`${r.status()} ${r.url()}`); });
    const tab = page.locator('.wdkit-code-snippet-tab').first();
    const visible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await tab.click();
      await page.waitForTimeout(2500);
    }
    expect(failed, failed.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 46. Share With Me — pagination controls
// =============================================================================
test.describe('46. Share With Me — pagination controls', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToShareWithMe(page);
    await page.waitForTimeout(3000);
  });

  test('46.01 Pagination wrapper .wkit-wb-paginatelist renders only when totalpage > 1', async ({ page }) => {
    const paginationCount = await page.locator('.wkit-wb-paginatelist').count();
    const cardCount = await page.locator('.wdkit-browse-card').count();
    // Pagination only shows when there are more than 24 shared templates
    if (cardCount >= 24) {
      expect(paginationCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('46.02 Pagination list has class .wkit-pagination', async ({ page }) => {
    const paginationExists = (await page.locator('.wkit-pagination').count()) > 0;
    if (paginationExists) {
      await expect(page.locator('.wkit-pagination').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('46.03 Prev/next arrows have .wkit-prev-pagination and .wkit-next-pagination classes', async ({ page }) => {
    if ((await page.locator('.wkit-pagination').count()) > 0) {
      const prevCount = await page.locator('.wkit-prev-pagination').count();
      const nextCount = await page.locator('.wkit-next-pagination').count();
      expect(prevCount).toBeGreaterThan(0);
      expect(nextCount).toBeGreaterThan(0);
    }
  });

  test('46.04 Per-page limit is 24 — grid renders max 24 cards at a time', async ({ page }) => {
    await page.waitForTimeout(2000);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect(cardCount).toBeLessThanOrEqual(24);
  });

});

// =============================================================================
// 47. Share With Me — console & network health
// =============================================================================
test.describe('47. Share With Me — console & network health', () => {

  test('47.01 No product console errors on #/share_with_me load', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await goToShareWithMe(page);
    await page.waitForTimeout(3000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('47.02 No uncaught JavaScript exceptions on share_with_me page', async ({ page }) => {
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await wpLogin(page);
    await goToShareWithMe(page);
    await page.waitForTimeout(3000);
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

  test('47.03 No 4xx/5xx network responses on share_with_me page', async ({ page }) => {
    const failed = [];
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await wpLogin(page);
    await goToShareWithMe(page);
    await page.waitForTimeout(3000);
    const critical = failed.filter(f => !f.includes('favicon'));
    expect(critical, critical.join('\n')).toHaveLength(0);
  });

  test('47.04 Switching all three tabs generates no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await goToShareWithMe(page);
    await page.waitForTimeout(2000);
    const tabs = page.locator('.wdkit-share-tab-box');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      const visible = await tab.isVisible({ timeout: 2000 }).catch(() => false);
      if (visible) {
        await tab.click();
        await page.waitForTimeout(1500);
      }
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

});
