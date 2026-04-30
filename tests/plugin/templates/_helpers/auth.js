// =============================================================================
// WDesignKit Templates Suite — Auth Helpers
// Shared login/logout helpers and credentials extracted from template-import.spec.js
// =============================================================================

const { expect } = require('@playwright/test');

const ADMIN_USER      = (process.env.WP_ADMIN_USER      || 'admin').trim();
const ADMIN_PASS      = (process.env.WP_ADMIN_PASS      || 'admin@123').trim();
const SUBSCRIBER_USER = (process.env.WP_SUBSCRIBER_USER || 'subscriber').trim();
const SUBSCRIBER_PASS = (process.env.WP_SUBSCRIBER_PASS || 'subscriber@123').trim();
const WDKIT_TOKEN     = (process.env.WDKIT_API_TOKEN    || '').trim();
const WDKIT_EMAIL     = (process.env.WDKIT_EMAIL        || '').trim();

async function wpLogin(page, user, pass) {
  const u = user || ADMIN_USER;
  const p = pass || ADMIN_PASS;
  await page.goto('/wp-login.php');
  await page.fill('#user_login', u);
  await page.fill('#user_pass', p);
  await page.click('#wp-submit');
  await expect(page).toHaveURL(/wp-admin/, { timeout: 15000 });
}

async function wdkitLogin(page) {
  if (!WDKIT_EMAIL || !WDKIT_TOKEN) return false;
  try {
    await page.evaluate(({ email, token }) => {
      localStorage.setItem('wdkit-login', JSON.stringify({
        messages: 'Login successful',
        success: true,
        token,
        user_email: email,
      }));
    }, { email: WDKIT_EMAIL, token: WDKIT_TOKEN });
    return true;
  } catch (e) {
    return false;
  }
}

async function wdkitLogout(page) {
  try {
    await page.evaluate(() => {
      localStorage.removeItem('wdkit-login');
    });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  ADMIN_USER,
  ADMIN_PASS,
  SUBSCRIBER_USER,
  SUBSCRIBER_PASS,
  WDKIT_TOKEN,
  WDKIT_EMAIL,
  wpLogin,
  wdkitLogin,
  wdkitLogout,
};
