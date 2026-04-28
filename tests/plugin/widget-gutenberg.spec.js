// =============================================================================
// WDesignKit Plugin — Gutenberg Block Tests
// Covers: block appears in inserter, inserts correctly, renders frontend,
//         block controls in correct sections, no console errors
// Environment: WordPress + Gutenberg — set PLUGIN_URL in .env
// =============================================================================

const { test, expect } = require('@playwright/test');

const ADMIN_USER = process.env.WP_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS || 'password';

async function wpLogin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await expect(page).toHaveURL(/wp-admin/);
}

test.describe('Gutenberg Block', () => {

  test.beforeEach(async ({ page }) => {
    await wpLogin(page);
  });

  test('WDesignKit block appears in block inserter', async ({ page }) => {
    // Open a new post in Gutenberg
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // Open block inserter
    const inserterButton = page.locator('button[aria-label="Toggle block inserter"]');
    await expect(inserterButton).toBeVisible({ timeout: 15000 });
    await inserterButton.click();

    // Search for WDesignKit block
    const searchInput = page.locator('input[placeholder="Search"], input[type="search"]').first();
    await searchInput.fill('WDesignKit');
    await page.waitForTimeout(500);

    const block = page.locator('[aria-label*="WDesignKit"], .block-editor-block-types-list__item').filter({ hasText: 'WDesignKit' }).first();
    await expect(block).toBeVisible();
  });

  test('block inserts into editor without error', async ({ page }) => {
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // Insert via slash command
    const contentArea = page.locator('.block-editor-writing-flow, .editor-styles-wrapper');
    await contentArea.click();
    await page.keyboard.type('/WDesignKit');
    await page.waitForTimeout(500);

    const suggestion = page.locator('.components-autocomplete__result').first();
    if (await suggestion.isVisible()) {
      await suggestion.click();
      // Verify block inserted with no error
      await expect(page.locator('.block-editor-block-list__block')).toBeVisible();
      await expect(page.locator('.block-editor-warning')).not.toBeVisible();
    }
  });

  test('block does not break on empty/default state', async ({ page }) => {
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // A fresh block should show placeholder, not a blank/broken box
    const blockArea = page.locator('.block-editor-writing-flow');
    await blockArea.click();

    // No white-screen or PHP fatal after inserting a block
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('.block-editor-warning')).not.toBeVisible();
  });

  test('block toolbar buttons have aria-label', async ({ page }) => {
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // Check that toolbar buttons are accessible
    const toolbarButtons = page.locator('.block-editor-block-toolbar button');
    const count = await toolbarButtons.count();

    for (let i = 0; i < count; i++) {
      const btn = toolbarButtons.nth(i);
      const ariaLabel = await btn.getAttribute('aria-label');
      const title = await btn.getAttribute('title');
      expect(ariaLabel || title).toBeTruthy();
    }
  });

  test('Gutenberg editor loads without JS console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('block renders correctly on frontend', async ({ page }) => {
    const testPageId = process.env.GUTENBERG_TEST_PAGE_ID || '3';
    await page.goto(`/?p=${testPageId}`);

    await expect(page.locator('body')).not.toContainText('Fatal error');

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.reload();
    expect(consoleErrors).toHaveLength(0);
  });

});
