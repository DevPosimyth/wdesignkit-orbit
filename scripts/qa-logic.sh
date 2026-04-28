#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Logic QA
# Validates business logic, edge cases, empty/error/loading states,
# form validation, and role-based access control
#
# Usage:
#   bash scripts/qa-logic.sh                        # server, all specs
#   bash scripts/qa-logic.sh --type=plugin          # plugin tests
#   bash scripts/qa-logic.sh --type=server --spec=auth
#   bash scripts/qa-logic.sh --type=plugin --spec=admin
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TYPE="server"
SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

for arg in "$@"; do
  case $arg in
    --type=*) TYPE="${arg#*=}" ;;
    --spec=*) SPEC="${arg#*=}" ;;
  esac
done

if [ "$TYPE" = "plugin" ]; then
  TESTBASE="tests/plugin"
  PROJECT="plugin-desktop"
else
  TESTBASE="tests/wdesignkit"
  PROJECT="wdk-desktop"
fi

if [ "$SPEC" = "all" ]; then
  TESTPATH="$TESTBASE"
else
  TESTPATH="${TESTBASE}/${SPEC}.spec.js"
fi

echo ""
echo "========================================="
echo " WDesignKit Orbit — Logic QA"
echo " Type: $TYPE | Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Focus: edge cases · states · validation · RBAC"
echo "========================================="
echo ""

# ── Step 1: Full spec run ─────────────────────────────────────────────────────
echo "STEP 1 — Full Spec Run"
echo "-----------------------------------------"

npx playwright test "$TESTPATH" --project="$PROJECT" --reporter=list

if [ $? -ne 0 ]; then
  echo "FAILED: Logic errors detected"
  FAILED=$((FAILED + 1))
else
  echo "PASSED"
fi
echo ""

# ── Step 2: Edge case coverage check ─────────────────────────────────────────
echo "STEP 2 — Edge Case Coverage"
echo "-----------------------------------------"

EDGE_PATTERNS=("empty" "error state" "invalid" "edge case" "loading" "empty state" "validation" "forbidden" "unauthorized" "redirect")
MISSING=0

for PATTERN in "${EDGE_PATTERNS[@]}"; do
  COUNT=$(grep -ril "$PATTERN" "$TESTBASE" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    echo "   [COVERED] \"$PATTERN\" — $COUNT spec file(s)"
  else
    echo "   [MISSING] \"$PATTERN\" — no test coverage"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
[ $MISSING -gt 0 ] && echo "   $MISSING scenario(s) without coverage — review manually"
echo ""

# ── Step 3: API / error handling ─────────────────────────────────────────────
echo "STEP 3 — API Error Handling Coverage"
echo "-----------------------------------------"

API_COUNT=$(grep -ril "500\|network\|timeout\|offline" "$TESTBASE" 2>/dev/null | wc -l | tr -d ' ')
if [ "$API_COUNT" -gt 0 ]; then
  echo "   [COVERED] API/network error handling found in $API_COUNT spec file(s)"
else
  echo "   [MISSING] No API error handling tests — add tests for 500, timeout, offline"
fi
echo ""

echo "========================================="
echo " LOGIC SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Edge case gaps: $MISSING"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " LOGIC TESTS PASSED"
  [ $MISSING -gt 0 ] && echo " WARNING: $MISSING edge case(s) need coverage"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " FAILED — fix logic errors before release"
  echo " View report: npx playwright show-report"
  exit 1
fi
