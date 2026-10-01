# CHECKPOINT MANIFEST — PCSL v0.6 (2026-09-30, ROUND-10)

## THE DIST
`dist/plutus-lsp.js` sha256 **51f95e841cf6247f** (41,046 bytes) — source commit `4b400b4`
(the canon refresh; code commit `816b384`). Rebuilt via
`bun build scripts/plutus-lsp.ts --target bun --format esm`.

## WHAT CHANGED FROM v0.5
- THE ROUND-9/10 FIX BATCH: 21 findings closed (2 CRITICAL ReferenceErrors — `knownAbs`,
  `MAX_STDIN` — + 10 HIGH + 9 MEDIUM/LOW). Full list: ship_docs/BUILD_REPORT.md §7.
- THE BATTERY: 26 pass / 0 fail / 117 expects (was 18/0).
- THE LIVE SELFTESTS ×4 (JevK5 jevk5-4b-v0.2-Q8_0): store 11 · judge 13 · script 12 ·
  cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868, target-file warning proven).
- THE SHIP DOCS: 6 current + THEATRICALITY_LOG created (T-01..T-05, operator-caught 0).
- THE CANON: 11 docs refreshed (logs, states, changelog, D-07..D-10, queue T8, compaction).
- THE RECEIPT: `RELEVANCE judged=12/12 dropped=0` (forensic/lsp-receipts.log, 2026-09-30T17:46:57Z).

## THE GATE STATE
Round-9 FAIL (0 critical, 12 high) → round-10 FAIL (2 critical, 10 high) → round-11 BLOCKED
(provider `127.0.0.1:4097` refused; judge `:8090` UP). BLOCKED-as-BLOCKED. The re-run is
queued (TASK_QUEUE T8). NO SHIP-READY CLAIM IS MADE.

## THE REMAINING (enhancements, not blockers)
- the round-11 audit re-run (the lane must recover)
- the live-TUI render proof (T1 — the operator; needs a session restart)
- the calibration corpus 8 items (a 50+ corpus stabilizes the bar)
- the enforcement extension (v2 — the block; the LSP informs)

## THE TREE
57 files + SHA256SUMS (this dir). Source HEAD `4b400b4`. Verify: `sha256sum -c SHA256SUMS`.
