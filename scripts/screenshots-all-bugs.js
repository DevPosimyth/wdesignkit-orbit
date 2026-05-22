/**
 * Generate all 6 bug screenshots for Scroll to Decrypt widget QA
 * Saves to /tmp/bug-{slug}.png
 */

const { chromium } = require('@playwright/test');
const path = require('path');

const BUGS = [

  // ── 1. CSS class typo ────────────────────────────────────────────────────
  {
    slug: 'class-typo',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#0d1117; font-family:'Consolas','Monaco',monospace; padding:32px; width:860px; }
.header { background:#1f2937; border:1px solid #374151; border-radius:10px 10px 0 0; padding:12px 20px; display:flex; align-items:center; gap:12px; }
.dots { display:flex; gap:6px; }
.dot { width:12px; height:12px; border-radius:50%; }
.dot.r{background:#ff5f57;} .dot.y{background:#ffbd2e;} .dot.g{background:#28c840;}
.file-label{color:#9ca3af;font-size:12px;}
.code-wrap { background:#161b22; border:1px solid #374151; border-top:none; border-radius:0 0 10px 10px; overflow:hidden; }
.code-table { width:100%; border-collapse:collapse; }
.ln { width:44px; text-align:right; padding:0 12px 0 8px; color:#4b5563; font-size:13px; line-height:24px; background:#161b22; border-right:1px solid #21262d; }
.code { padding:0 16px; font-size:13.5px; line-height:24px; color:#c9d1d9; white-space:pre; }
tr td { background:#161b22; }
tr.bad td { background:#2d0a0a !important; }
tr.bad .ln { color:#ef4444; background:#2d0a0a !important; border-right-color:#7f1d1d; }
.sel{color:#79c0ff;} .prop{color:#7ee787;} .val{color:#a5d6ff;} .punc{color:#8b949e;} .cmt{color:#6e7681;font-style:italic;}
.callout { margin:20px 0 0; background:#1a0505; border:1px solid #7f1d1d; border-left:4px solid #ef4444; border-radius:6px; padding:14px 18px; color:#fca5a5; font-size:13px; font-family:-apple-system,sans-serif; line-height:1.7; }
.badge { display:inline-block; background:#7f1d1d; color:#fca5a5; font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; margin-right:8px; }
.pill { display:inline-block; background:#0f1f3a; color:#93c5fd; font-size:12px; font-family:monospace; padding:1px 7px; border-radius:4px; }
.zoom-box { margin:14px 0 0; background:#1f2937; border:1px solid #374151; border-radius:6px; padding:12px 16px; font-family:monospace; font-size:15px; display:flex; align-items:center; gap:18px; }
.wrong { color:#f87171; } .correct { color:#34d399; }
.arrow { color:#6b7280; font-size:18px; }
</style></head><body>
<div class="header"><div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
<span class="file-label">scroll_to_decrypt_123d86.php — render() output + CSS selectors</span></div>
<div class="code-wrap"><table class="code-table"><tbody>
<tr><td class="ln">1</td><td class="code"><span class="punc">echo</span> <span class="val">'&lt;div class="</span><span style="color:#f87171;font-weight:bold;">wkit-scroll-to-decrpt</span><span class="val">-main"&gt;'</span><span class="punc">;</span>  <span class="cmt">// render()</span></td></tr>
<tr class="bad"><td class="ln">2</td><td class="code"><span class="sel">.<span style="color:#f87171;font-weight:bold;text-decoration:underline wavy #ef4444;">wkit-scroll-to-decrpt</span>-main</span> <span class="punc">{</span>              <span class="cmt" style="color:#ef4444;">/* ← typo: missing "y" */</span></td></tr>
<tr><td class="ln">3</td><td class="code">  <span class="prop">width</span><span class="punc">:</span> <span class="val">100%</span><span class="punc">;</span></td></tr>
<tr><td class="ln">4</td><td class="code">  <span class="prop">background</span><span class="punc">:</span> <span class="val">#111</span><span class="punc">;</span></td></tr>
<tr><td class="ln">5</td><td class="code"><span class="punc">}</span></td></tr>
<tr><td class="ln">6</td><td class="code"></td></tr>
<tr><td class="ln">7</td><td class="code"><span class="cmt">// Also in JS querySelector:</span></td></tr>
<tr class="bad"><td class="ln">8</td><td class="code"><span class="punc">document.</span><span class="prop">querySelectorAll</span><span class="punc">(</span><span class="val">'.<span style="color:#f87171;font-weight:bold;">wkit-scroll-to-decrpt</span>-main'</span><span class="punc">)</span>  <span class="cmt" style="color:#ef4444;">/* ← same typo */</span></td></tr>
</tbody></table></div>
<div class="callout">
  <span class="badge">P2 · Code Quality</span>
  <strong style="color:#f87171;">"decrypt" misspelled as "decrpt" — letter "y" missing</strong><br><br>
  The class name <span class="pill">.wkit-scroll-to-decrpt-main</span> has a consistent typo across PHP render(), CSS, and JS. Any developer writing custom CSS must use the misspelled name.
  <div class="zoom-box">
    <span>❌ &nbsp;<span class="wrong">.wkit-scroll-to-de<u>crpt</u>-main</span></span>
    <span class="arrow">→</span>
    <span>✅ &nbsp;<span class="correct">.wkit-scroll-to-de<strong>crypt</strong>-main</span></span>
  </div>
</div>
</body></html>`
  },

  // ── 2. Duplicate scroll listener ─────────────────────────────────────────
  {
    slug: 'duplicate-listener',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#0d1117; font-family:'Consolas','Monaco',monospace; padding:32px; width:860px; }
.header { background:#1f2937; border:1px solid #374151; border-radius:10px 10px 0 0; padding:12px 20px; display:flex; align-items:center; gap:12px; }
.dots{display:flex;gap:6px;} .dot{width:12px;height:12px;border-radius:50%;}
.dot.r{background:#ff5f57;} .dot.y{background:#ffbd2e;} .dot.g{background:#28c840;}
.file-label{color:#9ca3af;font-size:12px;}
.code-wrap{background:#161b22;border:1px solid #374151;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;}
.code-table{width:100%;border-collapse:collapse;}
.ln{width:44px;text-align:right;padding:0 12px 0 8px;color:#4b5563;font-size:13px;line-height:24px;background:#161b22;border-right:1px solid #21262d;}
.code{padding:0 16px;font-size:13.5px;line-height:24px;color:#c9d1d9;white-space:pre;}
tr td{background:#161b22;}
tr.ok td{background:#0d2a1a !important;} tr.ok .ln{color:#34d399;background:#0d2a1a !important;border-right-color:#064e3b;}
tr.bad td{background:#2d0a0a !important;} tr.bad .ln{color:#ef4444;background:#2d0a0a !important;border-right-color:#7f1d1d;}
tr.dim td{background:#161b22;} tr.dim .code{color:#4b5563;}
.fn{color:#d2a8ff;} .str{color:#a5d6ff;} .kw{color:#ff7b72;} .punc{color:#8b949e;} .cmt{color:#6e7681;font-style:italic;}
.callout{margin:20px 0 0;background:#1a0505;border:1px solid #7f1d1d;border-left:4px solid #ef4444;border-radius:6px;padding:14px 18px;color:#fca5a5;font-size:13px;font-family:-apple-system,sans-serif;line-height:1.7;}
.badge{display:inline-block;background:#7f1d1d;color:#fca5a5;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;margin-right:8px;}
.pill{display:inline-block;background:#0f1f3a;color:#93c5fd;font-size:12px;font-family:monospace;padding:1px 7px;border-radius:4px;}
</style></head><body>
<div class="header"><div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
<span class="file-label">scroll_to_decrypt_123d86.js — initScrollToDecrypt()</span></div>
<div class="code-wrap"><table class="code-table"><tbody>
<tr class="dim"><td class="ln">12</td><td class="code">  <span class="kw">function</span> <span class="fn">initScrollToDecrypt</span><span class="punc">(</span>scrollmain<span class="punc">) {</span></td></tr>
<tr class="dim"><td class="ln">13</td><td class="code">    <span class="cmt">// ... setup wrapText, render, decryptOnScroll ...</span></td></tr>
<tr class="dim"><td class="ln">14</td><td class="code">    <span class="fn">render</span><span class="punc">();</span></td></tr>
<tr class="ok"><td class="ln">15</td><td class="code">    window<span class="punc">.</span><span class="fn">addEventListener</span><span class="punc">(</span><span class="str">"scroll"</span><span class="punc">,</span> decryptOnScroll<span class="punc">);</span>  <span class="cmt" style="color:#34d399;">/* ① First — correct */</span></td></tr>
<tr class="dim"><td class="ln">16</td><td class="code">    <span class="fn">decryptOnScroll</span><span class="punc">();</span></td></tr>
<tr class="dim"><td class="ln">17</td><td class="code">  <span class="punc">}</span></td></tr>
<tr class="dim"><td class="ln">18</td><td class="code"></td></tr>
<tr class="dim"><td class="ln">19</td><td class="code">  <span class="cmt">// end of init block...</span></td></tr>
<tr class="bad"><td class="ln">20</td><td class="code">  window<span class="punc">.</span><span class="fn">addEventListener</span><span class="punc">(</span><span class="str">"scroll"</span><span class="punc">,</span> decryptOnScroll<span class="punc">);</span>  <span class="cmt" style="color:#ef4444;">/* ② DUPLICATE — fires handler twice per scroll */</span></td></tr>
<tr class="dim"><td class="ln">21</td><td class="code"></td></tr>
</tbody></table></div>
<div class="callout">
  <span class="badge">P2 · Code Quality</span>
  <strong style="color:#f87171;">Scroll event listener registered twice — handler fires twice per scroll tick</strong><br><br>
  <span class="pill">window.addEventListener("scroll", decryptOnScroll)</span> appears at line 15 (inside init) and again at line 20 (outside init scope). Every scroll fires <span class="pill">decryptOnScroll()</span> twice — redundant DOM updates, unnecessary CPU cost, risk of animation jank on low-end devices.<br><br>
  <strong>Fix:</strong> Remove line 20. Keep only the single registration inside <span class="pill">initScrollToDecrypt()</span>.
</div>
</body></html>`
  },

  // ── 3. Text decrypts on page load ────────────────────────────────────────
  {
    slug: 'decrypt-on-load',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#0d1117; font-family:'Consolas','Monaco',monospace; padding:32px; width:860px; }
.header{background:#1f2937;border:1px solid #374151;border-radius:10px 10px 0 0;padding:12px 20px;display:flex;align-items:center;gap:12px;}
.dots{display:flex;gap:6px;} .dot{width:12px;height:12px;border-radius:50%;}
.dot.r{background:#ff5f57;} .dot.y{background:#ffbd2e;} .dot.g{background:#28c840;}
.file-label{color:#9ca3af;font-size:12px;}
.code-wrap{background:#161b22;border:1px solid #374151;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;}
.code-table{width:100%;border-collapse:collapse;}
.ln{width:44px;text-align:right;padding:0 12px 0 8px;color:#4b5563;font-size:13px;line-height:24px;background:#161b22;border-right:1px solid #21262d;}
.code{padding:0 16px;font-size:13.5px;line-height:24px;color:#c9d1d9;white-space:pre;}
tr td{background:#161b22;}
tr.bad td{background:#2d0a0a !important;} tr.bad .ln{color:#ef4444;background:#2d0a0a !important;border-right-color:#7f1d1d;}
tr.note td{background:#1a2035 !important;} tr.note .code{color:#93c5fd;} tr.note .ln{color:#60a5fa;background:#1a2035 !important;border-right-color:#1e3a5f;}
tr.dim td{background:#161b22;} tr.dim .code{color:#4b5563;}
.fn{color:#d2a8ff;} .kw{color:#ff7b72;} .prop{color:#7ee787;} .punc{color:#8b949e;} .cmt{color:#6e7681;font-style:italic;} .num{color:#a5d6ff;}
.callout{margin:20px 0 0;background:#1a0505;border:1px solid #7f1d1d;border-left:4px solid #ef4444;border-radius:6px;padding:14px 18px;color:#fca5a5;font-size:13px;font-family:-apple-system,sans-serif;line-height:1.7;}
.fix-callout{margin:10px 0 0;background:#0d1f2d;border:1px solid #1e3a5f;border-left:4px solid #3b82f6;border-radius:6px;padding:12px 16px;color:#bfdbfe;font-size:12.5px;font-family:monospace;}
.badge{display:inline-block;background:#7f1d1d;color:#fca5a5;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;margin-right:8px;}
.pill{display:inline-block;background:#0f1f3a;color:#93c5fd;font-size:12px;font-family:monospace;padding:1px 7px;border-radius:4px;}
</style></head><body>
<div class="header"><div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
<span class="file-label">scroll_to_decrypt_123d86.js — init call at bottom of IIFE</span></div>
<div class="code-wrap"><table class="code-table"><tbody>
<tr class="dim"><td class="ln">58</td><td class="code">  <span class="kw">function</span> <span class="fn">initScrollToDecrypt</span><span class="punc">(</span>scrollmain<span class="punc">) {</span></td></tr>
<tr class="dim"><td class="ln">59</td><td class="code">    <span class="cmt">// wrapText, render, decryptOnScroll setup...</span></td></tr>
<tr class="dim"><td class="ln">60</td><td class="code">    window<span class="punc">.</span><span class="fn">addEventListener</span><span class="punc">(</span><span class="str" style="color:#a5d6ff;">"scroll"</span><span class="punc">,</span> decryptOnScroll<span class="punc">);</span></td></tr>
<tr class="dim"><td class="ln">61</td><td class="code">    <span class="fn">render</span><span class="punc">();</span></td></tr>
<tr class="bad"><td class="ln">62</td><td class="code">    <span class="fn">decryptOnScroll</span><span class="punc">();</span>  <span class="cmt" style="color:#ef4444;">/* ← called immediately with NO viewport guard */</span></td></tr>
<tr class="dim"><td class="ln">63</td><td class="code">  <span class="punc">}</span></td></tr>
<tr class="dim"><td class="ln">64</td><td class="code"></td></tr>
<tr class="dim"><td class="ln">65</td><td class="code">  <span class="kw">function</span> <span class="fn">decryptOnScroll</span><span class="punc">() {</span></td></tr>
<tr class="dim"><td class="ln">66</td><td class="code">    <span class="kw">var</span> rect <span class="punc">=</span> scrollmain<span class="punc">.</span><span class="fn">getBoundingClientRect</span><span class="punc">();</span></td></tr>
<tr class="bad"><td class="ln">67</td><td class="code">    <span class="kw">var</span> progress <span class="punc">=</span> <span class="num">1</span> <span class="punc">-</span> <span class="punc">(</span>rect<span class="punc">.</span>top <span class="punc">/</span> window<span class="punc">.</span>innerHeight<span class="punc">);</span>  <span class="cmt" style="color:#ef4444;">/* if in viewport on load → progress = 1 */</span></td></tr>
<tr class="dim"><td class="ln">68</td><td class="code">    <span class="cmt">// all chars set to .is-decrypted when progress ≥ 1</span></td></tr>
<tr class="dim"><td class="ln">69</td><td class="code">  <span class="punc">}</span></td></tr>
<tr class="note"><td class="ln">—</td><td class="code">  <span class="cmt" style="color:#93c5fd;">// MISSING: if (rect.top &gt; window.innerHeight) return; // guard needed here</span></td></tr>
</tbody></table></div>
<div class="callout">
  <span class="badge">P2 · Logic</span>
  <strong style="color:#f87171;">No viewport guard — widget decrypts instantly when visible on page load</strong><br><br>
  When the widget is above the fold, <span class="pill">getBoundingClientRect().top</span> ≤ 0 on load, so <span class="pill">progress = 1</span>. All 25 characters immediately get <span class="pill">.is-decrypted</span> — the scroll animation never plays.
</div>
<div class="fix-callout"><span style="color:#34d399;">// Add this guard at the top of decryptOnScroll():</span><br><span style="color:#ff7b72;">if</span> (rect.top <span style="color:#f87171;">&gt;</span> window.innerHeight) <span style="color:#ff7b72;">return</span>;  <span style="color:#6e7681;">// widget not yet visible — skip</span></div>
</body></html>`
  },

  // ── 4. WCAG contrast fail ─────────────────────────────────────────────────
  {
    slug: 'wcag-contrast',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#0d1117; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; padding:32px; width:860px; }
.header-bar { background:#1f2937; border:1px solid #374151; border-radius:10px; padding:14px 20px; margin-bottom:20px; }
.header-bar h2 { color:#f9fafb; font-size:14px; font-weight:600; margin-bottom:4px; }
.header-bar p { color:#9ca3af; font-size:12px; }
.cards { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
.card { border-radius:8px; overflow:hidden; }
.card-header { padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.05em; }
.card-body { padding:20px; }
.fail .card-header { background:#7f1d1d; color:#fca5a5; }
.pass .card-header { background:#064e3b; color:#6ee7b7; }
.swatch { height:80px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-family:monospace; font-size:18px; font-weight:600; letter-spacing:0.02em; margin-bottom:12px; border:1px solid rgba(255,255,255,0.08); }
.ratio { font-size:28px; font-weight:700; margin-bottom:4px; }
.ratio-fail { color:#f87171; }
.ratio-pass { color:#34d399; }
.threshold { font-size:11px; color:#9ca3af; }
.verdict { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; margin-top:8px; }
.verdict-fail { background:#7f1d1d; color:#fca5a5; }
.verdict-pass { background:#064e3b; color:#6ee7b7; }
.color-row { display:flex; gap:8px; margin-top:10px; }
.chip { display:flex; align-items:center; gap:6px; background:#1f2937; border:1px solid #374151; border-radius:6px; padding:5px 10px; font-family:monospace; font-size:12px; color:#d1d5db; }
.dot-c { width:14px; height:14px; border-radius:3px; border:1px solid rgba(255,255,255,0.12); }
.callout{margin:0;background:#1a0505;border:1px solid #7f1d1d;border-left:4px solid #ef4444;border-radius:6px;padding:14px 18px;color:#fca5a5;font-size:13px;line-height:1.7;}
.badge{display:inline-block;background:#7f1d1d;color:#fca5a5;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;margin-right:8px;}
.pill{display:inline-block;background:#0f1f3a;color:#93c5fd;font-size:12px;font-family:monospace;padding:1px 7px;border-radius:4px;}
</style></head><body>
<div class="header-bar">
  <h2>WCAG 2.1 AA Contrast Check — Encrypted Text Color</h2>
  <p>Selector: <code>.wkit-encrypted span.is-encrypted</code> &nbsp;·&nbsp; Foreground: #777777 &nbsp;·&nbsp; Background: #111111</p>
</div>
<div class="cards">
  <div class="card fail">
    <div class="card-header">❌ CURRENT — FAILING</div>
    <div class="card-body" style="background:#1a0505;">
      <div class="swatch" style="background:#111111; color:#777777;">Scroll to decrypt me!</div>
      <div class="ratio ratio-fail">3.6 : 1</div>
      <div class="threshold">WCAG AA requires ≥ 4.5 : 1</div>
      <span class="verdict verdict-fail">FAIL — P1 · Accessibility</span>
      <div class="color-row">
        <div class="chip"><div class="dot-c" style="background:#777777;"></div>#777777</div>
        <div class="chip"><div class="dot-c" style="background:#111111;"></div>#111111</div>
      </div>
    </div>
  </div>
  <div class="card pass">
    <div class="card-header">✅ REQUIRED — PASSING</div>
    <div class="card-body" style="background:#0a1a12;">
      <div class="swatch" style="background:#111111; color:#999999;">Scroll to decrypt me!</div>
      <div class="ratio ratio-pass">4.5 : 1</div>
      <div class="threshold">WCAG AA minimum — just passes</div>
      <span class="verdict verdict-pass">PASS — use #999 or lighter</span>
      <div class="color-row">
        <div class="chip"><div class="dot-c" style="background:#999999;"></div>#999999</div>
        <div class="chip"><div class="dot-c" style="background:#111111;"></div>#111111</div>
      </div>
    </div>
  </div>
</div>
<div class="callout">
  <span class="badge">P1 · Accessibility</span>
  <strong style="color:#f87171;">Encrypted text colour #777 on #111 fails WCAG 2.1 AA (3.6:1, minimum 4.5:1)</strong><br><br>
  Users with low vision cannot distinguish encrypted scrambled characters from the dark background. Fix: change <span class="pill">color: #777</span> to <span class="pill">color: #999</span> (or lighter) in <span class="pill">.is-encrypted</span> CSS. Also expose via Encrypted Text Color style control so editors can maintain accessible contrast for their own backgrounds.
</div>
</body></html>`
  },

  // ── 5. No ARIA live region ────────────────────────────────────────────────
  {
    slug: 'no-aria',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#0d1117; font-family:'Consolas','Monaco',monospace; padding:32px; width:860px; }
.section-title{color:#9ca3af;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;font-family:-apple-system,sans-serif;}
.code-wrap{background:#161b22;border:1px solid #374151;border-radius:8px;overflow:hidden;margin-bottom:16px;}
.code-table{width:100%;border-collapse:collapse;}
.ln{width:44px;text-align:right;padding:0 12px 0 8px;color:#4b5563;font-size:13px;line-height:24px;background:#161b22;border-right:1px solid #21262d;}
.code{padding:0 16px;font-size:13px;line-height:24px;color:#c9d1d9;white-space:pre;}
tr td{background:#161b22;}
tr.bad td{background:#2d0a0a !important;} tr.bad .ln{color:#ef4444;background:#2d0a0a !important;border-right-color:#7f1d1d;}
tr.good td{background:#0d2a1a !important;} tr.good .ln{color:#34d399;background:#0d2a1a !important;border-right-color:#064e3b;}
.tag{color:#7ee787;} .attr{color:#79c0ff;} .val{color:#a5d6ff;} .punc{color:#8b949e;} .cmt{color:#6e7681;font-style:italic;}
.label-bad{display:inline-block;background:#7f1d1d;color:#fca5a5;font-size:10px;font-weight:700;padding:1px 7px;border-radius:4px;margin-left:8px;font-family:-apple-system,sans-serif;}
.label-good{display:inline-block;background:#064e3b;color:#6ee7b7;font-size:10px;font-weight:700;padding:1px 7px;border-radius:4px;margin-left:8px;font-family:-apple-system,sans-serif;}
.callout{margin:0;background:#1a0505;border:1px solid #7f1d1d;border-left:4px solid #ef4444;border-radius:6px;padding:14px 18px;color:#fca5a5;font-size:13px;font-family:-apple-system,sans-serif;line-height:1.7;}
.badge{display:inline-block;background:#7f1d1d;color:#fca5a5;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;margin-right:8px;}
.pill{display:inline-block;background:#0f1f3a;color:#93c5fd;font-size:12px;font-family:monospace;padding:1px 7px;border-radius:4px;}
</style></head><body>
<div class="section-title">❌ Current HTML output — missing ARIA attributes</div>
<div class="code-wrap"><table class="code-table"><tbody>
<tr class="bad"><td class="ln">1</td><td class="code"><span class="punc">&lt;</span><span class="tag">div</span> <span class="attr">class</span><span class="punc">=</span><span class="val">"wkit-encrypted"</span><span class="punc">&gt;</span>  <span class="cmt" style="color:#ef4444;">← no aria-live, no aria-label, no role</span></td></tr>
<tr><td class="ln">2</td><td class="code">  <span class="punc">&lt;</span><span class="tag">span</span> <span class="attr">class</span><span class="punc">=</span><span class="val">"is-encrypted"</span><span class="punc">&gt;</span>S<span class="punc">&lt;/</span><span class="tag">span</span><span class="punc">&gt;</span></td></tr>
<tr><td class="ln">3</td><td class="code">  <span class="punc">&lt;</span><span class="tag">span</span> <span class="attr">class</span><span class="punc">=</span><span class="val">"is-encrypted"</span><span class="punc">&gt;</span>c<span class="punc">&lt;/</span><span class="tag">span</span><span class="punc">&gt;</span></td></tr>
<tr><td class="ln">4</td><td class="code">  <span class="cmt">... 23 more spans ...</span></td></tr>
<tr class="bad"><td class="ln">5</td><td class="code"><span class="punc">&lt;/</span><span class="tag">div</span><span class="punc">&gt;</span>  <span class="cmt" style="color:#ef4444;">← screen reader never notified when text reveals</span></td></tr>
</tbody></table></div>

<div class="section-title">✅ Required HTML output — with ARIA attributes</div>
<div class="code-wrap"><table class="code-table"><tbody>
<tr class="good"><td class="ln">1</td><td class="code"><span class="punc">&lt;</span><span class="tag">div</span> <span class="attr">class</span><span class="punc">=</span><span class="val">"wkit-encrypted"</span></td></tr>
<tr class="good"><td class="ln">2</td><td class="code">     <span class="attr">aria-live</span><span class="punc">=</span><span class="val">"polite"</span>  <span class="cmt" style="color:#34d399;">← announces when text changes</span></td></tr>
<tr class="good"><td class="ln">3</td><td class="code">     <span class="attr">aria-label</span><span class="punc">=</span><span class="val">"Encrypted message"</span><span class="punc">&gt;</span>  <span class="cmt" style="color:#34d399;">← updated to final text after decrypt</span></td></tr>
<tr><td class="ln">4</td><td class="code">  <span class="cmt">... spans ...</span></td></tr>
<tr><td class="ln">5</td><td class="code"><span class="punc">&lt;/</span><span class="tag">div</span><span class="punc">&gt;</span></td></tr>
</tbody></table></div>

<div class="callout">
  <span class="badge">P2 · Accessibility</span>
  <strong style="color:#f87171;">No ARIA live region — screen readers receive zero notification when text reveals</strong><br><br>
  The <span class="pill">.wkit-encrypted</span> container animates character-by-character but has no <span class="pill">aria-live</span> or <span class="pill">aria-label</span>. Users relying on VoiceOver / NVDA cannot perceive the content change at all.<br><br>
  <strong>Fix:</strong> Add <span class="pill">aria-live="polite"</span> and <span class="pill">aria-label="Encrypted message"</span> in PHP render(). After full decryption, update label to the actual decrypted text via JS.
</div>
</body></html>`
  },

  // ── 6. Redundant inline style block ──────────────────────────────────────
  {
    slug: 'inline-style-block',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#0d1117; font-family:'Consolas','Monaco',monospace; padding:32px; width:860px; }
.header{background:#1f2937;border:1px solid #374151;border-radius:10px 10px 0 0;padding:12px 20px;display:flex;align-items:center;gap:12px;}
.dots{display:flex;gap:6px;} .dot{width:12px;height:12px;border-radius:50%;}
.dot.r{background:#ff5f57;} .dot.y{background:#ffbd2e;} .dot.g{background:#28c840;}
.file-label{color:#9ca3af;font-size:12px;}
.code-wrap{background:#161b22;border:1px solid #374151;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;}
.code-table{width:100%;border-collapse:collapse;}
.ln{width:44px;text-align:right;padding:0 12px 0 8px;color:#4b5563;font-size:13px;line-height:24px;background:#161b22;border-right:1px solid #21262d;}
.code{padding:0 16px;font-size:13px;line-height:24px;color:#c9d1d9;white-space:pre;}
tr td{background:#161b22;}
tr.bad td{background:#2d0a0a !important;} tr.bad .ln{color:#ef4444;background:#2d0a0a !important;border-right-color:#7f1d1d;}
tr.good td{background:#0d2a1a !important;} tr.good .ln{color:#34d399;background:#0d2a1a !important;border-right-color:#064e3b;}
tr.dim .code{color:#4b5563;}
.kw{color:#ff7b72;} .fn{color:#d2a8ff;} .str{color:#a5d6ff;} .punc{color:#8b949e;} .cmt{color:#6e7681;font-style:italic;} .tag{color:#7ee787;}
.callout{margin:20px 0 0;background:#1a0505;border:1px solid #7f1d1d;border-left:4px solid #ef4444;border-radius:6px;padding:14px 18px;color:#fca5a5;font-size:13px;font-family:-apple-system,sans-serif;line-height:1.7;}
.badge{display:inline-block;background:#7f1d1d;color:#fca5a5;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;margin-right:8px;}
.pill{display:inline-block;background:#0f1f3a;color:#93c5fd;font-size:12px;font-family:monospace;padding:1px 7px;border-radius:4px;}
.arrow-row{display:flex;align-items:center;gap:16px;margin:16px 0 0;padding:12px 16px;background:#111827;border:1px solid #374151;border-radius:6px;font-family:-apple-system,sans-serif;font-size:12.5px;color:#9ca3af;}
.arrow-row strong{color:#f9fafb;} .arr{color:#6b7280;font-size:18px;}
</style></head><body>
<div class="header"><div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
<span class="file-label">scroll_to_decrypt_123d86.php — render() method</span></div>
<div class="code-wrap"><table class="code-table"><tbody>
<tr class="dim"><td class="ln">80</td><td class="code">  <span class="kw">public function</span> <span class="fn">render</span><span class="punc">() {</span></td></tr>
<tr class="dim"><td class="ln">81</td><td class="code">    <span class="cmt">// ... get settings ...</span></td></tr>
<tr class="bad"><td class="ln">82</td><td class="code">    <span class="kw">echo</span> <span class="str">'&lt;style&gt;'</span><span class="punc">;</span>  <span class="cmt" style="color:#ef4444;">/* ← raw &lt;style&gt; injected per widget instance */</span></td></tr>
<tr class="bad"><td class="ln">83</td><td class="code">    <span class="kw">echo</span> <span class="str">'.wkit-scroll-to-decrpt-main { width:100%; background:#111; ... }'</span><span class="punc">;</span></td></tr>
<tr class="bad"><td class="ln">84</td><td class="code">    <span class="kw">echo</span> <span class="str">'&lt;/style&gt;'</span><span class="punc">;</span>  <span class="cmt" style="color:#ef4444;">/* uncacheable, duplicated on multi-instance pages */</span></td></tr>
<tr class="dim"><td class="ln">85</td><td class="code">    <span class="kw">echo</span> <span class="str">'&lt;div class="wkit-scroll-to-decrpt-main"&gt;...'</span><span class="punc">;</span></td></tr>
<tr class="dim"><td class="ln">86</td><td class="code">  <span class="punc">}</span></td></tr>
<tr><td class="ln"></td><td class="code"></td></tr>
<tr class="good"><td class="ln">+</td><td class="code">  <span class="kw">public function</span> <span class="fn">enqueue_scripts</span><span class="punc">() {</span>  <span class="cmt" style="color:#34d399;">← CSS should be enqueued here instead</span></td></tr>
<tr class="good"><td class="ln">+</td><td class="code">    <span class="fn">wp_enqueue_style</span><span class="punc">(</span><span class="str">'wkit_scroll_decrypt'</span><span class="punc">,</span> <span class="str">$baseurl . '/scroll_to_decrypt_123d86.css'</span><span class="punc">,</span> <span class="punc">[], </span><span class="str">'2.3.3'</span><span class="punc">);</span></td></tr>
<tr class="good"><td class="ln">+</td><td class="code">  <span class="punc">}</span>  <span class="cmt" style="color:#34d399;">← loads once, browser-cacheable, no DOM bloat</span></td></tr>
</tbody></table></div>
<div class="arrow-row">
  <strong>❌ Current:</strong> <span>&lt;style&gt; block in render() — injected into DOM per instance, uncacheable</span>
  <span class="arr">→</span>
  <strong>✅ Fix:</strong> <span>Move CSS to .css file, enqueue via wp_enqueue_style() in enqueue_scripts()</span>
</div>
<div class="callout" style="margin-top:12px;">
  <span class="badge">P3 · Code Quality</span>
  <strong style="color:#f87171;">Inline &lt;style&gt; block in render() — should be a separate enqueued CSS file</strong><br><br>
  Every widget instance injects a raw <span class="pill">&lt;style&gt;</span> tag. On pages with 3 widgets = 3 identical style blocks. Browsers cannot cache inline styles. WordPress best practice requires CSS via <span class="pill">wp_enqueue_style()</span> in <span class="pill">enqueue_scripts()</span>.
</div>
</body></html>`
  },
];

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  for (const bug of BUGS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 860, height: 800 });
    await page.setContent(bug.html, { waitUntil: 'domcontentloaded' });
    const h = await page.evaluate(() => document.body.scrollHeight + 64);
    await page.setViewportSize({ width: 860, height: h });
    const outPath = `/tmp/bug-${bug.slug}.png`;
    await page.screenshot({ path: outPath, fullPage: true });
    await page.close();
    console.log(`SAVED: ${outPath}`);
  }

  await browser.close();
  console.log('ALL_DONE');
})().catch(e => { console.error(e); process.exit(1); });
