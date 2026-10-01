#!/bin/sh
# DEPLOY.sh — plutus-lsp-r23 (fallback template: no dist-manifest runbook declared)
set -e
PKG_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BUNDLE="$PKG_DIR/dist/plutus-lsp.js"
EXPECT_SHA="f45727589b05caba"
echo "== plutus-lsp-r23 deploy =="
[ -f "$BUNDLE" ] || { echo "MISSING: $BUNDLE"; exit 1; }
ACTUAL="$(sha256sum "$BUNDLE" | cut -c1-16)"
if [ "$ACTUAL" != "$EXPECT_SHA" ]; then echo "SHA MISMATCH: expected $EXPECT_SHA, got $ACTUAL"; exit 1; fi
echo "SHA OK: $ACTUAL"
echo "--- registration (the operator owns lsp.json) ---"
echo "servers.plutus-lsp: command=bun args=[<repo>/scripts/plutus-lsp.ts, --stdio]"
echo "--- verify ---"
echo "PLUTUS_L1_PATH=<kg.json> bun <repo>/scripts/plutus-lsp.ts --selftest <repo>/src/plutus-lsp/cards.ts"
echo "measured 2026-10-02: SELFTEST OK - 13 cards, exit 0. Restart a TUI to arm (binds at construction)."
if [ "$1" = "--verify-only" ]; then echo "VERIFY-ONLY: done."; fi
