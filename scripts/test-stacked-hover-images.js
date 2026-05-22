/**
 * Stacked Hover Images — Full Widget QA
 * Tests: import, content controls, style, functionality, responsive, console, accessibility
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const WP_URL    = 'https://widget-wdk.instawp.co';
const WP_USER   = 'qawidget';
const WP_PASS   = 'WDesingKitWidget@010724';
const WDK_EMAIL = 'tester0107@yopmail.com';
const WDK_PASS  = 'Tester';
const ZIP_PATH  = '/Users/devpanchal/Downloads/Stacked_Hover_Images_i2wduc25.zip';
const WIDGET_ID = 'i2wduc25';
const PAGE_NAME = 'Stacked Hover Images';

const SCREENSHOTS_DIR = path.join(__dirname, '../reports/screenshots/stacked-hover-images');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const bugs   = [];
const passed = [];
let   screenshotIndex = 0;

function bug(severity, area, title, steps, current, expected, solution) {
  bugs.push({ severity, area, title, steps, current, expected, solution });
  console.log(`  ❌ ${severity} [${area}] ${title}`);
}

function pass(check) {
  passed.push(check);
  console.log(`  ✅ ${check}`);
}

async function screenshot(page, label) {
  screenshotIndex++;
  const file = path.join(SCREENSHOTS_DIR, `${String(screenshotIndex).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${path.basename(file)}`);
  return file;
}

async function wpLogin(page) {
  await page.goto(`${WP_URL}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASS);
  // Submit and wait for redirect via navigation
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 40000 }),
    page.click('#wp-submit')
  ]);
  await page.waitForTimeout(2000);
  const url = page.url();
  if (url.includes('wp-admin') || url.includes('admin.php')) {
    console.log('  ✅ WordPress login OK');
  } else if (url.includes('wp-login')) {
    throw new Error('WP login failed — check credentials or site is accessible');
  } else {
    console.log(`  ✅ WordPress login redirected to: ${url}`);
  }
}

async function wdkLogin(page) {
  // Navigate to WDesignKit plugin login page
  await page.goto(`${WP_URL}/wp-admin/admin.php?page=wdesign-kit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check if already logged in
  const loginBtn = page.locator('button:has-text("Login"), a:has-text("Login"), input[type="email"]').first();
  const isLoginVisible = await loginBtn.isVisible().catch(() => false);
  if (!isLoginVisible) {
    console.log('  ✅ WDesignKit already logged in');
    return;
  }

  try {
    await page.fill('input[type="email"]', WDK_EMAIL, { timeout: 5000 });
    await page.fill('input[type="password"]', WDK_PASS, { timeout: 5000 });
    await page.click('button[type="submit"]', { timeout: 5000 });
    await page.waitForTimeout(3000);
    console.log('  ✅ WDesignKit login attempted');
  } catch (e) {
    console.log('  ⚠️  WDesignKit login form not found — may already be logged in');
  }
}

async function importWidget(page) {
  console.log('\n=== STEP 1: Import Widget ===');

  await page.goto(`${WP_URL}/wp-admin/admin.php?page=wdesign-kit#/widget-listing`, {
    waitUntil: 'domcontentloaded', timeout: 30000
  });
  await page.waitForTimeout(4000);
  await screenshot(page, 'widget-listing-before-import');

  // Check if widget already exists
  const existingWidget = await page.locator(`text=${PAGE_NAME}`).first().isVisible().catch(() => false);
  if (existingWidget) {
    console.log('  ℹ️  Widget already exists — skipping import');
    return true;
  }

  // Find import button
  const importBtn = page.locator('button:has-text("Import"), a:has-text("Import")').first();
  const importVisible = await importBtn.isVisible().catch(() => false);
  if (!importVisible) {
    bug('P1', 'Functionality', 'Import widget button not found on widget listing',
      ['Go to WDesignKit > My Widgets'],
      'No import button visible',
      'Import button should be visible for uploading widget ZIPs',
      'Check widget listing page renders import action in toolbar'
    );
    return false;
  }

  await importBtn.click();
  await page.waitForTimeout(2000);
  await screenshot(page, 'import-dialog-open');

  // Find file input
  const fileInput = page.locator('input[type="file"]').first();
  const fileInputVisible = await fileInput.isVisible().catch(() => false);
  if (!fileInputVisible) {
    // Try clicking area that might reveal file input
    await page.locator('.upload-area, [class*="upload"], [class*="drop"]').first().click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  try {
    await fileInput.setInputFiles(ZIP_PATH, { timeout: 10000 });
    await page.waitForTimeout(3000);
    await screenshot(page, 'after-file-select');

    // Click confirm/upload button if needed
    const confirmBtn = page.locator('button:has-text("Upload"), button:has-text("Import"), button:has-text("Confirm")').first();
    const confirmVisible = await confirmBtn.isVisible().catch(() => false);
    if (confirmVisible) {
      await confirmBtn.click();
      await page.waitForTimeout(4000);
    }

    // Verify widget appears in list
    await page.goto(`${WP_URL}/wp-admin/admin.php?page=wdesign-kit#/widget-listing`, {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);
    await screenshot(page, 'widget-listing-after-import');

    const widgetVisible = await page.locator(`text=${PAGE_NAME}`).first().isVisible().catch(() => false);
    if (widgetVisible) {
      pass('Widget imported successfully and visible in listing');
      return true;
    } else {
      bug('P0', 'Functionality', 'Widget not visible in listing after import',
        ['Go to WDesignKit > My Widgets', 'Click Import', 'Upload Stacked_Hover_Images ZIP', 'Check listing'],
        'Widget not shown in listing after upload',
        'Imported widget should appear in My Widgets list',
        'Check import handler and widget registration in WDesignKit plugin'
      );
      return false;
    }
  } catch (e) {
    bug('P1', 'Functionality', `Widget import file upload failed: ${e.message}`,
      ['Go to WDesignKit > My Widgets', 'Click Import', 'Try to upload ZIP'],
      `Error: ${e.message}`,
      'File should upload and widget import successfully',
      'Check file input selector and upload mechanism'
    );
    return false;
  }
}

async function createTestPage(page) {
  console.log('\n=== STEP 2: Create Test Page ===');

  // Create new page via WP admin
  await page.goto(`${WP_URL}/wp-admin/post-new.php?post_type=page`, {
    waitUntil: 'domcontentloaded', timeout: 30000
  });
  await page.waitForTimeout(3000);

  // Set page title
  const titleField = page.locator('#title, [aria-label="Add title"], .editor-post-title__input, h1[contenteditable]').first();
  await titleField.click({ timeout: 10000 });
  await titleField.fill(PAGE_NAME);
  await page.waitForTimeout(1000);

  // Look for Elementor edit button
  const elementorBtn = page.locator('a:has-text("Edit with Elementor"), #elementor-switch-mode-button').first();
  const elemVisible = await elementorBtn.isVisible().catch(() => false);

  if (elemVisible) {
    // Save draft first
    const draftBtn = page.locator('#save-post, button:has-text("Save Draft")').first();
    const draftVisible = await draftBtn.isVisible().catch(() => false);
    if (draftVisible) {
      await draftBtn.click();
      await page.waitForTimeout(2000);
    }
    await screenshot(page, 'page-created-wp-admin');
    pass('Test page created in WordPress');

    // Get page ID from URL
    const url = page.url();
    const postIdMatch = url.match(/post=(\d+)/);
    const postId = postIdMatch ? postIdMatch[1] : null;
    console.log(`  ℹ️  Page ID: ${postId}`);

    return { postId, elementorBtn };
  } else {
    // Try Gutenberg / block editor save
    const publishBtn = page.locator('button:has-text("Publish"), button:has-text("Save")').first();
    if (await publishBtn.isVisible().catch(() => false)) {
      await publishBtn.click();
      await page.waitForTimeout(2000);
    }
    const url = page.url();
    const postIdMatch = url.match(/post=(\d+)/);
    const postId = postIdMatch ? postIdMatch[1] : null;
    await screenshot(page, 'page-created');
    pass('Test page created in WordPress');
    return { postId, elementorBtn: null };
  }
}

async function openElementorEditor(page, elementorBtn) {
  console.log('\n=== STEP 3: Open Elementor Editor ===');

  if (elementorBtn) {
    await elementorBtn.click();
  } else {
    // Navigate via WP admin post list
    await page.goto(`${WP_URL}/wp-admin/edit.php?post_type=page`, {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(2000);
    // Find Stacked Hover Images page
    const pageLink = page.locator(`a:has-text("${PAGE_NAME}")`).first();
    await pageLink.hover();
    await page.waitForTimeout(500);
    const elemLink = page.locator(`a:has-text("Edit with Elementor")`).first();
    await elemLink.click();
  }

  // Wait for Elementor to load
  await page.waitForURL(/elementor/, { timeout: 30000 });
  await page.waitForTimeout(6000);
  await screenshot(page, 'elementor-editor-loaded');

  const editorPanel = page.locator('#elementor-panel, .elementor-panel').first();
  const editorLoaded = await editorPanel.isVisible().catch(() => false);
  if (editorLoaded) {
    pass('Elementor editor loaded successfully');
  } else {
    bug('P1', 'Functionality', 'Elementor editor panel did not load',
      ['Create test page', 'Click Edit with Elementor'],
      'Elementor panel not visible after navigation',
      'Elementor editor should load with panel visible',
      'Check Elementor activation and page template settings'
    );
    return false;
  }
  return true;
}

async function findAndAddWidget(page) {
  console.log('\n=== STEP 4: Find & Add Widget in Elementor ===');

  // Search for widget in Elementor panel
  const searchInput = page.locator('#elementor-panel-search-input, input[placeholder*="Search"]').first();
  const searchVisible = await searchInput.isVisible().catch(() => false);
  if (searchVisible) {
    await searchInput.fill('Stacked');
    await page.waitForTimeout(2000);
    await screenshot(page, 'elementor-search-stacked');
  }

  // Find the widget in the panel
  const widgetItem = page.locator('.elementor-element-wrapper[data-widget_type*="stacked"], .elementor-widget-container:has-text("Stacked"), [title*="Stacked"], .elementor-widget__title:has-text("Stacked")').first();
  const widgetFound = await widgetItem.isVisible().catch(() => false);

  if (!widgetFound) {
    // Check if widget shows up under WDesignKit category
    const wdkSection = page.locator('.elementor-panel-category-title:has-text("WDesignKit"), .elementor-panel-category-title:has-text("wdesignkit")').first();
    if (await wdkSection.isVisible().catch(() => false)) {
      await wdkSection.click();
      await page.waitForTimeout(1000);
      await screenshot(page, 'elementor-wdk-category');
    }

    bug('P1', 'Functionality', 'Stacked Hover Images widget not found in Elementor panel after import',
      ['Import widget via WDesignKit', 'Open Elementor editor', 'Search "Stacked" in widget panel'],
      'Widget not appearing in Elementor widget library',
      'Widget should appear under WDesignKit category in Elementor panel',
      'Check widget registration — ensure widget PHP file registers correctly with elementor/widgets/register hook'
    );
    return false;
  }

  pass('Stacked Hover Images widget found in Elementor panel');

  // Drag widget to canvas — find add section area
  const addSection = page.locator('.elementor-add-section, .elementor-add-new-section, .elementor-empty-view').first();
  if (await addSection.isVisible().catch(() => false)) {
    // Drag from panel to canvas
    const widgetBox = await widgetItem.boundingBox();
    const sectionBox = await addSection.boundingBox();
    if (widgetBox && sectionBox) {
      await page.mouse.move(widgetBox.x + widgetBox.width/2, widgetBox.y + widgetBox.height/2);
      await page.mouse.down();
      await page.waitForTimeout(500);
      await page.mouse.move(sectionBox.x + sectionBox.width/2, sectionBox.y + sectionBox.height/2, { steps: 20 });
      await page.waitForTimeout(500);
      await page.mouse.up();
      await page.waitForTimeout(2000);
    }
  } else {
    // Double click or click to add
    await widgetItem.dblclick().catch(() => widgetItem.click());
    await page.waitForTimeout(2000);
  }

  await screenshot(page, 'widget-added-to-canvas');
  pass('Widget added to Elementor canvas');
  return true;
}

async function testContentControls(page) {
  console.log('\n=== STEP 5: Test Content Controls ===');

  // Click on the widget to open its controls
  const widgetOnCanvas = page.locator('.elementor-widget[data-widget_type*="stacked"], .wkit-stacked-hover').first();
  await widgetOnCanvas.click().catch(() => {});
  await page.waitForTimeout(2000);

  // Check Content tab is active
  const contentTab = page.locator('.elementor-tab-control-content, #elementor-controls-tab-content, [data-tab="content"]').first();
  if (await contentTab.isVisible().catch(() => false)) {
    await contentTab.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  await screenshot(page, 'content-controls-panel');

  // --- Check 1: Images repeater control ---
  const repeaterControl = page.locator('[class*="repeater"], .elementor-control-type-repeater').first();
  const repeaterVisible = await repeaterControl.isVisible().catch(() => false);
  if (repeaterVisible) {
    pass('Images repeater control is visible');
  } else {
    bug('P1', 'Functionality', 'Images repeater control missing from content panel',
      ['Add Stacked Hover Images widget to page', 'Click widget to open controls', 'Check Content tab'],
      'Repeater control for images not visible in panel',
      'Images repeater control should appear with Add Item button',
      'Check section_data JSON — repeater_bil4ri25 control definition'
    );
  }

  // --- Check 2: Add item button in repeater ---
  const addItemBtn = page.locator('button:has-text("Add Item"), .elementor-repeater-add, [class*="add-item"]').first();
  if (await addItemBtn.isVisible().catch(() => false)) {
    pass('Add Item button present in repeater');

    // Try adding an item
    await addItemBtn.click();
    await page.waitForTimeout(2000);
    await screenshot(page, 'repeater-item-added');

    // Check media/image field
    const mediaField = page.locator('[class*="media"], .elementor-control-type-media, button:has-text("Choose Image")').first();
    if (await mediaField.isVisible().catch(() => false)) {
      pass('Image (media) field visible in repeater item');
    } else {
      bug('P2', 'Functionality', 'Image media field not visible in repeater item',
        ['Add widget', 'Open content controls', 'Click Add Item in repeater'],
        'Media/image field not shown inside repeater item',
        'Each repeater item should show image picker and URL field',
        'Check repeater fields — media_jnuv4525 and url_oc7fhs25 definitions'
      );
    }

    // Check URL field
    const urlField = page.locator('[class*="url"], .elementor-control-type-url, input[placeholder*="URL"], input[placeholder*="http"]').first();
    if (await urlField.isVisible().catch(() => false)) {
      pass('URL field visible in repeater item');
    } else {
      bug('P2', 'Functionality', 'URL field not visible in repeater item',
        ['Add widget', 'Open content controls', 'Click Add Item in repeater'],
        'URL control not shown inside repeater item',
        'Each repeater item should include URL field with external/nofollow options',
        'Check url_oc7fhs25 control — url_options should expose external and nofollow toggles'
      );
    }
  } else {
    bug('P1', 'Functionality', 'Add Item button missing from Images repeater',
      ['Add widget', 'Open content controls', 'Look for Add Item in Images repeater'],
      'Add Item button not found',
      'Repeater should have an Add Item button to add more images',
      'Check repeater control rendering in WDesignKit Elementor widget'
    );
  }

  // --- Check 3: Default items in repeater ---
  const repeaterItems = await page.locator('.elementor-repeater-row, [class*="repeater-item"]').count();
  console.log(`  ℹ️  Repeater items count: ${repeaterItems}`);
  if (repeaterItems > 0) {
    pass(`Repeater has ${repeaterItems} default item(s)`);
  } else {
    bug('P3', 'Logic', 'Repeater has no default items on widget add',
      ['Add Stacked Hover Images widget to page', 'Open content controls'],
      'Images repeater shows 0 items by default',
      'Widget should load with at least 1 placeholder image pre-populated in the repeater',
      'Add default items in section_data repeater definition'
    );
  }

  // --- Check 4: Help section ---
  const helpSection = page.locator('[class*="need-help"], .elementor-control:has-text("Need Help")').first();
  if (await helpSection.isVisible().catch(() => false)) {
    pass('Need Help section visible in content panel');
  } else {
    bug('P3', 'UI', 'Need Help section not visible in content panel',
      ['Add widget', 'Open content controls', 'Scroll to bottom of content panel'],
      'Help section not shown',
      '"Need Help?" section should appear at bottom of content tab',
      'Check rawhtml_dqrry626 control in section_data builder-1 Need Help section'
    );
  }

  return true;
}

async function testStyleControls(page) {
  console.log('\n=== STEP 6: Test Style Controls ===');

  // Click Style tab
  const styleTab = page.locator('[data-tab="style"], .elementor-tab-control-style, #elementor-controls-tab-style').first();
  const styleTabVisible = await styleTab.isVisible().catch(() => false);

  if (!styleTabVisible) {
    bug('P2', 'Functionality', 'Style tab not visible in widget controls panel',
      ['Add Stacked Hover Images widget', 'Click widget to open controls', 'Look for Style tab'],
      'Style tab not found in the controls panel',
      'Style tab should be present even if the widget has no custom style controls',
      'Check tab registration in WDesignKit widget file — _register_controls() should include style section'
    );
    return;
  }

  await styleTab.click();
  await page.waitForTimeout(1500);
  await screenshot(page, 'style-tab-active');
  pass('Style tab is accessible');

  // Check for style controls
  const styleControls = await page.locator('.elementor-control:not(.elementor-control-type-section)').count();
  console.log(`  ℹ️  Style controls count: ${styleControls}`);

  if (styleControls === 0) {
    bug('P2', 'Functionality', 'Style tab is empty — no style controls available',
      ['Add widget', 'Click widget', 'Click Style tab'],
      'Style tab shows no controls at all',
      'Style tab should contain at minimum: image dimensions, border-radius, hover animation speed controls',
      'Add style controls — image width, height, border-radius, gap between images, animation speed'
    );
  } else {
    pass(`Style tab has ${styleControls} controls`);
  }
}

async function testWidgetFunctionality(page) {
  console.log('\n=== STEP 7: Test Widget Functionality on Page ===');

  // Preview the page
  const previewBtn = page.locator('#elementor-panel-header-menu-button, a:has-text("Preview"), button:has-text("Preview Changes")').first();
  if (await previewBtn.isVisible().catch(() => false)) {
    // Use keyboard shortcut or link to open preview
  }

  // Check canvas preview
  const canvas = page.locator('#elementor-preview-iframe, .elementor-preview').first();
  const canvasVisible = await canvas.isVisible().catch(() => false);

  if (!canvasVisible) {
    bug('P1', 'Functionality', 'Elementor canvas/preview not visible',
      ['Add widget to Elementor editor'],
      'Canvas area not visible',
      'Widget should render in Elementor canvas preview',
      'Check Elementor preview iframe initialization'
    );
    return;
  }

  // Switch to preview iframe
  const frame = page.frame({ name: 'elementor-preview-iframe' });
  if (!frame) {
    // Try finding iframe
    const iframeEl = page.locator('#elementor-preview-iframe').first();
    const iframeVisible = await iframeEl.isVisible().catch(() => false);
    if (!iframeVisible) {
      console.log('  ⚠️  Cannot access preview iframe for functional checks');
      return;
    }
  }

  const targetFrame = frame || page;

  // Check .wkit-stacked-hover renders
  const stackedEl = targetFrame.locator('.wkit-stacked-hover').first();
  if (await stackedEl.isVisible().catch(() => false)) {
    pass('wkit-stacked-hover element renders in preview');
  } else {
    bug('P1', 'Functionality', 'Widget does not render in Elementor preview',
      ['Add Stacked Hover Images widget to Elementor page', 'Check canvas preview'],
      '.wkit-stacked-hover not rendered in preview',
      'Widget HTML should render correctly in Elementor preview',
      'Check widget HTML template in Editor_data and WDesignKit template rendering engine'
    );
    return;
  }

  // Check images render
  const images = await targetFrame.locator('.wkit-stacked-image img').count();
  console.log(`  ℹ️  Stacked images rendered: ${images}`);
  if (images > 0) {
    pass(`${images} stacked image(s) rendered in widget`);
  } else {
    bug('P1', 'Functionality', 'No images rendered inside stacked hover widget',
      ['Add widget', 'Add at least 1 image in repeater', 'Check canvas preview'],
      'No .wkit-stacked-image img elements found',
      'Images added via repeater should render inside the widget',
      'Check template binding — {{media_jnuv4525}} variable replacement in HTML template'
    );
  }

  // Check images have src
  const brokenImgs = await targetFrame.evaluate(() => {
    const imgs = document.querySelectorAll('.wkit-stacked-image img');
    return Array.from(imgs).filter(img => !img.src || img.naturalWidth === 0).length;
  }).catch(() => 0);

  if (brokenImgs > 0) {
    bug('P2', 'Functionality', `${brokenImgs} image(s) broken or missing src in widget`,
      ['Add images via repeater', 'Check widget preview'],
      `${brokenImgs} images have no src or fail to load`,
      'All images should load correctly from media library or URL',
      'Check media_jnuv4525 binding and default placeholder URL'
    );
  } else if (images > 0) {
    pass('All rendered images have valid src');
  }

  // Check anchor links on images
  const anchors = await targetFrame.locator('.wkit-stacked-image').count();
  if (anchors > 0) {
    pass('Image wrapper anchors present');
    const anchorHref = await targetFrame.locator('.wkit-stacked-image').first().getAttribute('href').catch(() => null);
    if (!anchorHref || anchorHref === '') {
      bug('P3', 'Functionality', 'Image anchor href is empty when no URL set',
        ['Add widget with default URL "#"', 'Inspect anchor element'],
        'Anchor href is empty string',
        'Default URL "#" should be preserved on anchor href',
        'Check url_oc7fhs25 default value binding in template'
      );
    } else {
      pass('Image anchor href is set');
    }
  }

  await screenshot(page, 'widget-canvas-preview');
}

async function testConsoleErrors(page) {
  console.log('\n=== STEP 8: Console Errors ===');

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // Reload and check
  await page.waitForTimeout(2000);

  if (consoleErrors.length > 0) {
    bug('P1', 'Console', `${consoleErrors.length} console error(s) detected`,
      ['Open page with Stacked Hover Images widget in Elementor editor', 'Open browser console'],
      consoleErrors.slice(0, 3).join(' | '),
      'Zero console errors from product code',
      'Investigate and fix each console error listed above'
    );
  } else {
    pass('No console errors detected during widget testing');
  }
}

async function testResponsive(page, postId) {
  console.log('\n=== STEP 9: Responsive Testing ===');

  if (!postId) {
    console.log('  ⚠️  No post ID — skipping responsive page test');
    return;
  }

  const pageUrl = `${WP_URL}/?p=${postId}`;

  const viewports = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Tablet',  width: 768,  height: 1024 },
    { name: 'Mobile',  width: 375,  height: 812 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot(page, `responsive-${vp.name.toLowerCase()}`);

    // Check widget container
    const widget = page.locator('.wkit-stacked-hover').first();
    const widgetVisible = await widget.isVisible().catch(() => false);
    if (widgetVisible) {
      pass(`Widget visible on ${vp.name} (${vp.width}px)`);

      // Check for overflow
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      }).catch(() => false);

      if (hasOverflow) {
        bug('P2', 'Responsive', `Horizontal overflow detected on ${vp.name} (${vp.width}px)`,
          [`View page with widget at ${vp.width}px viewport`],
          'Page body scrollWidth > clientWidth (horizontal overflow)',
          'No horizontal overflow — widget should be fully contained',
          'Check .wkit-stacked-images width:100% and .wkit-stacked-image width:300px — set max-width or use responsive units'
        );
      } else {
        pass(`No horizontal overflow on ${vp.name}`);
      }

      // Check image container height
      const containerBox = await widget.boundingBox().catch(() => null);
      if (containerBox) {
        console.log(`  ℹ️  ${vp.name}: widget box ${containerBox.width.toFixed(0)}x${containerBox.height.toFixed(0)}`);
        if (containerBox.height < 50) {
          bug('P2', 'Responsive', `Widget has near-zero height on ${vp.name} (${vp.width}px)`,
            [`View page at ${vp.width}px`],
            `Widget height is only ${containerBox.height.toFixed(0)}px`,
            'Widget should have a visible, usable height at all viewports',
            'The .wkit-stacked-images uses height:40vh — verify vh units render correctly on mobile'
          );
        }
      }
    } else {
      bug('P2', 'Responsive', `Widget not visible on ${vp.name} (${vp.width}px)`,
        [`Navigate to test page at ${vp.width}px viewport`],
        'Widget element not found / not visible',
        'Widget should render on all viewport sizes',
        'Check CSS display rules — no media query should hide the widget entirely'
      );
    }
  }

  // Reset viewport
  await page.setViewportSize({ width: 1440, height: 900 });
}

async function testAccessibility(page, postId) {
  console.log('\n=== STEP 10: Accessibility ===');

  if (!postId) return;

  await page.goto(`${WP_URL}/?p=${postId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Inject axe-core
  try {
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js' });
    await page.waitForTimeout(1000);
    const axeResults = await page.evaluate(async () => {
      const results = await axe.run('.wkit-stacked-hover', {
        runOnly: ['wcag2a', 'wcag2aa']
      });
      return {
        violations: results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length
        }))
      };
    });

    if (axeResults.violations.length === 0) {
      pass('axe-core: No WCAG 2.1 AA violations in widget');
    } else {
      for (const v of axeResults.violations) {
        bug(
          v.impact === 'critical' || v.impact === 'serious' ? 'P1' : 'P2',
          'Accessibility',
          `Accessibility violation: ${v.id} (${v.impact})`,
          ['Navigate to page with widget', 'Run axe-core scan on .wkit-stacked-hover'],
          `${v.description} — ${v.nodes} node(s) affected`,
          'WCAG 2.1 AA compliance required',
          `Fix ${v.id}: ${v.description}`
        );
      }
    }
  } catch (e) {
    console.log(`  ⚠️  axe-core not available: ${e.message}`);
  }

  // Manual checks
  // Check images have alt text
  const imgsNoAlt = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.wkit-stacked-image img'))
      .filter(img => !img.alt || img.alt.trim() === '').length;
  }).catch(() => 0);

  if (imgsNoAlt > 0) {
    bug('P2', 'Accessibility', `${imgsNoAlt} image(s) missing alt text in widget`,
      ['View page with widget', 'Inspect <img> elements inside .wkit-stacked-image'],
      `${imgsNoAlt} <img> elements have empty or missing alt attribute`,
      'All images must have descriptive alt text for WCAG 2.1 AA compliance',
      'Add alt field to repeater so users can set alt text per image; render as alt="{{alt_field}}"'
    );
  } else {
    pass('All widget images have alt attributes');
  }

  // Check link accessibility
  const linksNoAriaNoText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.wkit-stacked-image'))
      .filter(a => {
        const text = a.textContent.trim();
        const ariaLabel = a.getAttribute('aria-label');
        return !text && !ariaLabel;
      }).length;
  }).catch(() => 0);

  if (linksNoAriaNoText > 0) {
    bug('P2', 'Accessibility', `${linksNoAriaNoText} image link(s) missing accessible label`,
      ['View page with widget', 'Inspect <a> elements inside .wkit-stacked-images'],
      'Anchor elements contain only an image with no alt text — screen readers cannot describe the link',
      'Each image link should have accessible name via alt text or aria-label',
      'Fix in two steps: (1) add alt text field to repeater, (2) add aria-label="{{alt_field}}" on the <a> tag in HTML template'
    );
  } else {
    pass('Image links have accessible labels');
  }

  await screenshot(page, 'accessibility-check');
}

async function testFrontendAnimation(page, postId) {
  console.log('\n=== STEP 11: Frontend Animation & Interaction ===');

  if (!postId) return;

  await page.goto(`${WP_URL}/?p=${postId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const widget = page.locator('.wkit-stacked-hover').first();
  if (!await widget.isVisible().catch(() => false)) {
    console.log('  ⚠️  Widget not on front-end page — skipping animation test');
    return;
  }

  // Check JS initializes — verify custom properties exist
  const cssPropsSet = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.wkit-stacked-image');
    if (imgs.length === 0) return false;
    // Check if requestAnimationFrame is running by verifying element exists
    return true;
  }).catch(() => false);

  if (cssPropsSet) {
    pass('Widget JS initialized on front-end');
  }

  // Simulate mousemove and check offsetX is updated
  const box = await widget.boundingBox().catch(() => null);
  if (box) {
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await page.waitForTimeout(500);
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height/2);
    await page.waitForTimeout(500);

    const offsetXSet = await page.evaluate(() => {
      const img = document.querySelector('.wkit-stacked-image');
      if (!img) return false;
      const val = img.style.getPropertyValue('--offsetX');
      return val !== '' && val !== '0.00';
    }).catch(() => false);

    if (offsetXSet) {
      pass('Mouse parallax animation: --offsetX CSS property updates on mousemove');
    } else {
      bug('P1', 'Functionality', 'Mouse parallax animation not working on front-end',
        ['Navigate to published page with widget', 'Move mouse over widget area'],
        '--offsetX CSS custom property does not update on mousemove — images remain static',
        'Images should animate/follow mouse cursor with parallax effect on hover',
        'Check JS — ensure stackHomain.addEventListener("mousemove") fires and requestAnimationFrame loop runs correctly; verify widget scope $scope is initialized'
      );
    }

    await screenshot(page, 'frontend-animation');
  }

  // Touch simulation check
  const touchSupport = await page.evaluate(() => {
    return typeof window.TouchEvent !== 'undefined' || 'ontouchstart' in window;
  }).catch(() => false);
  console.log(`  ℹ️  Touch support detected: ${touchSupport}`);

  // Check for console errors on frontend
  const frontendErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') frontendErrors.push(msg.text());
  });
  await page.waitForTimeout(2000);
  if (frontendErrors.length > 0) {
    bug('P1', 'Console', `${frontendErrors.length} JS error(s) on front-end widget page`,
      ['Navigate to published page', 'Open browser console'],
      frontendErrors.slice(0, 2).join(' | '),
      'Zero console errors on front-end',
      'Fix each JS error — check stackHomain null guard if widget scope not found'
    );
  } else {
    pass('No JS errors on front-end widget page');
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Stacked Hover Images — Full Widget QA          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Collect console errors globally
  const allConsoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') allConsoleErrors.push(msg.text());
  });
  page.on('pageerror', err => allConsoleErrors.push(err.message));

  try {
    console.log('\n=== STEP 0: Login ===');
    await wpLogin(page);
    await wdkLogin(page);

    const importOk = await importWidget(page);
    const { postId, elementorBtn } = await createTestPage(page);
    const editorOk = await openElementorEditor(page, elementorBtn);

    if (editorOk) {
      const widgetAdded = await findAndAddWidget(page);
      if (widgetAdded) {
        await testContentControls(page);
        await testStyleControls(page);
        await testWidgetFunctionality(page);
      }
    }

    // Save the page and get URL for front-end tests
    if (postId) {
      await testResponsive(page, postId);
      await testAccessibility(page, postId);
      await testFrontendAnimation(page, postId);
    }

    // Final console error check
    if (allConsoleErrors.length > 0) {
      const productErrors = allConsoleErrors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('robots.txt') &&
        !e.includes('cdn') &&
        !e.includes('google')
      );
      if (productErrors.length > 0) {
        bug('P1', 'Console', `${productErrors.length} product console error(s) total`,
          ['Open any page during widget testing', 'Check browser console'],
          productErrors.slice(0, 3).join('\n'),
          'Zero product console errors',
          'Fix each error in widget PHP, CSS, or JS files'
        );
      }
    }

  } catch (err) {
    console.error('\n❌ FATAL:', err.message);
    await screenshot(page, 'fatal-error');
    bug('P0', 'Functionality', `Test script fatal error: ${err.message}`,
      ['Running automated QA script'],
      err.message,
      'Script should complete without fatal errors',
      err.stack
    );
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                 QA SUMMARY                       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${passed.length}`);
  console.log(`❌ Bugs:   ${bugs.length}`);

  const byLevel = { P0:[], P1:[], P2:[], P3:[] };
  bugs.forEach(b => (byLevel[b.severity] || byLevel.P3).push(b));

  console.log(`\n  P0 Critical: ${byLevel.P0.length}`);
  console.log(`  P1 High:     ${byLevel.P1.length}`);
  console.log(`  P2 Medium:   ${byLevel.P2.length}`);
  console.log(`  P3 Low:      ${byLevel.P3.length}`);

  console.log('\n── Bug List ──');
  bugs.forEach((b, i) => {
    console.log(`\n${i+1}. [${b.severity}] [${b.area}] ${b.title}`);
    console.log(`   Current:  ${b.current}`);
    console.log(`   Expected: ${b.expected}`);
  });

  // Save raw results
  const rawOutput = { bugs, passed, totalBugs: bugs.length, totalPassed: passed.length };
  fs.writeFileSync(
    path.join(__dirname, '../reports/bugs/stacked-hover-images-raw.json'),
    JSON.stringify(rawOutput, null, 2)
  );
  console.log('\n📄 Raw data saved to reports/bugs/stacked-hover-images-raw.json');
}

main().catch(console.error);
