#!/bin/bash
# =============================================================================
# WDesignKit Orbit — SEO & Meta Tags QA
# Checks: title, meta description, canonical, OG tags, Twitter cards,
#         robots.txt, sitemap.xml, heading structure
# Usage: bash scripts/qa-seo.sh
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

WDK_URL=${WDK_URL:-"https://wdesignkit.com"}
LEARNING_URL=${LEARNING_URL:-"https://learn.wdesignkit.com"}
FAILED=0
WARNINGS=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/seo"

mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/seo-${TIMESTAMP}.txt"

log() { echo "$1" | tee -a "$REPORT_FILE"; }

echo ""
log "========================================="
log " WDesignKit Orbit — SEO & Meta Tags QA"
log " Started: $TIMESTAMP"
log "========================================="
log ""

check_seo() {
  local NAME=$1
  local URL=$2

  log "── $NAME ($URL) ────────────────────────"
  log ""

  PAGE=$(curl -s "$URL" 2>/dev/null)

  # ── Title tag ───────────────────────────────────────────────────────────────
  TITLE=$(echo "$PAGE" | grep -oi '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
  if [ -n "$TITLE" ]; then
    TITLE_LEN=${#TITLE}
    log "   [PASS] <title> found ($TITLE_LEN chars): $TITLE"
    if [ "$TITLE_LEN" -gt 60 ]; then
      log "   [WARN] Title exceeds 60 characters"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    log "   [FAIL] <title> tag missing"
    FAILED=$((FAILED + 1))
  fi

  # ── Meta description ────────────────────────────────────────────────────────
  META_DESC=$(echo "$PAGE" | grep -oi 'name="description"[^>]*content="[^"]*"' | grep -oi 'content="[^"]*"' | sed 's/content="//;s/"//')
  if [ -z "$META_DESC" ]; then
    META_DESC=$(echo "$PAGE" | grep -oi 'content="[^"]*"[^>]*name="description"' | grep -oi 'content="[^"]*"' | sed 's/content="//;s/"//')
  fi
  if [ -n "$META_DESC" ]; then
    DESC_LEN=${#META_DESC}
    log "   [PASS] meta description found ($DESC_LEN chars)"
    if [ "$DESC_LEN" -gt 160 ]; then
      log "   [WARN] Meta description exceeds 160 characters"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    log "   [FAIL] meta description missing"
    FAILED=$((FAILED + 1))
  fi

  # ── Canonical tag ───────────────────────────────────────────────────────────
  if echo "$PAGE" | grep -qi 'rel="canonical"'; then
    log "   [PASS] canonical tag present"
  else
    log "   [WARN] canonical tag missing"
    WARNINGS=$((WARNINGS + 1))
  fi

  # ── Open Graph tags ─────────────────────────────────────────────────────────
  for OG_TAG in "og:title" "og:description" "og:image" "og:url"; do
    if echo "$PAGE" | grep -qi "property=\"$OG_TAG\""; then
      log "   [PASS] $OG_TAG present"
    else
      log "   [WARN] $OG_TAG missing"
      WARNINGS=$((WARNINGS + 1))
    fi
  done

  # ── Twitter card tags ───────────────────────────────────────────────────────
  if echo "$PAGE" | grep -qi 'name="twitter:card"'; then
    log "   [PASS] twitter:card present"
  else
    log "   [WARN] twitter:card missing"
    WARNINGS=$((WARNINGS + 1))
  fi

  # ── H1 tag ──────────────────────────────────────────────────────────────────
  H1_COUNT=$(echo "$PAGE" | grep -oi '<h1[^>]*>' | wc -l | tr -d ' ')
  if [ "$H1_COUNT" -eq 1 ]; then
    log "   [PASS] Single <h1> tag found"
  elif [ "$H1_COUNT" -eq 0 ]; then
    log "   [FAIL] No <h1> tag found"
    FAILED=$((FAILED + 1))
  else
    log "   [WARN] Multiple <h1> tags found ($H1_COUNT) — should be exactly 1"
    WARNINGS=$((WARNINGS + 1))
  fi

  # ── robots.txt ──────────────────────────────────────────────────────────────
  ROBOTS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/robots.txt")
  if [ "$ROBOTS" = "200" ]; then
    log "   [PASS] robots.txt present"
  else
    log "   [FAIL] robots.txt missing ($ROBOTS)"
    FAILED=$((FAILED + 1))
  fi

  # ── sitemap.xml ─────────────────────────────────────────────────────────────
  SITEMAP=$(curl -s -o /dev/null -w "%{http_code}" "$URL/sitemap.xml")
  if [ "$SITEMAP" = "200" ]; then
    log "   [PASS] sitemap.xml present"
  else
    log "   [WARN] sitemap.xml not found at /sitemap.xml ($SITEMAP)"
    WARNINGS=$((WARNINGS + 1))
  fi

  log ""
}

check_seo "WDesignKit Main" "$WDK_URL"
check_seo "Learning Center" "$LEARNING_URL"

log "========================================="
log " SEO SUMMARY"
log "========================================="
log " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
log " Failures:  $FAILED"
log " Warnings:  $WARNINGS"
log " Report:    $REPORT_FILE"
log ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  log " ALL SEO CHECKS PASSED"
  exit 0
elif [ $FAILED -eq 0 ]; then
  log " PASSED with $WARNINGS warning(s) — review before release"
  exit 0
else
  log " $FAILED FAILURE(S) — fix before release"
  exit 1
fi
