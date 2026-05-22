# AI Template Page — QA Bug Report

**Page:** https://wdesignkit.com/ai-template  
**Figma:** https://www.figma.com/design/AdLQi0x6XmiKPTh2uImss0/WDK---Website?node-id=12321-58207  
**Date:** 2026-05-18  
**QA Dimensions Covered:** UI / Functionality / Logic / Accessibility / SEO / Responsive / Code Quality  

> **Note — Responsive section:** Chrome DevTools extension was unavailable during this session. Responsive findings are based on HTML structure analysis (viewport meta, layout patterns, class inspection). Visual verification at 375px / 768px / 1440px is recommended on an actual device or DevTools.

---

## Summary

| Severity | Count |
|---|---|
| P1 — High | 3 |
| P2 — Medium | 7 |
| P3 — Low | 6 |
| P2 — Responsive (needs visual verify) | 5 |
| **Total** | **21** |

---

### Primary CTA button has no href

**Severity:** P1  
**Area:** Functionality

**Issue:** The "Build Website with AI" hero CTA button has no `href` attribute. Clicking it does nothing — the button is non-functional.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Locate the primary CTA button "Build Website with AI" in the hero section
3. Click the button

**Expected Result:** User is navigated to the relevant page (templates or signup flow)

**Actual Result:** Nothing happens — no navigation, no action

---

### Placeholder "0" values in footer pitch text

**Severity:** P1  
**Area:** UI / Logic

**Issue:** The footer pitch line reads "Get 0 templates, 0 widgets, 0 code snippets, and 0 Figma files all in one powerful toolkit." The numbers are unresolved placeholders instead of actual counts from the platform.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll to the bottom of the page, above the footer
3. Read the pitch text block

**Expected Result:** Real numbers are shown (e.g. "Get 5000+ templates, 500+ widgets, 500+ code snippets, and 50+ Figma files")

**Actual Result:** All counts display as 0

---

### Placeholder "0" in newsletter subscriber count

**Severity:** P1  
**Area:** UI / Logic

**Issue:** The footer newsletter signup shows "Join 0 creators who get early access to new WDesignKit features." The subscriber count is an unresolved placeholder.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll to the footer newsletter signup section

**Expected Result:** A real subscriber count is shown (e.g. "Join 50,000 creators…")

**Actual Result:** Displays "0 creators"

---

### "How AI Template Import Works" heading duplicated on the same page

**Severity:** P2  
**Area:** UI / SEO / Logic

**Issue:** The H2 heading "How AI Template Import Works" appears twice on the page — once for the carousel/feature intro section and again for the 4-step workflow section. Using the same H2 text twice on one page is confusing for users, hurts SEO, and deviates from expected design intent where each section should have a unique heading.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll down from the hero section
3. Note the first "How AI Template Import Works" H2 (carousel section)
4. Continue scrolling to find the second identical H2 (4-step process section)

**Expected Result:** Each section has a distinct, descriptive H2 heading

**Actual Result:** Same H2 text appears twice, creating heading hierarchy confusion

---

### "Browse Templates Built for" section missing category filter tabs

**Severity:** P2  
**Area:** Functionality / UI

**Issue:** The Figma design shows category filter pills/tabs above the template cards in the "Browse Templates Built for" section. These filters are not present on the live page — users cannot filter templates by category (e.g. Fitness, Technology) from this section.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll to the "Browse Templates Built for" section
3. Look for category filter tabs or pills above the template cards

**Expected Result:** Category filter tabs are visible and functional, matching the Figma design

**Actual Result:** No filter tabs present; all 4 templates are shown without any filtering option

---

### No cookie consent / GDPR banner

**Severity:** P2  
**Area:** Logic / Security

**Issue:** The page has no visible cookie consent banner or GDPR opt-in prompt. The site is accessible to EU users and collects data (newsletter, analytics); a consent mechanism is legally required under GDPR.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template in a fresh browser session (clear cookies)
2. Observe the page on load

**Expected Result:** A cookie consent banner appears, allowing users to accept or decline non-essential cookies

**Actual Result:** No cookie consent banner is displayed

---

### Hero image alt text is vague and non-descriptive

**Severity:** P2  
**Area:** Accessibility / SEO

**Issue:** The hero section's main image has the alt text "AI Temp" — this is too short, vague, and meaningless for screen reader users and for image search indexing.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Inspect the hero section image element
3. Check its `alt` attribute value

**Expected Result:** Alt text describes the image content meaningfully (e.g. "AI-powered template import for a creative agency website")

**Actual Result:** Alt text is "AI Temp"

---

### Carousel slide images all share identical alt text

**Severity:** P2  
**Area:** Accessibility / SEO

**Issue:** All 5 carousel slides in the "How AI Template Import Works" section use the same alt text "Slider Image". This provides no useful information to screen reader users and reduces SEO value of the images.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Inspect the 5 carousel images in the first "How AI Template Import Works" section
3. Check each image's `alt` attribute

**Expected Result:** Each image has a distinct, descriptive alt text matching the slide content (e.g. "Website Template Preview", "Pre-Designed Widgets interface", "Drag-and-drop Widget Builder")

**Actual Result:** All 5 images have identical alt text: "Slider Image"

---

### No JSON-LD structured data on the page

**Severity:** P2  
**Area:** SEO / Code Quality

**Issue:** The page has no JSON-LD structured data markup (e.g. WebPage, Product, BreadcrumbList, or HowTo schema). For a feature landing page, adding structured data improves search engine understanding and enables rich results.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. View page source and search for `application/ld+json`

**Expected Result:** At least one JSON-LD block is present (e.g. WebPage or HowTo schema for the workflow steps)

**Actual Result:** No structured data found

---

### "Watch Demo" opens external YouTube instead of embedded video

**Severity:** P3  
**Area:** Functionality / UI

**Issue:** The "Watch Demo" CTA in the hero section links to an external YouTube URL (`https://youtu.be/BdjX7-s1-UA`). This breaks the user's flow by navigating them away from the page. An embedded modal video or inline player would keep users on the page.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Click "Watch Demo" in the hero section

**Expected Result:** A video modal or lightbox opens in-page and plays the demo

**Actual Result:** User is navigated away to external YouTube

---

### Footer badge and security icon alt texts are generic

**Severity:** P3  
**Area:** Accessibility / SEO

**Issue:** Footer badge images use placeholder alt texts: "ai-image", "ssl", "https", "gdpr", "paint", "idea", "magic", "container", "layout", "tools" etc. These are internal reference names, not descriptive alt text.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll to the footer
3. Inspect the security badge images and footer icon images

**Expected Result:** Alt text describes what each badge represents (e.g. "GDPR Compliant", "SSL Secured", "WordPress Compatible")

**Actual Result:** Alt texts use internal filenames and shortcodes as values

---

### Template card placeholder images have non-descriptive alt text

**Severity:** P3  
**Area:** Accessibility / SEO

**Issue:** Template card images in the "Browse Templates Built for" section have alt texts "wdkit-dummy-bg" and "wdkit-template" — these are internal naming conventions exposed as user-facing alt attributes.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll to the template showcase section
3. Inspect the alt attribute of template card images

**Expected Result:** Alt text describes the template (e.g. "Colo Fitness Elementor Template Kit preview")

**Actual Result:** Alt text reads "wdkit-dummy-bg" or "wdkit-template"

---

### No back-to-top button on a long scrolling page

**Severity:** P3  
**Area:** UI / Accessibility

**Issue:** The page is very long (9 sections + footer) but has no back-to-top button. Users who scroll to the bottom have no quick way to return to the top, which is especially impactful on mobile.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll to the bottom of the page
3. Look for a back-to-top control

**Expected Result:** A back-to-top button or floating control is available

**Actual Result:** No back-to-top button exists

---

### No breadcrumb navigation

**Severity:** P3  
**Area:** SEO / Accessibility

**Issue:** The AI Template page is an inner feature page but shows no breadcrumb navigation (e.g. Home > Features > AI Templates). No breadcrumb structured markup is present either.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template

**Expected Result:** Breadcrumb navigation is visible at the top of the page and BreadcrumbList JSON-LD is in the head

**Actual Result:** No breadcrumb UI or markup

---

### Footer social media links have no accessible labels

**Severity:** P3  
**Area:** Accessibility

**Issue:** Social media links in the footer (Facebook, Twitter, Instagram, YouTube, Pinterest) use only icon images with no accompanying `aria-label` or visible text. Screen reader users cannot distinguish between them.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Navigate to the footer with a screen reader or inspect the social icon links
3. Check for `aria-label` attributes on anchor tags

**Expected Result:** Each social link has an `aria-label` (e.g. `aria-label="Follow WDesignKit on Facebook"`)

**Actual Result:** No aria-labels found on social icon links

---

### "⚡ Built for Speed" heading deviates from Figma design

**Severity:** P3  
**Area:** UI / Code Quality

**Issue:** The live page uses "⚡ Built for Speed" as the H2 heading for the comparison section. The Figma design shows "Move Beyond Traditional Template Workflows" as the primary heading for this section, with the current H2 text appearing as a supporting subheading or label. The emoji also introduces an inconsistency with the overall typographic style of the page.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template
2. Scroll to the "Built for Speed" / comparison section
3. Compare heading text with Figma node 12321-58207

**Expected Result:** Heading matches the Figma design: "Move Beyond Traditional Template Workflows"

**Actual Result:** Heading reads "⚡ Built for Speed" with an emoji prefix not present in the design

---

## Responsive QA — Structural Findings

> Visual confirmation required at 375px (mobile) · 768px (tablet) · 1440px (desktop)

---

### No hamburger / mobile menu element detected

**Severity:** P2  
**Area:** Responsive / Functionality

**Issue:** No hamburger toggle button is present in the HTML (no `aria-label="menu"`, no toggle class, no mobile nav button). The full desktop navigation (Platforms, Resources, WDesignKit for, Pricing, Login, Get Started) will likely overflow or collapse incorrectly on small screens.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template on a 375px viewport
2. Observe the header navigation

**Expected Result:** A hamburger/toggle button replaces the desktop nav on mobile, opening a collapsible menu

**Actual Result:** No toggle button found in HTML — navigation may overflow or be inaccessible on mobile

---

### Comparison table columns may overflow on mobile

**Severity:** P2  
**Area:** Responsive

**Issue:** The "Old Way vs AI Template Way" section is built with two side-by-side div columns. No responsive stacking mechanism or breakpoint class is evident in the HTML. On narrow viewports this layout will likely render both columns too narrow to read or cause horizontal scroll.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template on a 375px viewport
2. Scroll to the "Move Beyond Traditional Template Workflows" comparison section

**Expected Result:** At mobile width, the two columns stack vertically (Old Way above, AI Way below)

**Actual Result:** Both columns likely remain side-by-side, causing cramped or overflowing text

---

### Continuous footer image strip causes horizontal scroll on mobile

**Severity:** P2  
**Area:** Responsive

**Issue:** The footer contains a repeating horizontal image strip (icon badges: WordPress, Elementor, Gutenberg, GDPR, SSL, etc.) with no explicit width constraint or overflow wrapper. On mobile this strip will extend beyond the viewport and cause horizontal scrolling of the entire page.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template on a 375px viewport
2. Scroll to the footer image strip above the main footer links

**Expected Result:** The strip either wraps to multiple rows, scales proportionally, or is hidden on mobile

**Actual Result:** Strip likely extends past the mobile viewport, triggering horizontal scroll

---

### Footer multi-column link grid not confirmed to stack on mobile

**Severity:** P2  
**Area:** Responsive

**Issue:** The footer contains 6 link columns (Company, Legal, Resources, WDesignKit For, Features, Get Support). No responsive stacking class or grid breakpoint is visible in the HTML. At 375px, 6 columns will either crush or overflow.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template on a 375px mobile viewport
2. Scroll to the footer link grid

**Expected Result:** Footer columns stack into a single column or accordion on mobile

**Actual Result:** Layout behaviour unconfirmed — no responsive class detected in HTML structure

---

### Hero and 4-step workflow sections lack confirmed mobile stacking

**Severity:** P2  
**Area:** Responsive

**Issue:** The hero section (text + image side-by-side) and the 4-step workflow section (horizontal step indicators) show no explicit responsive stacking class in the HTML. Without verified breakpoints, both sections risk rendering cramped or overflowing on 375px screens.

**Steps to Reproduce:**
1. Open https://wdesignkit.com/ai-template on a 375px viewport
2. Check the hero section — text and image should stack vertically
3. Scroll to the 4-step "How AI Template Import Works" workflow — steps should stack vertically

**Expected Result:** Both sections reflow to a single-column vertical layout on mobile

**Actual Result:** Visual stacking behaviour unconfirmed from HTML inspection alone — requires device/DevTools verification
