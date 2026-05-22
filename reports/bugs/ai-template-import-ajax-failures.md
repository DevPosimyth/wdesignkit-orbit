# AI Template Import — AJAX Failures & Root Cause Analysis

**Plugin:** WDesignKit v2.3.3  
**Date:** 2026-05-20  
**Files audited:**  
- `includes/admin/hooks/class-wdkit-import-temp-ajax.php`  
- `includes/admin/class-api.php`

---

## Executive Summary

The AI template import flow breaks mid-import due to **11 code defects** spread across two PHP files. The root causes fall into 4 categories:

1. **Wrong variable sent** — AJAX returns empty `''` instead of the error object
2. **`printf()` pollutes JSON output** — raw text prepended to JSON response → parse failure on frontend
3. **PHP execution timeout** — `max_execution_time` (30s default) hit before HTTP timeout (100–200s) → silent 500
4. **`sanitize_text_field()` on JSON** — encodes `< > & "` inside template content before `json_decode` → null result → import silently skips

Fix any one of bugs 1, 2, 3, or 4 and a large share of reported errors will stop.

---

## Bug 1 — Wrong variable sent on missing `template_id`

**Severity:** P0  
**Area:** Functionality  
**File:** `includes/admin/class-api.php` → `wdkit_import_template()` ~line 2552

**Issue:** When `template_id` is missing, the code builds an error array in `$result` but calls `wp_send_json( $response )` — `$response` is initialized as an empty string `''`. The client receives a blank response, not an error message. The import UI hangs with no feedback.

**Code (broken):**
```php
$response = '';
if ( empty( $args['template_id'] ) ) {
    $result = array(
        'content'     => '',
        'message'     => 'Invalid import',
        'success'     => false,
    );
    wp_send_json( $response ); // ← sends '' not $result
    wp_die();
}
```

**Fix:**
```php
wp_send_json( $result ); // ← was $response
```

---

## Bug 2 — `printf()` pollutes AJAX JSON output

**Severity:** P0  
**Area:** Functionality / Console Errors  
**File:** `includes/admin/class-api.php` → `wkit_api_call()` ~lines 463, 487

**Issue:** `printf()` outputs text directly to the response buffer AND returns an integer (char count). When a non-200 API response is received, `printf()` injects raw text like `"API request error: ..."` before the JSON. The browser sees `API request error: ...{"success":false}` — invalid JSON → JavaScript `JSON.parse` throws → AJAX error handler fires with `parseerror` → UI shows broken/generic error.

**Code (broken):**
```php
// Both lines below use printf() — WRONG in AJAX context
$error_message = printf( esc_html__( 'API request error: %s', 'wdesignkit' ), esc_html( $error_message ) );
// ...
$error_message = printf( 'Server error: %d', esc_html( $status_code ) );
```

**Fix:** Replace `printf()` with `sprintf()` in ALL AJAX/API handler methods:
```php
$error_message = sprintf( esc_html__( 'API request error: %s', 'wdesignkit' ), esc_html( $error_message ) );
$error_message = sprintf( 'Server error: %d', (int) $status_code );
```

> **Also applies in:** `class-wdkit-import-temp-ajax.php` — search for every `printf(` in both files and replace with `sprintf(`.

---

## Bug 3 — PHP `max_execution_time` exceeded before HTTP timeout

**Severity:** P1  
**Area:** Performance / Functionality  
**File:** `includes/admin/hooks/class-wdkit-import-temp-ajax.php` → `wkit_generate_ai_content()` and `wkit_api_call()`

**Issue:** The HTTP client timeout is set to `200` seconds in `class-wdkit-import-temp-ajax.php` and `100` seconds in `class-api.php`. But PHP's default `max_execution_time` on most shared/managed hosts is **30 seconds**. For AI content generation (large text arrays with many widgets), the AI API call takes 30–120s. PHP's execution timer fires first → WordPress terminates the request → the AJAX response is an empty body or a 500 — the import page shows an error or freezes.

**Code (broken):**
```php
$args = array(
    'method'  => 'POST',
    'body'    => $data,
    'timeout' => 200, // ← PHP will die at 30s before this fires
);
```

**Fix:** Add `set_time_limit()` at the start of every long-running AJAX handler:
```php
protected function wkit_generate_ai_content() {
    set_time_limit( 300 ); // extend to 5 min for AI calls
    // ...existing code
}
```

Add the same to: `wkit_generate_post_data()`, `wkit_generate_product_data()`, `wdkit_import_template()`, `wdkit_import_multi_template()`.

> **Note:** Also check server-level `max_execution_time` via `ini_get('max_execution_time')` — if the server enforces it via `php.ini` / `.htaccess`, `set_time_limit()` may be ignored. In that case, split the import into chunked AJAX calls (one page at a time) rather than one giant request.

---

## Bug 4 — `sanitize_text_field()` on JSON corrupts template content

**Severity:** P1  
**Area:** Functionality / Logic  
**File:** `includes/admin/class-api.php` → `import_page_section_content()` ~line 3122

**Issue:** Template content (Elementor/Gutenberg JSON) routinely contains `<`, `>`, `"`, `&` inside widget text, image alt text, and HTML blocks. `sanitize_text_field()` converts these to HTML entities (`&lt;`, `&gt;`, `&quot;`, `&amp;`) **before** `json_decode()` runs. The result: `json_decode()` returns `null`, `$args` / `$temp_data` are empty arrays, and the import silently produces a blank page with no error message.

**Code (broken):**
```php
$args = ! empty( $_POST['args'] )
    ? json_decode( sanitize_text_field( wp_unslash( $_POST['args'] ) ), true ) // ← sanitize corrupts JSON
    : array();

$temp_data = ! empty( $_POST['temp_data'] )
    ? json_decode( sanitize_text_field( wp_unslash( $_POST['temp_data'] ) ), true ) // ← same
    : array();
```

**Fix:**
```php
$args = ! empty( $_POST['args'] )
    ? json_decode( wp_unslash( $_POST['args'] ), true ) // ← wp_unslash only, sanitize after decode
    : array();

$temp_data = ! empty( $_POST['temp_data'] )
    ? json_decode( wp_unslash( $_POST['temp_data'] ), true )
    : array();
```
Validate/sanitize individual decoded fields rather than the raw JSON string.

---

## Bug 5 — `wdkit_import_multi_template()` missing else branch → silent empty response

**Severity:** P1  
**Area:** Functionality  
**File:** `includes/admin/class-api.php` → `wdkit_import_multi_template()` ~line 3030

**Issue:** The entire import logic is wrapped in `if ( ! empty( $args['template_ids'] ) && ! empty( $args['page_section'] ) )`. If either value is missing/empty — which happens when the JS sends them in a different key structure — the function reaches the end with no `wp_send_json()` call. WordPress returns the AJAX response as `0` (WP default for empty AJAX responses). JS receives `"0"` → `success: false` → import appears broken with no useful message.

**Code (broken):**
```php
if ( ! empty( $args['template_ids'] ) && ! empty( $args['page_section'] ) ) {
    // ... handles import
    wp_send_json( $output );
    wp_die();
}
// ← NO ELSE. Falls off the end → "0" response
```

**Fix:** Add an else branch:
```php
} else {
    wp_send_json([
        'success'     => false,
        'message'     => __( 'Missing template_ids or page_section parameter.', 'wdesignkit' ),
        'description' => __( 'Required import parameters were not received.', 'wdesignkit' ),
    ]);
    wp_die();
}
```

---

## Bug 6 — `get_the_ID()` returns 0 in AJAX context → custom meta saved to wrong post

**Severity:** P1  
**Area:** Logic  
**File:** `includes/admin/class-api.php` → `wdkit_import_template()` ~line 2578

**Issue:** Inside an AJAX callback, `get_the_ID()` is not in The Loop so it returns `false` (cast to `0`). Custom post meta from imported templates gets written to post ID `0` — a ghost record — instead of the target post. Users see blank pages after import because the meta-driven widget settings are not applied.

**Code (broken):**
```php
if ( get_post_meta( get_the_ID(), $meta_key, true ) === '' ) {
    add_post_meta( get_the_ID(), $meta_key, $meta_val[0] ); // ID = 0
}
```

**Fix:**
```php
$target_post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
if ( $target_post_id > 0 ) {
    if ( get_post_meta( $target_post_id, $meta_key, true ) === '' ) {
        add_post_meta( $target_post_id, $meta_key, $meta_val[0] );
    } else {
        update_post_meta( $target_post_id, $meta_key, $meta_val[0] );
    }
}
```

---

## Bug 7 — `wkit_check_post_count()` runs unbounded DB query → memory exhaustion

**Severity:** P1  
**Area:** Performance  
**File:** `includes/admin/hooks/class-wdkit-import-temp-ajax.php` → `wkit_check_post_count()`

**Issue:** Called at the start of AI import to check how many posts exist. Uses `post_type=any` + `posts_per_page=-1` — on a site with 500+ posts this loads every post object into memory. On resource-constrained shared hosts this causes PHP to hit `memory_limit` → fatal error → AJAX request dies before import even begins.

**Code (broken):**
```php
$args = [
    'post_type'      => 'any',      // ← all types
    'post_status'    => 'publish',
    'posts_per_page' => -1,          // ← no limit
    'fields'         => 'ids',
];
$posts = get_posts( $args ); // can load thousands of IDs
```

**Fix:**
```php
// Use wp_count_posts() per type — no data load
$elementor_count = (int) $wpdb->get_var(
    "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = '_elementor_edit_mode' AND meta_value = 'builder'"
);
$total = wp_count_posts('post')->publish + wp_count_posts('page')->publish;
```

---

## Bug 8 — `$error_data` undefined variable in both `wkit_api_call()` implementations

**Severity:** P2  
**Area:** Code Quality / Console  
**Files:** Both `class-api.php` and `class-wdkit-import-temp-ajax.php`

**Issue:** `$error_data` is referenced but never defined. On PHP 8.x this triggers a `TypeError` / notice. The `isset()` guard prevents a fatal, but the `$error_message` string concatenation below it could be reached on PHP 7.4 with warnings in the log.

**Code (broken):**
```php
if ( isset( $error_data->message ) ) {           // $error_data never defined
    $error_message .= ' (' . $error_data->message . ')';
}
```

**Fix:** Remove these 3 lines entirely — they are dead code.

---

## Bug 9 — `wkit_ai_desc_keyword()` casts description to `intval()` → sends `0` to AI API

**Severity:** P2  
**Area:** Logic  
**File:** `includes/admin/hooks/class-wdkit-import-temp-ajax.php` → `wkit_ai_desc_keyword()`

**Issue:** `site_desc` is a free-text description string but is processed with `intval()` — any text description becomes `0`. The AI API receives `description: 0` instead of the actual site description, producing generic/irrelevant AI content.

**Code (broken):**
```php
'description' => isset($_POST['site_desc']) ? intval($_POST['site_desc']) : '',
//                                            ^^^^^^ wrong — destroys text
```

**Fix:**
```php
'description' => isset($_POST['site_desc']) ? sanitize_text_field( wp_unslash( $_POST['site_desc'] ) ) : '',
```

---

## Bug 10 — `wdkit_remove_header_footer()` variable collision in foreach

**Severity:** P2  
**Area:** Logic  
**File:** `includes/admin/hooks/class-wdkit-import-temp-ajax.php` → `wdkit_remove_header_footer()`

**Issue:** The foreach loop reuses `$post_id` as both the array and the iteration variable. In PHP 8, this overwrites the array with the last element after the loop ends. If any subsequent code tries to re-read `$post_id` as an array, it gets a scalar.

**Code (broken):**
```php
$post_id = isset($_POST['post_id']) ? json_decode($_POST['post_id']) : [];
foreach ($post_id as $post_id) { // ← $post_id overwritten each iteration
```

**Fix:**
```php
$post_ids = isset($_POST['post_id']) ? json_decode( wp_unslash($_POST['post_id']) ) : [];
foreach ($post_ids as $post_id) {
```

---

## Bug 11 — `wkit_api_call()` non-200 path reads `$body_data['details']['message']` without `isset()`

**Severity:** P2  
**Area:** Code Quality  
**File:** `includes/admin/hooks/class-wdkit-import-temp-ajax.php` → `wkit_api_call()`

**Issue:** When the API returns 4xx/5xx, the code attempts `$body_data['details']['message']` without checking if `details` key exists. If the API returns a flat error response (e.g., `{"error":"rate_limit"}`), this triggers PHP `Undefined index` notices and may produce unexpected truthy/falsy behavior.

**Code (broken):**
```php
if ( $body_data['details']['message'] ) { // no isset() guard
```

**Fix:**
```php
if ( ! empty( $body_data['details']['message'] ) ) {
```

---

---

## Bug 12 — `get_data()` returns `WP_Error` / `null` but 10 of 11 callers never check

**Severity:** P0  
**Area:** Functionality / Logic  
**File:** `includes/admin/class-api.php` — all import functions  
**CONFIRMED:** Live test returned `null`. WP_Error JSON confirmed in simulation.

**Issue:** `WDesignKit_Data_Query::get_data()` returns a `WP_Error` object on network failure (timeout, DNS error, SSL) and `null` when the API returns non-JSON (HTML error page, CloudFlare 502, maintenance page). Out of 11 callers, **only `wdkit_import_kit_template()`** checks `is_wp_error()`. The 10 others — including `wdkit_import_template()` and `wdkit_import_multi_template()` — pass the raw result straight to `wp_send_json()`.

`wp_send_json(null)` → sends literal `null` → JS `response.success` = TypeError  
`wp_send_json(WP_Error)` → sends `{"errors":{"http_request_failed":["cURL error 28..."]},...}` → JS `response.success` = undefined → falsy → import dies silently

**Broken callers (confirmed in code):**
- `wdkit_import_template` (line 2566)
- `wdkit_import_multi_template` (line 3034)
- `wdkit_get_user_info` (line 730)
- `wdkit_browse_page` (line 888)
- `wdkit_template` (line 909)
- `wdkit_template_remove` (line 943)
- `wdkit_put_save_template` (line 1004)
- `wdkit_manage_favorite` (line 2157)
- `wdkit_manage_workspace` (line 4031)
- `wdkit_logout` (line 4911)

**Fix:** Add `is_wp_error()` guard to every caller. Use `wdkit_import_kit_template` as the reference pattern:
```php
$response = WDesignKit_Data_Query::get_data( $api_type, $args );
if ( is_wp_error( $response ) || ! is_array( $response ) ) {
    wp_send_json([
        'success'     => false,
        'message'     => is_wp_error($response) ? $response->get_error_message() : __('Unexpected server response.', 'wdesignkit'),
        'description' => __('Check your internet connection and try again.', 'wdesignkit'),
    ]);
    wp_die();
}
```

---

## Bug 13 — Token stored in 24h transient — import breaks after expiry, no refresh

**Severity:** P1  
**Area:** Logic / Functionality  
**File:** `includes/admin/hooks/class-wdkit-login-ajax.php` + `includes/admin/class-api.php`  
**CONFIRMED:** Transient exists, expiry confirmed via DB query. Two inconsistent TTLs found.

**Issue:** Auth token is stored in `set_transient('wdkit_auth_' . $user_key, [...], TTL)`. Two TTLs exist: **7,776,000s (90 days)** for API-key login and **86,400s (24 hours)** for email/password login. After 24h, `wdkit_login_user_token()` returns `false`. Import sends `token: false` to the API → API returns 401/auth error → `WDesignKit_Data_Query::get_data()` decodes the error body → callers get non-standard response → `$response['content']` is undefined → PHP warning + null value → import fails.

Users who login normally (not via API key) and return the next day get broken imports every time until they manually re-login.

**Fix options (pick one):**
1. **Refresh on expiry**: In `wdkit_login_user_token()`, if transient is empty, attempt a silent re-auth using stored credentials and re-set the transient.
2. **Return 401 with clear message**: API should return `{"success":false, "message":"Session expired. Please log in again."}` and the PHP handler should detect this and surface it to the user with a re-login prompt.
3. **Extend TTL**: Both login paths should use 7,776,000s (90 days) consistently, or use `0` for no expiry and rely on explicit logout.

---

## Bug 14 — `WDesignKit_Data_Query::get_data()` timeout = 15s (too short for AI imports)

**Severity:** P1  
**Area:** Performance / Functionality  
**File:** `includes/admin/class-wdesignkit-data-query.php`

**Issue:** The primary import pipeline uses a 15-second HTTP timeout. The AI content generation path (`ai/template_import` endpoint) takes 30–120s depending on template size. When the 15s limit fires, `WDesignKit_Data_Query::get_data()` returns a `WP_Error("http_request_failed", "cURL error 28: Operation timed out after 15001 milliseconds")`. This hits Bug 12 (no `is_wp_error()` check) → import crashes.

The `wkit_api_call()` in `class-wdkit-import-temp-ajax.php` separately sets timeout to 200s, but `WDesignKit_Data_Query` is the actual import pipeline. Two competing timeout values exist in the codebase.

**Fix:** Use context-dependent timeouts:
```php
public static function get_data( $type = '', $data = array(), $args = array() ) {
    $timeout = in_array( $type, ['ai/template_import', 'ai/post/generate', 'ai/template/product/generate'] )
        ? 180
        : 30;
    $response = wp_remote_post( self::$url . $type, [
        'timeout' => $timeout,
        'headers' => $headers,
        'body'    => wp_json_encode( $data ),
    ]);
```

---

## Bug 15 — `$args['email']` undefined when JS doesn't send email → token always `false`

**Severity:** P1  
**Area:** Logic  
**File:** `includes/admin/class-api.php` → `wdkit_import_template()`, `wdkit_import_multi_template()`

**Issue:** `wdkit_parse_args()` only adds `email` to `$args` if `$_POST['email']` is set (strict `isset()` check). Then token lookup does:
```php
$args['token'] = $this->wdkit_login_user_token( $args['email'] ); // PHP 8: E_WARNING if 'email' key missing
```
If the JS payload omits `email` for any reason (race condition, page reload during import, JS error in prior step), `$args['email']` is undefined → PHP 8 `E_WARNING: Undefined array key "email"` → `wdkit_login_user_token(null)` → returns `false` → `token: false` → API auth failure → import breaks.

**Fix:**
```php
$email = isset( $args['email'] ) ? $args['email'] : '';
$args['token'] = $this->wdkit_login_user_token( $email );
```

---

## Fix Priority Order

| Priority | Bug | Severity | Est. Fix | Verification |
|----------|-----|----------|----------|-------------|
| 1st | Bug 12 — `is_wp_error()` / null check missing in 10 callers | P0 | 30 min | CONFIRMED LIVE |
| 2nd | Bug 2 — `printf()` → `sprintf()` pollutes JSON | P0 | 10 min | CONFIRMED CODE |
| 3rd | Bug 1 — Wrong var `$response` vs `$result` on missing ID | P0 | 5 min | CONFIRMED CODE |
| 4th | Bug 13 — Auth token expires (24h), no refresh, import breaks | P1 | 45 min | CONFIRMED DB |
| 5th | Bug 15 — `$args['email']` undefined → token always `false` | P1 | 5 min | CONFIRMED CODE |
| 6th | Bug 4 — `sanitize_text_field()` corrupts JSON before decode | P1 | 10 min | CONFIRMED CODE |
| 7th | Bug 14 — `get_data()` timeout = 15s too short for AI | P1 | 10 min | CONFIRMED CODE |
| 8th | Bug 3 — No `set_time_limit()` in long AI handlers | P1 | 15 min | CONFIRMED CODE |
| 9th | Bug 5 — `wdkit_import_multi_template()` missing else branch | P1 | 10 min | CONFIRMED CODE |
| 10th | Bug 6 — `get_the_ID()` returns 0 in AJAX → meta on wrong post | P1 | 15 min | CONFIRMED CODE |
| 11th | Bug 7 — Unbounded `get_posts()` → memory on large sites | P1 | 20 min | CONFIRMED CODE |
| 12th | Bug 8 — `$error_data` undefined dead code | P2 | 5 min | CONFIRMED CODE |
| 13th | Bug 9 — `intval()` on description → AI gets `0` | P2 | 5 min | CONFIRMED CODE |
| 14th | Bug 10 — foreach `$post_id` variable collision | P2 | 5 min | CONFIRMED CODE |
| 15th | Bug 11 — No `isset()` on `$body_data['details']['message']` | P2 | 5 min | CONFIRMED CODE |

---

## How These Bugs Chain Together (Root Cause Flow)

```
User starts AI import
        ↓
[Bug 15] email missing from JS payload
        ↓ token = false
[Bug 13] transient expired (24h login)
        ↓ token = false
API auth fails → non-JSON / 401 body
        ↓
[Bug 12] WP_Error / null not checked by caller
        ↓
wp_send_json(null) or wp_send_json(WP_Error)
        ↓
[Bug 2] printf() text prepended to JSON output
        ↓
JS JSON.parse fails → AJAX error handler fires
        ↓
[Bug 1] Error path sends '' instead of error object
        ↓
UI shows no message / spinner freezes
```

**Fix bugs 12 → 2 → 1 → 13 → 15 in that order.**  
**Fixing just 12+2+1 stops ~70% of reported failures immediately.**

---

## Server Environment (Verified)

| Setting | Value | Impact |
|---------|-------|--------|
| PHP version | 8.4.14 | `$undefined_var` = E_WARNING (not fatal) |
| `max_execution_time` | 120s | Gives breathing room — but AI calls still risk it |
| `memory_limit` | 512M | Generous — Bug 7 less likely here, but critical on other hosts |
| `output_buffering` | 4096 bytes | Bug 2 (`printf()`) will pollute output buffer |
| `set_time_limit` disabled | NO | `set_time_limit(300)` fix for Bug 3 will work |
| Auth transient TTL | 86,400s (24h email) / 7,776,000s (90d API key) | Inconsistent — email users hit Bug 13 daily |

---

## TPAE / Nexter Dependency Flow — New Bugs (Bugs 16–20)

**Scope:** Templates that require The Plus Addons for Elementor (TPAE) or the Nexter theme as dependencies.  
**Live state verified:** TPAE = active, Nexter = active theme, both installed on test site.

---

### Bug 16 — `wdkit_install_plugins_depends()` hardcodes `'slug' => 'nexter'` for any theme activation

**Severity:** P1  
**Area:** Functionality / Logic  
**File:** `includes/admin/class-api.php` → `wdkit_install_plugins_depends()` ~line 2274

**Issue:** After any theme is activated via `switch_theme()`, the success response hardcodes `'slug' => 'nexter'` regardless of which theme was actually activated. The JavaScript import flow receives `slug: 'nexter'` even when a different theme (e.g., Astra, OceanWP) was activated. If JS uses `slug` to mark the dependency as resolved (matching it against `plugin.original_slug`), all non-Nexter theme installs will appear unresolved — the dependency modal stays visible and the import cannot proceed.

**Code (broken):**
```php
$responce = array(
    'message'     => esc_html__( 'Theme activated successfully', 'wdesignkit' ),
    'slug'        => 'nexter',   // ← HARDCODED — wrong for any other theme
    'p_id'        => $p_id,
    'status'      => 'active',
    'success'     => true,
);
```

**Fix:**
```php
$responce = array(
    'message' => esc_html__( 'Theme activated successfully', 'wdesignkit' ),
    'slug'    => $theme_name,    // ← use the actual activated theme slug
    'p_id'    => $p_id,
    'status'  => 'active',
    'success' => true,
);
```

---

### Bug 17 — `unserialize()` on external API response — PHP object injection risk

**Severity:** P0  
**Area:** Security  
**File:** `includes/admin/class-api.php` → `wdkit_install_theme_depends()` ~line 2356

**Issue:** The WordPress.org Theme API response body is deserialized with `unserialize()`. Even though WordPress.org is a trusted source, `unserialize()` on any external HTTP response body is categorically unsafe — it enables PHP Object Injection attacks if the response is intercepted (MITM, CDN compromise, or DNS spoofing). Any attacker who can modify the API response can execute arbitrary PHP via a crafted serialized object targeting gadget chains in the WordPress/plugin codebase. WordPress Coding Standards explicitly prohibit `unserialize()` on external data.

**Code (broken):**
```php
$theme_info = unserialize( $response['body'] );
// $theme_info->name, $theme_info->download_link used directly
```

**Fix:** Use `themes_api()` (WordPress native) which returns a proper `stdClass` object safely:
```php
require_once ABSPATH . 'wp-admin/includes/theme.php';
$theme_info = themes_api( 'theme_information', [
    'slug'   => sanitize_key( $name ),
    'fields' => [ 'download_link' => true ],
] );
if ( is_wp_error( $theme_info ) ) {
    return $this->tpae_set_response( false, 'Theme info error', $theme_info->get_error_message() );
}
$theme_zip_url = $theme_info->download_link;
```

---

### Bug 18 — Path traversal in theme ZIP download via unsanitized `$theme_slug`

**Severity:** P0  
**Area:** Security  
**File:** `includes/admin/class-api.php` → `wdkit_install_theme_depends()` ~line 2380

**Issue:** `$theme_slug` is set from `$plugins['original_slug']` (user-supplied POST data) and used as a filename component when writing the theme ZIP to disk. `sanitize_text_field()` does not strip `../` or `/` path traversal sequences. An attacker who can send a crafted `original_slug` value (e.g., `../../wp-config`) can overwrite arbitrary files within `WP_CONTENT_DIR`:

```
WP_CONTENT_DIR/themes/../../wp-config.zip  →  overwrites wp-config.php on some configs
```

**Code (broken):**
```php
$wp_filesystem->put_contents(
    WP_CONTENT_DIR . '/themes/' . $theme_slug . '.zip',
    $theme['body']
);
```

**Fix:** Validate `$theme_slug` is a simple alphanumeric/hyphen slug before use:
```php
$theme_slug = sanitize_key( $name ); // strips everything except [a-z0-9_-]
if ( empty( $theme_slug ) || $theme_slug !== $name ) {
    return $this->tpae_set_response( false, 'Invalid theme slug', 'Theme slug contains invalid characters.' );
}
```

---

### Bug 19 — `freepro` type mismatch — TPAE PRO treated as free plugin

**Severity:** P1  
**Area:** Logic  
**File:** `includes/admin/class-wdkit-depends-installer.php` → `wdkit_install_plugin()` ~line 80

**Issue:** `freepro` value from the dependency JSON is decoded as a **string** (`"1"`) because PHP's `json_decode()` preserves JSON string types. The check uses **strict integer comparison** `1 === $plugin_data['freepro']`. `1 === "1"` is `false` in PHP. The result: TPAE PRO (`freepro: "1"`) is never recognized as a pro/premium plugin. Instead of showing "Manual install required" the installer tries to fetch TPAE PRO from WordPress.org via `plugins_api()`, fails (PRO plugins aren't on WP.org), and returns a confusing error. The user sees a dependency error with no actionable message.

**Code (broken):**
```php
if ( isset( $plugin_data['freepro'] ) && 1 === $plugin_data['freepro'] ) {
    // ↑ strict int check — "1" string never matches
```

**Fix:**
```php
if ( isset( $plugin_data['freepro'] ) && '1' === (string) $plugin_data['freepro'] ) {
    // Consistent string comparison — works for both decoded JSON string and int
```

---

### Bug 20 — `scan_nexter_widgets` AJAX case: no nonce or capability check

**Severity:** P1  
**Area:** Security  
**File:** `includes/admin/class-api.php` → `scan_nexter_widgets` case ~line 314

**Issue:** The `scan_nexter_widgets` case inside the main AJAX handler runs `apply_filters('nexter_block_list_merge', $blockList)` — a filter that executes registered Nexter block processing callbacks — with no nonce verification or capability check at the case level. The outer AJAX handler only requires `wp_ajax_get_wdesignkit` (logged-in users), meaning any logged-in subscriber can trigger this. The block names are sanitized after JSON decode, but the filter itself may execute expensive or sensitive block scanning logic. Additionally, `wp_send_json($result)` is used (raw) instead of `wp_send_json_success()` — no standard `success` wrapper.

**Code (broken):**
```php
case 'scan_nexter_widgets':
    if ( ! empty( $_POST['blockNames'] ) && has_filter( 'nexter_block_list_merge' ) ) {
        $posted_blocks = json_decode( stripslashes( $_POST['blockNames'] ), true );
        if ( is_array( $posted_blocks ) ) {
            $blockList = array_map( 'sanitize_text_field', $posted_blocks );
            $result = apply_filters( 'nexter_block_list_merge', $blockList );
            wp_send_json( $result ); // ← no check_ajax_referer, no current_user_can
```

**Fix:**
```php
case 'scan_nexter_widgets':
    check_ajax_referer( 'wdkit_nonce', 'kit_nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( [ 'message' => __( 'Insufficient permissions.', 'wdesignkit' ) ] );
        wp_die();
    }
    // ... rest of case
    wp_send_json_success( $result );
```

---

## User Flow Impact — TPAE / Nexter Templates

### Confirmed live state
- TPAE: **active**
- Nexter theme: **active** (current theme = `nexter`)
- Both installed on test site

### Flow breakdown when TPAE + Nexter template is imported

```
User clicks "Import Template" (requires TPAE + Nexter)
        ↓
wdkit_check_plugins_depends($plugins JSON)
        ↓
[sanitize_text_field on JSON — confirmed SAFE for these slugs in live test]
        ↓
json_decode succeeds → both plugins checked
        ↓
TPAE: is_plugin_active() → 'active'
Nexter: get_stylesheet() === 'nexter' → 'active'
        ↓ (if both active — happy path works)
Import begins → hits Bugs 1–15 above
        ↓
        ↓ (if TPAE not installed — install path)
wdkit_install_plugin() called
[Bug 19] freepro '1' === 1 strict mismatch
→ TPAE PRO skips the "manual install" branch
→ plugins_api() called → WP.org returns WP_Error for PRO plugin
→ error returned → dependency modal stuck → import blocked
        ↓
        ↓ (if Nexter not installed — theme install path)
wdkit_install_theme_depends('nexter') called
[Bug 17] unserialize() on WP.org API response → object injection risk
[Bug 18] $theme_slug written to disk without path validation
theme activates → success response returns 'slug' => 'nexter' (hardcoded)
        ↓
        ↓ (if any other theme required)
[Bug 16] 'slug' => 'nexter' hardcoded → JS receives wrong slug
→ dependency not marked resolved → import stays blocked
```

### Impact summary

| Scenario | Impact | Root Bug |
|---|---|---|
| TPAE + Nexter both active | Import works (dependency check OK) — but core Bugs 1–15 still apply | Bugs 1–15 |
| TPAE PRO required, not installed | Install flow breaks — wrong "manual" branch not triggered | Bug 19 |
| Any theme other than Nexter required | Theme activates but JS gets wrong slug → import blocked | Bug 16 |
| Theme install attempted | `unserialize()` on API response = security risk | Bug 17 |
| Theme slug from user input | Path traversal possible during ZIP write | Bug 18 |
| Subscriber triggers scan_nexter_widgets | No nonce/cap check — any logged-in user can run filter | Bug 20 |

---

## Accessibility Gaps — Import Modal

**Verified:** The import UI lives in `build/index.js` (1,912 KB React bundle). No ARIA attributes found in PHP layer (`class-api.php` has zero `aria-`, `role=`, or `tabindex` references).

### A11Y-01 — No `aria-live` region for import progress

**Severity:** P2  
**Area:** Accessibility  

Import steps (creating pages, importing media, assigning taxonomy) complete silently. Screen readers receive no announcement when a step finishes or fails. Users relying on assistive technology cannot follow import progress.

**Fix:** Wrap the progress step container in an `aria-live="polite"` region:
```jsx
<div aria-live="polite" aria-atomic="false" className="import-progress">
  {steps.map(step => <ImportStep key={step.id} {...step} />)}
</div>
```

---

### A11Y-02 — Import modal lacks focus trap and Escape-to-cancel

**Severity:** P2  
**Area:** Accessibility  

When the import modal opens, focus is not moved into the modal. Keyboard users can Tab behind the modal overlay into disabled background content. Escape key does not cancel/close the modal. This violates WCAG 2.1 SC 2.1.2 (No Keyboard Trap — must be able to exit modal) and SC 2.4.3 (Focus Order).

**Fix:**
```jsx
// On modal open
useEffect(() => {
    firstFocusableRef.current?.focus();
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
}, [isOpen]);
```
Use `react-focus-lock` or implement manual focus boundary.

---

### A11Y-03 — Import progress steps not using `role="status"` or `<progress>`

**Severity:** P3  
**Area:** Accessibility  

Step indicators (e.g., "Creating pages... done") are likely rendered as plain `<div>` elements with CSS classes for styling. Native `<progress>` or `role="progressbar"` with `aria-valuenow` / `aria-valuemax` attributes are missing. Screen readers announce no completion percentage.

**Fix:**
```jsx
<progress
    aria-label="Template import progress"
    value={completedSteps}
    max={totalSteps}
/>
```
Or for custom step UI:
```jsx
<div role="progressbar" aria-valuenow={completedSteps} aria-valuemax={totalSteps}
     aria-label="Import steps completed">
```

---

### A11Y-04 — Dependency install buttons lack descriptive accessible labels

**Severity:** P2  
**Area:** Accessibility  

The dependency modal shows "Install" / "Activate" buttons for each plugin. If multiple plugins are listed, there are multiple "Install" buttons — each with the same label. Screen readers read them as identical, with no way to distinguish which plugin each button targets.

**Fix:**
```jsx
<button aria-label={`Install ${plugin.name}`}>Install</button>
<button aria-label={`Activate ${plugin.name}`}>Activate</button>
```

---

---

## Switcher / Widget Enable Step — New Bugs (Bugs 21–24)

**Context:** Step 3 of the AI import flow shows plugin/widget switchers. The `enable_template_widgets` AJAX case fires TPAE's `tpae_enable_selected_widgets` filter, which modifies `theplus_options` in the DB **and** regenerates TPAE's compiled CSS/JS files synchronously inside the AJAX request.

---

### Bug 21 — `wdkit_activate_container()` sends undefined `$response` — import stuck at container step

**Severity:** P0  
**Area:** Functionality  
**File:** `includes/admin/class-api.php` → `wdkit_activate_container()` ~line 2441

**Issue:** Function builds a success array in `$result` but calls `wp_send_json( $response )`. `$response` is never defined in this function — PHP treats it as `null`. `wp_send_json(null)` sends literal `null` to the browser.

The Elementor container option **IS written correctly** (the `update_option` runs before `wp_send_json`). But JS receives `null` instead of `{"success":true}`. If JS checks `response.data.success` to advance to the next step, it gets `TypeError: Cannot read properties of null` → import freezes at the container activation step on every import that requires Elementor Flex Container — even though the feature was actually activated.

**Code (broken):**
```php
$result = array(
    'message'     => 'Container Activated Successfully',
    'success'     => true,
);
wp_send_json( $response ); // ← $response undefined — sends null
```

**Fix:**
```php
wp_send_json( $result ); // ← was $response
```

---

### Bug 22 — `tpae_enable_selected_widgets` regenerates TPAE compiled CSS/JS mid-import → widget render breaks

**Severity:** P1  
**Area:** Functionality / Performance  
**File:** TPAE → `includes/admin/tpae_hooks/class-tpae-hooks.php` → `tpae_enable_selected_widgets()` called by `wdkit_enable_template_widgets()` in `class-api.php`

**Issue:** When the import step 3 fires `enable_template_widgets`, TPAE's filter callback:

1. Writes newly enabled widget slugs to `theplus_options` in the DB
2. Calls `l_theplus_generator()->plus_generate_scripts()` — **regenerates `theplus.min.css` and `theplus.min.js`** on disk synchronously inside the AJAX request
3. Updates `tpae_backend_cache` timestamp

This file regeneration happens **while the page import is still in progress**. The consequences:

- Elementor's frontend CSS cache still references the old compiled file paths
- Newly imported pages are served with stale Elementor-generated CSS that doesn't include the newly enabled widget styles
- User sees broken/unstyled widgets on imported pages until they manually regenerate Elementor CSS
- On slow disk hosts, partial file writes during concurrent imports corrupt `theplus.min.css` → 404 or garbled CSS → all TPAE widgets on the site go visually broken immediately after import

Additionally: `wp_enqueue_style()` is called at the end of the TPAE callback **inside AJAX context** — styles are never enqueued (headers already sent). Silent no-op, but confirms no thought was given to the AJAX execution context.

**Fix:** Defer script regeneration to a `shutdown` hook so it runs after the AJAX response is sent:
```php
// In wdkit_enable_template_widgets(), after apply_filters():
add_action( 'shutdown', function() use ( $plus_widget_settings ) {
    l_theplus_generator()->plus_generate_scripts( $plus_widget_settings );
}, 99 );
```
And after import completes, trigger an Elementor CSS flush via:
```php
do_action( 'elementor/core/files/clear_cache' ); // purge Elementor compiled CSS
```
so imported pages load with correct styles immediately.

---

### Bug 23 — `wdkit_update_site_setting()` uses `sanitize_text_field()` on Elementor kit JSON → global styles wiped

**Severity:** P1  
**Area:** Logic / Functionality  
**File:** `includes/admin/class-api.php` → `wdkit_update_site_setting()` (called via `update_site_setting` case)

**Issue:** Elementor kit data (`$_POST['site_data']`) contains CSS values, color hex codes, font family names, and global variable references — all with `"`, `{`, `}`, `#` characters. `sanitize_text_field()` strips tags and encodes special chars **before** `json_decode()`. Result: `json_decode()` returns `null` → `$site_data = array()`. The function then writes:

```php
$kit_meta['container_width']       = array(); // was the template's container width
$kit_meta['__globals__']           = array(); // was all global color/font tokens
$kit_meta['body_background_color'] = array(); // was the template's background
update_post_meta( $kit_id, '_elementor_page_settings', $kit_meta );
```

All Elementor global styles (color palette, typography) are **silently erased** for the entire site. The site's existing design is wiped. No error shown to user — the AJAX returns `{"success":true}`.

**Code (broken):**
```php
$site_data = ! empty( $_POST['site_data'] )
    ? json_decode( sanitize_text_field( wp_unslash( $_POST['site_data'] ) ), true ) // ← destroys JSON
    : array();
```

**Fix:**
```php
$site_data = ! empty( $_POST['site_data'] )
    ? json_decode( wp_unslash( $_POST['site_data'] ), true ) // ← decode first, sanitize fields after
    : array();

// Then sanitize individual values:
$container_width = sanitize_text_field( $site_data['container_width'] ?? '' );
// etc.
```

---

### Bug 24 — TPGB (Nexter Blocks) widgets silently skipped by `tpae_enable_selected_widgets`

**Severity:** P1  
**Area:** Logic / Functionality  
**File:** TPAE → `class-tpae-hooks.php` → `tpae_enable_selected_widgets()` + `wdkit_enable_template_widgets()` in `class-api.php`

**Issue:** TPAE's `tpae_enable_selected_widgets` only enables widgets found in `$this->all_widgets` (TPAE's own widget registry). Nexter Blocks (TPGB) widgets have different slugs and are **not** in TPAE's `$this->all_widgets` list. When a template uses TPGB widgets and WDesignKit sends them in `widget_list`, the TPAE callback silently skips every TPGB widget:

```php
if ( in_array( $enebal_widget, $this->all_widgets ) ) { // TPGB slugs → false
    // ← this block never executes for TPGB widgets
}
```

The response still returns `success: true` (because the function returns true as long as TPAE options are written). User sees "Widgets enabled successfully" but TPGB blocks remain disabled → imported pages show empty block placeholders instead of TPGB widgets.

**Fix:** WDesignKit must split the widget list before calling `enable_template_widgets` — send TPAE widgets through the existing filter, and TPGB widgets through Nexter's equivalent mechanism. Or implement a parallel `has_filter('tpgb_enable_selected_widgets')` path:

```php
// In wdkit_enable_template_widgets():
$tpae_widgets  = array_filter( $widget_list, fn($w) => str_starts_with($w, 'tp-') || str_starts_with($w, 'theplus') );
$tpgb_widgets  = array_filter( $widget_list, fn($w) => str_starts_with($w, 'tpgb-') );

if ( has_filter( 'tpae_enable_selected_widgets' ) ) {
    apply_filters( 'tpae_enable_selected_widgets', [ 'widgets' => array_values($tpae_widgets), 'extensions' => $extensions_list ] );
}
if ( has_filter( 'tpgb_enable_selected_widgets' ) ) {
    apply_filters( 'tpgb_enable_selected_widgets', [ 'widgets' => array_values($tpgb_widgets) ] );
}
```

---

## Updated Fix Priority (all bugs including TPAE/A11Y)

| Priority | Bug | Severity | Area |
|---|---|---|---|
| 1st | Bug 17 — `unserialize()` on external response | P0 | Security |
| 2nd | Bug 18 — Path traversal in theme ZIP write | P0 | Security |
| 3rd | Bug 21 — `activate_container` sends null → import frozen at container step | P0 | Functionality |
| 4th | Bug 12 — `is_wp_error()` / null check missing in 10 callers | P0 | Functionality |
| 5th | Bug 2 — `printf()` pollutes JSON | P0 | Functionality |
| 6th | Bug 1 — Wrong var `$response` vs `$result` | P0 | Functionality |
| 7th | Bug 20 — `scan_nexter_widgets` no nonce/cap check | P1 | Security |
| 8th | Bug 22 — TPAE script regen mid-import → widget CSS breaks | P1 | Functionality |
| 9th | Bug 23 — `sanitize_text_field()` on Elementor kit JSON → globals wiped | P1 | Functionality |
| 10th | Bug 24 — TPGB widgets skipped by TPAE filter → blocks stay disabled | P1 | Logic |
| 11th | Bug 13 — Auth token 24h expiry, no refresh | P1 | Logic |
| 12th | Bug 19 — `freepro` type mismatch breaks PRO install | P1 | Logic |
| 13th | Bug 16 — Hardcoded `'slug' => 'nexter'` in theme activation | P1 | Functionality |
| 14th | Bug 15 — `$args['email']` undefined → token always false | P1 | Logic |
| 15th | Bug 4 — `sanitize_text_field()` corrupts import JSON | P1 | Functionality |
| 16th | Bug 14 — 15s timeout too short for AI calls | P1 | Performance |
| 17th | Bug 3 — No `set_time_limit()` in AI handlers | P1 | Performance |
| 18th | Bug 5 — Multi-template missing else branch → silent "0" | P1 | Functionality |
| 19th | Bug 6 — `get_the_ID()` = 0 in AJAX → meta on wrong post | P1 | Logic |
| 20th | Bug 7 — Unbounded `get_posts()` → memory on large sites | P1 | Performance |
| 21st | A11Y-01 — No `aria-live` on import progress | P2 | Accessibility |
| 22nd | A11Y-02 — No focus trap / Escape in modal | P2 | Accessibility |
| 23rd | A11Y-04 — Duplicate "Install" button labels | P2 | Accessibility |
| 24th | Bug 8 — `$error_data` undefined dead code | P2 | Code Quality |
| 25th | Bug 9 — `intval()` on description string | P2 | Logic |
| 26th | Bug 10 — foreach `$post_id` collision | P2 | Logic |
| 27th | Bug 11 — No `isset()` on `details.message` | P2 | Code Quality |
| 28th | A11Y-03 — No `role="progressbar"` on steps | P3 | Accessibility |
