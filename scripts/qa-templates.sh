#!/bin/bash
# =============================================================================
# WDesignKit Templates Suite — QA Runner
# Version: 1.0.0
#
# PURPOSE
#   Runs Playwright tests for all template-related specs. Supports targeted
#   modes for fast CI checks or full regression sweeps.
#
# MODES
#   --smoke         Core smoke: browse, my-templates, share, import preview
#   --import        Full import wizard flow (all 11 import specs)
#   --user          User-data pages: my-templates, save-template, share-with-me
#   --editor        Editor integration: select-template, save-template
#   --a11y          Accessibility spec only (31-templates-a11y)
#   --responsive    Responsive spec only (30-templates-responsive)
#   --console       Console & network health only (32-templates-console)
#   --security      Security spec only (33-templates-security)
#   --phase2        Phase 2 specs only (20–23)
#   --phase3        Phase 3 cross-cutting only (30–33)
#   --full          All templates specs (Phase 1 + 2 + 3) — default
#
# VIEWPORT FLAGS (combine with any mode)
#   --mobile        Run at 375px width only
#   --tablet        Run at 768px width only
#   --desktop       Run at 1440px width only (default when no viewport flag)
#
# WORKER FLAGS
#   --workers=N     Override parallel workers (default: 4)
#
# EXAMPLES
#   bash scripts/qa-templates.sh --smoke
#   bash scripts/qa-templates.sh --import --workers=2
#   bash scripts/qa-templates.sh --user --mobile
#   bash scripts/qa-templates.sh --security
#   bash scripts/qa-templates.sh --full
#   bash scripts/qa-templates.sh --phase2 --desktop
#   bash scripts/qa-templates.sh --a11y
#   bash scripts/qa-templates.sh --full --workers=6
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Load .env if present
# ---------------------------------------------------------------------------
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs) 2>/dev/null || true
fi

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
MODE="full"
PROJECT="plugin-desktop"
WORKERS=4
FAILED=0

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
for arg in "$@"; do
  case $arg in
    --smoke)      MODE="smoke"   ;;
    --import)     MODE="import"  ;;
    --user)       MODE="user"    ;;
    --editor)     MODE="editor"  ;;
    --a11y)       MODE="a11y"    ;;
    --responsive) MODE="responsive" ;;
    --console)    MODE="console"  ;;
    --security)   MODE="security" ;;
    --phase2)     MODE="phase2"   ;;
    --phase3)     MODE="phase3"   ;;
    --full)       MODE="full"     ;;
    --mobile)     PROJECT="wdk-mobile"  ;;
    --tablet)     PROJECT="wdk-tablet"  ;;
    --desktop)    PROJECT="plugin-desktop" ;;
    --workers=*)  WORKERS="${arg#*=}" ;;
  esac
done

# ---------------------------------------------------------------------------
# Spec file groups
# ---------------------------------------------------------------------------

# Phase 1 — Import wizard & browse (11 files)
PHASE1_SPECS=(
  "tests/plugin/templates/01-browse-library.spec.js"
  "tests/plugin/templates/02-filters.spec.js"
  "tests/plugin/templates/03-template-card.spec.js"
  "tests/plugin/templates/04-import-preview-step.spec.js"
  "tests/plugin/templates/05-import-feature-step.spec.js"
  "tests/plugin/templates/06-import-method-step.spec.js"
  "tests/plugin/templates/07-import-ai-step.spec.js"
  "tests/plugin/templates/08-import-loader-step.spec.js"
  "tests/plugin/templates/09-import-success-step.spec.js"
  "tests/plugin/templates/10-import-breadcrumbs.spec.js"
  "tests/plugin/templates/11-import-back-nav.spec.js"
)

# Phase 2 — User-data pages (4 files)
PHASE2_SPECS=(
  "tests/plugin/templates/20-my-templates.spec.js"
  "tests/plugin/templates/21-save-template.spec.js"
  "tests/plugin/templates/22-select-template.spec.js"
  "tests/plugin/templates/23-share-templates.spec.js"
)

# Phase 3 — Cross-cutting quality (4 files)
PHASE3_SPECS=(
  "tests/plugin/templates/30-templates-responsive.spec.js"
  "tests/plugin/templates/31-templates-a11y.spec.js"
  "tests/plugin/templates/32-templates-console.spec.js"
  "tests/plugin/templates/33-templates-security.spec.js"
)

# Smoke: browse + my-templates + share + import preview
SMOKE_SPECS=(
  "tests/plugin/templates/01-browse-library.spec.js"
  "tests/plugin/templates/03-template-card.spec.js"
  "tests/plugin/templates/04-import-preview-step.spec.js"
  "tests/plugin/templates/20-my-templates.spec.js"
  "tests/plugin/templates/23-share-templates.spec.js"
)

# Import wizard: all 8 import + breadcrumb + back-nav
IMPORT_SPECS=(
  "tests/plugin/templates/04-import-preview-step.spec.js"
  "tests/plugin/templates/05-import-feature-step.spec.js"
  "tests/plugin/templates/06-import-method-step.spec.js"
  "tests/plugin/templates/07-import-ai-step.spec.js"
  "tests/plugin/templates/08-import-loader-step.spec.js"
  "tests/plugin/templates/09-import-success-step.spec.js"
  "tests/plugin/templates/10-import-breadcrumbs.spec.js"
  "tests/plugin/templates/11-import-back-nav.spec.js"
)

# User-data: my-templates + save-template + share-with-me
USER_SPECS=(
  "tests/plugin/templates/20-my-templates.spec.js"
  "tests/plugin/templates/21-save-template.spec.js"
  "tests/plugin/templates/23-share-templates.spec.js"
)

# Editor: select-template + save-template
EDITOR_SPECS=(
  "tests/plugin/templates/21-save-template.spec.js"
  "tests/plugin/templates/22-select-template.spec.js"
)

# ---------------------------------------------------------------------------
# Select specs based on mode
# ---------------------------------------------------------------------------
case $MODE in
  smoke)     SPECS=("${SMOKE_SPECS[@]}") ;;
  import)    SPECS=("${IMPORT_SPECS[@]}") ;;
  user)      SPECS=("${USER_SPECS[@]}") ;;
  editor)    SPECS=("${EDITOR_SPECS[@]}") ;;
  a11y)      SPECS=("tests/plugin/templates/31-templates-a11y.spec.js") ;;
  responsive)SPECS=("tests/plugin/templates/30-templates-responsive.spec.js") ;;
  console)   SPECS=("tests/plugin/templates/32-templates-console.spec.js") ;;
  security)  SPECS=("tests/plugin/templates/33-templates-security.spec.js") ;;
  phase2)    SPECS=("${PHASE2_SPECS[@]}") ;;
  phase3)    SPECS=("${PHASE3_SPECS[@]}") ;;
  full)      SPECS=("${PHASE1_SPECS[@]}" "${PHASE2_SPECS[@]}" "${PHASE3_SPECS[@]}") ;;
  *)         SPECS=("${PHASE1_SPECS[@]}" "${PHASE2_SPECS[@]}" "${PHASE3_SPECS[@]}") ;;
esac

# ---------------------------------------------------------------------------
# Build spec string for Playwright
# ---------------------------------------------------------------------------
SPEC_ARGS=""
for spec in "${SPECS[@]}"; do
  SPEC_ARGS="$SPEC_ARGS $spec"
done

# ---------------------------------------------------------------------------
# Report directory
# ---------------------------------------------------------------------------
REPORT_DIR="reports/templates-${MODE}-${TIMESTAMP}"
mkdir -p "$REPORT_DIR"
mkdir -p "reports/bugs/screenshots/template-import"

# ---------------------------------------------------------------------------
# Print run summary
# ---------------------------------------------------------------------------
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   WDesignKit Templates Suite — QA Runner             ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Mode:      ${MODE}"
printf "║  Project:   %s\n" "$PROJECT"
printf "║  Workers:   %s\n" "$WORKERS"
printf "║  Specs:     %s file(s)\n" "${#SPECS[@]}"
printf "║  Started:   %s\n" "$TIMESTAMP"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Spec files:"
for spec in "${SPECS[@]}"; do
  echo "  ✓ $spec"
done
echo ""

# ---------------------------------------------------------------------------
# Run Playwright
# ---------------------------------------------------------------------------
echo "▶  Running Playwright tests..."
echo ""

npx playwright test \
  --project="$PROJECT" \
  --workers="$WORKERS" \
  --reporter=html,line \
  --output="$REPORT_DIR/results" \
  $SPEC_ARGS \
  || FAILED=$?

# ---------------------------------------------------------------------------
# Results summary
# ---------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  echo "  ✅  ALL TEMPLATES TESTS PASSED"
  echo "  Mode: $MODE | Workers: $WORKERS | Project: $PROJECT"
else
  echo "  ❌  SOME TESTS FAILED (exit: $FAILED)"
  echo "  Mode: $MODE | Workers: $WORKERS | Project: $PROJECT"
  echo ""
  echo "  View report: npx playwright show-report"
fi
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Report saved to: $REPORT_DIR"
echo ""

exit $FAILED
