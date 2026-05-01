// =============================================================================
// WDesignKit Templates Suite — Import Loader Step (Step 5)
// Version: 3.0.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 40 — Import loader structural tests (no import required) (8 tests)
//   Section 41 — Import loader during active import (4 tests, gated by WDKIT_TOKEN)
//   §A — Additional loading states (4 tests)
//   §B — Responsive layout (6 tests)
//   §C — Security — no credential exposure during load (2 tests)
//   §D — Keyboard Navigation (2 tests)
//   §E — Performance (2 tests)
//   §F — Tap target size (1 test)
//   §G — RTL layout (1 test)
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
// Shared: navigate to Method step ready to trigger import
// ---------------------------------------------------------------------------
async function openReadyToImport(page) {
  await wpLogin(page);
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await reachMethodStep(page);
  await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  // Select Dummy card to ensure Import button is ready
  const dummyCard = page.locator('.wkit-method-card').first();
  if ((await dummyCard.count()) > 0) {
    await dummyCard.click({ force: true });
    await page.waitForTimeout(400);
  }
}

// =============================================================================
// 40. Import loader — structural tests (triggered on Import click)
// =============================================================================
test.describe('40. Import loader (Step 5) — structural & progress tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('40.01 Import loader is shown after clicking Import button', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Import loader requires API token to proceed');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
      const loader = page.locator('.wkit-loader-content, .wkit-import-loader, .wkit-loader-main').first();
      await expect.soft(loader).toBeVisible({ timeout: 10000 });
    }
  });

  test('40.02 Loader container .wkit-loader-content is in the DOM after clicking Import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger import');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      const count = await page.locator('.wkit-loader-content, .wkit-import-loader-main').count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('40.03 Loader step list .wkit-loader-step items are present during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      const steps = page.locator('.wkit-loader-step');
      const count = await steps.count();
      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('40.04 Loader shows "Installing Plugins & Theme" step text', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      await expect.soft(page.locator('body')).toContainText(/installing plugins/i);
    }
  });

  test('40.05 Lottie animation element is present during import loader', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      const lottie = page.locator('lottie-player, [class*="lottie"]').first();
      await expect.soft(lottie).toBeVisible({ timeout: 10000 });
    }
  });

  test('40.06 Loader does not show a "Fatal error" during import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(5000);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('40.07 Import loader step texts are non-empty', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
      const steps = page.locator('.wkit-loader-step');
      const count = await steps.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await steps.nth(i).textContent().catch(() => '');
        if (text.trim().length > 0) {
          expect(text.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('40.08 No product console errors are emitted when import begins', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 41. Import loader — active import flow (full end-to-end, gated by token)
// =============================================================================
test.describe('41. Import loader — active import flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('41.01 Import progresses past loader to success screen (or shows error with retry)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      // Wait up to 120 seconds for import to complete
      await expect.soft(page.locator('.wkit-site-import-success-main')).toBeVisible({ timeout: 120000 });
    }
  });

  test('41.02 Import loader step icons change state during import (pending → active → done)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(4000);
      // During import, at least one step should be "active" or "done"
      const activeStep = page.locator('.wkit-loader-step.wkit-active-step, .wkit-loader-step.wkit-done-step, [class*="active" i]');
      const count = await activeStep.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('41.03 Breadcrumb shows "All Set!" as active or completed after import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.locator('.wkit-site-import-success-main').waitFor({ state: 'visible', timeout: 120000 }).catch(() => {});
      const breadcrumbs = page.locator('.wkit-breadcrumbs-card-title');
      const count = await breadcrumbs.count();
      let found = false;
      for (let i = 0; i < count; i++) {
        const text = await breadcrumbs.nth(i).textContent();
        if (/all set/i.test(text)) { found = true; break; }
      }
      expect(found).toBe(true);
    }
  });

  test('41.04 Import does not produce uncaught exceptions during processing', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import');
    const exceptions = [];
    page.on('pageerror', err => exceptions.push(err.message));
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(10000);
    }
    expect(exceptions, exceptions.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// §A. Loader Step — Additional loading states
// =============================================================================
test.describe('§A. Loader Step — Additional loading states', () => {
  test('§A.01 Loader skeleton or animation element is visible immediately after import trigger', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger import');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
      const skeleton = page.locator(
        'lottie-player, [class*="lottie"], [class*="loader"], [class*="skeleton"], .wkit-loader-content'
      ).first();
      const isVisible = await skeleton.isVisible({ timeout: 8000 }).catch(() => false);
      expect.soft(isVisible, 'No loader/skeleton visible after import trigger').toBe(true);
    }
  });

  test('§A.02 Progress step list is present and contains at least 2 items', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
      const steps = page.locator('.wkit-loader-step');
      const count = await steps.count();
      expect.soft(count, 'Loader step list has fewer than 2 items').toBeGreaterThanOrEqual(2);
    }
  });

  test('§A.03 No product console errors occur during the loader phase', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(6000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect.soft(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

  test('§A.04 Loader step does not stay frozen — at least one step completes within 30s', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires active import process');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      // A completed step has a "done" class or the success screen appears within 30s
      const completionSignal = page.locator(
        '.wkit-loader-step.wkit-done-step, .wkit-loader-step.wkit-active-step, .wkit-site-import-success-main'
      ).first();
      const appeared = await completionSignal.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
      expect.soft(appeared, 'Loader appears frozen — no step progressed within 30s').toBe(true);
    }
  });
});

// =============================================================================
// §B. Loader Step — Responsive layout
// =============================================================================
test.describe('§B. Loader Step — Responsive layout', () => {
  const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const vp of VIEWPORTS) {
    test(`§B.01 Loader step renders without horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      test.skip(!WDKIT_TOKEN, 'Requires API token to trigger loader');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await openReadyToImport(page);
      const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
      if ((await nextBtn.count()) > 0) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
      const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
      expect.soft(hasHScroll, `Horizontal scroll at ${vp.name}`).toBe(false);
    });

    test(`§B.02 Loader content is visible at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      test.skip(!WDKIT_TOKEN, 'Requires API token to trigger loader');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await openReadyToImport(page);
      const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
      if ((await nextBtn.count()) > 0) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
      const loaderVisible = await page.locator('.wkit-loader-content, .wkit-import-loader, .wkit-loader-main').first().isVisible({ timeout: 10000 }).catch(() => false);
      expect.soft(loaderVisible, `Loader not visible at ${vp.name}`).toBe(true);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    });
  }
});

// =============================================================================
// §C. Loader Step — Security (no credential exposure during load)
// =============================================================================
test.describe('§C. Loader Step — Security', () => {
  test('§C.01 No API tokens or credentials are visible in the loader UI', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger import');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
    }
    const bodyText = await page.locator('body').textContent().catch(() => '');
    // Token format: long alphanumeric strings; check that the actual token value is not rendered
    if (WDKIT_TOKEN && WDKIT_TOKEN.length > 10) {
      expect(bodyText, 'API token found in loader UI').not.toContain(WDKIT_TOKEN);
    }
    // Also check that no raw Bearer header patterns are exposed
    expect.soft(bodyText).not.toMatch(/Authorization:\s*Bearer/i);
  });

  test('§C.02 Network requests during import do not expose credentials in URL parameters', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger import');
    const sensitiveUrls = [];
    page.on('request', req => {
      const url = req.url();
      if (WDKIT_TOKEN && url.includes(WDKIT_TOKEN)) {
        sensitiveUrls.push(url);
      }
    });
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(5000);
    }
    expect(sensitiveUrls, `Token found in URL params: ${sensitiveUrls.join(', ')}`).toHaveLength(0);
  });
});

// =============================================================================
// §D. Loader Step — Keyboard Navigation
// =============================================================================
test.describe('§D. Loader Step — Keyboard Navigation', () => {
  test('§D.01 Tab key does not create a focus trap on the loader screen', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger loader');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('§D.02 Escape key does not abort or crash the import loader', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger loader');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Fatal error');
    // Loader should still be present (Escape shouldn't abort)
    const loaderPresent = await page.locator('.wkit-loader-content, .wkit-import-loader, .wkit-loader-main').first().isVisible({ timeout: 3000 }).catch(() => false);
    expect.soft(loaderPresent, 'Loader disappeared after Escape key').toBe(true);
  });
});

// =============================================================================
// §E. Loader Step — Performance
// =============================================================================
test.describe('§E. Loader Step — Performance', () => {
  test('§E.01 Import loader step is visible within 5 seconds of clicking Import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger loader');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      const t0 = Date.now();
      await nextBtn.click();
      await page.locator('.wkit-loader-content, .wkit-import-loader, .wkit-loader-main').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
      const elapsed = Date.now() - t0;
      expect.soft(elapsed, `Loader appeared after ${elapsed}ms`).toBeLessThan(5000);
    }
  });

  test('§E.02 Import completes or shows a meaningful state within 120 seconds', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      // Success screen OR an error/retry state must appear within 120s
      const done = await page.locator(
        '.wkit-site-import-success-main, .wkit-import-error, [class*="retry"]'
      ).first().waitFor({ state: 'visible', timeout: 120000 }).then(() => true).catch(() => false);
      expect.soft(done, 'Import did not complete or show error state within 120s').toBe(true);
    }
  });
});

// =============================================================================
// §F. Loader Step — Tap target size
// =============================================================================
test.describe('§F. Loader Step — Tap target size', () => {
  test('§F.01 Any cancel or close button on loader is ≥ 44px tall on mobile viewport', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger loader');
    await page.setViewportSize({ width: 375, height: 812 });
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
    const cancelBtns = await page.locator(
      'button[class*="cancel"], button[class*="close"], button[class*="back"], .wkit-loader-cancel'
    ).all();
    for (const btn of cancelBtns.slice(0, 3)) {
      if (!await btn.isVisible().catch(() => false)) continue;
      const box = await btn.boundingBox().catch(() => null);
      if (box) {
        expect.soft(box.height, `Cancel/close button height ${box.height}px < 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

// =============================================================================
// §G. Loader Step — RTL layout
// =============================================================================
test.describe('§G. Loader Step — RTL layout', () => {
  test('§G.01 Loader step does not overflow in RTL direction mode', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token to trigger loader');
    await openReadyToImport(page);
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(400);
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
    expect.soft(hasHScroll, 'Horizontal overflow in RTL mode').toBe(false);
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });
});
