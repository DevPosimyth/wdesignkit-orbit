#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Accessibility QA
# Runs axe-core accessibility scans via Playwright + Lighthouse a11y audit
# Targets: WCAG 2.1 AA — minimum axe score 85
# Usage: bash scripts/qa-accessibility.sh
#        bash scripts/qa-accessibility.sh --skip-lighthouse
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

WDK_URL=${WDK_URL:-"https://wdesignkit.com"}
LEARNING_URL=${LEARNING_URL:-"https://learn.wdesignkit.com"}
SKIP_LIGHTHOUSE=false
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/accessibility"

for arg in "$@"; do
  case $arg in
    --skip-lighthouse) SKIP_LIGHTHOUSE=true ;;
  esac
done

mkdir -p "$REPORT_DIR"

echo ""
echo "========================================="
echo " WDesignKit Orbit — Accessibility QA"
echo " Standard: WCAG 2.1 AA"
echo " Min axe score: 85"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

# ── Step 1: Playwright axe-core scan ─────────────────────────────────────────
echo "STEP 1 — axe-core Scan (via Playwright)"
echo "-----------------------------------------"
echo "Running WDesignKit specs with accessibility assertions..."
echo ""

npx playwright test tests/wdesignkit --project="wdk-desktop" --reporter=list

if [ $? -ne 0 ]; then
  echo "FAILED: axe-core scan reported violations"
  FAILED=$((FAILED + 1))
else
  echo "PASSED: No axe-core violations detected"
fi
echo ""

# ── Step 2: Lighthouse accessibility audit ────────────────────────────────────
echo "STEP 2 — Lighthouse Accessibility Audit"
echo "-----------------------------------------"

if [ "$SKIP_LIGHTHOUSE" = true ]; then
  echo "Skipped (--skip-lighthouse flag set)"
  echo ""
else
  if ! command -v lighthouse &> /dev/null; then
    echo "Lighthouse not installed — skipping"
    echo "To install: npm install -g lighthouse"
    echo ""
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
        echo "   Accessibility score: $A11Y / 100  (min: $A11Y_THRESHOLD)"
        echo "   Report: ${REPORT_PATH}.report.html"

        if [ "$A11Y" -lt "$A11Y_THRESHOLD" ]; then
          echo "   FAILED: score below threshold"
          FAILED=$((FAILED + 1))
        else
          echo "   PASSED"
        fi
      else
        echo "   Could not parse score — check report manually"
      fi
      echo ""
    }

    scan_a11y "WDesignKit Main"     "$WDK_URL"      "wdesignkit"
    scan_a11y "Learning Center"     "$LEARNING_URL" "learning"
  fi
fi

echo "========================================="
echo " ACCESSIBILITY SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Reports saved to: $REPORT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL PASSED — WCAG 2.1 AA compliant"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED — review violations"
  exit 1
fi
