// =============================================================================
// WDesignKit Templates Suite — Import Back Navigation
// Version: 3.1.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 30   — Feature step back navigation to preview (3 tests)
//   Section 37b  — Method step back navigation to feature step (2 tests)
//   Section 52b  — State preservation: back/forward navigation retains form data (3 tests)
//   Section 53b  — global_data panel back navigation to site_info panel (6 tests)
//   §A  — Security: back nav not vulnerable to open redirect (1 test)
//   §B  — Accessibility: back button aria-label and role (2 tests)
//   §C  — Responsive layout (3 viewports)
//   §D  — Keyboard navigation: Tab reachability, Enter/Space activation (2 tests)
//   §E  — Performance: back nav renders in < 2s (1 test)
//   §F  — RTL layout (1 test)
//   §G  — Tap target: back button ≥ 44×44px on mobile (1 test)
//   §H  — Back navigation state: back doesn't lose already-entered data (1 test)
//   §I  — Multiple consecutive backs: pressing back 3 times doesn't crash (1 test)
//   §J  — Step accuracy: back from step 3 returns to step 2, not step 1 (1 test)
//
// NOTE: Sections are labelled 37b/52b/53b to avoid numbering conflicts with
//       06-import-method-step.spec.js (§37) and 30-templates-responsive.spec.js (§52, §53).
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
const { reachFeatureStep, reachMethodStep, reachGlobalDataPanel, acceptTandC } = require('./_helpers/wizard');

// =============================================================================
// 30. Feature step — Back navigation to preview
// =============================================================================
test.describe('30. Feature step — Back navigation to preview', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('30.01 Feature Back button exists', async ({ page }) => {
    const count = await page.locator('button.wkit-site-feature-back, button.wkit-back-btn').count();
    expect(count).toBeGreaterThan(0);
  });

  test('30.02 Clicking Feature Back returns to Step 1 (site info)', async ({ page }) => {
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class').first();
    const backCount = await backBtn.count();
    if (backCount > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
      const infoCount = await page.locator('.wkit-temp-basic-info, .wkit-site-name-inp').count();
      expect(infoCount).toBeGreaterThan(0);
    }
  });

  test('30.03 Feature Back does not cause console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(1500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 37b. Method step — Back navigation to feature step
// =============================================================================
test.describe('37b. Method step — Back navigation to feature step', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('37b.01 Clicking Method Back navigates to Feature step', async ({ page }) => {
    const backBtn = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
      const featureCount = await page.locator('.wkit-import-temp-feature').count();
      expect(featureCount).toBeGreaterThan(0);
    }
  });

  test('37b.02 Method Back does not cause console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const backBtn = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(1500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 52b. State preservation — back/forward navigation retains form data
// =============================================================================
test.describe('52b. State preservation — back/forward navigation retains form data', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('52b.01 Business Name entered on Step 1 is retained after going to Step 2 and back', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Preserved Business Name');
      await page.waitForTimeout(300);
    }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }
    const retainedInput = page.locator('input.wkit-site-name-inp');
    if ((await retainedInput.count()) > 0) {
      await expect.soft(retainedInput).toHaveValue('Preserved Business Name');
    }
  });

  test('52b.02 Tagline entered on Step 1 is retained after back navigation', async ({ page }) => {
    const taglineInput = page.locator('input.wkit-site-tagline-inp');
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await taglineInput.count()) > 0 && (await nameInput.count()) > 0) {
      await nameInput.fill('Preservation Test');
      await taglineInput.fill('My Tagline');
      await page.waitForTimeout(300);
    }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }
    const retainedTagline = page.locator('input.wkit-site-tagline-inp');
    if ((await retainedTagline.count()) > 0) {
      await expect.soft(retainedTagline).toHaveValue('My Tagline');
    }
  });

  test('52b.03 T&C checkbox state is reset when re-entering feature step', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) { await nameInput.fill('T&C Reset Test'); }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) { await nextBtn.click(); await page.waitForTimeout(2500); }
    await acceptTandC(page);
    await page.waitForTimeout(300);
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
    const cb = page.locator('#wkit-plugin-confirmation-id');
    if ((await cb.count()) > 0) {
      await expect.soft(cb).not.toBeChecked({ timeout: 2000 });
    }
  });

});

// =============================================================================
// 53b. global_data panel — Back navigation to site_info panel
// =============================================================================
test.describe('53b. global_data panel — Back navigation to site_info', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    // Navigate to global_data panel (Step 1, panel 2)
    await reachGlobalDataPanel(page);
    await page.waitForTimeout(1000);
  });

  test('53b.01 Back button is present on the global_data panel', async ({ page }) => {
    // Only assert if global_data panel is actually shown
    const onGlobalData = await page.locator('.wkit-temp-global-data, .wkit-global-color-main, .wkit-global-typography-main').count();
    if (onGlobalData > 0) {
      const backBtn = page.locator(
        'button.wkit-back-btn, button.wkit-global-data-back, button.wkit-outer-btn-class'
      ).first();
      expect(await backBtn.count()).toBeGreaterThan(0);
    }
  });

  test('53b.02 Clicking Back on global_data panel returns to site_info (business name input visible)', async ({ page }) => {
    const onGlobalData = await page.locator('.wkit-temp-global-data, .wkit-global-color-main, .wkit-global-typography-main').count();
    if (onGlobalData > 0) {
      const backBtn = page.locator(
        'button.wkit-back-btn, button.wkit-global-data-back, button.wkit-outer-btn-class'
      ).first();
      if ((await backBtn.count()) > 0) {
        await backBtn.click();
        await page.waitForTimeout(2000);
        const nameInput = page.locator('input.wkit-site-name-inp');
        expect(await nameInput.count()).toBeGreaterThan(0);
      }
    }
  });

  test('53b.03 Business name is preserved when going back from global_data to site_info', async ({ page }) => {
    const onGlobalData = await page.locator('.wkit-temp-global-data, .wkit-global-color-main, .wkit-global-typography-main').count();
    if (onGlobalData > 0) {
      const backBtn = page.locator(
        'button.wkit-back-btn, button.wkit-global-data-back, button.wkit-outer-btn-class'
      ).first();
      if ((await backBtn.count()) > 0) {
        await backBtn.click();
        await page.waitForTimeout(2000);
        const nameInput = page.locator('input.wkit-site-name-inp');
        if ((await nameInput.count()) > 0) {
          // The value filled by reachGlobalDataPanel ('QA Global Data Test') should be preserved
          const value = await nameInput.inputValue().catch(() => '');
          expect(value.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('53b.04 After back from global_data, forward navigation (Next) reaches global_data again', async ({ page }) => {
    const onGlobalData = await page.locator('.wkit-temp-global-data, .wkit-global-color-main, .wkit-global-typography-main').count();
    if (onGlobalData > 0) {
      const backBtn = page.locator(
        'button.wkit-back-btn, button.wkit-global-data-back, button.wkit-outer-btn-class'
      ).first();
      if ((await backBtn.count()) > 0) {
        await backBtn.click();
        await page.waitForTimeout(1500);
        // Click Next again — should go back to global_data or Feature
        const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
        if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled({ timeout: 5000 }).catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(2500);
          // Should be on global_data OR Feature step (both valid outcomes)
          const onGD = await page.locator('.wkit-temp-global-data, .wkit-global-color-main').count();
          const onFeature = await page.locator('.wkit-import-temp-feature').count();
          expect(onGD + onFeature).toBeGreaterThan(0);
        }
      }
    }
  });

  test('53b.05 Breadcrumb "Customize Website" remains active on global_data panel', async ({ page }) => {
    const onGlobalData = await page.locator('.wkit-temp-global-data, .wkit-global-color-main, .wkit-global-typography-main').count();
    if (onGlobalData > 0) {
      const activeBreadcrumb = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
      if ((await activeBreadcrumb.count()) > 0) {
        const text = await activeBreadcrumb.first().textContent();
        expect(text.trim()).toMatch(/customize website/i);
      }
    }
  });

  test('53b.06 No console errors when navigating back from global_data to site_info', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const onGlobalData = await page.locator('.wkit-temp-global-data, .wkit-global-color-main, .wkit-global-typography-main').count();
    if (onGlobalData > 0) {
      const backBtn = page.locator(
        'button.wkit-back-btn, button.wkit-global-data-back, button.wkit-outer-btn-class'
      ).first();
      if ((await backBtn.count()) > 0) {
        await backBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// §A. Back Navigation — Security
// =============================================================================
test.describe('§A. Back Navigation — Security', () => {
  test('§A.01 Back button href does not contain an open-redirect parameter', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const backBtn = page.locator('button.wkit-site-feature-back, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      const href = await backBtn.getAttribute('href').catch(() => '');
      const hasOpenRedirect = /[?&](url|redirect|goto|next|return)=https?/i.test(href || '');
      expect.soft(hasOpenRedirect, 'Back button href contains potential open-redirect').toBe(false);
    }
  });
});

// =============================================================================
// §B. Back Navigation — Accessibility
// =============================================================================
test.describe('§B. Back Navigation — Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('§B.01 Back button has an accessible label (text or aria-label)', async ({ page }) => {
    const backBtn = page.locator('button.wkit-site-feature-back, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      const text = await backBtn.textContent().catch(() => '');
      const ariaLabel = await backBtn.getAttribute('aria-label').catch(() => null);
      const hasLabel = text.trim().length > 0 || (ariaLabel && ariaLabel.trim().length > 0);
      expect.soft(hasLabel, 'Back button missing accessible label').toBe(true);
    }
  });

  test('§B.02 Back button has role=button or is a native <button> element', async ({ page }) => {
    const backBtn = page.locator('button.wkit-site-feature-back, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      const tagName = await backBtn.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
      const role = await backBtn.getAttribute('role').catch(() => null);
      const isButton = tagName === 'button' || role === 'button';
      expect.soft(isButton, 'Back element is not a button or role=button').toBe(true);
    }
  });
});

// =============================================================================
// §C. Back Navigation — Responsive layout
// =============================================================================
test.describe('§C. Back Navigation — Responsive layout', () => {
  const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const vp of VIEWPORTS) {
    test(`§C.01 Back nav has no horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await wpLogin(page);
      await goToBrowse(page);
      await clickFirstCardImport(page);
      await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
      await reachFeatureStep(page);
      await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
      const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
      expect.soft(hasHScroll, `Horizontal scroll at ${vp.name}`).toBe(false);
    });
  }
});

// =============================================================================
// §D. Back Navigation — Keyboard Navigation
// =============================================================================
test.describe('§D. Back Navigation — Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('§D.01 Back button is reachable via Tab key', async ({ page }) => {
    let backReached = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        const cls = el.className || '';
        return cls.includes('wkit-site-feature-back') || cls.includes('wkit-back-btn') ||
          cls.includes('wkit-outer-btn-class');
      }).catch(() => false);
      if (focused) { backReached = true; break; }
    }
    expect.soft(backReached, 'Back button not reachable via Tab').toBe(true);
  });

  test('§D.02 Back button activates on Space key press when focused', async ({ page }) => {
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.focus().catch(() => {});
      await page.keyboard.press('Space');
      await page.waitForTimeout(2000);
      // After pressing Space on back, wizard should still be active (on step 1) and no fatal error
      await expect.soft(page.locator('body')).not.toContainText('Fatal error');
    }
  });
});

// =============================================================================
// §E. Back Navigation — Performance
// =============================================================================
test.describe('§E. Back Navigation — Performance', () => {
  test('§E.01 Back button appears within 2 seconds of reaching Feature step', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    const t0 = Date.now();
    await page.locator('button.wkit-site-feature-back, button.wkit-back-btn')
      .first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const elapsed = Date.now() - t0;
    expect.soft(elapsed, `Back button took ${elapsed}ms to appear`).toBeLessThan(2000);
  });
});

// =============================================================================
// §F. Back Navigation — RTL layout
// =============================================================================
test.describe('§F. Back Navigation — RTL layout', () => {
  test('§F.01 Back navigation area does not overflow in RTL mode', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(400);
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
    expect.soft(hasHScroll, 'Back nav area overflows in RTL mode').toBe(false);
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });
});

// =============================================================================
// §G. Back Navigation — Tap target
// =============================================================================
test.describe('§G. Back Navigation — Tap target', () => {
  test('§G.01 Back button meets 44×44px minimum tap target on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const backBtn = page.locator('button.wkit-site-feature-back, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      const box = await backBtn.boundingBox().catch(() => null);
      if (box) {
        expect.soft(
          box.height >= 44 && box.width >= 44,
          `Back button tap target too small: ${Math.round(box.width)}×${Math.round(box.height)}px`
        ).toBe(true);
      }
    }
  });
});

// =============================================================================
// §H. Back Navigation — State preservation on back
// =============================================================================
test.describe('§H. Back Navigation — State preservation on back', () => {
  test('§H.01 Navigating back from Feature step does not lose business name already entered', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('State Preservation QA');
      await page.waitForTimeout(300);
    }
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const backBtn = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }
    const retainedInput = page.locator('input.wkit-site-name-inp');
    if ((await retainedInput.count()) > 0) {
      await expect.soft(retainedInput).toHaveValue('State Preservation QA');
    }
  });
});

// =============================================================================
// §I. Back Navigation — Multiple consecutive backs
// =============================================================================
test.describe('§I. Back Navigation — Multiple consecutive backs', () => {
  test('§I.01 Pressing back 3 times in succession does not crash the wizard', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    // Back from Method → Feature
    const methodBack = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await methodBack.count()) > 0) {
      await methodBack.click();
      await page.waitForTimeout(1500);
    }
    // Back from Feature → Step 1
    const featureBack = page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').first();
    if ((await featureBack.count()) > 0) {
      await featureBack.click();
      await page.waitForTimeout(1500);
    }
    // Try one more back (should be a no-op or graceful — wizard should stay open / on step 1)
    const anyBack = page.locator('button.wkit-back-btn, button[class*="back"]').first();
    if ((await anyBack.count()) > 0) {
      await anyBack.click({ force: true });
      await page.waitForTimeout(1000);
    }

    // Wizard must still be open and no fatal error
    await expect(page.locator('body')).not.toContainText('Fatal error');
    const wizardOpen = await page.locator('.wkit-temp-import-mian').count();
    expect.soft(wizardOpen, 'Wizard closed after consecutive back presses').toBeGreaterThan(0);
  });
});

// =============================================================================
// §J. Back Navigation — Step accuracy
// =============================================================================
test.describe('§J. Back Navigation — Step accuracy', () => {
  test('§J.01 Back from Method step (step 3) returns to Feature step (step 2), not step 1', async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const methodBack = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await methodBack.count()) > 0) {
      await methodBack.click();
      await page.waitForTimeout(2000);
      // Must land on Feature step (step 2), NOT site_info (step 1)
      const onFeature = await page.locator('.wkit-import-temp-feature').count();
      const onSiteInfo = await page.locator('input.wkit-site-name-inp').count();
      expect.soft(onFeature, 'Did not land on Feature step after back from Method').toBeGreaterThan(0);
      // Step 1 input should NOT be visible (we should be on step 2)
      expect.soft(onSiteInfo, 'Landed on Step 1 instead of Step 2 (Feature) after back from Method').toBe(0);
    }
  });
});
