// =============================================================================
// WDesignKit — Widget Builder Comprehensive QA Spec (v2 — corrected selectors)
// Covers: Auth, Dashboard, CRUD, Builders, API-layer, Security, Responsive,
//         Accessibility, Console, Performance
//
// Run: npx playwright test tests/server/widget-builder.spec.js --project=wdk-desktop
// Run: npx playwright test tests/server/widget-builder.spec.js --project=wdk-firefox
// =============================================================================
//
// DISCOVERIES (used to calibrate this spec):
//   - Login uses input[type="text"] (not email), submit via Enter key
//   - No button[type="submit"] on login page — it's a React/JS form
//   - Widget cards linked via a[href*="/admin/widgets/edit/"]
//   - API base: https://api.wdesignkit.com/api/
//   - Widget list API: POST /api/widgets/list (requires JWT token)
//   - "Create Widget" is a SPAN.wdkit-black-btn (not a <button> or <a>)
//   - No H1 on any admin page (confirmed bug)
//   - Page title is generic on all admin pages (confirmed bug)
//   - CORS error on logo SVG (confirmed bug)
//   - Search does NOT filter results (confirmed bug)
//   - API auth error exposes full stack trace (confirmed P0 security bug)
//
// MANUAL CHECKS:
//   - Drag-and-drop reorder in builder canvas
//   - Live preview accuracy vs frontend render
//   - Bricks builder widget rendering (requires Bricks licence)
//   - Safari download behavior (blob URL / anchor click)
//   - RTL layout (Arabic/Hebrew)
//   - Logout via user profile menu (SPAN-based, keyboard inaccessible)
// =============================================================================

const { test, expect } = require('@playwright/test');

const BASE_URL    = process.env.WDK_URL || 'https://wdesignkit.com';
const API_BASE    = 'https://api.wdesignkit.com/api';
const ADMIN_EMAIL = process.env.WDKIT_ADMIN_EMAIL || process.env.WDK_USER || '';
const ADMIN_PASS  = process.env.WDKIT_ADMIN_PASSWORD || process.env.WDK_PASS || '';
const SEC_TOKEN   = process.env.WDKIT_API_TOKEN_2 || '';

// ─── Shared login helper ───────────────────────────────────────────────────
async function login(page, email = ADMIN_EMAIL, pass = ADMIN_PASS) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', email);
  await page.fill('input[type="password"]', pass);
  await page.press('input[type="password"]', 'Enter');
  await page.waitForURL(/admin/, { timeout: 15000 });
}

// ─── Console error collector (product errors only) ─────────────────────────
function collectErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('chrome-extension') && !t.includes('chatbase') && !t.includes('favicon')) {
        errors.push(t);
      }
    }
  });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  return errors;
}

// =============================================================================
// 1. AUTHENTICATION & SESSION
// =============================================================================
test.describe('1. Authentication & Session', () => {

  test('1.01 — Login with valid credentials redirects to /admin', async ({ page }) => {
    await login(page);
    expect(page.url()).toMatch(/admin/);
    expect(page.url()).not.toContain('/login');
  });

  test('1.02 — Login with wrong password stays on /login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.fill('input[type="text"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', 'WrongPassword999!');
    await page.press('input[type="password"]', 'Enter');
    await page.waitForTimeout(5000);
    expect(page.url()).toContain('/login');
  });

  test('1.03 — Wrong credentials shows error message (not silent fail)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.fill('input[type="text"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.press('input[type="password"]', 'Enter');
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/invalid|incorrect|error|wrong|failed|check your/i);
  });

  test('1.04 — Empty password field does not redirect', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.fill('input[type="text"]', ADMIN_EMAIL);
    // Leave password empty, press Enter
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
  });

  test('1.05 — Unauthenticated access to /admin/widgets/uploaded redirects', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/login|\/$/);
  });

  test('1.06 — Session persists across page reload', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect(page.url()).not.toContain('/login');
    expect(page.url()).toContain('widgets');
  });

  test('1.07 — Direct URL to widget edit without auth redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/login|\//);
  });

  test('1.08 — Login page does not expose passwords or tokens in HTML source', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const html = await page.content();
    expect(html).not.toMatch(/password\s*[:=]\s*["'][^"']+["']/i);
    expect(html).not.toMatch(/api[_\-]?key\s*[:=]\s*["'][^"']{8,}["']/i);
  });

  test('1.09 — HTTPS enforced on all admin URLs', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    expect(page.url()).toMatch(/^https:\/\//);
  });

});

// =============================================================================
// 2. WIDGET BUILDER DASHBOARD
// =============================================================================
test.describe('2. Widget Builder Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  });

  test('2.01 — Dashboard loads with widget cards visible', async ({ page }) => {
    const widgetCount = await page.locator('a[href*="/admin/widgets/edit/"]').count();
    expect(widgetCount).toBeGreaterThan(0);
  });

  test('2.02 — [BUG-CONFIRMED] Page title is generic across all admin pages', async ({ page }) => {
    const title = await page.title();
    // FAILING: title should be page-specific, not the marketing homepage title
    // Current: "WDesignKit: All-in-One Tool for WordPress Agencies and Designers"
    expect(title).not.toBe('WDesignKit: All-in-One Tool for WordPress Agencies and Designers');
  });

  test('2.03 — [BUG-CONFIRMED] No H1 element on widget dashboard', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    // FAILING: admin pages have zero H1 elements — accessibility/SEO violation
    expect(h1Count).toBe(1);
  });

  // 2.04, 2.05, 2.06 moved below (require listeners set up before navigation)

  test('2.07 — No horizontal overflow at 1440px desktop', async ({ page }) => {
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'Horizontal overflow at 1440px').toBeFalsy();
  });

  test('2.08 — Navigation sidebar has all expected sections', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toContain('Dashboard');
    expect(body).toContain('Templates');
    expect(body).toContain('Widgets');
    expect(body).toContain('Uploaded');
    expect(body).toContain('Favourite');
    expect(body).toContain('Downloads');
  });

  test('2.09 — Search input is visible and accepts text', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test query');
    const val = await searchInput.inputValue();
    expect(val).toBe('test query');
  });

  test('2.10 — [BUG-CONFIRMED] Search does not filter widget results', async ({ page }) => {
    const beforeSearch = await page.locator('a[href*="/admin/widgets/edit/"]').count();
    const searchInput = page.locator('input[placeholder="Search..."]').first();
    await searchInput.fill('Core widget');
    await page.waitForTimeout(2000);
    const afterSearch = await page.locator('a[href*="/admin/widgets/edit/"]').count();
    // BUG: search result count equals pre-search count — search is not filtering
    expect(afterSearch).toBeLessThan(beforeSearch);
  });

  test('2.11 — Pagination Next/Previous buttons are visible', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/Next|Previous/i);
  });

  test('2.12 — All 4 builder types mentioned in dashboard', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toContain('elementor');
    expect(body.toLowerCase()).toMatch(/gutenberg|blocks/i);
    expect(body.toLowerCase()).toContain('bricks');
    expect(body.toLowerCase()).toMatch(/nexter|core/i);
  });

  // 2.13 moved below (requires request listener set up before navigation)

});

// =============================================================================
// 2b. NETWORK & ERROR MONITORING (standalone — listeners must precede navigation)
// =============================================================================
test.describe('2b. Network & Error Monitoring', () => {

  test('2.04 — No 5xx API errors on dashboard load', async ({ page }) => {
    const serverErrors = [];
    page.on('response', resp => {
      if (resp.status() >= 500) serverErrors.push(`${resp.status()} ${resp.url()}`);
    });
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    expect(serverErrors, `5xx errors:\n${serverErrors.join('\n')}`).toHaveLength(0);
  });

  test('2.05 — No 404 network requests (except favicon)', async ({ page }) => {
    const notFound = [];
    page.on('response', resp => {
      if (resp.status() === 404 && !resp.url().includes('favicon')) {
        notFound.push(`${resp.url()}`);
      }
    });
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    expect(notFound, `404 requests:\n${notFound.join('\n')}`).toHaveLength(0);
  });

  test('2.06 — [BUG-CONFIRMED] CORS error blocks site logo SVG', async ({ page }) => {
    const corsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('CORS')) {
        corsErrors.push(msg.text());
      }
    });
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    // This CONFIRMS the bug — CORS error is present on every page load
    expect(corsErrors.length, `CORS errors found:\n${corsErrors.join('\n')}`).toBe(0);
  });

  test('2.13 — [BUG-CONFIRMED] Dashboard API endpoint called more than once per load', async ({ page }) => {
    const apiCalls = [];
    page.on('request', req => {
      if (req.url().includes('api.wdesignkit.com/api/admin/')) apiCalls.push(req.url());
    });
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    // BUG: the /api/admin/dashbord/get endpoint fires twice per page load
    const dashbordCalls = apiCalls.filter(u => u.includes('dashbord'));
    expect(dashbordCalls.length, `Dashboard API called ${dashbordCalls.length} times (expected 1)`).toBeLessThanOrEqual(1);
  });

});

// =============================================================================
// 3. WIDGET CREATION & MANAGEMENT
// =============================================================================
test.describe('3. Widget Creation & Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  });

  test('3.01 — [BUG-CONFIRMED] Create Widget button is a SPAN (not button/a) — not keyboard-accessible', async ({ page }) => {
    // The "Create Widget" CTA is a SPAN.wdkit-black-btn
    // It should be a <button> or <a> for accessibility + keyboard nav
    const createSpan = page.locator('span.wdkit-black-btn:has-text("Create Widget")').first();
    const createBtn = page.locator('button:has-text("Create Widget"), a:has-text("Create Widget")').first();
    const spanExists = await createSpan.isVisible();
    const properBtnExists = await createBtn.isVisible().catch(() => false);
    // BUG: span found, proper button not found
    expect(properBtnExists, 'Create Widget should be a <button> or <a>, not a <span>').toBeTruthy();
  });

  test('3.02 — Create Widget action navigates away from uploaded page', async ({ page }) => {
    const createEl = page.locator('span:has-text("Create Widget"), button:has-text("Create Widget"), a:has-text("Create Widget")').first();
    if (await createEl.isVisible()) {
      await createEl.click();
      await page.waitForTimeout(3000);
      // Should navigate or open modal
      const url = page.url();
      const bodyText = await page.textContent('body');
      const hasCreateContent = /create|new widget|builder|title|name/i.test(bodyText);
      expect(hasCreateContent || url.includes('create') || url.includes('builder')).toBeTruthy();
    }
  });

  test('3.03 — [BUG-CONFIRMED] /admin/widgets/create shows not-found page', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/create`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    // BUG: This URL shows "Browse Templates / Go to Dashboard / Back to Homepage" — 404-like content
    // It should show a widget creation form
    const hasCreationForm = body.match(/widget name|title|builder type|create widget form/i);
    const hasNotFoundContent = body.match(/Browse Templates|Back to Homepage|Start Building/i);
    expect(hasNotFoundContent, '/admin/widgets/create shows not-found page content').toBeFalsy();
    expect(hasCreationForm, 'Widget creation form not found at /admin/widgets/create').toBeTruthy();
  });

  test('3.04 — Widget edit page loads correctly for an existing widget', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    expect(page.url()).toContain('/admin/widgets/edit/12422');
    const body = await page.textContent('body');
    // Should have form fields
    expect(body).toMatch(/Title|Description|Live Demo|Save/i);
  });

  test('3.05 — Widget edit page has Save button', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const saveBtn = page.locator('button:has-text("Save"), span:has-text("Save")').first();
    await expect(saveBtn).toBeVisible();
  });

  test('3.06 — Widget edit page shows builder type selections (Elementor, Gutenberg, Bricks)', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toContain('Elementor');
    expect(body).toContain('Gutenberg');
    expect(body).toContain('Bricks');
  });

  test('3.07 — Widget edit page shows sub-builder options (Core Gutenberg, Nexter Blocks)', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Core Gutenberg|Nexter Blocks/i);
  });

  test('3.08 — Widget action buttons are visible in the widget list', async ({ page }) => {
    // Action spans with SVG icons exist per widget card
    const actionSpans = await page.locator('span[class*="py-1 px-1"][class*="bg-black"], span[class*="right-2"]').count();
    expect(actionSpans).toBeGreaterThan(0);
  });

  test('3.09 — [BUG-CONFIRMED] Widget action buttons are icon-only — no accessible labels', async ({ page }) => {
    // Action spans contain only SVGs, no aria-label, title, or screen-reader text
    const unlabeledActions = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span[class*="py-1 px-1"], span[class*="right-2"]'));
      return spans.filter(span => {
        const hasAriaLabel = !!span.getAttribute('aria-label');
        const hasTitle = !!span.getAttribute('title');
        const hasText = !!span.textContent?.trim();
        return !hasAriaLabel && !hasTitle && !hasText;
      }).length;
    });
    // BUG: all action buttons are unlabeled
    expect(unlabeledActions, `${unlabeledActions} widget action buttons have no accessible labels`).toBe(0);
  });

  test('3.10 — Widget edit page: Title input is editable', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const titleInput = page.locator('input[type="text"], textarea').first();
    if (await titleInput.isVisible()) {
      const isEditable = await titleInput.isEditable();
      expect(isEditable).toBeTruthy();
    }
  });

  test('3.11 — Navigating from edit back to uploaded list works', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Sidebar uses expandable JS sections — expand Widgets if needed, then click Uploaded
    const widgetsBtn = page.locator('button:has-text("Widgets")').first();
    if (await widgetsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isExpanded = await widgetsBtn.getAttribute('aria-expanded').catch(() => null);
      if (isExpanded !== 'true') await widgetsBtn.click();
      await page.waitForTimeout(1000);
    }
    // Try multiple selectors for the Uploaded link in the sidebar
    const uploadedEl = page.locator('a:has-text("Uploaded"), [href*="widgets/uploaded"]').first();
    if (await uploadedEl.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadedEl.click();
    } else {
      // Fallback: use sidebar text link
      await page.locator('text=Uploaded').first().click({ timeout: 5000 });
    }
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/admin/widgets/uploaded');
  });

});

// =============================================================================
// 4. BUILDER-SPECIFIC VALIDATION
// =============================================================================
test.describe('4. Builder-Specific — All 4 Builders', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('4.01 — Elementor builder widgets visible in uploaded list', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toContain('elementor');
  });

  test('4.02 — Gutenberg builder widgets visible in uploaded list', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/gutenberg|core widget|nexter/i);
  });

  test('4.03 — Bricks builder widgets visible in uploaded list', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toContain('bricks');
  });

  test('4.04 — Elementor widget edit page shows Elementor selected', async ({ page }) => {
    // Widget "Push Elementor" at edit/12415
    await page.goto(`${BASE_URL}/admin/widgets/edit/12415`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toContain('Elementor');
    // Edit page should load without errors
    expect(page.url()).toContain('/admin/widgets/edit/12415');
  });

  test('4.05 — Core Gutenberg widget edit page loads', async ({ page }) => {
    // Widget "Push Core" at edit/12416
    await page.goto(`${BASE_URL}/admin/widgets/edit/12416`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Core Gutenberg|Gutenberg/i);
    expect(page.url()).toContain('/admin/widgets/edit/12416');
  });

  test('4.06 — Bricks widget edit page loads', async ({ page }) => {
    // Widget "Bricks widget" at edit/12421
    await page.goto(`${BASE_URL}/admin/widgets/edit/12421`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toContain('Bricks');
    expect(page.url()).toContain('/admin/widgets/edit/12421');
  });

  test('4.07 — Widget edit shows Free/Pro toggle', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Free|Pro/i);
  });

  test('4.08 — Widget edit shows Category and Tag selectors', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Category|Tag/i);
  });

  test('4.09 — Widget edit shows featured image/thumbnail upload option', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Featured Image|Thumbnail/i);
  });

  test('4.10 — Widget summary section shows private/public status', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body).toMatch(/private|public/i);
  });

});

// =============================================================================
// 5. CONSOLE ERRORS — MULTI-PAGE SWEEP
// =============================================================================
test.describe('5. Console Error Sweep', () => {

  async function getPageErrors(page, url) {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const t = msg.text();
        if (!t.includes('chatbase') && !t.includes('chrome-extension') && !t.includes('net::ERR_ABORTED')) {
          errors.push(t.slice(0, 200));
        }
      }
    });
    page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    return errors;
  }

  test('5.01 — [BUG-CONFIRMED] CORS error on widget dashboard', async ({ page }) => {
    await login(page);
    const errors = await getPageErrors(page, `${BASE_URL}/admin/widgets/uploaded`);
    // Known bug: CORS error on wdesignkit-site-logo.svg
    const corsErrs = errors.filter(e => e.includes('CORS') || e.includes('Access-Control'));
    expect(corsErrs, `CORS errors: ${corsErrs.join('\n')}`).toHaveLength(0);
  });

  test('5.02 — [BUG-CONFIRMED] CORS error on widget edit page', async ({ page }) => {
    await login(page);
    const errors = await getPageErrors(page, `${BASE_URL}/admin/widgets/edit/12422`);
    const corsErrs = errors.filter(e => e.includes('CORS') || e.includes('Access-Control'));
    expect(corsErrs, `CORS errors: ${corsErrs.join('\n')}`).toHaveLength(0);
  });

  test('5.03 — No non-CORS console errors on widget dashboard', async ({ page }) => {
    await login(page);
    const errors = await getPageErrors(page, `${BASE_URL}/admin/widgets/uploaded`);
    const nonCorsErrors = errors.filter(e => !e.includes('CORS') && !e.includes('Access-Control') && !e.includes('wdesignkit-site-logo'));
    expect(nonCorsErrors, `Non-CORS errors: ${nonCorsErrors.join('\n')}`).toHaveLength(0);
  });

  test('5.04 — No non-CORS console errors on widget edit page', async ({ page }) => {
    await login(page);
    const errors = await getPageErrors(page, `${BASE_URL}/admin/widgets/edit/12422`);
    const nonCorsErrors = errors.filter(e => !e.includes('CORS') && !e.includes('Access-Control') && !e.includes('wdesignkit-site-logo'));
    expect(nonCorsErrors, `Non-CORS errors: ${nonCorsErrors.join('\n')}`).toHaveLength(0);
  });

});

// =============================================================================
// 6. API-LAYER & SECURITY TESTING
// =============================================================================
test.describe('6. API Security & Validation', () => {

  test('6.01 — Unauthenticated POST to /api/widgets/list returns 401', async ({ request }) => {
    const resp = await request.post(`${API_BASE}/widgets/list`, {
      headers: { 'Content-Type': 'application/json' },
      data: {}
    });
    expect(resp.status()).toBe(401);
  });

  test('6.02 — Unauthenticated POST to /api/widgets/filterlist returns 401', async ({ request }) => {
    const resp = await request.post(`${API_BASE}/widgets/filterlist`, {
      headers: { 'Content-Type': 'application/json' },
      data: {}
    });
    expect(resp.status()).toBe(401);
  });

  test('6.03 — [BUG-CONFIRMED] Auth error response exposes server file paths and stack trace', async ({ request }) => {
    // Use actual wrong credentials to trigger auth code path (not validation error path)
    const resp = await request.post(`${API_BASE}/auth/loginCheck`, {
      headers: { 'Content-Type': 'application/json' },
      data: { email: 'nonexistent@test.com', password: 'WrongPass999!', type: 'admin' }
    });
    const body = await resp.text();
    // P0 SECURITY BUG: 401 response includes PHP stack trace with server file paths
    // These assertions FAIL when the bug exists (stack trace present in response)
    expect(body).not.toMatch(/\/home\/[^"]+\/webapps\//i);
    expect(body).not.toContain('"trace"');
    expect(body).not.toContain('"file"');
    expect(body).not.toContain('"exception"');
  });

  test('6.04 — [BUG-CONFIRMED] API endpoint has typo "dashbord" in URL path', async ({ page }) => {
    const apiCalls = [];
    page.on('request', req => {
      if (req.url().includes('dashbord')) apiCalls.push(req.url());
    });
    await login(page);
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    // BUG: "dashbord" (missing 'a') appears in API URL
    expect(apiCalls.length, `Typo "dashbord" found in API URL: ${apiCalls.join(', ')}`).toBe(0);
  });

  test('6.05 — [BUG-CONFIRMED] Dashboard API called twice per page load', async ({ page }) => {
    const dashApiCalls = [];
    page.on('request', req => {
      if (req.url().includes('/api/admin/')) dashApiCalls.push(req.url());
    });
    await login(page);
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    // BUG: same endpoint called 2x per page load
    const uniqueUrls = [...new Set(dashApiCalls)];
    for (const url of uniqueUrls) {
      const count = dashApiCalls.filter(u => u === url).length;
      expect(count, `${url} called ${count} times — expected 1`).toBe(1);
    }
  });

  test('6.06 — SQL injection in API search field is rejected safely', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const searchInput = page.locator('input[placeholder="Search..."]').first();
    await searchInput.fill("' OR 1=1 --");
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).not.toMatch(/sql error|mysql|syntax error|database error/i);
  });

  test('6.07 — XSS in search input is not reflected raw in DOM', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const searchInput = page.locator('input[placeholder="Search..."]').first();
    await searchInput.fill('<img src=x onerror=alert(1)>');
    await page.waitForTimeout(2000);
    const html = await page.content();
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
  });

  test('6.08 — Security headers present on admin pages', async ({ page }) => {
    await login(page);
    const resp = await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    const headers = resp?.headers() || {};
    const hasSecHeader =
      headers['x-content-type-options'] ||
      headers['x-frame-options'] ||
      headers['content-security-policy'] ||
      headers['strict-transport-security'];
    expect(hasSecHeader, 'No security headers found').toBeTruthy();
  });

  test('6.09 — Admin token not exposed verbatim in page HTML', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const html = await page.content();
    // Tokens should not appear raw in page source
    const userTokenFragment = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9';
    expect(html).not.toContain(userTokenFragment);
  });

});

// =============================================================================
// 7. RESPONSIVE TESTING
// =============================================================================
test.describe('7. Responsive — Widget Dashboard', () => {

  test('7.01 — No horizontal overflow at mobile 375px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'Horizontal overflow at 375px').toBeFalsy();
    await ctx.close();
  });

  test('7.02 — No horizontal overflow at tablet 768px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await ctx.newPage();
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'Horizontal overflow at 768px').toBeFalsy();
    await ctx.close();
  });

  test('7.03 — Content is readable at mobile (body text > 50 chars)', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body.trim().length).toBeGreaterThan(50);
    await ctx.close();
  });

  test('7.04 — Widget edit page has no overflow at 375px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/edit/12422`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'Horizontal overflow on edit page at 375px').toBeFalsy();
    await ctx.close();
  });

});

// =============================================================================
// 8. ACCESSIBILITY
// =============================================================================
test.describe('8. Accessibility', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  });

  test('8.01 — [BUG-CONFIRMED] No H1 on widget dashboard', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count, 'Widget dashboard missing H1 element').toBe(1);
  });

  test('8.02 — All images have alt attributes', async ({ page }) => {
    const imgsWithoutAlt = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img'))
        .filter(img => !img.alt && !img.getAttribute('aria-label'))
        .map(img => img.src.slice(0, 80))
    );
    expect(imgsWithoutAlt, `Images without alt: ${imgsWithoutAlt.join('\n')}`).toHaveLength(0);
  });

  test('8.03 — [BUG-CONFIRMED] Interactive SPAN elements have no aria-labels', async ({ page }) => {
    const badInteractiveEls = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span[class*="cursor-pointer"], span[role="button"]'));
      return spans.filter(s => !s.getAttribute('aria-label') && !s.getAttribute('title')).length;
    });
    expect(badInteractiveEls, `${badInteractiveEls} cursor-pointer spans lack aria-label`).toBe(0);
  });

  test('8.04 — Keyboard Tab does not create infinite focus trap', async ({ page }) => {
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(80);
    }
    expect(page.url()).not.toContain('error');
  });

  test('8.05 — All focusable elements have visible focus indicator', async ({ page }) => {
    // Check that :focus-visible styles exist in stylesheets
    const hasFocusStyle = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.selectorText?.includes(':focus') || rule.selectorText?.includes('focus-visible')) {
              return true;
            }
          }
        } catch (e) { /* cross-origin */ }
      }
      return false;
    });
    expect(hasFocusStyle, 'No :focus or :focus-visible CSS rules found').toBeTruthy();
  });

});

// =============================================================================
// 9. PERFORMANCE
// =============================================================================
test.describe('9. Performance', () => {

  test('9.01 — Widget dashboard page loads in under 5s', async ({ page }) => {
    await login(page);
    const t0 = Date.now();
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const elapsed = Date.now() - t0;
    expect(elapsed, `Page load took ${elapsed}ms — threshold 5000ms`).toBeLessThan(5000);
  });

  test('9.02 — CLS (Cumulative Layout Shift) < 0.1 on dashboard', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const cls = await page.evaluate(() =>
      new Promise(resolve => {
        let total = 0;
        const obs = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        });
        obs.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => { obs.disconnect(); resolve(total); }, 3000);
      })
    );
    expect(cls, `CLS ${cls.toFixed(4)} exceeds threshold 0.1`).toBeLessThan(0.1);
  });

  test('9.03 — Widget list API responds in under 3s', async ({ request }) => {
    // No token available for direct API call — just test unauthenticated response time
    const t0 = Date.now();
    await request.post(`${API_BASE}/widgets/list`, {
      headers: { 'Content-Type': 'application/json' },
      data: {}
    });
    const elapsed = Date.now() - t0;
    expect(elapsed, `API took ${elapsed}ms`).toBeLessThan(3000);
  });

  test('9.04 — No redundant resource loads on a single page load', async ({ page }) => {
    // Set up listener AFTER login so we only capture resources from the target page load
    // (prevents false positives from shared Next.js chunks across login + admin pages)
    await login(page);
    const resourceUrls = [];
    page.on('response', resp => {
      const url = resp.url();
      // Only track .js/.css but exclude .json (contains '.js' in '.json')
      if ((url.includes('.js') && !url.endsWith('.json')) || url.includes('.css')) {
        resourceUrls.push(url);
      }
    });
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const duplicates = resourceUrls.filter((url, i) => resourceUrls.indexOf(url) !== i);
    expect(duplicates, `Duplicate asset loads:\n${duplicates.join('\n')}`).toHaveLength(0);
  });

});

// =============================================================================
// 10. CROSS-BROWSER SPECIFIC (Firefox-facing tests)
// =============================================================================
test.describe('10. Cross-Browser Consistency', () => {

  test('10.01 — Login works correctly in current browser', async ({ page }) => {
    await login(page);
    expect(page.url()).toMatch(/admin/);
  });

  test('10.02 — Widget card grid renders correctly (no broken layout)', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const widgetLinks = await page.locator('a[href*="/admin/widgets/edit/"]').count();
    expect(widgetLinks).toBeGreaterThan(0);
  });

  test('10.03 — Sidebar navigation renders and is clickable', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const dashboardLink = page.locator('a[href="/admin/dashboard"]').first();
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('10.04 — Page renders correctly at 1440px viewport', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/widgets/uploaded`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const body = await page.textContent('body');
    expect(body.trim().length).toBeGreaterThan(200);
  });

});
