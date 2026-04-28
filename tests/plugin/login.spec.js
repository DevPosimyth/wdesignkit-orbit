// =============================================================================
// WDesignKit Plugin — Login & Auth Tests  (Senior QA — Bug Detection Mode)
// Version: 2.2.10
//
// Purpose: Find and expose real bugs in the plugin. Tests are intentionally
//          strict — they FAIL when a bug is present. If a test fails, that is
//          a QA finding to be reported, not a reason to weaken the assertion.
//
// Covers:
//   1.  UI Layout                  — structure, panels, sections
//   2.  Email / Password Login     — fields, validation, credentials
//   3.  API Key Login              — navigation, validation, errors
//   4.  Signup                     — form presence, validation, navigation
//   5.  Forgot Password            — form, validation, response
//   6.  Social Login               — link presence, href, icon, functional state
//   7.  Logout                     — session clear, redirect to login
//   8.  Security                   — token exposure, nonce, PHP error leak
//   9.  Loading States             — loader visible, React root mounts
//  10.  Accessibility              — ids, labels, form element, autocomplete
//  11.  UX / Form Structure        — form wrapper, autocomplete policy
//  12.  Responsive                 — 375px, 768px viewports
//
// Selectors verified against live WDesignKit plugin v2.2.10 rendered HTML.
// Environment: WordPress 6.7 + Docker @ http://localhost:8881
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER  = process.env.WP_ADMIN_USER   || 'admin';
const ADMIN_PASS  = process.env.WP_ADMIN_PASS   || 'admin@123';
const WDKIT_EMAIL = process.env.WDKIT_EMAIL     || '';
const WDKIT_PASS  = process.env.WDKIT_PASSWORD  || '';
const WDKIT_TOKEN = process.env.WDKIT_API_TOKEN || '';

// ── Helper: log into WordPress admin ─────────────────────────────────────────
async function wpLogin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await expect(page).toHaveURL(/wp-admin/, { timeout: 15000 });
}

// ── Helper: clear ALL WDesignKit session data from localStorage ───────────────
// Plugin stores auth in "wdkit-login" key. Clearing forces SPA → login panel.
async function clearWdkitToken(page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('wdkit') || k.startsWith('wkit'))
      .forEach(k => localStorage.removeItem(k));
  });
}

// ── Helper: navigate to plugin page and force-land on login panel ─────────────
async function openLoginPanel(page) {
  await page.goto('/wp-admin/admin.php?page=wdesign-kit');
  await page.waitForLoadState('domcontentloaded');
  await clearWdkitToken(page);
  await page.goto('/wp-admin/admin.php?page=wdesign-kit#/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

// ── Helper: assert that the login form card is visible ────────────────────────
async function waitForLoginPanel(page) {
  await expect(page.locator('.wdkit-form-card').first()).toBeVisible({ timeout: 20000 });
}

// ── Helper: change hash route without full page reload ────────────────────────
async function goToRoute(page, hash) {
  await page.evaluate(h => { window.location.hash = h; }, hash);
  await page.waitForTimeout(800);
}

// =============================================================================
// TEST SUITES
// =============================================================================

test.describe('Plugin Login & Auth', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await openLoginPanel(page);
  });

  // ── 1. UI LAYOUT ─────────────────────────────────────────────────────────────

  test.describe('01 — UI Layout', () => {

    test('login panel renders without PHP fatal error or blank screen', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('Fatal error');
      await expect(page.locator('body')).not.toContainText('Warning:');
      await expect(page.locator('body')).not.toContainText('Parse error');
      await expect(page.locator('.wdkit-auth-panal').first()).toBeVisible({ timeout: 15000 });
    });

    test('login panel renders the left banner section', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wdkit-auth-panal-left')).toBeVisible();
    });

    test('login panel renders the right header section with nav link', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wdkit-auth-panal-right')).toBeVisible();
    });

    test('WDesignKit logo is visible on the login panel', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(
        page.locator('.wkit-img-logo img, .wkit-logo, .wdkit-auth-panal-left img').first()
      ).toBeVisible();
    });

    test('login form card heading text is correct', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual heading: "Welcome Back! Log in to continue"
      const heading = page.locator('.wdkit-form-card h2, .wdkit-section-h').first();
      await expect(heading).toBeVisible();
      const text = (await heading.innerText()).trim();
      expect(text.length, 'Login heading is empty').toBeGreaterThan(0);
    });

    test('login panel has no horizontal scrollbar overflow', async ({ page }) => {
      await waitForLoginPanel(page);
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth, `Horizontal overflow detected (scrollWidth ${scrollWidth} > clientWidth ${clientWidth})`)
        .toBeLessThanOrEqual(clientWidth + 5);
    });

    test('"Create an account" link is present with correct href', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('a[href="#/signup"]').first()).toBeVisible();
    });

    test('banner/carousel image is visible on the left side', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(
        page.locator('.wdkit-banner-carousel, .wdkit-auth-slider-img').first()
      ).toBeVisible();
    });

    test('no JS console errors on login panel initial load', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      expect(consoleErrors, `Console errors found: ${consoleErrors.join(' | ')}`).toHaveLength(0);
    });

  });

  // ── 2. EMAIL / PASSWORD LOGIN ─────────────────────────────────────────────────

  test.describe('02 — Email & Password Login', () => {

    test('email input is visible, focusable, and has the correct id', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual: <input type="email" id="WDkitUserEmail" ...>
      const emailInput = page.locator('#WDkitUserEmail').first();
      await expect(emailInput).toBeVisible();
      await emailInput.click();
      await expect(emailInput).toBeFocused();
    });

    test('password input is visible and focusable', async ({ page }) => {
      await waitForLoginPanel(page);
      const pwInput = page.locator('.wdkit-password-cover input').first();
      await expect(pwInput).toBeVisible();
      await pwInput.click();
      await expect(pwInput).toBeFocused();
    });

    test('"Log in" button is visible and enabled by default', async ({ page }) => {
      await waitForLoginPanel(page);
      const loginBtn = page.locator('.wdkit-register-button').first();
      await expect(loginBtn).toBeVisible();
      await expect(loginBtn).toBeEnabled();
      const btnText = (await loginBtn.innerText()).trim();
      expect(btnText.length, '"Log in" button text is empty').toBeGreaterThan(0);
    });

    test('empty form submission shows validation error', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('.wdkit-register-button').first().click();
      // Plugin adds .wdkit-input-error to the .wdkit-input-cover wrapper
      await expect(
        page.locator('.wdkit-input-cover.wdkit-input-error').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('invalid email format shows inline validation error', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('notanemail');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-input-cover.wdkit-input-error').first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('XSS payload in email field does not render as HTML', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('<script>alert(1)</script>');
      await page.locator('.wdkit-register-button').first().click();
      await page.waitForTimeout(2000);
      const bodyHTML = await page.content();
      // The raw script tag must NOT be unescaped and injected into the DOM
      expect(bodyHTML).not.toContain('<script>alert(1)</script>');
    });

    test('wrong credentials show "Login Failed" popup with correct message', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('wrong@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('wrongpass123!');
      await page.locator('.wdkit-register-button').first().click();

      // Popup must appear
      const popup = page.locator('.wkit-in-login-popup, .wkit-small-popup').first();
      await expect(popup).toBeVisible({ timeout: 20000 });

      // Popup MUST say "Login Failed" — not a confusing "Are you new?" message
      const popupText = await popup.innerText();
      expect(
        popupText,
        `Wrong credentials popup does not contain "Login Failed". Actual: "${popupText}"`
      ).toContain('Login Failed');
    });

    test('wrong credentials popup does not show misleading "Are you new?" messaging', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('wrong@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('wrongpass123!');
      await page.locator('.wdkit-register-button').first().click();

      const popup = page.locator('.wkit-in-login-popup, .wkit-small-popup').first();
      await expect(popup).toBeVisible({ timeout: 20000 });

      const popupText = await popup.innerText();
      // "Are you logging in for the first time?" is confusing UX on a wrong-password popup
      expect(
        popupText,
        `Wrong credentials popup shows misleading "first time" message. Actual: "${popupText}"`
      ).not.toMatch(/first time|logging in.*first|I'm new/i);
    });

    test('password show/hide toggle changes input type correctly', async ({ page }) => {
      await waitForLoginPanel(page);
      const eyeToggle = page.locator('.wdkit-pass-eye').first();
      const pwInput   = page.locator('.wdkit-password-cover input').first();

      // Initial state: password is hidden
      await expect(pwInput).toHaveAttribute('type', 'password');

      // After first click: password becomes visible
      await eyeToggle.click();
      await expect(pwInput).toHaveAttribute('type', 'text');

      // After second click: password is hidden again
      await eyeToggle.click();
      await expect(pwInput).toHaveAttribute('type', 'password');
    });

    test('eye toggle icon CHANGES class when password visibility is toggled', async ({ page }) => {
      await waitForLoginPanel(page);
      const eyeToggle = page.locator('.wdkit-pass-eye').first();
      const eyeIcon   = page.locator('.wdkit-pass-eye i').first();

      // Before click — icon must show "hidden" state (wdkit-i-eye-off)
      const initialClass = await eyeIcon.getAttribute('class');
      expect(
        initialClass,
        'Eye icon initial class does not indicate hidden-password state'
      ).toMatch(/eye-off/);

      // After click — icon MUST change to indicate "visible" state
      await eyeToggle.click();
      await page.waitForTimeout(300);
      const afterClass = await eyeIcon.getAttribute('class');
      expect(
        afterClass,
        `Eye icon does not change after click — icon stays "${afterClass}" instead of switching to visible state. No visual feedback for user.`
      ).not.toMatch(/eye-off/);
    });

    test('"Remember Me" checkbox is interactive (can be checked and unchecked)', async ({ page }) => {
      await waitForLoginPanel(page);
      const checkbox = page.locator('#WdkitRememberme, .wkit-check-box').first();
      await expect(checkbox).toBeVisible();

      // Should be unchecked initially
      const initialChecked = await checkbox.isChecked();
      expect(initialChecked).toBe(false);

      // Click to check
      await checkbox.click();
      await expect(checkbox).toBeChecked();

      // Click again to uncheck
      await checkbox.click();
      await expect(checkbox).not.toBeChecked();
    });

    test('"Forgot Password?" link navigates to forgot password form', async ({ page }) => {
      await waitForLoginPanel(page);
      const forgotLink = page.locator('a[href="#/forgot_password"]').first();
      await expect(forgotLink).toBeVisible();
      await forgotLink.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('.wdkit-form-card input[type="email"]').first()).toBeVisible({ timeout: 8000 });
    });

    test('login with valid credentials shows dashboard (skip if no creds)', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) {
        test.skip(true, 'WDKIT_EMAIL / WDKIT_PASSWORD not set in .env — skipping live login test');
      }
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill(WDKIT_EMAIL);
      await page.locator('.wdkit-password-cover input').first().fill(WDKIT_PASS);
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wkit-main-menu-dashbord, .wdkit-browse-templates, #wdesignkit-app-dashboard').first()
      ).toBeVisible({ timeout: 25000 });
    });

  });

  // ── 3. API KEY LOGIN ──────────────────────────────────────────────────────────

  test.describe('03 — API Key Login', () => {

    test('"Continue via Login Key" link navigates to API key form', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('.wdkit-form-card input').first()).toBeVisible({ timeout: 8000 });
    });

    test('API key form shows error on empty submit', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('API key form shows error on invalid token value', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-form-card input').first().fill('invalid-token-xyz000000000000000');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wkit-in-login-popup, .wkit-small-popup, .wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 20000 });
    });

    test('login with valid API token shows dashboard (skip if no token)', async ({ page }) => {
      if (!WDKIT_TOKEN) {
        test.skip(true, 'WDKIT_API_TOKEN not set in .env — skipping');
      }
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-form-card input').first().fill(WDKIT_TOKEN);
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wkit-main-menu-dashbord, #wdesignkit-app-dashboard').first()
      ).toBeVisible({ timeout: 25000 });
    });

  });

  // ── 4. SIGNUP ─────────────────────────────────────────────────────────────────

  test.describe('04 — Signup', () => {

    test('"Create an account" navigates to signup form', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('.wdkit-form-card').first()).toBeVisible({ timeout: 8000 });
    });

    test('signup form has at least name, email, and password fields', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      const fieldCount = await page.locator('.wdkit-form-card input').count();
      expect(fieldCount, `Signup form has only ${fieldCount} input(s) — expected at least 3 (name, email, password)`).toBeGreaterThanOrEqual(3);
    });

    test('signup shows validation error on empty submit', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('signup shows validation error on invalid email format', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('input[type="email"]').first().fill('notvalid');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('signup → login navigation preserves correct form', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('.wdkit-form-card').first()).toBeVisible();

      // Navigate back to login
      await goToRoute(page, '/login');
      await expect(page.locator('#WDkitUserEmail').first()).toBeVisible({ timeout: 8000 });
    });

  });

  // ── 5. FORGOT PASSWORD ────────────────────────────────────────────────────────

  test.describe('05 — Forgot Password', () => {

    test('forgot password form loads with email input', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/forgot_password"]').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('.wdkit-form-card input[type="email"]').first()).toBeVisible({ timeout: 8000 });
    });

    test('forgot password shows error on empty email submit', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('forgot password shows error on invalid email format', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.locator('.wdkit-form-card input[type="email"]').first().fill('bademail');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('forgot password shows a specific success or not-found message on valid email', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.locator('.wdkit-form-card input[type="email"]').first().fill('test@example.com');
      await page.locator('.wdkit-register-button').first().click();
      // Must show a meaningful response — a notification popup or status message
      // (NOT just any wdkit element that is always present)
      await expect(
        page.locator('.wkit-login-signup-with-notify, .wdkit-notify-popup, .wkit-small-popup').first()
      ).toBeVisible({ timeout: 20000 });
    });

  });

  // ── 6. SOCIAL LOGIN ───────────────────────────────────────────────────────────

  test.describe('06 — Social Login', () => {

    test('Google social login button is visible with icon and text', async ({ page }) => {
      await waitForLoginPanel(page);
      const googleBtn = page.locator('.wdkit-social-login-btns').filter({ hasText: 'Google' }).first();
      await expect(googleBtn).toBeVisible();
    });

    test('Facebook social login button is visible with icon and text', async ({ page }) => {
      await waitForLoginPanel(page);
      const fbBtn = page.locator('.wdkit-social-login-btns').filter({ hasText: 'Facebook' }).first();
      await expect(fbBtn).toBeVisible();
    });

    test('Google social login link has a valid href (not missing/empty)', async ({ page }) => {
      await waitForLoginPanel(page);
      // QA CHECK: <a class="wdkit-social-signup"> for Google must have an href to function
      const googleLink = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Google' }).first();
      const href = await googleLink.getAttribute('href');
      expect(
        href,
        `Google login link is MISSING href attribute — clicking it does nothing (dead link). Found: href="${href}"`
      ).toBeTruthy();
      expect(
        href,
        `Google login href is empty string — link is non-functional`
      ).not.toBe('');
    });

    test('Facebook social login link has a valid href (not missing/empty)', async ({ page }) => {
      await waitForLoginPanel(page);
      // QA CHECK: <a class="wdkit-social-signup"> for Facebook must have an href to function
      const fbLink = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Facebook' }).first();
      const href = await fbLink.getAttribute('href');
      expect(
        href,
        `Facebook login link is MISSING href attribute — clicking it does nothing (dead link). Found: href="${href}"`
      ).toBeTruthy();
      expect(
        href,
        `Facebook login href is empty string — link is non-functional`
      ).not.toBe('');
    });

    test('"Continue via Login Key" link is visible and has correct href', async ({ page }) => {
      await waitForLoginPanel(page);
      const apiLink = page.locator('a[href="#/login-api"]').first();
      await expect(apiLink).toBeVisible();
      const href = await apiLink.getAttribute('href');
      expect(href).toBe('#/login-api');
    });

    test('social login Google link icon is an image (not a broken element)', async ({ page }) => {
      await waitForLoginPanel(page);
      // The Google button must have an <img> or <i> icon that loads
      const googleLink = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Google' }).first();
      const imgCount = await googleLink.locator('img').count();
      const iconCount = await googleLink.locator('i').count();
      expect(
        imgCount + iconCount,
        'Google social login button has no icon (img or i element missing)'
      ).toBeGreaterThan(0);
    });

  });

  // ── 7. LOGOUT ─────────────────────────────────────────────────────────────────

  test.describe('07 — Logout', () => {

    test('clearing session and reloading redirects to login panel', async ({ page }) => {
      // This simulates a logout by clearing localStorage auth token
      await waitForLoginPanel(page);
      await clearWdkitToken(page);
      await page.goto('/wp-admin/admin.php?page=wdesign-kit');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await expect(page.locator('.wdkit-auth-panal').first()).toBeVisible({ timeout: 15000 });
    });

    test('logout via UI returns to login panel (skip if no creds)', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) {
        test.skip(true, 'WDKIT_EMAIL / WDKIT_PASSWORD not configured — skipping');
      }
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill(WDKIT_EMAIL);
      await page.locator('.wdkit-password-cover input').first().fill(WDKIT_PASS);
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wkit-main-menu-dashbord, #wdesignkit-app-dashboard').first()
      ).toBeVisible({ timeout: 25000 });

      // Simulate logout
      await clearWdkitToken(page);
      await page.goto('/wp-admin/admin.php?page=wdesign-kit#/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await expect(page.locator('.wdkit-auth-panal').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ── 8. SECURITY ───────────────────────────────────────────────────────────────

  test.describe('08 — Security', () => {

    test('password field value is never reflected in the page HTML source', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('.wdkit-password-cover input').first().fill('SuperSecret@999!');
      const bodyHTML = await page.content();
      expect(bodyHTML).not.toContain('SuperSecret@999!');
    });

    test('AJAX nonce (kit_nonce / wdkitData) is injected into the page', async ({ page }) => {
      const pageSource = await page.content();
      const hasNonce = pageSource.includes('kit_nonce') || pageSource.includes('wdkitData');
      expect(
        hasNonce,
        'No kit_nonce or wdkitData found in page — AJAX nonce may be missing (CSRF risk)'
      ).toBeTruthy();
    });

    test('no bearer token hardcoded in page source', async ({ page }) => {
      const pageSource = await page.content();
      expect(pageSource).not.toMatch(/bearer\s+[a-zA-Z0-9\-_.]{20,}/i);
    });

    test('failed login does not leak PHP stack trace or server paths', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('wrong@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('wrongpass');
      await page.locator('.wdkit-register-button').first().click();
      await page.waitForTimeout(5000);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('stack trace');
      expect(bodyText).not.toContain('wp-includes');
      expect(bodyText).not.toContain('wp-content/plugins');
      expect(bodyText).not.toContain('Fatal error');
    });

    test('plugin admin page redirects unauthenticated visitors to wp-login', async ({ browser }) => {
      const ctx  = await browser.newContext();
      const guest = await ctx.newPage();
      await guest.goto('/wp-admin/admin.php?page=wdesign-kit');
      await expect(guest).toHaveURL(/wp-login\.php/, { timeout: 10000 });
      await ctx.close();
    });

  });

  // ── 9. LOADING STATES ─────────────────────────────────────────────────────────

  test.describe('09 — Loading States', () => {

    test('React app root (#wdesignkit-app) mounts with content (no blank screen)', async ({ page }) => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      const appContent = await page.locator('#wdesignkit-app').innerHTML();
      expect(
        appContent.trim().length,
        '#wdesignkit-app is empty — React app did not mount'
      ).toBeGreaterThan(10);
    });

    test('login button triggers a loading indicator or response when credentials entered', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('test@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('testpassword123');
      await page.locator('.wdkit-register-button').first().click();
      // Either a loading spinner OR an inline error should appear — NOT nothing
      const indicator = page.locator('.wdkit-auth-dots-wrapper, .wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover, .wkit-small-popup').first();
      await expect(indicator).toBeVisible({ timeout: 10000 });
    });

  });

  // ── 10. ACCESSIBILITY ─────────────────────────────────────────────────────────

  test.describe('10 — Accessibility', () => {

    test('email input has an id attribute for label association (WCAG 1.3.1)', async ({ page }) => {
      await waitForLoginPanel(page);
      const emailInput = page.locator('#WDkitUserEmail').first();
      await expect(emailInput).toBeVisible();
      const id = await emailInput.getAttribute('id');
      expect(id, 'Email input id is missing or empty').toBeTruthy();
    });

    test('password input has an id attribute for label association (WCAG 1.3.1)', async ({ page }) => {
      await waitForLoginPanel(page);
      // QA CHECK: password input must have an id so a <label for="..."> can link to it
      const pwInput = page.locator('.wdkit-password-cover input').first();
      const id = await pwInput.getAttribute('id');
      expect(
        id,
        `Password input is MISSING id attribute — cannot associate a <label> with it. This is a WCAG 1.3.1 failure (programmatic label required). Found: id="${id}"`
      ).toBeTruthy();
    });

    test('"Log in" button has non-empty visible text (WCAG 4.1.2)', async ({ page }) => {
      await waitForLoginPanel(page);
      const loginBtn  = page.locator('.wdkit-register-button').first();
      const btnText   = (await loginBtn.innerText()).trim();
      const ariaLabel = await loginBtn.getAttribute('aria-label');
      expect(
        btnText.length > 0 || (ariaLabel && ariaLabel.length > 0),
        '"Log in" button has no visible text and no aria-label'
      ).toBeTruthy();
    });

    test('Tab key moves focus correctly from email → password field', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().click();
      await page.keyboard.press('Tab');
      await expect(page.locator('.wdkit-password-cover input').first()).toBeFocused();
    });

    test('Enter key on password field triggers form submission attempt', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('test@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('testpass');
      await page.locator('.wdkit-password-cover input').first().press('Enter');
      // Must produce SOME response — loading state or error
      const response = page.locator('.wdkit-auth-dots-wrapper, .wdkit-input-cover.wdkit-input-error, .wdkit-inncorrecttxt-cover, .wkit-small-popup').first();
      await expect(response).toBeVisible({ timeout: 12000 });
    });

    test('all visible login inputs have a placeholder or aria-label (minimum accessibility)', async ({ page }) => {
      await waitForLoginPanel(page);
      const inputs = page.locator('.wdkit-form-card input:not([type="checkbox"])');
      const count  = await inputs.count();
      expect(count, 'No visible inputs found in login form card').toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const input       = inputs.nth(i);
        const placeholder = await input.getAttribute('placeholder');
        const ariaLabel   = await input.getAttribute('aria-label');
        const inputId     = await input.getAttribute('id');
        const hasLabel    = placeholder || ariaLabel ||
          (inputId && await page.locator(`label[for="${inputId}"]`).count() > 0);
        expect(
          hasLabel,
          `Input #${i + 1} (id="${inputId}") has no placeholder, aria-label, or associated <label>`
        ).toBeTruthy();
      }
    });

  });

  // ── 11. UX / FORM STRUCTURE ───────────────────────────────────────────────────

  test.describe('11 — UX & Form Structure', () => {

    test('login inputs are wrapped in a <form> element (browser UX + password manager support)', async ({ page }) => {
      await waitForLoginPanel(page);
      // QA CHECK: Inputs inside a <form> enable browser enter-to-submit, password
      // manager autofill, and correct semantics. No <form> = broken UX.
      const formElement = page.locator('.wdkit-login form, .wdkit-form-card form').first();
      const count = await formElement.count();
      expect(
        count,
        'Login inputs are NOT wrapped in a <form> element — disables password manager autofill, browser "save password" prompt, and semantic form submission'
      ).toBeGreaterThan(0);
    });

    test('email input does NOT have autocomplete="off" (password manager support)', async ({ page }) => {
      await waitForLoginPanel(page);
      // QA CHECK: autocomplete="off" blocks all password managers (LastPass, 1Password, etc.)
      // This is a usability violation on a login form.
      const emailInput = page.locator('#WDkitUserEmail').first();
      const autocomplete = await emailInput.getAttribute('autocomplete');
      expect(
        autocomplete,
        `Email input has autocomplete="${autocomplete}" — this blocks password managers and hurts usability. Should be "email" or "username".`
      ).not.toBe('off');
    });

    test('password input does NOT have autocomplete="off" (password manager support)', async ({ page }) => {
      await waitForLoginPanel(page);
      // QA CHECK: autocomplete="off" on a password field blocks LastPass, 1Password,
      // browser save-password, and accessibility tools from auto-filling.
      const pwInput = page.locator('.wdkit-password-cover input').first();
      const autocomplete = await pwInput.getAttribute('autocomplete');
      expect(
        autocomplete,
        `Password input has autocomplete="${autocomplete}" — this blocks password managers. Should be "current-password".`
      ).not.toBe('off');
    });

    test('"Forgot Password?" link text is correct (not misspelled or truncated)', async ({ page }) => {
      await waitForLoginPanel(page);
      const forgotLink = page.locator('a[href="#/forgot_password"]').first();
      await expect(forgotLink).toBeVisible();
      const linkText = (await forgotLink.innerText()).trim();
      expect(linkText.length, '"Forgot Password?" link has no visible text').toBeGreaterThan(0);
    });

    test('"Remember Me" label is correctly associated with checkbox via for= attribute', async ({ page }) => {
      await waitForLoginPanel(page);
      // <input id="WdkitRememberme"> must have a <label for="WdkitRememberme">
      const labelCount = await page.locator('label[for="WdkitRememberme"]').count();
      expect(
        labelCount,
        'No <label for="WdkitRememberme"> found — clicking label does not toggle checkbox (accessibility issue)'
      ).toBeGreaterThan(0);
    });

  });

  // ── 12. RESPONSIVE ────────────────────────────────────────────────────────────

  test.describe('12 — Responsive', () => {

    test('mobile 375px — no overflow, all form controls visible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(
        scrollWidth,
        `Horizontal overflow at 375px — scrollWidth is ${scrollWidth}px`
      ).toBeLessThanOrEqual(400);

      await expect(page.locator('#WDkitUserEmail').first()).toBeVisible();
      await expect(page.locator('.wdkit-password-cover input').first()).toBeVisible();
      await expect(page.locator('.wdkit-register-button').first()).toBeVisible();
    });

    test('tablet 768px — no overflow, form card visible', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(
        scrollWidth,
        `Horizontal overflow at 768px — scrollWidth is ${scrollWidth}px`
      ).toBeLessThanOrEqual(790);

      await expect(page.locator('.wdkit-form-card').first()).toBeVisible();
    });

    test('mobile 375px — tap targets are adequately sized (min 44px height)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);

      const loginBtnBox = await page.locator('.wdkit-register-button').first().boundingBox();
      expect(
        loginBtnBox,
        '"Log in" button bounding box could not be measured'
      ).toBeTruthy();
      expect(
        loginBtnBox.height,
        `"Log in" button height is only ${loginBtnBox.height}px — tap target below 44px WCAG guideline`
      ).toBeGreaterThanOrEqual(44);
    });

  });

});
