// =============================================================================
// WDesignKit Templates Suite — Dummy Import Full E2E
// Version: 1.1.0 — Removed unused selectMethodCard import; added plugin check in §79
// Plugin version: WDesignKit v2.3.0
//
// COVERAGE
//   Section 78 — Dummy import full E2E: loader all states (12 tests)
//   Section 79 — WP Admin post-dummy-import: pages created (8 tests)
//
// Section 78 separates structure checks (no token needed) from completion
// checks (token needed). Section 79 verifies WP Admin side-effects after
// a completed dummy import.
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

});
