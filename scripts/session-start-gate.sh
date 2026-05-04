#!/usr/bin/env bash
# =============================================================================
# session-start-gate.sh — WDesignKit Orbit Session Start Gate
#
# Fires via Claude Code UserPromptSubmit hook on every user message.
# Reads the prompt from stdin JSON, detects QA/feature/test intent,
# and if matched outputs a mandatory context-read reminder so Claude
# always loads CLAUDE.md, AI-CONTEXT.md, and PITFALLS.md before acting.
#
# Exit 0 always — output is injected into Claude's context as a reminder.
# =============================================================================

set -euo pipefail

INPUT="$(cat)"

# Extract prompt text from hook JSON payload
PROMPT="$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('prompt', ''))
except:
    print('')
" 2>/dev/null || echo "")"

# Keywords that indicate a QA / feature / testing task
if echo "$PROMPT" | grep -qiE \
  "test|qa|feature|widget|template|bug|spec|check|fix|audit|review|\
perform|create|write|update|settings|login|plugin|browse|import|\
responsive|mobile|tablet|desktop|accessibility|console|security|seo|\
lighthouse|axe|checklist|script|flow|scenario|validate|verify|issue"; then

  cat <<'GATE'

╔══════════════════════════════════════════════════════════════════════════════╗
║         📋  SESSION START — MANDATORY CONTEXT READ REQUIRED                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  A QA or feature task was detected. Before doing ANYTHING else:              ║
║                                                                              ║
║  Step 1 — Read these files NOW (in this order):                              ║
║                                                                              ║
║    Read CLAUDE.md          ← role, rules, bug format, release gate           ║
║    Read AI-CONTEXT.md      ← 11 QA dimensions, thresholds, edge cases        ║
║    Read PITFALLS.md        ← what to avoid when writing tests                ║
║                                                                              ║
║  Step 2 — Read the checklist matching the QA area:                           ║
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
║    Full Release QA  →  checklists/qa-master-checklist.md (all 11)           ║
║                                                                              ║
║  Step 3 — Confirm before writing any test or bug report:                     ║
║                                                                              ║
║    [ ] CLAUDE.md read in full                                                ║
║    [ ] AI-CONTEXT.md read in full                                            ║
║    [ ] PITFALLS.md read in full                                              ║
║    [ ] Relevant checklist(s) read in full                                    ║
║                                                                              ║
║  DO NOT skip this. Every session starts fresh — prior reads don't count.    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

GATE

fi

exit 0
