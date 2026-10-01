# GIT HISTORY — plutus-lsp-r23 (lineage without .git)

Branch: `master`. HEAD at package time: `b2bbfb0`.
Worktree: `git status --short` -> 1 entries (untracked package dir only).

## Last 50 commits

```
b2bbfb0 docs(canon): U2 green — all 5 read-first docs carry the current dist SHA
a985d65 docs(canon): refresh to the security-hardened state (59/0, the configurable scope, D-13/D-14)
f3c133a feat(lsp): the scope gate is CONFIGURABLE (PLUTUS_LSP_SCOPE / _FILES) — the boilerplate reuse seam; A46 pins it
a1f1203 chore(lsp): final state — all 19 audit findings fixed, battery 58/0/196, dist 0638723b85a564e0
f0f481a docs(canon) + chore(checkpoint): PCSL-v0.12-20261001-security-hardened (dist 0638723b85a564e0) — 19 audit findings fixed, battery 58/0/196
d9a7bfb fix(lsp): SEC-M4 allowlist canonicalization + the security audit artifact + F-17 wired
02bfd8d fix(lsp): the SECURITY audit's 10 findings — H1 lawcount size gate, H2 judge byte+key caps, H3 receipt/log line cap, M1 doc-table cap, M2 law-text cap at load, M3 stdin idle sweep, M4 TODO, L1 skip-path copies, L2 bounded health, L3 bounded buildState. battery 58/0
4d70c96 chore(checkpoint): PCSL-v0.11-20261001-noise-closed (dist 08800b70871e736d)
d41f96f fix(lsp): L2 absent = silent (the expected state) — NOISE RATIO 2.0 -> 0.00; the pipeline-return bug caught+pinned; battery 57/0
d556224 chore(checkpoint): PCSL-v0.10-20261001-independent-audit-fixed (dist 533b62916ed4f0f6)
3d1051b fix(lsp): the F-16 silent-catch class — the forensic-dir + log-rotate failures are now LOUD; battery 57/0, dist 533b6291
f4d7531 docs(ship): the independent audit (r22) — 9 findings wired, F-15/F-16 logged
4985935 fix(lsp): the independent audit's 9 findings — F-9 rotation imports (the HIGH), kept/shown concat, UNKNOWN relevance surfaced, pull errors not false-clean, didClose clears inFlight, doc-size cap, non-Error catch, allowlisted stale codes, bounded cache. battery 57/0
f700e7b chore(lsp): final state — registration scope-aligned, all fixes verified
c9c1887 chore(checkpoint): PCSL-v0.9-20261001-flaw-fixed-scoped (dist a1b73cf11e88dac2)
5f24e81 docs(ship+canon): r20 sweep + the BLOCKED r21 audit (F-14) — battery 52/0/173, derailment 6/6 hermetic
e9a5dc3 fix(lsp): round-20 — 7 highs + 13 mediums (receipt truncate, checked-path return, dirty-rerun single-flight, applyRange guards, opt-in gate, cached lawCount, JUDGE_DOWN decoupled, A23 defect-encoding corrected)
9ca15e2 fix(lsp): r19 highs (H1 symlink, H2 single-flight, H3 FIFO, H4 cap-throw, H5 attribution) + F-5 dead-local repair + F-4 test script + hermetic derailment suite
64338ca chore(lsp): remove stray sample.ts scratch (forward commit, again)
e8fbcc8 fix(lsp): flaw report F-1/F-2/F-3/F-6/F-10 + SCOPE GATE — law-bearing resolution, pull handler, didSave, tier retired, 52/0
7b7b149 chore(lsp): remove stray sample.ts scratch (forward commit)
e9fe104 fix(lsp): misfire fixes M1/M2/M3 (drop .md, gate L2, out-of-scope silent) + 2 pins, battery 48/0
902ee22 docs(canon): U2 green 5/5 — full dist SHA in all read-first docs
132a916 docs(canon): U2 green — all 5 read-first docs carry the current dist SHA
7b77c66 docs(canon): ship-package prelude (r19 wired, U-gates green, dist recorded)
fb5047d docs(ship): round-19 audit wired (FAIL 0c/5h, F-08/F-09, EN-13, V-19-x, S1 green)
db40451 test(pcsl): final all-tier verification (46/0, derailment 6/6, bundle 3307a3b7, 310 host frames)
bf097a4 chore(checkpoint): PCSL-v0.8-20261001-hardened-derailment-suite (dist 3307a3b7a14d6f4b)
58c9190 docs(canon): BUILD/DECISION/EVIDENCE states — 46/0 battery, sha refreshed, D-11/D-12
4ab4f9e docs(canon): rounds 11-18 + derailment suite refresh (states, changelog, decisions, logs)
93a7d42 docs(ship): rounds 11-18 + the derailment suite — BUILD/DEBUG/TESTING/THEATRICALITY/FAILURE updated
60635bc fix(lsp): round-18 audit — 1 critical (path.resolve clamps ..) + 5 high closed, battery 46/0
6d40ee8 fix(lsp): round-17 audit — 2 critical (path normalize-return) + 3 high closed, battery 46/0
8ac4fe7 fix(lsp): round-16 audit — 4 high + mediums closed, battery 46/0, selftest paths verified live
e4081a3 fix(lsp): round-15 audit — 1 critical (selftest fall-through) + 2 high + mediums closed, battery 46/0
2e3f700 fix(lsp): round-14 audit — 5 high + mediums closed, battery 42/0, 16 new pins
bb850fb fix(lsp): round-13 audit — 7 high + mediums closed, battery 39/0, 13 new pins
bead7fd fix(lsp): round-12 audit — 12 high + mediums closed, battery 36/0, 10 new pins
308d133 fix(lsp): round-11 audit — 13 high closed, battery 32/0, live selftest green
1abc727 chore(checkpoint): PCSL-v0.7-20261001-proxy-restored-report (dist 51f95e841cf6247f)
9d0ab6c test(pcsl): the pressure test — 7/7 PASS in-container, results artifact + TESTING_LOG
2198d27 chore(pcsl): checkpoint v0.6 sealed — round-10 batch, 57 files + manifest + hashes
4b400b4 docs(canon): the round-10 canon refresh — logs, states, changelog, decisions, queue, compaction
444acc4 docs(ship): the round-10 pass — BUILD/DEBUG/TESTING/FAILURE updated + THEATRICALITY_LOG created
816b384 fix(lsp): round-10 audit — 21 findings closed, battery 26/0, 4 live selftests green
5b2f18f fix(pcsl): the DERAILMENT FIXES — 4 defects the probe found, all closed
44da090 fix(pcsl): the S1 selftest probe aligned with the law's vocabulary
badd111 fix(pcsl): the 150-pip fabrication purged from code + tests (absolute-path pass)
d8f51ae fix(pcsl): THE STALENESS AUDIT — the 150-pip fabrication purged + the graph anchors repaired
795cb20 feat(pcsl): THE INFO-CARD REBUILD — the GI card design, applied
```

## Worktree honesty

The package was assembled from the committed tree at HEAD. The `Ship_Packages/` dir is untracked by
design until the operator orders the ship commit. No staged source changes. Remote: not echoed
(may embed credentials).
