# Template Import — Bug Report

**Spec file:** `tests/plugin/template-import.spec.js`
**Run date:** 2026-04-30
**Plugin version:** WDesignKit v2.2.10
**Environment:** Docker WordPress 6.7-php8.2 · localhost:8881
**Result:** 324 passed · 65 failed · 389 total · 1.4 h

---

## Summary of Failures

| # | Section | Failures | Root Cause |
|---|---------|----------|------------|
| 1 | 5. Page Builder filter | 1 | Builder radio/checkbox: both builders cannot be checked simultaneously |
| 2 | 9. Clear All Filters | 4 | Filter reset: checkboxes/radio not reverting to default state |
| 3 | 15. Dummy import — Elementor | 4 | Import page not loading / success screen never reached |
| 4 | 16. Dummy import — Gutenberg | 2 | Success screen timeout |
| 5 | 17. AI import — Elementor | 1 | Success screen timeout |
| 6 | 18. AI import — Gutenberg | 1 | Success screen timeout |
| 7 | 21. Responsive layout | 2 | Import page overflow on mobile / tablet |
| 8 | 27. Import progress states | 4 | Import never progresses; `isAttached` API error |
| 9 | 28. Success screen validation | 11 | All fail because import never completes |
| 10 | 30. AI editor edge cases | 2 | Keyboard navigation / paste-to-enable |
| 11 | 32. Filter stress | 1 | Clear All does not reset combined filters |
| 12 | 33. Category filters | 3 | Specific category IDs not found in DOM |
| 13 | 35. Error handling | 1 | Invalid template ID shows no user-facing error |
| 14 | 37. Keyboard accessibility | 2 | Filter checkboxes not keyboard-reachable; focus trap |
| 15 | 44. Post-import CTAs | 5 | All depend on import completing successfully |
| 16 | 45. Dark mode | 1 | Dark mode toggle not found |
| 17 | 46. Console audit | 2 | Import-dependent; errors on success screen |
| 18 | 47. Method step advanced | 13 | Method step elements not found / wrong text |
| 19 | 49. Success screen exact | 4 | Import-dependent; selectors wrong or import never reaches success |
| 20 | 51. Back button selectors | 1 | Back button selector mismatch |

---

### Dummy import never reaches success screen

**Severity:** P0
**Area:** Functionality

**Issue:** The dummy content import process never completes — `.wkit-site-import-success-main` is never visible within 120 s/180 s. The import wizard stalls after the method step. This is the single largest root cause, responsible for ~35 failures across sections 15–18, 27–28, 44, 46, 49.

**Steps to Reproduce:**
1. Log in to WP Admin → navigate to WDesignKit → Browse Templates
2. Click the Import button on any Elementor template card
3. Fill Business Name, click Next
4. Accept T&C on Feature step, click Next
5. Select Dummy Content card on Method step, click Import/Next
6. Wait for `.wkit-site-import-success-main`

**Expected Result:** Import process completes within 30–90 s and shows success screen

**Actual Result:** Import stalls indefinitely; success screen never appears; tests time out at 120 s / 180 s

---

### Import page (.wkit-temp-import-mian) not loading after card click

**Severity:** P0
**Area:** Functionality

**Issue:** After clicking the Import button on a template card, `.wkit-temp-import-mian` is not found in the DOM. The import page either fails to mount or the hash route does not change to `#/import-kit/{id}`.

**Steps to Reproduce:**
1. Log in → WDesignKit → Browse Templates → `location.hash = '/browse'`
2. Wait for `.wdkit-browse-card` cards to render
3. Click `.wdkit-browse-card-download` on any card
4. Observe the page

**Expected Result:** Page transitions to `#/import-kit/{id}` and shows `.wkit-temp-import-mian`

**Actual Result:** Element not found; import page does not mount

---

### Clear All Filters does not reset builder checkboxes and Free/Pro radio

**Severity:** P1
**Area:** Functionality

**Issue:** After checking Elementor, Gutenberg, or selecting a Free/Pro or category filter, clicking "Clear All Filters" does not reset the inputs to their default unchecked/All state. Tests verify `not.toBeChecked()` after Clear All but the state is not reset.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Check `#select_builder_elementor` checkbox
3. Check `#select_builder_gutenberg` checkbox
4. Select `#wkit-pro-btn-label` (Pro radio)
5. Check any category (e.g. `#category_1031`)
6. Click "Clear All Filters" (`.wdkit-filter-clear-all`)

**Expected Result:** All filters reset — builder checkboxes unchecked, Free/Pro returns to "All", categories unchecked

**Actual Result:** Checkboxes and radio remain in their changed state after Clear All is clicked

---

### Method step header shows wrong title text

**Severity:** P1
**Area:** UI / Functionality

**Issue:** `.wkit-method-header-title` does not contain "Content & Media Setup". The method step breadcrumb/header title is either absent, shows a different string, or the element is not rendered.

**Steps to Reproduce:**
1. Navigate to any import kit page (`#/import-kit/{id}`)
2. Fill Business Name, click Next
3. Accept T&C, click Next (Feature step)
4. Observe the Method step header

**Expected Result:** `.wkit-method-header-title` text = "Content & Media Setup"

**Actual Result:** Element not found or contains different text

---

### Method step — blog toggle (#wkit-blog-switcher-inp) not present

**Severity:** P1
**Area:** Functionality

**Issue:** `#wkit-blog-switcher-inp` (blog post import toggle) is not found in the DOM on the Method step.

**Steps to Reproduce:**
1. Reach Method step (Feature step → Next)
2. Inspect DOM for `#wkit-blog-switcher-inp`

**Expected Result:** Blog post toggle is present and interactable

**Actual Result:** Element not found

---

### Method step — Dummy card does not receive wkit-active-card class on click

**Severity:** P1
**Area:** UI / Functionality

**Issue:** Clicking the Dummy Content card on the Method step does not add `wkit-active-card` CSS class to the card element.

**Steps to Reproduce:**
1. Reach Method step
2. Click the first `.wkit-method-card` (Dummy Content)
3. Check if the card has class `wkit-active-card`

**Expected Result:** Clicked card receives `wkit-active-card` class

**Actual Result:** Class not applied after click

---

### Method step Next button text is not "Import" for dummy selection

**Severity:** P2
**Area:** UI

**Issue:** After selecting the Dummy Content card, the method step Next button does not show "Import" as its text.

**Steps to Reproduce:**
1. Reach Method step
2. Click Dummy Content card
3. Read text of `.wkit-import-method-next`

**Expected Result:** Button text = "Import"

**Actual Result:** Button shows different text or is not found

---

### Success screen (.wkit-import-success-title) never renders

**Severity:** P0
**Area:** Functionality / UI

**Issue:** All 11 success screen validation tests (Section 28) fail because the import never completes. Individual assertions that also fail independently: `.wkit-import-success-title` not found, `.wkit-import-success-site` href absent, `.wkit-import-success-img` not rendered.

**Steps to Reproduce:**
1. Complete a dummy import flow end-to-end (Business Name → Feature → Method → Import)
2. Wait for `.wkit-site-import-success-main`

**Expected Result:** Success screen renders with title "Success! Your Website is Ready", subtitle, site preview link, success GIF

**Actual Result:** Success screen never appears

---

### Import page renders with horizontal overflow on mobile (375 px) and tablet (768 px)

**Severity:** P2
**Area:** Responsive

**Issue:** At 375 px (mobile) and 768 px (tablet) viewport, the import page has horizontal scroll overflow.

**Steps to Reproduce:**
1. Set viewport to 375 × 812
2. Navigate to any import page (`#/import-kit/{id}`)
3. Check `document.documentElement.scrollWidth > document.documentElement.clientWidth`

**Expected Result:** No horizontal overflow at any breakpoint

**Actual Result:** `scrollWidth > clientWidth` — horizontal overflow present

---

### Preview skeleton (.wkit-temp-preview-skeleton) not shown during iframe load

**Severity:** P2
**Area:** UI / Logic

**Issue:** `.wkit-temp-preview-skeleton` is not present/visible while the preview iframe is loading on the import page.

**Steps to Reproduce:**
1. Navigate to import page immediately after card click
2. Check for `.wkit-temp-preview-skeleton` before networkidle

**Expected Result:** Skeleton loader shown while iframe is loading

**Actual Result:** Element not found — no loading state shown

---

### Specific category filter IDs not present in DOM (Restaurant, Corporate, Social Media)

**Severity:** P2
**Area:** Functionality

**Issue:** Category checkboxes `#category_1033` (Restaurant), `#category_1037` (Corporate/Business), and `#category_1051` (Social Media) are not attached to the DOM.

**Steps to Reproduce:**
1. Navigate to Browse Templates (`#/browse`)
2. Wait for filter panel to render
3. Inspect DOM for `#category_1033`, `#category_1037`, `#category_1051`

**Expected Result:** All three category checkboxes are present in the filter sidebar

**Actual Result:** `toBeAttached()` fails — elements not found in DOM

---

### Invalid template ID shows no user-facing error message

**Severity:** P2
**Area:** Logic / Error Handling

**Issue:** Navigating to `#/import-kit/invalid-99999` (non-existent template ID) does not show any user-facing error or 404-style message. The UI does not communicate the failure to the user.

**Steps to Reproduce:**
1. Navigate to `#/import-kit/invalid-99999`
2. Wait for page to settle

**Expected Result:** User-facing error message or empty/404 state shown (e.g. "Template not found")

**Actual Result:** No error message displayed; page appears blank or in an unclear state

---

### Filter checkboxes not reachable via keyboard Tab navigation

**Severity:** P2
**Area:** Accessibility

**Issue:** Filter checkboxes in the Browse Templates sidebar cannot receive keyboard focus via Tab key navigation.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Press Tab repeatedly from a known focusable element
3. Attempt to reach `#category_1031` or builder checkboxes

**Expected Result:** Tab key cycles through all interactive filter elements

**Actual Result:** Focus does not reach filter checkboxes — inputs are not in the natural tab order

---

### Focus trap present — Tab key gets stuck in import flow

**Severity:** P2
**Area:** Accessibility

**Issue:** When cycling through interactive elements on the import page with Tab, focus gets trapped and does not cycle through all interactive elements correctly.

**Steps to Reproduce:**
1. Navigate to import page
2. Press Tab repeatedly from the beginning
3. Observe if focus ever stops cycling or gets stuck

**Expected Result:** Tab continuously cycles through all interactive elements; no trap

**Actual Result:** Focus gets stuck — Tab does not move to next element

---

### Dark mode toggle not found on plugin page

**Severity:** P2
**Area:** Functionality / UI

**Issue:** No element matching a dark mode toggle/button selector is found on the WDesignKit admin page.

**Steps to Reproduce:**
1. Navigate to WDesignKit plugin page
2. Search for dark mode toggle (button, switch, or `[data-mode]` style element)

**Expected Result:** Dark mode toggle is visible and operable

**Actual Result:** Element not found in DOM

---

### Tab key does not move focus from Business Name to Tagline field

**Severity:** P2
**Area:** Accessibility

**Issue:** Pressing Tab from the Business Name input (`.wkit-site-name-inp`) does not move focus to the Tagline input (`.wkit-site-tagline-inp`).

**Steps to Reproduce:**
1. Navigate to import page
2. Click into `.wkit-site-name-inp`
3. Press Tab

**Expected Result:** Focus moves to `.wkit-site-tagline-inp`

**Actual Result:** Focus does not land on Tagline field

---

### Pasting text into Business Name does not enable Next button

**Severity:** P2
**Area:** Logic

**Issue:** Pasting text (via `Ctrl+V` / clipboard API) into the Business Name field does not trigger the validation that enables the Next button. Manually typed text enables it, but pasted text does not.

**Steps to Reproduce:**
1. Navigate to import page
2. Use `page.evaluate()` to set clipboard content
3. Focus `.wkit-site-name-inp`, press Ctrl+V
4. Check if `.wkit-next-btn.wkit-btn-class` is enabled

**Expected Result:** Pasting text into Business Name enables the Next button

**Actual Result:** Next button remains disabled after paste operation

---

### Spec code bug — isAttached() is not a valid Playwright locator method

**Severity:** P3
**Area:** Code Quality

**Issue:** The spec uses `.isAttached()` on Playwright locator objects (e.g. `cb.isAttached()`, `toggle.isAttached()`, `disableDiv.isAttached()`). This method does not exist in Playwright's public API and throws `TypeError: cb.isAttached is not a function`. Affects sections 27, 30, 45, 47.

**Steps to Reproduce:**
1. Run any test that calls `locator.isAttached()`
2. Observe TypeError

**Expected Result:** Test uses correct Playwright API to check element attachment

**Actual Result:** `TypeError: X.isAttached is not a function` thrown at runtime

**Fix:** Replace `await locator.isAttached()` with `(await locator.count()) > 0` or `locator.evaluate(el => el.isConnected)`.

---

### Both builders cannot be checked simultaneously — radio behavior

**Severity:** P1
**Area:** Functionality

**Issue:** Section 5 tests verify that both Elementor and Gutenberg checkboxes can be checked simultaneously. However, the builder inputs behave like radio buttons (only one can be active at a time), not independent checkboxes.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Check `#select_builder_elementor`
3. Check `#select_builder_gutenberg`
4. Verify both are checked simultaneously

**Expected Result:** Both builder checkboxes can be checked at the same time to filter by both builders

**Actual Result:** Checking one unchecks the other — mutual exclusion behavior (radio-like)

---
