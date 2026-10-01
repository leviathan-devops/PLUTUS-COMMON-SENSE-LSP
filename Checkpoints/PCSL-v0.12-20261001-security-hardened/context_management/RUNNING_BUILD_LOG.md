# RUNNING_BUILD_LOG — the moment-of-work log

## 2026-09-29 · the scaffold
- Created the repo (own .git) + the planning artifact + the build package.
- The predicate: PASS. The spec-audit: APPROVED (0/8). The pin: validated (7/7 slots).

## 2026-09-29 · W1 (store.ts)
- Wrote the graph reader: resolveRoot · l1PathFor · loadStore · lawsFor · declarationsIn · readL2.
- FIRST GATE RUN: 3 fail. DIAGNOSIS: the L1's law entities were overwritten by the final
  markdown-adapter rebuild (all 1277 became type:"doc"). FIX: re-added 564 law entities → 1841.
- SECOND RUN: 1 fail (PLUTUS_NO_ROOT before PLUTUS_NO_STORE). FIX: the test uses a real root
  with an absent kg.json.
- THIRD RUN: 4 pass / 0 fail. THE W1 GATE GREEN.

## 2026-09-29 · W2+W3 (judge.ts, cards.ts)
- Wrote the chain (5-of-7 nouls) + the card renderer.
- The graph gate fired (3 structural edits, no query). REMEDY: the symlink anchor + ripwire map.
- The battery: 1 fail (JEVK5_DOWN not exported). FIX: re-export from judge.ts.
- The battery: 1 fail (health() captured the env at module load). FIX: read at call time.
- 9 pass / 0 fail.

## 2026-09-29 · W4 (the server)
- Wrote the stdio JSON-RPC server + the receipt instrumentation + --selftest.
- THE SELFTEST: 2 cards + 5 live nouls (P1 0.808 · P2 0.708 · P3 0.859 · P4 0.451 · P7 0.487).
- GREEN.

## 2026-09-29 · W5 (the registration)
- Registered plutus-lsp beside gi-lsp + jg-lsp (no eviction).
- DROVE THE SERVER with real stdio frames → THE RECEIPT: PUBLISH n=3 (verdict=SUSPECT).
- GREEN.

## 2026-09-29 · W6 (the calibration)
- RUN 1: F1 0.67 at bar 0.30 — NO DISCRIMINATION. DIAGNOSIS: the state (12 fuzzy laws) + the
  generic question. THE PROBE: 1 law + the hunk → Δ 0.38-0.63 (the question discriminates).
- RUN 2 (+lawsForHunk): F1 0.60. RUN 3 (+OBSERVABLE): F1 0.60 at bar 0.30.
- RECORDED: reports/CALIBRATION_v1.md (bar 0.30 · P 0.50 · R 0.75 · the residual named).

## 2026-09-29 · P5 (the adversarial sweep)
- A3 FAILED: the matcher over-matched on 'file' (5 laws). FIX: +STOPWORDS. A3 re-run → PASS.
- The sweep: 8 angles, all PASS. The battery: 17 pass / 0 fail.

## 2026-09-30 · the round-9/10 fix batch (commit 816b384 — the current HEAD)
- The trigger: round-9 FAIL (0 critical, 12 high, 31 findings) + round-10 FAIL (2 critical, 10 high, 30 findings). 21 findings closed.
- The criticals: `knownAbs` undefined → `resolve()`; `MAX_STDIN` undeclared → declared. Both ReferenceErrors the suite never ran.
- The highs: validTier fail-closed (SUPERSEDED -2) · L2 contiguous framing · chain dedupe-consistent + on jevk5Fetch · visible cap (judged/total/dropped) · outer catch never-clears · send single-resolver · lawCard finite-guards · epsilon attribution · target-file warning · STALE codes · fileOf decode-last · L2 fire-and-forget · health array rejection · single threshold source.
- THE BATTERY: 26 pass / 0 fail / 117 expects. THE SELFTESTS ×4 (live JevK5 jevk5-4b-v0.2-Q8_0): store 11 cards · judge 13 · script 12 · cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868, YOU ARE EDITING names the target).
- THE BUNDLE: dist/plutus-lsp.js 41,046 bytes · sha256 51f95e841cf6247f… (rebuilt + committed).
- THE GATE: round-11 BLOCKED (provider :4097 refused; judge :8090 UP). BLOCKED-as-BLOCKED.

## 2026-09-30 · the ship-docs pass (6 docs)
- BUILD_REPORT §7 · DEBUG_LOG BUG-06..11 · TESTING_LOG round-10/11 section · FAILURE_LOG F-04/F-05 · THEATRICALITY_LOG created (T-01..T-05, operator-caught 0). Committed with the batch.

## 2026-10-01 · the proxy restore + the report + v0.7
- THE PROXY: `go-session-proxy.service` crash-looping (restart counter ~19,428) — its file
  `.mimocode/go-session-proxy.mjs` was DELETED from the working tree (`git status D`), so node
  threw MODULE_NOT_FOUND every 3s and :4097 never bound. Restored the 469-line copy (with the
  zen fingerprint machinery the 130-line committed copy lacks), `node --check` clean, unit
  `active`, `/healthz` → `{"ok":true}`. 4097/4098/8090 all OPEN. The round-11 audit lane (T8)
  is UNBLOCKED.
- THE REPORT: `reports/PCSL_Engineering_Report_v1.md` written (545 lines, 19 boxes, 0 box
  defects, max width 76) — first in the PCSL series. Lifecycle + 4 module diagrams + call
  tree + file tree + 5-part runtime trace + 2 pseudocode + 2 bug boxes + numbers table.
- THE BATTERY (re-confirmed this turn): 26 pass / 0 fail / 117 expects.

## 2026-10-01 · the round-11..18 hardening drive + the derailment suite
- THE AUDIT LANE RECOVERED (BUG-12 proxy restored) → 8 consecutive rounds: 60+ findings adjudicated
  + fixed, battery 18 → 46 tests (0 fail), bundle rebuilt each round.
- THE TREND (c/h): r9 2/12 · r10 2/10 · r11 0/13 · r12 0/12 · r13 0/7 · r14 0/5 · r15 1/2 · r16 0/4 · r17 2/3 · r18 1/5.
  The CRITICAL class eliminated at r11, re-introduced by fixes at r15/r17/r18 (all closed).
- THE DERAILMENT SUITE (scripts/derailment-suite.ts): 6 real Plutus derailments through the LIVE
  pipeline → 6/6 PASS (D5 ZFP fires VIOLATION; D6 fact-free silent). Artifact .omp/derailment-suite-results.json.
- THE BUNDLE: dist/plutus-lsp.js sha256 3307a3b7a14d6f4b.
- THE GATE: r18 FAIL — NO SHIP-READY CLAIM (~19 medium/low residual, recorded).

## [2026-10-01T15:30] — the round-19 ship-docs + canon pass (the ship-package prelude)
- WHAT: the r19 audit wired into all 6 ship docs (S1 green: 6/6 docs 50+ lines) + the canon refresh.
- WHY: the ship-package skill demands Phase A (ship docs, S1-S7) then Phase B (canon, U1-U4) before assembly.
- HOW: fresh qwen-code-audit scan (FAIL 0c/5h, session c8027864) → artifact JSON → TESTING_LOG verdict + F-08/F-09 + EN-13 + V-19-x + BUILD_REPORT §9.
- EVIDENCE: dist SHA 3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155; battery 46/0/158; artifacts/sg-ocr-round19.json.
- NEXT: the canon refresh (Phase B), then the package assembly (Phase E).

## [2026-10-01T23:30] — the flaw-report fixes + the SCOPE GATE
- WHAT: F-1 law-bearing resolution; F-2 the pull handler; F-3 ranged edits applied; F-6 didSave; F-10 tier retired (6 tokens); the isPlutusScoped gate (7/7); A37/A38/A39 pins.
- WHY: the independent flaw report — silent where it matters, loud where it does not.
- HOW: lawCount() scoping (local → cache → climb → known); the pull shares the analyze path; the scope gate FIRST in the pipeline.
- EVIDENCE: battery 52/0/171; derailment 6/6; scope 7/7; pull no -32601; dashboard 564 laws.
- NEXT: the v0.9 checkpoint (this turn).

## [2026-10-01T23:55] — round-20 (7 highs + 13 mediums) + the BLOCKED r21 audit
- WHAT: receipt rotation TRUNCATES (was growing); the checked path is RETURNED (was raw np); the
  dirty-rerun single-flight; applyRange validates offsets; the known-paths opt-in gate; the cached
  lawCount; JUDGE_DOWN decoupled from kept; A23's defect-encoding corrected; +10 more mediums.
- WHY: the r20 gate FAIL (0c/7h) — every finding adjudicated + fixed.
- EVIDENCE: battery 52/0/173; derailment 6/6 (hermetic); scope 7/7; dist a1b73cf11e88dac2.
- THE AUDIT GATE: r21 BLOCKED (Go 403 / zen-free 429) — recorded, no ship-ready claim.
