#!/bin/bash
# =============================================================================
# WDesignKit Orbit — Security QA
# Checks: HTTPS redirect, security headers, WordPress version exposure,
#         robots.txt, mixed content indicators
# Usage: bash scripts/qa-security.sh
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

WDK_URL=${WDK_URL:-"https://wdesignkit.com"}
LEARNING_URL=${LEARNING_URL:-"https://learn.wdesignkit.com"}
FAILED=0
WARNINGS=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/security"

mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/security-${TIMESTAMP}.txt"

log() { echo "$1" | tee -a "$REPORT_FILE"; }

echo ""
log "========================================="
log " WDesignKit Orbit — Security QA"
log " Started: $TIMESTAMP"
log "========================================="
log ""

check_site() {
  local NAME=$1
  local URL=$2

  log "── $NAME ($URL) ────────────────────────"
  log ""

  # ── HTTPS redirect ──────────────────────────────────────────────────────────
  HTTP_URL="${URL/https:/http:}"
  REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" -L --max-redirs 0 "$HTTP_URL" 2>/dev/null)
  if [ "$REDIRECT" = "301" ] || [ "$REDIRECT" = "302" ]; then
    log "   [PASS] HTTPS redirect: HTTP → HTTPS ($REDIRECT)"
  else
    log "   [FAIL] HTTPS redirect not enforced (got: $REDIRECT)"
    FAILED=$((FAILED + 1))
  fi

  # ── Security headers ────────────────────────────────────────────────────────
  HEADERS=$(curl -s -I "$URL" 2>/dev/null)

  check_header() {
    local HEADER=$1
    local LABEL=$2
    if echo "$HEADERS" | grep -qi "$HEADER"; then
      log "   [PASS] $LABEL present"
    else
      log "   [WARN] $LABEL missing"
      WARNINGS=$((WARNINGS + 1))
    fi
  }

  check_header "x-frame-options"           "X-Frame-Options"
  check_header "x-content-type-options"    "X-Content-Type-Options"
  check_header "strict-transport-security" "Strict-Transport-Security (HSTS)"
  check_header "content-security-policy"   "Content-Security-Policy"
  check_header "referrer-policy"           "Referrer-Policy"

  # ── WordPress version exposure ──────────────────────────────────────────────
  PAGE=$(curl -s "$URL" 2>/dev/null)
  if echo "$PAGE" | grep -qi 'content="WordPress [0-9]'; then
    log "   [FAIL] WordPress version exposed in meta generator tag"
    FAILED=$((FAILED + 1))
  else
    log "   [PASS] WordPress version not exposed"
  fi

  # ── robots.txt ──────────────────────────────────────────────────────────────
  ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/robots.txt")
  if [ "$ROBOTS_STATUS" = "200" ]; then
    log "   [PASS] robots.txt present ($ROBOTS_STATUS)"
  else
    log "   [WARN] robots.txt not found ($ROBOTS_STATUS)"
    WARNINGS=$((WARNINGS + 1))
  fi

  # ── Mixed content check (basic) ─────────────────────────────────────────────
  if echo "$PAGE" | grep -q 'http://'; then
    log "   [WARN] Possible mixed content — HTTP resources found in page source"
    WARNINGS=$((WARNINGS + 1))
  else
    log "   [PASS] No obvious mixed content detected"
  fi

  log ""
}

check_site "WDesignKit Main"  "$WDK_URL"
check_site "Learning Center"  "$LEARNING_URL"

log "========================================="
log " SECURITY SUMMARY"
log "========================================="
log " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
log " Failures:  $FAILED"
log " Warnings:  $WARNINGS"
log " Report:    $REPORT_FILE"
log ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  log " ALL CHECKS PASSED"
  exit 0
elif [ $FAILED -eq 0 ]; then
  log " PASSED with $WARNINGS warning(s) — review before release"
  exit 0
else
  log " $FAILED CRITICAL FAILURE(S) — fix before release"
  exit 1
fi
