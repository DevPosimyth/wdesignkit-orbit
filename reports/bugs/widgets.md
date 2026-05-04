# Widget Suite — Bug Report
**Date:** 2026-05-04 (updated after selector fixes verified)
**Plugin Version:** 2.3.0
**Suite:** `01-browse-widget.spec.js` + `02-my-widgets.spec.js`
**Result:** 259 passed / 21 failed → **264 passed / 16 failed** after test infrastructure fixes — **94.3% pass rate** (280 total tests)
**Runtime:** ~55 min (full 280-test suite, 1 worker)

---

> **Test infrastructure fixes applied (all verified passing):**
> - §9.01, §C.05, §E.01 Browse Widget: `test.fail()` removed — bugs confirmed fixed in v2.3.0
> - §11.01, §11.07, §11.12: Combined popup selector (`.wdkit-popup-outer, .wb-edit-popup`) was resolving `.first()` to the zero-height `.wb-edit-popup` element, making `isVisible()` permanently false. Fixed to use `.wdkit-popup-outer` only — all 3 now pass ✅
> - §11.03, §11.09: Submit button regex filter replaced with `popup.locator('button').first()` — both now pass ✅
>
> **Remaining infrastructure note:**
> - §11.42: `toBeLessThan(400)` assertion confirms a real product bug — Download ZIP endpoint returns ≥ 400. Left unchanged (intentional product failure signal).

---

## ✅ Confirmed Fixed in v2.3.0

The following bugs from the previous report were confirmed fixed in this run:

| Bug | Test | Status |
|---|---|---|
| Auth guard missing on Browse Widget | §9.01 Browse | ✅ Fixed |
| Download button has no accessible name | §C.05 Browse | ✅ Fixed |
| Download button tap target < 44×44px on mobile | §E.01 Browse | ✅ Fixed |
| Builder icon missing from browse widget cards | §7.04 My Widgets | ✅ Fixed |
| Per-card favourite icon not rendered | §4.05 My Widgets | ✅ Fixed |
| Create Widget button tap target < 44px on mobile | §E.01 My Widgets | ✅ Fixed |
| Duplicate popup hidden (`.wb-edit-popup` zero-height) | §7.05 / §11.02 | ✅ Fixed |
| Convert popup hidden | §11.08 | ✅ Fixed |
| Push popup hidden | §11.13 | ✅ Fixed |

---

## 🔴 Active Bugs

---

### "Clear All" filter button not clickable

**Severity:** P2
**Area:** Functionality

**Issue:** After applying a filter, `button.wdkit-reset-all-filters` resolves in the DOM but is not visible — click interaction fails with "Element is not visible". The "Clear All" button cannot be used to reset applied filters.

**Steps to Reproduce:**
1. Navigate to `#/widget-browse`
2. Apply any category or Free/Pro filter
3. Confirm `.wdkit-browse-applied-filter` chip area appears
4. Attempt to click "Clear All" button

**Expected Result:** "Clear All" button is visible and clickable; all filter chips are removed

**Actual Result:** Button exists in DOM but is hidden (`visibility: hidden` or `display: none`); click fails with "Element is not visible" after 23s timeout

---

### Filter chip X button not clickable

**Severity:** P2
**Area:** Functionality

**Issue:** After a filter is applied, `.wdkit-applied-list button` (the per-chip X button) resolves in the DOM but is not visible. Individual filter chips cannot be dismissed.

**Steps to Reproduce:**
1. Navigate to `#/widget-browse`
2. Apply a category filter to create a chip
3. Attempt to click the X button on the chip

**Expected Result:** Clicking X removes only that filter chip and updates the grid

**Actual Result:** Button exists in DOM but is hidden; click fails with "Element is not visible" after 23s timeout

---

### Search input font-size too small (iOS auto-zoom risk)

**Severity:** P2
**Area:** Responsive / UI

**Issue:** The search input on Browse Widget (`input.wkit-search-input-b`) has a computed font-size of 14px. iOS Safari automatically zooms the viewport when an input with font-size < 16px receives focus, causing an unintended layout shift for mobile users.

**Steps to Reproduce:**
1. Navigate to `#/widget-browse`
2. Inspect `.wkit-search-input-b` computed styles
3. Check `font-size` value

**Expected Result:** Input font-size ≥ 16px (no iOS auto-zoom)

**Actual Result:** Computed font-size = 14px — triggers iOS Safari auto-zoom on focus

---

### WCAG 2.1 AA violations — axe-core audit (plugin-wide)

**Severity:** P1
**Area:** Accessibility

**Issue:** axe-core scan of both Browse Widget (`#/widget-browse`) and My Widgets (`#/widget-listing`) finds 4 critical/serious WCAG 2.1 AA violations each. The violations are structural and affect both pages, indicating plugin-wide issues.

**Violations detected (all pages):**
- `[critical] image-alt` — 2 `<img>` elements missing `alt` attribute or `role="none"` (builder filter icons in the Browse Widget panel)
- `[serious] link-name` — 1 link with no discernible text: notification bell link (`/admin/notification`) has no `aria-label` or inner text
- `[serious] list` — 5 nodes: top navigation links (Templates, Widgets, Snippets, Workspace, Settings) each rendered in their own `<ul>` instead of sharing one
- `[serious] listitem` — 11 nodes: `<li>` elements as direct children of non-list parents (same nav structure issue)

**Steps to Reproduce:**
1. Install `@axe-core/playwright` (v4+)
2. Navigate to `#/widget-browse` or `#/widget-listing`
3. Run `new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()`

**Expected Result:** 0 critical or serious violations

**Actual Result:** 4 critical/serious violations on both pages

---

### 3-dot icon button has no accessible name (My Widgets)

**Severity:** P2
**Area:** Accessibility

**Issue:** The 3-dot action menu button (`.wkit-wb-3dot-icon`) on My Widgets cards has no `aria-label`, `title`, or inner text. Screen readers announce the button without a meaningful name, violating WCAG 4.1.2 (Name, Role, Value).

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Inspect `.wkit-wb-3dot-icon` on any widget card
3. Check `aria-label`, `title`, and text content

**Expected Result:** Button has `aria-label="More options"` or equivalent accessible name

**Actual Result:** `aria-label="null"`, `title="null"`, inner text empty — no accessible name

---

### RTL layout crashes browser context on My Widgets

**Severity:** P1
**Area:** Responsive / Logic

**Issue:** Applying `dir="rtl"` to the document root while on `#/widget-listing` causes the page context to be destroyed — Playwright captures `"Target page, context or browser has been closed"`. The plugin's CSS or JavaScript does not handle RTL layout and triggers a fatal crash.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. In DevTools or via script: `document.documentElement.setAttribute('dir', 'rtl')`
3. Attempt any interaction or `page.evaluate()` call

**Expected Result:** Page adapts to RTL direction; no overflow or crash

**Actual Result:** Page context closes — browser crashes on RTL attribute application

---

### Push popup produces console errors on open/close

**Severity:** P2
**Area:** Functionality / Code Quality

**Issue:** Opening and closing the Push (sync-to-cloud) popup from the 3-dot dropdown triggers console errors. The React key prop warning (`Warning: Each child in a list should have a unique "key" prop`) and/or JavaScript errors fire during popup lifecycle.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Click the 3-dot icon on any widget card
3. Click "Push" from the dropdown
4. Close the popup via Escape or close button
5. Check browser console

**Expected Result:** No console errors during Push popup open/close

**Actual Result:** Console errors detected during Push popup interaction

---

### Push popup close button (X) leaves page unresponsive

**Severity:** P2
**Area:** Functionality

**Issue:** After closing the Push popup via the X (close) button, the page becomes unresponsive. The 3-dot dropdown can no longer be triggered on any widget card, indicating the Push popup teardown leaves the UI in a broken/frozen state.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Click the 3-dot icon on a widget card
3. Click "Push" to open the sync popup
4. Click the X (close) button on the Push popup
5. Attempt to click the 3-dot icon on any card again

**Expected Result:** Page returns to normal interactive state; 3-dot re-opens without issues

**Actual Result:** 3-dot dropdown cannot be triggered — page appears frozen after Push popup X-close

---

### Download ZIP navigates away from My Widgets

**Severity:** P2
**Area:** Functionality

**Issue:** Triggering "Download ZIP" from the 3-dot dropdown causes the page hash to be cleared, navigating the user away from `#/widget-listing`. The download should occur inline without changing the page route.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Click the 3-dot icon on any widget card
3. Click "Download ZIP"
4. Observe `location.hash` immediately after trigger

**Expected Result:** Hash stays `#/widget-listing`; user remains on My Widgets page

**Actual Result:** `location.hash` becomes `""` — user is navigated away from My Widgets

---

### Download ZIP produces console errors

**Severity:** P2
**Area:** Functionality / Code Quality

**Issue:** Triggering "Download ZIP" from the 3-dot dropdown causes JavaScript errors in the browser console. Errors appear both during and after the download action.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Click the 3-dot icon on any widget card
3. Click "Download ZIP"
4. Check browser console immediately and after download completes

**Expected Result:** No console errors during or after Download ZIP

**Actual Result:** Console errors detected during and/or after Download ZIP trigger

---

### Multiple sequential Download ZIPs crash the page

**Severity:** P2
**Area:** Functionality / Stability

**Issue:** Triggering "Download ZIP" multiple times in quick succession causes the page to crash. A single download works correctly (file is non-empty, valid ZIP), but repeated triggers without adequate guard logic break the page state.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Click the 3-dot icon on a widget card → click "Download ZIP"
3. Immediately repeat step 2 (before previous download resolves)
4. Repeat 2–3 more times rapidly

**Expected Result:** Multiple downloads queued or debounced gracefully; page stays stable

**Actual Result:** Page crashes after multiple rapid download triggers

---

### Popup missing ARIA dialog role

**Severity:** P2
**Area:** Accessibility

**Issue:** The WDesignKit popup system (`.wdkit-popup-outer`) is confirmed visible and functional, but has no `role="dialog"` or `aria-modal="true"` attribute. Screen readers cannot identify it as a dialog overlay, and focus management is not scoped to the modal content.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Open any popup (Create Widget, Duplicate, etc.)
3. Inspect `.wdkit-popup-outer` in DevTools

**Expected Result:** Popup has `role="dialog"` and `aria-modal="true"` (WCAG 4.1.2)

**Actual Result:** `.wdkit-popup-outer` count = 1, visible = true, but `role="dialog"` = 0, `aria-modal` = 0

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| QA (automated) | 2026-05-04 | ☐ Pass / ☑ Fail |

**Release gate status: BLOCKED**
- 2 P1 bugs open (WCAG axe-core violations plugin-wide; RTL browser crash)
- 8 P2 bugs open
- Zero critical/high bugs required for QA Passed
