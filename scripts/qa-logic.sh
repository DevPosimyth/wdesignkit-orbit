#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Logic QA
# Validates business logic, conditional rendering, edge cases, empty states,
# error states, loading states, form validation, and role-based access
# Runs Playwright specs with targeted grep patterns for logic-related tests
# Usage: bash scripts/qa-logic.sh
#        bash scripts/qa-logic.sh --spec=auth
#        bash scripts/qa-logic.sh --spec=dashboard
#        bash scripts/qa-logic.sh --spec=widget-builder
#        bash scripts/qa-logic.sh --spec=homepage
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

for arg in "$@"; do
  case $arg in
    --spec=*) SPEC="${arg#*=}" ;;
  esac
done

if [ "$SPEC" = "all" ]; then
  TESTPATH="tests/wdesignkit"
else
  TESTPATH="tests/wdesignkit/${SPEC}.spec.js"
fi

echo ""
echo "========================================="
echo " WDesignKit Orbit — Logic QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Focus: edge cases · states · validation · RBAC"
echo "========================================="
echo ""

# ── Step 1: Full spec run ─────────────────────────────────────────────────────
echo "STEP 1 — Full Spec Run (desktop)"
echo "-----------------------------------------"

npx playwright test "$TESTPATH" --project="wdk-desktop" --reporter=list

if [ $? -ne 0 ]; then
  echo "FAILED: Logic errors detected in spec run"
  FAILED=$((FAILED + 1))
else
  echo "PASSED"
fi
echo ""

# ── Step 2: Edge case scenarios ───────────────────────────────────────────────
echo "STEP 2 — Edge Case & State Validation"
echo "-----------------------------------------"
echo "Checking for logic-specific test coverage..."
echo ""

EDGE_PATTERNS=(
  "empty"
  "error state"
  "invalid"
  "edge case"
  "loading"
  "empty state"
  "validation"
  "forbidden"
  "unauthorized"
  "redirect"
)

MISSING=0
for PATTERN in "${EDGE_PATTERNS[@]}"; do
  COUNT=$(grep -ril "$PATTERN" tests/wdesignkit/ 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    echo "   [COVERED] \"$PATTERN\" — found in $COUNT spec file(s)"
  else
    echo "   [MISSING] \"$PATTERN\" — no test coverage found"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
if [ $MISSING -gt 0 ]; then
  echo "   $MISSING edge case scenario(s) have no test coverage — review manually"
fi

echo ""

# ── Step 3: API / network error handling ─────────────────────────────────────
echo "STEP 3 — API Error Handling Coverage"
echo "-----------------------------------------"

API_PATTERNS=("500\|network\|timeout\|offline\|api error")
API_COUNT=$(grep -ril "500\|network\|timeout\|offline" tests/wdesignkit/ 2>/dev/null | wc -l | tr -d ' ')

if [ "$API_COUNT" -gt 0 ]; then
  echo "   [COVERED] API/network error handling found in $API_COUNT spec file(s)"
else
  echo "   [MISSING] No API error handling tests found — add tests for 500, timeout, offline states"
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
  if [ $MISSING -gt 0 ]; then
    echo " WARNING: $MISSING edge case scenario(s) lack coverage — add tests"
  fi
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " FAILED — fix logic errors before release"
  echo " View report: npx playwright show-report"
  exit 1
fi
