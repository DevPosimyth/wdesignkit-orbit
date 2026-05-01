// =============================================================================
// WDesignKit Templates Suite — PRO Access Control
// Version: 1.1.0 — Fixed proCardLocator selector, WDKIT_EMAIL gate, builder detection
// Plugin version: WDesignKit v2.3.0
//
// COVERAGE
//   Section 84 — WDKit PRO user: all PRO templates accessible (6 tests)
//   Section 85 — ThePlus PRO (no WDKit login): only Elementor PRO accessible (6 tests)
//   Section 86 — Nexter PRO (no WDKit login): only Gutenberg PRO accessible (6 tests)
//
// FIXES in v1.1.0:
//   - proCardLocator now includes .wdkit-pro-crd (actual class in v2.3.0 plugin)
//   - §84 gate now also checks WDKIT_EMAIL (wdkitLogin requires both token + email)
//   - findProCardForBuilder simplified: builder filter already applied before call
//   - applyBuilderFilter: broadened checkbox + label selectors to cover v2.3.0 changes
// =============================================================================

const { test, expect } = require('@playwright/test');
const { wpLogin, wdkitLogin, wdkitLogout, WDKIT_EMAIL } = require('./_helpers/auth');
const { goToBrowse, PLUGIN_PAGE } = require('./_helpers/navigation');

const WDKIT_TOKEN     = (process.env.WDKIT_API_TOKEN    || '').trim();
const THEPLUS_LICENSE = (process.env.THEPLUS_LICENSE_KEY || '').trim();
const NEXTER_LICENSE  = (process.env.NEXTER_LICENSE_KEY  || '').trim();

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Returns the locator for PRO badge cards on the browse page.
 *
 * Primary selectors use the actual classes verified in the plugin source
 * (confirmed via 04-import-preview-step.spec.js §25 and v2.3.0 build):
 *   .wdkit-pro-crd            — the live PRO badge class
 *   .wdkit-card-tag.wdkit-pro-crd — the full badge element
 * Remaining selectors are fallbacks for alternate markup variants.
 */
function proCardLocator(page) {
  return page.locator(
    // ── Verified selectors (v2.3.0 plugin) ─────────────────────────────────
    '.wdkit-browse-card:has(.wdkit-pro-crd), ' +
    '.wdkit-browse-card:has(.wdkit-card-tag.wdkit-pro-crd), ' +
    // ── Fallback selectors ──────────────────────────────────────────────────
    '.wdkit-browse-card:has(.wkit-pro-badge), ' +
    '.wdkit-browse-card:has(.wkit-pro-label), ' +
    '.wdkit-browse-card:has([class*="pro-badge"]), ' +
    '.wdkit-browse-card:has(.wkit-pro), ' +
    '.wdkit-browse-card:has([class*="pro-lock"])'
  );
}

/**
 * Returns whether a card's import button is in a locked state.
 * Locked = disabled attribute set, pointer-events:none, or a locked class present.
 */
async function isImportButtonLocked(card) {
  const btn = card.locator(
    '.wdkit-browse-card-download, button[class*="import"]'
  ).first();
  const btnCount = await btn.count();
  if (btnCount === 0) return true; // no button visible = locked
  const isDisabled = await btn.getAttribute('disabled').then(v => v !== null).catch(() => false);
  const pe = await btn.evaluate(el => getComputedStyle(el).pointerEvents).catch(() => 'auto');
  const hasLockedClass = await btn.evaluate(
    el => el.classList.contains('wkit-pro-locked') || el.classList.contains('wdkit-pro-locked')
  ).catch(() => false);
  return isDisabled || pe === 'none' || hasLockedClass;
}

/**
 * Apply a page builder filter by clicking its checkbox or label.
 * Accepts 'elementor' or 'gutenberg'.
 *
 * v2.3.0 note: filter checkbox IDs may differ across builds — tries multiple
 * selector patterns before falling back to a text-based label match.
 */
async function applyBuilderFilter(page, builder) {
  // Try standard checkbox IDs first
  const checkboxCandidates = [
    `#select_builder_${builder}`,
    `#filter_builder_${builder}`,
    `input[id*="${builder}" i][type="checkbox"]`,
  ];

  let clicked = false;
  for (const sel of checkboxCandidates) {
    const checkbox = page.locator(sel).first();
    if (await checkbox.count() > 0) {
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (!isChecked) await checkbox.click({ force: true });
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    // Label-based fallbacks
    const label = page.locator(
      `label[for*="${builder}" i], ` +
      `.wkit-browse-filter-${builder}, ` +
      `[class*="builder-filter"]:has-text("${builder.charAt(0).toUpperCase() + builder.slice(1)}")`
    ).first();
    if (await label.count() > 0) {
      await label.click({ force: true });
      clicked = true;
    }
  }

  if (!clicked) {
    // Last resort: any element whose ID or class references the builder
    await page.locator(`[id*="${builder}" i]`).first().click({ force: true }).catch(() => {});
  }

  await page.waitForTimeout(2000);
}

/**
 * Find the first visible PRO card after a builder filter has been applied.
 *
 * NOTE: Builder filter is always applied by the caller before invoking this
 * function, so all visible cards already belong to the requested builder.
 * Text-based builder detection inside card innerText is unreliable (card text
 * shows template name, not builder name), so we simply return the first PRO
 * card from the already-filtered grid.
 */
async function findProCardForBuilder(page, builder) {
  const proCards = proCardLocator(page);
  const count = await proCards.count();
  if (count === 0) return null;
  // All visible cards are from `builder` because the filter was applied first.
  return proCards.first();
}

// =============================================================================
// 84. WDKit PRO user — all PRO templates accessible
// Gate: WDKIT_TOKEN env var must be set.
// =============================================================================
test.describe('84. WDKit PRO user — all PRO templates accessible', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // wdkitLogin() requires BOTH WDKIT_EMAIL and WDKIT_TOKEN (see _helpers/auth.js)
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars for WDesignKit PRO login');
      return;
    }
    await wpLogin(page);
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    // Inject WDKit PRO session into localStorage
    await wdkitLogin(page);
    await goToBrowse(page);
  });

  test('84.01 PRO badge cards exist on Browse page', async ({ page }) => {
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 });
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    expect.soft(count, 'Expected at least 1 PRO badge card on the browse page').toBeGreaterThan(0);
  });

  test('84.02 PRO card import button is not locked for WDKit PRO user', async ({ page }) => {
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 });
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No PRO badge cards found on browse page — skipping lock check');
      return;
    }
    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);
    const locked = await isImportButtonLocked(card);
    expect.soft(locked, 'PRO card import button should NOT be locked for WDKit PRO user').toBe(false);
  });

  test('84.03 Clicking Import on a PRO card opens the wizard (hash changes)', async ({ page }) => {
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 });
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No PRO badge cards found — skipping wizard open check');
      return;
    }
    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const importBtn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importBtn.click({ force: true });
    } else {
      await card.click({ force: true });
    }
    await page.waitForTimeout(3000);

    const hash = await page.evaluate(() => location.hash);
    expect.soft(
      hash,
      `Expected URL hash to include /import-kit or /browse/kit after clicking PRO card, got: ${hash}`
    ).toMatch(/import-kit|browse\/kit|kit\//i);
  });

  test('84.04 Import wizard opens without showing a PRO-required upgrade notice', async ({ page }) => {
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 });
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No PRO badge cards found — skipping upgrade notice check');
      return;
    }
    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const importBtn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importBtn.click({ force: true });
    } else {
      await card.click({ force: true });
    }
    await page.waitForTimeout(3000);

    // PRO user should NOT see upgrade/plugin notice after clicking import
    const upgradeNotice = await page.locator(
      '.wkit-pro-plugin-notice, .wkit-upgrade-notice'
    ).count();
    const upgradeText = await page.locator('body').getByText(/upgrade to pro|go pro|unlock pro/i).count();

    expect.soft(
      upgradeNotice + upgradeText,
      'WDKit PRO user should not see an upgrade notice on clicking a PRO card import'
    ).toBe(0);
  });

  test('84.05 Both Elementor and Gutenberg PRO templates are importable for WDKit PRO user', async ({ page }) => {
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars');
      return;
    }

    for (const builder of ['elementor', 'gutenberg']) {
      // Apply builder filter
      await applyBuilderFilter(page, builder);
      await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const proCards = proCardLocator(page);
      const count = await proCards.count();
      if (count === 0) {
        console.log(`[84.05] No PRO cards found after applying ${builder} filter — skipping that builder`);
        // Clear filter by toggling it again via applyBuilderFilter
        await applyBuilderFilter(page, builder);
        await page.waitForTimeout(1500);
        continue;
      }

      const card = proCards.first();
      await card.hover({ force: true });
      await page.waitForTimeout(400);
      const locked = await isImportButtonLocked(card);
      expect.soft(
        locked,
        `[84.05] ${builder.charAt(0).toUpperCase() + builder.slice(1)} PRO card should NOT be locked for WDKit PRO user`
      ).toBe(false);

      // Uncheck the builder filter before the next iteration
      await applyBuilderFilter(page, builder); // toggles it back off
      await page.waitForTimeout(1500);
    }
  });

  test('84.06 No "Upgrade" or "Go PRO" modal appears when clicking PRO card import', async ({ page }) => {
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 });
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No PRO badge cards found — skipping modal check');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const importBtn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importBtn.click({ force: true });
    } else {
      await card.click({ force: true });
    }
    await page.waitForTimeout(2500);

    // Check for upgrade modals / CTAs
    const upgradeModal = await page.locator(
      '.wkit-pro-plugin-notice, .wkit-upgrade-notice, [class*="upgrade-modal"], [class*="pro-modal"]'
    ).count();
    const upgradeBtn = await page.locator(
      'button:has-text("Upgrade"), button:has-text("Go PRO"), a:has-text("Upgrade"), a:has-text("Go PRO")'
    ).count();

    expect.soft(
      upgradeModal,
      'An upgrade notice/modal appeared for a WDKit PRO user after clicking PRO import'
    ).toBe(0);
    expect.soft(
      upgradeBtn,
      'An "Upgrade" / "Go PRO" button appeared for a WDKit PRO user after clicking PRO import'
    ).toBe(0);
  });

});

// =============================================================================
// 85. ThePlus PRO — only Elementor PRO accessible (no WDKit login)
// Gate: THEPLUS_LICENSE env var must be set.
// Key: User has ThePlus Addons PRO but has NOT logged into WDesignKit cloud.
// =============================================================================
test.describe('85. ThePlus PRO — only Elementor PRO accessible (no WDKit login)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    if (!THEPLUS_LICENSE) {
      test.skip(true, 'Requires ThePlus license key env var — set THEPLUS_LICENSE_KEY');
      return;
    }
    // WP login only — deliberately NOT calling wdkitLogin
    await wpLogin(page);
    // Ensure WDKit cloud session is cleared
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await wdkitLogout(page);
    await goToBrowse(page);
  });

  test('85.01 Elementor page builder filter is present on Browse page without WDKit login', async ({ page }) => {
    if (!THEPLUS_LICENSE) {
      test.skip(true, 'Requires ThePlus license key env var — set THEPLUS_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const elementorFilter = page.locator(
      '#select_builder_elementor, .wkit-browse-filter-elementor, ' +
      '[id*="filter-elementor"], label[for*="elementor" i]'
    ).first();
    const count = await elementorFilter.count();
    expect.soft(count, 'Elementor filter toggle should be present on the browse page').toBeGreaterThan(0);
  });

  test('85.02 At least one Elementor-tagged card exists after applying the Elementor filter', async ({ page }) => {
    if (!THEPLUS_LICENSE) {
      test.skip(true, 'Requires ThePlus license key env var — set THEPLUS_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'elementor');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect.soft(cardCount, 'Expected at least one card after applying the Elementor filter').toBeGreaterThan(0);
  });

  test('85.03 Elementor PRO card import button is enabled/not locked for ThePlus PRO users', async ({ page }) => {
    if (!THEPLUS_LICENSE) {
      test.skip(true, 'Requires ThePlus license key env var — set THEPLUS_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'elementor');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No Elementor PRO cards found after filter — cannot verify lock state');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);
    const locked = await isImportButtonLocked(card);
    expect.soft(
      locked,
      'Elementor PRO card import button should be enabled for a ThePlus PRO user'
    ).toBe(false);
  });

  test('85.04 Clicking import on an Elementor PRO card opens the wizard (not blocked)', async ({ page }) => {
    if (!THEPLUS_LICENSE) {
      test.skip(true, 'Requires ThePlus license key env var — set THEPLUS_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'elementor');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No Elementor PRO cards found — cannot verify wizard opens');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const importBtn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importBtn.click({ force: true });
    } else {
      await card.click({ force: true });
    }
    await page.waitForTimeout(3500);

    // Wizard should have opened — verify either by hash change or wizard container
    const hash = await page.evaluate(() => location.hash);
    const wizardVisible = await page.locator('.wkit-temp-import-mian, .wkit-import-wizard').count() > 0;

    expect.soft(
      hash.match(/import-kit|browse\/kit|kit\//i) || wizardVisible,
      `Expected the import wizard to open for a ThePlus PRO Elementor card, got hash: ${hash}`
    ).toBeTruthy();
  });

  test('85.05 Gutenberg/Blocks PRO cards remain locked for ThePlus PRO users (no WDKit login)', async ({ page }) => {
    if (!THEPLUS_LICENSE) {
      test.skip(true, 'Requires ThePlus license key env var — set THEPLUS_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'gutenberg');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      // No PRO Gutenberg cards found — accept as valid (may all be free) but log it
      console.log('[85.05] No Gutenberg PRO cards found after filter — cannot assert locked state');
      return;
    }

    // At least the first Gutenberg PRO card should be locked for a ThePlus user
    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);
    const locked = await isImportButtonLocked(card);

    // Also check for upgrade notice as an alternative locked signal
    const upgradeNotice = await page.locator(
      '.wkit-pro-plugin-notice, .wkit-upgrade-notice'
    ).count();

    expect.soft(
      locked || upgradeNotice > 0,
      'Gutenberg PRO card should be locked or show upgrade notice for a ThePlus PRO user without WDKit login'
    ).toBe(true);
  });

  test('85.06 Import button on a Gutenberg PRO card is disabled or shows locked state for ThePlus PRO users', async ({ page }) => {
    if (!THEPLUS_LICENSE) {
      test.skip(true, 'Requires ThePlus license key env var — set THEPLUS_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'gutenberg');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      console.log('[85.06] No Gutenberg PRO cards found — skipping disabled button check');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const btn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    const btnCount = await btn.count();
    if (btnCount === 0) {
      // No import button rendered at all — treated as locked
      return;
    }

    const isDisabled = await btn.getAttribute('disabled').then(v => v !== null).catch(() => false);
    const pe = await btn.evaluate(el => getComputedStyle(el).pointerEvents).catch(() => 'auto');
    const hasLockedClass = await btn.evaluate(el =>
      el.classList.contains('wkit-pro-locked') || el.classList.contains('wdkit-pro-locked')
    ).catch(() => false);

    // Upgrade CTA shown in place of import button also counts as locked
    const upgradeCta = await page.locator(
      'button:has-text("Upgrade"), button:has-text("Go PRO"), a:has-text("Upgrade"), a:has-text("Go PRO")'
    ).count();

    const isLocked = isDisabled || pe === 'none' || hasLockedClass || upgradeCta > 0;
    expect.soft(
      isLocked,
      'Gutenberg PRO card import button should be disabled/locked for a ThePlus PRO user without WDKit login'
    ).toBe(true);
  });

});

// =============================================================================
// 86. Nexter PRO — only Gutenberg PRO accessible (no WDKit login)
// Gate: NEXTER_LICENSE env var must be set.
// Key: User has Nexter Blocks PRO but has NOT logged into WDesignKit cloud.
// =============================================================================
test.describe('86. Nexter PRO — only Gutenberg PRO accessible (no WDKit login)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    if (!NEXTER_LICENSE) {
      test.skip(true, 'Requires Nexter license key env var — set NEXTER_LICENSE_KEY');
      return;
    }
    // WP login only — deliberately NOT calling wdkitLogin
    await wpLogin(page);
    // Ensure WDKit cloud session is cleared
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await wdkitLogout(page);
    await goToBrowse(page);
  });

  test('86.01 Gutenberg/Blocks page builder filter is present on Browse page without WDKit login', async ({ page }) => {
    if (!NEXTER_LICENSE) {
      test.skip(true, 'Requires Nexter license key env var — set NEXTER_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const gutenbergFilter = page.locator(
      '#select_builder_gutenberg, .wkit-browse-filter-gutenberg, ' +
      '[id*="filter-gutenberg"], label[for*="gutenberg" i], label[for*="blocks" i]'
    ).first();
    const count = await gutenbergFilter.count();
    expect.soft(count, 'Gutenberg/Blocks filter toggle should be present on the browse page').toBeGreaterThan(0);
  });

  test('86.02 At least one Gutenberg-tagged card exists after applying the Gutenberg filter', async ({ page }) => {
    if (!NEXTER_LICENSE) {
      test.skip(true, 'Requires Nexter license key env var — set NEXTER_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'gutenberg');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const cardCount = await page.locator('.wdkit-browse-card').count();
    expect.soft(cardCount, 'Expected at least one card after applying the Gutenberg filter').toBeGreaterThan(0);
  });

  test('86.03 Gutenberg PRO card import button is enabled/not locked for Nexter PRO users', async ({ page }) => {
    if (!NEXTER_LICENSE) {
      test.skip(true, 'Requires Nexter license key env var — set NEXTER_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'gutenberg');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No Gutenberg PRO cards found after filter — cannot verify lock state');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);
    const locked = await isImportButtonLocked(card);
    expect.soft(
      locked,
      'Gutenberg PRO card import button should be enabled for a Nexter PRO user'
    ).toBe(false);
  });

  test('86.04 Clicking import on a Gutenberg PRO card opens the wizard (not blocked)', async ({ page }) => {
    if (!NEXTER_LICENSE) {
      test.skip(true, 'Requires Nexter license key env var — set NEXTER_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'gutenberg');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No Gutenberg PRO cards found — cannot verify wizard opens');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const importBtn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importBtn.click({ force: true });
    } else {
      await card.click({ force: true });
    }
    await page.waitForTimeout(3500);

    const hash = await page.evaluate(() => location.hash);
    const wizardVisible = await page.locator('.wkit-temp-import-mian, .wkit-import-wizard').count() > 0;

    expect.soft(
      hash.match(/import-kit|browse\/kit|kit\//i) || wizardVisible,
      `Expected the import wizard to open for a Nexter PRO Gutenberg card, got hash: ${hash}`
    ).toBeTruthy();
  });

  test('86.05 Elementor PRO cards remain locked for Nexter PRO users (no WDKit login)', async ({ page }) => {
    if (!NEXTER_LICENSE) {
      test.skip(true, 'Requires Nexter license key env var — set NEXTER_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'elementor');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      console.log('[86.05] No Elementor PRO cards found after filter — cannot assert locked state');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);
    const locked = await isImportButtonLocked(card);

    const upgradeNotice = await page.locator(
      '.wkit-pro-plugin-notice, .wkit-upgrade-notice'
    ).count();

    expect.soft(
      locked || upgradeNotice > 0,
      'Elementor PRO card should be locked or show upgrade notice for a Nexter PRO user without WDKit login'
    ).toBe(true);
  });

  test('86.06 Import button on an Elementor PRO card is disabled or shows locked state for Nexter PRO users', async ({ page }) => {
    if (!NEXTER_LICENSE) {
      test.skip(true, 'Requires Nexter license key env var — set NEXTER_LICENSE_KEY');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await applyBuilderFilter(page, 'elementor');
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      console.log('[86.06] No Elementor PRO cards found — skipping disabled button check');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const btn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    const btnCount = await btn.count();
    if (btnCount === 0) {
      // No import button rendered at all — treated as locked
      return;
    }

    const isDisabled = await btn.getAttribute('disabled').then(v => v !== null).catch(() => false);
    const pe = await btn.evaluate(el => getComputedStyle(el).pointerEvents).catch(() => 'auto');
    const hasLockedClass = await btn.evaluate(el =>
      el.classList.contains('wkit-pro-locked') || el.classList.contains('wdkit-pro-locked')
    ).catch(() => false);

    const upgradeCta = await page.locator(
      'button:has-text("Upgrade"), button:has-text("Go PRO"), a:has-text("Upgrade"), a:has-text("Go PRO")'
    ).count();

    const isLocked = isDisabled || pe === 'none' || hasLockedClass || upgradeCta > 0;
    expect.soft(
      isLocked,
      'Elementor PRO card import button should be disabled/locked for a Nexter PRO user without WDKit login'
    ).toBe(true);
  });

});
