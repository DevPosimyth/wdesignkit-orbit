# Evergreen Security Log — WDesignKit

> Security doesn't stand still. This file is the living record of WordPress plugin
> attack patterns relevant to WDesignKit — researched, shipped defenses for, and
> continuously monitored.

**Last research pass:** April 2026
**Research cadence:** 90 days

---

## How This Log Works

Each entry has:
- **Pattern name** — short label
- **Discovered** — date pattern entered public knowledge
- **Sources** — primary links
- **How it works** — attack mechanics
- **Detection** — where Orbit catches it
- **Status** — `SHIPPED` / `RESEARCHING` / `WATCHING`

---

## SHIPPED — Patterns WDesignKit Orbit Detects Today

### Supply Chain: Plugin ownership transfer + delayed backdoor
- **Discovered:** April 2026 — EssentialPlugin attack, 30+ plugins, 400K+ sites
- **How it works:** Attacker bought plugin portfolio via Flippa. Pushed dormant backdoor via "routine update." Activated months later.
- **Detection:** `/orbit-wp-security` patterns #18 (unserialize on HTTP response), #19 (`permission_callback => '__return_true'`), #21 (callable property injection)
- **Status:** **SHIPPED**

### is_admin() misconception (unauth admin-ajax)
- **How it works:** `is_admin()` returns true for any admin-ajax.php request including unauthenticated bot traffic.
- **Detection:** `/orbit-wp-security` pattern #1
- **Status:** **SHIPPED**

### Conditional nonce bypass
- **How it works:** `if (isset($_POST['nonce']) && !wp_verify_nonce(...))` — omitting nonce field short-circuits the condition.
- **Detection:** `/orbit-wp-security` pattern #2
- **Status:** **SHIPPED**

### Shortcode attribute Stored XSS
- **How it works:** `wp_kses_post()` does NOT sanitize shortcode attributes. WDesignKit widgets that render user-input via shortcode attrs are at risk.
- **Detection:** `/orbit-wp-security` pattern #3
- **Status:** **SHIPPED**

### ORDER BY / LIMIT SQL injection
- **How it works:** `$wpdb->prepare()` cannot parameterize ORDER BY or LIMIT clauses. WDesignKit widget library filters are a candidate surface.
- **Detection:** `/orbit-wp-security` pattern #4
- **Status:** **SHIPPED**

### LFI via user-controlled include/readfile
- **Discovered:** Patchstack 2025 — 12.6% of all WP vulns
- **Detection:** `/orbit-wp-security` pattern #11
- **Status:** **SHIPPED**

### Broken Access Control in admin-post / admin_init
- **Discovered:** Patchstack 2025 — 10.9% of all WP vulns
- **Detection:** `/orbit-wp-security` pattern #12
- **Status:** **SHIPPED**

### Dynamic current_user_can() with user input
- **How it works:** `current_user_can($_POST['cap'])` — attacker sets cap to `'exist'` which returns true for any logged-in user.
- **Detection:** `/orbit-wp-security` pattern #17
- **Status:** **SHIPPED**

### register_setting() without sanitize_callback
- **How it works:** Option-based XSS via user-controlled setting stored raw.
- **Detection:** `/orbit-wp-security` pattern #20
- **Status:** **SHIPPED**

### ALLOW_UNFILTERED_UPLOADS = true
- **Detection:** `check-zip-hygiene.sh`
- **Status:** **SHIPPED**

### External admin menu URLs (scam pattern)
- **Detection:** `check-modern-wp.sh`, `/orbit-wp-security` pattern #22
- **Status:** **SHIPPED**

---

## RESEARCHING — Known Patterns, Detection Planned

### PHP 8.4 implicitly nullable type deprecation
- **Discovered:** PHP 8.4 release (Nov 2024)
- **How it works:** `function foo(string $x = null)` — implicit nullable deprecated; PHP 9.0 will error.
- **Detection:** `check-php-compat.sh`
- **Status:** **SHIPPED** April 2026

### WP 6.9 list-table empty-state change
- **How it works:** WP 6.9 skips bottom tablenav when list table has no items. WDesignKit widget list may use this hook.
- **Status:** **RESEARCHING**

---

## WATCHING — Emerging Patterns

### WP 7.0 Connectors API key extraction
- **How it works:** Connector keys stored in DB not encrypted. Malicious plugin could exfiltrate every site's AI keys.
- **Status:** **WATCHING**

### Plugin Dependencies impersonation
- **How it works:** Plugin declares `Requires Plugins: woocommerce` but assumes specific version → fatal on mismatch.
- **Status:** **WATCHING**

### AI-generated code vulnerabilities
- **How it works:** AI assistants hallucinate `sanitize_*` variants, skip nonce checks, invent WP functions.
- **Detection:** `/vibe-code-auditor` skill
- **Status:** **SHIPPED** + **WATCHING** for new modes

### Script Modules cross-plugin pollution
- **How it works:** WP 6.5+ Script Modules share a global registry. Collisions possible.
- **Status:** **WATCHING**

---

## Quarterly Research Sources

1. **Patchstack** — quarterly "Most Exploited" reports
2. **Wordfence blog** — weekly vulnerability roundups
3. **Make WordPress Plugins** — weekly team updates
4. **Make WordPress Core** — dev notes per release
5. **PHP RFC announcements** — deprecation pipeline
6. **WP.org plugin-check releases** — canonical rule evolution
7. **r/ProWordPress + r/WordPress** — practitioner pain points
8. **CVE database** — filter on plugin category

---

## The 90-Day Process

1. Read the 8 sources above
2. Add new patterns to `WATCHING` with date + source
3. Promote `WATCHING` → `RESEARCHING` on first exploitation
4. Ship detection → promote to `SHIPPED`
5. Update VISION.md "Current State" table
6. Tag release with security-log delta in CHANGELOG

---

## WDesignKit Threat Model

Orbit assumes:
- Attackers read WDesignKit's public source
- Agency customers install 20+ plugins (conflict surface)
- Users run shared hosting (64MB PHP, no WAF)
- Users don't update promptly
- Sites reach 10k+ posts/users (scale breaks naive code)

Orbit does NOT assume:
- Professional security team reviewing code
- Runtime monitoring at the site
- Users reading security advisories
