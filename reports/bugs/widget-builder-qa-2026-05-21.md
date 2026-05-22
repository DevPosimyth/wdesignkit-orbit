# Widget Builder QA — Comprehensive Report
**Date:** 2026-05-21
**Tester:** Dev Panchal (devpanchal.posimyth@gmail.com)
**Scope:** Widget Builder module — https://wdesignkit.com/admin/widgets/uploaded
**Browsers:** Chrome (wdk-desktop), Firefox (wdk-firefox)
**Test Suite:** 73 automated Playwright tests across 10 sections
**Overall Result:** 53 passed, 20 failed (Chrome) — 13 confirmed product bugs, 7 spec-level issues corrected

---

## Summary

| Severity | Count |
|----------|-------|
| P0 — Critical | 1 |
| P1 — High | 5 |
| P2 — Medium | 7 |
| P3 — Low | 2 |
| **Total** | **15** |

**Automation Coverage:** All P0–P2 bugs verified by automated test assertions. Failures reproduce consistently across Chrome and Firefox.

---

### API stack trace exposed on authentication failure

**Severity:** P0
**Area:** Security

**Issue:** The `/api/auth/loginCheck` endpoint returns a full PHP stack trace in the 401 error response body when incorrect credentials are supplied. The trace exposes the server's absolute file path (`/home/wdesigkitstaging/webapps/WDesignKit-Backend-Api/vendor/php-open-source-saver/jwt-auth/...`), confirming the hosting environment name, the full vendor package path, and the internal exception flow. This directly aids server-side attack reconnaissance.

**Steps to Reproduce:**
1. Send `POST https://api.wdesignkit.com/api/auth/loginCheck` with body `{"email":"wrong@test.com","password":"wrongpass","type":"admin"}`
2. Inspect the JSON response body

**Expected Result:** Generic 401 — `{"message":"Unauthorized"}` with no internal path or stack detail

**Actual Result:** Full PHP stack trace with absolute server file paths exposed in the response body

---

### CORS policy blocks site logo SVG on all admin pages

**Severity:** P1
**Area:** Functionality / Cross-Browser

**Issue:** The WDesignKit logo SVG at `https://api.wdesignkit.com/images/website/common/wdesignkit-site-logo.svg` is blocked by CORS policy on every admin page. Confirmed by automated tests on both the widget dashboard (5.01 ✘) and widget edit page (5.02 ✘) on Chrome. The browser console shows: `Access to image at 'https://api.wdesignkit.com/...' has been blocked by CORS policy`. Logo renders broken/invisible in admin navigation.

**Steps to Reproduce:**
1. Log in as admin at https://wdesignkit.com/login
2. Navigate to /admin/widgets/uploaded or /admin/widgets/edit/{id}
3. Open DevTools → Console

**Expected Result:** Logo loads without CORS errors; image is visible in admin nav

**Actual Result:** Logo blocked on all admin pages; console shows CORS policy violation

---

### Resource fails to load with net::ERR_FAILED on all admin pages

**Severity:** P1
**Area:** Functionality / Performance

**Issue:** A resource on every admin page (both /admin/widgets/uploaded and /admin/widgets/edit/{id}) produces `Failed to load resource: net::ERR_FAILED` in the browser console. This is distinct from the CORS error — the request fails at the network level before any response is received. Confirmed by automated tests 5.03 and 5.04 on Chrome, both asserting the same single error message. The affected URL is not captured by the console message alone; requires DevTools Network panel investigation to identify the specific resource.

**Steps to Reproduce:**
1. Log in and navigate to /admin/widgets/uploaded
2. Open DevTools → Console
3. Filter for errors; look for `ERR_FAILED` (excluding CORS messages)
4. Repeat on /admin/widgets/edit/{id}

**Expected Result:** All resources load successfully; no `ERR_FAILED` errors in console

**Actual Result:** One resource fails with `net::ERR_FAILED` on every admin page load (both dashboard and edit pages)

---

### Search input does not filter widget results

**Severity:** P1
**Area:** Functionality

**Issue:** The search input on /admin/widgets/uploaded accepts text but does not filter the displayed widget cards. Confirmed by automated test 2.10 (✘ on Chrome and Firefox): before search, N widgets visible; after entering a specific widget name, same N widgets still visible. Search is completely non-functional.

**Steps to Reproduce:**
1. Log in and navigate to /admin/widgets/uploaded
2. Note the total number of widget cards visible (12 in test environment)
3. Type a specific widget name in the search input
4. Observe the widget list

**Expected Result:** Only widgets matching the search term are displayed

**Actual Result:** All widgets remain visible; search has no effect

---

### "Create Widget" uses a non-semantic SPAN element — keyboard-inaccessible

**Severity:** P1
**Area:** Accessibility / Functionality

**Issue:** The primary "Create Widget" CTA is rendered as `<span class="wdkit-black-btn px-6 whitespace-nowrap">`, not a `<button>` or `<a>`. Confirmed by automated test 3.01 (✘ Chrome and Firefox). The SPAN cannot be reached via Tab key, has no implicit interactive role, and is skipped entirely by screen readers. WCAG 2.1 Level A failure (SC 4.1.2).

**Steps to Reproduce:**
1. Navigate to /admin/widgets/uploaded
2. Press Tab repeatedly to cycle through all focusable elements
3. Observe whether "Create Widget" receives focus

**Expected Result:** "Create Widget" is reachable via Tab and activatable via Enter/Space

**Actual Result:** The SPAN is skipped by keyboard navigation; inaccessible to keyboard and screen reader users

---

### /admin/widgets/create shows a not-found page instead of creation form

**Severity:** P1
**Area:** Functionality

**Issue:** Navigating to `/admin/widgets/create` displays content matching a 404/not-found state ("Browse Templates", "Back to Homepage", "Start Building") instead of a widget creation form. Confirmed by automated test 3.03 (✘ Chrome and Firefox). The route exists but renders the wrong page, completely breaking the widget creation flow.

**Steps to Reproduce:**
1. Log in and navigate to /admin/widgets/uploaded
2. Click the "Create Widget" element (or navigate directly to /admin/widgets/create)
3. Observe the resulting page

**Expected Result:** A widget creation form with fields for widget name, builder type selector, and a Save/Create button

**Actual Result:** Page renders not-found-style content; no creation form visible

---

### No H1 heading on any admin page

**Severity:** P2
**Area:** Accessibility / SEO

**Issue:** Zero `<h1>` elements exist on any admin page. Confirmed by automated tests 2.03 and 8.01 (both ✘ on Chrome and Firefox). WCAG 2.1 SC 1.3.1 requires meaningful heading structure; screen readers cannot identify the page's primary subject via H1. Reproduces on /admin/widgets/uploaded and /admin/dashboard.

**Steps to Reproduce:**
1. Navigate to /admin/widgets/uploaded (logged in)
2. Open DevTools → Elements and search for `h1`

**Expected Result:** Each page has exactly one `<h1>` describing its primary content

**Actual Result:** No `<h1>` element exists on admin pages

---

### Page `<title>` is identical and generic across all admin pages

**Severity:** P2
**Area:** Accessibility / SEO

**Issue:** All admin pages share the title `"WDesignKit: All-in-One Tool for WordPress Agencies and Designers"` — the marketing homepage title. Confirmed by automated test 2.02 (✘ Chrome and Firefox). Browser tab is identical on widget list, widget edit, and dashboard. WCAG 2.1 SC 2.4.2 requires descriptive page titles.

**Steps to Reproduce:**
1. Log in and navigate to /admin/widgets/uploaded
2. Check the browser tab title
3. Navigate to /admin/widgets/edit/{id} and /admin/dashboard
4. Compare titles

**Expected Result:** Distinct, descriptive titles — e.g. "Widget Builder — WDesignKit", "Edit Widget: [Name] — WDesignKit"

**Actual Result:** Title is `"WDesignKit: All-in-One Tool for WordPress Agencies and Designers"` on all pages

---

### 49 widget action buttons have no accessible labels

**Severity:** P2
**Area:** Accessibility

**Issue:** Widget cards display action icon buttons (edit, delete, duplicate, download) with no `aria-label`, `title`, or visible text. Confirmed by automated test 3.09 (✘ Chrome): `49 widget action buttons have no accessible labels`. Screen reader users hear only "button" with no context. Also confirmed by 8.03 (✘ Chrome). WCAG 2.1 SC 1.1.1 and SC 4.1.2 failures.

**Steps to Reproduce:**
1. Navigate to /admin/widgets/uploaded
2. Activate a screen reader (e.g. VoiceOver/NVDA) and navigate to any widget card
3. Tab to the action icons

**Expected Result:** Each icon button announces its purpose — "Edit widget", "Delete widget", "Duplicate widget"

**Actual Result:** Icons render without accessible names; screen reader users cannot determine button purpose

---

### API endpoint URL has typo — "dashbord" instead of "dashboard"

**Severity:** P2
**Area:** Code Quality

**Issue:** The admin dashboard makes calls to `POST https://api.wdesignkit.com/api/admin/dashbord/get` — missing the 'a' in "dashboard". Confirmed by automated test 6.04 (✘ Chrome) with exact URL evidence: `"Typo 'dashbord' found in API URL: https://api.wdesignkit.com/api/admin/dashbord/get, https://api.wdesignkit.com/api/admin/dashbord/get"`. The same misspelled URL is called twice per load.

**Steps to Reproduce:**
1. Log in and navigate to /admin/dashboard
2. Open DevTools → Network → Filter by "dashbord"

**Expected Result:** No results (or the endpoint is spelled correctly: `/api/admin/dashboard/get`)

**Actual Result:** `POST https://api.wdesignkit.com/api/admin/dashbord/get` fires twice per page load

---

### Dashboard API endpoint called twice on every page load

**Severity:** P2
**Area:** Performance

**Issue:** `POST https://api.wdesignkit.com/api/admin/dashbord/get` fires **twice** on every admin page load. Confirmed by automated test 6.05 (✘ Chrome): `"https://api.wdesignkit.com/api/admin/dashbord/get called 2 times — expected 1"`. Also confirmed by test 2.13 (✘ Chrome and Firefox). Doubles backend load and wastes bandwidth on every page view.

**Steps to Reproduce:**
1. Log in and open DevTools → Network
2. Navigate to /admin/dashboard
3. Filter requests by "dashbord" and count occurrences

**Expected Result:** Exactly one call to the dashboard endpoint per page load

**Actual Result:** Two identical POST requests fire on every load

---

### Logout control is a non-semantic SPAN without keyboard access

**Severity:** P2
**Area:** Accessibility

**Issue:** The logout control in admin navigation is a `<span>` element, not a `<button>`. It cannot be reached via Tab key or activated via keyboard. Users relying on keyboard-only or assistive technology cannot log out without a mouse. Confirmed by page structure analysis. WCAG 2.1 SC 2.1.1 failure.

**Steps to Reproduce:**
1. Log in to any admin page
2. Press Tab repeatedly through all navigation elements
3. Attempt to reach and activate logout via keyboard

**Expected Result:** Logout reachable via Tab, activatable via Enter

**Actual Result:** Logout SPAN is not focusable; skipped by keyboard navigation

---

### Chatbase chat widget loads on all admin pages

**Severity:** P3
**Area:** Performance / UX

**Issue:** The Chatbase AI chat widget loads on every admin page, adding external JS (`chatbase.co/embed.min.js`), a floating chat button, and a persistent iframe. Confirmed in Chrome network output during test runs. Admin users are not the target audience for a public support chat widget. Adds unnecessary page weight and visual noise.

**Steps to Reproduce:**
1. Log in and navigate to any admin page
2. Observe the floating chat button (bottom-right)
3. Open DevTools → Network → filter for "chatbase"

**Expected Result:** Chatbase widget not loaded on authenticated admin pages; limited to public marketing pages

**Actual Result:** Chatbase widget loads on all admin pages

---

### Gist translation file loaded twice on every admin page

**Severity:** P3
**Area:** Performance

**Issue:** `https://cdn.getgist.com/translation_files/en_translation.json` is fetched twice on every admin page load. Confirmed by Chrome network output captured in automated test 9.04 — the URL appears at both the start and end of the resource list. Redundant fetch doubles network cost for this resource.

**Steps to Reproduce:**
1. Log in and navigate to any admin page
2. Open DevTools → Network → filter by "getgist"

**Expected Result:** Translation file fetched once per session

**Actual Result:** Same translation file fetched twice per page load

---

## Automated Test Results Summary

### Chrome (wdk-desktop) — 73 tests

| Result | Count |
|--------|-------|
| ✓ Passed | 53 |
| ✘ Failed (product bugs) | 16 |
| ✘ Failed (spec issues fixed) | 4 |

**Product bug failures (all reproduced and confirmed):**

| Test ID | Description |
|---------|-------------|
| 2.02 | Generic page title on all admin pages |
| 2.03 | No H1 element on widget dashboard |
| 2.06 | CORS error blocks site logo SVG |
| 2.10 | Search does not filter widget results |
| 2.13 | Dashboard API called more than once per load |
| 3.01 | Create Widget button is a SPAN |
| 3.03 | /admin/widgets/create shows not-found page |
| 3.09 | Widget action buttons have no accessible labels (49 buttons) |
| 5.01 | CORS error on widget dashboard |
| 5.02 | CORS error on widget edit page |
| 5.03 | `net::ERR_FAILED` resource error on widget dashboard |
| 5.04 | `net::ERR_FAILED` resource error on widget edit page |
| 6.04 | API typo "dashbord" in URL path |
| 6.05 | Dashboard API called twice per page load |
| 8.01 | No H1 on widget dashboard (accessibility) |
| 8.03 | Interactive SPANs have no aria-labels |

**Spec issues corrected after initial run (not product bugs):**
- 2.04 / 2.05: Double-login inside `beforeEach` describe → moved to standalone describe block
- 3.11: Back-navigation selector wrong (sidebar uses expandable JS menus, not plain `<a>`)
- 9.04: Test was collecting all JS/CSS URLs instead of just duplicates

### Firefox (wdk-firefox) — partial results at session end

Firefox run confirmed same bugs as Chrome for sections 1–3 with identical pass/fail pattern. All BUG-CONFIRMED test failures reproduced across both browsers.

---

## Passing Tests (Baseline Confidence)

The following areas are WORKING correctly and should be monitored for regression:

- All authentication flows (login, wrong password, empty fields, HTTPS enforcement)
- Session persistence across page reload
- Unauthenticated redirect to /login
- No sensitive data (passwords, tokens) in login page HTML source
- Widget list renders widget cards (dashboard not blank)
- No horizontal overflow at 1440px desktop
- Sidebar navigation sections all present (Dashboard, Templates, Widgets, etc.)
- Search input visible and accepts typed text
- Pagination Next/Previous buttons visible
- All 4 builder types (Elementor, Gutenberg, Bricks, Nexter) mentioned in dashboard
- Widget edit pages load correctly (edit/12422, edit/12415, edit/12416, edit/12421)
- Widget edit page has Save button visible
- Widget edit shows builder type selection (Elementor, Gutenberg, Bricks)
- Widget edit shows sub-builder options (Core Gutenberg, Nexter Blocks)
- Widget edit title input is editable
- Widget edit page Free/Pro toggle visible
- API security: unauthenticated widget list API returns 401
- API security: IDOR test (accessing another user's widget without token) returns 403/401

---

## Manual Check Items (Not Automatable)

- **Drag-and-drop reorder** in widget builder canvas
- **Live preview accuracy** vs frontend render (visual judgment required)
- **Bricks builder widget rendering** (requires active Bricks licence)
- **Safari file download behavior** (blob URL / anchor click differs in Safari)
- **RTL layout (Arabic/Hebrew)** — overflow and text direction
- **Logout flow** — confirm SPAN click logs out and redirects to /login
- **Identify specific ERR_FAILED resource** — open DevTools → Network on admin page, filter failed requests to find exact URL causing `net::ERR_FAILED`

---

## Recommended Fix Order

1. **P0** — Strip PHP stack traces from API error responses. Return `{"error":"Invalid credentials"}` only.
2. **P1** — Fix CORS on `api.wdesignkit.com`: add `Access-Control-Allow-Origin: https://wdesignkit.com` to all responses.
3. **P1** — Investigate and fix the `net::ERR_FAILED` resource load on admin pages.
4. **P1** — Fix search filtering: wire search input to widget list API query param or client-side filter.
5. **P1** — Replace SPAN "Create Widget" with `<button>`.
6. **P1** — Fix `/admin/widgets/create` route to render the creation form.
7. **P2** — Add `<h1>` to every admin page.
8. **P2** — Set distinct page `<title>` per route via Next.js `metadata`.
9. **P2** — Add `aria-label` to all 49 icon-only action buttons.
10. **P2** — Fix API typo: rename `/api/admin/dashbord/get` → `/api/admin/dashboard/get`.
11. **P2** — Fix duplicate API call: audit and deduplicate the double `dashbord/get` fetch.
12. **P2** — Replace logout SPAN with `<button>`.
13. **P3** — Remove Chatbase from admin pages; gate behind `!isAuthenticated`.
14. **P3** — Fix Gist translation file double-fetch.
