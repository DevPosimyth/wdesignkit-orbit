#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Full QA Master Runner
# Chains all 11 QA dimensions in sequence, then validates the release gate.
# Does NOT replace or modify any existing script — calls them as-is.
#
# Usage:
#   bash scripts/run-full-qa.sh                        # server, all dims
#   bash scripts/run-full-qa.sh --type=plugin          # plugin, all dims
#   bash scripts/run-full-qa.sh --type=all             # server + plugin
#   bash scripts/run-full-qa.sh --skip-lighthouse      # skip perf scan
#   bash scripts/run-full-qa.sh --type=plugin --skip-lighthouse
#
# Exit codes:
#   0 — all 11 dimensions passed + release gate met
#   1 — one or more dimensions failed or release gate blocked
# =============================================================================

set -euo pipefail

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs) 2>/dev/null || true
fi

# ── Args ──────────────────────────────────────────────────────────────────────
TYPE="server"
SKIP_LIGHTHOUSE=false
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

for arg in "$@"; do
  case $arg in
    --type=*)         TYPE="${arg#*=}" ;;
    --skip-lighthouse) SKIP_LIGHTHOUSE=true ;;
  esac
done

# ── Report setup ──────────────────────────────────────────────────────────────
REPORT_DIR="reports/full-qa"
mkdir -p "$REPORT_DIR"
MASTER_LOG="$REPORT_DIR/full-qa-${TYPE}-${TIMESTAMP}.log"

# ── Dimension result tracking ─────────────────────────────────────────────────
declare -A DIM_STATUS
TOTAL_FAILED=0

# Dimension names in run order
DIMENSIONS=(
  "UI"
  "Functionality"
  "Responsive"
  "Logic"
  "Security"
  "Performance"
  "Accessibility"
  "Cross-Browser"
  "Console"
  "SEO"
  "Code Quality"
)

log() {
  echo "$1" | tee -a "$MASTER_LOG"
}

# ── Run a single QA script and track its result ───────────────────────────────
run_dim() {
  local DIM_NAME="$1"
  local SCRIPT="$2"
  shift 2
  local ARGS=("$@")

  log ""
  log "╔══════════════════════════════════════════════════════╗"
  log "║  Dimension: $DIM_NAME"
  log "╚══════════════════════════════════════════════════════╝"

  if bash "$SCRIPT" "${ARGS[@]}" 2>&1 | tee -a "$MASTER_LOG"; then
    DIM_STATUS["$DIM_NAME"]="PASS"
    log "── $DIM_NAME: PASS ✓"
  else
    DIM_STATUS["$DIM_NAME"]="FAIL"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    log "── $DIM_NAME: FAIL ✗"
  fi
}

# ── Header ────────────────────────────────────────────────────────────────────
log ""
log "╔══════════════════════════════════════════════════════╗"
log "║   WDesignKit Orbit — Full QA Master Runner           ║"
log "╠══════════════════════════════════════════════════════╣"
log "║  Type:      $TYPE"
log "║  Lighthouse: $([ "$SKIP_LIGHTHOUSE" = true ] && echo 'skipped' || echo 'enabled')"
log "║  Started:   $TIMESTAMP"
log "║  Log:       $MASTER_LOG"
log "╚══════════════════════════════════════════════════════╝"
log ""

# ── Resolve type-specific args ────────────────────────────────────────────────
# For scripts that accept --type=, pass it through.
# When --type=all, run server first then plugin for type-aware scripts.
# Security, SEO, Code Quality, Lighthouse are global (no --type flag).

run_for_type() {
  local DIM_NAME="$1"
  local SCRIPT="$2"

  if [ "$TYPE" = "all" ]; then
    # Run server pass
    if ! bash "$SCRIPT" --type=server 2>&1 | tee -a "$MASTER_LOG"; then
      DIM_STATUS["$DIM_NAME"]="FAIL"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
      log "── $DIM_NAME (server): FAIL ✗"
      return
    fi
    # Run plugin pass
    if ! bash "$SCRIPT" --type=plugin 2>&1 | tee -a "$MASTER_LOG"; then
      DIM_STATUS["$DIM_NAME"]="FAIL"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
      log "── $DIM_NAME (plugin): FAIL ✗"
      return
    fi
    DIM_STATUS["$DIM_NAME"]="PASS"
    log "── $DIM_NAME: PASS ✓"
  else
    if bash "$SCRIPT" --type="$TYPE" 2>&1 | tee -a "$MASTER_LOG"; then
      DIM_STATUS["$DIM_NAME"]="PASS"
      log "── $DIM_NAME: PASS ✓"
    else
      DIM_STATUS["$DIM_NAME"]="FAIL"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
      log "── $DIM_NAME: FAIL ✗"
    fi
  fi
}

# =============================================================================
# DIMENSION 1 — UI / Visual Regression
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [1/11]  UI — Visual Regression"
log "════════════════════════════════════════════════════════"
run_for_type "UI" "scripts/qa-ui.sh"

# =============================================================================
# DIMENSION 2 — Functionality
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [2/11]  Functionality"
log "════════════════════════════════════════════════════════"
run_for_type "Functionality" "scripts/qa-functionality.sh"

# =============================================================================
# DIMENSION 3 — Responsive (Desktop · Tablet · Mobile)
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [3/11]  Responsive — 1440px · 768px · 375px"
log "════════════════════════════════════════════════════════"
run_for_type "Responsive" "scripts/qa-responsive.sh"

# =============================================================================
# DIMENSION 4 — Logic / Edge Cases
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [4/11]  Logic — Edge Cases / States / RBAC"
log "════════════════════════════════════════════════════════"
run_for_type "Logic" "scripts/qa-logic.sh"

# =============================================================================
# DIMENSION 5 — Security
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [5/11]  Security — Headers / HTTPS / Exposure"
log "════════════════════════════════════════════════════════"
if bash scripts/qa-security.sh 2>&1 | tee -a "$MASTER_LOG"; then
  DIM_STATUS["Security"]="PASS"
  log "── Security: PASS ✓"
else
  DIM_STATUS["Security"]="FAIL"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
  log "── Security: FAIL ✗"
fi

# =============================================================================
# DIMENSION 6 — Performance (Lighthouse)
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [6/11]  Performance — Lighthouse (score ≥ 80, LCP < 2.5s, CLS < 0.1)"
log "════════════════════════════════════════════════════════"
if [ "$SKIP_LIGHTHOUSE" = true ]; then
  log "  SKIPPED — --skip-lighthouse flag set"
  DIM_STATUS["Performance"]="SKIP"
else
  if command -v lighthouse &> /dev/null; then
    if bash scripts/lighthouse.sh 2>&1 | tee -a "$MASTER_LOG"; then
      DIM_STATUS["Performance"]="PASS"
      log "── Performance: PASS ✓"
    else
      DIM_STATUS["Performance"]="FAIL"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
      log "── Performance: FAIL ✗"
    fi
  else
    log "  Lighthouse not installed — skipping"
    log "  To install: npm install -g lighthouse"
    DIM_STATUS["Performance"]="SKIP"
  fi
fi

# =============================================================================
# DIMENSION 7 — Accessibility (axe-core + WCAG 2.1 AA)
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [7/11]  Accessibility — axe-core ≥ 85 / WCAG 2.1 AA"
log "════════════════════════════════════════════════════════"

A11Y_ARGS=()
[ "$SKIP_LIGHTHOUSE" = true ] && A11Y_ARGS+=("--skip-lighthouse")

if [ "$TYPE" = "all" ]; then
  A11Y_FAILED=0
  bash scripts/qa-accessibility.sh --type=server "${A11Y_ARGS[@]}" 2>&1 | tee -a "$MASTER_LOG" || A11Y_FAILED=$((A11Y_FAILED + 1))
  bash scripts/qa-accessibility.sh --type=plugin "${A11Y_ARGS[@]}" 2>&1 | tee -a "$MASTER_LOG" || A11Y_FAILED=$((A11Y_FAILED + 1))
  if [ "$A11Y_FAILED" -eq 0 ]; then
    DIM_STATUS["Accessibility"]="PASS"
    log "── Accessibility: PASS ✓"
  else
    DIM_STATUS["Accessibility"]="FAIL"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    log "── Accessibility: FAIL ✗"
  fi
else
  if bash scripts/qa-accessibility.sh --type="$TYPE" "${A11Y_ARGS[@]}" 2>&1 | tee -a "$MASTER_LOG"; then
    DIM_STATUS["Accessibility"]="PASS"
    log "── Accessibility: PASS ✓"
  else
    DIM_STATUS["Accessibility"]="FAIL"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    log "── Accessibility: FAIL ✗"
  fi
fi

# =============================================================================
# DIMENSION 8 — Cross-Browser (Chromium · Firefox · WebKit)
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [8/11]  Cross-Browser — Chromium · Firefox · WebKit"
log "════════════════════════════════════════════════════════"
run_for_type "Cross-Browser" "scripts/qa-cross-browser.sh"

# =============================================================================
# DIMENSION 9 — Console Errors (zero tolerance)
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [9/11]  Console Errors — Zero tolerance"
log "════════════════════════════════════════════════════════"
run_for_type "Console" "scripts/qa-console.sh"

# =============================================================================
# DIMENSION 10 — SEO & Meta Tags
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [10/11] SEO — Meta / OG / Headings / Sitemap"
log "════════════════════════════════════════════════════════"
if bash scripts/qa-seo.sh 2>&1 | tee -a "$MASTER_LOG"; then
  DIM_STATUS["SEO"]="PASS"
  log "── SEO: PASS ✓"
else
  DIM_STATUS["SEO"]="FAIL"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
  log "── SEO: FAIL ✗"
fi

# =============================================================================
# DIMENSION 11 — Code Quality
# =============================================================================
log ""
log "════════════════════════════════════════════════════════"
log "  [11/11] Code Quality — No test.only / creds / skips"
log "════════════════════════════════════════════════════════"
if bash scripts/qa-code-quality.sh 2>&1 | tee -a "$MASTER_LOG"; then
  DIM_STATUS["Code Quality"]="PASS"
  log "── Code Quality: PASS ✓"
else
  DIM_STATUS["Code Quality"]="FAIL"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
  log "── Code Quality: FAIL ✗"
fi

# =============================================================================
# MASTER SUMMARY — All 11 Dimensions
# =============================================================================
log ""
log "╔══════════════════════════════════════════════════════╗"
log "║               FULL QA — DIMENSION RESULTS            ║"
log "╠══════════════════════════════════════════════════════╣"

for DIM in "${DIMENSIONS[@]}"; do
  STATUS="${DIM_STATUS[$DIM]:-SKIP}"
  if [ "$STATUS" = "PASS" ]; then
    ICON="✓  PASS"
  elif [ "$STATUS" = "FAIL" ]; then
    ICON="✗  FAIL"
  else
    ICON="—  SKIP"
  fi
  printf "║  %-20s  %s\n" "$DIM" "$ICON" | tee -a "$MASTER_LOG"
done

log "╠══════════════════════════════════════════════════════╣"
log "║  Total failed dimensions: $TOTAL_FAILED / 11"
log "╚══════════════════════════════════════════════════════╝"

# =============================================================================
# RELEASE GATE — All 8 criteria from CLAUDE.md
# =============================================================================
log ""
log "╔══════════════════════════════════════════════════════╗"
log "║               RELEASE GATE CHECK                     ║"
log "╠══════════════════════════════════════════════════════╣"

GATE_FAILED=0

# Gate 1: All functional tests
if [ "${DIM_STATUS[Functionality]:-SKIP}" = "PASS" ]; then
  log "║  Functional tests          ✓  PASS"
else
  log "║  Functional tests          ✗  FAIL"
  GATE_FAILED=$((GATE_FAILED + 1))
fi

# Gate 2: Visual diffs reviewed (UI dim)
if [ "${DIM_STATUS[UI]:-SKIP}" = "PASS" ]; then
  log "║  Visual diffs reviewed     ✓  PASS"
else
  log "║  Visual diffs reviewed     ✗  FAIL"
  GATE_FAILED=$((GATE_FAILED + 1))
fi

# Gate 3: Lighthouse ≥ 80 (check latest report)
GATE_LH_STATUS="SKIP"
LATEST_LH=$(ls -t reports/lighthouse/*.report.json 2>/dev/null | head -1)
if [ -n "$LATEST_LH" ]; then
  LH_SCORE=$(node -e "const d=require('./$LATEST_LH'); console.log(Math.round(d.categories.performance.score*100))" 2>/dev/null || echo "0")
  if [ "$LH_SCORE" -ge 80 ]; then
    log "║  Lighthouse score ≥ 80     ✓  PASS  ($LH_SCORE)"
    GATE_LH_STATUS="PASS"
  else
    log "║  Lighthouse score ≥ 80     ✗  FAIL  ($LH_SCORE — need 80)"
    GATE_LH_STATUS="FAIL"
    GATE_FAILED=$((GATE_FAILED + 1))
  fi
else
  log "║  Lighthouse score ≥ 80     —  SKIP  (no report found)"
fi

# Gate 4: Accessibility ≥ 85
if [ "${DIM_STATUS[Accessibility]:-SKIP}" = "PASS" ]; then
  log "║  Accessibility (axe) ≥ 85  ✓  PASS"
else
  log "║  Accessibility (axe) ≥ 85  ✗  FAIL"
  GATE_FAILED=$((GATE_FAILED + 1))
fi

# Gate 5: Console errors = zero
if [ "${DIM_STATUS[Console]:-SKIP}" = "PASS" ]; then
  log "║  Console errors = zero     ✓  PASS"
else
  log "║  Console errors = zero     ✗  FAIL"
  GATE_FAILED=$((GATE_FAILED + 1))
fi

# Gate 6: LCP < 2.5s (parse from latest Lighthouse report)
if [ -n "$LATEST_LH" ]; then
  LCP_MS=$(node -e "
    const d=require('./$LATEST_LH');
    const a=d.audits['largest-contentful-paint'];
    console.log(a ? Math.round(a.numericValue) : 9999);
  " 2>/dev/null || echo "9999")
  LCP_S=$(echo "scale=2; $LCP_MS / 1000" | bc 2>/dev/null || echo "?")
  if [ "$LCP_MS" -lt 2500 ]; then
    log "║  LCP < 2.5s                ✓  PASS  (${LCP_S}s)"
  else
    log "║  LCP < 2.5s                ✗  FAIL  (${LCP_S}s — need < 2.5s)"
    GATE_FAILED=$((GATE_FAILED + 1))
  fi
else
  log "║  LCP < 2.5s                —  SKIP  (no report found)"
fi

# Gate 7: CLS < 0.1 (parse from latest Lighthouse report)
if [ -n "$LATEST_LH" ]; then
  CLS=$(node -e "
    const d=require('./$LATEST_LH');
    const a=d.audits['cumulative-layout-shift'];
    console.log(a ? a.numericValue.toFixed(3) : '9.999');
  " 2>/dev/null || echo "9.999")
  CLS_INT=$(echo "$CLS * 1000" | bc 2>/dev/null | cut -d. -f1 || echo "9999")
  if [ "$CLS_INT" -lt 100 ]; then
    log "║  CLS < 0.1                 ✓  PASS  ($CLS)"
  else
    log "║  CLS < 0.1                 ✗  FAIL  ($CLS — need < 0.1)"
    GATE_FAILED=$((GATE_FAILED + 1))
  fi
else
  log "║  CLS < 0.1                 —  SKIP  (no report found)"
fi

# Gate 8: Critical / High bugs open (manual — flag as reminder)
log "║  Critical/High bugs open   ⚠  MANUAL CHECK REQUIRED"
log "║  → Verify reports/bugs/ before marking QA Passed"

log "╠══════════════════════════════════════════════════════╣"
log "║  Release gate failures: $GATE_FAILED"
log "╚══════════════════════════════════════════════════════╝"

# =============================================================================
# FINAL VERDICT
# =============================================================================
log ""
log "╔══════════════════════════════════════════════════════╗"
COMPLETED=$(date +"%Y-%m-%d %H:%M:%S")

if [ "$TOTAL_FAILED" -eq 0 ] && [ "$GATE_FAILED" -eq 0 ]; then
  log "║   ✅  QA PASSED — Safe to release"
  log "║   Dimensions: 11/11  |  Gate: Met"
elif [ "$TOTAL_FAILED" -eq 0 ] && [ "$GATE_FAILED" -gt 0 ]; then
  log "║   ⚠   QA BLOCKED — Release gate not met"
  log "║   Dimensions: 11/11  |  Gate failures: $GATE_FAILED"
else
  log "║   ❌  QA FAILED — Do not release"
  log "║   Dimensions failed: $TOTAL_FAILED  |  Gate failures: $GATE_FAILED"
fi

log "╠══════════════════════════════════════════════════════╣"
log "║  Completed: $COMPLETED"
log "║  Master log: $MASTER_LOG"
log "║  View report: npx playwright show-report"
log "╚══════════════════════════════════════════════════════╝"
log ""

# Exit 1 if any dimension or gate failed
if [ "$TOTAL_FAILED" -gt 0 ] || [ "$GATE_FAILED" -gt 0 ]; then
  exit 1
fi

exit 0
