# Bug Report — Templates Filter Panel

> Generated: 2026-05-01 — Templates Suite v6.0.0 run

---

### Free/Pro radio inputs selector .wkit-freePro-radio-inp not found

**Severity:** P2
**Area:** Functionality / UI

**Issue:** Test 3.09 asserts that Free/Pro radio inputs use the class `.wkit-freePro-radio-inp`. The selector returns 0 matches — the radio input element class has changed in a recent plugin update.

**Steps to Reproduce:**
1. Navigate to WDesignKit → Templates → Browse Templates
2. Locate the Free/Pro filter section in the left sidebar
3. Inspect the radio input elements for the class `.wkit-freePro-radio-inp`

**Expected Result:** The Free, Pro, and All radio inputs each have the class `.wkit-freePro-radio-inp`

**Actual Result:** Selector returns 0 matches — class name changed or radio input structure changed

---

### "Pro" label #wkit-pro-btn-label not visible

**Severity:** P2
**Area:** UI

**Issue:** Test 6.03 asserts that the "Pro" label in the Free/Pro filter has ID `#wkit-pro-btn-label`. The element is not found — the ID has been removed or renamed.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Locate the Free / Pro filter section
3. Inspect the "Pro" label element for ID `wkit-pro-btn-label`

**Expected Result:** The "Pro" filter label has `id="wkit-pro-btn-label"` and is visible

**Actual Result:** Element not found by this ID — selector returns 0 matches

---

### Template Type filter radios not in a named radio group

**Severity:** P2
**Area:** Functionality / Accessibility

**Issue:** Test 7.07 checks that all Template Type filter radios (Page Kits, Full Pages, Sections) share the same `name` attribute, forming a proper radio group. The test fails — the radios either have different `name` values or the `name` attribute is missing.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Locate the Template Type filter section (Page Kits / Full Pages / Sections radios)
3. Inspect the `name` attribute on each radio input

**Expected Result:** All three Template Type radios share the same `name` attribute, forming a mutually exclusive radio group

**Actual Result:** Radios do not share a `name` attribute — they may behave as independent checkboxes rather than a radio group, allowing multiple selections

---

### Filter panel collapse/expand: state not restored on second click

**Severity:** P2
**Area:** Functionality

**Issue:** Test 3b.03 clicks the filter collapse button twice expecting the original filter panel state to be restored. After two clicks, the panel state does not return to its initial state.

**Steps to Reproduce:**
1. Navigate to Browse Templates — note filter panel state (expanded)
2. Click the collapse icon `.wdkit-i-filter-collapse`
3. Click the same icon again to expand
4. Observe whether the panel returns to fully expanded state

**Expected Result:** Two clicks on the collapse button returns the filter panel to its original expanded state

**Actual Result:** Second click does not restore original state — panel may remain partially collapsed or change behavior after the second toggle

---

### Console errors emitted during filter collapse/expand cycle

**Severity:** P1
**Area:** Console / Functionality

**Issue:** Test 3b.06 captures console errors while collapsing and expanding the filter panel. Errors are detected — the filter panel toggle is generating JavaScript errors.

**Steps to Reproduce:**
1. Open browser DevTools console
2. Navigate to Browse Templates
3. Click the filter collapse button
4. Click again to expand
5. Observe console for errors

**Expected Result:** No JavaScript console errors produced during filter panel collapse/expand interaction

**Actual Result:** JavaScript errors appear in console during the collapse/expand cycle — product-level errors (not network/extension errors)

---

### Active filters lost after filter panel collapse/expand

**Severity:** P2
**Area:** Logic / Functionality

**Issue:** Test 3b.07 selects a filter (Elementor), collapses the filter panel, then expands it. After expanding, the previously selected Elementor filter is deselected. Filter state should be preserved across panel visibility toggles.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Select the Elementor checkbox in the Builder filter
3. Click the filter collapse button to collapse the panel
4. Click again to expand the panel
5. Check if the Elementor checkbox is still selected

**Expected Result:** The Elementor checkbox remains selected after the filter panel is collapsed and re-expanded — filter state is preserved

**Actual Result:** The Elementor checkbox is deselected after the panel is toggled — filter state is lost on collapse

---

### AI Compatible toggle: toggling twice does not restore original checked state

**Severity:** P2
**Area:** Logic / Functionality

**Issue:** Test 4.06 toggles the AI Compatible switch ON then OFF and expects the checkbox to return to its original unchecked state. After two toggles, the state does not match the initial state.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Note the initial state of the AI Compatible toggle (unchecked by default)
3. Click the AI Compatible toggle wrapper to turn it ON
4. Click the AI Compatible toggle wrapper again to turn it OFF
5. Check if the checkbox is back to its original state

**Expected Result:** Two clicks on the AI Compatible toggle returns it to its original unchecked state

**Actual Result:** The toggle state does not restore — either stuck ON or behaves non-deterministically on double-click

---

### Category checkboxes missing: Fitness (#category_1034) and Construction (#category_1042)

**Severity:** P2
**Area:** Functionality

**Issue:** Tests assert that category checkboxes for "Fitness" (`#category_1034`) and "Construction" (`#category_1042`) are present in the category filter. Both selectors return 0 matches — these categories are missing from the filter panel.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Scroll the category filter list in the sidebar
3. Look for "Fitness" and "Construction" category checkboxes

**Expected Result:** Both "Fitness" (#category_1034) and "Construction" (#category_1042) category checkboxes are present in the filter panel

**Actual Result:** Neither checkbox is found — these categories are missing from the filter list. Either they were removed from the taxonomy or the filter panel is no longer rendering all categories

---
