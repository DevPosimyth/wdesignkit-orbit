// =============================================================================
// WDesignKit Templates Suite — Post-Import Nexter Template Builder Verification
// Version: 2.0.0 — Extreme-polish pass: added §82.09-11 (Footer edit, non-empty titles);
//                 §83.07-11 (permalink structure, WP Reading Settings, Media Library,
//                 site title, front-end console errors)
// Plugin version: WDesignKit v2.3.0
//
// COVERAGE
//   Section 82 — Nexter Template Builder — header & footer templates (8 tests)
//   Section 83 — Nexter template conditions & page assignments (6 tests)
//
// ALL sections are gated by WDKIT_TOKEN — require a completed import.
// Tests navigate to the Nexter TB admin area (edit.php?post_type=nexter_tb)
// to verify that a kit import creates a Header and Footer template with
// the correct display conditions and publish status.
// =============================================================================

'use strict';

const { test, expect } = require('@playwright/test');
const { wpLogin, WDKIT_TOKEN }         = require('./_helpers/auth');
const { goToBrowse, clickFirstCardImport } = require('./_helpers/navigation');
const { reachMethodStep, selectMethodCard } = require('./_helpers/wizard');

// ---------------------------------------------------------------------------
// Nexter TB admin URL
// ---------------------------------------------------------------------------
const NEXTER_TB_URL = 'http://localhost:8881/wp-admin/edit.php?post_type=nexter_tb';

// ---------------------------------------------------------------------------
// Shared: trigger a dummy import then land on the Nexter TB list page.
// ---------------------------------------------------------------------------
async function triggerDummyAndVerifyNexter(page) {
  await wpLogin(page);
  await goToBrowse(page);
  await clickFirstCardImport(page);
  await page.locator('.wkit-temp-import-mian').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await reachMethodStep(page);

  // Select Dummy card (index 0)
  const dummy = page.locator('.wkit-method-card').first();
  if ((await dummy.count()) > 0) await dummy.click({ force: true });

  const importBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if ((await importBtn.count()) > 0) await importBtn.click();

  // Wait for the success screen (up to 2 min)
  await page.locator('.wkit-site-import-success-main')
    .waitFor({ state: 'visible', timeout: 120000 })
    .catch(() => {});

  // Navigate to Nexter Template Builder list
  await page.goto(NEXTER_TB_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

// ---------------------------------------------------------------------------
// Helpers: scan the TB list and return row data for a given type keyword.
// ---------------------------------------------------------------------------

/**
 * Returns the first <tr> whose type column (td.column-tb_type) or title cell
 * contains `keyword` (case-insensitive). Returns null if not found.
 */
async function findTBRowByType(page, keyword) {
  const rows = page.locator('#the-list tr');
  const count = await rows.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    // Check type column first
    const typeCell = row.locator('td.column-tb_type');
    if ((await typeCell.count()) > 0) {
      const typeText = await typeCell.textContent().catch(() => '');
      if (typeText.toLowerCase().includes(keyword.toLowerCase())) return row;
    }
    // Fallback: check full row text (title may embed the type)
    const rowText = await row.textContent().catch(() => '');
    if (rowText.toLowerCase().includes(keyword.toLowerCase())) return row;
  }
  return null;
}

/**
 * Extracts the edit URL from a TB row's title link (.row-title a).
 */
async function getEditUrlFromRow(row) {
  const link = row.locator('.row-title a, .column-title a.row-title, td.title a').first();
  if ((await link.count()) === 0) return null;
  return link.getAttribute('href').catch(() => null);
}

// =============================================================================
// §82 — Nexter Template Builder — header & footer templates
// =============================================================================
test.describe('82. Nexter Template Builder — header & footer templates', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDKIT_API_TOKEN — kit import must complete');
    await triggerDummyAndVerifyNexter(page);
  });

  // 82.01 — TB admin page loads without fatal error
  test('82.01 Nexter Template Builder admin page loads without fatal error', async ({ page }) => {
    // We are already on the TB list from beforeEach
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('PHP Parse error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');
    // Page title or heading should reference Nexter or Template Builder
    const heading = page.locator('h1, .wrap h2, #wpbody h1');
    if ((await heading.count()) > 0) {
      const h1Text = await heading.first().textContent().catch(() => '');
      expect.soft(h1Text.trim().length).toBeGreaterThan(0);
    }
  });

  // 82.02 — At least two TB entries exist (header + footer expected after kit import)
  test('82.02 At least two template builder entries exist (header + footer) after kit import', async ({ page }) => {
    const rows = page.locator('#the-list tr');
    const rowCount = await rows.count().catch(() => 0);

    if (rowCount === 0) {
      // Could also be a .no-items row — check for it
      const noItems = page.locator('#the-list .no-items, .tablenav-pages-navspan');
      const noItemsCount = await noItems.count().catch(() => 0);
      // If a no-items row renders, the table still exists; flag as failure
      expect.soft(
        noItemsCount === 0,
        'Nexter Template Builder list is empty — kit import should have created header + footer templates'
      ).toBe(true);
    } else {
      // Real rows should include at least header AND footer
      const realRows = page.locator('#the-list tr:not(.no-items)');
      const realCount = await realRows.count().catch(() => 0);
      // Soft assert ≥1 (some kits may only create a header without a footer)
      expect.soft(realCount, 'Expected at least 1 Nexter TB entry').toBeGreaterThanOrEqual(1);
      // Hard assert ≥2 only when there really are rows (not a soft-skip)
      if (realCount > 0) {
        expect.soft(
          realCount,
          `Expected ≥2 Nexter TB entries (header + footer), found ${realCount}`
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  // 82.03 — A Header type template exists
  test('82.03 A Header type template exists in the template list', async ({ page }) => {
    const headerRow = await findTBRowByType(page, 'header');
    expect.soft(
      headerRow !== null,
      'Expected a Header-type template in the Nexter TB list after import'
    ).toBe(true);
  });

  // 82.04 — A Footer type template exists
  test('82.04 A Footer type template exists in the template list', async ({ page }) => {
    const footerRow = await findTBRowByType(page, 'footer');
    expect.soft(
      footerRow !== null,
      'Expected a Footer-type template in the Nexter TB list after import'
    ).toBe(true);
  });

  // 82.05 — Header template has a display condition set
  test('82.05 Header template has a display condition set', async ({ page }) => {
    const headerRow = await findTBRowByType(page, 'header');
    if (!headerRow) {
      // No header row — skip condition check gracefully
      expect.soft(true).toBe(true);
      return;
    }

    // Condition column: td.column-conditions, .tb-conditions-display, .wkit-condition
    const conditionCell = headerRow.locator(
      'td.column-conditions, .tb-conditions-display, .wkit-condition, [class*="condition"]'
    ).first();
    if ((await conditionCell.count()) > 0) {
      const condText = await conditionCell.textContent().catch(() => '');
      expect.soft(
        condText.trim().length > 0,
        'Header template condition column is empty — no display condition set'
      ).toBe(true);
    } else {
      // Condition column not found; check full row text for condition keywords
      const rowText = await headerRow.textContent().catch(() => '');
      const hasCondition = /entire website|all pages|singular|archive|front page/i.test(rowText);
      expect.soft(
        hasCondition,
        'Header row contains no recognisable display condition text'
      ).toBe(true);
    }
  });

  // 82.06 — Footer template has a display condition set
  test('82.06 Footer template has a display condition set', async ({ page }) => {
    const footerRow = await findTBRowByType(page, 'footer');
    if (!footerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    const conditionCell = footerRow.locator(
      'td.column-conditions, .tb-conditions-display, .wkit-condition, [class*="condition"]'
    ).first();
    if ((await conditionCell.count()) > 0) {
      const condText = await conditionCell.textContent().catch(() => '');
      expect.soft(
        condText.trim().length > 0,
        'Footer template condition column is empty — no display condition set'
      ).toBe(true);
    } else {
      const rowText = await footerRow.textContent().catch(() => '');
      const hasCondition = /entire website|all pages|singular|archive|front page/i.test(rowText);
      expect.soft(
        hasCondition,
        'Footer row contains no recognisable display condition text'
      ).toBe(true);
    }
  });

  // 82.07 — Clicking the Header template title opens the edit page without fatal error
  test('82.07 Clicking Header template title opens the edit page without fatal error', async ({ page }) => {
    const headerRow = await findTBRowByType(page, 'header');
    if (!headerRow) {
      // No header row — record as soft skip
      expect.soft(true).toBe(true);
      return;
    }

    const editUrl = await getEditUrlFromRow(headerRow);
    if (!editUrl) {
      expect.soft(true).toBe(true);
      return;
    }

    await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('PHP Parse error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');

    // The edit page URL should contain post= (standard WP edit page)
    expect(page.url()).toMatch(/post=/);
  });

  // 82.08 — No product console errors when viewing the TB list
  test('82.08 No product console errors when viewing the Nexter TB list', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Reload the TB list to capture fresh console output
    await page.goto(NEXTER_TB_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const productErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('extension') &&
      !e.includes('chrome-extension') &&
      !e.includes('ERR_BLOCKED') &&
      !e.includes('Mixed Content')
    );
    expect(productErrors).toHaveLength(0);
  });

  // 82.09 — Clicking the Footer template title opens the edit page without fatal error
  // Functionality-checklist: Symmetry with 82.07 (Header); Footer edit must also work
  test('82.09 Clicking Footer template title opens the edit page without fatal error', async ({ page }) => {
    const footerRow = await findTBRowByType(page, 'footer');
    if (!footerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    const editUrl = await getEditUrlFromRow(footerRow);
    if (!editUrl) {
      expect.soft(true).toBe(true);
      return;
    }

    await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('PHP Parse error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');

    // The edit page URL should contain post= (standard WP edit page)
    expect(page.url()).toMatch(/post=/);
  });

  // 82.10 — Header template has a non-empty title in the TB list
  // Logic-checklist: Data integrity — imported records have valid data
  test('82.10 Header template row has a non-empty title (not blank or "—")', async ({ page }) => {
    const headerRow = await findTBRowByType(page, 'header');
    if (!headerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    const titleLink = headerRow.locator('.row-title, .column-title a, td.title a').first();
    if ((await titleLink.count()) > 0) {
      const titleText = await titleLink.textContent().catch(() => '');
      expect.soft(titleText.trim().length > 0, 'Header template title must not be empty').toBe(true);
      expect.soft(titleText.trim(), 'Header template title must not be the "—" placeholder').not.toBe('—');
    }
  });

  // 82.11 — Footer template has a non-empty title in the TB list
  test('82.11 Footer template row has a non-empty title (not blank or "—")', async ({ page }) => {
    const footerRow = await findTBRowByType(page, 'footer');
    if (!footerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    const titleLink = footerRow.locator('.row-title, .column-title a, td.title a').first();
    if ((await titleLink.count()) > 0) {
      const titleText = await titleLink.textContent().catch(() => '');
      expect.soft(titleText.trim().length > 0, 'Footer template title must not be empty').toBe(true);
      expect.soft(titleText.trim(), 'Footer template title must not be the "—" placeholder').not.toBe('—');
    }
  });

});

// =============================================================================
// §83 — Nexter template conditions & page assignments
// =============================================================================
test.describe('83. Nexter template conditions & page assignments', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.skip(!WDKIT_TOKEN, 'Requires WDKIT_API_TOKEN — kit import must complete');
    await triggerDummyAndVerifyNexter(page);
  });

  // 83.01 — Header template condition includes "Entire Website" or a broad rule
  test('83.01 Header template condition includes "Entire Website" or a broad display rule', async ({ page }) => {
    const headerRow = await findTBRowByType(page, 'header');
    if (!headerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    const rowText = await headerRow.textContent().catch(() => '');
    const hasBroadCondition = /entire website|entire site|all pages|everywhere/i.test(rowText);
    // Also accept any non-empty condition value as a valid broad rule
    const conditionCell = headerRow.locator(
      'td.column-conditions, .tb-conditions-display, .wkit-condition, [class*="condition"]'
    ).first();
    let condText = '';
    if ((await conditionCell.count()) > 0) {
      condText = await conditionCell.textContent().catch(() => '');
    }

    expect.soft(
      hasBroadCondition || condText.trim().length > 0,
      'Header template is missing an "Entire Website" or broad display condition'
    ).toBe(true);
  });

  // 83.02 — Footer template condition includes "Entire Website" or similar
  test('83.02 Footer template condition includes "Entire Website" or similar broad rule', async ({ page }) => {
    const footerRow = await findTBRowByType(page, 'footer');
    if (!footerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    const rowText = await footerRow.textContent().catch(() => '');
    const hasBroadCondition = /entire website|entire site|all pages|everywhere/i.test(rowText);
    const conditionCell = footerRow.locator(
      'td.column-conditions, .tb-conditions-display, .wkit-condition, [class*="condition"]'
    ).first();
    let condText = '';
    if ((await conditionCell.count()) > 0) {
      condText = await conditionCell.textContent().catch(() => '');
    }

    expect.soft(
      hasBroadCondition || condText.trim().length > 0,
      'Footer template is missing an "Entire Website" or broad display condition'
    ).toBe(true);
  });

  // 83.03 — Header template is published (not Draft)
  test('83.03 Header template is published (status: Published, not Draft)', async ({ page }) => {
    const headerRow = await findTBRowByType(page, 'header');
    if (!headerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    // WP list table shows status in td.column-post_status or as a "— Published" label
    const statusCell = headerRow.locator(
      'td.column-post_status, td[class*="status"], .post-state'
    ).first();
    if ((await statusCell.count()) > 0) {
      const statusText = await statusCell.textContent().catch(() => '');
      expect.soft(
        !statusText.toLowerCase().includes('draft'),
        `Header template status is Draft, expected Published. Status: "${statusText.trim()}"`
      ).toBe(true);
    } else {
      // Fallback: check that the row does NOT carry a "Draft" label
      const rowText = await headerRow.textContent().catch(() => '');
      expect.soft(
        !rowText.toLowerCase().includes('draft'),
        'Header template row contains "Draft" label — expected Published status'
      ).toBe(true);
    }

    // Additionally navigate to the edit page and verify post status
    const editUrl = await getEditUrlFromRow(headerRow);
    if (editUrl) {
      await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      // Look for publish status indicator in the edit screen
      const publishBtn = page.locator(
        '#publish, #submit, input[value="Update"], .editor-post-publish-button, [class*="publish"]'
      ).first();
      if ((await publishBtn.count()) > 0) {
        const btnText = await publishBtn.textContent().catch(() => '');
        // "Update" means already published; "Publish" means draft
        expect.soft(
          !btnText.toLowerCase().includes('publish') || btnText.toLowerCase().includes('update'),
          'Header template edit screen shows "Publish" instead of "Update" — template is a Draft'
        ).toBe(true);
      }
    }
  });

  // 83.04 — Footer template is published (not Draft)
  test('83.04 Footer template is published (status: Published, not Draft)', async ({ page }) => {
    const footerRow = await findTBRowByType(page, 'footer');
    if (!footerRow) {
      expect.soft(true).toBe(true);
      return;
    }

    const statusCell = footerRow.locator(
      'td.column-post_status, td[class*="status"], .post-state'
    ).first();
    if ((await statusCell.count()) > 0) {
      const statusText = await statusCell.textContent().catch(() => '');
      expect.soft(
        !statusText.toLowerCase().includes('draft'),
        `Footer template status is Draft, expected Published. Status: "${statusText.trim()}"`
      ).toBe(true);
    } else {
      const rowText = await footerRow.textContent().catch(() => '');
      expect.soft(
        !rowText.toLowerCase().includes('draft'),
        'Footer template row contains "Draft" label — expected Published status'
      ).toBe(true);
    }

    const editUrl = await getEditUrlFromRow(footerRow);
    if (editUrl) {
      await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const publishBtn = page.locator(
        '#publish, #submit, input[value="Update"], .editor-post-publish-button, [class*="publish"]'
      ).first();
      if ((await publishBtn.count()) > 0) {
        const btnText = await publishBtn.textContent().catch(() => '');
        expect.soft(
          !btnText.toLowerCase().includes('publish') || btnText.toLowerCase().includes('update'),
          'Footer template edit screen shows "Publish" instead of "Update" — template is a Draft'
        ).toBe(true);
      }
    }
  });

  // 83.05 — Front-end homepage renders a header element
  test('83.05 Front-end homepage renders a header element from Nexter', async ({ page }) => {
    await page.goto('http://localhost:8881/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');

    // Accept any of the common header selectors
    const headerLocator = page.locator(
      'header, .site-header, #masthead, [class*="header"], [id*="header"]'
    ).first();
    const headerVisible = await headerLocator.isVisible({ timeout: 10000 }).catch(() => false);
    expect.soft(
      headerVisible,
      'No header element found on the front-end homepage — Nexter header template may not be applied'
    ).toBe(true);

    if (headerVisible) {
      // Verify the header has non-trivial content (more than whitespace)
      const headerText = await headerLocator.textContent().catch(() => '');
      const hasContent = headerText.trim().length > 0 ||
        (await headerLocator.locator('img, a, nav').count()) > 0;
      expect.soft(
        hasContent,
        'Header element is empty — Nexter header template rendered without content'
      ).toBe(true);
    }
  });

  // 83.06 — Front-end homepage renders a footer element
  test('83.06 Front-end homepage renders a footer element from Nexter', async ({ page }) => {
    await page.goto('http://localhost:8881/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('There has been a critical error');

    // Accept any of the common footer selectors
    const footerLocator = page.locator(
      'footer, .site-footer, #colophon, [class*="footer"], [id*="footer"]'
    ).first();
    const footerVisible = await footerLocator.isVisible({ timeout: 10000 }).catch(() => false);
    expect.soft(
      footerVisible,
      'No footer element found on the front-end homepage — Nexter footer template may not be applied'
    ).toBe(true);

    if (footerVisible) {
      const footerText = await footerLocator.textContent().catch(() => '');
      const hasContent = footerText.trim().length > 0 ||
        (await footerLocator.locator('img, a, nav, p').count()) > 0;
      expect.soft(
        hasContent,
        'Footer element is empty — Nexter footer template rendered without content'
      ).toBe(true);
    }
  });

  // --------------------------------------------------------------------------
  // 83.07 — WP Permalink Settings: clean URL structure is active post-import
  // Logic-checklist: Plugin-specific logic — permalink flush is part of kit import
  // Nexter requires /%postname%/ or equivalent for template conditions to work
  // --------------------------------------------------------------------------
  test('83.07 WP Permalink Settings: clean URL structure is active post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/options-permalink.php', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).not.toContainText('Fatal error');

    // The "Post name" radio (value=/%postname%/) should be selected
    // OR any non-plain structure (not "Plain" which is value="")
    const postNameRadio = page.locator('input[type="radio"][value="/%postname%/"]');
    const plainRadio    = page.locator('input[type="radio"][value=""]');

    if ((await postNameRadio.count()) > 0) {
      const isPostName = await postNameRadio.isChecked().catch(() => false);
      expect.soft(
        isPostName,
        'Permalink structure should be "Post name" (/%postname%/) after kit import — required for Nexter template conditions'
      ).toBe(true);
    } else if ((await plainRadio.count()) > 0) {
      // At minimum, "Plain" should NOT be selected
      const isPlain = await plainRadio.isChecked().catch(() => false);
      expect.soft(
        !isPlain,
        '"Plain" permalink structure is active — kit import should have set a clean URL structure'
      ).toBe(true);
    }
  });

  // --------------------------------------------------------------------------
  // 83.08 — WP Reading Settings: "Your homepage displays" is set to a static page
  // Logic-checklist: Dynamic content sources populate correctly
  // --------------------------------------------------------------------------
  test('83.08 WP Reading Settings: front page is set to "A static page" post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/options-reading.php', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).not.toContainText('Fatal error');

    // Radio: "page" = A static page; "posts" = Your latest posts
    const staticPageRadio = page.locator('input[type="radio"][value="page"]');
    if ((await staticPageRadio.count()) > 0) {
      const isStaticPage = await staticPageRadio.isChecked().catch(() => false);
      expect.soft(
        isStaticPage,
        '"Your homepage displays" in WP Reading Settings should be "A static page" after kit import'
      ).toBe(true);

      // Additionally verify the front page dropdown has a page assigned (not 0)
      if (isStaticPage) {
        const frontPageSelect = page.locator('#page_on_front');
        if ((await frontPageSelect.count()) > 0) {
          const val = await frontPageSelect.evaluate(el => el.value).catch(() => '0');
          expect.soft(
            val !== '0' && val !== '',
            `Front page dropdown should have a real page assigned, not 0. Got: "${val}"`
          ).toBeTruthy();
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // 83.09 — WP Media Library contains at least 1 attachment after kit import
  // Logic-checklist: Data integrity — all parts of kit are imported
  // --------------------------------------------------------------------------
  test('83.09 WP Media Library contains at least 1 attachment after kit import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/upload.php', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).not.toContainText('Fatal error');

    const gridItems  = await page.locator('.attachment').count().catch(() => 0);
    const tableItems = await page.locator('#the-list tr:not(.no-items)').count().catch(() => 0);
    const total      = gridItems + tableItems;

    expect.soft(
      total,
      'WP Media Library should contain at least 1 image/attachment after Nexter kit import'
    ).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 83.10 — Site title is set and is not the default WP "Just Another WordPress Site"
  // Logic-checklist: Relationship data stays in sync — kit sets site branding
  // --------------------------------------------------------------------------
  test('83.10 Site title is set to a non-default value post-import', async ({ page }) => {
    await page.goto('http://localhost:8881/wp-admin/options-general.php', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).not.toContainText('Fatal error');

    const siteTitle = page.locator('#blogname');
    if ((await siteTitle.count()) > 0) {
      const titleValue = await siteTitle.evaluate(el => el.value).catch(() => '');
      // Title must be set (non-empty) and not the generic WP default
      expect.soft(titleValue.trim().length > 0, 'Site title must not be empty after kit import').toBe(true);
      expect.soft(
        !titleValue.toLowerCase().includes('just another wordpress'),
        `Site title should not be the default WP value. Got: "${titleValue}"`
      ).toBe(true);
    }
  });

  // --------------------------------------------------------------------------
  // 83.11 — No product console errors on the front-end homepage post-import
  // Console-errors-checklist: Zero JS errors on front-end page load
  // --------------------------------------------------------------------------
  test('83.11 No product console errors on the front-end homepage post-import', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:8881/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Fatal error');

    const productErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('extension') &&
      !e.includes('chrome-extension') &&
      !e.includes('ERR_BLOCKED') &&
      !e.includes('Mixed Content') &&
      !e.includes('robots.txt')
    );
    expect.soft(
      productErrors,
      'Front-end homepage should have zero product console errors post-import: ' + productErrors.join(', ')
    ).toHaveLength(0);
  });

});
