#!/usr/bin/env bash
# =============================================================================
# api-fuzz.sh — WDesignKit API Negative Input Tester
#
# Fires known-bad input values at a target API endpoint and reports whether
# each case is correctly rejected (4xx) or incorrectly accepted (2xx/3xx).
#
# Usage:
#   bash scripts/api-fuzz.sh --url <endpoint> --token <bearer_token> [options]
#
# Required:
#   --url     Full API endpoint URL (e.g. https://app.wdesignkit.com/api/v2/plugin/download/get)
#   --token   Bearer token for authenticated requests
#
# Options:
#   --field   Field name to fuzz (default: all fields in --payload)
#   --payload JSON template with a FUZZ placeholder where bad values go
#             Default: '{"pluginName":"FUZZ","slug":"test-widget"}'
#   --method  HTTP method (default: POST)
#   --idor-id  A valid resource ID belonging to a different user (for IDOR check)
#   --id-field Field name that holds the resource ID (default: id)
#
# Examples:
#   # Fuzz the pluginName field of the plugin download endpoint
#   bash scripts/api-fuzz.sh \
#     --url https://app.wdesignkit.com/api/v2/plugin/download/get \
#     --token "$TOKEN" \
#     --payload '{"pluginName":"FUZZ","slug":"test-widget","authorName":"Test"}'
#
#   # IDOR check — another user's widget ID
#   bash scripts/api-fuzz.sh \
#     --url https://app.wdesignkit.com/api/v2/plugin/download/get \
#     --token "$TOKEN" \
#     --idor-id 99999 \
#     --id-field id
# =============================================================================

set -euo pipefail

# ─── COLOUR OUTPUT ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

pass() { echo -e "  ${GREEN}✓ PASS${RESET}  $1"; }
fail() { echo -e "  ${RED}✗ FAIL${RESET}  $1"; FAILURES=$((FAILURES + 1)); }
info() { echo -e "  ${CYAN}ℹ${RESET}      $1"; }
header() { echo -e "\n${BOLD}${YELLOW}$1${RESET}"; }

FAILURES=0

# ─── ARG PARSING ─────────────────────────────────────────────────────────────
URL=""
TOKEN=""
METHOD="POST"
PAYLOAD='{"pluginName":"FUZZ","slug":"test-widget"}'
IDOR_ID=""
ID_FIELD="id"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)     URL="$2";     shift 2 ;;
    --token)   TOKEN="$2";   shift 2 ;;
    --method)  METHOD="$2";  shift 2 ;;
    --payload) PAYLOAD="$2"; shift 2 ;;
    --idor-id) IDOR_ID="$2"; shift 2 ;;
    --id-field) ID_FIELD="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$URL" || -z "$TOKEN" ]]; then
  echo "Usage: bash scripts/api-fuzz.sh --url <endpoint> --token <bearer_token>"
  exit 1
fi

# ─── HELPER — SEND REQUEST AND CHECK STATUS ───────────────────────────────────
# Returns HTTP status code
send_request() {
  local body="$1"
  curl -s -o /dev/null -w "%{http_code}" \
    -X "$METHOD" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --max-time 15 \
    -d "$body" \
    "$URL"
}

# Returns full response body
send_request_body() {
  local body="$1"
  curl -s \
    -X "$METHOD" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --max-time 15 \
    -d "$body" \
    "$URL"
}

check_status() {
  local label="$1"
  local body="$2"
  local status
  status=$(send_request "$body")
  if [[ "$status" =~ ^[45] ]]; then
    pass "$label → HTTP $status (rejected correctly)"
  else
    fail "$label → HTTP $status (should have been 4xx)"
  fi
}

# ─── FUZZ CASES ──────────────────────────────────────────────────────────────
echo -e "\n${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║        API Fuzz Test — WDesignKit Orbit          ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
info "Endpoint : $URL"
info "Method   : $METHOD"
info "Template : $PAYLOAD"

# ─── 1. EMPTY / MISSING VALUES ────────────────────────────────────────────────
header "1. Empty & Missing Required Fields"

EMPTY_PAYLOAD="${PAYLOAD//FUZZ/}"
check_status "Empty string for FUZZ field" "$EMPTY_PAYLOAD"

WHITESPACE_PAYLOAD="${PAYLOAD//FUZZ/   }"
check_status "Whitespace-only for FUZZ field" "$WHITESPACE_PAYLOAD"

NULL_PAYLOAD="${PAYLOAD//\"FUZZ\"/null}"
check_status "null value for FUZZ field" "$NULL_PAYLOAD"

# ─── 2. HTML / SCRIPT INJECTION ───────────────────────────────────────────────
header "2. HTML & Script Injection"

XSS1="${PAYLOAD//FUZZ/<script>alert(1)<\/script>}"
check_status "Script tag injection" "$XSS1"

XSS2="${PAYLOAD//FUZZ/<img src=x onerror=alert(1)>}"
check_status "Img onerror injection" "$XSS2"

XSS3="${PAYLOAD//FUZZ/javascript:alert(1)}"
check_status "javascript: protocol injection" "$XSS3"

HTML_TAG="${PAYLOAD//FUZZ/<b>bold<\/b>}"
check_status "HTML tag in field" "$HTML_TAG"

# ─── 3. PATH TRAVERSAL ────────────────────────────────────────────────────────
header "3. Path Traversal"

PT1="${PAYLOAD//FUZZ/..\/..\/..\/etc\/passwd}"
check_status "Unix path traversal (../)" "$PT1"

PT2="${PAYLOAD//FUZZ/%2e%2e%2f%2e%2e%2f}"
check_status "URL-encoded path traversal (%2e%2e%2f)" "$PT2"

PT3="${PAYLOAD//FUZZ/..\\\\..\\\\windows\\\\win.ini}"
check_status "Windows path traversal (..\\\\..\\\\.)" "$PT3"

# ─── 4. MAX LENGTH ────────────────────────────────────────────────────────────
header "4. Max Length / Overflow"

LONG_VAL=$(python3 -c "print('A' * 1000)")
LONG_PAYLOAD="${PAYLOAD//FUZZ/$LONG_VAL}"
check_status "1000-character string" "$LONG_PAYLOAD"

VERY_LONG=$(python3 -c "print('A' * 10000)")
VLONG_PAYLOAD="${PAYLOAD//FUZZ/$VERY_LONG}"
check_status "10000-character string" "$VLONG_PAYLOAD"

# ─── 5. SQL INJECTION PATTERNS ────────────────────────────────────────────────
header "5. SQL Injection"

SQL1="${PAYLOAD//FUZZ/' OR '1'='1}"
check_status "Classic OR injection" "$SQL1"

SQL2="${PAYLOAD//FUZZ/'; DROP TABLE users; --}"
check_status "DROP TABLE injection" "$SQL2"

SQL3="${PAYLOAD//FUZZ/1; SELECT * FROM users}"
check_status "UNION-style injection" "$SQL3"

# ─── 6. SPECIAL CHARACTERS ────────────────────────────────────────────────────
header "6. Special Characters"

SPEC1="${PAYLOAD//FUZZ/\$\{\{7*7\}\}}"
check_status "Template injection ({{7*7}})" "$SPEC1"

SPEC2="${PAYLOAD//FUZZ/\\\\x00null}"
check_status "Null byte (\\x00)" "$SPEC2"

SPEC3="${PAYLOAD//FUZZ/‮reversed}"
check_status "RTL override character (U+202E)" "$SPEC3"

# ─── 7. UNAUTHENTICATED REQUEST ───────────────────────────────────────────────
header "7. Authentication Bypass"

UNAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X "$METHOD" \
  -H "Content-Type: application/json" \
  --max-time 15 \
  -d "$PAYLOAD" \
  "$URL")

if [[ "$UNAUTH_STATUS" =~ ^(401|403)$ ]]; then
  pass "Unauthenticated request → HTTP $UNAUTH_STATUS (blocked correctly)"
else
  fail "Unauthenticated request → HTTP $UNAUTH_STATUS (should be 401 or 403)"
fi

FAKE_TOKEN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X "$METHOD" \
  -H "Authorization: Bearer fake_token_12345_invalid" \
  -H "Content-Type: application/json" \
  --max-time 15 \
  -d "$PAYLOAD" \
  "$URL")

if [[ "$FAKE_TOKEN_STATUS" =~ ^(401|403)$ ]]; then
  pass "Fake/expired token → HTTP $FAKE_TOKEN_STATUS (blocked correctly)"
else
  fail "Fake/expired token → HTTP $FAKE_TOKEN_STATUS (should be 401 or 403)"
fi

# ─── 8. IDOR CHECK ────────────────────────────────────────────────────────────
if [[ -n "$IDOR_ID" ]]; then
  header "8. IDOR — Ownership Verification"

  IDOR_PAYLOAD="${PAYLOAD//FUZZ/valid-test-name}"
  # Replace the ID field value with the other user's ID
  IDOR_BODY=$(echo "$IDOR_PAYLOAD" | sed "s/\"$ID_FIELD\":[^,}]*/\"$ID_FIELD\":$IDOR_ID/")

  IDOR_STATUS=$(send_request "$IDOR_BODY")
  if [[ "$IDOR_STATUS" =~ ^(403|404)$ ]]; then
    pass "Another user's $ID_FIELD=$IDOR_ID → HTTP $IDOR_STATUS (ownership enforced)"
  else
    fail "Another user's $ID_FIELD=$IDOR_ID → HTTP $IDOR_STATUS (IDOR — should be 403/404)"
    info "Response body:"
    send_request_body "$IDOR_BODY" | head -c 500
    echo ""
  fi
fi

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}════════════════════════════════════════════════════${RESET}"
if [[ $FAILURES -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}  ALL CHECKS PASSED — no bad inputs accepted${RESET}"
else
  echo -e "${RED}${BOLD}  $FAILURES CHECK(S) FAILED — API accepted input it should have rejected${RESET}"
  echo -e "${RED}  Review the FAIL lines above and file bugs for each.${RESET}"
fi
echo -e "${BOLD}════════════════════════════════════════════════════${RESET}\n"

exit $FAILURES
