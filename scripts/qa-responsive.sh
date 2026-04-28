#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Responsiveness QA
# Runs spec files across desktop, tablet, and mobile viewports
#
# Usage:
#   bash scripts/qa-responsive.sh                        # server, all specs
#   bash scripts/qa-responsive.sh --type=plugin          # plugin tests
#   bash scripts/qa-responsive.sh --type=server --spec=auth
#   bash scripts/qa-responsive.sh --type=plugin --spec=activation
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

# Resolve test path and project prefix based on type
if [ "$TYPE" = "plugin" ]; then
  TESTBASE="tests/plugin"
  PROJECT_PREFIX="plugin"
else
  TESTBASE="tests/server"
  PROJECT_PREFIX="wdk"
fi

if [ "$SPEC" = "all" ]; then
  TESTPATH="$TESTBASE"
else
  TESTPATH="${TESTBASE}/${SPEC}.spec.js"
fi

echo ""
echo "========================================="
echo " WDesignKit Orbit — Responsiveness QA"
echo " Type: $TYPE | Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Viewports: 1440px · 768px · 375px"
echo "========================================="
echo ""

run_viewport() {
  local LABEL=$1
  local PROJECT=$2

  echo "── $LABEL ──────────────────────────────"
  npx playwright test "$TESTPATH" --project="$PROJECT" --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: $LABEL"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $LABEL"
  fi
  echo ""
}

run_viewport "Desktop  (1440px)" "${PROJECT_PREFIX}-desktop"
run_viewport "Tablet   (768px)"  "${PROJECT_PREFIX}-tablet"
run_viewport "Mobile   (375px)"  "${PROJECT_PREFIX}-mobile"

echo "========================================="
echo " RESPONSIVENESS SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL VIEWPORTS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED VIEWPORT(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
