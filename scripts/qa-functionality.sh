#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Functionality QA
# Runs all functional spec files — buttons, forms, CRUD, auth flows,
# integrations, and widget behavior
# Usage: bash scripts/qa-functionality.sh
#        bash scripts/qa-functionality.sh --spec=auth
#        bash scripts/qa-functionality.sh --spec=dashboard
#        bash scripts/qa-functionality.sh --spec=widget-builder
#        bash scripts/qa-functionality.sh --spec=homepage
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

echo ""
echo "========================================="
echo " WDesignKit Orbit — Functionality QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

run_spec() {
  local LABEL=$1
  local SPECFILE=$2

  if [ ! -f "$SPECFILE" ]; then
    echo "── $LABEL — SKIPPED (file not found: $SPECFILE)"
    echo ""
    return
  fi

  echo "── $LABEL ──────────────────────────────"
  npx playwright test "$SPECFILE" --project="wdk-desktop" --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: $LABEL"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $LABEL"
  fi
  echo ""
}

if [ "$SPEC" = "all" ]; then
  run_spec "Auth         (login · signup · forgot · reset)" "tests/wdesignkit/auth.spec.js"
  run_spec "Dashboard    (prompt · file attach · link · language)" "tests/wdesignkit/dashboard.spec.js"
  run_spec "Widget Builder (AI chat · enhancer · strict mode · credits)" "tests/wdesignkit/widget-builder.spec.js"
  run_spec "Homepage     (nav · CTAs · layout)" "tests/wdesignkit/homepage.spec.js"
else
  run_spec "$SPEC" "tests/wdesignkit/${SPEC}.spec.js"
fi

echo "========================================="
echo " FUNCTIONALITY SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL FUNCTIONALITY TESTS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED SPEC(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
