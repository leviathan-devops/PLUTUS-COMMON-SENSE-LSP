# CHANGELOG — PLUTUS-COMMON-SENSE-LSP

## 2026-09-29 · the scaffold
- `feat(pcsl)` f4b9260 — the repo + the planning artifact (predicate PASS, spec-audit APPROVED 0/8)
  + the build package (DPL1, the master blueprint, the wave-plan, the goals).

## 2026-09-29 · W1–W5 (the waves)
- `feat(pcsl)` 5154527 — store.ts · judge.ts · cards.ts · scripts/plutus-lsp.ts · the lsp.json
  registration. The battery 9 pass / 0 fail. The selftest returned 2 cards + 5 live nouls.
  The receipt: PUBLISH n=3 on mirror.ts (verdict=SUSPECT).

## 2026-09-29 · W6 + P5 (the calibration + the adversarial sweep)
- `fix(pcsl)` 8260183 — the calibration found 3 REAL defects, each fixed:
  1. the generic question needed the judge to DERIVE → +OBSERVABLE templates.
  2. lawsForFile fed 12 fuzzy laws → +lawsForHunk (ranked, top-3).
  3. the matcher over-matched on generic words → +STOPWORDS.
  The battery 17 pass / 0 fail. The derived bar 0.30 (F1 0.60 · P 0.50 · R 0.75).

## 2026-09-30 · the round-9/10 fix batch + the ship-docs pass
- `fix(lsp)` 816b384 — 21 findings closed (2 CRITICAL ReferenceErrors + 10 HIGH + 9 MEDIUM/LOW).
  Battery 26 pass / 0 fail / 117 expects. Live selftests ×4 (store 11 · judge 13 · script 12 ·
  cards 13 with 1 VIOLATION MECH-TOKEN-08 P6=0.868). Bundle rebuilt (51f95e841cf6247f).
  Round-11 audit BLOCKED (:4097 refused — reported as BLOCKED, never PASS).
- `docs(ship)` — BUILD_REPORT §7 · DEBUG_LOG BUG-06..11 · TESTING_LOG round-10/11 · FAILURE_LOG
  F-04/F-05 · THEATRICALITY_LOG created (T-01..T-05, operator-caught 0).
