# Bug Report — Templates Accessibility (WCAG 2.1 AA)

> Generated: 2026-05-01 — Templates Suite v6.0.0 run
> Spec: 31-templates-a11y.spec.js

---

### Import button lacks accessible text for screen readers

**Severity:** P1
**Area:** Accessibility

**Issue:** The "Import" button on template cards does not have an accessible text label that conveys its purpose to screen reader users. When navigating by keyboard, the button's accessible name is empty or generic (e.g., just an icon without a label). WCAG 2.1 SC 4.1.2 requires all interactive controls to have accessible names.

**Steps to Reproduce:**
1. Navigate to WDesignKit → Templates → Browse Templates
2. Open browser accessibility tree or screen reader
3. Navigate to a template card
4. Inspect the Import button's accessible name

**Expected Result:** The Import button has an accessible name such as "Import [template name]" or at minimum "Import" via `aria-label`, `aria-labelledby`, or visible text

**Actual Result:** The button's accessible name is empty or missing — screen readers cannot identify the button's purpose

---

### Duplicate element IDs found on Browse Templates page

**Severity:** P1
**Area:** Accessibility / Code Quality

**Issue:** The Browse Templates page contains duplicate `id` attribute values across multiple elements. This violates HTML specification (IDs must be unique per document) and causes WCAG 2.1 SC 4.1.1 failures. Duplicate IDs break `aria-labelledby`, `aria-describedby`, and `for`/`id` label associations.

**Steps to Reproduce:**
1. Navigate to WDesignKit → Templates → Browse Templates
2. Run `document.querySelectorAll('[id]')` and check for duplicate id values
3. Or run axe-core and check for `duplicate-id` rule violations

**Expected Result:** All element IDs on the page are unique

**Actual Result:** Multiple elements share the same `id` value — axe-core flags `duplicate-id` rule violations

---

### Import wizard modal missing role="dialog" attribute

**Severity:** P1
**Area:** Accessibility

**Issue:** The import wizard modal/overlay does not have `role="dialog"` on its container element. Without this ARIA role, screen readers cannot announce the modal as a dialog, and assistive technology users do not know they have entered a modal context. WCAG 2.1 SC 4.1.2 requires all UI components to use correct ARIA roles.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Click Import on any template card
3. When the import wizard opens, inspect the modal container's ARIA attributes

**Expected Result:** The import wizard container has `role="dialog"` (or is a native `<dialog>` element) and `aria-modal="true"`, with `aria-label` or `aria-labelledby` pointing to the wizard title

**Actual Result:** Modal container lacks `role="dialog"` — screen readers treat it as a regular content block, not a dialog

---

### Wizard close button not keyboard-accessible (no focus, no Enter/Space activation)

**Severity:** P1
**Area:** Accessibility

**Issue:** The close button (×) on the import wizard cannot be reached via keyboard Tab navigation, and pressing Enter or Space while focused on it does not trigger close. This traps keyboard-only users inside the wizard with no way to exit. WCAG 2.1 SC 2.1.1 requires all functionality to be operable by keyboard.

**Steps to Reproduce:**
1. Open the import wizard by clicking Import on a template card
2. Use Tab key to navigate through interactive elements
3. Attempt to reach the close button
4. When/if focused, press Enter or Space

**Expected Result:** 
- Close button is included in the Tab order and receives visible focus
- Pressing Enter or Space while focused closes the wizard
- Or pressing Escape closes the wizard (as an alternative keyboard path)

**Actual Result:** Close button cannot be reached via Tab key, or pressing Enter/Space on it does not close the wizard — keyboard users cannot dismiss the import wizard

---
