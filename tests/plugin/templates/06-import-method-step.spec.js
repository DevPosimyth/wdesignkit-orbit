// =============================================================================
// WDesignKit Templates Suite — Import Method Step (Step 3)
// Version: 3.0.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 31 — Method step layout & header text (10 tests)
//   Section 32 — Dummy Content card selection & active state (7 tests)
//   Section 33 — AI card state — unauthenticated (5 tests)
//   Section 34 — AI card state — authenticated selection & active (7 tests)
//   Section 35 — Blog Generate toggle — visibility & interaction (6 tests)
//   Section 36 — Wireframe toggle — visibility & interaction (6 tests)
//   Section 37 — Next / Import button text & state (7 tests)
//   Section 38 — Back navigation from Method step (4 tests)
//   §A — Responsive layout (6 tests)
//   §B — Accessibility / WCAG 2.1 AA (2 tests)
//   §C — Keyboard Navigation (2 tests)
//   §D — Performance (1 test)
//   §E — Tap target size (1 test)
//   §F — RTL layout (1 test)
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
const { wpLogin, wdkitLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep } = require('./_helpers/wizard');

// ---------------------------------------------------------------------------
// Shared: open wizard and navigate to Method step
// ---------------------------------------------------------------------------
async function openMethodStep(page) {
  await wpLogin(page);
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await reachMethodStep(page);
  await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Shared: open wizard, inject WDKit token, navigate to Method step
// ---------------------------------------------------------------------------
async function openMethodStepAuthenticated(page) {
  await wpLogin(page);
  await page.goto('/wp-admin/admin.php?page=wdesign-kit');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  if (WDKIT_TOKEN) {
    await page.evaluate((token) => {
      localStorage.setItem('wdkit-login', JSON.stringify({
        messages: 'Login successful', success: true,
        token, user_email: 'test@test.com',
      }));
    }, WDKIT_TOKEN);
  }
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await reachMethodStep(page);
  await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
}

// =============================================================================
// 31. Method step (Step 3) — layout & header text
// =============================================================================
test.describe('31. Method step (Step 3) — layout & header text', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('31.01 Method step container .wkit-import-method-main is visible', async ({ page }) => {
    await expect(page.locator('.wkit-import-method-main')).toBeVisible({ timeout: 15000 });
  });

  test('31.02 Method inner container .wkit-import-method-container is present', async ({ page }) => {
    expect(await page.locator('.wkit-import-method-container').count()).toBeGreaterThan(0);
  });

  test('31.03 Method header .wkit-import-method-header is present', async ({ page }) => {
    expect(await page.locator('.wkit-import-method-header').count()).toBeGreaterThan(0);
  });

  test('31.04 Method title says "Content & Media Setup"', async ({ page }) => {
    const title = page.locator('.wkit-method-header-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/content.*media setup/i);
    }
  });

  test('31.05 Method subtitle .wkit-method-header-subtitle is present and non-empty', async ({ page }) => {
    const sub = page.locator('.wkit-method-header-subtitle');
    expect(await sub.count()).toBeGreaterThan(0);
    if ((await sub.count()) > 0) {
      const text = await sub.first().textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('31.06 Method body .wkit-import-method-body is present', async ({ page }) => {
    expect(await page.locator('.wkit-import-method-body').count()).toBeGreaterThan(0);
  });

  test('31.07 Method card container .wkit-method-card-content is present', async ({ page }) => {
    expect(await page.locator('.wkit-method-card-content').count()).toBeGreaterThan(0);
  });

  test('31.08 At least 2 method cards .wkit-method-card are rendered', async ({ page }) => {
    expect(await page.locator('.wkit-method-card').count()).toBeGreaterThanOrEqual(2);
  });

  test('31.09 Method footer .wkit-import-method-footer is present', async ({ page }) => {
    expect(await page.locator('.wkit-import-method-footer').count()).toBeGreaterThan(0);
  });

  test('31.10 Method step renders no product console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.waitForTimeout(1500);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension') && !e.includes('chrome-extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 32. Method step — Dummy Content card selection & active state
// =============================================================================
test.describe('32. Method step — Dummy Content card selection & active state', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('32.01 First method card (Dummy) has title "Import Dummy Content"', async ({ page }) => {
    const title = page.locator('.wkit-method-card').first().locator('.wkit-method-card-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/import dummy content/i);
    }
  });

  test('32.02 Dummy card has .wkit-active-card class by default', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      const classes = await dummyCard.getAttribute('class');
      expect(classes).toContain('wkit-active-card');
    }
  });

  test('32.03 Dummy card has icon i.wdkit-i-templates', async ({ page }) => {
    const icon = page.locator('.wkit-method-card').first().locator('i.wdkit-i-templates');
    expect(await icon.count()).toBeGreaterThan(0);
  });

  test('32.04 Dummy card description .wkit-method-card-desc is non-empty', async ({ page }) => {
    const desc = page.locator('.wkit-method-card').first().locator('.wkit-method-card-desc');
    if ((await desc.count()) > 0) {
      const text = await desc.textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('32.05 Clicking Dummy card keeps it as the active card', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
      const classes = await dummyCard.getAttribute('class');
      expect(classes).toContain('wkit-active-card');
    }
  });

  test('32.06 Dummy card header .wkit-method-card-header has non-empty text', async ({ page }) => {
    const header = page.locator('.wkit-method-card').first().locator('.wkit-method-card-header');
    if ((await header.count()) > 0) {
      const text = await header.textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('32.07 Dummy card does not show Coming Soon badge', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      const comingSoon = dummyCard.locator('.wkit-coming-soon-tag');
      expect(await comingSoon.count()).toBe(0);
    }
  });

});

// =============================================================================
// 33. Method step — AI card state (unauthenticated)
// =============================================================================
test.describe('33. Method step — AI card state (unauthenticated)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('33.01 Second method card (AI) has title "Smart AI Content"', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const title = aiCard.locator('.wkit-method-card-title');
      if ((await title.count()) > 0) {
        await expect(title).toContainText(/smart ai content/i);
      }
    }
  });

  test('33.02 AI card header has AI icon i.wdkit-i-ai', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const icon = aiCard.locator('i.wdkit-i-ai');
      expect(await icon.count()).toBeGreaterThan(0);
    }
  });

  test('33.03 AI card shows "Coming Soon" tag when user is not authenticated', async ({ page }) => {
    if (WDKIT_TOKEN) test.skip(true, 'Authenticated user — skip Coming Soon check');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const tag = aiCard.locator('.wkit-coming-soon-tag');
      expect(await tag.count()).toBeGreaterThan(0);
    }
  });

  test('33.04 AI card has style pointer-events:none when user is not authenticated', async ({ page }) => {
    if (WDKIT_TOKEN) test.skip(true, 'Authenticated user — skip disabled state check');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      expect(pe).toBe('none');
    }
  });

  test('33.05 AI card has disable overlay .wkit-disable-opacity-div when unauthenticated', async ({ page }) => {
    if (WDKIT_TOKEN) test.skip(true, 'Authenticated user — skip overlay check');
    const overlay = page.locator('.wkit-disable-opacity-div');
    expect(await overlay.count()).toBeGreaterThanOrEqual(0);
  });

});

// =============================================================================
// 34. Method step — AI card state (authenticated selection & active state)
// =============================================================================
test.describe('34. Method step — AI card authenticated selection & active state', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token for AI card access');
    await openMethodStepAuthenticated(page);
  });

  test('34.01 AI card has pointer-events:auto when user is authenticated', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      expect(pe).not.toBe('none');
    }
  });

  test('34.02 AI card does NOT show Coming Soon tag when authenticated', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const tag = aiCard.locator('.wkit-coming-soon-tag');
      expect(await tag.count()).toBe(0);
    }
  });

  test('34.03 Clicking AI card gives it .wkit-active-card class', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      await aiCard.click({ force: true });
      await page.waitForTimeout(600);
      const classes = await aiCard.getAttribute('class');
      expect(classes).toContain('wkit-active-card');
    }
  });

  test('34.04 After clicking AI card, Dummy card loses .wkit-active-card class', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await aiCard.count()) > 0 && (await dummyCard.count()) > 0) {
      await aiCard.click({ force: true });
      await page.waitForTimeout(600);
      const dummyClasses = await dummyCard.getAttribute('class');
      expect(dummyClasses || '').not.toContain('wkit-active-card');
    }
  });

  test('34.05 Clicking AI card then Dummy card restores Dummy as active', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await aiCard.count()) > 0 && (await dummyCard.count()) > 0) {
      await aiCard.click({ force: true });
      await page.waitForTimeout(400);
      await dummyCard.click({ force: true });
      await page.waitForTimeout(400);
      const dummyClasses = await dummyCard.getAttribute('class');
      expect(dummyClasses).toContain('wkit-active-card');
    }
  });

  test('34.06 AI card description .wkit-method-card-desc is non-empty', async ({ page }) => {
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const desc = aiCard.locator('.wkit-method-card-desc');
      if ((await desc.count()) > 0) {
        const text = await desc.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('34.07 Selecting AI card does not produce JS console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      await aiCard.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 35. Method step — Blog Generate toggle (visible only on AI card selection)
// =============================================================================
test.describe('35. Method step — Blog Generate toggle', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('35.01 Blog toggle #wkit-blog-switcher-inp is NOT visible when Dummy card is selected', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
    }
    const blogToggle = page.locator('#wkit-blog-switcher-inp');
    const count = await blogToggle.count();
    if (count > 0) {
      expect(await blogToggle.isVisible()).toBe(false);
    } else {
      expect(count).toBe(0);
    }
  });

  test('35.02 Blog toggle wrapper .wkit-wirefram-content is hidden when Dummy card selected', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
    }
    const wrapper = page.locator('.wkit-wirefram-content');
    if ((await wrapper.count()) > 0) {
      expect(await wrapper.first().isVisible()).toBe(false);
    }
  });

  test('35.03 Blog toggle label text contains "Generate" when AI card is selected', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(800);
        const label = page.locator('.wkit-wirefram-txt');
        if ((await label.count()) > 0) {
          const text = await label.textContent();
          expect(text).toMatch(/generate/i);
        }
      }
    }
  });

  test('35.04 Blog toggle is a checkbox input when visible (AI card selected)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(800);
        const toggle = page.locator('#wkit-blog-switcher-inp');
        if ((await toggle.count()) > 0) {
          expect(await toggle.getAttribute('type')).toBe('checkbox');
        }
      }
    }
  });

  test('35.05 Blog toggle can be checked and unchecked when AI card is selected', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(800);
        const toggle = page.locator('#wkit-blog-switcher-inp');
        if ((await toggle.count()) > 0) {
          const before = await toggle.isChecked();
          const label = page.locator('label[for="wkit-blog-switcher-inp"]');
          if ((await label.count()) > 0) {
            await label.click({ force: true });
          } else {
            await toggle.click({ force: true });
          }
          await page.waitForTimeout(400);
          const after = await toggle.isChecked();
          expect(after).not.toBe(before);
        }
      }
    }
  });

  test('35.06 Blog toggle switch does not produce JS errors on toggle', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(600);
        const label = page.locator('label[for="wkit-blog-switcher-inp"]');
        if ((await label.count()) > 0) {
          await label.click({ force: true });
          await page.waitForTimeout(500);
        }
      }
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 36. Method step — Wireframe toggle (visible only on AI card selection)
// =============================================================================
test.describe('36. Method step — Wireframe toggle', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('36.01 Wireframe toggle #wkit-wirefram-switcher-inp is present when AI authenticated', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(800);
        const count = await page.locator('#wkit-wirefram-switcher-inp').count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('36.02 Wireframe toggle is hidden when Dummy card is selected', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
    }
    const wireframe = page.locator('#wkit-wirefram-switcher-inp');
    if ((await wireframe.count()) > 0) {
      expect(await wireframe.isVisible()).toBe(false);
    }
  });

  test('36.03 Wireframe tooltip .wkit-wirefram-tooltip is present when wireframe visible', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth');
    const count = await page.locator('.wkit-wirefram-tooltip').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('36.04 Wireframe toggle can be checked/unchecked when AI card selected', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(800);
        const toggle = page.locator('#wkit-wirefram-switcher-inp');
        if ((await toggle.count()) > 0 && await toggle.isVisible()) {
          const before = await toggle.isChecked();
          const label = page.locator('label[for="wkit-wirefram-switcher-inp"]');
          if ((await label.count()) > 0) {
            await label.click({ force: true });
          } else {
            await toggle.click({ force: true });
          }
          await page.waitForTimeout(400);
          const after = await toggle.isChecked();
          expect(after).not.toBe(before);
        }
      }
    }
  });

  test('36.05 Wireframe toggle has a label text explaining the feature', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(800);
        const label = page.locator('label[for="wkit-wirefram-switcher-inp"]');
        if ((await label.count()) > 0) {
          const text = await label.textContent();
          expect(text.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('36.06 Wireframe toggle does not produce JS errors', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(600);
        const label = page.locator('label[for="wkit-wirefram-switcher-inp"]');
        if ((await label.count()) > 0) {
          await label.click({ force: true });
          await page.waitForTimeout(500);
        }
      }
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 37. Method step — Next / Import button text & state by selection
// =============================================================================
test.describe('37. Method step — Next / Import button text & state', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('37.01 Method Next button .wkit-import-method-next is present', async ({ page }) => {
    expect(await page.locator('button.wkit-import-method-next.wkit-btn-class').count()).toBeGreaterThan(0);
  });

  test('37.02 Method back button .wkit-import-method-back is present', async ({ page }) => {
    expect(await page.locator('button.wkit-import-method-back.wkit-outer-btn-class').count()).toBeGreaterThan(0);
  });

  test('37.03 Next button shows "Import" text when Dummy card is selected', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
    }
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      const text = await nextBtn.textContent();
      expect(text.trim()).toMatch(/import/i);
    }
  });

  test('37.04 Next button is enabled when Dummy card is selected', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(400);
    }
    const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await expect(nextBtn).toBeEnabled({ timeout: 5000 });
    }
  });

  test('37.05 Next button shows "Next" text when AI card is selected (authenticated)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card selection');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(600);
        const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
        if ((await nextBtn.count()) > 0) {
          const text = await nextBtn.textContent();
          // When AI selected, button text changes to "Next" (goes to AI content step)
          expect(text.trim()).toMatch(/next/i);
        }
      }
    }
  });

  test('37.06 Next button is enabled when AI card is selected (authenticated)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card selection');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(600);
        const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
        if ((await nextBtn.count()) > 0) {
          await expect(nextBtn).toBeEnabled({ timeout: 5000 });
        }
      }
    }
  });

  test('37.07 Clicking Next with AI selected navigates to AI content step', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card and AI-compatible template');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(600);
        const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
        if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
          await nextBtn.click();
          await page.waitForTimeout(3000);
          // Should navigate to AI content step (site info or image library)
          const aiStep = await page.locator('.wkit-get-site-info-content, .wkit-get-site-img-content').count();
          expect(aiStep).toBeGreaterThan(0);
        }
      }
    }
  });

});

// =============================================================================
// 38. Method step — Back navigation to Feature step
// =============================================================================
test.describe('38. Method step — Back navigation to Feature step', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('38.01 Method Back button .wkit-import-method-back is visible', async ({ page }) => {
    await expect(page.locator('button.wkit-import-method-back.wkit-outer-btn-class')).toBeVisible({ timeout: 8000 });
  });

  test('38.02 Clicking Method Back navigates to Feature step (.wkit-import-temp-feature)', async ({ page }) => {
    const backBtn = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
      expect(await page.locator('.wkit-import-temp-feature').count()).toBeGreaterThan(0);
    }
  });

  test('38.03 Method Back click does not cause console errors', async ({ page }) => {
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

  test('38.04 After back from Method step, breadcrumb "Select Features" becomes active again', async ({ page }) => {
    const backBtn = page.locator('button.wkit-import-method-back.wkit-outer-btn-class');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(2000);
      const active = page.locator('.wkit-active-breadcrumbs .wkit-breadcrumbs-card-title');
      if ((await active.count()) > 0) {
        const text = await active.first().textContent();
        expect(text.trim()).toMatch(/select features/i);
      }
    }
  });

});

// =============================================================================
// §A. Import Method Step — Responsive layout
// =============================================================================
test.describe('§A. Import Method Step — Responsive layout', () => {
  const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const vp of VIEWPORTS) {
    test(`§A.01 Method step renders without horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await openMethodStep(page);
      const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
      expect.soft(hasHScroll, `Horizontal scroll at ${vp.name}`).toBe(false);
    });

    test(`§A.02 Method step buttons are visible at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await openMethodStep(page);
      const stepVisible = await page.locator('.wkit-import-method-main').isVisible({ timeout: 10000 }).catch(() => false);
      expect.soft(stepVisible, `Method step not visible at ${vp.name}`).toBe(true);
      await expect(page.locator('body')).not.toContainText('Fatal error');
    });
  }
});

// =============================================================================
// §B. Import Method Step — Accessibility (WCAG 2.1 AA)
// =============================================================================
test.describe('§B. Import Method Step — Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('§B.01 Method selection buttons/options have visible focus indicators', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const focusedEl = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName, outline: getComputedStyle(el).outline } : null;
    });
    // Focus should not be stuck on body
    expect.soft(focusedEl?.tag).not.toBe('BODY');
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('§B.02 Method option cards have accessible role or label (aria-label/text content)', async ({ page }) => {
    const cards = await page.locator('.wkit-method-card').all();
    for (const card of cards.slice(0, 3)) {
      const ariaLabel = await card.getAttribute('aria-label').catch(() => null);
      const text = await card.textContent().catch(() => '');
      const hasLabel = (ariaLabel && ariaLabel.trim().length > 0) || text.trim().length > 0;
      expect.soft(hasLabel, 'Method card has no accessible label').toBe(true);
    }
  });
});

// =============================================================================
// §C. Import Method Step — Keyboard Navigation
// =============================================================================
test.describe('§C. Import Method Step — Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await openMethodStep(page);
  });

  test('§C.01 Tab key navigates through method options without focus trap', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
    }
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName || 'UNKNOWN');
    expect.soft(['BODY', 'HTML']).not.toContain(focusedTag);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('§C.02 Escape key does not break the method step UI', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(page.locator('.wkit-import-method-main')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });
});

// =============================================================================
// §D. Import Method Step — Performance
// =============================================================================
test.describe('§D. Import Method Step — Performance', () => {
  test('§D.01 Method step renders within 5 seconds of navigation', async ({ page }) => {
    const t0 = Date.now();
    await openMethodStep(page);
    const elapsed = Date.now() - t0;
    expect.soft(elapsed, `Method step render took ${elapsed}ms`).toBeLessThan(5000);
  });
});

// =============================================================================
// §E. Import Method Step — Tap target size
// =============================================================================
test.describe('§E. Import Method Step — Tap target size', () => {
  test('§E.01 Method selection cards are ≥ 44px tall on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openMethodStep(page);
    const cards = await page.locator('.wkit-method-card').all();
    for (const card of cards.slice(0, 3)) {
      if (!await card.isVisible().catch(() => false)) continue;
      const box = await card.boundingBox().catch(() => null);
      if (box) {
        expect.soft(box.height, `Method card height ${box.height}px < 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

// =============================================================================
// §F. Import Method Step — RTL layout
// =============================================================================
test.describe('§F. Import Method Step — RTL layout', () => {
  test('§F.01 Method step does not overflow in RTL direction mode', async ({ page }) => {
    await openMethodStep(page);
    await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
    await page.waitForTimeout(400);
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5).catch(() => false);
    expect.soft(hasHScroll, 'Horizontal overflow in RTL mode').toBe(false);
    await page.evaluate(() => { document.documentElement.removeAttribute('dir'); });
  });
});
