#!/usr/bin/env bash
# =============================================================================
# pre-spec-gate.sh — WDesignKit Orbit Pre-Test Gate
#
# Fires via Claude Code PreToolUse hook before any Write/Edit call.
# Reads the tool input JSON from stdin, checks if the target file is a
# Playwright spec file (*.spec.js or *.spec.ts), and if so prints the
# mandatory reading gate.
#
# Exit 0 always — this gate is informational (Claude reads the output).
# To hard-block, change exit 0 → exit 2 at the bottom.
# =============================================================================

set -euo pipefail

INPUT="$(cat)"

# Extract the file path from the tool input JSON
FILE_PATH="$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"//')"

# If we can't detect a file path, exit silently — non-spec tool call
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only gate on spec files
if [[ "$FILE_PATH" != *.spec.js && "$FILE_PATH" != *.spec.ts ]]; then
  exit 0
fi

# ─── GATE OUTPUT ────────────────────────────────────────────────────────────
cat <<'GATE'

╔══════════════════════════════════════════════════════════════════════════════╗
║            ⛔  PRE-TEST GATE — MANDATORY READING REQUIRED  ⛔               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  You are about to write a Playwright spec file.                              ║
║  DO NOT write a single line of test code until ALL steps below are done.     ║
║                                                                              ║
║  STEP 1 — Read these two files (ALWAYS required):                            ║
║                                                                              ║
║    cat AI-CONTEXT.md                                                         ║
║    cat PITFALLS.md                                                           ║
║                                                                              ║
║  STEP 2 — Read the checklist matching the QA area:                           ║
║                                                                              ║
║    UI / Design      →  checklists/ui-ux-checklist.md                        ║
║    Functionality    →  checklists/functionality-checklist.md                ║
║    Responsive       →  checklists/responsiveness-checklist.md               ║
║    Logic            →  checklists/logic-checklist.md                        ║
║    Security         →  checklists/security-checklist.md                     ║
║    Performance      →  checklists/performance-checklist.md                  ║
║    Accessibility    →  checklists/accessibility-checklist.md                ║
║    Cross-Browser    →  checklists/cross-browser-checklist.md                ║
║    Console Errors   →  checklists/console-errors-checklist.md               ║
║    SEO / Meta       →  checklists/seo-checklist.md                          ║
║    Code Quality     →  checklists/code-quality-checklist.md                 ║
║    Full Release QA  →  checklists/qa-master-checklist.md                    ║
║                                                                              ║
║  STEP 3 — Confirm before writing:                                            ║
║                                                                              ║
║    [ ] AI-CONTEXT.md read                                                    ║
║    [ ] PITFALLS.md read                                                      ║
║    [ ] Relevant checklist(s) read                                            ║
║    [ ] Every automatable checklist item has a test() assertion planned       ║
║    [ ] Non-automatable items will be flagged as // MANUAL CHECK: comments    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

GATE

exit 0
