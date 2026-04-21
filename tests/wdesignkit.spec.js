const { test, expect } = require('@playwright/test');

test('WDesignKit plugin install & load', async ({ page }) => {
  await page.goto('http://localhost/your-site/wp-admin');

  // Login
  await page.fill('#user_login', 'admin');
  await page.fill('#user_pass', 'admin');
  await page.click('#wp-submit');

  // Verify dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Go to plugin page
  await page.goto('http://localhost/your-site/wp-admin/admin.php?page=wdesignkit');

  // Validate page load
  await expect(page).toHaveURL(/wdesignkit/);

  // Basic UI check
  await expect(page.locator('body')).toContainText('WDesignKit');
});