# Template Suite — Bug Report
**Date:** 2026-05-01  
**Run:** `templates-full-2026-05-01_10-48-14`  
**Workers:** 6 | **Total tests:** 746 | **Passed:** 490 | **Failed:** 148 (35 infra cascade, 113 evaluated) | **Skipped:** 35 (WDKIT_TOKEN not set)

---

### PRO import button not locked for free users

**Severity:** P1  
**Area:** Functionality / Security

**Issue:** The import button on PRO-tier template cards is not disabled or blocked for free (unauthenticated) users. There is no `disabled` attribute, no `pointer-events: none`, and no lock overlay that prevents a free user from interacting with the button.

**Steps to Reproduce:**
1. Open plugin as a free / unauthenticated user
2. Browse to `/wp-admin/admin.php?page=wdesign-kit#/browse`
3. Locate a card tagged with the PRO badge
4. Inspect or click the Import button on that card

**Expected Result:** Import button is visually locked (disabled state or lock icon overlay) and non-clickable for free users; clicking should redirect to upgrade CTA

**Actual Result:** Import button is fully interactive; no disabled attribute or visual lock state exists on the button element

**Evidence:** `reports/bugs/screenshots/pro-import-button-not-locked.png`

---

### Import button touch target too small on mobile (32px, WCAG 2.5.5)

**Severity:** P1  
**Area:** Accessibility / Responsive

**Issue:** The Import button on template cards measures only 32px tall at 375px viewport. WCAG 2.5.5 requires all touch targets to be at least 44×44px. This directly impacts usability on mobile devices.

**Steps to Reproduce:**
1. Open plugin at 375px viewport (mobile breakpoint)
2. Navigate to Browse Templates (`#/browse`)
3. Inspect the Import button on any template card
4. Measure the button height via `getBoundingClientRect()`

**Expected Result:** Button height ≥ 44px on mobile (WCAG 2.5.5 minimum touch target)

**Actual Result:** Button height = 32px — falls 12px short of the accessibility minimum

**Evidence:** `reports/bugs/screenshots/import-btn-touch-target-32px.png`

---

### React `setState` warning during Browse → My Uploaded navigation

**Severity:** P1  
**Area:** Functionality / Code Quality

**Issue:** Switching from the Browse view to My Uploaded triggers a React anti-pattern: `Connect(Wdkit_Login)` attempts to update its state while `Browse` component is still rendering. This produces the warning `Cannot update a component while rendering a different component` and can cause stale renders, missed UI updates, or infinite update loops in production.

**Console error (exact):**
```
Warning: Cannot update a component (`%s`) while rendering a different component (`%s`). 
To locate the bad setState() call inside `%s`, follow the stack trace as described in 
https://reactjs.org/link/setstate-in-render%s
Connect(Wdkit_Login) Browse Browse
  at Browse (…/wdesignkit/build/index.js?ver=2.2.10:24784:81)
```

**Steps to Reproduce:**
1. Go to Browse Templates page (`#/browse`)
2. Wait for templates to load
3. Click "My Uploaded" / "My Templates" in the navigation

**Expected Result:** Navigation completes silently with no React warnings in the browser console

**Actual Result:** React warning fires in console — `Connect(Wdkit_Login)` calls `setState` while `Browse` is rendering

**Evidence:** `reports/bugs/screenshots/react-setstate-during-render.png`

---

### Import wizard header `.wkit-import-temp-header` not found

**Severity:** P1  
**Area:** Functionality / UI

**Issue:** The selector `.wkit-import-temp-header` returns 0 elements after opening the import wizard. This element is expected to be the top header bar of the wizard modal. Its absence suggests it was removed or renamed in the current plugin build (v2.2.10), breaking the wizard header layout.

**Steps to Reproduce:**
1. Log in to WP admin
2. Navigate to Browse Templates
3. Open the import wizard on any free template card
4. Inspect for `.wkit-import-temp-header` in DevTools

**Expected Result:** `.wkit-import-temp-header` element is present and visible as the wizard's top header area

**Actual Result:** Element not found — count = 0; no header bar renders at the top of the wizard

**Evidence:** `reports/bugs/screenshots/import-wizard-header-missing.png`

---

### Import wizard cannot be re-opened after close

**Severity:** P1  
**Area:** Functionality / Logic

**Issue:** After dismissing the import wizard using the close (×) button, attempting to re-open it by clicking the Import button on any template card fails — the wizard does not appear. This blocks the user from recovering from an accidental close without a full page reload.

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Click Import on any template card — wizard opens
3. Click the close (×) button to dismiss the wizard
4. Click Import on the same or any other template card

**Expected Result:** Wizard re-opens cleanly on the second click

**Actual Result:** Wizard does not open on the second click; import button appears to trigger the action but no modal appears

**Evidence:** `reports/bugs/screenshots/wizard-cannot-reopen-after-close.png`

---

### Filter panel collapse button not interactable

**Severity:** P2  
**Area:** Functionality / UI

**Issue:** The collapse button for the filter panel sidebar is rendered as not visible / not interactable. Clicking it throws `Error: locator.click: Element is not visible`. This prevents users from collapsing or expanding the filter sidebar to gain more browse grid space.

**Steps to Reproduce:**
1. Navigate to Browse Templates (`#/browse`)
2. Locate the filter panel on the left
3. Attempt to click the collapse/toggle button on the filter panel

**Expected Result:** Filter panel collapses and button is fully clickable; clicking again re-expands it

**Actual Result:** Collapse button is not interactable — `Element is not visible` thrown; filter panel stays permanently expanded

**Evidence:** `reports/bugs/screenshots/filter-collapse-btn-not-visible.png`

---

### Template Type filter radios have wrong `name` attribute

**Severity:** P2  
**Area:** Functionality / Accessibility

**Issue:** The radio buttons for the Template Type filter (Free / PRO) have `name="FreeProFilter"` instead of the expected `name="selectPageType"`. While the filter may still visually function, the attribute change affects:
- Screen reader grouping (ARIA radio group labelling)
- Any code that relies on the `name` attribute to identify the radio group
- Potential regression — if this was intentionally renamed, the change should be communicated

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Open DevTools and inspect the Free / PRO radio buttons in the Template Type filter section
3. Read the `name` attribute value

**Expected Result:** `name="selectPageType"` on all Template Type filter radio inputs

**Actual Result:** `name="FreeProFilter"` on all Template Type filter radio inputs

**Evidence:** `reports/bugs/screenshots/template-type-filter-missing-name-attr.png`

---

### Save Template page accessible without WDKit cloud authentication

**Severity:** P2  
**Area:** Security

**Issue:** The Save Template page (`#/save_template`) can be accessed and used without the user being logged into WDKit cloud. There is no auth-gate that redirects unauthenticated users away from this page. This means a user without a WDKit cloud account can reach the save template UI, which should require auth.

**Steps to Reproduce:**
1. Log in to WordPress admin
2. Ensure WDKit cloud account is NOT connected
3. Navigate to `…/wp-admin/admin.php?page=wdesign-kit#/save_template`

**Expected Result:** Page either redirects to login or shows an "Authentication required" message before allowing access to the template save form

**Actual Result:** Save Template page is fully accessible and rendered without any auth check

**Evidence:** `reports/bugs/screenshots/save-template-no-auth-required.png`

---

### My Templates page renders blank — no cards, no empty state

**Severity:** P2  
**Area:** Functionality / Logic / UI

**Issue:** When navigating to the My Templates page (`#/my_uploaded`), the page renders completely blank — neither template cards nor an empty-state message is shown. A zero-data / fresh account should always display a helpful empty state with a call-to-action, not a blank panel.

**Steps to Reproduce:**
1. Log in to WP admin
2. Navigate to `…/wp-admin/admin.php?page=wdesign-kit#/my_uploaded`
3. Wait for the page to fully load

**Expected Result:** If no saved templates exist, an empty state component appears (e.g., "No templates yet — Save your first template") with a clear CTA

**Actual Result:** Page is blank — no cards, no empty state, no spinner indicating data is being fetched

**Evidence:** `reports/bugs/screenshots/my-templates-blank-no-empty-state.png`

---

### Browse nav link appends stale `page_type` filter to URL hash

**Severity:** P2  
**Area:** Functionality / Logic

**Issue:** Clicking the Browse Templates item in the sidebar navigation does not navigate to a clean `#/browse` hash. Instead, the URL becomes `#/browse?page_type=%5B%22websitekit%22%5D` — carrying over the previously selected page type filter. This means:
- A filter applied in a previous session / page view persists uninvited
- Users cannot reset to the unfiltered browse state by clicking the nav link
- Deep-linking to `/browse` always injects a stale filter

**Steps to Reproduce:**
1. Navigate to Browse Templates
2. Select any Page Type filter (e.g., Website Kits)
3. Navigate away (e.g., go to My Templates)
4. Click the Browse Templates nav link to return

**Expected Result:** URL hash is clean `#/browse` with no filter parameters; browse grid shows all templates

**Actual Result:** URL hash is `#/browse?page_type=%5B%22websitekit%22%5D` — previous page type filter is retained and applied

**Evidence:** `reports/bugs/screenshots/browse-nav-link-hash-not-set.png`

---

### Browse page axe-core score 80/100 — 4 serious WCAG 2.1 AA violations

**Severity:** P2  
**Area:** Accessibility

**Issue:** Running `@axe-core/playwright` against the Browse Templates page finds 4 serious WCAG 2.1 violations, producing a score of 80/100. The CLAUDE.md QA gate requires ≥85. None are critical (hard-fail), but all 4 are serious and must be resolved before release.

**Violations found:**

| Rule ID | Impact | Description |
|---|---|---|
| `color-contrast` | serious | Foreground / background colour contrast below WCAG 2 AA minimum ratio (4.5:1 for normal text, 3:1 for large) |
| `list` | serious | List elements (`<ul>` / `<ol>`) are not structured correctly |
| `listitem` | serious | `<li>` elements used outside a valid list container |
| `scrollable-region-focusable` | serious | Scrollable content regions are not reachable by keyboard (fails in Safari) |

**Steps to Reproduce:**
1. Open Browse Templates page in a fresh browser context
2. Run axe-core: `new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()`
3. Read `results.violations`

**Expected Result:** Zero serious violations; axe-core score ≥ 85/100

**Actual Result:** Score 80/100 with 4 serious violations (color-contrast, list, listitem, scrollable-region-focusable)

**Evidence:** `reports/bugs/screenshots/axe-core-inject-not-a-function.png`

---

## Test Infrastructure Issues

> These are failures in the test suite itself, not product bugs. They need to be fixed before the next run.

### §61 axe-core section — `injectAxe is not a function`

**Area:** Test infrastructure

**Issue:** `31-templates-a11y.spec.js` §61 imports `{ injectAxe, checkA11y, getViolations }` from `@axe-core/playwright`, but the package only exports `AxeBuilder`. All 6 axe-core automated scan tests fail with `TypeError: injectAxe is not a function`.

**Fix:** Replace destructured imports with `AxeBuilder` and rewrite the scan logic using `new AxeBuilder({ page }).analyze()`.

---

### §2b.05 skeleton test — incorrect re-navigation pattern

**Area:** Test infrastructure

**Issue:** Test 2b.05 calls `wpLogin(page)` (which navigates to WP admin dashboard) then sets `location.hash = '/browse'` — this sets the hash on the dashboard URL, not the plugin URL. Neither skeleton nor cards ever appear because the React app never loads.

**Fix:** Replace `location.hash = '/browse'` with a full navigation: `page.goto(PLUGIN_URL + '#/browse')` with a fresh page reload.

---

### 6-worker parallel run causes WP session expiry (80+ cascade failures)

**Area:** Test infrastructure

**Issue:** Running with `--workers=6` causes WordPress session tokens to expire or conflict across parallel workers. Tests in serial-mode spec files redirect to `wp-login.php` mid-suite, cascading 80+ failures.

**Fix:** Serial spec files (`mode: 'serial'`) must run with `--workers=1` or use Playwright's `storageState` to pre-bake auth per worker. The full pipeline should use `--workers=2` max until storageState is implemented.
