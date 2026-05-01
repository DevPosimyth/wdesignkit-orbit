# Bug Report — My Templates page

> Generated: 2026-05-01 — Templates Suite v6.0.0 run

---

### My Templates tab bar selector .wkit-navbar not found

**Severity:** P2
**Area:** Functionality / UI

**Issue:** Test 22.01 asserts that the My Templates page has a tab bar rendered in a `.wkit-navbar` container. The selector returns 0 matches — the tab bar container class has been renamed or removed in a recent plugin update.

**Steps to Reproduce:**
1. Log in to WP Admin
2. Navigate to WDesignKit → Templates → My Templates
3. Wait for the My Templates page to render
4. Inspect DOM for `.wkit-navbar`

**Expected Result:** A tab bar with Page/Section/Kits tabs is present in a `.wkit-navbar` container

**Actual Result:** `.wkit-navbar` returns 0 matches — tab bar uses a different selector

---

### My Templates active tab selector .tab-active not found

**Severity:** P2
**Area:** UI

**Issue:** Tests 22.05 and 22.09 assert that the active tab in the My Templates tab bar has the class `.tab-active`. This class is not found — the active tab uses a different CSS class.

**Steps to Reproduce:**
1. Navigate to My Templates (#/my_uploaded)
2. Observe the tab bar (Pages / Sections / Kits)
3. Inspect the active/selected tab for the class `tab-active`

**Expected Result:** The currently selected tab has the class `tab-active`

**Actual Result:** No element with class `tab-active` is found — the active state is tracked with a different class name

---

### My Templates performance test threshold too low

**Severity:** P3
**Area:** Performance (test quality)

**Issue:** Test measuring My Templates page load uses a 5000ms threshold. This includes WordPress admin login (~5-8s), navigation to the plugin page, and SPA initialization — consistently exceeding 5s even on fast systems.

**Steps to Reproduce:**
1. Run test `§A.01 My Templates page loads within 5 seconds` 
2. Observe the timing

**Expected Result:** Test measures a realistic page load threshold; does not fail on normal hardware

**Actual Result:** Test always fails because the 5000ms threshold is less than the time required for WP admin login alone

**Fix applied in spec:** Updated threshold to 15000ms in v6.0.0 fix pass

---
