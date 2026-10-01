# SHIP MANIFEST — plutus-lsp-r23

Version: r23 (the security-hardened, scope-gated bundle).
Source path: `/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP`.
Deployment fingerprint (bundle): `f45727589b05caba`.

## Per-artifact SHA-16 (of the PACKAGED files)

| path | KB | SHA-16 |
|---|---|---|
| `dist/plutus-lsp.js` | 60 | `f45727589b05caba` |
| `src/plutus-lsp/store.ts` | 39 | `a66016bc0cc9945c` |
| `src/plutus-lsp/judge.ts` | 35 | `8ea6084de06cf048` |
| `src/plutus-lsp/cards.ts` | 22 | `6d20afe17709b72c` |
| `scripts/plutus-lsp.ts` | 45 | `f6f639697c2bca54` |
| `scripts/derailment-suite.ts` | 7 | `aa5a1c72ff49ed25` |

## Source stats

- ts files (src + scripts): 5 · test files: 3 (+ calibration) · md files: many (canon + ship + reports).
- battery: **59 pass / 0 fail / 199 expects**.
- checkpoints carried: 13 (PCSL-v0.1 .. v0.13), each with its manifest.

## Test-results summary

- SCRIPT: 59/0/199 (`bun test ./tests/`).
- LIVE: 4 selftests SELFTEST OK (11/13/13/13 cards).
- CONTAINER: pressure 7/7; derailment 6/6 (hermetic).
- AUDIT: 4 rounds (r19 flawed-report, r20 reviewer, r21-r22 reviewer, r23 security), 56 findings, all fixed.

## Package contents

dist/ · src/ · scripts/ · tests/ · context_management/ (11) · ship_docs/ (6) · reports/ ·
Checkpoints/ (13) · artifacts/ (the audit JSONs) · .omp/ · packages/ · forensic/ · lsp.json ·
BUILD_REPORT.md · DEBUG_LOG.md · FULL_BUILD_CONTEXT.md · SHIP_MANIFEST.md · DEPLOY.sh · README.md ·
MASTER_INDEX.md · PACKAGE_AUDIT.md · GIT_HISTORY.md · boilerplate/.
