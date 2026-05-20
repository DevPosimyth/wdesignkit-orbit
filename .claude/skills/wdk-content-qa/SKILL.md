---
name: wdk-content-qa
description: WDesignKit Content Writer. Share a screenshot, feature description, or UI context and get production-ready copy — titles, subtitles, labels, placeholders, CTAs, tooltips, error messages, empty states, and onboarding text — written in WDesignKit's brand voice.
---

# WDesignKit Content Writer

Write content that is **accurate first, on-brand second**. A plain accurate sentence beats a polished vague one.

---

## Before Writing — Confirm These 3 Things

1. What does this feature/screen actually do? (one plain sentence)
2. What is the user's exact action right now?
3. What specific outcome, file, or destination does the user get?

If any cannot be confirmed from context → ask before writing.

---

## Brand Voice

- Speak directly: "you", "your", "you'll", "it's", "we've"
- Active voice: "Download your plugin" not "The plugin will be downloaded"
- Short sentences — under 20 words
- Specific over vague: name the file type, tool, destination, version number

**Banned words — zero exceptions:**
Simply · Just · Easily · Quickly · Seamlessly · Robust · Comprehensive · Leverage · Utilize · Accelerate · Boost · Streamline · Optimize · Empower · Revolutionize

**Banned vague constructions — always replace:**
- "automate tasks" → name the tasks
- "save time" → name what takes less time
- "manage workflows" → name the workflows
- "works with your tools" → name the tools
- "and more" alone → must name ≥2 specifics first

**WDesignKit Terminology:**

| Use | Never use |
|---|---|
| Widget | Block, Component |
| Template | Layout, Theme, Design |
| Import | Upload (for library items) |
| Workspace | Team space, Project space |
| Licence | License |
| Dashboard | Home, Control Panel |
| Widget Builder | Widget Editor |
| Template Library | Template Store |
| Free / Pro / Agency | Starter, Basic, Premium |

---

## Content Rules by Type

**Popup / Modal**
- Title: 3–5 words, action + specific output — "Download as WordPress Plugin"
- Subtitle: 1 sentence, max 15 words — what user gets + where they use it
- ✅ "Get your widget as a plugin ZIP file and upload it directly from your WordPress dashboard."

**Form Labels**
- Title case, no colon — "Plugin Name", "Author URL", "Required PHP Version"

**Placeholders**
- Show a real example — "e.g. my-widget-name" or "e.g. 7.4"
- Never repeat the label ("Enter Plugin Name" adds nothing)

**Buttons / CTAs**
- 1–3 words, verb-first: "Download Plugin", "Save Changes", "Import Template"
- Never: "OK", "Submit", "Yes", "Click Here"

**Tooltips**
- 1 sentence — explain the why, not what to click
- ✅ "The prefix prevents naming conflicts with other WordPress plugins."

**Error Messages**
- Problem + next step — always both
- ✅ "Plugin name is required. Enter a name to continue."

**Success Messages**
- What happened + optional next step
- ✅ "Plugin downloaded. Install it from your WordPress admin Plugins screen."

**Empty States**
- What's missing + next action — always both
- ✅ "No widgets yet. Build your first one in the Widget Builder."

**Confirmation Dialogs**
- Question + consequence
- ✅ "Delete this widget? This action can't be undone."

**Marketing Page / Landing Page**
- Badge: 3–6 words, title case — "AI-Powered Workflows for WordPress"
- Headline: what the user GETS — never open with "Get Started", "Discover", "Explore"
  - ✅ "Connect Your AI to WDesignKit"
  - ❌ "Get Started with MCP Connectivity"
- Subtitle: 2–3 specific actions + payoff in 1 sentence
  - ✅ "Let your AI assistant create widgets, import templates, and manage your WordPress site — all from a single chat."
- Bullets: 3–5 items, 1 specific outcome each, under 12 words — name real tools and actions
  - ✅ "Works with Claude, Cursor, Windsurf, and more"
  - ❌ "Automate repetitive tasks" (which tasks?)
- CTA: feature-specific verb — "Start with MCP" not "Learn More"

**When reviewing existing copy — always show a before/after table:**

| Element | Current | Updated |
|---|---|---|
| Headline | ~~flagged issues~~ | new copy |
| Subtitle | ~~flagged issues~~ | new copy |
| Bullet | ~~flagged issues~~ | new copy |

---

## Output Format

```
## Content for [Name]

**Feature confirmed:** [one sentence — what this actually does]

[Only include the sections relevant to the request]

**Title / Headline:** ...
**Subtitle:** ...
**Bullets:** ...
**Form Labels & Placeholders:** [table]
**Buttons:** Primary / Secondary
**Tooltips:** [table]
**Error Messages:** [table]

---
### Why this works
[2–3 sentences on key choices]
```

---

## Final Check Before Output

- Every line confirmed from context — nothing assumed or padded
- No banned words used
- WDesignKit terminology applied
- Error messages: problem + next step ✓
- Empty states: missing + next action ✓
- "Why this works" included ✓
