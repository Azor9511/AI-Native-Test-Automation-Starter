#!/usr/bin/env bash
#
# verify-environment.sh — Environment validation for Lab 0
# AI-Native Test Automation Engineering — Starter Kit v1
#
# This script is READ-ONLY. It does not install software, modify Git
# config, change PATH or shell profiles, request credentials, or alter
# any security settings. It only checks and reports.
#
# Usage:  ./scripts/verify-environment.sh
#         bash scripts/verify-environment.sh
#
# Exit code: 0 = READY, 1 = ACTION REQUIRED (usable by CI/automation).

PASS=0
WARN=0
FAIL=0
TIMEOUT=10

pass() { echo "[PASS] $1"; PASS=$((PASS + 1)); }
warn() { echo "[WARN] $1"; WARN=$((WARN + 1)); }
fail() { echo "[FAIL] $1"; FAIL=$((FAIL + 1)); }

# Check an HTTPS endpoint is reachable. Uses curl with a hard timeout
# and retries with GET, because some endpoints reject HEAD requests.
# $1 = URL, $2 = display name, $3 = "required" | "optional"
check_url() {
    if ! command -v curl >/dev/null 2>&1; then
        warn "curl not found — cannot check $2 connectivity"
        return
    fi
    # -s silent, -L follow redirects, -o discard body, -I HEAD request,
    # --fail treat HTTP >= 400 as an error, --max-time hard timeout
    if curl -sL -o /dev/null -I --fail --max-time "$TIMEOUT" "$1" >/dev/null 2>&1 \
       || curl -sL -o /dev/null --fail --max-time "$TIMEOUT" "$1" >/dev/null 2>&1; then
        pass "$2 reachable"
    elif [ "$3" = "required" ]; then
        fail "$2 NOT reachable — check Internet, proxy, VPN, or firewall. See docs/troubleshooting.md"
    else
        warn "$2 NOT reachable — needed later in the course. See docs/troubleshooting.md"
    fi
}

echo "========================================"
echo "ENVIRONMENT VALIDATION — Lab 0"
echo "========================================"
echo "Timestamp : $(date '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'unknown')"
echo "OS        : $(uname -s 2>/dev/null || echo 'unknown') $(uname -r 2>/dev/null || true)"
echo "Shell     : ${SHELL:-unknown}"
echo "========================================"
echo

# --- Node.js -------------------------------------------------------------
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v 2>/dev/null)
    pass "Node.js detected: $NODE_VERSION"
    if printf '%s' "$NODE_VERSION" | grep -qE '^v[0-9]+'; then
        NODE_MAJOR=$(printf '%s' "$NODE_VERSION" | sed -E 's/^v([0-9]+).*/\1/')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            warn "Node.js $NODE_VERSION is older than the recommended LTS (v18 or newer)"
        fi
    fi
else
    fail "Node.js not found — install Node.js LTS. See docs/macos-setup.md or docs/windows-setup.md"
fi

# --- npm -----------------------------------------------------------------
if command -v npm >/dev/null 2>&1; then
    pass "npm detected: $(npm -v 2>/dev/null)"
else
    fail "npm not found — it is included with Node.js. See docs/troubleshooting.md"
fi

# --- Git -----------------------------------------------------------------
if command -v git >/dev/null 2>&1; then
    pass "Git detected: $(git --version 2>/dev/null)"
else
    fail "Git not found — install Git. See docs/troubleshooting.md"
fi

# --- Git identity ----------------------------------------------------------
if command -v git >/dev/null 2>&1; then
    GIT_NAME=$(git config --global user.name 2>/dev/null)
    GIT_EMAIL=$(git config --global user.email 2>/dev/null)
    if [ -n "$GIT_NAME" ]; then
        pass "Git user.name configured"
    else
        warn "Git user.name not configured — run: git config --global user.name \"Your Name\""
    fi
    if [ -n "$GIT_EMAIL" ]; then
        pass "Git user.email configured"
    else
        warn "Git user.email not configured — run: git config --global user.email \"you@example.com\""
    fi
fi

# --- Connectivity ----------------------------------------------------------
echo
check_url "https://github.com"          "GitHub"                    "required"
check_url "https://registry.npmjs.org"  "npm registry"              "required"
check_url "https://www.saucedemo.com"   "SauceDemo (practice app)"  "optional"
check_url "https://dummyjson.com"       "DummyJSON (practice app)"  "optional"
check_url "https://reqres.in"           "ReqRes (practice app)"     "optional"

# --- Summary ---------------------------------------------------------------
echo
echo "========================================"
echo "ENVIRONMENT VALIDATION"
echo "========================================"
echo "Passed:   $PASS"
echo "Warnings: $WARN"
echo "Failed:   $FAIL"
echo
if [ "$FAIL" -eq 0 ]; then
    echo "STATUS: READY"
    exit 0
else
    echo "STATUS: ACTION REQUIRED"
    echo "See docs/troubleshooting.md for resolution steps."
    exit 1
fi
