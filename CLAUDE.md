# WDesignKit Orbit — AI QA Guidelines

> **AI: Read this file completely before performing any QA task.**
> This is the single source of truth for how QA is conducted in this repository.
> Do not skip steps. Do not guess. Follow the protocol below in exact order.

---

## 1. What This Repository Is

**WDesignKit Orbit** is the QA automation layer for WDesignKit products. It covers:

| Property | URL | Scope |
|---|---|---|
| WDesignKit Main | https://wdesignkit.com | Auth, Dashboard, Widget Builder |
| Learning Center | https://learn.wdesignkit.com | Docs, Navigation, SEO, Security |

**Stack**: Playwright (E2E), Lighthouse (Performance), axe-core (Accessibility), PHP/WordPress

**Config file**: `qa.config.json` — read this before running any test. It contains URLs, credentials, viewports, thresholds, and test areas.

---

## 2. Files to Read Before Any QA Session

Read these files in this exact order at the start of every QA session:

1. **This file** — `CLAUDE.md` (you are here)
2. **QA config** — `qa.config.json` (environment, URLs, thresholds, viewports)
3. **Master checklist** — `checklists/qa-master-checklist.md` (index of all 11 areas)
4. **Relevant area checklist** — see Section 4 below for which one to open

Do not begin testing until you have read all four.

---

## 3. QA Workflow — Step-by-Step Protocol

Follow this sequence for every QA task. Do not skip steps.

```
STEP 1 → Read CLAUDE.md                    (you are here)
STEP 2 → Read qa.config.json               (understand the environment)
STEP 3 → Identify scope                    (full release? single area? hotfix?)
STEP 4 → Read qa-master-checklist.md       (get the full picture)
STEP 5 → Open relevant area checklists     (see Section 4)
STEP 6 → Run automated tests               (see Section 5)
STEP 7 → Run manual checklist items        (items not covered by automation)
STEP 8 → Triage failures                   (see Section 6)
STEP 9 → Write findings report             (see Section 7)
STEP 10 → Sign off or block                (see Section 8)
```

---

## 4. Checklist Files — When to Use Each

| Scope | Open These Files |
|---|---|
| **Full release** | All 11 files below |
| **UI-only change** | `ui-ux-checklist.md`, `responsiveness-checklist.md`, `accessibility-checklist.md`, `cross-browser-checklist.md` |
| **Feature change** | `functionality-checklist.md`, `logic-checklist.md`, `console-errors-checklist.md` |
| **Auth / API change** | `security-checklist.md`, `functionality-checklist.md` |
| **Content / SEO change** | `seo-checklist.md`, `console-errors-checklist.md` |
| **Performance work** | `performance-checklist.md`, `console-errors-checklist.md` |
| **Hotfix (minimum)** | `functionality-checklist.md`, `security-checklist.md`, `console-errors-checklist.md`, `code-quality-checklist.md` |

### All 11 Checklist Files

```
checklists/
├── qa-master-checklist.md          ← Start here — index + sign-off table
├── ui-ux-checklist.md              ← Layout, spacing, animation, depth
├── functionality-checklist.md      ← Buttons, forms, CRUD, auth, integrations
├── responsiveness-checklist.md     ← 320px → 1920px, touch, navigation
├── logic-checklist.md              ← Business rules, RBAC, dates, state
├── security-checklist.md           ← Auth, input, headers, data exposure
├── performance-checklist.md        ← Core Web Vitals, assets, DB, PHP
├── accessibility-checklist.md      ← WCAG 2.1 AA, keyboard, ARIA, contrast
├── cross-browser-checklist.md      ← Chrome, Firefox, Safari, Edge, iOS/Android
├── console-errors-checklist.md     ← JS errors, 404s, PHP notices, CSP
├── seo-checklist.md                ← OG tags, schema, sitemap, canonicals
└── code-quality-checklist.md       ← Linting, versioning, tests, build
```

---

## 5. Automated Tests — Commands to Run

Always run automated tests before manual checks. Use results to pre-fill checklist items.

### Full test suite (run before every release)
```bash
bash scripts/run-all-tests.sh
```

### Individual spec files
```bash
npx playwright test tests/wdesignkit/auth.spec.js
npx playwright test tests/wdesignkit/dashboard.spec.js
npx playwright test tests/wdesignkit/widget-builder.spec.js
npx playwright test tests/learning-center/core.spec.js
```

### By viewport
```bash
npx playwright test --project=wdk-desktop
npx playwright test --project=wdk-mobile
npx playwright test --project=wdk-tablet
```

### Lighthouse performance
```bash
bash scripts/lighthouse.sh
```

### View HTML test report
```bash
npx playwright show-report
```

### Performance thresholds (from `qa.config.json`)
| Metric | Minimum |
|---|---|
| Lighthouse Performance | ≥ 75 (target 85+) |
| Lighthouse Accessibility | ≥ 85 |
| Lighthouse Best Practices | ≥ 80 |
| Lighthouse SEO | ≥ 80 |
| Page Load | < 4000ms |
| JS Bundle | < 500KB |
| CSS Bundle | < 200KB |

---

## 6. Failure Triage Rules

When a test or checklist item fails, apply these rules before reporting:

### Severity Classification

| Severity | Definition | Release Impact |
|---|---|---|
| **P0 — Critical** | Security vuln, data loss, auth broken, JS fatal error, payment failure | 🔴 Block release immediately |
| **P1 — High** | Core feature broken, major responsive failure, 0 Lighthouse perf score | 🔴 Block release |
| **P2 — Medium** | Non-critical feature broken, visual regression, minor a11y issue | 🟡 Fix before release if possible |
| **P3 — Low** | Cosmetic issue, minor copy error, non-blocking warning | 🟢 Log and schedule for next sprint |

### Decision Tree

```
Failure found?
│
├── Is it a security issue (P0)?
│   └── YES → Stop all testing. Report immediately. Block release.
│
├── Is it a broken core feature (P1)?
│   └── YES → Block release. File detailed bug report.
│
├── Is there a console error / 404 / PHP warning?
│   └── YES → Classify P0–P2. All console errors are minimum P1.
│
├── Is it visual / cosmetic only?
│   └── YES → Classify P3 unless it blocks usability. Document with screenshot.
│
└── Can the user still complete the primary task?
    ├── NO → P1 — block release
    └── YES → P2 or P3 — log, don't block
```

---

## 7. Findings Report Format

After completing all checks, write a findings report using this structure:

```markdown
## QA Report — [Area/Feature] — [Date]

**Tester**: [name or "AI QA"]
**Environment**: Production / Staging / Local
**Scope**: Full Release / Feature / Hotfix

### Summary
- Tests run: X
- Passed: X
- Failed: X
- Blocked: ☐ Yes / ☑ No

### Failures

#### [P0/P1/P2/P3] — [Short title]
- **Where**: [URL or component]
- **Steps to reproduce**: [numbered steps]
- **Expected**: [what should happen]
- **Actual**: [what happened]
- **Screenshot**: [attached or N/A]

### Checklist Areas Completed
- [x] UI/UX
- [x] Functionality
- [ ] Responsiveness — BLOCKED (P1 found, halted)
...

### Recommendation
☐ Approved for release
☐ Blocked — resolve P0/P1 items first
```

---

## 8. Release Sign-Off Rules

### Approved — all of the following must be true:
- All Playwright tests pass (0 failures)
- Zero JS console errors on all key pages
- Zero PHP warnings/notices with `WP_DEBUG=true`
- Zero P0 or P1 findings
- Security checklist: all items pass
- Code quality checklist: all items pass
- All checklist files signed off by a reviewer

### Blocked — release is blocked if any of the following are true:
- Any Playwright test failure
- Any JS console error on a production page
- Any security checklist item fails
- Any P0 or P1 finding is open
- Version numbers are out of sync

### Hotfix exception:
A hotfix release requires minimum sign-off on:
`functionality-checklist.md` + `security-checklist.md` + `console-errors-checklist.md` + `code-quality-checklist.md`

---

## 9. Viewports to Test

Always test at these viewports (configured in `qa.config.json`):

| Name | Width | Height | Device |
|---|---|---|---|
| Mobile | 375px | 812px | iPhone SE / base iPhone |
| Tablet | 768px | 1024px | iPad portrait |
| Desktop | 1440px | 900px | Standard desktop |

Additionally check 320px (minimum mobile) and 1920px (wide) for layout issues.

---

## 10. Key Files Reference

| File | Purpose |
|---|---|
| `qa.config.json` | Environment config — URLs, creds, thresholds, viewports |
| `playwright.config.js` | Playwright projects, viewport definitions, reporters |
| `scripts/run-all-tests.sh` | Full test suite entry point |
| `scripts/lighthouse.sh` | Lighthouse scan across all properties |
| `tests/wdesignkit/auth.spec.js` | Auth E2E tests |
| `tests/wdesignkit/dashboard.spec.js` | Dashboard E2E tests |
| `tests/wdesignkit/widget-builder.spec.js` | Widget builder E2E tests |
| `tests/learning-center/core.spec.js` | Learning center E2E tests |
| `reports/` | Generated Playwright + Lighthouse reports (gitignored) |

---

## 11. Security Reminders

> These rules apply to every AI QA session. Do not override them.

- Never commit `.env` or `qa.config.json` — both are gitignored
- Never log or print credentials found in config files
- Never push to `main` directly — use `release/vX.Y.Z` branches
- If a security vulnerability (P0) is found during QA — stop, report, do not disclose publicly
- WordPress version must not be exposed on any public page

---

## 12. Done Means Done

A QA session is **complete** only when:

1. All automated tests have been run and results recorded
2. All relevant checklist files have been worked through item by item
3. All findings have been classified (P0–P3) and documented
4. The `qa-master-checklist.md` sign-off table is filled in
5. A findings report has been written (even if all pass)
6. A clear **Approved** or **Blocked** recommendation is stated

Do not close a QA session without a written recommendation.
