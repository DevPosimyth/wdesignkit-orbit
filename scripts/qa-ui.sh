#!/bin/bash
# =============================================================================
# WDesignKit Orbit — UI QA
# Checks: Visual regression (pixel-diff snapshots), layout correctness,
#         Lighthouse best-practices score, visual consistency at desktop
#
# Usage:
#   bash scripts/qa-ui.sh                                # server, all specs
#   bash scripts/qa-ui.sh --type=plugin                  # plugin tests
#   bash scripts/qa-ui.sh --type=server --spec=auth
#   bash scripts/qa-ui.sh --update-snapshots             # approve new baselines
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TYPE="server"
SPEC="all"
UPDATE_SNAPSHOTS=false
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/ui"

for arg in "$@"; do
  case $arg in
    --type=*) TYPE="${arg#*=}" ;;
    --spec=*) SPEC="${arg#*=}" ;;
    --update-snapshots) UPDATE_SNAPSHOTS=true ;;
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

echo ""
echo "========================================="
echo " WDesignKit Orbit — UI QA"
echo " Type: $TYPE | Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Viewport: Desktop (1440px)"
echo "========================================="
echo ""

# ── Step 1: Visual Regression ─────────────────────────────────────────────────
echo "STEP 1 — Visual Regression (Snapshot Diff)"
echo "-----------------------------------------"

if [ "$UPDATE_SNAPSHOTS" = true ]; then
  echo "Mode: UPDATE BASELINES"
  npx playwright test "$TESTPATH" --project="$PROJECT" --update-snapshots --reporter=list
else
  echo "Mode: COMPARE against existing baselines"
  npx playwright test "$TESTPATH" --project="$PROJECT" --reporter=list
fi

if [ $? -ne 0 ]; then
  echo "FAILED: Visual regression diffs or errors detected"
  FAILED=$((FAILED + 1))
else
  echo "PASSED: No visual regressions"
fi
echo ""

# ── Step 2: Lighthouse Best Practices (server only) ───────────────────────────
if [ "$TYPE" = "server" ]; then
  echo "STEP 2 — Lighthouse Best Practices"
  echo "-----------------------------------------"

  WDK_URL=${WDK_URL:-"https://wdesignkit.com"}
  LEARNING_URL=${LEARNING_URL:-"https://learn.wdesignkit.com"}
  BP_THRESHOLD=80

  if ! command -v lighthouse &> /dev/null; then
    echo "Lighthouse not installed — skipping"
    echo "To install: npm install -g lighthouse"
  else
    scan_ui() {
      local NAME=$1
      local URL=$2
      local SLUG=$3

      echo "Scanning: $NAME"
      REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

      lighthouse "$URL" \
        --output=html,json \
        --output-path="$REPORT_PATH" \
        --only-categories=best-practices \
        --chrome-flags="--headless --no-sandbox" \
        --quiet

      JSON_FILE="${REPORT_PATH}.report.json"
      if [ -f "$JSON_FILE" ]; then
        BP=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories['best-practices'].score*100))")
        echo "   Best Practices: $BP / 100  (min: $BP_THRESHOLD)"
        if [ "$BP" -lt "$BP_THRESHOLD" ]; then
          echo "   FAILED: score below threshold"
          FAILED=$((FAILED + 1))
        else
          echo "   PASSED"
        fi
      fi
      echo ""
    }

    scan_ui "WDesignKit Main" "$WDK_URL"      "wdesignkit"
    scan_ui "Learning Center" "$LEARNING_URL" "learning"
  fi
fi

echo "========================================="
echo " UI SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Reports saved to: $REPORT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL UI CHECKS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
