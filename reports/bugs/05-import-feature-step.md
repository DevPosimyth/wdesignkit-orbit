# Bug Report — Import Feature Step (Step 2)

> Generated: 2026-05-01 — Templates Suite v6.0.0 run

---

### Feature card toggle interaction pattern broken — all toggle tests fail

**Severity:** P1
**Area:** Functionality

**Issue:** All 8 feature card toggle tests in Sections 27–32 fail. The `toggleCard()` helper uses `label[for="${checkboxId}"]` or a fallback `cb.click()` pattern, but neither triggers a state change on the feature cards. Before/after `isChecked()` returns the same value — the toggle does not flip.

Affected feature cards:
- eCommerce (`#wkit-card-switcher-inp-ecommerce`)
- Dynamic Content (`#wkit-card-switcher-inp-dynamic_content`)
- Performance (`#wkit-card-switcher-inp-performance`)
- Security (`#wkit-card-switcher-inp-security`)
- Extras (`#wkit-card-switcher-inp-extras`)
- Nexter Theme (Section 32)

**Steps to Reproduce:**
1. Log in to WP Admin
2. Navigate to WDesignKit → Templates → Browse Templates
3. Click Import on any template card
4. Proceed to Step 2 (Feature Selection step)
5. Click any feature card toggle (e.g., eCommerce)
6. Check if the checkbox changes state

**Expected Result:** Clicking the feature card toggle turns the checkbox ON or OFF; the `checked` property changes value between before and after the click

**Actual Result:** The checkbox `checked` state does not change after the click interaction — `before === after`. The toggle appears to not register clicks via `label[for]` or direct `cb.click()`.

**Root Cause (suspected):** The plugin's feature card toggle uses a custom React-controlled component. The click interaction may now require clicking a specific child element (the visual toggle pill/knob) rather than the label or the hidden checkbox directly. The card might have `pointer-events: none` on the checkbox/label and a custom `onClick` handler on the card container.

---

### Feature card tooltip not revealing on hover

**Severity:** P3
**Area:** UI

**Issue:** Test 26.08 hovers over the Design card info icon and waits for a tooltip (`.wkit-card-tooltip-txt, .wkit-plugin-card-tooltip, .wkit-plugin-tooltip-txt`) to become visible. The tooltip does not appear.

**Steps to Reproduce:**
1. Navigate to the Feature Selection step (Step 2)
2. Hover over the info icon on the Design feature card
3. Wait for tooltip to appear

**Expected Result:** A tooltip appears with descriptive text about the Design feature

**Actual Result:** No tooltip element becomes visible — tooltip trigger or selector has changed

---

### Feature card body/selector element not found for plugin list

**Severity:** P2
**Area:** Functionality

**Issue:** Tests asserting that toggling a feature card reveals a list of plugins (e.g., for eCommerce, Dynamic Content) fail because the plugin list container selector is not found after the toggle interaction.

**Steps to Reproduce:**
1. Navigate to the Feature Selection step
2. Enable the eCommerce card toggle
3. Look for a plugin list below or inside the card

**Expected Result:** After enabling a feature card, a list of associated plugins is visible inside or below the card

**Actual Result:** Plugin list container not visible — either the toggle doesn't work (see above) or the plugin list selector has changed

---
