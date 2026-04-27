#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Cross-Browser QA
# Runs WDesignKit spec files across Chromium, Firefox, and WebKit (Safari)
# Usage: bash scripts/qa-cross-browser.sh
#        bash scripts/qa-cross-browser.sh --spec=auth
#        bash scripts/qa-cross-browser.sh --spec=dashboard
#        bash scripts/qa-cross-browser.sh --spec=widget-builder
#        bash scripts/qa-cross-browser.sh --spec=homepage
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
echo " WDesignKit Orbit — Cross-Browser QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Browsers: Chromium · Firefox · WebKit"
echo "========================================="
echo ""

# Ensure browsers are installed
echo "Checking browser installations..."
npx playwright install chromium firefox webkit --with-deps > /dev/null 2>&1
echo "Browsers ready."
echo ""

run_browser() {
  local BROWSER=$1

  echo "── $BROWSER ──────────────────────────────"
  npx playwright test "$TESTPATH" --browser="$BROWSER" --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: $BROWSER"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $BROWSER"
  fi
  echo ""
}

run_browser "chromium"
run_browser "firefox"
run_browser "webkit"

echo "========================================="
echo " CROSS-BROWSER SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL BROWSERS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED BROWSER(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
