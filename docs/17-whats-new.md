# WDesignKit Orbit — What's New

> Running log of QA framework improvements for WDesignKit.

---

## Current Focus (April 2026)

### Core Improvements in Flight

1. **Skill Replacement** — Mismatched AI reviewers (attacker tools, cloud infra skills) being replaced with WDesignKit-aware auditors for security, performance, DB patterns, and coding standards.

2. **Expanded Test Coverage** — New gauntlet steps to detect real-world bugs previously missed: uninstall cleanup, update path survival, keyboard nav, RTL layout, translation runtime errors.

3. **Official Integration** — `plugin-check` (WordPress.org's official validator) runs automatically — CI rejection mirrors what the plugin directory catches.

---

## Testing Infrastructure Roadmap

- **Playwright test projects** covering lifecycle flows, accessibility, multisite, REST auth
- **Helper scripts** for GDPR hooks, login asset detection, translation testing, object cache, dataset seeding
- **wp-env configurations** enabling multisite and Redis object cache testing locally

---

## Configuration & Execution

WDesignKit's QA needs are defined through a single `qa.config.json`. Optional fields specify REST endpoints, custom DB tables, cron hooks, upgrade paths. Irrelevant tests auto-skip based on this config.

The full gauntlet runs via:
```bash
bash scripts/gauntlet.sh --plugin /path/to/wdesignkit --mode full
```

Individual suites can be targeted through Playwright projects.

---

## Recent Changes

### v1.1.0 (April 2026)
- Added login-pages bug report (10 bugs: 3 Critical, 3 High, 4 Medium)
- Polished README to production QA standard
- Added lighthouse script + run-all-tests helper
- Updated all checklists for WDesignKit SaaS + plugin context

### v1.0.0
- Initial Playwright specs: auth, core, widgets, cloud
- Base checklists: pre-release, security, performance, UI/UX
- Base docs covering concepts, installation, configuration

---

*Check `CHANGELOG.md` for per-commit history.*
