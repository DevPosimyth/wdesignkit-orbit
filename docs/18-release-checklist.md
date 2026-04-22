# Release Gate — WDesignKit Master Checklist

> Before tagging any WDesignKit release, every check in this document must pass.
> Automated via `bash scripts/gauntlet.sh --mode release`.

---

## Pre-tag Automated Gate

### Code Correctness
- [ ] PHP lint (zero syntax errors)
- [ ] Zip hygiene (no `.git/`, `node_modules/`, source maps, forbidden functions)
- [ ] WPCS (WordPress Coding Standards)
- [ ] WP.org plugin-check (official review tool)
- [ ] PHPStan level 5

### Release Metadata
- [ ] Plugin header completeness
- [ ] readme.txt WP.org parser valid
- [ ] Version parity: plugin header ↔ readme.txt ↔ CHANGELOG.md ↔ git tag
- [ ] GPL license compliance for all bundled libs
- [ ] "Tested up to" is current WP version

### Internationalization
- [ ] .pot regeneration, untranslated string count below threshold
- [ ] Runtime translation test (pseudo-locale .mo loaded, no PHP errors)

### Functional / E2E
- [ ] Playwright functional + visual baseline
- [ ] PHP deprecation scan (debug.log clean)
- [ ] Lifecycle (uninstall cleanup + update path + block deprecation)

### Performance
- [ ] Lighthouse ≥ 80
- [ ] DB profiling (no N+1, autoload < 800KB)
- [ ] Peak memory < 32MB (warn at 64MB, fail > 64MB)
- [ ] Frontend TTFB < 500ms

### Accessibility
- [ ] axe-core WCAG 2.2 AA (0 Critical / Serious)
- [ ] Keyboard navigation (no focus traps)
- [ ] All 9 admin color schemes render
- [ ] RTL layout (Arabic locale, no overflow)

### Security
- [ ] `/orbit-wp-security` skill audit (13 WP vuln patterns)
- [ ] REST API Application Password permission_callback holds
- [ ] GDPR / Privacy API hooks registered (if storing user data)
- [ ] No plugin assets leaked on wp-login.php

### Compatibility
- [ ] Plugin conflict matrix (top 20 popular plugins)
- [ ] WP-Cron events registered / cleared correctly
- [ ] Multisite activation
- [ ] HPOS declaration (if plugin touches WooCommerce orders)
- [ ] `block.json` apiVersion: 3 (if plugin ships blocks)

### Environment Matrix
- [ ] PHP 7.4, 8.1, 8.3 (via CI matrix)
- [ ] WP latest, latest-1, latest-2
- [ ] Chromium, Firefox, WebKit
- [ ] Desktop, tablet, mobile viewport

---

## Manual Review

### PM Sign-off
- [ ] User journey end-to-end works with real data
- [ ] FTUE under 3 clicks to core feature
- [ ] Analytics events fire correctly
- [ ] UAT report reviewed

### PA / Analytics
- [ ] Tracking event names and payloads correct
- [ ] Consent mode handled (GDPR)
- [ ] Dashboard KPI queries return expected shape

### Design / Visual
- [ ] Visual regression vs previous release
- [ ] No color scheme breaks
- [ ] Screenshots attached to release notes

### Release Ops
- [ ] CHANGELOG.md entry drafted
- [ ] readme.txt `== Upgrade Notice ==` mentions breaking changes
- [ ] Git tag matches version in all files
- [ ] Release zip excludes dev artifacts
- [ ] Release notes posted
- [ ] Support docs updated

---

## Fast-track Paths

### Patch Release (bugfix only)
- PHP lint, PHPCS, PHPStan
- Zip hygiene
- Version parity
- Playwright smoke (single happy-path flow)
- GDPR hooks (if data path changed)

### Major Release
Everything above, plus:
- Manual QA pass on staging
- Beta period with 5+ external testers
- Migration dry-run on production-sized dataset
- Rollback plan documented

---

## Running the Full Gate

```bash
# Preflight
bash scripts/gauntlet-dry-run.sh

# Full release gate (45-60 min)
bash scripts/gauntlet.sh --plugin . --mode full

# Release metadata only (30s)
bash scripts/check-plugin-header.sh .
bash scripts/check-readme-txt.sh .
bash scripts/check-version-parity.sh . v1.2.3
bash scripts/check-license.sh .

# Reports index
open reports/index.html
```
