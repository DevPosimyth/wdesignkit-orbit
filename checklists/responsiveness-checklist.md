# Responsiveness Checklist
> Verify layout and usability across all viewport sizes and touch devices.

---

## Breakpoint Coverage

Test at each of the following widths:

| Breakpoint | Width | Device Reference |
|---|---|---|
| Mobile S | 320px | Small Android phones |
| Mobile M | 375px | iPhone SE / base iPhone |
| Mobile L | 425px | Large Android phones |
| Tablet | 768px | iPad portrait |
| Laptop | 1024px | Small laptop / iPad landscape |
| Desktop | 1440px | Standard desktop |
| Wide | 1920px | Large monitor |

---

## Layout

- [ ] No horizontal scroll at any breakpoint (320px → 1920px)
- [ ] No overlapping elements at any breakpoint
- [ ] No clipped or cut-off content at any breakpoint
- [ ] Grid/flex layouts reflow correctly at each breakpoint
- [ ] Multi-column layouts stack correctly on mobile
- [ ] Sidebars collapse or move to correct position on small screens
- [ ] Cards and list items maintain readable proportions at all sizes

---

## Navigation

- [ ] Desktop navigation is fully visible and functional at 1024px+
- [ ] Mobile navigation collapses to hamburger/off-canvas below 768px
- [ ] Mobile menu opens, closes, and all links work correctly
- [ ] Dropdown menus are accessible on touch devices (tap to open)
- [ ] Sticky headers don't obscure content on scroll at any size

---

## Touch & Interaction

- [ ] All interactive elements have a hit area ≥ 44×44px on mobile
- [ ] No hover-only interactions — all actions work on touch
- [ ] Swipe gestures work correctly where implemented (carousels, drawers)
- [ ] Pinch-to-zoom is not blocked unless intentionally disabled

---

## Typography

- [ ] Body text is ≥ 16px on mobile — no unreadably small text
- [ ] Headings scale down proportionally on small screens
- [ ] No text overflow or truncation unless intentional (with ellipsis)
- [ ] Line lengths remain comfortable (45–75 characters) at all sizes

---

## Images & Media

- [ ] Images are responsive — no oversized or cut-off images
- [ ] Images maintain correct aspect ratio at all breakpoints
- [ ] Videos/embeds resize correctly and don't overflow containers
- [ ] Hero images show the correct focal point on mobile crops

---

## Forms

- [ ] All form inputs are fully visible and usable on mobile
- [ ] Inputs are not hidden by the on-screen keyboard
- [ ] Submit buttons are always reachable on small screens
- [ ] Dropdowns/selects are usable on touch (native or custom)

---

## Modals & Overlays

- [ ] Modals are fully visible and scrollable on small screens
- [ ] Modal close buttons are reachable and tappable
- [ ] Drawers/sidesheets don't overflow the viewport

---

## Tables & Data Grids

- [ ] Tables have horizontal scroll or reflow to stacked layout on mobile
- [ ] No data is hidden or inaccessible due to table overflow
- [ ] Column headers remain visible when scrolling wide tables

---

## Plugin-Specific

- [ ] Elementor widget panel doesn't overflow at 320px sidebar width
- [ ] Gutenberg block renders correctly in editor at all editor widths
- [ ] Responsive controls (Desktop/Tablet/Mobile) are labeled in widget settings

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Pass / ☐ Fail |
