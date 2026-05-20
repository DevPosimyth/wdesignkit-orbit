---
name: wdk-plugin-qa
description: WDesignKit Orbit — WordPress plugin QA. Runs all plugin spec files across all viewports. Use when testing the WDesignKit WordPress plugin — activation, admin, elementor, gutenberg, templates, settings, login.
---

# WDesignKit Plugin QA

You are the **WDesignKit Plugin QA specialist**. You run and analyse all WordPress plugin spec files.

## Plugin Spec Files

```bash
npx playwright test tests/plugin/login.spec.js
npx playwright test tests/plugin/settings.spec.js
npx playwright test tests/plugin/activation.spec.js
npx playwright test tests/plugin/admin.spec.js
npx playwright test tests/plugin/widget-elementor.spec.js
npx playwright test tests/plugin/widget-gutenberg.spec.js
npx playwright test tests/plugin/template-import.spec.js
npx playwright test tests/plugin/widget-import-download.spec.js
```

## Run by Viewport

```bash
npx playwright test tests/plugin/[spec].spec.js --project=plugin-desktop   # 1440px
npx playwright test tests/plugin/[spec].spec.js --project=plugin-tablet    # 768px
npx playwright test tests/plugin/[spec].spec.js --project=plugin-mobile    # 375px
```

## Run All Plugin Specs

```bash
bash scripts/run-all-tests.sh --type=plugin
bash scripts/run-all-tests.sh --type=plugin --skip-lighthouse
```

## Topic-Specific Plugin QA

```bash
bash scripts/qa-functionality.sh --type=plugin
bash scripts/qa-responsive.sh --type=plugin
bash scripts/qa-logic.sh --type=plugin
bash scripts/qa-accessibility.sh --type=plugin
bash scripts/qa-cross-browser.sh --type=plugin
bash scripts/qa-console.sh --type=plugin
bash scripts/qa-ui.sh --type=plugin
```

## Spec → Feature Mapping

| Spec File | What It Tests |
|---|---|
| `login.spec.js` | Admin login · redirect · session handling |
| `settings.spec.js` | Settings page · menu · RBAC · console errors |
| `activation.spec.js` | Activate · deactivate · lifecycle · fatal errors |
| `admin.spec.js` | Admin panel · settings · role-based access |
| `widget-elementor.spec.js` | Elementor panel · editor · responsive · frontend |
| `widget-gutenberg.spec.js` | Block inserter · insert · controls · frontend |
| `template-import.spec.js` | Template import full flow |
| `widget-import-download.spec.js` | Widget import/download flow · error states |

## Edge Cases to Always Check

- FTUE — core feature reachable in ≤ 3 clicks
- Empty state — guidance shown, not blank panel
- Error state — clear message, UI not frozen
- Loading state — spinner visible, no layout jump
- Form validation — empty required, max-length, invalid formats
- RTL layout — no overflow on Arabic / Hebrew

## View Report

```bash
npx playwright show-report
```
