# AI Widget Builder — QA Bug Report
**Date:** 2026-05-06  
**Feature:** My Widgets › Create Widget › "Build with AI" chatbox  
**Environment:** Docker WordPress (`localhost:8881`) · WDesignKit plugin (local build) · Playwright `plugin-desktop` project  
**Test spec:** `tests/plugin/ai-widget-builder.spec.js`  
**Test run summary:** 7 passed · 98 failed (all failures trace to Bug #1 below)

---

### "Build with AI" trigger button absent from widget builder

**Severity:** P1  
**Area:** Functionality

**Issue:** After creating a widget and landing in the widget builder (`#/widget-listing/builder/<id>`), the "Build with AI" floating trigger button (`.ai-chatbox-trigger`) is completely absent from the DOM. No AI Widget Builder entry point is rendered under any condition — the element is never inserted into the page, not merely hidden.

**Steps to Reproduce:**
1. Log in to WordPress admin as `admin`
2. Inject valid WDesignKit JWT into `localStorage['wdkit-login']`
3. Navigate to `wp-admin/admin.php?page=wdesign-kit#/widget-listing`
4. Click "Create Widget", enter an alphanumeric name (e.g. `TestWidget1`), click Confirm
5. Wait for redirect to `#/widget-listing/builder/<widget-id>`
6. Inspect the DOM: search for any element with class `ai-chatbox-trigger` or `ai-chatbox`

**Expected Result:** A floating "Build with AI" button appears in the bottom-right corner of the widget builder, allowing users to open the AI chatbox and generate widget code via AI.

**Actual Result:** No `.ai-chatbox-trigger` element exists anywhere in the DOM. The builder shows only the standard toolbar buttons: Push, Save, HTML, Preview. The entire AI Widget Builder feature surface is unreachable.

**Impact:** 99 of 105 automated tests are blocked by this single issue (all AI chatbox interaction tests, strict mode tests, model selector tests, security nonce tests, accessibility tests, and responsive tests). Only widget-creation tests and code quality gate tests pass.

**Suspected Root Cause:** The Vue component that renders the trigger (`src/widget-builder/chatbox/ai-chatbox.js`) likely has a conditional guard that prevents mounting when the WDesignKit SaaS API is unreachable (local Docker test environment does not run the API server on port 8007). If confirmed, the fix is to always render the trigger and surface a clear "service unavailable" state when the API is down — rather than silently hiding the entire feature entry point.

---

### Widget creation fails with HTTP 500 when upload directory is owned by root

**Severity:** P2  
**Area:** Functionality / Environment Setup

**Issue:** On a fresh Docker environment, the `wp-content/uploads/wdesignkit/` directory is owned by `root` instead of `www-data`. Every widget-create AJAX call (`action=get_wdesignkit&type=wkit_create_widget`) returns HTTP 500, making it impossible to create any widgets until permissions are manually fixed.

**Steps to Reproduce:**
1. Start the Docker WordPress environment (`wdkit_wp` container)
2. Log in to WP admin and navigate to WDesignKit widget listing
3. Click "Create Widget", enter a name, click Confirm
4. Observe HTTP 500 response from `admin-ajax.php`
5. On the container: `ls -la /var/www/html/wp-content/uploads/wdesignkit/` — owner shows `root`

**Expected Result:** Widget creation succeeds and redirects to the widget builder.

**Actual Result:** PHP file-write fails (web server runs as `www-data` but directory owned by `root`), AJAX returns 500, modal does not close, no builder redirect occurs.

**Fix / Workaround:**
```bash
docker exec wdkit_wp chown -R www-data:www-data /var/www/html/wp-content/uploads/wdesignkit/
```

**Recommendation:** Add this `chown` step to the Docker entrypoint or Dockerfile so the directory is always writable by `www-data` on container startup. Alternatively, create the directory with correct ownership at plugin activation time via PHP.

---

### Widget name validation silently rejects special characters with no user guidance

**Severity:** P3  
**Area:** UI / Logic

**Issue:** The "Create Widget" modal validates widget names on the client side and only enables the Confirm button when the name contains exclusively letters and digits. However, there is no inline error message or placeholder hint explaining this constraint — the button simply remains disabled with no feedback when the user types a dash, underscore, or space.

**Steps to Reproduce:**
1. Open the "Create Widget" modal (`#/widget-listing`)
2. Type a widget name containing a hyphen (e.g. `My-Widget`) in the name input
3. Observe the Confirm button state

**Expected Result:** Either (a) an inline validation error explains the character restriction (e.g. "Only letters and numbers are allowed"), or (b) the input auto-sanitizes the name by replacing invalid characters.

**Actual Result:** The Confirm button remains permanently disabled and no feedback is shown. Users are left guessing why the button won't activate.

**Additional Note:** This validation is enforced purely client-side (Vue reactive guard). The server also enforces it. The UX gap is the absence of any error message.

---

### `beforeEach` wdkit token injection requires `.env` to be configured (silent no-op otherwise)

**Severity:** P3  
**Area:** Code Quality / Test Infrastructure

**Issue:** The `wdkitLogin()` helper in `tests/plugin/templates/_helpers/auth.js` silently returns `false` and skips token injection when `WDKIT_EMAIL` and `WDKIT_API_TOKEN` environment variables are not set. Without the token, the WDesignKit Vue app redirects to `#/login` and the widget listing never renders — causing all tests that call `createWidget()` to fail with "Create Widget button not found" rather than a meaningful error.

**Steps to Reproduce:**
1. Remove (or don't create) the `.env` file in the project root
2. Run `npx playwright test tests/plugin/ai-widget-builder.spec.js`
3. Observe: virtually all tests fail with `TimeoutError` on the "Create Widget" button

**Expected Result:** Test runner either (a) exits early with a clear config error ("WDKIT_API_TOKEN not set — plugin tests require WDesignKit auth"), or (b) the tests that require auth are skipped with a meaningful message.

**Actual Result:** All ~100 widget-dependent tests fail with a cryptic locator timeout (`locator 'button:has-text("Create Widget")' not found`) — the real cause (missing auth token) is invisible.

**Fix:** Add a guard in the test's global setup that checks for required env vars and throws a descriptive error if they are missing. The `.env.example` file (if one exists) should document `WDKIT_API_TOKEN` and `WDKIT_EMAIL` as required for plugin tests.
