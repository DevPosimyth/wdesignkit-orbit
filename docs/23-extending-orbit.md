# Extending WDesignKit Orbit — How to Make It Better

> WDesignKit Orbit is not a finished product — it's a maintained framework. This doc
> shows how to add custom checks, write Playwright specs, and create custom Claude skills.

---

## Three Ways to Extend

### 1. Add a New Check Script (Easiest)
`scripts/check-<thing>.sh` — bash script taking a plugin path, checks one thing, exits 0/1. Wire into `gauntlet.sh`. **90% of extensions are this.**

### 2. Write a New Playwright Spec
`tests/server/flows/<thing>.spec.js` — configured via env vars or `qa.config.json`. Register as project in `playwright.config.js`. **Use when a real browser is needed.**

### 3. Create a Custom Claude Skill
`~/.claude/skills/orbit-<thing>/SKILL.md` — define checks, bad/good code, severity. **Use for patterns too subtle for grep — data flow, ownership, intent.**

---

## The Ideation Loop

Before writing code:

### A. Whose perspective does this serve?
Dev / QA / PM / PA / Designer / End User. If the check doesn't help at least one, it doesn't belong.

### B. What evidence says this matters?
- CVE / Patchstack / Wordfence / NVD
- WordPress.org plugin review update
- Community thread with ≥20 upvotes
- PHP/WP changelog entry
- Real WDesignKit support ticket / postmortem

No evidence → don't build it.

### C. Can it be a grep pattern?
- Yes → bash script. Ship in an hour.
- Needs AST/dataflow → Claude skill.
- Needs live browser → Playwright spec.

### D. Will it false-positive?
Test against 3 popular plugins from different categories. If >1 false-positives, tighten the pattern.

### E. Does it skip gracefully?
Plugin doesn't use WooCommerce → HPOS check should skip (exit 0). Plugin has no blocks → block check should skip. Detect applicability first.

---

## Template: New Check Script

```bash
#!/usr/bin/env bash
# WDesignKit Orbit — <One-line what this checks>
# <Why this matters. Evidence: CVE / WP.org rule / changelog.>

set -e

PLUGIN_PATH="${1:-}"
[ -z "$PLUGIN_PATH" ] && { echo "Usage: $0 /path/to/plugin"; exit 1; }

GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

# 1. Applicability
USES_THING=$(grep -rEl "some_indicator" "$PLUGIN_PATH" --include="*.php" \
  --exclude-dir=vendor --exclude-dir=node_modules 2>/dev/null | wc -l | tr -d ' ')
if [ "$USES_THING" -eq 0 ]; then
  echo "Not applicable"; exit 0
fi

# 2. Check
FAIL=0
HITS=$(grep -rEn "bad_pattern" "$PLUGIN_PATH" --include="*.php" \
  --exclude-dir=vendor 2>/dev/null | head -5 || true)
if [ -n "$HITS" ]; then
  echo -e "${RED}✗ <What's wrong>${NC}"
  echo "$HITS" | head -2 | sed 's/^/   /'
  FAIL=1
fi

[ "$FAIL" -eq 1 ] && exit 1
echo -e "${GREEN}✓ PASS${NC}"
```

Wire into `gauntlet.sh`:
```bash
if bash scripts/check-<thing>.sh "$PLUGIN_PATH" 2>&1; then
  log "- ✓ <Check name>"; ((PASS++))
else
  log "- ✗ <Check name>"; ((FAIL++))
fi
```

---

## Template: New Playwright Spec

```javascript
// @ts-check
/**
 * WDesignKit Orbit — <What this verifies>
 * <Why this matters>
 */

const { test, expect } = require('@playwright/test');
const { attachConsoleErrorGuard, assertPageReady } = require('../helpers');

const PLUGIN_SLUG = (process.env.PLUGIN_SLUG || 'wdesignkit').replace(/[^a-zA-Z0-9_-]/g, '');
const SOMETHING   = process.env.PLUGIN_SOMETHING;

test.describe.configure({ mode: 'serial' });

test.describe('<what>', () => {
  test.skip(!SOMETHING, 'Set PLUGIN_SOMETHING to run this spec');

  test('does the thing', async ({ page }) => {
    const guard = attachConsoleErrorGuard(page);
    await page.goto(`/wp-admin/admin.php?page=${SOMETHING}`);
    await assertPageReady(page, 'context');
    await expect(page.locator('#wpbody-content')).toBeVisible();
    guard.assertClean('<test name>');
  });
});
```

Register project in `playwright.config.js`:
```javascript
{
  name: 'my-project',
  use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
  testMatch: '**/flows/<thing>.spec.js',
  dependencies: ['setup'],
},
```

---

## Template: Custom Claude Skill

```markdown
---
name: orbit-<thing>
description: <What this reviews. When to invoke. What it will NOT do.>
---

# WDesignKit Orbit <Thing> Reviewer

You are a **reviewer, not generator**. You read <files> to find <issues>. You do NOT <anti-goal>.

## Task

Read <language> files. For each finding:
- Severity: Critical / High / Medium / Low
- File and line number
- Problematic code
- Corrected code
- Why it matters

## Patterns

### 1. <Pattern name>

\`\`\`<lang>
// BAD
<bad code>

// CORRECT
<good code>
\`\`\`

**Flag every <trigger>.** <Severity> severity.

[...repeat for 10+ patterns...]

## Report Format

\`\`\`
# WDesignKit — <Skill> Audit
## Summary Table
| Severity | Count |
|---|---|
| Critical | X |
## Critical Findings
### <Finding title>
**File:** path/file.php:LN
**Code:** [snippet]
**Fix:** [snippet]
\`\`\`
```

Rules:
- **Define negative scope first** — what the skill is NOT
- **Bad + good + severity** for every pattern
- **Cite sources** in preamble (CVE, Patchstack article)
- **Structured output** — severity table first, then findings

---

## Playwright Best Practices

1. **One behavior per spec.** Not "it works" — "widget conversion preserves button color"
2. **Use `getByRole`/`getByLabel` before CSS selectors**
3. **Always attach `attachConsoleErrorGuard`** — silent JS errors are #1 missed bug
4. **Always call `assertPageReady`** at start — fails fast on permission errors
5. **Serialize when mutating shared state** — plugin activation, locale, options
6. **Clean up in `afterAll`** — restore starting state

### Anti-patterns

```javascript
// BAD — vague
test('widget library works', async ({ page }) => {
  await page.goto('/wp-admin/admin.php?page=wdesignkit-widgets');
  await expect(page.locator('#wpbody-content')).toBeVisible();
});

// GOOD — specific
test('converting Elementor widget to Gutenberg preserves button color', async ({ page }) => {
  const guard = attachConsoleErrorGuard(page);
  await page.goto(`/wp-admin/admin.php?page=wdesignkit-widgets`);
  await assertPageReady(page);
  await page.click('[data-widget="advanced-button"]');
  await page.click('button:has-text("Convert to Gutenberg")');
  const colorField = await page.locator('input[name="button_color"]').inputValue();
  expect(colorField).toBe('#FF6A00');
  guard.assertClean('convert preserves color');
});
```

---

## Contributing Back

### PR Checklist
- [ ] Works on 3 different plugin types (not just WDesignKit)
- [ ] Skips gracefully (exit 0) when not applicable
- [ ] Source cited in top comment (CVE, WP.org, etc.)
- [ ] No hardcoded WDesignKit references in generic scripts
- [ ] Added to `gauntlet.sh` with mode gate
- [ ] Entry in `docs/18-release-checklist.md`
- [ ] Syntax validated (`bash -n`, `node --check`)

### Rejected
- Plugin-specific logic in generic checks
- Checks without cited evidence
- Duplication with existing checks
- Features requiring paid APIs
- Runtime monitoring / WAF / live-site pen-testing

### Loved
- New attack pattern detection with cited CVE
- Performance benchmarks with source data
- Accessibility checks beyond axe-core
- Coverage for new WP/PHP versions
- Better error messages

---

## Keep Orbit Honest — 90-Day Cadence

1. Re-read `docs/21-evergreen-security.md`
2. Check Patchstack / Wordfence / NVD for new vuln categories
3. Check WP release notes for new APIs — update `check-modern-wp.sh`
4. Check PHP release notes — update `check-php-compat.sh`
5. Review 5 GitHub issues on top plugins — is there a pattern Orbit should catch?
6. Update `docs/17-whats-new.md`

Without this, Orbit becomes a 2024 tool pretending to be current.
