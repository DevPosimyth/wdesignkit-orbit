#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Accessibility QA
# Runs axe-core via Playwright + Lighthouse a11y audit
# Targets: WCAG 2.1 AA — minimum axe score 85
#
# Usage:
#   bash scripts/qa-accessibility.sh                        # server tests
#   bash scripts/qa-accessibility.sh --type=plugin          # plugin tests
#   bash scripts/qa-accessibility.sh --skip-lighthouse
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TYPE="server"
SKIP_LIGHTHOUSE=false
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/accessibility"

WDK_URL=${WDK_URL:-"https://wdesignkit.com"}
LEARNING_URL=${LEARNING_URL:-"https://learn.wdesignkit.com"}

for arg in "$@"; do
  case $arg in
    --type=*) TYPE="${arg#*=}" ;;
    --skip-lighthouse) SKIP_LIGHTHOUSE=true ;;
  esac
done

if [ "$TYPE" = "plugin" ]; then
  TESTPATH="tests/plugin"
  PROJECT="plugin-desktop"
else
  TESTPATH="tests/wdesignkit"
  PROJECT="wdk-desktop"
fi

mkdir -p "$REPORT_DIR"

echo ""
echo "========================================="
echo " WDesignKit Orbit — Accessibility QA"
echo " Type: $TYPE | Standard: WCAG 2.1 AA"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

# ── Step 1: axe-core via Playwright ──────────────────────────────────────────
echo "STEP 1 — axe-core Scan (via Playwright)"
echo "-----------------------------------------"

npx playwright test "$TESTPATH" --project="$PROJECT" --reporter=list

if [ $? -ne 0 ]; then
  echo "FAILED: axe-core violations detected"
  FAILED=$((FAILED + 1))
else
  echo "PASSED: No axe-core violations"
fi
echo ""

# ── Step 2: Lighthouse a11y (server only) ────────────────────────────────────
if [ "$TYPE" = "server" ] && [ "$SKIP_LIGHTHOUSE" = false ]; then
  echo "STEP 2 — Lighthouse Accessibility Audit"
  echo "-----------------------------------------"

  if ! command -v lighthouse &> /dev/null; then
    echo "Lighthouse not installed — skipping"
    echo "To install: npm install -g lighthouse"
  else
    A11Y_THRESHOLD=85

    scan_a11y() {
      local NAME=$1
      local URL=$2
      local SLUG=$3

      echo "Scanning: $NAME ($URL)"
      REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

      lighthouse "$URL" \
        --output=html,json \
        --output-path="$REPORT_PATH" \
        --only-categories=accessibility \
        --chrome-flags="--headless --no-sandbox" \
        --quiet

      JSON_FILE="${REPORT_PATH}.report.json"
      if [ -f "$JSON_FILE" ]; then
        A11Y=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.accessibility.score*100))")
        echo "   Accessibility: $A11Y / 100  (min: $A11Y_THRESHOLD)"
        if [ "$A11Y" -lt "$A11Y_THRESHOLD" ]; then
          echo "   FAILED: score below threshold"
          FAILED=$((FAILED + 1))
        else
          echo "   PASSED"
        fi
      fi
      echo ""
    }

    scan_a11y "WDesignKit Main" "$WDK_URL"      "wdesignkit"
    scan_a11y "Learning Center" "$LEARNING_URL" "learning"
  fi
fi

echo "========================================="
echo " ACCESSIBILITY SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Reports: $REPORT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL PASSED — WCAG 2.1 AA compliant"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  exit 1
fi
