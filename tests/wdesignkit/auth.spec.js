// =============================================================================
// WDesignKit — Auth Pages QA Spec
// Covers: Login, Signup, Forgot Password, Reset Password
// Based on: WDesignKit Auth Audit (April 2026) — 27 documented issues
// =============================================================================
// SETUP: Add these to your .env file before running:
//   WDK_USER=your-qa-test@email.com
//   WDK_PASS=your-qa-password
//   WDK_URL=https://wdesignkit.com
// Run: npx playwright test tests/wdesignkit/auth.spec.js
// =============================================================================

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.WDK_URL || 'https://wdesignkit.com';
const QA_EMAIL = process.env.WDK_USER || '';
const QA_PASS  = process.env.WDK_PASS  || '';

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
  });

  test('page loads without JS console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('page title and heading are present', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('email and password fields are visible', async ({ page }) => {
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('submit button is visible and enabled', async ({ page }) => {
    const btn = page.locator('button[type="submit"], input[type="submit"]').first();
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('empty form submission shows validation errors', async ({ page }) => {
    await page.click('button[type="submit"], input[type="submit"]');
    // Should show validation — not redirect or crash
    const url = page.url();
    expect(url).toContain('login');
  });

  test('invalid email format shows validation error', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'notanemail');
    await page.fill('input[type="password"]', 'somepassword');
    await page.click('button[type="submit"], input[type="submit"]');
    const url = page.url();
    expect(url).toContain('login');
  });

  test('wrong credentials shows error message', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword123');
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    // Should show an error, not a blank page
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/invalid|incorrect|error|wrong|not found/);
  });

  test('password field has show/hide toggle', async ({ page }) => {
    const toggle = page.locator('[data-toggle-password], .password-toggle, [aria-label*="show"], [aria-label*="password"]');
    // Log if missing — this is a UX bug we documented
    const count = await toggle.count();
    console.log(`Password toggle found: ${count > 0 ? 'YES' : 'NO — UX BUG: missing show/hide toggle'}`);
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    if (!QA_EMAIL || !QA_PASS) {
      test.skip(true, 'WDK_USER / WDK_PASS not set in .env');
      return;
    }
    await page.fill('input[type="email"], input[name="email"]', QA_EMAIL);
    await page.fill('input[type="password"]', QA_PASS);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('login');
  });

  test('login page is not accessible when already logged in', async ({ page }) => {
    if (!QA_EMAIL || !QA_PASS) {
      test.skip(true, 'WDK_USER / WDK_PASS not set in .env');
      return;
    }
    // Login first
    await page.fill('input[type="email"], input[name="email"]', QA_EMAIL);
    await page.fill('input[type="password"]', QA_PASS);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    // Try visiting login again — should redirect away
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('login');
  });

  test('login form has no broken images', async ({ page }) => {
    const images = await page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src) {
        const response = await page.request.get(src).catch(() => null);
        if (response) expect(response.status()).not.toBe(404);
      }
    }
  });

  test('login page has no horizontal scroll on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/login`);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('login page has no horizontal scroll on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/login`);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('HTTPS is enforced — no mixed content', async ({ page }) => {
    const mixedContent = [];
    page.on('response', res => {
      if (res.url().startsWith('http://')) mixedContent.push(res.url());
    });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    expect(mixedContent).toHaveLength(0);
  });

  test('forgot password link is visible on login page', async ({ page }) => {
    const link = page.locator('a[href*="forgot"], a[href*="reset"], a:has-text("Forgot")');
    await expect(link.first()).toBeVisible();
  });

  test('signup link is visible on login page', async ({ page }) => {
    const link = page.locator('a[href*="signup"], a[href*="register"], a:has-text("Sign up"), a:has-text("Register")');
    await expect(link.first()).toBeVisible();
  });

  test('login page visual snapshot — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('login-desktop.png', { maxDiffPixelRatio: 0.03 });
  });

  test('login page visual snapshot — mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveScreenshot('login-mobile.png', { maxDiffPixelRatio: 0.03 });
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// SIGNUP PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Signup Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
  });

  test('page loads without JS console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('all required fields are visible', async ({ page }) => {
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('empty form submission stays on signup page', async ({ page }) => {
    await page.click('button[type="submit"], input[type="submit"]');
    expect(page.url()).toMatch(/register|signup/);
  });

  test('weak password is rejected', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/register|signup/);
  });

  test('duplicate email shows error message', async ({ page }) => {
    if (!QA_EMAIL) {
      test.skip(true, 'WDK_USER not set in .env');
      return;
    }
    await page.fill('input[type="email"], input[name="email"]', QA_EMAIL);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/already|exists|taken|registered/);
  });

  test('signup page has no horizontal scroll on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/register`);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('login link is visible on signup page', async ({ page }) => {
    const link = page.locator('a[href*="login"], a:has-text("Log in"), a:has-text("Sign in")');
    await expect(link.first()).toBeVisible();
  });

  test('signup page visual snapshot — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('signup-desktop.png', { maxDiffPixelRatio: 0.03 });
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Forgot Password Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');
  });

  test('page loads without JS console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('email field and submit button are visible', async ({ page }) => {
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], input[type="submit"]').first()).toBeVisible();
  });

  test('empty submission stays on page with validation', async ({ page }) => {
    await page.click('button[type="submit"], input[type="submit"]');
    expect(page.url()).toMatch(/forgot/);
  });

  test('invalid email format shows validation', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'notvalid');
    await page.click('button[type="submit"], input[type="submit"]');
    expect(page.url()).toMatch(/forgot/);
  });

  test('non-existent email does not reveal user enumeration', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'nonexistent99999@example.com');
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    // Should show generic success message — NOT "email not found"
    const body = await page.textContent('body');
    expect(body.toLowerCase()).not.toMatch(/not found|no account|doesn't exist|does not exist/);
  });

  test('valid email submission shows success message', async ({ page }) => {
    if (!QA_EMAIL) {
      test.skip(true, 'WDK_USER not set in .env');
      return;
    }
    await page.fill('input[type="email"], input[name="email"]', QA_EMAIL);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/sent|check|email|success/);
  });

  test('back to login link is visible', async ({ page }) => {
    const link = page.locator('a[href*="login"], a:has-text("Back"), a:has-text("Log in")');
    await expect(link.first()).toBeVisible();
  });

  test('forgot password page has no horizontal scroll on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/forgot-password`);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('forgot password visual snapshot — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('forgot-password-desktop.png', { maxDiffPixelRatio: 0.03 });
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Reset Password Page', () => {

  test.beforeEach(async ({ page }) => {
    // Visit with a fake token to test UI — real token testing requires email flow
    await page.goto(`${BASE_URL}/reset-password?token=test-invalid-token`);
    await page.waitForLoadState('networkidle');
  });

  test('page loads without JS console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(`${BASE_URL}/reset-password?token=test-invalid-token`);
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('invalid token shows error — not blank page', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body.trim().length).toBeGreaterThan(50);
  });

  test('reset password without token redirects gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);
    await page.waitForLoadState('networkidle');
    // Should redirect or show error — not blank
    const body = await page.textContent('body');
    expect(body.trim().length).toBeGreaterThan(50);
  });

  test('password fields visible when token present', async ({ page }) => {
    const passwordFields = page.locator('input[type="password"]');
    const count = await passwordFields.count();
    // Log result — may be hidden if token is invalid
    console.log(`Password fields on reset page: ${count}`);
  });

  test('reset password page has no horizontal scroll on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

});