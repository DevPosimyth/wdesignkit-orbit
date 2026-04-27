<div align="center">

<br />

# 🪐 WDesignKit Orbit

### **The QA Automation Layer for WDesignKit Products**

*Structured. Repeatable. Release-ready.*

<br />

![Version](https://img.shields.io/badge/Orbit-v2.5.0-6366F1?style=for-the-badge)
![Playwright](https://img.shields.io/badge/Playwright-v1.59.1-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse-Performance-F44B21?style=for-the-badge&logo=lighthouse&logoColor=white)
![Axe Core](https://img.shields.io/badge/axe--core-v4.11.2-7C3AED?style=for-the-badge)
![Visual Regression](https://img.shields.io/badge/Visual-Regression-0EA5E9?style=for-the-badge)
![POSIMYTH](https://img.shields.io/badge/POSIMYTH-Internal_QA-1E293B?style=for-the-badge)

<br />

**Two products. One pipeline. Zero regressions.**

`wdesignkit.com` &nbsp;·&nbsp; `learn.wdesignkit.com`

<br />

[What It Tests](#what-it-tests) &nbsp;·&nbsp; [Quick Start](#quick-start) &nbsp;·&nbsp; [Running Tests](#running-tests) &nbsp;·&nbsp; [Folder Structure](#folder-structure) &nbsp;·&nbsp; [Checklists](#checklists) &nbsp;·&nbsp; [Coverage Status](#coverage-status)

<br />

</div>

---

## Overview

**WDesignKit Orbit is the end-to-end QA automation platform for all POSIMYTH WDesignKit products.**

Every release goes through a structured, multi-layer audit before it reaches users — not just "does it load" but functional correctness, visual regression, accessibility compliance, responsive behavior, performance benchmarks, and security basics. All automated. All from one command.

```bash
bash scripts/run-all-tests.sh
```

**What that one command does:**

- ✅ Runs all Playwright E2E tests across `wdesignkit.com` and `learn.wdesignkit.com`
- ✅ Tests across desktop (1440px), tablet (768px), and mobile (375px) viewports
- ✅ Catches JS console errors — zero tolerance policy enforced automatically
- ✅ Runs visual regression — pixel-diffs every key page against the last approved baseline
- ✅ Runs WCAG 2.1 AA accessibility scans via axe-core
- ✅ Runs Lighthouse performance scans on both properties
- ✅ Generates a full HTML report with screenshots, video replays, and traces on failure

**Exit codes**: `0` = all passed, safe to release &nbsp;·&nbsp; `1` = failures found, do not release.

---

## What It Tests

### 🔐 Auth Pages — wdesignkit.com

Every authentication flow validated for functionality, security, and UX:

| Area | Coverage |
|---|---|
| **Login** | Valid/invalid credentials · empty form · JS errors · successful redirect · already-logged-in redirect · mobile responsive · HTTPS enforcement · visual snapshot |
| **Signup** | Required fields · weak password rejection · duplicate email handling · mobile responsive · login link presence |
| **Forgot Password** | Empty/invalid submit · user enumeration protection · success message · back to login link |
| **Reset Password** | Invalid token handling · missing token redirect · mobile responsive |

> **Security focus**: user enumeration is explicitly tested — the system must never reveal whether an email address is registered.

---

### 🖥️ Dashboard — wdesignkit.com

| Area | Coverage |
|---|---|
| **Prompt Field** | Load · input · submission · character limits · empty submit behavior |
| **File Attach** | Supported formats · oversized file rejection · multiple file handling |
| **Link Insertion** | Valid/invalid URL handling · duplicate link behavior |
| **Language Selector** | Dropdown visibility · selection · persistence across sessions |
| **Responsive** | All features tested at 375px · 768px · 1440px |

---

### 🤖 Widget Builder AI Chat — wdesignkit.com

| Area | Coverage |
|---|---|
| **Attach Files** | File type validation · size limits · error messaging |
| **Prompt Enhancer** | Toggle behavior · enhancement output |
| **Strict Mode** | Toggle behavior · mode persistence |
| **AI Model Selection** | Dropdown visibility · model switching · persistence |
| **User Credits** | Display accuracy · deduction on use · zero-credit state |
| **Suggested Widgets** | Visibility · clickability · relevance |
| **Chat Management** | New chat · history access · deletion |
| **Chat Controls** | Copy · regenerate · feedback submission |

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
WDK_URL=https://wdesignkit.com
LEARNING_URL=https://learn.wdesignkit.com
WDK_USER=
WDK_PASS=
```

> ⚠️ **Never commit `.env` or `qa.config.json`** — both are gitignored. Credentials must stay local only.

### 4 — Verify Setup

```bash
npx playwright test --list
```

You should see all test files listed grouped by project. If they appear — you're ready.

---

## Running Tests

### Full Run — Before Any Release

```bash
bash scripts/run-all-tests.sh
```

| Flag | Effect |
|---|---|
| *(no flags)* | Runs all tests + Lighthouse on both properties |
| `--skip-lighthouse` | Skips Lighthouse — faster for dev iteration |
| `--property=wdesignkit` | Tests wdesignkit.com only |
| `--property=learning` | Tests learn.wdesignkit.com only |

---

### Run Individual Spec Files

> Run only the spec file that matches the feature being tested — not all specs every time.

| Feature | Command |
|---|---|
| Auth (login, signup, forgot/reset password) | `npx playwright test tests/wdesignkit/auth.spec.js` |
| Dashboard | `npx playwright test tests/wdesignkit/dashboard.spec.js` |
| Widget Builder | `npx playwright test tests/wdesignkit/widget-builder.spec.js` |
| Homepage | `npx playwright test tests/wdesignkit/homepage.spec.js` |
| Learning Center | `npx playwright test --project=learning-desktop` |

---

### Run by Viewport

```bash
npx playwright test tests/wdesignkit/[spec].spec.js --project=wdk-desktop
npx playwright test tests/wdesignkit/[spec].spec.js --project=wdk-mobile
npx playwright test tests/wdesignkit/[spec].spec.js --project=wdk-tablet
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

### Lighthouse Performance Scan

```bash
bash scripts/lighthouse.sh
```

Scans both properties and reports Performance, Accessibility, SEO, and Best Practices scores.

> Requires Lighthouse: `npm install -g lighthouse`

---

## Folder Structure

```
wdesignkit-orbit/
│
├── tests/
│   ├── wdesignkit/
│   │   ├── auth.spec.js             ← Login · Signup · Forgot Password · Reset Password
│   │   ├── dashboard.spec.js        ← Prompt · File Attach · Link Insert · Language
│   │   ├── widget-builder.spec.js   ← AI Chat · Enhancer · Strict Mode · Credits · Models
│   │   └── homepage.spec.js         ← Homepage · Nav · CTAs · Responsive
│   │
│   └── snapshots/                   ← Visual regression baselines (gitignored)
│
├── checklists/
│   ├── qa-master-checklist.md       ← Index + sign-off table for all 11 areas
│   ├── ui-ux-checklist.md           ← Layout, spacing, animation, depth
│   ├── functionality-checklist.md   ← Buttons, forms, CRUD, auth, integrations
│   ├── responsiveness-checklist.md  ← 320px → 1920px, touch, navigation
│   ├── logic-checklist.md           ← Business rules, RBAC, edge cases, state
│   ├── security-checklist.md        ← Auth · Input · Headers · Data exposure
│   ├── performance-checklist.md     ← Core Web Vitals · Lighthouse · assets
│   ├── accessibility-checklist.md   ← WCAG 2.1 AA · keyboard · ARIA · contrast
│   ├── cross-browser-checklist.md   ← Chrome · Firefox · Safari · Edge · iOS/Android
│   ├── console-errors-checklist.md  ← JS errors · 404s · PHP notices · CSP
│   ├── seo-checklist.md             ← OG tags · schema · sitemap · canonicals
│   └── code-quality-checklist.md   ← Linting · versioning · tests · build
│
├── config/
│   └── lighthouserc.json            ← Lighthouse score thresholds
│
├── scripts/
│   ├── run-all-tests.sh             ← One command: full test + Lighthouse run
│   └── lighthouse.sh                ← Lighthouse scan across both properties
│
├── docs/                            ← Reference documentation
├── reports/
│   ├── bugs/                        ← Bug reports — [feature-name].md per session
│   ├── lighthouse/                  ← Lighthouse HTML + JSON reports (gitignored)
│   └── playwright-html/             ← Playwright HTML report (gitignored)
├── test-results/                    ← Playwright artifacts (gitignored)
│
├── .env                             ← Credentials — NEVER COMMIT (gitignored)
├── .gitignore
├── CLAUDE.md                        ← AI QA instructions — read first every session
├── package.json
├── playwright.config.js             ← Multi-project · multi-viewport config
├── qa.config.example.json           ← Config template — copy to qa.config.json
├── qa.config.json                   ← Your local config — NEVER COMMIT (gitignored)
└── README.md
```

---

## Coverage Status

| Spec File | Status | Tests | Property |
|---|---|---|---|
| `tests/wdesignkit/auth.spec.js` | ✅ Complete | 45 | wdesignkit.com |
| `tests/wdesignkit/dashboard.spec.js` | 🔄 In Progress | — | wdesignkit.com |
| `tests/wdesignkit/widget-builder.spec.js` | 🔄 In Progress | — | wdesignkit.com |
| `tests/wdesignkit/homepage.spec.js` | 📋 Planned | — | wdesignkit.com |
| `tests/learning-center/core.spec.js` | 📋 Planned | — | learn.wdesignkit.com |

---

## Release Thresholds

| Check | Threshold | On Failure |
|---|---|---|
| E2E tests passing | 100% | 🔴 Block release |
| JS console errors | 0 | 🔴 Block release |
| Security findings (critical/high) | 0 | 🔴 Block release |
| Accessibility score | ≥ 85 | 🔴 Block release |
| Mobile horizontal scroll | None | 🔴 Block release |
| Lighthouse performance | ≥ 75 | 🟡 Warn — review before release |
| Visual regression diffs | 0 unintended | 🟡 Warn — review before release |
| Lighthouse SEO | ≥ 80 | 🟡 Warn — review before release |

---

## Checklists

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
| WDesignKit Main | https://wdesignkit.com | `tests/wdesignkit/` |
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
