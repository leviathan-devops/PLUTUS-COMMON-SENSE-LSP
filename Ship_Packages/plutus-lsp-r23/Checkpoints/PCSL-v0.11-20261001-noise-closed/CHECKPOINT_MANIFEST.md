# CHECKPOINT MANIFEST — PCSL v0.11 (2026-10-01, NOISE-CLOSED)

## THE CHECKPOINT
Name: `PCSL-v0.11-20261001-noise-closed` (hyphens only, no spaces).
Date: 2026-10-01. Source HEAD at seal: `d41f96f`.

## THE DIST
`dist/plutus-lsp.js` sha256 **08800b70871e736d** — checkpoint copy SHA == project SHA (verified).

## THE STATE (what is validated — the measured ledger)
| # | the measure | the result |
|---|---|---|
| 1 | the battery | **57 pass / 0 fail / 185 expects** (5 files, pins A1-A44) |
| 2 | the derailment suite | **6/6 PASS, HERMETIC** |
| 3 | the scope gate | **7/7 correct** (Plutus IN, foreign SILENT) |
| 4 | **THE NOISE RATIO** | **0.00** (was 2.0) — `REFUSE=0 · L2=0 · PUBLISH=5` |
| 5 | the F-9 rotation | **SHRANK: true** (13107276 -> 155958 bytes) |
| 6 | the F-5 degraded card | **surfaces** (the judge-down case) |
| 7 | the F-2 pull | **answers** (no -32601) |
| 8 | the end-to-end | a Plutus file -> 13 cards (12 LAW + 1 SUSPECT), exit 0 |

## WHAT CHANGED FROM v0.10
- **THE L2 ABSENT-SOCKET CASE IS SILENT** — it is the EXPECTED state; the receipt carries only
  signal. One self-inflicted bug in this change (a `return` inside the pipeline exited the whole
  analyze) — caught by the W1 test + pinned (A36 asserts the guard never returns).
- THE NOISE MEASUREMENT: 6 real Plutus files (18 cards, avg 3.0) + 2 foreign (silent) →
  `OUT-OF-SCOPE=2 · REFUSE=0 · PUBLISH=5 · L2=0` → **0.00**.

## THE CONTENTS
- `src/ scripts/ tests/` (9 .ts) · `dist/` (the bundle) · `context_management/` (11) ·
  `ship_docs/` (6, §13 + the r22 gate) · `reports/` (the FLAW REPORT + meta + golden) ·
  `.omp/` + `artifacts/` (the r19/r21/r22 JSONs + the results).
- Verify: `sha256sum -c SHA256SUMS`. Secret pre-scan: clean.

## THE HONEST GAPS
- **THE SECOND INDEPENDENT AUDITOR (the security-reviewer probe) DID NOT REPORT within the
  time-box** (~50 min streaming, steered once). Its findings are NOT in this checkpoint. It
  remains the top open item.
- The ocr lane remains provider-down (Go 403, zen-free 429); the audit gate is satisfied by the
  host reviewer agent (same independence criterion), NOT by ocr.
- The live-TUI render proof is PENDING (needs a session restart). The calibration corpus is 8
  items. The enforcement extension PARKED (v2). The seal: NO LOCK (Mode B).
