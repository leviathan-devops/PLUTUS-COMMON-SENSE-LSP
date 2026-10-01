# CHECKPOINT MANIFEST — PCSL v0.8 (2026-10-01, HARDENED + DERAILMENT SUITE)

## THE CHECKPOINT
Name: `PCSL-v0.8-20261001-hardened-derailment-suite` (hyphens only, no spaces).
Date: 2026-10-01. Source HEAD at seal: `58c9190` (code HEAD `60635bc`).

## THE DIST
`dist/plutus-lsp.js` sha256 **3307a3b7a14d6f4b** — checkpoint copy SHA == project SHA (verified).

## THE STATE (what is validated)
- THE BATTERY: `bun test tests/` -> **46 pass / 0 fail / 158 expects** (grew 18 -> 46 over the drive).
- THE 4 LIVE SELFTESTS (real graph + live JevK5 `jevk5-4b-v0.2-Q8_0`): store 11 - judge 13 -
  cards 13 - script 13 cards. Each `SELFTEST OK`, exit 0.
- **THE DERAILMENT SUITE: 6/6 PASS** (`scripts/derailment-suite.ts`) — the objective's acceptance
  test. D1 SL-cap / D2 multi-TP / D3 pair-format / D4 flat RRR / D5 ZFP -> VIOLATION / D6 fact-free
  SILENT. Artifact `.omp/derailment-suite-results.json`.
- THE CONTAINER PRESSURE TEST: 7/7 PASS (the earlier rig) — artifact `.omp/container-test-results.json`.
- THE PROXY: `go-session-proxy.service` active; :4097/:4098/:8090 OPEN (BUG-12 restored).

## WHAT CHANGED FROM v0.7
- THE 8-ROUND AUDIT DRIVE (r11..r18): 60+ findings adjudicated + fixed; every fix pinned.
- The CRITICAL class eliminated at r11, re-introduced by fixes (r15/r17/r18), all closed.
- The derailment-pattern suite minted (the objective's behavioral proof).
- The ship docs + the 11 canon docs refreshed; THEATRICALITY_LOG T-06..T-08; FAILURE_LOG F-06/F-07.

## THE CONTENTS
- `src/ scripts/ tests/`: 9 .ts files (source + battery + the derailment suite).
- `dist/`: the bundle (SHA above).
- `context_management/`: 11 canon docs.
- `ship_docs/`: 6 ship docs (BUILD/DEBUG/FAILURE/SPEC_VIOLATION/TESTING/THEATRICALITY).
- `reports/`: CALIBRATION_v1, the CT plans/results, the engineering report v1, RELEVANCE_KERNEL,
  LIVE_TUI_SPAWN_PROOF, LSP_DEPLOYMENT_CONTRACT, P8_VERDICT, STALENESS_AUDIT.
- `.omp/`: the container pressure results + the derailment-suite results.
- `packages/`, `forensic/`, lsp.json, package.json, tsconfig.json, bunfig.toml, README, the
  planning suite. Verify: `sha256sum -c SHA256SUMS`. Secret pre-scan: clean.

## THE HONEST GAPS
- THE AUDIT GATE: r18 FAIL (1 critical, 5 high) — NO SHIP-READY CLAIM. ~19 medium/low residual
  (hunk-hot-path caching, decl regex literals, chain/relevance accounting, the `weakest` name).
- The live-TUI render proof is PENDING (needs a session restart).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The enforcement extension is PARKED (v2; the LSP informs only).
- The seal: NO LOCK (Mode B — a mutable working snapshot).
