# Logic Checklist
> Verify business logic, conditional behavior, and data integrity across all scenarios.

---

## Business Logic

- [ ] All features behave according to the approved specification/requirements
- [ ] Edge cases are handled: empty inputs, zero values, maximum values, special characters
- [ ] Boundary values tested: min/max field lengths, min/max numeric ranges
- [ ] Logic does not depend on client-side values that could be tampered with

---

## Conditional Logic

- [ ] Show/hide rules trigger correctly based on user input or state
- [ ] Enable/disable rules apply at the correct conditions
- [ ] Progressive disclosure — advanced options appear only when needed
- [ ] Conditional fields reset when the condition is no longer met

---

## Data Calculations

- [ ] Pricing, totals, discounts, and tax calculations produce correct results
- [ ] Counters and numeric displays update correctly on data changes
- [ ] Percentage calculations are rounded correctly and consistently
- [ ] Currency formatting is locale-correct (decimal separator, thousands separator)

---

## Access Control

- [ ] Role-based access control (RBAC) — users only see content they are permitted to
- [ ] Privileged actions (admin-only, editor-only) are blocked for lower roles
- [ ] Direct URL access to restricted pages redirects correctly
- [ ] API endpoints respect user roles — not just UI gates

---

## Data Integrity

- [ ] Paginated results do not skip or duplicate records across pages
- [ ] Sorting is deterministic — ties broken consistently
- [ ] Filtering does not return false positives or false negatives
- [ ] Soft-deleted records are excluded from listings unless intentionally shown
- [ ] Relationship data (parent/child, linked records) stays in sync on updates

---

## Date & Time

- [ ] Date/time values are stored in UTC and displayed in the user's timezone
- [ ] Daylight Saving Time transitions do not break date logic
- [ ] Date formatting is locale-correct
- [ ] Scheduled events fire at the correct time (cron, scheduled posts)
- [ ] Expiry logic (tokens, subscriptions) calculates from the correct timestamp

---

## State Management

- [ ] UI state matches server state after mutations (no stale data shown)
- [ ] Browser back/forward navigation restores the correct state
- [ ] Refreshing the page does not lose necessary state
- [ ] Concurrent updates by two users do not corrupt data

---

## Error & Fallback Handling

- [ ] API response errors are handled gracefully — no unhandled promise rejections
- [ ] Network timeouts show a user-friendly message and allow retry
- [ ] Retry/fallback logic works for failed network requests
- [ ] 404 and 500 states have designed fallback UI (not a blank or broken page)
- [ ] Partial data loads (some items failed) are handled and communicated

---

## Plugin-Specific Logic

- [ ] Widget settings save and restore correctly across editor sessions
- [ ] Dynamic content sources (custom fields, ACF, CPTs) populate correctly
- [ ] Shortcode attributes produce the correct output
- [ ] `wp_cron` tasks fire at the correct intervals without duplicate execution

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Pass / ☐ Fail |
