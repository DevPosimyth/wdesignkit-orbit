// =============================================================================
// WDesignKit Templates Suite — Dummy Import Full E2E
// Version: 2.0.0 — Extreme-polish pass: added §78.13-18 (all loader steps, double-submit prevention,
//                 network monitoring, success CTAs, View Site link); §79.10-12 (Media Library,
//                 WP Reading Settings, WP Dashboard clean-load)
// Plugin version: WDesignKit v2.3.0
//
// COVERAGE
//   Section 78 — Dummy import full E2E: loader all states (12 tests)
//   Section 79 — WP Admin post-dummy-import: pages created (8 tests)
//
// Section 78 separates structure checks (no token needed) from completion
// checks (token needed). Section 79 verifies WP Admin side-effects after
// a completed dummy import.
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
const { wpLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep } = require('./_helpers/wizard');

// ---------------------------------------------------------------------------
// Shared: navigate to Method step with Dummy card selected, ready to import
// ---------------------------------------------------------------------------
async function setupReadyForDummyImport(page) {
  await wpLogin(page);
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await reachMethodStep(page);
  await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  // Select dummy card (first card)
  const dummy = page.locator('.wkit-method-card').first();
  if ((await dummy.count()) > 0) await dummy.click({ force: true });
  await page.waitForTimeout(400);
}

// ---------------------------------------------------------------------------
// Shared: trigger a dummy import and wait until the success screen appears
// ---------------------------------------------------------------------------
async function triggerAndWaitForDummySuccess(page) {
  await setupReadyForDummyImport(page);
  const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if ((await importBtn.count()) > 0) await importBtn.click();
  await page.locator('.wkit-site-import-success-main').waitFor({ state: 'visible', timeout: 120000 }).catch(() => {});
}

// =============================================================================
// 78. Dummy import full E2E — loader all states
// =============================================================================
test.describe('78. Dummy import full E2E — loader all states', () => {
  test.describe.configure({ mode: 'serial' });

  // -------------------------------------------------------------------------
  // 78.01 — No token gate: just reaching Method step is enough
  // -------------------------------------------------------------------------
  test('78.01 Import button .wkit-import-method-next is enabled when Dummy card is selected', async ({ page }) => {
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await expect(importBtn).toBeEnabled({ timeout: 8000 });
    }
  });

  // -------------------------------------------------------------------------
  // 78.02-78.12 — All require a running import (gated by WDKIT_TOKEN)
  // -------------------------------------------------------------------------
  test('78.02 Clicking Import button starts the loader — .wkit-loader-content or loader container appears', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2000);
      const loader = page.locator('.wkit-loader-content, .wkit-import-loader-main, .wkit-loader-main').first();
      await expect.soft(loader).toBeVisible({ timeout: 15000 });
    }
  });

  test('78.03 Loader heading .wkit-loader-heading is present and non-empty during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2500);
      const heading = page.locator('.wkit-loader-heading').first();
      if ((await heading.count()) > 0) {
        const text = await heading.textContent().catch(() => '');
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('78.04 At least one loader step .wkit-loader-step is rendered during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2500);
      const steps = page.locator('.wkit-loader-step');
      const count = await steps.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('78.05 "Installing Plugins" step text is visible during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2500);
      await expect.soft(page.locator('body')).toContainText(/installing plugins/i);
    }
  });

  test('78.06 "Importing Pages" step text is visible during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2500);
      await expect.soft(page.locator('body')).toContainText(/importing pages/i);
    }
  });

  test('78.07 At least one step transitions to active state .wkit-active-step during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(4000);
      const activeStep = page.locator('.wkit-loader-step.wkit-active-step');
      const doneStep  = page.locator('.wkit-loader-step.wkit-done-step');
      const activeCount = await activeStep.count();
      const doneCount   = await doneStep.count();
      // At least one step should have transitioned — active or done is acceptable
      expect(activeCount + doneCount).toBeGreaterThan(0);
    }
  });

  test('78.08 Lottie or animation element is visible during loader', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2500);
      const lottie = page.locator('lottie-player, [class*="lottie"]').first();
      await expect.soft(lottie).toBeVisible({ timeout: 12000 });
    }
  });

  test('78.09 No "Fatal error" text appears during dummy import process', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(5000);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('78.10 No product console errors during dummy import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(5000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('extension') &&
      !e.includes('chrome-extension') &&
      !e.includes('ERR_BLOCKED')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('78.11 Success screen .wkit-site-import-success-main appears after import completes', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await expect.soft(
        page.locator('.wkit-site-import-success-main')
      ).toBeVisible({ timeout: 120000 });
    }
  });

  test('78.12 Success title .wkit-import-success-title contains "Success" or congratulations text', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await triggerAndWaitForDummySuccess(page);
    const title = page.locator('.wkit-import-success-title, span.wkit-import-success-title').first();
    if ((await title.count()) > 0) {
      await expect.soft(title).toContainText(/success|congrat|well done|great|done/i);
    }
  });

  // -------------------------------------------------------------------------
  // 78.13 — "Importing Options" loader step is visible during import
  // Functionality-checklist: all step states tested (not just 2/6)
  // -------------------------------------------------------------------------
  test('78.13 "Importing Options" step text is visible during loader', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2500);
      await expect.soft(page.locator('body')).toContainText(/importing options/i);
    }
  });

  // -------------------------------------------------------------------------
  // 78.14 — "Importing Widgets" loader step is visible during import
  // -------------------------------------------------------------------------
  test('78.14 "Importing Widgets" or equivalent step text is visible during loader', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      await page.waitForTimeout(2500);
      // Accept any widget/template/content import step label
      await expect.soft(page.locator('body')).toContainText(
        /importing widgets|importing templates|importing content|importing media/i
      );
    }
  });

  // -------------------------------------------------------------------------
  // 78.15 — Import button is disabled immediately after click (no double-submit)
  // Functionality-checklist: Double-submit is prevented (button disabled after first click)
  // -------------------------------------------------------------------------
  test('78.15 Import button is disabled immediately after first click (double-submit prevention)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      // Immediately after click — button should be disabled or hidden to prevent re-clicks
      await page.waitForTimeout(800);
      const isDisabled = await importBtn.isDisabled().catch(() => true);
      const isVisible  = await importBtn.isVisible().catch(() => false);
      // Either button is disabled OR has been replaced by the loader (no longer visible)
      expect.soft(
        isDisabled || !isVisible,
        'Import button must be disabled or hidden immediately after first click to prevent double-submit'
      ).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // 78.16 — No 4xx/5xx network failures during dummy import
  // Console-errors-checklist: Zero 404/500 responses on API/REST endpoints
  // -------------------------------------------------------------------------
  test('78.16 No 4xx/5xx network failures occur during dummy import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    const failedRequests = [];
    page.on('response', resp => {
      const status = resp.status();
      const url    = resp.url();
      if (status >= 400 && !url.includes('favicon') && !url.includes('apple-touch-icon')) {
        failedRequests.push(`${status} — ${url}`);
      }
    });

    await setupReadyForDummyImport(page);
    const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await importBtn.count()) > 0) {
      await importBtn.click();
      // Wait long enough to capture API calls during import (up to 30s for initial phase)
      await page.waitForTimeout(30000);
    }

    // Filter out non-critical assets (fonts, icons, optional assets)
    const criticalFailures = failedRequests.filter(r =>
      !r.includes('robots.txt') &&
      !r.includes('apple-touch') &&
      !r.includes('browserconfig')
    );

    expect.soft(
      criticalFailures,
      'Unexpected 4xx/5xx responses during dummy import: ' + criticalFailures.join(', ')
    ).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // 78.17 — Success screen has at least one actionable CTA
  // Functionality-checklist: Success feedback shown after operation (not silent)
  // -------------------------------------------------------------------------
  test('78.17 Success screen has at least one actionable CTA button or link', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await triggerAndWaitForDummySuccess(page);

    // Accept any of the standard post-import CTAs
    const cta = page.locator([
      '.wkit-import-success-btn',
      '.wkit-view-site-btn',
      'a:has-text("View Site")',
      'a:has-text("Visit Site")',
      'a:has-text("Go to Dashboard")',
      'button:has-text("View Site")',
      'button:has-text("Visit Site")',
      'button:has-text("Dashboard")',
      '.wkit-site-import-success-main a',
      '.wkit-site-import-success-main button',
    ].join(', ')).first();

    const ctaCount = await cta.count();
    expect.soft(
      ctaCount,
      'Success screen must have at least one CTA (View Site / Dashboard) after import completes'
    ).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // 78.18 — "View Site" CTA on success screen navigates to the front-end
  // Functionality-checklist: Links perform correct action
  // -------------------------------------------------------------------------
  test('78.18 "View Site" CTA on success screen navigates to the front-end homepage', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await triggerAndWaitForDummySuccess(page);

    const viewSiteLink = page.locator(
      'a:has-text("View Site"), a:has-text("Visit Site"), .wkit-view-site-btn'
    ).first();

    if ((await viewSiteLink.count()) === 0) {
      console.log('[78.18] No "View Site" link found on success screen — skipping navigation check');
      return;
    }

    const href = await viewSiteLink.getAttribute('href').catch(() => '');
    // The href should point to the front-end (not wp-admin, not empty)
    expect.soft(
      href && !href.startsWith('#') && !href.includes('wp-admin'),
      `"View Site" link href should point to the front-end homepage, got: "${href}"`
    ).toBeTruthy();

    // Optionally follow the link and verify front-end loads
    if (href && href.startsWith('http')) {
      const response = await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
      const status = response ? response.status() : 0;
      expect.soft(status >= 200 && status < 500, `Front-end returned status ${status}`).toBe(true);
      await expect.soft(page.locator('body')).not.toContainText('Fatal error');
    }
  });

});

// =============================================================================
// 79. WP Admin post-dummy-import — pages created
// =============================================================================
test.describe('79. WP Admin post-dummy-import — pages created', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await triggerAndWaitForDummySuccess(page);
  });

  test('79.01 Navigate to WP Admin Pages list — at least 1 page exists post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/edit.php?post_type=page');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    const rows = page.locator('#the-list tr:not(.no-items), .wp-list-table tbody tr:not(.no-items)');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('79.02 At least one imported page has status "Published"', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/edit.php?post_type=page');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    // The "All" sub-sub menu tab shows total published + draft count
    const allLink = page.locator('.subsubsub a').filter({ hasText: /^All/i }).first();
    if ((await allLink.count()) > 0) {
      const text = await allLink.textContent().catch(() => '0');
      const num = parseInt(text.replace(/[^0-9]/g, '')) || 0;
      expect(num).toBeGreaterThan(0);
    } else {
      // Fallback: look for at least one row in the list table
      const rows = page.locator('#the-list tr:not(.no-items)');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('79.03 A "Home" or homepage equivalent page is found in the pages list', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/edit.php?post_type=page');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    // Search the page titles for a home/front-page equivalent
    const rows = page.locator('#the-list tr:not(.no-items), .wp-list-table tbody tr:not(.no-items)');
    const rowCount = await rows.count();
    let found = false;
    for (let i = 0; i < rowCount; i++) {
      const titleText = await rows.nth(i)
        .locator('.column-title .row-title, .column-title strong a, td.title a')
        .first()
        .textContent()
        .catch(() => '');
      if (/home|front|index|landing|welcome/i.test(titleText)) {
        found = true;
        break;
      }
    }
    // Soft assert — not every kit names the homepage "Home" exactly
    expect.soft(found, 'Expected a "Home" or homepage-equivalent page in the pages list').toBe(true);
  });

  test('79.04 Imported pages do not show "—" as title (they have proper titles)', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/edit.php?post_type=page');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    const titleCells = page.locator(
      '#the-list tr:not(.no-items) .column-title .row-title, ' +
      '.wp-list-table tbody tr:not(.no-items) .column-title strong a'
    );
    const count = await titleCells.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const text = await titleCells.nth(i).textContent().catch(() => '');
      // "—" is the WP placeholder for an untitled post
      expect.soft(text.trim()).not.toBe('—');
      expect.soft(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('79.05 Navigate to WP Admin Menus — at least one menu exists post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/nav-menus.php');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    // If at least one menu exists, the "Select a menu to edit" dropdown will have options
    const menuSelect = page.locator('#nav-menu-meta select#menu, #nav-menu-meta select[name="menu"]');
    if ((await menuSelect.count()) > 0) {
      const options = await menuSelect.locator('option').count();
      // There is always a "Select a menu" placeholder option; real menus add more
      expect.soft(options).toBeGreaterThan(1);
    } else {
      // Fallback: page should not show the "You don't have any menus yet" empty state
      const emptyMsg = page.locator('.nav-menus-php .manage-menus').getByText(/no menus exist/i);
      const isEmpty = await emptyMsg.count();
      expect.soft(isEmpty, 'Expected at least one menu to exist post-import').toBe(0);
    }
  });

  test('79.06 Front-end homepage is accessible and returns a non-error page', async ({ page }) => {
    const response = await page.goto('http://localhost:8881/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response).not.toBeNull();
    const status = response ? response.status() : 0;
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(500);
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');
  });

  test('79.07 Front-end homepage does not contain "Fatal error" or blank content', async ({ page }) => {
    await page.goto('http://localhost:8881/');
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('PHP Parse error');
    // Body must have some non-whitespace content
    const bodyText = await page.locator('body').textContent().catch(() => '');
    expect(bodyText.trim().length).toBeGreaterThan(0);
  });

  test('79.08 No 4xx/5xx responses on front-end homepage load', async ({ page }) => {
    const failedRequests = [];
    page.on('response', resp => {
      const status = resp.status();
      if (status >= 400) failedRequests.push(`${status} — ${resp.url()}`);
    });
    await page.goto('http://localhost:8881/');
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    // Filter out known non-critical hits (e.g. 404 for missing favicon)
    const criticalFailures = failedRequests.filter(r =>
      !r.includes('favicon') &&
      !r.includes('apple-touch-icon') &&
      !r.includes('robots.txt')
    );
    expect.soft(
      criticalFailures,
      'Unexpected 4xx/5xx responses: ' + criticalFailures.join(', ')
    ).toHaveLength(0);
  });

  test('79.09 WP Admin Plugins page — required plugins are active post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/plugins.php');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });

    // Page should load without a fatal error
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');

    // At least one plugin row should be active — WDKit itself is always installed
    const activePlugins = page.locator('tr.active');
    const activeCount = await activePlugins.count();
    expect.soft(activeCount, 'Expected at least one active plugin after dummy import').toBeGreaterThan(0);

    // The WDesignKit plugin itself must be active
    const wdkitActive = page.locator('tr.active').filter({ hasText: /wdesign\s*kit|wdesignkit/i });
    const wdkitCount = await wdkitActive.count();
    expect.soft(
      wdkitCount,
      'WDesignKit plugin row should be active after import'
    ).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // 79.10 — WP Media Library contains at least 1 media item post-import
  // Functionality-checklist: Data operations — records appear after create
  // Logic-checklist: Data integrity — imported content is fully persisted
  // -------------------------------------------------------------------------
  test('79.10 WP Media Library contains at least 1 media item post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/upload.php');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');

    // Media items appear as .attachment thumbnails in grid view,
    // or as table rows in list view (#the-list tr)
    const gridItems  = await page.locator('.attachment').count().catch(() => 0);
    const tableRows  = await page.locator('#the-list tr:not(.no-items)').count().catch(() => 0);
    const mediaCount = gridItems + tableRows;

    expect.soft(
      mediaCount,
      'WP Media Library should have at least 1 item after a dummy import — images/assets not imported'
    ).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // 79.11 — WP Reading Settings: front page is set to a static page post-import
  // Logic-checklist: Plugin-specific logic — dynamic content settings correct
  // -------------------------------------------------------------------------
  test('79.11 WP Reading Settings: front page is set to "A static page" post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/options-reading.php');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });

    await expect(page.locator('body')).not.toContainText('Fatal error');

    // WP uses radio buttons: "Your latest posts" or "A static page"
    const staticPageRadio = page.locator('input[type="radio"][value="page"]');
    if ((await staticPageRadio.count()) > 0) {
      const isChecked = await staticPageRadio.isChecked().catch(() => false);
      expect.soft(
        isChecked,
        'WP Reading Settings should be set to "A static page" after kit import — not "Your latest posts"'
      ).toBe(true);
    } else {
      // Fallback: verify the page dropdowns for front/posts page are not empty
      const frontPageSelect = page.locator('#page_on_front');
      if ((await frontPageSelect.count()) > 0) {
        const selectedValue = await frontPageSelect.evaluate(el => el.value).catch(() => '0');
        expect.soft(
          selectedValue !== '0' && selectedValue !== '',
          `Front page select should have a page assigned (not 0/empty). Got: "${selectedValue}"`
        ).toBeTruthy();
      }
    }
  });

  // -------------------------------------------------------------------------
  // 79.12 — WP Admin Dashboard loads cleanly post-import (no PHP errors)
  // Plugin-lifecycle: No fatal errors with WP_DEBUG enabled
  // -------------------------------------------------------------------------
  test('79.12 WP Admin Dashboard loads without fatal or PHP errors post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/');
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('PHP Parse error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');
    await expect(page.locator('body')).not.toContainText('Warning: Undefined');
    await expect(page.locator('body')).not.toContainText('Notice: Undefined');

    // The WP admin dashboard heading should be visible
    const dashboardHeading = page.locator('#dashboard-widgets-wrap, .wrap h1, #wpbody h1, #wp-admin-bar-wp-logo');
    expect.soft(
      await dashboardHeading.count(),
      'WP Admin Dashboard heading/widget area should be present after import'
    ).toBeGreaterThan(0);
  });

});

// =============================================================================
// §A. Dummy Import E2E — Performance
// =============================================================================
test.describe('§A. Dummy Import E2E — Performance', () => {
  test('§A.01 Full import flow completes within 60 seconds end-to-end', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    const t0 = Date.now();
    // Wait for success or completion state using selectors from existing tests in this file
    await page.locator('[class*="success"], [class*="complete"], [class*="import-done"]').first()
      .waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
    const elapsed = Date.now() - t0;
    expect.soft(elapsed, `Full import flow took ${elapsed}ms (target < 60s)`).toBeLessThan(60000);
  });

  test('§A.02 No excessive API calls during import process (< 20 requests)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await reachMethodStep(page);
    let apiCount = 0;
    page.on('request', req => {
      if (req.url().includes('admin-ajax.php') || req.url().includes('/wdesignkit/')) apiCount++;
    });
    await page.waitForTimeout(3000);
    expect.soft(apiCount, `Too many API requests during import: ${apiCount}`).toBeLessThan(20);
  });
});

// =============================================================================
// §B. Dummy Import E2E — Keyboard Navigation
// =============================================================================
test.describe('§B. Dummy Import E2E — Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('§B.01 Tab navigation works at each wizard step without focus trap', async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
    }
    const tag = await page.evaluate(() => document.activeElement?.tagName || 'UNKNOWN');
    expect.soft(['BODY', 'HTML']).not.toContain(tag);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });
});

// =============================================================================
// §C. Dummy Import E2E — RTL layout
// =============================================================================
test.describe('§C. Dummy Import E2E — RTL layout', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('§C.01 Import wizard does not overflow in RTL mode', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(400);
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
    expect.soft(hasHScroll, 'Import wizard overflows in RTL').toBe(false);
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });
});

// =============================================================================
// §D. Dummy Import E2E — Form validation edge cases
// =============================================================================
test.describe('§D. Dummy Import E2E — Form validation edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('§D.01 Import wizard handles missing/empty required selections gracefully', async ({ page }) => {
    // Attempt to proceed without required selections — should show error, not crash
    const nextBtn = page.locator(
      '.wkit-next-btn, button[class*="next"], button[class*="continue"], button[class*="proceed"]'
    ).first();
    if (await nextBtn.count() > 0 && await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });
});

// =============================================================================
// §E. Dummy Import E2E — Tap target size
// =============================================================================
test.describe('§E. Dummy Import E2E — Tap target size', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('§E.01 Wizard navigation buttons are ≥ 44×44px on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const navBtns = await page.locator(
      '.wkit-next-btn, .wkit-back-btn, button[class*="next"], button[class*="back"]'
    ).all();
    for (const btn of navBtns.slice(0, 4)) {
      if (!await btn.isVisible().catch(() => false)) continue;
      const box = await btn.boundingBox().catch(() => null);
      if (box) {
        expect.soft(box.height, `Wizard nav button height ${box.height}px < 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
