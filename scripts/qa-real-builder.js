/**
 * Comprehensive QA of the real WDesignKit Widget Builder
 * URL: /admin/widgets/widget-builder/[id]
 * Tests: code editor, controls panel, canvas, toolbar, save/publish/push, settings, AI builder
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
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await firefox.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  const networkFailures = [];
  const workerErrors = [];
  const apiCalls = {};

  page.on('console', m => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.text().includes('worker') || m.text().includes('Worker')) workerErrors.push(m.text());
  });

  page.on('response', async (resp) => {
    const url = resp.url();
    const status = resp.status();
    if (status >= 400) {
      networkFailures.push({ url: url.replace('https://api.wdesignkit.com', ''), status });
    }
    // Track API call counts
    if (url.includes('api.wdesignkit.com/api/')) {
      const path = url.replace('https://api.wdesignkit.com/api/', '').split('?')[0];
      apiCalls[path] = (apiCalls[path] || 0) + 1;
    }
    // Check worker MIME types
    if (url.includes('worker-javascript') || url.includes('worker-html') || url.includes('worker-css')) {
      try {
        const ct = resp.headers()['content-type'] || '';
        console.log(`  🔧 Worker MIME: ${url.split('/').pop()} → ${ct}`);
      } catch(e) {}
    }
  });

  console.log('\n🔐 Logging in...');
  await login(page);

  // ─── NAVIGATE TO REAL BUILDER ─────────────────────────────────────────────
  console.log('\n📦 Navigating to real widget builder (ID 12422)...');
  await page.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await capture(page, '01-builder-loaded');

  // ─── BUILDER AUDIT 1: PAGE TITLE & META ──────────────────────────────────
  console.log('\n📋 [AUDIT 1] Page title & meta...');
  const pageTitle = await page.title();
  const h1s = await page.$$eval('h1', els => els.map(e => e.textContent.trim()));
  const metaDesc = await page.$eval('meta[name="description"]', el => el?.getAttribute('content') || 'MISSING').catch(() => 'MISSING');
  console.log(`  Title: "${pageTitle}"`);
  console.log(`  H1s: ${JSON.stringify(h1s)}`);
  console.log(`  Meta desc: ${metaDesc}`);

  // ─── BUILDER AUDIT 2: TOOLBAR BUTTONS ────────────────────────────────────
  console.log('\n🔧 [AUDIT 2] Toolbar button semantics...');
  const toolbarInfo = await page.evaluate(() => {
    const btns = [];
    document.querySelectorAll('button, [role="button"]').forEach(el => {
      btns.push({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 40),
        label: el.getAttribute('aria-label') || '',
        role: el.getAttribute('role') || '',
        disabled: el.disabled || el.getAttribute('aria-disabled') === 'true'
      });
    });
    // Also check SPANs acting as buttons in toolbar
    const spans = [];
    document.querySelectorAll('span').forEach(el => {
      const cls = el.className || '';
      if (typeof cls === 'string' && (cls.includes('btn') || cls.includes('button'))) {
        spans.push({ tag: 'SPAN', text: el.textContent.trim().substring(0, 40), class: cls.substring(0, 60) });
      }
    });
    return { buttons: btns, spanButtons: spans };
  });
  console.log(`  Real <button> elements: ${toolbarInfo.buttons.length}`);
  toolbarInfo.buttons.forEach(b => console.log(`    [${b.tag}] "${b.text}" label="${b.label}" disabled=${b.disabled}`));
  console.log(`  SPAN-buttons: ${toolbarInfo.spanButtons.length}`);
  toolbarInfo.spanButtons.forEach(s => console.log(`    [SPAN] "${s.text}" class="${s.class}"`));

  // ─── BUILDER AUDIT 3: CODE EDITOR TABS ───────────────────────────────────
  console.log('\n💻 [AUDIT 3] Code editor tab switching...');

  // Click CSS tab
  const cssTabClicked = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('*')];
    const cssTab = tabs.find(el => el.textContent.trim() === 'CSS' && getComputedStyle(el).cursor === 'pointer');
    if (cssTab) { cssTab.click(); return true; }
    // Try by text content
    const allEls = [...document.querySelectorAll('div, span, button, li')];
    const found = allEls.find(el => el.textContent.trim() === 'CSS' && el.children.length === 0);
    if (found) { found.click(); return true; }
    return false;
  });
  await page.waitForTimeout(1000);
  await capture(page, '02-css-tab-active');
  console.log(`  CSS tab clicked: ${cssTabClicked}`);

  // Check what's in code editor after tab switch
  const editorContent = await page.evaluate(() => {
    const editorLines = document.querySelectorAll('.view-line, .monaco-editor .view-line, .cm-line');
    return { lineCount: editorLines.length, hasEditor: editorLines.length > 0 };
  });
  console.log(`  Editor lines visible: ${editorContent.lineCount}`);

  // Click JAVASCRIPT tab
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('div, span, button, li')];
    const found = allEls.find(el => el.textContent.trim() === 'JAVASCRIPT' && el.children.length <= 1);
    if (found) found.click();
  });
  await page.waitForTimeout(1000);
  await capture(page, '03-js-tab-active');

  // Click HTML tab back
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('div, span, button, li')];
    const found = allEls.find(el => el.textContent.trim() === 'HTML' && el.children.length <= 1);
    if (found) found.click();
  });
  await page.waitForTimeout(800);

  // ─── BUILDER AUDIT 4: TYPE IN CODE EDITOR ────────────────────────────────
  console.log('\n⌨️  [AUDIT 4] Typing in code editor...');
  const editorArea = await page.$('.cm-editor, .monaco-editor, .CodeMirror, [contenteditable="true"]');
  if (editorArea) {
    await editorArea.click();
    await page.keyboard.type('<div class="test">Hello World</div>');
    await page.waitForTimeout(1000);
    await capture(page, '04-code-typed');

    const statusBar = await page.$eval('*', () => {
      const all = [...document.querySelectorAll('*')];
      const bar = all.find(el => el.textContent.includes('Characters') && el.textContent.includes('Line'));
      return bar ? bar.textContent.trim() : 'NOT FOUND';
    }).catch(() => 'ERROR');
    console.log(`  Status bar after typing: "${statusBar}"`);
  } else {
    console.log('  ⚠️  No code editor element found (check selectors)');
    // Try clicking the black editor area and typing
    const editorBox = await page.$('.wdkit-code-editor, [class*="editor"], [class*="code"]');
    if (editorBox) {
      await editorBox.click();
      await page.keyboard.type('<div>test</div>');
      await page.waitForTimeout(800);
      await capture(page, '04-code-typed-fallback');
    }
  }

  // ─── BUILDER AUDIT 5: VARIABLE TAB ───────────────────────────────────────
  console.log('\n🔠 [AUDIT 5] Variable tab...');
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('div, span, button')];
    const found = allEls.find(el => el.textContent.includes('Variable') && el.children.length <= 3);
    if (found) found.click();
  });
  await page.waitForTimeout(1500);
  await capture(page, '05-variable-tab');

  const variableContent = await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')];
    const panel = all.find(el => el.textContent.includes('Variable') && el.children.length > 2);
    return panel ? panel.innerHTML.substring(0, 300) : 'NOT FOUND';
  });
  console.log(`  Variable panel: ${variableContent.substring(0, 100)}`);

  // Back to HTML tab
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('div, span, button, li')];
    const found = allEls.find(el => el.textContent.trim() === 'HTML' && el.children.length <= 1);
    if (found) found.click();
  });
  await page.waitForTimeout(500);

  // ─── BUILDER AUDIT 6: CONTROLS PANEL ─────────────────────────────────────
  console.log('\n🎛️  [AUDIT 6] Controls panel inspection...');
  const controlsInfo = await page.evaluate(() => {
    const sections = ['Data Controls', 'Group Controls', 'Unit Controls', 'UI Controls'];
    const result = {};
    sections.forEach(s => {
      const el = [...document.querySelectorAll('*')].find(e => e.textContent.trim() === s);
      result[s] = el ? 'found' : 'MISSING';
    });
    // Count control items
    const items = document.querySelectorAll('[class*="control-item"], [class*="controlItem"], [draggable="true"]');
    return { sections: result, draggableCount: items.length };
  });
  console.log(`  Control sections: ${JSON.stringify(controlsInfo.sections)}`);
  console.log(`  Draggable items: ${controlsInfo.draggableCount}`);

  // Click Group Controls to expand
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const found = allEls.find(el => el.textContent.trim() === 'Group Controls');
    if (found) found.click();
  });
  await page.waitForTimeout(800);
  await capture(page, '06-group-controls-expanded');

  // Click Unit Controls to expand
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const found = allEls.find(el => el.textContent.trim() === 'Unit Controls');
    if (found) found.click();
  });
  await page.waitForTimeout(800);
  await capture(page, '07-unit-controls-expanded');

  // Click UI Controls to expand
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const found = allEls.find(el => el.textContent.trim() === 'UI Controls');
    if (found) found.click();
  });
  await page.waitForTimeout(800);
  await capture(page, '08-ui-controls-expanded');

  // ─── BUILDER AUDIT 7: CONTROLS SEARCH ────────────────────────────────────
  console.log('\n🔍 [AUDIT 7] Controls search functionality...');
  const searchInput = await page.$('input[placeholder*="Search"], input[type="search"], [class*="search"] input');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('Text');
    await page.waitForTimeout(800);
    await capture(page, '09-controls-search');
    const visibleControls = await page.evaluate(() => {
      const items = [...document.querySelectorAll('[class*="control"], [class*="item"]')].filter(
        el => el.textContent.trim().length > 0 && el.children.length === 0 && el.offsetParent !== null
      );
      return items.slice(0, 10).map(el => el.textContent.trim());
    });
    console.log(`  Search results: ${JSON.stringify(visibleControls.slice(0, 5))}`);
    await searchInput.clear();
    await page.waitForTimeout(500);
  } else {
    console.log('  ⚠️  Search input not found');
  }

  // ─── BUILDER AUDIT 8: ADD SECTION BUTTON ─────────────────────────────────
  console.log('\n➕ [AUDIT 8] Add Section button...');
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const addSection = allEls.find(el =>
      el.textContent.trim() === 'Add Section +' ||
      (el.textContent.includes('Add Section') && el.children.length <= 2)
    );
    if (addSection) addSection.click();
  });
  await page.waitForTimeout(2000);
  await capture(page, '10-add-section-clicked');

  const afterAddSection = await page.evaluate(() => {
    const sections = document.querySelectorAll('[class*="section"], [class*="canvas-section"]');
    const popup = document.querySelector('[role="dialog"], [role="alertdialog"], .wdkit-popup');
    return {
      sectionCount: sections.length,
      popupVisible: !!popup,
      bodyHTML: document.body.innerHTML.includes('Add Section') ? 'Add Section still shown' : 'Add Section gone'
    };
  });
  console.log(`  After Add Section: sections=${afterAddSection.sectionCount}, popup=${afterAddSection.popupVisible}`);
  console.log(`  Canvas state: ${afterAddSection.bodyHTML}`);

  // ─── BUILDER AUDIT 9: DRAG CONTROL TO CANVAS ─────────────────────────────
  console.log('\n🖱️  [AUDIT 9] Drag Text control to canvas...');
  // First reset — go back to fresh builder state
  await page.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const textControl = await page.$('[class*="control"][class*="text"], [title="Text"], [data-type="text"]');
  const canvas = await page.$('[class*="canvas"], [class*="drop-zone"], [class*="layout"]');

  if (textControl && canvas) {
    const srcBox = await textControl.boundingBox();
    const dstBox = await canvas.boundingBox();
    if (srcBox && dstBox) {
      await page.mouse.move(srcBox.x + srcBox.width/2, srcBox.y + srcBox.height/2);
      await page.mouse.down();
      await page.waitForTimeout(300);
      await page.mouse.move(dstBox.x + dstBox.width/2, dstBox.y + dstBox.height/2, { steps: 20 });
      await page.waitForTimeout(500);
      await capture(page, '11-drag-in-progress');
      await page.mouse.up();
      await page.waitForTimeout(1500);
      await capture(page, '12-after-drag-drop');
      console.log('  Drag completed');
    }
  } else {
    console.log(`  ⚠️  textControl: ${!!textControl}, canvas: ${!!canvas}`);
  }

  // ─── BUILDER AUDIT 10: SETTINGS GEAR ─────────────────────────────────────
  console.log('\n⚙️  [AUDIT 10] Settings gear...');
  const settingsGear = await page.$('[class*="settings"], [title="Settings"], svg[aria-label*="settings"]');
  if (!settingsGear) {
    // Try clicking by position in toolbar
    await page.evaluate(() => {
      const svgs = [...document.querySelectorAll('svg')];
      // Settings is between Publish and Push in toolbar
      const allClickable = [...document.querySelectorAll('button, [role="button"], a, [onclick]')];
      allClickable.forEach(el => {
        if (el.closest('header, nav, [class*="toolbar"], [class*="topbar"]')) {
          console.log('Toolbar el:', el.tagName, el.className, el.textContent.trim());
        }
      });
    });
  }

  // Take toolbar zoom screenshot for inspection
  await capture(page, '13-toolbar-area');

  // ─── BUILDER AUDIT 11: PUBLISH DROPDOWN ──────────────────────────────────
  console.log('\n📤 [AUDIT 11] Publish dropdown...');
  const publishBtn = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const pub = allEls.find(el => el.textContent.trim() === 'Publish' && el.children.length <= 2);
    if (pub) { pub.click(); return true; }
    return false;
  });
  await page.waitForTimeout(1500);
  await capture(page, '14-publish-dropdown');

  const publishOptions = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[class*="dropdown"] *, [class*="menu"] *')].filter(
      el => el.textContent.trim().length > 0 && el.children.length === 0 && el.offsetParent !== null
    );
    return items.slice(0, 10).map(el => el.textContent.trim()).filter(t => t.length > 1);
  });
  console.log(`  Publish options: ${JSON.stringify(publishOptions)}`);

  // Close dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ─── BUILDER AUDIT 12: PREVIEW MODE ──────────────────────────────────────
  console.log('\n👁️  [AUDIT 12] Preview mode...');
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const preview = allEls.find(el => el.textContent.trim() === 'Preview' && el.children.length <= 2);
    if (preview) preview.click();
  });
  await page.waitForTimeout(2000);
  await capture(page, '15-preview-mode');

  const previewState = await page.evaluate(() => {
    const codeEditor = document.querySelector('[class*="code-editor"], [class*="CodeEditor"]');
    const canvas = document.querySelector('[class*="canvas"], [class*="layout-area"]');
    const controlsPanel = document.querySelector('[class*="controls-panel"], [class*="right-panel"]');
    return {
      codeEditorHidden: !codeEditor || !codeEditor.offsetParent,
      canvasVisible: canvas ? canvas.textContent.includes('Add Section') : false,
      controlsHidden: !controlsPanel || !controlsPanel.offsetParent,
      bodyText: document.body.innerText.substring(0, 200)
    };
  });
  console.log(`  Preview: code=${previewState.codeEditorHidden ? 'hidden' : 'visible'}, canvas=${previewState.canvasVisible}`);

  // Back to Code mode
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const code = allEls.find(el => el.textContent.trim() === 'Code' && el.children.length <= 2);
    if (code) code.click();
  });
  await page.waitForTimeout(1500);

  // ─── BUILDER AUDIT 13: SAVE BUTTON STATE ─────────────────────────────────
  console.log('\n💾 [AUDIT 13] Save button state...');
  const saveInfo = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const save = allEls.find(el => el.textContent.trim() === 'Save' && el.children.length <= 2);
    if (!save) return { found: false };
    return {
      found: true,
      tag: save.tagName,
      disabled: save.disabled || save.hasAttribute('disabled') || save.getAttribute('aria-disabled') === 'true',
      className: typeof save.className === 'string' ? save.className.substring(0, 80) : '[SVG]',
      cursor: getComputedStyle(save).cursor,
      opacity: getComputedStyle(save).opacity
    };
  });
  console.log(`  Save button: ${JSON.stringify(saveInfo)}`);

  // ─── BUILDER AUDIT 14: PUSH BUTTON ───────────────────────────────────────
  console.log('\n🚀 [AUDIT 14] Push button...');
  const pushInfo = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const push = allEls.find(el => el.textContent.trim() === 'Push' && el.children.length <= 2);
    if (!push) return { found: false };
    return {
      found: true,
      tag: push.tagName,
      disabled: push.disabled,
      className: typeof push.className === 'string' ? push.className.substring(0, 80) : '[SVG]'
    };
  });
  console.log(`  Push button: ${JSON.stringify(pushInfo)}`);

  // ─── BUILDER AUDIT 15: BUILD WITH AI ─────────────────────────────────────
  console.log('\n🤖 [AUDIT 15] Build with AI button...');
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const ai = allEls.find(el => el.textContent.includes('Build with AI') && el.children.length <= 3);
    if (ai) ai.click();
  });
  await page.waitForTimeout(2000);
  await capture(page, '16-build-with-ai');

  const aiPanelState = await page.evaluate(() => {
    const panel = document.querySelector('[class*="ai-panel"], [class*="chat"], [class*="ai-chat"]');
    const overlay = document.querySelector('[role="dialog"], [role="alertdialog"]');
    return { panel: !!panel, overlay: !!overlay, bodyChange: document.body.innerHTML.length };
  });
  console.log(`  AI panel: ${JSON.stringify(aiPanelState)}`);

  // Close AI panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ─── BUILDER AUDIT 16: EDIT TAB (right panel) ────────────────────────────
  console.log('\n✏️  [AUDIT 16] Edit tab (right panel)...');
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const edit = allEls.find(el => el.textContent.trim() === 'Edit' && el.children.length <= 2);
    if (edit) edit.click();
  });
  await page.waitForTimeout(1000);
  await capture(page, '17-edit-tab');

  // ─── BUILDER AUDIT 17: STYLE TAB (center panel) ──────────────────────────
  console.log('\n🎨 [AUDIT 17] Style tab (center panel)...');
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const style = allEls.find(el => el.textContent.trim() === 'Style' && el.children.length <= 2);
    if (style) style.click();
  });
  await page.waitForTimeout(1000);
  await capture(page, '18-style-tab');

  // ─── BUILDER AUDIT 18: KEYBOARD NAV ──────────────────────────────────────
  console.log('\n⌨️  [AUDIT 18] Keyboard navigation...');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  const focusedEl = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, class: typeof el?.className === 'string' ? el.className.substring(0, 60) : '[SVG]', text: el?.textContent?.trim().substring(0, 30) };
  });
  console.log(`  First focused el: ${JSON.stringify(focusedEl)}`);

  // ─── BUILDER AUDIT 19: ACCESSIBILITY ─────────────────────────────────────
  console.log('\n♿ [AUDIT 19] Accessibility audit...');
  const a11y = await page.evaluate(() => {
    const interactive = [...document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]')];
    const noLabel = interactive.filter(el => {
      const label = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent?.trim();
      return !label || label.length === 0;
    });
    const images = [...document.querySelectorAll('img')];
    const noAlt = images.filter(el => !el.getAttribute('alt'));
    const contrastIssues = [...document.querySelectorAll('*')].filter(el => {
      const style = getComputedStyle(el);
      const bg = style.backgroundColor;
      const color = style.color;
      // Simple white-on-white detection
      return bg === 'rgb(255, 255, 255)' && color === 'rgb(255, 255, 255)';
    });
    return {
      unlabeledInteractive: noLabel.length,
      unlabeledSamples: noLabel.slice(0, 5).map(el => ({ tag: el.tagName, class: typeof el.className === 'string' ? el.className.substring(0, 40) : '[SVG]' })),
      imgNoAlt: noAlt.length,
      whiteOnWhite: contrastIssues.length
    };
  });
  console.log(`  Unlabeled interactive: ${a11y.unlabeledInteractive}`);
  console.log(`  Samples: ${JSON.stringify(a11y.unlabeledSamples)}`);
  console.log(`  Images without alt: ${a11y.imgNoAlt}`);

  // ─── BUILDER AUDIT 20: DIFFERENT WIDGET TYPES ────────────────────────────
  console.log('\n🔄 [AUDIT 20] Testing Bricks widget builder (12421)...');
  await page.goto('https://wdesignkit.com/admin/widgets/widget-builder/12421', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await capture(page, '19-bricks-builder');

  const bricksTitle = await page.title();
  const bricksWidgetName = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    const name = allEls.find(el => el.textContent.includes('widget') && el.children.length === 0 && el.textContent.length < 50);
    return name ? name.textContent.trim() : 'NOT FOUND';
  });
  console.log(`  Bricks builder title: "${bricksTitle}"`);

  console.log('\n🔄 Testing Elementor/Push widget builder (12415)...');
  await page.goto('https://wdesignkit.com/admin/widgets/widget-builder/12415', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await capture(page, '20-elementor-push-builder');

  // ─── BUILDER AUDIT 21: RESPONSIVE CHECK ──────────────────────────────────
  console.log('\n📱 [AUDIT 21] Responsive — tablet & mobile...');
  await ctx.close();

  // Tablet view
  const tabCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabPage = await tabCtx.newPage();
  await login(tabPage);
  await tabPage.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await tabPage.waitForTimeout(4000);
  await tabPage.screenshot({ path: ss('21-tablet-768') });
  console.log('  📸 tablet-768');
  await tabCtx.close();

  // Mobile view
  const mobCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobPage = await mobCtx.newPage();
  await login(mobPage);
  await mobPage.goto('https://wdesignkit.com/admin/widgets/widget-builder/12422', { waitUntil: 'domcontentloaded' });
  await mobPage.waitForTimeout(4000);
  await mobPage.screenshot({ path: ss('22-mobile-375') });
  console.log('  📸 mobile-375');
  await mobCtx.close();

  await browser.close();

  // ─── FINAL REPORT ─────────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('                   QA FINDINGS SUMMARY');
  console.log('══════════════════════════════════════════════════════\n');

  console.log('📋 PAGE META:');
  console.log(`  Title: "${pageTitle}"`);
  console.log(`  H1s: ${JSON.stringify(h1s)} (count: ${h1s.length})`);
  console.log(`  Meta desc: ${metaDesc}`);

  console.log('\n🚨 CONSOLE ERRORS:');
  if (errors.length === 0) console.log('  None');
  errors.forEach(e => console.log(`  ❌ ${e.substring(0, 120)}`));

  console.log('\n🌐 NETWORK FAILURES:');
  if (networkFailures.length === 0) console.log('  None');
  networkFailures.forEach(f => console.log(`  ${f.status} ${f.url}`));

  console.log('\n🔁 API CALL COUNTS (duplicates > 1):');
  Object.entries(apiCalls)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .forEach(([path, count]) => console.log(`  ${count}x ${path}`));

  console.log('\n♿ ACCESSIBILITY:');
  console.log(`  Unlabeled interactive elements: ${a11y.unlabeledInteractive}`);
  console.log(`  Images without alt: ${a11y.imgNoAlt}`);

  console.log('\n💾 SAVE BUTTON:');
  console.log(`  ${JSON.stringify(saveInfo)}`);

  console.log('\n📤 PUBLISH OPTIONS:');
  console.log(`  ${JSON.stringify(publishOptions)}`);

  console.log('\n✅ QA script complete. Check reports/screenshots/real-builder/ for all captures.');
}

run().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
