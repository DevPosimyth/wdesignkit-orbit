#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Run All Tests
# Runs: Playwright tests across all projects + Lighthouse scans
#
# Usage:
#   bash scripts/run-all-tests.sh                        # server + plugin + learn + lighthouse
#   bash scripts/run-all-tests.sh --type=server          # server tests only
#   bash scripts/run-all-tests.sh --type=plugin          # plugin tests only
#   bash scripts/run-all-tests.sh --type=learning        # learning center only
#   bash scripts/run-all-tests.sh --skip-lighthouse      # skip lighthouse scan
#   bash scripts/run-all-tests.sh --type=server --skip-lighthouse
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SKIP_LIGHTHOUSE=false
TYPE="all"
FAILED=0

for arg in "$@"; do
  case $arg in
    --skip-lighthouse) SKIP_LIGHTHOUSE=true ;;
    --type=*) TYPE="${arg#*=}" ;;
  esac
done

echo ""
echo "========================================="
echo " WDesignKit Orbit — Full Test Run"
echo " Type: $TYPE"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

run_playwright() {
  local LABEL=$1
  local PROJECT=$2
  local TESTDIR=$3

  echo "Running: $LABEL ($PROJECT)"
  npx playwright test "$TESTDIR" --project="$PROJECT" --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: $LABEL"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $LABEL"
  fi
  echo ""
}

# ── SERVER — wdesignkit.com ───────────────────────────────────────────────────
if [ "$TYPE" = "all" ] || [ "$TYPE" = "server" ]; then
  echo "STEP — Server Tests (wdesignkit.com)"
  echo "-----------------------------------------"
  run_playwright "Server — Desktop (1440px)" "wdk-desktop" "tests/server"
  run_playwright "Server — Tablet  (768px)"  "wdk-tablet"  "tests/server"
  run_playwright "Server — Mobile  (375px)"  "wdk-mobile"  "tests/server"
fi

# ── PLUGIN — WordPress plugin ─────────────────────────────────────────────────
if [ "$TYPE" = "all" ] || [ "$TYPE" = "plugin" ]; then
  echo "STEP — Plugin Tests (WordPress)"
  echo "-----------------------------------------"
  run_playwright "Plugin — Desktop (1440px)" "plugin-desktop" "tests/plugin"
  run_playwright "Plugin — Tablet  (768px)"  "plugin-tablet"  "tests/plugin"
  run_playwright "Plugin — Mobile  (375px)"  "plugin-mobile"  "tests/plugin"
fi

# ── LEARNING CENTER ───────────────────────────────────────────────────────────
if [ "$TYPE" = "all" ] || [ "$TYPE" = "learning" ]; then
  echo "STEP — Learning Center (learn.wdesignkit.com)"
  echo "-----------------------------------------"
  run_playwright "Learning Center" "learning-desktop" "tests/learning-center"
fi

# ── LIGHTHOUSE ────────────────────────────────────────────────────────────────
if [ "$TYPE" = "all" ] || [ "$TYPE" = "server" ]; then
  echo "STEP — Lighthouse Performance Scans"
  echo "-----------------------------------------"
  if [ "$SKIP_LIGHTHOUSE" = true ]; then
    echo "Skipped (--skip-lighthouse flag set)"
    echo ""
  else
    if command -v lighthouse &> /dev/null; then
      bash scripts/lighthouse.sh
      if [ $? -ne 0 ]; then
        FAILED=$((FAILED + 1))
      fi
    else
      echo "Lighthouse not installed — skipping"
      echo "To install: npm install -g lighthouse"
      echo ""
    fi
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo "========================================="
echo " SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL PASSED — safe to release"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED STEP(S) FAILED — do not release"
  echo " View report: npx playwright show-report"
  exit 1
fi
