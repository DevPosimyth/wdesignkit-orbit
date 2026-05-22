# Download Widget as a Plugin — QA Bug Report

**Feature:** Download Widget as WP Plugin  
**Page:** https://wdesignkit.com/admin/widgets/uploaded → three-dot menu → Download WP Plugin  
**API Base:** https://api.wdesignkit.com  
**Date:** 2026-05-18  
**QA Dimensions:** Functionality · Logic · Security · UI · Code Quality  

> **Testing method:** Server-side API testing via authenticated PHP requests. All 4 builders tested: Elementor, Gutenberg (Nexter), Bricks, Core Gutenberg. Docker WordPress (localhost:8881, WP 6.7, PHP 8.2) used for install verification.

---

## Popup / Dialog — All Fields

The "Download WP Plugin" dialog has **14 fields** split across two sections:

**Basic fields (always visible):**

| Field label | Form field name | Type |
|---|---|---|
| Plugin Name | `pluginName` | text — **required** |
| Licence URL | `licenceUrl` | text |
| Plugin Slug | `pluginSlug` | text |
| Plugin Prefix | `pluginPrefix` | text |
| Author Name | `authorName` | text |
| Author URL | `authorUrl` | text |
| Required PHP Version | `requiredPhpVersion` | text |
| Required WordPress Version | `requiredWpVersion` | text |
| contributors | `contributors` | textarea |
| Short Description | `shortDescription` | textarea |
| Select File | *(dropdown)* | dropdown |

**Advanced options (visible after toggling):**

| Field label | Form field name | Type |
|---|---|---|
| tags | `tags` | text |
| Text Domain | `textDomain` | text |
| FAQ | `faq` | text |
| Change Log | `changelog` | text |

---

## Summary

| Severity | Count |
|---|---|
| P1 — High | 3 |
| P2 — Medium | 7 |
| P3 — Low | 3 |
| **Total** | **13** |

## What PASSED

- All 4 builders (Elementor, Gutenberg, Bricks, Core Gutenberg) generate valid plugin ZIPs
- Authentication works correctly: no token → HTTP 401 "Token not provided"
- When filled, all basic fields appear correctly in the generated plugin header:
  - `pluginName` → `Plugin Name:` header ✅
  - `licenceUrl` → `License URI:` header ✅
  - `pluginSlug` → plugin folder and main filename ✅
  - `pluginPrefix` → PHP class names and PHP constants ✅
  - `authorName` → `Author:` header ✅
  - `authorUrl` → `Author URI:` header ✅
  - `requiredPhpVersion` → `Requires PHP:` header ✅
  - `requiredWpVersion` → `Requires at least:` header ✅
  - `contributors` → `Contributors:` header ✅
  - `shortDescription` → `Description:` header ✅
  - `textDomain` → `Text Domain:` header ✅
- Generated ZIP is a valid WordPress-installable archive
- Single plugin installs and activates on WordPress without fatal errors

---

### Plugin Slug and Prefix are optional but leaving them empty causes WordPress site crash

**Severity:** P1  
**Area:** Logic / Functionality

**Issue:** `pluginSlug` and `pluginPrefix` are optional fields in the dialog, but they are critical for uniqueness. When left empty:
- The plugin folder defaults to `my-plugin/`
- PHP class names default to `Prefix_My_Plugin_Main`
- PHP constants default to `PREFIX_MY_PLUGIN_*`

A user who downloads two widgets as plugins without filling in the Slug and Prefix fields will install two plugins that share an identical folder name and identical PHP class/constant names. WordPress will throw a PHP fatal error — "Cannot declare class `Prefix_My_Plugin_Main`, because the name is already in use" — and white-screen the entire site. This was confirmed on Docker WordPress 6.7, PHP 8.2.

**Steps to Reproduce:**
1. Go to https://wdesignkit.com/admin/widgets/uploaded
2. Click three-dot menu → Download WP Plugin on Widget A
3. Enter only a Plugin Name — leave Slug and Prefix empty — click Download
4. Repeat for Widget B with a different Plugin Name but still empty Slug and Prefix
5. Install and activate both on the same WordPress site

**Expected Result:** The UI marks `pluginSlug` and `pluginPrefix` as required, or auto-generates unique values from the plugin name. Alternatively, the server refuses to generate a ZIP with the default conflicting names.

**Actual Result:** Both ZIPs extract to `my-plugin/`, define the same `class Prefix_My_Plugin_Main`, and crash WordPress when both are active.

---

### `/api/widgets/list` returns HTTP 500 with raw SQL exception exposed

**Severity:** P1  
**Area:** Functionality / Security

**Issue:** The `POST /api/widgets/list` endpoint returns HTTP 500 with a raw Laravel SQL exception when standard pagination parameters (`page`, `perpage`, `limit`) are used. The error message exposes the full SQL query, table name (`kit_widgets`), column names, and database type (MariaDB). The underlying query has two defects: unquoted string values in `IN` clause (`status in (public, private)`) and a missing `LIMIT` clause making `OFFSET 0` a syntax error.

**Steps to Reproduce:**
1. Authenticate with a valid WDesignKit token
2. `POST https://api.wdesignkit.com/api/widgets/list` with body: `token=<jwt>&page=1&perpage=20`

**Expected Result:** HTTP 200 with paginated list, or HTTP 400 with a safe user-friendly error.

**Actual Result:** HTTP 500:
```json
{
  "message": "SQLSTATE[42000]: Syntax error ... SQL: select * from `kit_widgets` where `user_id` = 1318 and `status` in (public, private) order by `id` desc offset 0"
}
```

---

### Invalid or other-user widget ID accepted in plugin download — IDOR risk

**Severity:** P1  
**Area:** Security / Logic

**Issue:** `POST /api/v2/plugin/download/get` accepts any integer as `id` without verifying it belongs to the authenticated user. Passing `id=99999999` (nonexistent) returns HTTP 200 with a download URL. An attacker who knows another user's widget ID could call this endpoint directly, bypassing the ownership check present in `widget/builder/get`.

**Steps to Reproduce:**
1. Authenticate with a valid token
2. `POST https://api.wdesignkit.com/api/v2/plugin/download/get` with `id=99999999` and any `pluginName`, `php_file`, `widgetdata`

**Expected Result:** HTTP 403 or HTTP 404 — widget does not belong to this user.

**Actual Result:** HTTP 200 — ZIP created with the supplied content, no ownership validation.

---

### "Select File" dropdown shows two identical placeholder options

**Severity:** P2  
**Area:** UI / Functionality

**Issue:** The "Download WP Plugin" dialog contains a "Select File" dropdown in the basic section. Both dropdown options are labeled "Select File" — no actual file options are shown. The purpose of this dropdown is not explained anywhere in the UI (no label above it). Users cannot select anything meaningful, and it is unclear what this control is supposed to do (likely select which builder's files to include).

**Steps to Reproduce:**
1. Go to https://wdesignkit.com/admin/widgets/uploaded
2. Click three-dot menu → Download WP Plugin on any widget
3. Look for the "Select File" dropdown in the dialog
4. Open the dropdown

**Expected Result:** The dropdown shows meaningful options relevant to the file selection context (e.g., "Include CSS", "Include JS", or specific file names).

**Actual Result:** Both options read "Select File" — identical placeholder text with no function.

---

### `tags`, `faq`, and `changelog` fields silently discarded — no readme.txt generated

**Severity:** P2  
**Area:** Functionality / Logic

**Issue:** The "Advanced options" section collects `tags`, `faq`, and `changelog` values. These are standard WordPress plugin readme.txt fields. However, the generated ZIP contains no `readme.txt` file. The values from these three fields are accepted by the server but never used anywhere in the output. Users filling in these fields receive a plugin with no readme, making it non-compliant with WordPress.org submission standards.

**Steps to Reproduce:**
1. Download a widget as a plugin and fill in `tags`, `faq`, and `changelog` in the Advanced options
2. Download and extract the ZIP

**Expected Result:** A `readme.txt` is present in the ZIP containing the filled-in tags, FAQ, and changelog values.

**Actual Result:** No `readme.txt` in the ZIP. All three field values are discarded.

---

### ZIP filename collision possible when same slug used concurrently

**Severity:** P2  
**Area:** Logic / Functionality

**Issue:** The generated ZIP is named `{pluginSlug}_{unix_timestamp}.zip`. Two simultaneous download requests with the same slug in the same second produce the same filename. The second request overwrites the first on the server; the first user may download an incorrect file. When `pluginSlug` is not provided, all plugins are named `my-plugin_*.zip`, making same-second collisions certain.

**Steps to Reproduce:**
1. Two users (or the same user in parallel tabs) download a plugin with the same slug within the same second
2. Both requests return the same `download_url`
3. The first user downloads the second user's plugin content

**Expected Result:** ZIP filenames use a UUID or `{userId}_{widgetId}_{timestamp}` pattern, guaranteed unique.

**Actual Result:** Same-second requests share a filename. Confirmed: Elementor, Gutenberg, and Bricks requests all received `my-plugin_1779103005.zip` when triggered simultaneously.

---

### Empty plugin name accepted without server-side validation

**Severity:** P2  
**Area:** Logic / Functionality

**Issue:** The frontend validates that `pluginName` is not empty before submitting. The backend performs no such check. A direct API call with `pluginName=` (empty) succeeds and returns a ZIP where the `Plugin Name:` header is blank. In WordPress's Plugins list this plugin renders as an untitled entry with no identifier.

**Steps to Reproduce:**
1. `POST https://api.wdesignkit.com/api/v2/plugin/download/get` with `pluginName=` (empty string), valid token, valid widget ID

**Expected Result:** HTTP 400 — "Plugin name is required."

**Actual Result:** HTTP 200 — ZIP created with `Plugin Name:` blank in the header.

---

### XSS payload in plugin name written unescaped into PHP file

**Severity:** P2  
**Area:** Security / Code Quality

**Issue:** `pluginName` is not sanitized before being inserted into the PHP plugin header comment. Passing `<script>alert(1)</script>` results in that string appearing raw in `my-plugin.php`. If a WordPress admin panel or plugin scanner renders the plugin header without escaping, this becomes an XSS vector. The same risk applies to `authorName`, `authorUrl`, `licenceUrl`, and other string fields which are also written directly into the PHP file.

**Steps to Reproduce:**
1. `POST /api/v2/plugin/download/get` with `pluginName=<script>alert(1)</script>`
2. Download and open the generated ZIP
3. Read `my-plugin.php`

**Expected Result:** HTML tags are stripped or escaped before insertion into the plugin file.

**Actual Result:** `Plugin Name: <script>alert(1)</script>` appears verbatim in the PHP header.

---

### Default author fallback is a Posimyth developer's personal name

**Severity:** P2  
**Area:** UI / Code Quality

**Issue:** When the `authorName` field is left empty, the generated plugin defaults to `Author: Devang Vachheta` and `Contributors: Devang Vachheta`. This is a Posimyth developer's personal name used as a server-side fallback. Users who skip the Author Name field unknowingly publish a plugin attributed to someone else. The default should be a neutral placeholder (e.g., "Your Name") or the user's WDesignKit account name.

**Steps to Reproduce:**
1. Download any widget as a plugin — leave Author Name empty
2. Open the downloaded `my-plugin.php`

**Expected Result:** `Author:` is either blank, shows the user's WDesignKit account name, or uses a generic placeholder like "Your Name".

**Actual Result:** `Author: Devang Vachheta` and `Contributors: Devang Vachheta` appear in the plugin header.

---

### `pluginSlug` field label has no asterisk but empty value causes overwrite issues

**Severity:** P2  
**Area:** UI / Logic

**Issue:** `pluginSlug` is visually optional (no asterisk or "Required" label), yet leaving it blank causes the generated plugin folder to be named `my-plugin`, overwriting any previously downloaded plugin in WordPress's Upload Plugin flow. Users have no warning that this field is effectively required for safe multi-plugin usage.

**Steps to Reproduce:**
1. Download Widget A without entering a Plugin Slug → installs as `my-plugin/`
2. Download Widget B without entering a Plugin Slug → ZIP also contains `my-plugin/`
3. Upload Widget B via Plugins → Add New → Upload Plugin → WordPress overwrites Widget A silently

**Expected Result:** `pluginSlug` is marked required, or auto-populated from `pluginName` as a safe slug.

**Actual Result:** Field left empty silently defaults to `my-plugin` for all downloads. No warning shown.

---

### `pluginVersion` field missing from dialog — version always hardcoded as 1.0.0

**Severity:** P3  
**Area:** UI / Functionality

**Issue:** The generated plugin always contains `Version: 1.0.0` in the header. There is no `pluginVersion` field in the dialog, so users who release updates to their widget plugin have no way to increment the version from the WDesignKit UI. WordPress's "update check" mechanism compares version numbers — if users re-download and re-install the same widget they always get `1.0.0`, and WordPress does not detect it as an update.

**Steps to Reproduce:**
1. Download a widget as plugin → inspect `Version:` in header
2. Make changes to the widget, re-download → same `Version: 1.0.0`

**Expected Result:** A Version field in the dialog, or auto-increment logic.

**Actual Result:** Every generated plugin is `Version: 1.0.0` regardless of how many times the widget has been updated.

---

### Dialog description subtext is a generic placeholder

**Severity:** P3  
**Area:** UI

**Issue:** Below the "Plugin Information" dialog title, the subtitle reads: *"Make changes to your profile here. Click save when you're done."* This is generic placeholder text that references a profile page, not plugin download. It is not relevant to downloading a plugin.

**Steps to Reproduce:**
1. Go to https://wdesignkit.com/admin/widgets/uploaded
2. Click three-dot menu → Download WP Plugin
3. Read the subtitle text in the dialog

**Expected Result:** Contextual guidance such as "Fill in the plugin details below. Only Plugin Name is required."

**Actual Result:** "Make changes to your profile here. Click save when you're done."

---

### Default License URI points to posimyth.com — wrong for user-created plugins

**Severity:** P3  
**Area:** Code Quality

**Issue:** When `licenceUrl` is left empty, the plugin defaults to `License URI: https://posimyth.com/`. This URL is Posimyth's company website, not a license text. User-created plugins are not under Posimyth's license. The default should be a standard open-source license (e.g., `https://www.gnu.org/licenses/gpl-2.0.html`) or left blank.

**Steps to Reproduce:**
1. Download any widget as plugin — leave Licence URL empty
2. Check the `License URI:` value in `my-plugin.php`

**Expected Result:** `License URI: https://www.gnu.org/licenses/gpl-2.0.html` (GPL-2.0 default) or blank.

**Actual Result:** `License URI: https://posimyth.com/`
