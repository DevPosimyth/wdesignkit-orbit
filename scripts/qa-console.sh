#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Console Errors QA
# Runs all spec files and flags any JS console errors, warnings, or
# network failures captured during the Playwright test run
# Usage: bash scripts/qa-console.sh
#        bash scripts/qa-console.sh --spec=auth
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/console"

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

mkdir -p "$REPORT_DIR"
LOG_FILE="$REPORT_DIR/console-${TIMESTAMP}.log"

echo ""
echo "========================================="
echo " WDesignKit Orbit — Console Errors QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Zero-error tolerance enforced"
echo "========================================="
echo ""

echo "Running Playwright tests and capturing console output..."
echo ""

# Run tests and capture output — reporter=list shows inline pass/fail
npx playwright test "$TESTPATH" \
  --project="wdk-desktop" \
  --reporter=list 2>&1 | tee "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "── Console Error Analysis ───────────────"

# Parse captured log for known error patterns
ERROR_COUNT=$(grep -ci "console error\|uncaught\|unhandled\|typeerror\|referenceerror\|failed to load\|net::err\|404\|500" "$LOG_FILE" || echo 0)

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo ""
  echo "Potential console issues detected ($ERROR_COUNT match(es)):"
  grep -i "console error\|uncaught\|unhandled\|typeerror\|referenceerror\|failed to load\|net::err\|404\|500" "$LOG_FILE"
  echo ""
  FAILED=$((FAILED + 1))
else
  echo " No console error patterns detected in test output"
fi

if [ $EXIT_CODE -ne 0 ]; then
  FAILED=$((FAILED + 1))
fi

echo ""
echo "========================================="
echo " CONSOLE ERRORS SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Log saved: $LOG_FILE"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL PASSED — Zero console errors"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " FAILED — Console errors or test failures detected"
  echo " View log:    $LOG_FILE"
  echo " View report: npx playwright show-report"
  exit 1
fi
