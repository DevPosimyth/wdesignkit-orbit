#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Lighthouse Performance Scanner
# Scans: wdesignkit.com· learn.wdesignkit.com
# Usage: bash scripts/lighthouse.sh
# =============================================================================

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# URLs to scan
WDK_URL=${WDK_URL:-"https://wdesignkit.com"}
LEARNING_URL=${LEARNING_URL:-"https://learn.wdesignkit.com"}

# Output directory
REPORT_DIR="reports/lighthouse"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Thresholds
PERF_THRESHOLD=75
A11Y_THRESHOLD=85
SEO_THRESHOLD=80
BP_THRESHOLD=80

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "WDesignKit Orbit — Lighthouse Scanner"
echo "========================================="
echo "Started: $TIMESTAMP"
echo ""

# Check lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
  echo "Lighthouse not installed."
  echo "Run: npm install -g lighthouse"
  exit 1
fi

mkdir -p "$REPORT_DIR"

# ── Function to run lighthouse on a URL ───────────────────────────────────────
run_lighthouse() {
  local NAME=$1
  local URL=$2
  local SLUG=$3

  echo "Scanning: $NAME"
  echo "   URL: $URL"

  REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

  lighthouse "$URL" \
    --output=html,json \
    --output-path="$REPORT_PATH" \
    --chrome-flags="--headless --no-sandbox" \
    --quiet

  JSON_FILE="${REPORT_PATH}.report.json"

  if [ -f "$JSON_FILE" ]; then
    PERF=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.performance.score*100))")
    A11Y=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.accessibility.score*100))")
    SEO=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.seo.score*100))")
    BP=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories['best-practices'].score*100))")

    echo ""
    echo "   Results for $NAME:"
    echo "   Performance:    $PERF / 100  (min: $PERF_THRESHOLD)"
    echo "   Accessibility:  $A11Y / 100  (min: $A11Y_THRESHOLD)"
    echo "   SEO:            $SEO / 100   (min: $SEO_THRESHOLD)"
    echo "   Best Practices: $BP / 100    (min: $BP_THRESHOLD)"
    echo "   Report: ${REPORT_PATH}.report.html"
  else
    echo "   Could not parse scores — check report manually"
  fi

  echo ""
}

# ── Run scans ─────────────────────────────────────────────────────────────────
run_lighthouse "WDesignKit Main"      "$WDK_URL"      "wdesignkit"
run_lighthouse "WDesignKit Learning"  "$LEARNING_URL" "learning"

echo "========================================="
echo "Lighthouse scans complete"
echo "All reports saved to: $REPORT_DIR"
echo ""