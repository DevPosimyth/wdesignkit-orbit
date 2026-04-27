# Cross-Browser Compatibility Checklist
> Verify functionality, layout, and performance across all supported browsers and devices.

---

## Browser Support Matrix

| Browser | Version | Desktop | Mobile |
|---|---|---|---|
| Chrome | Latest | ✓ Required | ✓ Required |
| Firefox | Latest | ✓ Required | ✓ Required |
| Safari | Latest | ✓ Required | ✓ Required (iOS) |
| Edge | Latest | ✓ Required | — |
| Samsung Internet | Latest | — | ✓ Required |
| Chrome | Latest - 1 | ✓ Recommended | — |
| Firefox | Latest - 1 | ✓ Recommended | — |
| Safari | Latest - 1 | ✓ Recommended | — |

---

## Functional Checks (Run in Each Browser)

- [ ] All pages load without JS errors
- [ ] All forms submit and validate correctly
- [ ] All buttons, links, and CTAs work as expected
- [ ] File uploads work correctly
- [ ] AJAX/fetch calls succeed and handle errors correctly
- [ ] Modals, dropdowns, and tooltips open/close correctly
- [ ] Animations and transitions play correctly
- [ ] Third-party embeds (maps, videos, forms) render correctly

---

## Layout & Rendering

- [ ] No CSS rendering differences cause layout breaks
- [ ] Flexbox and CSS Grid layouts render consistently
- [ ] CSS custom properties (`var()`) render correctly in all browsers
- [ ] `clamp()`, `min()`, `max()` CSS functions work correctly
- [ ] `backdrop-filter` has a visible fallback in unsupported browsers
- [ ] Web fonts load and render correctly — no FOUT or FOIT
- [ ] SVG icons render correctly at all sizes
- [ ] `border-radius`, `box-shadow`, and gradient values render consistently

---

## Safari-Specific (Most Common Issues)

- [ ] `position: sticky` works correctly on iOS Safari
- [ ] Input elements render correctly — no unexpected iOS default styling
- [ ] `100vh` viewport issue handled (use `svh` or JS fix for iOS)
- [ ] Date inputs fall back gracefully on iOS if using `<input type="date">`
- [ ] Scroll behavior (`overflow: hidden`, fixed overlays) works on iOS
- [ ] `gap` in flexbox renders correctly (Safari 14.1+ required)
- [ ] Custom fonts load in Safari — no fallback flicker

---

## Firefox-Specific

- [ ] Scrollbar styling is acceptable or uses `scrollbar-width` property
- [ ] Focus rings use `:focus-visible` correctly
- [ ] `aspect-ratio` CSS property renders correctly

---

## Mobile Browsers

- [ ] Tap targets are ≥ 44×44px on all mobile browsers
- [ ] No hover-only interactions — all actions work on touch
- [ ] No unintended zoom on input focus (font-size ≥ 16px on inputs)
- [ ] Bottom navigation bars don't obscure sticky footers/CTAs
- [ ] Landscape orientation renders correctly

---

## JavaScript API Compatibility

- [ ] `IntersectionObserver` — polyfill or fallback for older browsers
- [ ] `ResizeObserver` — used safely with feature detection
- [ ] `fetch` — not used without error handling; polyfill for IE (if required)
- [ ] ES2020+ features (`?.`, `??`, `Promise.allSettled`) — transpiled if IE required
- [ ] No `window.crypto` calls without HTTPS check

---

## Testing Tools

```bash
# Run BrowserStack / Playwright cross-browser tests
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=chromium

# Check caniuse for any new CSS/JS feature used
# https://caniuse.com
```

---

## Sign-Off

| Browser | Reviewer | Date | Status |
|---|---|---|---|
| Chrome (latest) | | | ☐ Pass / ☐ Fail |
| Firefox (latest) | | | ☐ Pass / ☐ Fail |
| Safari (latest) | | | ☐ Pass / ☐ Fail |
| Edge (latest) | | | ☐ Pass / ☐ Fail |
| Safari iOS | | | ☐ Pass / ☐ Fail |
| Chrome Android | | | ☐ Pass / ☐ Fail |
