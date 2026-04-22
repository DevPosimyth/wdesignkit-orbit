# WDesignKit Orbit — Onboarding by Role

> Find your role, follow your section. 20 minutes to fully operational.

---

## One-Time Setup (Everyone)

```bash
# 1. Clone WDesignKit Orbit
git clone https://github.com/DevPosimyth/wdesignkit-orbit.git
cd wdesignkit-orbit

# 2. Install dependencies
npm install
npx playwright install

# 3. Copy config template
cp qa.config.example.json qa.config.json

# 4. Configure environment
# Create .env with:
#   SPROUTOS_URL=https://wdesignkit.com
#   TEST_USER_EMAIL=qa@example.com
#   TEST_USER_PASSWORD=your-test-password

# 5. Preflight
bash scripts/gauntlet-dry-run.sh
```

---

## 🧑‍💻 Developer

**Your job:** Catch bugs before QA. Code quality, security, compatibility, static analysis.

### Daily Commands
```bash
# Fast iteration during development
bash scripts/gauntlet.sh --plugin ~/plugins/wdesignkit --mode quick

# Before every PR
bash scripts/gauntlet.sh --plugin ~/plugins/wdesignkit

# Before every release tag
bash scripts/gauntlet.sh --plugin ~/plugins/wdesignkit --mode release
```

### What Gets Checked
- PHP lint, PHPCS (WP standards), PHPStan level 5
- Plugin header, readme.txt, version parity, license
- Zip hygiene (no `.git/`, `node_modules/`, `eval()`)
- i18n / POT
- PHP 7.4 → 8.5 compat

### Security Deep-Dive
```bash
claude "/orbit-wp-security Audit ~/plugins/wdesignkit for 22 WP vulnerability patterns"
bash scripts/check-live-cve.sh ~/plugins/wdesignkit
bash scripts/check-ownership-transfer.sh ~/plugins/wdesignkit
```

### Pre-Commit Hook
```bash
ORBIT_ROOT=~/wdesignkit-orbit bash ~/wdesignkit-orbit/scripts/install-pre-commit-hook.sh
```

### Your Sign-off Checklist
```bash
open checklists/pre-release-checklist.md
open checklists/security-checklist.md
```

---

## 🧪 QA Engineer

**Your job:** Real browser. Real flows. Catch broken behavior, visual regressions, a11y failures.

### Setup
```bash
bash scripts/create-test-site.sh --plugin ~/plugins/wdesignkit --port 8881
WP_TEST_URL=http://localhost:8881 \
  npx playwright test tests/wdesignkit/auth.setup.js --project=setup
```

### Daily Commands
```bash
# All tests
WP_TEST_URL=http://localhost:8881 npx playwright test tests/wdesignkit/

# Interactive UI mode
npx playwright test tests/wdesignkit/ --ui

# Multi-viewport
npx playwright test tests/wdesignkit/ \
  --project=chromium --project=mobile-chrome --project=tablet
```

### Results
```bash
npx playwright show-report reports/playwright-html
```

### Flow Tests
```bash
# FTUE
PLUGIN_SLUG=wdesignkit \
PLUGIN_CORE_FEATURE_URL=/wp-admin/admin.php?page=wdesignkit-widgets \
npx playwright test tests/wdesignkit/flows/onboarding-ftue.spec.js

# Uninstall cleanup
PLUGIN_SLUG=wdesignkit PLUGIN_PREFIX=wdk \
PLUGIN_CUSTOM_TABLES=wdk_widgets,wdk_widget_meta \
npx playwright test tests/wdesignkit/flows/uninstall-cleanup.spec.js

# Update path
PLUGIN_SLUG=wdesignkit \
PLUGIN_V1_ZIP=~/wdesignkit-1.0.zip PLUGIN_V2_ZIP=~/wdesignkit-1.1.zip \
npx playwright test tests/wdesignkit/flows/update-path.spec.js

# RTL
PLUGIN_ADMIN_SLUG=wdesignkit \
npx playwright test tests/wdesignkit/flows/rtl-layout.spec.js --project=rtl
```

### Debug a Failing Test
```bash
npx playwright test tests/wdesignkit/widgets.spec.js --debug
npx playwright show-trace test-results/<failed-test>/trace.zip
```

### Your Sign-off Checklist
```bash
open checklists/pre-release-checklist.md
```

---

## 📊 Product Manager

**Your job:** Read reports. Make release calls. No terminal commands needed.

### The Three Reports You Read

**1. Main gauntlet summary** — ask dev/QA to send:
```
reports/qa-report-TIMESTAMP.md
```
`✗` = hard fail. `⚠` = warning. `✓` = passed.

**2. PM UX Report** (HTML):
```bash
open reports/pm-ux/pm-ux-report-*.html
```
Three sections:
- Spell-check across all admin UI
- Guided Experience Score (0-10) vs competitors
- Label audit (non-standard terminology)

**3. UAT Comparison Report** (HTML):
```bash
open reports/uat-report-*.html
```
Side-by-side screenshots/videos of WDesignKit vs competitor.

### What to Do With Each Finding
| Finding | Action |
|---|---|
| Any `✗ FAIL` | Must fix. No release. |
| Typos | Fix before release |
| Guidance score < 5 | Immediate backlog |
| Guidance score 5-7 | Next sprint |
| Guidance score ≥ competitor avg | Ship |

### Your Sign-off Checklist
```bash
open checklists/pre-release-checklist.md
open checklists/ui-ux-checklist.md
```

---

## 📈 Product Analyst

**Your job:** Performance metrics, event verification, cross-version data.

### Analytics Event Verification
```bash
ANALYTICS_ENDPOINT=stats.wdesignkit.com \
npx playwright test tests/wdesignkit/flows/analytics-events.spec.js
```

### Performance Scoring
```bash
bash scripts/lighthouse.sh
open reports/lighthouse/report.html
```

### Core Web Vitals Targets
| Metric | Target |
|---|---|
| Performance | ≥ 80 |
| LCP | < 2.5s |
| FCP | < 1.8s |
| TBT | < 200ms |
| CLS | < 0.1 |
| TTI | < 3.8s |

### DB Query Count
```bash
bash scripts/db-profile.sh
cat reports/db-profile-*.txt
```

### Competitor Benchmarking
```bash
bash scripts/competitor-compare.sh --competitors "essential-addons-for-elementor-free,happy-elementor-addons"
cat reports/competitor-*.md
```

### Version Delta
```bash
bash scripts/compare-versions.sh \
  --old ~/wdesignkit-1.0.zip --new ~/wdesignkit-1.1.zip
```

---

## 🎨 Designer

**Your job:** Visual regressions, UI quality, responsive breaks, a11y.

### Visual Regression
```bash
# First run — creates baselines
npx playwright test tests/wdesignkit/ --update-snapshots

# Every run after — diffs
npx playwright test tests/wdesignkit/
```

### Responsive
```bash
npx playwright test tests/wdesignkit/ \
  --project=chromium --project=mobile-chrome --project=tablet
```

### Admin Color Schemes
```bash
PLUGIN_ADMIN_SLUG=wdesignkit \
npx playwright test tests/wdesignkit/flows/admin-color-schemes.spec.js
```

### RTL
```bash
PLUGIN_ADMIN_SLUG=wdesignkit \
npx playwright test tests/wdesignkit/flows/rtl-layout.spec.js --project=rtl
```

### AI Design Audit
```bash
claude "/antigravity-design-expert Review admin UI in ~/plugins/wdesignkit/admin/ for visual polish"
claude "/accessibility-compliance-accessibility-audit Audit WDesignKit admin for WCAG 2.1 AA"
```

### Your Checklist
```bash
open checklists/ui-ux-checklist.md
```

---

## 👤 End User / Beta Tester

**Your job:** Walk through flows as a first-time user. Watch videos. Give feedback.

### What the Team Runs (You Just Watch)
```bash
# Team runs with video
npx playwright test tests/wdesignkit/ --headed --video=on

# You review
open reports/uat-report-*.html
```

### What to Watch For
1. **First-time setup** — Is there a wizard? Any guidance?
2. **Task completion** — Can you find the main feature quickly? Count the clicks.
3. **Error messages** — Does the message tell you how to fix it?
4. **Labels** — Does the button name match what it does?
5. **Option groups** — Does the dropdown order make sense?

### Feedback Format
```
Screen: [which page]
What I did: [action]
What happened: [what I saw]
What I expected: [what I thought would happen]
Severity: confused me / annoyed me / blocked me
```

---

## Release Gate — Who Signs Off on What

| Role | Reads | Signs Off When |
|---|---|---|
| **Developer** | `reports/qa-report-*.md` | Zero `✗ FAIL`. All security warnings triaged. |
| **QA** | `reports/playwright-html/index.html` | All tests pass. Visual diffs approved. A11y ≥ 85. |
| **PM** | `reports/pm-ux/pm-ux-report-*.html` + checklist | UX issues triaged. Risk acceptable. |

All three → ship.
