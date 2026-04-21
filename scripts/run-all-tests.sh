#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Run All Tests
# Runs: Playwright tests across all properties + Lighthouse scans
# Usage: bash scripts/run-all-tests.sh
#        bash scripts/run-all-tests.sh --skip-lighthouse
#        bash scripts/run-all-tests.sh --property wdesignkit
# =============================================================================

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SKIP_LIGHTHOUSE=false
PROPERTY="all"
FAILED=0

# Parse arguments
for arg in "$@"; do
  case $arg in
    --skip-lighthouse) SKIP_LIGHTHOUSE=true ;;
    --property=*) PROPERTY="${arg#*=}" ;;
  esac
done

echo ""
echo "========================================="
echo " WDesignKit Orbit — Full Test Run"
echo " Started: $TIMESTAMP"
echo " Property: $PROPERTY"
echo "========================================="
echo ""

# ── Step 1: Playwright Tests ──────────────────────────────────────────────────
echo "STEP 1 — Playwright E2E Tests"
echo "-----------------------------------------"

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

if [ "$PROPERTY" = "all" ] || [ "$PROPERTY" = "wdesignkit" ]; then
  run_playwright "WDesignKit — Desktop" "wdk-desktop"  "tests/wdesignkit"
  run_playwright "WDesignKit — Mobile"  "wdk-mobile"   "tests/wdesignkit"
  run_playwright "WDesignKit — Tablet"  "wdk-tablet"   "tests/wdesignkit"
fi

if [ "$PROPERTY" = "all" ] || [ "$PROPERTY" = "sproutos" ]; then
  run_playwright "Sproutos — Desktop"   "sproutos-desktop" "tests/sproutos"
  run_playwright "Sproutos — Mobile"    "sproutos-mobile"  "tests/sproutos"
fi

if [ "$PROPERTY" = "all" ] || [ "$PROPERTY" = "learning" ]; then
  run_playwright "Learning Center"      "learning-desktop" "tests/learning-center"
fi

# ── Step 2: Lighthouse Scans ──────────────────────────────────────────────────
echo "STEP 2 — Lighthouse Performance Scans"
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

# ── Summary ───────────────────────────────────────────────────────────────────
echo "========================================="
echo " SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL PASSED — safe to release"
  echo ""
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED STEP(S) FAILED — do not release"
  echo ""
  echo " View report: npx playwright show-report"
  exit 1
fi