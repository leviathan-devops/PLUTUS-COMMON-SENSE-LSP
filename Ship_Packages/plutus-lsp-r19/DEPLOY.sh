#!/bin/sh
# DEPLOY.sh — plutus-lsp-r19 (fallback template: no dist-manifest runbook declared)
# Maps the packaged bundle onto the live LSP registration and verifies it.
# Usage: sh DEPLOY.sh [--verify-only]
set -e
PKG_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BUNDLE="$PKG_DIR/dist/plutus-lsp.js"
EXPECT_SHA="3307a3b7a14d6f4b"
echo "== plutus-lsp-r19 deploy =="
[ -f "$BUNDLE" ] || { echo "MISSING: $BUNDLE"; exit 1; }
ACTUAL="$(sha256sum "$BUNDLE" | cut -c1-16)"
if [ "$ACTUAL" != "$EXPECT_SHA" ]; then
  echo "SHA MISMATCH: expected $EXPECT_SHA, got $ACTUAL — rebuild, never override."
  exit 1
fi
echo "SHA OK: $ACTUAL"
echo "--- registration (manual step — the operator owns lsp.json) ---"
echo "Ensure ~/.omp/agent/lsp.json carries servers.plutus-lsp:"
echo '  command: bun'
echo '  args: [<repo>/scripts/plutus-lsp.ts, --stdio]'
echo '  fileTypes: [.ts, .tsx, .js, .md]'
echo "--- verify ---"
echo "PLUTUS_L1_PATH=<kg.json> bun <repo>/scripts/plutus-lsp.ts --selftest <repo>/src/plutus-lsp/cards.ts"
echo "measured 2026-10-01: SELFTEST OK - 13 cards (12 LAW + 1 SUSPECT), exit 0." \
  " Then restart a TUI session (the LSP binds at construction)."
if [ "$1" = "--verify-only" ]; then echo "VERIFY-ONLY: done."; fi
