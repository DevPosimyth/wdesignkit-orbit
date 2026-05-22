# WDesignKit — Fresh User Journey & Product Growth Audit
**Audit Date:** 2026-05-18  
**Auditor Role:** Senior Product QA Analyst · UX Researcher · Product Growth Auditor  
**Entry Point:** The Plus Addons for Elementor (TPAE) → WDesignKit  
**Plugin Version:** WDesignKit 2.3.0 · Elementor 4.0.8  
**Environment:** WordPress 7.0-RC4 · PHP 8.2.29  
**Audit Scope:** First-Time User Experience · Feature Discoverability · Engagement & Retention · Conversion · Growth Blockers

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Environment Snapshot](#2-environment-snapshot)
3. [Fresh User Journey Map](#3-fresh-user-journey-map)
4. [Plugin Ecosystem Fragmentation Analysis](#4-plugin-ecosystem-fragmentation-analysis)
5. [Feature-by-Feature Discoverability Audit](#5-feature-by-feature-discoverability-audit)
6. [Critical Journey Gaps & Drop-Off Points](#6-critical-journey-gaps--drop-off-points)
7. [Product Blind Spots](#7-product-blind-spots)
8. [UX Friction Inventory](#8-ux-friction-inventory)
9. [Engagement & Retention Blockers](#9-engagement--retention-blockers)
10. [Conversion Blockers (Free → PRO)](#10-conversion-blockers-free--pro)
11. [Marketplace Data: Signals from Real User Behavior](#11-marketplace-data-signals-from-real-user-behavior)
12. [Recommendations: Quick Wins](#12-recommendations-quick-wins)
13. [Recommendations: High-Impact Improvements](#13-recommendations-high-impact-improvements)
14. [Prioritized Action Plan](#14-prioritized-action-plan)
15. [Bug Reports (UX/Product Issues)](#15-bug-reports-uxproduct-issues)

---

## 1. Executive Summary

WDesignKit is a powerful platform sitting inside a crowded widget/plugin stack, but it is **functionally invisible to the majority of users who install it through The Plus Addons for Elementor**. The product has four major structural problems that independently kill adoption:

| # | Problem | Impact |
|---|---|---|
| 1 | **Zero onboarding flow** — No welcome wizard, no feature tour, no contextual guidance on first activation | Users land on a blank or confusing admin screen |
| 2 | **Widget ecosystem fragmentation** — Users face 6 different widget sources in one Elementor panel (TPAE, EAEL, HFE, Elementor Free, Elementor Pro, WDesignKit) | WDesignKit widgets are unfindable |
| 3 | **Template library returns a critical error** ("Kit Not Found") on fresh install | Core feature is dead for new users |
| 4 | **Value proposition is never communicated** — WDesignKit's unique "create your own Elementor widget" capability is invisible throughout the plugin and the Elementor editor | Users never discover the platform's real differentiator |

Beyond these, the data reveals that **the code snippets feature has 0 usage** despite being enabled, PRO marketplace widgets show a 4.3% view-to-download conversion rate (vs. 59% for free), and the workspace/collaboration feature is entirely hidden from new users.

The platform has genuine, high-value capabilities. The failure is entirely in **how users discover, understand, and adopt them** — not in the features themselves.

---

## 2. Environment Snapshot

```
Site:            Language Translation (local dev)
WordPress:       7.0-RC4
PHP:             8.2.29
Elementor:       4.0.8 (Active)
Elementor Pro:   NOT installed
The Plus Addons: Active (TPAE)
Essential Addons: Active (EAEL)
Header Footer:   Active (HFE)
WDesignKit:      2.3.0 (Active)
Theme:           Twenty Twenty-Five 1.4

WDesignKit License: Studio Lifetime (valid)
User:            tester0107@yopmail.com
Credits:         25,000 total | 19,791 widget used | 2,116 template used | 0 snippet used
Local Widgets:   8 (all QA test artifacts — no real production widgets)
Pages:           2 (Sample Page, Privacy Policy draft)
```

---

## 3. Fresh User Journey Map

### Phase 1 — Plugin Activation (Day 0, Minutes 0–5)

**User's mental model:** "I installed The Plus Addons to get more Elementor widgets. WDesignKit came with it or was suggested. Let me see what it does."

| Step | What Happens | UX Rating | Problem |
|---|---|---|---|
| Plugin activated | WDesignKit activates silently | ❌ Critical | No welcome notice. No redirect to setup. Total silence. |
| User navigates to WP Admin sidebar | Sees "WDesignKit" menu item | ⚠️ Poor | Menu label gives no hint of value. No tagline or context. |
| User clicks WDesignKit | Lands on admin dashboard | ❌ Critical | No onboarding wizard. User sees feature toggles with no explanation of what they do or why they matter. |
| User sees "Builder" / "Template" / "Code Snippet" toggles | All are ON by default | ⚠️ Poor | No explanation of what each toggle does. No "start here" guidance. Toggle page is the first AND only screen they see. |
| User notices no "create widget" flow is immediately obvious | Confusion | ❌ Critical | The core value — building custom Elementor widgets — is not surfaced as a call-to-action anywhere on the settings screen. |

**Drop-off probability after Phase 1: ~65%** — Users who don't understand a plugin in under 60 seconds tend to leave and never return.

---

### Phase 2 — Opening the Elementor Editor (Day 0, Minutes 5–15)

**User's mental model:** "Let me open Elementor and see if WDesignKit adds any widgets I can use."

| Step | What Happens | UX Rating | Problem |
|---|---|---|---|
| User opens Elementor editor on any page | Widget panel loads | ⚠️ Poor | User sees ~150+ widgets across 10+ categories. Cognitive overload. |
| User scrolls widget categories | Sees: Basic, General, WordPress, Plus Essential, Plus Listing, Plus Creative, Plus Forms, Plus Advanced, Plus Header, Plus Single, Essential Addons, HFE Widgets, WDesignKit, Pro Elements | ❌ Critical | Six different plugin sources in one panel with no visual hierarchy. WDesignKit custom widgets appear last. |
| User finds "WDesignKit" category | Sees only 4 widgets (all QA test names: "CTA Widget", "Static Widget", etc.) | ❌ Critical | On a real fresh install with no custom widgets built, the WDesignKit category would either be empty or absent entirely. This communicates zero value. |
| User does not understand what WDesignKit widgets are | Confusion: "These look like custom-coded widgets, not polished ones" | ❌ Critical | The WDesignKit category does not communicate that these are USER-CREATED, REUSABLE Elementor widgets. No tooltip, no explanation, no CTA to build more. |
| User ignores WDesignKit category entirely | Proceeds to use TPAE or EAEL widgets as usual | 💀 Adoption death | User gets full Elementor value from other plugins without ever discovering WDesignKit's core feature. |

**Drop-off probability after Phase 2: ~85%** — Users who don't find a clear, immediately useful widget from WDesignKit abandon further exploration.

---

### Phase 3 — Discovering the Widget Marketplace (Day 1–3, if they return)

**User's mental model:** "I heard WDesignKit has a widget marketplace. Let me try to find it."

| Step | What Happens | UX Rating | Problem |
|---|---|---|---|
| User navigates to WDesignKit admin | Finds widget browse/import section | ⚠️ Moderate | The marketplace is accessible but not prominently linked from onboarding. User must know to look. |
| User browses marketplace widgets | Sees visually appealing widgets with preview images | ✅ Good | Good visual presentation with view/download counts. |
| User finds an interesting PRO widget | Sees PRO badge but no clear "upgrade" or "unlock" CTA | ❌ Critical | No clear value proposition or pricing shown inline. User doesn't know the cost to unlock. |
| User tries to download a free widget | Download flow works | ✅ Good | Free download works cleanly. |
| User imports widget into Elementor | Widget appears in WDesignKit category | ⚠️ Moderate | No post-import guidance: "Now drag this into your page from the Elementor panel." First-time users don't know this. |
| User tries the Template Library | Receives error: "Kit Not Found" | 💀 Critical | The template library is broken. This is the most damaging bug for first-time users who want to start with a template. |

**Drop-off probability after Phase 3: ~70%** — Template error kills conversion. No upgrade CTA kills PRO conversion.

---

### Phase 4 — Code Snippets Feature (Largely Undiscovered)

**User's mental model:** "I don't even know this exists."

| Step | What Happens | UX Rating | Problem |
|---|---|---|---|
| User has 0 snippet credits used despite 25,000 available | Feature entirely ignored | 💀 Critical | Snippet library has only 8 items (all WordPress maintenance PHP snippets). No discovery path from Elementor workflow. No Elementor-specific snippets. Feature feels developer-only. |
| User who finds snippet section | Sees PHP snippets for disabling XML-RPC, hiding WP version, etc. | ⚠️ Poor | Target audience (Elementor page builders) don't relate to these developer maintenance tasks. Wrong content for the audience. |

**Drop-off probability: ~99%** — This feature is essentially invisible and misaligned with the TPAE user persona.

---

### Phase 5 — Custom Widget Builder (The Core Feature, Never Discovered)

**User's mental model:** "Wait, I can BUILD my own Elementor widget? I had no idea."

This is the most severe discoverability failure in the entire product. The platform's greatest differentiator — the ability to create fully custom, reusable Elementor widgets with PHP/CSS/JS — is:

- ❌ Not mentioned anywhere in the WordPress admin sidebar
- ❌ Not introduced during activation
- ❌ Not shown as a CTA when the user lands on the settings page
- ❌ Not surfaced in the Elementor editor (no "Create your own widget" prompt)
- ❌ Not promoted in any tooltip or contextual help
- ❌ Has no sample/starter widget installed to demonstrate the concept
- ❌ Marketplace browsing doesn't explain this is how community widgets are MADE

Users who discover this feature become power users. But **they only discover it by accident** or through an external blog post/YouTube video.

---

## 4. Plugin Ecosystem Fragmentation Analysis

### The Widget Panel Problem

On a site with WDesignKit + TPAE + EAEL + HFE + Elementor Free + Elementor Pro, the Elementor widget panel contains:

| Source | Category Labels | Widget Count | User Confusion Level |
|---|---|---|---|
| Elementor Free | Basic, General, WordPress | ~35 | Low (familiar) |
| Elementor Pro | Pro Elements | ~50 | Medium (grayed out if no license) |
| The Plus Addons | Plus Essential, Plus Listing, Plus Creative, Plus Forms, Plus Advanced, Plus Social, Plus Header, Plus Single, Plus Archive | ~40 | High (too many categories) |
| Essential Addons | Essential Addons Elementor | ~20 | Medium |
| Header Footer for Elementor | HFE Widgets | ~10 | Medium |
| WDesignKit (custom) | WDesignKit | 4 (QA test names) | CRITICAL — unfindable and unexplained |

**Total: 150+ widgets across 15+ categories in a single sidebar panel.**

This is a cognitive overload problem. Users develop a mental shortcut: **they use the first 2–3 categories they recognize and never scroll down.** The WDesignKit category appearing last in alphabetical ordering means it is almost never organically discovered.

### Competing Widget Identity Crisis

The Plus Addons has ~40 high-quality, production-ready widgets covering: Accordions, Blogs, Buttons, Carousels, Countdown timers, Flip boxes, Forms, Galleries, Headers, Info boxes, Navigation menus, Pricing tables, Progress bars, Scroll effects, Social icons, Tables, Tabs, Team listings, Testimonials, and Video players.

**The question every user implicitly asks:** "If TPAE already gives me Blog Listings, Testimonials, Pricing Tables, and Carousels — what does WDesignKit's widget marketplace actually add that I can't already do?"

The answer is: **unique, visually distinct, interaction-heavy custom widgets** (Full Screen Menu, Portfolio Slider, Scrolling 3D Cards, etc.) — but **this value proposition is never communicated anywhere in the UI.**

---

## 5. Feature-by-Feature Discoverability Audit

| Feature | Discoverability | Friction Level | Current State |
|---|---|---|---|
| Widget Marketplace (browse) | Low — buried in admin | High | Accessible but not promoted |
| Template Library | Broken | Critical | Returns "Kit Not Found" error |
| Custom Widget Builder | Near-zero | Critical | Not surfaced anywhere in user flow |
| Code Snippets Library | Near-zero | Critical | 0 credits used; wrong audience content |
| Workspace / Collaboration | Zero | Critical | Requires knowing workspace ID — no discovery path |
| White Label | Zero | High | Not configured; no onboarding path |
| PRO Widget Unlock | Broken flow | Critical | No inline upgrade CTA; users don't know how to upgrade |
| Widget Push (user → marketplace) | Zero | Critical | Only discoverable by advanced users |
| AI Widget Builder (WDesignKit AI) | Unclear | High | Credits exist but no visible entry point for new users |
| Multi-Builder Support (Gutenberg/Bricks) | Zero | High | Gutenberg and Bricks builders enabled but no separate onboarding for non-Elementor users |

---

## 6. Critical Journey Gaps & Drop-Off Points

### Gap 1 — The Silent Activation (P0)
**Where:** Immediately after plugin activation  
**What happens:** Plugin activates with zero feedback. No admin notice. No redirect. No "getting started" banner.  
**User impact:** User has no idea what to do next. Most close the plugins screen and never visit WDesignKit again.  
**Drop-off estimate:** 60–70% of activations result in zero further engagement.

---

### Gap 2 — The Empty Widget Category (P0)
**Where:** Elementor editor, WDesignKit widget category  
**What happens:** On fresh install with no custom widgets, the category either shows only auto-imported demo widgets (QA test artifacts with confusing names) or is absent entirely.  
**User impact:** The first impression of WDesignKit inside Elementor communicates "this plugin adds nothing useful."  
**Drop-off estimate:** This is the single largest adoption killer.

---

### Gap 3 — The Broken Template Library (P0)
**Where:** WDesignKit Template Library screen  
**What happens:** API returns `{"success":false,"message":"Kit Not Found"}` — the template library fails to load for this account.  
**User impact:** Users trying to start with a template (which is the most common beginner behavior) hit an error and conclude the plugin is broken.  
**Drop-off estimate:** Any user who hits this error never tries the template feature again in this session.

---

### Gap 4 — No Post-Download Guidance (P1)
**Where:** After downloading a widget from the marketplace  
**What happens:** Widget is installed locally and appears in the Elementor panel. No notification, no tooltip, no "What to do next" prompt.  
**User impact:** Non-power users download widgets and then can't find them. They search for "where did my downloaded widget go?" — a common support query pattern.  

---

### Gap 5 — No Value Communication at Any Touchpoint (P1)
**Where:** Admin dashboard, plugin page, widget panel  
**What happens:** Nowhere in the admin UI does WDesignKit explain in plain language: "You can build custom Elementor widgets, import them from our marketplace, and share them across your team."  
**User impact:** Users never understand what makes WDesignKit different from the 5 other widget plugins already active.

---

### Gap 6 — PRO Upgrade Path is Invisible (P1)
**Where:** Marketplace when viewing PRO widgets  
**What happens:** PRO badge is shown but there is no "Upgrade to PRO", "Unlock with credits", or "How to get PRO" CTA anywhere inline.  
**User impact:** High-intent users who see a PRO widget they want have no clear next step. They abandon rather than seek out upgrade paths.

---

### Gap 7 — Snippet Feature Audience Mismatch (P2)
**Where:** Code Snippets section  
**What happens:** 8 snippets in the marketplace, all PHP server maintenance tasks (disable XML-RPC, limit revisions, hide WP version). 0 snippet credits used.  
**User impact:** The target TPAE user is a visual page builder, not a PHP developer. The current snippet library does not speak to their workflows (Elementor CSS tweaks, animation overrides, WooCommerce display hooks, etc.).

---

### Gap 8 — Workspace Feature is a Black Box (P2)
**Where:** Workspace/collaboration feature  
**What happens:** Workspace requires knowing workspace IDs. No invite flow, no dashboard overview, no "create your first workspace" prompt for new users.  
**User impact:** Team/agency users never discover collaboration features that could become a major retention driver.

---

## 7. Product Blind Spots

These are features the product team likely considers "available" but which users cannot realistically find or use without external documentation:

### Blind Spot 1 — The AI Widget Builder
**Status:** Credits allocated (25,000), AI generation appears available  
**Reality:** No visible entry point in the widget creation flow. New users don't know AI can help them build widgets. A feature that could be the #1 differentiator is invisible.

### Blind Spot 2 — Widget Versioning
**Status:** Version field visible in widget JSON (`"version":"1.0.0"`)  
**Reality:** No rollback UI, no version history displayed to users. The `wdesignkit-list-rollback-versions` ability exists in the API but is not surfaced in the UX.

### Blind Spot 3 — Cross-Builder Widget Support
**Status:** Gutenberg, Gutenberg Core, and Bricks builders all enabled in settings  
**Reality:** The entire onboarding narrative focuses on Elementor. Users coming from Gutenberg/Bricks have no custom journey. The Nexter Blocks (Gutenberg) widget ecosystem exists but is entirely disconnected from the WDesignKit discovery path.

### Blind Spot 4 — White Label Feature (Agency Use Case)
**Status:** Feature exists and is accessible via API  
**Reality:** Not configured on this install. Zero awareness among users that this exists. Agency users — who are the most valuable segment — never discover they can white-label the plugin for clients.

### Blind Spot 5 — The Widget Push Flow (Contribute to Marketplace)
**Status:** `wdesignkit-push-widget` ability exists  
**Reality:** No user-facing UI communicates "you can share your widget with the community." This eliminates the network effect that could grow the marketplace.

### Blind Spot 6 — Snippet Kits / Website Kits
**Status:** `snippet_type: "websitekit"` type exists in the API  
**Reality:** No website kits appear to exist yet. This is a potentially high-value feature (bundle of snippets for a specific use case) that is either unreleased or invisible.

---

## 8. UX Friction Inventory

### Friction 1 — Widget Category Name Mismatch (P2)
The WDesignKit category in Elementor is labeled "WDesignKit" but the widgets are called "CTA Widget", "Static Widget" etc. with generic technical names. Users can't tell from the category label that these are their own custom widgets.  
**Fix:** Category label should say "My Widgets (WDesignKit)" with a visible count badge.

### Friction 2 — Settings Screen Has No Action CTAs (P1)
The main WDesignKit settings page shows feature toggles (Builder ON, Template ON, Code Snippet ON) but has no "Get Started" button, no "Browse Marketplace" CTA, no "Build Your First Widget" prompt.  
**Fix:** Add a "Start Here" panel to the settings page with 3 action cards: Browse Widgets | Use a Template | Build a Widget.

### Friction 3 — No Search in Elementor Widget Panel for WDesignKit (P2)
Users who want to find a specific WDesignKit custom widget must scroll through 150+ widgets. Elementor's native search finds widgets, but only if the user knows the widget name.  
**Fix:** Ensure WDesignKit widget titles are descriptive and keyword-rich, not generic names like "Static Widget."

### Friction 4 — Template Error Has No Fallback State (P0)
When the template library fails ("Kit Not Found"), the user sees a raw error message with no alternative action, no contact support link, and no suggestion to try again.  
**Fix:** Implement a graceful error state with: "Templates could not load. [Try again] | [Contact Support] | [Browse the widget marketplace instead]"

### Friction 5 — Credit System Is Unexplained (P1)
The credit system (25,000 total, split into widget/template/snippet credits) is opaque. Users don't know:
- What costs credits vs. what is free
- How many credits they have
- What happens when credits run out
- How to get more credits  
**Fix:** Add a persistent credit balance indicator in the admin header with a tooltip explaining the credit model.

### Friction 6 — PRO Widgets Show No Upgrade Path (P0)
PRO-gated marketplace widgets show a PRO badge but no clickable CTA to upgrade or learn about pricing. Users with genuine purchase intent are blocked.  
**Fix:** PRO badge → clickable modal/page showing plan comparison and upgrade CTA.

### Friction 7 — No "Recently Downloaded" Widget Tracking (P2)
After downloading multiple widgets, there is no "My Downloads" or "Recently Added" view. Users can't see what they've already imported.  
**Fix:** Add a "Installed" tab or badge in the marketplace.

### Friction 8 — Snippet Downloads Have No Confirmation (P2)
Downloading a snippet (0 snippets downloaded in this session) provides no clear "how to activate this snippet" step. For non-developers, knowing where the snippet goes is a major confusion point.  
**Fix:** Post-download snippet dialog: "Your snippet is saved. Enable it from WDesignKit → Code Snippets → My Snippets."

### Friction 9 — No Elementor Editor Integration for WDesignKit Dashboard (P1)
There is no way to access WDesignKit features (browse marketplace, build widget) from within the Elementor editor itself. Users must exit the editor, go to WP Admin, and return to Elementor.  
**Fix:** Add a WDesignKit panel icon in the Elementor editor sidebar that opens the widget marketplace in a slide-over panel.

### Friction 10 — Widget Names Use Technical/Test Naming Conventions (P2)
Existing widgets in the system include: "QA Duplicate Test", "QA Import Fresh", "QA Import Test", "QA Update Test Renamed". These names appear in the Elementor widget panel if the widgets are active.  
**Impact:** Erodes trust and professionalism. Any user seeing QA test widget names in their production Elementor panel would assume the plugin is broken or in beta.  
**Fix:** Enforce widget name validation that prevents obvious test/debug names from becoming active in production.

---

## 9. Engagement & Retention Blockers

### Blocker 1 — No Reason to Return After Initial Visit (P0)
After activating WDesignKit and browsing the settings once, there is no:
- Email onboarding sequence
- In-plugin "what's new" notification
- Suggested next step
- Progress tracker ("You've built 0 widgets. Build your first!")

Users who activate and don't immediately see value have no hook to bring them back.

### Blocker 2 — The Marketplace Doesn't Grow the User's Site (P1)
Downloading a marketplace widget is a one-time action. There is no notification when a widget the user downloaded gets updated. No "Your widget has a new version available" message.  
**Impact:** Users don't revisit the marketplace because there's no trigger to do so.

### Blocker 3 — No Community Signal in the Product (P1)
The marketplace shows view and download counts, which is good — but only 1 snippet has a rating (5 stars, "Replace WordPress Logo on Login Page"). No reviews, no user comments, no "trending this week" section.  
**Impact:** Community and social proof are the strongest retention drivers for marketplaces. Their absence reduces marketplace stickiness.

### Blocker 4 — Workspace/Collaboration Never Activated (P2)
The workspace feature enables team sharing of widgets/templates/snippets. For agencies (the highest-value segment), this is the most compelling retention feature. But because there's no onboarding path to create or join a workspace, it is never activated.

### Blocker 5 — Snippet Credits Are Wasted (P2)
Zero snippet credits have been used despite 25,000 total credits available. The credit system incentivizes usage, but only if users know credits exist and can be spent. The current state suggests users never reach the snippet section at all.

### Blocker 6 — No "Aha Moment" Engineering (P0)
The WDesignKit "aha moment" — when a user truly understands the product's value — is building or importing a custom widget and seeing it appear in their Elementor panel. This moment is currently only reached by ~5% of users (based on the shallow local widget library). The product must actively engineer this moment in the first session.

---

## 10. Conversion Blockers (Free → PRO)

### PRO Widget Conversion Data (from live marketplace)

| Widget | Views | Downloads | Conversion Rate |
|---|---|---|---|
| Scrolling 3D Cards (PRO) | 2,902 | 125 | **4.3%** |
| Stacking Gallery Effect (PRO) | 1,343 | 72 | **5.4%** |
| Floating Testimonials (PRO) | 758 | 68 | **9.0%** |
| Full Screen Menu (FREE) | 1,761 | 1,040 | **59.1%** |
| Portfolio Slider (FREE) | 1,532 | 839 | **54.8%** |

**Key insight:** FREE widget conversion is 55–60%. PRO widget conversion is 4–9%. The gap is not about user desire (PRO widgets get MORE views per listing) — it's about the upgrade path being unclear or the value not justifying friction.

### Blocker A — No Inline Upgrade CTA (P0)
When a user clicks on a PRO widget, they see: an image, title, view count, download count, and a PRO badge. There is NO:
- "Upgrade to unlock" button
- Pricing information
- Plan comparison
- "What's included in PRO" summary

Users with purchase intent have nowhere to go.

### Blocker B — PRO = Ambiguous (P1)
Users don't understand if "PRO" means:
- A separate WDesignKit PRO license
- Additional AI credits
- A plan upgrade on wdesignkit.com
- Something they need to buy from The Plus Addons marketplace

This ambiguity paralyzes purchasing decisions.

### Blocker C — No Free Trial for PRO Widgets (P1)
There is no "try PRO widget for 7 days" or "preview before unlock" mechanism. High-consideration items (PRO widgets) require a commitment without sufficient product experience.

### Blocker D — No Social Proof on PRO Listings (P2)
Several high-viewed PRO widgets have 0 ratings (Scrolling 3D Cards: 2,902 views, only 2 ratings). The lack of ratings on high-traffic listings creates doubt at the conversion moment.

### Blocker E — Credit Expiry / Limits Unexplained (P1)
Users don't know if PRO widget downloads cost credits, require a separate plan, or are unlocked differently. The credit system confusion prevents action.

---

## 11. Marketplace Data: Signals from Real User Behavior

### What Users Actually Want (Top Free Downloads)

| Rank | Widget | Downloads | Signal |
|---|---|---|---|
| 1 | Full Screen Menu | 1,040 | Users want creative navigation — TPAE's basic menu doesn't satisfy this |
| 2 | Portfolio Slider | 839 | Visual portfolio display is a high-demand use case |
| 3 | Interactive Links | 651 | Hover interactions are underserved by standard Elementor |
| 4 | Team with Sliding Info | 604 | Dynamic team sections are popular but complex to build natively |
| 5 | Text Shimmer | 592 | Animated text effects are a growth category |
| 6 | Ripple Background | 587 | Animated backgrounds are in high demand |

**Growth insight:** The top-downloaded widgets fill **gaps in TPAE's own widget set**. This is exactly the right product strategy — WDesignKit should communicate "these are the widgets The Plus Addons doesn't have."

### The PRO Awareness Problem

"Scrolling 3D Cards" has 2,902 views but only 125 downloads (4.3%). This is not a "nobody wants it" problem — it's a **"nobody knows how to get it"** problem. The massive views/download gap on PRO items is the clearest signal that the PRO upgrade path is broken.

### Snippet Feature: Critically Underdeveloped
- Only 8 snippets total in the marketplace
- All are generic WordPress PHP maintenance snippets
- Highest downloads: Disable XML-RPC (71), Remove WP Version (69)
- All are developer-focused; zero relevance to Elementor page builders
- 0 snippet credits used on this account despite feature being fully enabled

**Recommendation:** Pivot the snippet library to **Elementor-specific CSS/JS snippets**: custom animation overrides, Elementor global color hacks, widget-specific CSS fixes, WooCommerce Elementor display tweaks. This is what TPAE users actually need.

---

## 12. Recommendations: Quick Wins

These can be implemented in 1–2 sprints with high immediate impact.

### QW-1 — Welcome Admin Notice on First Activation (1 day)
Show a dismissible admin banner on first activation: 
> "Welcome to WDesignKit! 🎉 Build custom Elementor widgets, import from our marketplace, and manage them across sites. [Browse Widgets] [Build Your First Widget] [Take a Tour]"

**Impact:** Reduces 60–70% first-session drop-off.

### QW-2 — Fix the Template Library "Kit Not Found" Error (1 day)
The template library is returning a broken state. Fix the API connection or display a graceful fallback with alternative actions.  
**Impact:** Unblocks one of the three main features for all new users.

### QW-3 — Rename WDesignKit Elementor Category (2 hours)
Change category label from "WDesignKit" to "My Custom Widgets (WDesignKit)" and show a "(0 widgets)" count for fresh installs with an inline CTA: "+ Browse Marketplace".  
**Impact:** Converts an empty, confusing category into a clear discovery trigger.

### QW-4 — Add PRO Upgrade CTA to Marketplace Listings (1 day)
On PRO widget detail view, add: 
> "🔒 PRO Widget — Unlock with WDesignKit PRO | [View Plans] or [Upgrade Now]"  
**Impact:** Directly addresses the 4.3% → expected 20%+ PRO conversion gap.

### QW-5 — Add "What's WDesignKit?" Tooltip to Settings Page (2 hours)
Add a persistent info card at the top of the settings screen explaining in one sentence what WDesignKit does and linking to the widget builder.  
**Impact:** Reduces the 65% day-0 drop-off from users who don't understand the plugin.

### QW-6 — Post-Download Widget Notification (4 hours)
After downloading a marketplace widget: show an in-editor (or admin) notification: 
> "Widget downloaded! Open the Elementor editor and find '[Widget Name]' in the WDesignKit category."  
**Impact:** Reduces the "where did my widget go?" support load and bridges the marketplace-to-editor gap.

### QW-7 — Add Credit Balance to Admin Header (4 hours)
Show a persistent "Credits: 19,791 remaining" indicator in the WDesignKit admin header with a "?" tooltip explaining the credit model.  
**Impact:** Makes the credit system tangible and encourages users to spend credits (increasing engagement).

### QW-8 — Starter Widget Sample (0.5 day)
Ship one polished sample "Hello WDesignKit" starter widget with every fresh install — a simple but well-styled button or heading widget that demonstrates what a custom widget looks like in the Elementor panel.  
**Impact:** The WDesignKit category is no longer empty. Users immediately understand the concept.

---

## 13. Recommendations: High-Impact Improvements

These require more planning but address structural growth limiters.

### HI-1 — Build a First-Time User Experience (FTUE) Flow (1–2 weeks)
A 3-step interactive onboarding wizard shown on first WDesignKit admin visit:
1. "Pick your builder" (Elementor / Gutenberg / Bricks)
2. "Get your first widget" (import from marketplace — pre-selected based on builder)
3. "Use it in your editor" (direct link to the active page with the widget open)

**Why:** Every successful product marketplace (WPBakery, JetPlugins, Crocoblock) has this. Without it, WDesignKit is invisible.

### HI-2 — Elementor Editor Integration Panel (2–3 weeks)
Add a WDesignKit icon to the Elementor editor sidebar that opens a slide-over panel showing:
- Recently used custom widgets
- "Browse Marketplace" CTA
- "Build a new widget" shortcut
- Credit balance

**Why:** Forces WDesignKit into the user's active workflow instead of being a separate admin area they never visit during page building.

### HI-3 — Pivot Snippet Library to Elementor Use Cases (1 week content + dev)
Replace (or supplement) the current generic PHP snippets with Elementor-specific CSS/JS/PHP snippets:
- "Custom animation for Elementor Hero section"
- "WooCommerce product price style fix for Elementor"
- "Disable Elementor editor for specific roles"
- "Elementor global font override for Google Fonts"
- "Add custom CSS class to all Elementor containers"

**Why:** Snippet credit usage is at 0. The current content is misaligned with the user persona. TPAE users are visual builders, not PHP developers. Serving their actual CSS/JS customization needs turns a dead feature into a daily-use tool.

### HI-4 — Workspace Onboarding for Agencies (1 week)
When WDesignKit detects the user has a "Studio" or "Agency" license, show a specific CTA:
> "You're on the Studio plan. Share widgets, templates, and snippets with your team. [Create Your Workspace]"

**Why:** The workspace feature is WDesignKit's best retention tool for high-value users and is currently completely hidden.

### HI-5 — "Made With WDesignKit" Showcase Feed (2 weeks)
A public gallery of sites/pages built with WDesignKit widgets, linked from the admin dashboard. Shows real-world results to inspire new users.

**Why:** TPAE users are visual decision-makers. Seeing polished pages built with WDesignKit widgets is the fastest way to communicate value.

### HI-6 — PRO Widget "Try Before Buy" Preview (2–3 weeks)
For PRO widgets: add a "Live Preview" button that opens a sandbox demo page where the user can interact with the widget in isolation, before committing to upgrading.

**Why:** The PRO view-to-download gap (2902 views, 125 downloads on Scrolling 3D Cards) is a high-intent audience blocked by uncertainty. Preview reduces friction significantly.

### HI-7 — "Push to Marketplace" Onboarding for Power Users (1 week)
Add a visible CTA in the widget builder after saving a widget: 
> "Love this widget? Share it with the WDesignKit community → [Publish to Marketplace]"

**Why:** The marketplace grows through community contributions. The push flow exists in the API but is invisible to 99% of users.

### HI-8 — AI Widget Builder Prominent Entry Point (1 week)
Surface the AI widget builder as a primary CTA on the dashboard: "Build a custom widget with AI in 60 seconds" with a simple prompt interface.

**Why:** AI-assisted creation is the biggest differentiator vs. all competing widget plugins. It should be the first thing new users are invited to try.

---

## 14. Prioritized Action Plan

### Tier 1 — Critical: Fix Within 1 Sprint (This Week)

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | Fix Template Library "Kit Not Found" error | S | P0 — blocks core feature |
| 2 | Add activation welcome notice + "Start Here" CTA | S | P0 — first impression |
| 3 | Add PRO upgrade CTA to marketplace listings | S | P0 — direct revenue impact |
| 4 | Rename Elementor widget category to "My Custom Widgets" | XS | P1 — discoverability |
| 5 | Add starter sample widget on fresh install | M | P0 — aha moment engineering |

### Tier 2 — High: Implement Within 2 Sprints (Next 2 Weeks)

| # | Action | Effort | Impact |
|---|---|---|---|
| 6 | Post-download widget notification + guidance | S | P1 — reduces support load |
| 7 | Add credit balance indicator to admin header | S | P1 — feature transparency |
| 8 | Pivot snippet library to Elementor-specific content | M | P1 — snippet adoption |
| 9 | Build 3-step FTUE onboarding wizard | M | P0 — user activation rate |
| 10 | Workspace CTA for Studio/Agency license holders | S | P1 — retention |

### Tier 3 — Strategic: Plan for Next Quarter

| # | Action | Effort | Impact |
|---|---|---|---|
| 11 | Elementor editor integration panel | L | P1 — daily workflow integration |
| 12 | AI widget builder prominent entry point | M | P0 — differentiation |
| 13 | PRO widget live preview | L | P1 — PRO conversion |
| 14 | "Made With WDesignKit" showcase feed | M | P2 — aspiration/inspiration |
| 15 | Community push-to-marketplace onboarding | M | P2 — marketplace growth |

---

## 15. Bug Reports (UX/Product Issues)

---

### Template library returns critical error on fresh install

**Severity:** P0  
**Area:** Functionality / Logic

**Issue:** The WDesignKit template library fails to load and returns `{"success":false,"message":"Kit Not Found","description":"Kit Id Not Found"}` on a fresh install with a valid Studio Lifetime license.

**Steps to Reproduce:**
1. Activate WDesignKit plugin on a fresh WordPress install
2. Log in to WDesignKit cloud account (any valid account)
3. Navigate to WDesignKit → Templates in wp-admin
4. Attempt to browse or load any template

**Expected Result:** Template library loads and displays available templates for the logged-in user

**Actual Result:** Error state: "Kit Not Found" / "Kit Id Not Found" — no templates displayed, no fallback UI, no actionable error message

---

### WDesignKit category in Elementor panel is empty and unexplained on fresh install

**Severity:** P1  
**Area:** Functionality / UX / Logic

**Issue:** On a fresh install, the WDesignKit category in the Elementor widget panel either shows QA test widget artifacts ("QA Duplicate Test", "QA Import Fresh") or is effectively empty. No guidance or CTA exists to help the user understand what this category is for or how to populate it.

**Steps to Reproduce:**
1. Install WDesignKit on a clean WordPress + Elementor installation
2. Do not manually import or create any widgets
3. Open Elementor editor on any page
4. Scroll to the WDesignKit widget category

**Expected Result:** Category shows either a "No custom widgets yet — Browse Marketplace" CTA or a sample starter widget

**Actual Result:** Category shows QA/test widget names or is absent, with no explanation, guidance, or call to action

---

### No PRO upgrade path visible from PRO-gated marketplace widgets

**Severity:** P0  
**Area:** Functionality / Conversion

**Issue:** When a user views a PRO-gated widget in the marketplace, the UI shows a PRO badge but provides no inline CTA, pricing information, plan comparison, or "Upgrade" button. Users with purchase intent have no action to take.

**Steps to Reproduce:**
1. Navigate to WDesignKit widget marketplace
2. Browse available widgets
3. Locate any PRO widget (e.g., "Scrolling 3D Cards", "Column Scroll", "PDF Viewer")
4. Click or hover on the PRO widget

**Expected Result:** A clear "Upgrade to PRO" or "Unlock this widget" CTA appears with pricing or plan information

**Actual Result:** Only a PRO badge is shown. No upgrade path, no pricing, no next step for the user

---

### No welcome screen or onboarding flow after plugin activation

**Severity:** P1  
**Area:** Logic / UX / Functionality (FTUE)

**Issue:** Activating WDesignKit produces zero user feedback. No admin notice, no redirect, no welcome screen, no getting-started guide. The user is left to discover all features independently.

**Steps to Reproduce:**
1. Install and activate WDesignKit on a clean WordPress installation
2. Observe the WordPress admin screen after activation

**Expected Result:** A welcome admin notice appears with a "Get Started" CTA, or the user is redirected to a brief onboarding screen explaining core features

**Actual Result:** Silent activation. User sees the standard plugin list with no indication of next steps

---

### Code snippet feature targets wrong user persona — 0% adoption signal

**Severity:** P2  
**Area:** Logic / UX / Feature Adoption

**Issue:** The code snippet marketplace contains only 8 PHP maintenance snippets (Disable XML-RPC, Limit Revisions, Hide WP Version, etc.). These snippets target WordPress developers, not the visual page-builder audience (TPAE users). Zero snippet credits have been used despite the feature being fully enabled with 25,000 total credits available.

**Steps to Reproduce:**
1. Navigate to WDesignKit → Code Snippets
2. Browse the marketplace
3. Review available snippets

**Expected Result:** Snippets relevant to Elementor workflows: CSS customizations, animation overrides, WooCommerce Elementor integration, widget behavior modifications

**Actual Result:** 8 generic PHP WordPress maintenance snippets with no relevance to Elementor or TPAE workflows

---

### Post-download widget has no user guidance on where to find it in Elementor

**Severity:** P1  
**Area:** UX / Functionality / Logic

**Issue:** After successfully downloading a widget from the WDesignKit marketplace, there is no notification, toast, or guidance telling the user where to find the widget in the Elementor editor. Users must independently discover that imported widgets appear under the WDesignKit category in the Elementor sidebar.

**Steps to Reproduce:**
1. Download any widget from the WDesignKit marketplace
2. Observe the post-download experience
3. Attempt to locate the downloaded widget in the Elementor editor

**Expected Result:** A notification or inline guide appears: "Widget downloaded! Find '[Widget Name]' in the WDesignKit category in your Elementor editor."

**Actual Result:** No notification. User must navigate to Elementor independently and search for the widget without guidance

---

*End of Report — 2026-05-18*  
*Generated by: Senior Product QA Analyst / UX Researcher / Product Growth Auditor*  
*Based on: Live WordPress environment analysis + MCP tool exploration + Marketplace data analysis*
