# Site Cleanup Report — 2026-05-20

**Site:** https://wdesignkit.instawp.link  
**WP Version:** 6.9.4 · **PHP:** 8.4.7 · **Theme:** Bricks 2.2  
**Environment:** Production (InstaWP)  
**Performed by:** Claude Code / QA Orbit  

---

## Summary

Full web root inspection and cleanup. Removed **11 files/directories** including one critical-severity database exposure tool, 5 stale authentication bypass scripts, an abandoned IDE installation with credentials, and standard WordPress information-disclosure files. Cleared all caches.

**Web root entries before:** 30 → **After:** 19

---

## Deleted — Critical Security

### Adminer database tool exposed in web root

**Severity:** P0 — Critical  
**Area:** Security

**Issue:** `instawp-sql-253c3fe2b5.php` (489 KB) was an **Adminer** full-featured database management tool sitting in the public web root since **October 2023**. Anyone who discovered or guessed the URL had full read/write access to the entire WordPress database — posts, users, passwords, options, everything.

**Steps to Reproduce:**
1. Navigate to `https://wdesignkit.instawp.link/instawp-sql-253c3fe2b5.php`
2. Adminer login screen loads — no WordPress authentication required
3. Log in with DB credentials (obtainable from `wp-config.php` if readable)

**Expected Result:** File should not exist in the web root  
**Actual Result:** Full Adminer DB tool accessible to the public  
**Action taken:** File deleted ✅

---

### Stale InstaWP autologin bypass scripts (×5)

**Severity:** P1 — High  
**Area:** Security

**Issue:** Five `instawp-autologin-*.php` files were present in the web root. Each script, when visited, automatically logs in an administrator account without requiring any password. All five files were from August 2025 (9 months old). The InstaWP Connect plugin was **not active**, meaning these files were completely orphaned with no management layer.

| File | Last Modified |
|------|---------------|
| `instawp-autologin-1b4b404e57.php` | 2025-08-12 |
| `instawp-autologin-7a139c86c5.php` | 2025-08-12 |
| `instawp-autologin-85f09dc258.php` | 2025-08-12 |
| `instawp-autologin-68c5a16a0e.php` | 2025-08-12 |
| `instawp-autologin-a0d7ddc2ee.php` | 2025-08-19 |

**Steps to Reproduce:**
1. Visit any of the above URLs directly
2. WordPress admin session granted immediately with no credentials

**Expected Result:** Files should not exist; autologin managed exclusively by active InstaWP Connect plugin  
**Actual Result:** 5 open authentication bypass scripts accessible to anyone  
**Action taken:** All 5 files deleted ✅

---

### WPCodeBox IDE directory with credentials file in web root

**Severity:** P1 — High  
**Area:** Security

**Issue:** Directory `wpcodeboxide/` was present in the public web root containing PHP API endpoints, a frontend script, and — critically — a `core/credentials.php` file. This WPCodeBox IDE installation was outside `wp-content/plugins/` (not a registered WordPress plugin), last touched August 2025. InstaWP Connect plugin not active. The directory was fully abandoned but its files (especially the API and credentials) remained publicly accessible.

**Contents removed:**
- `wpcodeboxide/index.php` (empty guard file)
- `wpcodeboxide/core/credentials.php` (stored credentials)
- `wpcodeboxide/core/api.php` (exposed API endpoints)
- `wpcodeboxide/core/frontend.php`
- `wpcodeboxide/core/.DS_Store` (macOS metadata artifact)
- `wpcodeboxide/core/src/` (subdirectory)
- `wpcodeboxide/public/` (subdirectory)
- `wpcodeboxide/lib/` (subdirectory)

**Expected Result:** No IDE tooling or credentials outside wp-content in a production web root  
**Actual Result:** Abandoned IDE directory with credentials and API scripts accessible publicly  
**Action taken:** Entire directory deleted recursively ✅

---

## Deleted — Information Disclosure

### WordPress readme.html exposes version number

**Severity:** P2  
**Area:** Security

**Issue:** `readme.html` was present in the web root. This file explicitly states the installed WordPress version, which is useful for attackers targeting known CVEs.

**Action taken:** File deleted ✅

---

### wp-config-sample.php in production web root

**Severity:** P2  
**Area:** Security

**Issue:** `wp-config-sample.php` is not needed on a live site. Exposes WordPress directory structure and configuration format.

**Action taken:** File deleted ✅

---

### license.txt in production web root

**Severity:** P3  
**Area:** Security

**Issue:** `license.txt` is not needed on a live site. Exposes that the site runs WordPress and its version era.

**Action taken:** File deleted ✅

---

## Deleted — Cache & Temp Files

### .tmb thumbnail cache directory

**Severity:** P3  
**Area:** Performance

**Issue:** Hidden `.tmb/` directory in the web root had been accumulating server-generated thumbnail images since November 2021.

**Action taken:** Directory and contents deleted ✅

---

## Cache Cleared

| Cache Layer | Result |
|-------------|--------|
| Expired DB transients | 1 expired timeout row deleted |
| Orphaned DB transients | 15 orphaned value rows deleted |
| WordPress object cache | Flushed (`wp_cache_flush()`) |
| Elementor CSS cache | 1 cached CSS file cleared |

No cache plugin is currently active on the site. Bricks theme cache directory did not exist (already clean).

---

## What Was NOT Touched

| Item | Reason |
|------|--------|
| `wp-content/plugins/` | All plugins untouched |
| `wp-content/themes/` | All themes untouched |
| `wp-config.php` | Protected — core config |
| `.htaccess` | Protected — rewrite rules |
| WordPress database | Only expired/orphaned transients removed |
| All posts, pages, media | Untouched |
| `xmlrpc.php` | Standard WP core file — left as-is |

---

## Optional — Future Recommendation

**`xmlrpc.php`** — Still present. If XML-RPC is not needed (no Jetpack, no remote publishing clients), it can be disabled via `.htaccess` to reduce the attack surface. Not removed as it is standard WP core.

---

## Final Web Root State

Only standard WordPress core files remain:

```
wp-content/       ← plugins, themes, uploads (untouched)
wp-admin/         ← WP admin panel (untouched)
wp-includes/      ← WP core library (untouched)
.htaccess         ← rewrite rules
wp-config.php     ← site configuration
index.php         ← entry point
wp-login.php      ← login page
wp-blog-header.php
wp-comments-post.php
wp-cron.php
wp-load.php
wp-mail.php
wp-activate.php
wp-signup.php
wp-trackback.php
wp-links-opml.php
xmlrpc.php
robots.txt
```

**Status: Clean ✅**
