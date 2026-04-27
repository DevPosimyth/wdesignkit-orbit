# Accessibility Checklist
> WCAG 2.1 Level AA compliance. Run before every release.
> Automated tool: axe-core or Playwright + axe. Manual review required for keyboard and screen reader checks.

---

## Images & Media

- [ ] All meaningful images have descriptive `alt` text
- [ ] Decorative images use `alt=""` to be ignored by screen readers
- [ ] Videos have captions or transcripts
- [ ] Audio content has a transcript
- [ ] No information is conveyed by image alone without a text alternative

---

## Color & Contrast

- [ ] Normal text (< 18pt / < 14pt bold) has contrast ratio ≥ 4.5:1
- [ ] Large text (≥ 18pt / ≥ 14pt bold) has contrast ratio ≥ 3:1
- [ ] UI components (inputs, buttons, icons) have contrast ratio ≥ 3:1 against background
- [ ] No information is conveyed by color alone — always paired with text, icon, or pattern
- [ ] Focus indicators have ≥ 3:1 contrast against adjacent colors

---

## Keyboard Navigation

- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order follows the visual reading order (left-to-right, top-to-bottom)
- [ ] No focus traps outside of modal dialogs
- [ ] Modals trap focus correctly and return focus to the trigger element on close
- [ ] Dropdowns and menus are operable with arrow keys
- [ ] All actions available via mouse are also available via keyboard
- [ ] Skip navigation link (`Skip to main content`) is the first focusable element
- [ ] Keyboard shortcuts do not conflict with browser or OS shortcuts

---

## Focus Indicators

- [ ] All focusable elements have a clearly visible focus ring (not just outline: none)
- [ ] Focus indicator is visible on both light and dark backgrounds
- [ ] Custom focus styles meet the 3:1 contrast threshold

---

## Forms

- [ ] All form inputs have an associated `<label>` (via `for`/`id` or `aria-label`)
- [ ] No placeholder-only labels — placeholder text disappears on input
- [ ] Error messages are linked to their input via `aria-describedby`
- [ ] Required fields are indicated programmatically (`required`, `aria-required`)
- [ ] Error states are announced to screen readers (not just color change)
- [ ] Grouped inputs (radio buttons, checkboxes) use `<fieldset>` and `<legend>`

---

## ARIA & Semantics

- [ ] Semantic HTML used: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`
- [ ] Heading hierarchy is logical: single `<h1>`, then `<h2>`–`<h6>` in order
- [ ] ARIA roles used only where native HTML semantics are insufficient
- [ ] `aria-label` or `aria-labelledby` present on all icon-only buttons and toolbar items
- [ ] `aria-expanded` used correctly on accordion and dropdown triggers
- [ ] `aria-live` regions used for dynamic content updates (toasts, search results)
- [ ] `role="dialog"` and `aria-modal="true"` set on modals
- [ ] No empty `href` or `href="#"` without an `aria-label`

---

## Dynamic Content

- [ ] Loading states are announced to screen readers (`aria-busy`, `aria-live`)
- [ ] New content loaded via AJAX is announced correctly
- [ ] Page title updates on SPA/AJAX navigation
- [ ] Infinite scroll has a keyboard-accessible "Load more" alternative

---

## Motion & Animation

- [ ] No content flashes more than 3 times per second (seizure risk)
- [ ] Animations respect `prefers-reduced-motion` media query
- [ ] Auto-playing carousels have pause controls
- [ ] Parallax and scroll-triggered animations are disabled for reduced-motion users

---

## Automated Testing

- [ ] `axe-core` reports zero critical or serious violations
- [ ] Playwright accessibility scan passes on all key page templates
- [ ] Color contrast checker run on all text/background combinations

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Pass / ☐ Fail |
