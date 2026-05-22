/**
 * Screenshot: Duplicate width:100% in CSS
 * Saves annotated code-view to /tmp/bug-duplicate-width.png
 */

const { chromium } = require('@playwright/test');
const path = require('path');

const OUT_FILE = path.join('/tmp', 'bug-duplicate-width.png');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d1117;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    padding: 32px;
    width: 860px;
  }
  .header {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 10px 10px 0 0;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .dots { display: flex; gap: 6px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.r { background: #ff5f57; }
  .dot.y { background: #ffbd2e; }
  .dot.g { background: #28c840; }
  .file-label { color: #9ca3af; font-size: 12px; font-family: inherit; }
  .code-wrap {
    background: #161b22;
    border: 1px solid #374151;
    border-top: none;
    border-radius: 0 0 10px 10px;
    overflow: hidden;
  }
  .code-table { width: 100%; border-collapse: collapse; }
  .ln {
    width: 44px; text-align: right; padding: 0 12px 0 8px;
    color: #4b5563; font-size: 13px; line-height: 24px;
    background: #161b22; border-right: 1px solid #21262d;
  }
  .code { padding: 0 16px; font-size: 13.5px; line-height: 24px; color: #c9d1d9; white-space: pre; }
  tr td { background: #161b22; }
  tr.first td { background: #2d2200 !important; }
  tr.first .code { color: #fbbf24; }
  tr.first .ln { color: #d97706; background: #2d2200 !important; border-right-color: #78350f; }
  tr.dup td { background: #2d0a0a !important; }
  tr.dup .code { color: #f87171; }
  tr.dup .ln { color: #ef4444; background: #2d0a0a !important; border-right-color: #7f1d1d; }
  .sel  { color: #79c0ff; }
  .prop { color: #7ee787; }
  .val  { color: #a5d6ff; }
  .punc { color: #8b949e; }
  .cmt  { color: #6e7681; font-style: italic; }
  .callout {
    margin: 20px 0 0 0;
    background: #1a0505;
    border: 1px solid #7f1d1d;
    border-left: 4px solid #ef4444;
    border-radius: 6px;
    padding: 14px 18px;
    color: #fca5a5;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.7;
  }
  .badge {
    display: inline-block; background: #7f1d1d; color: #fca5a5;
    font-size: 11px; font-weight: 700; padding: 2px 9px;
    border-radius: 20px; margin-right: 8px;
  }
  .pill {
    display: inline-block; background: #0f1f3a; color: #93c5fd;
    font-size: 12px; font-family: monospace; padding: 1px 7px; border-radius: 4px;
  }
  .arrow-first { color: #fbbf24; font-weight: bold; }
  .arrow-dup   { color: #ef4444; font-weight: bold; }
</style>
</head>
<body>

<div class="header">
  <div class="dots">
    <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
  </div>
  <span class="file-label">scroll_to_decrypt_123d86.php — render() inline &lt;style&gt; block</span>
</div>

<div class="code-wrap">
<table class="code-table"><tbody>
<tr><td class="ln">1</td><td class="code"><span class="sel">.wkit-scroll-to-decrpt-main</span> <span class="punc">{</span></td></tr>
<tr class="first">
  <td class="ln">2</td>
  <td class="code">  <span class="prop">width</span><span class="punc">: </span><span class="val">100%</span><span class="punc">;</span>           <span class="cmt" style="color:#d97706;">/* ① First declaration — OK */</span></td>
</tr>
<tr><td class="ln">3</td><td class="code">  <span class="prop">font-family</span><span class="punc">: </span><span class="val">monospace</span><span class="punc">;</span></td></tr>
<tr><td class="ln">4</td><td class="code">  <span class="prop">padding</span><span class="punc">: </span><span class="val">50px</span><span class="punc">;</span></td></tr>
<tr><td class="ln">5</td><td class="code">  <span class="prop">background</span><span class="punc">: </span><span class="val">#111</span><span class="punc">;</span></td></tr>
<tr><td class="ln">6</td><td class="code">  <span class="prop">display</span><span class="punc">: </span><span class="val">flex</span><span class="punc">;</span></td></tr>
<tr><td class="ln">7</td><td class="code">  <span class="prop">align-items</span><span class="punc">: </span><span class="val">center</span><span class="punc">;</span></td></tr>
<tr><td class="ln">8</td><td class="code">  <span class="prop">overflow</span><span class="punc">: </span><span class="val">hidden</span><span class="punc">;</span></td></tr>
<tr><td class="ln">9</td><td class="code">  <span class="prop">box-sizing</span><span class="punc">: </span><span class="val">border-box</span><span class="punc">;</span></td></tr>
<tr class="dup">
  <td class="ln">10</td>
  <td class="code">  <span style="color:#f87171;"><span class="prop" style="color:#f87171;">width</span><span class="punc" style="color:#8b949e;">: </span><span style="color:#f87171;">100%</span><span class="punc" style="color:#8b949e;">;</span></span>           <span style="color:#ef4444;font-style:italic;">/* ② DUPLICATE — redundant, no effect — REMOVE THIS LINE */</span></td>
</tr>
<tr><td class="ln">11</td><td class="code"><span class="punc">}</span></td></tr>
</tbody></table>
</div>

<div class="callout">
  <span class="badge">P3 · Code Quality</span>
  <strong style="color:#f87171;">Duplicate CSS property in the same rule block</strong><br><br>
  <span class="pill">width: 100%</span> is declared <strong>twice</strong> inside <span class="pill">.wkit-scroll-to-decrpt-main</span>.<br>
  <span class="arrow-first">● Line 2</span> — original declaration (correct)<br>
  <span class="arrow-dup">● Line 10</span> — exact duplicate, no effect, dead code injected on every widget render<br><br>
  <strong>Fix:</strong> Delete line 10. Keep only the first <span class="pill">width: 100%</span>.
</div>

</body>
</html>`;

(async () => {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page    = await browser.newPage();

    await page.setViewportSize({ width: 860, height: 700 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight + 64);
    await page.setViewportSize({ width: 860, height: bodyHeight });

    await page.screenshot({ path: OUT_FILE, fullPage: true });
    await browser.close();

    console.log('SCREENSHOT_PATH=' + OUT_FILE);
})().catch(err => { console.error(err); process.exit(1); });
