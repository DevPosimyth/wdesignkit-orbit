// =============================================================================
// WDesignKit Plugin — Login & Auth Tests  (Senior QA — Bug Detection Mode)
// Version: 2.2.10
//
// PURPOSE: Detect real bugs. Tests use selectors verified against live plugin
//          v2.2.10 DOM. A failing test = a real QA finding to report.
//
// Verified DOM facts (from live inspection):
//   • Validation error: class "wdkit-input-error" added to the INPUT element
//     and the .wdkit-password-cover wrapper — NOT to .wdkit-input-cover
//   • Wrong credentials: .wkit-in-login-popup-content.wkit-small-popup (visible)
//   • Forgot password input wrapper: .wkit-forgot-pass-input
//   • After session clear: app shows dashboard (#/browse) — WP auth ≠ WDKit cloud auth
//
// Environment: WordPress 6.7 + Docker @ http://localhost:8881
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER  = process.env.WP_ADMIN_USER   || 'admin';
const ADMIN_PASS  = process.env.WP_ADMIN_PASS   || 'admin@123';
const WDKIT_EMAIL = process.env.WDKIT_EMAIL     || '';
const WDKIT_PASS  = process.env.WDKIT_PASSWORD  || '';
const WDKIT_TOKEN = process.env.WDKIT_API_TOKEN || '';

// ── Helper: WordPress admin login ────────────────────────────────────────────
async function wpLogin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await expect(page).toHaveURL(/wp-admin/, { timeout: 15000 });
}

// ── Helper: clear WDesignKit cloud session from localStorage ─────────────────
async function clearWdkitToken(page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('wdkit') || k.startsWith('wkit'))
      .forEach(k => localStorage.removeItem(k));
  });
}

// ── Helper: open plugin page and force login panel via hash route ─────────────
async function openLoginPanel(page) {
  await page.goto('/wp-admin/admin.php?page=wdesign-kit');
  await page.waitForLoadState('domcontentloaded');
  await clearWdkitToken(page);
  await page.goto('/wp-admin/admin.php?page=wdesign-kit#/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

// ── Helper: wait for the login form card ─────────────────────────────────────
async function waitForLoginPanel(page) {
  await expect(page.locator('.wdkit-form-card').first()).toBeVisible({ timeout: 20000 });
}

// ── Helper: change hash route without page reload ─────────────────────────────
async function goToRoute(page, hash) {
  await page.evaluate(h => { window.location.hash = h; }, hash);
  await page.waitForTimeout(800);
}

// =============================================================================
test.describe('Plugin Login & Auth', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await openLoginPanel(page);
  });

  // ── 1. UI LAYOUT ─────────────────────────────────────────────────────────────

  test.describe('01 — UI Layout', () => {

    test('login panel renders without PHP error or blank screen', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('Fatal error');
      await expect(page.locator('body')).not.toContainText('Warning:');
      await expect(page.locator('body')).not.toContainText('Parse error');
      await expect(page.locator('.wdkit-auth-panal').first()).toBeVisible({ timeout: 15000 });
    });

    test('login panel left banner section is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wdkit-auth-panal-left')).toBeVisible();
    });

    test('login panel right header section is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wdkit-auth-panal-right')).toBeVisible();
    });

    test('WDesignKit logo is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wkit-img-logo img, .wkit-logo').first()).toBeVisible();
    });

    test('login form heading is present and non-empty', async ({ page }) => {
      await waitForLoginPanel(page);
      const heading = page.locator('.wdkit-form-card h2, .wdkit-section-h').first();
      await expect(heading).toBeVisible();
      const text = (await heading.innerText()).trim();
      expect(text.length, 'Login heading is empty').toBeGreaterThan(0);
    });

    test('no horizontal scroll overflow on login panel', async ({ page }) => {
      await waitForLoginPanel(page);
      const scrollW = await page.evaluate(() => document.body.scrollWidth);
      const clientW = await page.evaluate(() => document.body.clientWidth);
      expect(scrollW, `Overflow: scrollWidth ${scrollW} > clientWidth ${clientW}`).toBeLessThanOrEqual(clientW + 5);
    });

    test('"Create an account" link is present with correct href', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('a[href="#/signup"]').first()).toBeVisible();
    });

    test('banner carousel image is visible on left side', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(
        page.locator('.wdkit-banner-carousel, .wdkit-auth-slider-img').first()
      ).toBeVisible();
    });

    test('no JS console errors on login panel load', async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      expect(errors, `Console errors: ${errors.join(' | ')}`).toHaveLength(0);
    });

  });

  // ── 2. EMAIL / PASSWORD LOGIN ─────────────────────────────────────────────────

  test.describe('02 — Email & Password Login', () => {

    test('email input is visible and has correct id (WDkitUserEmail)', async ({ page }) => {
      await waitForLoginPanel(page);
      const email = page.locator('#WDkitUserEmail').first();
      await expect(email).toBeVisible();
      await email.click();
      await expect(email).toBeFocused();
    });

    test('password input is visible and focusable', async ({ page }) => {
      await waitForLoginPanel(page);
      const pw = page.locator('.wdkit-password-cover input').first();
      await expect(pw).toBeVisible();
      await pw.click();
      await expect(pw).toBeFocused();
    });

    test('"Log in" button is visible, enabled, and has text', async ({ page }) => {
      await waitForLoginPanel(page);
      const btn = page.locator('.wdkit-register-button').first();
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
      const text = (await btn.innerText()).trim();
      expect(text.length, 'Button text is empty').toBeGreaterThan(0);
    });

    test('empty form submission shows inline validation error on input', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('.wdkit-register-button').first().click();
      // Plugin adds wdkit-input-error class to the INPUT element itself (verified from live DOM)
      await expect(
        page.locator('input.wdkit-input-error, .wdkit-entry-input.wdkit-input-error, .wdkit-password-cover.wdkit-input-error').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('invalid email format shows inline validation error', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('notanemail');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('input.wdkit-input-error, .wdkit-entry-input.wdkit-input-error').first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('XSS payload in email field is not rendered as HTML', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('<script>alert(1)</script>');
      await page.locator('.wdkit-register-button').first().click();
      await page.waitForTimeout(2000);
      expect(await page.content()).not.toContain('<script>alert(1)</script>');
    });

    test('wrong credentials shows "Login Failed" popup', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('wrong@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('wrongpass123!');
      await page.locator('.wdkit-register-button').first().click();
      // Visible element is .wkit-in-login-popup-content.wkit-small-popup (verified live)
      const popup = page.locator('.wkit-in-login-popup-content.wkit-small-popup').first();
      await expect(popup).toBeVisible({ timeout: 20000 });
      const heading = await popup.locator('.wkit-lg-popup-heading').first().innerText();
      expect(heading.trim()).toContain('Login Failed');
    });

    test('wrong credentials popup shows misleading "Are you new?" message — UX bug', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('wrong@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('wrongpass123!');
      await page.locator('.wdkit-register-button').first().click();
      const popup = page.locator('.wkit-in-login-popup-content.wkit-small-popup').first();
      await expect(popup).toBeVisible({ timeout: 20000 });
      // Highlight the misleading text inside the popup, screenshot just the popup
      await page.evaluate(() => {
        const el = document.querySelector('.wkit-lg-popup-text');
        if (el) {
          el.style.outline = '3px solid red';
          el.style.outlineOffset = '3px';
          el.style.borderRadius = '3px';
          el.style.backgroundColor = 'rgba(255,0,0,0.08)';
        }
      });
      await popup.screenshot({
        path: 'reports/bugs/screenshots/login/bug-wrong-credentials-misleading-popup.png'
      });
      await page.evaluate(() => {
        const el = document.querySelector('.wkit-lg-popup-text');
        if (el) { el.style.outline = ''; el.style.backgroundColor = ''; }
      });
      const popupText = await popup.innerText();
      // This FAILS intentionally — "Are you new?" is a confirmed UX bug for returning users
      expect(
        popupText,
        `Popup shows misleading first-time message for wrong password. Actual: "${popupText}"`
      ).not.toMatch(/first time|logging in.*first|I'm new/i);
    });

    test('password show/hide toggle changes input type', async ({ page }) => {
      await waitForLoginPanel(page);
      const eye   = page.locator('.wdkit-pass-eye').first();
      const input = page.locator('.wdkit-password-cover input').first();
      await expect(input).toHaveAttribute('type', 'password');
      await eye.click();
      await expect(input).toHaveAttribute('type', 'text');
      await eye.click();
      await expect(input).toHaveAttribute('type', 'password');
    });

    test('"Remember Me" checkbox is interactive', async ({ page }) => {
      await waitForLoginPanel(page);
      const checkbox = page.locator('#WdkitRememberme, .wkit-check-box').first();
      await expect(checkbox).toBeVisible();
      expect(await checkbox.isChecked()).toBe(false);
      await checkbox.click();
      await expect(checkbox).toBeChecked();
      await checkbox.click();
      await expect(checkbox).not.toBeChecked();
    });

    test('"Forgot Password?" link navigates to reset form', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/forgot_password"]').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('.wdkit-fgt-pass, .wdkit-form-card').first()).toBeVisible({ timeout: 8000 });
    });

    test('login with valid credentials shows dashboard (skip if no creds)', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) test.skip(true, 'WDKIT_EMAIL/PASSWORD not set');
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill(WDKIT_EMAIL);
      await page.locator('.wdkit-password-cover input').first().fill(WDKIT_PASS);
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wkit-main-menu-dashbord, #wdesignkit-app-dashboard').first()
      ).toBeVisible({ timeout: 25000 });
    });

  });

  // ── 3. API KEY LOGIN ──────────────────────────────────────────────────────────

  test.describe('03 — API Key Login', () => {

    test('"Continue via Login Key" navigates to API key form', async ({ page }) => {
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
        page.locator('input.wdkit-input-error, .wdkit-entry-input.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('API key form shows error on invalid token', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-form-card input').first().fill('invalid-token-xyz000000000000000');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wkit-in-login-popup-content.wkit-small-popup, input.wdkit-input-error').first()
      ).toBeVisible({ timeout: 20000 });
    });

    test('login with valid API token shows dashboard (skip if no token)', async ({ page }) => {
      if (!WDKIT_TOKEN) test.skip(true, 'WDKIT_API_TOKEN not set');
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-form-card input').first().fill(WDKIT_TOKEN);
      await page.locator('.wdkit-register-button').first().click();
      await expect(page.locator('.wkit-main-menu-dashbord').first()).toBeVisible({ timeout: 25000 });
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

    test('signup form has at least 3 input fields', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      const count = await page.locator('.wdkit-form-card input').count();
      expect(count, `Only ${count} input(s) found — expected ≥ 3`).toBeGreaterThanOrEqual(3);
    });

    test('signup shows validation error on empty submit', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('input.wdkit-input-error, .wdkit-entry-input.wdkit-input-error').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('signup shows validation error on invalid email format', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('input[type="email"]').first().fill('notvalid');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('input.wdkit-input-error, .wdkit-entry-input.wdkit-input-error').first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('signup → back to login navigation works', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
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
      // Verified live: form uses .wdkit-fgt-pass wrapper, input inside .wkit-forgot-pass-input
      await expect(page.locator('.wdkit-fgt-pass').first()).toBeVisible({ timeout: 8000 });
      await expect(page.locator('.wkit-forgot-pass-input input').first()).toBeVisible();
    });

    test('forgot password shows validation error on empty email submit', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.waitForSelector('.wkit-forgot-pass-input input', { timeout: 8000 });
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('input.wdkit-input-error, .wdkit-entry-input.wdkit-input-error').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('forgot password shows validation error on invalid email format', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.waitForSelector('.wkit-forgot-pass-input input', { timeout: 8000 });
      await page.locator('.wkit-forgot-pass-input input').first().fill('bademail');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('input.wdkit-input-error, .wdkit-entry-input.wdkit-input-error').first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('forgot password shows a response notification after valid email submit', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.waitForSelector('.wkit-forgot-pass-input input', { timeout: 8000 });
      await page.locator('.wkit-forgot-pass-input input').first().fill('test@example.com');
      await page.locator('.wdkit-register-button').first().click();
      await page.waitForTimeout(5000);
      // Highlight the area below the submit button where a toast should appear, screenshot the form
      await page.evaluate(() => {
        const btn = document.querySelector('.wdkit-fgt-pass .wdkit-register-button');
        if (btn) {
          btn.style.outline = '3px solid red';
          btn.style.outlineOffset = '3px';
        }
        // Also add a red dashed placeholder where the missing toast should be
        const card = document.querySelector('.wdkit-form-card');
        if (card) {
          const marker = document.createElement('div');
          marker.id = 'qa-missing-toast-marker';
          marker.style.cssText = 'border:2px dashed red;padding:8px;margin-top:8px;color:red;font-size:12px;border-radius:4px;text-align:center;';
          marker.innerText = '⚠ No toast/notification shown here after submit';
          card.appendChild(marker);
        }
      });
      await page.locator('.wdkit-fgt-pass').first().screenshot({
        path: 'reports/bugs/screenshots/login/bug-forgot-password-no-feedback.png'
      });
      await page.evaluate(() => {
        const btn = document.querySelector('.wdkit-fgt-pass .wdkit-register-button');
        if (btn) btn.style.outline = '';
        const marker = document.getElementById('qa-missing-toast-marker');
        if (marker) marker.remove();
      });
      // Must show a toast / notification — confirmed absent in live testing (BUG)
      await expect(
        page.locator('.wkit-login-signup-with-notify, .wdkit-notify-popup, .wkit-small-popup, .wkit-in-login-popup-content').first()
      ).toBeVisible({ timeout: 15000 });
    });

  });

  // ── 6. SOCIAL LOGIN ───────────────────────────────────────────────────────────

  test.describe('06 — Social Login', () => {

    test('"Continue with Google" button is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(
        page.locator('.wdkit-social-login-btns').filter({ hasText: 'Google' }).first()
      ).toBeVisible();
    });

    test('"Continue with Facebook" button is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(
        page.locator('.wdkit-social-login-btns').filter({ hasText: 'Facebook' }).first()
      ).toBeVisible();
    });

    test('Google social login link has a valid href — not missing', async ({ page }) => {
      await waitForLoginPanel(page);
      const link = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Google' }).first();
      const href = await link.getAttribute('href');
      // Highlight the Google button in red, screenshot just that element
      await page.evaluate(() => {
        const el = document.querySelector('.wdkit-social-login-btns a:first-child, .wdkit-social-login-btns a');
        if (el) {
          el.style.outline = '3px solid red';
          el.style.outlineOffset = '3px';
          el.style.borderRadius = '4px';
        }
      });
      await link.screenshot({ path: 'reports/bugs/screenshots/login/bug-google-no-href.png' });
      await page.evaluate(() => {
        const el = document.querySelector('.wdkit-social-login-btns a:first-child, .wdkit-social-login-btns a');
        if (el) el.style.outline = '';
      });
      expect(
        href,
        `Google login <a> has no href (href="${href}") — button is a dead link, clicking does nothing`
      ).toBeTruthy();
      expect(href).not.toBe('');
    });

    test('Facebook social login link has a valid href — not missing', async ({ page }) => {
      await waitForLoginPanel(page);
      const link = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Facebook' }).first();
      const href = await link.getAttribute('href');
      // Highlight the Facebook button in red, screenshot just that element
      await page.evaluate(() => {
        const els = document.querySelectorAll('.wdkit-social-login-btns a');
        const fb = Array.from(els).find(e => e.innerText.includes('Facebook'));
        if (fb) {
          fb.style.outline = '3px solid red';
          fb.style.outlineOffset = '3px';
          fb.style.borderRadius = '4px';
        }
      });
      await link.screenshot({ path: 'reports/bugs/screenshots/login/bug-facebook-no-href.png' });
      await page.evaluate(() => {
        const els = document.querySelectorAll('.wdkit-social-login-btns a');
        const fb = Array.from(els).find(e => e.innerText.includes('Facebook'));
        if (fb) fb.style.outline = '';
      });
      expect(
        href,
        `Facebook login <a> has no href (href="${href}") — button is a dead link, clicking does nothing`
      ).toBeTruthy();
      expect(href).not.toBe('');
    });

    test('"Continue via Login Key" link has correct href', async ({ page }) => {
      await waitForLoginPanel(page);
      const link = page.locator('a[href="#/login-api"]').first();
      await expect(link).toBeVisible();
      expect(await link.getAttribute('href')).toBe('#/login-api');
    });

    test('Google login button has an icon element', async ({ page }) => {
      await waitForLoginPanel(page);
      const link = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Google' }).first();
      const imgCount  = await link.locator('img').count();
      const iconCount = await link.locator('i').count();
      expect(imgCount + iconCount, 'Google button has no icon').toBeGreaterThan(0);
    });

  });

  // ── 7. SECURITY ───────────────────────────────────────────────────────────────

  test.describe('07 — Security', () => {

    test('password field value is not exposed in page HTML source', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('.wdkit-password-cover input').first().fill('SuperSecret@999!');
      expect(await page.content()).not.toContain('SuperSecret@999!');
    });

    test('AJAX nonce (kit_nonce / wdkitData) is present in page source', async ({ page }) => {
      const src = await page.content();
      expect(src.includes('kit_nonce') || src.includes('wdkitData'), 'No nonce found — CSRF risk').toBeTruthy();
    });

    test('no bearer token hardcoded in page source', async ({ page }) => {
      expect(await page.content()).not.toMatch(/bearer\s+[a-zA-Z0-9\-_.]{20,}/i);
    });

    test('failed login does not leak PHP stack trace or server paths', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('wrong@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('wrongpass');
      await page.locator('.wdkit-register-button').first().click();
      await page.waitForTimeout(5000);
      const body = await page.locator('body').innerText();
      expect(body).not.toContain('stack trace');
      expect(body).not.toContain('wp-includes');
      expect(body).not.toContain('wp-content/plugins');
      expect(body).not.toContain('Fatal error');
    });

    test('unauthenticated WP users are redirected to wp-login', async ({ browser }) => {
      const ctx   = await browser.newContext();
      const guest = await ctx.newPage();
      await guest.goto('/wp-admin/admin.php?page=wdesign-kit');
      await expect(guest).toHaveURL(/wp-login\.php/, { timeout: 10000 });
      await ctx.close();
    });

  });

  // ── 8. LOADING STATES ─────────────────────────────────────────────────────────

  test.describe('08 — Loading States', () => {

    test('React app mounts with content (no blank #wdesignkit-app)', async ({ page }) => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      const html = await page.locator('#wdesignkit-app').innerHTML();
      expect(html.trim().length, '#wdesignkit-app is empty — React app did not mount').toBeGreaterThan(10);
    });

    test('clicking "Log in" with credentials triggers loading state or response', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('test@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('testpassword123');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-auth-dots-wrapper, input.wdkit-input-error, .wkit-in-login-popup-content').first()
      ).toBeVisible({ timeout: 10000 });
    });

  });

  // ── 9. ACCESSIBILITY ─────────────────────────────────────────────────────────

  test.describe('09 — Accessibility', () => {

    test('email input has id "WDkitUserEmail" (WCAG 1.3.1)', async ({ page }) => {
      await waitForLoginPanel(page);
      const id = await page.locator('#WDkitUserEmail').first().getAttribute('id');
      expect(id, 'Email input id missing or empty').toBeTruthy();
    });

    test('password input has an id attribute — required for label association (WCAG 1.3.1)', async ({ page }) => {
      await waitForLoginPanel(page);
      const id = await page.locator('.wdkit-password-cover input').first().getAttribute('id');
      // Highlight the password input in red — missing id attribute
      await page.evaluate(() => {
        const pw = document.querySelector('.wdkit-password-cover input');
        if (pw) {
          pw.style.outline = '3px solid red';
          pw.style.outlineOffset = '3px';
        }
      });
      await page.locator('.wdkit-password-cover').first().screenshot({
        path: 'reports/bugs/screenshots/login/bug-password-input-missing-id.png'
      });
      await page.evaluate(() => {
        const pw = document.querySelector('.wdkit-password-cover input');
        if (pw) pw.style.outline = '';
      });
      expect(
        id,
        `Password input is MISSING id attribute — no <label> can be associated with it (WCAG 1.3.1 failure). Found: "${id}"`
      ).toBeTruthy();
    });

    test('"Log in" button has accessible text', async ({ page }) => {
      await waitForLoginPanel(page);
      const btn       = page.locator('.wdkit-register-button').first();
      const text      = (await btn.innerText()).trim();
      const ariaLabel = await btn.getAttribute('aria-label');
      expect(text.length > 0 || (ariaLabel?.length > 0), 'Button has no visible text and no aria-label').toBeTruthy();
    });

    test('Tab key moves focus from email to password', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().click();
      await page.keyboard.press('Tab');
      await expect(page.locator('.wdkit-password-cover input').first()).toBeFocused();
    });

    test('Enter key on password field triggers form submission', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail').first().fill('test@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('testpass');
      await page.locator('.wdkit-password-cover input').first().press('Enter');
      await expect(
        page.locator('.wdkit-auth-dots-wrapper, input.wdkit-input-error, .wkit-in-login-popup-content').first()
      ).toBeVisible({ timeout: 12000 });
    });

    test('all login inputs have a placeholder or aria-label', async ({ page }) => {
      await waitForLoginPanel(page);
      const inputs = page.locator('.wdkit-form-card input:not([type="checkbox"])');
      const count  = await inputs.count();
      expect(count, 'No inputs found in login form').toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const el          = inputs.nth(i);
        const placeholder = await el.getAttribute('placeholder');
        const ariaLabel   = await el.getAttribute('aria-label');
        const id          = await el.getAttribute('id');
        const hasLabel    = placeholder || ariaLabel ||
          (id && await page.locator(`label[for="${id}"]`).count() > 0);
        expect(hasLabel, `Input #${i+1} (id="${id}") has no placeholder, aria-label, or label`).toBeTruthy();
      }
    });

  });

  // ── 10. UX / FORM STRUCTURE ───────────────────────────────────────────────────

  test.describe('10 — UX & Form Structure', () => {

    test('login inputs are wrapped in a <form> element', async ({ page }) => {
      await waitForLoginPanel(page);
      // Highlight both inputs + button in red to show they're not inside a <form>
      await page.evaluate(() => {
        ['#WDkitUserEmail', '.wdkit-password-cover input', '.wdkit-register-button'].forEach(sel => {
          const el = document.querySelector(sel);
          if (el) {
            el.style.outline = '3px solid red';
            el.style.outlineOffset = '2px';
          }
        });
      });
      await page.locator('.wdkit-form-card').first().screenshot({
        path: 'reports/bugs/screenshots/login/bug-no-form-wrapper.png'
      });
      await page.evaluate(() => {
        ['#WDkitUserEmail', '.wdkit-password-cover input', '.wdkit-register-button'].forEach(sel => {
          const el = document.querySelector(sel);
          if (el) el.style.outline = '';
        });
      });
      const count = await page.locator('.wdkit-login form, .wdkit-form-card form').first().count();
      expect(
        count,
        'Login inputs are NOT inside a <form> element — breaks password managers, browser save-password, and Enter-to-submit'
      ).toBeGreaterThan(0);
    });

    test('email input does not have autocomplete="off"', async ({ page }) => {
      await waitForLoginPanel(page);
      const val = await page.locator('#WDkitUserEmail').first().getAttribute('autocomplete');
      // Highlight only the email input — autocomplete="off" is the bug
      await page.evaluate(() => {
        const el = document.querySelector('#WDkitUserEmail');
        if (el) {
          el.style.outline = '3px solid red';
          el.style.outlineOffset = '3px';
        }
      });
      await page.locator('#WDkitUserEmail').first().screenshot({
        path: 'reports/bugs/screenshots/login/bug-email-autocomplete-off.png'
      });
      await page.evaluate(() => {
        const el = document.querySelector('#WDkitUserEmail');
        if (el) el.style.outline = '';
      });
      expect(
        val,
        `Email input has autocomplete="${val}" — blocks password managers. Should be "email" or "username"`
      ).not.toBe('off');
    });

    test('password input does not have autocomplete="off"', async ({ page }) => {
      await waitForLoginPanel(page);
      const val = await page.locator('.wdkit-password-cover input').first().getAttribute('autocomplete');
      // Highlight only the password input — autocomplete="off" is the bug
      await page.evaluate(() => {
        const el = document.querySelector('.wdkit-password-cover input');
        if (el) {
          el.style.outline = '3px solid red';
          el.style.outlineOffset = '3px';
        }
      });
      await page.locator('.wdkit-password-cover').first().screenshot({
        path: 'reports/bugs/screenshots/login/bug-password-autocomplete-off.png'
      });
      await page.evaluate(() => {
        const el = document.querySelector('.wdkit-password-cover input');
        if (el) el.style.outline = '';
      });
      expect(
        val,
        `Password input has autocomplete="${val}" — blocks password managers. Should be "current-password"`
      ).not.toBe('off');
    });

    test('"Forgot Password?" link text is present', async ({ page }) => {
      await waitForLoginPanel(page);
      const link = page.locator('a[href="#/forgot_password"]').first();
      await expect(link).toBeVisible();
      expect((await link.innerText()).trim().length, '"Forgot Password?" link has no text').toBeGreaterThan(0);
    });

    test('"Remember Me" label is linked to checkbox via for= attribute', async ({ page }) => {
      await waitForLoginPanel(page);
      const count = await page.locator('label[for="WdkitRememberme"]').count();
      expect(count, 'No <label for="WdkitRememberme"> — clicking label does not toggle checkbox').toBeGreaterThan(0);
    });

  });

  // ── 11. RESPONSIVE ────────────────────────────────────────────────────────────

  test.describe('11 — Responsive', () => {

    test('mobile 375px — no horizontal overflow, all controls visible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);
      const scrollW = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollW, `Overflow at 375px — scrollWidth ${scrollW}px`).toBeLessThanOrEqual(400);
      await expect(page.locator('#WDkitUserEmail').first()).toBeVisible();
      await expect(page.locator('.wdkit-password-cover input').first()).toBeVisible();
      await expect(page.locator('.wdkit-register-button').first()).toBeVisible();
    });

    test('tablet 768px — no horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);
      const scrollW = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollW, `Overflow at 768px — scrollWidth ${scrollW}px`).toBeLessThanOrEqual(790);
    });

    test('mobile 375px — "Log in" button tap target is minimum 44px height', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);
      const box = await page.locator('.wdkit-register-button').first().boundingBox();
      // Highlight only the button — undersized tap target is the bug
      await page.evaluate(() => {
        const el = document.querySelector('.wdkit-register-button');
        if (el) {
          el.style.outline = '3px solid red';
          el.style.outlineOffset = '3px';
        }
      });
      await page.locator('.wdkit-register-button').first().screenshot({
        path: 'reports/bugs/screenshots/login/bug-login-button-42px-tap-target.png'
      });
      await page.evaluate(() => {
        const el = document.querySelector('.wdkit-register-button');
        if (el) el.style.outline = '';
      });
      expect(box, '"Log in" button bounding box not measurable').toBeTruthy();
      expect(
        box.height,
        `"Log in" button is ${box.height}px — below 44px WCAG tap target minimum`
      ).toBeGreaterThanOrEqual(44);
    });

  });

});
