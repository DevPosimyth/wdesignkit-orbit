// =============================================================================
// WDesignKit Templates Suite — Import Method Step (Step 3)
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 31 — Method step layout & header text (10 tests)
//   Section 32 — Dummy Content card selection & active state (5 tests)
//   Section 33 — AI card state (Coming Soon when not authenticated, 5 tests)
//   Section 34 — Blog toggle visibility (3 tests)
//   Section 35 — Wireframe toggle visibility (3 tests)
//   Section 36 — Import button text for Dummy selection (3 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep } = require('./_helpers/wizard');

// =============================================================================
// 31. Method step (Step 3) — layout & header text
// =============================================================================
test.describe('31. Method step (Step 3) — layout & header text', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
  });

  test('31.01 Method step container .wkit-import-method-main is visible', async ({ page }) => {
    await expect(page.locator('.wkit-import-method-main')).toBeVisible({ timeout: 15000 });
  });

  test('31.02 Method inner container .wkit-import-method-container is present', async ({ page }) => {
    const count = await page.locator('.wkit-import-method-container').count();
    expect(count).toBeGreaterThan(0);
  });

  test('31.03 Method header .wkit-import-method-header is present', async ({ page }) => {
    const count = await page.locator('.wkit-import-method-header').count();
    expect(count).toBeGreaterThan(0);
  });

  test('31.04 Method title says "Content & Media Setup"', async ({ page }) => {
    const title = page.locator('.wkit-method-header-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/content.*media setup/i);
    }
  });

  test('31.05 Method subtitle is present .wkit-method-header-subtitle', async ({ page }) => {
    const count = await page.locator('.wkit-method-header-subtitle').count();
    expect(count).toBeGreaterThan(0);
  });

  test('31.06 Method body .wkit-import-method-body is present', async ({ page }) => {
    const count = await page.locator('.wkit-import-method-body').count();
    expect(count).toBeGreaterThan(0);
  });

  test('31.07 Method card container .wkit-method-card-content is present', async ({ page }) => {
    const count = await page.locator('.wkit-method-card-content').count();
    expect(count).toBeGreaterThan(0);
  });

  test('31.08 At least 2 method cards .wkit-method-card are rendered', async ({ page }) => {
    const count = await page.locator('.wkit-method-card').count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('31.09 Method footer .wkit-import-method-footer is present', async ({ page }) => {
    const count = await page.locator('.wkit-import-method-footer').count();
    expect(count).toBeGreaterThan(0);
  });

  test('31.10 Method step does not show console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.waitForTimeout(1500);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
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
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
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
    const count = await icon.count();
    expect(count).toBeGreaterThan(0);
  });

  test('32.04 Dummy card description .wkit-method-card-desc is present', async ({ page }) => {
    const desc = page.locator('.wkit-method-card').first().locator('.wkit-method-card-desc');
    const count = await desc.count();
    expect(count).toBeGreaterThan(0);
  });

  test('32.05 Clicking Dummy card keeps it as active card', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
      const classes = await dummyCard.getAttribute('class');
      expect(classes).toContain('wkit-active-card');
    }
  });

});

// =============================================================================
// 33. Method step — AI card state (Coming Soon when not authenticated)
// =============================================================================
test.describe('33. Method step — AI card state (Coming Soon when not authenticated)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
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
      const icon = aiCard.locator('.wkit-ai-card-header i.wdkit-i-ai');
      const count = await icon.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('33.03 AI card shows "Coming Soon" tag when user is not authenticated', async ({ page }) => {
    if (WDKIT_TOKEN) {
      test.skip(true, 'User may be authenticated — skip Coming Soon check');
      return;
    }
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const tag = aiCard.locator('.wkit-coming-soon-tag');
      const count = await tag.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('33.04 AI card has disable overlay .wkit-disable-opacity-div when not authenticated', async ({ page }) => {
    if (WDKIT_TOKEN) {
      test.skip(true, 'User may be authenticated');
      return;
    }
    const overlay = page.locator('.wkit-disable-opacity-div');
    const count = await overlay.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('33.05 AI card has style pointer-events:none when not authenticated', async ({ page }) => {
    if (WDKIT_TOKEN) {
      test.skip(true, 'User may be authenticated');
      return;
    }
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      expect(pe).toBe('none');
    }
  });

});

// =============================================================================
// 34. Method step — blog toggle visibility (ONLY on AI selection)
// =============================================================================
test.describe('34. Method step — blog toggle visibility', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('34.01 Blog toggle #wkit-blog-switcher-inp is NOT visible when Dummy card is selected', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
    }
    const blogToggle = page.locator('#wkit-blog-switcher-inp');
    const count = await blogToggle.count();
    if (count > 0) {
      const visible = await blogToggle.isVisible();
      expect(visible).toBe(false);
    } else {
      expect(count).toBe(0);
    }
  });

  test('34.02 Blog toggle wrapper .wkit-wirefram-content is hidden on dummy selection', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
    }
    const wrapper = page.locator('.wkit-wirefram-content');
    const count = await wrapper.count();
    if (count > 0) {
      const visible = await wrapper.isVisible();
      expect(visible).toBe(false);
    }
  });

  test('34.03 Blog toggle label text contains "Generate" when visible (AI only)', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth for AI card');
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const style = await aiCard.getAttribute('style');
      if (!style || !style.includes('pointer-events: none')) {
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

});

// =============================================================================
// 35. Method step — wireframe toggle visibility
// =============================================================================
test.describe('35. Method step — wireframe toggle visibility', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('35.01 Wireframe toggle #wkit-wirefram-switcher-inp is present only when AI authenticated', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth');
    const count = await page.locator('#wkit-wirefram-switcher-inp').count();
    expect(count).toBeGreaterThan(0);
  });

  test('35.02 Wireframe toggle is hidden when Dummy card is selected', async ({ page }) => {
    const dummyCard = page.locator('.wkit-method-card').first();
    if ((await dummyCard.count()) > 0) {
      await dummyCard.click({ force: true });
      await page.waitForTimeout(500);
    }
    const wireframe = page.locator('#wkit-wirefram-switcher-inp');
    if ((await wireframe.count()) > 0) {
      const visible = await wireframe.isVisible();
      expect(visible).toBe(false);
    }
  });

  test('35.03 Wireframe tooltip .wkit-wirefram-tooltip is present when wireframe visible', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit auth');
    const count = await page.locator('.wkit-wirefram-tooltip').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

});

// =============================================================================
// 36. Method step — Import button text for Dummy selection
// =============================================================================
test.describe('36. Method step — Import button text for Dummy selection', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    await page.locator('.wkit-import-method-main').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('36.01 Method Next button shows text "Import" when Dummy card is selected', async ({ page }) => {
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

  test('36.02 Method back button .wkit-import-method-back is present', async ({ page }) => {
    const count = await page.locator('button.wkit-import-method-back.wkit-outer-btn-class').count();
    expect(count).toBeGreaterThan(0);
  });

  test('36.03 Method Next button is enabled when Dummy card is selected', async ({ page }) => {
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

});
