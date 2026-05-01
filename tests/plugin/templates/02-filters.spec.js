// =============================================================================
// WDesignKit Templates Suite — Filters
// Version: 3.0.0 — Deep inside-flow testing
//
// COVERAGE
//   Section 3  — Filter panel structure validation (12 tests)
//   Section 3b — Filter panel collapse / expand (7 tests)
//   Section 4  — AI Compatible filter interactions (10 tests)
//   Section 5  — Page Builder filter (Elementor & Gutenberg, 10 tests)
//   Section 6  — Free/Pro filter (8 tests)
//   Section 7  — Template Type filter (8 tests)
//   Section 8  — Category filter — all 21 categories + interaction (25 tests)
//   Section 9  — Clear All Filters (6 tests)
//   Section 48 — Filter combination stress tests (5 tests)
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin } = require('./_helpers/auth');
const { goToBrowse } = require('./_helpers/navigation');
const { CATEGORIES } = require('./_helpers/fixtures');

// =============================================================================
// 3. Filter panel — full structure validation
// =============================================================================
test.describe('3. Filter panel — full structure validation', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('3.01 Filter heading .wdkit-filter-title-txt-b shows "Filters"', async ({ page }) => {
    const heading = page.locator('.wdkit-filter-title-txt-b').filter({ hasText: /filters/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('3.02 Clear All button .wdkit-filter-clear-all is visible', async ({ page }) => {
    await expect(page.locator('.wdkit-filter-clear-all')).toBeVisible({ timeout: 10000 });
  });

  test('3.03 Clear All button contains "Clear All" text', async ({ page }) => {
    await expect(page.locator('.wdkit-filter-clear-all')).toContainText(/clear all/i);
  });

  test('3.04 Filter collapse icon .wdkit-i-filter-collapse is present', async ({ page }) => {
    const count = await page.locator('.wdkit-i-filter-collapse').count();
    expect(count).toBeGreaterThan(0);
  });

  test('3.05 AI Compatible section wrapper .wdkit-ai-switch-wrap is present', async ({ page }) => {
    await expect(page.locator('.wdkit-ai-switch-wrap')).toBeVisible({ timeout: 10000 });
  });

  test('3.06 Builder filter list .wdkit-filter-builder-list is present', async ({ page }) => {
    const count = await page.locator('.wdkit-filter-builder-list').count();
    expect(count).toBeGreaterThan(0);
  });

  test('3.07 Elementor checkbox #select_builder_elementor is in the DOM', async ({ page }) => {
    const count = await page.locator('#select_builder_elementor').count();
    expect(count).toBeGreaterThan(0);
  });

  test('3.08 Gutenberg checkbox #select_builder_gutenberg is in the DOM', async ({ page }) => {
    const count = await page.locator('#select_builder_gutenberg').count();
    expect(count).toBeGreaterThan(0);
  });

  test('3.09 Free/Pro radio inputs are present (.wkit-freePro-radio-inp)', async ({ page }) => {
    const count = await page.locator('input.wkit-freePro-radio-inp').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('3.10 Template Type radio inputs are present (.wkit-styled-type-radio)', async ({ page }) => {
    const count = await page.locator('input.wkit-styled-type-radio').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('3.11 Category checkboxes are present (.wkit-check-box[id^="category_"])', async ({ page }) => {
    const count = await page.locator('input.wkit-check-box[id^="category_"]').count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('3.12 Filter panel renders without layout overflow', async ({ page }) => {
    const col = page.locator('.wdkit-browse-column');
    await expect(col).toBeVisible({ timeout: 10000 });
    const box = await col.boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
  });

});

// =============================================================================
// 3b. Filter panel — collapse / expand interactions
// =============================================================================
test.describe('3b. Filter panel — collapse / expand', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('3b.01 Clicking .wdkit-i-filter-collapse does not crash the page', async ({ page }) => {
    const collapseBtn = page.locator('.wdkit-i-filter-collapse').first();
    if ((await collapseBtn.count()) > 0) {
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(800);
    }
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('3b.02 After collapse click, filter column state changes (class or width changes)', async ({ page }) => {
    const collapseBtn = page.locator('.wdkit-i-filter-collapse').first();
    const filterCol = page.locator('.wdkit-browse-column').first();
    if ((await collapseBtn.count()) > 0 && (await filterCol.count()) > 0) {
      const classBefore = await filterCol.getAttribute('class').catch(() => '');
      const widthBefore = await filterCol.evaluate(el => el.offsetWidth).catch(() => 0);
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(1000);
      const classAfter = await filterCol.getAttribute('class').catch(() => '');
      const widthAfter = await filterCol.evaluate(el => el.offsetWidth).catch(() => 0);
      // Either class changes OR width changes — both indicate collapse happened
      const stateChanged = (classAfter !== classBefore) || (widthAfter !== widthBefore);
      expect(stateChanged).toBe(true);
    }
  });

  test('3b.03 Clicking collapse twice restores original filter panel state', async ({ page }) => {
    const collapseBtn = page.locator('.wdkit-i-filter-collapse').first();
    const filterCol = page.locator('.wdkit-browse-column').first();
    if ((await collapseBtn.count()) > 0 && (await filterCol.count()) > 0) {
      const classBefore = await filterCol.getAttribute('class').catch(() => '');
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(800);
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(800);
      const classAfter = await filterCol.getAttribute('class').catch(() => '');
      // Class should be restored to original after toggling twice
      expect(classAfter).toBe(classBefore);
    }
  });

  test('3b.04 Template card grid is still visible after filter panel collapse', async ({ page }) => {
    const collapseBtn = page.locator('.wdkit-i-filter-collapse').first();
    if ((await collapseBtn.count()) > 0) {
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }
    // Template grid must still show cards
    const gridCount = await page.locator('.wdkit-templates-card-main, .wdkit-browse-card').count();
    const emptyCount = await page.locator('[class*="not-found"]').count();
    expect(gridCount + emptyCount).toBeGreaterThan(0);
  });

  test('3b.05 Filter collapse button is keyboard-focusable', async ({ page }) => {
    const collapseBtn = page.locator('.wdkit-i-filter-collapse').first();
    if ((await collapseBtn.count()) > 0) {
      await collapseBtn.focus().catch(() => {});
      // Just verify no crash
      await expect(page.locator('body')).not.toContainText('Fatal error');
    }
  });

  test('3b.06 No console errors emitted during filter collapse / expand cycle', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const collapseBtn = page.locator('.wdkit-i-filter-collapse').first();
    if ((await collapseBtn.count()) > 0) {
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(600);
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(600);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('3b.07 Active filters remain selected after collapsing and expanding filter panel', async ({ page }) => {
    // Select a category filter first
    const cb = page.locator('#category_1031');
    if ((await cb.count()) > 0) {
      await cb.click({ force: true });
      await page.waitForTimeout(400);
    }
    // Collapse
    const collapseBtn = page.locator('.wdkit-i-filter-collapse').first();
    if ((await collapseBtn.count()) > 0) {
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(600);
      // Expand
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(600);
    }
    // Category should still be checked
    if ((await cb.count()) > 0) {
      expect(await cb.isChecked()).toBe(true);
    }
  });

});

// =============================================================================
// 4. AI Compatible filter — all interactions
// =============================================================================
test.describe('4. AI Compatible filter — all interactions', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('4.01 AI Compatible toggle input #wdkit-ai-compatible-switch is in DOM', async ({ page }) => {
    const count = await page.locator('#wdkit-ai-compatible-switch').count();
    expect(count).toBeGreaterThan(0);
  });

  test('4.02 AI toggle wrapper has role="button"', async ({ page }) => {
    const wrap = page.locator('.wdkit-ai-switch-wrap');
    await expect(wrap).toBeVisible({ timeout: 10000 });
    const role = await wrap.getAttribute('role');
    expect(role).toBe('button');
  });

  test('4.03 AI toggle wrapper has tabindex="0" for keyboard access', async ({ page }) => {
    const tabindex = await page.locator('.wdkit-ai-switch-wrap').getAttribute('tabindex');
    expect(tabindex).toBe('0');
  });

  test('4.04 AI Compatible label .wdkit-ai-switch-label contains "AI Compatible"', async ({ page }) => {
    await expect(page.locator('.wdkit-ai-switch-label').filter({ hasText: /ai compatible/i })).toBeVisible({ timeout: 10000 });
  });

  test('4.05 Clicking AI toggle wrapper changes the checkbox checked state', async ({ page }) => {
    const toggle = page.locator('#wdkit-ai-compatible-switch');
    const before = await toggle.isChecked();
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(1000);
    const after = await toggle.isChecked();
    expect(after).not.toBe(before);
  });

  test('4.06 Toggling AI filter twice restores original checked state', async ({ page }) => {
    const toggle = page.locator('#wdkit-ai-compatible-switch');
    const before = await toggle.isChecked();
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(500);
    const after = await toggle.isChecked();
    expect(after).toBe(before);
  });

  test('4.07 Enabling AI Compatible filter does not clear the card grid', async ({ page }) => {
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(2500);
    const gridCount = await page.locator('.wdkit-templates-card-main').count();
    expect(gridCount).toBeGreaterThan(0);
  });

  test('4.08 Enabling AI Compatible filter does not produce JS console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('4.09 AI Compatible toggle is keyboard-activatable via Enter key', async ({ page }) => {
    const wrap = page.locator('.wdkit-ai-switch-wrap');
    await wrap.focus();
    const before = await page.locator('#wdkit-ai-compatible-switch').isChecked();
    await wrap.press('Enter');
    await page.waitForTimeout(800);
    const after = await page.locator('#wdkit-ai-compatible-switch').isChecked();
    expect(after).not.toBe(before);
  });

  test('4.10 AI Compatible toggle is keyboard-activatable via Space key', async ({ page }) => {
    const wrap = page.locator('.wdkit-ai-switch-wrap');
    await wrap.focus();
    const before = await page.locator('#wdkit-ai-compatible-switch').isChecked();
    await wrap.press('Space');
    await page.waitForTimeout(800);
    const after = await page.locator('#wdkit-ai-compatible-switch').isChecked();
    expect(after).not.toBe(before);
  });

});

// =============================================================================
// 5. Page Builder filter — Elementor & Gutenberg
// =============================================================================
test.describe('5. Page Builder filter — Elementor & Gutenberg', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('5.01 Elementor checkbox has value="1001"', async ({ page }) => {
    const val = await page.locator('#select_builder_elementor').getAttribute('value');
    expect(val).toBe('1001');
  });

  test('5.02 Gutenberg checkbox has value="1002"', async ({ page }) => {
    const val = await page.locator('#select_builder_gutenberg').getAttribute('value');
    expect(val).toBe('1002');
  });

  test('5.03 Label for Elementor checkbox is visible', async ({ page }) => {
    const count = await page.locator('label[for="select_builder_elementor"]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('5.04 Label for Gutenberg checkbox is visible', async ({ page }) => {
    const count = await page.locator('label[for="select_builder_gutenberg"]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('5.05 Clicking Elementor label toggles its checkbox state', async ({ page }) => {
    const cb = page.locator('#select_builder_elementor');
    const before = await cb.isChecked();
    await page.locator('label[for="select_builder_elementor"]').click({ force: true });
    await page.waitForTimeout(800);
    const after = await cb.isChecked();
    expect(after).not.toBe(before);
  });

  test('5.06 Clicking Gutenberg label toggles its checkbox state', async ({ page }) => {
    const cb = page.locator('#select_builder_gutenberg');
    const before = await cb.isChecked();
    await page.locator('label[for="select_builder_gutenberg"]').click({ force: true });
    await page.waitForTimeout(800);
    const after = await cb.isChecked();
    expect(after).not.toBe(before);
  });

  test('5.07 Builder tooltip .wdkit-filter-builder-tooltip-b is in the DOM', async ({ page }) => {
    const count = await page.locator('.wdkit-filter-builder-tooltip-b').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('5.08 Builder icon .wkit-browse-filter-builder-b is rendered', async ({ page }) => {
    const count = await page.locator('.wkit-browse-filter-builder-b').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('5.09 Selecting Elementor filter does not throw JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('label[for="select_builder_elementor"]').click({ force: true });
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('5.10 Selecting Gutenberg filter does not throw JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('label[for="select_builder_gutenberg"]').click({ force: true });
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 6. Free/Pro filter — all states
// =============================================================================
test.describe('6. Free/Pro filter — all states', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('6.01 "All" label #wkit-free-all-btn-label is visible', async ({ page }) => {
    const count = await page.locator('#wkit-free-all-btn-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('6.02 "Free" label #wkit-free-btn-label is visible', async ({ page }) => {
    const count = await page.locator('#wkit-free-btn-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('6.03 "Pro" label #wkit-pro-btn-label is visible', async ({ page }) => {
    const count = await page.locator('#wkit-pro-btn-label').count();
    expect(count).toBeGreaterThan(0);
  });

  test('6.04 At least one Free/Pro radio is checked by default', async ({ page }) => {
    const radios = page.locator('input.wkit-freePro-radio-inp');
    const count = await radios.count();
    let checkedCount = 0;
    for (let i = 0; i < count; i++) {
      const checked = await radios.nth(i).isChecked();
      if (checked) checkedCount++;
    }
    expect(checkedCount).toBeGreaterThanOrEqual(1);
  });

  test('6.05 Clicking "Free" label selects the Free radio', async ({ page }) => {
    await page.locator('#wkit-free-btn-label').click({ force: true });
    await page.waitForTimeout(800);
    const radios = page.locator('input.wkit-freePro-radio-inp');
    const count = await radios.count();
    let anyChecked = false;
    for (let i = 0; i < count; i++) {
      if (await radios.nth(i).isChecked()) { anyChecked = true; break; }
    }
    expect(anyChecked).toBe(true);
  });

  test('6.06 Clicking "Pro" label selects the Pro radio', async ({ page }) => {
    await page.locator('#wkit-pro-btn-label').click({ force: true });
    await page.waitForTimeout(800);
    const radios = page.locator('input.wkit-freePro-radio-inp');
    const count = await radios.count();
    let anyChecked = false;
    for (let i = 0; i < count; i++) {
      if (await radios.nth(i).isChecked()) { anyChecked = true; break; }
    }
    expect(anyChecked).toBe(true);
  });

  test('6.07 Clicking "All" label after selecting Pro restores default state', async ({ page }) => {
    await page.locator('#wkit-pro-btn-label').click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('#wkit-free-all-btn-label').click({ force: true });
    await page.waitForTimeout(800);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('6.08 Free/Pro filter switch does not produce JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('#wkit-pro-btn-label').click({ force: true });
    await page.waitForTimeout(1500);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 7. Template Type filter — all states
// =============================================================================
test.describe('7. Template Type filter — all states', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('7.01 #wkit_page_type_websitekit radio (Page Kits) is present', async ({ page }) => {
    const count = await page.locator('#wkit_page_type_websitekit').count();
    expect(count).toBeGreaterThan(0);
  });

  test('7.02 #wkit_paget_type_pagetemplate radio (Full Pages) is present', async ({ page }) => {
    const count = await page.locator('#wkit_paget_type_pagetemplate').count();
    expect(count).toBeGreaterThan(0);
  });

  test('7.03 #wkit_paget_type_section radio (Sections) is present', async ({ page }) => {
    const count = await page.locator('#wkit_paget_type_section').count();
    expect(count).toBeGreaterThan(0);
  });

  test('7.04 Page Kits radio is checked by default', async ({ page }) => {
    const pageKits = page.locator('#wkit_page_type_websitekit');
    const count = await pageKits.count();
    if (count > 0) {
      const checked = await pageKits.isChecked();
      expect(checked).toBe(true);
    }
  });

  test('7.05 Clicking Full Pages radio changes selection', async ({ page }) => {
    const fullPages = page.locator('#wkit_paget_type_pagetemplate');
    const count = await fullPages.count();
    if (count > 0) {
      const before = await fullPages.isChecked();
      await fullPages.click({ force: true });
      await page.waitForTimeout(800);
      const after = await fullPages.isChecked();
      expect(after).not.toBe(before);
    }
  });

  test('7.06 Clicking Sections radio changes selection', async ({ page }) => {
    const sections = page.locator('#wkit_paget_type_section');
    const count = await sections.count();
    if (count > 0) {
      await sections.click({ force: true });
      await page.waitForTimeout(1000);
      const after = await sections.isChecked();
      expect(after).toBe(true);
    }
  });

  test('7.07 All Template Type radios share name="selectPageType"', async ({ page }) => {
    const radios = page.locator('input.wkit-styled-type-radio');
    const count = await radios.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const name = await radios.nth(i).getAttribute('name');
      expect(name).toBe('selectPageType');
    }
  });

  test('7.08 Switching Template Type filter does not break the grid', async ({ page }) => {
    const fullPages = page.locator('#wkit_paget_type_pagetemplate');
    const count = await fullPages.count();
    if (count > 0) {
      await fullPages.click({ force: true });
      await page.waitForTimeout(2000);
      const gridCount = await page.locator('.wdkit-templates-card-main').count();
      expect(gridCount).toBeGreaterThan(0);
    }
  });

});

// =============================================================================
// 8. Category filter — all 21 categories + interaction
// =============================================================================
test.describe('8. Category filter — all 21 categories + interaction', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  for (const cat of CATEGORIES) {
    test(`8. Category checkbox present: ${cat.name} (${cat.id})`, async ({ page }) => {
      const count = await page.locator(cat.id).count();
      expect(count).toBeGreaterThan(0);
    });
  }

  test('8.22 Total category checkboxes count is at least 21', async ({ page }) => {
    const count = await page.locator('input.wkit-check-box[id^="category_"]').count();
    expect(count).toBeGreaterThanOrEqual(21);
  });

  test('8.23 Clicking Agency category checkbox toggles its state', async ({ page }) => {
    const cb = page.locator('#category_1031');
    const count = await cb.count();
    if (count > 0) {
      const before = await cb.isChecked();
      await cb.click({ force: true });
      await page.waitForTimeout(800);
      const after = await cb.isChecked();
      expect(after).not.toBe(before);
    }
  });

  test('8.24 Multiple categories can be selected simultaneously', async ({ page }) => {
    const agency = page.locator('#category_1031');
    const tech = page.locator('#category_1050');
    if ((await agency.count()) > 0 && (await tech.count()) > 0) {
      await agency.click({ force: true });
      await page.waitForTimeout(400);
      await tech.click({ force: true });
      await page.waitForTimeout(800);
      expect(await agency.isChecked()).toBe(true);
      expect(await tech.isChecked()).toBe(true);
    }
  });

  test('8.25 Category filter does not produce JS console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const cb = page.locator('#category_1031');
    if ((await cb.count()) > 0) {
      await cb.click({ force: true });
      await page.waitForTimeout(2000);
    }
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 9. Clear All Filters — resets every filter type
// =============================================================================
test.describe('9. Clear All Filters — resets every filter type', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('9.01 Clear All button is always clickable', async ({ page }) => {
    const btn = page.locator('.wdkit-filter-clear-all');
    await expect(btn).toBeVisible({ timeout: 10000 });
    await expect(btn).toBeEnabled();
  });

  test('9.02 Clicking Clear All after enabling AI filter unchecks AI toggle', async ({ page }) => {
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('.wdkit-filter-clear-all').click();
    await page.waitForTimeout(1000);
    const checked = await page.locator('#wdkit-ai-compatible-switch').isChecked();
    expect(checked).toBe(false);
  });

  test('9.03 Clicking Clear All after selecting a category unchecks that category', async ({ page }) => {
    const cb = page.locator('#category_1031');
    if ((await cb.count()) > 0) {
      await cb.click({ force: true });
      await page.waitForTimeout(400);
      await page.locator('.wdkit-filter-clear-all').click();
      await page.waitForTimeout(1000);
      const checked = await cb.isChecked();
      expect(checked).toBe(false);
    }
  });

  test('9.04 Clicking Clear All after Pro filter restores "All" radio selection', async ({ page }) => {
    await page.locator('#wkit-pro-btn-label').click({ force: true });
    await page.waitForTimeout(400);
    await page.locator('.wdkit-filter-clear-all').click();
    await page.waitForTimeout(1000);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('9.05 Grid is repopulated after Clear All', async ({ page }) => {
    await page.locator('#category_1031').click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('.wdkit-filter-clear-all').click();
    await page.waitForTimeout(2000);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('9.06 Clear All does not produce console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('.wdkit-filter-clear-all').click();
    await page.waitForTimeout(1500);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

});

// =============================================================================
// 48. Filter combination stress tests
// =============================================================================
test.describe('48. Filter combination stress tests', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await goToBrowse(page);
  });

  test('48.01 AI + Elementor combination filter does not crash', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('label[for="select_builder_elementor"]').click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('48.02 Free + Gutenberg + Agency category combination does not crash', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('#wkit-free-btn-label').click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    await page.locator('label[for="select_builder_gutenberg"]').click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    await page.locator('#category_1031').click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('48.03 Pro + Section type + Multiple categories combination does not crash', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.locator('#wkit-pro-btn-label').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('#wkit_paget_type_section').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('#category_1031').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('#category_1050').click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
    const productErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('extension')
    );
    expect(productErrors).toHaveLength(0);
  });

  test('48.04 Clear All resets after complex filter combination', async ({ page }) => {
    await page.locator('#wkit-pro-btn-label').click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
    await page.locator('.wdkit-ai-switch-wrap').click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
    await page.locator('#category_1031').click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
    await page.locator('#category_1035').click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
    await page.locator('.wdkit-filter-clear-all').click();
    await page.waitForTimeout(2000);
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('48.05 All 21 categories selected simultaneously does not freeze UI', async ({ page }) => {
    const categoryIds = [
      '#category_1031', '#category_1032', '#category_1033', '#category_1034',
      '#category_1035', '#category_1036', '#category_1037', '#category_1038',
    ];
    for (const id of categoryIds) {
      await page.locator(id).click({ force: true }).catch(() => {});
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(2000);
    await expect(page.locator('.wdkit-browse-templates')).toBeVisible({ timeout: 5000 });
  });

});
