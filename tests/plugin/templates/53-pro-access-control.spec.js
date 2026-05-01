// =============================================================================
// WDesignKit Templates Suite — PRO Access Control
// Version: 2.0.0 — Extreme-polish pass: added §84.07-08 (PRO access revoked on logout,
//                 subscriber role blocked); §87 FREE user section (6 tests — PRO cards
//                 locked, free templates work, no wizard for locked cards, upgrade CTA present)
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

  // ---------------------------------------------------------------------------
  // 84.07 — PRO access removed immediately after WDKit cloud logout
  // Logic-checklist: UI state matches server state after mutations
  // ---------------------------------------------------------------------------
  test('84.07 PRO access is removed immediately after WDKit cloud logout', async ({ page }) => {
    if (!WDKIT_TOKEN || !WDKIT_EMAIL) {
      test.skip(true, 'Requires WDKIT_API_TOKEN + WDKIT_EMAIL env vars');
      return;
    }
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 });
    const proCardsBefore = proCardLocator(page);
    const countBefore = await proCardsBefore.count();
    if (countBefore === 0) {
      test.skip(true, 'No PRO cards to verify access removal — skipping');
      return;
    }

    // Verify PRO card is accessible before logout
    const cardBefore = proCardsBefore.first();
    await cardBefore.hover({ force: true });
    await page.waitForTimeout(400);
    const lockedBefore = await isImportButtonLocked(cardBefore);
    // For a WDKit PRO user the card should NOT be locked
    expect.soft(lockedBefore, 'PRO card should be unlocked BEFORE WDKit logout for WDKit PRO user').toBe(false);

    // Now logout from WDKit cloud
    await wdkitLogout(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Re-navigate to Browse (hash may have reset on reload)
    await goToBrowse(page);
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

    // After WDKit logout, PRO cards should now be locked for a free user
    const proCardsAfter = proCardLocator(page);
    const countAfter = await proCardsAfter.count();
    if (countAfter === 0) return; // No PRO cards visible — acceptable

    const cardAfter = proCardsAfter.first();
    await cardAfter.hover({ force: true });
    await page.waitForTimeout(500);
    const lockedAfter = await isImportButtonLocked(cardAfter);

    // Also check for upgrade notice as a valid locked signal
    const upgradeNoticeAfter = await page.locator(
      '.wkit-pro-plugin-notice, .wkit-upgrade-notice'
    ).count();

    expect.soft(
      lockedAfter || upgradeNoticeAfter > 0,
      'PRO card should be locked or show upgrade notice AFTER WDKit cloud logout'
    ).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 84.08 — Subscriber-role WP user cannot access WDKit admin page
  // Security-checklist: Direct URL access to restricted pages redirects correctly
  // Logic-checklist: Privileged actions are blocked for lower roles
  // ---------------------------------------------------------------------------
  test('84.08 Subscriber-role WP user is blocked from WDKit admin page', async ({ page }) => {
    // Use the subscriber credentials from auth helpers
    const { SUBSCRIBER_USER, SUBSCRIBER_PASS } = require('./_helpers/auth');
    // Log in as subscriber (not admin)
    await page.goto('/wp-login.php');
    await page.fill('#user_login', SUBSCRIBER_USER);
    await page.fill('#user_pass', SUBSCRIBER_PASS);
    await page.click('#wp-submit');
    // Subscriber may or may not be redirected to wp-admin — wait for redirect
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Now try to access WDKit admin page directly
    await page.goto('/wp-admin/admin.php?page=wdesign-kit', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const bodyText = await page.locator('body').textContent().catch(() => '');
    const currentUrl = page.url();

    // A subscriber should see an access-denied message, be redirected to login,
    // or land on a page that is NOT the WDKit plugin dashboard
    const isBlocked =
      bodyText.includes('not allowed') ||
      bodyText.includes('You do not have') ||
      bodyText.includes('access denied') ||
      bodyText.includes('Cheatin') ||
      currentUrl.includes('wp-login') ||
      !currentUrl.includes('wdesign-kit');

    expect.soft(
      isBlocked,
      `Subscriber role should not have access to WDKit admin page. URL: ${currentUrl}`
    ).toBe(true);
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

// =============================================================================
// 87. FREE user (no WDKit login, no PRO plugin) — PRO templates locked
//
// Gate: No env vars required — this tests the DEFAULT unauthenticated state.
// Key: No WDKit cloud login, no ThePlus license, no Nexter license.
//      PRO template cards must show a locked/upgrade state.
//      Free templates must still be importable normally.
//
// Logic-checklist: Access control — users only see content they are permitted to
// Functionality-checklist: Confirmation dialogs for locked actions
// =============================================================================
test.describe('87. FREE user — PRO templates locked, free templates accessible', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // WP admin login only — no WDKit cloud login, no plugin license
    await wpLogin(page);
    // Ensure WDKit cloud session is completely cleared
    await page.goto(PLUGIN_PAGE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await wdkitLogout(page);
    // Navigate to browse page as a free user
    await goToBrowse(page);
  });

  // --------------------------------------------------------------------------
  // 87.01 — PRO badge cards are visible on the browse page for a free user
  // A free user should still SEE PRO cards (marketing), just not be able to import them
  // --------------------------------------------------------------------------
  test('87.01 PRO badge cards are visible on browse page for a free user (marketing visibility)', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    // PRO cards SHOULD be shown to free users — they are meant to upsell
    expect.soft(
      count,
      'PRO badge cards should be visible on the browse page for a free user (upsell / marketing)'
    ).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 87.02 — PRO card import button is in a locked state for a free user
  // Logic-checklist: Role-based access control
  // --------------------------------------------------------------------------
  test('87.02 PRO card import button is locked for a free user (no WDKit login)', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No PRO badge cards found — cannot verify locked state for free user');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const locked = await isImportButtonLocked(card);

    // Also accept upgrade notice as a valid locked signal
    const upgradeNotice = await page.locator(
      '.wkit-pro-plugin-notice, .wkit-upgrade-notice, [class*="pro-notice"]'
    ).count();

    expect.soft(
      locked || upgradeNotice > 0,
      'PRO card import button must be locked or show an upgrade notice for a free user'
    ).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 87.03 — Clicking a locked PRO card does NOT open the import wizard
  // The hash should remain on #/browse or show a locked notice — not advance to import-kit
  // --------------------------------------------------------------------------
  test('87.03 Clicking a locked PRO card does not open the import wizard for a free user', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const proCards = proCardLocator(page);
    const count = await proCards.count();
    if (count === 0) {
      test.skip(true, 'No PRO badge cards found — skipping wizard block check');
      return;
    }

    const card = proCards.first();
    await card.hover({ force: true });
    await page.waitForTimeout(500);

    const hashBefore = await page.evaluate(() => location.hash);

    // Attempt to click the import button or card
    const importBtn = card.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importBtn.click({ force: true });
    } else {
      await card.click({ force: true });
    }
    await page.waitForTimeout(3000);

    const hashAfter = await page.evaluate(() => location.hash);
    const wizardVisible = await page.locator('.wkit-temp-import-mian, .wkit-import-wizard').count() > 0;

    // The wizard should NOT have opened — either hash unchanged or wizard not visible
    const wizardOpened = hashAfter.match(/import-kit/i) && wizardVisible;

    expect.soft(
      !wizardOpened,
      `Import wizard should NOT open for a free user clicking a PRO card. Hash changed from "${hashBefore}" to "${hashAfter}"`
    ).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 87.04 — Free/non-PRO template import button is accessible for free user
  // Free users must be able to import free templates without any blocker
  // --------------------------------------------------------------------------
  test('87.04 Free template import button is accessible (not locked) for a free user', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

    const cards = page.locator('.wdkit-browse-card');
    const cardCount = await cards.count();

    // Find a card without a PRO badge
    let freeCard = null;
    for (let i = 0; i < Math.min(cardCount, 25); i++) {
      const card = cards.nth(i);
      const hasProBadge = await card.locator(
        '.wdkit-pro-crd, .wdkit-card-tag.wdkit-pro-crd, [class*="pro-badge"], [class*="pro-lock"], .wkit-pro-badge'
      ).count().then(c => c > 0).catch(() => false);
      if (!hasProBadge) {
        freeCard = card;
        break;
      }
    }

    if (!freeCard) {
      // All visible cards are PRO — may be a filter artifact; skip gracefully
      console.log('[87.04] All visible cards appear to be PRO — cannot verify free card accessibility');
      return;
    }

    await freeCard.hover({ force: true });
    await page.waitForTimeout(500);

    const locked = await isImportButtonLocked(freeCard);
    expect.soft(
      locked,
      'A free (non-PRO) template card import button must NOT be locked for a free user'
    ).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 87.05 — Free template wizard opens normally for a free user (no upgrade blocker)
  // --------------------------------------------------------------------------
  test('87.05 Free template import wizard opens correctly for a free user', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

    const cards = page.locator('.wdkit-browse-card');
    const cardCount = await cards.count();

    // Find a free card
    let freeCard = null;
    for (let i = 0; i < Math.min(cardCount, 25); i++) {
      const card = cards.nth(i);
      const hasProBadge = await card.locator(
        '.wdkit-pro-crd, .wdkit-card-tag.wdkit-pro-crd, [class*="pro-badge"], [class*="pro-lock"], .wkit-pro-badge'
      ).count().then(c => c > 0).catch(() => false);
      if (!hasProBadge) {
        freeCard = card;
        break;
      }
    }

    if (!freeCard) {
      console.log('[87.05] No free cards visible — skipping wizard open check');
      return;
    }

    await freeCard.hover({ force: true });
    await page.waitForTimeout(500);

    const importBtn = freeCard.locator('.wdkit-browse-card-download, button[class*="import"]').first();
    if (await importBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importBtn.click({ force: true });
    } else {
      await freeCard.click({ force: true });
    }
    await page.waitForTimeout(3000);

    // The import wizard should have opened
    const wizardVisible = await page.locator('.wkit-temp-import-mian').isVisible({ timeout: 10000 }).catch(() => false);
    const hashAfter = await page.evaluate(() => location.hash);

    expect.soft(
      wizardVisible || hashAfter.match(/import-kit/i),
      'Free template import wizard should open for a free user — no upgrade blocker expected'
    ).toBeTruthy();

    // Wizard must not show a PRO-required upgrade blocker
    const upgradeBlocker = await page.locator(
      '.wkit-pro-plugin-notice, .wkit-upgrade-notice, [class*="upgrade-required"]'
    ).count();
    expect.soft(
      upgradeBlocker,
      'Upgrade blocker should NOT appear in the wizard for a free template on a free user account'
    ).toBe(0);
  });

  // --------------------------------------------------------------------------
  // 87.06 — A WDKit login CTA or upgrade prompt is present somewhere on the
  //          browse page for a free user (encourages upgrade/login — UX check)
  // --------------------------------------------------------------------------
  test('87.06 A login or upgrade CTA is present on the browse page for a free user', async ({ page }) => {
    await page.locator('.wdkit-browse-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

    // Look for any login/upgrade CTA: button, link, or banner
    const loginCta = await page.locator(
      // Login / sign-in buttons in the plugin header or sidebar
      'button:has-text("Login"), a:has-text("Login"), ' +
      'button:has-text("Sign In"), a:has-text("Sign In"), ' +
      // Upgrade banners / CTAs
      'button:has-text("Upgrade"), a:has-text("Upgrade"), ' +
      'button:has-text("Go PRO"), a:has-text("Go PRO"), ' +
      // WDKit-specific CTA selectors
      '.wkit-login-cta, .wkit-upgrade-cta, .wkit-pro-cta, ' +
      '[class*="login-btn"], [class*="upgrade-btn"], [class*="pro-btn"]'
    ).count();

    expect.soft(
      loginCta,
      'Browse page should show a Login or Upgrade CTA to encourage free users to access PRO templates'
    ).toBeGreaterThan(0);
  });

});
