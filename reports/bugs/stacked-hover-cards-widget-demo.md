# Stacked Hover Cards — Widget Demo Page QA Report

**Page:** https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
**Figma:** https://www.figma.com/design/XkNqdYdahTbqGlhi6hAEFf/WDesignKit---Widgets--02-?node-id=16528-4534
**Date:** 2026-05-21
**QA Dimensions Covered:** UI/Design · Functionality · Responsiveness · Logic · Accessibility · SEO/Meta · Performance · Code Quality · Security · Console/Network · Cross-Browser (static)

---

### "Download Now" button has no href and performs no action

**Severity:** P1
**Area:** Functionality

**Issue:** The primary "Download Now" CTA button in the hero section has no `href` attribute and no JavaScript click handler attached at the HTML level. The rendered markup is `<a class="button-link-wrap" role="button" data-hover="Download Now">Download Now</a>` — clicking the button does nothing and navigates nowhere.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. Locate the "Download Now" button in the hero section
3. Click the button

**Expected Result:** User is directed to the widget download or WDesignKit pricing/install page

**Actual Result:** Click has no effect — the button is a dead link

---

### Missing meta description tag

**Severity:** P1
**Area:** SEO

**Issue:** The page has no `<meta name="description">` tag in the `<head>`. This is a mandatory SEO requirement. Without it, search engines generate their own snippet from page body text, which is typically low quality and reduces CTR.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source (`Ctrl+U`)
3. Search for `<meta name="description"`

**Expected Result:** A unique, descriptive meta description (120–160 characters) summarising the Stacked Hover Cards widget

**Actual Result:** No meta description tag present

---

### Missing Open Graph tags

**Severity:** P1
**Area:** SEO

**Issue:** The page has no Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`). When this page is shared on social media (LinkedIn, Facebook, WhatsApp, Slack), no rich preview card is generated — only a plain URL is shown.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `og:`

**Expected Result:** Full set of OG tags present with widget-specific title, description, and a high-quality 1200×630px preview image

**Actual Result:** No OG tags found in page source

---

### Missing Twitter Card tags

**Severity:** P1
**Area:** SEO

**Issue:** No Twitter/X Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) are present on the page. Sharing this URL on X (Twitter) renders as a bare link with no preview.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `twitter:`

**Expected Result:** `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` tags present

**Actual Result:** No Twitter Card tags found

---

### Typo in travel demo content — "Tokyo, Japn"

**Severity:** P1
**Area:** UI

**Issue:** The travel booking demo section (FlyGo) displays "Tokyo, Japn" as a destination field value. The word "Japan" is misspelled as "Japn". This is visible on the live demo page and appears directly to every visitor.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. Scroll to the "Book here. Go There." / FlyGo demo section
3. Look at the "From" field value

**Expected Result:** "Tokyo, Japan" (correctly spelled)

**Actual Result:** "Tokyo, Japn" (misspelling)

---

### 16 empty H3 heading tags rendered in page source

**Severity:** P1
**Area:** Accessibility / Code Quality

**Issue:** The page source contains 16 instances of `<h3 class="wkit-stacked-h"></h3>` — empty heading elements with no text content. Screen readers announce each one as an empty heading, causing a confusing and broken navigation experience for assistive technology users. They also pollute the document outline and dilute SEO heading signals.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `wkit-stacked-h`

**Expected Result:** H3 tags only rendered when they contain actual title content; empty card slots should not output a heading element

**Actual Result:** 16 empty `<h3>` tags appear in the DOM

---

### 6 images with empty src="" attribute

**Severity:** P1
**Area:** Functionality / Code Quality

**Issue:** Six `<img>` elements in the page have `src=""` (empty string). Browsers make a network request to the current page URL for each empty-src image, resulting in wasted requests, potential console errors, and broken image rendering. These also fail accessibility checks.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `src=""`

**Expected Result:** All image tags have a valid, non-empty src URL

**Actual Result:** 6 `<img decoding="async" src="">` tags present in source

---

### Multiple images missing alt text

**Severity:** P2
**Area:** Accessibility / SEO

**Issue:** Multiple images throughout the page have `alt=""` (empty alt attribute), including the site logo, the hero widget preview image, and several UI/icon images. While decorative images can legitimately have empty alt, key content images (logo, hero visual) must have descriptive alt text for screen readers and image SEO.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `alt=""`

**Expected Result:** Site logo has alt text (e.g., "WDesignKit"), hero image has descriptive alt (e.g., "Stacked Hover Cards widget preview"), and other content images have meaningful alt attributes

**Actual Result:** Logo (`WDK-Logomark-Transparent.svg`), hero image (`Stacked-Hover-Cards-Hero-Image-6.png`), and multiple icon/UI images all have `alt=""`

---

### Duplicate and fragmented H2 headings — "The Year" appears twice

**Severity:** P2
**Area:** SEO / Accessibility

**Issue:** The heading "The Year" appears twice as a separate H2 in the page source, and "2026" is rendered as its own standalone H2 tag, making the heading structure fragmented and semantically incorrect. The full intended heading "The Year 2026" is split across two separate H2 elements in one instance, and "The Year" is then repeated again as another H2.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `<h2`

**Expected Result:** "The Year 2026" as a single, complete H2 heading; no duplicate headings

**Actual Result:** Three separate H2 tags: "The Year" / "2026" / "The Year" — two duplicates and a split heading

---

### Heading hierarchy skips from H2 to H6 in travel demo section

**Severity:** P2
**Area:** Accessibility / SEO

**Issue:** In the FlyGo travel booking demo, form field labels are marked as H6 elements (`<h6>From</h6>`, `<h6>To</h6>`, `<h6>Departure</h6>`) and field values are marked as H5 elements — creating a completely invalid heading structure (H2 → H6 → H5). This skips H3, H4, and H5 levels and then ascends backwards, which is invalid HTML and fails WCAG heading hierarchy requirements.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. Scroll to the "Book here. Go There." section
3. View page source and inspect the flight search form field markup

**Expected Result:** Field labels use `<label>` or `<span>` elements; heading tags not used for form field labels

**Actual Result:** `<h6>` used for field labels and `<h5>` used for field values, with heading levels skipping H3–H4 entirely

---

### Unprocessed template placeholder variables visible in production HTML

**Severity:** P2
**Area:** Code Quality

**Issue:** Two different unresolved template variable strings appear literally in the production HTML source: `data-repeater_bil4ri25="{repeater_bil4ri25}"` and `data-repeater_s5r6ra23="{repeater_s5r6ra23}"`. These raw placeholder strings indicate that the template/dynamic-tag processing for repeater link URLs is not being executed at render time. They appear on multiple anchor elements throughout the page.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `{repeater_`

**Expected Result:** Dynamic attributes are resolved to actual values; no raw `{variable}` placeholder strings visible in rendered HTML

**Actual Result:** Multiple anchor tags contain `data-repeater_bil4ri25="{repeater_bil4ri25}"` as a literal unprocessed string

---

### WordPress version exposed via generator meta tag

**Severity:** P2
**Area:** Security

**Issue:** The page head contains `<meta name="generator" content="WordPress 6.9.4" />` which publicly exposes the exact WordPress version. Attackers can use this to target known CVEs for that specific version.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `generator`

**Expected Result:** WordPress version not exposed in any meta tag; generator tag removed or value redacted

**Actual Result:** `<meta name="generator" content="WordPress 6.9.4" />` visible in source

---

### Elementor version exposed via generator meta tag

**Severity:** P2
**Area:** Security

**Issue:** The page head also contains `<meta name="generator" content="Elementor 4.0.6; features: ..." />` which publicly exposes the exact Elementor plugin version and active feature flags. This gives attackers version-specific exploit information.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `Elementor` in the meta generator tags

**Expected Result:** Elementor version not exposed; generator tag removed via filter (`remove_action('wp_head', 'wp_generator')`) or equivalent

**Actual Result:** `<meta name="generator" content="Elementor 4.0.6; features: additional_custom_breakpoints; settings: ..." />` visible in source

---

### xmlrpc.php endpoint publicly exposed via link in head

**Severity:** P2
**Area:** Security

**Issue:** The page head contains `<link rel="EditURI" type="application/rsd+xml" href="https://etemplates.wdesignkit.com/widgets/xmlrpc.php?rsd" />` which publicly advertises the XML-RPC endpoint. XML-RPC is a known attack vector for brute-force and DDoS amplification attacks.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `xmlrpc`

**Expected Result:** XML-RPC endpoint not advertised in page source; RSD link removed

**Actual Result:** `xmlrpc.php` endpoint URL exposed in a link tag in the `<head>`

---

### Multiple marquee-section links have empty href=""

**Severity:** P2
**Area:** Functionality / Code Quality

**Issue:** Multiple anchor elements in the marquee/ticker section have `href=""` — an empty string. Unlike `href="#"` which anchors to the top of the page, `href=""` causes the browser to reload the current page on click. This is unintended behaviour and will disrupt the user's scroll position when triggered.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `href=""`

**Expected Result:** Links either have a valid URL target or are styled as non-interactive elements

**Actual Result:** Multiple `<a href="" target="_blank" rel="nofollow">` tags present in the marquee section

---

### No breadcrumb navigation on widget demo page

**Severity:** P3
**Area:** UI / SEO

**Issue:** The page has no breadcrumb navigation (e.g., Home > Widgets > Stacked Hover Cards). Other widget demo pages on the same subdomain should follow a consistent navigation pattern. The absence of breadcrumbs makes it harder for users to discover related widgets and prevents breadcrumb rich results in Google Search.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. Check for any breadcrumb navigation below the header or above the H1

**Expected Result:** Breadcrumb trail present (e.g., Home > Widgets > Stacked Hover Cards)

**Actual Result:** No breadcrumb present

---

### No Schema.org structured data markup

**Severity:** P3
**Area:** SEO

**Issue:** The page has no JSON-LD structured data. For a widget/software product demo page, a `SoftwareApplication` or `Product` schema would enable rich results in Google Search (ratings, pricing, compatibility info). This is a missed SEO opportunity.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `application/ld+json`

**Expected Result:** JSON-LD block with `SoftwareApplication` or `Product` schema present

**Actual Result:** No structured data found

---

### "Collaboration" appears as an H2 heading mid-page

**Severity:** P3
**Area:** SEO / UI

**Issue:** The word "Collaboration" appears as a standalone H2 heading in the middle of the page between the "creators and brands meet here" demo and the testimonials section. From the Figma design, this appears to be a label/tag rather than a section heading, and does not describe a distinct page section. Using it as an H2 adds noise to the page's heading outline.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. Scroll to the testimonials section
3. Observe the "Collaboration" label directly above "People shared their love by words"

**Expected Result:** "Collaboration" rendered as a styled span or label, not an H2 heading element

**Actual Result:** `<h2 class="elementor-heading-title elementor-size-default">Collaboration</h2>` in page source

---

### HSTS header effectively disabled — max-age=0

**Severity:** P1
**Area:** Security

**Issue:** The `Strict-Transport-Security` response header is set to `max-age=0; preload`. A `max-age` of `0` explicitly instructs browsers to **remove** the HSTS policy rather than enforce it. This means HTTPS is not enforced at the browser level, leaving users vulnerable to SSL stripping attacks on subsequent visits.

**Steps to Reproduce:**
1. Run `curl -sI https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/ | grep strict-transport`
2. Observe the value

**Expected Result:** `strict-transport-security: max-age=31536000; includeSubDomains` (minimum 1 year)

**Actual Result:** `strict-transport-security: max-age=0; preload` — HSTS effectively disabled

---

### X-Frame-Options header missing — page is embeddable in iframes

**Severity:** P2
**Area:** Security

**Issue:** The page response has no `X-Frame-Options` header and no `Content-Security-Policy: frame-ancestors` directive. Any third-party site can embed this page inside an `<iframe>`, enabling clickjacking attacks where users are tricked into clicking elements while thinking they are on a different page.

**Steps to Reproduce:**
1. Run `curl -sI https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/ | grep -i x-frame`

**Expected Result:** `X-Frame-Options: SAMEORIGIN` or a CSP `frame-ancestors 'self'` directive

**Actual Result:** No `X-Frame-Options` header present

---

### Content-Security-Policy header missing

**Severity:** P2
**Area:** Security

**Issue:** No `Content-Security-Policy` (CSP) header is present on the page. Without CSP, there is no browser-enforced restriction on inline script execution, external resource loading, or frame embedding. This increases exposure to XSS and data injection attacks.

**Steps to Reproduce:**
1. Run `curl -sI https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/ | grep -i content-security`

**Expected Result:** A `Content-Security-Policy` header with at least `default-src`, `script-src`, and `frame-ancestors` directives

**Actual Result:** No CSP header found

---

### Marquee widget duplicates the same images 36–60 times in the DOM

**Severity:** P1
**Area:** Performance / Code Quality

**Issue:** The marquee/ticker widget on the page duplicates the same set of `tp-title-icon` images 36–60 times each in the rendered HTML, resulting in **1,333 `<img>` elements** in the DOM from an underlying set of approximately 20 unique images. This extreme DOM bloat significantly degrades rendering performance, increases memory usage, and inflates page weight — all without any visible benefit to the user.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. View page source
3. Search for `tp-title-icon` — the same image filenames repeat 36–60 times each

**Expected Result:** The marquee/infinite-scroll effect implemented via CSS animation on a minimal set of clones (2–3 copies maximum); not 36–60 full DOM duplicates per image

**Actual Result:** Single images like `Home-2.png` appear 60 times, `wdq.png` appears 48 times, and 10+ other images each repeat 36 times in the DOM

---

### Demo section images missing loading="lazy" attribute

**Severity:** P2
**Area:** Performance

**Issue:** The large demo section images (photography cards, travel cards, testimonial cards) all use `decoding="async"` but none have `loading="lazy"`. These are all below the fold and should defer loading until the user scrolls near them. Currently they all load eagerly on page load, increasing initial page weight and delaying LCP.

**Steps to Reproduce:**
1. View page source
2. Search for images in the demo sections (e.g., `Sunny-Day-Companions78.png`, `Frame-2085669086.png`)
3. Confirm no `loading="lazy"` attribute present

**Expected Result:** `loading="lazy"` on all below-fold images

**Actual Result:** All demo section images lack `loading="lazy"` — they load eagerly

---

### Demo section images missing width and height attributes — causes CLS

**Severity:** P2
**Area:** Performance / Accessibility

**Issue:** The majority of demo content images (all the stacked card images) have no `width` or `height` attributes in their `<img>` tags. Without these, the browser cannot reserve space before the image loads, causing layout shifts (CLS) as images pop in and push content down.

**Steps to Reproduce:**
1. View page source
2. Find demo card images such as `Sunny-Day-Companions78.png`, `Frame-2085669086.png`, etc.
3. Confirm no `width` or `height` attributes

**Expected Result:** All `<img>` elements have explicit `width` and `height` attributes matching the image's intrinsic dimensions

**Actual Result:** Images rendered without `width`/`height`, causing CLS violations

---

### Social icon links have no accessible name — icon-only with aria-hidden

**Severity:** P2
**Area:** Accessibility

**Issue:** The footer social icon links (Facebook, X/Twitter, Instagram, Pinterest) each contain only a Font Awesome icon with `aria-hidden="true"`. The `<a>` element itself has no `aria-label`, no visible text, and no title attribute. Screen readers announce these as unlabeled links, providing no information about their destination.

**Steps to Reproduce:**
1. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
2. Navigate to the footer social icons
3. Inspect markup — `<a>` has no `aria-label`; inner `<i>` has `aria-hidden="true"`

**Expected Result:** Each social link has an `aria-label` (e.g., `aria-label="Follow WDesignKit on Facebook"`)

**Actual Result:** All four social icon links have no accessible name

---

### No prefers-reduced-motion support for hover card animations

**Severity:** P2
**Area:** Accessibility

**Issue:** The stacked hover card animations (expand/shift on hover, marquee scrolling) have no `@media (prefers-reduced-motion: reduce)` override. Users who have enabled "Reduce Motion" in their OS settings (common for vestibular disorders, epilepsy) will still experience all animations at full intensity.

**Steps to Reproduce:**
1. Enable "Reduce Motion" in macOS: System Settings → Accessibility → Display → Reduce Motion
2. Open https://etemplates.wdesignkit.com/widgets/stacked-hover-cards/
3. Observe the marquee ticker and hover card animations

**Expected Result:** Animations paused or significantly reduced when `prefers-reduced-motion: reduce` is active

**Actual Result:** All animations play at full speed regardless of system motion preference

---

## Summary

| Severity | Count | Issues |
|---|---|---|
| P1 | 8 | Download Now broken · meta description missing · OG tags missing · Twitter tags missing · typo "Tokyo Japn" · 16 empty H3 tags · 6 broken img src · HSTS disabled (max-age=0) |
| P2 | 15 | Missing alt text · duplicate H2 headings · H2→H6 skip · unprocessed template vars · WP version exposed · Elementor version exposed · xmlrpc exposed · empty href="" links · X-Frame-Options missing · CSP header missing · marquee DOM bloat (1,333 images) · no lazy loading on demo images · images missing width/height (CLS) · social icons no aria-label · no prefers-reduced-motion |
| P3 | 3 | No breadcrumb · no Schema.org markup · "Collaboration" as H2 |
| **Total** | **26** | |

**Checklists Completed:** ✅ All 11 dimensions + pre-release checklist (13/13 files read)

**Release Gate Status: ❌ QA FAILED** — 8 P1 bugs open. Release blocked until all P1 issues are resolved.
