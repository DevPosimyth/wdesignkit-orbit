// =============================================================================
// WDesignKit Plugin — Admin Panel Tests
// Covers: settings page load, settings save, nav, no PHP errors
// Environment: WordPress admin — set PLUGIN_URL in .env
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER = process.env.WP_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS || 'password';

test.describe('Plugin Admin Panel', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/wp-login.php');
    await page.fill('#user_login', ADMIN_USER);
    await page.fill('#user_pass', ADMIN_PASS);
    await page.click('#wp-submit');
    await expect(page).toHaveURL(/wp-admin/);
  });

  test('plugin admin menu appears in sidebar', async ({ page }) => {
    await page.goto('/wp-admin/');
    // Update selector to match actual plugin menu item
    const menuItem = page.locator('#adminmenu').getByText('WDesignKit');
    await expect(menuItem).toBeVisible();
  });

  test('plugin settings page loads without error', async ({ page }) => {
    // Update URL to match actual plugin settings page slug
    await page.goto('/wp-admin/admin.php?page=wdesignkit');
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('You do not have permission');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('settings page has no JS console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.goto('/wp-admin/admin.php?page=wdesignkit');
    await page.waitForLoadState('networkidle');
    expect(consoleErrors).toHaveLength(0);
  });

  test('settings save successfully', async ({ page }) => {
    await page.goto('/wp-admin/admin.php?page=wdesignkit');

    const saveButton = page.locator('input[type="submit"], button[type="submit"]').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await expect(page.locator('.updated, .notice-success')).toBeVisible();
    }
  });

  test('admin page is not accessible by subscriber role', async ({ page, browser }) => {
    // Test RBAC — subscriber should not access plugin settings
    const subscriberContext = await browser.newContext();
    const subscriberPage = await subscriberContext.newPage();

    await subscriberPage.goto('/wp-login.php');
    await subscriberPage.fill('#user_login', process.env.WP_SUBSCRIBER_USER || 'subscriber');
    await subscriberPage.fill('#user_pass', process.env.WP_SUBSCRIBER_PASS || 'password');
    await subscriberPage.click('#wp-submit');

    await subscriberPage.goto('/wp-admin/admin.php?page=wdesignkit');
    await expect(subscriberPage.locator('body')).toContainText(/not have permission|not allowed|Access denied/i);

    await subscriberContext.close();
  });

  test('settings page is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/wp-admin/admin.php?page=wdesignkit');
    await expect(page.locator('body')).not.toContainText('Fatal error');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(395); // Allow small tolerance
  });

});
