# Orbit — UAT Case Writing Guide & Common Pitfalls

> Before you write a test, ask: "Would a real user care about this?"  
> If the answer is no, it's a QA test — not a UAT test.

---

## The Core Difference

**UAT is user perspective. QA is code perspective.**

| UAT | QA |
|---|---|
| Can I find the SEO settings? | Does the settings page return 200? |
| Does the sitemap actually work? | Does `wp_rewrite_flush()` run? |
| Is the editor panel visible without scrolling? | Does the panel DOM element exist? |
| How many clicks to reach the feature I use daily? | Does the menu item render? |

---

## Common Pitfalls

### 1. Testing presence, not usability

**Wrong**: Assert that a menu item exists.  
**Right**: Count how many clicks from dashboard to reach it. 1 click = good. 3+ clicks = UX debt.

### 2. Static page loads as "tests"

**Wrong**: Navigate to settings page → screenshot → done.  
**Right**: Navigate → wait for content to load → scroll through → click tabs → interact with a field → screenshot the result.

If the video is just a page appearing and nothing happening — the test adds no UAT value.

### 3. Asserting what settings ARE, not what they DO

**Wrong**: "Sitemap is enabled = pass".  
**Right**: "Sitemap URL returns valid XML with at least 1 `<loc>` entry = pass".

Settings being toggled on means nothing if the feature doesn't work.

### 4. Recording errors as tests

Never screenshot or record a flow when the page shows:
- wp_die() errors ("Sorry, you are not allowed...")
- 403 / 404 pages
- PHP fatal errors
- Empty plugin pages (plugin activated but not configured)

These are **environment failures**, not UAT results. Orbit detects these automatically and marks the test as `SETUP_REQUIRED` rather than `PASS` or `FAIL`.

### 5. Assuming plugin state

Every UAT run must have a **setup phase** that puts the plugin in a realistic user state:
- User completed onboarding
- At least 1 published post exists
- Rewrite rules are flushed
- Any required capabilities are granted

Never test a plugin on a blank WordPress install with no content. The user never uses it that way.

### 6. Measuring complexity wrong

Counting DOM elements (`inputs.count()`) on a React or dynamically-rendered admin page returns 0 because the DOM is built after page load.

Fix: Use `page.waitForSelector()` for dynamic elements. Or use `page.evaluate()` to count from inside the DOM after full render.

### 7. Making claims without context

**Wrong**: "No setup wizard — FAIL"  
**Right**: "No setup wizard. For a plugin targeting beginners, this is a gap. For a developer-focused plugin, this may be intentional."

UAT notes must state WHO the target user is before calling something a gap.

### 8. Ignoring error states

Good UAT includes what happens when things go wrong:
- What does the user see if they miss a required field?
- What happens if they hit Save with invalid data?
- Is there a clear error message or does it silently fail?

---

## Writing Good UAT Flows

### Structure of a good flow

```
FLOW ID | Category | What real user is trying to do
─────────────────────────────────────────────────────
1. Setup: Put plugin in realistic state
2. Navigate: Start from where user would start (dashboard, not direct URL)
3. Interact: Do what user would do (click, type, scroll — not just observe)
4. Verify: Check the outcome a user would care about
5. Screenshot/Record: Capture the meaningful moment, not the loading screen
```

### Video recording rules

- Record the **interaction**, not the destination
- A video must show at least one user action (click, type, scroll)
- If the video is under 3 seconds — it's a page load, not a UAT flow
- Stop recording before asserting — the assertion is for the report, not the video

### Checklist for each flow

Before marking a flow complete, check:
- [ ] Does the video show actual user interaction?
- [ ] Are screenshots taken at meaningful moments (not loading states)?
- [ ] Is the plugin in a realistic state (has content, has config)?
- [ ] Does the note explain WHO this matters to?
- [ ] Does the gap (if any) say WHY it's a gap, not just WHAT is missing?

---

## Error Detection (Automatic)

Orbit automatically detects these failure states and marks tests `SETUP_REQUIRED`:

| Pattern | What it means |
|---|---|
| "Sorry, you are not allowed" | Plugin capability not granted to test user |
| HTTP 403 | Auth issue or permissions |
| PHP Fatal error | Plugin crash — environment issue |
| Empty page (< 200 chars body) | Plugin not configured or activated |
| wp_die() output | Plugin requires setup before access |

When detected: test is skipped, error is logged, no screenshot/video is recorded.

---

## Plugin Setup Checklist

Before running any UAT comparison, run:

```bash
node setup/plugin-setup.js --plugin <slug>
```

Each plugin setup must:
- [ ] Grant required admin capabilities
- [ ] Create at least 2 sample posts (1 post + 1 page)
- [ ] Flush rewrite rules
- [ ] Mark any setup/wizard steps as done
- [ ] Verify the plugin admin page loads without errors

---

## API & Security Testing Pitfalls

### 9. Treating HTTP 200 as a pass

**Wrong**: API returned 200 → feature works → pass.
**Right**: HTTP 200 only means the server responded. Open the response body. Open the generated file. Check:
- Does the body contain the values the user submitted, or silent fallbacks?
- Is the generated file valid, non-empty, and free of injected content?
- Does the plugin header contain the user's name or a hardcoded developer name?

A download that returns 200 with a corrupt ZIP, an empty file, or a hardcoded "Devang Vachheta" as author is a bug — not a pass.

### 10. Testing only via UI — not testing the API layer

**Wrong**: Fill the form, click download, file appears → pass.
**Right**: UI validation can be bypassed. Always test the underlying API endpoint directly:

```bash
# Send empty required field directly to the API
curl -X POST https://app.wdesignkit.com/api/v2/plugin/download/get \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"pluginName": "", "slug": "my-widget"}'
# Expected: 4xx — Actual if buggy: 200 with empty pluginName in file
```

If the API accepts what the UI rejects, the bug is real — the UI is just masking it.

### 11. Not re-running reproduction steps on security bugs

**Wrong**: Developer says "fixed, it's session-bound" → mark QA Passed.
**Right**: Never accept a developer comment on a security bug without re-running the exact reproduction steps yourself. Common wrong justifications seen in practice:
- "It's session-bound" — tested: another user's widget ID returned 200 (IDOR confirmed)
- "Plugin header is plain text" — tested: WordPress renders Author URI as a clickable `<a href>` link, `javascript:` executes
- "aria-label doesn't impact functionality" — wrong: it's a WCAG 2.1 requirement for screen readers

Re-run the steps. Trust the test, not the comment.

### 12. Marking cross-browser pass without testing file downloads in Safari

**Wrong**: Download works in Chrome → cross-browser pass.
**Right**: File downloads (blob URL + programmatic anchor click) behave differently across browsers. A feature that works in Chrome can silently fail in Safari on both macOS and iOS. Always test:
- Chrome ✓
- Firefox ✓ (handles blob URLs differently)
- Safari ✓ (macOS + iOS — most likely to fail)

If you cannot open Safari, mark it as `// MANUAL CHECK: verify download in Safari` in the spec header.

---

## When to Update Checks

UAT specs become stale. Update a flow when:
- The plugin releases a major version
- The UI changes (new settings page, new editor panel)
- A new competitor feature needs comparison
- A user reports confusion about a specific flow

---

## What GitHub Gets vs What Stays Local

**GitHub (public, plugin-neutral):**
- Framework code (config, auth, report generator)
- Generic flow templates
- This PITFALLS guide
- Setup infrastructure

**Local only (your specific tests):**
- `tests/playwright/flows/plugin-a-vs-plugin-b.spec.js`
- `setup/plugins/specific-plugin.setup.json`
- `reports/` (all test output)
- `.wp-env-site/` (your local Docker config)

This keeps Orbit reusable for any WordPress plugin — not tied to your specific products.
