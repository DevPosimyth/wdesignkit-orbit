# Console Errors Checklist
> Zero console errors, warnings, and network failures are required before release.
> Check browser DevTools console AND network panel on every key page.

---

## Pages to Check

Run the full checklist on each of these page types:

- [ ] Home / Landing page
- [ ] Blog listing page
- [ ] Single post / page
- [ ] Plugin admin dashboard
- [ ] Widget settings panel (Elementor editor)
- [ ] Gutenberg editor with plugin blocks
- [ ] WooCommerce shop page (if applicable)
- [ ] WooCommerce product page (if applicable)
- [ ] Cart and Checkout (if applicable)
- [ ] User account / login / registration pages

---

## JavaScript Errors

- [ ] Zero `Uncaught TypeError` errors in the console
- [ ] Zero `Uncaught ReferenceError` errors (undefined variables)
- [ ] Zero `Cannot read properties of undefined/null` errors
- [ ] Zero unhandled Promise rejections (`UnhandledPromiseRejectionWarning`)
- [ ] Zero `SyntaxError` in any loaded JS file
- [ ] Zero `Maximum call stack size exceeded` (infinite recursion)

---

## Network Errors

- [ ] Zero 404 responses for CSS files
- [ ] Zero 404 responses for JavaScript files
- [ ] Zero 404 responses for image or font assets
- [ ] Zero 404 responses for API or REST endpoints
- [ ] Zero 500/503 server errors on any request
- [ ] Zero failed AJAX or `fetch` calls (check XHR/Fetch in Network tab)

---

## Security Warnings

- [ ] Zero mixed content warnings (HTTP resources on HTTPS pages)
- [ ] Zero Content Security Policy (CSP) violation warnings
- [ ] Zero CORS errors for cross-origin requests
- [ ] Zero `X-Frame-Options` violations

---

## Deprecation Warnings

- [ ] Zero WordPress core deprecation notices (PHP and JS)
- [ ] Zero jQuery deprecation warnings (if jQuery is used)
- [ ] Zero browser API deprecation warnings (check for blue ⓘ warnings in DevTools)
- [ ] Zero React deprecation warnings (if applicable)

---

## PHP / Server-Side Errors

- [ ] Zero PHP `Fatal error` with `WP_DEBUG=true`
- [ ] Zero PHP `Warning` or `Notice` with `WP_DEBUG=true`
- [ ] Zero PHP `Deprecated` notices
- [ ] WordPress debug log (`/wp-content/debug.log`) is empty after full test run

---

## Performance Warnings

- [ ] No "Forced reflow" or layout thrashing warnings in Chrome Performance panel
- [ ] No `[Violation] 'setTimeout' handler took X ms` warnings
- [ ] No images flagged as missing `width`/`height` (CLS warning)
- [ ] No `[Violation] Added non-passive event listener to a scroll-blocking event`

---

## Automated Coverage

```bash
# Run Playwright core suite — checks for console errors on all key pages
npx playwright test tests/core.spec.js

# Enable WP_DEBUG for PHP error capture
# In wp-config.php:
# define('WP_DEBUG', true);
# define('WP_DEBUG_LOG', true);
# define('WP_DEBUG_DISPLAY', false);
```

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Pass / ☐ Fail |
