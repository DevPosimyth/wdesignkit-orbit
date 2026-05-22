/**
 * Comprehensive QA script — All 4 widget builder types
 * Tests every inner element: toolbar, editor, controls panel,
 * sections, preview, publish flow, AI, network, accessibility
 *
 * IDs: 12422 (Core Gutenberg) | 12421 (Bricks) | 12416 (Push Core) | 12415 (Push Elementor)
 */

const { firefox } = require('playwright');
const fs = require('fs');
const path = require('path');

const BUILDERS = [
  { id: 12422, label: 'Core-Gutenberg' },
  { id: 12421, label: 'Bricks' },
  { id: 12416, label: 'Push-Core' },
  { id: 12415, label: 'Push-Elementor' },
];

const SCREENSHOT_DIR = 'reports/screenshots/all-builders';
const EMAIL = 'devpanchal.posimyth@gmail.com';
const PASS  = 'Dev@0107';

async function login(page) {
  await page.goto('https://wdesignkit.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.press('input[type="password"]', 'Enter');
  await page.waitForURL(/admin/, { timeout: 20000 });
  await page.waitForTimeout(2000);
}

async function auditBuilder(page, builderId, label, results) {
  const url = `https://wdesignkit.com/admin/widgets/widget-builder/${builderId}`;
  const ssDir = path.join(SCREENSHOT_DIR, label);
  fs.mkdirSync(ssDir, { recursive: true });

  const consoleErrors = [];
  const networkErrors = [];
  const workerRequests = [];
  const apiCalls = {};

  // Set up listeners BEFORE navigation
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', async res => {
    const u = res.url();
    const status = res.status();
    if (status >= 400) networkErrors.push(`${status} ${u}`);
    if (u.includes('worker-') && u.endsWith('.js')) {
      let ct = '';
      try { ct = res.headers()['content-type'] || ''; } catch(e) {}
      workerRequests.push({ url: u, status, contentType: ct });
    }
    // Track duplicate API calls
    const cleanUrl = u.split('?')[0];
    if (u.includes('/api/') || u.includes('wdesignkit.com/admin')) {
      apiCalls[cleanUrl] = (apiCalls[cleanUrl] || 0) + 1;
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // --- SCREENSHOT 1: full page load ---
  await page.screenshot({ path: `${ssDir}/01-loaded.png`, fullPage: true });

  // ─────────────────────────────────────────
  // 1. BASIC PAGE INFO
  // ─────────────────────────────────────────
  const pageTitle = await page.title();
  const h1Elements = await page.$$eval('h1', els => els.map(e => e.innerText.trim()));
  const h1Count = h1Elements.length;

  // ─────────────────────────────────────────
  // 2. HEADER TOOLBAR AUDIT
  // ─────────────────────────────────────────
  const toolbar = await page.evaluate(() => {
    const info = {};

    // Widget title in header
    const titleCandidates = [
      document.querySelector('[class*="widget-name"]'),
      document.querySelector('[class*="builder-title"]'),
      document.querySelector('[class*="header"] h2'),
      document.querySelector('[class*="header"] h3'),
      document.querySelector('[class*="wdkit-widget-name"]'),
    ];
    info.widgetTitle = titleCandidates.find(el => el && el.innerText)?.innerText.trim() || 'NOT FOUND';

    // Back button
    const backBtn = document.querySelector('a[href*="widget"], button[class*="back"]');
    info.backButton = backBtn ? { tag: backBtn.tagName, text: backBtn.innerText.trim() } : null;

    // All header buttons
    const header = document.querySelector('[class*="header"], nav, [class*="topbar"], [class*="toolbar"]');
    const buttons = [];
    if (header) {
      header.querySelectorAll('button, [role="button"], span[class*="btn"], a[class*="btn"]').forEach(el => {
        const text = el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('title') || '[no label]';
        const tag = el.tagName;
        const ariaLabel = el.getAttribute('aria-label') || '';
        const role = el.getAttribute('role') || '';
        const tabindex = el.getAttribute('tabindex') || '';
        buttons.push({ text, tag, ariaLabel, role, tabindex });
      });
    }
    info.headerButtons = buttons;

    // Push button
    const pushBtn = [...document.querySelectorAll('button, span')].find(el => el.innerText?.includes('Push'));
    info.pushButton = pushBtn ? {
      tag: pushBtn.tagName,
      text: pushBtn.innerText.trim(),
      ariaLabel: pushBtn.getAttribute('aria-label') || 'MISSING',
      disabled: pushBtn.disabled || pushBtn.getAttribute('aria-disabled') || false
    } : null;

    // Save button
    const saveBtn = [...document.querySelectorAll('button, span')].find(el => el.innerText?.includes('Save') || el.innerText?.includes('save'));
    info.saveButton = saveBtn ? {
      tag: saveBtn.tagName,
      text: saveBtn.innerText.trim(),
      ariaLabel: saveBtn.getAttribute('aria-label') || 'MISSING',
      disabled: saveBtn.disabled || saveBtn.getAttribute('aria-disabled') || false,
      className: typeof saveBtn.className === 'string' ? saveBtn.className.substring(0, 80) : '[SVG/other]'
    } : null;

    // Profile image
    const profileImg = document.querySelector('img[src*="avatar"], img[src*="profile"], img[src*="user"], img[class*="avatar"], img[class*="profile"]');
    info.profileImage = profileImg ? {
      src: (profileImg.src || '').substring(0, 80),
      alt: profileImg.getAttribute('alt') ?? 'MISSING',
      hasAlt: profileImg.hasAttribute('alt') && profileImg.getAttribute('alt') !== ''
    } : null;

    return info;
  });

  // ─────────────────────────────────────────
  // 3. CODE EDITOR AUDIT
  // ─────────────────────────────────────────
  const editorAudit = await page.evaluate(() => {
    const info = {};

    // Ace editor presence
    info.acePresent = !!(document.querySelector('.ace_editor') || document.querySelector('[class*="ace_"]'));
    info.aceTheme = (() => {
      const el = document.querySelector('.ace_editor');
      if (!el) return 'NOT FOUND';
      const cls = typeof el.className === 'string' ? el.className : '';
      const m = cls.match(/ace-(\w+)/);
      return m ? m[1] : 'unknown';
    })();

    // Editor tabs (HTML/CSS/JS)
    const tabArea = document.querySelector('[class*="editor-tab"], [class*="code-tab"], [role="tablist"]');
    info.editorTabsPresent = !!tabArea;
    if (tabArea) {
      info.editorTabs = [...tabArea.querySelectorAll('*')].filter(el => {
        const t = el.innerText?.trim();
        return t && ['HTML', 'CSS', 'JS', 'JavaScript'].includes(t);
      }).map(el => ({
        text: el.innerText.trim(),
        tag: el.tagName,
        role: el.getAttribute('role') || 'NONE',
        tabindex: el.getAttribute('tabindex') ?? 'NONE'
      }));
    }

    // Check if tabs exist anywhere even without tablist role
    if (!info.editorTabsPresent) {
      const allEls = [...document.querySelectorAll('span, button, div, li')];
      const htmlTab = allEls.find(el => el.innerText?.trim() === 'HTML');
      const cssTab = allEls.find(el => el.innerText?.trim() === 'CSS');
      const jsTab = allEls.find(el => el.innerText?.trim() === 'JS' || el.innerText?.trim() === 'JavaScript');
      info.editorTabs = [
        htmlTab ? { text: 'HTML', tag: htmlTab.tagName, role: htmlTab.getAttribute('role') || 'NONE' } : null,
        cssTab ? { text: 'CSS', tag: cssTab.tagName, role: cssTab.getAttribute('role') || 'NONE' } : null,
        jsTab ? { text: 'JS', tag: jsTab.tagName, role: jsTab.getAttribute('role') || 'NONE' } : null,
      ].filter(Boolean);
    }

    // Search bar in editor
    const searchInput = document.querySelector('.ace_search_field, [class*="editor-search"], input[placeholder*="Search"], input[placeholder*="search"]');
    info.searchInput = searchInput ? { tag: searchInput.tagName, placeholder: searchInput.placeholder } : null;

    // Status bar / character/line count
    const statusCandidates = [...document.querySelectorAll('[class*="status"], [class*="footer"], [class*="info-bar"]')]
      .filter(el => {
        const t = el.innerText || '';
        return (t.includes('Line') || t.includes('line') || t.includes('Char') || t.includes('char')) && t.length < 200;
      });
    info.statusBar = statusCandidates[0]?.innerText.trim().substring(0, 100) || 'NOT FOUND';

    // Ace editor content (first 200 chars)
    const aceContent = document.querySelector('.ace_text-layer');
    info.editorContentPreview = aceContent ? aceContent.innerText.substring(0, 200) : 'EMPTY';

    return info;
  });

  // ─────────────────────────────────────────
  // 4. LEFT PANEL / CONTROLS AUDIT
  // ─────────────────────────────────────────
  const panelAudit = await page.evaluate(() => {
    const info = {};

    // Panel tabs (Controls / Variables / Settings)
    const panelTabs = [];
    const allEls = [...document.querySelectorAll('span, button, div, li, a')];
    ['Controls', 'Variables', 'Settings', 'Sections', 'Preview', 'Assets'].forEach(label => {
      const el = allEls.find(e => e.innerText?.trim() === label && e.innerText?.trim().length < 20);
      if (el) panelTabs.push({ label, tag: el.tagName, role: el.getAttribute('role') || 'NONE', tabindex: el.getAttribute('tabindex') ?? 'NONE' });
    });
    info.panelTabs = panelTabs;

    // Add Control button
    const addControlBtn = [...document.querySelectorAll('button, span, div')].find(el => {
      const t = el.innerText?.trim();
      return t && (t.includes('Add Control') || t.includes('Add control') || t === '+ Control');
    });
    info.addControlBtn = addControlBtn ? {
      tag: addControlBtn.tagName,
      text: addControlBtn.innerText.trim(),
      role: addControlBtn.getAttribute('role') || 'NONE'
    } : null;

    // Group Controls section
    const groupControls = [...document.querySelectorAll('*')].find(el => el.innerText?.trim().startsWith('Group Controls') && el.innerText?.trim().length < 30);
    info.groupControlsFound = !!groupControls;
    if (groupControls) {
      const content = groupControls.nextElementSibling || groupControls.parentElement?.children[1];
      info.groupControlsEmpty = content ? content.innerText.trim().length < 5 : true;
    }

    // Add Section button
    const addSection = [...document.querySelectorAll('button, span, div')].find(el => {
      const t = el.innerText?.trim();
      return t && (t.includes('Add Section') || t === '+ Section' || t.includes('Add section'));
    });
    info.addSectionBtn = addSection ? {
      tag: addSection.tagName,
      text: addSection.innerText.trim(),
      role: addSection.getAttribute('role') || 'NONE'
    } : null;

    // Section list
    const sectionItems = [...document.querySelectorAll('[class*="section-item"], [class*="section-list"] li, [class*="wdkit-section"]')];
    info.sectionCount = sectionItems.length;
    info.sectionNames = sectionItems.slice(0, 5).map(el => el.innerText.trim().substring(0, 40));

    // Variables tab content (click if needed)
    const varTab = allEls.find(e => e.innerText?.trim() === 'Variables' && e.innerText?.trim().length < 15);
    info.variablesTabFound = !!varTab;

    return info;
  });

  // ─────────────────────────────────────────
  // 5. PREVIEW PANEL AUDIT
  // ─────────────────────────────────────────
  const previewAudit = await page.evaluate(() => {
    const info = {};

    // Preview iframe or div
    const previewIframe = document.querySelector('iframe[src*="preview"], iframe[class*="preview"], iframe[title*="preview"]');
    const previewDiv = document.querySelector('[class*="preview-panel"], [class*="preview-area"], [class*="widget-preview"]');
    info.previewIframe = !!previewIframe;
    info.previewDiv = previewDiv ? { className: (typeof previewDiv.className === 'string' ? previewDiv.className.substring(0, 80) : ''), isEmpty: previewDiv.innerText.trim().length < 5 } : null;

    // Device toggle buttons (desktop/tablet/mobile)
    const deviceToggles = [...document.querySelectorAll('[class*="device"], [class*="viewport"], [title*="Desktop"], [title*="Mobile"], [title*="Tablet"]')].slice(0, 6);
    info.deviceToggles = deviceToggles.map(el => ({
      tag: el.tagName,
      title: el.getAttribute('title') || el.innerText.trim() || '[no label]',
      ariaLabel: el.getAttribute('aria-label') || 'MISSING'
    }));

    return info;
  });

  // ─────────────────────────────────────────
  // 6. PUBLISH/SAVE FLOW AUDIT
  // ─────────────────────────────────────────
  const publishAudit = await page.evaluate(() => {
    const info = {};

    // Publish button / dropdown
    const publishBtn = [...document.querySelectorAll('button, span, div')].find(el => {
      const t = el.innerText?.trim();
      return t && (t === 'Publish' || t.includes('Publish') || t.includes('Draft'));
    });
    info.publishBtn = publishBtn ? {
      tag: publishBtn.tagName,
      text: publishBtn.innerText.trim().substring(0, 40),
      role: publishBtn.getAttribute('role') || 'NONE',
      ariaLabel: publishBtn.getAttribute('aria-label') || 'MISSING'
    } : null;

    // Status indicator (Draft/Published label)
    const statusPill = [...document.querySelectorAll('span, div, label')].find(el => {
      const t = el.innerText?.trim();
      return t && (t === 'Draft' || t === 'Published' || t === 'Unpublished') && t.length < 15;
    });
    info.statusPill = statusPill ? statusPill.innerText.trim() : 'NOT FOUND';

    return info;
  });

  // ─────────────────────────────────────────
  // 7. AI FEATURES AUDIT
  // ─────────────────────────────────────────
  const aiAudit = await page.evaluate(() => {
    const info = {};

    // Build with AI button
    const aiBtn = [...document.querySelectorAll('button, span, div, a')].find(el => {
      const t = el.innerText?.trim();
      return t && (t.includes('Build with AI') || t.includes('AI') && el.innerText.length < 30);
    });
    info.buildWithAIBtn = aiBtn ? {
      tag: aiBtn.tagName,
      text: aiBtn.innerText.trim().substring(0, 50),
      role: aiBtn.getAttribute('role') || 'NONE',
      ariaLabel: aiBtn.getAttribute('aria-label') || 'MISSING'
    } : null;

    // AI panel/chat (if open or present)
    const aiPanel = document.querySelector('[class*="ai-panel"], [class*="ai-chat"], [class*="ai-builder"]');
    info.aiPanelPresent = !!aiPanel;

    return info;
  });

  // ─────────────────────────────────────────
  // 8. ACCESSIBILITY AUDIT — All interactive spans
  // ─────────────────────────────────────────
  const a11yAudit = await page.evaluate(() => {
    const issues = [];

    // All interactive SPAN elements (without proper role/tabindex)
    const spans = [...document.querySelectorAll('span')].filter(el => {
      const hasClick = el.onclick || el.getAttribute('onclick');
      const hasCursor = window.getComputedStyle(el).cursor === 'pointer';
      return (hasClick || hasCursor) && el.innerText.trim().length > 0;
    });

    spans.forEach(el => {
      const role = el.getAttribute('role');
      const tabindex = el.getAttribute('tabindex');
      const ariaLabel = el.getAttribute('aria-label');
      if (!role || !tabindex) {
        issues.push({
          text: el.innerText.trim().substring(0, 40),
          className: typeof el.className === 'string' ? el.className.substring(0, 60) : '',
          role: role || 'MISSING',
          tabindex: tabindex || 'MISSING',
          ariaLabel: ariaLabel || 'MISSING'
        });
      }
    });

    // Images without alt text
    const imgs = [...document.querySelectorAll('img')];
    const imgsNoAlt = imgs.filter(img => !img.hasAttribute('alt') || img.alt === '').map(img => ({
      src: (img.src || '').substring(0, 80),
      context: (img.closest('[class]')?.className || '').substring(0, 60)
    }));

    // Buttons without accessible names
    const btns = [...document.querySelectorAll('button')];
    const unnamedBtns = btns.filter(btn => {
      const hasText = btn.innerText.trim().length > 0;
      const hasAria = btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby');
      const hasTitle = btn.getAttribute('title');
      return !hasText && !hasAria && !hasTitle;
    }).map(btn => ({
      className: typeof btn.className === 'string' ? btn.className.substring(0, 60) : '',
      innerHTML: btn.innerHTML.substring(0, 80)
    }));

    return { interactiveSpansIssues: issues, imgsNoAlt, unnamedBtns };
  });

  // ─────────────────────────────────────────
  // 9. CLICK "Build with AI" and audit panel
  // ─────────────────────────────────────────
  let aiPanelAudit = null;
  try {
    const aiBtn = await page.$('button:has-text("Build with AI"), span:has-text("Build with AI")');
    if (aiBtn) {
      await aiBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${ssDir}/02-ai-panel.png` });
      aiPanelAudit = await page.evaluate(() => {
        const panel = document.querySelector('[class*="ai"], [class*="chat"]');
        if (!panel) return { opened: false };
        const promptInput = panel.querySelector('textarea, input[type="text"]');
        const sendBtn = panel.querySelector('button[type="submit"], button:has-text("Send"), button:has-text("Generate")');
        return {
          opened: true,
          hasPromptInput: !!promptInput,
          hasSendBtn: sendBtn ? { tag: sendBtn.tagName, text: sendBtn.innerText.trim() } : null,
          isEmpty: panel.innerText.trim().length < 20,
          panelClassPreview: (typeof panel.className === 'string' ? panel.className : '').substring(0, 80)
        };
      });
      // Close AI panel
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  } catch(e) { /* AI btn not clickable */ }

  // ─────────────────────────────────────────
  // 10. TEST HTML/CSS/JS TAB SWITCHING
  // ─────────────────────────────────────────
  let tabSwitchAudit = null;
  try {
    const cssTabEl = await page.$('span:has-text("CSS"), button:has-text("CSS")');
    if (cssTabEl) {
      await cssTabEl.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${ssDir}/03-css-tab.png` });
      const jsTabEl = await page.$('span:has-text("JS"), button:has-text("JS"), span:has-text("JavaScript")');
      if (jsTabEl) {
        await jsTabEl.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${ssDir}/04-js-tab.png` });
      }
      // Switch back to HTML
      const htmlTabEl = await page.$('span:has-text("HTML"), button:has-text("HTML")');
      if (htmlTabEl) {
        await htmlTabEl.click();
        await page.waitForTimeout(500);
      }
      tabSwitchAudit = { worked: true };
    } else {
      tabSwitchAudit = { worked: false, reason: 'CSS tab not found' };
    }
  } catch(e) { tabSwitchAudit = { worked: false, reason: e.message }; }

  // ─────────────────────────────────────────
  // 11. TEST VARIABLES TAB
  // ─────────────────────────────────────────
  let varTabAudit = null;
  try {
    const varTabEl = await page.$('span:has-text("Variables"), button:has-text("Variables")');
    if (varTabEl) {
      await varTabEl.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${ssDir}/05-variables-tab.png` });
      varTabAudit = await page.evaluate(() => {
        const panel = document.querySelector('[class*="variable"], [class*="variables"]') ||
          [...document.querySelectorAll('[class*="tab-content"] > *, [class*="panel-content"] > *')].pop();
        return {
          contentVisible: !!panel,
          isEmpty: panel ? panel.innerText.trim().length < 10 : true,
          content: panel ? panel.innerText.trim().substring(0, 100) : 'NO CONTENT'
        };
      });
    } else {
      varTabAudit = { found: false };
    }
  } catch(e) { varTabAudit = { error: e.message }; }

  // ─────────────────────────────────────────
  // 12. TEST PUBLISH DROPDOWN
  // ─────────────────────────────────────────
  let publishDropAudit = null;
  try {
    const publishEl = await page.$('button:has-text("Publish"), span:has-text("Publish"), [class*="publish-btn"]');
    if (publishEl) {
      await publishEl.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${ssDir}/06-publish-dropdown.png` });
      publishDropAudit = await page.evaluate(() => {
        const dropdown = document.querySelector('[class*="dropdown"], [class*="publish-menu"], [role="menu"]');
        if (!dropdown) return { opened: false };
        const options = [...dropdown.querySelectorAll('li, [role="menuitem"], span, button')].filter(el => el.innerText.trim().length > 0);
        return { opened: true, options: options.map(el => el.innerText.trim()).slice(0, 10) };
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      publishDropAudit = { found: false };
    }
  } catch(e) { publishDropAudit = { error: e.message }; }

  // ─────────────────────────────────────────
  // 13. TEST ADD SECTION
  // ─────────────────────────────────────────
  let addSectionAudit = null;
  try {
    const addSecEl = await page.$('span:has-text("Add Section"), button:has-text("Add Section"), [class*="add-section"]');
    if (addSecEl) {
      await addSecEl.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${ssDir}/07-add-section.png` });
      addSectionAudit = await page.evaluate(() => {
        const sections = [...document.querySelectorAll('[class*="section-item"], [class*="section-list"] li, [class*="wdkit-section"]')];
        return { sectionCount: sections.length, sectionNames: sections.map(el => el.innerText.trim().substring(0, 30)) };
      });
    } else {
      addSectionAudit = { found: false };
    }
  } catch(e) { addSectionAudit = { error: e.message }; }

  // ─────────────────────────────────────────
  // 14. RESPONSIVE — TABLET AND MOBILE
  // ─────────────────────────────────────────
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${ssDir}/08-tablet-768.png`, fullPage: false });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${ssDir}/09-mobile-375.png`, fullPage: false });

  // Reset to desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);

  // ─────────────────────────────────────────
  // 15. FINAL FULL PAGE SCREENSHOT
  // ─────────────────────────────────────────
  await page.screenshot({ path: `${ssDir}/10-final-fullpage.png`, fullPage: true });

  // ─────────────────────────────────────────
  // COMPILE RESULTS
  // ─────────────────────────────────────────
  const duplicateAPIs = Object.entries(apiCalls).filter(([, count]) => count > 1).map(([url, count]) => ({ url, count }));

  results[label] = {
    url,
    pageTitle,
    h1Count,
    h1Elements,
    consoleErrors,
    networkErrors: networkErrors.slice(0, 20),
    workerRequests,
    duplicateAPIs,
    toolbar,
    editorAudit,
    panelAudit,
    previewAudit,
    publishAudit,
    aiAudit,
    aiPanelAudit,
    tabSwitchAudit,
    varTabAudit,
    publishDropAudit,
    addSectionAudit,
    a11yAudit: {
      interactiveSpansCount: a11yAudit.interactiveSpansIssues.length,
      interactiveSpansSample: a11yAudit.interactiveSpansIssues.slice(0, 8),
      imgsNoAltCount: a11yAudit.imgsNoAlt.length,
      imgsNoAltSample: a11yAudit.imgsNoAlt.slice(0, 5),
      unnamedBtnsCount: a11yAudit.unnamedBtns.length,
      unnamedBtnsSample: a11yAudit.unnamedBtns.slice(0, 5),
    }
  };

  console.log(`\n✅ ${label} (${builderId}) — audit complete`);
  console.log(`   Page title: ${pageTitle}`);
  console.log(`   H1 count: ${h1Count} — ${h1Elements.join(', ') || 'NONE'}`);
  console.log(`   Console errors: ${consoleErrors.length}`);
  console.log(`   Network errors: ${networkErrors.length}`);
  console.log(`   Worker requests: ${workerRequests.length}`);
  console.log(`   Duplicate APIs: ${duplicateAPIs.length}`);
  console.log(`   Accessibility — inaccessible spans: ${a11yAudit.interactiveSpansIssues.length}, imgs no alt: ${a11yAudit.imgsNoAlt.length}, unnamed btns: ${a11yAudit.unnamedBtns.length}`);
}

(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('🔐 Logging in...');
  await login(page);
  console.log('✅ Logged in\n');

  const results = {};

  for (const builder of BUILDERS) {
    console.log(`\n🔍 Auditing builder ${builder.id} — ${builder.label}...`);
    try {
      await auditBuilder(page, builder.id, builder.label, results);
    } catch (err) {
      console.error(`❌ Error auditing ${builder.label}: ${err.message}`);
      results[builder.label] = { error: err.message };
    }
  }

  // Save full JSON report
  const reportPath = 'reports/bugs/all-builders-raw-data.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Raw data saved to ${reportPath}`);

  // Print comparison summary
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('                    CROSS-BUILDER COMPARISON                ');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const [label, data] of Object.entries(results)) {
    if (data.error) {
      console.log(`❌ ${label}: SCRIPT ERROR — ${data.error}`);
      continue;
    }
    console.log(`── ${label} ──────────────────────`);
    console.log(`   H1: ${data.h1Count} | Console errs: ${data.consoleErrors.length} | Network errs: ${data.networkErrors.length}`);
    console.log(`   Worker MIME issues: ${data.workerRequests.filter(w => !w.contentType.includes('javascript')).length}`);
    console.log(`   Duplicate API calls: ${data.duplicateAPIs.length}`);
    console.log(`   Tab switch: ${data.tabSwitchAudit?.worked ? '✅' : '❌'}`);
    console.log(`   Variables tab: ${data.varTabAudit?.isEmpty === false ? '✅ has content' : '⚠️ empty or missing'}`);
    console.log(`   Preview panel: ${data.previewAudit?.previewDiv?.isEmpty === false ? '✅' : '❌ empty'}`);
    console.log(`   Push btn aria-label: ${data.toolbar?.pushButton?.ariaLabel || 'N/A'}`);
    console.log(`   Profile img alt: ${data.toolbar?.profileImage?.hasAlt ? '✅' : '❌ MISSING'}`);
    console.log(`   Inaccessible spans: ${data.a11yAudit?.interactiveSpansCount}`);
    console.log(`   Imgs no alt: ${data.a11yAudit?.imgsNoAltCount}`);
    console.log(`   Unnamed buttons: ${data.a11yAudit?.unnamedBtnsCount}`);
    console.log(`   AI panel: ${data.aiPanelAudit?.opened ? '✅ opens' : data.aiPanelAudit === null ? 'not tested' : '❌ did not open'}`);
    console.log();
  }

  await browser.close();
  console.log('\n🏁 All builders audited. Check reports/bugs/all-builders-raw-data.json');
})();
