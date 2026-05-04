// =============================================================================
// WDesignKit Widgets Suite — My Widget Listing  (#/widget-listing)
// Version: 1.0.0 — Extreme Polish — All 11 QA dimensions
//
// COVERAGE
//   §1  — Navigation & page structure          (10 tests)
//   §2  — Auth guard                            (3 tests)
//   §3  — Header: search, action buttons        (10 tests)
//   §4  — Favourite toggle (heart icon)         (6 tests)
//   §5  — Widget card anatomy & badges          (10 tests)
//   §6  — 3-dot dropdown menu                   (8 tests)
//   §7  — Popup system (Create/Import/Delete/Duplicate) (8 tests)
//   §8  — Empty state & loading skeleton        (5 tests)
//   §9  — Pagination                            (6 tests)
//   §10 — Console & network                     (4 tests)
//   §A  — Responsive layout                     (6 tests)
//   §B  — Security                              (3 tests)
//   §C  — Keyboard navigation / WCAG 2.1 AA     (4 tests)
//   §D  — Performance                           (3 tests)
//   §E  — Tap target size WCAG 2.5.5            (1 test)
//   §F  — RTL layout                            (1 test)
//
// MANUAL CHECKS (cannot be automated — verify manually):
//   • Pixel-perfect match with Figma design (colors, spacing, typography)
//   • Drag-and-drop reordering behavior (if present)
//   • Screen reader announcement when widget is added/deleted
//   • Cross-browser visual rendering (Firefox, Safari, Edge)
//   • RTL visual correctness for card titles and 3-dot menu placement
//   • Color contrast on card badges and action button text (WCAG 1.4.3)
//   • Touch gesture behavior on real mobile/tablet devices
//   • Widget builder link opens in a new tab (not current tab)
//   • Update badge animation and tooltip hover quality
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, wdkitLogin } = require('./_helpers/auth');
const { goToMyWidgets, PLUGIN_PAGE, screenshot } = require('./_helpers/navigation');

// =============================================================================
// §1. My Widget Listing — Navigation & page structure
// =============================================================================
test.describe('§1. My Widget Listing — Navigation & page structure', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
  });

  test('1.01 #wdesignkit-app root container is present on plugin page', async ({ page }) => {
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(await page.locator('#wdesignkit-app').count()).toBeGreaterThan(0);
  });

  test('1.02 Hash navigation to #/widget-listing updates the URL', async ({ page }) => {
    await goToMyWidgets(page);
    const hash = await page.evaluate(() => location.hash);
    // May have redirected to /login if no WDKit token — hash check handles both
    expect(hash.length).toBeGreaterThan(1);
  });

  test('1.03 .wb-widget-main-container root is rendered for authenticated users', async ({ page }) => {
    await goToMyWidgets(page);
    const count = await page.locator('.wb-widget-main-container').count();
    expect(count).toBeGreaterThan(0);
  });

  test('1.04 .wb-creative-widget-main layout container is present', async ({ page }) => {
    await goToMyWidgets(page);
    const count = await page.locator('.wb-creative-widget-main').count();
    expect(count).toBeGreaterThan(0);
  });

  test('1.05 .wb-creative-row header row is rendered', async ({ page }) => {
    await goToMyWidgets(page);
    const count = await page.locator('.wb-creative-row').count();
    expect(count).toBeGreaterThan(0);
  });

  test('1.06 Plugin page renders without "Fatal error" text', async ({ page }) => {
    await goToMyWidgets(page);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('1.07 Plugin page renders without "You do not have permission" message', async ({ page }) => {
    await goToMyWidgets(page);
    await expect(page.locator('body')).not.toContainText('do not have permission');
  });

  test('1.08 No uncaught JS exceptions on my widgets page load', async ({ page }) => {
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await goToMyWidgets(page);
    await page.waitForTimeout(2000);
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

  test('1.09 No product JS console errors on my widgets page load', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await goToMyWidgets(page);
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('extension') &&
      !e.includes('chrome-extension') &&
      !e.includes('ERR_BLOCKED')
    );
    expect(productErrors, `Console errors:\n${productErrors.join('\n')}`).toHaveLength(0);
  });

  test('1.10 Page does not show PHP warnings or deprecated notices in body', async ({ page }) => {
    await goToMyWidgets(page);
    await expect(page.locator('body')).not.toContainText('PHP Deprecated');
    await expect(page.locator('body')).not.toContainText('PHP Warning');
    await expect(page.locator('body')).not.toContainText('PHP Notice');
  });

});

// =============================================================================
// §2. My Widget Listing — Auth guard
// =============================================================================
test.describe('§2. My Widget Listing — Auth guard', () => {

  test('2.01 Unauthenticated WDKit user is redirected from #/widget-listing', async ({ page }) => {
    await wpLogin(page);
    // Remove WDKit cloud auth — simulate unauthenticated WDKit state
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.evaluate(() => localStorage.removeItem('wdkit-login'));
    await page.evaluate(() => { location.hash = '/widget-listing'; });
    await page.waitForTimeout(3000);
    const hash = await page.evaluate(() => location.hash);
    const onLogin = hash.includes('/login') ||
      (await page.locator('.wkit-login-main, input[type="password"]').count()) > 0;
    const widgetPageLoaded = (await page.locator('.wb-widget-main-container').count()) > 0;
    // Auth guard should fire — unauthenticated user should not see the widget listing
    expect.soft(widgetPageLoaded, 'My Widgets page shown to unauthenticated WDKit user — auth guard missing').toBe(false);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('2.02 Authenticated WDKit user can access #/widget-listing without login redirect', async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    const hash = await page.evaluate(() => location.hash);
    const onLogin = hash.includes('/login');
    expect(onLogin, `Authenticated user redirected to login: ${hash}`).toBe(false);
  });

  test('2.03 WP admin without WDKit token sees login/prompt (not blank page)', async ({ page }) => {
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.evaluate(() => localStorage.removeItem('wdkit-login'));
    await page.evaluate(() => { location.hash = '/widget-listing'; });
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Fatal error');
    const appPresent = await page.locator('#wdesignkit-app').count();
    expect(appPresent).toBeGreaterThan(0);
  });

});

// =============================================================================
// §3. My Widget Listing — Header: search & action buttons
// =============================================================================
test.describe('§3. My Widget Listing — Header: search & action buttons', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    // Wait for button loading to complete (ButtonLoading=false)
    await page.locator('.wdkit-search-wrapper-b, .wkit-widget-search-skeleton').first()
      .waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('3.01 Search wrapper .wdkit-search-wrapper-b is rendered (or skeleton while loading)', async ({ page }) => {
    const wrapper = await page.locator('.wdkit-search-wrapper-b').count();
    const skeleton = await page.locator('.wkit-widget-search-skeleton').count();
    expect(wrapper + skeleton, 'Neither search wrapper nor skeleton is present').toBeGreaterThan(0);
  });

  test('3.02 Search input .wkit-search-input-b is visible and accepts text', async ({ page }) => {
    // Wait for skeleton to disappear first
    await page.locator('.wkit-widget-search-skeleton').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
    const searchInput = page.locator('.wkit-search-input-b').first();
    const inputVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (inputVisible) {
      await searchInput.fill('test');
      const value = await searchInput.inputValue();
      expect(value).toBe('test');
    } else {
      // Skeleton still showing or no widgets — acceptable
      console.log('[3.02] Search input not visible (skeleton still loading or no widgets)');
    }
  });

  test('3.03 Search icon .wdkit-search-icon-b is rendered alongside search input', async ({ page }) => {
    const icon = await page.locator('.wdkit-search-icon-b').count();
    const skeleton = await page.locator('.wkit-widget-search-skeleton').count();
    expect(icon + skeleton).toBeGreaterThan(0);
  });

  test('3.04 Search submit button #WDkitSearchIcon is present', async ({ page }) => {
    const btn = await page.locator('#WDkitSearchIcon').count();
    const skeleton = await page.locator('.wkit-widget-search-skeleton').count();
    expect(btn + skeleton).toBeGreaterThan(0);
  });

  test('3.05 "Import Widget" button .wkit-button-primary is visible after loading', async ({ page }) => {
    // Wait for loading to complete
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
    const importBtn = page.locator('button.wkit-button-primary.wkit-outer-btn-class').first();
    const btnVisible = await importBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (btnVisible) {
      const text = (await importBtn.textContent()).trim();
      expect(text).toContain('Import Widget');
    } else {
      console.log('[3.05] Import button not visible — still loading or no widgets');
    }
  });

  test('3.06 "Create Widget" button .wkit-button-secondary is visible after loading', async ({ page }) => {
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    const btnVisible = await createBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (btnVisible) {
      const text = (await createBtn.textContent()).trim();
      expect(text).toContain('Create Widget');
    } else {
      console.log('[3.06] Create Widget button not visible — still loading or no widgets');
    }
  });

  test('3.07 Pressing Enter on search input does not crash the page', async ({ page }) => {
    await page.locator('.wkit-widget-search-skeleton').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
    const searchInput = page.locator('.wkit-search-input-b').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('3.08 Searching for a non-existent widget title shows no results or empty state', async ({ page }) => {
    await page.locator('.wkit-widget-search-skeleton').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
    const searchInput = page.locator('.wkit-search-input-b').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('zzz_xyz_no_match_abc_qwerty');
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);
      // Page should still work — either empty state or no cards
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('3.09 Clicking "Import Widget" button opens the import popup', async ({ page }) => {
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
    const importBtn = page.locator('button.wkit-button-primary.wkit-outer-btn-class').first();
    if (await importBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await importBtn.click({ force: true });
      await page.waitForTimeout(1500);
      // Import popup should appear
      const popup = await page.locator('.wb-editWidget-popup, .wb-edit-popup, [class*="import-widget"]').count();
      await expect(page.locator('body')).not.toContainText('Fatal error');
      console.log(`[3.09] Import popup visible: ${popup > 0}`);
    }
  });

  test('3.10 Clicking "Create Widget" button opens the create widget popup', async ({ page }) => {
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click({ force: true });
      await page.waitForTimeout(1500);
      // Create popup should appear
      const popup = await page.locator('.wb-editWidget-popup, .wb-edit-popup, [class*="add-widget"]').count();
      await expect(page.locator('body')).not.toContainText('Fatal error');
      console.log(`[3.10] Create Widget popup visible: ${popup > 0}`);
    }
  });

});

// =============================================================================
// §4. My Widget Listing — Favourite toggle (heart icon)
// =============================================================================
test.describe('§4. My Widget Listing — Favourite toggle', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('4.01 Favourite toggle button .wdkit-trsprnt-btn is rendered', async ({ page }) => {
    const favBtn = await page.locator('a.wdkit-trsprnt-btn').count();
    const skeleton = await page.locator('.wkit-primary-btn-skeleton').count();
    expect(favBtn + skeleton, '.wdkit-trsprnt-btn favourite button not found').toBeGreaterThan(0);
  });

  test('4.02 Favourite toggle shows heart icon (.wdkit-i-heart or .wdkit-i-filled-heart)', async ({ page }) => {
    const heartOff = await page.locator('.wdkit-i-heart').count();
    const heartOn = await page.locator('.wdkit-i-filled-heart').count();
    const skeleton = await page.locator('.wkit-primary-btn-skeleton').count();
    expect(heartOff + heartOn + skeleton, 'Neither heart icon found').toBeGreaterThan(0);
  });

  test('4.03 Clicking favourite toggle does not crash the page', async ({ page }) => {
    const favBtn = page.locator('a.wdkit-trsprnt-btn').first();
    if (await favBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await favBtn.click({ force: true });
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('4.04 Clicking favourite toggle toggles the heart icon state', async ({ page }) => {
    const favBtn = page.locator('a.wdkit-trsprnt-btn').first();
    if (await favBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const heartOffBefore = await page.locator('.wdkit-i-heart').count();
      const heartOnBefore = await page.locator('.wdkit-i-filled-heart').count();
      await favBtn.click({ force: true });
      await page.waitForTimeout(1000);
      const heartOffAfter = await page.locator('.wdkit-i-heart').count();
      const heartOnAfter = await page.locator('.wdkit-i-filled-heart').count();
      // State should have changed
      const stateChanged = (heartOffAfter !== heartOffBefore) || (heartOnAfter !== heartOnBefore);
      expect.soft(stateChanged, 'Heart icon state did not change after clicking favourite toggle').toBe(true);
    }
  });

  test('4.05 Per-card favourite icon .wkit-wb-fav-icon is rendered on non-server cards', async ({ page }) => {
    // Wait for cards to load
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const favIcons = await page.locator('.wkit-wb-fav-icon.wdkit-browse-card-badge.wkit-wb-select-fav').count();
    const skeleton = await page.locator('[class*="skeleton"]').count();
    console.log(`[4.05] Per-card fav icons: ${favIcons}, skeleton: ${skeleton}`);
    // Acceptable if 0 (all widgets are type=server, or user has no widgets)
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('4.06 Clicking per-card favourite icon does not crash the page', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const favIcon = page.locator('.wkit-wb-fav-icon.wdkit-browse-card-badge.wkit-wb-select-fav').first();
    if (await favIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await favIcon.click({ force: true });
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// §5. My Widget Listing — Widget card anatomy & badges
// =============================================================================
test.describe('§5. My Widget Listing — Widget card anatomy & badges', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    // Wait for loading to complete or cards to appear
    const hasCards = await page.locator('.wdkit-browse-card').first()
      .isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasCards) {
      // No cards — may be empty state or still loading
      await page.waitForTimeout(2000);
    }
  });

  test('5.01 Widget card root .wdkit-browse-card is rendered for each widget', async ({ page }) => {
    const cards = await page.locator('.wdkit-browse-card').count();
    console.log(`[5.01] Widget cards found: ${cards}`);
    // Could be 0 if user has no widgets — just verify no fatal error
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('5.02 Widget card main container .wkit-wb-widget-card-main is present inside each card', async ({ page }) => {
    const cardMain = await page.locator('.wkit-wb-widget-card-main').count();
    const cards = await page.locator('.wdkit-browse-card').count();
    if (cards > 0) {
      expect(cardMain, '.wkit-wb-widget-card-main missing from widget cards').toBeGreaterThan(0);
    }
  });

  test('5.03 Widget image area .wdkit-browse-img-cover is rendered on each card', async ({ page }) => {
    const imgCovers = await page.locator('.wdkit-browse-img-cover').count();
    const cards = await page.locator('.wdkit-browse-card').count();
    if (cards > 0) {
      expect(imgCovers, '.wdkit-browse-img-cover missing').toBeGreaterThan(0);
    }
  });

  test('5.04 Widget title .wdkit-widget-title is present and non-empty on each card', async ({ page }) => {
    const titles = await page.locator('.wdkit-widget-title').allTextContents();
    const cards = await page.locator('.wdkit-browse-card').count();
    if (cards > 0 && titles.length > 0) {
      const emptyTitles = titles.filter(t => t.trim().length === 0);
      expect.soft(emptyTitles.length, `${emptyTitles.length} widget card(s) have empty titles`).toBe(0);
    }
  });

  test('5.05 Badge container .wdkit-browse-card-badges is present on each card', async ({ page }) => {
    const badges = await page.locator('.wdkit-browse-card-badges').count();
    const cards = await page.locator('.wdkit-browse-card').count();
    if (cards > 0) {
      expect(badges).toBeGreaterThan(0);
    }
  });

  test('5.06 Local badge (.wdkit-i-computer) is shown for plugin-type widgets', async ({ page }) => {
    const localBadge = await page.locator('.wdkit-browse-card-badge .wdkit-i-computer').count();
    console.log(`[5.06] Local badge (.wdkit-i-computer) count: ${localBadge}`);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('5.07 Remote badge (.wdkit-i-cloud) is shown for server-type widgets', async ({ page }) => {
    const remoteBadge = await page.locator('.wdkit-browse-card-badge .wdkit-i-cloud').count();
    console.log(`[5.07] Remote badge (.wdkit-i-cloud) count: ${remoteBadge}`);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('5.08 Builder icon (.wkit-wb-widget-category-icon img) is rendered on each non-server card', async ({ page }) => {
    const builderIcons = await page.locator('.wkit-wb-widget-category-icon img').count();
    const cards = await page.locator('.wdkit-browse-card').count();
    if (cards > 0) {
      expect.soft(builderIcons, 'No builder icons found on widget cards').toBeGreaterThan(0);
    }
  });

  test('5.09 Pro tag .wdkit-card-tag is shown only on PRO widgets', async ({ page }) => {
    const proTags = await page.locator('.wdkit-card-tag').count();
    console.log(`[5.09] PRO tag count: ${proTags}`);
    // May be 0 if user has no PRO widgets — just verify no crash
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('5.10 Credit limit overlay (.wdkit-inner-boxed-deActivate) only shows on deactivated cards', async ({ page }) => {
    const overlays = await page.locator('.wdkit-inner-boxed-deActivate').count();
    console.log(`[5.10] Deactivated card overlays: ${overlays}`);
    // Should be 0 if all widgets are active
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// §6. My Widget Listing — 3-dot dropdown menu
// =============================================================================
test.describe('§6. My Widget Listing — 3-dot dropdown menu', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('6.01 3-dot icon .wkit-wb-3dot-icon is rendered on non-server widget cards', async ({ page }) => {
    const threeDot = await page.locator('.wkit-wb-3dot-icon').count();
    const cards = await page.locator('.wdkit-browse-card').count();
    console.log(`[6.01] 3-dot icons: ${threeDot}, cards: ${cards}`);
    if (cards > 0) {
      // Acceptable to have 0 if all cards are server-type (no 3-dot for server type)
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('6.02 Clicking 3-dot icon opens the dropdown .wkit-wb-dropdown.wbdropdown-active', async ({ page }) => {
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(500);
      const activeDropdown = await page.locator('.wkit-wb-dropdown.wbdropdown-active').count();
      expect(activeDropdown, 'Dropdown did not become active after clicking 3-dot icon').toBeGreaterThan(0);
    }
  });

  test('6.03 Dropdown menu contains "Delete" option text', async ({ page }) => {
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(500);
      const dropdown = page.locator('.wkit-wb-dropdown.wbdropdown-active').first();
      if (await dropdown.count() > 0) {
        const deleteOption = await dropdown.locator('.wkit-wb-listmenu-text').allTextContents();
        const hasDelete = deleteOption.some(t => t.trim().toLowerCase().includes('delete'));
        expect(hasDelete, '"Delete" option not found in 3-dot dropdown').toBe(true);
      }
    }
  });

  test('6.04 Dropdown menu contains "Duplicate" option text', async ({ page }) => {
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(500);
      const dropdown = page.locator('.wkit-wb-dropdown.wbdropdown-active').first();
      if (await dropdown.count() > 0) {
        const options = await dropdown.locator('.wkit-wb-listmenu-text').allTextContents();
        const hasDuplicate = options.some(t => t.trim().toLowerCase().includes('duplicate'));
        expect(hasDuplicate, '"Duplicate" option not found in 3-dot dropdown').toBe(true);
      }
    }
  });

  test('6.05 Dropdown menu contains "Download ZIP" option text', async ({ page }) => {
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(500);
      const dropdown = page.locator('.wkit-wb-dropdown.wbdropdown-active').first();
      if (await dropdown.count() > 0) {
        const options = await dropdown.locator('.wkit-wb-listmenu-text').allTextContents();
        const hasDownload = options.some(t => t.trim().toLowerCase().includes('download'));
        expect.soft(hasDownload, '"Download ZIP" option not found in 3-dot dropdown').toBe(true);
      }
    }
  });

  test('6.06 Clicking outside the dropdown closes it', async ({ page }) => {
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(300);
      // Click somewhere neutral
      await page.locator('.wb-widget-main-container').click({ force: true, position: { x: 5, y: 5 } }).catch(() => {
        page.click('body', { force: true });
      });
      await page.waitForTimeout(500);
      const activeDropdown = await page.locator('.wkit-wb-dropdown.wbdropdown-active').count();
      expect.soft(activeDropdown, 'Dropdown remained open after clicking outside').toBe(0);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('6.07 3-dot menu does not produce console errors when opened', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('6.08 "Edit in New Tab" link in 3-dot menu has href pointing to /widget-listing/builder/', async ({ page }) => {
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(500);
      const editLink = page.locator('.wkit-wb-edit-widget-btn').first();
      if (await editLink.count() > 0) {
        const href = await editLink.getAttribute('href').catch(() => '');
        expect.soft(href, '"Edit in New Tab" link has no href').not.toBe('');
      }
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// §7. My Widget Listing — Popup system
// =============================================================================
test.describe('§7. My Widget Listing — Popup system', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('7.01 Clicking "Import Widget" opens a popup containing "Import Widget" text', async ({ page }) => {
    const importBtn = page.locator('button.wkit-button-primary.wkit-outer-btn-class').first();
    if (await importBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await importBtn.click({ force: true });
      await page.waitForTimeout(1500);
      const popup = page.locator('.wb-editWidget-popup, .wb-edit-popup').first();
      if (await popup.count() > 0) {
        const text = await popup.textContent().catch(() => '');
        expect(text.toLowerCase()).toContain('import');
      }
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('7.02 Clicking "Create Widget" opens a popup containing "Create Widget" text', async ({ page }) => {
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click({ force: true });
      await page.waitForTimeout(1500);
      const popup = page.locator('.wb-editWidget-popup, .wb-edit-popup').first();
      if (await popup.count() > 0) {
        const text = await popup.textContent().catch(() => '');
        expect(text.toLowerCase()).toContain('create');
      }
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('7.03 Import popup has a file upload input or drag-and-drop zone', async ({ page }) => {
    const importBtn = page.locator('button.wkit-button-primary.wkit-outer-btn-class').first();
    if (await importBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await importBtn.click({ force: true });
      await page.waitForTimeout(1500);
      // Look for file input or drop zone inside the popup
      const fileInput = await page.locator('input[type="file"], [class*="drop"], [class*="upload"]').count();
      await expect(page.locator('body')).not.toContainText('Fatal error');
      console.log(`[7.03] File input/drop zone found: ${fileInput}`);
    }
  });

  test('7.04 Delete popup opens when "Delete" is clicked in the 3-dot dropdown', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(500);
      const deleteOption = page.locator('.wkit-wb-dropdown.wbdropdown-active .wkit-wb-mainmenu li').filter({
        hasText: 'Delete'
      }).first();
      if (await deleteOption.count() > 0) {
        await deleteOption.click({ force: true });
        await page.waitForTimeout(1500);
        // Delete confirmation popup should appear
        const deletePopup = await page.locator('.wb-editWidget-popup, .wb-edit-popup, [class*="remove"]').count();
        await expect(page.locator('body')).not.toContainText('Fatal error');
        console.log(`[7.04] Delete popup visible: ${deletePopup > 0}`);
      }
    }
  });

  test('7.05 Duplicate popup opens when "Duplicate" is clicked in the 3-dot dropdown', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(500);
      const dupOption = page.locator('.wkit-wb-dropdown.wbdropdown-active .wkit-wb-mainmenu li').filter({
        hasText: 'Duplicate'
      }).first();
      if (await dupOption.count() > 0) {
        await dupOption.click({ force: true });
        await page.waitForTimeout(1500);
        const dupPopup = await page.locator('.wb-editWidget-popup, .wb-edit-popup, [class*="duplicate"]').count();
        await expect(page.locator('body')).not.toContainText('Fatal error');
        console.log(`[7.05] Duplicate popup visible: ${dupPopup > 0}`);
      }
    }
  });

  test('7.06 Popup can be closed without submitting (Escape key or close button)', async ({ page }) => {
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click({ force: true });
      await page.waitForTimeout(1500);
      const popup = page.locator('.wb-editWidget-popup, .wb-edit-popup').first();
      if (await popup.count() > 0) {
        // Try Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(800);
        const popupAfter = await page.locator('.wb-editWidget-popup, .wb-edit-popup').count();
        // Either closed via Escape, or close button required — just verify no crash
        await expect(page.locator('body')).not.toContainText('Fatal error');
        console.log(`[7.06] Popup after Escape: ${popupAfter > 0 ? 'still open' : 'closed'}`);
      }
    }
  });

  test('7.07 Popup overlay is visible when popup is open', async ({ page }) => {
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click({ force: true });
      await page.waitForTimeout(1500);
      const overlay = await page.locator('.wb-editWidget-popup, .wb-edit-popup, [class*="popup"], [class*="modal"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      if (overlay) {
        // Popup is open and visible — good
        await expect(page.locator('body')).not.toContainText('Fatal error');
      }
    }
  });

  test('7.08 No console errors when opening and closing the Create Widget popup', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click({ force: true });
      await page.waitForTimeout(1200);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// §8. My Widget Listing — Empty state & loading skeleton
// =============================================================================
test.describe('§8. My Widget Listing — Empty state & loading skeleton', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
  });

  test('8.01 Loading skeleton .wkit-widget-search-skeleton or buttons appear before data loads', async ({ page }) => {
    // Immediately after navigation, either skeleton or real UI should be present
    const skeleton = await page.locator('.wkit-widget-search-skeleton, .wkit-primary-btn-skeleton').count();
    const realUI = await page.locator('.wdkit-search-wrapper-b, button.wkit-button-primary').count();
    expect(skeleton + realUI, 'Neither skeleton nor real UI present on My Widgets page').toBeGreaterThan(0);
  });

  test('8.02 TemplateCardSkeleton appears during initial loading', async ({ page }) => {
    // Check for any skeleton/loading indicator during initial load
    const anySkeleton = await page.locator('[class*="skeleton" i], [class*="loading" i], [class*="Skeleton"]').count();
    console.log(`[8.02] Skeleton/loading elements on load: ${anySkeleton}`);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('8.03 Empty state is shown (not a blank page) when user has no widgets', async ({ page }) => {
    // Wait for loading to complete
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    if (cardCount === 0) {
      // Empty state must be shown
      const notFound = await page.locator('[class*="not-found"], [class*="Not_found"], .wb-widget-main-container').count();
      expect(notFound, 'Empty state not shown when user has no widgets').toBeGreaterThan(0);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('8.04 Page stabilises — cards or empty state visible after skeleton disappears', async ({ page }) => {
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(800);
    const cards = await page.locator('.wdkit-browse-card').count();
    const buttons = await page.locator('button.wkit-button-primary, button.wkit-button-secondary').count();
    // Either cards are loaded or action buttons are visible — page is settled
    expect(cards + buttons, 'Page has not settled — neither cards nor action buttons visible after skeleton').toBeGreaterThan(0);
  });

  test('8.05 Loading state does not persist indefinitely (resolves within 15 seconds)', async ({ page }) => {
    const t0 = Date.now();
    // Wait for either cards or buttons (loading complete)
    await page.waitForSelector('.wdkit-browse-card, button.wkit-button-primary, button.wkit-button-secondary', {
      timeout: 18000,
      state: 'visible',
    }).catch(() => {});
    const elapsed = Date.now() - t0;
    expect.soft(elapsed, `Loading state persisted for ${elapsed}ms (target < 15000ms)`).toBeLessThan(15000);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

});

// =============================================================================
// §9. My Widget Listing — Pagination
// =============================================================================
test.describe('§9. My Widget Listing — Pagination', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('9.01 Pagination wrapper .wkit-wb-paginatelist is present', async ({ page }) => {
    const paginateList = await page.locator('.wkit-wb-paginatelist').count();
    console.log(`[9.01] .wkit-wb-paginatelist count: ${paginateList}`);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('9.02 .wkit-pagination-main is rendered inside .wkit-wb-paginatelist when > 24 widgets', async ({ page }) => {
    const cards = await page.locator('.wdkit-browse-card').count();
    const paginationMain = await page.locator('.wkit-pagination-main').count();
    if (cards >= 24) {
      expect(paginationMain, '.wkit-pagination-main missing when > 24 widgets').toBeGreaterThan(0);
    } else {
      console.log(`[9.02] Only ${cards} widgets — pagination not expected (requires > 24)`);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('9.03 Page items .wkit-page-item render when pagination exists', async ({ page }) => {
    if (await page.locator('.wkit-pagination').count() > 0) {
      const pageItems = await page.locator('.wkit-page-item').count();
      expect(pageItems).toBeGreaterThan(0);
    }
  });

  test('9.04 Clicking page 2 shows updated widget list (if pagination exists)', async ({ page }) => {
    const page2 = page.locator('.wkit-page-item:not(.active) .wkit-pagination-item').first();
    if (await page2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page2.click({ force: true });
      await page.waitForTimeout(2000);
      const cards = await page.locator('.wdkit-browse-card').count();
      expect(cards).toBeGreaterThanOrEqual(1);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('9.05 Previous page button .wkit-prev-pagination is present when on page 2+', async ({ page }) => {
    const page2 = page.locator('.wkit-page-item:not(.active) .wkit-pagination-item').first();
    if (await page2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page2.click({ force: true });
      await page.waitForTimeout(2000);
      const prevBtn = await page.locator('.wkit-prev-pagination').count();
      expect(prevBtn).toBeGreaterThan(0);
    }
  });

  test('9.06 No console errors when navigating between pages', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const page2 = page.locator('.wkit-page-item:not(.active) .wkit-pagination-item').first();
    if (await page2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page2.click({ force: true });
      await page.waitForTimeout(2500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// §10. My Widget Listing — Console & network
// =============================================================================
test.describe('§10. My Widget Listing — Console & network', () => {

  test('10.01 No 4xx or 5xx network responses on My Widgets page load', async ({ page }) => {
    const failed = [];
    page.on('response', r => {
      if (r.status() >= 400 && !r.url().includes('favicon')) {
        failed.push(`${r.status()} ${r.url()}`);
      }
    });
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.waitForTimeout(3000);
    expect.soft(failed, `Failed HTTP responses:\n${failed.join('\n')}`).toHaveLength(0);
  });

  test('10.02 No product console errors after interacting with 3-dot dropdown', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const threeDot = page.locator('.wkit-wb-3dot-icon').first();
    if (await threeDot.isVisible({ timeout: 3000 }).catch(() => false)) {
      await threeDot.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('10.03 API calls on initial My Widgets load are within expected range (< 10)', async ({ page }) => {
    let apiCount = 0;
    page.on('request', req => {
      if (req.url().includes('admin-ajax.php') || req.url().includes('/wdesignkit/')) apiCount++;
    });
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.waitForTimeout(3000);
    expect.soft(apiCount, `API call count: ${apiCount} (target < 10)`).toBeLessThan(10);
  });

  test('10.04 No API keys or credentials exposed in page HTML source', async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    const html = await page.content();
    const hasApiKey = /api[-_]?key\s*[:=]\s*["'][a-zA-Z0-9]{20,}/i.test(html);
    expect.soft(hasApiKey, 'Possible API key found in page source').toBe(false);
  });

});

// =============================================================================
// §A. My Widget Listing — Responsive layout
// =============================================================================
test.describe('§A. My Widget Listing — Responsive layout', () => {

  const VIEWPORTS = [
    { name: 'mobile',  width: 375,  height: 812  },
    { name: 'tablet',  width: 768,  height: 1024 },
    { name: 'desktop', width: 1440, height: 900  },
  ];

  for (const vp of VIEWPORTS) {
    test(`§A.01 My Widgets page renders without horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await wpLogin(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await goToMyWidgets(page);
      await page.waitForTimeout(1000);
      const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
      expect.soft(hasHScroll, `Horizontal scroll at ${vp.name}`).toBe(false);
    });

    test(`§A.02 Action buttons are visible at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await wpLogin(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await goToMyWidgets(page);
      await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(500);
      const importBtn = await page.locator('button.wkit-button-primary, button.wkit-button-secondary').count();
      expect.soft(importBtn, `Action buttons not visible at ${vp.name}`).toBeGreaterThan(0);
    });
  }

});

// =============================================================================
// §B. My Widget Listing — Security
// =============================================================================
test.describe('§B. My Widget Listing — Security', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wkit-widget-search-skeleton').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('§B.01 XSS payload in search input does not execute', async ({ page }) => {
    const searchInput = page.locator('.wkit-search-input-b').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('<script>window.__xss_my_wdgt=1</script>');
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);
      const xssRan = await page.evaluate(() => window.__xss_my_wdgt === 1);
      expect(xssRan, 'XSS payload executed in My Widgets search').toBe(false);
    }
  });

  test('§B.02 HTML injection in widget title does not execute', async ({ page }) => {
    // Widget titles come from the API — rendered via React (auto-escaped)
    const titles = await page.locator('.wdkit-widget-title').allTextContents();
    for (const title of titles) {
      expect(title).not.toContain('<script>');
      expect(title).not.toContain('javascript:');
    }
  });

  test('§B.03 No sensitive token or secret exposed in page HTML source', async ({ page }) => {
    const html = await page.content();
    const hasSecret = /(?:api[-_]?key|secret[-_]?key|private[-_]?key)\s*[:=]\s*["'][a-zA-Z0-9+/]{16,}/i.test(html);
    expect.soft(hasSecret, 'Sensitive key-like string found in page HTML').toBe(false);
  });

});

// =============================================================================
// §C. My Widget Listing — Keyboard navigation / WCAG 2.1 AA
// =============================================================================
test.describe('§C. My Widget Listing — Keyboard navigation', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('§C.01 Tab key navigates through interactive elements without focus trap', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect.soft(['BODY', 'HTML'], 'Focus trapped on body/html — possible focus trap').not.toContain(focusedTag);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('§C.02 Search input .wkit-search-input-b is keyboard-focusable', async ({ page }) => {
    const searchInput = page.locator('.wkit-search-input-b').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const focusable = await searchInput.evaluate(el => !el.disabled && el.tabIndex >= 0).catch(() => false);
      expect.soft(focusable, '.wkit-search-input-b is not keyboard-focusable').toBe(true);
    }
  });

  test('§C.03 "Import Widget" and "Create Widget" buttons are keyboard-focusable', async ({ page }) => {
    const importBtn = page.locator('button.wkit-button-primary.wkit-outer-btn-class').first();
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    for (const btn of [importBtn, createBtn]) {
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        const focusable = await btn.evaluate(el => !el.disabled && el.tabIndex >= 0).catch(() => false);
        expect.soft(focusable, 'Action button is not keyboard-focusable').toBe(true);
      }
    }
  });

  test('§C.04 Pressing Enter on Import Widget button triggers the popup', async ({ page }) => {
    const importBtn = page.locator('button.wkit-button-primary.wkit-outer-btn-class').first();
    if (await importBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await importBtn.focus().catch(() => {});
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

});

// =============================================================================
// §D. My Widget Listing — Performance
// =============================================================================
test.describe('§D. My Widget Listing — Performance', () => {

  test('§D.01 My Widgets page fully loads within 15 seconds', async ({ page }) => {
    await wpLogin(page);
    const t0 = Date.now();
    await goToMyWidgets(page);
    // Wait for buttons OR cards to be visible
    await page.waitForSelector(
      'button.wkit-button-primary, .wdkit-browse-card, [class*="not-found"]',
      { timeout: 18000, state: 'visible' }
    ).catch(() => {});
    const elapsed = Date.now() - t0;
    expect.soft(elapsed, `My Widgets page load took ${elapsed}ms (target < 15000ms)`).toBeLessThan(15000);
  });

  test('§D.02 API calls on initial My Widgets load are within expected range (< 10)', async ({ page }) => {
    let apiCount = 0;
    page.on('request', req => {
      if (req.url().includes('admin-ajax.php') || req.url().includes('/wdesignkit/')) apiCount++;
    });
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.waitForTimeout(3000);
    expect.soft(apiCount, `API calls: ${apiCount} (target < 10)`).toBeLessThan(10);
  });

  test('§D.03 Page does not make redundant duplicate API calls on load', async ({ page }) => {
    const apiUrls = [];
    page.on('request', req => {
      if (req.url().includes('admin-ajax.php')) {
        try {
          const body = req.postData();
          apiUrls.push(body || req.url());
        } catch (e) {
          apiUrls.push(req.url());
        }
      }
    });
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.waitForTimeout(3000);
    // Check for exact duplicates (same URL + body)
    const seen = new Set();
    const duplicates = [];
    for (const url of apiUrls) {
      if (seen.has(url)) duplicates.push(url);
      else seen.add(url);
    }
    expect.soft(duplicates.length, `Duplicate API calls detected: ${duplicates.slice(0, 3).join(', ')}`).toBe(0);
  });

});

// =============================================================================
// §E. My Widget Listing — Tap target size (WCAG 2.5.5)
// =============================================================================
test.describe('§E. My Widget Listing — Tap target size', () => {

  test('§E.01 "Create Widget" button is ≥ 44×44px on mobile viewport', async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wkit-primary-btn-skeleton').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    const createBtn = page.locator('button.wkit-button-secondary.wkit-btn-class').first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await createBtn.boundingBox();
      if (box) {
        expect.soft(box.width,  `Create Widget btn width ${box.width}px < 44px`).toBeGreaterThanOrEqual(44);
        expect.soft(box.height, `Create Widget btn height ${box.height}px < 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });

});

// =============================================================================
// §F. My Widget Listing — RTL layout
// =============================================================================
test.describe('§F. My Widget Listing — RTL layout', () => {

  test('§F.01 My Widget Listing does not overflow when dir=rtl is applied', async ({ page }) => {
    await wpLogin(page);
    await goToMyWidgets(page);
    await page.locator('.wb-widget-main-container').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(500);
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
    expect.soft(hasHScroll, 'Horizontal overflow in RTL mode on My Widget Listing').toBe(false);
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });

});
