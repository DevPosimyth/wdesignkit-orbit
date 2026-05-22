# WDesignKit MCP Abilities — Broken Report

**Date:** 2026-05-18
**Tested on:** tester0107@yopmail.com · Plugin v2.3.0 · WP 6.9.4
**Total broken:** 17 abilities

---

### list-templates returns Kit Not Found

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/list-templates` always returns `"Kit Id Not Found"` regardless of filters (search, builder, type, pagination). The API cannot resolve a Kit ID for the logged-in account even though `save-template` successfully saves templates to the cloud. The save and list endpoints are not sharing the same kit reference.

**Steps to Reproduce:**
1. Login to WDesignKit cloud
2. Save a template using `wdesignkit/save-template`
3. Call `wdesignkit/list-templates` with any filter combination

**Expected Result:** Returns paginated list of saved cloud templates
**Actual Result:** `{"success":false,"message":"Kit Not Found","description":"Kit Id Not Found"}`

---

### find-template always returns empty response

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/find-template` returns `{"success":true,"raw":""}` for every search keyword and type combination. The `type` parameter is required by the API but is not marked as required in the schema. Even when `type` is provided, results are always empty despite matching templates existing in the cloud.

**Steps to Reproduce:**
1. Save a template named "QA Test Hero Heading" via `save-template`
2. Call `find-template` with `search: "hero"`, `type: "section"`, `builder: "gutenberg"`

**Expected Result:** Returns matching template with ID and metadata
**Actual Result:** `{"success":true,"raw":""}` — empty, no results

---

### browse-snippets search always returns zero results

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/browse-snippets` accepts the `search` parameter without error but always returns `snippetcount: 0, snippet: []` for any keyword. Browsing without `search` works correctly and returns results. The search filter is silently ignored on the API side.

**Steps to Reproduce:**
1. Call `browse-snippets` without `search` → returns results correctly
2. Call `browse-snippets` with `search: "button"` → returns 0 results

**Expected Result:** Returns snippets matching the keyword
**Actual Result:** `{"snippetcount":0,"showsnippets":0,"snippet":[]}`

---

### download-widget fails with u_id and without u_id

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/download-widget` fails in both call modes. With `u_id` from `browse-widgets` response (`user_id: 1`) → `"Widget Not Found"`. Without `u_id` → `"User id not found"`. The `u_id` field from `browse-widgets` does not map to what `download-widget` expects. The two abilities are not interoperable.

**Steps to Reproduce:**
1. Call `browse-widgets` — note `user_id: 1` and `w_unique` from any widget
2. Call `download-widget` with `w_uniq: "<w_unique>"`, `u_id: "1"` → Widget Not Found
3. Call `download-widget` with `w_uniq: "<w_unique>"` only → User id not found

**Expected Result:** Widget downloaded and installed locally
**Actual Result:** API error in both cases

---

### ai-import-template throws MCP output schema mismatch

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/ai-import-template` returns an API response that does not match the declared MCP output schema. The API returns a non-object/array at `data/response` causing the MCP layer to throw: `"Structured content does not match the tool's output schema: data/response must be object,array"`. Without explicit `text_array`, the API also fails to extract text content from the template.

**Steps to Reproduce:**
1. Call `ai-import-template` with a valid `template_id` and site profile params

**Expected Result:** Returns AI-rewritten template content
**Actual Result:** MCP schema validation error — ability unusable

---

### browse-template-images returns folder path not found

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/browse-template-images` fails because it depends on folder IDs sourced from `list-templates`, which is itself broken (Kit Not Found). All tested `folder_id` values return `"folder path not found"`. The ability is blocked by the upstream `list-templates` bug.

**Steps to Reproduce:**
1. Attempt to call `browse-template-images` with any `folder_id`

**Expected Result:** Returns template image URLs for the folder
**Actual Result:** `"folder path not found"` for all folder IDs

---

### update-template returns success but does not persist changes

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/update-template` returns `success: true, raw: ""` but the changes are not saved. Re-importing the same template after an update always returns the original saved content, not the updated content. The update call appears to hit a wrong or no-op endpoint on the server.

**Steps to Reproduce:**
1. Save a template, note the ID
2. Call `update-template` with new content
3. Call `import-template` with the same ID

**Expected Result:** Imported content reflects the updated version
**Actual Result:** Original content is returned — update had no effect

---

### replace-template returns success but does not replace content

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/replace-template` returns `success: true` but content is not replaced. The `dry_run` response reveals `"remove": "yes"` in the payload, suggesting the endpoint may be routing to a delete operation instead of a replace operation. Re-importing always returns the original content.

**Steps to Reproduce:**
1. Save a template, note the ID
2. Call `replace-template` with new content for the same ID
3. Call `import-template` with the same ID

**Expected Result:** Imported content reflects the replaced version
**Actual Result:** Original content returned — replace had no effect

---

### get-snippet-kit returns empty for valid kit IDs

**Severity:** P2
**Area:** Functionality

**Issue:** `wdesignkit/get-snippet-kit` returns `snippetcount: 0, snippet: []` for kit IDs that contain valid snippet references. Kit ID 223 has `snippet_ids: "118"` in `get-my-snippets`, but `get-snippet-kit` returns no snippets for it.

**Steps to Reproduce:**
1. Call `get-my-snippets` — note a kit with `snippet_ids` populated (e.g. ID 223)
2. Call `get-snippet-kit` with `kit_id: "223"`

**Expected Result:** Returns the snippets inside the kit
**Actual Result:** `{"snippetcount":0,"showsnippets":0,"snippet":[]}`

---

### get-snippet-info cannot resolve post_id returned by download-snippet

**Severity:** P2
**Area:** Functionality

**Issue:** `wdesignkit/download-snippet` installs a snippet as "file-based" and returns a `post_id`. When that `post_id` is passed to `get-snippet-info`, it returns `"No snippet found with post ID 14."` The post_id from `download-snippet` is not a valid WordPress post ID and cannot be used by `get-snippet-info`.

**Steps to Reproduce:**
1. Call `download-snippet` with a valid free snippet ID — note returned `post_id` (e.g. 14)
2. Call `get-snippet-info` with `post_id: 14`

**Expected Result:** Returns snippet title and description
**Actual Result:** `"No snippet found with post ID 14."`

---

### update-snippet-details cannot resolve post_id from downloaded snippet

**Severity:** P2
**Area:** Functionality

**Issue:** Same root cause as `get-snippet-info`. `wdesignkit/update-snippet-details` also fails with `"No post found with ID 14."` when given the `post_id` returned by `download-snippet`. File-based snippet installs do not create a standard WordPress post, making local snippet update operations broken for downloaded snippets.

**Steps to Reproduce:**
1. Call `download-snippet` — note returned `post_id`
2. Call `update-snippet-details` with that `post_id`

**Expected Result:** Updates the snippet title/description locally
**Actual Result:** `"No post found with ID 14."`

---

### download-snippet installs wrong snippet content

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/download-snippet` returns correct metadata for the requested snippet ID (e.g. ID 8 = "Disable Automatic Updates") but the installed file content belongs to a completely different snippet ("Disable Gutenberg Block Editor"). The response `name` field and the `content` JSON do not match the requested snippet. Data integrity is broken.

**Steps to Reproduce:**
1. Call `browse-snippets` — note snippet ID 8 title: "Disable Automatic Updates"
2. Call `download-snippet` with `snippet_id: "8"`, `w_unique: "g8r08325"`

**Expected Result:** Installs "Disable Automatic Updates" snippet
**Actual Result:** Installs "Disable Gutenberg Block Editor" — wrong snippet

---

### push-widget throws MCP output schema mismatch

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/push-widget` fails with MCP schema validation error: `"output[response] is not of type object,array"`. The API response format does not match the declared output schema. Same pattern as `ai-import-template` — the response `data/response` field is returning a scalar instead of object/array.

**Steps to Reproduce:**
1. Create a widget via `create-widget`
2. Call `push-widget` with `type: "new"` for that widget

**Expected Result:** Widget uploaded to cloud marketplace, returns cloud `r_id`
**Actual Result:** MCP schema error — ability unusable

---

### create-workspace returns wid: null

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/create-workspace` returns `success: true` and `"Workspace Updated"` (not "Workspace Created") with `wid: null`. No workspace ID is returned. The response message "Workspace Updated" instead of "Workspace Created" suggests the API may be routing to an update endpoint. Without a `wid`, all downstream workspace operations are blocked.

**Steps to Reproduce:**
1. Call `create-workspace` with `title: "QA Test Workspace"`, `builder: "elementor"`

**Expected Result:** Returns new workspace with a valid numeric `wid`
**Actual Result:** `{"wid":null,"message":"Workspace Updated"}` — no usable ID

---

### update-workspace cannot be tested — depends on create-workspace wid

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/update-workspace` requires a `wid` (workspace ID). Since `create-workspace` returns `wid: null`, there is no valid workspace ID available to test `update-workspace`. Ability is blocked by the upstream `create-workspace` bug.

**Steps to Reproduce:**
1. Call `create-workspace` → receives `wid: null`
2. Cannot proceed — `update-workspace` requires a numeric `wid`

**Expected Result:** Updates workspace title/builder
**Actual Result:** Unable to call — no valid wid available

---

### delete-workspace cannot be tested — depends on create-workspace wid

**Severity:** P1
**Area:** Functionality

**Issue:** Same as `update-workspace`. `wdesignkit/delete-workspace` requires a `wid`. Since `create-workspace` returns `wid: null`, deletion cannot be tested. Blocked by upstream bug.

**Steps to Reproduce:**
1. Call `create-workspace` → receives `wid: null`
2. Cannot proceed — `delete-workspace` requires a numeric `wid`

**Expected Result:** Deletes the specified workspace
**Actual Result:** Unable to call — no valid wid available

---

### manage-workspace-snippet / template / widget — all blocked by null wid

**Severity:** P1
**Area:** Functionality

**Issue:** `wdesignkit/manage-workspace-snippet`, `wdesignkit/manage-workspace-template`, and `wdesignkit/manage-workspace-widget` all require a `wid` parameter. Since `create-workspace` returns `wid: null`, none of these workspace content management operations can be tested or used. All three are blocked by the same upstream `create-workspace` bug.

**Steps to Reproduce:**
1. Call `create-workspace` → receives `wid: null`
2. Call any manage-workspace-* ability with the returned wid

**Expected Result:** Adds/removes/copies content within the workspace
**Actual Result:** Unable to call — no valid wid from create-workspace

---

## Summary

| Ability | Root Cause |
|---|---|
| `list-templates` | Kit ID not resolved server-side |
| `find-template` | API search returns empty; type param not enforced in schema |
| `browse-snippets` (search) | Search filter silently ignored by API |
| `download-widget` | u_id field mismatch between browse-widgets and download-widget |
| `ai-import-template` | API response doesn't match MCP output schema |
| `browse-template-images` | Cascading failure from list-templates |
| `update-template` | No-op — changes not persisted server-side |
| `replace-template` | Routing to wrong endpoint (delete instead of replace) |
| `get-snippet-kit` | API returns empty for kits with valid snippet_ids |
| `get-snippet-info` | File-based snippet post_id not a real WP post |
| `update-snippet-details` | Same as get-snippet-info root cause |
| `download-snippet` | Wrong snippet content installed vs requested ID |
| `push-widget` | API response doesn't match MCP output schema |
| `create-workspace` | Returns wid: null — workspace ID not returned |
| `update-workspace` | Blocked by create-workspace null wid |
| `delete-workspace` | Blocked by create-workspace null wid |
| `manage-workspace-*` (3) | Blocked by create-workspace null wid |
