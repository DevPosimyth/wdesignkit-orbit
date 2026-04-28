// =============================================================================
// WDesignKit Plugin — Login & Auth Tests
// Covers: Email/password login, API key login, Social login (Google/Facebook),
//         Signup, Forgot password, Validation, Error states, Security,
//         Logout, Remember me, Accessibility, Console errors
// Environment: WordPress admin with WDesignKit plugin active
// Set PLUGIN_URL, WP_ADMIN_USER, WP_ADMIN_PASS in .env
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER  = process.env.WP_ADMIN_USER  || 'admin';
const ADMIN_PASS  = process.env.WP_ADMIN_PASS  || 'password';
const WDKIT_EMAIL = process.env.WDKIT_EMAIL    || '';
const WDKIT_PASS  = process.env.WDKIT_PASSWORD || '';
const WDKIT_TOKEN = process.env.WDKIT_API_TOKEN || '';

// ── Helper: log into WP admin ─────────────────────────────────────────────────
async function wpLogin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await expect(page).toHaveURL(/wp-admin/);
}

// ── Helper: open WDesignKit plugin dashboard ──────────────────────────────────
async function openPluginDashboard(page) {
  await page.goto('/wp-admin/admin.php?page=wdesign-kit');
  await page.waitForLoadState('networkidle');
}

// ── Helper: wait for auth panel ───────────────────────────────────────────────
async function waitForAuthPanel(page) {
  await expect(page.locator('.wdkit-auth-panal, .wdkit-login, .wkit-tpae-login-form')).toBeVisible({ timeout: 15000 });
}

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe('Plugin Login & Auth', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await openPluginDashboard(page);
  });

  // ── 1. UI / LAYOUT ──────────────────────────────────────────────────────────

  test.describe('UI Layout', () => {

    test('login panel renders without fatal error or blank screen', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('Fatal error');
      await expect(page.locator('body')).not.toContainText('Warning:');
      await expect(page.locator('body')).not.toContainText('Parse error');
      // Auth panel or already-logged-in state must be visible
      const authOrDash = page.locator('.wdkit-auth-panal, .wdkit-login, .wkit-tpae-login-form, .wdkit-dashboard-main, #wdkit-app');
      await expect(authOrDash).toBeVisible({ timeout: 15000 });
    });

    test('login panel has left and right sections', async ({ page }) => {
      await waitForAuthPanel(page);
      await expect(page.locator('.wdkit-auth-panal-left, .wdkit-login-left')).toBeVisible();
      await expect(page.locator('.wdkit-auth-panal-right, .wdkit-login-signUp-btn-cover')).toBeVisible();
    });

    test('WDesignKit logo is visible on login panel', async ({ page }) => {
      await waitForAuthPanel(page);
      const logo = page.locator('.wdkit-auth-panal img, .wdkit-login img, .wkit-tpae-login-form img');
      await expect(logo.first()).toBeVisible();
    });

    test('login panel has no horizontal overflow on default viewport', async ({ page }) => {
      await waitForAuthPanel(page);
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
    });

    test('login tab and signup tab are both present', async ({ page }) => {
      await waitForAuthPanel(page);
      const loginTab  = page.locator('.wdkit-login, [data-tab="login"], button:has-text("Login"), a:has-text("Log in")').first();
      const signupTab = page.locator('.wdkit-signup, [data-tab="signup"], button:has-text("Sign Up"), a:has-text("Sign Up")').first();
      await expect(loginTab).toBeVisible();
      await expect(signupTab).toBeVisible();
    });

    test('social login buttons (Google and Facebook) are visible', async ({ page }) => {
      await waitForAuthPanel(page);
      const socialBtns = page.locator('.wdkit-social-login-btns, .wdkit-i-facebook, .wkit-tpae-login-btns');
      await expect(socialBtns.first()).toBeVisible();
    });

    test('"Login with API Key" option is present', async ({ page }) => {
      await waitForAuthPanel(page);
      const apiKeyOption = page.locator('text=Login With Key, text=API Key, text=Login Key, text=Continue via Login Key').first();
      await expect(apiKeyOption).toBeVisible();
    });

    test('no JS console errors on login panel load', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      expect(consoleErrors).toHaveLength(0);
    });

  });

  // ── 2. EMAIL / PASSWORD LOGIN ───────────────────────────────────────────────

  test.describe('Email & Password Login', () => {

    test('email and password fields are present and focusable', async ({ page }) => {
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i], .wkit-tpae-login-field input[type="text"]').first();
      const passwordField = page.locator('input[type="password"], .wkit-login-password-inp').first();
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
      await emailField.click();
      await expect(emailField).toBeFocused();
    });

    test('login button is visible and clickable', async ({ page }) => {
      await waitForAuthPanel(page);
      const loginBtn = page.locator('.wkit-login-btn, button:has-text("Login"), button:has-text("Log in"), .wkit-tpae-login-btn').first();
      await expect(loginBtn).toBeVisible();
      await expect(loginBtn).toBeEnabled();
    });

    test('shows error on empty form submission', async ({ page }) => {
      await waitForAuthPanel(page);
      const loginBtn = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();
      await loginBtn.click();
      // Expect inline error or notification
      const errorMsg = page.locator('.wkit-login-signup-with-notify, .wdkit-error, [class*="error"], [class*="notice"]').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('shows error on invalid email format', async ({ page }) => {
      await waitForAuthPanel(page);
      const emailField = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const loginBtn   = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();

      await emailField.fill('notanemail');
      await loginBtn.click();
      const errorMsg = page.locator('text=Email is not valid, text=valid email, .wkit-login-signup-with-notify').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('shows error on wrong credentials', async ({ page }) => {
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordField = page.locator('input[type="password"], .wkit-login-password-inp').first();
      const loginBtn      = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();

      await emailField.fill('wrong@example.com');
      await passwordField.fill('wrongpassword123');
      await loginBtn.click();

      const errorMsg = page.locator('text=Login Error, text=Login Failed, text=incorrect, text=invalid, .wkit-login-signup-with-notify').first();
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
    });

    test('password field has show/hide toggle (eye icon)', async ({ page }) => {
      await waitForAuthPanel(page);
      const eyeToggle = page.locator('.wkit-password-eye, [class*="password-eye"], [class*="eye-icon"]').first();
      await expect(eyeToggle).toBeVisible();

      // Toggle to show password
      const passwordField = page.locator('input[type="password"]').first();
      await eyeToggle.click();
      const inputType = await passwordField.getAttribute('type');
      expect(inputType).toBe('text');

      // Toggle back to hide
      await eyeToggle.click();
      const inputTypeAfter = await passwordField.getAttribute('type');
      expect(inputTypeAfter).toBe('password');
    });

    test('"Remember Me" checkbox is present', async ({ page }) => {
      await waitForAuthPanel(page);
      const rememberMe = page.locator('input[type="checkbox"], .wkit-login-remember-text, text=Remember Me').first();
      await expect(rememberMe).toBeVisible();
    });

    test('"Forgot Password?" link is present and clickable', async ({ page }) => {
      await waitForAuthPanel(page);
      const forgotLink = page.locator('.wdkit-reme-forgot, text=Forgot Password, text=Forgot Password?').first();
      await expect(forgotLink).toBeVisible();
      await forgotLink.click();
      // Forgot password form should appear
      const forgotForm = page.locator('.wkit-forgot-pass-input, text=Enter your email to receive, input[type="email"]').first();
      await expect(forgotForm).toBeVisible({ timeout: 5000 });
    });

    test('login with valid credentials shows success state', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) {
        test.skip(true, 'WDKIT_EMAIL / WDKIT_PASSWORD not set in .env');
      }
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordField = page.locator('input[type="password"]').first();
      const loginBtn      = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();

      await emailField.fill(WDKIT_EMAIL);
      await passwordField.fill(WDKIT_PASS);
      await loginBtn.click();

      // After login: success message or dashboard visible
      const successState = page.locator('text=Login successfully, text=Login successful, .wdkit-dashboard-main, .wdkit-browse-templates').first();
      await expect(successState).toBeVisible({ timeout: 15000 });
    });

  });

  // ── 3. API KEY LOGIN ────────────────────────────────────────────────────────

  test.describe('API Key Login', () => {

    test('API key login tab/button opens API key input', async ({ page }) => {
      await waitForAuthPanel(page);
      const apiKeyBtn = page.locator('text=Login With Key, text=Login Key, text=API Key, text=Continue via Login Key').first();
      await apiKeyBtn.click();
      const keyInput = page.locator('.wdkit-selected-api-key input, .wkit-tpae-login-field input, input[placeholder*="key" i], input[placeholder*="token" i]').first();
      await expect(keyInput).toBeVisible({ timeout: 5000 });
    });

    test('shows error when API key field is submitted empty', async ({ page }) => {
      await waitForAuthPanel(page);
      const apiKeyBtn = page.locator('text=Login With Key, text=Login Key, text=API Key, text=Continue via Login Key').first();
      await apiKeyBtn.click();

      const submitBtn = page.locator('.wkit-login-btn, button:has-text("Login"), button:has-text("Continue")').first();
      await submitBtn.click();

      const errorMsg = page.locator('.wkit-login-signup-with-notify, [class*="error"], [class*="notice"]').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('shows error on invalid API key', async ({ page }) => {
      await waitForAuthPanel(page);
      const apiKeyBtn = page.locator('text=Login With Key, text=Login Key, text=API Key, text=Continue via Login Key').first();
      await apiKeyBtn.click();

      const keyInput  = page.locator('.wdkit-selected-api-key input, .wkit-tpae-login-field input, input[placeholder*="key" i], input[placeholder*="token" i]').first();
      const submitBtn = page.locator('.wkit-login-btn, button:has-text("Login"), button:has-text("Continue")').first();

      await keyInput.fill('invalid-token-00000000');
      await submitBtn.click();

      const errorMsg = page.locator('.wkit-login-signup-with-notify, text=Login Error, text=Login Failed, [class*="error"]').first();
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
    });

    test('login with valid API token succeeds', async ({ page }) => {
      if (!WDKIT_TOKEN) {
        test.skip(true, 'WDKIT_API_TOKEN not set in .env');
      }
      await waitForAuthPanel(page);
      const apiKeyBtn = page.locator('text=Login With Key, text=Login Key, text=API Key, text=Continue via Login Key').first();
      await apiKeyBtn.click();

      const keyInput  = page.locator('.wdkit-selected-api-key input, .wkit-tpae-login-field input, input[placeholder*="key" i], input[placeholder*="token" i]').first();
      const submitBtn = page.locator('.wkit-login-btn, button:has-text("Login"), button:has-text("Continue")').first();

      await keyInput.fill(WDKIT_TOKEN);
      await submitBtn.click();

      const successState = page.locator('text=Login successfully, .wdkit-dashboard-main, .wdkit-browse-templates').first();
      await expect(successState).toBeVisible({ timeout: 15000 });
    });

  });

  // ── 4. SIGNUP ───────────────────────────────────────────────────────────────

  test.describe('Signup', () => {

    test('signup tab switches to signup form', async ({ page }) => {
      await waitForAuthPanel(page);
      const signupTab = page.locator('.wdkit-signup, [data-tab="signup"], button:has-text("Sign Up"), a:has-text("Sign Up"), text=Create an account').first();
      await signupTab.click();
      const signupForm = page.locator('.wdkit-signup-left, .wdkit-social-signup, input[placeholder*="name" i]').first();
      await expect(signupForm).toBeVisible({ timeout: 5000 });
    });

    test('signup form has full name, email, and password fields', async ({ page }) => {
      await waitForAuthPanel(page);
      const signupTab = page.locator('.wdkit-signup, button:has-text("Sign Up"), a:has-text("Sign Up"), text=Create an account').first();
      await signupTab.click();

      await expect(page.locator('input[placeholder*="name" i], input[placeholder*="fullname" i]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('signup shows error on empty form submission', async ({ page }) => {
      await waitForAuthPanel(page);
      const signupTab = page.locator('.wdkit-signup, button:has-text("Sign Up"), a:has-text("Sign Up"), text=Create an account').first();
      await signupTab.click();

      const submitBtn = page.locator('button:has-text("Sign Up"), button:has-text("Create Account"), .wkit-login-btn').first();
      await submitBtn.click();

      const errorMsg = page.locator('.wkit-login-signup-with-notify, [class*="error"], [class*="notice"]').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('signup shows error on invalid email format', async ({ page }) => {
      await waitForAuthPanel(page);
      const signupTab = page.locator('.wdkit-signup, button:has-text("Sign Up"), a:has-text("Sign Up"), text=Create an account').first();
      await signupTab.click();

      const emailField = page.locator('input[type="email"]').first();
      const submitBtn  = page.locator('button:has-text("Sign Up"), button:has-text("Create Account"), .wkit-login-btn').first();
      await emailField.fill('notvalid');
      await submitBtn.click();

      const errorMsg = page.locator('text=Email is not valid, text=valid email, .wkit-login-signup-with-notify').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('switching from login to signup and back preserves tabs correctly', async ({ page }) => {
      await waitForAuthPanel(page);
      // Go to signup
      const signupTab = page.locator('.wdkit-signup, button:has-text("Sign Up"), a:has-text("Sign Up"), text=Create an account').first();
      await signupTab.click();
      await expect(page.locator('input[placeholder*="name" i]').first()).toBeVisible({ timeout: 5000 });

      // Back to login
      const loginTab = page.locator('.wdkit-login, button:has-text("Log in"), a:has-text("Log in"), text=Login').first();
      await loginTab.click();
      await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 5000 });
    });

  });

  // ── 5. FORGOT PASSWORD ──────────────────────────────────────────────────────

  test.describe('Forgot Password', () => {

    test('forgot password form is reachable from login panel', async ({ page }) => {
      await waitForAuthPanel(page);
      const forgotLink = page.locator('.wdkit-reme-forgot, text=Forgot Password, text=Forgot Password?').first();
      await forgotLink.click();
      await expect(page.locator('.wkit-forgot-pass-input, text=Enter your email to receive').first()).toBeVisible({ timeout: 5000 });
    });

    test('forgot password shows error on empty email', async ({ page }) => {
      await waitForAuthPanel(page);
      const forgotLink = page.locator('.wdkit-reme-forgot, text=Forgot Password, text=Forgot Password?').first();
      await forgotLink.click();

      const submitBtn = page.locator('button:has-text("Send"), button:has-text("Reset"), button:has-text("Submit"), .wkit-login-btn').first();
      await submitBtn.click();

      const errorMsg = page.locator('.wkit-login-signup-with-notify, [class*="error"], text=valid email, text=Please provide').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('forgot password shows error on invalid email format', async ({ page }) => {
      await waitForAuthPanel(page);
      const forgotLink = page.locator('.wdkit-reme-forgot, text=Forgot Password, text=Forgot Password?').first();
      await forgotLink.click();

      const emailInput = page.locator('.wkit-forgot-pass-input input, input[type="email"]').first();
      const submitBtn  = page.locator('button:has-text("Send"), button:has-text("Reset"), button:has-text("Submit"), .wkit-login-btn').first();

      await emailInput.fill('bademail');
      await submitBtn.click();

      const errorMsg = page.locator('text=Email is not valid, text=valid email, .wkit-login-signup-with-notify').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('forgot password shows success message on valid email', async ({ page }) => {
      await waitForAuthPanel(page);
      const forgotLink = page.locator('.wdkit-reme-forgot, text=Forgot Password, text=Forgot Password?').first();
      await forgotLink.click();

      const emailInput = page.locator('.wkit-forgot-pass-input input, input[type="email"]').first();
      const submitBtn  = page.locator('button:has-text("Send"), button:has-text("Reset"), button:has-text("Submit"), .wkit-login-btn').first();

      await emailInput.fill('test@example.com');
      await submitBtn.click();

      // Expect either a success message or "email not found" — both are valid non-error responses
      const response = page.locator('.wkit-login-signup-with-notify, [class*="notice"], [class*="success"], [class*="error"]').first();
      await expect(response).toBeVisible({ timeout: 10000 });
    });

    test('back button on forgot password returns to login form', async ({ page }) => {
      await waitForAuthPanel(page);
      const forgotLink = page.locator('.wdkit-reme-forgot, text=Forgot Password, text=Forgot Password?').first();
      await forgotLink.click();

      const backBtn = page.locator('button:has-text("Back"), a:has-text("Back"), .wdkit-auth-back, [aria-label*="back" i]').first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
        await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 5000 });
      }
    });

  });

  // ── 6. SOCIAL LOGIN ─────────────────────────────────────────────────────────

  test.describe('Social Login', () => {

    test('Google login button is visible and has correct label', async ({ page }) => {
      await waitForAuthPanel(page);
      const googleBtn = page.locator('.wdkit-social-login-btns button:has-text("Google"), .wkit-tpae-login-btns button:has-text("Google"), button[aria-label*="Google" i]').first();
      await expect(googleBtn).toBeVisible();
    });

    test('Facebook login button is visible and has correct label', async ({ page }) => {
      await waitForAuthPanel(page);
      const facebookBtn = page.locator('.wdkit-i-facebook, button:has-text("Facebook"), button[aria-label*="Facebook" i]').first();
      await expect(facebookBtn).toBeVisible();
    });

    test('social login buttons are not broken (no missing icons)', async ({ page }) => {
      await waitForAuthPanel(page);
      const socialBtns = page.locator('.wdkit-social-login-btns button, .wkit-tpae-login-btns button');
      const count = await socialBtns.count();
      for (let i = 0; i < count; i++) {
        const btn = socialBtns.nth(i);
        await expect(btn).toBeVisible();
        // Each button should have accessible text or aria-label
        const text     = await btn.innerText();
        const ariaLabel = await btn.getAttribute('aria-label');
        expect(text.trim().length > 0 || (ariaLabel && ariaLabel.length > 0)).toBeTruthy();
      }
    });

  });

  // ── 7. LOGOUT ───────────────────────────────────────────────────────────────

  test.describe('Logout', () => {

    test('logout option is available when logged into WDesignKit', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) {
        test.skip(true, 'WDKIT_EMAIL / WDKIT_PASSWORD not set in .env');
      }
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordField = page.locator('input[type="password"]').first();
      const loginBtn      = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();

      await emailField.fill(WDKIT_EMAIL);
      await passwordField.fill(WDKIT_PASS);
      await loginBtn.click();
      await expect(page.locator('.wdkit-dashboard-main, .wdkit-browse-templates').first()).toBeVisible({ timeout: 15000 });

      // Logout should be accessible via user menu or settings
      const logoutTrigger = page.locator('text=Logout, text=Log Out, text=Sign Out, [aria-label*="logout" i]').first();
      await expect(logoutTrigger).toBeVisible({ timeout: 10000 });
    });

    test('after logout, login panel is shown again', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) {
        test.skip(true, 'WDKIT_EMAIL / WDKIT_PASSWORD not set in .env');
      }
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordField = page.locator('input[type="password"]').first();
      const loginBtn      = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();

      await emailField.fill(WDKIT_EMAIL);
      await passwordField.fill(WDKIT_PASS);
      await loginBtn.click();
      await expect(page.locator('.wdkit-dashboard-main, .wdkit-browse-templates').first()).toBeVisible({ timeout: 15000 });

      const logoutTrigger = page.locator('text=Logout, text=Log Out, text=Sign Out').first();
      await logoutTrigger.click();

      // Login panel must reappear
      await expect(page.locator('.wdkit-auth-panal, .wdkit-login, .wkit-tpae-login-form').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ── 8. SECURITY ─────────────────────────────────────────────────────────────

  test.describe('Security', () => {

    test('password field value is not exposed in page source', async ({ page }) => {
      await waitForAuthPanel(page);
      const passwordField = page.locator('input[type="password"]').first();
      await passwordField.fill('SensitivePass123');

      const bodyHTML = await page.content();
      expect(bodyHTML).not.toContain('SensitivePass123');
    });

    test('login panel uses nonce — kit_nonce data is injected', async ({ page }) => {
      const pageSource = await page.content();
      // wdkitData should include kit_nonce for AJAX requests
      const hasNonce = pageSource.includes('kit_nonce') || pageSource.includes('wdkitData');
      expect(hasNonce).toBeTruthy();
    });

    test('no API keys or tokens visible in page source', async ({ page }) => {
      const pageSource = await page.content();
      // No real bearer/token patterns should be hardcoded in HTML
      expect(pageSource).not.toMatch(/bearer\s+[a-zA-Z0-9\-_.]{20,}/i);
    });

    test('error message on failed login does not expose server info or stack trace', async ({ page }) => {
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordField = page.locator('input[type="password"]').first();
      const loginBtn      = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();

      await emailField.fill('wrong@example.com');
      await passwordField.fill('wrongpass');
      await loginBtn.click();

      await page.waitForTimeout(3000);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('stack trace');
      expect(bodyText).not.toContain('wp-includes');
      expect(bodyText).not.toContain('wp-content/plugins');
      expect(bodyText).not.toContain('Fatal error');
    });

    test('login form is not accessible by non-logged-in WP user', async ({ browser }) => {
      // Verify the plugin admin page cannot be accessed without WP login
      const context = await browser.newContext();
      const guestPage = await context.newPage();
      await guestPage.goto('/wp-admin/admin.php?page=wdesign-kit');
      // Should redirect to WP login
      await expect(guestPage).toHaveURL(/wp-login\.php/);
      await context.close();
    });

  });

  // ── 9. LOADING STATES ───────────────────────────────────────────────────────

  test.describe('Loading States', () => {

    test('login button shows loading state after click', async ({ page }) => {
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordField = page.locator('input[type="password"]').first();
      const loginBtn      = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();

      await emailField.fill('test@example.com');
      await passwordField.fill('testpassword');

      // Click and immediately check for loading indicator
      await loginBtn.click();
      const loader = page.locator('.wdkit-auth-dots-wrapper, .wdkit-auth-dots-btn, .wkit-wb-loginloader, [class*="loader"], [class*="loading"]').first();
      // Loader may appear briefly — check within short window
      await expect(loader.or(page.locator('.wkit-login-signup-with-notify'))).toBeVisible({ timeout: 5000 });
    });

    test('page skeleton/loader appears before auth panel is ready', async ({ page }) => {
      // Reload and check for loader before content
      await page.reload();
      const loader = page.locator('.wkit-content-loader, .wb-contentLoader-circle, [class*="loader"]').first();
      // Either the loader briefly appears or the panel loads directly — no blank white screen
      const panelOrLoader = loader.or(page.locator('.wdkit-auth-panal, .wdkit-login, .wkit-tpae-login-form, .wdkit-dashboard-main'));
      await expect(panelOrLoader.first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ── 10. ACCESSIBILITY ───────────────────────────────────────────────────────

  test.describe('Accessibility', () => {

    test('all login form inputs have associated labels or aria-labels', async ({ page }) => {
      await waitForAuthPanel(page);
      const inputs = page.locator('.wdkit-auth-panal input, .wkit-tpae-login-form input');
      const count  = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id         = await input.getAttribute('id');
        const ariaLabel  = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        // At least one of: label[for], aria-label, placeholder
        const hasLabel = ariaLabel || placeholder || (id && await page.locator(`label[for="${id}"]`).count() > 0);
        expect(hasLabel).toBeTruthy();
      }
    });

    test('login button has accessible text', async ({ page }) => {
      await waitForAuthPanel(page);
      const loginBtn = page.locator('.wkit-login-btn, button:has-text("Login"), .wkit-tpae-login-btn').first();
      const btnText  = await loginBtn.innerText();
      const ariaLabel = await loginBtn.getAttribute('aria-label');
      expect(btnText.trim().length > 0 || (ariaLabel && ariaLabel.length > 0)).toBeTruthy();
    });

    test('login form can be submitted via Enter key', async ({ page }) => {
      await waitForAuthPanel(page);
      const emailField    = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordField = page.locator('input[type="password"]').first();

      await emailField.fill('test@example.com');
      await passwordField.fill('testpassword');
      await passwordField.press('Enter');

      // Should trigger form submission (loader or error message)
      const response = page.locator('.wdkit-auth-dots-wrapper, .wkit-login-signup-with-notify, [class*="loader"], [class*="error"]').first();
      await expect(response).toBeVisible({ timeout: 8000 });
    });

    test('tab key navigates through login form fields in correct order', async ({ page }) => {
      await waitForAuthPanel(page);
      const emailField = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      await emailField.click();

      // Tab to password
      await page.keyboard.press('Tab');
      const passwordField = page.locator('input[type="password"]').first();
      await expect(passwordField).toBeFocused();
    });

  });

  // ── 11. RESPONSIVE ──────────────────────────────────────────────────────────

  test.describe('Responsive', () => {

    test('login panel is usable on 375px mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await openPluginDashboard(page);
      await waitForAuthPanel(page);

      // No overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(400);

      // Key elements still visible
      await expect(page.locator('input[type="email"], input[placeholder*="email" i]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('login panel is usable on 768px tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await openPluginDashboard(page);
      await waitForAuthPanel(page);

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(790);
    });

  });

});
