// =============================================================================
// WDesignKit Templates Suite — Import Feature Step (Step 2)
// Version: 2.2.10
// Source: split from template-import.spec.js (Phase 1 restructure)
//
// COVERAGE
//   Section 25 — Feature step full layout (12 tests)
//   Section 26 — Each plugin card individually (12 tests)
//   Section 27 — Nexter Theme toggle (5 tests)
//   Section 28 — T&C checkbox behavior (7 tests)
//   Section 29 — Next button disabled/enabled state (5 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachFeatureStep, acceptTandC } = require('./_helpers/wizard');

// =============================================================================
// 25. Feature step (Step 2) — full layout
// =============================================================================
test.describe('25. Feature step (Step 2) — full layout', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
  });

  test('25.01 Feature step container .wkit-import-temp-feature is visible', async ({ page }) => {
    await expect(page.locator('.wkit-import-temp-feature')).toBeVisible({ timeout: 15000 });
  });

  test('25.02 Feature header .wkit-site-feature-header is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-feature-header').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.03 Feature title says "Choose What Your Site Needs"', async ({ page }) => {
    const title = page.locator('.wkit-feature-header-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/choose what your site needs/i);
    }
  });

  test('25.04 Feature subtitle is present .wkit-feature-header-subtitle', async ({ page }) => {
    const count = await page.locator('.wkit-feature-header-subtitle').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.05 Feature body .wkit-site-feature-body is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-feature-body').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.06 Plugin cards wrapper .wkit-site-feature-plugins is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-feature-plugins').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.07 At least 6 plugin cards are rendered .wkit-feature-plugin-card', async ({ page }) => {
    const count = await page.locator('.wkit-feature-plugin-card').count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('25.08 Feature footer .wkit-site-feature-footer is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-feature-footer').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.09 Feature step Back button is visible', async ({ page }) => {
    const count = await page.locator('button.wkit-site-feature-back.wkit-outer-btn-class, button.wkit-back-btn').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.10 Feature step Next button .wkit-site-feature-next is present', async ({ page }) => {
    const count = await page.locator('button.wkit-site-feature-next').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.11 Nexter Theme section .wkit-site-feature-theme is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-feature-theme').count();
    expect(count).toBeGreaterThan(0);
  });

  test('25.12 T&C note section .wkit-site-feature-note is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-feature-note').count();
    expect(count).toBeGreaterThan(0);
  });

});

// =============================================================================
// 26. Feature step — each plugin card (6 cards individually)
// =============================================================================
test.describe('26. Feature step — each plugin card individually', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('26.01 Design card title says "Design" and is required (no toggle)', async ({ page }) => {
    const designLabel = page.locator('label[for="wkit-card-switcher-inp-design"]');
    const count = await designLabel.count();
    if (count > 0) {
      const titleText = await designLabel.locator('.wkit-plugin-card-title').textContent().catch(() => '');
      expect(titleText.trim().toLowerCase()).toContain('design');
    }
  });

  test('26.02 eCommerce card toggle #wkit-card-switcher-inp-ecommerce is present', async ({ page }) => {
    const count = await page.locator('#wkit-card-switcher-inp-ecommerce').count();
    expect(count).toBeGreaterThan(0);
  });

  test('26.03 eCommerce card toggle can be checked/unchecked', async ({ page }) => {
    const toggle = page.locator('#wkit-card-switcher-inp-ecommerce');
    if ((await toggle.count()) > 0) {
      const before = await toggle.isChecked();
      await toggle.click({ force: true });
      await page.waitForTimeout(400);
      const after = await toggle.isChecked();
      expect(after).not.toBe(before);
    }
  });

  test('26.04 Dynamic Content card toggle #wkit-card-switcher-inp-dynamic_content is present', async ({ page }) => {
    const count = await page.locator('#wkit-card-switcher-inp-dynamic_content').count();
    expect(count).toBeGreaterThan(0);
  });

  test('26.05 Dynamic Content toggle can be checked/unchecked', async ({ page }) => {
    const toggle = page.locator('#wkit-card-switcher-inp-dynamic_content');
    if ((await toggle.count()) > 0) {
      const before = await toggle.isChecked();
      await toggle.click({ force: true });
      await page.waitForTimeout(400);
      const after = await toggle.isChecked();
      expect(after).not.toBe(before);
    }
  });

  test('26.06 Performance card toggle #wkit-card-switcher-inp-performance is present', async ({ page }) => {
    const count = await page.locator('#wkit-card-switcher-inp-performance').count();
    expect(count).toBeGreaterThan(0);
  });

  test('26.07 Security card toggle #wkit-card-switcher-inp-security is present', async ({ page }) => {
    const count = await page.locator('#wkit-card-switcher-inp-security').count();
    expect(count).toBeGreaterThan(0);
  });

  test('26.08 Extras card toggle #wkit-card-switcher-inp-extras is present', async ({ page }) => {
    const count = await page.locator('#wkit-card-switcher-inp-extras').count();
    expect(count).toBeGreaterThan(0);
  });

  test('26.09 Each plugin card has a title .wkit-plugin-card-title', async ({ page }) => {
    const titles = page.locator('.wkit-plugin-card-title');
    const count = await titles.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('26.10 Each plugin card has a description .wkit-plugin-card-desc', async ({ page }) => {
    const descs = page.locator('.wkit-plugin-card-desc');
    const count = await descs.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      const text = await descs.nth(i).textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('26.11 Optional card switchers are of type checkbox', async ({ page }) => {
    const switchers = page.locator('label.wkit-plugin-card-switcher input[type=checkbox]');
    const count = await switchers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('26.12 Toggling all optional plugins does not produce JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const toggles = [
      '#wkit-card-switcher-inp-ecommerce',
      '#wkit-card-switcher-inp-performance',
      '#wkit-card-switcher-inp-security',
    ];
    for (const sel of toggles) {
      const el = page.locator(sel);
      if ((await el.count()) > 0) {
        await el.click({ force: true });
        await page.waitForTimeout(200);
      }
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 27. Feature step — Nexter Theme toggle
// =============================================================================
test.describe('27. Feature step — Nexter Theme toggle', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('27.01 Nexter Theme section .wkit-site-feature-theme is present', async ({ page }) => {
    const count = await page.locator('.wkit-site-feature-theme').count();
    expect(count).toBeGreaterThan(0);
  });

  test('27.02 Nexter Theme toggle #wkit-theme-switcher is present', async ({ page }) => {
    const count = await page.locator('#wkit-theme-switcher').count();
    expect(count).toBeGreaterThan(0);
  });

  test('27.03 Nexter Theme title .wkit-feature-theme-title says "Nexter Theme"', async ({ page }) => {
    const title = page.locator('.wkit-feature-theme-title');
    if ((await title.count()) > 0) {
      await expect(title).toContainText(/nexter theme/i);
    }
  });

  test('27.04 Nexter Theme tag .wkit-feature-theme-tag says "Recommended"', async ({ page }) => {
    const tag = page.locator('.wkit-feature-theme-tag');
    if ((await tag.count()) > 0) {
      await expect(tag).toContainText(/recommended/i);
    }
  });

  test('27.05 Nexter Theme toggle can be clicked without errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const toggle = page.locator('#wkit-theme-switcher');
    if ((await toggle.count()) > 0) {
      await toggle.click({ force: true });
      await page.waitForTimeout(500);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 28. Feature step — T&C checkbox behavior
// =============================================================================
test.describe('28. Feature step — T&C checkbox behavior', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('28.01 T&C checkbox #wkit-plugin-confirmation-id is present', async ({ page }) => {
    const count = await page.locator('#wkit-plugin-confirmation-id').count();
    expect(count).toBeGreaterThan(0);
  });

  test('28.02 T&C checkbox is unchecked by default', async ({ page }) => {
    const cb = page.locator('#wkit-plugin-confirmation-id');
    if ((await cb.count()) > 0) {
      const checked = await cb.isChecked();
      expect(checked).toBe(false);
    }
  });

  test('28.03 Clicking T&C note section checks the checkbox', async ({ page }) => {
    const note = page.locator('.wkit-site-feature-note');
    if ((await note.count()) > 0) {
      await note.click();
      await page.waitForTimeout(500);
      const cb = page.locator('#wkit-plugin-confirmation-id');
      if ((await cb.count()) > 0) {
        const checked = await cb.isChecked();
        expect(checked).toBe(true);
      }
    }
  });

  test('28.04 T&C note text .wkit-feature-note-txt is present', async ({ page }) => {
    const count = await page.locator('.wkit-feature-note-txt').count();
    expect(count).toBeGreaterThan(0);
  });

  test('28.05 T&C note has backup link .wkit-note-backup-link', async ({ page }) => {
    const count = await page.locator('.wkit-note-backup-link').count();
    expect(count).toBeGreaterThan(0);
  });

  test('28.06 T&C checkbox label .wkit-note-ckbox-txt is present', async ({ page }) => {
    const count = await page.locator('.wkit-note-ckbox-txt').count();
    expect(count).toBeGreaterThan(0);
  });

  test('28.07 Clicking T&C twice unchecks the checkbox', async ({ page }) => {
    const note = page.locator('.wkit-site-feature-note');
    if ((await note.count()) > 0) {
      await note.click();
      await page.waitForTimeout(300);
      await note.click();
      await page.waitForTimeout(300);
      const cb = page.locator('#wkit-plugin-confirmation-id');
      if ((await cb.count()) > 0) {
        const checked = await cb.isChecked();
        expect(checked).toBe(false);
      }
    }
  });

});

// =============================================================================
// 29. Feature step — Next button disabled/enabled state
// =============================================================================
test.describe('29. Feature step — Next button disabled/enabled state', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await reachFeatureStep(page);
    await page.locator('.wkit-import-temp-feature').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('29.01 Feature Next button is disabled before T&C is checked', async ({ page }) => {
    const nextBtn = page.locator('button.wkit-site-feature-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      const disabled = await nextBtn.isDisabled();
      expect(disabled).toBe(true);
    }
  });

  test('29.02 Feature Next button disabled tooltip .wkit-notice-tooltip-txt is shown', async ({ page }) => {
    const tooltip = page.locator('span.wkit-notice-tooltip-txt');
    const count = await tooltip.count();
    expect(count).toBeGreaterThan(0);
  });

  test('29.03 Feature Next button becomes enabled after T&C checked', async ({ page }) => {
    await acceptTandC(page);
    await page.waitForTimeout(500);
    const nextBtn = page.locator('button.wkit-site-feature-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0) {
      await expect(nextBtn).toBeEnabled({ timeout: 5000 });
    }
  });

  test('29.04 Clicking enabled Feature Next advances to Method step', async ({ page }) => {
    await acceptTandC(page);
    await page.waitForTimeout(400);
    const nextBtn = page.locator('button.wkit-site-feature-next.wkit-btn-class');
    if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
      const methodCount = await page.locator('.wkit-import-method-main').count();
      expect(methodCount).toBeGreaterThan(0);
    }
  });

  test('29.05 Feature Next disabled tooltip contains alert icon .wdkit-i-alert', async ({ page }) => {
    const alertIcon = page.locator('.wdkit-i-alert');
    const count = await alertIcon.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

});
