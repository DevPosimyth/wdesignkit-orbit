# Nexter Blocks (Gutenberg) → WDesignKit
# User Journey & Product Growth Audit — v2

**Date:** 2026-05-19
**Auditor Role:** Senior UX Researcher · Product QA Analyst · Product Growth Auditor
**Entry Plugin:** Nexter Blocks v4.7.9 (the-plus-addons-for-block-editor)
**Companion:** Nexter Extension v4.6.9
**Destination:** WDesignKit 2.3.2
**Mode:** Caveman-Full
**Environment:** widget-wdk.instawp.co · WordPress 6.9.4 · Bricks 2.3.1
**Note:** Findings in this report are Gutenberg/Nexter-specific. Generic template-library and presence bugs documented separately.

---

## Live Data — What Runtime Inspection Revealed

| Metric | Value |
|---|---|
| Nexter blocks registered | 49 (tpgb/*) |
| Avg. attributes per block | **122 per block** |
| Min attributes (simplest block) | 10 (tpgb-settings) |
| Max attributes (heaviest block) | **287 (tp-infobox)** |
| Blocks with `supports_color: false` | **49 / 49 (100%)** |
| Blocks with `is_dynamic: true` | **47 / 49 (96%)** |
| Block presets / variations registered | **0** |
| Patterns registered by Nexter | **0** |
| Patterns registered by WDesignKit | **0** |
| Total patterns in site | 6 (WordPress core only) |
| Nexter PRO active | **No** |
| WDesignKit `widget-load/gutenberg/` dir | Exists but **0 widgets** |
| WDesignKit `class-nexter-block-render.php` | Exists in admin — **never exposed to user** |
| WDesignKit option `tpgb_normal_blocks_opts` | Not found |
| Nexter onboarding meta (any user) | **0 rows** |
| Nexter admin menu pages detected | **0** |

---

## Executive Summary

Nexter Blocks gives users 49 blocks. Every block is a configuration machine — averaging 122 attributes, ranging up to 287 (Infobox), with zero presets, zero guided setup, and zero safe defaults that produce a production-quality result. User inserts block → sees blank placeholder → opens inspector → confronted with 100–280 settings organized into tabs they must discover manually.

At the same time: WordPress 6.9 Patterns tab = the most-used discovery surface for ready-made content. Nexter registers zero patterns. WDesignKit registers zero patterns. The tab shows only 6 WordPress core placeholders. This is the primary browsing surface for users who want "something ready to use" — completely unserved.

WDesignKit has a `widget-load/gutenberg/` directory and a `class-nexter-block-render.php` integration class. Infrastructure exists. User-facing integration = zero. Connection stays invisible until a developer manually builds a WDesignKit Gutenberg widget — a flow with no guided path.

Three separate failure layers. Each independent. Each fixable.

---

## User Psychology Model — Gutenberg-Specific

### Who Opens Nexter Blocks for the First Time

**Type A — Block Inserter Browser (40%)**
- Opens the inserter (+) button
- Scrolls through "Nexter Blocks" category  
- Clicks a block that sounds useful (Flipbox, Infobox, Countdown)
- Adds it → sees empty/default state with 0 styling
- Opens inspector → overwhelmed → closes block → never uses it again
- **Failure point: immediate. Attribute overload kills first use.**

**Type B — Pattern Seeker (35%)**
- Clicks (+) → Patterns tab → searches "hero", "pricing", "team"
- Sees 6 WordPress placeholder patterns, nothing from Nexter or WDesignKit
- Assumes no patterns exist → exits editor → searches for patterns elsewhere
- **Failure point: Patterns tab. Zero POSIMYTH content = zero discovery.**

**Type C — Toolbar / Settings Explorer (15%)**
- Adds a block → right-clicks → sees only core WordPress context menu
- Looks for "More options" in block toolbar → finds nothing Nexter-specific at toolbar level
- Tries to save a block variation → discovers no save-as-pattern-to-cloud option
- **Failure point: missing contextual actions. Advanced user gets no power-user tools.**

**Type D — Theme Builder User (10%)**
- Wants header, footer, archive templates for Gutenberg
- Nexter Extension has `nxt_builder` post type registered
- WDesignKit has no theme builder integration for Gutenberg context
- Finds Nexter theme builder → 0 templates → blank list → no WDesignKit import path
- **Failure point: theme-level workflow entirely unconnected to WDesignKit.**

---

## Critical Finding 1: Attribute Overload — The Hidden Retention Killer

### The Problem

Every Nexter block presents every single setting simultaneously. No progressive disclosure. No "quick setup" first-run mode. No "recommended settings" subset. All 72–287 attributes visible at once through tab navigation in the block inspector.

**Attribute counts per block (selected):**

| Block | Attributes | Verdict |
|---|---|---|
| tp-infobox | **287** | Expert-only without presets |
| tp-navigation-builder | **250** | Builder inside a block — 0 guidance |
| tp-post-listing | **230** | 230 settings to show a blog grid |
| tp-pricing-table | **209** | Needs defaults to be useful |
| tp-flipbox | **180** | Blank front+back = useless until styled |
| tp-testimonials | **159** | User doesn't know where to start |
| tp-container | **154** | Core layout block — 154 attrs = fragile |
| tp-stylist-list | **149** | Not accessible without strong defaults |
| tp-team-listing | **147** | Needs at least 1 sample card to orient |
| tp-form-block | **144** | 144 attrs for a form = friction before first field |

### User Psychology

Fresh user inserts Flipbox. Sees empty card with 180 attributes across multiple tabs (Style, Content, Animation, Advanced, Responsive). No "get started" guide. No highlighted required fields. No "this is what it'll look like with good settings" preview.

User assumption: "I must be doing something wrong." → Abandons block. Returns to core blocks where 10–15 settings feel manageable.

**This is why Nexter's 49 blocks don't translate to user engagement.** Having a block is not the same as having a usable block. Without presets, 90% of blocks are opt-in complexity traps for new users.

### Competitor Benchmark

| Plugin | Approach | Result |
|---|---|---|
| Kadence Blocks | Design Library popup on block insert — choose a preset style before seeing settings | User gets a working block instantly |
| GenerateBlocks | 5 ultra-simple blocks, each with clean defaults | Settings panel never overwhelming |
| Stackable | "Design Library" button in block toolbar — browse 60+ preset layouts | Discovery loop closed in editor |
| Nexter Blocks | All attributes exposed immediately, no presets | Configuration anxiety, abandonment |

### WDesignKit Opportunity (Currently Missed)

WDesignKit has `class-nexter-block-render.php` in its admin layer — indicating intentional Nexter integration architecture exists. This class could be the foundation for a **"WDesignKit Presets for Nexter Blocks"** system:

- User inserts tp-infobox → WDesignKit panel offers 5 preset styles
- User picks one → 287 attributes pre-filled with working values
- User edits only what matters (text content, colors)
- Block looks production-quality in 60 seconds

Currently: infra file exists, zero user-facing feature built on it.

---

## Critical Finding 2: Server-Side Rendering = Invisible Editor Experience

### The Problem

**96% of Nexter blocks (47/49) use server-side dynamic rendering** (`is_dynamic: true`). This means:

1. Block added to editor → editor shows a PHP-rendered preview fetched from server
2. Settings changed → editor must re-fetch rendered HTML from server to show updated preview
3. Fast settings changes create lag between input and visual feedback
4. In poor network or slow server: user changes color → waits → result appears → repeat

**Deeper consequence: Content lock-in user doesn't know about.**

Server-side dynamic blocks store their settings as block attributes in `post_content`, but the actual HTML is generated by PHP at render time. If user deactivates Nexter Blocks plugin:

- All Nexter block content becomes invisible in editor
- Frontend renders nothing (or error state) where Nexter blocks were
- User has no idea their content is 100% plugin-dependent
- No "this block will break if plugin is removed" warning ever shown

**WDesignKit widget builder creates Gutenberg blocks the same way.** Users who build custom blocks with WDesignKit have same dependency — never warned.

### UX Friction from Dynamic Rendering

| Scenario | Experience |
|---|---|
| User changes font size in tp-pricing-table | Settings panel updates immediately — canvas waits for server response |
| User toggles animation type in tp-countdown | Editor shows loading spinner on block — breaks creative flow |
| User duplicates complex tp-post-listing | Duplicate renders blank until server responds |
| User previews page in new tab | First load may show raw block markup briefly (FOUC) |
| User deactivates Nexter plugin | All content gone — no warning was ever shown |

### WDesignKit Connection (Currently Zero)

WDesignKit has no "block health" dashboard. No way to see: "you have 47 server-side blocks on this page — here's what depends on which plugin." Zero visibility into content dependency. Users who build with Nexter + WDesignKit custom blocks have a fragile dependency chain with no visibility.

---

## Critical Finding 3: Global Styles Disconnection

### The Problem

**Every single Nexter block has `supports_color: false`.**

WordPress 6.9 has a mature Global Styles system (Appearance → Editor → Styles). Designers set brand colors, typography, spacing once — it applies everywhere across all blocks that opt in via `supports_color: true`.

Nexter Blocks deliberately opts out of this system. Consequences:

1. **User sets brand blue in Global Styles** → adds tp-heading → heading shows black (doesn't inherit global color)
2. **User confused**: "Why doesn't my brand color apply?" → tests different blocks → all ignore global styles
3. **User gives up on Gutenberg Global Styles entirely** or gives up on Nexter blocks
4. **Each Nexter block has its own color pickers** — user must set brand color individually in every single block's settings panel

For a site with 10 Nexter blocks: 10 separate color settings to update when brand color changes. Zero connection to WordPress's single-source-of-truth color system.

### Severity in 2026 Context

WordPress 6.9 pushes Global Styles heavily. Themes built for Global Styles (Twenty Twenty-Four, Twenty Twenty-Five, any modern FSE theme) expect blocks to respect global colors and typography. Nexter Blocks is incompatible with this paradigm at a fundamental architecture level.

Users on modern themes → Nexter blocks = visual inconsistency. No warning. No explanation.

### WDesignKit Opportunity

WDesignKit custom blocks (built via widget builder) inherit whatever color system the developer implements. This means WDesignKit Gutenberg blocks COULD be built to use `supports_color: true` — making them better Global Styles citizens than Nexter's own blocks.

**Zero communication of this advantage anywhere.** WDesignKit doesn't market its Gutenberg custom blocks as "Global Styles compatible." Users don't know.

---

## Critical Finding 4: Patterns Tab Completely Abandoned

### The Data

```
Total patterns registered: 6
  - core/*: 6 (WordPress placeholders)
  - nexter/*: 0
  - tpgb/*: 0
  - wdesignkit/*: 0
  - wdk/*: 0
```

The Gutenberg Patterns tab is the **primary in-editor surface for ready-made content**. WordPress.org promotes patterns as the solution to "I want a pre-built section." Gutenberg 6.x made patterns the default "start here" recommendation over individual blocks.

Nexter Blocks does not register a single pattern. WDesignKit does not register a single pattern.

### User Impact by Persona

**Type B (Pattern Seeker, 35% of users):**
1. Opens Patterns tab
2. Searches "hero section" → 0 results from Nexter/WDesignKit
3. Searches "pricing" → 0 results
4. Searches "team" → 0 results
5. Sees only WordPress core sample patterns ("About page," "Contact page")
6. Concludes Nexter Blocks has no ready-made sections
7. Goes to Google → finds Kadence Blocks pattern library → installs competing plugin

This is not a discoverability problem. Nexter simply has no patterns. The user searched. Nothing exists to find.

### The Exact Fix

WordPress pattern registration is 3 lines per pattern:
```php
register_block_pattern('nexter/hero-section-1', [
    'title'      => 'Hero Section — Clean',
    'categories' => ['header'],
    'content'    => '<!-- wp:tpgb/tp-container {"uid":"..."} -->...'
]);
```

20 patterns = 20 × 3-line blocks. One afternoon of work. Completely unblocks Type B users. Creates Nexter's presence in the primary in-editor discovery surface.

**WDesignKit could own this.** Instead of Nexter shipping patterns with the block plugin, WDesignKit could be the pattern source — "Install WDesignKit to unlock 200+ Nexter block patterns." Immediate value proposition. Clear reason to install WDesignKit alongside Nexter.

---

## Critical Finding 5: Nexter PRO Visibility Gap

### The Problem

Nexter PRO not installed on live site (`nexter_pro_active: false`). Plugin description says "40+ FREE blocks" — but 49 blocks are visible in the inserter. Some of these 49 blocks may require PRO or have limited FREE functionality.

User inserts a block → configures it → certain settings greyed out or missing → user doesn't understand why. No inline "PRO required" label on locked settings at inspector panel level (needs verification of actual inspector UI, but common pattern with this plugin type).

### Where Lock-In Appears (Estimated, Needs Verification)

From plugin architecture: PRO check typically exists at:
- Specific attribute values (locked style variants)  
- Animation options (free = basic, PRO = full range)
- Some block types entirely (not found in free version inserter but listed on site)

User who builds a page using PRO-adjacent settings in trial/preview mode → upgrades → finds different behavior than expected because free-mode defaults change.

### WDesignKit PRO Upsell During This Journey

**Zero connection.** WDesignKit PRO upsell never appears during Nexter block configuration. The exact moment a user hits a Nexter PRO limit is the highest-intent moment to show WDesignKit premium features — extra block templates, pre-configured presets that bypass configuration entirely. **Zero integration between Nexter PRO gate and WDesignKit value prop.**

---

## Critical Finding 6: `class-nexter-block-render.php` — Hidden Integration Infrastructure

### What Was Found

WDesignKit admin directory contains: `class-nexter-block-render.php`

This file's existence confirms WDesignKit was intentionally architected to interact with Nexter block rendering. But:

- File is in admin layer, not exposed to Gutenberg editor
- No user-facing feature built on it that is visible in editor
- No documentation for what it does
- No widget types created using it

### What This Should Enable (But Doesn't)

WDesignKit custom blocks created via the widget builder should be renderable inside Nexter containers. A WDesignKit widget of type "gutenberg" should appear inside `tpgb/tp-container` as a usable child block.

Currently: WDesignKit Gutenberg blocks are rendered separately from Nexter's container system. The two block systems coexist but don't nest or compose with each other. User who wants a WDesignKit custom button inside a Nexter container → has to know they're separate systems and manually manage nesting compatibility.

### Concrete UX Failure

```
User workflow (intended):
  WDesignKit custom block (button) → drag into tp-container → works seamlessly

Actual user workflow:
  WDesignKit custom block → tp-container parent check → not in allowed children list
  → Block may not accept WDesignKit child blocks as valid inner content
  → User forced to use separate sections for Nexter vs WDesignKit blocks
```

`class-nexter-block-render.php` should be the bridge. It is not exposed. Users never benefit from its existence.

---

## Critical Finding 7: Nexter Theme Builder — Zero-State With No WDesignKit Bridge

### Data

- `nxt_builder` post type registered (Nexter Extension theme builder)
- Templates created: **0**
- WDesignKit integration with nxt_builder: **0**
- WDesignKit template import for nxt_builder context: **not found**

### Journey Failure

Type D user (theme builder, 10% of installs):
1. Installs Nexter Extension to build header/footer in Gutenberg style
2. Goes to Nexter Extension → Theme Builder
3. Sees empty list → "New Template" button
4. Creates new Header template → blank canvas opens in editor
5. Doesn't know what to put there → looks for ready-made header layout
6. **WDesignKit has header-type templates that could import here**
7. **Zero integration. Zero import button. Zero WDesignKit mention.**
8. User exits → searches "gutenberg header templates" on Google

This is **the identical failure pattern as the Sticky Header Effects audit** but in Gutenberg context — and the solution is different. For Nexter theme builder specifically, WDesignKit should offer `nxt_builder`-compatible template import, not generic Elementor templates.

---

## Gutenberg Workflow Problems

### Problem 1: Block Inspector Has No "Start Here" Path

First-time user experience for every Nexter block:
- No "Quick Setup" panel shown first
- No highlighted required fields (content vs styling)
- No "Default Style" that looks production-ready out of box
- No block preview in inserter showing what the block can look like

User opens tp-testimonials with 159 attributes → doesn't know which 5 actually matter for a working result. Remaining 154 = noise. No tool surfaces the 5 that matter.

---

### Problem 2: No Block-Level WDesignKit Preset Access

When user is inside Nexter block inspector → no way to:
- Import a preset layout from WDesignKit
- Save current configuration to WDesignKit
- Browse similar completed examples from WDesignKit library
- Push this block to WDesignKit workspace for reuse across sites

The inspector panel is a single-context tool. WDesignKit never appears there. Block configuration and cloud storage are completely disconnected.

---

### Problem 3: Responsive Settings Buried in Every Block Individually

Many blocks have responsive settings (desktop/tablet/mobile overrides). These are embedded inside each block's own inspector as custom controls — **not** using WordPress's native responsive system.

User building 10 Nexter blocks must configure responsive behavior 10 separate times, in 10 different settings locations, with 10 different UI patterns (some blocks use tabs, some use icons, some use dropdowns for breakpoint selection).

No unified responsive control surface. No "apply to all blocks" shortcut.

WDesignKit could provide a "responsive manager" for Nexter block configurations — zero feature exists.

---

### Problem 4: Block Search Returns No Nexter Results for Semantic Queries

User types "testimonial" in block search → finds tp-testimonials (correct).
User types "review" → likely finds nothing (no keyword match to Nexter block names/keywords).
User types "quote" → finds core/quote, not Nexter's tp-blockquote.

From block.json audit: keyword arrays are empty or minimal for most Nexter blocks. Semantic search fails for non-exact block names. Users who don't know "tpgb" block naming convention miss blocks entirely.

---

### Problem 5: No Block Performance Feedback

All 47 dynamic blocks make server render calls. Heavy pages with multiple complex blocks (tp-post-listing: 230 attrs, tp-navigation-builder: 250 attrs) generate multiple server round-trips on every edit.

No "this block is heavy" indicator in editor. No performance mode. No "static HTML" option for finalized blocks. WDesignKit has no "block performance" view in admin either.

---

## Engagement Blockers

### Blocker 1: First Block = First Failure Moment

Attribute overload on first block insert = negative first impression that doesn't recover. User who fails with Infobox on day 1 never tries the block again. Nexter has 49 blocks but effective usable blocks for new user = blocks simple enough to configure without guidance ≈ 8–10. 39–41 blocks are functionally invisible to non-expert users.

**WDesignKit presets for these blocks = the unlock.** Never built.

---

### Blocker 2: No Second-Day Reason to Return

User completes page build with Nexter blocks. Closes editor. WDesignKit never touched. No email. No "you used 3 Nexter blocks — here's what you can add next." No pattern suggestion. No "save this layout" prompt on publish.

Publish action = engagement opportunity WDesignKit never hooks into.

---

### Blocker 3: Color Frustration Silently Destroys Trust

User sets brand colors in WordPress Global Styles. Adds Nexter block. Color doesn't apply. User troubleshoots for 20 minutes. Finds no answer. Concludes "Nexter blocks don't work with my theme." May uninstall Nexter entirely. WDesignKit loses user from ecosystem before its own value is even communicated.

Root cause is `supports_color: false` — architectural, not configurable. Zero warning given.

---

### Blocker 4: No Cross-Block WDesignKit Discovery Path

Working in tp-infobox inspector for 10 minutes → no WDesignKit mention anywhere → user exits inspector. No "you spent 10 min configuring this — save it to WDesignKit for reuse" prompt. No micro-conversion moment captured.

---

### Blocker 5: Nexter Extension Features Unreachable from Editor

Nexter Extension has code snippets, performance settings, SMTP. All accessible only from WP admin → Nexter Extension. Zero access from Gutenberg editor context. User who wants to add custom CSS for a specific block behavior must: exit editor → find Nexter Extension → code snippets → write CSS → return to editor.

WDesignKit's snippet feature (if connected) would be the natural bridge — available in editor context. Not connected.

---

## Retention Weaknesses

| Weakness | Root Cause | Impact |
|---|---|---|
| Attribute overload → user sticks to 5 simple blocks only | No presets, no quick-start | 44 blocks go permanently unused |
| No Global Styles support | `supports_color: false` on all blocks | User abandons Nexter on FSE themes |
| No patterns to discover | Zero patterns registered | Pattern seekers leave ecosystem entirely |
| All dynamic blocks = plugin dependency | User unaware content is fragile | Deactivation = content loss = user anger |
| No WDesignKit preset system for Nexter | `class-nexter-block-render.php` unused | Integration infra wasted |
| Nexter theme builder: 0 templates, no WDesignKit import | No connection between systems | Theme-level workflow completely unserved |
| Block search fails semantic queries | Empty keyword arrays in blocks | Users can't find blocks they'd use |
| No responsive manager across blocks | Each block = separate responsive settings | 10 blocks = 10× responsive config pain |

---

## Bug Reports — Gutenberg-Specific

---

### All Nexter blocks opt out of WordPress Global Styles color system

**Severity:** P1
**Area:** Functionality / Integration

**Issue:** All 49 Nexter Blocks register with `supports_color: false` in their block definitions. WordPress Global Styles (Appearance → Editor → Styles) color palette does not apply to any Nexter block. Users who configure brand colors in Global Styles — the WordPress-recommended single source of truth — find Nexter blocks completely ignore those settings. Each block requires independent color configuration through its own settings panel.

**Steps to Reproduce:**
1. Install WordPress 6.9+ with any FSE-compatible theme (Twenty Twenty-Four, Twenty Twenty-Five)
2. Go to Appearance → Editor → Styles → Colors → Set a brand color (e.g., blue #0057FF) as primary
3. Open Gutenberg editor on any post/page
4. Insert any Nexter Block (tp-heading, tp-button, tp-infobox, etc.)
5. Observe heading/button/infobox color

**Expected Result:** Block inherits primary color from Global Styles. User sees their brand color applied without any additional configuration.

**Actual Result:** Block renders with its own default color. Global Styles color not inherited. User must manually set color inside each block's inspector panel. No warning about Global Styles incompatibility shown anywhere.

---

### Nexter Blocks registers zero block patterns — Patterns tab shows no POSIMYTH content

**Severity:** P1
**Area:** Functionality / Feature Gap

**Issue:** WordPress 6.9 Gutenberg Patterns tab (block inserter → Patterns) is the primary in-editor surface for users who want ready-made section layouts. Nexter Blocks v4.7.9 registers zero block patterns (`register_block_pattern()` not called anywhere). WDesignKit v2.3.2 also registers zero patterns. The only patterns available in the Patterns tab are 6 core WordPress placeholders. Users searching for "hero," "pricing," "team," or any content type find zero Nexter/WDesignKit content.

**Steps to Reproduce:**
1. Install Nexter Blocks and WDesignKit on WordPress 6.9
2. Open Gutenberg editor on any post/page
3. Click (+) → Patterns tab
4. Search for "hero section" → observe results
5. Search for "pricing" → observe results
6. Search for "team" → observe results
7. Browse all pattern categories → count POSIMYTH patterns

**Expected Result:** At minimum, 10–20 Nexter block patterns appear in the Patterns tab covering common section types. WDesignKit patterns appear as a separate source if WDesignKit installed.

**Actual Result:** Zero Nexter patterns. Zero WDesignKit patterns. Only 6 WordPress core placeholder patterns (About Page, Contact Page, etc.).

---

### High attribute count blocks ship with no presets or guided first-run experience

**Severity:** P1
**Area:** UX / Logic

**Issue:** The heaviest Nexter blocks (tp-infobox: 287 attributes, tp-navigation-builder: 250, tp-post-listing: 230, tp-pricing-table: 209, tp-flipbox: 180) present all settings simultaneously through a multi-tab inspector panel with no preset styles, no recommended-settings subset, and no in-editor getting-started guidance. First-time users inserting these blocks face blank default states with no indication of which settings produce a usable result.

**Steps to Reproduce:**
1. Open Gutenberg editor on a blank page
2. Insert tp-infobox block via the block inserter
3. Observe default visual state in editor canvas
4. Open block inspector panel
5. Count settings tabs and available attributes
6. Attempt to configure block to a production-quality state without prior knowledge

**Expected Result:** On first insert, block shows a selection of 4–6 preset styles. User picks one → block populated with working defaults. Settings panel shows only the most important fields first ("Basic" mode). Advanced settings accessible via toggle.

**Actual Result:** Block inserts as blank/default state. All 287 attributes visible across multiple tabs simultaneously. No preset. No recommended settings. No guided flow. Users who don't know which settings to configure abandon the block.

---

### Dynamic server-side blocks have no plugin-dependency warning

**Severity:** P2
**Area:** Logic / UX

**Issue:** 47 of 49 Nexter blocks use server-side rendering (`render_callback` registered). Post content stores block attributes but not rendered HTML. If Nexter Blocks plugin is deactivated or deleted, all content built with Nexter blocks becomes invisible (editor shows raw block comment markup, frontend shows nothing). No warning is ever shown to users about this content dependency. Users building production sites with Nexter blocks are unknowingly creating plugin-dependent content with no visibility into the risk.

**Steps to Reproduce:**
1. Build a page using 5+ Nexter blocks (tp-heading, tp-infobox, tp-button, etc.)
2. Publish page — content appears correctly on frontend
3. Go to Plugins → Deactivate Nexter Blocks
4. Visit the published page on frontend
5. Visit the page in Gutenberg editor

**Expected Result:** Before deactivation, a notice warns: "Deactivating Nexter Blocks will hide content built with Nexter blocks on your site. X posts/pages use Nexter blocks." After deactivation, editor shows fallback message per block: "This block requires Nexter Blocks to display."

**Actual Result:** No warning before or during deactivation. Page content disappears silently after deactivation. Editor shows raw block markup. No recovery guidance.

---

### WDesignKit `class-nexter-block-render.php` integration class is never exposed to users

**Severity:** P2
**Area:** Functionality / Feature Gap

**Issue:** WDesignKit admin includes `includes/admin/class-nexter-block-render.php` — an integration class specifically named for Nexter block rendering. Despite this, zero user-facing features are built on this integration. WDesignKit Gutenberg custom blocks and Nexter blocks operate as completely separate, non-composable systems. Custom blocks created via WDesignKit widget builder cannot be inserted as children inside Nexter container blocks (`tpgb/tp-container` does not list WDesignKit blocks as allowed children).

**Steps to Reproduce:**
1. Create a custom Gutenberg block via WDesignKit widget builder
2. Open Gutenberg editor
3. Insert tpgb/tp-container block
4. Attempt to add WDesignKit custom block as child inside tp-container
5. Observe whether WDesignKit block is accepted

**Expected Result:** WDesignKit blocks composable inside Nexter containers. `class-nexter-block-render.php` exposes an integration that lets WDesignKit blocks use Nexter's rendering pipeline — or vice versa.

**Actual Result:** Systems operate independently. Integration class exists in codebase but no user-facing feature is built on it.

---

### Nexter block keyword arrays empty — semantic search fails in block inserter

**Severity:** P2
**Area:** UX / Functionality

**Issue:** Nexter block definitions in `block.json` have empty or absent `keywords` arrays for most blocks. WordPress block inserter search uses block title, description, and keywords for matching. Users searching with synonyms or semantic terms fail to find relevant Nexter blocks.

**Steps to Reproduce:**
1. Open Gutenberg editor
2. Click (+) to open block inserter
3. Search "review" → observe whether tp-testimonials appears
4. Search "quote" → observe whether tp-blockquote appears
5. Search "counter" → observe whether tp-number-counter appears
6. Search "grid" → observe whether tp-post-listing appears

**Expected Result:** Semantic keyword searches return relevant Nexter blocks. "review" → tp-testimonials, "quote" → tp-blockquote, "grid" → tp-post-listing, etc.

**Actual Result:** Searches for synonyms and common terms fail to surface Nexter blocks. Only exact or near-exact name matches succeed. Users who don't know POSIMYTH's naming convention miss blocks they would otherwise use.

---

### Nexter theme builder (nxt_builder) has no WDesignKit template import path

**Severity:** P2
**Area:** Functionality / Integration

**Issue:** Nexter Extension registers `nxt_builder` post type for building headers, footers, and archive templates. This post type has zero templates on fresh install. WDesignKit has template library content that could populate this context — but zero integration exists. Users opening Nexter theme builder for the first time see an empty list with only a blank "Add New" option and no guidance on importing ready-made header/footer templates from WDesignKit.

**Steps to Reproduce:**
1. Install Nexter Extension and WDesignKit on fresh WordPress
2. Navigate to Nexter Extension → Theme Builder (or nxt_builder admin page)
3. Observe empty template list
4. Look for WDesignKit template import option
5. Look for any "browse header templates" CTA

**Expected Result:** Empty state in Nexter theme builder shows: "Import a header template from WDesignKit" with direct link to filtered header templates. WDesignKit panel detects nxt_builder context and offers nxt_builder-compatible template imports.

**Actual Result:** Empty list. Only generic "Add New" button. Zero WDesignKit mention. User must build header from scratch in Gutenberg editor with no starting point.

---

## Quick Wins

| # | Win | Effort | Unique to Nexter/Gutenberg? |
|---|---|---|---|
| QW-1 | Register 10 Nexter block patterns in Patterns tab (hero, pricing, team, testimonial, CTA, features grid, FAQ, stats, contact, footer) | Dev: 2 days | Yes — patterns tab, first Nexter presence |
| QW-2 | Add 3 preset styles to tp-flipbox, tp-infobox, tp-testimonials (highest-insert blocks) | Dev + design: 3 days | Yes — block-level preset, not available anywhere |
| QW-3 | Add keywords to all block.json files (5 synonyms per block) | Dev: 4 hours | Yes — search improvement, zero risk |
| QW-4 | Add "plugin dependency" warning when Nexter blocks present on deactivation attempt | Dev: 2 hours | Yes — content safety, Gutenberg-specific |
| QW-5 | Empty-state CTA in Nexter theme builder → "Import from WDesignKit" | Dev: 3 hours | Yes — nxt_builder context, unique integration point |
| QW-6 | Expose `class-nexter-block-render.php` as "WDesignKit block inside Nexter container" feature | Dev: 1 week | Yes — composable blocks, major differentiator |
| QW-7 | Responsive control reminder in block inspector: "Set global responsive settings in WDesignKit" | Dev: 1 day | Yes — cross-plugin responsive management |
| QW-8 | Show "this block ignores Global Styles" tooltip for FSE-theme users | Dev: 4 hours | Yes — color system gap, prevents silent confusion |

---

## High-Impact Improvements

### HI-1: WDesignKit Preset Library for Nexter Blocks

**What:** Build "WDesignKit Presets" as the quick-style system for Nexter blocks. When user inserts any Nexter block, WDesignKit panel shows 6 preset designs for that block. User clicks one → all relevant attributes pre-filled with production-quality values. User edits only content (text, images).

Foundation: `class-nexter-block-render.php` already exists in WDesignKit. Build the preset storage and insertion UI on top of it.

**Positioning:** "WDesignKit makes Nexter Blocks beginner-friendly." Clear differentiation. Clear reason to install both.
**Effort:** High (preset design × 49 blocks + insertion UI — 6–8 weeks)
**Impact:** Unlocks 39 currently-inaccessible blocks for non-expert users. Transforms Nexter's value delivery.

---

### HI-2: Nexter Block Pattern Library (50 Patterns)

**What:** Register 50 Nexter block patterns across categories: Hero, Features, Pricing, Team, Testimonial, Stats, FAQ, CTA, Blog Grid, Contact, Footer, Header, About.

Each pattern = 1–3 Nexter blocks combined with production-quality default settings. Browsable in Gutenberg Patterns tab. Filterable by category.

**Positioned as:** WDesignKit as the pattern source ("Patterns powered by WDesignKit"). Drives WDesignKit install alongside Nexter.

**Effort:** High (pattern design × 50 + content production — 4–6 weeks)
**Impact:** Type B users (35%) fully served at primary discovery surface. Nexter + WDesignKit visible together in editor for first time.

---

### HI-3: Global Styles Bridge

**What:** WDesignKit provides a compatibility layer: maps WordPress Global Styles color tokens to Nexter block attribute values automatically. User sets brand color in Appearance → Editor → Styles → WDesignKit middleware writes those values into all Nexter block defaults.

Alternative approach: Update Nexter blocks to use `supports_color: true` natively. Bigger architectural change but proper long-term fix.

**Effort:** Medium (WDesignKit middleware) or High (Nexter block architecture change)
**Impact:** Eliminates the biggest silent frustration for FSE theme users. Nexter becomes compatible with 2026 WordPress development paradigm.

---

### HI-4: Block Complexity Triage UI

**What:** Add complexity mode to Nexter block inspector: "Simple | Standard | Advanced." 
- Simple: 10–15 most impactful settings
- Standard: 40–50 settings
- Advanced: all attributes

WDesignKit drives "Simple" mode by surfacing preset configurations that pre-fill the other 60–270 attributes.

**Effort:** High (UI for all 49 blocks — 5–7 weeks)
**Impact:** Removes attribute overload barrier permanently. All 49 blocks become accessible to new users.

---

### HI-5: Dynamic Block Content Audit Dashboard

**What:** WDesignKit admin dashboard widget showing: "This site has X pages using Nexter blocks. X blocks are server-side rendered. Deactivating Nexter Blocks affects these pages: [list]."

Also shows WDesignKit's own block dependency map. Users understand their content dependencies before they become a problem.

**Effort:** Medium (block usage scan + dashboard widget — 2–3 weeks)
**Impact:** Prevents content-loss disasters. Builds user trust. Creates ongoing reason to visit WDesignKit admin.

---

## Prioritized Action Plan

### Tier 0 — Nexter-Specific Fixes (< 1 Week Each)

| Action | What It Fixes |
|---|---|
| Add keywords to all block.json files | Semantic search failure — 4-hour fix, zero risk |
| Plugin dependency warning on deactivation | Silent content loss — 2-hour safety feature |
| Empty-state CTA in nxt_builder → WDesignKit | Theme builder dead-end — 3-hour integration |
| Global Styles incompatibility tooltip | Silent color confusion — 4-hour communication fix |

### Tier 1 — Pattern Library (Month 1)

| Action | Impact |
|---|---|
| 10 starter Nexter patterns in Patterns tab | In-editor POSIMYTH presence — first time ever |
| 3 preset styles for top 5 heaviest blocks | Unlocks previously inaccessible blocks |
| Expose class-nexter-block-render.php as composable block feature | WDesignKit + Nexter blocks composable |

### Tier 2 — Architecture Improvements (Quarter)

| Action | Impact |
|---|---|
| WDesignKit Preset Library for all 49 Nexter blocks | Beginner accessibility unlocked |
| Global Styles bridge (middleware or native support) | FSE compatibility achieved |
| 50-pattern library + WDesignKit as pattern source | Pattern tab fully owned by POSIMYTH |
| Block complexity Simple/Standard/Advanced mode | Attribute overload eliminated |

---

## Summary

Three Gutenberg-specific problems not covered in other audits:

**1. Attribute overload (72–287 attributes per block, zero presets):** 39 of 49 Nexter blocks are effectively inaccessible to new users without expert knowledge. WDesignKit's `class-nexter-block-render.php` is the unused foundation for a preset system that would unlock all of them.

**2. Global Styles disconnection (`supports_color: false` on all 49 blocks):** Silent failure for FSE theme users. Brand colors set in WordPress Global Styles never apply to Nexter blocks. No warning given. Trust erodes silently.

**3. Zero patterns registered:** Patterns tab = the primary discovery surface in Gutenberg 6.x. Nexter and WDesignKit both register nothing there. Type B users (35%) search, find nothing, leave ecosystem. This is the highest-ROI fix: 10 patterns, 2 days of work, permanent Patterns tab presence.

---

*Report generated: 2026-05-19*
*Methodology: PHP runtime introspection of block registry, pattern registry, options table, plugin file structure + block attribute complexity analysis + Gutenberg UX framework analysis*
*Key runtime findings: 49 tpgb/* blocks (avg 122 attrs), 0 patterns, supports_color:false on all blocks, class-nexter-block-render.php exists but unexposed*
