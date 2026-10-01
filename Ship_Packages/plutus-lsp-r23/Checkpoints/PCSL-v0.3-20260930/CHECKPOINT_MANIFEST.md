# CHECKPOINT MANIFEST — PCSL v0.3 (2026-09-30, POST-AUDIT)

## WHAT CHANGED FROM v0.2
- **FIX A**: the DERIVED bar (0.30, CALIBRATION_v1) is WIRED into DEMAND_T (was 0.5 — the
  calibration's output had ZERO production consumers).
- **FIX B**: the SILENT DEFAULTS removed (P7/P3 unanswered ≠ 0 — no fail-open drift check).
- **FIX C**: the INCONCLUSIVE verdict now EMITS a card (was a silent pass).
- **FIX D**: `test_lsp_selftest_emits_token` WRITTEN (the spec's S1 had no test).
- **THE AUDIT RE-TEST**: 5/5 PASS in the container against THIS dist (90f7a0626a7a691b).
- **THE BATTERY**: 18 pass / 0 fail.

## THE AUDIT'S CONFIRMED DEFECTS (8: A-H)
A the unwired calibration · B the silent defaults · C the silent INCONCLUSIVE ·
D the missing S1 test · E the stale test count · F the stale container artifact sha ·
G the stale checkpoint · H the false S1-S7 MET claim.

## THE DIST
`dist/plutus-lsp.js` sha256 **90f7a0626a7a691b** — certified by the container run
(reports/pcsl-audit-results.json).

## THE OPEN (unchanged)
1. THE LIVE-TUI HANDSHAKE — the runtime spawns it (proven) but the fresh-container warmup
   stalls at "connecting"; the invalid capability is FIXED; the broker/timeout probes remain.
2. THE CALIBRATION CORPUS — 8 items (the F1 plateau is the small-n signature).
3. plutus/callers — declared, not emitted.
