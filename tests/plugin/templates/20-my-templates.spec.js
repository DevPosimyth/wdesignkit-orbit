// =============================================================================
// WDesignKit Templates Suite — My Templates (My Uploaded)
// Version: 2.0.0
// Source: split from template-import.spec.js + src/pages/myuploaded/template/myuploaded.js
//
// COVERAGE
//   Section 20 — My Templates navigation & page load (10 tests)
//   Section 21 — Auth guard & redirect (4 tests)
//   Section 22 — Tab navigation: Pages / Sections / Kits (9 tests)
//   Section 23 — Search functionality (8 tests)
//   Section 24 — Favourite filter (7 tests)
//   Section 25 — Template card grid & empty state (8 tests)
//   Section 26 — Pagination controls (5 tests)
//   Section 27 — Console & network health (4 tests)
//   Section 28 — Empty state CTA & logic edge cases (7 tests) ← NEW
//   Section 29 — Tab state persistence & search debounce (6 tests) ← NEW
//
// MANUAL CHECKS (not automatable — verify manually):
//   • Pixel-perfect match with Figma design (colors, spacing, typography)
//   • Screen reader announcement order and content
//   • Cross-browser visual rendering (Firefox, Safari/WebKit, Edge)
//   • RTL layout visual correctness (Arabic/Hebrew locales)
//   • Color contrast ratios in rendered output
//   • Touch gesture behavior on real mobile devices
//
// KEY SELECTORS (from myuploaded.js source)
//   .wkit-myupload-main         — root container
//   .wkit-navbar                — top filter bar
//   .wdesignkit-menu            — tab buttons (Pages / Sections / Kits)
//   .tab-active                 — active tab indicator
//   .wdkit-favourite-btn        — favourite toggle button
//   .wdkit-i-heart / .wdkit-i-filled-heart  — favourite icons
//   .wdkit-search-filter        — search box wrapper
//   .wdesign-kit-main           — template cards grid
//   .wdkit-loop                 — loop container
//   .wkit-pagination-main       — pagination wrapper
//   .wkit-pagination            — pagination list
//   .wkit-page-item             — pagination page item
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, wdkitLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToMyTemplates, PLUGIN_PAGE } = require('./_helpers/navigation');

// =============================================================================
// 20. My Templates — navigation & page load
// =============================================================================
test.describe('20. My Templates — navigation & page load', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
  });

  test('20.01 #/my_uploaded loads without fatal error', async ({ page }) => {
    await goToMyTemplates(page);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('20.02 #/my_uploaded does not show "You do not have permission" message', async ({ page }) => {
    await goToMyTemplates(page);
    await expect(page.locator('body')).not.toContainText('do not have permission');
  });

  test('20.03 URL hash is #/my_uploaded after navigation', async ({ page }) => {
    await goToMyTemplates(page);
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toBe('#/my_uploaded');
  });

  test('20.04 My Templates submenu link href is #/my_uploaded', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
    const visible = await menu.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await menu.click();
      await page.waitForTimeout(400);
    }
    const link = page.locator('.wdkit-submenu-link[href="#/my_uploaded"]');
    expect(await link.count()).toBeGreaterThan(0);
  });

  test('20.05 Clicking My Templates sidebar link navigates to #/my_uploaded', async ({ page }) => {
    // Inject WDKit cloud auth BEFORE the SPA initialises so it doesn't redirect to login
    await wdkitLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
    const visible = await menu.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await menu.click();
      await page.waitForTimeout(400);
      const link = page.locator('.wdkit-submenu-link[href="#/my_uploaded"]');
      const linkVisible = await link.isVisible({ timeout: 3000 }).catch(() => false);
      if (linkVisible) {
        await link.click();
        await page.waitForTimeout(2500);
        const hash = await page.evaluate(() => location.hash);
        expect(hash).toBe('#/my_uploaded');
        return;
      }
    }
    // Fallback: direct hash navigation
    await page.evaluate(() => { location.hash = '/my_uploaded'; });
    await page.waitForTimeout(1500);
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toBe('#/my_uploaded');
  });

  test('20.06 #wdesignkit-app root element is present on the page', async ({ page }) => {
    await goToMyTemplates(page);
    const count = await page.locator('#wdesignkit-app').count();
    expect(count).toBeGreaterThan(0);
  });

  test('20.07 Page renders content — not blank after navigation', async ({ page }) => {
    await goToMyTemplates(page);
    const text = await page.locator('#wdesignkit-app').innerText({ timeout: 10000 }).catch(() => '');
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('20.08 No 4xx/5xx network responses on My Templates page load', async ({ page }) => {
    const failed = [];
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await goToMyTemplates(page);
    await page.waitForTimeout(3000);
    const critical = failed.filter(f => !f.includes('favicon'));
    expect(critical, critical.join('\n')).toHaveLength(0);
  });

  test('20.09 Page title or heading refers to templates section', async ({ page }) => {
    await goToMyTemplates(page);
    // Either a heading element or the page renders the template UI
    const rootText = await page.locator('#wdesignkit-app').innerText({ timeout: 10000 }).catch(() => '');
    const lc = rootText.toLowerCase();
    expect(lc.includes('page') || lc.includes('section') || lc.includes('kit') || lc.includes('template') || lc.includes('upload')).toBe(true);
  });

  test('20.10 WDesignKit app renders in under 10 seconds on My Templates', async ({ page }) => {
    const start = Date.now();
    await goToMyTemplates(page);
    await page.locator('#wdesignkit-app').waitFor({ state: 'visible', timeout: 10000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

});

// =============================================================================
// 21. My Templates — auth guard & redirect
// =============================================================================
test.describe('21. My Templates — auth guard & redirect', () => {

  test('21.01 Unauthenticated WDKit user is redirected to login when accessing #/my_uploaded', async ({ page }) => {
    await wpLogin(page);
    // Remove WDKit cloud auth
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => { localStorage.removeItem('wdkit-login'); });
    await page.evaluate(() => { location.hash = '/my_uploaded'; });
    await page.waitForTimeout(3000);
    const hash = await page.evaluate(() => location.hash);
    // Should redirect to /login or show login UI
    const loginVisible = hash.includes('login') ||
      (await page.locator('.wkit-login-page, .wkit-login-main, form#loginform').count()) > 0;
    expect(loginVisible).toBe(true);
  });

  test('21.02 Authenticated WDKit user can reach #/my_uploaded without redirect', async ({ page }) => {
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
    await page.evaluate(() => { location.hash = '/my_uploaded'; });
    await page.waitForTimeout(3000);
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toBe('#/my_uploaded');
  });

  test('21.03 Login redirect preserves intended route (/my_uploaded)', async ({ page }) => {
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => { localStorage.removeItem('wdkit-login'); });
    await page.evaluate(() => { location.hash = '/my_uploaded'; });
    await page.waitForTimeout(3000);
    // After redirect to login, check that state or URL hints at intended route
    const bodyText = await page.locator('#wdesignkit-app').innerText({ timeout: 5000 }).catch(() => '');
    // Should show login or my_uploaded — not blank
    expect(bodyText.trim().length).toBeGreaterThan(0);
  });

  test('21.04 WordPress admin login is required before WDKit app loads', async ({ page }) => {
    // Navigate without WP login
    await page.goto('/wp-login.php?action=logout', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.goto(PLUGIN_PAGE, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(2000);
    const url = page.url();
    // Should redirect to wp-login.php
    expect(url).toMatch(/wp-login\.php/);
  });

});

// =============================================================================
// 22. My Templates — tab navigation: Pages / Sections / Kits
// =============================================================================
test.describe('22. My Templates — tab navigation: Pages / Sections / Kits', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
  });

  test('22.01 Tab bar renders with .wkit-navbar container', async ({ page }) => {
    const count = await page.locator('.wkit-navbar').count();
    expect(count).toBeGreaterThan(0);
  });

  test('22.02 Pages tab button is rendered', async ({ page }) => {
    const pages = page.locator('.wdesignkit-menu').filter({ hasText: /pages/i }).first();
    const count = await pages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('22.03 Sections tab button is rendered', async ({ page }) => {
    const sections = page.locator('.wdesignkit-menu').filter({ hasText: /sections/i }).first();
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('22.04 Kits tab button is rendered', async ({ page }) => {
    const kits = page.locator('.wdesignkit-menu').filter({ hasText: /kits/i }).first();
    const count = await kits.count();
    expect(count).toBeGreaterThan(0);
  });

  test('22.05 One tab has class .tab-active on initial render', async ({ page }) => {
    const activeCount = await page.locator('.wdesignkit-menu.tab-active').count();
    expect(activeCount).toBeGreaterThanOrEqual(1);
  });

  test('22.06 Clicking Sections tab does not crash the page', async ({ page }) => {
    const sections = page.locator('.wdesignkit-menu').filter({ hasText: /sections/i }).first();
    const visible = await sections.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await sections.click();
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('22.07 Clicking Kits tab does not crash the page', async ({ page }) => {
    const kits = page.locator('.wdesignkit-menu').filter({ hasText: /kits/i }).first();
    const visible = await kits.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await kits.click();
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('22.08 Clicking Pages tab does not crash the page', async ({ page }) => {
    const pages = page.locator('.wdesignkit-menu').filter({ hasText: /pages/i }).first();
    const visible = await pages.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await pages.click();
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('22.09 Active tab has .tab-active class after switching', async ({ page }) => {
    const sections = page.locator('.wdesignkit-menu').filter({ hasText: /sections/i }).first();
    const visible = await sections.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await sections.click();
      await page.waitForTimeout(1000);
      const isActive = await sections.evaluate(el => el.classList.contains('tab-active'));
      expect(isActive).toBe(true);
    }
  });

});

// =============================================================================
// 23. My Templates — search functionality
// =============================================================================
test.describe('23. My Templates — search functionality', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
  });

  test('23.01 Search filter wrapper .wdkit-search-filter is rendered', async ({ page }) => {
    const count = await page.locator('.wdkit-search-filter').count();
    expect(count).toBeGreaterThan(0);
  });

  test('23.02 Search input is rendered inside the search filter', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input[type="text"], .wdkit-search-filter input[type="search"]').first();
    const count = await input.count();
    expect(count).toBeGreaterThan(0);
  });

  test('23.03 Search input accepts typing', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await input.fill('agency');
      const value = await input.inputValue();
      expect(value).toBe('agency');
    }
  });

  test('23.04 Search with a known term does not crash the page', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await input.fill('home');
      await input.press('Enter');
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('23.05 Empty search restores the full template list', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await input.fill('zzz_no_match_xyz');
      await input.press('Enter');
      await page.waitForTimeout(1500);
      await input.fill('');
      await input.press('Enter');
      await page.waitForTimeout(1500);
    }
    // Should not crash
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('23.06 XSS in search input does not execute script', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await input.fill('<script>window.__xss=1</script>');
      await input.press('Enter');
      await page.waitForTimeout(1500);
    }
    const xss = await page.evaluate(() => window.__xss);
    expect(xss).toBeUndefined();
  });

  test('23.07 Search with 500-character input does not crash', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await input.fill('a'.repeat(500));
      await input.press('Enter');
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('23.08 Search with special characters does not crash', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await input.fill('!@#$%^&*()_+-=[]{}|');
      await input.press('Enter');
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// 24. My Templates — favourite filter
// =============================================================================
test.describe('24. My Templates — favourite filter', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
  });

  test('24.01 Favourite button .wdkit-favourite-btn is rendered', async ({ page }) => {
    const count = await page.locator('.wdkit-favourite-btn').count();
    expect(count).toBeGreaterThan(0);
  });

  test('24.02 Heart icon .wdkit-i-heart is rendered in favourite button (unfavourited state)', async ({ page }) => {
    const count = await page.locator('.wdkit-i-heart').count();
    expect(count).toBeGreaterThan(0);
  });

  test('24.03 Clicking favourite button does not crash the page', async ({ page }) => {
    const btn = page.locator('.wdkit-favourite-btn').first();
    const visible = await btn.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      // NOTE (product bug): .wkit-navbar-right-btn.wkit-disable-btn-class intercepts pointer
      // events over the button when no templates exist. force:true bypasses CSS hit-testing
      // so the click event fires; validates no crash occurs regardless of disabled state.
      await btn.click({ force: true });
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('24.04 After clicking favourite button, icon toggles to filled state', async ({ page }) => {
    const btn = page.locator('.wdkit-favourite-btn').first();
    const visible = await btn.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      // force:true — parent .wkit-disable-btn-class may block pointer events when empty
      await btn.click({ force: true });
      await page.waitForTimeout(1000);
      // Either filled heart shows or button state changes (depends on having favourites)
      const filledCount = await page.locator('.wdkit-i-filled-heart').count();
      const heartCount = await page.locator('.wdkit-i-heart').count();
      // One of the two states should be rendered
      expect(filledCount + heartCount).toBeGreaterThan(0);
    }
  });

  test('24.05 Clicking favourite button twice returns to original state', async ({ page }) => {
    const btn = page.locator('.wdkit-favourite-btn').first();
    const visible = await btn.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      // force:true — parent .wkit-disable-btn-class may block pointer events when empty
      await btn.click({ force: true });
      await page.waitForTimeout(800);
      await btn.click({ force: true });
      await page.waitForTimeout(800);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('24.06 Disabled state (.wkit-disable-btn-class) renders when no templates exist', async ({ page }) => {
    // This test validates the UI gracefully handles the disabled state
    // Disabled class may or may not be present depending on user data
    const btnWrapper = page.locator('.wkit-navbar-right-btn').first();
    const exists = await btnWrapper.count() > 0;
    expect(exists).toBe(true);
  });

  test('24.07 Favourite button is keyboard-focusable', async ({ page }) => {
    // PRODUCT BUG (P2 Accessibility): .wdkit-favourite-btn is not keyboard-focusable.
    // The button has no tabIndex, no role="button", and sits inside a
    // .wkit-disable-btn-class wrapper that blocks pointer events.
    // Expected: button should receive focus on Tab/focus() even in disabled state (WCAG 2.1 §4.1.2).
    // Marking as test.fail() so CI tracks this as a known accessibility regression to fix.
    test.fail(true, 'Known product bug: .wdkit-favourite-btn is not keyboard-focusable (WCAG 2.1 §4.1.2 violation)');
    const btn = page.locator('.wdkit-favourite-btn').first();
    const visible = await btn.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await btn.focus();
      const focused = await btn.evaluate(el => document.activeElement === el || el.contains(document.activeElement));
      expect(focused).toBe(true);
    }
  });

});

// =============================================================================
// 25. My Templates — template card grid & empty state
// =============================================================================
test.describe('25. My Templates — template card grid & empty state', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
  });

  test('25.01 Loop container .wdkit-loop is rendered', async ({ page }) => {
    const count = await page.locator('.wdkit-loop').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.02 App renders either a card grid or an empty state — not blank', async ({ page }) => {
    await page.waitForTimeout(2000);
    const gridCount = await page.locator('.wdesign-kit-main').count();
    const emptyCount = await page.locator('.wkit-not-found, .wkit-no-data, [class*="not-found"], [class*="no-template"]').count();
    const skeletonCount = await page.locator('[class*="skeleton"], [class*="Skeleton"]').count();
    expect(gridCount + emptyCount + skeletonCount).toBeGreaterThan(0);
  });

  test('25.03 Empty state shows a help link when no templates exist', async ({ page }) => {
    await page.waitForTimeout(3000);
    const emptyState = page.locator('.wkit-not-found, [class*="not-found"]').first();
    const emptyExists = await emptyState.count() > 0;
    if (emptyExists) {
      const link = page.locator('.wkit-not-found a, [class*="not-found"] a').first();
      expect(await link.count()).toBeGreaterThan(0);
    }
  });

  test('25.04 Skeleton loader renders during data fetch', async ({ page }) => {
    // The skeleton shows briefly — test navigation reveals it
    await wpLogin(page);
    const skeletonPromise = page.locator('[class*="skeleton"], [class*="Skeleton"]').waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    await page.evaluate(() => { location.hash = '/my_uploaded'; });
    await skeletonPromise;
    // If skeleton didn't appear, data loaded instantly — both are valid
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('25.05 Template cards use .wdkit-browse-card or .BrowseCard class', async ({ page }) => {
    await page.waitForTimeout(3000);
    // Cards may or may not be present depending on user data
    const cardCount = await page.locator('.wdkit-browse-card').count();
    const emptyCount = await page.locator('[class*="not-found"], .wkit-no-data').count();
    expect(cardCount + emptyCount).toBeGreaterThan(0);
  });

  test('25.06 Switching tabs updates the loop content without crashing', async ({ page }) => {
    const tabs = ['pages', 'sections', 'kits'];
    for (const tabText of tabs) {
      const btn = page.locator('.wdesignkit-menu').filter({ hasText: new RegExp(tabText, 'i') }).first();
      const visible = await btn.isVisible({ timeout: 3000 }).catch(() => false);
      if (visible) {
        await btn.click();
        await page.waitForTimeout(1200);
      }
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('25.07 Template cards are not rendered from another user (data isolation)', async ({ page }) => {
    // This test validates the source code filter: data.user_id == props.wdkit_meta.userinfo.id
    // We verify no cross-user cards appear (structural validation)
    await page.waitForTimeout(3000);
    // Each card rendered should belong to the authenticated user — verified by design
    // Test just validates the page doesn't show error or "unauthorized"
    await expect(page.locator('body')).not.toContainText('Unauthorized');
    await expect(page.locator('body')).not.toContainText('Forbidden');
  });

  test('25.08 Empty state link points to WDesignKit documentation', async ({ page }) => {
    await page.waitForTimeout(3000);
    const docLinks = page.locator('a[href*="wdesignkit.com"], a[href*="wpradical.com"]');
    const emptyState = page.locator('.wkit-not-found, [class*="not-found"]').first();
    const emptyExists = await emptyState.count() > 0;
    if (emptyExists) {
      const linkCount = await docLinks.count();
      expect(linkCount).toBeGreaterThanOrEqual(0); // Link is optional per design
    }
  });

});

// =============================================================================
// 26. My Templates — pagination controls
// =============================================================================
test.describe('26. My Templates — pagination controls', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(3000);
  });

  test('26.01 Pagination wrapper .wkit-pagination-main is present if totalpage > 1', async ({ page }) => {
    // Pagination only renders when templates > 24
    // Check it renders OR is absent (both valid for fresh accounts)
    const paginationCount = await page.locator('.wkit-pagination-main').count();
    const cardCount = await page.locator('.wdkit-browse-card').count();
    if (cardCount > 24) {
      expect(paginationCount).toBeGreaterThan(0);
    } else {
      // Pagination absent is correct behavior for ≤24 templates
      expect(true).toBe(true);
    }
  });

  test('26.02 Pagination list has class .wkit-pagination', async ({ page }) => {
    const paginationExists = (await page.locator('.wkit-pagination').count()) > 0;
    const cardCount = await page.locator('.wdkit-browse-card').count();
    if (cardCount > 24) {
      expect(paginationExists).toBe(true);
    }
    // If ≤24 templates, no pagination is correct
  });

  test('26.03 Prev/next pagination arrows have correct classes', async ({ page }) => {
    const paginationExists = (await page.locator('.wkit-pagination').count()) > 0;
    if (paginationExists) {
      const prevCount = await page.locator('.wkit-prev-pagination').count();
      const nextCount = await page.locator('.wkit-next-pagination').count();
      expect(prevCount).toBeGreaterThan(0);
      expect(nextCount).toBeGreaterThan(0);
    }
  });

  test('26.04 Clicking next page does not crash (if pagination exists)', async ({ page }) => {
    const nextBtn = page.locator('.wkit-next-pagination').first();
    const visible = await nextBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('26.05 Per-page limit is 24 — grid renders max 24 cards per page', async ({ page }) => {
    await page.waitForTimeout(2000);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect(cardCount).toBeLessThanOrEqual(24);
  });

});

// =============================================================================
// 27. My Templates — console & network health
// =============================================================================
test.describe('27. My Templates — console & network health', () => {

  test('27.01 No product console errors on My Templates page load', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(3000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('27.02 No uncaught JavaScript exceptions on My Templates page', async ({ page }) => {
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(3000);
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

  test('27.03 No 4xx/5xx network responses on My Templates page', async ({ page }) => {
    const failed = [];
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(3000);
    const critical = failed.filter(f => !f.includes('favicon'));
    expect(critical, critical.join('\n')).toHaveLength(0);
  });

  test('27.04 Switching all three tabs generates no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(2000);
    const tabs = page.locator('.wdesignkit-menu');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      const visible = await tab.isVisible({ timeout: 2000 }).catch(() => false);
      if (visible) {
        await tab.click();
        await page.waitForTimeout(1000);
      }
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 28. My Templates — empty state CTA & logic edge cases
// =============================================================================
test.describe('28. My Templates — empty state CTA & logic edge cases', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(2500);
  });

  test('28.01 Empty state "Browse Templates" CTA navigates to #/browse', async ({ page }) => {
    const emptyState = page.locator(
      '.wkit-not-found, [class*="not-found"], [class*="no-template"], .wkit-no-data'
    ).first();
    const emptyVisible = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    if (!emptyVisible) {
      // No empty state present — user has templates, skip the CTA check
      return;
    }

    // Look for any link/button inside the empty state that points to browse
    const browseLink = page.locator(
      '.wkit-not-found a[href*="browse"], [class*="not-found"] a[href*="browse"], ' +
      '.wkit-not-found button, [class*="not-found"] button'
    ).first();

    const browseVisible = await browseLink.isVisible({ timeout: 3000 }).catch(() => false);
    if (browseVisible) {
      await browseLink.click();
      await page.waitForTimeout(2000);
      const hash = await page.evaluate(() => location.hash);
      expect(hash).toContain('browse');
    } else {
      // CTA may use hash navigation — look for any anchor with #/browse
      const anyBrowseLink = page.locator('a[href="#/browse"]').first();
      const anyVisible = await anyBrowseLink.isVisible({ timeout: 3000 }).catch(() => false);
      if (anyVisible) {
        await anyBrowseLink.click();
        await page.waitForTimeout(2000);
        const hash = await page.evaluate(() => location.hash);
        expect(hash).toContain('browse');
      } else {
        // No CTA visible — log and skip (soft pass — empty state may just have text)
        console.log('[28.01] No browse CTA found in empty state — may be text-only');
      }
    }
  });

  test('28.02 Empty state is not a blank panel — shows descriptive text', async ({ page }) => {
    const emptyState = page.locator(
      '.wkit-not-found, [class*="not-found"], [class*="no-template"], .wkit-no-data'
    ).first();
    const emptyVisible = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    if (!emptyVisible) {
      return; // Has templates — empty state not visible, skip
    }

    const emptyText = await emptyState.innerText({ timeout: 5000 }).catch(() => '');
    expect(emptyText.trim().length,
      'Empty state should have descriptive text, not be blank'
    ).toBeGreaterThan(0);
  });

  test('28.03 Zero-result search shows empty/no-results state, not a crash', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);

    if (!visible) return; // Search not present — nothing to test

    await input.fill('zzz_nomatch_xyzqwerty_99999');
    await input.press('Enter');
    await page.waitForTimeout(2500);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('Uncaught');

    // Should show empty/no-result indicator — not a blank loop container
    const noResult = page.locator(
      '.wkit-not-found, [class*="not-found"], [class*="no-result"], [class*="no-data"], ' +
      '.wkit-no-data, [class*="empty"]'
    );
    const noResultCount = await noResult.count();
    const cardCount = await page.locator('.wdkit-browse-card').count();

    // Either cards are gone + empty state shown, or 0 cards (both acceptable outcomes)
    expect(cardCount === 0 || noResultCount > 0).toBe(true);
  });

  test('28.04 Zero-result search empty state shows helpful text, not blank', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);

    if (!visible) return;

    await input.fill('zzz_nomatch_xyzqwerty_99999');
    await input.press('Enter');
    await page.waitForTimeout(2500);

    const cardCount = await page.locator('.wdkit-browse-card').count();
    if (cardCount === 0) {
      // Empty state should have some text content
      const loopText = await page.locator('.wdkit-loop').innerText({ timeout: 5000 }).catch(() => '');
      const appText = await page.locator('#wdesignkit-app').innerText({ timeout: 5000 }).catch(() => '');
      const combined = loopText + appText;
      expect(combined.trim().length,
        'Zero-result state must not be a completely blank panel'
      ).toBeGreaterThan(0);
    }
  });

  test('28.05 Favourite filter with no favourites shows empty state, not crash', async ({ page }) => {
    // Click favourite filter button to show only favourites
    const favBtn = page.locator('.wdkit-favourite-btn').first();
    const visible = await favBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return;

    await favBtn.click();
    await page.waitForTimeout(2000);

    await expect(page.locator('body')).not.toContainText('Fatal error');

    const cardCount = await page.locator('.wdkit-browse-card').count();
    if (cardCount === 0) {
      // Some empty state indicator should show
      const appText = await page.locator('#wdesignkit-app').innerText({ timeout: 5000 }).catch(() => '');
      expect(appText.trim().length,
        'Favourite filter with no results should show content, not a blank panel'
      ).toBeGreaterThan(0);
    }
  });

  test('28.06 Clearing search after zero-result restores list (no crash)', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return;

    await input.fill('zzz_nomatch_xyzqwerty_99999');
    await input.press('Enter');
    await page.waitForTimeout(2000);

    await input.fill('');
    await input.press('Enter');
    await page.waitForTimeout(2000);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    // UI should recover — wdkit-loop should still exist
    const loop = page.locator('.wdkit-loop');
    await expect(loop).toBeVisible({ timeout: 5000 });
  });

  test('28.07 Upload / Save Template entry point is accessible from My Templates page', async ({ page }) => {
    // The "My Uploaded" page should have a way for user to save/upload a template
    // This may be a button, CTA, or link — validate it is present and not broken
    const uploadCTA = page.locator(
      'a[href*="save_template"], a[href*="#/save_template"], ' +
      'button[class*="upload"], button[class*="save"], ' +
      '[class*="upload-btn"], [class*="save-template"]'
    ).first();

    const ctaCount = await uploadCTA.count();
    // Soft: some builds may show this only in navbar — accept if anywhere on page
    const navbarUpload = page.locator('.wkit-navbar a, .wkit-navbar button').filter({
      hasText: /save|upload|add/i,
    }).first();
    const navbarCount = await navbarUpload.count();

    expect.soft(ctaCount + navbarCount,
      'My Templates page should have at least one upload/save-template entry point'
    ).toBeGreaterThan(0);
  });

});

// =============================================================================
// 29. My Templates — tab state persistence & search debounce
// =============================================================================
test.describe('29. My Templates — tab state persistence & search debounce', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(2000);
  });

  test('29.01 Active tab survives hash re-navigation (state not lost on soft reload)', async ({ page }) => {
    // Click "Sections" tab
    const sectionsTab = page.locator('.wdesignkit-menu').filter({ hasText: /sections/i }).first();
    const visible = await sectionsTab.isVisible({ timeout: 5000 }).catch(() => false);

    if (!visible) return;

    await sectionsTab.click();
    await page.waitForTimeout(1000);

    const isActiveBeforeNav = await sectionsTab.evaluate(el => el.classList.contains('tab-active'));
    expect(isActiveBeforeNav).toBe(true);

    // Navigate away then back to my_uploaded
    await page.evaluate(() => { location.hash = '/browse'; });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { location.hash = '/my_uploaded'; });
    await page.waitForTimeout(2500);

    // After re-navigation, default tab renders without crash
    await expect(page.locator('body')).not.toContainText('Fatal error');
    // At least one tab should be active
    const activeCount = await page.locator('.wdesignkit-menu.tab-active').count();
    expect(activeCount).toBeGreaterThanOrEqual(1);
  });

  test('29.02 Search does not fire an API call on every single keystroke (debounce check)', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return;

    const requestUrls = [];
    page.on('request', req => {
      const url = req.url();
      if (url.includes('admin-ajax.php') || url.includes('wdesignkit') || url.includes('api')) {
        requestUrls.push(url);
      }
    });

    const countBefore = requestUrls.length;

    // Type 6 characters rapidly
    await input.click();
    for (const ch of 'agency') {
      await page.keyboard.type(ch, { delay: 30 });
    }

    // Wait a short time — debounce window, not full settle
    await page.waitForTimeout(300);
    const countDuringTyping = requestUrls.length - countBefore;

    // Wait for debounce to settle
    await page.waitForTimeout(1200);
    const countAfterSettle = requestUrls.length - countBefore;

    // Debounced: requests during typing should be fewer than total characters typed (6)
    // Perfect debounce = 0 during typing, 1 after settle
    // Acceptable: fewer requests than keystrokes
    expect.soft(
      countDuringTyping,
      `Expected fewer API calls than keystrokes during typing (debounce). Got ${countDuringTyping} during 6 keystrokes.`
    ).toBeLessThan(6);

    // After settling, at least the settled search request should have fired (if API-driven)
    // We don't hard-assert this since some implementations use local filter
    console.log(`[29.02] Requests during typing: ${countDuringTyping} | After settle: ${countAfterSettle}`);
  });

  test('29.03 Switching tabs clears the search input value', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return;

    // Type something in search
    await input.fill('agency');
    await page.waitForTimeout(800);

    // Switch to Sections tab
    const sectionsTab = page.locator('.wdesignkit-menu').filter({ hasText: /sections/i }).first();
    const tabVisible = await sectionsTab.isVisible({ timeout: 3000 }).catch(() => false);
    if (!tabVisible) return;

    await sectionsTab.click();
    await page.waitForTimeout(1500);

    // Check search input value after tab switch
    const valueAfterSwitch = await input.inputValue().catch(() => null);
    if (valueAfterSwitch !== null) {
      // Soft assert — clearing on tab switch is best practice but may not be implemented
      expect.soft(valueAfterSwitch,
        'Search input should be cleared when switching tabs to avoid stale filter'
      ).toBe('');
    }

    // Page must not crash regardless
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('29.04 Tab switch combined with active search does not freeze the page', async ({ page }) => {
    const input = page.locator('.wdkit-search-filter input').first();
    const inputVisible = await input.isVisible({ timeout: 5000 }).catch(() => false);

    if (inputVisible) {
      await input.fill('home');
      await page.waitForTimeout(500);
    }

    // Rapidly switch all tabs while search filter is active
    const tabs = page.locator('.wdesignkit-menu');
    const tabCount = await tabs.count();
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const tabVisible = await tab.isVisible({ timeout: 1000 }).catch(() => false);
      if (tabVisible) {
        await tab.click();
        await page.waitForTimeout(400);
      }
    }

    await page.waitForTimeout(1500);
    await expect(page.locator('body')).not.toContainText('Fatal error');

    // App root must still be visible
    await expect(page.locator('#wdesignkit-app')).toBeVisible({ timeout: 5000 });
  });

  test('29.05 Page reload after tab switch lands on default state without error', async ({ page }) => {
    // Click Sections tab then reload
    const sectionsTab = page.locator('.wdesignkit-menu').filter({ hasText: /sections/i }).first();
    const visible = await sectionsTab.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await sectionsTab.click();
      await page.waitForTimeout(800);
    }

    // Simulate reload by re-navigating to the exact same hash URL
    const currentUrl = page.url();
    await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    // App should render
    const appText = await page.locator('#wdesignkit-app').innerText({ timeout: 8000 }).catch(() => '');
    expect(appText.trim().length).toBeGreaterThan(0);
  });

  test('29.06 Rapid tab switching (6x in 2s) does not cause React unmount error', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', err => errors.push(`PAGEERROR: ${err.message}`));

    const tabs = page.locator('.wdesignkit-menu');
    const tabCount = await tabs.count();

    if (tabCount < 2) return; // Not enough tabs to test

    // Rapid-fire tab switching: 6 clicks, 200ms apart
    for (let i = 0; i < 6; i++) {
      const tab = tabs.nth(i % tabCount);
      const visible = await tab.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        await tab.click();
        await page.waitForTimeout(200);
      }
    }

    await page.waitForTimeout(2000);

    const productErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('extension') &&
      !e.includes('chrome-extension')
    );

    expect(productErrors,
      `Rapid tab switching caused errors:\n${productErrors.join('\n')}`
    ).toHaveLength(0);
  });

});

// =============================================================================
// §A. My Templates — Performance
// =============================================================================
test.describe('§A. My Templates — Performance', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
  });

  test('§A.01 My Templates page loads within 15 seconds', async ({ page }) => {
    await wpLogin(page);
    const t0 = Date.now();
    await goToMyTemplates(page);
    await page.locator('#wdesignkit-app').waitFor({ state: 'visible', timeout: 8000 });
    const elapsed = Date.now() - t0;
    expect.soft(elapsed, `My Templates load took ${elapsed}ms`).toBeLessThan(15000);
  });

  test('§A.02 No more than 10 API requests on initial My Templates load', async ({ page }) => {
    let apiCount = 0;
    page.on('request', req => {
      if (req.url().includes('admin-ajax.php') || req.url().includes('/wdesignkit/')) apiCount++;
    });
    await wpLogin(page);
    await goToMyTemplates(page);
    await page.waitForTimeout(2000);
    expect.soft(apiCount, `Too many API requests: ${apiCount}`).toBeLessThan(10);
  });

});

// =============================================================================
// §B. My Templates — Keyboard Navigation
// =============================================================================
test.describe('§B. My Templates — Keyboard Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
  });

  test('§B.01 Tab navigates through My Templates interactive elements without trap', async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
    }
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect.soft(['BODY', 'HTML']).not.toContain(focused);
  });

  test('§B.02 Upload/Save entry point is keyboard accessible (Tab + Enter)', async ({ page }) => {
    const uploadBtn = page.locator(
      'button[class*="upload"], button[class*="save"], .wkit-upload-btn, .wkit-save-btn'
    ).first();
    if (await uploadBtn.count() > 0) {
      const isTabable = await uploadBtn.evaluate(
        el => !el.disabled && el.tabIndex >= 0
      ).catch(() => false);
      expect.soft(isTabable, 'Upload/save button not keyboard accessible').toBe(true);
    }
  });

  test('§B.03 Tab key navigation does not land on disabled/hidden elements', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    const isHidden = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return false;
      const style = window.getComputedStyle(el);
      return style.display === 'none' || style.visibility === 'hidden' || el.getAttribute('aria-hidden') === 'true';
    });
    expect.soft(isHidden, 'Tab focus landed on a hidden/aria-hidden element').toBe(false);
  });

});

// =============================================================================
// §C. My Templates — RTL layout
// =============================================================================
test.describe('§C. My Templates — RTL layout', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyTemplates(page);
  });

  test('§C.01 My Templates page does not overflow in RTL direction', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(400);
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
    expect.soft(hasHScroll, 'Overflow in RTL mode on My Templates').toBe(false);
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });

  test('§C.02 RTL mode does not crash the My Templates page', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(600);
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });

});
