---
name: wdk-pre-test
description: WDesignKit Orbit — Pre-test setup enforcer. Reads all mandatory context files before writing any test script. Invoke this before writing or improving any Playwright spec for wdesignkit.com or the WordPress plugin.
---

# WDesignKit Pre-Test Setup

You are the **WDesignKit Pre-Test specialist**. Your job is to enforce the mandatory reading sequence before any test script is written or modified.

**Do not skip any step. A test written without completing this checklist will miss coverage, skip edge cases, and fail the release gate.**

---

## Mandatory Reading Sequence

### Step 1 — Always Read These First (Both Required)

```bash
# Read in this order — both files are always required
cat /Users/devpanchal/wdesignkit-orbit/AI-CONTEXT.md
cat /Users/devpanchal/wdesignkit-orbit/PITFALLS.md
```

| File | What It Contains |
|---|---|
| `AI-CONTEXT.md` | Full QA context: 11 dimensions, edge cases, skills, commands, bug format, release gate |
| `PITFALLS.md` | UAT pitfalls: what to avoid, how to write flows correctly, error detection rules |

### Step 2 — Read the Checklist Matching the QA Area

Read only the checklist(s) that match the area being tested:

| QA Area | Checklist File |
|---|---|
| UI / Design | `checklists/ui-ux-checklist.md` |
| Functionality | `checklists/functionality-checklist.md` |
| Responsive | `checklists/responsiveness-checklist.md` |
| Logic / Edge Cases | `checklists/logic-checklist.md` |
| Security | `checklists/security-checklist.md` |
| Performance | `checklists/performance-checklist.md` |
| Accessibility | `checklists/accessibility-checklist.md` |
| Cross-Browser | `checklists/cross-browser-checklist.md` |
| Console Errors | `checklists/console-errors-checklist.md` |
| SEO / Meta | `checklists/seo-checklist.md` |
| Code Quality | `checklists/code-quality-checklist.md` |
| Full Release QA | `checklists/qa-master-checklist.md` (all 11) |

---

## Checklist — Before Writing Any Test

Before writing a single line of test code, confirm all of these:

- [ ] `AI-CONTEXT.md` read — role, 11 dimensions, edge cases, bug format, release gate understood
- [ ] `PITFALLS.md` read — UAT pitfalls, error detection rules, how to write flows correctly
- [ ] Relevant checklist(s) read — every automatable item will have a `test()` assertion
- [ ] Non-automatable checklist items flagged as manual check notes in the spec header comment
- [ ] Spec file correctly matched to the feature being tested (not running all specs for a single feature)

---

## Spec → Feature Matching (Don't Run the Wrong Spec)

### Server / SaaS Specs

| Feature | Spec File |
|---|---|
| Login · signup · forgot password · reset | `tests/server/auth.spec.js` |
| Dashboard — file attach · link insert · language | `tests/server/dashboard.spec.js` |
| Widget Builder — enhancer · strict mode · credits | `tests/server/widget-builder.spec.js` |
| Homepage — nav · CTAs · layout | `tests/server/homepage.spec.js` |

### Plugin Specs

| Feature | Spec File |
|---|---|
| Admin login · redirect · session | `tests/plugin/login.spec.js` |
| Settings page · menu · RBAC | `tests/plugin/settings.spec.js` |
| Activate · deactivate · lifecycle | `tests/plugin/activation.spec.js` |
| Admin panel · role-based access | `tests/plugin/admin.spec.js` |
| Elementor panel · editor · responsive | `tests/plugin/widget-elementor.spec.js` |
| Block inserter · insert · controls · frontend | `tests/plugin/widget-gutenberg.spec.js` |
| Template import full flow | `tests/plugin/template-import.spec.js` |
| Widget import/download · error states | `tests/plugin/widget-import-download.spec.js` |

---

## Edge Cases to Always Cover in Every Spec

No spec is complete without assertions for all applicable edge cases:

| Edge Case | What to Assert |
|---|---|
| FTUE | Core feature reachable in ≤ 3 clicks · redirect correct |
| Empty state | Guidance message shown — not a blank panel |
| Error state | API 500 / offline / invalid token → clear message, UI not frozen |
| Loading state | Spinner visible during fetch · no layout jump on data arrival |
| Form validation | Empty required fields · max-length · invalid formats · mismatched fields |
| RTL layout | No overflow · correct text direction (Arabic / Hebrew) |

---

## Rule

Every checklist item that is **automatable** → must have a corresponding `test()` assertion in the spec file.

Items that **cannot be automated** → must be flagged as a `// MANUAL CHECK:` comment in the spec header.
