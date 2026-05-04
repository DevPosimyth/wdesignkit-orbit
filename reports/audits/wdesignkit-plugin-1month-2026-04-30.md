# 🥒 Pickle ClickUp — WDesignKit Plugin: 1 Month Summary
**Period:** Last 30 Days (April 2026)
**Sources:** QA Board (Plugin Bugs) + Plugin Board (Plugin Development) only
**Workspace:** POSIMYTH Innovations

---

## 📊 At a Glance

| Metric | Count | Board |
|---|---|---|
| 🐛 Total Bugs Added | **183** | QA Board |
| ✅ QA Passed | **5** | QA Board |
| 🔒 Fixed / Complete | **15** | QA Board |
| ❌ QA Failed | **4** | QA Board |
| 🔍 Ready for QA | **1** | QA Board |
| 🔧 In Developing | **1** | QA Board |
| 🟡 Open (New) | **157** | QA Board |
| 🚀 New Features | **5** | Plugin Board |

---

## 🐛 Total Bugs Added — 183 (QA Board)

### Bug Status Breakdown

| Status | Count |
|---|---|
| 🟡 New / Open | 157 |
| ✅ Complete | 15 |
| ✅ QA Passed | 5 |
| ❌ QA Failed | 4 |
| 🔧 In Developing | 1 |
| 🔍 Ready for QA | 1 |
| **Total** | **183** |

---

## ✅ QA Passed — 5 (QA Board)

| # | Bug |
|---|---|
| 1 | Multiple page issue |
| 2 | Switcher enable issue |
| 3 | Kit import issue |
| 4 | Page name & builder icon issue |
| 5 | Report |

---

## 🔒 Fixed / Complete — 15 (QA Board)

| # | Bug |
|---|---|
| 1 | Option missing |
| 2 | Animated border missing |
| 3 | Border issue |
| 4 | Add loader |
| 5 | Font color issue |
| 6 | Add tooltip |
| 7 | Placeholder text issue |
| 8 | Disable features |
| 9 | Search bar missing |
| 10 | Design pending |
| 11 | Design update |
| 12 | Chat header design |
| 13 | Popup missing |
| 14 | Widget created design |
| 15 | Credit popup design |

---

## ❌ QA Failed — 4 (QA Board)

| # | Bug |
|---|---|
| 1 | Button link issue |
| 2 | Font family issue |
| 3 | Content issue |
| 4 | Section issue |

---

## 🔍 In Pipeline (QA Board)

| Bug | Status |
|---|---|
| list-widgets Ability Fails with Fatal PHP Error on All Builders | Ready for QA |
| De-activation Popup | In Developing |

---

## 🚀 New Features — 5 (Plugin Board)

| # | Feature | Status |
|---|---|---|
| 1 | Download widget as plugin | In Development |
| 2 | WDK widget download on template import | In Development |
| 3 | Merged Figma option and Updated Code | In Development |
| 4 | Design Changes according new Figma | In Development |
| 5 | Research about MCP integration | In Development |

---

## 🟡 Open Bugs — 157 (QA Board)

### AI Widget Builder (17)
| Bug |
|---|
| Attached file lost after Prompt Enhancer is triggered |
| Strict Mode ignores active mode state when editing an existing widget |
| AI model switch mid-session resets chat context and loses message history |
| User credit count not updated in real time after each AI request |
| Suggested widgets panel does not refresh when Strict Mode is toggled on |
| Deleting a chat from history while it is open causes UI freeze |
| Expand control collapses chat but does not restore scroll position on re-expand |
| Prompt Enhancer rewrites prompt even when input field is empty |
| Multiple simultaneous chats share the same Suggested Widgets result set |
| Renamed chat title reverts to original after page refresh |
| AI generates widget named "Elementor" — conflicts with Elementor core namespace |
| Credit count issue |
| AI switcher in browse |
| AI model issue |
| View chat loader |
| Conversation delete issue |
| Content update issue |

### MCP / Abilities API (45)
| Bug |
|---|
| Batch Execution of list-widgets Returns 100% Failure |
| Widget Data Consistency Cannot Be Validated — list-widgets PHP Fatal Error |
| list-widgets Has No Pagination Support in Input Schema |
| list-widgets Reports execution_time_ms as 0 on All Failed Calls |
| Missing Token Expiry Field in Login Status Response |
| No Distinction Between Session Expired vs Not Logged In |
| get-login-status returns success:true for invalid widget_ids |
| Platform-wide missing input validation layer |
| Platform-wide non-idempotent write responses |
| update-settings returns plugin_version as malformed object |
| check-dependencies returns no version information |
| dependency status has no "installed_inactive" state |
| Bricks Builder marked as is_pro:false — incorrect licensing flag |
| The Plus Addons Pro blocked from install-dependency |
| wdesignkit plugin in install-dependency — circular self-installation |
| nexter slug in allowed list fails — dead allowlist entry |
| nexter-extension absent from check-dependencies |
| Special characters accepted in category name — no sanitization |
| No maximum length limit on category name |
| Removing non-existent category returns success:true |
| list-categories missing metadata (ID, widget_count, etc.) |
| Category duplicate detection is case-sensitive |
| manage-categories reports "updated" on identical payload |
| Remove action returns success:true for non-existent category |
| Deleting a category orphans widgets |
| Activate-widget success:true for non-existent widget_id |
| Activate-widget accepts SQL injection strings |
| Activate-widget: real vs phantom widget indistinguishable |
| Deactivate-widget success:true for non-existent widget_id |
| Deactivate-widget accepts SQL injection |
| Builder parameter ignored during deactivation |
| Deactivate-widget false action claim |
| update-widget non-idempotent — always reports files modified |
| CSS/JS update silently overwrites entire file — destructive data loss |
| Special characters accepted in name on update |
| No deletion confirmation or undo |
| Delete response missing per-file breakdown |
| Duplicate widget names allowed without warning |
| Special characters leak into folder/filenames |
| Invalid version string accepted — no format validation |
| No maximum length limit on widget name |
| Generated PHP render() class prefix mismatch with CSS |
| Widget name update does not sync PHP get_title() |
| CROSS-CUTTING Ghost success pattern across multiple endpoints |
| MODULE 5: deleting a category orphans all assigned widgets |

### Widget Code Quality (10)
| Bug |
|---|
| Team Member widget: social link placeholders unresolved |
| Animation Buttons CSS: class injected inside rgba() — 71 broken CSS rules |
| Team Member: Social Links repeater registered as TEXT control |
| Logo Grid: repeater fields output without escaping — **XSS risk** |
| Heading tag replacement runs twice per widget JS |
| All AI-generated widgets have empty widget_version |
| 5 of 9 AI widgets use :root for CSS vars — global style pollution |
| Animation Buttons: all 16 default items identical |
| Text Shimmer: CSS variables on :root — multi-instance conflict |
| Non-deterministic animation delay using Math.random() |

### UI / Design (20)
| Bug |
|---|
| Design Changes according New Figma (Plugin) |
| Design Changes according New Figma (Server) |
| Widget generate design |
| Image issue |
| Box size issue |
| Section missing |
| Background image missing |
| Icon issue |
| Text color issue |
| Field color issue |
| Font color issue |
| Capitalization issue |
| Design mess-up issue |
| Panel issue |
| Process show issue |
| Notice appear issue |
| Tooltip content issue |
| Server Changes align with Plugin |
| Incorrect widget icon (ti-shield) in Text Shimmer |
| Unresolved template placeholder in rendered frontend HTML |

### Functionality / Logic (16)
| Bug |
|---|
| Resume issue |
| Image with Text |
| Animation Slider |
| Team Member |
| Developer |
| Functional bugs |
| Bricks theme required issue |
| Page builder compatibility issue |
| Strict mode issue |
| Data fill issue |
| Editor open issue |
| Widget push issue |
| Widget details |
| MCP changes |
| Widget Push error |
| Rollback |

### Template Import (3)
| Bug |
|---|
| Download widget while template import |
| WDesignKit live widget |
| Nexter Blocks Plugin |

### Other / General (46)
*(Testing Doc, Output issue, Extra libraries, Content issue, Long file issue, Pending Points, Code Snippet QA, Search event issue, all Module-level cross-cutting issues, etc.)*

---

## ⚠️ Risk Summary

| Area | Count | Risk |
|---|---|---|
| QA Throughput | 5 passed / 183 added | 🔴 2.7% closure rate |
| MCP / Abilities | 45 open bugs | 🔴 HIGH — ghost success + SQL injection |
| Security (XSS) | 1 confirmed | 🔴 HIGH — Logo Grid widget |
| AI Widget Builder | 17 open bugs | 🟠 HIGH — core UX impact |
| UI / Design | 20 open bugs | 🟡 MEDIUM |
| QA Failed | 4 | 🟡 MEDIUM — needs re-fix + re-test |

---

*🥒 pickle-clickup · by Aditya Sharma · github.com/adityaarsharma/pickle*
*Sources: QA Board (Plugin Bugs) + Plugin Board (Plugin Development) · Read-only · No ClickUp changes made*
