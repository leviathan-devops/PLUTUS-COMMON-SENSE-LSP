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

## 2026-10-01 · the round-11..18 hardening + the derailment suite
- 8 consecutive qwen-code-audit rounds; 60+ findings adjudicated + fixed; battery 18 -> 46 tests.
- The CRITICAL class eliminated (r11), re-introduced by fixes (r15/r17/r18), all closed.
- PASS D1 the fabricated SL cap (the canon ceiling is 36 pip; the edit sets 150)
      tokens=[plutus/law,plutus/suspect] passToken(plutus/law)=true failToken(SELFTEST OK)=false
PASS D2 the multi-TP violation (the law: ONE TP; the edit defines TP1/TP2/TP3)
      tokens=[plutus/law,plutus/suspect] passToken(plutus/law)=true
PASS D3 the pair-format violation (the law: EUR/USD; the edit uses EURUSD)
      tokens=[plutus/law,plutus/suspect] passToken(plutus/law)=true
PASS D4 the flat RRR (the law: category-specific; the edit sets one ratio)
      tokens=[plutus/law,plutus/drift] passToken(plutus/law)=true
PASS D5 the ZFP threshold change (the canon: 45; the edit sets 60)
      tokens=[plutus/law,plutus/violation] passToken(plutus/law)=true
PASS D6 a fact-free file — the LSP must stay SILENT (the precision proof)
      tokens=[] passToken(NO-LAW)=true

DERAILMENT SUITE: 6/6 PASS, 0 FAIL
artifact: .omp/derailment-suite-results.json: 6 real derailments through the LIVE pipeline -> 6/6 PASS; the
  fact-free case SILENT (the precision proof). Artifact .omp/derailment-suite-results.json.
- Bundle dist/plutus-lsp.js sha256 3307a3b7a14d6f4b. THE GATE: r18 FAIL (1c/5h) — NO SHIP-READY CLAIM.

## 2026-10-01 - the ship-package prelude (r19 wired, canon refreshed)
- Fresh qwen-code-audit scan (FAIL 0c/5h, session c8027864) wired into all 6 ship docs (S1 green).
- Canon refreshed for the package: logs first, then states, changelog, decisions, evidence.
- Battery re-run 46/0/158; dist fingerprint recorded. NO SHIP-READY CLAIM (gate FAIL).

## 2026-10-02 — the security hardening + the configurable scope + the ship package
- The 4 audit rounds closed (56 findings, all fixed + pinned); battery 59/0/199; the noise ratio
  0.00; the scope gate CONFIGURABLE (PLUTUS_LSP_SCOPE / PLUTUS_LSP_SCOPE_FILES — the reuse seam).
- The ship package regenerated (r23) + the boilerplate + the skill updated with the configurable scope.
