#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Functionality QA
# Runs functional spec files — buttons, forms, CRUD, auth, integrations
#
# Usage:
#   bash scripts/qa-functionality.sh                        # server, all specs
#   bash scripts/qa-functionality.sh --type=plugin          # plugin, all specs
#   bash scripts/qa-functionality.sh --type=server --spec=auth
#   bash scripts/qa-functionality.sh --type=plugin --spec=activation
#   bash scripts/qa-functionality.sh --type=plugin --spec=admin
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

# Resolve test base and project based on type
if [ "$TYPE" = "plugin" ]; then
  TESTBASE="tests/plugin"
  PROJECT="plugin-desktop"
else
  TESTBASE="tests/wdesignkit"
  PROJECT="wdk-desktop"
fi

echo ""
echo "========================================="
echo " WDesignKit Orbit — Functionality QA"
echo " Type: $TYPE | Spec: $SPEC"
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
  npx playwright test "$SPECFILE" --project="$PROJECT" --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: $LABEL"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $LABEL"
  fi
  echo ""
}

if [ "$SPEC" = "all" ]; then
  if [ "$TYPE" = "plugin" ]; then
    run_spec "Activation  (activate · deactivate · lifecycle)"   "tests/plugin/activation.spec.js"
    run_spec "Admin Panel (settings · menu · RBAC)"              "tests/plugin/admin.spec.js"
    run_spec "Widget — Elementor (panel · editor · frontend)"    "tests/plugin/widget-elementor.spec.js"
    run_spec "Widget — Gutenberg (inserter · block · frontend)"  "tests/plugin/widget-gutenberg.spec.js"
  else
    run_spec "Auth          (login · signup · forgot · reset)"            "tests/wdesignkit/auth.spec.js"
    run_spec "Dashboard     (prompt · file attach · link · language)"     "tests/wdesignkit/dashboard.spec.js"
    run_spec "Widget Builder (AI chat · enhancer · strict mode · credits)" "tests/wdesignkit/widget-builder.spec.js"
    run_spec "Homepage      (nav · CTAs · layout)"                        "tests/wdesignkit/homepage.spec.js"
  fi
else
  run_spec "$SPEC" "${TESTBASE}/${SPEC}.spec.js"
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
