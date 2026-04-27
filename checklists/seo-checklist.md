# SEO & Meta Tags Checklist
> Verify on-page SEO, structured data, and social sharing tags before release.
> Tools: Google Search Console, Google Rich Results Test, ahrefs/Semrush, Screaming Frog.

---

## Title & Description

- [ ] Every page has a unique `<title>` tag (50–60 characters recommended)
- [ ] No two pages share the same `<title>`
- [ ] Every page has a unique `<meta name="description">` (120–160 characters)
- [ ] Meta description accurately summarizes the page content
- [ ] No keyword stuffing in title or description

---

## Canonical & Indexing

- [ ] `<link rel="canonical">` is present on all public pages
- [ ] Canonical points to the correct, preferred URL (no trailing slash inconsistency)
- [ ] `<meta name="robots">` is correctly set — `noindex` only on pages that should be excluded (admin, thank-you, etc.)
- [ ] `robots.txt` is present, valid, and not accidentally blocking key pages
- [ ] `sitemap.xml` is present, valid, and submitted to Google Search Console
- [ ] Sitemap includes all public pages and excludes noindex pages
- [ ] WordPress version is not exposed in `<meta name="generator">`

---

## Heading Hierarchy

- [ ] Each page has exactly one `<h1>` tag
- [ ] `<h1>` matches or closely reflects the page title
- [ ] Heading levels are in logical order (`<h2>` → `<h3>` → `<h4>`) — no skipped levels
- [ ] Headings describe the content section — not used purely for styling

---

## URLs

- [ ] URLs are clean, lowercase, and use hyphens (not underscores)
- [ ] No query strings in public-facing page URLs (except search/filter pages)
- [ ] No redirect chains longer than 2 hops
- [ ] No broken internal links (verified with Screaming Frog or link checker)
- [ ] No broken external links on key pages

---

## Open Graph (Social Sharing)

- [ ] `og:title` — unique per page, 55–95 characters
- [ ] `og:description` — unique per page, 125–200 characters
- [ ] `og:image` — present and at least 1200×630px
- [ ] `og:image:width` and `og:image:height` attributes set
- [ ] `og:url` — canonical URL of the page
- [ ] `og:type` — `website` for general pages, `article` for blog posts
- [ ] `og:site_name` — name of the site

---

## Twitter Cards

- [ ] `twitter:card` — `summary_large_image` for pages with a featured image
- [ ] `twitter:title` — present and under 70 characters
- [ ] `twitter:description` — present and under 200 characters
- [ ] `twitter:image` — present and at least 1200×628px
- [ ] Validate at: Twitter Card Validator

---

## Structured Data (JSON-LD)

- [ ] JSON-LD schema is present on relevant pages (Article, Product, FAQ, Organization)
- [ ] Schema validates with zero errors at Google Rich Results Test
- [ ] `@type` matches the page content type
- [ ] Required fields for the schema type are all populated
- [ ] No schema markup for content not visible on the page
- [ ] Plugin/product pages use `SoftwareApplication` or `Product` schema where appropriate

---

## Images

- [ ] All images have `alt` text (for SEO and accessibility)
- [ ] Image filenames are descriptive and use hyphens (not `image001.jpg`)
- [ ] Images are compressed and appropriately sized (no oversized images)
- [ ] WebP format used where possible with JPEG/PNG fallback

---

## Performance (SEO-Related)

- [ ] Core Web Vitals pass: LCP < 2.5s, CLS < 0.1, FID/INP < 200ms
- [ ] Page loads within 3 seconds on a simulated 4G connection
- [ ] No render-blocking resources on critical pages

---

## Search Console

- [ ] No Coverage errors in Google Search Console
- [ ] No manual actions or security issues flagged
- [ ] Sitemap submitted and successfully indexed
- [ ] Core Web Vitals report shows no "Poor" URLs

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Pass / ☐ Fail |
