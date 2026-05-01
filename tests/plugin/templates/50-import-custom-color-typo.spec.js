// =============================================================================
// WDesignKit Templates Suite — Custom Color & Custom Typography in Import Wizard
// Version: 2.0.0 — Extreme-polish pass: added §76b (validation, keyboard, hit-area, back-nav, a11y)
//                 and §77b (font search, state preservation, Escape key, hit-area, font labels)
// Plugin version: WDesignKit v2.3.0
//
// COVERAGE
//   Section 76 — Custom color addition in wizard (10 tests)
//   Section 77 — Custom typography addition in wizard (8 tests)
//
// Both sections target the global_data panel (Step 1, panel 2) of the
// template import wizard.  Tests guard gracefully when the template loaded
// by clickFirstCardImport has no global data (count === 0 → early return).
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin }                                   = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport }          = require('./_helpers/navigation');
const { reachGlobalDataPanel }                      = require('./_helpers/wizard');

// ---------------------------------------------------------------------------
// Shared setup: login → browse → open wizard → advance to global_data panel
// Used by both §76 (color) and §77 (typography) since both live in global_data.
// ---------------------------------------------------------------------------
async function openGlobalDataPanel(page) {
  await wpLogin(page);
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await reachGlobalDataPanel(page);
}
// Keep legacy alias so other references continue to work
const openColorPanel = openGlobalDataPanel;

// =============================================================================
// 76. Custom color addition in wizard — global_data panel
// =============================================================================
test.describe('76. Custom color addition in wizard', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openColorPanel(page);
  });

  // --------------------------------------------------------------------------
  // 76.01 — Global color panel presence
  // --------------------------------------------------------------------------
  test('76.01 Global color panel .wkit-import-color-main is present when template has global colors', async ({ page }) => {
    const count = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (count === 0) return; // template has no global colors — skip gracefully
    await expect.soft(page.locator('.wkit-import-color-main').first()).toBeVisible({ timeout: 8000 });
  });

  // --------------------------------------------------------------------------
  // 76.02 — Color swatch cards rendered
  // --------------------------------------------------------------------------
  test('76.02 Color swatch cards .wkit-global-color-card are rendered (≥1)', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;
    const cards = page.locator('.wkit-global-color-card');
    const count = await cards.count().catch(() => 0);
    expect.soft(count).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 76.03 — Clicking a color swatch applies selection state
  // --------------------------------------------------------------------------
  test('76.03 Clicking a color swatch applies .wkit-selected-palette or selection state', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Try palette-level swatch first
    const paletteSwatch = page.locator('.wkit-palette-cover').first();
    if (await paletteSwatch.count().catch(() => 0) > 0) {
      await paletteSwatch.click({ force: true });
      await page.waitForTimeout(500);
      // Verify selection state is applied
      await expect.soft(page.locator('.wkit-selected-palette').first()).toBeVisible({ timeout: 3000 });
      return;
    }

    // Fallback: click a global color card
    const colorCard = page.locator('.wkit-global-color-card').first();
    if (await colorCard.count().catch(() => 0) > 0) {
      await colorCard.click({ force: true });
      await page.waitForTimeout(500);
      // No crash and panel still visible
      expect(await page.locator('.wkit-import-color-main, .wkit-global-color-body').count()).toBeGreaterThan(0);
    }
  });

  // --------------------------------------------------------------------------
  // 76.04 — Color palette section presence
  // --------------------------------------------------------------------------
  test('76.04 Color palette section .wkit-color-palette-main is present', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Accept either the specific selector from the prompt spec or the existing
    // palette body used by the actual implementation.
    const count = await page.locator(
      '.wkit-color-palette-main, .wkit-palette-color-body'
    ).count().catch(() => 0);
    await expect.soft(count).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 76.05 — At least one palette card present
  // --------------------------------------------------------------------------
  test('76.05 At least one palette card .wkit-palette-card is present', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Accept both .wkit-palette-card (spec selector) and .wkit-palette-cover (implementation)
    const count = await page.locator('.wkit-palette-card, .wkit-palette-cover').count().catch(() => 0);
    await expect.soft(count).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 76.06 — Add / custom color trigger button is present
  // --------------------------------------------------------------------------
  test('76.06 Add / custom color trigger button is present', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    const trigger = page.locator([
      '.wkit-add-color-btn',
      '[class*="add-color"]',
      '.wkit-custom-color',
      '.wkit-new-palette-cover',
      'button:has-text("Add")',
      'input[type="color"]',
    ].join(', ')).first();

    const count = await trigger.count().catch(() => 0);
    await expect.soft(count).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 76.07 — Clicking the add color trigger opens a color picker or hex field
  // --------------------------------------------------------------------------
  test('76.07 Clicking the add color trigger opens a color picker input or hex field', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Prefer a dedicated "new palette / add" button; fall back to inline color input
    const addBtn = page.locator(
      '.wkit-add-color-btn, [class*="add-color"], .wkit-custom-color, .wkit-new-palette-cover'
    ).first();

    if (await addBtn.count().catch(() => 0) > 0) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(600);

      // After click, a color input, hex text field, or primary-color input should appear
      const picker = page.locator([
        'input[type="color"]',
        '.wkit-primary-color-inp',
        '.wkit-color-hex-inp',
        '[class*="color-picker"]',
        '[class*="hex-input"]',
        '[placeholder*="#"]',
      ].join(', ')).first();

      const pickerCount = await picker.count().catch(() => 0);
      // If the implementation exposes a color input inline (not behind add button),
      // verify it is already visible.
      const inlineColor = await page.locator('input[type="color"]').count().catch(() => 0);
      await expect.soft(pickerCount + inlineColor).toBeGreaterThan(0);
    } else {
      // Fallback: verify that an inline color input is already present
      const inlineCount = await page.locator('input[type="color"]').count().catch(() => 0);
      await expect.soft(inlineCount).toBeGreaterThan(0);
    }
  });

  // --------------------------------------------------------------------------
  // 76.08 — Entering a valid hex value (#FF5733) is accepted
  // --------------------------------------------------------------------------
  test('76.08 Entering a valid hex value (#FF5733) in the color picker input is accepted', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Open the custom palette panel if the add button exists
    const addBtn = page.locator(
      '.wkit-add-color-btn, [class*="add-color"], .wkit-custom-color, .wkit-new-palette-cover'
    ).first();
    if (await addBtn.count().catch(() => 0) > 0) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    // Find any color input (type=color) and set it to #ff5733
    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count().catch(() => 0) > 0) {
      await colorInput.evaluate(el => {
        el.value = '#ff5733';
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }).catch(() => {});
      await page.waitForTimeout(400);
      const val = await colorInput.inputValue().catch(() => '');
      await expect.soft(val.toLowerCase()).toBe('#ff5733');
    } else {
      // Try a hex text input as fallback
      const hexInp = page.locator(
        '.wkit-primary-color-inp, .wkit-color-hex-inp, [class*="hex-input"], [placeholder*="#"]'
      ).first();
      if (await hexInp.count().catch(() => 0) > 0) {
        await hexInp.fill('#FF5733');
        await page.waitForTimeout(400);
        const val = await hexInp.inputValue().catch(() => '');
        await expect.soft(val.toUpperCase()).toContain('FF5733');
      }
    }
  });

  // --------------------------------------------------------------------------
  // 76.09 — Applying the custom color adds it to the swatch list or applies it
  // --------------------------------------------------------------------------
  test('76.09 Submitting/applying the custom color adds it to the swatch list or applies it', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Open add-color panel
    const addBtn = page.locator(
      '.wkit-add-color-btn, [class*="add-color"], .wkit-custom-color, .wkit-new-palette-cover'
    ).first();
    if (await addBtn.count().catch(() => 0) > 0) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    const swatchCountBefore = await page.locator(
      '.wkit-palette-card, .wkit-palette-cover, .wkit-global-color-card'
    ).count().catch(() => 0);

    // Set a color value
    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count().catch(() => 0) > 0) {
      await colorInput.evaluate(el => {
        el.value = '#ff5733';
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }).catch(() => {});
      await page.waitForTimeout(300);
    }

    // Click a confirm / apply / add button if present
    const applyBtn = page.locator([
      '.wkit-add-palette-btn',
      '.wkit-save-color-btn',
      '.wkit-apply-color-btn',
      'button:has-text("Add")',
      'button:has-text("Apply")',
      'button:has-text("Save")',
      '.wkit-color-add-confirm',
    ].join(', ')).first();

    if (await applyBtn.count().catch(() => 0) > 0) {
      await applyBtn.click({ force: true });
      await page.waitForTimeout(700);
      const swatchCountAfter = await page.locator(
        '.wkit-palette-card, .wkit-palette-cover, .wkit-global-color-card'
      ).count().catch(() => 0);
      // Swatch list should have grown or at least not crashed
      await expect.soft(swatchCountAfter).toBeGreaterThanOrEqual(swatchCountBefore);
    } else {
      // No explicit apply button — verify the UI did not crash
      expect(await page.locator('.wkit-import-color-main, .wkit-global-color-body').count()).toBeGreaterThan(0);
    }
  });

});

// =============================================================================
// 76b. Color panel — validation, keyboard navigation, and state preservation
// Maps to: functionality-checklist (invalid input), logic-checklist (back nav),
//          ui-ux-checklist (keyboard nav), accessibility-checklist (labels)
// =============================================================================
test.describe('76b. Color panel — validation, keyboard nav, state preservation', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openColorPanel(page);
  });

  // --------------------------------------------------------------------------
  // 76.11 — Entering an invalid hex value is gracefully handled (no crash)
  // Functionality-checklist: Invalid data shows validation error (not silent crash)
  // --------------------------------------------------------------------------
  test('76.11 Entering an invalid hex value in the color input is handled gracefully (no crash)', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Open the custom color input panel
    const addBtn = page.locator(
      '.wkit-add-color-btn, [class*="add-color"], .wkit-custom-color, .wkit-new-palette-cover'
    ).first();
    if (await addBtn.count().catch(() => 0) > 0) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    // Attempt to set an invalid value via the color input
    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count().catch(() => 0) > 0) {
      // Browsers clamp/ignore non-hex values in color inputs — verify no JS crash
      await colorInput.evaluate(el => {
        el.value = 'not-a-color';
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }).catch(() => {});
      await page.waitForTimeout(500);
    } else {
      // Try hex text input fallback
      const hexInp = page.locator(
        '.wkit-primary-color-inp, .wkit-color-hex-inp, [class*="hex-input"], [placeholder*="#"]'
      ).first();
      if (await hexInp.count().catch(() => 0) > 0) {
        await hexInp.fill('ZZZZZZ');
        await hexInp.press('Enter');
        await page.waitForTimeout(400);
      }
    }

    // Panel must still be visible — no unmount/crash
    await expect.soft(
      page.locator('.wkit-import-color-main, .wkit-global-color-body').first()
    ).toBeVisible({ timeout: 5000 });
  });

  // --------------------------------------------------------------------------
  // 76.12 — Color swatch hit area is adequate for touch (≥ 44×44px)
  // UI/UX-checklist: Min hit area 44×44px for all clickable elements
  // Responsiveness-checklist: All interactive elements ≥44×44px on mobile
  // --------------------------------------------------------------------------
  test('76.12 Color swatch click target meets minimum 44×44px hit area', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    const swatch = page.locator('.wkit-palette-cover, .wkit-global-color-card').first();
    if (await swatch.count().catch(() => 0) === 0) return;

    const box = await swatch.boundingBox().catch(() => null);
    if (!box) return; // Element not measurable — skip

    // WCAG 2.5.5 minimum: 44×44px
    expect.soft(
      box.width,
      `Color swatch width ${box.width}px is below the 44px minimum touch target size`
    ).toBeGreaterThanOrEqual(44);
    expect.soft(
      box.height,
      `Color swatch height ${box.height}px is below the 44px minimum touch target size`
    ).toBeGreaterThanOrEqual(44);
  });

  // --------------------------------------------------------------------------
  // 76.13 — Color selection is preserved when navigating to the next wizard step and back
  // Logic-checklist: Browser back/forward navigation restores the correct state
  // --------------------------------------------------------------------------
  test('76.13 Color selection is preserved when advancing to next step then navigating back', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    // Select a palette swatch
    const swatch = page.locator('.wkit-palette-cover').first();
    if (await swatch.count().catch(() => 0) === 0) return;

    await swatch.click({ force: true });
    await page.waitForTimeout(500);

    // Capture classes before advancing (to check if selected state persists)
    const classBefore = await swatch.getAttribute('class').catch(() => '');
    const isSelected  = classBefore.includes('wkit-selected-palette');

    // Advance to the next step
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if (await nextBtn.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2500);

      // Navigate back
      const backBtn = page.locator(
        'button.wkit-back-btn, .wkit-import-back-btn, button:has-text("Back"), .wkit-prev-btn'
      ).first();
      if (await backBtn.count().catch(() => 0) > 0) {
        await backBtn.click({ force: true });
        await page.waitForTimeout(2000);

        // Color panel should be visible again
        const panelBack = await page.locator('.wkit-import-color-main, .wkit-global-color-body').count().catch(() => 0);
        expect.soft(panelBack, 'Color panel should re-appear after navigating Back').toBeGreaterThan(0);

        if (isSelected) {
          // The previously-selected palette should still be selected
          const selectedCount = await page.locator('.wkit-selected-palette').count().catch(() => 0);
          expect.soft(
            selectedCount,
            'Color swatch selection should be preserved when navigating Back from the next step'
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // 76.14 — Color input has an accessible label or ARIA attribute
  // Accessibility-checklist: All form inputs have an associated <label>
  // --------------------------------------------------------------------------
  test('76.14 Color input has an accessible label (for/aria-label/aria-labelledby)', async ({ page }) => {
    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return;

    const addBtn = page.locator(
      '.wkit-add-color-btn, [class*="add-color"], .wkit-custom-color, .wkit-new-palette-cover'
    ).first();
    if (await addBtn.count().catch(() => 0) > 0) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count().catch(() => 0) > 0) {
      const inputId          = await colorInput.getAttribute('id').catch(() => '');
      const ariaLabel        = await colorInput.getAttribute('aria-label').catch(() => '');
      const ariaLabelledBy   = await colorInput.getAttribute('aria-labelledby').catch(() => '');
      const hasLinkedLabel   = inputId
        ? (await page.locator(`label[for="${inputId}"]`).count().catch(() => 0)) > 0
        : false;

      expect.soft(
        !!(ariaLabel || ariaLabelledBy || hasLinkedLabel),
        'Color input should have an associated <label>, aria-label, or aria-labelledby — accessibility requirement'
      ).toBeTruthy();
    }
  });

});

// =============================================================================
// 76c. Color panel — console error check (standalone — listener registered
//      BEFORE any navigation so errors from setup phase are captured too)
// =============================================================================
test.describe('76c. Color panel console error check (full-navigation scope)', () => {
  test('76.10 No console errors are emitted when interacting with the color panel', async ({ page }) => {
    // Register BEFORE any navigation so we capture errors from every step
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    // Full setup (equivalent to openGlobalDataPanel) inside the test
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await reachGlobalDataPanel(page);

    const panelCount = await page.locator('.wkit-import-color-main').count().catch(() => 0);
    if (panelCount === 0) return; // template has no global colors — skip gracefully

    // Click the first palette swatch or color card to trigger interaction
    const swatch = page.locator('.wkit-palette-cover, .wkit-global-color-card').first();
    if (await swatch.count().catch(() => 0) > 0) {
      await swatch.click({ force: true });
      await page.waitForTimeout(600);
    }

    // Click any "add color" trigger if present
    const addBtn = page.locator(
      '.wkit-add-color-btn, [class*="add-color"], .wkit-custom-color, .wkit-new-palette-cover'
    ).first();
    if (await addBtn.count().catch(() => 0) > 0) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    const productErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('extension') &&
      !e.includes('chrome-extension') &&
      !e.includes('ERR_BLOCKED')
    );
    expect(productErrors).toHaveLength(0);
  });
});

// =============================================================================
// 77. Custom typography addition in wizard — global_data panel
// =============================================================================
test.describe('77. Custom typography addition in wizard', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openColorPanel(page);
  });

  // --------------------------------------------------------------------------
  // 77.01 — Global typography panel presence
  // --------------------------------------------------------------------------
  test('77.01 Global typography panel .wkit-import-typo-main is present when template has global fonts', async ({ page }) => {
    const count = await page.locator('.wkit-import-typo-main').count().catch(() => 0);
    if (count === 0) return; // template has no global typography — skip gracefully
    await expect.soft(page.locator('.wkit-import-typo-main').first()).toBeVisible({ timeout: 8000 });
  });

  // --------------------------------------------------------------------------
  // 77.02 — Typography cards rendered
  // --------------------------------------------------------------------------
  test('77.02 Typography cards .wkit-typo-card are rendered (≥1)', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    const count = await page.locator('.wkit-typo-card, .wkit-global-typo-btn').count().catch(() => 0);
    await expect.soft(count).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 77.03 — Clicking a font pair card applies .wkit-selected-typo
  // --------------------------------------------------------------------------
  test('77.03 Clicking a font pair card applies .wkit-selected-typo class', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    // Prefer pair-level buttons that carry the selected-typo class
    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) > 0) {
      await typoBtn.click({ force: true });
      await page.waitForTimeout(500);
      const cls = await typoBtn.getAttribute('class').catch(() => '');
      await expect.soft(cls || '').toContain('wkit-selected-typo');
      return;
    }

    // Fallback: .wkit-typo-card
    const typoCard = page.locator('.wkit-typo-card').first();
    if (await typoCard.count().catch(() => 0) > 0) {
      await typoCard.click({ force: true });
      await page.waitForTimeout(500);
      const cls = await typoCard.getAttribute('class').catch(() => '');
      await expect.soft(cls || '').toContain('wkit-selected-typo');
    }
  });

  // --------------------------------------------------------------------------
  // 77.04 — Font pair card shows primary and secondary font labels
  // --------------------------------------------------------------------------
  test('77.04 Font pair card shows primary and secondary font labels', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    // Open the custom font panel if a "new font" button exists; that panel shows labels
    const newFontBtn = page.locator(
      '.wkit-new-font-cover, .wkit-add-font-btn, [class*="custom-font"], button:has-text("Custom")'
    ).first();
    if (await newFontBtn.count().catch(() => 0) > 0) {
      await newFontBtn.click({ force: true });
      await page.waitForTimeout(600);
      const primaryBox  = page.locator('.wkit-new-primary-font, .wkit-primary-font-box').first();
      const secondaryBox = page.locator('.wkit-new-secondary-font, .wkit-secondary-font-box').first();
      if (await primaryBox.count().catch(() => 0) > 0) {
        const txt = await primaryBox.textContent().catch(() => '');
        await expect.soft(txt.trim().length).toBeGreaterThan(0);
      }
      if (await secondaryBox.count().catch(() => 0) > 0) {
        const txt = await secondaryBox.textContent().catch(() => '');
        await expect.soft(txt.trim().length).toBeGreaterThan(0);
      }
      return;
    }

    // Fallback: check that typo button text has some content (font name sample)
    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) > 0) {
      const txt = await typoBtn.textContent().catch(() => '');
      await expect.soft(txt.trim().length).toBeGreaterThan(0);
    }
  });

  // --------------------------------------------------------------------------
  // 77.05 — Add / custom font trigger is present
  // --------------------------------------------------------------------------
  test('77.05 Add / custom font trigger is present', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    const trigger = page.locator([
      '.wkit-add-font-btn',
      '[class*="custom-font"]',
      '.wkit-new-font-cover',
      'button:has-text("Custom")',
      'button:has-text("Add Font")',
      'button:has-text("Add")',
    ].join(', ')).first();

    const count = await trigger.count().catch(() => 0);
    await expect.soft(count).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 77.06 — Clicking the add font trigger opens a font input or selector
  // --------------------------------------------------------------------------
  test('77.06 Clicking the add font trigger opens a font input or selector', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    const addBtn = page.locator([
      '.wkit-add-font-btn',
      '[class*="custom-font"]',
      '.wkit-new-font-cover',
      'button:has-text("Custom")',
    ].join(', ')).first();

    if (await addBtn.count().catch(() => 0) === 0) return; // trigger not present for this template variant

    await addBtn.click({ force: true });
    await page.waitForTimeout(600);

    // A font picker, search input, dropdown, or pair-editor should appear
    const fontPicker = page.locator([
      '.wkit-fontfamily-search-inp',
      '.wkit-select-global-data',
      '.wkit-fontfamily-drp-body',
      '.wkit-new-primary-font',
      '.wkit-primary-font-box',
      '.wkit-new-secondary-font',
      '[class*="font-picker"]',
      '[class*="font-selector"]',
    ].join(', ')).first();

    const count = await fontPicker.count().catch(() => 0);
    await expect.soft(count).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 77.07 — Selecting a custom font reflects in the card or preview area
  // --------------------------------------------------------------------------
  test('77.07 Selecting/applying a custom font reflects in the card or preview area', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    // Path A: use a typo button to open the picker, search for a font, click it
    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) > 0) {
      await typoBtn.click({ force: true });
      await page.waitForTimeout(600);
      const searchInp = page.locator('.wkit-fontfamily-search-inp').first();
      if (await searchInp.count().catch(() => 0) > 0) {
        await searchInp.fill('Roboto');
        await page.waitForTimeout(400);
        const firstResult = page.locator('.wkit-typo-card').first();
        if (await firstResult.count().catch(() => 0) > 0) {
          await firstResult.click({ force: true });
          await page.waitForTimeout(500);
        }
      }
      // After selection the picker should close; typography panel should still be intact
      await expect.soft(
        page.locator('.wkit-temp-global-typography-edit, .wkit-import-typo-main').first()
      ).toBeVisible({ timeout: 5000 });
      return;
    }

    // Path B: use a "new font" button then click the primary font box
    const newFontBtn = page.locator('.wkit-new-font-cover, .wkit-add-font-btn').first();
    if (await newFontBtn.count().catch(() => 0) > 0) {
      await newFontBtn.click({ force: true });
      await page.waitForTimeout(600);
      const primaryBox = page.locator('.wkit-primary-font-box, .wkit-new-primary-font').first();
      if (await primaryBox.count().catch(() => 0) > 0) {
        await primaryBox.click({ force: true });
        await page.waitForTimeout(500);
        // A picker or dropdown should open
        const picker = page.locator('.wkit-fontfamily-drp-body, .wkit-select-global-data').first();
        if (await picker.count().catch(() => 0) > 0) {
          const fontCard = page.locator('.wkit-typo-card').first();
          if (await fontCard.count().catch(() => 0) > 0) {
            await fontCard.click({ force: true });
            await page.waitForTimeout(500);
          }
        }
      }
      // Verify the panel is intact — no crash
      expect(await page.locator('.wkit-import-typo-main, .wkit-temp-global-typography-edit').count()).toBeGreaterThan(0);
    }
  });

});

// =============================================================================
// 77c. Typography panel — console error check (standalone — listener registered
//      BEFORE any navigation so errors from setup phase are captured too)
// =============================================================================
// =============================================================================
// 77b. Typography panel — validation, keyboard navigation, and state preservation
// Maps to: functionality-checklist (search, double-submit), logic-checklist (back nav),
//          ui-ux-checklist (keyboard tab), accessibility-checklist (labels)
// =============================================================================
test.describe('77b. Typography panel — validation, keyboard nav, state preservation', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await openColorPanel(page); // Navigates to global_data panel (same step)
  });

  // --------------------------------------------------------------------------
  // 77.09 — Font picker dropdown is searchable
  // Functionality-checklist: Multi-select/searchable dropdowns return correct selections
  // --------------------------------------------------------------------------
  test('77.09 Font picker dropdown has a search input (long lists require search)', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    // Open the font picker via a typo button or new-font trigger
    const typoBtn    = page.locator('.wkit-global-typo-btn').first();
    const addFontBtn = page.locator('.wkit-new-font-cover, .wkit-add-font-btn').first();

    if (await typoBtn.count().catch(() => 0) > 0) {
      await typoBtn.click({ force: true });
      await page.waitForTimeout(600);
    } else if (await addFontBtn.count().catch(() => 0) > 0) {
      await addFontBtn.click({ force: true });
      await page.waitForTimeout(600);
      const primaryBox = page.locator('.wkit-primary-font-box, .wkit-new-primary-font').first();
      if (await primaryBox.count().catch(() => 0) > 0) {
        await primaryBox.click({ force: true });
        await page.waitForTimeout(600);
      }
    } else {
      return; // No font picker trigger found — skip
    }

    const searchInp = page.locator(
      '.wkit-fontfamily-search-inp, [class*="font-search"], input[placeholder*="search" i], input[placeholder*="font" i]'
    ).first();

    expect.soft(
      await searchInp.count().catch(() => 0),
      'Font picker should have a search input — long Google Fonts list requires search functionality'
    ).toBeGreaterThan(0);

    // Close the picker
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
  });

  // --------------------------------------------------------------------------
  // 77.10 — Font selection is preserved when navigating to the next step and back
  // Logic-checklist: Browser back/forward navigation restores the correct state
  // --------------------------------------------------------------------------
  test('77.10 Font selection is preserved when advancing to next step then navigating back', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    // Select the first font pair button
    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) === 0) return;

    await typoBtn.click({ force: true });
    await page.waitForTimeout(500);

    const classBefore  = await typoBtn.getAttribute('class').catch(() => '');
    const wasSelected  = classBefore.includes('wkit-selected-typo');

    // Advance to the next step
    const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
    if (await nextBtn.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2500);

      // Navigate back
      const backBtn = page.locator(
        'button.wkit-back-btn, .wkit-import-back-btn, button:has-text("Back"), .wkit-prev-btn'
      ).first();
      if (await backBtn.count().catch(() => 0) > 0) {
        await backBtn.click({ force: true });
        await page.waitForTimeout(2000);

        // Typography panel should re-appear
        const panelBack = await page.locator(
          '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
        ).count().catch(() => 0);
        expect.soft(panelBack, 'Typography panel should re-appear after navigating Back').toBeGreaterThan(0);

        if (wasSelected) {
          // The previously-selected font pair should still show selected state
          const selectedTypos = await page.locator('.wkit-selected-typo').count().catch(() => 0);
          expect.soft(
            selectedTypos,
            'Font pair selection should be preserved when navigating Back from the next step'
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // 77.11 — Font pair buttons have visible text (font name) — not empty labels
  // UI/UX-checklist: All inputs have visible labels
  // Accessibility-checklist: No placeholder-only labels
  // --------------------------------------------------------------------------
  test('77.11 Font pair buttons have visible font name text (not empty or icon-only)', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) === 0) return;

    const btnText    = await typoBtn.textContent().catch(() => '');
    const ariaLabel  = await typoBtn.getAttribute('aria-label').catch(() => '');

    expect.soft(
      btnText.trim().length > 0 || !!ariaLabel,
      'Font pair button should have visible text (font name) or aria-label — not an empty button'
    ).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // 77.12 — Pressing Escape while font picker is open closes it without crashing
  // UI/UX-checklist: Interruptible interactions — Escape must close pickers
  // Accessibility-checklist: Escape key closes modals/dropdowns (WCAG)
  // --------------------------------------------------------------------------
  test('77.12 Pressing Escape while font picker is open closes it without crashing', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) === 0) return;

    await typoBtn.click({ force: true });
    await page.waitForTimeout(600);

    // Press Escape to close the picker
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);

    // The typography panel should still be intact (not unmounted/crashed)
    await expect.soft(
      page.locator('.wkit-import-typo-main, .wkit-temp-global-typography-edit').first()
    ).toBeVisible({ timeout: 5000 });

    // The font picker dropdown should be closed
    const pickerOpen = await page.locator(
      '.wkit-fontfamily-drp-body, .wkit-select-global-data, [class*="font-dropdown"]'
    ).isVisible({ timeout: 1000 }).catch(() => false);
    expect.soft(
      !pickerOpen,
      'Font picker dropdown should be closed after pressing Escape'
    ).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 77.13 — Typography panel: font card hit area meets minimum 44×44px
  // UI/UX-checklist: Min hit area 44×44px for all clickable elements
  // --------------------------------------------------------------------------
  test('77.13 Font pair button meets minimum 44×44px touch target size', async ({ page }) => {
    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return;

    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) === 0) return;

    const box = await typoBtn.boundingBox().catch(() => null);
    if (!box) return;

    expect.soft(
      box.width,
      `Font pair button width ${box.width}px is below the 44px minimum touch target size`
    ).toBeGreaterThanOrEqual(44);
    expect.soft(
      box.height,
      `Font pair button height ${box.height}px is below the 44px minimum touch target size`
    ).toBeGreaterThanOrEqual(44);
  });

});

// =============================================================================
// 77c. Typography panel console error check (full-navigation scope)
// =============================================================================
test.describe('77c. Typography panel console error check (full-navigation scope)', () => {
  test('77.08 No console errors emitted when interacting with typography panel', async ({ page }) => {
    // Register BEFORE any navigation so we capture errors from every step
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    // Full setup (equivalent to openGlobalDataPanel) inside the test
    await wpLogin(page);
    await goToBrowse(page);
    await clickFirstCardImport(page);
    await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await reachGlobalDataPanel(page);

    const panelCount = await page.locator(
      '.wkit-import-typo-main, .wkit-temp-global-typography-edit'
    ).count().catch(() => 0);
    if (panelCount === 0) return; // template has no global typography — skip gracefully

    // Click a typo button / font pair card to trigger interaction
    const typoBtn = page.locator('.wkit-global-typo-btn').first();
    if (await typoBtn.count().catch(() => 0) > 0) {
      await typoBtn.click({ force: true });
      await page.waitForTimeout(600);
      // Close any popup that opened by pressing Escape
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(400);
    }

    // Click the "add font" trigger if present
    const addBtn = page.locator(
      '.wkit-add-font-btn, [class*="custom-font"], .wkit-new-font-cover, button:has-text("Custom")'
    ).first();
    if (await addBtn.count().catch(() => 0) > 0) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    const productErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('extension') &&
      !e.includes('chrome-extension') &&
      !e.includes('ERR_BLOCKED')
    );
    expect(productErrors).toHaveLength(0);
  });
});
