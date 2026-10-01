# CHECKPOINT MANIFEST — PCSL v0.7 (2026-10-01, PROXY-RESTORED + REPORT)

## THE CHECKPOINT
Name: `PCSL-v0.7-20261001-proxy-restored-report` (hyphens only, no spaces).
Date: 2026-10-01. Source HEAD at seal: see `git log` in the project (post-9d0ab6c).

## THE DIST
`dist/plutus-lsp.js` sha256 **51f95e841cf6247f** (41,046 bytes).
Checkpoint copy SHA == project SHA (zero drift, verified at seal).

## THE STATE (what is validated)
- THE BATTERY: `bun test tests/` → 26 pass / 0 fail / 117 expects (re-run this turn).
- THE LIVE SELFTESTS ×4 (JevK5 jevk5-4b-v0.2-Q8_0): store 11 · judge 13 · script 12 ·
  cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868). See ship_docs/TESTING_LOG.md.
- THE PRESSURE TEST: 7/7 PASS in-container (pbk/omp-ct:master), Phase-E 10/10.
  Artifact: `.omp/container-test-results.json` (copied into this checkpoint).
- THE PROXY: `go-session-proxy.service` restored this turn — unit `active`,
  `/healthz` ok, 4097/4098/8090 OPEN. The round-11 audit lane (T8) is UNBLOCKED.
- THE REPORT: `reports/PCSL_Engineering_Report_v1.md` (545 lines, 19 boxes,
  0 box defects, max width 76) — first in the PCSL series.

## WHAT CHANGED FROM v0.6
- BUG-12 fixed: the proxy's ExecStart file was deleted → 19k-restart crash loop →
  restored the 469-line copy (zen fingerprint intact), service `active`.
- The engineering report written (545 lines, ruler-verified).
- RUNNING_BUILD_LOG + RUNNING_DEBUG_LOG appended (proxy + report entries).

## THE CONTENTS (59 files + SHA256SUMS)
- `src/` + `scripts/` + `tests/`: 8 .ts files (the FULL source tree + battery).
- `dist/`: the built bundle (SHA above).
- `context_management/`: 11 canon docs.
- `ship_docs/`: 6 ship docs (BUILD_REPORT, DEBUG_LOG, FAILURE_LOG,
  SPEC_VIOLATION_LOG, TESTING_LOG, THEATRICALITY_LOG).
- `reports/`: CALIBRATION_v1, CT plans/results, LIVE_TUI_SPAWN_PROOF,
  LSP_DEPLOYMENT_CONTRACT, P8_VERDICT, RELEVANCE_KERNEL, STALENESS_AUDIT,
  PCSL_Engineering_Report_v1 + the v2 container results.
- `.omp/container-test-results.json`: the pressure-test machine record.
- `packages/`, `forensic/`, `lsp.json`, `package.json`, `tsconfig.json`,
  `bunfig.toml`, `README.md`, `PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md`.
- Verify: `sha256sum -c SHA256SUMS` from this dir. Secret pre-scan: clean.

## THE HONEST GAPS
- The round-11 audit has NOT re-run (the lane just recovered; T8 still open).
- The live-TUI render proof is PENDING (needs a session restart).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The enforcement extension is PARKED (v2; the LSP informs only).
- NO SHIP-READY CLAIM IS MADE (the audit gate has not gone green).
- The seal: NO LOCK (Mode B — a mutable working snapshot; the operator
  re-locks if Mode A is ordered).
