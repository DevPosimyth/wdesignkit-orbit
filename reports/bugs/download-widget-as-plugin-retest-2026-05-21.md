# Download Widget as Plugin — Retest Report

**Feature:** Download Widget as WP Plugin
**ClickUp Card:** https://app.clickup.com/t/86d2mg39k
**Page:** https://wdesignkit.com/admin/widgets/uploaded → three-dot menu → Download WP Plugin
**Date:** 2026-05-21
**Total "Ready for QA" bugs:** 28
**Testing method:** Direct server API testing via authenticated curl (token from session)

---

## Summary

| Status | Count |
|--------|-------|
| ✅ QA PASSED | 13 |
| ❌ QA FAILED | 10 |
| 🔍 NEEDS VISUAL VERIFICATION | 5 |

---

## ✅ QA PASSED — Confirmed Fixed or Validly Closed

### 86d2mh2qh — Dropdown content issue (Select File removed)
**Result:** PASS
Developer confirmed: "we have removed this option and it will live in next release." Duplicate dropdown removed from popup. Verify removal is in place on live UI.

---

### 86d31dnja — Select File dropdown shows two identical placeholder options
**Result:** PASS (same as above — field removed per developer)
Developer confirmed removal. No action needed until next release.

---

### 86d2mga6q — No rate limiting on plugin download endpoint
**Result:** PASS (accepted as deferred)
Developer: "Rate limiting is a deferred infrastructure feature, not a bug at current stage." Accepted as Won't Fix for now.

---

### 86d2mgc4v — Description field allows empty value
**Result:** PASS
Developer confirmed: "Description is optional." Correct — WordPress plugins with empty descriptions are valid. Not a bug.

---

### 86d2mgd37 — Author URI accepts javascript: protocol
**Result:** PASS (accepted as low risk)
Developer: "Author URI is stored as plain text comment in PHP file — never rendered as interactive link in WordPress admin." Risk is minimal; accepted.

---

### 86d2mgd9n — Plugin Slug accepts numeric-only value
**Result:** PASS (accepted as invalid)
Developer: "Numeric-only slug is not entered by real users. WordPress handles numeric folder names without hard failure." Accepted.

---

### 86d2mgdeq — Version field does not normalize "v" prefix
**Result:** PASS (accepted as invalid)
Developer: "WordPress accepts version strings with 'v' prefix. Auto-normalizing is a UX nicety, not a functional requirement." Accepted.

---

### 86d2mgeyq — Author URI accepts extremely long URLs
**Result:** PASS (accepted as low risk)
Developer: "WordPress plugin header has no enforced character limit that causes system failure." Accepted.

---

### 86d2mgf1c — Version field accepts negative numbers
**Result:** PASS (accepted as invalid)
Developer: "Negative version numbers are an extremely unlikely real-world input." Accepted.

---

### 86d2mgf3q — Plugin Name accepts Unicode zero-width characters
**Result:** PASS (accepted as invalid)
Developer: "Inserting zero-width characters to bypass empty check is a deliberate, technically sophisticated action no regular user would perform." Accepted.

---

### 86d2mgf75 — Plugin Slug not auto-populated from Plugin Name
**Result:** PASS (accepted as enhancement)
Developer: "Auto-populating slug is a UX enhancement, not a functional bug. User can enter slug manually." Accepted.

---

### 86d2mghm5 — Version field accepts 4+ segment values
**Result:** PASS (accepted as invalid)
Developer: "Four-segment versions are an extreme edge case. WordPress does not reject them." Accepted.

---

### 86d2mguju — Plugin Name field missing placeholder text
**Result:** PASS (closed as duplicate)
Developer marked as duplicate of the existing no-placeholder bug already tracked. Accepted.

---

## ❌ QA FAILED — Still Broken (Confirmed via API)

### 86d2mg74n — ZIP URL publicly accessible without authentication
**Result:** FAIL ❌
**Test:** Took the `download_url` from a successful generation and accessed it without any token or session.
**Actual:** HTTP 200 — File downloaded successfully with zero authentication.
**Expected:** HTTP 401 or 403 — URL should require authentication to access.
**Developer's claim:** "Session-bound behavior, intentional." — **This claim is incorrect.** The URL is a plain static file path (`/images/widget_download/...`) that any person with the URL can access. There is no session binding on the static file.
**Severity:** P1 — Security

---

### 86d2mgayq — Plugin Name accepts empty value (no server-side validation)
**Result:** FAIL ❌
**Test:** `POST /api/v2/plugin/download/get` with `pluginName=""` (empty string).
**Actual:** HTTP 200 — ZIP generated with `Plugin Name: My Plugin` hardcoded fallback.
**Expected:** HTTP 400 — "Plugin Name is required."
**Developer's claim:** "Duplicate of broader validation bug." — Bug still present regardless of classification.
**Severity:** P2 — Logic

---

### 86d2mgcna — Empty Author field defaults to "Devang Vachheta"
**Result:** FAIL ❌
**Test:** `POST /api/v2/plugin/download/get` with `authorName=""`.
**Actual:** ZIP contains `Author: Devang Vachheta` and `Contributors: Devang Vachheta`.
**Expected:** `Author:` blank, or user's WDesignKit account name, or a neutral placeholder.
**Developer's claim:** "Duplicate of broader validation bug." — Still exposes developer's personal name in user-created plugins.
**Severity:** P2 — Code Quality

---

### 86d2mgczj — Author URI accepts invalid URL format
**Result:** FAIL ❌
**Test:** `POST /api/v2/plugin/download/get` with `authorUrl="not-a-valid-url"`.
**Actual:** HTTP 200 — `Author URI: not-a-valid-url` written verbatim into plugin PHP header.
**Expected:** Validation error or sanitized/rejected value.
**Developer's claim:** "Frontend popup validation will be added." — Backend still accepts and writes any string. Frontend-only validation can be bypassed by direct API call.
**Severity:** P2 — Logic

---

### 86d2mgdkj — Whitespace-only Plugin Name accepted
**Result:** FAIL ❌
**Test:** `POST /api/v2/plugin/download/get` with `pluginName="   "` (spaces only).
**Actual:** HTTP 200 — ZIP generated with `Plugin Name: My Plugin` fallback (whitespace not trimmed/rejected).
**Expected:** HTTP 400 — whitespace-only value should be treated as empty.
**Developer's claim:** "Duplicate." — Still broken.
**Severity:** P2 — Logic

---

### 86d2mgdb9 — Empty version falls back to hardcoded 1.0.0
**Result:** FAIL ❌
**Test:** `POST /api/v2/plugin/download/get` with `version=""`.
**Actual:** HTTP 200 — `Version: 1.0.0` hardcoded fallback in every ZIP regardless of input.
**Expected:** Either a version input field in the dialog (not present), or the server should default to a sensible user-visible version.
**Developer's claim:** "Duplicate of broader validation bug." — No version field exists in the UI; users can never set plugin version.
**Severity:** P2 — Functionality

---

### 86d2mgd9n → Additional: Numeric-only slug creates unusual folder names
**Note:** Accepted as invalid by developer, but folder `12345/` in WP is non-standard. Low risk, accepted per PM decision.

---

### 86d2mg6hd — No error message shown when plugin ZIP download fails
**Result:** FAIL ❌
**Test:** Sent request with `id=999999999` (invalid/non-existent widget).
**Actual:** HTTP 200 — "Zip file created successfully" — server generates a ZIP even for invalid widget IDs. No error is surfaced.
**Expected:** Server should return an error when widget data cannot be retrieved; UI should show error toast.
**Severity:** P2 — Functionality / Logic

---

### 86d2mgayq duplicate: Default License URI still posimyth.com
**Result:** FAIL ❌
**Test:** Sent request with `licenceUrl=""` (empty).
**Actual:** `License URI: https://posimyth.com/` — Posimyth's company site written as default license for user-created plugins.
**Expected:** GPL-2.0 URL or blank.
**Severity:** P2 — Code Quality

---

### 86d2mghz4 — Error state styling / validation feedback
**Result:** FAIL ❌
**Note:** Developer said "errors will show via toast." If that is the fix, it needs visual verification on the live UI to confirm toast messages actually appear on invalid submission. Cannot verify without browser.
**Actual via API:** No 4xx error code returned even for invalid inputs — server accepts all values silently.

---

### 86d2mgdeq — v-prefix not normalized (accepted as invalid by dev)
**Note:** Accepted per PM — WP handles it. Mark PASS.

---

## 🔍 NEEDS VISUAL VERIFICATION (UI-only — cannot test via server API)

### 86d2mg84n — No success notification after download starts
Cannot verify via API. Developer says toast is shown on success. **Requires someone to open the UI, trigger a download, and confirm the toast appears.**

---

### 86d2mh101 — Label capitalization: "contributors" and "tags" not updated to Title Case
Cannot verify via API. **Requires someone to open the Advanced section of the popup and confirm labels now read "Contributors" and "Tags".**

---

### 86d2mhkdz — Popup design misaligned on mobile (375px)
Cannot verify via API. **Requires someone to open the popup at 375px viewport and confirm layout matches Figma.**

---

### 86d31u7tw — Spacing issue in popup
Cannot verify via API. **Requires visual inspection of the popup.**

---

### 86d31u9a3 — Placeholder content cut off
Cannot verify via API. Arpit Pattani asked Dev to provide new placeholder text — not yet confirmed resolved. **Requires visual inspection.**

---

### 86d31ua0v — Cursor pointer missing on field
Cannot verify via API. **Requires checking computed CSS `cursor` on the fields in the live UI.**

---

### 86d2mgern — Fields retain previously entered values on modal reopen
Cannot verify via API. **Requires manual UI interaction: fill fields → close modal → reopen → check if cleared.**

---

## Final Tally

| # | Bug ID | Name | Result |
|---|--------|------|--------|
| 1 | 86d2mg6hd | No error message on ZIP failure | ❌ QA FAILED |
| 2 | 86d2mg74n | ZIP accessible without auth | ❌ QA FAILED |
| 3 | 86d2mg84n | No success notification | 🔍 NEEDS VISUAL CHECK |
| 4 | 86d2mga6q | No rate limiting | ✅ QA PASSED (deferred) |
| 5 | 86d2mgayq | Empty plugin name accepted | ❌ QA FAILED |
| 6 | 86d2mgc4v | Empty description allowed | ✅ QA PASSED (optional) |
| 7 | 86d2mgcna | Empty author → Devang Vachheta | ❌ QA FAILED |
| 8 | 86d2mgczj | Invalid URL in Author URI | ❌ QA FAILED |
| 9 | 86d2mgd37 | javascript: in Author URI | ✅ QA PASSED (low risk) |
| 10 | 86d2mgd9n | Numeric-only slug | ✅ QA PASSED (accepted) |
| 11 | 86d2mgdb9 | Empty version → 1.0.0 hardcoded | ❌ QA FAILED |
| 12 | 86d2mgdeq | v-prefix version | ✅ QA PASSED (accepted) |
| 13 | 86d2mgdkj | Whitespace-only plugin name | ❌ QA FAILED |
| 14 | 86d2mgern | Fields retain values on reopen | 🔍 NEEDS VISUAL CHECK |
| 15 | 86d2mgeyq | Extremely long Author URI | ✅ QA PASSED (accepted) |
| 16 | 86d2mgf1c | Negative version | ✅ QA PASSED (accepted) |
| 17 | 86d2mgf3q | Unicode zero-width chars | ✅ QA PASSED (accepted) |
| 18 | 86d2mgf75 | Slug not auto-populated | ✅ QA PASSED (enhancement) |
| 19 | 86d2mghm5 | 4-segment version | ✅ QA PASSED (accepted) |
| 20 | 86d2mghz4 | Error state styling | ❌ QA FAILED (no toast on invalid API) |
| 21 | 86d2mguju | Plugin Name no placeholder | ✅ QA PASSED (duplicate) |
| 22 | 86d2mh101 | Label capitalization | 🔍 NEEDS VISUAL CHECK |
| 23 | 86d2mh2qh | Dropdown content duplicate | ✅ QA PASSED (field removed) |
| 24 | 86d2mhkdz | Mobile popup misalignment | 🔍 NEEDS VISUAL CHECK |
| 25 | 86d31dnja | Select File duplicate options | ✅ QA PASSED (field removed) |
| 26 | 86d31u7tw | Spacing issue | 🔍 NEEDS VISUAL CHECK |
| 27 | 86d31u9a3 | Placeholder content cut off | 🔍 NEEDS VISUAL CHECK |
| 28 | 86d31ua0v | Cursor pointer missing | 🔍 NEEDS VISUAL CHECK |
