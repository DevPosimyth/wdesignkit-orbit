#!/usr/bin/env bash
# =============================================================================
# pre-spec-gate.sh — WDesignKit Orbit Pre-Test Gate
#
# Fires via Claude Code PreToolUse hook before any Write/Edit call.
# Reads the tool input JSON from stdin, checks if the target file is a
# Playwright spec file (*.spec.js or *.spec.ts), and if so:
#   1. Prints the mandatory gate header
#   2. Detects the spec area from the filename
#   3. Prints the FULL content of every relevant checklist inline
#      so the AI processes each item — not just a filename to "maybe read"
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

# ─── REPO ROOT ───────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CL_DIR="$REPO_ROOT/checklists"

# ─── DETECT SPEC AREA FROM FILENAME ─────────────────────────────────────────
SPEC_NAME="$(basename "$FILE_PATH")"
declare -a CHECKLISTS=()

if [[ "$SPEC_NAME" == *auth* || "$SPEC_NAME" == *login* ]]; then
  CHECKLISTS=("functionality-checklist.md" "security-checklist.md" "accessibility-checklist.md")
elif [[ "$SPEC_NAME" == *widget-builder* || "$SPEC_NAME" == *widget* ]]; then
  CHECKLISTS=("functionality-checklist.md" "security-checklist.md" "accessibility-checklist.md" "cross-browser-checklist.md")
elif [[ "$SPEC_NAME" == *dashboard* ]]; then
  CHECKLISTS=("functionality-checklist.md" "logic-checklist.md" "accessibility-checklist.md")
elif [[ "$SPEC_NAME" == *template* || "$SPEC_NAME" == *import* ]]; then
  CHECKLISTS=("functionality-checklist.md" "security-checklist.md" "cross-browser-checklist.md")
elif [[ "$SPEC_NAME" == *homepage* || "$SPEC_NAME" == *home* ]]; then
  CHECKLISTS=("ui-ux-checklist.md" "seo-checklist.md" "accessibility-checklist.md" "responsiveness-checklist.md")
elif [[ "$SPEC_NAME" == *plugin* || "$SPEC_NAME" == *activation* || "$SPEC_NAME" == *admin* ]]; then
  CHECKLISTS=("functionality-checklist.md" "security-checklist.md" "code-quality-checklist.md")
else
  # Default: always load the three highest-miss checklists
  CHECKLISTS=("functionality-checklist.md" "security-checklist.md" "accessibility-checklist.md")
fi

# ─── GATE HEADER ─────────────────────────────────────────────────────────────
cat <<GATE

╔══════════════════════════════════════════════════════════════════════════════╗
║            ⛔  PRE-TEST GATE — READ EVERY ITEM BELOW BEFORE WRITING  ⛔      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Spec file detected: $SPEC_NAME
║                                                                              ║
║  The FULL checklist content is printed below.                                ║
║  You MUST read every item and plan a test() assertion or // MANUAL CHECK:   ║
║  comment for each one before writing a single line of test code.             ║
║                                                                              ║
║  ALSO read before writing:                                                   ║
║    AI-CONTEXT.md   ← edge cases, thresholds, severity                       ║
║    PITFALLS.md     ← what to avoid when writing Playwright tests             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

GATE

# ─── PRINT FULL CHECKLIST CONTENT INLINE ─────────────────────────────────────
for CL in "${CHECKLISTS[@]}"; do
  CL_PATH="$CL_DIR/$CL"
  if [[ -f "$CL_PATH" ]]; then
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo "  CHECKLIST: $CL"
    echo "════════════════════════════════════════════════════════════════════════════════"
    cat "$CL_PATH"
    echo ""
  fi
done

# ─── CONFIRM FOOTER ───────────────────────────────────────────────────────────
cat <<'FOOTER'

════════════════════════════════════════════════════════════════════════════════
  CONFIRM — all 5 must be true before writing any test code:
════════════════════════════════════════════════════════════════════════════════

  [ ] AI-CONTEXT.md read in full
  [ ] PITFALLS.md read in full
  [ ] Every checklist above read — every item processed
  [ ] Every automatable item has a planned test() assertion
  [ ] Non-automatable items flagged as // MANUAL CHECK: in spec header

  A test written without these steps WILL miss coverage and FAIL the gate.

════════════════════════════════════════════════════════════════════════════════

FOOTER

exit 0
