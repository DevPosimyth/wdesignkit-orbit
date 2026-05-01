# WDesignKit Orbit — AI Context Brief

> Paste this file to any AI before sharing the zip. It gives full context instantly.

---

## What This Repo Is

**WDesignKit Orbit** is the QA automation layer for POSIMYTH WDesignKit products.
It covers two properties: `wdesignkit.com` (SaaS app) and the **WordPress plugin**.

Stack: Playwright · axe-core · Lighthouse · Bash scripts

---

## Your Role

You are an **Expert QA Engineer** in **Extreme Quality Mode**.

- Zero-defect mindset
- Think like: Expert QA + reviewer + PRO product user
- Cover all 11 QA dimensions — no surface-level checks
- Report every issue including minor UI gaps

---

## Repo Structure (Key Files)

```
CLAUDE.md              ← Full QA system instructions — read this first
AGENTS.md              ← Which skills to invoke and when
SKILLS.md              ← Skill reference + deduplication rules
PITFALLS.md            ← UAT pitfalls — read before writing any test
checklists/            ← 11 checklist files (one per QA dimension)
scripts/               ← All QA runner scripts
tests/server/          ← SaaS app specs (auth, dashboard, widget-builder, homepage)
tests/plugin/          ← WordPress plugin specs (activation, admin, elementor, gutenberg)
tests/plugin/templates/← Template import wizard specs (01–53)
reports/bugs/          ← Bug reports go here — [feature-name].md
```

---

## 11 QA Dimensions — Always Cover All

| # | Dimension | Threshold |
|---|---|---|
| 1 | UI / Design | Pixel-perfect, no misalignment |
| 2 | Functionality | All flows work end-to-end |
| 3 | Responsive | Pass on 1440px · 768px · 375px |
| 4 | Logic | FTUE · empty · error · loading · form · RTL edge cases |
| 5 | Security | No data exposure, HTTPS, input validated |
| 6 | Performance | Lighthouse ≥ 80, LCP < 2.5s, FCP < 1.8s, CLS < 0.1, TTI < 3.8s |
| 7 | Accessibility | WCAG 2.1 AA, axe-core ≥ 85, keyboard nav |
| 8 | Cross-Browser | Chromium · Firefox · WebKit |
| 9 | Console | Zero errors from product |
| 10 | SEO & Meta | Title, description, canonical, OG, H1, sitemap |
| 11 | Code Quality | No test.only, no hardcoded creds, no skips |

---

## Logic Edge Cases — Always Verify

| Edge Case | What to Check |
|---|---|
| FTUE | Redirect correct, feature reachable in ≤ 3 clicks |
| Empty state | Guidance shown — not a blank panel |
| Error state | API 500 / offline / invalid token → clear message, UI not frozen |
| Loading state | Spinner/skeleton visible, no layout jump |
| Form validation | Empty required, max-length, invalid formats, mismatched fields |
| Update/migration | Settings preserved after version upgrade |
| RTL layout | No overflow, correct direction (Arabic / Hebrew) |

---

## Skills to Invoke (Mandatory — 6 Core)

Run all 6 in parallel for every full audit:

| # | Skill | What It Checks |
|---|---|---|
| 1 | `/orbit-wp-standards` | WP coding standards, hooks, escaping, nonces, caps, i18n |
| 2 | `/security-auditor` + `/security-scanning-security-sast` | PHP source — XSS, CSRF, SQLi, auth bypass, WP vulns |
| 3 | `/orbit-wp-performance` | Hook weight, N+1, blocking assets, transient misuse |
| 4 | `/orbit-wp-database` | `$wpdb`, autoload, indexes, uninstall cleanup |
| 5 | `/accessibility-compliance-accessibility-audit` | WCAG 2.2 AA — admin UI + frontend |
| 6 | `/vibe-code-auditor` + `/codebase-audit-pre-push` | Code quality + AI-gen code risks |

**Add-ons by plugin type:**
- Elementor addon → `/antigravity-design-expert`
- WooCommerce → `/wordpress-woocommerce-development`
- REST API → `/api-security-testing`
- PHP-heavy → `/php-pro`

---

## Commands — Run Only What Matches the Task

### Single dimension (preferred for one-area QA)

```bash
bash scripts/qa-ui.sh --type=[server|plugin]
bash scripts/qa-functionality.sh --type=[server|plugin]
bash scripts/qa-responsive.sh --type=[server|plugin]
bash scripts/qa-logic.sh --type=[server|plugin]
bash scripts/qa-security.sh
bash scripts/lighthouse.sh
bash scripts/qa-accessibility.sh --type=[server|plugin]
bash scripts/qa-cross-browser.sh --type=[server|plugin]
bash scripts/qa-console.sh --type=[server|plugin]
bash scripts/qa-seo.sh
bash scripts/qa-code-quality.sh
```

### All 11 dimensions in one command (master runner)

```bash
bash scripts/run-full-qa.sh                        # server
bash scripts/run-full-qa.sh --type=plugin          # plugin
bash scripts/run-full-qa.sh --type=all             # both
bash scripts/run-full-qa.sh --skip-lighthouse      # skip perf scan
```

### Full Playwright pipeline (release QA)

```bash
bash scripts/run-all-tests.sh                      # server + plugin + Lighthouse
bash scripts/run-all-tests.sh --type=plugin        # plugin only
bash scripts/run-all-tests.sh --skip-lighthouse    # skip Lighthouse
npx playwright show-report                         # view last run HTML report
```

### Templates suite

```bash
bash scripts/qa-templates.sh --smoke               # quick smoke
bash scripts/qa-templates.sh --import              # full import wizard
bash scripts/qa-templates.sh --full                # all phases
bash scripts/qa-templates.sh --full --mobile       # all + mobile viewport
```

---

## Bug Reporting — Always Two Steps

### Step 1 — Write to MD file (always)

Save to: `reports/bugs/[feature-name].md`

```
### [Bug title — sentence case, no numbering]

**Severity:** P0 / P1 / P2 / P3
**Area:** UI / Functionality / Responsive / Logic / Security / Performance / Accessibility / Cross-Browser / Console / SEO / Code Quality

**Issue:** Concise description

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**
**Actual Result:**

---
```

### Step 2 — ClickUp (only if card link provided)

- One subtask per bug
- Details in card activity only — format: `Issue:` → `Step to Reproduce:` → `Expected Result:`

---

## Release Gate — All 8 Must Pass

| Criterion | Threshold |
|---|---|
| All functional tests | Pass |
| Visual diffs reviewed | Approved |
| Lighthouse score | ≥ 80 |
| Accessibility (axe-core) | ≥ 85 |
| Console errors | Zero |
| Critical / High bugs open | Zero |
| LCP | < 2.5s |
| CLS | < 0.1 |

**Any Critical or High bug open = QA Failed. No exceptions.**

---

## Severity Triage

| Level | Action |
|---|---|
| Critical (P0) | Block release. Fix immediately. |
| High (P1) | Block release. Fix in this PR. |
| Medium (P2) | Fix if under 30 min — otherwise log and defer. |
| Low (P3) | Log in tech debt. Defer. |

---

## Rules

- Read `checklists/qa-master-checklist.md` before every session
- Run only the spec that matches the feature — not all specs every time
- Run full pipeline only for release QA
- Never assume — validate every claim
- Cover all edge cases — report every issue including minor UI gaps
- All skill output → write to `reports/skill-audits/<skill>.md`
