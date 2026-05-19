# Functionality Checklist
> Verify every interactive feature works correctly end-to-end before release.

---

## Buttons, Links & CTAs

- [ ] All buttons, links, and CTAs perform the correct action
- [ ] No dead links (404 responses on internal navigation)
- [ ] External links open in a new tab with `rel="noopener noreferrer"`
- [ ] Disabled buttons are visually distinct and non-interactive

---

## Forms

- [ ] All forms submit correctly with valid data
- [ ] All forms show inline validation errors with invalid data
- [ ] Required fields are enforced and labeled clearly (`*` or "Required")
- [ ] Form state is preserved on validation failure — no data loss on error
- [ ] Success feedback is shown after form submission
- [ ] Double-submit is prevented (button disabled after first click)

---

## Input Controls

- [ ] Dropdowns, toggles, checkboxes, and radio buttons behave correctly
- [ ] Multi-select and searchable dropdowns return correct selections
- [ ] Toggle switches update state immediately and persist on reload
- [ ] Date pickers accept valid formats and reject invalid dates

---

## Data Operations

- [ ] Create — new records save and appear correctly
- [ ] Read — data fetches correctly and displays in the right format
- [ ] Update — edits save and reflect without full page reload
- [ ] Delete — records are removed and UI updates immediately
- [ ] Confirmation dialogs appear before destructive actions (delete, reset)

---

## Search, Filter & Pagination

- [ ] Search returns correct results for exact matches
- [ ] Search handles empty queries, special characters, and long strings
- [ ] Filters apply correctly and combine as expected (AND/OR logic)
- [ ] Pagination shows correct page, item count, and navigation
- [ ] Sorting is correct and deterministic for all sortable columns

---

## File Uploads

- [ ] Accepted file types upload successfully
- [ ] Invalid file types are rejected with a clear error message
- [ ] Files exceeding the size limit are rejected with a clear error message
- [ ] Upload progress is shown for large files
- [ ] Uploaded files are accessible/downloadable after upload

---

## API-Layer Negative Testing (Mandatory for every form or API-backed feature)

> Do not rely on UI validation alone. Send these directly to the API endpoint.

- [ ] Empty string sent for every required field — API returns 4xx, not 200
- [ ] Whitespace-only value sent for every required field — API rejects, not silently trims
- [ ] Null / missing key sent for every required field — API returns 4xx
- [ ] Max-length exceeded — API enforces length limit, does not truncate silently
- [ ] HTML tags injected (`<script>alert(1)</script>`) — API rejects or escapes, does not store raw
- [ ] Special characters (`../../../`, `'`, `"`, `\0`, `%00`) — no path traversal, no injection
- [ ] Integer fields sent with string values — API validates type
- [ ] Numeric ID fields sent with another user's ID — API verifies ownership (IDOR check)
- [ ] Unauthenticated request sent to every protected endpoint — returns 401 or 403, not 200

---

## Generated File / Output Validation (Mandatory for any download or export feature)

> "Download succeeded" (HTTP 200) is not a pass. Open the file and validate its contents.

- [ ] Downloaded file is not empty (size > 0 bytes)
- [ ] File contents match the inputs supplied by the user — no default/fallback values substituted silently
- [ ] No developer names, internal emails, or hardcoded fallback values appear in the output
- [ ] No injected HTML or script tags appear in the output file (even if the input contained them)
- [ ] File is valid and parseable — ZIP extracts, PHP parses, JSON is valid, etc.
- [ ] Plugin header (if applicable): Name, Slug, Version, Author, Author URI all match user input exactly
- [ ] WordPress hook names, class names, and function names in the output match the widget slug/name
- [ ] `Author URI` in plugin header is a valid URL — `javascript:` protocol rejected
- [ ] Download works correctly in Chrome, Firefox, and Safari (blob URL / anchor click behavior)

---

## Notifications & Feedback

- [ ] Toast/snackbar notifications fire at the correct moments
- [ ] Notifications auto-dismiss after the expected duration
- [ ] Error notifications are distinct from success notifications
- [ ] No duplicate notifications fired on rapid actions

---

## Authentication & Session

- [ ] Login works with valid credentials
- [ ] Login rejects invalid credentials with a generic error (no user enumeration)
- [ ] Logout clears session and redirects to the correct page
- [ ] Already logged-in users cannot access login/signup pages
- [ ] Password reset flow works end-to-end
- [ ] Reset tokens expire after use and after the time limit

---

## Plugin Lifecycle

- [ ] Plugin activates cleanly on a fresh WordPress install
- [ ] Plugin deactivates cleanly (no fatal on deactivation hook)
- [ ] Plugin uninstalls cleanly (data removed if opted in)
- [ ] No fatal errors with `WP_DEBUG=true` enabled

---

## Third-Party Integrations

- [ ] All API integrations return correct responses on happy path
- [ ] API errors are handled gracefully with user-facing messages
- [ ] Third-party embeds (forms, maps, widgets) render correctly
- [ ] Webhooks fire at the correct events (if applicable)

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Pass / ☐ Fail |
