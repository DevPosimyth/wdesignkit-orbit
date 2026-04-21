# WDesignKit — Login Pages Bug Report

**Date:** 2026-04-21
**Audited By:** AI QA (Claude Code)
**Source:** `wdesignkit.zip` (build date: 2026-04-14)
**Pages Audited:** `/login` · `/login-api` · `/forgot_password` · `/signup` · Social Login (Google/Facebook)
**Files Reviewed:** `class-wdkit-login-ajax.php` · `class-api.php` · `build/index.js`

---

## Summary Table

| # | Priority | Page | Heading |
|---|---|---|---|
| 01 | 🔴 Critical | `/login` | Session cache deleted before read — fresh API call on every login |
| 02 | 🔴 Critical | `/login-api` | Undefined `$e_msg_login`/`$e_desc_login` — Fatal on empty token |
| 03 | 🔴 Critical | All login pages | `printf()` return stored as error — all API errors show integer |
| 04 | 🟠 High | `/forgot_password` | Wrong key `massage` — specific API errors never shown |
| 05 | 🟠 High | Social Login | Missing `success:true` in response — frontend login state not set |
| 06 | 🟠 High | `/login` → Signup | "Create Account" opens new tab — breaks SPA navigation |
| 07 | 🟡 Medium | `/signup` | Missing `wp_unslash()` — backslash passwords corrupted |
| 08 | 🟡 Medium | All login pages | `$error_data` undefined — PHP warning on every API error |
| 09 | 🟡 Medium | `/login-api` | `is_bool()` rejects truthy API responses — valid logins fail |
| 10 | 🟡 Medium | `/signup` | Wrong variable `$data` in switch — latent null response bug |

---

## BUG-01

| | |
|---|---|
| **Priority** | 🔴 Critical |
| **Heading** | Login Session Cache Always Destroyed Before Being Read |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — lines 109–111 |

### Issue
In `wdkit_login()`, `delete_transient()` is called on line 109 *before* `get_transient()` on line 111 with the same key. The cached session is unconditionally wiped before it can ever be checked, making `$get_login` permanently `false`. The entire "return cached session" code path (lines 128–137) is dead — every login attempt always triggers a fresh remote API call.

### Steps to Reproduce
1. Log in via email/password on the `/login` page
2. Log out (or clear session)
3. Log in again with the same credentials
4. Monitor network traffic — a fresh API call is always made, even for a recently authenticated user

### Expected
If a valid cached session exists (transient `wdkit_auth_*`), the plugin should return the cached token immediately without hitting the remote API. The `delete_transient` call on line 109 should be removed — it belongs only on logout, not on every login attempt.

---

## BUG-02

| | |
|---|---|
| **Priority** | 🔴 Critical |
| **Heading** | `$this->e_msg_login` / `$this->e_desc_login` Undefined — Fatal Error on Empty API Key Submit |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — lines 167–168 |

### Issue
`Wdkit_Login_Ajax::wdkit_api_login()` references `$this->e_msg_login` and `$this->e_desc_login` when an empty token is submitted. These properties are defined in `class-api.php` but `Wdkit_Login_Ajax` does **not extend that class** — it is a standalone class. On PHP 8.x this produces a Fatal `Uncaught Error`; on PHP 7.x it produces an undefined property Notice and an empty string in the error response. Either way the user gets a broken or empty error instead of the intended message.

### Steps to Reproduce
1. Navigate to `/login-api`
2. Leave the API key field blank and click Login
3. Observe: PHP error or broken JSON response returned instead of a proper error message

### Expected
User should see a clean, formatted JSON error: *"Login Error: Check your details and try again."*

---

## BUG-03

| | |
|---|---|
| **Priority** | 🔴 Critical |
| **Heading** | `printf()` Return Value Stored as Error Message — All Login API Errors Show an Integer |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — lines 388, 407 |

### Issue
In `wkit_api_call()`, error messages are built like this:

```php
$error_message = printf( esc_html__( 'API request error: %s', 'wdesignkit' ), esc_html( $error_message ) );
```

`printf()` **prints** to output and **returns an integer** (the number of characters output). Assigning its return value to `$error_message` means the error response `massage` key always contains a number (e.g., `42`), not a readable string. This affects all four login flows — email, API key, social, and forgot password — whenever the remote server is unreachable or returns a non-200 status.

### Steps to Reproduce
1. Configure the plugin with an unreachable or invalid server URL
2. Attempt any login (email, API key, social, or forgot password)
3. Inspect the AJAX response — the `massage` value will be an integer, not an error string

### Expected
Error response should contain the human-readable string, e.g.:
*"API request error: cURL error 6: Could not resolve host"*

---

## BUG-04

| | |
|---|---|
| **Priority** | 🟠 High |
| **Heading** | Forgot Password Never Shows API Error — Wrong Response Key `massage` vs `message` |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — lines 288–289 |

### Issue
`wdkit_forgot_password()` reads the API error message via `$response['massage']`. However the actual error key used by `wkit_api_call()` is also `'massage'` (a typo for "message"), while success details live under `'data'->message`. The inconsistency means that when the API returns a specific error (e.g., *"Email not registered"*), the value is not retrieved correctly and the code always falls back to the generic string *"Failed to send reset email. Please try again."* — hiding the actual reason from the user.

### Steps to Reproduce
1. Go to `/forgot_password`
2. Enter an email address not registered in WDesignKit
3. Click Reset
4. Observe: Generic fallback message shown instead of the specific API error

### Expected
The precise error returned by the API (e.g., *"This email is not associated with any account"*) should be displayed to the user.

---

## BUG-05

| | |
|---|---|
| **Priority** | 🟠 High |
| **Heading** | Social Login Success Response Missing `success: true` — Frontend Login State Not Set |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — `wdkit_social_login()` success result array |

### Issue
`wdkit_social_login()` returns on success:

```php
$result = array( 'data' => $response, 'token' => $user_token );
```

There is **no `'success' => true`** key. The failure path explicitly sets `'success' => false`. The frontend checks `response.data.success` to determine whether login completed. Without this key in the success response, the frontend cannot confirm the login and the user may remain on the login page or get stuck in a loading state after completing the Google/Facebook OAuth flow.

### Steps to Reproduce
1. On the login page, click the Google or Facebook social login button
2. Complete the OAuth flow in the popup
3. Observe: App may not redirect to the dashboard — loading spinner persists or user is shown the login screen again

### Expected
After a successful social login, the user should be redirected to the main WDesignKit dashboard automatically.

---

## BUG-06

| | |
|---|---|
| **Priority** | 🟠 High |
| **Heading** | "Create Account" Link Opens Signup in New Tab — Breaks SPA Navigation |
| **File** | `build/index.js` (login page component — `to:"/signup",target:"_blank"`) |

### Issue
On the `/login` page, the "Create Account" link is rendered with:

```js
to: "/signup", target: "_blank"
```

Since `/signup` is an internal SPA route (React router), `target="_blank"` opens a new browser tab. The new tab loads the full app shell fresh, losing all existing state, store context, and any redirect parameters. This is incorrect behaviour for an SPA link — `target="_blank"` should only be used for external URLs.

### Steps to Reproduce
1. Open the WDesignKit login page
2. Click **"Create Account"**
3. Observe: A new browser tab opens instead of navigating to the signup view within the same app

### Expected
Clicking "Create Account" should navigate within the same SPA to the `/signup` route — same tab, same app context, no new tab.

---

## BUG-07

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **Heading** | Signup Form Missing `wp_unslash()` — Passwords with Backslashes Get Corrupted |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — lines 312–314 |

### Issue
`wdkit_user_signup()` sanitizes POST fields without first calling `wp_unslash()`:

```php
$username      = sanitize_text_field( $_POST['username'] );
$user_password = sanitize_text_field( $_POST['password'] );
$user_email    = sanitize_email( $_POST['email'] );
```

WordPress magic-quotes `$_POST` data. Without `wp_unslash()`, backslashes in passwords or names are doubled before being sent to the remote API (e.g., `Pass\word1` becomes `Pass\\word1`). The same `wdkit_login()` function correctly uses `wp_unslash()`. The result: users whose passwords contain `\`, `'`, or `"` can sign up successfully but cannot log in with the same credentials.

### Steps to Reproduce
1. Go to `/signup`
2. Enter a password containing a backslash, e.g., `Test\Pass1!`
3. Complete registration
4. Go to `/login` and log in with the same credentials
5. Observe: Login fails — credentials do not match due to corrupted password

### Expected
Password and name fields should be unslashed before sanitization, consistent with the behaviour in `wdkit_login()`.

---

## BUG-08

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **Heading** | `$error_data` Undefined Variable in `wkit_api_call()` — PHP Warning on Every API Error |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — line 409 |

### Issue
In the non-200 error handling path of `wkit_api_call()`:

```php
if ( isset( $error_data->message ) ) {
    $error_message .= ' (' . $error_data->message . ')';
}
```

`$error_data` is never declared anywhere in `wkit_api_call()`. This generates a `PHP Warning: Undefined variable $error_data` on every failed API call across all login endpoints. The code is entirely dead — the intent was to decode the API response body and append its error message, but the response body is never parsed in this path.

### Steps to Reproduce
1. Make any login call where the server returns a 4xx or 5xx response
2. Check the PHP error log
3. Observe: `PHP Warning: Undefined variable $error_data in class-wdkit-login-ajax.php on line 409`

### Expected
No PHP warnings. If the API returns an error body with a message, it should be decoded and appended to the error string.

---

## BUG-09

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **Heading** | API Login `is_bool()` Check Rejects Valid Truthy API Responses — Valid Logins Fail |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — `wdkit_api_login()` success check |

### Issue
The success check in `wdkit_api_login()`:

```php
$success = ! empty( $response['success'] ) ? is_bool( $response['success'] ) : false;
```

`is_bool()` returns `true` only for actual PHP booleans. If the remote server returns `"success": 1` or `"success": "true"` — both common in REST APIs — then `is_bool(1)` and `is_bool("true")` both return `false`, causing the login to fail even when the server confirmed success. The correct check is simply:

```php
$success = (bool) ( $response['success'] ?? false );
```

### Steps to Reproduce
1. Go to `/login-api`
2. Enter a valid API key
3. If the API server returns `"success": 1` (integer) rather than `"success": true` (boolean)
4. Observe: Login fails with an error message despite valid credentials and a positive API response

### Expected
Any truthy value (`true`, `1`, `"true"`) for the `success` field in the API response should be treated as a successful login.

---

## BUG-10

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **Heading** | Signup Assigned to `$data` in Switch — Inconsistent Variable Causes Latent Null Response |
| **File** | `includes/admin/hooks/class-wdkit-login-ajax.php` — line 91 |

### Issue
In the main switch in `wp_wdkit_login_ajax_call()`, every case stores the result to `$response` — except signup:

```php
case 'wdkit_user_signup':
    $data = $this->wdkit_user_signup();  // ← $data, not $response
    break;
```

After the switch, `wp_send_json( $response )` is called. For signup, `$response` is `null` or undefined at that point. Because `wdkit_user_signup()` currently calls `wp_die()` internally, this does not cause a double-send in practice. However if the function is ever refactored to `return` a value instead of calling `wp_die()` (which is the correct PHP practice for testability), the outer `wp_send_json( $response )` will silently send `null` as the signup response — a latent bug that will surface during any future refactor.

### Steps to Reproduce
1. Refactor `wdkit_user_signup()` to `return $response` instead of calling `wp_send_json()` and `wp_die()` directly
2. Trigger a signup
3. Observe: `null` / empty JSON sent as the signup response

### Expected
The signup case should assign its return value to `$response`, consistent with all other cases in the switch statement.

---

*Report generated by AI QA — WDesignKit Login Pages Audit · 2026-04-21*
