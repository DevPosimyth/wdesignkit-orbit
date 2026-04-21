<div align="center">

# 🪐 WDesignKit Orbit

### **Complete UAT for WDesignKit Products**

*Every perspective. Every release. QA → Dev → PM → Designer → End User.*

![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse-Performance-F44B21?style=for-the-badge&logo=lighthouse&logoColor=white)
![WDesignKit](https://img.shields.io/badge/WDesignKit-QA-6366F1?style=for-the-badge)
![Sproutos](https://img.shields.io/badge/Sproutos.ai-QA-10B981?style=for-the-badge)

**🧪 QA** → structured test coverage &nbsp;·&nbsp; **🎨 Designer** → visual regression + UI audits &nbsp;·&nbsp; **📊 PM** → Lighthouse scores + release sign-off &nbsp;·&nbsp; **👤 End User** → real browser, real flows

Covers **wdesignkit.com · sproutos.ai · learn.wdesignkit.com**

[Quick Start](#quick-start) · [What It Tests](#what-it-tests) · [Running Tests](#running-tests) · [Folder Structure](#folder-structure)

</div>

---

## What This Is

**WDesignKit Orbit is the UAT automation layer for all POSIMYTH WDesignKit products.** Not just smoke tests — every angle a release gets judged from before users touch it: functional correctness, visual regression, accessibility, responsive behavior, and security basics.

One command and you get:

- ✅ Playwright E2E tests across all WDesignKit properties
- ✅ Visual regression snapshots — pixel diff between releases
- ✅ Responsive tests — mobile (375px), tablet (768px), desktop (1440px)
- ✅ Accessibility scans — WCAG 2.1 AA via axe-core
- ✅ Console error detection — zero JS errors policy
- ✅ Lighthouse performance scores — Core Web Vitals per property
- ✅ Security basics — HTTPS enforcement, no mixed content, user enumeration checks

**Products covered**:
- `wdesignkit.com` — Auth pages, Dashboard, Widget Builder AI chat
- `learn.wdesignkit.com` — Learning Center documentation site

---

## What It Tests

### Auth Pages — wdesignkit.com & sproutos.ai

| Area | What It Catches |
|---|---|
| **Login** | Empty/invalid form, wrong credentials, show/hide password, successful login, already-logged-in redirect, mobile responsive, visual snapshot |
| **Signup** | Required fields, weak password rejection, duplicate email error, mobile responsive |
| **Forgot Password** | Empty/invalid submit, user enumeration protection, success message, back to login link |
| **Reset Password** | Invalid token handling, missing token redirect, mobile responsive |

### Dashboard — wdesignkit.com

| Area | What It Catches |
|---|---|
| **Prompt Field** | Load, input, submission, character limits |
| **File Attach** | Supported formats, oversized file rejection, multiple files |
| **Link Insertion** | Valid/invalid URL handling, duplicate links |
| **Language Selector** | Dropdown visibility, selection, persistence |

### Widget Builder AI Chat — wdesignkit.com

| Area | What It Catches |
|---|---|
| **Attach Files** | File type validation, size limits |
| **Prompt Enhancer** | Toggle, enhancement output |
| **Strict Mode** | Toggle behavior, mode persistence |
| **AI Model Selection** | Dropdown, model switching |
| **User Credits** | Display, deduction on use |
| **Suggested Widgets** | Visibility, clickability |
| **Chat Management** | New chat, history, deletion |
| **Chat Controls** | Copy, regenerate, feedback |


### Learning Center — learn.wdesignkit.com

| Area | What It Catches |
|---|---|
| **Core Pages** | Load without errors, navigation, search |
| **Security Headers** | CSRF, HTTP security headers, WordPress version exposure |
| **SEO** | Meta tags, canonical URLs, sitemap |
| **Responsive** | Mobile/tablet/desktop layout |

---

## Quick Start

### Prerequisites

- Node.js v18+ installed
- Git installed
- A WDesignKit QA test account

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

### 3 — Create Your `.env` File

Create a `.env` file in the root (already gitignored):

```
WDK_USER= tester0107@yopmail.com
WDK_PASS=Tester
WDK_URL=https://wdesignkit.com
LEARNING_URL=https://learn.wdesignkit.com
```

### 4 — Run Your First Test

```bash
npx playwright test tests/wdesignkit/auth.spec.js --headed
```

---

## Running Tests

### Run All WDesignKit Tests
```bash
npx playwright test tests/wdesignkit/
```

### Run All Sproutos Tests
```bash
npx playwright test tests/sproutos/
```

### Run a Specific Spec File
```bash
npx playwright test tests/wdesignkit/auth.spec.js
npx playwright test tests/wdesignkit/dashboard.spec.js
npx playwright test tests/wdesignkit/widget-builder.spec.js
```

### Run in Headed Mode (Watch the Browser)
```bash
npx playwright test --headed --slowMo=500
```

### Run in UI Mode (Interactive — Recommended)
```bash
npx playwright test --ui
```
Opens a full GUI — click any test to run it individually, time-travel through DOM snapshots.

### Run in Debug Mode (Step Through Line by Line)
```bash
npx playwright test --debug
```

### Run on Mobile Viewport Only
```bash
npx playwright test --project=mobile
```

### View HTML Report After Any Run
```bash
npx playwright show-report
```

---

## Folder Structure

```
wdesignkit-orbit/
├── tests/
│   ├── wdesignkit/
│   │   ├── auth.spec.js            ← Login, Signup, Forgot Password, Reset Password
│   │   ├── dashboard.spec.js       ← Prompt field, File attach, Link insert, Language selector
│   │   ├── widget-builder.spec.js  ← AI chat, Prompt enhancer, Strict mode, Credits, Models
│   │   └── homepage.spec.js        ← Homepage load, Nav, CTAs, Responsive
│   ├── sproutos/
│   │   ├── auth.spec.js            ← Sproutos.ai auth pages
│   │   └── dashboard.spec.js       ← Sproutos.ai dashboard prompt area
│   └── learning-center/
│       └── core.spec.js            ← learn.wdesignkit.com pages
├── checklists/
│   ├── pre-release-checklist.md    ← Full sign-off before any release
│   ├── ui-ux-checklist.md          ← Design quality checklist
│   ├── performance-checklist.md    ← Core Web Vitals, assets
│   └── security-checklist.md       ← XSS, CSRF, SQLi, auth
├── config/
│   └── lighthouserc.json           ← Performance/a11y thresholds
├── docs/                           ← Reference documentation
├── scripts/                        ← Automation scripts
├── .env                            ← Your credentials (gitignored)
├── .gitignore
├── package.json
├── playwright.config.js
├── qa.config.example.json          ← Copy to qa.config.json and fill in
└── README.md
```

---

## Coverage Targets

| Metric | Minimum | Target | Blocks Release? |
|---|---|---|---|
| E2E tests passing | 100% | 100% | Yes |
| JS console errors | 0 | 0 | Yes |
| Security findings (critical/high) | 0 | 0 | Yes |
| Accessibility score | 85 | 95+ | Yes |
| Lighthouse performance | 75 | 85+ | Warn only |
| Visual diffs (unintended) | 0 | 0 | Warn only |
| Mobile responsive — no horizontal scroll | Yes | Yes | Yes |

---

## Test Areas Status

| Spec File | Status | Tests |
|---|---|---|
| `tests/wdesignkit/auth.spec.js` | ✅ Ready | 45 tests |
| `tests/wdesignkit/dashboard.spec.js` | 🔄 In Progress | — |
| `tests/wdesignkit/widget-builder.spec.js` | 🔄 In Progress | — |
| `tests/wdesignkit/homepage.spec.js` | 📋 Planned | — |
| `tests/sproutos/auth.spec.js` | 📋 Planned | — |
| `tests/sproutos/dashboard.spec.js` | 📋 Planned | — |
| `tests/learning-center/core.spec.js` | 📋 Planned | — |

---

## Checklists

- [Pre-Release Checklist](checklists/pre-release-checklist.md) — full sign-off before any WDesignKit release
- [UI/UX Checklist](checklists/ui-ux-checklist.md) — design quality (40 points)
- [Performance Checklist](checklists/performance-checklist.md) — Core Web Vitals, assets
- [Security Checklist](checklists/security-checklist.md) — XSS, CSRF, SQLi, auth

---

## Properties Under Test

| Property | URL | Focus Areas |
|---|---|---|
| WDesignKit Main | https://wdesignkit.com | Auth, Dashboard, Widget Builder |
| Learning Center | https://learn.wdesignkit.com | Docs, SEO, Security |

---

## Philosophy

Three rules this repo follows:

1. **Every bug we document manually should have an automated test.** If we caught it in a ClickUp audit, it becomes a Playwright assertion.
2. **Real browser, real flows.** No mocking — tests run against the live site the same way a user would.
3. **Visual regression is non-negotiable.** Every key page has a snapshot baseline. Any pixel change gets flagged before release.

---

*Maintained by the WDesignKit QA Team · POSIMYTH · Internal Use Only*