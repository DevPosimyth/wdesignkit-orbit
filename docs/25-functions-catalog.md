# WDesignKit Orbit — Functions Catalog

> The inventory. Every script, spec, skill, config, and doc with a one-line summary.

---

## Scripts — `scripts/`

### Entry Points
| Script | One-liner |
|---|---|
| `gauntlet.sh` | Main pipeline — runs 25+ steps with `--mode quick\|full\|release` |
| `gauntlet-dry-run.sh` | Preflight — validates deps + env + skills in ~5 seconds |
| `scaffold-tests.sh` | Reads WDesignKit code → generates `qa.config.json` + scenarios + smoke spec |
| `run-all-tests.sh` | Convenience wrapper running all Playwright suites |
| `lighthouse.sh` | Runs Lighthouse audit on admin + frontend |
| `install-pre-commit-hook.sh` | Installs pre-commit hook into any repo |

### Release Gate
| Script | One-liner |
|---|---|
| `check-plugin-header.sh` | Required + recommended header fields; Text Domain match; GPL license |
| `check-readme-txt.sh` | WP.org parser compliance — sections, fields, length, stable tag |
| `check-version-parity.sh` | Header ↔ readme.txt ↔ CHANGELOG.md ↔ git tag sync |
| `check-license.sh` | GPL compliance for composer vendor + npm node_modules |
| `check-block-json.sh` | `apiVersion: 3` + `$schema` + name format + render path |
| `check-hpos-declaration.sh` | WooCommerce HPOS compat (skips if no WC) |
| `check-wp-compat.sh` | WP function usage vs declared "Requires at least" |
| `check-php-compat.sh` | PHP 8.0-8.5: removed functions, implicit nullable, property hooks |
| `check-modern-wp.sh` | Script Modules, Interactivity API, Plugin Dependencies, Site Health |

### Quality / Security
| Script | One-liner |
|---|---|
| `check-zip-hygiene.sh` | Dev artifacts + obfuscation + `ALLOW_UNFILTERED_UPLOADS` |
| `check-gdpr-hooks.sh` | User-data storage + missing privacy hooks |
| `check-login-assets.sh` | Assets leaking onto wp-login.php |
| `check-translation.sh` | Generates pseudo-locale `.mo`, loads it, scans for runtime errors |
| `check-object-cache.sh` | Redis/Memcached transient compatibility |
| `check-ownership-transfer.sh` | Git-log drift on plugin Author/URI/Name (supply-chain defense) |
| `check-live-cve.sh` | Correlates code against NVD + WPScan (free, 24h cache) |

### Test Environment
| Script | One-liner |
|---|---|
| `create-test-site.sh` | Spins up wp-env Docker site with WDesignKit pre-installed |
| `db-profile.sh` | N+1 detection + autoload bloat + slow query summary |
| `seed-large-dataset.sh` | Generates 1K+ posts/users/terms for scale testing |
| `batch-test.sh` | Runs gauntlet against multiple WDesignKit versions in parallel |
| `compare-versions.sh` | Diffs behavior between two WDesignKit versions |
| `competitor-compare.sh` | Side-by-side screenshots vs declared competitors |

---

## Playwright Specs — `tests/wdesignkit/`

### Flow Specs
| Spec | One-liner |
|---|---|
| `uninstall-cleanup.spec.js` | Asserts options/tables/cron/user meta cleaned on delete |
| `update-path.spec.js` | v1 zip → v2 zip, settings + DB survive |
| `block-deprecation.spec.js` | Existing block markup renders after update |
| `keyboard-nav.spec.js` | Tab through UI, detect focus traps |
| `admin-color-schemes.spec.js` | All 9 WP admin colors, assert no invisible text |
| `rtl-layout.spec.js` | Arabic locale + overflow detection |
| `multisite-activation.spec.js` | Network-activate + subsite smoke |
| `app-passwords.spec.js` | REST endpoint auth — admin pwd works, subscriber rejected |
| `plugin-conflict.spec.js` | Top-20 plugins activated one-by-one, no fatals |
| `empty-states.spec.js` | Admin pages with zero items show helpful message + CTA |
| `error-states.spec.js` | AJAX 500 / REST WP_Error doesn't freeze UI |
| `loading-states.spec.js` | Spinner/skeleton shown during async |
| `form-validation.spec.js` | Empty required → field-specific errors + `aria-invalid` |
| `user-journey.spec.js` | End-to-end install → configure → use (PM role) |
| `onboarding-ftue.spec.js` | Activation redirect + skippable onboarding + 3-clicks |
| `analytics-events.spec.js` | Events fire on declared user actions |
| `visual-regression-release.spec.js` | Pixel diff vs previous git tag |
| `bundle-size.spec.js` | Per-page JS/CSS weight + login-zero + defer/async |

### WDesignKit-Specific
| Spec | One-liner |
|---|---|
| `widget-library.spec.js` | Widget list renders, filter works, preview loads |
| `cloud-sync.spec.js` | Sign-in persists, cloud widgets appear on second install |
| `template-import.spec.js` | Import preserves globals, survives builder switch |
| `widget-converter.spec.js` | Elementor → Gutenberg → Bricks conversion stable |
| `license-gating.spec.js` | Free plan sees Pro as locked, upgrade CTA routes correctly |

---

## Custom Claude Skills

| Skill | Role |
|---|---|
| `/orbit-wp-security` | 22 WP vulnerability patterns — PHP source reviewer |
| `/orbit-wp-performance` | 14 WP perf patterns — hooks, queries, transients |
| `/orbit-wp-database` | `$wpdb`, dbDelta, autoload, uninstall cleanup |
| `/orbit-wp-standards` | Review-mode WP coding standards |
| `/orbit-scaffold-tests` | AI-augmented business-logic scenario writer |

Community skills:
`/security-auditor`, `/security-scanning-security-sast`, `/vibe-code-auditor`,
`/codebase-audit-pre-push`, `/accessibility-compliance-accessibility-audit`,
`/web-performance-optimization`, `/fixing-accessibility`, `/wcag-audit-patterns`.

---

## Configs

| Config | Purpose |
|---|---|
| `playwright.config.js` | Viewports + projects (desktop/tablet/mobile) |
| `qa.config.example.json` | Runtime config template |
| `config/phpcs.xml` | PHPCS ruleset (WP + VIP standards) |
| `config/phpstan.neon` | PHPStan level 5 config |
| `config/lighthouserc.json` | Lighthouse CI config |

---

## Workflows + Hooks

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Self-validation on every PR |
| `.githooks/pre-commit` | Fast commit-time gate |

---

## Docs — `docs/`

### Onboarding
| Doc | For |
|---|---|
| `00-concepts.md` | Plain-English explainer for every tool |
| `01-installation.md` | macOS + Ubuntu install |
| `onboarding-by-role.md` | Step-by-step per role |
| `13-roles.md` | Deep role guide with daily workflows |

### How-tos
| Doc | For |
|---|---|
| `02-configuration.md` | `qa.config.json` full reference |
| `03-test-environment.md` | wp-env, wp-now, PHP matrix, WP-CLI |
| `04-gauntlet.md` | All pipeline steps with examples |
| `05-skills.md` | All skills explained |
| `07-test-templates.md` | Working Playwright specs per plugin type |
| `writing-tests.md` | Per-surface test recipes |
| `19-business-logic-guide.md` | WDesignKit-specific logic tests |
| `20-auto-test-generation.md` | How Orbit reads WDesignKit code |
| `23-extending-orbit.md` | Add checks, write specs, create skills |

### Reading + Release
| Doc | For |
|---|---|
| `08-reading-reports.md` | How to interpret every report type |
| `18-release-checklist.md` | Complete pre-tag gate |
| `17-whats-new.md` | Recent changes log |

### Advanced
| Doc | For |
|---|---|
| `09-multi-plugin.md` | Batch + PHP matrix |
| `database-profiling.md` | N+1, slow queries, autoload bloat |
| `deep-performance.md` | Beyond Lighthouse |
| `15-ci-cd.md` | CI templates |
| `common-wp-mistakes.md` | Patterns Orbit catches automatically |
| `real-world-qa.md` | Edge cases checklists miss |
| `power-tools.md` | Optional extensions |
| `what-is-playwright.md` | Playwright primer |
| `wp-env-setup.md` | wp-env deep-dive |

### Ongoing
| Doc | For |
|---|---|
| `16-master-audit.md` | Master gap audit + skill mappings |
| `21-evergreen-security.md` | Living attack-pattern catalog |
| `22-what-orbit-does.md` | Shareable one-pager |
| `24-use-cases.md` | 25 real scenarios by role |
| `25-functions-catalog.md` | This doc |

### Reports
| Doc | For |
|---|---|
| `login-pages-bug-report.md` | April 2026 login-pages AI QA findings |

---

## How to Find What You Need

| If you're… | Start here |
|---|---|
| New to WDesignKit Orbit | `00-concepts.md` + `onboarding-by-role.md` |
| Sharing with someone | `22-what-orbit-does.md` |
| Shipping a release | `18-release-checklist.md` |
| Writing tests | `19-business-logic-guide.md` + `23-extending-orbit.md` |
| Looking up "what does X do?" | This doc |
| Debugging a failed check | `08-reading-reports.md` |
| Tracking security threats | `21-evergreen-security.md` |

---

*If something isn't listed here, it either doesn't exist or this catalog is stale.*
