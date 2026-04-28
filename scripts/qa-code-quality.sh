#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Code Quality QA
# Checks: no skipped tests, no test.only left in, no console.log in specs,
#         no hardcoded credentials, version sync, dependency audit,
#         spec file coverage for all key areas
# Usage: bash scripts/qa-code-quality.sh
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

FAILED=0
WARNINGS=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/code-quality"

mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/code-quality-${TIMESTAMP}.txt"

log() { echo "$1" | tee -a "$REPORT_FILE"; }

echo ""
log "========================================="
log " WDesignKit Orbit — Code Quality QA"
log " Started: $TIMESTAMP"
log "========================================="
log ""

# ── 1. No test.only left in ───────────────────────────────────────────────────
log "── 1. Focused tests (test.only / it.only) ──"
ONLY_COUNT=$(grep -r "test\.only\|it\.only\|describe\.only" tests/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$ONLY_COUNT" -gt 0 ]; then
  log "   [FAIL] test.only / it.only found — will block other tests from running"
  grep -rn "test\.only\|it\.only\|describe\.only" tests/ 2>/dev/null | while read line; do
    log "   → $line"
  done
  FAILED=$((FAILED + 1))
else
  log "   [PASS] No focused tests found"
fi
log ""

# ── 2. No skipped tests without reason ───────────────────────────────────────
log "── 2. Skipped tests (test.skip / it.skip) ──"
SKIP_COUNT=$(grep -r "test\.skip\|it\.skip\|describe\.skip" tests/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$SKIP_COUNT" -gt 0 ]; then
  log "   [WARN] $SKIP_COUNT skipped test(s) found — verify each has a documented reason"
  grep -rn "test\.skip\|it\.skip\|describe\.skip" tests/ 2>/dev/null | while read line; do
    log "   → $line"
  done
  WARNINGS=$((WARNINGS + 1))
else
  log "   [PASS] No skipped tests found"
fi
log ""

# ── 3. No console.log in spec files ──────────────────────────────────────────
log "── 3. Debug statements (console.log) ──"
LOG_COUNT=$(grep -r "console\.log" tests/ 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
if [ "$LOG_COUNT" -gt 0 ]; then
  log "   [WARN] $LOG_COUNT console.log statement(s) found in test files"
  grep -rn "console\.log" tests/ 2>/dev/null | grep -v "node_modules" | while read line; do
    log "   → $line"
  done
  WARNINGS=$((WARNINGS + 1))
else
  log "   [PASS] No console.log statements in spec files"
fi
log ""

# ── 4. No hardcoded credentials ───────────────────────────────────────────────
log "── 4. Hardcoded credentials ──"
CRED_COUNT=$(grep -r "password\s*=\s*['\"][^'\"]\|passwd\s*=\s*['\"]" tests/ 2>/dev/null | grep -v "node_modules\|\.env\|example" | wc -l | tr -d ' ')
if [ "$CRED_COUNT" -gt 0 ]; then
  log "   [FAIL] Possible hardcoded credentials found in test files"
  FAILED=$((FAILED + 1))
else
  log "   [PASS] No hardcoded credentials detected"
fi
log ""

# ── 5. Version sync check ─────────────────────────────────────────────────────
log "── 5. Version sync (package.json) ──"
PKG_VERSION=$(node -e "console.log(require('./package.json').version)" 2>/dev/null)
if [ -n "$PKG_VERSION" ]; then
  log "   [INFO] Current version: v$PKG_VERSION"
  log "   [PASS] package.json readable"
else
  log "   [FAIL] Could not read version from package.json"
  FAILED=$((FAILED + 1))
fi
log ""

# ── 6. Spec file coverage check ───────────────────────────────────────────────
log "── 6. Spec file coverage ──"
EXPECTED_SPECS=(
  "tests/server/auth.spec.js"
  "tests/server/dashboard.spec.js"
  "tests/server/widget-builder.spec.js"
  "tests/server/homepage.spec.js"
)

for SPEC in "${EXPECTED_SPECS[@]}"; do
  if [ -f "$SPEC" ]; then
    log "   [PASS] $SPEC exists"
  else
    log "   [WARN] $SPEC not found — coverage gap"
    WARNINGS=$((WARNINGS + 1))
  fi
done
log ""

# ── 7. Dependency audit ───────────────────────────────────────────────────────
log "── 7. Dependency audit (npm audit) ──"
AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1)
AUDIT_EXIT=$?

if [ $AUDIT_EXIT -eq 0 ]; then
  log "   [PASS] No high/critical vulnerabilities found"
else
  HIGH_COUNT=$(echo "$AUDIT_OUTPUT" | grep -i "high\|critical" | wc -l | tr -d ' ')
  log "   [WARN] npm audit found $HIGH_COUNT high/critical issue(s) — run 'npm audit' for details"
  WARNINGS=$((WARNINGS + 1))
fi
log ""

# ── 8. .env not committed ─────────────────────────────────────────────────────
log "── 8. Sensitive files not tracked by git ──"
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
  log "   [FAIL] .env is tracked by git — remove immediately with: git rm --cached .env"
  FAILED=$((FAILED + 1))
else
  log "   [PASS] .env is not tracked by git"
fi

if git ls-files --error-unmatch qa.config.json > /dev/null 2>&1; then
  log "   [FAIL] qa.config.json is tracked by git — remove with: git rm --cached qa.config.json"
  FAILED=$((FAILED + 1))
else
  log "   [PASS] qa.config.json is not tracked by git"
fi
log ""

# ── Summary ───────────────────────────────────────────────────────────────────
log "========================================="
log " CODE QUALITY SUMMARY"
log "========================================="
log " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
log " Failures:  $FAILED"
log " Warnings:  $WARNINGS"
log " Report:    $REPORT_FILE"
log ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  log " ALL CODE QUALITY CHECKS PASSED"
  exit 0
elif [ $FAILED -eq 0 ]; then
  log " PASSED with $WARNINGS warning(s) — review before release"
  exit 0
else
  log " $FAILED FAILURE(S) — fix before release"
  exit 1
fi
