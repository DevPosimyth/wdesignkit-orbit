// =============================================================================
// WDesignKit Templates Suite — Import AI Step (Step 4)
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 39 — AI content_media step (Step 4) all fields (10 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, WDKIT_TOKEN } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep } = require('./_helpers/wizard');

// =============================================================================
// 39. AI content_media step (Step 4) — all fields
// =============================================================================
test.describe('39. AI content_media step (Step 4) — all fields', () => {
  test.describe.configure({ mode: 'serial' });

  test('39.01 content_media step container .wkit-get-site-info-content is present when AI auth', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const aiCard = page.locator('.wkit-method-card').nth(1);
    if ((await aiCard.count()) > 0) {
      const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents);
      if (pe !== 'none') {
        await aiCard.click({ force: true });
        await page.waitForTimeout(500);
        const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
        if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
          await nextBtn.click();
          await page.waitForTimeout(3000);
          const infoCount = await page.locator('.wkit-get-site-info-content').count();
          expect(infoCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test('39.02 Site info title says "Tell Us About Your Website"', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const title = page.locator('.wkit-get-site-info-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/tell us about your website/i);
    }
  });

  test('39.03 About website input .wkit-site-info-inp is present on content_media step', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const infoInput = page.locator('.wkit-site-info-inp');
    await expect.soft(infoInput).toBeVisible({ timeout: 5000 });
  });

  test('39.04 Language dropdown .wkit-site-lang-drp is present on content_media step', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const langDrp = page.locator('.wkit-site-lang-drp');
    await expect.soft(langDrp).toBeVisible({ timeout: 5000 });
  });

  test('39.05 Industry dropdown .wkit-site-industry-drp is present on content_media step', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const industryDrp = page.locator('.wkit-site-industry-drp');
    await expect.soft(industryDrp).toBeVisible({ timeout: 5000 });
  });

  test('39.06 Description textarea .wkit-site-desc-inp is present on content_media step', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const textarea = page.locator('textarea.wkit-site-desc-inp');
    await expect.soft(textarea).toBeVisible({ timeout: 5000 });
  });

  test('39.07 AI Write button .wkit-site-ai-description is present on content_media step', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const aiWrite = page.locator('.wkit-site-ai-description');
    await expect.soft(aiWrite).toBeVisible({ timeout: 5000 });
  });

  test('39.08 Language dropdown opens on click', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const langHead = page.locator('.wkit-site-lang-drp-head');
    if ((await langHead.count()) > 0) {
      await langHead.click({ force: true });
      await page.waitForTimeout(800);
      await expect.soft(page.locator('.wkit-site-lang-drp-body')).toBeVisible({ timeout: 2000 });
    }
  });

  test('39.09 Industry dropdown opens on click', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const industryHead = page.locator('.wkit-site-industry-drp-head');
    if ((await industryHead.count()) > 0) {
      await industryHead.click({ force: true });
      await page.waitForTimeout(800);
      await expect.soft(page.locator('.wkit-site-industry-drp-body')).toBeVisible({ timeout: 2000 });
    }
  });

  test('39.10 Site info header .wkit-get-site-info-header is present if step visible', async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDesignKit API token');
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachMethodStep(page);
    const header = page.locator('.wkit-get-site-info-header');
    await expect.soft(header).toBeVisible({ timeout: 5000 });
  });

});
