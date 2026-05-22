<div align="center">

<div style="background:linear-gradient(135deg,#5202FD 0%,#3600AF 45%,#040483 100%);padding:48px 56px 56px;border-radius:14px;text-align:left">
<div style="margin-bottom:56px">
  <span style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:#fff;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase">WIDGET BUILDER</span>
  &nbsp;<span style="color:rgba(255,255,255,.3)">·</span>&nbsp;
  <span style="background:rgba(4,4,131,.5);border:1px solid rgba(255,255,255,.2);color:#fff;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase">WDesignKit Orbit</span>
</div>
<h1 style="color:#ffffff;font-size:34px;font-weight:800;letter-spacing:-.5px;margin:0 0 12px;line-height:1.2">Widget Builder — Full QA Report</h1>
<p style="color:rgba(196,180,255,.9);font-size:15px;margin:0 0 36px;font-weight:400;line-height:1.6">Uploads Page → Create Widget Popup → Real Widget Builder (/widget-builder/[id])</p>
<div style="border-top:1px solid rgba(255,255,255,.2);padding-top:24px;margin-top:8px">
<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">PLATFORM</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">wdesignkit.com</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">DATE</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">2026-05-21</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">AUDITOR</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">Dev Panchal</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">BROWSER</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">Firefox 1440×900</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">STATUS</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">All Open</div>
  </div>
</div>
</div>
</div>

<br>

<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:24px 0">
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px 32px;text-align:center;min-width:100px">
    <div style="font-size:28px;font-weight:800;color:#dc2626">9</div>
    <div style="font-size:12px;font-weight:600;color:#dc2626;letter-spacing:.5px;text-transform:uppercase;margin-top:4px">P1 — High</div>
  </div>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px 32px;text-align:center;min-width:100px">
    <div style="font-size:28px;font-weight:800;color:#d97706">14</div>
    <div style="font-size:12px;font-weight:600;color:#d97706;letter-spacing:.5px;text-transform:uppercase;margin-top:4px">P2 — Medium</div>
  </div>
  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px 32px;text-align:center;min-width:100px">
    <div style="font-size:28px;font-weight:800;color:#0369a1">6</div>
    <div style="font-size:12px;font-weight:600;color:#0369a1;letter-spacing:.5px;text-transform:uppercase;margin-top:4px">P3 — Low</div>
  </div>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 32px;text-align:center;min-width:100px">
    <div style="font-size:28px;font-weight:800;color:#1e293b">29</div>
    <div style="font-size:12px;font-weight:600;color:#64748b;letter-spacing:.5px;text-transform:uppercase;margin-top:4px">Total Bugs</div>
  </div>
</div>

</div>

---

## Scope

| Field | Detail |
|-------|--------|
| **URLs Tested** | `/admin/widgets/uploaded` · `/admin/widgets/widget-builder/12422` · `/admin/widgets/widget-builder/12421` · `/admin/widgets/widget-builder/12415` |
| **Method** | Live headed browser (Firefox) + Playwright automated assertions + DOM inspection |
| **Widget IDs** | 12422 (Core Gutenberg) · 12421 (Bricks) · 12415 (Push Elementor) |
| **Flow Tested** | Uploads page → Create Widget popup → Real widget builder |

---

## Screen 1 — Uploads Page (`/admin/widgets/uploaded`)

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>All widget thumbnail images are broken</strong>
</div>

🔍 **Issue:** All widget thumbnail images on the Uploads page fail to load and display a broken placeholder icon instead of the actual widget preview image.

<br>

📋 **Steps to Reproduce:**
1. Log in to wdesignkit.com
2. Navigate to `/admin/widgets/uploaded`
3. Observe the widget cards

<br>

❌ **Current Output:** All thumbnail image slots show a broken image placeholder. No widget preview images are visible.

<br>

✅ **Expected Output:** Each widget card should display its preview thumbnail image correctly.

<br>

🛠️ **Solution:**
- Verify thumbnail image URLs are valid and accessible
- Check if the CDN/image storage bucket is correctly configured and images are uploaded
- Add a proper fallback image state when thumbnails fail to load

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>Search input does not filter widget results</strong>
</div>

🔍 **Issue:** The search input on the Uploads page accepts text but does not filter the widget cards. All widgets remain visible regardless of what is typed.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/uploaded`
2. Type any string in the search input (e.g., "Core")
3. Observe the widget cards list

<br>

❌ **Current Output:** All 12+ widget cards remain visible. Search input is decorative — no filtering occurs.

<br>

✅ **Expected Output:** Widget cards should filter in real time to show only those matching the search term. Non-matching cards should be hidden.

<br>

🛠️ **Solution:**
- Wire the search input's `onChange` event to a filter function that matches widget names/descriptions
- Apply debouncing (300ms) to prevent excessive re-renders
- Show a "No results found" empty state when no widgets match

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>Create Widget trigger is a non-semantic SPAN element</strong>
</div>

🔍 **Issue:** The "Create Widget" call-to-action in the header is a `<span class="wdkit-black-btn">` element, not a `<button>`. It is invisible to keyboard navigation and screen readers as an interactive control.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/uploaded`
2. Inspect the "Create Widget" element in DevTools
3. Attempt to reach it via Tab key

<br>

❌ **Current Output:** Element tag is `<span>`, no `role="button"`, no `tabindex`. Tab key skips it entirely.

<br>

✅ **Expected Output:** Must be a `<button>` element or have `role="button"` + `tabindex="0"` + keyboard event handlers for Enter/Space.

<br>

🛠️ **Solution:**
- Replace `<span class="wdkit-black-btn">` with `<button class="wdkit-black-btn">` throughout the codebase
- Ensure Enter and Space keys trigger the same click handler

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>`/admin/widgets/create` URL shows not-found content</strong>
</div>

🔍 **Issue:** Navigating directly to `/admin/widgets/create` renders a "not found" page instead of a widget creation form, despite the Create Widget flow existing.

<br>

📋 **Steps to Reproduce:**
1. Navigate directly to `https://wdesignkit.com/admin/widgets/create`

<br>

❌ **Current Output:** Page renders "not found" / 404-like content. No creation form is shown.

<br>

✅ **Expected Output:** The URL should either show the widget creation form or redirect to `/admin/widgets/uploaded` where the popup can be triggered.

<br>

🛠️ **Solution:**
- Add a proper Next.js route handler for `/admin/widgets/create`
- Or implement a redirect from this URL to the uploads page with a `?create=true` query param that auto-opens the popup

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Page Builders filter does not reflect active/inactive state</strong>
</div>

🔍 **Issue:** The Page Builders filter buttons (Elementor, Gutenberg, Bricks, etc.) on the Uploads page have no visual distinction between selected and unselected states. Users cannot tell which filter is active.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/uploaded`
2. Click any Page Builder filter button
3. Observe button appearance before and after click

<br>

❌ **Current Output:** No visual change to the button when selected. Active state is indistinguishable from inactive.

<br>

✅ **Expected Output:** The selected filter should have a clear active state (e.g., filled background, highlighted border, or checkmark).

<br>

🛠️ **Solution:**
- Add an `active` CSS class to the selected filter button
- Apply distinct background/border styles for the active state
- Ensure `aria-pressed="true"` is set on the active button for screen readers

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Widget action buttons have no accessible labels</strong>
</div>

🔍 **Issue:** The action buttons on each widget card (edit, delete, duplicate, etc.) are icon-only with no `aria-label`. Screen readers announce them as unlabeled buttons.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/uploaded`
2. Inspect any widget card action button in DevTools
3. Run an axe accessibility scan

<br>

❌ **Current Output:** Buttons have no `aria-label`, `title`, or visible text. Screen readers read "button" with no context.

<br>

✅ **Expected Output:** Each action button should have `aria-label="Edit widget"`, `aria-label="Delete widget"`, etc.

<br>

🛠️ **Solution:**
- Add descriptive `aria-label` attributes to all icon-only action buttons
- Alternatively, add visually hidden `<span class="sr-only">` text inside each button

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>No H1 heading on Uploads page</strong>
</div>

🔍 **Issue:** The Uploads page has zero `<h1>` elements. The page title in the document `<title>` tag is the generic site-wide title, not page-specific.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/uploaded`
2. Run `document.querySelectorAll('h1')` in DevTools console

<br>

❌ **Current Output:** Returns an empty NodeList. No H1 on the page.

<br>

✅ **Expected Output:** Page should have one `<h1>` (e.g., "My Widgets") for SEO and accessibility heading structure.

<br>

🛠️ **Solution:**
- Add a semantic `<h1>` to the page header
- Update `<title>` to "My Widgets | WDesignKit" for this specific page

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Generic page title used across all admin pages</strong>
</div>

🔍 **Issue:** Every admin page shares the same `<title>`: "WDesignKit: All-in-One Tool for WordPress Agencies and Designers". Page-specific context is missing.

<br>

📋 **Steps to Reproduce:**
1. Visit any admin page (Uploads, Builder, Dashboard)
2. Check the browser tab title

<br>

❌ **Current Output:** Same generic title on every page. Browser history and tab management is unusable when multiple admin pages are open.

<br>

✅ **Expected Output:** Each page should have a unique, descriptive title. E.g., "Widget Builder — Core widget | WDesignKit", "My Widgets | WDesignKit".

<br>

🛠️ **Solution:**
- Use Next.js `<Head>` component or `metadata` export to set unique page titles per route
- Pattern: `[Page Name] — [Context] | WDesignKit`

---

<div style="border-left:4px solid #0369a1;background:#f0f9ff;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#0369a1;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P3</span>&nbsp;<strong>CORS error blocks WDesignKit logo SVG on admin pages</strong>
</div>

🔍 **Issue:** The WDesignKit logo SVG (served from `api.wdesignkit.com`) fails to load on all admin pages due to a missing `Access-Control-Allow-Origin` header. A CORS error is logged to the console.

<br>

📋 **Steps to Reproduce:**
1. Open any admin page
2. Open DevTools → Console
3. Observe CORS error for the logo SVG

<br>

❌ **Current Output:** Console: `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at api.wdesignkit.com/...`

<br>

✅ **Expected Output:** No CORS errors. Logo loads without console errors.

<br>

🛠️ **Solution:**
- Add `Access-Control-Allow-Origin: https://wdesignkit.com` to the API server's response headers for static assets
- Or serve the logo from the same origin as the frontend

---

<div style="border-left:4px solid #0369a1;background:#f0f9ff;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#0369a1;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P3</span>&nbsp;<strong>Logout button is a non-semantic SPAN element</strong>
</div>

🔍 **Issue:** The logout control in the sidebar is a `<span>` element, not a `<button>`. It is keyboard inaccessible.

<br>

📋 **Steps to Reproduce:**
1. Log in and navigate to any admin page
2. Inspect the logout element in DevTools

<br>

❌ **Current Output:** `<span>` tag with no `role`, no `tabindex`. Keyboard users cannot trigger logout.

<br>

✅ **Expected Output:** Logout must be a `<button>` or have `role="button"` + `tabindex="0"`.

<br>

🛠️ **Solution:**
- Change logout element to `<button>` with appropriate CSS to match existing styling

---

<div style="border-left:4px solid #0369a1;background:#f0f9ff;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#0369a1;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P3</span>&nbsp;<strong>Chatbase chat widget loads on all admin pages</strong>
</div>

🔍 **Issue:** A Chatbase chat bubble widget loads on every admin page, adding unnecessary weight and a distracting UI element to the authenticated admin interface.

<br>

📋 **Steps to Reproduce:**
1. Log in and navigate to any admin page
2. Observe the chat bubble in the bottom-right corner

<br>

❌ **Current Output:** Chat bubble visible on every admin page.

<br>

✅ **Expected Output:** Chat widget should only load on public-facing pages (marketing site), not inside the authenticated admin panel.

<br>

🛠️ **Solution:**
- Conditionally load the Chatbase script only on non-admin routes
- Check `window.location.pathname.startsWith('/admin')` before initializing

---

## Screen 2 — Create Widget Popup

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>Popup submit button is a non-semantic SPAN element</strong>
</div>

🔍 **Issue:** The "Create Widget" submit button inside the Create Widget popup is a `<span class="wdkit-black-btn">` element, not a `<button>`. Form cannot be submitted via Enter key. Keyboard users are fully blocked from creating widgets.

<br>

📋 **Steps to Reproduce:**
1. Click "Create Widget" on the Uploads page to open the popup
2. Fill in the widget name and select a page builder
3. Attempt to submit by pressing Enter or Tab to the submit button

<br>

❌ **Current Output:** Enter key does not submit the form. Tab does not reach the submit SPAN. The only way to submit is to click with a mouse.

<br>

✅ **Expected Output:** Submit must be a `<button type="submit">` or equivalent. Enter key inside any form field should trigger submission.

<br>

🛠️ **Solution:**
- Replace `<span class="wdkit-black-btn">` with `<button type="submit" class="wdkit-black-btn">` in the popup component
- Wrap popup form fields in a `<form>` element with an `onSubmit` handler

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Popup uses `role="alertdialog"` instead of `role="dialog"`</strong>
</div>

🔍 **Issue:** The Create Widget popup container uses `role="alertdialog"`, which is semantically reserved for urgent interruptions requiring user acknowledgement (alerts, confirmations). A creation form is not an alert.

<br>

📋 **Steps to Reproduce:**
1. Open the Create Widget popup
2. Inspect `div.wdkit-popup-container` in DevTools

<br>

❌ **Current Output:** `<div role="alertdialog">` — screen readers announce it as an alert dialog, implying urgency.

<br>

✅ **Expected Output:** `<div role="dialog" aria-labelledby="popup-title" aria-modal="true">` — modal dialog for non-urgent content.

<br>

🛠️ **Solution:**
- Change `role="alertdialog"` to `role="dialog"` on the popup container
- Add `aria-labelledby` pointing to the popup heading
- Add `aria-modal="true"`

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Popup backdrop intercepts pointer events — Playwright click blocked</strong>
</div>

🔍 **Issue:** The `div.wdkit-popup-wrapper` backdrop element sits above all popup content in the stacking order, intercepting click events. This is a production bug: any click that misses an interactive element by a few pixels (or any programmatic click) is swallowed by the backdrop, appearing to close or freeze the popup.

<br>

📋 **Steps to Reproduce:**
1. Open the Create Widget popup
2. Click slightly outside an input field but still inside the popup content area

<br>

❌ **Current Output:** Backdrop intercepts the click. Depending on implementation, this may dismiss the popup or do nothing, blocking the intended target.

<br>

✅ **Expected Output:** Clicks within the popup dialog content area should reach their target elements. Only clicks on the backdrop itself (outside the dialog) should dismiss.

<br>

🛠️ **Solution:**
- Ensure popup dialog content sits above the backdrop in z-index stacking
- Set `pointer-events: none` on the backdrop element, or use `pointer-events: auto` only on the backdrop's dimmed region outside the dialog

---

## Screen 3 — Real Widget Builder (`/admin/widgets/widget-builder/[id]`)

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>Ace Editor workers served with wrong MIME type — syntax highlighting broken</strong>
</div>

🔍 **Issue:** Three Ace Editor web worker scripts are served by the server with `Content-Type: text/plain; charset=utf-8` instead of `application/javascript`. Browsers block web workers created from non-JS MIME types. This disables all language-aware features in the code editor: HTML/CSS/JavaScript syntax highlighting, bracket matching, real-time error detection, and code completion.

<br>

📋 **Steps to Reproduce:**
1. Log in and navigate to `/admin/widgets/widget-builder/12422`
2. Open DevTools → Network
3. Filter for `worker` and inspect the response headers of:
   - `worker-javascript.js`
   - `worker-html.js`
   - `worker-css.js`
4. Type any HTML into the code editor and observe the lack of syntax coloring

<br>

❌ **Current Output:**
- All three worker files: `Content-Type: text/plain; charset=utf-8`
- Console errors: `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/plain"`
- Code editor shows plain white text — no HTML tag coloring, no CSS property highlighting, no JS keyword colors

<br>

✅ **Expected Output:**
- Worker files served with `Content-Type: application/javascript`
- HTML editor highlights tags cyan, attributes yellow, values green (Ace Cobalt theme)
- CSS editor highlights properties, values, selectors with distinct colors
- JS editor highlights keywords, strings, functions with color

<br>

🛠️ **Solution:**
- Configure the server (Next.js or CDN) to serve `.js` files with `Content-Type: application/javascript`
- Check `next.config.js` headers config or the CDN's MIME type mapping
- Verify fix by confirming all three workers return `Content-Type: application/javascript`

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>Preview mode shows completely blank screen with no guidance</strong>
</div>

🔍 **Issue:** Clicking "Preview" in the widget builder collapses the entire three-panel layout (code editor, canvas, controls) to a blank white screen. No message explains why it is blank or what the user needs to do to see a preview.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/widget-builder/12422`
2. Click the "Preview" button in the top toolbar
3. Observe the main content area

<br>

❌ **Current Output:** Entire builder UI disappears. Screen is white and empty. Only the top toolbar remains visible.

<br>

✅ **Expected Output:** If the widget has no content: show a message such as "Add some HTML content and sections to see a preview here." If the widget has content: render the widget preview in an isolated iframe or preview pane.

<br>

🛠️ **Solution:**
- For empty widget state: render a centered empty state message in the preview area
- For widgets with content: render the compiled widget output in a sandboxed preview iframe
- Add a "Back to Code" affordance that is clearly visible in Preview mode (the current "Code" button exists but is easy to miss on a blank screen)

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>API endpoint called repeatedly on builder page load</strong>
</div>

🔍 **Issue:** Multiple API endpoints fire redundant requests on a single widget builder page load. `api/v2/widget/builder/get` is called twice, `api/auth/loginCheck` three times, `api/notification/view` three times, and `api/front/ai/widgets/meta` twice. Each duplicate call adds unnecessary server load and slows the initial builder render.

<br>

📋 **Steps to Reproduce:**
1. Open DevTools → Network → XHR/Fetch
2. Navigate to `/admin/widgets/widget-builder/12422`
3. Wait for the page to fully load
4. Filter network requests by `api.wdesignkit.com`

<br>

❌ **Current Output:**
- `api/v2/widget/builder/get` — fired **2×**
- `api/auth/loginCheck` — fired **3×**
- `api/notification/view` — fired **3×**
- `api/front/ai/widgets/meta` — fired **2×**

<br>

✅ **Expected Output:** Each API endpoint called exactly once per page load.

<br>

🛠️ **Solution:**
- Audit React component `useEffect` dependencies and component mount cycles that trigger these calls
- Use a shared context/store to cache `loginCheck` result across components
- Deduplicate notification polling initialization
- Use SWR or React Query deduplication to prevent simultaneous identical requests

---

<div style="border-left:4px solid #dc2626;background:#fef2f2;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P1</span>&nbsp;<strong>API URL contains typo — "dashbord" instead of "dashboard"</strong>
</div>

🔍 **Issue:** The API endpoint for fetching dashboard data is called as `/api/admin/dashbord/get` (missing the letter "a"). This call fires 2× on every admin page load. Any routing, logging, or future refactor based on the URL path will be impacted.

<br>

📋 **Steps to Reproduce:**
1. Open DevTools → Network
2. Navigate to any admin page
3. Search for `dashbord` in the network requests

<br>

❌ **Current Output:** Network request to `api.wdesignkit.com/api/admin/dashbord/get`

<br>

✅ **Expected Output:** Network request to `api.wdesignkit.com/api/admin/dashboard/get`

<br>

🛠️ **Solution:**
- Fix the typo in the API route definition on the server side: rename `/dashbord` to `/dashboard`
- Update all frontend fetch calls to use the corrected URL
- Add a redirect from the old URL to the new one during transition period

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Code editor tab buttons (CSS, JAVASCRIPT) are SPAN elements</strong>
</div>

🔍 **Issue:** The CSS and JAVASCRIPT code editor tabs are `<span class="wkit-wb-editor-btns-label">` elements. Keyboard users cannot switch between HTML/CSS/JS tabs. Only the HTML tab has a real `<button>` wrapper. The tabs are inconsistently implemented.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/widget-builder/12422`
2. Inspect the code editor tabs in DevTools
3. Try switching tabs using Tab key + Enter

<br>

❌ **Current Output:** CSS and JAVASCRIPT tabs are `<span>` elements. Tab key skips them. Keyboard users are locked to the HTML tab.

<br>

✅ **Expected Output:** All code editor tabs must be `<button>` elements (or `<li role="tab">` in a `<ul role="tablist">`) so keyboard users can navigate and activate them.

<br>

🛠️ **Solution:**
- Implement proper ARIA tab pattern: `role="tablist"` container, `role="tab"` for each tab, `role="tabpanel"` for each code editor panel
- Use `aria-selected="true/false"` to communicate active state
- Support arrow key navigation between tabs per ARIA authoring practices

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>"Add Section" is a SPAN element — keyboard inaccessible</strong>
</div>

🔍 **Issue:** The "Add Section +" button in the canvas area is `<span class="add-section-btn">`. Keyboard users cannot trigger it. This blocks any keyboard-only workflow for building widget layout.

<br>

📋 **Steps to Reproduce:**
1. Navigate to `/admin/widgets/widget-builder/12422`
2. Inspect the "Add Section +" element
3. Try reaching it via Tab key

<br>

❌ **Current Output:** Element is a `<span>` with no `role` or `tabindex`. Unreachable by keyboard.

<br>

✅ **Expected Output:** Must be a `<button>` element or have `role="button"` + `tabindex="0"`.

<br>

🛠️ **Solution:**
- Replace `<span class="add-section-btn">` with `<button class="add-section-btn">`
- Ensure button has a descriptive `aria-label="Add new section to widget layout"`

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Push button missing aria-label — accessible name is malformed</strong>
</div>

🔍 **Issue:** The Push button's accessible name is computed as "Push widget on Cloud and Sync itPush" — the tooltip text is concatenated with the button text, creating a mangled screen reader announcement.

<br>

📋 **Steps to Reproduce:**
1. Navigate to the widget builder
2. Run the following in the console: `document.querySelector('button:has-text("Push")')?.textContent`

<br>

❌ **Current Output:** Accessible name: `"Push widget on Cloud and Sync itPush"` — tooltip text bleeds into button text content.

<br>

✅ **Expected Output:** `aria-label="Push widget to cloud"` with clean button text "Push".

<br>

🛠️ **Solution:**
- Add `aria-label="Push widget to cloud"` to the Push button
- Move tooltip text to a `title` attribute or custom tooltip element, separated from the button's text content DOM

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Six icon-only SPAN elements in builder with no accessible labels</strong>
</div>

🔍 **Issue:** Six `<span>` elements acting as buttons in the widget builder have no text content and no `aria-label`: two `wdkit-editor-action-btn` spans (code editor settings/fullscreen) and four `wb-component-btn` spans (canvas section controls). Screen readers skip them entirely.

<br>

📋 **Steps to Reproduce:**
1. Navigate to the widget builder
2. Run: `[...document.querySelectorAll('span.wdkit-editor-action-btn, span.wb-component-btn')].map(el => ({ text: el.textContent.trim(), label: el.getAttribute('aria-label') }))`

<br>

❌ **Current Output:** All six elements return `{ text: "", label: null }` — completely unlabeled.

<br>

✅ **Expected Output:** Each element has an `aria-label` describing its function (e.g., "Editor settings", "Expand editor", "Collapse section", "Edit section", "Delete section").

<br>

🛠️ **Solution:**
- Add `aria-label` to each icon-only interactive element
- If elements are SPANs, also add `role="button"` and `tabindex="0"`

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>No H1 heading on widget builder page</strong>
</div>

🔍 **Issue:** The widget builder page has zero `<h1>` elements. This is consistent across all admin pages and represents a systematic SEO and accessibility failure.

<br>

📋 **Steps to Reproduce:**
1. Navigate to any widget builder page
2. Run `document.querySelectorAll('h1').length` in console

<br>

❌ **Current Output:** `0` — no H1 on the page.

<br>

✅ **Expected Output:** One `<h1>` visually or visually-hidden, e.g., `<h1 class="sr-only">Widget Builder — Core widget</h1>`.

<br>

🛠️ **Solution:**
- Add a visually-hidden `<h1>` containing the widget name to the builder page
- The widget name ("Core widget") displayed in the toolbar can serve as the H1 if its tag is changed

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Gist translation JSON file fetched twice per page load</strong>
</div>

🔍 **Issue:** The Gist translation JSON file (for UI string localization) is fetched 2× on every admin page load, doubling the network cost for this resource.

<br>

📋 **Steps to Reproduce:**
1. Open DevTools → Network
2. Navigate to any admin page
3. Filter by `gist.github` or the translation JSON filename
4. Count the requests

<br>

❌ **Current Output:** Two identical `GET` requests for the Gist JSON translation file.

<br>

✅ **Expected Output:** One request, result cached in memory for the session.

<br>

🛠️ **Solution:**
- Store the fetched translation data in a module-level variable or React context on first fetch
- Subsequent calls check the cache before making a new network request
- Set appropriate `Cache-Control` headers on the Gist CDN response

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Group Controls section exposes only one control type (Border)</strong>
</div>

🔍 **Issue:** The Group Controls accordion in the Controls panel, when expanded, shows only a single control type: "Border". A "Group Controls" section implies multiple grouped controls (padding, margin, typography, shadow, etc.) but only one is exposed.

<br>

📋 **Steps to Reproduce:**
1. Navigate to the widget builder
2. Click "Group Controls" in the right panel to expand it

<br>

❌ **Current Output:** Only "Border" control card is visible. The section appears incomplete.

<br>

✅ **Expected Output:** Group Controls should show all composite/grouped control types. If only Border is implemented, the section label should reflect that (e.g., "Border Controls").

<br>

🛠️ **Solution:**
- Add missing group control types (padding, margin, typography group, shadow) to the section
- Or rename the section to "Border Controls" if that is the intended scope
- Add a tooltip or description explaining what "Group Controls" are

---

<div style="border-left:4px solid #d97706;background:#fffbeb;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#d97706;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P2</span>&nbsp;<strong>Variable tab panel hidden with no user-facing affordance</strong>
</div>

🔍 **Issue:** The Variable tab shows a counter badge ("0") but clicking it reveals a `<div hidden="">` element — the panel content is hidden. There is no UI to add variables, no empty state message, and no guidance on how to use the Variable feature.

<br>

📋 **Steps to Reproduce:**
1. Navigate to the widget builder
2. Click the "Variable" tab/button in the code editor area
3. Inspect the resulting panel in DevTools

<br>

❌ **Current Output:** Panel DOM: `<div hidden="">`. No visible content. Feature appears non-functional or unimplemented.

<br>

✅ **Expected Output:** Variable panel should show either:
- An "Add Variable" button and empty state message when no variables are defined
- A list of defined variables when they exist

<br>

🛠️ **Solution:**
- Remove `hidden` attribute from the variable panel or conditionally render the correct state
- Add an empty state with a call-to-action: "No variables yet. Click to add your first variable."
- Add a "+ Add Variable" button that opens an inline form

---

<div style="border-left:4px solid #0369a1;background:#f0f9ff;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#0369a1;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P3</span>&nbsp;<strong>Outfit font woff2 file fails to load on builder page</strong>
</div>

🔍 **Issue:** The Outfit font woff2 file fails to download on the widget builder page. Typography falls back to system fonts, causing slight visual inconsistency compared to other pages where the font loads correctly.

<br>

📋 **Steps to Reproduce:**
1. Navigate to the widget builder
2. Open DevTools → Network → Font
3. Observe any failed font requests

<br>

❌ **Current Output:** `NS_BINDING_ABORTED` or network failure on Outfit font woff2 request. System font stack used instead.

<br>

✅ **Expected Output:** Outfit font loads successfully. Builder UI typography matches the rest of the admin interface.

<br>

🛠️ **Solution:**
- Check if the font URL is correct and accessible from the builder page's origin
- Ensure the font is preloaded with `<link rel="preload">` for builder routes
- Verify CDN or font service is not blocking the builder domain

---

<div style="border-left:4px solid #0369a1;background:#f0f9ff;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#0369a1;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P3</span>&nbsp;<strong>Profile image fails to load on builder page (NS_BINDING_ABORTED)</strong>
</div>

🔍 **Issue:** The user profile image in the admin navigation fails to load on the widget builder page with a `NS_BINDING_ABORTED` error, leaving the avatar area broken or showing a fallback.

<br>

📋 **Steps to Reproduce:**
1. Navigate to the widget builder
2. Open DevTools → Network → Img
3. Find the profile image request

<br>

❌ **Current Output:** Profile image request aborted — avatar shows placeholder/broken state.

<br>

✅ **Expected Output:** User avatar loads correctly on all admin pages including the builder.

<br>

🛠️ **Solution:**
- Ensure profile image URL is constructed correctly before the builder's auth context fully loads
- Add a fallback avatar (initials or generic icon) while the profile image loads or if it fails

---

<div style="border-left:4px solid #0369a1;background:#f0f9ff;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0">
<span style="background:#0369a1;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">P3</span>&nbsp;<strong>Code editor `+` tab buttons have no accessible label</strong>
</div>

🔍 **Issue:** Each code editor tab (HTML, CSS, JAVASCRIPT) has a "+" button beside it. These buttons have no `aria-label` or descriptive text. Their function (add custom tab? add file?) is unclear to all users, not just screen reader users.

<br>

📋 **Steps to Reproduce:**
1. Navigate to the widget builder
2. Observe the `+` buttons next to HTML, CSS, JAVASCRIPT tabs
3. Inspect them in DevTools — no `aria-label` present

<br>

❌ **Current Output:** `+` buttons with no label. Function is ambiguous.

<br>

✅ **Expected Output:** `aria-label="Add custom HTML file"` (or equivalent) + tooltip on hover explaining the action.

<br>

🛠️ **Solution:**
- Add `aria-label` describing what the `+` button does (e.g., "Add custom tab")
- Add a tooltip that appears on hover
- If the feature is not yet implemented, disable or hide the `+` buttons with a "Coming soon" tooltip

---

## What Works Correctly

| Feature | Status |
|---------|--------|
| Add Section creates "Section-1" row in canvas | ✅ Works |
| Section row shows collapse, edit, delete controls | ✅ Works |
| Code editor (Ace) accepts keyboard input | ✅ Works |
| Character count status bar updates on typing | ✅ Works |
| Controls search shows "No Result Found" empty state | ✅ Works |
| Controls search filters results on input | ✅ Works |
| Save button correctly disabled until edits are made | ✅ Works |
| Save button enables after typing in code editor | ✅ Works |
| Publish dropdown shows Draft / Publish options | ✅ Works |
| All 4 control sections present (Data / Group / Unit / UI) | ✅ Works |
| Build with AI button responds to click | ✅ Works |
| Code editor tab switching (HTML → CSS → JS) | ✅ Works |
| Section collapse/expand toggle | ✅ Works |

---

<div align="center">
<div style="background:#1e293b;border-radius:10px;padding:16px 24px;display:inline-flex;gap:24px;margin-top:24px;flex-wrap:wrap;justify-content:center">
  <span style="color:#94a3b8;font-size:12px;font-weight:600">TOTAL <span style="color:#f1f5f9;font-size:15px;font-weight:800">29</span></span>
  <span style="color:#94a3b8;font-size:12px">·</span>
  <span style="color:#fca5a5;font-size:12px;font-weight:600">P1 <span style="color:#f87171;font-size:15px;font-weight:800">9</span></span>
  <span style="color:#94a3b8;font-size:12px">·</span>
  <span style="color:#fcd34d;font-size:12px;font-weight:600">P2 <span style="color:#fbbf24;font-size:15px;font-weight:800">14</span></span>
  <span style="color:#94a3b8;font-size:12px">·</span>
  <span style="color:#7dd3fc;font-size:12px;font-weight:600">P3 <span style="color:#38bdf8;font-size:15px;font-weight:800">6</span></span>
</div>

<br>

<p style="color:#64748b;font-size:12px;margin-top:8px">Audited by Dev Panchal · WDesignKit Orbit QA · 2026-05-21</p>

</div>
