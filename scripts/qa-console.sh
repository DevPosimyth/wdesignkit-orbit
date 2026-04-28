#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Console Errors QA
# Runs spec files and flags JS console errors, warnings, network failures
#
# Usage:
#   bash scripts/qa-console.sh                        # server, all specs
#   bash scripts/qa-console.sh --type=plugin          # plugin tests
#   bash scripts/qa-console.sh --type=server --spec=auth
#   bash scripts/qa-console.sh --type=plugin --spec=admin
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TYPE="server"
SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/console"

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
  TESTBASE="tests/server"
  PROJECT="wdk-desktop"
fi

if [ "$SPEC" = "all" ]; then
  TESTPATH="$TESTBASE"
else
  TESTPATH="${TESTBASE}/${SPEC}.spec.js"
fi

mkdir -p "$REPORT_DIR"
LOG_FILE="$REPORT_DIR/console-${TYPE}-${TIMESTAMP}.log"

echo ""
echo "========================================="
echo " WDesignKit Orbit — Console Errors QA"
echo " Type: $TYPE | Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Zero-error tolerance enforced"
echo "========================================="
echo ""

npx playwright test "$TESTPATH" \
  --project="$PROJECT" \
  --reporter=list 2>&1 | tee "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "── Console Error Analysis ───────────────"

ERROR_COUNT=$(grep -ci "console error\|uncaught\|unhandled\|typeerror\|referenceerror\|failed to load\|net::err\|404\|500" "$LOG_FILE" || echo 0)

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "Potential issues detected ($ERROR_COUNT match(es)):"
  grep -i "console error\|uncaught\|unhandled\|typeerror\|referenceerror\|failed to load\|net::err\|404\|500" "$LOG_FILE"
  FAILED=$((FAILED + 1))
else
  echo " No console error patterns detected"
fi

[ $EXIT_CODE -ne 0 ] && FAILED=$((FAILED + 1))

echo ""
echo "========================================="
echo " CONSOLE ERRORS SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Log: $LOG_FILE"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL PASSED — Zero console errors"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " FAILED — Console errors or test failures detected"
  echo " View report: npx playwright show-report"
  exit 1
fi
