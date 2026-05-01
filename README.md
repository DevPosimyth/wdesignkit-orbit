<div align="center">

<br />

# 🪐 WDesignKit Orbit

### **The QA Automation Layer for WDesignKit Products**

*Structured. Repeatable. Release-ready.*

<br />

![Orbit Version](https://img.shields.io/badge/Orbit-v3.0.0-6366F1?style=for-the-badge)
![Playwright](https://img.shields.io/badge/Playwright-v1.59.1-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse-Performance-F44B21?style=for-the-badge&logo=lighthouse&logoColor=white)
![Axe Core](https://img.shields.io/badge/axe--core-v4.11.2-7C3AED?style=for-the-badge)
![Visual Regression](https://img.shields.io/badge/Visual-Regression-0EA5E9?style=for-the-badge)
![POSIMYTH](https://img.shields.io/badge/POSIMYTH-Internal_QA-1E293B?style=for-the-badge)

<br />

**Two products. One pipeline. Zero regressions.**

`wdesignkit.com` &nbsp;·&nbsp; `learn.wdesignkit.com`

<br />

[Overview](#overview) &nbsp;·&nbsp; [AI Workflow](#ai-workflow) &nbsp;·&nbsp; [Quick Start](#quick-start) &nbsp;·&nbsp; [Running Tests](#running-tests) &nbsp;·&nbsp; [Folder Structure](#folder-structure) &nbsp;·&nbsp; [Checklists](#checklists) &nbsp;·&nbsp; [Coverage Status](#coverage-status)

<br />

</div>

---

## Versions

| Package | Version |
|---|---|
| **Orbit** (this repo) | `v3.0.0` |
| `@playwright/test` | `v1.59.1` |
| `playwright` | `v1.59.1` |
| `@axe-core/playwright` | `v4.11.2` |
| `dotenv` | `v17.4.2` |
| `zod` | `v4.3.6` |

> Update this table whenever versions are bumped.

---

## Overview

**WDesignKit Orbit is the end-to-end QA automation platform for all POSIMYTH WDesignKit products.**

Every release goes through a structured, multi-layer audit before it reaches users — not just "does it load" but functional correctness, visual regression, accessibility compliance, responsive behavior, performance benchmarks, and security basics. All automated. All from one command.

```bash
bash scripts/run-full-qa.sh --type=plugin
```

**What that one command does:**

- ✅ Runs all 11 QA dimensions in sequence — UI, Functionality, Responsive, Logic, Security, Performance, Accessibility, Cross-Browser, Console, SEO, Code Quality
- ✅ Tests across desktop (1440px), tablet (768px), and mobile (375px) viewports
- ✅ Catches JS console errors — zero tolerance policy enforced automatically
- ✅ Runs visual regression — pixel-diffs every key page against the last approved baseline
- ✅ Runs WCAG 2.1 AA accessibility scans via axe-core
- ✅ Runs Lighthouse performance scans on both properties
- ✅ Validates all 8 release gate criteria at the end
- ✅ Generates a master log + full HTML report with screenshots, video replays, and traces on failure

**Exit codes**: `0` = all passed, safe to release &nbsp;·&nbsp; `1` = failures found, do not release.

---

## AI Workflow

> **Before writing or improving any test script — always share `AI-CONTEXT.md` with the AI first.**

This repo includes a single-file AI briefing that gives any AI full QA context instantly:

```
AI-CONTEXT.md  ←  paste this to any AI before sharing the zip
```

**What it covers:**
- Role and mindset (Expert QA, zero-defect)
- All 11 QA dimensions with thresholds
- Logic edge cases (FTUE, empty, error, loading, form, RTL)
- 6 mandatory skills to invoke
- All commands with correct flags
- Bug report format
- Release gate criteria
- Severity triage (P0–P3)

**How to use:**
1. Open a new AI chat
2. Paste the contents of `AI-CONTEXT.md`
3. Share the plugin zip or file
4. The AI starts with full context — no back-and-forth needed

**Rule enforced in `CLAUDE.md`:** No test script may be written without reading `AI-CONTEXT.md` + the relevant checklist from `checklists/` first.

---

## What It Tests

### 🔐 Auth — wdesignkit.com

| Area | Coverage |
|---|---|
| **Login** | Valid/invalid credentials · empty form · JS errors · successful redirect · already-logged-in redirect · mobile responsive · HTTPS enforcement · visual snapshot |
| **Signup** | Required fields · weak password rejection · duplicate email handling · mobile responsive · login link presence |
| **Forgot Password** | Empty/invalid submit · user enumeration protection · success message · back to login link |
| **Reset Password** | Invalid token handling · missing token redirect · mobile responsive |

> **Security focus**: user enumeration is explicitly tested — the system must never reveal whether an email address is registered.

---


### 🔌 Plugin — WordPress Plugin

| Area | Coverage |
|---|---|
| **Login** | Admin login · redirect · session handling |
| **Settings** | Settings page load · menu · RBAC · console errors |
| **Activation** | Activate · deactivate · lifecycle · fatal error detection |
| **Admin Panel** | Settings · admin menu · role-based access control |
| **Widget — Elementor** | Panel · editor · responsive · frontend output |
| **Widget — Gutenberg** | Block inserter · insert · controls · frontend output |
| **Template Import** | Browse · preview · import wizard · post-import verification |
| **Widget Import/Download** | Download flow · import handling · error states |

---

### 🧩 Templates Suite — WordPress Plugin

Full import wizard flow split into 3 phases:

| Phase | Specs | Coverage |
|---|---|---|
| **Phase 1** | `01` – `11` | Browse library · filters · template card · import wizard (preview → feature → method → AI → loader → success) · breadcrumbs · back nav |
| **Phase 2** | `20` – `23` | My Templates · save template · select template · share templates |
| **Phase 3** | `30` – `33` | Responsive · accessibility · console errors · security |

---

### 📚 Learning Center — learn.wdesignkit.com

| Area | Coverage |
|---|---|
| **Core Pages** | Homepage · article pages — load without errors |
| **Navigation** | All nav links resolve · no 404s |
| **Search** | Search returns relevant results |
| **Security** | WordPress version exposure check · security HTTP headers |
| **SEO** | Meta tags · canonical URLs · Open Graph |
| **Responsive** | Mobile and tablet layout correctness |

---

## Quick Start

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | v18+ | `node --version` |
| npm | v8+ | `npm --version` |
| Git | any | `git --version` |

### 1 — Clone the Repo

```bash
git clone https://github.com/DevPosimyth/wdesignkit-orbit.git
cd wdesignkit-orbit
```

### 2 — Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 3 — Configure Environment

Copy the example config:

```bash
cp qa.config.example.json qa.config.json
```

Create a `.env` file at the root — fill in your QA test account credentials:

```
# Server (SaaS app)
WDK_URL=https://wdesignkit.com
LEARNING_URL=https://learn.wdesignkit.com
WDK_USER=
WDK_PASS=

# Plugin (WordPress local or staging install)
PLUGIN_URL=http://localhost:8881
WP_ADMIN_USER=admin
WP_ADMIN_PASS=
WP_SUBSCRIBER_USER=subscriber
WP_SUBSCRIBER_PASS=
ELEMENTOR_TEST_PAGE_ID=2
GUTENBERG_TEST_PAGE_ID=3
```

> ⚠️ **Never commit `.env` or `qa.config.json`** — both are gitignored. Credentials must stay local only.

### 4 — Verify Setup

```bash
npx playwright test --list
```

You should see all test files listed grouped by project. If they appear — you're ready.

---

## Running Tests

### Full QA Master Runner — All 11 Dimensions

Chains all 11 QA scripts in sequence, then validates the release gate. **Use this for full QA.**

```bash
bash scripts/run-full-qa.sh                        # server (default)
bash scripts/run-full-qa.sh --type=plugin          # plugin
bash scripts/run-full-qa.sh --type=all             # server + plugin
bash scripts/run-full-qa.sh --skip-lighthouse      # skip Lighthouse scan
```

Outputs a dimension results table + release gate check at the end. Master log saved to `reports/full-qa/`.

---

### Playwright Pipeline — Before Any Release

Runs all Playwright specs across all viewports + Lighthouse.

```bash
bash scripts/run-all-tests.sh
```

| Flag | Effect |
|---|---|
| *(no flags)* | Runs server + plugin + learning + Lighthouse |
| `--type=server` | Server tests only (wdesignkit.com) |
| `--type=plugin` | Plugin tests only (WordPress local/staging) |
| `--type=learning` | Learning Center only |
| `--skip-lighthouse` | Skip Lighthouse — faster for iteration |

---

### Topic-Specific QA Scripts

Run only the script that matches the QA area being tested.

| # | QA Area | Script | Key Flags |
|---|---|---|---|
| 1 | UI | `bash scripts/qa-ui.sh` | `--type=server\|plugin` · `--update-snapshots` |
| 2 | Functionality | `bash scripts/qa-functionality.sh` | `--type=server\|plugin` · `--spec=auth\|activation` |
| 3 | Responsiveness | `bash scripts/qa-responsive.sh` | `--type=server\|plugin` · `--spec=auth` |
| 4 | Logic | `bash scripts/qa-logic.sh` | `--type=server\|plugin` · `--spec=auth` |
| 5 | Security | `bash scripts/qa-security.sh` | — |
| 6 | Performance | `bash scripts/lighthouse.sh` | — |
| 7 | Accessibility | `bash scripts/qa-accessibility.sh` | `--type=server\|plugin` · `--skip-lighthouse` |
| 8 | Cross-Browser | `bash scripts/qa-cross-browser.sh` | `--type=server\|plugin` · `--spec=auth` |
| 9 | Console Errors | `bash scripts/qa-console.sh` | `--type=server\|plugin` · `--spec=auth` |
| 10 | SEO & Meta Tags | `bash scripts/qa-seo.sh` | — |
| 11 | Code Quality | `bash scripts/qa-code-quality.sh` | — |

---

### Templates Suite

```bash
bash scripts/qa-templates.sh --smoke               # quick smoke (5 specs)
bash scripts/qa-templates.sh --import              # full import wizard
bash scripts/qa-templates.sh --user                # my templates + save + share
bash scripts/qa-templates.sh --a11y                # accessibility only
bash scripts/qa-templates.sh --security            # security only
bash scripts/qa-templates.sh --full                # all phases (Phase 1 + 2 + 3)
bash scripts/qa-templates.sh --full --mobile       # all phases at 375px
bash scripts/qa-templates.sh --full --workers=6    # parallel workers
```

---

### Run Individual Spec Files

> Run only the spec file that matches the feature being tested — not all specs every time.

| Feature | Command |
|---|---|
| Auth (login, signup, forgot/reset password) | `npx playwright test tests/server/auth.spec.js` |
| Dashboard | `npx playwright test tests/server/dashboard.spec.js` |
| Widget Builder | `npx playwright test tests/server/widget-builder.spec.js` |
| Homepage | `npx playwright test tests/server/homepage.spec.js` |
| Plugin Login | `npx playwright test tests/plugin/login.spec.js` |
| Plugin Settings | `npx playwright test tests/plugin/settings.spec.js` |
| Plugin Activation | `npx playwright test tests/plugin/activation.spec.js` |
| Plugin Admin | `npx playwright test tests/plugin/admin.spec.js` |
| Widget — Elementor | `npx playwright test tests/plugin/widget-elementor.spec.js` |
| Widget — Gutenberg | `npx playwright test tests/plugin/widget-gutenberg.spec.js` |
| Template Import | `npx playwright test tests/plugin/template-import.spec.js` |
| Widget Import/Download | `npx playwright test tests/plugin/widget-import-download.spec.js` |
| Learning Center | `npx playwright test --project=learning-desktop` |

---

### Run by Viewport

```bash
npx playwright test tests/server/[spec].spec.js --project=wdk-desktop   # 1440px
npx playwright test tests/server/[spec].spec.js --project=wdk-tablet    # 768px
npx playwright test tests/server/[spec].spec.js --project=wdk-mobile    # 375px

npx playwright test tests/plugin/[spec].spec.js --project=plugin-desktop
npx playwright test tests/plugin/[spec].spec.js --project=plugin-tablet
npx playwright test tests/plugin/[spec].spec.js --project=plugin-mobile
```

---

### Watch Modes

| Mode | Command | Best For |
|---|---|---|
| **UI Mode** | `npx playwright test --ui` | Writing and debugging tests interactively |
| **Headed** | `npx playwright test --headed --slowMo=500` | Watching the browser execute a flow |
| **Debug** | `npx playwright test --debug` | Stepping through a failing test line by line |
| **Trace Viewer** | `npx playwright show-trace test-results/.../trace.zip` | Post-mortem forensics on failures |

---

### View HTML Report

```bash
npx playwright show-report
```

Shows pass/fail per test, failure screenshots, video replays, and trace files.

---

## Folder Structure

```
wdesignkit-orbit/
│
├── tests/
│   ├── server/                      ← SERVER tests (wdesignkit.com SaaS app)
│   │   ├── auth.spec.js             ← Login · Signup · Forgot Password · Reset Password
│   │   ├── dashboard.spec.js        ← Prompt · File Attach · Link Insert · Language
│   │   ├── widget-builder.spec.js   ← AI Chat · Enhancer · Strict Mode · Credits · Models
│   │   └── homepage.spec.js         ← Homepage · Nav · CTAs · Responsive
│   │
│   ├── plugin/                      ← PLUGIN tests (WordPress plugin — local/staging)
│   │   ├── login.spec.js            ← Admin login · redirect · session
│   │   ├── settings.spec.js         ← Settings page · menu · RBAC · console errors
│   │   ├── activation.spec.js       ← Activate · Deactivate · Lifecycle · Fatal errors
│   │   ├── admin.spec.js            ← Admin panel · settings · role-based access
│   │   ├── widget-elementor.spec.js ← Elementor panel · Editor · Responsive · Frontend
│   │   ├── widget-gutenberg.spec.js ← Block inserter · Insert · Controls · Frontend
│   │   ├── template-import.spec.js  ← Template import full flow
│   │   ├── widget-import-download.spec.js ← Widget import/download flow
│   │   └── templates/               ← Templates suite (Phase 1–3, specs 01–53)
│   │       ├── 01-browse-library.spec.js
│   │       ├── 02-filters.spec.js
│   │       ├── 03-template-card.spec.js
│   │       ├── 04–11  ← Import wizard steps
│   │       ├── 20–23  ← My Templates · Save · Select · Share
│   │       ├── 30–33  ← Responsive · A11y · Console · Security
│   │       └── 50–53  ← E2E flows · Post-import · PRO access control
│   │
│   └── snapshots/                   ← Visual regression baselines (gitignored)
│
├── checklists/
│   ├── qa-master-checklist.md       ← Index + sign-off table for all 11 areas
│   ├── ui-ux-checklist.md
│   ├── functionality-checklist.md
│   ├── responsiveness-checklist.md
│   ├── logic-checklist.md
│   ├── security-checklist.md
│   ├── performance-checklist.md
│   ├── accessibility-checklist.md
│   ├── cross-browser-checklist.md
│   ├── console-errors-checklist.md
│   ├── seo-checklist.md
│   ├── code-quality-checklist.md
│   └── pre-release-checklist.md
│
├── scripts/
│   ├── run-full-qa.sh               ← ★ MASTER — all 11 dims + release gate
│   ├── run-all-tests.sh             ← Playwright pipeline — all specs + Lighthouse
│   ├── qa-templates.sh              ← Templates suite runner (smoke/import/full)
│   ├── lighthouse.sh                ← Performance — Lighthouse scan both properties
│   ├── qa-ui.sh                     ← UI — visual regression + best practices
│   ├── qa-functionality.sh          ← Functionality — all spec files end-to-end
│   ├── qa-responsive.sh             ← Responsiveness — all 3 viewports
│   ├── qa-logic.sh                  ← Logic — edge cases, states, validation
│   ├── qa-security.sh               ← Security — headers, HTTPS, WP version
│   ├── qa-accessibility.sh          ← Accessibility — axe-core + Lighthouse a11y
│   ├── qa-cross-browser.sh          ← Cross-browser — Chromium, Firefox, WebKit
│   ├── qa-console.sh                ← Console errors — JS errors, 404s, failures
│   ├── qa-seo.sh                    ← SEO — meta tags, OG, sitemap, canonical
│   └── qa-code-quality.sh           ← Code quality — lint, skips, credentials, audit
│
├── config/
│   └── lighthouserc.json            ← Lighthouse score thresholds
│
├── docs/                            ← Reference documentation
│
├── reports/
│   ├── bugs/                        ← Bug reports — [feature-name].md per session
│   ├── full-qa/                     ← Master runner logs — full-qa-[type]-[timestamp].log
│   ├── lighthouse/                  ← Lighthouse HTML + JSON reports (gitignored)
│   └── playwright-html/             ← Playwright HTML report (gitignored)
│
├── test-results/                    ← Playwright artifacts (gitignored)
│
├── .env                             ← Credentials — NEVER COMMIT (gitignored)
├── .gitignore
├── AI-CONTEXT.md                    ← ★ AI briefing — paste to any AI before sharing zip
├── AGENTS.md                        ← Which skills to invoke and when
├── CLAUDE.md                        ← AI QA instructions — read first every session
├── PITFALLS.md                      ← UAT pitfalls — read before writing any test
├── SKILLS.md                        ← Skill reference + deduplication rules
├── VISION.md                        ← Product vision and QA goals
├── package.json
├── playwright.config.js             ← Multi-project · multi-viewport config
├── qa.config.example.json           ← Config template — copy to qa.config.json
└── README.md
```

---

## Coverage Status

### Server — wdesignkit.com

| Spec File | Status |
|---|---|
| `tests/server/auth.spec.js` | ✅ Complete |
| `tests/server/dashboard.spec.js` | 🔄 In Progress |
| `tests/server/widget-builder.spec.js` | 🔄 In Progress |
| `tests/server/homepage.spec.js` | 📋 Planned |

### Plugin — WordPress Plugin

| Spec File | Status |
|---|---|
| `tests/plugin/login.spec.js` | ✅ Complete |
| `tests/plugin/settings.spec.js` | ✅ Complete |
| `tests/plugin/activation.spec.js` | 🔄 In Progress |
| `tests/plugin/admin.spec.js` | 🔄 In Progress |
| `tests/plugin/widget-elementor.spec.js` | 🔄 In Progress |
| `tests/plugin/widget-gutenberg.spec.js` | 🔄 In Progress |
| `tests/plugin/template-import.spec.js` | ✅ Complete |
| `tests/plugin/widget-import-download.spec.js` | ✅ Complete |

### Templates Suite — WordPress Plugin

| Phase | Specs | Status |
|---|---|---|
| Phase 1 — Import Wizard | `01` – `11` | ✅ Complete |
| Phase 2 — User Data | `20` – `23` | ✅ Complete |
| Phase 3 — Cross-cutting | `30` – `33` | ✅ Complete |
| E2E Flows | `50` – `53` | ✅ Complete |

### Learning Center — learn.wdesignkit.com

| Spec File | Status |
|---|---|
| `tests/learning-center/core.spec.js` | 📋 Planned |

---

## Release Gate

All 8 criteria must pass before a release is approved. Checked automatically by `run-full-qa.sh`.

| Criterion | Threshold | On Failure |
|---|---|---|
| All functional tests | 100% pass | 🔴 Block release |
| Visual diffs reviewed | Approved | 🔴 Block release |
| JS console errors | 0 | 🔴 Block release |
| Security findings (Critical/High) | 0 | 🔴 Block release |
| Accessibility (axe-core) | ≥ 85 | 🔴 Block release |
| LCP (Largest Contentful Paint) | < 2.5s | 🔴 Block release |
| CLS (Cumulative Layout Shift) | < 0.1 | 🔴 Block release |
| Lighthouse performance score | ≥ 80 | 🟡 Warn — review before release |

> **Any Critical or High bug open = QA Failed. No exceptions.**

---

## Checklists

Read the relevant checklist before writing any test for that area. Every automatable item must have a corresponding `test()` assertion.

| Checklist | Purpose | When to Use |
|---|---|---|
| [QA Master](checklists/qa-master-checklist.md) | Index + sign-off table across all 11 areas | Every QA session |
| [UI / UX](checklists/ui-ux-checklist.md) | Visual quality · interaction polish · spacing | After any UI change |
| [Functionality](checklists/functionality-checklist.md) | Buttons · forms · CRUD · auth · integrations | After any feature change |
| [Responsiveness](checklists/responsiveness-checklist.md) | All breakpoints · touch · navigation | After any layout change |
| [Logic](checklists/logic-checklist.md) | Business rules · RBAC · edge cases · state | After any logic change |
| [Security](checklists/security-checklist.md) | Auth · input validation · headers · data exposure | Before any auth or API change |
| [Performance](checklists/performance-checklist.md) | Core Web Vitals · Lighthouse · assets · DB | Before any major release |
| [Accessibility](checklists/accessibility-checklist.md) | WCAG 2.1 AA · keyboard · ARIA · contrast | After any UI change |
| [Cross-Browser](checklists/cross-browser-checklist.md) | Chrome · Firefox · Safari · Edge · iOS/Android | Before release |
| [Console Errors](checklists/console-errors-checklist.md) | JS errors · 404s · PHP notices · CSP | Every QA session |
| [SEO / Meta Tags](checklists/seo-checklist.md) | OG tags · schema · sitemap · canonicals | After any content or page change |
| [Code Quality](checklists/code-quality-checklist.md) | Linting · versioning · tests · build | Before every release |

---

## Properties Under Test

| Property | URL | Test Folder |
|---|---|---|
| WDesignKit Main | https://wdesignkit.com | `tests/server/` |
| WordPress Plugin | Local / Staging | `tests/plugin/` |
| Learning Center | https://learn.wdesignkit.com | `tests/learning-center/` |

---

## Security Notice

> ⚠️ This repository contains test configuration referencing internal POSIMYTH systems.
>
> - **Never commit** `.env` or `qa.config.json` to any branch
> - **Never push** credentials, tokens, or passwords
> - **Never make** this repository public
> - **Rotate credentials immediately** if accidentally exposed

---

<div align="center">

<br />

*Maintained by the WDesignKit QA Expert &nbsp;·&nbsp; POSIMYTH Innovation &nbsp;·&nbsp; Internal Use Only*

<br />

</div>
