# WDesignKit Orbit — Use Cases

> 25 real-world scenarios organized by role, with specific commands, expected outputs, and decision frameworks.

---

## Testing Modes

Scaled by urgency:
- **quick** (3-5 min) — daily changes
- **full** (30-45 min) — before pull requests
- **release** (45-60 min) — before tagging

**Always start with:** `bash scripts/gauntlet-dry-run.sh` to catch config issues fast.

---

## 🧑‍💻 Developer (10 Scenarios)

### 1. Initial WDesignKit validation after clone
```bash
bash scripts/gauntlet-dry-run.sh
bash scripts/gauntlet.sh --plugin ~/plugins/wdesignkit --mode quick
```

### 2. Pre-commit check
```bash
bash scripts/install-pre-commit-hook.sh
# Every git commit runs quick gauntlet automatically
```

### 3. Daily development loop
```bash
bash scripts/gauntlet.sh --plugin ~/plugins/wdesignkit --mode quick
# ~2 min — PHP lint + PHPCS + PHPStan
```

### 4. Before WP.org submission
```bash
bash scripts/gauntlet.sh --plugin ~/plugins/wdesignkit --mode release
# Must be zero FAIL, zero unaddressed warnings
```

### 5. Security audit (ad-hoc)
```bash
claude "/orbit-wp-security Audit ~/plugins/wdesignkit for 22 WP vulnerability patterns"
```

### 6. PHP version upgrade validation
```bash
bash scripts/check-php-compat.sh ~/plugins/wdesignkit
```

### 7. WordPress compatibility
```bash
bash scripts/check-wp-compat.sh ~/plugins/wdesignkit
bash scripts/check-modern-wp.sh ~/plugins/wdesignkit
```

### 8. Code review for a PR
```bash
bash scripts/gauntlet.sh --plugin ~/plugins/wdesignkit --mode full
claude "/codebase-audit-pre-push Review staged changes in ~/plugins/wdesignkit"
```

### 9. Debugging a failing test
```bash
npx playwright test tests/server/widgets.spec.js --debug
npx playwright show-trace test-results/*/trace.zip
```

### 10. Ownership-transfer defense
```bash
bash scripts/check-ownership-transfer.sh ~/plugins/wdesignkit
# Compares git log of main plugin file — flags author header drift
```

**Decision rule:** zero Critical + zero High = ship. Any unaddressed = no.

---

## 🧪 QA Engineer (5 Scenarios)

### 11. Coverage baseline
```bash
bash scripts/scaffold-tests.sh ~/plugins/wdesignkit
cat scaffold-out/wdesignkit/qa-scenarios.md
```

### 12. Release candidate testing
```bash
bash scripts/create-test-site.sh --plugin ~/plugins/wdesignkit --port 8881
WP_TEST_URL=http://localhost:8881 npx playwright test tests/server/
```

### 13. Regression verification
```bash
npx playwright test tests/server/flows/visual-regression-release.spec.js
# Pixel diff vs previous git tag
```

### 14. Multi-version compatibility
```bash
bash scripts/batch-test.sh --plugins-dir ~/wdesignkit-versions
# Tests v1.0, v1.1, v1.2 in parallel
```

### 15. Conflict matrix
```bash
PLUGIN_SLUG=wdesignkit \
npx playwright test tests/server/flows/plugin-conflict.spec.js
# Activates WDesignKit alongside top 20 plugins — asserts no fatals
```

---

## 📊 Product Manager (5 Scenarios)

### 16. Release shippability assessment
```bash
open reports/qa-report-*.md
open reports/pm-ux/pm-ux-report-*.html
```
**Decision rule:** zero Critical + zero High findings = ship.

### 17. Beta launch readiness
```bash
open reports/uat-report-*.html
# Side-by-side videos of WDesignKit vs competitor flows
```

### 18. Time-to-value measurement
```bash
PLUGIN_SLUG=wdesignkit \
PLUGIN_CORE_FEATURE_URL=/wp-admin/admin.php?page=wdesignkit-widgets \
npx playwright test tests/server/flows/onboarding-ftue.spec.js
```
Measures clicks-to-first-widget. Target: ≤3.

### 19. Visual comparison analysis
```bash
bash scripts/competitor-compare.sh --competitors "essential-addons-for-elementor-free,happy-elementor-addons"
```

### 20. Security evidence gathering
```bash
open reports/skill-audits/index.html
# For customer/enterprise security questionnaires
```

---

## 📈 Product Analyst (2 Scenarios)

### 21. Analytics event verification
```bash
ANALYTICS_ENDPOINT=stats.wdesignkit.com \
npx playwright test tests/server/flows/analytics-events.spec.js
```

### 22. Consent mode compliance
```bash
bash scripts/check-gdpr-hooks.sh ~/plugins/wdesignkit
```

---

## 🎨 Designer (2 Scenarios)

### 23. Visual baseline establishment
```bash
npx playwright test tests/server/ --update-snapshots
# Commit the new baselines
```

### 24. Admin color scheme audit
```bash
PLUGIN_ADMIN_SLUG=wdesignkit \
npx playwright test tests/server/flows/admin-color-schemes.spec.js
# Tests all 9 WP admin color schemes
```

---

## 🚀 Release Operations (3 Scenarios)

### 25. Pre-release gate
```bash
bash scripts/gauntlet.sh --plugin . --mode release
```

### 26. Artifact hygiene verification
```bash
bash scripts/check-zip-hygiene.sh ~/downloads/wdesignkit-1.2.0.zip
```

### 27. CVE monitoring
```bash
bash scripts/check-live-cve.sh ~/plugins/wdesignkit
# Correlates against last 60 days of NVD + WPScan feeds
```

---

## Decision Framework

| Scenario | Decision |
|---|---|
| Zero Critical + zero High findings | Ship |
| Any unaddressed High | No ship — fix first |
| Unaddressed Medium | Ship if justified, add to next-sprint backlog |
| Unaddressed Low | Ship, add to backlog |
| Any FAIL in gauntlet | No ship — hard gate |

Always start with dry-run. Always read reports before deciding.
