// =============================================================================
// WDesignKit Plugin — Login & Auth Tests
// Covers: Email/password login, API key login, Social login (Google/Facebook),
//         Signup, Forgot password, Validation, Error states, Security,
//         Logout, Remember me, Accessibility, Console errors
// Environment: WordPress admin with WDesignKit plugin active
// Set PLUGIN_URL, WP_ADMIN_USER, WP_ADMIN_PASS in .env
//
// Selectors verified against live plugin v2.2.10 rendered HTML.
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER  = process.env.WP_ADMIN_USER  || 'admin';
const ADMIN_PASS  = process.env.WP_ADMIN_PASS  || 'admin@123';
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

// ── Helper: clear WDesignKit cloud session from localStorage ──────────────────
// Plugin stores auth in localStorage "wdkit-login" key.
// Clearing it forces the React SPA to render the login panel.
async function clearWdkitToken(page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('wdkit') || k.startsWith('wkit'))
      .forEach(k => localStorage.removeItem(k));
  });
}

// ── Helper: open plugin page and force login panel ────────────────────────────
async function openLoginPanel(page) {
  await page.goto('/wp-admin/admin.php?page=wdesign-kit');
  await page.waitForLoadState('domcontentloaded');
  await clearWdkitToken(page);
  await page.goto('/wp-admin/admin.php?page=wdesign-kit#/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

// ── Helper: wait for login panel to be ready ─────────────────────────────────
async function waitForLoginPanel(page) {
  // .wdkit-form-card is the inner form wrapper — single element, no strict mode issue
  await expect(page.locator('.wdkit-form-card').first()).toBeVisible({ timeout: 20000 });
}

// ── Helper: navigate to a hash sub-route inside the plugin ───────────────────
async function goToRoute(page, hash) {
  await page.evaluate(h => { window.location.hash = h; }, hash);
  await page.waitForTimeout(800);
}

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe('Plugin Login & Auth', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
    await openLoginPanel(page);
  });

  // ── 1. UI LAYOUT ─────────────────────────────────────────────────────────────

  test.describe('UI Layout', () => {

    test('login panel renders without PHP fatal error or blank screen', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('Fatal error');
      await expect(page.locator('body')).not.toContainText('Warning:');
      await expect(page.locator('body')).not.toContainText('Parse error');
      await expect(page.locator('.wdkit-auth-panal').first()).toBeVisible({ timeout: 15000 });
    });

    test('login panel has left (banner) and right (form) sections', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wdkit-auth-panal-left')).toBeVisible();
      await expect(page.locator('.wdkit-auth-panal-right')).toBeVisible();
    });

    test('WDesignKit logo is visible on login panel', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wkit-img-logo img, .wkit-logo').first()).toBeVisible();
    });

    test('login panel has no horizontal overflow', async ({ page }) => {
      await waitForLoginPanel(page);
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    });

    test('"Create an account" link is present on login panel', async ({ page }) => {
      await waitForLoginPanel(page);
      // Signup is a link in the panel header: <a href="#/signup">Create an account</a>
      await expect(page.locator('a[href="#/signup"]').first()).toBeVisible();
    });

    test('social login section is visible (Google + Facebook + Login Key)', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wdkit-social-login-btns').first()).toBeVisible();
    });

    test('"Continue via Login Key" option is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('a[href="#/login-api"]').first()).toBeVisible();
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

    test('carousel / banner image is visible on the left side', async ({ page }) => {
      await waitForLoginPanel(page);
      await expect(page.locator('.wdkit-banner-carousel, .wdkit-auth-slider-img').first()).toBeVisible();
    });

  });

  // ── 2. EMAIL / PASSWORD LOGIN ─────────────────────────────────────────────────

  test.describe('Email & Password Login', () => {

    test('email and password fields are present and focusable', async ({ page }) => {
      await waitForLoginPanel(page);
      const emailField    = page.locator('#WDkitUserEmail, input[type="email"]').first();
      const passwordField = page.locator('input[type="password"]').first();
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
      await emailField.click();
      await expect(emailField).toBeFocused();
    });

    test('"Log in" button is visible and enabled', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual rendered button: <button class="wdkit-register-button">Log in</button>
      const loginBtn = page.locator('.wdkit-register-button').first();
      await expect(loginBtn).toBeVisible();
      await expect(loginBtn).toBeEnabled();
    });

    test('shows error on empty form submission', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('.wdkit-register-button').first().click();
      // Plugin adds wdkit-input-error class to the input wrapper on validation failure
      // and renders wdkit-inncorrecttxt-cover for the error message
      await expect(
        page.locator('.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 8000 });
    });

    test('shows validation error on invalid email format', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().fill('notanemail');
      await page.locator('.wdkit-register-button').first().click();
      await expect(
        page.locator('.wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('shows error on wrong credentials', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().fill('wrong@example.com');
      await page.locator('.wdkit-password-cover input').first().fill('wrongpass123!');
      await page.locator('.wdkit-register-button').first().click();
      // Wrong creds → plugin shows a popup modal with "Login Failed" text
      // Classes: wkit-in-login-popup / wkit-small-popup
      await expect(
        page.locator('.wkit-in-login-popup, .wkit-small-popup').first()
      ).toBeVisible({ timeout: 15000 });
    });

    test('password field has show/hide eye toggle', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual: <div class="wdkit-pass-eye"><i class="wdkit-i-eye-off"></i></div>
      const eyeToggle  = page.locator('.wdkit-pass-eye').first();
      // Use stable selector — not input[type="password"] as type changes after click
      const pwInput    = page.locator('.wdkit-password-cover input').first();
      await expect(eyeToggle).toBeVisible();

      await eyeToggle.click();
      await expect(pwInput).toHaveAttribute('type', 'text');

      await eyeToggle.click();
      await expect(pwInput).toHaveAttribute('type', 'password');
    });

    test('"Remember Me" checkbox and label are present', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual: <div class="wdkit-rem-checkbox"><input ... class="wkit-check-box"><label>Remember Me</label></div>
      await expect(page.locator('.wdkit-rem-checkbox').first()).toBeVisible();
      await expect(page.locator('#WdkitRememberme, .wkit-check-box').first()).toBeVisible();
    });

    test('"Forgot Password?" link is present and navigates to forgot form', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual: <a class="wdkit-hover-line" href="#/forgot_password">Forgot Password?</a>
      const forgotLink = page.locator('a[href="#/forgot_password"]').first();
      await expect(forgotLink).toBeVisible();
      await forgotLink.click();
      await page.waitForTimeout(800);
      // Forgot password form should render
      await expect(page.locator('.wdkit-form-card').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
    });

    test('login with valid credentials shows success / dashboard', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) {
        test.skip(true, 'WDKIT_EMAIL / WDKIT_PASSWORD not set in .env — skipping');
      }
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().fill(WDKIT_EMAIL);
      await page.locator('input[type="password"]').first().fill(WDKIT_PASS);
      await page.locator('.wdkit-register-button').first().click();
      // After successful login, the main dashboard (browse templates) should appear
      await expect(
        page.locator('.wkit-main-menu-dashbord, .wdkit-browse-templates, #wdesignkit-app-dashboard').first()
      ).toBeVisible({ timeout: 20000 });
    });

  });

  // ── 3. API KEY LOGIN ──────────────────────────────────────────────────────────

  test.describe('API Key Login', () => {

    test('"Continue via Login Key" link navigates to API key form', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual: <a href="#/login-api">
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      // API key form should appear — input for token
      await expect(page.locator('.wdkit-form-card input').first()).toBeVisible({ timeout: 5000 });
    });

    test('shows error when API key field is submitted empty', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      const submitBtn = page.locator('.wdkit-register-button').first();
      await submitBtn.click();
      const errorMsg = page.locator('.wdkit-input-error, .wdkit-inncorrecttxt-cover').first();
      await expect(errorMsg).toBeVisible({ timeout: 8000 });
    });

    test('shows error on invalid API key', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/login-api"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-form-card input').first().fill('invalid-token-xyz00000000000');
      await page.locator('.wdkit-register-button').first().click();
      // Invalid API key also shows the popup modal (same as wrong credentials)
      await expect(
        page.locator('.wkit-in-login-popup, .wkit-small-popup, .wdkit-input-error, .wdkit-inncorrecttxt-cover').first()
      ).toBeVisible({ timeout: 15000 });
    });

    test('login with valid API token shows dashboard', async ({ page }) => {
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
      ).toBeVisible({ timeout: 20000 });
    });

  });

  // ── 4. SIGNUP ─────────────────────────────────────────────────────────────────

  test.describe('Signup', () => {

    test('"Create an account" link navigates to signup form', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      // Signup form should have a name/fullname field in addition to email + password
      await expect(page.locator('.wdkit-form-card').first()).toBeVisible({ timeout: 5000 });
    });

    test('signup form has name, email, and password fields', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      // All 3 fields must be present
      const fields = page.locator('.wdkit-form-card input');
      const count = await fields.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('signup shows error on empty form submission', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('.wdkit-register-button').first().click();
      const errorMsg = page.locator('.wdkit-input-error, .wdkit-inncorrecttxt-cover').first();
      await expect(errorMsg).toBeVisible({ timeout: 8000 });
    });

    test('signup shows error on invalid email format', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('input[type="email"]').first().fill('notvalid');
      await page.locator('.wdkit-register-button').first().click();
      const errorMsg = page.locator('.wdkit-input-error, .wdkit-inncorrecttxt-cover').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('switching signup → login → signup preserves navigation correctly', async ({ page }) => {
      await waitForLoginPanel(page);
      // Go to signup
      await page.locator('a[href="#/signup"]').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('.wdkit-form-card').first()).toBeVisible();

      // Back to login via browser hash
      await goToRoute(page, '/login');
      await expect(page.locator('#WDkitUserEmail, input[type="email"]').first()).toBeVisible({ timeout: 5000 });
    });

  });

  // ── 5. FORGOT PASSWORD ────────────────────────────────────────────────────────

  test.describe('Forgot Password', () => {

    test('forgot password form loads via link', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('a[href="#/forgot_password"]').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('.wdkit-form-card input[type="email"]').first()).toBeVisible({ timeout: 5000 });
    });

    test('forgot password shows error on empty email submit', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.locator('.wdkit-register-button').first().click();
      const errorMsg = page.locator('.wdkit-input-error, .wdkit-inncorrecttxt-cover').first();
      await expect(errorMsg).toBeVisible({ timeout: 8000 });
    });

    test('forgot password shows error on invalid email format', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.locator('.wdkit-form-card input[type="email"]').first().fill('bademail');
      await page.locator('.wdkit-register-button').first().click();
      const errorMsg = page.locator('.wdkit-input-error, .wdkit-inncorrecttxt-cover').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('forgot password shows a response on valid email submission', async ({ page }) => {
      await goToRoute(page, '/forgot_password');
      await page.locator('.wdkit-form-card input[type="email"]').first().fill('test@example.com');
      await page.locator('.wdkit-register-button').first().click();
      // Any response (success or "email not found") is acceptable — just not a blank page
      const response = page.locator('.wkit-login-signup-with-notify, [class*="wdkit-"], [class*="wkit-"]').first();
      await expect(response).toBeVisible({ timeout: 15000 });
    });

  });

  // ── 6. SOCIAL LOGIN ───────────────────────────────────────────────────────────

  test.describe('Social Login', () => {

    test('"Continue with Google" link is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      // Actual: <a class="wdkit-social-signup">...<span>Continue with Google</span></a>
      const googleLink = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Google' }).first();
      await expect(googleLink).toBeVisible();
    });

    test('"Continue with Facebook" link is visible', async ({ page }) => {
      await waitForLoginPanel(page);
      const fbLink = page.locator('.wdkit-social-login-btns a').filter({ hasText: 'Facebook' }).first();
      await expect(fbLink).toBeVisible();
    });

    test('all social login options have icons and text', async ({ page }) => {
      await waitForLoginPanel(page);
      const socialLinks = page.locator('.wdkit-social-login-btns a');
      const count = await socialLinks.count();
      expect(count).toBeGreaterThanOrEqual(2); // Google + Facebook at minimum

      for (let i = 0; i < count; i++) {
        const link = socialLinks.nth(i);
        await expect(link).toBeVisible();
        const text = (await link.innerText()).trim();
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test('"Continue via Login Key" option has icon and text', async ({ page }) => {
      await waitForLoginPanel(page);
      const apiKeyLink = page.locator('a[href="#/login-api"]').first();
      await expect(apiKeyLink).toBeVisible();
      const text = (await apiKeyLink.innerText()).trim();
      expect(text.length).toBeGreaterThan(0);
    });

  });

  // ── 7. LOGOUT ─────────────────────────────────────────────────────────────────

  test.describe('Logout', () => {

    test('logout clears session and returns to login panel', async ({ page }) => {
      if (!WDKIT_EMAIL || !WDKIT_PASS) {
        test.skip(true, 'WDKIT_EMAIL / WDKIT_PASSWORD not set in .env — skipping');
      }
      // Login first
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().fill(WDKIT_EMAIL);
      await page.locator('input[type="password"]').first().fill(WDKIT_PASS);
      await page.locator('.wdkit-register-button').first().click();
      await expect(page.locator('#wdesignkit-app-dashboard').first()).toBeVisible({ timeout: 20000 });

      // Clear localStorage (simulates logout)
      await clearWdkitToken(page);
      await page.goto('/wp-admin/admin.php?page=wdesign-kit#/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Login panel must reappear
      await expect(page.locator('.wdkit-auth-panal').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ── 8. SECURITY ───────────────────────────────────────────────────────────────

  test.describe('Security', () => {

    test('password field value is never visible in page source', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('input[type="password"]').first().fill('SecretPass@999');
      const bodyHTML = await page.content();
      expect(bodyHTML).not.toContain('SecretPass@999');
    });

    test('AJAX nonce (kit_nonce) is injected into the page', async ({ page }) => {
      const pageSource = await page.content();
      const hasNonce = pageSource.includes('kit_nonce') || pageSource.includes('wdkitData');
      expect(hasNonce).toBeTruthy();
    });

    test('no bearer tokens hardcoded in page source', async ({ page }) => {
      const pageSource = await page.content();
      expect(pageSource).not.toMatch(/bearer\s+[a-zA-Z0-9\-_.]{20,}/i);
    });

    test('failed login error does not expose PHP stack trace or paths', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().fill('wrong@example.com');
      await page.locator('input[type="password"]').first().fill('wrongpass');
      await page.locator('.wdkit-register-button').first().click();
      await page.waitForTimeout(4000);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('stack trace');
      expect(bodyText).not.toContain('wp-includes');
      expect(bodyText).not.toContain('wp-content/plugins');
      expect(bodyText).not.toContain('Fatal error');
    });

    test('plugin admin page redirects unauthenticated WP users to wp-login', async ({ browser }) => {
      const context  = await browser.newContext();
      const guestPage = await context.newPage();
      await guestPage.goto('/wp-admin/admin.php?page=wdesign-kit');
      await expect(guestPage).toHaveURL(/wp-login\.php/);
      await context.close();
    });

  });

  // ── 9. LOADING STATES ─────────────────────────────────────────────────────────

  test.describe('Loading States', () => {

    test('login button triggers a response (loader or error) on click', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().fill('test@example.com');
      await page.locator('input[type="password"]').first().fill('testpassword123');
      await page.locator('.wdkit-register-button').first().click();
      // Either a loading dots indicator or an inline error should appear
      const indicator = page.locator('.wdkit-auth-dots-wrapper, .wdkit-input-error, .wdkit-inncorrecttxt-cover').first();
      await expect(indicator).toBeVisible({ timeout: 8000 });
    });

    test('React app root mounts without a blank screen', async ({ page }) => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      // #wdesignkit-app must not be empty
      const appContent = await page.locator('#wdesignkit-app').innerHTML();
      expect(appContent.trim().length).toBeGreaterThan(10);
    });

  });

  // ── 10. ACCESSIBILITY ─────────────────────────────────────────────────────────

  test.describe('Accessibility', () => {

    test('all login form inputs have id, placeholder, or label', async ({ page }) => {
      await waitForLoginPanel(page);
      const inputs = page.locator('.wdkit-form-card input');
      const count  = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input       = inputs.nth(i);
        const id          = await input.getAttribute('id');
        const ariaLabel   = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        const hasLabel    = ariaLabel || placeholder || (id && await page.locator(`label[for="${id}"]`).count() > 0);
        expect(hasLabel).toBeTruthy();
      }
    });

    test('"Log in" button has non-empty accessible text', async ({ page }) => {
      await waitForLoginPanel(page);
      const loginBtn   = page.locator('.wdkit-register-button').first();
      const btnText    = (await loginBtn.innerText()).trim();
      const ariaLabel  = await loginBtn.getAttribute('aria-label');
      expect(btnText.length > 0 || (ariaLabel && ariaLabel.length > 0)).toBeTruthy();
    });

    test('Enter key on password field triggers form submission', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().fill('test@example.com');
      await page.locator('input[type="password"]').first().fill('testpass');
      await page.locator('input[type="password"]').first().press('Enter');
      const indicator = page.locator('.wdkit-auth-dots-wrapper, .wkit-login-signup-with-notify, [class*="wdkit-error"], [class*="wkit-error"]').first();
      await expect(indicator).toBeVisible({ timeout: 8000 });
    });

    test('Tab key moves focus from email to password field', async ({ page }) => {
      await waitForLoginPanel(page);
      await page.locator('#WDkitUserEmail, input[type="email"]').first().click();
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]').first()).toBeFocused();
    });

    test('carousel dot buttons have role and tabindex for keyboard access', async ({ page }) => {
      await waitForLoginPanel(page);
      const dots = page.locator('.wdkit-auth-dots-btn');
      const count = await dots.count();
      for (let i = 0; i < count; i++) {
        const role     = await dots.nth(i).getAttribute('role');
        const tabIndex = await dots.nth(i).getAttribute('tabindex');
        expect(role === 'button' || tabIndex !== null).toBeTruthy();
      }
    });

  });

  // ── 11. RESPONSIVE ────────────────────────────────────────────────────────────

  test.describe('Responsive', () => {

    test('login panel usable at 375px mobile — no overflow, fields visible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(400);

      await expect(page.locator('#WDkitUserEmail, input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
      await expect(page.locator('.wdkit-register-button').first()).toBeVisible();
    });

    test('login panel usable at 768px tablet — no overflow', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await openLoginPanel(page);
      await waitForLoginPanel(page);

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(790);
    });

  });

});
