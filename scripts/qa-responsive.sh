#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Responsiveness QA
# Runs all WDesignKit spec files across desktop, tablet, and mobile viewports
# Usage: bash scripts/qa-responsive.sh
#        bash scripts/qa-responsive.sh --spec=auth
#        bash scripts/qa-responsive.sh --spec=dashboard
#        bash scripts/qa-responsive.sh --spec=widget-builder
#        bash scripts/qa-responsive.sh --spec=homepage
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

# Resolve test path
if [ "$SPEC" = "all" ]; then
  TESTPATH="tests/wdesignkit"
else
  TESTPATH="tests/wdesignkit/${SPEC}.spec.js"
fi

echo ""
echo "========================================="
echo " WDesignKit Orbit — Responsiveness QA"
echo " Spec: $SPEC"
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

run_viewport "Desktop  (1440px)" "wdk-desktop"
run_viewport "Tablet   (768px)"  "wdk-tablet"
run_viewport "Mobile   (375px)"  "wdk-mobile"

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
