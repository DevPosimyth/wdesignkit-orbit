# Bug Report — Standard Format Reference

> **This is the mandatory format for ALL bug reports in this project.**
> Read this file before creating any new report. Follow every pattern exactly.

---

## 1 — Cover Page (Gradient Header)

Use the full gradient cover with **div-based metadata cards** (never `<table>/<td>` — renderers inject white backgrounds onto table cells, making white text invisible).

```html
<div align="center">

<div style="background:linear-gradient(135deg,#5202FD 0%,#3600AF 45%,#040483 100%);padding:48px 56px 56px;border-radius:14px;text-align:left">
<div style="margin-bottom:56px">
  <span style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:#fff;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase">PLUGIN NAME</span>
  &nbsp;<span style="color:rgba(255,255,255,.3)">·</span>&nbsp;
  <span style="background:rgba(4,4,131,.5);border:1px solid rgba(255,255,255,.2);color:#fff;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase">WDesignKit Orbit</span>
</div>
<h1 style="color:#ffffff;font-size:34px;font-weight:800;letter-spacing:-.5px;margin:0 0 12px;line-height:1.2">REPORT TITLE</h1>
<p style="color:rgba(196,180,255,.9);font-size:15px;margin:0 0 36px;font-weight:400;line-height:1.6">Plugin vX.X.X — short scope description</p>
<div style="border-top:1px solid rgba(255,255,255,.2);padding-top:24px;margin-top:8px">
<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">PLUGIN</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">Plugin Name vX.X.X</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">DATE</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">YYYY-MM-DD</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">AUDITOR</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">Dev Panchal</div>
  </div>
</div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">ROLE</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">QA Expert</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">TEAM</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">TEAM NAME</div>
  </div>
  <div style="background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 20px;min-width:120px">
    <div style="color:rgba(196,184,255,.8);font-size:9px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:7px">STATUS</div>
    <div style="color:#ffffff;font-size:13px;font-weight:700">All Open</div>
  </div>
</div>
</div>
</div>

<br>
```

---

## 2 — Stat Cards (Issue Count Summary)

Always placed immediately after the cover, before the Files Audited table.  
The stat card table uses explicit `background` colors on every `<td>` — never relies on inheritance.

```html
<table style="width:100%;border-collapse:separate;border-spacing:12px">
<tr>
<td align="center" style="background:#111827;border-radius:10px;padding:20px 16px;width:22%">
  <div style="font-size:34px;font-weight:800;color:#fff;line-height:1">XX</div>
  <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.55);letter-spacing:.5px;text-transform:uppercase;margin:6px 0 2px">Total Issues</div>
  <div style="font-size:10px;color:rgba(255,255,255,.3)">X files audited</div>
</td>
<td align="center" style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:10px;padding:20px 16px;width:22%">
  <div style="font-size:34px;font-weight:800;color:#dc2626;line-height:1">X</div>
  <div style="font-size:10px;font-weight:700;color:#991b1b;letter-spacing:.5px;text-transform:uppercase;margin:6px 0 2px">P1 · Critical</div>
  <div style="font-size:10px;color:#ef4444">Short impact note</div>
</td>
<td align="center" style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:10px;padding:20px 16px;width:22%">
  <div style="font-size:34px;font-weight:800;color:#d97706;line-height:1">X</div>
  <div style="font-size:10px;font-weight:700;color:#92400e;letter-spacing:.5px;text-transform:uppercase;margin:6px 0 2px">P2 · High</div>
  <div style="font-size:10px;color:#f59e0b">Short impact note</div>
</td>
<td align="center" style="background:#f0f9ff;border:1.5px solid #7dd3fc;border-radius:10px;padding:20px 16px;width:22%">
  <div style="font-size:34px;font-weight:800;color:#0284c7;line-height:1">X</div>
  <div style="font-size:10px;font-weight:700;color:#075985;letter-spacing:.5px;text-transform:uppercase;margin:6px 0 2px">P3 · Polish</div>
  <div style="font-size:10px;color:#38bdf8">Short impact note</div>
</td>
</tr>
</table>

</div>
```

---

## 3 — Files Audited Table

Standard markdown table. Always placed after stat cards, before the first bug section.

```markdown
---

## Files Audited

| File | Lines | P1 | P2 | P3 |
|:---|---:|:---:|:---:|:---:|
| `path/to/file.php` | 1,000 | **2** | **7** | **8** |
| `path/to/file2.php` | ~500 | — | **3** | **2** |
```

Use `—` (em dash) for zero counts. Bold the numbers.

---

## 4 — Severity Section Headers

One header per severity group (P1, P2, P3). Placed before the first bug card of each group.

```html
---

<div style="border-bottom:1.5px solid #e5e7eb;margin:40px 0 28px;padding-bottom:14px">
<span style="background:#dc2626;color:#fff;padding:4px 14px;border-radius:8px;font-size:13px;font-weight:800">P1</span>
&nbsp;&nbsp;<strong style="font-size:17px">Critical — [Section Title]</strong>
&nbsp;&nbsp;<span style="color:#9ca3af;font-size:11px">Short description of what these bugs affect · X issues</span>
</div>

---
```

**Pill colors per severity:**
- P1: `background:#dc2626`
- P2: `background:#d97706`
- P3: `background:#0284c7`

---

## 5 — Bug Card Format (one per bug)

Every bug follows this exact structure — 5 fields, in this order, with `<br>` spacers between each.

### Card Header

```html
<div style="border:1.5px solid [BORDER];border-radius:10px;margin-bottom:6px;overflow:hidden">
<div style="background:[BG];border-bottom:1px solid [BORDER];padding:13px 18px">
<span style="background:[PILL];color:#fff;padding:2px 9px;border-radius:4px;font-size:10px;font-weight:800;letter-spacing:1px">P1</span>
&nbsp;&nbsp;<strong>Bug Title in Sentence Case</strong><br>
<small style="color:#6b7280"><code>filename.php : line</code> &nbsp;·&nbsp; Area / Category</small>
</div>
</div>
```

**Color scheme per severity:**

| Severity | Border | Background | Pill |
|:---|:---|:---|:---|
| P1 | `#fca5a5` | `#fef2f2` | `#dc2626` |
| P2 | `#fcd34d` | `#fffbeb` | `#d97706` |
| P3 | `#7dd3fc` (header border: `#bae6fd`) | `#f0f9ff` | `#0284c7` |

### Card Body (5 fields)

```markdown
<br>

🔍 **Issue**
Clear, concise description of what is wrong. Written for both QA and developer audiences.
No jargon. One paragraph max.

<br>

📋 **Steps to Reproduce**
1. First step — always start from login or file open
2. Navigate to the specific location
3. Trigger the exact action that surfaces the bug
4. Observe the result

<br>

❌ **Current Output**
```code
exact current code / text / value
```

<br>

✅ **Expected Output**
```code
exact correct code / text / value
```

<br>

🛠️ **Solution**
- Specific actionable fix — one bullet per action
- Reference exact line numbers where possible
- Note any side effects or related changes needed
- Keep each bullet to one clear instruction

---
```

> The `---` separator after 🛠️ Solution is mandatory. It separates every bug from the next.

---

## 6 — Footer Summary Bar

Placed at the very end of the report, after the last bug.

```html
<div align="center">
<br>

<table style="border-collapse:separate;border-spacing:8px">
<tr>
<td style="background:#0f172a;border-radius:6px;padding:8px 20px">
  <span style="color:#fff;font-size:11px;font-weight:700;letter-spacing:.5px">TOTAL &nbsp; XX</span>
</td>
<td style="background:#991b1b;border-radius:6px;padding:8px 20px">
  <span style="color:#fff;font-size:11px;font-weight:700;letter-spacing:.5px">P1 &nbsp; X</span>
</td>
<td style="background:#92400e;border-radius:6px;padding:8px 20px">
  <span style="color:#fff;font-size:11px;font-weight:700;letter-spacing:.5px">P2 &nbsp; X</span>
</td>
<td style="background:#075985;border-radius:6px;padding:8px 20px">
  <span style="color:#fff;font-size:11px;font-weight:700;letter-spacing:.5px">P3 &nbsp; X</span>
</td>
</tr>
</table>

<br>
<sub><strong>Dev Panchal — TEAM NAME</strong> &nbsp;·&nbsp; QA Expert &nbsp;·&nbsp; YYYY-MM-DD</sub>
<br><br>

</div>
```

---

## 7 — Critical Rules (Never Break These)

| Rule | Detail |
|:---|:---|
| **No `<table>/<td>` in cover** | Renderers inject white backgrounds onto td cells. Use `<div>` cards with `background:rgba(0,0,0,.28)` instead |
| **Explicit backgrounds on stat cards** | Each stat card `<td>` must have its own `background:` color — never rely on inheritance |
| **`<br>` between every field** | All 5 bug fields separated by `<br>` spacers — no exceptions |
| **`---` after every bug** | Horizontal rule separator after the Solution field of every bug |
| **Sentence case bug titles** | "Mismatched closing tag in banner" — not "Mismatched Closing Tag In Banner" |
| **Bullet points for Solution** | Always `-` list items, never prose paragraphs |
| **Em dash not hyphen** | Use ` — ` not ` - ` in all copy |
| **File saved to `reports/bugs/`** | Naming: `[feature-name].md` e.g. `sproutos-copywriting.md` |

---

## 8 — Brand Colors Reference

| Token | Hex | Usage |
|:---|:---|:---|
| SproutOS violet | `#5202FD` | Gradient start |
| SproutOS mid | `#3600AF` | Gradient mid |
| WDesignKit navy | `#040483` | Gradient end |
| P1 red | `#dc2626` / `#fef2f2` | Critical bugs |
| P2 amber | `#d97706` / `#fffbeb` | High impact bugs |
| P3 blue | `#0284c7` / `#f0f9ff` | Polish bugs |
