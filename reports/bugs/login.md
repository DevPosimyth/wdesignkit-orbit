# WDesignKit Plugin — Login Page Bug Report

**Plugin Version:** 2.2.10
**Environment:** WordPress 6.7-php8.2 · Docker localhost:8881
**Test Date:** 2026-04-28
**Tested By:** QA Automation — Playwright (plugin-desktop)
**Test File:** `tests/plugin/login.spec.js`
**Result:** 12 bugs found · 52 tests passed

---

### Social login "Continue with Google" link has no href — dead link

**Severity:** P1
**Area:** Functionality

**Issue:** The "Continue with Google" button is an `<a>` element with no `href` attribute. Clicking it produces no action — no OAuth redirect, no navigation, nothing. The button appears functional to users but is completely broken.

**Steps to Reproduce:**
1. Navigate to the WDesignKit plugin page while logged out of WDesignKit
2. Observe the login panel (email/password form)
3. Click "Continue with Google" in the social login section

**Expected Result:** User is redirected to Google OAuth screen to authenticate

**Actual Result:** Nothing happens — the `<a>` element has `href="null"`, no click event redirects the user anywhere

---

### Social login "Continue with Facebook" link has no href — dead link

**Severity:** P1
**Area:** Functionality

**Issue:** The "Continue with Facebook" button is an `<a>` element with no `href` attribute (value is null). Identical issue to Google — the button is visible and styled correctly but produces zero action when clicked.

**Steps to Reproduce:**
1. Navigate to the WDesignKit plugin login panel
2. Scroll to the social login buttons section
3. Click "Continue with Facebook"

**Expected Result:** User is redirected to Facebook OAuth screen to authenticate

**Actual Result:** Nothing happens — `href="null"` on the anchor element, no redirect occurs

---

### Forgot password — no visible feedback after submitting a valid email

**Severity:** P1
**Area:** Functionality

**Issue:** When a user enters a valid email address in the Forgot Password form and clicks the submit button, no response is shown. There is no success message, no "email sent" notification, no error popup, and no visual state change. The user has no way to know whether their request was processed.

**Steps to Reproduce:**
1. On the login panel, click "Forgot Password?"
2. Enter a valid email address (e.g. test@example.com)
3. Click the submit button
4. Wait up to 20 seconds

**Expected Result:** A notification or message appears confirming the request was received (e.g. "Reset link sent" or "Email not found")

**Actual Result:** No popup, no notification, no visual response — the form appears frozen

---

### Login panel does not reappear after session token is cleared

**Severity:** P1
**Area:** Logic

**Issue:** When the WDesignKit localStorage session token is removed (simulating a logout), navigating back to the plugin page fails to render the login panel. The WordPress admin page loads but the React app does not re-mount the authentication screen. Users who log out cannot log back in without a full browser refresh.

**Steps to Reproduce:**
1. Open the WDesignKit plugin page
2. Clear all `wdkit-*` and `wkit-*` keys from localStorage
3. Navigate to `/wp-admin/admin.php?page=wdesign-kit`
4. Wait for the page to load

**Expected Result:** The WDesignKit React app mounts and displays the login panel

**Actual Result:** WordPress admin page loads but `#wdesignkit-app` does not render the login UI — panel is absent

---

### Wrong credentials popup shows misleading "Are you new?" message

**Severity:** P2
**Area:** Logic / UX

**Issue:** When an existing user enters wrong credentials (incorrect password), the error popup says "Are you logging in to WDesignKit for the first time?" with two buttons: "Yes, I'm new" and "No, I forgot my password." This is deeply confusing — the user entered the wrong password, not a first-time registration attempt. The message misdirects returning users away from the actual problem.

**Steps to Reproduce:**
1. On the login panel, enter a registered email with an incorrect password
2. Click "Log in"
3. Observe the popup that appears

**Expected Result:** Popup says something like "Incorrect email or password. Please try again." — clear and accurate

**Actual Result:** Popup text reads: *"Login Failed — Are you logging in to WDesignKit for the first time? Yes, I'm new / No, I forgot my password"* — misleading messaging for a returning user who entered the wrong password

---

### Password input missing id attribute — WCAG 1.3.1 failure

**Severity:** P2
**Area:** Accessibility

**Issue:** The password `<input>` element in the login form has no `id` attribute. Without an `id`, no `<label>` element can be programmatically associated with it using `for="..."`. This violates WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) and prevents screen readers from announcing the field label when the input receives focus.

**Steps to Reproduce:**
1. Open the login panel
2. Inspect the password input element in browser DevTools
3. Check for the `id` attribute

**Expected Result:** Password input has an `id` attribute (e.g. `id="WDkitUserPassword"`) with a matching `<label for="WDkitUserPassword">Password</label>`

**Actual Result:** `id` attribute is absent (`id="null"`) — no label association possible

---

### Login form inputs not wrapped in a form element

**Severity:** P2
**Area:** Functionality / UX

**Issue:** The email and password inputs in the login panel are not contained within a `<form>` element. Without a semantic form wrapper, browser-native behaviors are broken: the browser will not prompt to save/autofill credentials, pressing Enter in the email field will not move focus to password, and password managers (LastPass, 1Password, Bitwarden, etc.) cannot detect or offer autofill.

**Steps to Reproduce:**
1. Open the login panel
2. Inspect `.wdkit-form-card` in DevTools
3. Check whether the inputs are wrapped in `<form>`

**Expected Result:** All login inputs (`<input>`, submit button) are inside a `<form>` element with appropriate `action` or event handling

**Actual Result:** No `<form>` element exists — inputs are placed directly in a `<div class="wdkit-form-card">`

---

### Email input has autocomplete="off" — blocks password managers

**Severity:** P2
**Area:** UX

**Issue:** The email `<input>` has `autocomplete="off"` explicitly set. This prevents all browser-native credential autofill, password managers (1Password, LastPass, Bitwarden, Dashlane), and the browser's own "save password" prompt from functioning. This is a direct usability regression for the majority of users who rely on password managers.

**Steps to Reproduce:**
1. Open the login panel
2. Inspect the email input element (`#WDkitUserEmail`) in DevTools
3. Check the `autocomplete` attribute value

**Expected Result:** `autocomplete="email"` or `autocomplete="username"` to allow password managers to fill the field

**Actual Result:** `autocomplete="off"` — autofill is actively blocked

---

### Password input has autocomplete="off" — blocks password managers

**Severity:** P2
**Area:** UX

**Issue:** The password `<input>` also has `autocomplete="off"`. This explicitly blocks password managers from filling the password field and disables the browser's "save this password?" prompt after login. Combined with the email field having the same issue, password manager users cannot use autofill on either field.

**Steps to Reproduce:**
1. Open the login panel
2. Inspect the password input in DevTools
3. Check the `autocomplete` attribute value

**Expected Result:** `autocomplete="current-password"` to allow password managers to fill the password

**Actual Result:** `autocomplete="off"` — password autofill is actively blocked

---

### Login form shows no inline validation error on empty submission

**Severity:** P2
**Area:** Functionality

**Issue:** Submitting the login form with empty email and password fields does not produce a visible inline validation error. The expected error indicator (`.wdkit-input-cover.wdkit-input-error`) is never rendered. The user receives no feedback that they have left required fields empty.

**Steps to Reproduce:**
1. Open the login panel
2. Leave both email and password fields completely empty
3. Click the "Log in" button

**Expected Result:** Inline error state appears on the empty field(s) — highlighted border, error message, or validation text

**Actual Result:** No visible validation error is rendered — form appears to silently fail with no user-facing feedback

---

### Login form shows no inline validation error on invalid email format

**Severity:** P2
**Area:** Functionality

**Issue:** Submitting the login form with a malformed email (e.g. "notanemail") does not trigger any visible inline validation error. The user receives no indication that the email format is invalid before the form attempts network authentication.

**Steps to Reproduce:**
1. Open the login panel
2. Enter "notanemail" (no @ symbol) in the email field
3. Enter any text in the password field
4. Click "Log in"

**Expected Result:** Inline validation error shown on the email field indicating the format is invalid

**Actual Result:** No inline validation error appears — the form proceeds without format validation feedback

---

### "Log in" button tap target is only 42px tall on mobile — below WCAG minimum

**Severity:** P3
**Area:** Accessibility / Responsive

**Issue:** At 375px viewport width (iPhone-class devices), the "Log in" button renders at 42px height. WCAG 2.1 Success Criterion 2.5.5 (Target Size) and Apple/Google mobile HIG both specify a minimum touch target height of 44px. At 42px, the button is undersized for reliable tap interaction on touch screens.

**Steps to Reproduce:**
1. Open the login panel on a 375×812 viewport (mobile)
2. Measure the rendered height of the "Log in" button

**Expected Result:** Button height is ≥ 44px to meet WCAG 2.5.5 and mobile tap target guidelines

**Actual Result:** Button renders at 42px height — 2px below the minimum requirement

---

## Summary

| # | Bug Title | Severity | Area |
|---|-----------|----------|------|
| 1 | Google social login link has no href — dead link | P1 | Functionality |
| 2 | Facebook social login link has no href — dead link | P1 | Functionality |
| 3 | Forgot password — no visible feedback after valid email submit | P1 | Functionality |
| 4 | Login panel does not reappear after session token is cleared | P1 | Logic |
| 5 | Wrong credentials popup shows misleading "Are you new?" message | P2 | Logic / UX |
| 6 | Password input missing id attribute — WCAG 1.3.1 failure | P2 | Accessibility |
| 7 | Login form inputs not wrapped in a form element | P2 | Functionality / UX |
| 8 | Email input has autocomplete="off" — blocks password managers | P2 | UX |
| 9 | Password input has autocomplete="off" — blocks password managers | P2 | UX |
| 10 | Login form shows no inline validation error on empty submission | P2 | Functionality |
| 11 | Login form shows no inline validation error on invalid email format | P2 | Functionality |
| 12 | "Log in" button tap target is only 42px on mobile — below WCAG minimum | P3 | Accessibility / Responsive |

**P1 (Critical):** 4 · **P2 (High):** 7 · **P3 (Medium):** 1
