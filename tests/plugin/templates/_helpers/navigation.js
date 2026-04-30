// =============================================================================
// WDesignKit Templates Suite — Navigation Helpers
// Shared navigation helpers extracted from template-import.spec.js
// =============================================================================

const { expect } = require('@playwright/test');

const PLUGIN_PAGE = '/wp-admin/admin.php?page=wdesign-kit';
const SCREENSHOT_DIR = 'reports/bugs/screenshots/template-import';

async function goToBrowse(page) {
  await page.goto(PLUGIN_PAGE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { location.hash = '/browse'; });
  await page.waitForTimeout(3000);
  await page.waitForSelector('.wdkit-browse-card', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function goToBrowseViaNav(page) {
  await page.goto(PLUGIN_PAGE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const menu = page.locator('.wkit-menu').filter({ has: page.locator('.wdkit-i-templates') }).first();
  const menuVisible = await menu.isVisible({ timeout: 5000 }).catch(() => false);
  if (menuVisible) {
    await menu.click();
    await page.waitForTimeout(400);
    const link = page.locator('.wdkit-submenu-link[href="#/browse"]').first();
    const linkVisible = await link.isVisible({ timeout: 3000 }).catch(() => false);
    if (linkVisible) {
      await link.click();
      await page.waitForTimeout(2500);
      return;
    }
  }
  await page.evaluate(() => { location.hash = '/browse'; });
  await page.waitForTimeout(2500);
}

async function goToMyTemplates(page) {
  await page.goto(PLUGIN_PAGE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { location.hash = '/my_uploaded'; });
  await page.waitForTimeout(3000);
}

async function clickFirstCardImport(page) {
  const card = page.locator('.wdkit-browse-card').first();
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.hover({ force: true });
  await page.waitForTimeout(500);
  const importBtn = card.locator('.wdkit-browse-card-download').first();
  const btnVisible = await importBtn.isVisible({ timeout: 2000 }).catch(() => false);
  if (btnVisible) {
    await importBtn.click({ force: true });
  } else {
    await card.click({ force: true });
  }
  await page.waitForTimeout(3000);
}

async function goToImportPage(page) {
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
}

async function screenshot(page, name) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png` }).catch(() => {});
}

module.exports = {
  PLUGIN_PAGE,
  SCREENSHOT_DIR,
  goToBrowse,
  goToBrowseViaNav,
  goToMyTemplates,
  goToImportPage,
  clickFirstCardImport,
  screenshot,
};
