# WDesignKit Orbit — What It Does & Why It Matters

> The shareable one-pager. Point someone here when they ask "what is WDesignKit Orbit?"

---

## In One Sentence

**WDesignKit Orbit is the complete QA + UAT platform for WDesignKit — one command, every perspective, every release.**

---

## The Problem It Solves

A WDesignKit release gets judged from six angles:

1. Did the **developer** ship clean code?
2. Did **QA** find every broken flow across 3 builders (Elementor/Gutenberg/Bricks)?
3. Did the **PM** verify the widget-conversion journey works?
4. Did the **analyst** confirm cloud-sync + license tracking fires?
5. Did the **designer** catch visual regressions across the widget library?
6. Will the **end user** have a smooth update experience?

WDesignKit Orbit automates all 6 from one command.

---

## What It Catches

| Surface | Coverage |
|---|---|
| **22 WP vulnerability patterns** | including April 2026 EssentialPlugin supply-chain attack |
| **Patchstack 2025 top 5 vuln classes** | XSS (34.7%) · CSRF (19%) · LFI (12.6%) · BAC (10.9%) · SQLi (7.2%) |
| **PHP 8.0 → 8.5 compatibility** | removed functions, implicit nullable, property hooks |
| **WP 6.5 → 7.0 modern features** | Script Modules, Interactivity API, Block Bindings, Connectors API |
| **WP.org plugin-check canonical rules** | if WDesignKit Orbit passes, WP.org review passes |
| **Role-specific tests** | Dev static analysis + PM journey + PA analytics + Designer visual |
| **3-builder coverage** | Elementor + Gutenberg + Bricks widget conversion and rendering |

---

## The 20+ Automated Checks (Gauntlet)

### Static Analysis
- PHP Lint · Zip Hygiene · WPCS · WP.org plugin-check · PHPStan L5

### Asset + i18n
- Asset weight · POT regen

### Functional E2E (Playwright)
- Functional + visual + axe-core a11y
- PHP deprecation log scan

### Performance
- Lighthouse · DB profiling · Peak memory · WP-Cron verification

### Compliance
- GDPR/Privacy API hooks · Login-page asset leak · Runtime translation test

### Lifecycle
- Uninstall cleanup · Update path · Block deprecation · Keyboard nav · Admin colors · RTL · REST Application Passwords

### Context
- Competitor comparison · UI performance · 6 parallel AI skill audits

---

## The 20+ Playwright Specs

**Functional:**
- uninstall-cleanup · update-path · block-deprecation · keyboard-nav · admin-color-schemes · rtl-layout · multisite-activation · app-passwords · wp7-connectors · plugin-conflict (top 20 matrix)

**UX:**
- empty-states · error-states · loading-states · form-validation

**PM / PA:**
- user-journey · onboarding-ftue · analytics-events · visual-regression-release

**Performance:**
- bundle-size (per admin page, per frontend, login-must-be-zero)

**WDesignKit-specific:**
- widget-library · cloud-sync · template-import · widget-converter · license-gating

---

## The Custom Claude Skills

Replace mismatched community skills with WordPress-specific reviewers:

| Skill | Role |
|---|---|
| `/orbit-wp-security` | 22 WP vulnerability patterns — PHP source reviewer (NOT attacker tool) |
| `/orbit-wp-performance` | 14 WP perf patterns — hooks, queries, transients, Script Modules |
| `/orbit-wp-database` | `$wpdb`, autoload, dbDelta, uninstall cleanup |
| `/orbit-wp-standards` | Review-mode WP coding standards (not scaffolder) |
| `/orbit-scaffold-tests` | Read WDesignKit code → write business-logic scenarios |

Plus community: `/security-auditor` · `/security-scanning-security-sast` · `/vibe-code-auditor` · `/accessibility-compliance-accessibility-audit` · `/web-performance-optimization`.

---

## Auto-Scaffolding

```bash
bash scripts/scaffold-tests.sh /path/to/wdesignkit [--deep]
```

Reads every entry point → outputs `qa.config.json` + 40-80 scenario plan + draft Playwright spec.

---

## Developer Workflow

```bash
# Once — installs deps
bash scripts/gauntlet-dry-run.sh

# Per release — full gate (45-60 min)
bash scripts/gauntlet.sh --plugin /path/to/wdesignkit --mode full

# Per commit — pre-commit hook (<10s)
bash scripts/install-pre-commit-hook.sh
git commit

# Before WP.org submission — release gate (5 min)
bash scripts/gauntlet.sh --plugin . --mode release
```

---

## Who This Is For

- **WDesignKit core team** shipping to wordpress.org + store
- **QA engineers** validating cross-builder behavior
- **Product team** wanting UAT across Elementor/Gutenberg/Bricks
- **Designer** verifying widget library visual consistency

---

## Who This Is NOT For

- Penetration-testing live sproutos.ai or wdesignkit.com (use WPScan)
- Site monitoring (use Jetpack, Site Health)
- Learning WordPress — assumes working knowledge
