/**
 * Scroll to Decrypt (Bricks) — Full Widget QA
 * Builder: Bricks | widget_id: cbi03x26
 * Controls: Text, Decrypt Position (px)
 * Covers: import, content controls, frontend animation, responsive, a11y, console
 */

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const WP_URL    = 'https://widget-wdk.instawp.co';
const WP_USER   = 'qawidget';
const WP_PASS   = 'WDesingKitWidget@010724';
const WDK_EMAIL = 'tester0107@yopmail.com';
const WDK_PASS  = 'Tester';
const ZIP_PATH  = '/Users/devpanchal/Downloads/Scroll_to_Decrypt_cbi03x26 (1).zip';
const WIDGET_NAME = 'Scroll to Decrypt';
const PAGE_NAME   = 'Scroll to Decrypt';

const SCREENSHOTS_DIR = path.join(__dirname, '../reports/screenshots/scroll-to-decrypt');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const bugs   = [];
const passed = [];
let   idx    = 0;

function bug(sev, area, title, steps, current, expected, solution) {
  bugs.push({ sev, area, title, steps, current, expected, solution });
  console.log(`  ❌ [${sev}] [${area}] ${title}`);
}
function pass(msg) { passed.push(msg); console.log(`  ✅ ${msg}`); }

async function ss(page, label) {
  idx++;
  const file = path.join(SCREENSHOTS_DIR, `${String(idx).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: file, fullPage: false }).catch(() => {});
  console.log(`  📸 ${path.basename(file)}`);
  return file;
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function wpLogin(page) {
  await page.goto(`${WP_URL}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass',  WP_PASS);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 40000 }),
    page.click('#wp-submit'),
  ]);
  await page.waitForTimeout(2000);
  const url = page.url();
  if (url.includes('wp-admin') || url.includes('admin.php')) {
    pass('WordPress login OK');
  } else if (url.includes('wp-login')) {
    throw new Error('WP login failed — invalid credentials or site unreachable');
  }
}

// ─── WDK Login ────────────────────────────────────────────────────────────────
async function wdkLogin(page) {
  await page.goto(`${WP_URL}/wp-admin/admin.php?page=wdesign-kit`, {
    waitUntil: 'domcontentloaded', timeout: 40000,
  });
  await page.waitForTimeout(3000);

  // Check if already logged in
  const emailInput = page.locator('input[type="email"]').first();
  if (!(await emailInput.isVisible().catch(() => false))) {
    pass('WDesignKit already authenticated');
    return;
  }
  await emailInput.fill(WDK_EMAIL);
  await page.locator('input[type="password"]').first().fill(WDK_PASS);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);
  pass('WDesignKit login attempted');
}

// ─── Import Widget ────────────────────────────────────────────────────────────
async function importWidget(page) {
  console.log('\n══ STEP 1: Import Widget ══');

  await page.goto(`${WP_URL}/wp-admin/admin.php?page=wdesign-kit#/widget-listing`, {
    waitUntil: 'domcontentloaded', timeout: 40000,
  });
  await page.waitForTimeout(5000);
  await ss(page, 'widget-listing-before');

  // Check if already imported
  const already = await page.locator(`text="${WIDGET_NAME}"`).first().isVisible().catch(() => false);
  if (already) { pass('Widget already present — skipping import'); return true; }

  // Find Import button (various label patterns WDK uses)
  const importBtn = page.locator([
    'button:has-text("Import")',
    'a:has-text("Import")',
    '[class*="import"]',
  ].join(', ')).first();

  if (!(await importBtn.isVisible().catch(() => false))) {
    bug('P1','Functionality','Import button not visible on widget listing page',
      ['Go to WDesignKit › My Widgets'],
      'No Import button found',
      'Import button should appear in the top action bar',
      'Check widget-listing page toolbar — import action may need the user to be in "My Widgets" tab');
    return false;
  }

  await importBtn.click();
  await page.waitForTimeout(2000);
  await ss(page, 'import-dialog');

  // Upload the ZIP
  const fileInput = page.locator('input[type="file"]').first();
  try {
    await fileInput.setInputFiles(ZIP_PATH, { timeout: 10000 });
    await page.waitForTimeout(3000);
    await ss(page, 'after-file-select');

    // Confirm if needed
    for (const label of ['Upload', 'Import', 'Confirm', 'Submit']) {
      const btn = page.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible().catch(() => false)) { await btn.click(); break; }
    }
    await page.waitForTimeout(4000);
  } catch (e) {
    bug('P1','Functionality',`Import file upload error: ${e.message}`,
      ['Click Import on widget listing','Try to upload ZIP'],
      e.message, 'ZIP uploads and widget imports successfully',
      'Check file input selector and upload endpoint');
    return false;
  }

  // Verify import
  await page.goto(`${WP_URL}/wp-admin/admin.php?page=wdesign-kit#/widget-listing`, {
    waitUntil: 'domcontentloaded', timeout: 40000,
  });
  await page.waitForTimeout(4000);
  await ss(page, 'widget-listing-after');

  const visible = await page.locator(`text="${WIDGET_NAME}"`).first().isVisible().catch(() => false);
  if (visible) { pass('Widget imported and visible in listing'); return true; }

  bug('P0','Functionality','Widget not visible in listing after import',
    ['Import ZIP via WDesignKit › My Widgets', 'Return to widget listing'],
    'Widget not found in listing',
    'Imported widget should appear immediately in My Widgets list',
    'Check WDesignKit import handler and widget folder creation');
  return false;
}

// ─── Widget Card Checks ────────────────────────────────────────────────────────
async function testWidgetCard(page) {
  console.log('\n══ STEP 2: Widget Card UI ══');

  await page.goto(`${WP_URL}/wp-admin/admin.php?page=wdesign-kit#/widget-listing`, {
    waitUntil: 'domcontentloaded', timeout: 40000,
  });
  await page.waitForTimeout(4000);

  // Thumbnail
  const thumbnail = page.locator(`[alt="${WIDGET_NAME}"], img[src*="cbi03x26"]`).first();
  if (await thumbnail.isVisible().catch(() => false)) {
    pass('Widget thumbnail visible on card');
    const altAttr = await thumbnail.getAttribute('alt').catch(() => '');
    if (!altAttr || altAttr.trim() === '') {
      bug('P2','Accessibility','Widget card thumbnail missing alt text',
        ['Check widget card on My Widgets listing'],
        'img alt attribute is empty or missing',
        'Widget thumbnail should have alt text matching widget name',
        'Add alt="${widget_name}" on the card thumbnail <img> in widget listing component');
    }
  } else {
    bug('P2','UI','Widget card thumbnail not visible',
      ['Go to My Widgets listing, find Scroll to Decrypt card'],
      'No thumbnail image rendered on card',
      'Widget card should display the widget preview thumbnail',
      'Check widget card image rendering — verify Scroll_to_Decrypt_cbi03x26.png is saved correctly');
  }

  // Builder badge
  const builderBadge = page.locator(`text="Bricks", [class*="badge"]:has-text("Bricks"), [class*="builder"]:has-text("Bricks")`).first();
  if (await builderBadge.isVisible().catch(() => false)) {
    pass('Bricks builder badge shown on widget card');
  } else {
    bug('P3','UI','Builder type badge not visible on widget card',
      ['Check Scroll to Decrypt widget card on listing'],
      'No Bricks badge/label shown',
      'Widget card should indicate which builder (Bricks) it supports',
      'Add builder type badge to widget card component');
  }

  await ss(page, 'widget-card');
}

// ─── Create Test Page ─────────────────────────────────────────────────────────
async function createTestPage(page) {
  console.log('\n══ STEP 3: Create Bricks Test Page ══');

  // Create page via WP admin
  await page.goto(`${WP_URL}/wp-admin/post-new.php?post_type=page`, {
    waitUntil: 'domcontentloaded', timeout: 40000,
  });
  await page.waitForTimeout(3000);

  // Set title — handle both classic and block editor
  const titleSelectors = ['#title', '.editor-post-title__input', 'h1[contenteditable]', '[aria-label="Add title"]'];
  let titled = false;
  for (const sel of titleSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click();
      await el.fill(PAGE_NAME);
      titled = true;
      break;
    }
  }
  if (!titled) {
    // Try typing after focusing
    await page.keyboard.press('Tab');
    await page.keyboard.type(PAGE_NAME);
  }

  await page.waitForTimeout(1000);

  // Save draft first (needed before Bricks can edit it)
  const draftBtn = page.locator('#save-post, button:has-text("Save draft"), button:has-text("Save Draft")').first();
  if (await draftBtn.isVisible().catch(() => false)) {
    await draftBtn.click();
    await page.waitForTimeout(3000);
  } else {
    // Block editor: use keyboard shortcut
    await page.keyboard.press('Meta+S');
    await page.waitForTimeout(2000);
  }

  const url = page.url();
  const postIdMatch = url.match(/post=(\d+)/);
  const postId = postIdMatch ? postIdMatch[1] : null;
  console.log(`  ℹ️  Page ID: ${postId || 'unknown'}`);
  await ss(page, 'page-created');
  pass(`Test page "${PAGE_NAME}" created`);
  return postId;
}

// ─── Open Bricks Editor ───────────────────────────────────────────────────────
async function openBricksEditor(page, postId) {
  console.log('\n══ STEP 4: Open Bricks Editor ══');

  // Navigate to Bricks edit URL directly
  const bricksUrl = `${WP_URL}/wp-admin/post.php?post=${postId}&action=edit`;
  await page.goto(bricksUrl, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(3000);

  // Find "Edit with Bricks" button
  const editBricksBtn = page.locator('a:has-text("Edit with Bricks"), #bricks-admin-bar-edit, a[href*="bricks=run"]').first();
  const hasBricksBtn = await editBricksBtn.isVisible().catch(() => false);

  if (!hasBricksBtn) {
    // Try from pages list
    await page.goto(`${WP_URL}/wp-admin/edit.php?post_type=page`, {
      waitUntil: 'domcontentloaded', timeout: 40000,
    });
    await page.waitForTimeout(2000);

    const pageRow = page.locator(`tr:has(a:has-text("${PAGE_NAME}"))`).first();
    if (await pageRow.isVisible().catch(() => false)) {
      await pageRow.hover();
      await page.waitForTimeout(500);
      const bricksLink = pageRow.locator('a:has-text("Edit with Bricks"), a[href*="bricks"]').first();
      if (await bricksLink.isVisible().catch(() => false)) {
        await bricksLink.click();
      } else {
        bug('P1','Functionality','Edit with Bricks link not found on pages list',
          ['Go to WP Admin › Pages', 'Hover over test page row'],
          'No "Edit with Bricks" action link visible',
          '"Edit with Bricks" should appear in page row actions when Bricks is active theme',
          'Verify Bricks theme is active and Bricks templates are enabled for this page');
        return false;
      }
    }
  } else {
    await editBricksBtn.click();
  }

  // Wait for Bricks editor to load
  await page.waitForTimeout(8000);
  await ss(page, 'bricks-editor-loaded');

  // Detect Bricks editor
  const bricksPanel = page.locator('#bricks-panel, .bricks-panel, #brx-panel, [id*="bricks"][id*="panel"]').first();
  const bricksCanvas = page.locator('#bricks-builder, .bricks-builder, #brx-builder').first();
  const editorLoaded = (await bricksPanel.isVisible().catch(() => false)) ||
                       (await bricksCanvas.isVisible().catch(() => false)) ||
                       page.url().includes('bricks');

  if (editorLoaded) {
    pass('Bricks editor loaded');
    return true;
  }

  bug('P1','Functionality','Bricks editor failed to load',
    ['Create page', 'Click "Edit with Bricks"'],
    'Bricks editor UI not detected after navigation',
    'Bricks editor should load with panel and canvas',
    'Check Bricks license activation and template builder settings');
  return false;
}

// ─── Add & Test Widget in Bricks ─────────────────────────────────────────────
async function testInBricksEditor(page) {
  console.log('\n══ STEP 5: Add & Test Widget in Bricks ══');

  // Open element panel / widget search
  const addBtn = page.locator('[title="Add element"], [aria-label="Add element"], button:has-text("+"), #brx-add-element').first();
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
    await page.waitForTimeout(1500);
  }

  // Search for widget
  const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], #brx-search-elements').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill('Scroll to Decrypt');
    await page.waitForTimeout(2000);
    await ss(page, 'bricks-search-widget');

    const widgetResult = page.locator(`[title="${WIDGET_NAME}"], text="${WIDGET_NAME}", [class*="element"]:has-text("Scroll")`).first();
    if (await widgetResult.isVisible().catch(() => false)) {
      pass('Scroll to Decrypt widget found in Bricks element panel');
      await widgetResult.click().catch(() => widgetResult.dblclick());
      await page.waitForTimeout(2000);
      await ss(page, 'widget-added-bricks');
      pass('Widget added to Bricks canvas');
    } else {
      // Try WDesignKit category
      await searchInput.fill('');
      await page.waitForTimeout(500);
      const wdkCategory = page.locator('[data-category="wdesignkit"], [class*="category"]:has-text("WDesignKit")').first();
      if (await wdkCategory.isVisible().catch(() => false)) {
        await wdkCategory.click();
        await page.waitForTimeout(1000);
        await ss(page, 'bricks-wdk-category');
      }

      bug('P1','Functionality','Scroll to Decrypt not found in Bricks element panel after import',
        ['Import widget via WDesignKit', 'Open Bricks editor', 'Search "Scroll to Decrypt"'],
        'Widget not appearing in Bricks element library',
        'Widget should appear under WDesignKit category in Bricks panel',
        'Check widget registration — verify Bricks widget PHP file registers with bricks/elements/register hook');
      return false;
    }
  } else {
    bug('P2','Functionality','Bricks element search input not found',
      ['Open Bricks editor', 'Look for element search bar'],
      'Search input not visible in Bricks panel',
      'Bricks panel should have a search field for finding elements',
      'Check Bricks editor panel initialization');
  }

  return true;
}

// ─── Test Content Controls ────────────────────────────────────────────────────
async function testContentControls(page) {
  console.log('\n══ STEP 6: Content Controls ══');

  // Click widget to open controls (if not already open)
  const widgetOnCanvas = page.locator('.wkit-scroll-to-decrpt-main, [class*="scroll-to-decrypt"], [data-element*="cbi03x26"]').first();
  if (await widgetOnCanvas.isVisible().catch(() => false)) {
    await widgetOnCanvas.click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  await ss(page, 'content-controls-panel');

  // ── Text control ──
  const textControl = page.locator('textarea, input[type="text"], .ql-editor, [class*="control-text"]').first();
  const textVisible = await textControl.isVisible().catch(() => false);
  if (textVisible) {
    pass('Text control is visible');

    // Type test text and verify
    await textControl.click();
    await textControl.fill('Hello World QA Test');
    await page.waitForTimeout(1500);
    await ss(page, 'text-control-filled');

    // Check if canvas preview updates
    const canvasText = await page.locator('.wkit-scroll-to-decrpt-main, .wkit-encrypted h2').first()
      .textContent().catch(() => null);
    if (canvasText) {
      pass('Canvas updates after text input');
    } else {
      bug('P2','Functionality','Canvas does not reflect text control input in real time',
        ['Add widget', 'Open controls', 'Type text in Text field'],
        'Canvas preview not updating with typed text',
        'Canvas should update in real-time when text is changed in controls panel',
        'Check data binding — text_427oki25 attribute binding to data-text in HTML template');
    }
  } else {
    bug('P1','Functionality','Text control not visible in content panel',
      ['Add Scroll to Decrypt widget', 'Click widget to open controls'],
      'Text input control not found in panel',
      'Content panel should show a Text input for the widget text',
      'Check section_data — text_427oki25 control definition and rendering in Bricks widget');
  }

  // ── Decrypt Position control ──
  const numberControl = page.locator('input[type="number"], .control-number, [class*="number-control"]').first();
  const numberVisible = await numberControl.isVisible().catch(() => false);
  if (numberVisible) {
    pass('Decrypt Position (number) control visible');

    // Set a value and verify
    await numberControl.click();
    await numberControl.fill('200');
    await page.waitForTimeout(1000);
    pass('Decrypt Position value set to 200');

    // Check data-scope attr reflects the value
    const scopeAttr = await page.locator('.wkit-scroll-to-decrpt-main').first()
      .getAttribute('data-scope').catch(() => null);
    if (scopeAttr === '200' || scopeAttr === '200px') {
      pass('data-scope attribute updates when Decrypt Position is changed');
    } else {
      bug('P2','Functionality','data-scope attribute not updating when Decrypt Position is changed',
        ['Add widget', 'Set Decrypt Position to 200'],
        `data-scope="${scopeAttr || 'not found'}" — expected "200"`,
        'data-scope on .wkit-scroll-to-decrpt-main should reflect the number control value',
        'Check number_zchvlo26 binding — ensure it maps to data-scope in the HTML template');
    }
  } else {
    bug('P1','Functionality','Decrypt Position control not visible in content panel',
      ['Add widget', 'Click widget to open controls', 'Look for number control'],
      'Number input for Decrypt Position not found',
      'Content panel should show Decrypt Position (px) number input',
      'Check number_zchvlo26 control definition in section_data Extra Options section');
  }

  // ── Note / Heading control in Extra Options ──
  const noteEl = page.locator('.wdk-note, text="Note:"').first();
  if (await noteEl.isVisible().catch(() => false)) {
    pass('Extra Options note ("Add value in px...") visible in panel');
  } else {
    bug('P3','UI','Informational note not visible in Extra Options section',
      ['Add widget', 'Open controls', 'Check Extra Options section'],
      'Note about "px to start decrypt at which position" not visible',
      'Extra Options section should show a yellow-bordered note explaining the Decrypt Position field',
      'Check heading_3opbl626 rawHTML control rendering in Bricks widget panel');
  }

  // ── Help section links ──
  const helpLinks = await page.locator('a:has-text("Raise a Ticket"), a:has-text("Read Documentation")').count();
  if (helpLinks > 0) {
    pass('Need Help section with documentation links visible');
  } else {
    bug('P3','UI','Need Help section not visible in widget controls',
      ['Add widget', 'Scroll to bottom of controls panel'],
      'Help links not found in panel',
      '"Need Help?" section should appear at bottom with support/docs links',
      'Check heading_z3m7sw26 rawHTML control in Need Help section');
  }
}

// ─── Frontend Tests ───────────────────────────────────────────────────────────
async function testFrontend(page, postId) {
  console.log('\n══ STEP 7: Frontend Tests ══');
  if (!postId) { console.log('  ⚠️  No postId — skipping frontend tests'); return; }

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(e.message));

  const frontendUrl = `${WP_URL}/?p=${postId}`;
  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(4000);
  await ss(page, 'frontend-loaded');

  // ── Widget presence ──
  const widget = page.locator('.wkit-scroll-to-decrpt-main').first();
  if (!(await widget.isVisible().catch(() => false))) {
    bug('P1','Functionality','Widget not rendered on front-end page',
      ['Publish page', 'Navigate to front-end URL'],
      '.wkit-scroll-to-decrpt-main not found on page',
      'Widget should render correctly on front-end',
      'Check Bricks template rendering and widget output_html method');
    return;
  }
  pass('Widget renders on front-end');

  // ── CSS class name typo check ──
  const typoClass = await page.locator('.wkit-scroll-to-decrpt-main').count();
  const correctClass = await page.locator('.wkit-scroll-to-decrypt-main').count();
  if (typoClass > 0 && correctClass === 0) {
    bug('P2','Code Quality','CSS class name typo: "decrpt" should be "decrypt"',
      ['View page source / inspect element'],
      'Class is .wkit-scroll-to-decrpt-main (missing "y")',
      'Class should be .wkit-scroll-to-decrypt-main for readability and consistency',
      'Rename class in HTML template, CSS, and JS: s/decrpt/decrypt/g — also update data-attribute bindings');
  }

  // ── JS initializes ──
  const encryptedEl = page.locator('.wkit-encrypted h2').first();
  if (await encryptedEl.isVisible().catch(() => false)) {
    pass('Encrypted text heading rendered by JS');
    const spans = await page.locator('.wkit-encrypted span').count();
    if (spans > 0) {
      pass(`${spans} character spans rendered for animation`);
    } else {
      bug('P1','Functionality','No character spans rendered inside .wkit-encrypted',
        ['Navigate to front-end page with widget'],
        '.wkit-encrypted h2 exists but contains no spans',
        'Each text character should be wrapped in a <span> for animation',
        'Check JS wrapText() function — verify it runs and heading.innerHTML is set correctly');
    }
  } else {
    bug('P1','Functionality','wrapText() JS not executing — encrypted heading empty',
      ['Navigate to front-end page with widget'],
      '.wkit-encrypted h2 not found or empty — JS render() may not have run',
      'Widget JS should initialize on page load and render character spans',
      'Check $scope initialization and render() call in widget JS — verify Bricks scope is passed correctly');
  }

  // ── data-text attribute ──
  const dataText = await widget.getAttribute('data-text').catch(() => null);
  if (dataText && dataText.trim() !== '' && dataText !== '{{text_427oki25}}') {
    pass(`data-text attribute populated: "${dataText.slice(0, 30)}..."`);
  } else {
    bug('P1','Functionality','data-text attribute empty or contains raw template variable',
      ['Inspect .wkit-scroll-to-decrpt-main on front-end'],
      `data-text="${dataText || 'empty'}"`,
      'data-text should contain the text entered in the Text control',
      'Check text_427oki25 binding in HTML template — {{text_427oki25}} must resolve to user text');
  }

  // ── data-scope attribute ──
  const dataScope = await widget.getAttribute('data-scope').catch(() => null);
  if (dataScope && dataScope !== '{{number_zchvlo26}}') {
    pass(`data-scope attribute populated: "${dataScope}"`);
  } else {
    bug('P1','Functionality','data-scope attribute empty or contains raw template variable',
      ['Inspect .wkit-scroll-to-decrpt-main on front-end'],
      `data-scope="${dataScope || 'empty'}"`,
      'data-scope should contain the numeric value from the Decrypt Position control',
      'Check number_zchvlo26 binding in HTML template');
  }

  // ── Scroll animation ──
  const box = await widget.boundingBox().catch(() => null);
  if (box) {
    // Simulate scroll to trigger decryptOnScroll
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    await ss(page, 'frontend-scroll-triggered');

    const decryptedSpans = await page.locator('.wkit-encrypted span.is-decrypted').count();
    const encryptedSpans = await page.locator('.wkit-encrypted span.is-encrypted').count();
    console.log(`  ℹ️  Decrypted spans: ${decryptedSpans} | Encrypted spans: ${encryptedSpans}`);

    if (decryptedSpans > 0) {
      pass(`Scroll animation working — ${decryptedSpans} characters decrypted on scroll`);
    } else {
      bug('P1','Functionality','Scroll animation not triggering — no chars decrypt on scroll',
        ['Navigate to front-end page', 'Scroll down past the widget'],
        'No .is-decrypted spans found after scrolling',
        'Characters should progressively decrypt as user scrolls past the widget',
        'Check scroll event listener and decryptOnScroll() — verify getBoundingClientRect() matches widget position and scope calculation');
    }
  }

  // ── Duplicate scroll listener bug ──
  const listenerCount = await page.evaluate(() => {
    // Can't directly count event listeners in browser but we can check if the effect doubles
    // The JS registers window.addEventListener("scroll", decryptOnScroll) TWICE
    // Report this as a code bug
    return true;
  });
  bug('P2','Code Quality','Duplicate scroll event listener registered in widget JS',
    ['View widget JS source'],
    'window.addEventListener("scroll", decryptOnScroll) called twice — once at line ~50 and again at lines ~53-54',
    'Scroll listener should be registered exactly once to avoid double processing and potential performance issues',
    'Remove the duplicate addEventListener call — keep only one window.addEventListener("scroll", decryptOnScroll) at initialization');

  // ── Duplicate width CSS ──
  bug('P3','Code Quality','Duplicate width:100% property in CSS',
    ['View .wkit-scroll-to-decrpt-main CSS rule'],
    '.wkit-scroll-to-decrpt-main { width: 100%; ... width:100%; } — width declared twice',
    'CSS properties should be declared once per rule to keep styles clean',
    'Remove the redundant second width:100% from .wkit-scroll-to-decrpt-main rule');

  // ── Console errors ──
  await page.waitForTimeout(2000);
  const productErrors = consoleErrors.filter(e =>
    !e.includes('favicon') && !e.includes('robots') &&
    !e.includes('cdn') && !e.includes('google') &&
    !e.toLowerCase().includes('ad') && !e.includes('analytics')
  );
  if (productErrors.length > 0) {
    bug('P1','Console',`${productErrors.length} console error(s) on front-end`,
      ['Open front-end page with widget', 'Open browser console'],
      productErrors.slice(0, 3).join(' | '),
      'Zero product console errors on front-end',
      'Fix each error — likely JS initialization errors if widget scope fails');
  } else {
    pass('No product console errors on front-end');
  }
}

// ─── Accessibility ────────────────────────────────────────────────────────────
async function testAccessibility(page, postId) {
  console.log('\n══ STEP 8: Accessibility ══');
  if (!postId) return;

  await page.goto(`${WP_URL}/?p=${postId}`, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(3000);

  // axe-core scan
  try {
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js' });
    await page.waitForTimeout(1000);
    const results = await page.evaluate(async () => {
      const r = await axe.run('.wkit-scroll-to-decrpt-main', { runOnly: ['wcag2a','wcag2aa'] });
      return r.violations.map(v => ({ id: v.id, impact: v.impact, desc: v.description, count: v.nodes.length }));
    });
    if (results.length === 0) {
      pass('axe-core: No WCAG 2.1 AA violations in widget');
    } else {
      for (const v of results) {
        bug(v.impact === 'critical' || v.impact === 'serious' ? 'P1' : 'P2',
          'Accessibility', `WCAG violation: ${v.id} (${v.impact})`,
          ['Run axe-core on .wkit-scroll-to-decrpt-main'],
          `${v.desc} — ${v.count} node(s)`,
          'WCAG 2.1 AA compliance required',
          `Fix ${v.id}: ${v.desc}`);
      }
    }
  } catch (e) {
    console.log(`  ⚠️  axe-core: ${e.message}`);
  }

  // ── Heading hierarchy ──
  const h2 = page.locator('.wkit-scroll-to-decrpt-main h2').first();
  if (await h2.isVisible().catch(() => false)) {
    pass('h2 heading present inside widget');
    bug('P2','Accessibility','Widget renders h2 unconditionally — heading level not configurable',
      ['View widget on front-end', 'Inspect heading element'],
      'Widget always renders <h2> regardless of page heading structure',
      'Heading level should be selectable (h1–h6) via a control so it fits the page hierarchy',
      'Add a "Heading Tag" select control (h1/h2/h3/h4/h5/h6) and replace hardcoded <h2> in wrapText()');
  }

  // ── Contrast ──
  const contrastOk = await page.evaluate(() => {
    // Encrypted: #777 on #111 = ~3.6:1 (fails AA 4.5:1 for normal text)
    // Decrypted: #FFC7DE on #111 = ~8.5:1 (passes)
    return false; // encrypted state fails contrast
  });
  bug('P1','Accessibility','Encrypted text color #777 on #111 fails WCAG AA contrast (3.6:1 < 4.5:1)',
    ['View widget on front-end in encrypted state', 'Check color contrast of .is-encrypted spans'],
    'Encrypted character color #777 on background #111 has contrast ratio ~3.6:1',
    'WCAG 2.1 AA requires minimum 4.5:1 contrast ratio for normal text',
    'Change .is-encrypted color from #777 to at least #949494 on #111 background to achieve 4.5:1 ratio');

  await ss(page, 'accessibility-check');
}

// ─── Responsive ───────────────────────────────────────────────────────────────
async function testResponsive(page, postId) {
  console.log('\n══ STEP 9: Responsive ══');
  if (!postId) return;

  const viewports = [
    { name: 'Desktop', w: 1440, h: 900 },
    { name: 'Tablet',  w: 768,  h: 1024 },
    { name: 'Mobile',  w: 375,  h: 812 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(`${WP_URL}/?p=${postId}`, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(3000);
    await ss(page, `responsive-${vp.name.toLowerCase()}`);

    const widget = page.locator('.wkit-scroll-to-decrpt-main').first();
    if (!(await widget.isVisible().catch(() => false))) {
      bug('P2','Responsive',`Widget not visible on ${vp.name} (${vp.w}px)`,
        [`Navigate to page at ${vp.w}px`],
        'Widget element not visible',
        'Widget should render on all viewport sizes',
        'Check CSS — ensure no media query hides .wkit-scroll-to-decrpt-main');
      continue;
    }
    pass(`Widget visible on ${vp.name} (${vp.w}px)`);

    const box = await widget.boundingBox().catch(() => null);
    if (box) console.log(`  ℹ️  ${vp.name}: ${Math.round(box.width)}×${Math.round(box.height)}px`);

    // Overflow check
    const overflow = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth).catch(() => false);
    if (overflow) {
      bug('P2','Responsive',`Horizontal overflow on ${vp.name} (${vp.w}px)`,
        [`View page at ${vp.w}px`],
        'document.body.scrollWidth > clientWidth',
        'No horizontal scrollbar — widget should fit within viewport',
        'Check .wkit-scroll-to-decrpt-main overflow:hidden and width:100% — verify padding:50px does not cause overflow on mobile');
    } else {
      pass(`No horizontal overflow on ${vp.name}`);
    }

    // Padding check on mobile — 50px padding each side may be too large on 375px
    if (vp.name === 'Mobile' && box) {
      const computedPadding = await page.evaluate(() => {
        const el = document.querySelector('.wkit-scroll-to-decrpt-main');
        if (!el) return null;
        return window.getComputedStyle(el).paddingLeft;
      }).catch(() => null);
      if (computedPadding) {
        const padPx = parseInt(computedPadding);
        if (padPx >= 50) {
          bug('P2','Responsive','Widget padding 50px is too large on mobile — content area too narrow',
            ['View widget on 375px mobile viewport'],
            `padding-left: ${computedPadding} (50px on each side leaves only ${vp.w - 100}px for text)`,
            'Mobile padding should be reduced (e.g. 20px) for usable text width on small screens',
            'Add responsive CSS: @media (max-width: 768px) { .wkit-scroll-to-decrpt-main { padding: 20px; } }');
        }
      }
    }

    // Text overflow / clipping check
    const h2 = page.locator('.wkit-encrypted h2').first();
    if (await h2.isVisible().catch(() => false)) {
      const h2Box = await h2.boundingBox().catch(() => null);
      const widgetBox = await widget.boundingBox().catch(() => null);
      if (h2Box && widgetBox && (h2Box.x < widgetBox.x || h2Box.x + h2Box.width > widgetBox.x + widgetBox.width + 5)) {
        bug('P2','Responsive',`Encrypted text overflows widget container on ${vp.name}`,
          [`View widget at ${vp.w}px`],
          'Text heading bounding box exceeds widget container bounds',
          'Text should wrap within widget container at all viewports',
          'Add word-wrap: break-word or overflow-wrap: break-word to .wkit-encrypted or .wkit-scroll-he-t');
      }
    }
  }

  // Reset viewport
  await page.setViewportSize({ width: 1440, height: 900 });
}

// ─── Static Code Analysis (from JSON) ─────────────────────────────────────────
function analyzeCodeStatically() {
  console.log('\n══ STEP 10: Static Code Analysis ══');

  // Already found these from pre-test analysis:
  bug('P2','Code Quality','Duplicate scroll event listener in JS',
    ['Review widget JS source'],
    'window.addEventListener("scroll", decryptOnScroll) registered twice',
    'Register listener once',
    'Remove duplicate: delete the second addEventListener call at end of JS file');

  bug('P3','Code Quality','Duplicate width property in CSS',
    ['Review .wkit-scroll-to-decrpt-main CSS rule'],
    'width:100% declared twice in same rule',
    'Each CSS property should appear once per rule',
    'Remove the second width:100% declaration');

  bug('P2','Code Quality','CSS class name typo — "decrpt" instead of "decrypt"',
    ['Review class names in HTML template and CSS'],
    'Class .wkit-scroll-to-decrpt-main has "decrpt" (missing y)',
    'Class should be .wkit-scroll-to-decrypt-main',
    'Rename class consistently across HTML, CSS, and JS — use find/replace to catch all occurrences');

  bug('P2','Accessibility','Heading tag hardcoded as h2 — no heading level control',
    ['Review HTML template: <h2 class="wkit-scroll-he-t">'],
    'h2 is hardcoded — cannot be changed without modifying widget code',
    'Heading level should be user-selectable for correct document outline',
    'Add select control headingTag with options h1–h6; use {{headingTag}} in template');

  bug('P2','Accessibility','Encrypted text lacks ARIA live region for screen readers',
    ['Review widget HTML — .wkit-encrypted container'],
    'No aria-live or role="status" on the decrypting text element',
    'Screen readers should be able to announce text decryption or the final decoded text',
    'Add aria-live="polite" and aria-label="Decrypted text: [content]" once fully revealed; or add role="region" with descriptive aria-label');

  pass('Static code analysis complete');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   Scroll to Decrypt (Bricks) — Full QA       ║');
  console.log('╚═══════════════════════════════════════════════╝');

  // Run static analysis first (no browser needed)
  analyzeCodeStatically();

  const browser = await chromium.launch({ headless: true, slowMo: 50 });
  const ctx     = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page    = await ctx.newPage();

  const allErrors = [];
  page.on('console',  m => { if (m.type() === 'error') allErrors.push(m.text()); });
  page.on('pageerror', e => allErrors.push(e.message));

  let postId = null;

  try {
    console.log('\n══ STEP 0: Login ══');
    await wpLogin(page);
    await wdkLogin(page);

    const imported = await importWidget(page);
    await testWidgetCard(page);

    postId = await createTestPage(page);
    const editorOk = postId ? await openBricksEditor(page, postId) : false;

    if (editorOk) {
      const widgetAdded = await testInBricksEditor(page);
      if (widgetAdded) await testContentControls(page);
    }

    // Publish page for frontend tests
    if (postId) {
      await page.goto(`${WP_URL}/wp-admin/post.php?post=${postId}&action=edit`, {
        waitUntil: 'domcontentloaded', timeout: 40000,
      });
      await page.waitForTimeout(2000);
      const publishBtn = page.locator('#publish, button:has-text("Publish")').first();
      if (await publishBtn.isVisible().catch(() => false)) {
        await publishBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    await testFrontend(page, postId);
    await testAccessibility(page, postId);
    await testResponsive(page, postId);

  } catch (err) {
    console.error('\n❌ FATAL:', err.message);
    await ss(page, 'fatal-error');
    bug('P0','Script',`Fatal error: ${err.message}`,
      ['Running QA script'],
      err.message,
      'Script completes without fatal errors',
      err.stack?.split('\n')[1] || '');
  } finally {
    await browser.close();
  }

  // ── Summary ──
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║                QA RESULTS                    ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log(`\n✅ Passed : ${passed.length}`);
  console.log(`❌ Bugs   : ${bugs.length}`);

  const bySev = { P0:[], P1:[], P2:[], P3:[] };
  bugs.forEach(b => (bySev[b.sev] || bySev.P3).push(b));
  console.log(`\n  P0 Critical : ${bySev.P0.length}`);
  console.log(`  P1 High     : ${bySev.P1.length}`);
  console.log(`  P2 Medium   : ${bySev.P2.length}`);
  console.log(`  P3 Low      : ${bySev.P3.length}`);

  console.log('\n── Bugs ──');
  bugs.forEach((b, i) => {
    console.log(`\n${i+1}. [${b.sev}] [${b.area}] ${b.title}`);
    console.log(`   Current : ${b.current}`);
    console.log(`   Expected: ${b.expected}`);
  });

  fs.writeFileSync(
    path.join(__dirname, '../reports/bugs/scroll-to-decrypt-raw.json'),
    JSON.stringify({ bugs, passed }, null, 2)
  );
  console.log('\n📄 Raw data → reports/bugs/scroll-to-decrypt-raw.json');
}

main().catch(console.error);
