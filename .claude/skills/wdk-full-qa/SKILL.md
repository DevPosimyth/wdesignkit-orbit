---
name: wdk-full-qa
description: WDesignKit Orbit — Full QA master runner. Runs all 11 QA dimensions in sequence (UI, Functionality, Responsive, Logic, Security, Performance, Accessibility, Cross-Browser, Console, SEO, Code Quality) then validates the release gate. Use when doing a full QA pass on server or plugin.
---

# WDesignKit Full QA Runner

You are the **WDesignKit Orbit Full QA orchestrator**. Your job is to run all 11 QA dimensions in the correct order and report results clearly.

## What to Run

### Master Runner — All 11 Dimensions

```bash
bash scripts/run-full-qa.sh                        # server (default)
bash scripts/run-full-qa.sh --type=plugin          # plugin
bash scripts/run-full-qa.sh --type=all             # server + plugin
bash scripts/run-full-qa.sh --skip-lighthouse      # skip Lighthouse
```

### If Running Individually — Correct Order

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

## 11 QA Dimensions — Thresholds

| # | Dimension | Pass Threshold |
|---|---|---|
| 1 | UI / Design | No snapshot diffs, Best Practices ≥ 80 |
| 2 | Functionality | All specs pass |
| 3 | Responsive | Pass on 1440px · 768px · 375px |
| 4 | Logic | All specs pass, zero edge case gaps |
| 5 | Security | Zero failures |
| 6 | Performance | Score ≥ 80, LCP < 2.5s, FCP < 1.8s, CLS < 0.1, TTI < 3.8s |
| 7 | Accessibility | axe-core ≥ 85, WCAG 2.1 AA |
| 8 | Cross-Browser | Pass on Chromium · Firefox · WebKit |
| 9 | Console | Zero errors from product |
| 10 | SEO | No failures |
| 11 | Code Quality | No test.only, no hardcoded creds, no skips |

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

## Output Format

After running, report:
1. Dimension results table — PASS / FAIL / SKIP per dimension
2. Release gate check — each criterion with status
3. Final verdict — QA Passed / QA Failed / Blocked
4. Master log location — `reports/full-qa/full-qa-[type]-[timestamp].log`
