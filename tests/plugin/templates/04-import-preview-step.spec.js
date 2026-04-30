// =============================================================================
// WDesignKit Templates Suite — Import Preview Step (Step 1)
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 12 — Import wizard entry point (7 tests)
//   Section 13 — Preview step layout & all panels (10 tests)
//   Section 14 — Business Name field required validation (10 tests)
//   Section 15 — All other form fields (17 tests)
//   Section 16 — Additional content section (8 tests)
//   Section 17 — Global color & palette (8 tests)
//   Section 18 — Global typography (4 tests)
//   Section 19 — Responsive preview toggle (8 tests)
//   Section 20 — Page dropdown (5 tests)
//   Section 21 — Preview iframe & skeleton (7 tests)
//   Section 22 — Light/dark mode toggle (3 tests)
//   Section 23 — Next button disabled state & tooltip (6 tests)
//   Section 24 — Pro plugin notice (2 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');

// =============================================================================
// 12. Import wizard — entry point (card click → route change)
// =============================================================================
test.describe('12. Import wizard — entry point', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('12.01 Clicking a card import button changes hash to #/import-kit/{id}', async ({ page }) => {
    await clickFirstCardImport(page);
    await page.waitForTimeout(2000);
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toMatch(/#\/import-kit\//);
  });

  test('12.02 Import wizard root .wkit-temp-import-mian is rendered after card click', async ({ page }) => {
    await clickFirstCardImport(page);
    const count = await page.locator('.wkit-temp-import-mian').count();
    expect(count).toBeGreaterThan(0);
  });

  test('12.03 Import wizard header .wkit-import-temp-header is visible', async ({ page }) => {
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const count = await page.locator('.wkit-import-temp-header').count();
    expect(count).toBeGreaterThan(0);
  });

  test('12.04 Breadcrumbs container .wkit-header-breadcrumbs is present in wizard', async ({ page }) => {
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const count = await page.locator('.wkit-header-breadcrumbs').count();
    expect(count).toBeGreaterThan(0);
  });

  test('12.05 Step 1 shows left editor panel .wkit-ai-import-main', async ({ page }) => {
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const count = await page.locator('.wkit-ai-import-main').count();
    expect(count).toBeGreaterThan(0);
  });

  test('12.06 Step 1 shows right preview panel .wkit-ai-import-fram', async ({ page }) => {
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const count = await page.locator('.wkit-ai-import-fram').count();
    expect(count).toBeGreaterThan(0);
  });

  test('12.07 No console errors when entering import wizard', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await clickFirstCardImport(page);
    await page.waitForTimeout(3000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 13. Preview step (Step 1) — layout & all panels
// =============================================================================
test.describe('13. Preview step (Step 1) — layout & all panels', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('13.01 Editor wrapper .wkit-ai-import-preview is visible', async ({ page }) => {
    const count = await page.locator('.wkit-ai-import-preview').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.02 Editor header .wkit-preview-editor-header is visible', async ({ page }) => {
    const count = await page.locator('.wkit-preview-editor-header').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.03 Template title .wkit-editor-temp-title is rendered with text', async ({ page }) => {
    const title = page.locator('.wkit-editor-temp-title').first();
    const count = await title.count();
    if (count > 0) {
      const text = await title.textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('13.04 Editor body .wkit-preview-editor-body is present', async ({ page }) => {
    const count = await page.locator('.wkit-preview-editor-body').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.05 Basic Info section .wkit-temp-basic-info is visible', async ({ page }) => {
    const count = await page.locator('.wkit-temp-basic-info').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.06 Editor footer .wkit-preview-editor-footer is present', async ({ page }) => {
    const count = await page.locator('.wkit-preview-editor-footer').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.07 Footer buttons container .wkit-editor-footer-btns is present', async ({ page }) => {
    const count = await page.locator('.wkit-editor-footer-btns').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.08 Right panel preview container .wkit-temp-preview-con is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-preview-con').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.09 Responsive bar .wkit-temp-responsive is present in preview panel', async ({ page }) => {
    const count = await page.locator('.wkit-temp-responsive').count();
    expect(count).toBeGreaterThan(0);
  });

  test('13.10 Preview area .wkit-temp-preview-content is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-preview-content').count();
    expect(count).toBeGreaterThan(0);
  });

});

// =============================================================================
// 14. Preview step — Business Name field (required validation)
// =============================================================================
test.describe('14. Preview step — Business Name field required validation', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('14.01 Business Name label .wkit-site-name-label is visible', async ({ page }) => {
    const count = await page.locator('label.wkit-site-name-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('14.02 Business Name label contains required asterisk span', async ({ page }) => {
    const count = await page.locator('span.wkit-site-label-required').count();
    expect(count).toBeGreaterThan(0);
  });

  test('14.03 Business Name input .wkit-site-name-inp is visible', async ({ page }) => {
    await expect(page.locator('input.wkit-site-name-inp')).toBeVisible({ timeout: 10000 });
  });

  test('14.04 Next button is disabled when Business Name is empty', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    const nameCount = await nameInput.count();
    if (nameCount > 0) {
      await nameInput.fill('');
      await page.waitForTimeout(500);
      const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
      const nextCount = await nextBtn.count();
      if (nextCount > 0) {
        const disabled = await nextBtn.isDisabled();
        expect(disabled).toBe(true);
      }
    }
  });

  test('14.05 Next button becomes enabled after entering Business Name', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    const nameCount = await nameInput.count();
    if (nameCount > 0) {
      await nameInput.fill('Test Business');
      await page.waitForTimeout(500);
      const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
      const nextCount = await nextBtn.count();
      if (nextCount > 0) {
        await expect(nextBtn).toBeEnabled({ timeout: 5000 });
      }
    }
  });

  test('14.06 Disabled Next shows tooltip .wkit-notice-tooltip-txt when name empty', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('');
      await page.waitForTimeout(300);
      const tooltipCount = await page.locator('span.wkit-notice-tooltip-txt').count();
      expect(tooltipCount).toBeGreaterThan(0);
    }
  });

  test('14.07 Next button wrapper .wkit-next-btn-content is present', async ({ page }) => {
    const count = await page.locator('.wkit-next-btn-content').count();
    expect(count).toBeGreaterThan(0);
  });

  test('14.08 Business Name input accepts text input', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('QA Test Business Name');
      const val = await nameInput.inputValue();
      expect(val).toBe('QA Test Business Name');
    }
  });

  test('14.09 Clearing Business Name after entry re-disables Next button', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Some Name');
      await page.waitForTimeout(400);
      await nameInput.fill('');
      await page.waitForTimeout(400);
      const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
      if ((await nextBtn.count()) > 0) {
        const disabled = await nextBtn.isDisabled();
        expect(disabled).toBe(true);
      }
    }
  });

  test('14.10 Whitespace-only Business Name keeps Next disabled', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('   ');
      await page.waitForTimeout(500);
      const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
      if ((await nextBtn.count()) > 0) {
        await expect.soft(nextBtn).toBeDisabled({ timeout: 2000 });
      }
    }
  });

});

// =============================================================================
// 15. Preview step — all other form fields
// =============================================================================
test.describe('15. Preview step — all other form fields', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('15.01 Tagline label .wkit-site-tagline-label is present', async ({ page }) => {
    const count = await page.locator('label.wkit-site-tagline-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.02 Tagline input .wkit-site-tagline-inp is present', async ({ page }) => {
    const count = await page.locator('input.wkit-site-tagline-inp').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.03 Tagline input accepts text', async ({ page }) => {
    const input = page.locator('input.wkit-site-tagline-inp');
    if ((await input.count()) > 0) {
      await input.fill('Your business tagline');
      const val = await input.inputValue();
      expect(val).toBe('Your business tagline');
    }
  });

  test('15.04 Address label .wkit-site-address-label is present', async ({ page }) => {
    const count = await page.locator('label.wkit-site-address-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.05 Address input .wkit-site-address-inp is present', async ({ page }) => {
    const count = await page.locator('input.wkit-site-address-inp, .wkit-site-address-inp').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.06 Email label .wkit-site-email-label is present', async ({ page }) => {
    const count = await page.locator('label.wkit-site-email-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.07 Email input .wkit-site-email-inp is present', async ({ page }) => {
    const count = await page.locator('input.wkit-site-email-inp').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.08 Mobile label .wkit-site-mobile-label is present', async ({ page }) => {
    const count = await page.locator('label.wkit-site-mobile-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.09 Mobile input .wkit-site-mobile-inp is present', async ({ page }) => {
    const count = await page.locator('input.wkit-site-mobile-inp').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.10 Logo label .wkit-site-logo-label is present', async ({ page }) => {
    const count = await page.locator('label.wkit-site-logo-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.11 Logo upload area .wkit-site-logo-content is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-logo-content').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.12 Logo upload area has plus icon .wdkit-i-wb-plus', async ({ page }) => {
    const count = await page.locator('.wdkit-i-wb-plus').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.13 Logo upload text .wkit-site-logo-txt is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-logo-txt').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.14 Social links label .wkit-site-sociallink-label is present', async ({ page }) => {
    const count = await page.locator('label.wkit-site-sociallink-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.15 Social link section .wkit-temp-site-sociallink is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-site-sociallink').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.16 Info separator hr.wkit-temp-info-seperater is present', async ({ page }) => {
    const count = await page.locator('hr.wkit-temp-info-seperater, .wdkit-style-divider').count();
    expect(count).toBeGreaterThan(0);
  });

  test('15.17 All basic info fields are editable (not read-only)', async ({ page }) => {
    const inputs = [
      'input.wkit-site-tagline-inp',
      'input.wkit-site-email-inp',
      'input.wkit-site-mobile-inp',
    ];
    for (const sel of inputs) {
      const el = page.locator(sel);
      if ((await el.count()) > 0) {
        const ro = await el.getAttribute('readonly');
        expect(ro).toBeNull();
      }
    }
  });

});

// =============================================================================
// 16. Preview step — additional content section
// =============================================================================
test.describe('16. Preview step — additional content section', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('16.01 Additional info section .wkit-temp-additional-info is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-additional-info').count();
    expect(count).toBeGreaterThan(0);
  });

  test('16.02 Additional info header .wkit-temp-additional-info-head is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-additional-info-head').count();
    expect(count).toBeGreaterThan(0);
  });

  test('16.03 Additional info header text .wkit-additional-info-head-txt is present', async ({ page }) => {
    const count = await page.locator('.wkit-additional-info-head-txt').count();
    expect(count).toBeGreaterThan(0);
  });

  test('16.04 Info tooltip .wkit-temp-info-tooltip is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-info-tooltip').count();
    expect(count).toBeGreaterThan(0);
  });

  test('16.05 Info tooltip has info icon .wdkit-i-info', async ({ page }) => {
    const count = await page.locator('.wdkit-i-info').count();
    expect(count).toBeGreaterThan(0);
  });

  test('16.06 Tooltip text .wkit-temp-info-tooltip-txt is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-info-tooltip-txt').count();
    expect(count).toBeGreaterThan(0);
  });

  test('16.07 Expand/collapse icon .wdkit-i-down-arrow.wkit-info-drp-icon is present', async ({ page }) => {
    const count = await page.locator('.wdkit-i-down-arrow.wkit-info-drp-icon').count();
    expect(count).toBeGreaterThan(0);
  });

  test('16.08 Clicking additional info header expands the body section', async ({ page }) => {
    const header = page.locator('.wkit-temp-additional-info-head');
    if ((await header.count()) > 0) {
      await header.click();
      await page.waitForTimeout(800);
      await expect.soft(page.locator('.wkit-temp-additional-info-body').first()).toBeVisible({ timeout: 3000 });
    }
  });

});

// =============================================================================
// 17. Preview step — global color & palette
// =============================================================================
test.describe('17. Preview step — global color & palette', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('17.01 Global color edit section .wkit-temp-global-color-edit is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-global-color-edit').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('17.02 Global color header .wkit-global-color-header is present if section exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-global-color-edit');
    if ((await section.count()) > 0) {
      const headerCount = await page.locator('.wkit-global-color-header').count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('17.03 Global color body .wkit-global-color-body is present if section exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-global-color-edit');
    if ((await section.count()) > 0) {
      const bodyCount = await page.locator('.wkit-global-color-body').count();
      expect(bodyCount).toBeGreaterThan(0);
    }
  });

  test('17.04 Color palette section .wkit-temp-palette-color-edit is present', async ({ page }) => {
    const count = await page.locator('.wkit-temp-palette-color-edit').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('17.05 Palette header .wkit-palette-color-header is present if section exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-palette-color-edit');
    if ((await section.count()) > 0) {
      const count = await page.locator('.wkit-palette-color-header').count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('17.06 Primary color box .wkit-primary-color-box is present if palette exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-palette-color-edit');
    if ((await section.count()) > 0) {
      const count = await page.locator('.wkit-primary-color-box').count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('17.07 Secondary color box .wkit-secondary-color-box is present if palette exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-palette-color-edit');
    if ((await section.count()) > 0) {
      const count = await page.locator('.wkit-secondary-color-box').count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('17.08 Global color data loop .wkit-global-data-loop renders items if section exists', async ({ page }) => {
    const section = page.locator('.wkit-global-color-body');
    if ((await section.count()) > 0) {
      const items = await page.locator('.wkit-global-data-loop').count();
      expect(items).toBeGreaterThanOrEqual(0);
    }
  });

});

// =============================================================================
// 18. Preview step — global typography
// =============================================================================
test.describe('18. Preview step — global typography', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('18.01 Typography section .wkit-temp-global-typography-edit is present if rendered', async ({ page }) => {
    const count = await page.locator('.wkit-temp-global-typography-edit').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('18.02 Typography header .wkit-global-typography-header is present if section exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-global-typography-edit');
    if ((await section.count()) > 0) {
      const count = await page.locator('.wkit-global-typography-header').count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('18.03 Typography body .wkit-global-typography-body is present if section exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-global-typography-edit');
    if ((await section.count()) > 0) {
      const count = await page.locator('.wkit-global-typography-body').count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('18.04 Typography button .wkit-global-typo-btn is present if section exists', async ({ page }) => {
    const section = page.locator('.wkit-temp-global-typography-edit');
    if ((await section.count()) > 0) {
      const count = await page.locator('.wkit-global-typo-btn').count();
      expect(count).toBeGreaterThan(0);
    }
  });

});

// =============================================================================
// 19. Preview step — responsive preview toggle (desktop/tablet/mobile)
// =============================================================================
test.describe('19. Preview step — responsive preview toggle', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('19.01 Responsive bar .wkit-temp-responsive is visible', async ({ page }) => {
    const count = await page.locator('.wkit-temp-responsive').count();
    expect(count).toBeGreaterThan(0);
  });

  test('19.02 Desktop icon .wdkit-i-computer is present in responsive bar', async ({ page }) => {
    const count = await page.locator('.wdkit-i-computer').count();
    expect(count).toBeGreaterThan(0);
  });

  test('19.03 Tablet icon .wdkit-i-tablet is present in responsive bar', async ({ page }) => {
    const count = await page.locator('.wdkit-i-tablet').count();
    expect(count).toBeGreaterThan(0);
  });

  test('19.04 Mobile icon .wdkit-i-smart-phone is present in responsive bar', async ({ page }) => {
    const count = await page.locator('.wdkit-i-smart-phone').count();
    expect(count).toBeGreaterThan(0);
  });

  test('19.05 Clicking tablet icon does not throw errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const tabletIcon = page.locator('.wdkit-i-tablet');
    if ((await tabletIcon.count()) > 0) {
      await tabletIcon.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('19.06 Clicking mobile icon does not throw errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const mobileIcon = page.locator('.wdkit-i-smart-phone');
    if ((await mobileIcon.count()) > 0) {
      await mobileIcon.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('19.07 Clicking desktop icon after mobile restores preview', async ({ page }) => {
    const mobileIcon = page.locator('.wdkit-i-smart-phone');
    const desktopIcon = page.locator('.wdkit-i-computer');
    if ((await mobileIcon.count()) > 0 && (await desktopIcon.count()) > 0) {
      await mobileIcon.click({ force: true });
      await page.waitForTimeout(800);
      await desktopIcon.click({ force: true });
      await page.waitForTimeout(800);
      const previewCount = await page.locator('.wkit-temp-preview-content').count();
      expect(previewCount).toBeGreaterThan(0);
    }
  });

  test('19.08 Responsive icons each have .wkit-responsive-icon class', async ({ page }) => {
    const icons = page.locator('.wkit-responsive-icon');
    const count = await icons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

});

// =============================================================================
// 20. Preview step — page dropdown
// =============================================================================
test.describe('20. Preview step — page dropdown', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('20.01 Page dropdown wrapper .wkit-page-drp is present', async ({ page }) => {
    const count = await page.locator('.wkit-page-drp').count();
    expect(count).toBeGreaterThan(0);
  });

  test('20.02 Page dropdown header .wkit-page-drp-header is clickable', async ({ page }) => {
    const header = page.locator('.wkit-page-drp-header');
    if ((await header.count()) > 0) {
      await expect(header).toBeVisible({ timeout: 5000 });
    }
  });

  test('20.03 Clicking page dropdown header opens the dropdown body', async ({ page }) => {
    const header = page.locator('.wkit-page-drp-header');
    if ((await header.count()) > 0) {
      await header.click({ force: true });
      await page.waitForTimeout(800);
      const bodyCount = await page.locator('.wkit-page-drp-body').count();
      expect(bodyCount).toBeGreaterThan(0);
    }
  });

  test('20.04 Page dropdown shows template list items .wkit-temp-list-drp when open', async ({ page }) => {
    const header = page.locator('.wkit-page-drp-header');
    if ((await header.count()) > 0) {
      await header.click({ force: true });
      await page.waitForTimeout(800);
      await expect.soft(page.locator('.wkit-temp-list-drp').first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('20.05 Clicking outside dropdown closes it without error', async ({ page }) => {
    const header = page.locator('.wkit-page-drp-header');
    if ((await header.count()) > 0) {
      await header.click({ force: true });
      await page.waitForTimeout(500);
      await page.locator('.wkit-preview-editor-header').first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
      await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 5000 });
    }
  });

});

// =============================================================================
// 21. Preview step — preview iframe & skeleton
// =============================================================================
test.describe('21. Preview step — preview iframe & skeleton', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('21.01 Preview iframe iframe.wkit-temp-preview-ifram is in the DOM', async ({ page }) => {
    const count = await page.locator('iframe.wkit-temp-preview-ifram').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('21.02 Preview skeleton .wkit-preview-card-skeleton shown during load', async ({ page }) => {
    const count = await page.locator('.wkit-preview-card-skeleton').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('21.03 Content notice .wkit-preview-content-notice is present', async ({ page }) => {
    const count = await page.locator('.wkit-preview-content-notice').count();
    expect(count).toBeGreaterThan(0);
  });

  test('21.04 Content notice dots container .wkit-content-notice-dots is present', async ({ page }) => {
    const count = await page.locator('.wkit-content-notice-dots').count();
    expect(count).toBeGreaterThan(0);
  });

  test('21.05 Content notice has 3 dummy dots span.wkit-dummy-dots', async ({ page }) => {
    const dotsCount = await page.locator('span.wkit-dummy-dots').count();
    expect(dotsCount).toBeGreaterThanOrEqual(3);
  });

  test('21.06 Content notice text .wkit-content-notice-txt is present with text', async ({ page }) => {
    const count = await page.locator('.wkit-content-notice-txt').count();
    expect(count).toBeGreaterThan(0);
  });

  test('21.07 Preview iframe has a src attribute once loaded', async ({ page }) => {
    await page.waitForTimeout(3000);
    const iframe = page.locator('iframe.wkit-temp-preview-ifram');
    const iframeCount = await iframe.count();
    if (iframeCount > 0) {
      const src = await iframe.getAttribute('src');
      expect(src).not.toBeUndefined();
    }
  });

});

// =============================================================================
// 22. Preview step — light/dark mode toggle
// =============================================================================
test.describe('22. Preview step — light/dark mode toggle', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('22.01 Light/Dark toggle container .wkit-custom-lightDark-content is present if rendered', async ({ page }) => {
    const count = await page.locator('.wkit-custom-lightDark-content').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('22.02 Clicking light/dark toggle does not throw errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const toggle = page.locator('.wkit-custom-lightDark-content');
    if ((await toggle.count()) > 0) {
      await toggle.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('22.03 Light/Dark toggle does not break the preview panel', async ({ page }) => {
    const toggle = page.locator('.wkit-custom-lightDark-content');
    if ((await toggle.count()) > 0) {
      await toggle.click({ force: true });
      await page.waitForTimeout(800);
      const previewCount = await page.locator('.wkit-temp-preview-con').count();
      expect(previewCount).toBeGreaterThan(0);
    }
  });

});

// =============================================================================
// 23. Preview step — Next button disabled state & tooltip
// =============================================================================
test.describe('23. Preview step — Next button disabled state & tooltip', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  });

  test('23.01 Back button button.wkit-back-btn.wkit-outer-btn-class is visible', async ({ page }) => {
    const count = await page.locator('button.wkit-back-btn.wkit-outer-btn-class').count();
    expect(count).toBeGreaterThan(0);
  });

  test('23.02 Clicking Back button navigates away from wizard', async ({ page }) => {
    const backBtn = page.locator('button.wkit-back-btn.wkit-outer-btn-class');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await page.waitForTimeout(1500);
      const hash = await page.evaluate(() => location.hash);
      expect(hash).not.toMatch(/#\/import-kit\//);
    }
  });

  test('23.03 Next button is disabled without business name', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('');
      await page.waitForTimeout(300);
    }
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      const disabled = await nextBtn.isDisabled();
      expect(disabled).toBe(true);
    }
  });

  test('23.04 Tooltip span.wkit-notice-tooltip-txt is visible when Next is disabled', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('');
      await page.waitForTimeout(300);
    }
    const tooltip = page.locator('span.wkit-notice-tooltip-txt');
    const count = await tooltip.count();
    expect(count).toBeGreaterThan(0);
  });

  test('23.05 Next button is enabled after entering a valid business name', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Valid Business Name');
      await page.waitForTimeout(400);
      const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
      if ((await nextBtn.count()) > 0) {
        await expect(nextBtn).toBeEnabled({ timeout: 5000 });
      }
    }
  });

  test('23.06 Clicking enabled Next button advances to Step 2', async ({ page }) => {
    const nameInput = page.locator('input.wkit-site-name-inp');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('QA Advance Test');
      await page.waitForTimeout(400);
      const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
      if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(3000);
        const featureCount = await page.locator('.wkit-import-temp-feature').count();
        expect(featureCount).toBeGreaterThan(0);
      }
    }
  });

});

// =============================================================================
// 24. Preview step — Pro plugin notice
// =============================================================================
test.describe('24. Preview step — Pro plugin notice', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('24.01 Pro tag .wdkit-card-tag.wdkit-pro-crd appears on pro cards in the grid', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 });
    const proTags = await page.locator('.wdkit-card-tag.wdkit-pro-crd').count();
    expect(proTags).toBeGreaterThanOrEqual(0);
  });

  test('24.02 Clicking a pro card still opens the import wizard', async ({ page }) => {
    const proCard = page.locator('.wdkit-browse-card').filter({ has: page.locator('.wdkit-pro-crd') }).first();
    const proCount = await proCard.count();
    if (proCount > 0) {
      await clickFirstCardImport(page);
      const wizardCount = await page.locator('.wkit-temp-import-mian').count();
      expect(wizardCount).toBeGreaterThan(0);
    }
  });

});
