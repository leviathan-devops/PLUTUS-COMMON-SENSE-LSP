# SHIP MANIFEST — plutus-lsp-r19

Version: r19 (the round-19 audit round; the r11..r18 hardening drive + the derailment suite).
Source path: `/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP`
Deployment fingerprint (bundle): `3307a3b7a14d6f4b` (41,046 bytes).

## Per-artifact SHA table (path | KB | SHA-16 — of the PACKAGED files)

| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |

## Source stats

- ts files (src+scripts, packaged): 5
- md files (packaged): 284+
- battery: 46 pass / 0 fail / 158 expects (re-run this turn)
- checkpoints carried: 8 (PCSL-v0.1 .. PCSL-v0.8, each with its manifest)

## Test-results summary

- UNIT/SCRIPT: 46/0/158 (`bun test tests/`).
- LIVE: 4 selftests SELFTEST OK (store 11, judge 13, cards 13, script 13 cards).
- CONTAINER: pressure 7/7 PASS; derailment suite 6/6 PASS (live judge).
- AUDIT: r19 FAIL (0 critical, 5 high) — NO SHIP-READY CLAIM (the verdict outranks every deadline).

## Package contents

dist/ (the bundle) · src/ · scripts/ · tests/ · context_management/ (11) · ship_docs/ (6) ·
reports/ · Checkpoints/ (8) · artifacts/ (the r19 audit JSON) · .omp/ (both results JSONs) ·
packages/ · forensic/ · lsp.json · BUILD_REPORT.md · DEBUG_LOG.md · FULL_BUILD_CONTEXT.md ·
SHIP_MANIFEST.md · DEPLOY.sh · README.md · MASTER_INDEX.md · PACKAGE_AUDIT.md · GIT_HISTORY.md ·
boilerplate/ (production modules + agent surface + manifest).
