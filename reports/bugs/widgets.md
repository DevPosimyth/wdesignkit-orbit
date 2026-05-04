# Widget Suite — Bug Report
**Date:** 2026-05-04  
**Plugin Version:** 2.3.0  
**Suite:** `01-browse-widget.spec.js` + `02-my-widgets.spec.js`  
**Result:** 202 passed / 19 failed (91% pass rate)  
**Runtime:** 32.4 min  

---

> **Test infrastructure note** — Test 10.05 (slow-network skeleton) failed due to CDP network throttle blocking the WP admin page navigation itself (30s timeout). This is a test harness issue, not a product bug — the CDP emulation needs to be applied after `page.goto` completes. Excluded from product bugs below.

---

### Builder icon missing from browse widget cards

**Severity:** P2  
**Area:** UI / Functionality

**Issue:** `.wdkit-builder-icon img` returns 0 elements on the Browse Widget card grid. Every widget card is missing the builder icon image that identifies which page builder (Elementor / Gutenberg) the widget targets.

**Steps to Reproduce:**
1. Navigate to `#/widget-browse`
2. Wait for widget cards to load
3. Inspect any `.wdkit-browse-card` — look for `.wdkit-builder-icon img`

**Expected Result:** Each card has a builder icon image inside `.wdkit-builder-icon`

**Actual Result:** `.wdkit-builder-icon img` count = 0 across all cards

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

**Actual Result:** Button exists in DOM but is hidden; click fails

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

**Actual Result:** Button exists in DOM but is hidden; click fails

---

### Auth guard missing on Browse Widget route

**Severity:** P1  
**Area:** Security / Logic

**Issue:** A user who has not authenticated with the WDesignKit cloud (no `wdkit-login` token in localStorage) can still access `#/widget-browse` and see the full widget card grid. The SPA auth guard does not redirect unauthenticated users away from this route.

**Steps to Reproduce:**
1. Log into WP admin (no WDKit cloud token injected)
2. Navigate to `/wp-admin/admin.php?page=wdesign-kit#/widget-browse`
3. Wait for page to load

**Expected Result:** Unauthenticated users are redirected to the login screen; widget grid is not shown

**Actual Result:** Full widget browse grid renders for unauthenticated WDKit users

---

### Excessive API calls on Browse Widget load

**Severity:** P3  
**Area:** Performance

**Issue:** Initial load of `#/widget-browse` fires 17 API requests. The target is < 15 to keep initial load lean.

**Steps to Reproduce:**
1. Open browser DevTools → Network
2. Navigate to `#/widget-browse` from a fresh page
3. Count requests to `admin-ajax.php` or `/wdesignkit/` endpoints

**Expected Result:** ≤ 14 API calls on initial load

**Actual Result:** 17 API calls fired on load

---

### Excessive API calls on My Widgets load

**Severity:** P3  
**Area:** Performance

**Issue:** Initial load of `#/widget-listing` fires 20 API requests against a target of < 10. The page makes 2× the acceptable number of requests.

**Steps to Reproduce:**
1. Open browser DevTools → Network
2. Navigate to `#/widget-listing` from a fresh page
3. Count requests to `admin-ajax.php` or `/wdesignkit/` endpoints

**Expected Result:** ≤ 9 API calls on initial load

**Actual Result:** 20 API calls fired on load

---

### Download button has no accessible name

**Severity:** P2  
**Area:** Accessibility

**Issue:** `.wdkit-browse-card-download` is an icon-only button with no `aria-label`, `title`, or visible text. Screen readers cannot announce its purpose, violating WCAG 2.1 SC 4.1.2 (Name, Role, Value).

**Steps to Reproduce:**
1. Navigate to `#/widget-browse`
2. Inspect any `.wdkit-browse-card-download` button
3. Check for `aria-label`, `title`, or inner text

**Expected Result:** Button has `aria-label="Download widget"` (or equivalent)

**Actual Result:** No accessible name present — `aria-label=""`, `title=""`, inner text empty

---

### Download button tap target too small on mobile

**Severity:** P2  
**Area:** Accessibility / Responsive

**Issue:** On a 375px mobile viewport, `.wdkit-browse-card-download` measures 32×32px. WCAG 2.5.5 requires interactive tap targets to be at least 44×44px.

**Steps to Reproduce:**
1. Set viewport to 375px wide
2. Navigate to `#/widget-browse`
3. Measure `.wdkit-browse-card-download` bounding box

**Expected Result:** Download button ≥ 44×44px on mobile

**Actual Result:** Width = 32px, Height = 32px (both below the 44px minimum)

---

### "Create Widget" button tap target too small on mobile

**Severity:** P2  
**Area:** Accessibility / Responsive

**Issue:** On a 375px mobile viewport, the "Create Widget" button in My Widgets measures 38px tall. WCAG 2.5.5 requires interactive tap targets to be at least 44×44px.

**Steps to Reproduce:**
1. Set viewport to 375px wide
2. Navigate to `#/widget-listing`
3. Measure the "Create Widget" button bounding box

**Expected Result:** Create Widget button ≥ 44px height on mobile

**Actual Result:** Height = 38px (below 44px minimum)

---

### Per-card favourite icon not rendered on non-server cards

**Severity:** P2  
**Area:** UI / Functionality

**Issue:** `.wkit-wb-fav-icon` is not rendered on widget cards in My Widgets when those widgets are user-created (non-server-type). The favourite toggle icon is absent, preventing users from favouriting their own widgets.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Create or have at least one user-created (non-server) widget present
3. Inspect each widget card for `.wkit-wb-fav-icon`

**Expected Result:** Each non-server widget card shows `.wkit-wb-fav-icon` for the favourite toggle

**Actual Result:** `.wkit-wb-fav-icon` not found on any card within 60s timeout

---

### Duplicate popup opens hidden and stays hidden

**Severity:** P2  
**Area:** Functionality

**Issue:** Clicking "Duplicate" in the 3-dot dropdown triggers the `.wb-edit-popup.wdkit-duplicate-widget-popup` to appear in the DOM, but it remains in a `hidden` visibility state and never becomes visible to the user. The duplicate widget flow is inaccessible.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing` with at least one widget present
2. Click the 3-dot icon (`.wkit-wb-3dot-icon`) on any widget card
3. Click "Duplicate" from the dropdown
4. Observe `.wdkit-duplicate-widget-popup`

**Expected Result:** Duplicate popup becomes visible; user can enter a new widget name

**Actual Result:** Popup element exists in DOM with class `wdkit-duplicate-widget-popup` but has `visibility: hidden` / `display: none` — never shown to user

---

### Convert popup opens hidden and stays hidden

**Severity:** P2  
**Area:** Functionality

**Issue:** Clicking "Convert" in the 3-dot dropdown triggers `.wb-edit-popup.wdkit-convert-widget-popup` in the DOM, but it remains hidden and never becomes visible. The convert widget flow is inaccessible.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing` with at least one widget present
2. Click the 3-dot icon on any widget card
3. Click "Convert" from the dropdown
4. Observe `.wdkit-convert-widget-popup`

**Expected Result:** Convert popup becomes visible; user can select a target page builder

**Actual Result:** Popup element exists with class `wdkit-convert-widget-popup` but remains hidden — never shown

---

### Push popup opens hidden and stays hidden

**Severity:** P2  
**Area:** Functionality

**Issue:** Clicking "Push" in the 3-dot dropdown triggers `.wb-edit-popup.wdkit-sync-popup` in the DOM, but it remains hidden and never becomes visible. The push-to-cloud flow is inaccessible.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing` with at least one widget present
2. Click the 3-dot icon on any widget card
3. Click "Push" from the dropdown
4. Observe `.wdkit-sync-popup`

**Expected Result:** Push confirmation popup becomes visible

**Actual Result:** Popup element exists with class `wdkit-sync-popup` but remains hidden — never shown

---

### React key prop warning in Popup component

**Severity:** P3  
**Area:** Code Quality

**Issue:** The `Popup` component renders a list without unique `key` props, triggering a React warning: `Warning: Each child in a list should have a unique "key" prop. Check the render method of Popup`. This surfaces in production builds and indicates a code quality issue in the popup rendering logic.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Open the Push popup via the 3-dot dropdown
3. Check browser console

**Expected Result:** No React key prop warnings in the console

**Actual Result:** `Warning: Each child in a list should have a unique "key" prop — Check the render method of Popup` at `build/index.js?ver=2.3.0:47759`

---

### Download ZIP clears page hash on trigger

**Severity:** P2  
**Area:** Functionality

**Issue:** Triggering "Download ZIP" from the 3-dot dropdown causes the page hash to be cleared (becomes `""`), navigating the user away from `#/widget-listing`. After the download trigger, the user is no longer on the My Widgets page.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Click the 3-dot icon on any widget card
3. Click "Download ZIP"
4. Check `location.hash` immediately after

**Expected Result:** Hash stays `#/widget-listing`; user remains on the My Widgets page

**Actual Result:** `location.hash` becomes `""` — user is navigated away from My Widgets

---

### Download ZIP endpoint returns 404

**Severity:** P2  
**Area:** Functionality

**Issue:** Triggering "Download ZIP" produces a console error: `Failed to load resource: the server responded with a status of 404 (Not Found)`. The ZIP download endpoint is missing or misconfigured.

**Steps to Reproduce:**
1. Navigate to `#/widget-listing`
2. Click the 3-dot icon on any widget card
3. Click "Download ZIP"
4. Check browser console and network tab

**Expected Result:** ZIP file downloads successfully; no console errors

**Actual Result:** 404 error in console — zip endpoint not found

---
