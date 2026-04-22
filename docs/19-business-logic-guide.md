# Business Logic Testing Guide — WDesignKit

> Bridges the gap between WDesignKit Orbit's generic plugin checks (security, compliance, performance)
> and the business logic unique to WDesignKit (widget library, cloud sync, template import, etc.).

---

## Core Workflow

Six-step process for adding business-logic coverage:

1. **Scaffold** — Auto-generate test scenarios from the WDesignKit source
2. **Configure** — Customize `qa.config.json` with WDesignKit-specific endpoints
3. **Define scenarios** — Curate auto-generated + add custom business-logic cases
4. **Write specs** — Create Playwright tests in `tests/wdesignkit/business/`
5. **Wire configuration** — Add project entry to `playwright.config.js`
6. **Run full gate** — Execute all tests via `gauntlet.sh`

---

## Key Principle

> **Orbit gives you 90% of coverage for free. The 10% that makes WDesignKit correct is what you write on top.**

Each scenario must specify:
- Exact user actions
- Expected outcomes (visible changes, DB updates, side effects)
- Failure modes
- Severity level

Avoid vague assertions like "test that it works." Test the business rule — not just UI visibility.

---

## WDesignKit-Specific Scenario Patterns

### Widget Library
- Widget list renders, pagination works with 100+ widgets
- Widget preview lazy-loads on hover
- "Add to Elementor/Gutenberg/Bricks" inserts with correct defaults
- Category filter returns expected subsets

### Cloud Sync
- Sign-in persists across reload
- Cloud-saved widget appears on second installation
- Offline edits queue and sync on reconnect
- Rate-limit UI appears when API throttles

### Template Import
- Import preserves global colors + typography
- Import survives Elementor Pro / Gutenberg builder switch
- Import of 10MB template does not time out
- Failed import surfaces actionable error (not "undefined")

### Widget Converter
- Elementor widget → Gutenberg block preserves attributes
- Conversion warns before destructive changes
- Round-trip conversion is stable

### Billing / Plan Gating
- Free plan sees Pro widgets as locked, not hidden
- Upgrade CTA navigates to correct pricing page
- License key activation updates UI within 5 seconds
- License deactivation re-locks Pro widgets

---

## Writing a Business-Logic Spec

Use the helpers in `tests/wdesignkit/helpers.js`:

```js
const { test, expect } = require('@playwright/test');
const { attachConsoleErrorGuard, assertPageReady } = require('../helpers');

test.describe.configure({ mode: 'serial' });

test('Pro widget shows lock icon for free user', async ({ page }) => {
  const guard = attachConsoleErrorGuard(page);
  await page.goto('/wp-admin/admin.php?page=wdesignkit-widgets');
  await assertPageReady(page, 'widget library');

  const proWidget = page.locator('[data-widget="advanced-gallery"]');
  await expect(proWidget.locator('.wdk-lock-icon')).toBeVisible();
  await proWidget.click();
  await expect(page.locator('.wdk-upgrade-modal')).toBeVisible();

  guard.assertClean('pro-lock-gate');
});
```

---

## Related

- `docs/20-auto-test-generation.md` — scaffolder that reads WDesignKit code
- `docs/18-release-checklist.md` — what must pass before tagging
- `docs/07-test-templates.md` — Playwright templates per plugin type
