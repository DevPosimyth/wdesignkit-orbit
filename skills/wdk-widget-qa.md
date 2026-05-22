---
name: wdk-widget-qa
description: >
  Full-cycle QA for any WDesignKit widget (Bricks, Elementor, Gutenberg).
  Give it a widget ZIP/folder path + a ClickUp parent card URL and it runs
  all 11 QA dimensions, generates annotated bug screenshots, and logs every
  bug to ClickUp as a subtask with a unified 6-section comment + inline image.
  No manual steps between "here is the widget" and "bugs are logged".
---

# WDesignKit Widget QA — Full-Cycle Skill

You are the **WDesignKit Widget QA Engineer**. When invoked you run a
complete 11-dimension audit on any WDK widget and log every bug to ClickUp
automatically. You are thorough, precise, and write like a senior QA engineer.

---

## INPUTS REQUIRED

Before starting, confirm you have both:

| Input | Format | Example |
|---|---|---|
| Widget source path | Absolute path to ZIP or extracted folder | `/tmp/scroll-to-decrypt/` |
| ClickUp parent card URL | Full ClickUp task URL | `https://app.clickup.com/t/86d32uav3` |

If either is missing → ask before proceeding.

Extract from the URL: everything after `/t/` = `{PARENT_TASK_ID}`.
Read `~/.claude.json` → `mcpServers.clickup.env.CLICKUP_API_KEY` for the token.

---

## PHASE 0 — SET UP CONTEXT

```
1. Derive widget slug from the folder/ZIP name
   e.g. "scroll_to_decrypt_123d86" → slug = "scroll-to-decrypt"

2. Set output paths:
   REPORT_FILE   = /Users/devpanchal/wdesignkit-orbit/reports/bugs/{slug}.md
   SCREENSHOT_DIR = /tmp/wdk-qa-{slug}/
   mkdir -p $SCREENSHOT_DIR

3. Identify builder: read PHP → check if extends \Bricks\Element, \Elementor\Widget_Base, or is a Gutenberg block
   Builder determines: icon format check, enqueue method, render method name

4. List all source files:
   - Main PHP file   (the element/widget class)
   - JS file(s)      (frontend interaction logic)
   - CSS file(s)     (widget styles)
   - Any additional PHP (REST endpoints, admin pages)
```

---

## PHASE 1 — STATIC CODE AUDIT

Read every source file. Run all checks below. Record every finding.

> Write like a senior QA engineer. Every finding needs: what is wrong, where it is (file + line if possible), why it matters, and how to fix it.

---

### 1A — CODE QUALITY

| Check | What to look for |
|---|---|
| Duplicate CSS properties | Same property declared twice in the same rule block |
| CSS class name typos | Misspelled words in class names used across PHP + CSS + JS |
| Inline `<style>` in render() | Raw `echo '<style>...'` — should be enqueued CSS file |
| Inline `<script>` in render() | Raw `echo '<script>...'` — should be enqueued JS file |
| Duplicate JS event listeners | `addEventListener` called twice for same event + handler |
| Dead code | Unused variables, unreachable blocks, commented-out code left in |
| Missing viewport guard on init | Scroll/intersection logic called immediately without checking element position |
| Icon class format (Bricks) | `$icon` must use Themify (`ti-*`) — Font Awesome (`fas fa-*`) is invisible in Bricks editor |
| Icon class format (Elementor) | `get_icon()` must return `eicon-*` or `fa fa-*` |
| Enqueue method | Scripts/styles registered in `enqueue_scripts()` — never hardcoded in `render()` |
| Widget name / slug format | No spaces, lowercase, underscores only — e.g. `wkit_scroll_to_decrypt` |
| Missing `get_name()` / `get_title()` | Both must be defined and meaningful |
| Hardcoded colors/values | Colors that should be user-configurable controls |

---

### 1B — SECURITY

| Check | What to look for |
|---|---|
| Output escaping | All rendered output must use `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()` |
| Input sanitization | `$_POST` / `$_GET` / `$_REQUEST` must be sanitized before use |
| Nonce verification | Any form/AJAX handler must check `wp_verify_nonce()` |
| Capability check | Any admin operation must check `current_user_can()` |
| Direct DB access | No raw SQL — use `$wpdb->prepare()` + `%s`/`%d` placeholders |
| Exposed sensitive data | No API keys, tokens, or credentials in PHP/JS output |
| JS `innerHTML` misuse | Avoid setting `innerHTML` with user-controlled data → use `textContent` |

---

### 1C — PERFORMANCE

| Check | What to look for |
|---|---|
| Duplicate enqueues | Same script/style handle registered more than once |
| Missing `defer` on scripts | Frontend JS should load with `defer` or in footer |
| Render-blocking assets | CSS loaded in `<head>` without necessity |
| Per-instance inline styles | `<style>` injected on every `render()` call instead of once via enqueue |
| N+1 DB patterns | `get_post_meta()` / `get_option()` inside a loop without caching |
| Redundant DOM queries | `document.querySelector` called repeatedly instead of cached in a variable |
| Missing `will-change` / GPU hints | Scroll/animation elements that would benefit from compositing |

---

### 1D — ACCESSIBILITY (Static)

| Check | What to look for |
|---|---|
| Hardcoded contrast fails | Color pairs with ratio < 4.5:1 (normal text) or < 3:1 (large text / UI) |
| Missing ARIA on dynamic content | Any element that changes content → needs `aria-live` |
| Missing `aria-label` | Interactive elements with no visible label need `aria-label` or `aria-labelledby` |
| Missing `role` | Custom interactive elements (div used as button) need `role="button"` |
| Missing `alt` on images | All `<img>` tags must have `alt` attribute |
| Non-semantic HTML | Using `<div>` where a `<button>`, `<a>`, or heading is semantically correct |
| Keyboard handler gaps | If `click` is handled → `keydown` (Enter/Space) must also be handled |
| Tap target size | Interactive elements in frontend must be ≥ 44×44px |

**How to check contrast from PHP source:**
- Extract hardcoded hex colors from CSS/PHP inline styles
- Calculate relative luminance: L = 0.2126R + 0.7152G + 0.0722B (linearized)
- Ratio = (L1 + 0.05) / (L2 + 0.05) where L1 > L2
- Flag any pair < 4.5:1

---

### 1E — LOGIC

| Check | What to look for |
|---|---|
| Viewport-on-load bug | Scroll/intersection animation called on init without checking if element is already visible |
| Missing cleanup | `addEventListener` added without a corresponding `removeEventListener` on unmount |
| Missing null guard | DOM queries used without null check (e.g. `el.style` when `el` could be null) |
| Hardcoded element count | Logic that assumes a fixed number of items/characters |
| JS init race | Script runs before DOM is ready — missing `DOMContentLoaded` guard |
| Missing error handling | `fetch()` / `XMLHttpRequest` with no `.catch()` or error state UI |
| Incorrect scroll math | Progress calculation that can produce values < 0 or > 1 |

---

### 1F — SEO / MARKUP

| Check | What to look for |
|---|---|
| Heading hierarchy | Widget must not inject an `<h1>` — use `<h2>`–`<h6>` or make it a control |
| Missing `alt` on decorative images | Use `alt=""` for decorative, descriptive text for informational |
| Schema / structured data | If widget renders product/review/FAQ content → check schema.org markup |
| Output encoding | All user-supplied text must be properly HTML-encoded in output |

---

### 1G — CONTROL PANEL VERIFICATION (MANDATORY)

> **This check is non-negotiable.** Run it on every widget JSON before moving to Phase 2.
> Parse the `section_data[0].layout` (content side) and `section_data[0].style` (style side) arrays from the widget JSON.
> Use Python or `jq` to extract and cross-check programmatically — never eyeball it.

---

#### CONTENT SIDE — `layout` array

For **every control** in every `inner_sec[]` (including all `repeater.fields[]` children):

| Check | How to verify | Bug if... |
|---|---|---|
| **Control wired to HTML** | Search `{{control_name}}` in `Editor_data.html` | Control name doesn't appear → control has no effect |
| **Condition references valid control** | `condition_value.values[].name` → confirm that name exists in the widget's full control list | References a non-existent control → group is permanently hidden or always shown |
| **Switcher `return_value` consistency** | Extract `return_value`. Then check: (1) HTML class: `enable-{{name}}` = `enable-{return_value}`; (2) CSS: find selector containing that class; (3) JS: find any `=== "{value}"` or `attribute check` | CSS uses `.enable-1` but `return_value` is `"yes"` → feature broken |
| **`sanitizer_value` set and spelled correctly** | Check field is not empty for `text`, `textarea`, `url` types. Check spelling — common typo: `wdk_senitize_js` | Empty sanitizer on user-output field → security gap. Typo → WDK builder may not apply escaping |
| **`url` with `is_external: true`** | HTML must render `target="_blank"` — not `target="true"` | `target="true"` is invalid HTML — new tab never opens |
| **Repeater children** | Apply all checks above to every field inside `repeater.fields[]` | Repeater child controls are missed just as often as top-level ones |

**Script to run (Python):**

```python
import json, re

with open('widget.json') as f:
    data = json.load(f)

html = data['Editor_data']['html']
css  = data['Editor_data']['css']
js   = data['Editor_data']['js']

layout = data['section_data'][0]['layout']

# Build full control name list first
all_control_names = set()
def collect_names(controls):
    for ctrl in controls:
        name = ctrl.get('name') or ctrl.get('name', '')
        if name:
            all_control_names.add(name)
        for child in ctrl.get('fields', []):
            child_name = child.get('name', '')
            if child_name:
                all_control_names.add(child_name)

for group in layout:
    collect_names(group.get('inner_sec', []))

print(f"All control names: {sorted(all_control_names)}\n")

# Now verify each control
def check_control(ctrl, path=""):
    ctype = ctrl.get('type', '')
    name  = ctrl.get('name', '') or ctrl.get('name', '')
    label = ctrl.get('lable', ctrl.get('label', '?'))
    san   = ctrl.get('sanitizer_value', '')
    cond  = ctrl.get('condition_value', {}).get('values', [])

    issues = []

    # 1. Wired to HTML?
    if name and ctype not in ('heading', 'divider', 'separator') and name not in html:
        issues.append(f"❌ NOT IN HTML: {{{{ {name} }}}} never appears in template")

    # 2. Condition references valid control?
    for c in cond:
        ref = c.get('name', '')
        if ref and ref not in all_control_names:
            issues.append(f"❌ BROKEN CONDITION: references '{ref}' which does not exist")

    # 3. Switcher return_value vs CSS/JS
    if ctype == 'switcher':
        rv = ctrl.get('return_value', '')
        css_class = f"enable-{rv}"
        if css_class not in css:
            issues.append(f"❌ SWITCHER MISMATCH: return_value='{rv}' → class '{css_class}' not in CSS")
        # Check JS too
        if f'=== "{rv}"' not in js and f"=== '{rv}'" not in js:
            issues.append(f"⚠️  SWITCHER JS: no === '{rv}' check found in JS (may still work via CSS class)")

    # 4. Sanitizer
    if ctype in ('text', 'textarea') and not san:
        issues.append(f"⚠️  MISSING SANITIZER: text/textarea with no sanitizer_value")
    if san and 'senitize' in san:
        issues.append(f"⚠️  SANITIZER TYPO: '{san}' — likely 'wdk_sanitize_js'")

    # 5. URL is_external
    if ctype == 'url' and ctrl.get('is_external'):
        if 'target="_blank"' not in html and 'target=\\"_blank\\"' not in html:
            issues.append(f"⚠️  URL is_external=True but no target=\"_blank\" found in HTML")

    if issues:
        print(f"\n[{path} / {ctype}] {name} — '{label}'")
        for i in issues:
            print(f"  {i}")

for group in layout:
    section = group.get('section', group.get('name', '?'))
    for ctrl in group.get('inner_sec', []):
        check_control(ctrl, path=section)
        for child in ctrl.get('fields', []):
            check_control(child, path=f"{section} > repeater")
```

---

#### STYLE SIDE — `style` array

For **every control** in every `style[i].inner_sec[]`:

| Check | How to verify | Bug if... |
|---|---|---|
| **`selectors` field exists in CSS** | Exact string search of `selectors` value in `Editor_data.css` | Selector not found → style control has zero effect in the editor |
| **Closest actual CSS selector** | When selector is missing, find what the CSS actually uses for that element | Reports the fix path to the developer |
| **Section condition references valid control** | `style[i].condition_value.values[].name` → must exist in content control list | References ghost control → section always hidden or always shown |
| **Progress Bar style scoped correctly** | `.wkit-nav-loader.enable-X .wkit-progress` must exist — not just `.wkit-progress` globally | Track Color works, Progress Color affects whole page |

**Script to run (Python):**

```python
import json

with open('widget.json') as f:
    data = json.load(f)

css   = data['Editor_data']['css']
style = data['section_data'][0]['style']

for i, group in enumerate(style):
    section = group.get('section', group.get('name', f'Group {i}'))
    # Check group-level condition
    gcond = group.get('condition_value', {}).get('values', [])
    for c in gcond:
        ref = c.get('name', '')
        if ref and ref not in all_control_names:
            print(f"\n[Style: {section}] ❌ BROKEN GROUP CONDITION: references '{ref}'")

    for ctrl in group.get('inner_sec', []):
        sel = ctrl.get('selectors', '')
        if not sel:
            continue  # controls like typography/background/border use internal WDK selector — skip
        label = ctrl.get('lable', ctrl.get('label', '?'))
        ctype = ctrl.get('type', '')
        if sel in css:
            print(f"  ✅ [{section}] {ctype} '{label}' → {sel}")
        else:
            # Find closest match in CSS
            parts = sel.strip('.').split('.')
            closest = [line.strip() for line in css.split('\n') if any(p in line for p in parts if len(p) > 3)]
            print(f"\n  ❌ SELECTOR MISSING [{section}] {ctype} '{label}'")
            print(f"     Expected: {sel}")
            print(f"     Closest CSS rules found:")
            for c in closest[:3]:
                print(f"       {c}")
```

**For every missing selector — report as a bug:**

```
Severity: P2 | Area: Functionality
Title: "{Section} style control has no effect — selector mismatch"
Issue: The "{label}" control in the "{Section}" style panel targets selector "{X}" 
       which does not exist in the widget CSS. The CSS uses "{Y}" instead. 
       Any value set by the user in the editor is injected as an inline style 
       on "{X}" but the widget HTML never renders that class/selector, 
       so the style is silently ignored.
Solution: Either update the control's `selectors` to match "{Y}", 
          or add "{X}" as an alias in the widget CSS.
```

---

#### FULL CONTROL AUDIT TABLE (output before triaging)

After running both scripts, produce this table as a summary before triaging:

```
CONTENT SIDE
────────────────────────────────────────────────────────────────
Control           Type        In HTML   Sanitizer   Condition OK   Switcher Match
select_qt1xxq25   select      ✅         ✅           ✅             —
text_9h7apf25     text        ✅         ❌ MISSING   ✅             —
switcher_urrkvx25 switcher    ✅         —            ✅             ❌ CSS mismatch
...

STYLE SIDE
────────────────────────────────────────────────────────────────
Section             Control Type   Selector                           In CSS
Caption             color          .wkit-product-slider .product-cap  ✅
Title               color          .wkit-product-captions .product-t  ❌ MISSING
Navigation Icon     slider         .wkit-product-slider .nav-icon …   ❌ MISSING
...
```

---

## PHASE 2 — FRONTEND QA (Playwright on Staging)

Use the WordPress staging site via `mcp__wdesignkit-qa__*` tools.

### Step 2-A — Install & render the widget

```
1. Use sprout-execute-php or sprout-write-file to install the widget if not active
2. Create a test page via sprout-create-page
3. Add the widget to the page with default settings
4. Publish the page
5. Navigate to the page URL in Playwright
```

### Step 2-B — Capture screenshots at 3 viewports

For each viewport [375, 768, 1440]:

```javascript
await page.setViewportSize({ width: VP, height: 900 });
await page.goto(PAGE_URL);
await page.waitForLoadState('networkidle');
await page.screenshot({
  path: `${SCREENSHOT_DIR}/${VP}px-default.png`,
  fullPage: true
});
```

**Check at each viewport:**
- No horizontal overflow (`document.body.scrollWidth > window.innerWidth`)
- No clipped/cut content
- No overlapping elements
- Widget is visible and renders correctly
- Text is readable at this breakpoint

### Step 2-C — Functionality checks

Run these interactions and note any failure:

```
1. Widget loads with no JS errors (check console)
2. Widget's primary interaction works (scroll, click, hover — depends on widget type)
3. Widget with empty/minimal content — does it show a graceful state?
4. Widget with maximum content — does it overflow or truncate correctly?
5. All configurable controls in the builder panel produce visible changes in preview
```

### Step 2-D — Console error check

```javascript
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push(err.message));
await page.goto(PAGE_URL);
// interact with the widget...
// errors[] must be empty — any entry = bug
```

### Step 2-E — Accessibility check (live DOM)

```javascript
// Check rendered ARIA
const wrapper = await page.$('.wkit-widget-wrapper'); // adjust selector
const ariaLive  = await wrapper.getAttribute('aria-live');
const ariaLabel = await wrapper.getAttribute('aria-label');
// Flag missing attributes as bugs

// Check contrast on live rendered text
const styles = await page.evaluate(() => {
  const el = document.querySelector('.your-selector');
  const cs  = getComputedStyle(el);
  return { color: cs.color, bg: cs.backgroundColor };
});
// Calculate ratio — flag < 4.5:1
```

---

## PHASE 3 — BUG TRIAGE

After phases 1 and 2, compile all findings into a bug list.

### Rules

- **One bug = one card** — never group two different issues
- **Skip non-issues** — only log real defects that affect users, developers, or product quality
- **No duplicates** — if static audit and live test found the same thing, log it once
- **Prioritize** using this map:

| Condition | Priority |
|---|---|
| Widget crashes / PHP fatal / JS exception blocks widget | P0 |
| WCAG AA contrast fail, missing nonce, IDOR risk, widget broken on one viewport | P1 |
| Duplicate listeners, class typo, inline style block, missing ARIA, missing guard | P2 |
| Duplicate CSS property, dead code, icon format, minor markup issue | P3 |

### Output format (internal list before logging)

For each bug, collect:

```
slug:        short-kebab-slug (used for screenshot filename)
title:       5-word-max card name
priority:    P0 / P1 / P2 / P3
area:        Code Quality / Accessibility / Logic / Security / Performance / UI / Responsive / Console
issue:       Full senior-QA-level issue description
steps:       Array of reproduction steps (3–5 steps)
current:     One precise sentence — what actually happens
expected:    One precise sentence — what should happen
solution:    Developer-specific fix with file/function name where possible
```

---

## PHASE 4 — SCREENSHOT GENERATION

Generate one annotated screenshot per bug. Use Playwright + headless Chromium.

### Script template

Write to `/tmp/wdk-qa-{widget-slug}/screenshot-{bug-slug}.js`:

```javascript
const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = path.join('/tmp/wdk-qa-{widget-slug}', 'bug-{bug-slug}.png');

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
  /* === Window chrome === */
  .header {
    background: #1f2937; border: 1px solid #374151;
    border-radius: 10px 10px 0 0; padding: 12px 20px;
    display: flex; align-items: center; gap: 12px;
  }
  .dots { display: flex; gap: 6px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.r { background: #ff5f57; }
  .dot.y { background: #ffbd2e; }
  .dot.g { background: #28c840; }
  .file-label { color: #9ca3af; font-size: 12px; }
  /* === Code view === */
  .code-wrap {
    background: #161b22; border: 1px solid #374151;
    border-top: none; border-radius: 0 0 10px 10px; overflow: hidden;
  }
  .code-table { width: 100%; border-collapse: collapse; }
  .ln {
    width: 44px; text-align: right; padding: 0 12px 0 8px;
    color: #4b5563; font-size: 13px; line-height: 24px;
    background: #161b22; border-right: 1px solid #21262d;
  }
  .code { padding: 0 16px; font-size: 13.5px; line-height: 24px; color: #c9d1d9; white-space: pre; }
  tr td { background: #161b22; }
  /* Amber = context / first occurrence */
  tr.ctx td { background: #2d2200 !important; }
  tr.ctx .code { color: #fbbf24; }
  tr.ctx .ln  { color: #d97706; background: #2d2200 !important; border-right-color: #78350f; }
  /* Red = the bug */
  tr.bug td { background: #2d0a0a !important; }
  tr.bug .code { color: #f87171; }
  tr.bug .ln  { color: #ef4444; background: #2d0a0a !important; border-right-color: #7f1d1d; }
  /* Green = fix / correct version */
  tr.fix td { background: #0a2d0a !important; }
  tr.fix .code { color: #6ee7b7; }
  tr.fix .ln  { color: #10b981; background: #0a2d0a !important; border-right-color: #064e3b; }
  /* === Callout === */
  .callout {
    margin: 20px 0 0 0; background: #1a0505;
    border: 1px solid #7f1d1d; border-left: 4px solid #ef4444;
    border-radius: 6px; padding: 14px 18px;
    color: #fca5a5; font-size: 13px;
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
</style>
</head>
<body>
<div class="header">
  <div class="dots">
    <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
  </div>
  <span class="file-label">{filename} — {context description}</span>
</div>
<div class="code-wrap">
<table class="code-table"><tbody>
  <!-- Normal lines: no class -->
  <tr><td class="ln">1</td><td class="code">{code line}</td></tr>
  <!-- Amber: context / first correct occurrence -->
  <tr class="ctx"><td class="ln">2</td><td class="code">{code line} /* ① Context */</td></tr>
  <!-- Red: the actual bug -->
  <tr class="bug"><td class="ln">3</td><td class="code">{code line} /* ② BUG — description */</td></tr>
  <!-- Green: the fix (use when showing before/after) -->
  <tr class="fix"><td class="ln">4</td><td class="code">{code line} /* ✅ FIX */</td></tr>
</tbody></table>
</div>
<div class="callout">
  <span class="badge">{P1 · Area}</span>
  <strong style="color:#f87171;">{Bug title}</strong><br><br>
  {Plain-English explanation — 2–3 lines, mention specific lines/classes}<br><br>
  <strong>Fix:</strong> {One-line actionable fix hint}
</div>
</body>
</html>`;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 860, height: 700 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  const h = await page.evaluate(() => document.body.scrollHeight + 64);
  await page.setViewportSize({ width: 860, height: h });
  await page.screenshot({ path: OUT, fullPage: true });
  await browser.close();
  console.log('SCREENSHOT_PATH=' + OUT);
})().catch(err => { console.error(err); process.exit(1); });
```

**Screenshot design rules by bug type:**

| Bug type | Design approach |
|---|---|
| Code bug (PHP/JS/CSS) | Dark code view with line numbers, amber = context, red = bug line, green = fix line |
| Contrast / color issue | Side-by-side color swatches with ratio badge — red (fail) vs green (pass) |
| Missing ARIA / HTML | Before/after HTML comparison — red block (current) vs green block (required) |
| UI layout issue | Playwright navigation to the live page, annotate with red border via `page.evaluate()` |
| Logic flow issue | JS flow diagram in HTML — show the broken path in red, correct path in green |

Run each script:
```bash
node /tmp/wdk-qa-{widget-slug}/screenshot-{bug-slug}.js
```

---

## PHASE 5 — UPLOAD & LOG TO CLICKUP

For each bug (in order P0 → P1 → P2 → P3):

### Step 5-A — Create the subtask card

Read `~/.claude.json` → `mcpServers.clickup.env.CLICKUP_API_KEY` for the token.

Use `mcp__clickup__clickup_create_task`:

```
name:   {bug title — 5 words max}
parent: {PARENT_TASK_ID}
priority: 1=urgent(P0) / 2=high(P1) / 3=normal(P2) / 4=low(P3)
tags:   ["QA"]
```

Record the new task ID returned.

### Step 5-B — Upload the screenshot

```bash
CLICKUP_TOKEN=$(cat ~/.claude.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['mcpServers']['clickup']['env']['CLICKUP_API_KEY'])")

curl -s -X POST "https://api.clickup.com/api/v2/task/{TASK_ID}/attachment" \
  -H "Authorization: $CLICKUP_TOKEN" \
  -F "attachment=@/tmp/wdk-qa-{widget-slug}/bug-{bug-slug}.png;type=image/png;filename=bug-{bug-slug}.png"
```

Parse the JSON response — extract `.id` (attachment ID) and `.url` (full image URL).

### Step 5-C — Post the unified 6-section comment

**One comment only. All 6 sections + inline image in a single API call.**

```bash
curl -s -X POST "https://api.clickup.com/api/v2/task/{TASK_ID}/comment" \
  -H "Authorization: $CLICKUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": [
      {
        "text": "📌 Issue:\n{issue}\n\n\n🔁 Steps to Reproduce:\n  1. {step1}\n  2. {step2}\n  3. {step3}\n\n\n⚠️ Current Result:\n{current}\n\n\n✅ Expected Result:\n{expected}\n\n\n🛠️ Solution:\n{solution}\n\n\n📎 Attachments\n\n"
      },
      {
        "type": "attachment",
        "attachment": {
          "id": "{ATTACHMENT_ID}",
          "name": "bug-{bug-slug}.png",
          "url": "{ATTACHMENT_URL}"
        }
      }
    ],
    "notify_all": false
  }'
```

**Writing quality rules (enforce on every comment):**
- **Issue** — Senior QA voice. Context + what is broken + why it matters. Not "button doesn't work" but "The Save button in the Widget editor becomes unresponsive after toggling Advanced Settings, preventing users from saving changes."
- **Current Result** — One sentence. Precise. No "I noticed that" or "It seems like."
- **Expected Result** — From the user's perspective. Short, unambiguous.
- **Solution** — For the developer. Name the file, function, class if known. Specific and actionable.
- Never use "Actual Result" — always "Current Result"
- Always preserve double blank lines between sections

### Step 5-D — Confirm each card

After each bug is logged:
> `✅ Bug card created: "{Card Name}" → {card URL} | Priority: {level} | Tag: QA`

---

## PHASE 6 — MD REPORT & FINAL SUMMARY

### Write the bug report

Save to `reports/bugs/{widget-slug}.md`:

```markdown
# {Widget Name} — QA Bug Report

**Date:** {today}
**Widget:** {widget name}
**Builder:** {Bricks / Elementor / Gutenberg}
**ClickUp Parent:** {URL}

---

## Summary

| Severity | Count |
|---|---|
| P0 — Critical | {n} |
| P1 — High | {n} |
| P2 — Medium | {n} |
| P3 — Low | {n} |
| **Total** | **{n}** |

---

{for each bug:}

### {Bug title}

**Severity:** P0 / P1 / P2 / P3
**Area:** {area}
**ClickUp:** {card URL}

**Issue:** {description}

**Steps to Reproduce:**
1.
2.
3.

**Current Result:** {current}
**Expected Result:** {expected}
**Solution:** {solution}

---
```

### Print final summary to chat

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WDK Widget QA Complete — {Widget Name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Bugs found:   {total}
  P0 Critical:  {n}   ← release blocked if > 0
  P1 High:      {n}   ← release blocked if > 0
  P2 Medium:    {n}
  P3 Low:       {n}

  Cards created: {list of clickup URLs}
  MD report:     reports/bugs/{slug}.md
  Screenshots:   /tmp/wdk-qa-{slug}/

  Release gate: {BLOCKED / CLEAR}
  (Blocked if any P0 or P1 remains open)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## QA CHECKLIST — NEVER SKIP

Before closing the session, confirm every item is checked:

**Static (Phase 1)**
- [ ] All PHP files read
- [ ] All JS files read
- [ ] All CSS files read
- [ ] Code Quality: duplicate props, typos, inline styles, icon format, enqueue method
- [ ] Security: escaping, sanitization, nonces, caps, SQL
- [ ] Performance: duplicate enqueues, per-instance styles, DOM caching
- [ ] Accessibility: contrast ratios calculated for all hardcoded color pairs
- [ ] Logic: viewport guard, cleanup, null guards, init race
- [ ] SEO: heading hierarchy, alt text

**Control Panel Verification (Phase 1G) — MANDATORY**
- [ ] Content side script run — every control's `name` verified against HTML template
- [ ] Content side: all `condition_value` references verified against full control name list
- [ ] Content side: all switchers — `return_value` cross-checked against CSS class + JS comparison
- [ ] Content side: all text/textarea sanitizers verified (not blank, no typo)
- [ ] Content side: all `url` controls with `is_external: true` → HTML renders `target="_blank"`
- [ ] Content side: repeater child fields verified with all the same checks above
- [ ] Style side script run — every `selectors` field verified against widget CSS
- [ ] Style side: every missing selector documented as a bug with CSS closest-match
- [ ] Style side: section conditions verified against content control name list
- [ ] Full control audit table produced before triaging bugs

**Frontend (Phase 2)**
- [ ] Widget rendered on staging at 375 / 768 / 1440px
- [ ] No console JS errors on load
- [ ] No console JS errors during interaction
- [ ] Widget interaction tested (scroll, click, hover — whatever the widget does)
- [ ] ARIA attributes verified in live DOM
- [ ] No horizontal overflow at any viewport

**Output (Phases 4–6)**
- [ ] One annotated screenshot per bug
- [ ] One ClickUp subtask per bug (no grouping)
- [ ] Each card: QA tag, correct priority, unified 6-section comment, inline image
- [ ] MD report saved to reports/bugs/{slug}.md

---

## GUARD RAILS

- **Never** mark QA complete if any P0 or P1 bug exists
- **Never** group two different bugs into one card
- **Never** post bug details in the card description — activity (comment) only
- **Never** use "Actual Result" — always "Current Result"
- **Never** use `mcp__clickup__clickup_create_task_comment` for the comment if a screenshot is attached — it renders as a link not an image. Use `curl` with the rich comment format
- **Always** read `~/.claude.json` for the ClickUp token — never hardcode it
- **Always** verify the widget's builder type before checking icon format
- **Always** double-blank-line between all 6 comment sections
- **Always** run Phase 1G control verification scripts before triaging — style selector mismatches and switcher `return_value` mismatches are the most commonly missed bugs in WDK widgets and will never be caught by visual inspection alone
- **Never** assume a style control works because the section exists in the panel — always confirm `selectors` value exists in CSS
- **Never** assume a switcher works because its HTML placeholder renders — always confirm the rendered class value matches the CSS selector and JS check
- If ClickUp task creation fails → report the error and continue logging remaining bugs
- If a screenshot script fails → post the comment without image and note it manually

---

## QUICK REFERENCE — CONTRAST RATIO CALCULATION

For any two hex colors `#RRGGBB`:

```
1. Convert each channel: val / 255
2. Linearize: if val <= 0.03928 → val/12.92, else → ((val+0.055)/1.055)^2.4
3. L = 0.2126*R + 0.7152*G + 0.0722*B
4. Ratio = (max(L1,L2) + 0.05) / (min(L1,L2) + 0.05)
```

**Thresholds:**
- Normal text (< 18pt / < 14pt bold): ratio ≥ 4.5:1
- Large text (≥ 18pt / ≥ 14pt bold): ratio ≥ 3:1
- UI components / icons: ratio ≥ 3:1

**Common failing pairs seen in WDK widgets:**
| Foreground | Background | Ratio | Status |
|---|---|---|---|
| `#777` | `#111` | 3.6:1 | ❌ FAIL |
| `#999` | `#111` | 4.5:1 | ✅ PASS |
| `#555` | `#fff` | 7.0:1 | ✅ PASS |
| `#aaa` | `#fff` | 2.3:1 | ❌ FAIL |
| `#767676` | `#fff` | 4.5:1 | ✅ PASS (minimum) |

---

## BUILDER-SPECIFIC RULES

### Bricks Builder

| Item | Rule |
|---|---|
| Widget class | Must extend `\Bricks\Element` |
| `get_name()` | Lowercase letters, hyphens, underscores only |
| `get_label()` | Human-readable display name |
| `$icon` property | Must use Themify icon class (`ti-*`) — Font Awesome invisible in Bricks panel |
| `set_controls()` | All style/content controls defined here — nothing hardcoded in `render()` |
| `render()` | Output only — no CSS, no JS, no `<style>`, no `<script>` |
| `enqueue_scripts()` | All wp_enqueue_style + wp_enqueue_script calls go here |

### Elementor

| Item | Rule |
|---|---|
| Widget class | Must extend `\Elementor\Widget_Base` |
| `get_icon()` | Return `eicon-*` for Elementor icons or `fa fa-*` for Font Awesome |
| `get_categories()` | Must return a valid category array |
| `_register_controls()` | All controls defined here |
| `render()` | Output only — no assets |
| `get_script_depends()` / `get_style_depends()` | Declare asset handles here for auto-enqueue |

### Gutenberg (Block)

| Item | Rule |
|---|---|
| `block.json` | `name`, `title`, `category`, `icon`, `supports` must all be defined |
| `register_block_type()` | Use `block.json` path — not manual args |
| `render_callback` | PHP render function — escaping required on all output |
| `editor.js` / `view.js` | Separate edit and frontend scripts |
| `style.css` / `editor.css` | Separate editor and frontend styles — no shared stylesheet |
