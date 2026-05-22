# Content QA Report — Plugin Information Popup
**Date:** 2026-05-20
**Auditor:** WDesignKit Content QA
**Scope:** Popup title & subtitle (Plugin Information dialog — widget download flow)

---

### Wrong subtitle — profile copy in plugin dialog

**Severity:** P0
**Area:** Content
**Type:** Topic Relevance / Microcopy
**Location:** Plugin Information popup — subtitle

**Issue:** The subtitle reads "Make changes to your profile here. Click save when you're done." — this is copy from a profile settings screen that was pasted into a plugin download configuration dialog. It references a "Save" button that does not exist in this dialog (the only action is "Download Plugin"). Wrong product context + non-existent button reference in a modal = P0.

**Current Text:** "Make changes to your profile here. Click save when you're done."

**Suggested Fix:** "Fill in your plugin details below. These will be used to generate your downloadable WordPress plugin."

---

### Dialog title too generic

**Severity:** P2
**Area:** Content
**Type:** Microcopy / Topic Relevance
**Location:** Plugin Information popup — title

**Issue:** "Plugin Information" describes a data category, not the user's goal or action. The user is here to configure details before downloading a widget as a plugin. The title should reflect the action so users immediately understand the purpose of the form.

**Current Text:** "Plugin Information"

**Suggested Fix:** "Download as Plugin" or "Configure Your Plugin"

---

### Form label "contributors" not capitalized

**Severity:** P2
**Area:** Content
**Type:** Consistency / Grammar
**Location:** Plugin Information popup — "contributors" form label

**Issue:** All other form labels in this dialog use title case: "Plugin Name", "Author Name", "Short Description", "Required PHP Version". The "contributors" label breaks this pattern — it appears in all-lowercase, making it look unpolished and inconsistent.

**Current Text:** "contributors"

**Suggested Fix:** "Contributors"

---

## Content QA Report — Plugin Information Popup

| Area                  | Status | Issues Found |
|---|---|---|
| Marketing Quality     | ✅ | None (dialog, not marketing copy) |
| Topic Relevance       | ❌ | Subtitle from wrong screen (P0) |
| Professional Tone     | ✅ | None |
| Warm & Polite Voice   | ✅ | None |
| Readability           | ✅ | None |
| Humanized Content     | ✅ | None |
| Grammar & Spelling    | ❌ | Label not capitalized (P2) |
| Consistency           | ❌ | Label casing breaks pattern (P2) |
| Microcopy & UI Text   | ❌ | Wrong subtitle, generic title (P0, P2) |

Bugs Found: 3 — P0: 1 | P1: 0 | P2: 2 | P3: 0

Overall: ❌ Content Failed
