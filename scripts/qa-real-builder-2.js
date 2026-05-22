/**
 * Widget Builder QA — Part 2 (search, add section, save, publish, preview, AI, responsive)
 */
const { firefox } = require('playwright');
const fs = require('fs');

const SCREENSHOT_DIR = 'reports/screenshots/real-builder';
const ss = (name) => `${SCREENSHOT_DIR}/${name}.png`;

async function login(page) {
  await page.goto('https://wdesignkit.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', 'devpanchal.posimyth@gmail.com');
  await page.fill('input[type="password"]', 'Dev@0107');
  await page.press('input[type="password"]', 'Enter');
  await page.waitForURL(/admin/, { timeout: 15000 });
  await page.waitForTimeout(2000);
}

async function capture(page, name) {
  await page.screenshot({ path: ss(name), fullPage: false });
  console.log(`  📸 ${name}`);
}

async function run() {
  const browser = await firefox.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  const apiCalls = {};
  const networkFailures = [];

  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', async (resp) => {
    const url = resp.url();
    const status = resp.status();
    if (status >= 400) networkFailures.push({ url: url.replace('https://api.wdesignkit.com', ''), status });
    if (url.includes('api.wdesignkit.com/api/')) {
      const path = url.replace('https://api.wdesignkit.com/api/', '').split('?')[0];
      apiCalls[path] = (apiCalls[path] || 0) + 1;
    }
  });

  console.log('🔐 Logging in...');
  await login(page);

  await page.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // ─── AUDIT 7: CONTROLS SEARCH ─────────────────────────────────────────────
  console.log('\n🔍 [AUDIT 7] Controls search...');
  const searchInput = await page.$('input[placeholder*="Search"], input[type="search"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.fill('Text');
    await page.waitForTimeout(1000);
    await capture(page, '09-controls-search-text');

    // Check if results filtered
    const beforeClear = await page.evaluate(() => {
      const visible = [...document.querySelectorAll('*')].filter(el =>
        el.textContent.trim() === 'Text' && el.offsetParent !== null && el.children.length === 0
      );
      return visible.length;
    });
    console.log(`  Visible "Text" items when searching "Text": ${beforeClear}`);

    // Search for something that shouldn't exist
    await searchInput.fill('nonexistentcontrol12345');
    await page.waitForTimeout(800);
    await capture(page, '09b-controls-search-empty');

    const emptyState = await page.evaluate(() => {
      const noResults = document.querySelector('[class*="no-result"], [class*="empty"], [class*="not-found"]');
      return { hasEmptyState: !!noResults, bodyText: document.body.innerText.substring(0, 100) };
    });
    console.log(`  Empty search state: ${JSON.stringify(emptyState)}`);

    await searchInput.fill('');
    await page.waitForTimeout(500);
  } else {
    console.log('  Search input NOT FOUND');
  }

  // ─── AUDIT 8: ADD SECTION ─────────────────────────────────────────────────
  console.log('\n➕ [AUDIT 8] Add Section button...');
  const addSectionEl = await page.$('.add-section-btn, [class*="add-section"]');
  if (addSectionEl) {
    await addSectionEl.click();
    await page.waitForTimeout(2000);
    await capture(page, '10-after-add-section');

    const state = await page.evaluate(() => {
      const sections = document.querySelectorAll('[class*="section-row"], [class*="canvas-row"], [class*="wb-section"]');
      const popup = document.querySelector('[role="dialog"], [role="alertdialog"]');
      const addSectionStillVisible = !!document.querySelector('.add-section-btn');
      return { sectionCount: sections.length, popup: !!popup, addSectionStillVisible };
    });
    console.log(`  After click: sections=${state.sectionCount}, popup=${state.popup}, addSection still showing=${state.addSectionStillVisible}`);
  }

  // ─── AUDIT 9: TYPING IN CODE EDITOR ──────────────────────────────────────
  console.log('\n⌨️  [AUDIT 9] Code editor interaction...');
  // The code editor uses CodeMirror or Monaco — click on the black area
  const editorArea = await page.evaluate(() => {
    // Look for the actual editor container
    const selectors = [
      '.cm-editor .cm-content',
      '.CodeMirror-code',
      '.monaco-editor .inputarea',
      '.view-lines',
      '[class*="wkit-wb-editor"] [contenteditable]',
      '.wkit-wb-editor-wrap [contenteditable]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return { found: true, selector: sel, tag: el.tagName };
    }
    // Try finding any contenteditable
    const ce = document.querySelector('[contenteditable="true"]');
    return ce ? { found: true, selector: 'contenteditable', tag: ce.tagName } : { found: false };
  });
  console.log(`  Editor element: ${JSON.stringify(editorArea)}`);

  // Click on the black editor area by coordinates (left panel)
  await page.mouse.click(360, 400); // center of left black panel
  await page.waitForTimeout(500);

  // Check what's focused
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, class: typeof el?.className === 'string' ? el.className.substring(0, 60) : '[SVG]', role: el?.getAttribute('role') };
  });
  console.log(`  After click on editor area, focused: ${JSON.stringify(focused)}`);

  await page.keyboard.type('<h1>Hello World</h1>');
  await page.waitForTimeout(1000);
  await capture(page, '11-code-editor-typed');

  // Read status bar
  const statusBar = await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')];
    const bar = all.find(el => el.textContent.includes('Characters') && el.textContent.includes('Line') && el.children.length <= 5);
    return bar ? bar.textContent.trim() : 'NOT FOUND';
  });
  console.log(`  Status bar: "${statusBar}"`);

  // ─── AUDIT 10: SETTINGS GEAR ──────────────────────────────────────────────
  console.log('\n⚙️  [AUDIT 10] Settings gear...');
  // Get all clickable toolbar elements
  const toolbarEls = await page.evaluate(() => {
    const toolbar = document.querySelector('[class*="topbar"], [class*="toolbar"], [class*="top-bar"], header');
    if (!toolbar) return [];
    const clickable = [...toolbar.querySelectorAll('button, a, [role="button"], [onclick], svg, [class*="btn"]')];
    return clickable.map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 30),
      class: typeof el.className === 'string' ? el.className.substring(0, 50) : '[SVG]',
      aria: el.getAttribute('aria-label') || ''
    }));
  });
  console.log(`  Toolbar clickable elements (${toolbarEls.length}):`);
  toolbarEls.forEach(el => console.log(`    [${el.tag}] "${el.text}" class="${el.class}" aria="${el.aria}"`));

  await capture(page, '12-toolbar-state');

  // ─── AUDIT 11: PUBLISH DROPDOWN ───────────────────────────────────────────
  console.log('\n📤 [AUDIT 11] Publish dropdown...');
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    // Find the dropdown arrow next to Publish
    const pub = allEls.find(el => el.textContent.trim() === 'Publish' && el.children.length <= 3);
    if (pub) pub.click();
  });
  await page.waitForTimeout(1500);
  await capture(page, '13-publish-dropdown');

  const publishMenu = await page.evaluate(() => {
    const dropdowns = document.querySelectorAll('[class*="dropdown"], [class*="menu"], [role="menu"], [role="listbox"]');
    const visible = [...dropdowns].filter(el => el.offsetParent !== null);
    return visible.map(el => el.textContent.trim().substring(0, 200));
  });
  console.log(`  Publish dropdown: ${JSON.stringify(publishMenu)}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ─── AUDIT 12: PREVIEW MODE ───────────────────────────────────────────────
  console.log('\n👁️  [AUDIT 12] Preview mode...');
  const previewBtn = await page.$('[class*="preview"], button:has-text("Preview")');
  if (previewBtn) {
    await previewBtn.click();
  } else {
    await page.evaluate(() => {
      const allEls = [...document.querySelectorAll('*')];
      const preview = allEls.find(el => el.textContent.trim() === 'Preview' && el.children.length <= 3);
      if (preview) preview.click();
    });
  }
  await page.waitForTimeout(2000);
  await capture(page, '14-preview-mode');

  const previewDOM = await page.evaluate(() => {
    const codeArea = document.querySelector('[class*="editor"], [class*="code"]');
    const mainContent = document.querySelector('[class*="canvas"], main, [role="main"]');
    return {
      codeAreaVisible: codeArea ? getComputedStyle(codeArea).display !== 'none' : false,
      url: window.location.href,
      isEmpty: document.querySelector('[class*="empty"], [class*="blank"]') ? true : false,
      visibleText: document.body.innerText.substring(0, 300)
    };
  });
  console.log(`  Preview state: ${JSON.stringify({ codeAreaVisible: previewDOM.codeAreaVisible, isEmpty: previewDOM.isEmpty })}`);
  console.log(`  Visible text snippet: "${previewDOM.visibleText.substring(0, 100)}"`);

  // Back to Code view
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const code = allEls.find(el => el.textContent.trim() === 'Code' && el.children.length <= 3);
    if (code) code.click();
  });
  await page.waitForTimeout(1500);

  // ─── AUDIT 13: SAVE BUTTON BEHAVIOR ──────────────────────────────────────
  console.log('\n💾 [AUDIT 13] Save button state...');
  const saveState = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('button, [role="button"]')];
    const save = allEls.find(el => el.textContent.includes('Save'));
    if (!save) return { found: false };
    return {
      found: true,
      tag: save.tagName,
      disabled: save.disabled,
      ariaDisabled: save.getAttribute('aria-disabled'),
      opacity: getComputedStyle(save).opacity,
      cursor: getComputedStyle(save).cursor,
      class: typeof save.className === 'string' ? save.className : '[SVGClass]'
    };
  });
  console.log(`  Save: ${JSON.stringify(saveState)}`);

  // Try clicking save
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('button, [role="button"]')];
    const save = allEls.find(el => el.textContent.includes('Save'));
    if (save) save.click();
  });
  await page.waitForTimeout(1500);
  await capture(page, '15-after-save-click');

  // ─── AUDIT 14: BUILD WITH AI ───────────────────────────────────────────────
  console.log('\n🤖 [AUDIT 14] Build with AI...');
  const aiBtn = await page.$('[aria-label="Open AI Widget Builder"], button:has-text("Build with AI")');
  if (aiBtn) await aiBtn.click();
  else {
    await page.evaluate(() => {
      const allEls = [...document.querySelectorAll('button, [role="button"]')];
      const ai = allEls.find(el => el.textContent.includes('Build with AI'));
      if (ai) ai.click();
    });
  }
  await page.waitForTimeout(2500);
  await capture(page, '16-ai-builder-panel');

  const aiPanel = await page.evaluate(() => {
    const panel = document.querySelector('[class*="ai"], [class*="chat"], [class*="gpt"]');
    const iframe = document.querySelector('iframe');
    const overlay = document.querySelector('[class*="overlay"], [class*="modal"], [role="dialog"]');
    return {
      aiPanelFound: !!panel,
      iframeFound: !!iframe,
      overlayFound: !!overlay,
      visibleText: [...document.querySelectorAll('*')].filter(el => el.offsetParent !== null && el.children.length === 0 && el.textContent.trim().length > 0)
        .slice(-20).map(el => el.textContent.trim()).join(' | ').substring(0, 200)
    };
  });
  console.log(`  AI panel: ${JSON.stringify({ aiPanelFound: aiPanel.aiPanelFound, iframeFound: aiPanel.iframeFound, overlayFound: aiPanel.overlayFound })}`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ─── AUDIT 15: WIDGET NAME IN BUILDER HEADER ──────────────────────────────
  console.log('\n🏷️  [AUDIT 15] Widget name display...');
  const widgetNameInfo = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const name = allEls.find(el =>
      (el.textContent.trim() === 'Core widget' || el.textContent.includes('Core widget')) &&
      el.children.length === 0 &&
      el.textContent.trim().length < 30
    );
    if (!name) return { found: false };
    return {
      found: true,
      text: name.textContent.trim(),
      tag: name.tagName,
      isEditable: name.hasAttribute('contenteditable') || name.hasAttribute('contenteditable'),
      class: typeof name.className === 'string' ? name.className.substring(0, 60) : '[SVG]'
    };
  });
  console.log(`  Widget name element: ${JSON.stringify(widgetNameInfo)}`);

  // Check if widget name is editable (click on it)
  if (widgetNameInfo.found) {
    await page.evaluate(() => {
      const allEls = [...document.querySelectorAll('*')];
      const name = allEls.find(el => el.textContent.trim() === 'Core widget' && el.children.length === 0);
      if (name) name.click();
    });
    await page.waitForTimeout(500);
    const afterClick = await page.evaluate(() => ({
      focused: document.activeElement?.tagName,
      class: typeof document.activeElement?.className === 'string' ? document.activeElement.className.substring(0, 60) : '[SVG]'
    }));
    console.log(`  After clicking widget name: focused=${JSON.stringify(afterClick)}`);
    await capture(page, '17-widget-name-click');
  }

  // ─── AUDIT 16: CONTROLS — DRAG TO CANVAS ─────────────────────────────────
  console.log('\n🖱️  [AUDIT 16] Drag Text control to canvas...');
  await page.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Find the Text control card in the right panel
  const textControlBox = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[class*="control-card"], [class*="controlCard"], [draggable="true"], [class*="data-control"]')];
    const textCard = cards.find(el => el.textContent.includes('Text') && !el.textContent.includes('Textarea'));
    if (textCard) {
      const rect = textCard.getBoundingClientRect();
      return { x: rect.x + rect.width/2, y: rect.y + rect.height/2, found: true };
    }
    return { found: false };
  });

  const canvasBox = await page.evaluate(() => {
    const canvas = document.querySelector('[class*="canvas"], [class*="layout-area"], [class*="wb-canvas"], .add-section-btn');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      return { x: rect.x + rect.width/2, y: rect.y + rect.height/2, found: true };
    }
    return { found: false };
  });

  console.log(`  Text control: ${JSON.stringify(textControlBox)}`);
  console.log(`  Canvas: ${JSON.stringify(canvasBox)}`);

  if (textControlBox.found && canvasBox.found) {
    await page.mouse.move(textControlBox.x, textControlBox.y);
    await page.waitForTimeout(300);
    await page.mouse.down();
    await page.waitForTimeout(500);
    // Move in steps
    const steps = 30;
    const dx = (canvasBox.x - textControlBox.x) / steps;
    const dy = (canvasBox.y - textControlBox.y) / steps;
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(textControlBox.x + dx * i, textControlBox.y + dy * i);
      await page.waitForTimeout(20);
    }
    await capture(page, '18-drag-in-progress');
    await page.mouse.up();
    await page.waitForTimeout(2000);
    await capture(page, '19-after-drag-drop');
    console.log('  Drag operation complete');
  }

  // ─── AUDIT 17: RESPONSIVE ─────────────────────────────────────────────────
  console.log('\n📱 [AUDIT 17] Responsive viewports...');
  await ctx.close();

  // Tablet
  const tabCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabPage = await tabCtx.newPage();
  await login(tabPage);
  await tabPage.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await tabPage.waitForTimeout(4000);
  await tabPage.screenshot({ path: ss('20-tablet-768') });
  console.log('  📸 tablet-768');
  const tabLayout = await tabPage.evaluate(() => {
    const overflow = [...document.querySelectorAll('*')].filter(el => el.scrollWidth > el.clientWidth + 5 && el.offsetParent !== null);
    return { horizontalOverflow: overflow.length };
  });
  console.log(`  Tablet horizontal overflow elements: ${tabLayout.horizontalOverflow}`);
  await tabCtx.close();

  // Mobile
  const mobCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobPage = await mobCtx.newPage();
  await login(mobPage);
  await mobPage.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await mobPage.waitForTimeout(4000);
  await mobPage.screenshot({ path: ss('21-mobile-375') });
  console.log('  📸 mobile-375');
  const mobLayout = await mobPage.evaluate(() => {
    const overflow = [...document.querySelectorAll('*')].filter(el => el.scrollWidth > el.clientWidth + 5 && el.offsetParent !== null);
    const bodyWidth = document.body.scrollWidth;
    return { horizontalOverflow: overflow.length, bodyScrollWidth: bodyWidth, viewportWidth: window.innerWidth };
  });
  console.log(`  Mobile layout: bodyScrollWidth=${mobLayout.bodyScrollWidth}, overflow elements=${mobLayout.horizontalOverflow}`);
  await mobCtx.close();

  await browser.close();

  // ─── FINAL REPORT ─────────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('         WIDGET BUILDER QA — FULL FINDINGS');
  console.log('══════════════════════════════════════════════════════\n');

  console.log('🚨 CONSOLE ERRORS:');
  if (errors.length === 0) console.log('  None captured in this run');
  else errors.slice(0, 10).forEach(e => console.log(`  ❌ ${e.substring(0, 150)}`));

  console.log('\n🌐 NETWORK FAILURES:');
  if (networkFailures.length === 0) console.log('  None');
  else networkFailures.forEach(f => console.log(`  ${f.status} ${f.url}`));

  console.log('\n🔁 API DUPLICATE CALLS (>1):');
  Object.entries(apiCalls).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1])
    .forEach(([path, count]) => console.log(`  ${count}x /${path}`));

  console.log('\n✅ Done. Screenshots at reports/screenshots/real-builder/');
}

run().catch(err => { console.error('Script error:', err); process.exit(1); });
