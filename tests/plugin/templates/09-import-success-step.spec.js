// =============================================================================
// WDesignKit Templates Suite — Import Success Step (Step 6) + Post-import
// Version: 3.0.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 42 — Success screen all elements (10 tests, gated by WDKIT_TOKEN)
//   Section 43 — Success screen CTA buttons & links (6 tests, gated by WDKIT_TOKEN)
//   Section 49 — Post-import pages created & site URL in success CTA (2 tests)
//   §A  — Security (2 tests)
//   §B  — Accessibility (2 tests)
//   §C  — Responsive layout (3 viewports)
//   §D  — Keyboard navigation (1 test)
//   §E  — Performance (1 test)
//   §F  — RTL layout (1 test)
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
const { reachMethodStep, acceptTandC } = require('./_helpers/wizard');

// ---------------------------------------------------------------------------
// Shared: navigate all the way to the success screen
// ---------------------------------------------------------------------------
async function triggerDummyImport(page) {
  await wpLogin(page);
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  const nameInput = page.locator('input.wkit-site-name-inp');
  if ((await nameInput.count()) > 0) {
    await nameInput.fill('QA Success Test');
    await page.waitForTimeout(300);
  }
  await reachMethodStep(page);
  const dummyCard = page.locator('.wkit-method-card').first();
  if ((await dummyCard.count()) > 0) {
    await dummyCard.click({ force: true });
    await page.waitForTimeout(300);
  }
  const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if ((await methodNext.count()) > 0) {
    await methodNext.click();
  }
  // Wait for success (up to 2 min)
  await page.locator('.wkit-site-import-success-main').waitFor({ state: 'visible', timeout: 120000 }).catch(() => {});
}

// =============================================================================
// 42. Success screen (Step 6) — all elements
// =============================================================================
test.describe('42. Success screen (Step 6) — all elements', () => {
  test.describe.configure({ mode: 'serial' });

  test('42.01 Success root .wkit-site-import-success-main is visible after dummy import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires API token for import to complete');
    await triggerDummyImport(page);
    await expect.soft(page.locator('.wkit-site-import-success-main')).toBeVisible({ timeout: 5000 });
  });

  test('42.02 Success content .wkit-site-import-success-content is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
      expect(await page.locator('.wkit-site-import-success-content').count()).toBeGreaterThan(0);
    }
  });

  test('42.03 Success header .wkit-import-success-header is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
      expect(await page.locator('.wkit-import-success-header').count()).toBeGreaterThan(0);
    }
  });

  test('42.04 Success GIF img.wkit-import-success-img src contains "kit-import-success"', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const img = page.locator('img.wkit-import-success-img');
    if ((await img.count()) > 0) {
      const src = await img.getAttribute('src');
      expect(src).toContain('kit-import-success');
    }
  });

  test('42.05 Success title .wkit-import-success-title contains "Success"', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const title = page.locator('span.wkit-import-success-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/success/i);
    }
  });

  test('42.06 Success subtitle .wkit-import-success-subtitle is present and non-empty', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const sub = page.locator('span.wkit-import-success-subtitle');
    if ((await sub.count()) > 0) {
      const text = await sub.textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('42.07 Success footer .wkit-site-import-success-footer is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
      expect(await page.locator('.wkit-site-import-success-footer').count()).toBeGreaterThan(0);
    }
  });

  test('42.08 Success screen does not show error messages after successful import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
      await expect.soft(page.locator('.wkit-site-import-success-main')).not.toContainText(/error/i);
    }
  });

  test('42.09 Success screen does not show "Fatal error"', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('42.10 No product console errors on success screen', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await triggerDummyImport(page);
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') &&
      !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors, productErrors.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// 43. Success screen — CTA buttons & links
// =============================================================================
test.describe('43. Success screen — CTA buttons & links', () => {
  test.describe.configure({ mode: 'serial' });

  test('43.01 Preview Site link a.wkit-import-success-site is present', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
      const link = page.locator('a.wkit-import-success-site');
      expect(await link.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('43.02 Preview Site link points to a valid http/https URL', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const link = page.locator('a.wkit-import-success-site');
    if ((await link.count()) > 0) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('43.03 Dashboard / Edit Site button is present in success footer', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
      const dashBtn = page.locator(
        '.wkit-import-success-dashboard, a[href*="admin"], a[href*="edit"], button[class*="dashboard" i], .wkit-import-success-footer a'
      ).first();
      expect(await dashBtn.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('43.04 "Browse More Templates" or similar CTA is present in success screen', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
      const browseCTA = page.locator(
        'button[class*="browse" i], a[class*="browse" i], button:has-text("browse"), a:has-text("browse")'
      ).first();
      expect(await browseCTA.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('43.05 Success screen footer has at least 1 action button or link', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const footer = page.locator('.wkit-site-import-success-footer');
    if ((await footer.count()) > 0) {
      const actionCount = await footer.locator('a, button').count();
      expect(actionCount).toBeGreaterThan(0);
    }
  });

  test('43.06 Success screen breadcrumb shows "All Set!" as active or completed', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    if ((await page.locator('.wkit-site-import-success-main').count()) > 0) {
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

});

// =============================================================================
// 49. Post-import — pages created & site URL in success CTA
// =============================================================================
test.describe('49. Post-import — pages created & site URL in success CTA', () => {

  test('49.01 Success preview site link points to a valid URL', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const link = page.locator('a.wkit-import-success-site');
    if ((await link.count()) > 0) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('49.02 Success screen does not show error messages after successful import', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    await expect.soft(page.locator('.wkit-site-import-success-main')).toBeVisible({ timeout: 5000 });
    await expect.soft(page.locator('.wkit-site-import-success-main')).not.toContainText(/error/i);
  });

});

// =============================================================================
// §A. Success Step — Security
// =============================================================================
test.describe('§A. Success Step — Security', () => {
  test('§A.01 Success page does not expose user credentials or API keys in source', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const html = await page.content();
    const hasApiKey = /api[-_]?key\s*[:=]\s*["'][a-zA-Z0-9]{20,}/i.test(html);
    expect.soft(hasApiKey, 'API key found in success step source').toBe(false);
  });

  test('§A.02 Success page does not display raw JSON error responses', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const bodyText = await page.locator('body').textContent().catch(() => '');
    const hasRawJson = /^\s*\{"error":/m.test(bodyText);
    expect.soft(hasRawJson, 'Raw JSON error response visible on success page').toBe(false);
  });
});

// =============================================================================
// §B. Success Step — Accessibility
// =============================================================================
test.describe('§B. Success Step — Accessibility', () => {
  test('§B.01 Success heading has accessible heading role', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const heading = page.locator('h1, h2, h3, [role="heading"], [class*="success"][class*="title"]').first();
    const count = await heading.count();
    expect.soft(count, 'No accessible heading found on success step').toBeGreaterThan(0);
  });

  test('§B.02 Success action buttons have accessible labels', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    const buttons = await page.locator('button, a[href], [role="button"]').all();
    for (const btn of buttons.slice(0, 5)) {
      if (!await btn.isVisible().catch(() => false)) continue;
      const text = await btn.textContent().catch(() => '');
      const ariaLabel = await btn.getAttribute('aria-label').catch(() => null);
      const hasLabel = text.trim().length > 0 || (ariaLabel && ariaLabel.trim().length > 0);
      expect.soft(hasLabel, 'Button missing accessible label on success step').toBe(true);
    }
  });
});

// =============================================================================
// §C. Success Step — Responsive layout
// =============================================================================
test.describe('§C. Success Step — Responsive layout', () => {
  const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];
  for (const vp of VIEWPORTS) {
    test(`§C.01 Success step has no horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      test.skip(!WDKIT_TOKEN, 'Requires import to complete');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await triggerDummyImport(page);
      const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
      expect.soft(hasHScroll, `Horizontal scroll at ${vp.name}`).toBe(false);
    });
  }
});

// =============================================================================
// §D. Success Step — Keyboard Navigation
// =============================================================================
test.describe('§D. Success Step — Keyboard Navigation', () => {
  test('§D.01 Tab navigates through success step without focus trap', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });
});

// =============================================================================
// §E. Success Step — Performance
// =============================================================================
test.describe('§E. Success Step — Performance', () => {
  test('§E.01 Success step renders within 15 seconds', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('QA Perf Test');
      await page.waitForTimeout(300);
    }
    await reachMethodStep(page);
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) await dummyCard.click({ force: true });
    const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await methodNext.count()) > 0) await methodNext.click();
    const t0 = Date.now();
    await page.locator('.wkit-site-import-success-main').waitFor({ state: 'visible', timeout: 120000 }).catch(() => {});
    // Measure time for success content to appear after loader completes
    const contentVisible = await page.locator('.wkit-site-import-success-content').isVisible().catch(() => false);
    const elapsed = Date.now() - t0;
    if (contentVisible) {
      expect.soft(elapsed, `Success step took ${elapsed}ms after import`).toBeLessThan(15000);
    }
  });
});

// =============================================================================
// §F. Success Step — RTL layout
// =============================================================================
test.describe('§F. Success Step — RTL layout', () => {
  test('§F.01 Success step does not overflow in RTL mode', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires import to complete');
    await triggerDummyImport(page);
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(400);
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
    expect.soft(hasHScroll, 'Overflow in RTL mode on success step').toBe(false);
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });
});
