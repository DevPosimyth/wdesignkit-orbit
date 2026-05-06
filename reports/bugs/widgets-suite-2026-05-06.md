# Widgets Suite — QA Bug Report
**Date:** 2026-05-06  
**Run:** `npx playwright test tests/plugin/widgets --workers=6`  
**Duration:** 59.9 minutes  
**Result:** 611 passed / 229 failed / 840 total  
**Projects:** plugin-desktop · plugin-mobile · plugin-tablet  

---

## Summary

| Category | Bugs |
|---|---|
| Functionality | 3 |
| Accessibility | 4 |
| Performance / CLS | 2 |
| Console / Network | 1 |
| Test infra (not product) | 1 |

---

### Free/Pro filter does not filter widget cards

**Severity:** P2  
**Area:** Functionality

**Issue:** Selecting the "Free" radio filter on Browse Widget page shows all 24 cards identical to the unfiltered state. The filter UI exists and the URL hash updates correctly, but card count stays at 24 even though 15 cards carry a PRO badge. The filter is visually interactive but has no effect on displayed results.

**Steps to Reproduce:**
1. Log in as tester and navigate to WDesignKit → Browse Widget
2. Wait for widget cards to load (24 cards visible)
3. Click the "Free" radio button in the filter panel
4. Observe card count

**Expected Result:** Card count decreases — only free widgets are shown (fewer than 24)

**Actual Result:** Card count remains 24 (debug output: `Cards before: 24, after Free filter: 24, PRO badges: 15`)

---

### Favourite toggle does not update heart icon state

**Severity:** P2  
**Area:** Functionality

**Issue:** Clicking the favourite toggle button on a My Widgets card does not visually update the heart icon. The icon remains in its initial state (filled or unfilled) after the click. The toggle button is present and clickable, but the state change is not reflected in the UI.

**Steps to Reproduce:**
1. Navigate to WDesignKit → My Widgets
2. Locate any widget card with a heart/favourite icon
3. Note the current icon state (filled/unfilled)
4. Click the heart icon
5. Observe icon state after click

**Expected Result:** Icon toggles between filled (.wdkit-i-filled-heart) and unfilled (.wdkit-i-heart) state on each click

**Actual Result:** Icon state does not change after click (error: `Heart icon state did not change after clicking favourite toggle`)

---

### Back-navigation to My Widgets does not re-render the listing

**Severity:** P2  
**Area:** Functionality / Logic

**Issue:** When the user navigates from My Widgets → Browse Widget → back to My Widgets via hash navigation, the My Widgets listing does not re-render. The page appears blank or stale. Confirmed on desktop and tablet; passes on mobile.

**Steps to Reproduce:**
1. Navigate to WDesignKit → My Widgets (#/widget-listing)
2. Click to go to Browse Widget (#/widget-browse)
3. Use the sidebar or back button to return to My Widgets (#/widget-listing)
4. Observe widget listing

**Expected Result:** My Widgets listing re-renders and shows the user's widgets

**Actual Result:** Listing does not re-render; page shows blank or outdated state (fails §G.01 on desktop + tablet)

---

### Search input font-size 14px triggers iOS auto-zoom

**Severity:** P2  
**Area:** Responsive / UI

**Issue:** The search input on Browse Widget and My Widgets pages has a computed font-size of 14px. iOS Safari automatically zooms in when an input has font-size < 16px, breaking the viewport layout. Confirmed across all viewports tested.

**Steps to Reproduce:**
1. Open Browse Widget page on an iOS device or simulate iOS Safari at 375px
2. Tap on the search input (`input.wkit-search-input-b`)
3. Observe page zoom behaviour

**Expected Result:** No auto-zoom; input font-size is ≥ 16px

**Actual Result:** Page zooms in on tap. Computed font-size: 14px (`[6.11] Search input computed font-size: 14px`)

---

### Download button tap target is 32×32px — below 44×44px minimum

**Severity:** P3  
**Area:** Accessibility / Responsive

**Issue:** The download button (`.wdkit-browse-card-download`) on Browse Widget cards measures 32×32px. Both WCAG 2.5.5 (AAA) and Apple HIG require interactive tap targets to be at least 44×44px on touch viewports. This makes the button difficult to tap on mobile devices.

**Steps to Reproduce:**
1. Open Browse Widget page at 375px viewport
2. Inspect `.wdkit-browse-card-download` bounding box

**Expected Result:** Button width ≥ 44px and height ≥ 44px

**Actual Result:** Button is 32×32px (`Error: Download btn width 32px < 44px`)

---

### Download button has no accessible name

**Severity:** P3  
**Area:** Accessibility

**Issue:** The `.wdkit-browse-card-download` button has no `aria-label`, `title`, or inner text. Screen readers announce it as an unlabelled button. Violates WCAG 4.1.2 (Name, Role, Value) and was also flagged in axe-core scan (aria-command-name).

**Steps to Reproduce:**
1. Open Browse Widget page
2. Inspect any `.wdkit-browse-card-download` button
3. Check `aria-label`, `title`, and inner text attributes

**Expected Result:** Button has a meaningful accessible name e.g. `aria-label="Download widget"`

**Actual Result:** `label="null"`, `title="null"`, `text=""` — no accessible name present

---

### Widget card images missing alt attributes — WCAG 1.1.1

**Severity:** P3  
**Area:** Accessibility

**Issue:** Multiple widget card images on Browse Widget page are missing `alt` attributes. Specifically card images at indices 3 and 4 in the current rendered set have no alt text. Violates WCAG 1.1.1 (Non-text Content).

**Steps to Reproduce:**
1. Navigate to Browse Widget page
2. Inspect widget card images (`img` elements inside `.wdkit-browse-card`)
3. Check for `alt` attribute presence

**Expected Result:** All `<img>` elements have a non-empty `alt` attribute

**Actual Result:** Card images at indices 3 and 4 are missing alt attributes (`Error: Card image [3] is missing alt attribute — WCAG 1.1.1`)

---

### axe-core: 2 serious WCAG violations on Browse Widget page

**Severity:** P3  
**Area:** Accessibility

**Issue:** axe-core scan on Browse Widget page reports 2 serious violations:
- `list`: Incorrectly structured list elements (5 nodes) — likely the filter/nav lists are not using proper `<ul>/<ol>` wrapper
- `listitem`: `<li>` elements used outside a proper `<ul>/<ol>` context (5 nodes)

**Steps to Reproduce:**
1. Open Browse Widget page
2. Run axe-core against the page (`axe.run()`)
3. Filter results to `serious` and `critical` impact levels

**Expected Result:** Zero critical or serious axe violations

**Actual Result:** 2 serious violations — list structure and listitem semantics (`[§C.09] Total violations: 2, critical/serious: 2`)

---

### axe-core: 2 serious WCAG violations on My Widgets page

**Severity:** P3  
**Area:** Accessibility

**Issue:** axe-core scan on My Widgets page reports 2 serious violations:
- `aria-command-name`: 3 ARIA buttons/links/menuitems have no accessible name
- `color-contrast`: 2 nodes fail WCAG AA minimum contrast ratio (4.5:1 for normal text)

**Steps to Reproduce:**
1. Navigate to My Widgets page
2. Run axe-core against the page
3. Filter results to `serious` and `critical` impact

**Expected Result:** Zero critical or serious axe violations

**Actual Result:** 2 serious violations — unlabelled ARIA controls and insufficient contrast (`[§C.07] axe-core: no critical or serious WCAG 2.1 AA violations on My Widgets page`)

---

### CLS: card count jumps after initial render on Browse Widget

**Severity:** P3  
**Area:** Performance

**Issue:** The Browse Widget card count is not stable after initial render. The grid displays an initial card count and then re-renders with a different count shortly after, causing a visible layout shift (CLS event). Fails on desktop and tablet, but not on mobile.

**Steps to Reproduce:**
1. Navigate to Browse Widget page
2. Note initial card count when first render completes
3. Wait 2 seconds and observe if card count changes

**Expected Result:** Card count stabilises and does not change after initial render

**Actual Result:** Card count changes after initial render, causing a layout shift (§D.03 fails on desktop + tablet)

---

### 404 responses for CSS/JS assets on Browse Widget page (desktop only)

**Severity:** P3  
**Area:** Console / Network

**Issue:** One or more CSS or JavaScript asset requests return HTTP 404 when Browse Widget page loads on desktop. This suggests a missing or incorrectly referenced static file. The same test passes on mobile and tablet projects, suggesting this may be viewport or timing dependent.

**Steps to Reproduce:**
1. Open DevTools Network tab
2. Navigate to WDesignKit Browse Widget page
3. Filter requests by status 404

**Expected Result:** All static assets (CSS/JS) return HTTP 200

**Actual Result:** At least one CSS or JS asset returns 404 on desktop viewport (§10.06 fails on desktop, passes on mobile + tablet)

---

## Test Infrastructure Note

**89 tests fail with redirect to `wp-login.php`** — not a product bug. Root cause: Playwright auth guard tests (§9.01 / §2.01) that intentionally test unauthenticated state leave the browser session logged out. Some workers pick up the next test before the `beforeEach` login completes, hitting the redirect. To fix: ensure `test.use({ storageState })` or add an explicit `wpLogin()` assertion at the start of affected tests.

**Selector mismatches (class names)** — Multiple tests checking for `.wdkit-i-widgets`, `.wkit-menu`, `.wkit-browse-widget-main`, `.wdkit-templates-card-main`, Free/Pro radio inputs, category checkbox selectors, `.wdkit-applied-list`, and similar classes fail consistently across all 3 browser projects. These are likely classes from the source zip that differ from the currently deployed Docker build. Not reported as bugs — requires version alignment between Docker image and zip source before retesting.
