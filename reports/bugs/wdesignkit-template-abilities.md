# WDesignKit Template MCP Abilities — QA Bug Report

**Date:** 2026-05-19
**Card:** https://app.clickup.com/t/86d2xhkn7
**Tester:** QA Automation (MCP)
**Scope:** 14 Template ability modules

---

## QA Summary

| Result | Count |
|--------|-------|
| ✅ Pass | 8 |
| ❌ Fail | 9 |
| Total Tested | 14 modules |

**Session verdict: QA FAILED** — 3 P1 bugs open (list-templates broken, ai-import 404, update-template silent fail)

---

## Passes

| Module | Result | Notes |
|--------|--------|-------|
| Login / auth | ✅ Pass | Valid session, token expires 2026-08-16 |
| Import Template (dummy data) | ✅ Pass | Content loads, structure valid |
| Save Template | ✅ Pass | Saves, returns ID 22332 |
| Remove Template (confirm) | ✅ Pass | Deletes, clean response |
| Remove Template (dry_run) | ✅ Pass | Preview correct |
| Replace Template (dry_run) | ✅ Pass | Payload preview correct |
| Negative: import invalid ID | ✅ Pass | Clean "Invalid Template" error |
| Deletion verification | ✅ Pass | Deleted template returns "Invalid Template" |

---

## Bugs

---

### List templates broken — all filter combinations fail

**Severity:** P1
**Area:** Functionality

**Issue:** `list-templates` returns `"Kit Not Found"` / `"Kit Id Not Found"` for every parameter combination — no filters, builder filter, type filter, search filter. Users cannot browse their saved templates.

**Steps to Reproduce:**
1. Log in to WDesignKit
2. Call `wdesignkit-list-templates` with no parameters
3. Call again with `builder: "elementor"`
4. Call again with `type: "page"`
5. Call again with `search: "QA Test"` (after saving a template)

**Expected Result:** Returns paginated list of saved templates

**Actual Result:** `{"success":false,"message":"Kit Not Found","response":{"data":"error","message":"Kit Not Found","description":"Kit Id Not Found","success":false}}`

---

### AI import template endpoint returns HTTP 404

**Severity:** P1
**Area:** Functionality

**Issue:** `ai-import-template` hits a dead endpoint — server returns HTTP 404 Laravel "Not Found" HTML page. The AI import feature is completely non-functional.

**Steps to Reproduce:**
1. Log in to WDesignKit
2. Call `wdesignkit-ai-import-template` with valid `template_id: 17427`, `builder: elementor`, site_title, site_description
3. Observe response

**Expected Result:** AI-rewritten template content returned

**Actual Result:** `{"success":false,"message":"WDesignKit AI endpoint returned status 404","response":{"raw":"<!DOCTYPE html>...404 Not Found..."}}`

---

### Update template silently fails for saved template

**Severity:** P1
**Area:** Functionality

**Issue:** `update-template` returns "no confirmation" and fails silently for a template that was just successfully saved. The update endpoint does not recognise the template ID returned by save-template.

**Steps to Reproduce:**
1. Call `wdesignkit-save-template` with valid data — receives ID 22332
2. Immediately call `wdesignkit-update-template` with `id: 22332` and new data
3. Observe response

**Expected Result:** Template updated, confirmation returned

**Actual Result:** `{"success":false,"message":"Cloud returned no confirmation for update. The template ID may not exist or the account has no permission to update it."}`

---

### Browse presets returns empty data for all filter combinations

**Severity:** P1
**Area:** Functionality

**Issue:** `browse-presets` always returns `data:[]` with `totaltemplates:0` regardless of filters. Kit metadata loads correctly (ID, title, description) but no preset templates are returned. Affects all builders (Elementor + Gutenberg), free/pro filters, and search keywords.

**Steps to Reproduce:**
1. Call `browse-presets` with `preset_id: 17409`, `builder: elementor`
2. Call with `free_pro: "free"`
3. Call with `free_pro: "pro"`
4. Call with `search: "accordion"`
5. Call with `preset_id: 11646`, `builder: gutenberg`

**Expected Result:** List of preset templates returned in `data` array

**Actual Result:** `"data":[],"totaltemplates":0` across all calls. Kit data loads but template list is empty.

---

### Remove already-deleted template returns success

**Severity:** P1
**Area:** Logic

**Issue:** Calling `remove-template` on an already-deleted template ID returns `"Template Deleted"` success instead of an error. No idempotency check — users cannot distinguish between real deletion and ghost deletion.

**Steps to Reproduce:**
1. Save template → get ID 22332
2. Remove template 22332 with `confirm: true` → success
3. Call remove-template again with same ID 22332 and `confirm: true`

**Expected Result:** Error — "Template Not Found" or similar

**Actual Result:** `{"success":true,"message":"Template Deleted","description":"The template has been permanently deleted."}` — false success

---

### Find template requires type field — schema mismatch

**Severity:** P2
**Area:** Functionality / Logic

**Issue:** `find-template` returns `"Type : Not Found"` / `"Type Field is Empty"` when `type` parameter is not provided, even though the schema marks it as optional. Server-side the field is mandatory — schema and API are out of sync.

**Steps to Reproduce:**
1. Call `wdesignkit-find-template` with `search: "home"` only (no type)
2. Observe response

**Expected Result:** Returns search results or empty — no error about missing type

**Actual Result:** `{"success":false,"message":"Type : Not Found","response":{"data":"error","description":"Type Field is Empty"}}`

---

### Download preset free/pro metadata mismatch

**Severity:** P2
**Area:** Logic / Data Integrity

**Issue:** Template ID 17427 is listed as `free_pro: "free"` in `browse-presets` response, but `download-preset` with `free_pro: "free"` rejects it as "This is a pro template." Metadata inconsistency between listing and download endpoints.

**Steps to Reproduce:**
1. Call `browse-presets` with `preset_id: 17409`, `builder: elementor` — note template ID 17427 in temp_value, kit shows `free_pro: "free"`
2. Call `download-preset` with `id: 17427`, `builder: elementor`, `free_pro: "free"`

**Expected Result:** Preset downloads or correctly shows as pro in listing

**Actual Result:** Download rejects: `"This is a pro template. You do not have permission."`

---

### Import template dummy data returns empty image arrays

**Severity:** P2
**Area:** Functionality

**Issue:** `import-template` with `with_dummy_data: true` returns `site_images: []` and `image_urls: []`. Dummy image data is missing from the import response even when the template visually contains images.

**Steps to Reproduce:**
1. Call `wdesignkit-import-template` with `template_id: 17427`, `editor: elementor`, `with_dummy_data: true`
2. Check `site_images` and `image_urls` in response

**Expected Result:** Dummy image URLs returned in `site_images` / `image_urls`

**Actual Result:** `"site_images":[],"image_urls":[]`

---

### AI import invalid ID shows misleading first error

**Severity:** P3
**Area:** Logic / UX

**Issue:** When calling `ai-import-template` with an invalid/non-existing template_id, the first error message says "Could not extract text content from template. Provide text_array manually" — implying the caller's data is wrong, before finally showing the real cause "Template Not Found".

**Steps to Reproduce:**
1. Call `wdesignkit-ai-import-template` with `template_id: 99999999`
2. Read the error message sequence

**Expected Result:** Single clear error — "Template Not Found" or "Invalid Template"

**Actual Result:** Two-stage confusing error — "extract text failed" first, then "Invalid Template" — misleads user into providing text_array instead of fixing the ID

---

## ClickUp Status

**Note:** ClickUp API token expired (OAUTH_025) — card updates blocked.
Token needs refresh in MCP config before card statuses can be updated.

### Pending card updates (apply manually or after token fix):

| Bug | Severity | Card Action |
|-----|----------|-------------|
| list-templates broken | P1 | Create subtask — QA Failed |
| ai-import-template 404 | P1 | Create subtask — QA Failed |
| update-template silent fail | P1 | Create subtask — QA Failed |
| browse-presets empty data | P1 | Create subtask — QA Failed |
| remove-template no idempotency | P1 | Create subtask — QA Failed |
| find-template schema mismatch | P2 | Create subtask — QA Failed |
| download-preset free/pro mismatch | P2 | Create subtask — QA Failed |
| import dummy data missing images | P2 | Create subtask — QA Failed |
| ai-import misleading error | P3 | Create subtask — QA Failed |
