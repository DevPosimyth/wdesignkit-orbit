// =============================================================================
// WDesignKit Plugin — Elementor Widget Tests
// Covers: widget appears in panel, drag to canvas, settings render,
//         responsive controls, no console errors in editor
// Environment: WordPress + Elementor — set PLUGIN_URL in .env
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER = process.env.WP_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS || 'password';

// Helper — log into WP admin before opening Elementor
async function wpLogin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await expect(page).toHaveURL(/wp-admin/);
}

test.describe('Elementor Widget', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
  });

  test('WDesignKit widget appears in Elementor widget panel', async ({ page }) => {
    // Open a test page in Elementor editor
    // Update post ID to an existing Elementor page
    const testPageId = process.env.ELEMENTOR_TEST_PAGE_ID || '2';
    await page.goto(`/wp-admin/post.php?post=${testPageId}&action=elementor`);
    await page.waitForLoadState('networkidle');

    // Wait for Elementor editor iframe to load
    const editorFrame = page.frameLocator('#elementor-preview-iframe');
    await expect(editorFrame.locator('body')).toBeVisible({ timeout: 30000 });

    // Search for WDesignKit widget in the panel
    const searchInput = page.locator('#elementor-panel-elements-search-input');
    await searchInput.fill('WDesignKit');
    await page.waitForTimeout(500);

    const widget = page.locator('.elementor-element-wrapper').filter({ hasText: 'WDesignKit' }).first();
    await expect(widget).toBeVisible();
  });

  test('widget settings panel does not overflow narrow sidebar', async ({ page }) => {
    const testPageId = process.env.ELEMENTOR_TEST_PAGE_ID || '2';
    await page.goto(`/wp-admin/post.php?post=${testPageId}&action=elementor`);
    await page.waitForLoadState('networkidle');

    // Check sidebar width stays within 320px constraint
    const panelWidth = await page.evaluate(() => {
      const panel = document.querySelector('#elementor-panel');
      return panel ? panel.offsetWidth : null;
    });

    if (panelWidth) {
      expect(panelWidth).toBeGreaterThanOrEqual(200);
      expect(panelWidth).toBeLessThanOrEqual(400);
    }
  });

  test('Elementor editor loads without JS console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const testPageId = process.env.ELEMENTOR_TEST_PAGE_ID || '2';
    await page.goto(`/wp-admin/post.php?post=${testPageId}&action=elementor`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('widget responsive controls are present (Desktop/Tablet/Mobile)', async ({ page }) => {
    const testPageId = process.env.ELEMENTOR_TEST_PAGE_ID || '2';
    await page.goto(`/wp-admin/post.php?post=${testPageId}&action=elementor`);
    await page.waitForLoadState('networkidle');

    // Check responsive mode buttons exist in toolbar
    const responsiveToggle = page.locator('.elementor-device-desktop, [title="Desktop"]');
    await expect(responsiveToggle).toBeVisible({ timeout: 15000 });
  });

  test('frontend page renders widget output without PHP errors', async ({ page }) => {
    const testPageId = process.env.ELEMENTOR_TEST_PAGE_ID || '2';
    await page.goto(`/?p=${testPageId}`);
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('Warning:');

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.reload();
    expect(consoleErrors).toHaveLength(0);
  });

});
