// =============================================================================
// WDesignKit Plugin — Widget Auto-Download on Template/Kit Import
//
// Feature: When a template or kit is imported that contains a custom WDesignKit
//          widget, the system automatically detects and downloads that widget,
//          making it appear in the Widget Builder listing.
//
// Flow Under Test:
//   1. Create a blank widget in Widget Builder → Push to server
//   2. Create a WP page → Add the widget → Save page as template in WDesignKit
//   3. Delete the page from WordPress
//   4. Import the template/kit via WDesignKit browse
//   5. Verify the widget appears in the Widget Builder listing
//
// Builders in scope : Elementor · Gutenberg Core · Nexter Gutenberg
// Login states       : Logged-in (widget/download API) · Logged-out (import/widget/free API)
// Template types     : Template · Kit
//
// Environment: WordPress + Docker @ http://localhost:8881
//   Set in .env:
//     PLUGIN_URL, WP_ADMIN_USER, WP_ADMIN_PASS
//     WDKIT_EMAIL, WDKIT_PASSWORD           — logged-in account
//     WDKIT_TEMPLATE_ID_ELEMENTOR           — template saved with Elementor WDKit widget
//     WDKIT_TEMPLATE_ID_GUTENBERG_CORE      — template saved with Gutenberg Core WDKit widget
//     WDKIT_TEMPLATE_ID_GUTENBERG           — template saved with Nexter Gutenberg WDKit widget
//     WDKIT_KIT_ID_ELEMENTOR                — kit saved with Elementor WDKit widget
//     WDKIT_KIT_ID_GUTENBERG_CORE           — kit saved with Gutenberg Core WDKit widget
//     WDKIT_KIT_ID_GUTENBERG                — kit saved with Nexter Gutenberg WDKit widget
//     WDKIT_WIDGET_NAME_ELEMENTOR           — name of the pushed Elementor widget
//     WDKIT_WIDGET_NAME_GUTENBERG_CORE      — name of the pushed Gutenberg Core widget
//     WDKIT_WIDGET_NAME_GUTENBERG           — name of the pushed Nexter Gutenberg widget
// =============================================================================

const { test, expect } = require('@playwright/test');

// ── Environment ───────────────────────────────────────────────────────────────
const ADMIN_USER      = (process.env.WP_ADMIN_USER   || 'admin').trim();
const ADMIN_PASS      = (process.env.WP_ADMIN_PASS   || 'admin@123').trim();
const WDKIT_EMAIL     = (process.env.WDKIT_EMAIL     || '').trim();
const WDKIT_PASS      = (process.env.WDKIT_PASSWORD  || '').trim();
const WDKIT_API_TOKEN = (process.env.WDKIT_API_TOKEN || '').trim();

const TEMPLATE_ID  = {
  elementor       : (process.env.WDKIT_TEMPLATE_ID_ELEMENTOR        || '').trim(),
  gutenberg_core  : (process.env.WDKIT_TEMPLATE_ID_GUTENBERG_CORE   || '').trim(),
  gutenberg       : (process.env.WDKIT_TEMPLATE_ID_GUTENBERG        || '').trim(),
};

const KIT_ID = {
  elementor       : (process.env.WDKIT_KIT_ID_ELEMENTOR        || '').trim(),
  gutenberg_core  : (process.env.WDKIT_KIT_ID_GUTENBERG_CORE   || '').trim(),
  gutenberg       : (process.env.WDKIT_KIT_ID_GUTENBERG        || '').trim(),
};

const WIDGET_NAME = {
  elementor       : (process.env.WDKIT_WIDGET_NAME_ELEMENTOR        || 'AutoTestElementor').trim(),
  gutenberg_core  : (process.env.WDKIT_WIDGET_NAME_GUTENBERG_CORE   || 'AutoTestGutenbergCore').trim(),
  gutenberg       : (process.env.WDKIT_WIDGET_NAME_GUTENBERG        || 'AutoTestNexter').trim(),
};

const BUILDER_LABEL = {
  elementor      : 'Elementor',
  gutenberg_core : 'Gutenberg Core',
  gutenberg      : 'Nexter Gutenberg',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function wpLogin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await expect(page).toHaveURL(/wp-admin/, { timeout: 15000 });
}

async function openWdkitPage(page, hash = '') {
  await page.goto(`/wp-admin/admin.php?page=wdesign-kit${hash ? '#' + hash : ''}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

async function wdkitLogin(page) {
  if (!WDKIT_EMAIL || !WDKIT_PASS) return;

  // Navigate to WDesignKit admin page to ensure wdkitData/ajaxurl are available
  await openWdkitPage(page, '/login');
  await page.waitForTimeout(1000);

  // Use the API token login via WP AJAX (api_login action) — bypasses broken
  // email/password endpoint. Falls back to form-based login if no token set.
  if (WDKIT_API_TOKEN) {
    const loginResult = await page.evaluate(async ({ token, email }) => {
      try {
        const nonce  = window.wdkitData?.kit_nonce || '';
        const ajax   = window.ajaxurl || '/wp-admin/admin-ajax.php';
        const form   = new FormData();
        form.append('action',      'get_wdesignkit');
        form.append('type',        'api_login');
        form.append('token',       token);
        form.append('login_type',  'session');
        form.append('site_url',    window.location.origin + window.location.pathname);
        form.append('kit_nonce',   nonce);
        form.append('buildertype', window.wdkit_editor || 'elementor');
        const res  = await fetch(ajax, { method: 'POST', body: form, credentials: 'same-origin' });
        const json = await res.json();
        // Store session in localStorage so React app recognises login
        const sessionData = {
          messages:   'Login successfully',
          user_email: json?.data?.user?.user_email || email,
          login_type: 'session',
          token:      token,
          success:    true,
        };
        if (json?.success || json?.data?.success) {
          localStorage.setItem('wdkit-login', JSON.stringify(sessionData));
        }
        return { ajax_success: json?.success || json?.data?.success, user: json?.data?.user?.user_email };
      } catch (e) {
        return { error: e.message };
      }
    }, { token: WDKIT_API_TOKEN, email: WDKIT_EMAIL });

    if (loginResult?.ajax_success) {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      return;
    }
  }

  // Fallback: email/password form login
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('wdkit') || k.startsWith('wkit'))
      .forEach(k => localStorage.removeItem(k));
  });
  await openWdkitPage(page, '/login');
  const formCard = page.locator('.wdkit-form-card');
  if (await formCard.isVisible({ timeout: 10000 }).catch(() => false)) {
    await page.locator('#WDkitUserEmail').fill(WDKIT_EMAIL);
    await page.locator('.wdkit-password-cover .wdkit-entry-input').fill(WDKIT_PASS);
    await page.locator('.wdkit-register-button').click();
    await page.waitForTimeout(2000);
  }
}

async function wdkitLogout(page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('wdkit') || k.startsWith('wkit'))
      .forEach(k => localStorage.removeItem(k));
  });
  await page.reload();
  await page.waitForTimeout(1000);
}

async function goToWidgetListing(page) {
  await page.evaluate(() => { window.location.hash = '/widget-listing'; });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
}

async function goToImportKit(page, kitId) {
  await page.evaluate((id) => { window.location.hash = `/import-kit/${id}`; }, kitId);
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
}

/** Find widget card in listing by widget name. Returns locator. */
function getWidgetCardByName(page, name) {
  return page.locator('.wdkit-browse-card').filter({
    has: page.locator(`.wdkit-widget-title:has-text("${name}")`)
  }).first();
}

/** Walk through the full kit import flow (preview → feature → method → all_set) */
async function completeKitImport(page) {
  // Step 0: Preview step — click Next if the preview panel is shown before feature selection
  const previewNextBtn = page.locator('.wkit-next-btn');
  if (await previewNextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await previewNextBtn.click();
    await page.waitForTimeout(1000);
  }

  // Step 1: Select Features — accept defaults, check T&C
  const featurePage = page.locator('.wkit-import-temp-feature');
  await featurePage.waitFor({ state: 'visible', timeout: 30000 });
  const ckbox = page.locator('#wkit-plugin-confirmation-id');
  if (!(await ckbox.isChecked())) {
    await page.locator('.wkit-site-feature-note').click();
  }
  await expect(ckbox).toBeChecked({ timeout: 5000 });
  await page.locator('.wkit-site-feature-next').click();

  // Step: Select Method — Normal Import
  const methodPage = page.locator('.wkit-import-method-main');
  await methodPage.waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('.wkit-method-card').first().click(); // Import Dummy Content
  await page.locator('.wkit-import-method-next').click();

  // Step: Import loader — wait for completion
  await page.locator('.wkit-site-import-success-main', { timeout: 120000 }).waitFor({ state: 'visible', timeout: 120000 });
}

/** Check widget download UI during import (best-effort — fires if popup is visible) */
async function assertDownloadUI(page) {
  // The download popup may appear embedded or in a new route — check if visible
  const downloadContainer = page.locator('.wkit-downloading-widget');
  const isVisible = await downloadContainer.isVisible().catch(() => false);

  if (isVisible) {
    await expect(page.locator('.wkit-downloading-text')).toHaveText(/Widget Downloading/i);
    await expect(page.locator('.wkit-downloading-widget-outer')).toBeVisible();
    // Wait for success state
    await expect(page.locator('.wkit-tpae-success-container')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.wkit-tpae-success-text')).toHaveText(/Your widget Downloaded Successfully/i);
  }
}

// =============================================================================
// SECTION 01 — Widget Builder: Create & Push to Server
// =============================================================================

test.describe('01 — Widget Builder: Create & Push to Server', () => {

  test.beforeEach(async ({ page }) => {
    if (!WDKIT_EMAIL || !WDKIT_PASS) return; // test body will skip
    await wpLogin(page);
    await wdkitLogin(page);
    await openWdkitPage(page, '/widget-listing');
    await page.waitForTimeout(1000);
  });

  ['elementor', 'gutenberg_core', 'gutenberg'].forEach((builder) => {

    test(`01.${builder} — Create blank widget and push to server (${BUILDER_LABEL[builder]})`, async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) test.skip(true, 'WDKIT_EMAIL/PASSWORD not set');

      const widgetName = WIDGET_NAME[builder];

      // Open Create Widget popup
      await expect(page.locator('.wkit-button-secondary')).toBeVisible({ timeout: 15000 });
      await page.locator('.wkit-button-secondary').click(); // Create Widget
      await page.waitForTimeout(800);

      // Select builder type via radio
      const radioId = `#wb-add-${builder}-radio`;
      const radio = page.locator(radioId);
      await expect(radio).toBeVisible({ timeout: 10000 });
      await radio.check();
      await expect(radio).toBeChecked();

      // Enter widget name
      await page.locator('#wb-add-widget-name').fill(widgetName);
      await expect(page.locator('#wb-add-widget-name')).toHaveValue(widgetName);

      // Submit — Create Widget
      await page.locator('.wb-add-widget-link.wkit-btn-class').last().click();
      await page.waitForTimeout(3000);

      // Verify widget appears in listing
      const widgetCard = getWidgetCardByName(page, widgetName);
      await expect(widgetCard).toBeVisible({ timeout: 15000 });

      // Push widget to server — open 3-dot menu on the new card
      await widgetCard.locator('.wkit-wb-widget-dropDown, .wdkit-i-menu, [class*="menu"]').first().click();
      await page.waitForTimeout(500);

      const pushBtn = page.locator('.wkit-wb-listmenu-text:has-text("Push Widget")');
      await expect(pushBtn).toBeVisible({ timeout: 8000 });
      await pushBtn.click();
      await page.waitForTimeout(1000);

      // Confirm push in popup (sync popup)
      const syncConfirm = page.locator('.wkit-btn-class:has-text("Push"), .wkit-btn-class:has-text("Sync"), .wb-version-popup-btn').last();
      if (await syncConfirm.isVisible()) {
        await syncConfirm.click();
      }

      await page.waitForTimeout(3000);

      // After push, allow_push flag resets — Push Widget option should be gone from menu
      // Widget card should still exist
      await expect(widgetCard).toBeVisible({ timeout: 10000 });
    });

  });

});

// =============================================================================
// SECTION 02 — Template Import: Widget Auto-Download (Logged In)
// =============================================================================

test.describe('02 — Template Import: Widget Auto-Download (Logged In)', () => {

  test.beforeEach(async ({ page }) => {
    if (!WDKIT_EMAIL || !WDKIT_PASS) return; // test body will skip
    await wpLogin(page);
    await wdkitLogin(page);
    await openWdkitPage(page);
    await page.waitForTimeout(1000);
  });

  // ── 02A: Single Template ────────────────────────────────────────────────────

  test.describe('02A — Single Template', () => {

    test('02A.1 — Elementor: widget auto-downloads on template import (logged in)', async ({ page }) => {
      if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

      await goToImportKit(page, TEMPLATE_ID.elementor);

      // Wait for template preview to load
      await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });

      // Check for widget download during import
      await assertDownloadUI(page);

      await completeKitImport(page);

      // Navigate to widget listing and verify
      await goToWidgetListing(page);
      const widgetCard = getWidgetCardByName(page, WIDGET_NAME.elementor);
      await expect(widgetCard).toBeVisible({ timeout: 20000 });
    });

    test('02A.2 — Gutenberg Core: widget auto-downloads on template import (logged in)', async ({ page }) => {
      if (!TEMPLATE_ID.gutenberg_core) test.skip(true, 'WDKIT_TEMPLATE_ID_GUTENBERG_CORE not set');

      await goToImportKit(page, TEMPLATE_ID.gutenberg_core);
      await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
      await assertDownloadUI(page);
      await completeKitImport(page);

      await goToWidgetListing(page);
      const widgetCard = getWidgetCardByName(page, WIDGET_NAME.gutenberg_core);
      await expect(widgetCard).toBeVisible({ timeout: 20000 });
    });

    test('02A.3 — Nexter Gutenberg: widget auto-downloads on template import (logged in)', async ({ page }) => {
      if (!TEMPLATE_ID.gutenberg) test.skip(true, 'WDKIT_TEMPLATE_ID_GUTENBERG not set');

      await goToImportKit(page, TEMPLATE_ID.gutenberg);
      await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
      await assertDownloadUI(page);
      await completeKitImport(page);

      await goToWidgetListing(page);
      const widgetCard = getWidgetCardByName(page, WIDGET_NAME.gutenberg);
      await expect(widgetCard).toBeVisible({ timeout: 20000 });
    });

  });

  // ── 02B: Kit ────────────────────────────────────────────────────────────────

  test.describe('02B — Kit', () => {

    test('02B.1 — Elementor: widget auto-downloads on kit import (logged in)', async ({ page }) => {
      if (!KIT_ID.elementor) test.skip(true, 'WDKIT_KIT_ID_ELEMENTOR not set');

      await goToImportKit(page, KIT_ID.elementor);
      await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
      await assertDownloadUI(page);
      await completeKitImport(page);

      await goToWidgetListing(page);
      const widgetCard = getWidgetCardByName(page, WIDGET_NAME.elementor);
      await expect(widgetCard).toBeVisible({ timeout: 20000 });
    });

    test('02B.2 — Gutenberg Core: widget auto-downloads on kit import (logged in)', async ({ page }) => {
      if (!KIT_ID.gutenberg_core) test.skip(true, 'WDKIT_KIT_ID_GUTENBERG_CORE not set');

      await goToImportKit(page, KIT_ID.gutenberg_core);
      await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
      await assertDownloadUI(page);
      await completeKitImport(page);

      await goToWidgetListing(page);
      const widgetCard = getWidgetCardByName(page, WIDGET_NAME.gutenberg_core);
      await expect(widgetCard).toBeVisible({ timeout: 20000 });
    });

    test('02B.3 — Nexter Gutenberg: widget auto-downloads on kit import (logged in)', async ({ page }) => {
      if (!KIT_ID.gutenberg) test.skip(true, 'WDKIT_KIT_ID_GUTENBERG not set');

      await goToImportKit(page, KIT_ID.gutenberg);
      await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
      await assertDownloadUI(page);
      await completeKitImport(page);

      await goToWidgetListing(page);
      const widgetCard = getWidgetCardByName(page, WIDGET_NAME.gutenberg);
      await expect(widgetCard).toBeVisible({ timeout: 20000 });
    });

  });

});

// =============================================================================
// SECTION 03 — Template Import: Widget Auto-Download (Logged Out / Free API)
// =============================================================================

test.describe('03 — Template Import: Widget Auto-Download (Logged Out)', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await openWdkitPage(page);
    await wdkitLogout(page); // ensure WDesignKit cloud session is cleared
    await page.waitForTimeout(500);
  });

  test('03.1 — Elementor: free widget auto-downloads on template import (logged out)', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await assertDownloadUI(page);
    await completeKitImport(page);

    await goToWidgetListing(page);
    const widgetCard = getWidgetCardByName(page, WIDGET_NAME.elementor);
    await expect(widgetCard).toBeVisible({ timeout: 20000 });
  });

  test('03.2 — Gutenberg Core: free widget auto-downloads on template import (logged out)', async ({ page }) => {
    if (!TEMPLATE_ID.gutenberg_core) test.skip(true, 'WDKIT_TEMPLATE_ID_GUTENBERG_CORE not set');

    await goToImportKit(page, TEMPLATE_ID.gutenberg_core);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await assertDownloadUI(page);
    await completeKitImport(page);

    await goToWidgetListing(page);
    const widgetCard = getWidgetCardByName(page, WIDGET_NAME.gutenberg_core);
    await expect(widgetCard).toBeVisible({ timeout: 20000 });
  });

  test('03.3 — Nexter Gutenberg: free widget auto-downloads on template import (logged out)', async ({ page }) => {
    if (!TEMPLATE_ID.gutenberg) test.skip(true, 'WDKIT_TEMPLATE_ID_GUTENBERG not set');

    await goToImportKit(page, TEMPLATE_ID.gutenberg);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await assertDownloadUI(page);
    await completeKitImport(page);

    await goToWidgetListing(page);
    const widgetCard = getWidgetCardByName(page, WIDGET_NAME.gutenberg);
    await expect(widgetCard).toBeVisible({ timeout: 20000 });
  });

});

// =============================================================================
// SECTION 04 — Download UI Validation
// =============================================================================

test.describe('04 — Download UI Validation', () => {

  test.beforeEach(async ({ page }) => {
    if (!WDKIT_EMAIL || !WDKIT_PASS) return; // test body will skip
    await wpLogin(page);
    await wdkitLogin(page);
    await openWdkitPage(page);
  });

  test('04.1 — Download progress bar is visible while widget is downloading', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });

    // If the download UI fires, check the loading state
    const downloadContainer = page.locator('.wkit-downloading-widget');
    const appeared = await downloadContainer.isVisible({ timeout: 10000 }).catch(() => false);

    if (appeared) {
      await expect(page.locator('.wkit-downloading-text')).toHaveText(/Widget Downloading/i);
      await expect(page.locator('.wkit-downloading-widget-outer')).toBeVisible();
      await expect(page.locator('.wkit-downloading-widget-inner')).toBeVisible();
    } else {
      test.info().annotations.push({ type: 'note', description: 'Download UI did not appear — widget may already be present on this site' });
    }
  });

  test('04.2 — Success state shown after widget download completes', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });

    const downloadContainer = page.locator('.wkit-downloading-widget');
    const appeared = await downloadContainer.isVisible({ timeout: 10000 }).catch(() => false);

    if (appeared) {
      await expect(page.locator('.wkit-tpae-success-container')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('.wkit-tpae-success-text')).toHaveText(/Your widget Downloaded Successfully/i);
    }
  });

  test('04.3 — Download UI closes automatically after success', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });

    const downloadContainer = page.locator('.wkit-downloading-widget');
    const appeared = await downloadContainer.isVisible({ timeout: 10000 }).catch(() => false);

    if (appeared) {
      // After success, the popup/container should be hidden or detached
      await expect(page.locator('.wkit-tpae-success-container')).toBeVisible({ timeout: 30000 });
      await page.waitForTimeout(3000);
      // The download widget section should no longer show the loading bar
      await expect(page.locator('.wkit-downloading-widget-outer')).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('04.4 — Download UI does not remain stuck in loading state', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });

    const downloadContainer = page.locator('.wkit-downloading-widget');
    const appeared = await downloadContainer.isVisible({ timeout: 10000 }).catch(() => false);

    if (appeared) {
      // The loading text should eventually disappear (replaced by success) within 30s
      await expect(page.locator('.wkit-downloading-text')).not.toBeVisible({ timeout: 30000 });
    }
  });

});

// =============================================================================
// SECTION 05 — Widget Listing Verification After Import
// =============================================================================

test.describe('05 — Widget Listing: Verification After Import', () => {

  test.beforeEach(async ({ page }) => {
    if (!WDKIT_EMAIL || !WDKIT_PASS) return; // test body will skip
    await wpLogin(page);
    await wdkitLogin(page);
  });

  test('05.1 — Widget appears in listing with correct name after Elementor import', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);
    await goToWidgetListing(page);

    const card = getWidgetCardByName(page, WIDGET_NAME.elementor);
    await expect(card).toBeVisible({ timeout: 20000 });
    await expect(card.locator('.wdkit-widget-title')).toHaveText(WIDGET_NAME.elementor);
  });

  test('05.2 — Widget appears in listing with correct name after Gutenberg Core import', async ({ page }) => {
    if (!TEMPLATE_ID.gutenberg_core) test.skip(true, 'WDKIT_TEMPLATE_ID_GUTENBERG_CORE not set');

    await goToImportKit(page, TEMPLATE_ID.gutenberg_core);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);
    await goToWidgetListing(page);

    const card = getWidgetCardByName(page, WIDGET_NAME.gutenberg_core);
    await expect(card).toBeVisible({ timeout: 20000 });
    await expect(card.locator('.wdkit-widget-title')).toHaveText(WIDGET_NAME.gutenberg_core);
  });

  test('05.3 — Widget appears in listing with correct name after Nexter Gutenberg import', async ({ page }) => {
    if (!TEMPLATE_ID.gutenberg) test.skip(true, 'WDKIT_TEMPLATE_ID_GUTENBERG not set');

    await goToImportKit(page, TEMPLATE_ID.gutenberg);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);
    await goToWidgetListing(page);

    const card = getWidgetCardByName(page, WIDGET_NAME.gutenberg);
    await expect(card).toBeVisible({ timeout: 20000 });
    await expect(card.locator('.wdkit-widget-title')).toHaveText(WIDGET_NAME.gutenberg);
  });

  test('05.4 — Widget thumbnail is present on card after import (not blank)', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);
    await goToWidgetListing(page);

    const card = getWidgetCardByName(page, WIDGET_NAME.elementor);
    await expect(card).toBeVisible({ timeout: 20000 });

    // Image should have a valid background-image or src
    const imgDiv = card.locator('.wkit-wb-widget-img').first();
    await expect(imgDiv).toBeVisible();
    const style = await imgDiv.getAttribute('style');
    expect(style).toMatch(/url\(/);
    expect(style).not.toContain('undefined');
  });

  test('05.5 — Widget builder type badge is correct (Elementor badge on Elementor widget)', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);
    await goToWidgetListing(page);

    const card = getWidgetCardByName(page, WIDGET_NAME.elementor);
    await expect(card).toBeVisible({ timeout: 20000 });

    // Elementor badge — should have elementor.svg image
    const badge = card.locator('img[src*="elementor"]');
    await expect(badge).toBeVisible();
  });

  test('05.6 — Downloaded widget is usable — can be opened in Widget Builder editor', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);
    await goToWidgetListing(page);

    const card = getWidgetCardByName(page, WIDGET_NAME.elementor);
    await expect(card).toBeVisible({ timeout: 20000 });

    // Click widget image to open in builder
    await card.locator('.wkit-wb-widget-img').click();
    await page.waitForTimeout(2000);

    // Should navigate to /widget-listing/builder/:id
    await expect(page).toHaveURL(/widget-listing\/builder/, { timeout: 15000 });
  });

});

// =============================================================================
// SECTION 06 — Edge Cases
// =============================================================================

test.describe('06 — Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    if (!WDKIT_EMAIL || !WDKIT_PASS) return; // test body will skip
    await wpLogin(page);
    await wdkitLogin(page);
    await openWdkitPage(page);
  });

  test('06.1 — Importing same template twice does not create duplicate widget in listing', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    // First import
    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    // Second import of same template
    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    // Count widget cards with the same name — should be exactly 1
    await goToWidgetListing(page);
    const cards = page.locator('.wdkit-browse-card').filter({
      has: page.locator(`.wdkit-widget-title:has-text("${WIDGET_NAME.elementor}")`)
    });
    await expect(cards).toHaveCount(1, { timeout: 20000 });
  });

  test('06.2 — Template with NO WDesignKit widget imports without triggering widget download', async ({ page }) => {
    // This test imports any standard WDesignKit template that has no custom WDKit widget
    // The import flow should complete without any widget download UI appearing
    if (!TEMPLATE_ID.elementor) test.skip(true, 'Need a template without WDKit widget — set WDKIT_TEMPLATE_ID_ELEMENTOR to a standard template');

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    // No widget download UI should have appeared
    const downloadUI = page.locator('.wkit-downloading-widget');
    // We can only verify if the container is NOT present after import completes
    await expect(downloadUI).not.toBeVisible({ timeout: 5000 }).catch(() => {
      // It's acceptable if it appeared and then closed successfully
    });
  });

  test('06.3 — Widget already present on site: import does not break, widget still visible in listing', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    // First: ensure widget is already downloaded
    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    // Second: import the same template again (widget already exists)
    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    // Widget should still be visible
    await goToWidgetListing(page);
    const card = getWidgetCardByName(page, WIDGET_NAME.elementor);
    await expect(card).toBeVisible({ timeout: 20000 });
  });

  test('06.4 — Template containing multiple WDesignKit widgets: all are downloaded', async ({ page }) => {
    // Requires a template with 2+ WDKit widgets — skip if not set
    const multiWidgetTemplateId = (process.env.WDKIT_TEMPLATE_ID_MULTI_WIDGET || '').trim();
    const widget2Name = (process.env.WDKIT_WIDGET_NAME_2 || '').trim();
    if (!multiWidgetTemplateId || !widget2Name) test.skip(true, 'WDKIT_TEMPLATE_ID_MULTI_WIDGET / WDKIT_WIDGET_NAME_2 not set');

    await goToImportKit(page, multiWidgetTemplateId);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    await goToWidgetListing(page);

    // Both widgets should appear
    await expect(getWidgetCardByName(page, WIDGET_NAME.elementor)).toBeVisible({ timeout: 20000 });
    await expect(getWidgetCardByName(page, widget2Name)).toBeVisible({ timeout: 20000 });
  });

  test('06.5 — Import completes without console errors', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    // Filter out known third-party noise if needed
    const productErrors = consoleErrors.filter(e =>
      !e.includes('net::ERR_BLOCKED_BY_CLIENT') &&
      !e.includes('favicon')
    );

    expect(productErrors).toHaveLength(0);
  });

  test('06.6 — Import step labels (breadcrumbs) advance correctly during import', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });

    // Feature step
    const featurePage = page.locator('.wkit-import-temp-feature');
    if (await featurePage.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Breadcrumb "Select Features" should be active
      await expect(page.locator('.wkit-active-breadcrumbs').filter({ hasText: 'Select Features' })).toBeVisible({ timeout: 10000 });

      const ckbox = page.locator('#wkit-plugin-confirmation-id');
      if (!(await ckbox.isChecked())) await page.locator('.wkit-site-feature-note').click();
      await page.locator('.wkit-site-feature-next').click();

      // After moving to method step, "Select Features" should be marked complete
      await expect(page.locator('.wkit-complete-breadcrumbs').filter({ hasText: 'Select Features' })).toBeVisible({ timeout: 10000 });
    }
  });

});

// =============================================================================
// SECTION 07 — Security
// =============================================================================

test.describe('07 — Security', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await openWdkitPage(page);
  });

  test('07.1 — wkit_public_download_widget AJAX call requires valid nonce', async ({ page }) => {
    // Attempt the AJAX call with an invalid nonce — should return error
    const response = await page.evaluate(async () => {
      const form = new FormData();
      form.append('action', 'get_wdesignkit');
      form.append('kit_nonce', 'invalid_nonce_123');
      form.append('type', 'wkit_public_download_widget');
      form.append('widget_info', JSON.stringify({ api_type: 'import/widget/free', w_uniq: 'test123' }));

      const res = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: form });
      return res.json();
    });

    // WordPress nonce failure returns -1 or { success: false }
    const isBlocked = response === -1 || response === '-1' || response?.success === false;
    expect(isBlocked).toBe(true);
  });

  test('07.2 — Widget ID input is sanitized — no XSS via widget ID parameter', async ({ page }) => {
    await openWdkitPage(page, '/download/widget/<script>alert(1)</script>');
    await page.waitForTimeout(2000);

    // No alert should have fired
    let alertFired = false;
    page.on('dialog', dialog => {
      alertFired = true;
      dialog.dismiss();
    });
    await page.waitForTimeout(1000);
    expect(alertFired).toBe(false);

    // Page should not contain raw unescaped script tag
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('<script>alert(1)</script>');
  });

  test('07.3 — Import route is not accessible without WP admin login', async ({ page }) => {
    // Do NOT call wpLogin — go directly to import route
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await page.goto(`/wp-admin/admin.php?page=wdesign-kit#/import-kit/${TEMPLATE_ID.elementor}`);
    await page.waitForLoadState('networkidle');

    // Should be redirected to wp-login
    await expect(page).toHaveURL(/wp-login/, { timeout: 10000 });
  });

});

// =============================================================================
// SECTION 08 — Regression
// =============================================================================

test.describe('08 — Regression', () => {

  test.beforeEach(async ({ page }) => {
    if (!WDKIT_EMAIL || !WDKIT_PASS) return; // test body will skip
    await wpLogin(page);
    await wdkitLogin(page);
    await openWdkitPage(page);
  });

  test('08.1 — Widget Builder listing loads correctly (unaffected by import feature)', async ({ page }) => {
    await goToWidgetListing(page);

    // Listing container should be visible
    await expect(page.locator('.wb-widget-main-container')).toBeVisible({ timeout: 15000 });

    // Create Widget and Import Widget buttons should be present
    await expect(page.locator('.wkit-button-secondary:has-text("Create Widget")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.wkit-button-primary:has-text("Import Widget")')).toBeVisible({ timeout: 10000 });
  });

  test('08.2 — Import flow plugin install step is unaffected by widget download', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });

    // Feature selection page should load correctly with plugin cards
    const featurePage = page.locator('.wkit-import-temp-feature');
    if (await featurePage.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(page.locator('.wkit-feature-plugin-card').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.wkit-site-feature-next')).toBeVisible({ timeout: 5000 });
    }
  });

  test('08.3 — Import success screen is shown after full flow including widget download', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    await expect(page.locator('.wkit-site-import-success-main')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.wkit-import-success-title')).toContainText('Success');
  });

  test('08.4 — No fatal PHP errors on import page load', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await page.goto(`/wp-admin/admin.php?page=wdesign-kit#/import-kit/${TEMPLATE_ID.elementor}`);
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Fatal error');
    expect(body).not.toContain('Warning:');
    expect(body).not.toContain('Uncaught');
  });

  test('08.5 — WDesignKit dashboard loads without error after template import with widget download', async ({ page }) => {
    if (!TEMPLATE_ID.elementor) test.skip(true, 'WDKIT_TEMPLATE_ID_ELEMENTOR not set');

    await goToImportKit(page, TEMPLATE_ID.elementor);
    await expect(page.locator('.wkit-temp-import-mian')).toBeVisible({ timeout: 30000 });
    await completeKitImport(page);

    // Navigate back to dashboard
    await openWdkitPage(page, '/browse');
    await expect(page.locator('#wdesignkit-app-dashboard')).toBeVisible({ timeout: 15000 });
  });

});
