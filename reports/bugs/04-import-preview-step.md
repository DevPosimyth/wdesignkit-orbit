# Bug Report — Import Preview Step (Step 1)

> Generated: 2026-05-01 — Templates Suite v6.0.0 run

---

### Responsive bar selector .wkit-temp-responsive not found in preview panel

**Severity:** P2
**Area:** Functionality / UI

**Issue:** The selector `.wkit-temp-responsive` is absent from the preview step DOM. Tests 13.08 and 21.01 both assert this selector exists but return count 0.

**Steps to Reproduce:**
1. Log in to WP Admin
2. Navigate to WDesignKit → Templates → Browse Templates
3. Click Import on any template card
4. Observe the Preview step (Step 1)
5. Inspect DOM for `.wkit-temp-responsive`

**Expected Result:** Element `.wkit-temp-responsive` (the responsive device switcher bar) is present and visible in the preview panel

**Actual Result:** Element not found — selector returns 0 matches, tests time out

---

### Additional Content accordion selector .wkit-temp-additional-info not found

**Severity:** P2
**Area:** Functionality / UI

**Issue:** The "Additional Content" accordion section in the preview step (`.wkit-temp-additional-info`) is no longer present in the DOM. All 14 tests in Section 16 fail because the accordion cannot be located.

**Steps to Reproduce:**
1. Navigate to the Import Preview step (Step 1)
2. Look for an expandable "Add Additional Content" or "Additional Content" section below the main preview
3. Inspect DOM for `.wkit-temp-additional-info`

**Expected Result:** An accordion section allowing users to add additional content is present with a toggle header

**Actual Result:** Element not found — the accordion has been removed or class renamed in a recent plugin update

---

### Color card input[type=color] selector not returning elements

**Severity:** P2
**Area:** Functionality

**Issue:** Test 17.04 asserts that each color card contains an `input[type=color]` element. The selector returns 0 elements — the color picker input has been replaced with a different implementation (likely a custom color picker).

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Locate the color palette / color card section
3. Inspect each color card for a native `input[type=color]`

**Expected Result:** Each color card contains a `input[type=color]` HTML input for selecting colors

**Actual Result:** No `input[type=color]` elements found — the color input type has changed

---

### Color palette Primary/Secondary span selectors not found

**Severity:** P2
**Area:** UI

**Issue:** Tests asserting palette `Primary` and `Secondary` labels via span selectors fail — the palette labels are no longer structured with those selectors.

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Locate the color palette section
3. Inspect for Primary/Secondary labeled color swatches

**Expected Result:** Primary and Secondary color labels are present as accessible, identifiable elements

**Actual Result:** Selectors return no matches — label structure changed

---

### Font picker popup .wkit-select-global-data not triggered

**Severity:** P2
**Area:** Functionality

**Issue:** Tests 18.06 and 20.06 click typography/font buttons expecting a font picker popup `.wkit-select-global-data` to appear. The popup does not open — either the selector changed or the interaction trigger changed.

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Locate the typography section
3. Click a font button (e.g., the "+" or Primary font box)
4. Wait for a font picker popup

**Expected Result:** Font picker popup (`.wkit-select-global-data`) appears after clicking a font button

**Actual Result:** No popup appears — selector returns 0 matches on click

---

### Mobile preview width assertion fails (expected 360px)

**Severity:** P2
**Area:** Responsive

**Issue:** The mobile preview frame inside the wizard is expected to be ~360px wide when the mobile preview button is clicked. The current implementation returns a different width.

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Click the mobile device preview button
3. Measure the width of the preview frame

**Expected Result:** Preview iframe/frame is approximately 360px wide on mobile preview mode

**Actual Result:** Width assertion fails — different width returned or mobile preview button not found

---

### Page dropdown .wkit-temp-list-drp not visible after trigger

**Severity:** P2
**Area:** Functionality

**Issue:** Test 22.04 clicks a page selector trigger and then waits for `.wkit-temp-list-drp` to become visible. The dropdown does not appear — selector or trigger interaction changed.

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Locate the page/template dropdown at the top of the preview
3. Click to open the dropdown
4. Wait for the page list to appear

**Expected Result:** Page list dropdown (`.wkit-temp-list-drp`) opens showing available template pages

**Actual Result:** Dropdown does not appear — selector returns 0 visible matches

---

### Dummy dots span.wkit-dummy-dots not rendered

**Severity:** P3
**Area:** UI

**Issue:** Test 23.05 asserts that 3 `span.wkit-dummy-dots` elements are rendered in the preview. These decorative dots are not present in the current DOM.

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Inspect DOM for `span.wkit-dummy-dots`

**Expected Result:** Three dummy dot spans are present as part of the preview UI

**Actual Result:** No elements found with selector `span.wkit-dummy-dots`

---

### Tooltip alert icon .wdkit-i-alert not appearing when name field empty

**Severity:** P2
**Area:** Functionality / UI

**Issue:** Test 24.04 clicks the Next button while the template name field is empty, expecting a tooltip alert icon (`.wdkit-i-alert`) to appear. The icon does not appear.

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Clear the template name input field
3. Click the "Next" or "Import" button
4. Wait for a validation tooltip/icon to appear

**Expected Result:** Alert icon or tooltip appears near the name field indicating it is required

**Actual Result:** No alert icon appears — validation UI has changed

---

### ESC key behavior at preview step does not match expectation

**Severity:** P2
**Area:** Functionality

**Issue:** Test 27b.03 and 27b.04 test ESC key behavior at the preview step. The wizard does not respond to ESC as expected — either the wizard closes completely (when it should stay open) or it freezes.

**Steps to Reproduce:**
1. Open the Import wizard to the Preview step
2. Press the Escape key
3. Observe wizard behavior

**Expected Result:** ESC key either closes the wizard cleanly or is ignored without side effects; no UI freeze

**Actual Result:** ESC key behavior differs from expected — either closes prematurely or UI does not respond

---

### Logo file input selector not found in wizard

**Severity:** P2
**Area:** Functionality

**Issue:** Tests asserting the logo file upload input within the import wizard cannot locate the file input element. The selector pattern for logo upload has changed.

**Steps to Reproduce:**
1. Navigate to the Import Preview step
2. Look for the logo upload field
3. Inspect DOM for file input associated with logo upload

**Expected Result:** A `input[type=file]` or equivalent upload control is present for logo upload within the wizard

**Actual Result:** File input selector returns 0 matches — element not found

---
