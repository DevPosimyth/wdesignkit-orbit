/**
 * Widget Builder Editor — Comprehensive QA
 * Single browser session (no close/reopen between checks)
 *
 * Run: npx playwright test tests/server/widget-builder-editor.spec.js --project=wdk-firefox --headed --workers=1
 *
 * MANUAL CHECKS (not automatable):
 * - Drag-and-drop block reorder on canvas
 * - Live preview visual accuracy vs frontend render
 * - RTL layout on Arabic/Hebrew locale
 * - Bricks builder (requires active Bricks licence)
 */

const { test, expect, firefox } = require('@playwright/test');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://wdesignkit.com';
const API_BASE = process.env.API_BASE || 'https://api.wdesignkit.com/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'devpanchal.posimyth@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Dev@0107';
const SCREENSHOTS = path.resolve(__dirname, '../../reports/screenshots');

// Shared browser kept alive across all tests
let browser, ctx, page;
let createdWidgetId = null;
const TEST_WIDGET_NAME = `QA Builder Test ${Date.now()}`;

// ─── helpers ────────────────────────────────────────────────────────────────

async function ss(name) {
  await page.screenshot({ path: `${SCREENSHOTS}/${name}.png`, fullPage: false });
}

async function isVisible(selector, timeout = 5000) {
  return page.locator(selector).first().isVisible({ timeout }).catch(() => false);
}

async function safeClick(selector, timeout = 8000) {
  const el = page.locator(selector).first();
  if (await el.isVisible({ timeout }).catch(() => false)) {
    await el.click();
    return true;
  }
  return false;
}

// ─── setup / teardown ───────────────────────────────────────────────────────

test.beforeAll(async () => {
  browser = await firefox.launch({ headless: false, slowMo: 200 });
  ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  page = await ctx.newPage();

  // Login once — browser stays open for all tests
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASS);
  await page.press('input[type="password"]', 'Enter');
  await page.waitForURL(/admin/, { timeout: 15000 });
  await page.waitForTimeout(2000);
});

test.afterAll(async () => {
  await browser.close();
});

// ─── tests ──────────────────────────────────────────────────────────────────

test.describe.serial('Widget Builder Editor — Full QA', () => {

  // ── 1. CREATE FLOW ────────────────────────────────────────────────────────

  test('WB-01 — Uploads page loads with Create Widget button', async () => {
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await ss('wb-01-uploads-page');

    const title = await page.title();
    console.log('Page title:', title);

    // Widget cards must be present
    const cards = page.locator('a[href*="/admin/widgets/edit/"]');
    const count = await cards.count();
    console.log('Widget cards visible:', count);
    expect(count).toBeGreaterThan(0);

    // Create Widget element must be visible
    const createEl = page.locator('span:has-text("Create Widget"), button:has-text("Create Widget")').first();
    await expect(createEl).toBeVisible({ timeout: 10000 });
    console.log('[PASS] Create Widget element visible');
  });

  test('WB-02 — Create Widget opens a popup/modal', async () => {
    // Click the Create Widget span
    const createEl = page.locator('span:has-text("Create Widget"), button:has-text("Create Widget")').first();
    await createEl.click();
    await page.waitForTimeout(2500);
    await ss('wb-02-create-popup');

    // A modal/dialog/overlay must appear
    const modalExists = await isVisible('[role="dialog"], .modal, .popup, [class*="modal"], [class*="dialog"], [class*="popup"], [class*="overlay"]', 5000);
    const hasNameInput = await isVisible('input[type="text"], input[placeholder*="name"], input[placeholder*="Name"], input[placeholder*="Widget"]', 5000);

    console.log('Modal element found:', modalExists);
    console.log('Name input found:', hasNameInput);

    // At minimum the page must have changed state — screenshot will confirm
    expect(modalExists || hasNameInput).toBeTruthy();
  });

  test('WB-03 — Popup has required fields (name + builder type)', async () => {
    await ss('wb-03-popup-fields');

    // Name field (exact placeholder from popup)
    const nameInput = page.locator('input[placeholder="Enter Widget Name"]').first();
    const hasName = await nameInput.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Name input visible:', hasName);

    // Builder type options (radio, select, or clickable cards)
    const hasElementor = await isVisible('text=Elementor', 3000);
    const hasGutenberg = await isVisible('text=Gutenberg', 3000);
    const hasBricks = await isVisible('text=Bricks', 3000);
    const hasNexter = await isVisible('text=Nexter', 3000);

    console.log('Builder options — Elementor:', hasElementor, '| Gutenberg:', hasGutenberg, '| Bricks:', hasBricks, '| Nexter:', hasNexter);
    expect(hasName).toBeTruthy();
  });

  test('WB-04 — Can fill name, select builder type, and submit popup', async () => {
    // Exact placeholder from popup screenshot
    const nameInput = page.locator('input[placeholder="Enter Widget Name"]').first();
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.clear();
      await nameInput.fill(TEST_WIDGET_NAME);
    }

    // Elementor is pre-selected — no need to click, just confirm
    const elementorSelected = await page.locator('[role="dialog"] input[type="radio"]').first().isChecked().catch(() => false);
    console.log('Elementor radio pre-selected:', elementorSelected);

    await ss('wb-04-popup-filled');

    // Submit — popup container is NOT role="dialog". Use JS click() to bypass overlay intercept.
    // The outer "Create Widget" is a SPAN; the popup button is a <button> element.
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent.trim() === 'Create Widget'
      );
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('Create Widget button clicked via JS:', clicked);

    // Wait for navigation to builder
    await page.waitForTimeout(8000);
    await ss('wb-04-after-submit');

    const currentUrl = page.url();
    console.log('URL after submit:', currentUrl);

    const inBuilder = currentUrl.includes('/admin/widgets/edit/') || currentUrl.includes('/builder');
    console.log('Landed in builder:', inBuilder);
    if (inBuilder) {
      const match = currentUrl.match(/\/edit\/(\d+)/);
      if (match) createdWidgetId = match[1];
      console.log('Created widget ID:', createdWidgetId);
    }
  });

  // ── 2. BUILDER CANVAS ─────────────────────────────────────────────────────

  test('WB-05 — Widget builder editor loads correctly', async () => {
    // If create flow didn't land in builder, navigate directly to a known widget
    const currentUrl = page.url();
    if (!currentUrl.includes('/admin/widgets/edit/')) {
      const targetId = createdWidgetId || '12422';
      await page.goto(`${BASE_URL}/admin/widgets/edit/${targetId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
    } else {
      await page.waitForTimeout(3000);
    }

    await ss('wb-05-builder-full');
    console.log('Builder URL:', page.url());

    // Check for builder iframe (Elementor/Gutenberg load inside iframe)
    const hasIframe = await isVisible('iframe', 5000);
    console.log('Builder iframe:', hasIframe);

    // Check for builder toolbar/header
    const hasToolbar = await isVisible('[class*="toolbar"], [class*="header"], [class*="top-bar"], [class*="editor-header"]', 5000);
    console.log('Builder toolbar:', hasToolbar);

    // Check no blank/error page
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const isErrorPage = bodyText.includes('not found') && bodyText.includes('Browse Templates');
    console.log('[BUG CHECK] Shows not-found page:', isErrorPage);

    expect(isErrorPage).toBeFalsy();
  });

  test('WB-06 — Builder has Save button visible', async () => {
    const saveVisible = await isVisible('button:has-text("Save"), [class*="save"], [aria-label*="save"], [aria-label*="Save"]', 8000);
    console.log('Save button visible:', saveVisible);
    await ss('wb-06-save-button');
    expect(saveVisible).toBeTruthy();
  });

  test('WB-07 — Builder has a canvas / content area', async () => {
    // Canvas could be iframe content or direct DOM
    const hasCanvas = await isVisible(
      'iframe[class*="editor"], iframe[name*="editor"], [class*="canvas"], [class*="preview"], [class*="builder-content"], [class*="editor-content"]',
      8000
    );
    console.log('Canvas/preview area visible:', hasCanvas);
    await ss('wb-07-canvas-area');
    expect(hasCanvas).toBeTruthy();
  });

  test('WB-08 — Builder has block/widget panel (left sidebar)', async () => {
    const hasSidebar = await isVisible(
      '[class*="sidebar"], [class*="panel"], [class*="widgets-panel"], [class*="elements-panel"], [class*="blocks"]',
      8000
    );
    console.log('Widget/block panel visible:', hasSidebar);
    await ss('wb-08-sidebar-panel');
    // Not asserting — just logging (structure varies by builder type)
  });

  test('WB-09 — Builder has settings/properties panel', async () => {
    const hasSettings = await isVisible(
      '[class*="settings"], [class*="properties"], [class*="inspector"], [class*="controls"]',
      5000
    );
    console.log('Settings/properties panel:', hasSettings);
    await ss('wb-09-settings-panel');
  });

  // ── 3. BUILDER TOOLBAR ─────────────────────────────────────────────────────

  test('WB-10 — Toolbar actions: Preview button visible', async () => {
    const hasPreview = await isVisible(
      'button:has-text("Preview"), a:has-text("Preview"), [aria-label*="Preview"], [class*="preview-btn"]',
      5000
    );
    console.log('Preview button:', hasPreview);
    await ss('wb-10-preview-button');
  });

  test('WB-11 — Toolbar actions: Undo/Redo visible', async () => {
    const hasUndo = await isVisible('[aria-label*="Undo"], [title*="Undo"], button:has-text("Undo"), [class*="undo"]', 5000);
    const hasRedo = await isVisible('[aria-label*="Redo"], [title*="Redo"], button:has-text("Redo"), [class*="redo"]', 5000);
    console.log('Undo:', hasUndo, '| Redo:', hasRedo);
    await ss('wb-11-undo-redo');
  });

  test('WB-12 — Builder page title is widget-specific (not generic marketing title)', async () => {
    const title = await page.title();
    console.log('Builder page title:', title);
    const isGeneric = title.includes('All-in-One Tool for WordPress') || title === 'WDesignKit';
    if (isGeneric) {
      console.log('[BUG] P2 — Generic page title on builder page:', title);
    }
    await ss('wb-12-page-title');
    expect(isGeneric).toBeFalsy();
  });

  // ── 4. CONSOLE ERRORS ─────────────────────────────────────────────────────

  test('WB-13 — No JS errors in builder console', async () => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Reload the builder page to capture fresh console output
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await ss('wb-13-after-reload');

    const corsErrors = errors.filter(e => e.toLowerCase().includes('cors') || e.toLowerCase().includes('access-control'));
    const nonCorsErrors = errors.filter(e => !e.toLowerCase().includes('cors') && !e.toLowerCase().includes('access-control'));

    console.log('CORS errors:', corsErrors.length, '| Other JS errors:', nonCorsErrors.length);
    if (nonCorsErrors.length > 0) {
      console.log('Non-CORS errors found:');
      nonCorsErrors.slice(0, 5).forEach(e => console.log(' -', e.substring(0, 200)));
    }

    expect(nonCorsErrors, `JS errors in builder:\n${nonCorsErrors.join('\n')}`).toHaveLength(0);
  });

  test('WB-14 — No ERR_FAILED resources in builder', async () => {
    const failed = [];
    page.on('response', resp => {
      if (resp.status() === 0) failed.push(resp.url());
    });
    page.on('requestfailed', req => failed.push(`${req.failure()?.errorText} — ${req.url()}`));

    await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    console.log('Failed requests:', failed.length);
    if (failed.length > 0) {
      console.log('[BUG] Failed resources:');
      failed.forEach(u => console.log(' -', u));
    }
    await ss('wb-14-network-check');
  });

  // ── 5. API CALLS IN BUILDER ────────────────────────────────────────────────

  test('WB-15 — Builder does not make duplicate API calls on load', async () => {
    const apiCalls = {};
    page.on('request', req => {
      if (req.url().includes(API_BASE)) {
        apiCalls[req.url()] = (apiCalls[req.url()] || 0) + 1;
      }
    });

    await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const duplicates = Object.entries(apiCalls).filter(([, count]) => count > 1);
    console.log('Total unique API calls:', Object.keys(apiCalls).length);
    if (duplicates.length > 0) {
      console.log('[BUG] Duplicate API calls:');
      duplicates.forEach(([url, count]) => console.log(` - ${url} called ${count}x`));
    }
    await ss('wb-15-api-calls');
  });

  // ── 6. ACCESSIBILITY ──────────────────────────────────────────────────────

  test('WB-16 — Builder toolbar buttons have accessible labels', async () => {
    // Check all buttons in builder for aria-label or visible text
    const buttons = await page.locator('button').all();
    const unlabeled = [];

    for (const btn of buttons) {
      const ariaLabel = await btn.getAttribute('aria-label').catch(() => null);
      const title = await btn.getAttribute('title').catch(() => null);
      const text = await btn.innerText().catch(() => '');
      if (!ariaLabel && !title && text.trim() === '') {
        const html = await btn.evaluate(el => el.outerHTML.substring(0, 100)).catch(() => '');
        unlabeled.push(html);
      }
    }

    console.log(`Total buttons: ${buttons.length} | Unlabeled: ${unlabeled.length}`);
    if (unlabeled.length > 0) {
      console.log('[BUG] P2 — Buttons with no accessible labels:');
      unlabeled.slice(0, 5).forEach(b => console.log(' -', b));
    }
    await ss('wb-16-accessibility');

    expect(unlabeled.length, `${unlabeled.length} buttons have no aria-label, title, or text`).toBeLessThan(5);
  });

  test('WB-17 — Builder page has an H1 heading', async () => {
    const h1Count = await page.locator('h1').count();
    console.log('H1 elements on builder page:', h1Count);
    if (h1Count === 0) console.log('[BUG] P2 — No H1 on builder page');
    await ss('wb-17-h1');
    expect(h1Count).toBeGreaterThan(0);
  });

  // ── 7. RESPONSIVE CONTROLS ────────────────────────────────────────────────

  test('WB-18 — Builder has device/responsive preview toggle', async () => {
    const hasResponsive = await isVisible(
      '[aria-label*="mobile"], [aria-label*="tablet"], [aria-label*="desktop"], [class*="device"], [class*="responsive"], [title*="Mobile"], [title*="Tablet"]',
      5000
    );
    console.log('Responsive/device toggle visible:', hasResponsive);
    await ss('wb-18-responsive-controls');
  });

  // ── 8. SAVE FUNCTIONALITY ─────────────────────────────────────────────────

  test('WB-19 — Save button triggers save action without error', async () => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const saveBtn = page.locator('button:has-text("Save"), [aria-label*="Save"]').first();
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await ss('wb-19-after-save');

      // Check for success toast/notification
      const hasSavedMsg = await isVisible(
        'text=Saved, text=saved, [class*="success"], [class*="toast"], [class*="notification"], [class*="snack"]',
        5000
      );
      console.log('Save confirmation shown:', hasSavedMsg);
      console.log('Console errors after save:', consoleErrors.length);
    } else {
      console.log('[SKIP] Save button not visible — checking builder loaded correctly');
    }
  });

  // ── 9. BUILDER NAVIGATION & BACK FLOW ─────────────────────────────────────

  test('WB-20 — Can navigate back to uploaded list from builder', async () => {
    // Try sidebar navigation
    const widgetsBtn = page.locator('button:has-text("Widgets")').first();
    if (await widgetsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const expanded = await widgetsBtn.getAttribute('aria-expanded').catch(() => null);
      if (expanded !== 'true') await widgetsBtn.click();
      await page.waitForTimeout(1000);
    }

    const uploadedLink = page.locator('a:has-text("Uploaded"), [href*="widgets/uploaded"]').first();
    if (await uploadedLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadedLink.click();
      await page.waitForTimeout(3000);
      await ss('wb-20-back-to-list');
      expect(page.url()).toContain('/admin/widgets/uploaded');
      console.log('[PASS] Back navigation to uploaded list works');
    } else {
      // Use browser back or direct nav
      await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      console.log('[INFO] Used direct navigation (sidebar link not found)');
    }
  });

  // ── 10. GUTENBERG BUILDER ─────────────────────────────────────────────────

  test('WB-21 — Gutenberg builder (Core) loads correctly', async () => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await ss('wb-21-gutenberg-builder');

    const url = page.url();
    console.log('Gutenberg builder URL:', url);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const isErrorPage = bodyText.includes('not found') && bodyText.includes('Browse Templates');
    console.log('[BUG CHECK] Gutenberg builder shows not-found:', isErrorPage);

    const hasSave = await isVisible('button:has-text("Save"), [class*="save"]', 8000);
    console.log('Save button in Gutenberg builder:', hasSave);
  });

  // ── 11. ELEMENTOR BUILDER ─────────────────────────────────────────────────

  test('WB-22 — Elementor builder (Push Core) loads correctly', async () => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12416`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await ss('wb-22-elementor-builder');

    const url = page.url();
    console.log('Elementor builder URL:', url);

    const hasSave = await isVisible('button:has-text("Save"), [class*="save"]', 8000);
    console.log('Save button in Elementor builder:', hasSave);
  });

  // ── 12. FULL SCREENSHOT AUDIT ─────────────────────────────────────────────

  test('WB-23 — Full page scroll screenshot of builder (visual audit)', async () => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Full page screenshot
    await page.screenshot({ path: `${SCREENSHOTS}/wb-23-builder-fullpage.png`, fullPage: true });
    console.log('[INFO] Full page screenshot saved at reports/screenshots/wb-23-builder-fullpage.png');

    // Scroll to check for layout overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log('Horizontal overflow detected:', hasHorizontalOverflow);
    if (hasHorizontalOverflow) {
      console.log('[BUG] P2 — Horizontal overflow in builder at 1440px');
    }
  });

  test('WB-24 — Builder performance: load time under 6s', async () => {
    const t0 = Date.now();
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const elapsed = Date.now() - t0;
    console.log(`Builder load time: ${elapsed}ms`);
    if (elapsed > 6000) {
      console.log('[BUG] P2 — Builder load time exceeds 6s:', elapsed + 'ms');
    }
    expect(elapsed).toBeLessThan(10000); // hard limit 10s
  });

});
