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
