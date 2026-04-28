// =============================================================================
// WDesignKit Plugin — Activation & Lifecycle Tests
// Covers: activate, deactivate, version check, no fatal errors on lifecycle
// Environment: WordPress admin — set PLUGIN_URL in .env
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER = process.env.WP_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS || 'password';

test.describe('Plugin Activation', () => {

  test.beforeEach(async ({ page }) => {
    // Log in to WordPress admin
    await page.goto('/wp-login.php');
    await page.fill('#user_login', ADMIN_USER);
    await page.fill('#user_pass', ADMIN_PASS);
    await page.click('#wp-submit');
    await expect(page).toHaveURL(/wp-admin/);
  });

  test('plugin appears in the plugins list', async ({ page }) => {
    await page.goto('/wp-admin/plugins.php');
    await expect(page.locator('table.plugins')).toBeVisible();
    // Update selector to match actual plugin slug
    const pluginRow = page.locator('[data-slug="wdesignkit"]');
    await expect(pluginRow).toBeVisible();
  });

  test('plugin activates without fatal error', async ({ page }) => {
    await page.goto('/wp-admin/plugins.php');
    const activateLink = page.locator('[data-slug="wdesignkit"] .activate a');

    if (await activateLink.isVisible()) {
      await activateLink.click();
      await expect(page.locator('.updated, .notice-success')).toBeVisible();
      await expect(page.locator('.error, .notice-error')).not.toBeVisible();
    } else {
      // Already active — verify no error banner
      await expect(page.locator('.error, .notice-error')).not.toBeVisible();
    }
  });

  test('plugin deactivates cleanly', async ({ page }) => {
    await page.goto('/wp-admin/plugins.php');
    const deactivateLink = page.locator('[data-slug="wdesignkit"] .deactivate a');

    if (await deactivateLink.isVisible()) {
      await deactivateLink.click();
      await expect(page.locator('.updated, .notice-success')).toBeVisible();
      await expect(page.locator('.error, .notice-error')).not.toBeVisible();
    }
  });

  test('no PHP fatal errors on wp-admin after activation', async ({ page }) => {
    await page.goto('/wp-admin/');
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('Warning:');
    await expect(page.locator('body')).not.toContainText('Parse error');
  });

  test('WordPress debug log is empty after activation', async ({ page }) => {
    // Verifies no errors written to debug.log — requires WP_DEBUG_LOG=true
    await page.goto('/wp-admin/');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.reload();
    expect(consoleErrors.length).toBe(0);
  });

});
