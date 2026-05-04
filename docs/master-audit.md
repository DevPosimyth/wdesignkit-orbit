# WDesignKit Orbit — Master Audit

> **What this doc is:** A synthesis of every known QA gap for WDesignKit — wrong skills,
> missing checks, real-world WP QA misses — merged into one prioritized action plan.
> Source of truth for making WDesignKit Orbit production-grade.

---

## The #1 Problem: Wrong Skills Doing the Wrong Jobs

Before anything else — four of the six core Claude skills typically listed in generic
QA stacks are **mismatched to WP plugin QA**. They look right from the name but do
completely the wrong thing when invoked against a plugin like WDesignKit.

| Skill | What it actually does | What WDesignKit Orbit needs | Severity |
|---|---|---|---|
| `/wordpress-penetration-testing` | Runs WPScan, Metasploit, brute-forces passwords, scans live URLs for CVEs | Read PHP source, find XSS/SQLi/CSRF in WDesignKit's code | **CRITICAL** — attacker tool, not reviewer |
| `/performance-engineer` | Cloud infra: Kubernetes, Prometheus, APM, CDN tuning | Find expensive WP hooks, N+1 queries, blocking assets in WDesignKit | **HIGH** — no WP context |
| `/database-optimizer` | Enterprise DBA: PostgreSQL sharding, DynamoDB GSI | Review `$wpdb->prepare()`, autoload bloat, transient patterns in WDesignKit | **HIGH** — MySQL/WP-specific knowledge not guaranteed |
| `/wordpress-plugin-development` | Scaffolding workflow | Code review against WP standards | **MEDIUM** — generation-focused, not review-focused |

---

## Master Fix Table

Priority: `P0` broken · `P1` must-have · `P2` next sprint · `P3` nice-to-have
Effort: `S` <1hr · `M` half day · `L` full day · `XL` 2+ days

### Part A — Skills Fixes (P0)

| # | Problem | Fix | Priority | Effort |
|---|---------|-----|----------|--------|
| A1 | Security skill is an attacker tool | Replace with `security-auditor` + `security-scanning-security-sast` | P0 | S |
| A2 | Missing WP-specific vuln patterns (nonce bypass, `is_admin()` misuse, shortcode XSS) | Create `/orbit-wp-security` skill with WP-specific patterns | P0 | M |
| A3 | Performance skill is cloud infra | Replace with `web-performance-optimization` + WP-aware reviewer | P0 | S |
| A4 | No WP hook/transient/WP_Query analysis | Create `/orbit-wp-performance` skill | P1 | M |
| A5 | DB skill is enterprise DBA | Create `/orbit-wp-database` skill | P0 | S |
| A6 | Generic code review skill | Add `/codebase-audit-pre-push` + `/vibe-code-auditor` | P1 | S |
| A7 | WP plugin dev skill is scaffolder | Use in review-only mode via prompt instruction | P1 | S |

### Part B — Missing Gauntlet Steps

| # | Missing Check | Why It Matters | Priority | Effort |
|---|---------------|----------------|----------|--------|
| B1 | **`plugin-check` (official WP.org tool)** | Same tool WP.org review team runs. Catches 40+ violation categories | P0 | S |
| B2 | **Deprecation notice scan** | PHP 8.x runtime deprecations missed by PHPStan | P1 | S |
| B3 | **WP-Cron verification** | Activation must register events, deactivation must clear | P1 | S |
| B4 | **Uninstall cleanup test** | Options/tables/cron orphan after delete | P1 | M |
| B5 | **Memory profiling** | WDesignKit must run on 64MB shared hosting | P1 | S |
| B6 | **Object cache compatibility** | Redis/Memcached transient behavior | P2 | L |
| B7 | **Update path / data migration** | v1→v2 upgrade survival | P2 | L |
| B8 | **Multisite / network** | Network activation + sitemeta behavior | P2 | L |
| B9 | **RTL layout** | Arabic/Hebrew users — common WP.org rejection | P2 | M |
| B10 | **Gutenberg block deprecation** | Block attribute format changes | P2 | M |
| B11 | **GDPR / Privacy API** | Required if WDesignKit stores user data | P2 | M |
| B12 | **Large dataset scale test** | Widget library with 5K items vs 50 | P3 | XL |
| B13 | **Admin color scheme compat** | All 8 WP admin themes | P3 | M |
| B14 | **Assets on wp-login.php** | Plugin should not enqueue there | P3 | S |
| B15 | **Keyboard navigation flow** | Beyond axe-core — focus traps, modal trap | P2 | M |
| B16 | **Translation completeness** | .mo runtime load test | P3 | M |
| B17 | **Application Passwords REST auth** | WP 5.6+ alternate auth path | P3 | M |

### Part C — Security Patterns PHPCS + Generic Skills Miss

These are real WP plugin CVE patterns the current gauntlet **will not catch** without
the custom `/orbit-wp-security` skill:

| Pattern | Why missed | Example |
|---|---|---|
| `is_admin()` misconception | Returns `true` for unauth `admin-ajax.php` | Used as auth gate → exposes sensitive AJAX |
| Conditional nonce bypass | `if (isset && !verify)` short-circuits | Omitting nonce field bypasses the check |
| Shortcode attribute Stored XSS | `wp_kses_post()` does NOT sanitize attrs | `$atts['link']` echoed raw |
| ORDER BY / LIMIT SQLi | `$wpdb->prepare()` cannot parameterize these | User-controlled sort column |
| PHP object injection | `unserialize(get_option(...))` with user-writable option | Gadget chain execution |
| `wp_ajax_nopriv_` + `update_option()` | Unauth action modifies options | Site takeover |
| Privilege escalation via user meta | `update_user_meta(..., 'wp_capabilities', ...)` without cap check | Self-admin |
| Missing object-level auth in REST | `permission_callback` checks login not ownership | IDOR |

---

## Day 1 Action Checklist

### Hour 1 — Fix broken skills
- [ ] Update skill allowlist: swap `/wordpress-penetration-testing` → `security-auditor` + `security-scanning-security-sast`
- [ ] Swap `/performance-engineer` → `web-performance-optimization`
- [ ] Install antigravity skills: `vibe-code-auditor`, `codebase-audit-pre-push`, `fixing-accessibility`, `wcag-audit-patterns`

### Hour 2 — Write custom skill files
- [ ] `/orbit-wp-security` — WP PHP reviewer (13 patterns)
- [ ] `/orbit-wp-performance` — hook/query/asset analysis
- [ ] `/orbit-wp-database` — `$wpdb`, dbDelta, transients

### Hour 3 — Add quick-win gauntlet steps
- [ ] Step 2b — `wp plugin check wdesignkit` via WP-CLI
- [ ] Step 6c — deprecation notice grep of `debug.log`
- [ ] Step 8b — peak memory profile
- [ ] Step 5b — `wp cron event list` after activation

---

*Last updated: April 2026 — wdesignkit-orbit*
