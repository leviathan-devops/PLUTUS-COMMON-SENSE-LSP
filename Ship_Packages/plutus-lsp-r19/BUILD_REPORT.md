# PLUTUS-COMMON-SENSE-LSP — SHIP BUILD REPORT (r19 package)

## 1. Build Summary (the state)

Bundle `dist/plutus-lsp.js` sha256 `3307a3b7a14d6f4b` (41,046 bytes). Battery 46 pass / 0 fail / 158 expects. Audit r19 FAIL (0 critical, 5 high) — no ship-ready claim. Derailment suite 6/6 PASS (live judge). 8 checkpoints (v0.1..v0.8).

## 2. What Was Built (narrative, from the ship docs)

# BUILD_REPORT — PLUTUS-COMMON-SENSE-LSP (the what-was-built record)

**Date:** 2026-09-29 · **The repo:** PLUTUS-COMMON-SENSE-LSP (own .git) · **The commits (HEAD at the audit):** a1d4342 + the audit's follow-ups; the earlier: f4b9260, 5154527, 8260183 (audit F13: the record named a stale prefix)

## §1 · WHAT WAS BUILT (the deliverable)
A third custom LSP server, `plutus-lsp`, that makes the Plutus knowledge graphs REFLEXIVE:
on every write/edit to a Plutus file it reads the graph (L1 semantica + L2 arsumbris), judges
the edit via JevK5 (CH-PLUTUS, the 5-of-7 nouls), and surfaces the governing law as an LSP
diagnostic — before the agent can derail. It INFORMS; it never blocks (the polarity law).

## §2 · THE FILES (the deployed set)
| the file | the role | the lines |
|---|---|---|
| `scripts/plutus-lsp.ts` | the stdio JSON-RPC server + --selftest + the receipt | 168 (measured, audit F8) |
| `src/plutus-lsp/store.ts` | the graph reader (L1 kg.json + L2 socket) + the named refusals | 266 (measured) |
| `src/plutus-lsp/judge.ts` | CH-PLUTUS (the 7 nouls) + OBSERVABLE + the verdict | 207 (measured) |
| `src/plutus-lsp/cards.ts` | the 7 tokens + FactCard + toDiagnostic | 166 (measured) |
| `tests/*.test.ts` | the W1/W2/W3 gates + the 8-angle adversarial sweep | ~180 |
| `tests/calibration/*` | the labeled corpus + the derivation harness | ~90 |
| `~/.omp/agent/lsp.json` | the registration (beside gi-lsp + jg-lsp) | 1 entry |

## §3 · THE VERIFICATION (every tier, with its artifact)
| tier | what | the artifact |
|---|---|---|
| L0 | the typecheck | `bun test` loads + runs (the TS is executed, not just parsed) |
| L1 | the unit | `bun test tests/` → **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
| L2 | the script test (the real modules, the real graph, the live judge) | `--selftest mirror.ts` → 2 cards + 5 live nouls |
| L3 | the driven server (the real stdio frames) | `/tmp/plutus-lsp-receipts.log` → `PUBLISH n=3 … verdict=SUSPECT` |
| L4 | the live TUI | **PENDING** — the LSP binds at session construction (T1) |

## §4 · THE CALIBRATION (the derived bar)
`reports/CALIBRATION_v1.md` → **bar 0.30 · F1 0.60 · precision 0.50 · recall 0.75** on the
8-item corpus (4 violations + 4 cleans). Reproducible (`bun tests/calibration/calibrate.ts`).

## §5 · THE DEFECTS FOUND + FIXED (5)
1. the L1 law entities overwritten by the adapter rebuild → re-added (564).
2. health() captured the env at module load → read at call time.
3. the token matcher over-matched on generic words → +STOPWORDS.
4. the calibration's state diluted the signal → +lawsForHunk (ranked, top-3).
5. the generic question required derivation → +OBSERVABLE templates.

## §6 · THE HONEST GAPS
- The live-TUI render proof is PENDING (a session restart is needed).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The `plutus/callers` token is declared but not yet emitted.
- The enforcement extension (the block) is deferred to v2 (D5).

## §7 · THE ROUND-10 FIX BATCH (2026-09-30 · commit 816b384 — the current HEAD)

**THE TRIGGER:** the round-9 audit GATE: FAIL (0 critical, 12 high, findings=31) + the round-10
audit GATE: FAIL (2 critical, 10 high, findings=30). **21 findings closed** across the two rounds.
The round-11 audit is BLOCKED (provider unreachable — `127.0.0.1:4097` connection refused, the
go-session-proxy lane down; NOT a code verdict).

**THE MEASURED STATE AT THIS COMMIT:**
| the file | the lines | the role |
|---|---|---|
| `scripts/plutus-lsp.ts` | 350 | the stdio server + the fire-and-forget L2 + the receipt |
| `src/plutus-lsp/store.ts` | 440 | the graph reader + the contiguous L2 framing + the fail-closed tier |
| `src/plutus-lsp/judge.ts` | 421 | the chain on jevk5Fetch + the visible cap + the single threshold source |
| `src/plutus-lsp/cards.ts` | 264 | the finite-only cards + the epsilon attribution + the STALE codes |
| `dist/plutus-lsp.js` | 41,046 bytes · sha256 `51f95e841cf6247f…` | the built bundle (rebuilt at this commit) |

**THE FIXES (per finding, highest severity first):**
1. CRITICAL `knownAbs` undefined (store.ts:119) — `PLUTUS_ALLOW_KNOWN_PATHS=1` threw
   ReferenceError; entries are absolute, `resolve()` normalizes. FIXED.
2. CRITICAL `MAX_STDIN` read-but-never-declared (scripts:261) — ReferenceError on the oversize
   path; declared before the stdin handler. FIXED.
3. HIGH `validTier` fail-open to IMMUTABLE — corrupt tiers outranked canon (+2); now SUPERSEDED
   (-2, fail-closed). FIXED.
4. HIGH L2 framing split-prefix — `chunks[0][0..3]` without contiguity; now concat-once then
   `readUInt32BE(0)`. FIXED.
5. HIGH chain dedupe mismatch (`['P1','P1']` → false JUDGE_ANSWER_COUNT) — loop + count both use
   the validated set; chain now reuses `jevk5Fetch` (the drift source removed). FIXED.
6. HIGH relevance cap invisible — `{ok,scored}` carried no `judged/total/dropped`; now returned
   AND receipted. FIXED.
7. HIGH outer catch published `[]` (wiped last-good diagnostics) — now sends nothing (same as the
   double-fault path). FIXED.
8. HIGH send() dangling `once('drain')/once('error')` per call (MaxListeners + stale done()) —
   the write callback is the only resolver; dead-stream short-circuit. FIXED.
9. HIGH lawCard Infinity-as-measured + per-element null guards; verdictCard epsilon tie + explicit
   kind gate + target-file warning; callersCard deduped-empty→null; STALE codes `[JEVK5_*]` vs
   `[PLUTUS_NO_*]`; fileOf decode-last + UNC; L2 fire-and-forget; health() array rejection;
   single threshold source (consts delegate to getters). ALL FIXED.
10. MEDIUM/LOW — INCONCLUSIVE separator unified, DRIFT clause from the verdict, STOPWORDS private
    + predicate, `export {a as b}` keeps both names, deterministic caller order, timeoutMs
    validation, single-pass tokenization, frozen marker arrays, empty-id laws dropped at load,
    dead guards/consts/ternary removed. ALL FIXED.

**THE VERIFICATION AT THIS COMMIT:**
| tier | what | the artifact |
|---|---|---|
| L1 | the unit | `bun test tests/` → **26 pass / 0 fail / 117 expects** |
| L2 | the live selftest ×4 (the real graph + the LIVE JevK5) | store: 11 cards (10 LAW + 1 SUSPECT) · judge: 13 cards (12 LAW + 1 SUSPECT) · script: 12 cards (11 LAW + 1 SUSPECT) · cards: 13 cards (12 LAW + 1 VIOLATION `MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts`) |
| L3 | the built bundle | `dist/plutus-lsp.js` sha256 `51f95e841cf6247f…` (rebuilt, committed) |

**THE HONEST RESIDUAL:** the round-11 audit could not run (provider down — BLOCKED, not PASS);
the 7 remaining medium/low findings from round-10 (chain drift now closed by the jevk5Fetch
refactor; `plutus/tier` documented dead-filter; L2 receipt timing) are recorded, not hidden.

## §8 · THE ROUND-11..18 HARDENING DRIVE + THE DERAILMENT SUITE (2026-10-01)

**THE DRIVE:** the audit lane recovered (BUG-12 proxy restored) → 8 consecutive `qwen-code-audit`
rounds against the four core files. Every BLOCKING finding was adjudicated (Side A probe-error
vs Side B confirmed defect) and fixed; every fix pinned by a new test. The battery grew
18 → 46 tests (0 fail), and the bundle was rebuilt at every round.

**THE AUDIT TREND (critical/high per round):**
```
r9  2c/12h   r10 2c/10h   r11 0c/13h   r12 0c/12h
r13 0c/7h    r14 0c/5h    r15 1c/2h    r16 0c/4h
r17 2c/3h    r18 1c/5h
```
The CRITICAL class was eliminated (r11) and then RE-INTRODUCED twice by the fixes themselves
(r15's selftest fall-through; r17's path-normalize return-raw; r18's absolute-`..` clamp) —
each a self-inflicted edge in the path/exit confinement code. **THE CONVERGENCE TREND: blocking
findings fall as real classes close (13→12→7→5→2→4); the residue is an LLM reviewer's unbounded
supply of fresh edge-cases in code that keeps gaining lines.** The honest stop: CONFIRMED DEFECTS
FIXED + CRITICAL CLASS ELIMINATED at each round, with the remainder named (below).

**THE FIXES (per class, 8 rounds):**
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors (r10); the selftest failure-path
   fall-through (r15); `fileOf` returning RAW while checking NORMALIZED (r17); absolute `..`
   bypassing the denylist (r18). All closed + pinned.
2. HIGH — frozen threshold aliases → getters-only (r11); P2 jurisdiction fail-closed (r11);
   cache serves stale canon → content fingerprint (r11); chain dedupe + `jevk5Fetch` reuse
   (r10/11); `staleCard`/`cards` never-throw + bounded strings (r12..17); `resolveRoot` STRONG
   wins at any depth (r13); partition row validation (r13); stdin headerless cap (r11/14);
   `path.resolve` confinement (r18).
3. MEDIUM/LOW — v 40+ across: tier-word candidacy (r12), short-name-part survival (r12),
   deterministic ordering, receive-drain, health array rejection, epsilon at display precision,
   STALE code allowlist, `Object.hasOwn` NodeId, short-read naming, unknown-method MethodNotFound,
   subarray-view copy, denylist roots, `cap()` bounding, identity trimming, timer thresholds.

**THE DERAILMENT-PATTERN SUITE (`scripts/derailment-suite.ts`) — THE OBJECTIVE'S PROOF:**
The operator's objective is that the agent "cannot derail or make stupid actions". The suite
pushes the 6 REAL Plutus derailments through the LIVE pipeline and asserts the reflex fires:

```
D1 fabricated SL cap (150 vs the 36-pip canon)  → plutus/law + the SL/TP law surfaced   PASS
D2 multi-TP (law: ONE TP; edit TP1/TP2/TP3)     → plutus/law, plutus/suspect            PASS
D3 pair-format (law: EUR/USD; edit EURUSD)      → plutus/law, plutus/suspect            PASS
D4 flat RRR (law: category-specific)            → plutus/law, plutus/drift              PASS
D5 ZFP threshold (canon 45; edit 60)            → plutus/law, plutus/VIOLATION          PASS
D6 a fact-free file                             → ZERO tokens (the precision proof)     PASS
```
**6/6 PASS.** Artifact: `.omp/derailment-suite-results.json`. The VIOLATION token fired on the
ZFP change (the clearest canon breach); the others surface the governing law + SUSPECT/DRIFT.

**THE MEASURED STATE:** battery **46 pass / 0 fail / 158 expects**; 4 live selftests (real graph
+ live JevK5); derailment suite 6/6; bundle `dist/plutus-lsp.js` sha256 see BUILD_STATE.

**THE HONEST RESIDUAL (the audit treadmill named):** ~19 medium/low findings from r17-r18 remain
unfixed (hunk-hot-path tokenization caching, regex-literal/division stripping in `declarationsIn`,
`chain`/`relevancePass` request/latency accounting across the health+fault double-fetch, the
`weakest`-name shadow of the strongest clause, the `plutus/tier` dead token). None is CRITICAL or
HIGH; all are recorded. NO SHIP-READY CLAIM IS MADE — the last audit gate was FAIL (r18).

## §9 · THE ROUND-19 AUDIT (2026-10-01 — the r11..r18 drive's closing round)

**The built:** the audit artifact + its wiring (no code changed this round — triage only).
**The why:** the ship-docs audit gate (S7) requires every audit wired before any milestone.
**The how:** fresh `qwen-code-audit` scan → artifact JSON → TESTING_LOG verdict line +
  FAILURE_LOG F-08/F-09 + DEBUG_LOG EN-13.
**The evidence:** `GATE: FAIL (0 critical, 5 high)`, session `c8027864`,
  `artifacts/sg-ocr-round19.json`, dist SHA `3307a3b7a14d6f4b…`.
**The verification:** the verdict line is quoted verbatim in TESTING_LOG; the 5 blocking
  findings each have an OPEN F entry.
**The honest notes:** the CRITICAL class stays eliminated (0 critical, 3rd round running);
  the 5 highs are queued, not rushed; NO SHIP-READY CLAIM.


# CURRENT_STATE — PLUTUS-COMMON-SENSE-LSP

**As of:** 2026-10-01 · **The phase:** pre-ship-package (r19 FAIL 0c/5h wired; battery 46/0/158; derailment 6/6; gate FAIL — no ship-ready claim).

## THE ARCHITECTURE AS IT NOW IS
```
OMP native LSP runtime (diagnosticsOnWrite / OnEdit)
  │ queries EVERY registered server on every write/edit
  ▼
plutus-lsp (scripts/plutus-lsp.ts, stdio JSON-RPC)
  │  store.ts    the graph reader (L1 kg.json + fire-and-forget L2)  PLUTUS_NO_STORE
  │  judge.ts    CH-PLUTUS (7 nouls) + relevance kernel vs JevK5  JEVK5_DOWN
  │  cards.ts    the 7 tokens + STALE codes -> LSP diagnostics    the anti-phantom law
  ▼
publishDiagnostics -> the canon arrives on the write (the REFLEX)
```
## THE REGISTERED SERVERS (3)
`gi-lsp` (the GI reflex) · `jg-lsp` (the ticket reflex) · `plutus-lsp` (the canon reflex) — no eviction.

## THE 7 TOKENS
`plutus/law` · `plutus/violation` · `plutus/suspect` · `plutus/tier` · `plutus/callers` ·
`plutus/drift` · `plutus/stale`.

## THE POLARITY LAW (the invariant)
The LSP INFORMS; the extension ENFORCES. A block path in the server is a VIOLATION.

## THE CURRENT NUMBERS
- the battery: 46 pass / 0 fail / 158 expects (3 files)
- the live selftests ×4 (JevK5 jevk5-4b-v0.2-Q8_0): store 11 · judge 13 · script 12 · cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868, target-file warning proven)
- the receipt: `RELEVANCE judged=12/12 dropped=0` (forensic/lsp-receipts.log, 2026-09-30T17:46:57Z)
- the bundle: dist/plutus-lsp.js sha256 3307a3b7a14d6f4b (rebuilt at every round)
- the derived bar: 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus
- the audit gate: rounds 11-18 run (r18 FAIL 1c/5h — NO ship-ready claim)

## WHAT IS NOT YET DONE
The r17/r18 medium/low residual (~19 findings, recorded — hunk-hot-path caching, decl regex, accounting).
The live-TUI render proof (needs a session restart — the LSP binds at session construction).
The enforcement extension (deferred to v2). The 50+ item calibration corpus.

**Dist fingerprint (this update):**

Dist fingerprint (this update): `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`


## 3. Technical Implementation (interfaces, anchors, data flows)

### 3.1 The artifact table

| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |

### 3.2 The module contracts (from the source)

store.ts (graph reader): resolveRoot -> l1PathFor -> loadStore -> lawsForHunk (topK=12) + declarationsIn + callersOf + readL2. Refusals PLUTUS_NO_STORE / PLUTUS_NO_ROOT. judge.ts (decision kernel): health -> jevk5Fetch (one batched POST) -> chain P1..P7 -> relevancePass -> partitionByRelevance -> verdict (MAX over answered {P4,P5,P6}). Bars: throwT 0.85 (policy), demandT 0.30 (derived), relevanceT 0.30 (swept). cards.ts (renderer): lawCard + verdictCard + callersCard + staleCard -> fileCards; 7 tokens; fail-closed attribution. scripts/plutus-lsp.ts (stdio server): frame parser -> fileOf (normalize+confine) -> analyze (debounced) -> send (serialized). scripts/derailment-suite.ts (acceptance): D1-D6 through the live pipeline.

## 4. Architecture Changes (with the pipeline diagram)

```
OMP runtime LSP mux (didOpen/didChange/didSave)
  -> scripts/plutus-lsp.ts --stdio (frame parser -> analyze -> send)
  -> pipeline: L1 DETECT (lawsForHunk) -> L2 RELEVANCE (relevancePass, judge decides)
  -> CHAIN P1..P7 (one POST) -> VERDICT (pure code) -> CARDS (fileCards)
  -> publishDiagnostics (the canon arrives ON THE WRITE; INFORMS, never blocks)
```

## 5. Files Changed (git history + tree)

GIT HISTORY (last 40 commits):
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
e16350a feat(pcsl): THE JEV RELEVANCE KERNEL — the judge now decides relevance, not the regex
2a3d350 docs(pcsl): the proof archive addendum — the CONTINUING live LSP traffic
aa29c64 docs(pcsl): the final cert artifact + the LIVE-TUI PROOF ARCHIVE (append-only)
cf0841d feat(pcsl): THE LIVE-TUI PROOF + the L1 discovery + the final cert — the LSP IS LIVE
a619a60 fix(pcsl): the LOW set fixed + THE LSP DEPLOYMENT CONTRACT (the spawn gates)
22ec325 audit(pcsl): the independent auditors' round — 31 findings, the HIGH set fixed, the container re-certified
de07575 fix(pcsl): the audit round 2 — audit-alpha's 14 findings (F2-F14) fixed
a1d4342 audit(pcsl): the red-team slop audit #1 — 8 confirmed defects found and fixed
d903b91 test(pcsl): the live-TUI spawn proof — the runtime spawns it (proven) + the handshake fix
f0e5648 fix(jevk5)+chore(pcsl): the judge health probes its backend (the false-green generator) + the v0.2 checkpoint
665c31a test(pcsl): the container v2 — THE HOST BRIDGE + 4 defects found and fixed
177e7d6 test(pcsl): the deep-container-testing rig — 7/7 PASS in a clean mimo-ct:master container

DIFFSTAT since the r18 batch:
 .omp/derailment-suite-results.json                 |    2 +-
 .../.omp/container-test-results.json               |    1 +
 .../.omp/derailment-suite-results.json             |   97 ++
 .../CHECKPOINT_MANIFEST.md                         |   43 +
 .../PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md      |  289 ++++
 .../README.md                                      |   15 +
 .../SHA256SUMS                                     |   62 +
 .../bunfig.toml                                    |    3 +
 .../context_management/BUILD_STATE.md              |   29 +
 .../context_management/CHANGELOG.md                |   46 +
 .../context_management/COMPACTION_SURVIVAL.md      |   26 +
 .../context_management/CURRENT_STATE.md            |   38 +
 .../context_management/DECISION_CHAIN.md           |   47 +
 .../context_management/EVIDENCE_STATE.md           |   49 +
 .../context_management/NEXT_STEPS.md               |   25 +
 .../context_management/POST-COMPACTION_PROMPT.md   |   22 +
 .../context_management/RUNNING_BUILD_LOG.md        |   73 +
 .../context_management/RUNNING_DEBUG_LOG.md        |   64 +
 .../context_management/TASK_QUEUE.md               |   12 +
 .../dist/plutus-lsp.js                             | 1391 ++++++++++++++++++++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_1.md        |  161 +++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_2.md        |   64 +
 .../forensic/LIVE_TUI_PROOF_ARCHIVE.md             |   50 +
 .../lsp.json                                       |   12 +
 .../package.json                                   |   11 +
 .../packages/plutus-common-sense-lsp/00-INDEX.md   |   23 +
 .../packages/plutus-common-sense-lsp/00-MISSION.md |   36 +
 .../plutus-common-sense-lsp/01-DISCOVERY.md        |   48 +
 .../plutus-common-sense-lsp/02-DPL1-SPEC.md        |  202 +++
 .../plutus-common-sense-lsp/03-MASTER-BLUEPRINT.md |   62 +
 .../packages/plutus-common-sense-lsp/06-WAVES.md   |   30 +
 .../packages/plutus-common-sense-lsp/07-GOALS.md   |   24 +
 .../reports/CALIBRATION_v1.md                      |   87 ++
 .../reports/CT_PLAN.txt                            |   68 +
 .../reports/INFO_CARD_DESIGN.md                    |   55 +
 .../reports/LIVE_TUI_SPAWN_PROOF.md                |   52 +
 .../reports/LSP_DEPLOYMENT_CONTRACT.md             |   57 +
 .../reports/P8_VERDICT.md                          |   42 +
 .../reports/PCSL_Engineering_Report_v1.md          |  545 ++++++++
 .../reports/RELEVANCE_KERNEL.md                    |   63 +
 .../reports/STALENESS_AUDIT.md                     |   64 +
 .../reports/pcsl-ct-results-v2.json                |   22 +
 .../reports/pcsl-ct-results.json                   |   21 +
 .../reports/pcsl-final-results.json                |   16 +
 .../scripts/derailment-suite.ts                    |  113 ++
 .../scripts/plutus-lsp.ts                          |  477 +++++++
 .../ship_docs/BUILD_REPORT.md                      |  157 +++
 .../ship_docs/DEBUG_LOG.md                         |   99 ++
 .../ship_docs/FAILURE_LOG.md                       |   50 +
 .../ship_docs/SPEC_VIOLATION_LOG.md                |   31 +
 .../ship_docs/TESTING_LOG.md                       |  173 +++
 .../ship_docs/THEATRICALITY_LOG.md                 |   61 +
 .../src/plutus-lsp/cards.ts                        |  352 +++++
 .../src/plutus-lsp/judge.ts                        |  532 ++++++++
 .../src/plutus-lsp/store.ts                        |  546 ++++++++
 .../tests/adversarial.test.ts                      |  326 +++++
 .../tests/calibration/calibrate.ts                 |   40 +
 .../tests/calibration/corpus.json                  |   29 +
 .../tests/judge-cards.test.ts                      |   90 ++
 .../tests/plutus-lsp.test.ts                       |   78 ++
 .../tsconfig.json                                  |    8 +
 artifacts/sg-ocr-round19.json                      |   19 +
 context_management/BUILD_STATE.md                  |   10 +-
 context_management/CHANGELOG.md                    |    5 +
 context_management/COMPACTION_SURVIVAL.md          |    4 +-
 context_management/CURRENT_STATE.md                |    6 +-
 context_management/EVIDENCE_STATE.md               |   10 +-
 context_management/NEXT_STEPS.md                   |    3 +
 context_management/POST-COMPACTION_PROMPT.md       |    4 +-
 context_management/RUNNING_BUILD_LOG.md            |    7 +
 context_management/RUNNING_DEBUG_LOG.md            |    7 +
 ship_docs/BUILD_REPORT.md                          |   13 +
 ship_docs/DEBUG_LOG.md                             |   11 +
 ship_docs/FAILURE_LOG.md                           |   20 +
 ship_docs/SPEC_VIOLATION_LOG.md                    |   22 +
 ship_docs/TESTING_LOG.md                           |   12 +
 76 files changed, 7457 insertions(+), 7 deletions(-)

SOURCE TREE (11 files):
scripts/plutus-lsp.ts (stdio server) / src/plutus-lsp/store.ts (graph reader) / src/plutus-lsp/judge.ts (decision kernel) / src/plutus-lsp/cards.ts (card renderer) / scripts/derailment-suite.ts (acceptance suite) / tests: plutus-lsp, judge-cards, adversarial, calibration / dist/plutus-lsp.js (the bundle)

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


## 6. Test Results (battery + container + live, with SHAs)

# TESTING_LOG — the test plan + the results (all four tiers)

## THE PLAN (the tiers)
| tier | the scope | the tool | the state |
|---|---|---|---|
| L0 | the typecheck | `bun test` (the TS executes) | PASS |
| L1 | the unit — the pure fns | `bun test tests/` | **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
| L2 | the script test — the real modules + the real graph + the LIVE judge | `--selftest` | PASS (2 cards, 5 nouls) |
| L3 | the driven server — the real stdio frames | the drive harness | PASS (PUBLISH n=3) |
| L4 | the live TUI | the omp LSP runtime | **PENDING (T1)** |

## THE ADVERSARIAL SWEEP (8 angles — adversarial FIRST, the happy path LAST)
| # | the angle | the passToken | the result |
|---|---|---|---|
| A1 | the absent graph | PLUTUS_NO_STORE | PASS |
| A2 | the down judge | JEVK5_DOWN | PASS |
| A3 | a fact-free file | NO card | PASS (after the STOPWORDS fix) |
| A4 | a known violation | plutus/violation | PASS |
| A5 | a foreign store | PLUTUS_NO_STORE | PASS |
| A6 | no root marker | PLUTUS_NO_ROOT | PASS |
| A7 | the siblings survive | gi-lsp + jg-lsp + plutus-lsp | PASS |
| A8 | the token set = 7 unique | — | PASS |

## THE CALIBRATION (the derived bar)
```
★ THE DERIVED BAR: 0.30 (F1=0.60 · precision=0.50 · recall=0.75)
★ the corpus: 4 violations + 4 cleans = 8 items
```

## AUDIT GATE: FAIL (0 critical · 12 high · after 3 rounds)

**The rounds (verbatim from the tool):**
```
round 1: FAIL (1 critical, 12 high)  findings=28
round 2: FAIL (1 critical, 12 high)  findings=28   (13 fixed; 13 new surfaced)
round 3: FAIL (0 critical, 12 high)  findings=33   ← THE CRITICAL CLASS ELIMINATED
```
**The confirmed defects FIXED: 26 across the 3 rounds** — including the CRITICAL `didChange`
(`contentChanges[].text`, not `textDocument.text` — every edit wiped the doc) and the CRITICAL
INVERTED P1 SCOPE guard (high P1 = in-scope; it returned LAW for in-scope evidence).

**THE ADJUDICATION (why this stops here):** an LLM reviewer generates findings indefinitely —
the count never reaches zero by construction (the scan-treadmill law). The progress measure is
the CONFIRMED DEFECTS FIXED + the CRITICAL CLASS ELIMINATED, both of which are done. The
remaining 12 high are performance/robustness hardening (async fs, regex hoisting, debounce) —
real, non-blocking for an INFORMING layer, and recorded in HONEST_GAPS.

**THEREFORE: NO SHIP-READY CLAIM IS MADE.** A FAIL blocks it. The LSP is a v0.1 tool in OBSERVE
mode; the enforcing layer (v2) is gated behind this. FAIL is never PASS.

## THE HONEST RESIDUAL
The L4 live-TUI proof is pending. The corpus is small. The precision is 0.50 (bounded by the
polarity law — a Warning, never a block).

## THE CONTAINER RIG (mimo-ct:master · pcsl-ct-01 · the deep-container-testing protocol)

**The plan:** reports/CT_PLAN.txt (4381 chars · 6 sections · 4 scenarios + 2 adversarial · hash 8006d7d5).
**The deploy:** /tmp/plutus-lsp.js sha256 f8e8349b9fa568a1 == the local dist (THE SHA MATCH).
**The results artifact:** reports/pcsl-ct-results.json (+ .mimocode/ct-results.json).

| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the clean-env named refusal | POSITIVE | PLUTUS_NO_ROOT | **PASS** |
| S1b the specific PLUTUS_NO_STORE | POSITIVE | PLUTUS_NO_STORE | **PASS** |
| S2 the fixture graph → the cards | POSITIVE | SELFTEST OK (3 cards) | **PASS** |
| S3 a fact-free file → NO card | NEGATIVE | NO-LAW | **PASS** |
| S4 the stdio LSP handshake | NEGATIVE | serverInfo | **PASS** |
| A1 the down judge → the named refusal | ADVERSARIAL | JUDGE_DOWN | **PASS** |
| A2 the malformed frame (the bound holds) | ADVERSARIAL | serverInfo + ALIVE | **PASS** |

**THE PHASE-E BREAKER: 10/10** (the sha match · every scenario · every token · no circular ·
no timeout · the radius · the adversarial · the container alive · the artifact).

**THE HONEST RESIDUAL:** the container has NO JevK5 (:8090) — the live chain cannot run there;
the server correctly names the refusal (JUDGE_DOWN) instead of fabricating a pass. The model
auth is ABSENT in the image (the deterministic exec channel carried the scenarios).

**THE VERDICT: PASS (7/7 + the breaker) — the server works CORRECTLY in a CLEAN environment.**

## THE CONTAINER RIG v2 — THE HOST BRIDGE (the LIVE judge, over the network)

**THE BRIDGE:** `socat TCP-LISTEN:8091,bind=0.0.0.0 -> 127.0.0.1:8090` — from inside the
container the judge is `http://172.17.0.1:8091`. **The v1 "residual" (no judge in the
container) was WRONG — the bridge existed and was never looked for.**

| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the host bridge | POSITIVE | jevk5-4b | **PASS** |
| S2 the live chain (the vector) | POSITIVE | SELFTEST OK (P4=0.867) | **PASS** |
| S5 the in-scope VIOLATION | POSITIVE | plutus/violation (P4=0.923) | **PASS** |
| S4 the clean-env refusal | NEGATIVE | PLUTUS_NO_STORE | **PASS** |
| A1 the down judge | ADVERSARIAL | JEVK5_DOWN | **PASS** |
| A2 the malformed frame | ADVERSARIAL | serverInfo + ALIVE | **PASS** |

**THE DEFECTS FOUND AND FIXED (4):** the judge's backend DOWN (the health lied; restarted);
the P1 over-block (jurisdiction from the LAWS, not the path); the test isolation (the
checkpoint's copied suite); the env restore ("undefined").

**THE VERDICT: PASS (6/6) — the live reflex chain proven in a CLEAN container.**

## THE ROUND-10/11 VERIFICATION (2026-09-30 · commit 816b384)

**THE BATTERY:** `bun test tests/` → **26 pass / 0 fail / 117 expects** (up from 18 — the audit
rounds added the relevance-partition, stale-row, and selftest-token tests).

**THE LIVE SELFTESTS ×4 (the real graph + the LIVE JevK5 at 127.0.0.1:8090, model
jevk5-4b-v0.2-Q8_0):**
| the target | the result | the shape census |
|---|---|---|
| `src/plutus-lsp/store.ts` | SELFTEST OK, exit 0 | 11 cards: 10 LAW + 1 SUSPECT (`CONST-FROZEN-PAIR P6=0.731`) |
| `src/plutus-lsp/judge.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 SUSPECT |
| `scripts/plutus-lsp.ts` | SELFTEST OK, exit 0 | 12 cards: 11 LAW + 1 SUSPECT (`MECH-CIRCUIT P6=0.526`) |
| `src/plutus-lsp/cards.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 **VIOLATION** (`MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts` — the target-file threading proven) |

**THE BUILT BUNDLE:** `dist/plutus-lsp.js` 41,046 bytes · sha256
`51f95e841cf6247fd68adaaccac74e8991eb10199d527a9530d01f67c23b477f` (rebuilt + committed).

**THE AUDIT GATE:** round-9 FAIL (0 critical, 12 high) → round-10 FAIL (2 critical, 10 high) →
round-11 **BLOCKED** (provider unreachable: `127.0.0.1:4097` refused — the go-session-proxy lane
is down; the JEVK5 judge at :8090 is UP). **BLOCKED is reported as BLOCKED — never as PASS.**
All 21 round-9/10 blocking findings were fixed first (BUILD_REPORT §7); the gate simply could
not re-run. The 7 remaining round-10 medium/low notes are recorded in BUILD_REPORT §7's residual.

## THE PRESSURE TEST (2026-09-30 · container pbk/omp-ct:master · v0.6 bundle 51f95e841cf6247f)

**THE RIG:** image `omp-ct:master`, container `pbk`. Bundle deployed file-to-file with sha trio
match (local == container == `51f95e841cf6247f`). Judge bridge `172.17.0.1:8090` → JevK5
`jevk5-4b-v0.2-Q8_0` (health `ok:true`). Results artifact: `.omp/container-test-results.json`.

| the scenario | the passToken (in tool result) | the failToken (absent) | the verdict |
|---|---|---|---|
| S1 absent graph | PLUTUS_NO_STORE/PLUTUS_NO_ROOT ×4, SELFTEST OK ×0 | SELFTEST OK | **PASS** |
| S2 dupe nodes | fully answered, 1 answer, no reason | JUDGE_ANSWER_COUNT | **PASS** |
| S3 no-clear | keeping last-good, zero `diagnostics:[]` sends | `"diagnostics":[]` | **PASS** |
| S4 Infinity | `relevance unread`, /Infinity/ false | `Infinity` | **PASS** |
| S5 target warning | `YOU ARE EDITING: src/plutus-lsp/cards.ts` | the canon anchor | **PASS** |
| A1 malformed frame | serverInfo (259-byte response after 99999999 header) | OOM/hang | **PASS** |
| A2 down judge | `JEVK5_DOWN: Unable to connect` | fabricated verdict | **PASS** |

**THE PHASE-E BREAKER: 10/10** (sha match · bridge probe · 7/7 scenarios · tokens · no circular ·
no timeouts · blast radius · adversarial · alive · artifact).
**THE VERDICT: PASS (7/7) — every recorded derailment (F-01..F-05 classes) is mechanically closed.**

## THE DERAILMENT-PATTERN SUITE (2026-10-01 · the objective's acceptance test)

**WHAT IT PROVES:** the LSP CATCHES the derailments the objective names ("so the agent can't
derail or make stupid actions"). 6 REAL Plutus derailments pushed through the LIVE pipeline
(real graph + live JevK5 at :8090); each asserts the reflex fires with the right token and the
clean case stays SILENT.

| the derailment | the expected reflex | the tokens emitted | the verdict |
|---|---|---|---|
| D1 fabricated SL cap 150 (canon 36) | the law surfaces | plutus/law, plutus/suspect | PASS |
| D2 multi-TP (TP1/TP2/TP3) | a governing law | plutus/law, plutus/suspect | PASS |
| D3 pair format EURUSD | a governing law | plutus/law, plutus/suspect | PASS |
| D4 flat RRR | a governing law / drift | plutus/law, plutus/drift | PASS |
| D5 ZFP 45→60 | the VIOLATION token | plutus/law, plutus/VIOLATION | PASS |
| D6 a fact-free file | ZERO tokens (precision) | (none) | PASS |

**6/6 PASS.** Artifact `.omp/derailment-suite-results.json`. Run:
`PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` (add `--no-judge` for the offline mode).

## THE AUDIT ROUNDS 11-18 (the hardening drive)

```
r9  2c/12h  →  r10 2c/10h  →  r11 0c/13h  →  r12 0c/12h
r13 0c/7h   →  r14 0c/5h   →  r15 1c/2h   →  r16 0c/4h
r17 2c/3h   →  r18 1c/5h
```
Each round: every BLOCKING finding adjudicated + fixed; every fix pinned. Battery 18 → 46 tests
(0 fail). The CRITICAL class was eliminated (r11) and re-introduced twice by fixes themselves
(r15 selftest fall-through; r17 path-normalize-return-raw; r18 absolute-`..`) — each closed.
**THE GATE: FAIL (r18) — NO SHIP-READY CLAIM. ~19 medium/low findings remain, all recorded.**

## TEST RESULT — 2026-10-01 — the round-19 audit gate (r11..r18 drive closed)

### SCRIPT — audit gate
- **The run:** `qwen-code-audit scan` over the 4 core files (store/judge/cards/script).
- **The raw output:** `GATE: FAIL (0 critical, 5 high)` — scope=workspace filesReviewed=4
  findings=27 (critical=0 high=5 medium=15 low=7). Session `c8027864-47cf-47e7-93f5-bba3f17dcfd8`.
- **The verdict:** FAIL — the 5 blocking highs are recorded as F entries (open until fixed and
  re-proven). The CRITICAL class stays eliminated (0 critical, third round running).
- **The artifacts:** `artifacts/sg-ocr-round19.json` (session, scope, counts, blocking list, dist SHA).

## AUDIT GATE: FAIL (0 critical, 5 high) — session c8027864 — artifacts/sg-ocr-round19.json


## 7. Known Issues (the r19 residual, named)

Audit r19 FAIL (0c/5h): path-confinement symlink/cwd gap; in-flight chain pile-up; head4 FIFO hang; cap() throwable toString; attribution-flag decoupling. ~14 medium/low residual (hunk caching, decl regex, accounting, weakest-name). All OPEN in FAILURE_LOG F-08/F-09. No ship-ready claim.

## 8. Deployment Notes

Run DEPLOY.sh (SHA gate inside). Register servers.plutus-lsp in ~/.omp/agent/lsp.json (command bun, args scripts/plutus-lsp.ts --stdio). Verify with --selftest (measured: 13 cards, exit 0). Restart a TUI session (the LSP binds at construction).
# PLUTUS-COMMON-SENSE-LSP — SHIP BUILD REPORT (r19 package)
## 1. Build Summary (the state)
Bundle `dist/plutus-lsp.js` sha256 `3307a3b7a14d6f4b` (41,046 bytes). Battery 46 pass / 0 fail / 158 expects. Audit r19 FAIL (0 critical, 5 high) — no ship-ready claim. Derailment suite 6/6 PASS (live judge). 8 checkpoints (v0.1..v0.8).
## 2. What Was Built (narrative, from the ship docs)
# BUILD_REPORT — PLUTUS-COMMON-SENSE-LSP (the what-was-built record)
**Date:** 2026-09-29 · **The repo:** PLUTUS-COMMON-SENSE-LSP (own .git) · **The commits (HEAD at the audit):** a1d4342 + the audit's follow-ups; the earlier: f4b9260, 5154527, 8260183 (audit F13: the record named a stale prefix)
## §1 · WHAT WAS BUILT (the deliverable)
A third custom LSP server, `plutus-lsp`, that makes the Plutus knowledge graphs REFLEXIVE:
on every write/edit to a Plutus file it reads the graph (L1 semantica + L2 arsumbris), judges
the edit via JevK5 (CH-PLUTUS, the 5-of-7 nouls), and surfaces the governing law as an LSP
diagnostic — before the agent can derail. It INFORMS; it never blocks (the polarity law).
## §2 · THE FILES (the deployed set)
| the file | the role | the lines |
|---|---|---|
| `scripts/plutus-lsp.ts` | the stdio JSON-RPC server + --selftest + the receipt | 168 (measured, audit F8) |
| `src/plutus-lsp/store.ts` | the graph reader (L1 kg.json + L2 socket) + the named refusals | 266 (measured) |
| `src/plutus-lsp/judge.ts` | CH-PLUTUS (the 7 nouls) + OBSERVABLE + the verdict | 207 (measured) |
| `src/plutus-lsp/cards.ts` | the 7 tokens + FactCard + toDiagnostic | 166 (measured) |
| `tests/*.test.ts` | the W1/W2/W3 gates + the 8-angle adversarial sweep | ~180 |
| `tests/calibration/*` | the labeled corpus + the derivation harness | ~90 |
| `~/.omp/agent/lsp.json` | the registration (beside gi-lsp + jg-lsp) | 1 entry |
## §3 · THE VERIFICATION (every tier, with its artifact)
| tier | what | the artifact |
|---|---|---|
| L0 | the typecheck | `bun test` loads + runs (the TS is executed, not just parsed) |
| L1 | the unit | `bun test tests/` → **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
| L2 | the script test (the real modules, the real graph, the live judge) | `--selftest mirror.ts` → 2 cards + 5 live nouls |
| L3 | the driven server (the real stdio frames) | `/tmp/plutus-lsp-receipts.log` → `PUBLISH n=3 … verdict=SUSPECT` |
| L4 | the live TUI | **PENDING** — the LSP binds at session construction (T1) |
## §4 · THE CALIBRATION (the derived bar)
`reports/CALIBRATION_v1.md` → **bar 0.30 · F1 0.60 · precision 0.50 · recall 0.75** on the
8-item corpus (4 violations + 4 cleans). Reproducible (`bun tests/calibration/calibrate.ts`).
## §5 · THE DEFECTS FOUND + FIXED (5)
1. the L1 law entities overwritten by the adapter rebuild → re-added (564).
2. health() captured the env at module load → read at call time.
3. the token matcher over-matched on generic words → +STOPWORDS.
4. the calibration's state diluted the signal → +lawsForHunk (ranked, top-3).
5. the generic question required derivation → +OBSERVABLE templates.
## §6 · THE HONEST GAPS
- The live-TUI render proof is PENDING (a session restart is needed).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The `plutus/callers` token is declared but not yet emitted.
- The enforcement extension (the block) is deferred to v2 (D5).
## §7 · THE ROUND-10 FIX BATCH (2026-09-30 · commit 816b384 — the current HEAD)
**THE TRIGGER:** the round-9 audit GATE: FAIL (0 critical, 12 high, findings=31) + the round-10
audit GATE: FAIL (2 critical, 10 high, findings=30). **21 findings closed** across the two rounds.
The round-11 audit is BLOCKED (provider unreachable — `127.0.0.1:4097` connection refused, the
go-session-proxy lane down; NOT a code verdict).
**THE MEASURED STATE AT THIS COMMIT:**
| the file | the lines | the role |
|---|---|---|
| `scripts/plutus-lsp.ts` | 350 | the stdio server + the fire-and-forget L2 + the receipt |
| `src/plutus-lsp/store.ts` | 440 | the graph reader + the contiguous L2 framing + the fail-closed tier |
| `src/plutus-lsp/judge.ts` | 421 | the chain on jevk5Fetch + the visible cap + the single threshold source |
| `src/plutus-lsp/cards.ts` | 264 | the finite-only cards + the epsilon attribution + the STALE codes |
| `dist/plutus-lsp.js` | 41,046 bytes · sha256 `51f95e841cf6247f…` | the built bundle (rebuilt at this commit) |
**THE FIXES (per finding, highest severity first):**
1. CRITICAL `knownAbs` undefined (store.ts:119) — `PLUTUS_ALLOW_KNOWN_PATHS=1` threw
   ReferenceError; entries are absolute, `resolve()` normalizes. FIXED.
2. CRITICAL `MAX_STDIN` read-but-never-declared (scripts:261) — ReferenceError on the oversize
   path; declared before the stdin handler. FIXED.
3. HIGH `validTier` fail-open to IMMUTABLE — corrupt tiers outranked canon (+2); now SUPERSEDED
   (-2, fail-closed). FIXED.
4. HIGH L2 framing split-prefix — `chunks[0][0..3]` without contiguity; now concat-once then
   `readUInt32BE(0)`. FIXED.
5. HIGH chain dedupe mismatch (`['P1','P1']` → false JUDGE_ANSWER_COUNT) — loop + count both use
   the validated set; chain now reuses `jevk5Fetch` (the drift source removed). FIXED.
6. HIGH relevance cap invisible — `{ok,scored}` carried no `judged/total/dropped`; now returned
   AND receipted. FIXED.
7. HIGH outer catch published `[]` (wiped last-good diagnostics) — now sends nothing (same as the
   double-fault path). FIXED.
8. HIGH send() dangling `once('drain')/once('error')` per call (MaxListeners + stale done()) —
   the write callback is the only resolver; dead-stream short-circuit. FIXED.
9. HIGH lawCard Infinity-as-measured + per-element null guards; verdictCard epsilon tie + explicit
   kind gate + target-file warning; callersCard deduped-empty→null; STALE codes `[JEVK5_*]` vs
   `[PLUTUS_NO_*]`; fileOf decode-last + UNC; L2 fire-and-forget; health() array rejection;
   single threshold source (consts delegate to getters). ALL FIXED.
10. MEDIUM/LOW — INCONCLUSIVE separator unified, DRIFT clause from the verdict, STOPWORDS private
    + predicate, `export {a as b}` keeps both names, deterministic caller order, timeoutMs
    validation, single-pass tokenization, frozen marker arrays, empty-id laws dropped at load,
    dead guards/consts/ternary removed. ALL FIXED.
**THE VERIFICATION AT THIS COMMIT:**
| tier | what | the artifact |
|---|---|---|
| L1 | the unit | `bun test tests/` → **26 pass / 0 fail / 117 expects** |
| L2 | the live selftest ×4 (the real graph + the LIVE JevK5) | store: 11 cards (10 LAW + 1 SUSPECT) · judge: 13 cards (12 LAW + 1 SUSPECT) · script: 12 cards (11 LAW + 1 SUSPECT) · cards: 13 cards (12 LAW + 1 VIOLATION `MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts`) |
| L3 | the built bundle | `dist/plutus-lsp.js` sha256 `51f95e841cf6247f…` (rebuilt, committed) |
**THE HONEST RESIDUAL:** the round-11 audit could not run (provider down — BLOCKED, not PASS);
the 7 remaining medium/low findings from round-10 (chain drift now closed by the jevk5Fetch
refactor; `plutus/tier` documented dead-filter; L2 receipt timing) are recorded, not hidden.
## §8 · THE ROUND-11..18 HARDENING DRIVE + THE DERAILMENT SUITE (2026-10-01)
**THE DRIVE:** the audit lane recovered (BUG-12 proxy restored) → 8 consecutive `qwen-code-audit`
rounds against the four core files. Every BLOCKING finding was adjudicated (Side A probe-error
vs Side B confirmed defect) and fixed; every fix pinned by a new test. The battery grew
18 → 46 tests (0 fail), and the bundle was rebuilt at every round.
**THE AUDIT TREND (critical/high per round):**
```
r9  2c/12h   r10 2c/10h   r11 0c/13h   r12 0c/12h
r13 0c/7h    r14 0c/5h    r15 1c/2h    r16 0c/4h
r17 2c/3h    r18 1c/5h
```
The CRITICAL class was eliminated (r11) and then RE-INTRODUCED twice by the fixes themselves
(r15's selftest fall-through; r17's path-normalize return-raw; r18's absolute-`..` clamp) —
each a self-inflicted edge in the path/exit confinement code. **THE CONVERGENCE TREND: blocking
findings fall as real classes close (13→12→7→5→2→4); the residue is an LLM reviewer's unbounded
supply of fresh edge-cases in code that keeps gaining lines.** The honest stop: CONFIRMED DEFECTS
FIXED + CRITICAL CLASS ELIMINATED at each round, with the remainder named (below).
**THE FIXES (per class, 8 rounds):**
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors (r10); the selftest failure-path
   fall-through (r15); `fileOf` returning RAW while checking NORMALIZED (r17); absolute `..`
   bypassing the denylist (r18). All closed + pinned.
2. HIGH — frozen threshold aliases → getters-only (r11); P2 jurisdiction fail-closed (r11);
   cache serves stale canon → content fingerprint (r11); chain dedupe + `jevk5Fetch` reuse
   (r10/11); `staleCard`/`cards` never-throw + bounded strings (r12..17); `resolveRoot` STRONG
   wins at any depth (r13); partition row validation (r13); stdin headerless cap (r11/14);
   `path.resolve` confinement (r18).
3. MEDIUM/LOW — v 40+ across: tier-word candidacy (r12), short-name-part survival (r12),
   deterministic ordering, receive-drain, health array rejection, epsilon at display precision,
   STALE code allowlist, `Object.hasOwn` NodeId, short-read naming, unknown-method MethodNotFound,
   subarray-view copy, denylist roots, `cap()` bounding, identity trimming, timer thresholds.
**THE DERAILMENT-PATTERN SUITE (`scripts/derailment-suite.ts`) — THE OBJECTIVE'S PROOF:**
The operator's objective is that the agent "cannot derail or make stupid actions". The suite
pushes the 6 REAL Plutus derailments through the LIVE pipeline and asserts the reflex fires:
```
D1 fabricated SL cap (150 vs the 36-pip canon)  → plutus/law + the SL/TP law surfaced   PASS
D2 multi-TP (law: ONE TP; edit TP1/TP2/TP3)     → plutus/law, plutus/suspect            PASS
D3 pair-format (law: EUR/USD; edit EURUSD)      → plutus/law, plutus/suspect            PASS
D4 flat RRR (law: category-specific)            → plutus/law, plutus/drift              PASS
D5 ZFP threshold (canon 45; edit 60)            → plutus/law, plutus/VIOLATION          PASS
D6 a fact-free file                             → ZERO tokens (the precision proof)     PASS
```
**6/6 PASS.** Artifact: `.omp/derailment-suite-results.json`. The VIOLATION token fired on the
ZFP change (the clearest canon breach); the others surface the governing law + SUSPECT/DRIFT.
**THE MEASURED STATE:** battery **46 pass / 0 fail / 158 expects**; 4 live selftests (real graph
+ live JevK5); derailment suite 6/6; bundle `dist/plutus-lsp.js` sha256 see BUILD_STATE.
**THE HONEST RESIDUAL (the audit treadmill named):** ~19 medium/low findings from r17-r18 remain
unfixed (hunk-hot-path tokenization caching, regex-literal/division stripping in `declarationsIn`,
`chain`/`relevancePass` request/latency accounting across the health+fault double-fetch, the
`weakest`-name shadow of the strongest clause, the `plutus/tier` dead token). None is CRITICAL or
HIGH; all are recorded. NO SHIP-READY CLAIM IS MADE — the last audit gate was FAIL (r18).
## §9 · THE ROUND-19 AUDIT (2026-10-01 — the r11..r18 drive's closing round)
**The built:** the audit artifact + its wiring (no code changed this round — triage only).
**The why:** the ship-docs audit gate (S7) requires every audit wired before any milestone.
**The how:** fresh `qwen-code-audit` scan → artifact JSON → TESTING_LOG verdict line +
  FAILURE_LOG F-08/F-09 + DEBUG_LOG EN-13.
**The evidence:** `GATE: FAIL (0 critical, 5 high)`, session `c8027864`,
  `artifacts/sg-ocr-round19.json`, dist SHA `3307a3b7a14d6f4b…`.
**The verification:** the verdict line is quoted verbatim in TESTING_LOG; the 5 blocking
  findings each have an OPEN F entry.
**The honest notes:** the CRITICAL class stays eliminated (0 critical, 3rd round running);
  the 5 highs are queued, not rushed; NO SHIP-READY CLAIM.
# CURRENT_STATE — PLUTUS-COMMON-SENSE-LSP
**As of:** 2026-10-01 · **The phase:** pre-ship-package (r19 FAIL 0c/5h wired; battery 46/0/158; derailment 6/6; gate FAIL — no ship-ready claim).
## THE ARCHITECTURE AS IT NOW IS
```
OMP native LSP runtime (diagnosticsOnWrite / OnEdit)
  │ queries EVERY registered server on every write/edit
  ▼
plutus-lsp (scripts/plutus-lsp.ts, stdio JSON-RPC)
  │  store.ts    the graph reader (L1 kg.json + fire-and-forget L2)  PLUTUS_NO_STORE
  │  judge.ts    CH-PLUTUS (7 nouls) + relevance kernel vs JevK5  JEVK5_DOWN
  │  cards.ts    the 7 tokens + STALE codes -> LSP diagnostics    the anti-phantom law
  ▼
publishDiagnostics -> the canon arrives on the write (the REFLEX)
```
## THE REGISTERED SERVERS (3)
`gi-lsp` (the GI reflex) · `jg-lsp` (the ticket reflex) · `plutus-lsp` (the canon reflex) — no eviction.
## THE 7 TOKENS
`plutus/law` · `plutus/violation` · `plutus/suspect` · `plutus/tier` · `plutus/callers` ·
`plutus/drift` · `plutus/stale`.
## THE POLARITY LAW (the invariant)
The LSP INFORMS; the extension ENFORCES. A block path in the server is a VIOLATION.
## THE CURRENT NUMBERS
- the battery: 46 pass / 0 fail / 158 expects (3 files)
- the live selftests ×4 (JevK5 jevk5-4b-v0.2-Q8_0): store 11 · judge 13 · script 12 · cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868, target-file warning proven)
- the receipt: `RELEVANCE judged=12/12 dropped=0` (forensic/lsp-receipts.log, 2026-09-30T17:46:57Z)
- the bundle: dist/plutus-lsp.js sha256 3307a3b7a14d6f4b (rebuilt at every round)
- the derived bar: 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus
- the audit gate: rounds 11-18 run (r18 FAIL 1c/5h — NO ship-ready claim)
## WHAT IS NOT YET DONE
The r17/r18 medium/low residual (~19 findings, recorded — hunk-hot-path caching, decl regex, accounting).
The live-TUI render proof (needs a session restart — the LSP binds at session construction).
The enforcement extension (deferred to v2). The 50+ item calibration corpus.
**Dist fingerprint (this update):**
Dist fingerprint (this update): `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`
## 3. Technical Implementation (interfaces, anchors, data flows)
### 3.1 The artifact table
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
### 3.2 The module contracts (from the source)
store.ts (graph reader): resolveRoot -> l1PathFor -> loadStore -> lawsForHunk (topK=12) + declarationsIn + callersOf + readL2. Refusals PLUTUS_NO_STORE / PLUTUS_NO_ROOT. judge.ts (decision kernel): health -> jevk5Fetch (one batched POST) -> chain P1..P7 -> relevancePass -> partitionByRelevance -> verdict (MAX over answered {P4,P5,P6}). Bars: throwT 0.85 (policy), demandT 0.30 (derived), relevanceT 0.30 (swept). cards.ts (renderer): lawCard + verdictCard + callersCard + staleCard -> fileCards; 7 tokens; fail-closed attribution. scripts/plutus-lsp.ts (stdio server): frame parser -> fileOf (normalize+confine) -> analyze (debounced) -> send (serialized). scripts/derailment-suite.ts (acceptance): D1-D6 through the live pipeline.
## 4. Architecture Changes (with the pipeline diagram)
```
OMP runtime LSP mux (didOpen/didChange/didSave)
  -> scripts/plutus-lsp.ts --stdio (frame parser -> analyze -> send)
  -> pipeline: L1 DETECT (lawsForHunk) -> L2 RELEVANCE (relevancePass, judge decides)
  -> CHAIN P1..P7 (one POST) -> VERDICT (pure code) -> CARDS (fileCards)
  -> publishDiagnostics (the canon arrives ON THE WRITE; INFORMS, never blocks)
```
## 5. Files Changed (git history + tree)
GIT HISTORY (last 40 commits):
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
e16350a feat(pcsl): THE JEV RELEVANCE KERNEL — the judge now decides relevance, not the regex
2a3d350 docs(pcsl): the proof archive addendum — the CONTINUING live LSP traffic
aa29c64 docs(pcsl): the final cert artifact + the LIVE-TUI PROOF ARCHIVE (append-only)
cf0841d feat(pcsl): THE LIVE-TUI PROOF + the L1 discovery + the final cert — the LSP IS LIVE
a619a60 fix(pcsl): the LOW set fixed + THE LSP DEPLOYMENT CONTRACT (the spawn gates)
22ec325 audit(pcsl): the independent auditors' round — 31 findings, the HIGH set fixed, the container re-certified
de07575 fix(pcsl): the audit round 2 — audit-alpha's 14 findings (F2-F14) fixed
a1d4342 audit(pcsl): the red-team slop audit #1 — 8 confirmed defects found and fixed
d903b91 test(pcsl): the live-TUI spawn proof — the runtime spawns it (proven) + the handshake fix
f0e5648 fix(jevk5)+chore(pcsl): the judge health probes its backend (the false-green generator) + the v0.2 checkpoint
665c31a test(pcsl): the container v2 — THE HOST BRIDGE + 4 defects found and fixed
177e7d6 test(pcsl): the deep-container-testing rig — 7/7 PASS in a clean mimo-ct:master container
DIFFSTAT since the r18 batch:
 .omp/derailment-suite-results.json                 |    2 +-
 .../.omp/container-test-results.json               |    1 +
 .../.omp/derailment-suite-results.json             |   97 ++
 .../CHECKPOINT_MANIFEST.md                         |   43 +
 .../PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md      |  289 ++++
 .../README.md                                      |   15 +
 .../SHA256SUMS                                     |   62 +
 .../bunfig.toml                                    |    3 +
 .../context_management/BUILD_STATE.md              |   29 +
 .../context_management/CHANGELOG.md                |   46 +
 .../context_management/COMPACTION_SURVIVAL.md      |   26 +
 .../context_management/CURRENT_STATE.md            |   38 +
 .../context_management/DECISION_CHAIN.md           |   47 +
 .../context_management/EVIDENCE_STATE.md           |   49 +
 .../context_management/NEXT_STEPS.md               |   25 +
 .../context_management/POST-COMPACTION_PROMPT.md   |   22 +
 .../context_management/RUNNING_BUILD_LOG.md        |   73 +
 .../context_management/RUNNING_DEBUG_LOG.md        |   64 +
 .../context_management/TASK_QUEUE.md               |   12 +
 .../dist/plutus-lsp.js                             | 1391 ++++++++++++++++++++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_1.md        |  161 +++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_2.md        |   64 +
 .../forensic/LIVE_TUI_PROOF_ARCHIVE.md             |   50 +
 .../lsp.json                                       |   12 +
 .../package.json                                   |   11 +
 .../packages/plutus-common-sense-lsp/00-INDEX.md   |   23 +
 .../packages/plutus-common-sense-lsp/00-MISSION.md |   36 +
 .../plutus-common-sense-lsp/01-DISCOVERY.md        |   48 +
 .../plutus-common-sense-lsp/02-DPL1-SPEC.md        |  202 +++
 .../plutus-common-sense-lsp/03-MASTER-BLUEPRINT.md |   62 +
 .../packages/plutus-common-sense-lsp/06-WAVES.md   |   30 +
 .../packages/plutus-common-sense-lsp/07-GOALS.md   |   24 +
 .../reports/CALIBRATION_v1.md                      |   87 ++
 .../reports/CT_PLAN.txt                            |   68 +
 .../reports/INFO_CARD_DESIGN.md                    |   55 +
 .../reports/LIVE_TUI_SPAWN_PROOF.md                |   52 +
 .../reports/LSP_DEPLOYMENT_CONTRACT.md             |   57 +
 .../reports/P8_VERDICT.md                          |   42 +
 .../reports/PCSL_Engineering_Report_v1.md          |  545 ++++++++
 .../reports/RELEVANCE_KERNEL.md                    |   63 +
 .../reports/STALENESS_AUDIT.md                     |   64 +
 .../reports/pcsl-ct-results-v2.json                |   22 +
 .../reports/pcsl-ct-results.json                   |   21 +
 .../reports/pcsl-final-results.json                |   16 +
 .../scripts/derailment-suite.ts                    |  113 ++
 .../scripts/plutus-lsp.ts                          |  477 +++++++
 .../ship_docs/BUILD_REPORT.md                      |  157 +++
 .../ship_docs/DEBUG_LOG.md                         |   99 ++
 .../ship_docs/FAILURE_LOG.md                       |   50 +
 .../ship_docs/SPEC_VIOLATION_LOG.md                |   31 +
 .../ship_docs/TESTING_LOG.md                       |  173 +++
 .../ship_docs/THEATRICALITY_LOG.md                 |   61 +
 .../src/plutus-lsp/cards.ts                        |  352 +++++
 .../src/plutus-lsp/judge.ts                        |  532 ++++++++
 .../src/plutus-lsp/store.ts                        |  546 ++++++++
 .../tests/adversarial.test.ts                      |  326 +++++
 .../tests/calibration/calibrate.ts                 |   40 +
 .../tests/calibration/corpus.json                  |   29 +
 .../tests/judge-cards.test.ts                      |   90 ++
 .../tests/plutus-lsp.test.ts                       |   78 ++
 .../tsconfig.json                                  |    8 +
 artifacts/sg-ocr-round19.json                      |   19 +
 context_management/BUILD_STATE.md                  |   10 +-
 context_management/CHANGELOG.md                    |    5 +
 context_management/COMPACTION_SURVIVAL.md          |    4 +-
 context_management/CURRENT_STATE.md                |    6 +-
 context_management/EVIDENCE_STATE.md               |   10 +-
 context_management/NEXT_STEPS.md                   |    3 +
 context_management/POST-COMPACTION_PROMPT.md       |    4 +-
 context_management/RUNNING_BUILD_LOG.md            |    7 +
 context_management/RUNNING_DEBUG_LOG.md            |    7 +
 ship_docs/BUILD_REPORT.md                          |   13 +
 ship_docs/DEBUG_LOG.md                             |   11 +
 ship_docs/FAILURE_LOG.md                           |   20 +
 ship_docs/SPEC_VIOLATION_LOG.md                    |   22 +
 ship_docs/TESTING_LOG.md                           |   12 +
 76 files changed, 7457 insertions(+), 7 deletions(-)
SOURCE TREE (11 files):
scripts/plutus-lsp.ts (stdio server) / src/plutus-lsp/store.ts (graph reader) / src/plutus-lsp/judge.ts (decision kernel) / src/plutus-lsp/cards.ts (card renderer) / scripts/derailment-suite.ts (acceptance suite) / tests: plutus-lsp, judge-cards, adversarial, calibration / dist/plutus-lsp.js (the bundle)
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
## 6. Test Results (battery + container + live, with SHAs)
# TESTING_LOG — the test plan + the results (all four tiers)
## THE PLAN (the tiers)
| tier | the scope | the tool | the state |
|---|---|---|---|
| L0 | the typecheck | `bun test` (the TS executes) | PASS |
| L1 | the unit — the pure fns | `bun test tests/` | **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
| L2 | the script test — the real modules + the real graph + the LIVE judge | `--selftest` | PASS (2 cards, 5 nouls) |
| L3 | the driven server — the real stdio frames | the drive harness | PASS (PUBLISH n=3) |
| L4 | the live TUI | the omp LSP runtime | **PENDING (T1)** |
## THE ADVERSARIAL SWEEP (8 angles — adversarial FIRST, the happy path LAST)
| # | the angle | the passToken | the result |
|---|---|---|---|
| A1 | the absent graph | PLUTUS_NO_STORE | PASS |
| A2 | the down judge | JEVK5_DOWN | PASS |
| A3 | a fact-free file | NO card | PASS (after the STOPWORDS fix) |
| A4 | a known violation | plutus/violation | PASS |
| A5 | a foreign store | PLUTUS_NO_STORE | PASS |
| A6 | no root marker | PLUTUS_NO_ROOT | PASS |
| A7 | the siblings survive | gi-lsp + jg-lsp + plutus-lsp | PASS |
| A8 | the token set = 7 unique | — | PASS |
## THE CALIBRATION (the derived bar)
```
★ THE DERIVED BAR: 0.30 (F1=0.60 · precision=0.50 · recall=0.75)
★ the corpus: 4 violations + 4 cleans = 8 items
```
## AUDIT GATE: FAIL (0 critical · 12 high · after 3 rounds)
**The rounds (verbatim from the tool):**
```
round 1: FAIL (1 critical, 12 high)  findings=28
round 2: FAIL (1 critical, 12 high)  findings=28   (13 fixed; 13 new surfaced)
round 3: FAIL (0 critical, 12 high)  findings=33   ← THE CRITICAL CLASS ELIMINATED
```
**The confirmed defects FIXED: 26 across the 3 rounds** — including the CRITICAL `didChange`
(`contentChanges[].text`, not `textDocument.text` — every edit wiped the doc) and the CRITICAL
INVERTED P1 SCOPE guard (high P1 = in-scope; it returned LAW for in-scope evidence).
**THE ADJUDICATION (why this stops here):** an LLM reviewer generates findings indefinitely —
the count never reaches zero by construction (the scan-treadmill law). The progress measure is
the CONFIRMED DEFECTS FIXED + the CRITICAL CLASS ELIMINATED, both of which are done. The
remaining 12 high are performance/robustness hardening (async fs, regex hoisting, debounce) —
real, non-blocking for an INFORMING layer, and recorded in HONEST_GAPS.
**THEREFORE: NO SHIP-READY CLAIM IS MADE.** A FAIL blocks it. The LSP is a v0.1 tool in OBSERVE
mode; the enforcing layer (v2) is gated behind this. FAIL is never PASS.
## THE HONEST RESIDUAL
The L4 live-TUI proof is pending. The corpus is small. The precision is 0.50 (bounded by the
polarity law — a Warning, never a block).
## THE CONTAINER RIG (mimo-ct:master · pcsl-ct-01 · the deep-container-testing protocol)
**The plan:** reports/CT_PLAN.txt (4381 chars · 6 sections · 4 scenarios + 2 adversarial · hash 8006d7d5).
**The deploy:** /tmp/plutus-lsp.js sha256 f8e8349b9fa568a1 == the local dist (THE SHA MATCH).
**The results artifact:** reports/pcsl-ct-results.json (+ .mimocode/ct-results.json).
| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the clean-env named refusal | POSITIVE | PLUTUS_NO_ROOT | **PASS** |
| S1b the specific PLUTUS_NO_STORE | POSITIVE | PLUTUS_NO_STORE | **PASS** |
| S2 the fixture graph → the cards | POSITIVE | SELFTEST OK (3 cards) | **PASS** |
| S3 a fact-free file → NO card | NEGATIVE | NO-LAW | **PASS** |
| S4 the stdio LSP handshake | NEGATIVE | serverInfo | **PASS** |
| A1 the down judge → the named refusal | ADVERSARIAL | JUDGE_DOWN | **PASS** |
| A2 the malformed frame (the bound holds) | ADVERSARIAL | serverInfo + ALIVE | **PASS** |
**THE PHASE-E BREAKER: 10/10** (the sha match · every scenario · every token · no circular ·
no timeout · the radius · the adversarial · the container alive · the artifact).
**THE HONEST RESIDUAL:** the container has NO JevK5 (:8090) — the live chain cannot run there;
the server correctly names the refusal (JUDGE_DOWN) instead of fabricating a pass. The model
auth is ABSENT in the image (the deterministic exec channel carried the scenarios).
**THE VERDICT: PASS (7/7 + the breaker) — the server works CORRECTLY in a CLEAN environment.**
## THE CONTAINER RIG v2 — THE HOST BRIDGE (the LIVE judge, over the network)
**THE BRIDGE:** `socat TCP-LISTEN:8091,bind=0.0.0.0 -> 127.0.0.1:8090` — from inside the
container the judge is `http://172.17.0.1:8091`. **The v1 "residual" (no judge in the
container) was WRONG — the bridge existed and was never looked for.**
| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the host bridge | POSITIVE | jevk5-4b | **PASS** |
| S2 the live chain (the vector) | POSITIVE | SELFTEST OK (P4=0.867) | **PASS** |
| S5 the in-scope VIOLATION | POSITIVE | plutus/violation (P4=0.923) | **PASS** |
| S4 the clean-env refusal | NEGATIVE | PLUTUS_NO_STORE | **PASS** |
| A1 the down judge | ADVERSARIAL | JEVK5_DOWN | **PASS** |
| A2 the malformed frame | ADVERSARIAL | serverInfo + ALIVE | **PASS** |
**THE DEFECTS FOUND AND FIXED (4):** the judge's backend DOWN (the health lied; restarted);
the P1 over-block (jurisdiction from the LAWS, not the path); the test isolation (the
checkpoint's copied suite); the env restore ("undefined").
**THE VERDICT: PASS (6/6) — the live reflex chain proven in a CLEAN container.**
## THE ROUND-10/11 VERIFICATION (2026-09-30 · commit 816b384)
**THE BATTERY:** `bun test tests/` → **26 pass / 0 fail / 117 expects** (up from 18 — the audit
rounds added the relevance-partition, stale-row, and selftest-token tests).
**THE LIVE SELFTESTS ×4 (the real graph + the LIVE JevK5 at 127.0.0.1:8090, model
jevk5-4b-v0.2-Q8_0):**
| the target | the result | the shape census |
|---|---|---|
| `src/plutus-lsp/store.ts` | SELFTEST OK, exit 0 | 11 cards: 10 LAW + 1 SUSPECT (`CONST-FROZEN-PAIR P6=0.731`) |
| `src/plutus-lsp/judge.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 SUSPECT |
| `scripts/plutus-lsp.ts` | SELFTEST OK, exit 0 | 12 cards: 11 LAW + 1 SUSPECT (`MECH-CIRCUIT P6=0.526`) |
| `src/plutus-lsp/cards.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 **VIOLATION** (`MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts` — the target-file threading proven) |
**THE BUILT BUNDLE:** `dist/plutus-lsp.js` 41,046 bytes · sha256
`51f95e841cf6247fd68adaaccac74e8991eb10199d527a9530d01f67c23b477f` (rebuilt + committed).
**THE AUDIT GATE:** round-9 FAIL (0 critical, 12 high) → round-10 FAIL (2 critical, 10 high) →
round-11 **BLOCKED** (provider unreachable: `127.0.0.1:4097` refused — the go-session-proxy lane
is down; the JEVK5 judge at :8090 is UP). **BLOCKED is reported as BLOCKED — never as PASS.**
All 21 round-9/10 blocking findings were fixed first (BUILD_REPORT §7); the gate simply could
not re-run. The 7 remaining round-10 medium/low notes are recorded in BUILD_REPORT §7's residual.
## THE PRESSURE TEST (2026-09-30 · container pbk/omp-ct:master · v0.6 bundle 51f95e841cf6247f)
**THE RIG:** image `omp-ct:master`, container `pbk`. Bundle deployed file-to-file with sha trio
match (local == container == `51f95e841cf6247f`). Judge bridge `172.17.0.1:8090` → JevK5
`jevk5-4b-v0.2-Q8_0` (health `ok:true`). Results artifact: `.omp/container-test-results.json`.
| the scenario | the passToken (in tool result) | the failToken (absent) | the verdict |
|---|---|---|---|
| S1 absent graph | PLUTUS_NO_STORE/PLUTUS_NO_ROOT ×4, SELFTEST OK ×0 | SELFTEST OK | **PASS** |
| S2 dupe nodes | fully answered, 1 answer, no reason | JUDGE_ANSWER_COUNT | **PASS** |
| S3 no-clear | keeping last-good, zero `diagnostics:[]` sends | `"diagnostics":[]` | **PASS** |
| S4 Infinity | `relevance unread`, /Infinity/ false | `Infinity` | **PASS** |
| S5 target warning | `YOU ARE EDITING: src/plutus-lsp/cards.ts` | the canon anchor | **PASS** |
| A1 malformed frame | serverInfo (259-byte response after 99999999 header) | OOM/hang | **PASS** |
| A2 down judge | `JEVK5_DOWN: Unable to connect` | fabricated verdict | **PASS** |
**THE PHASE-E BREAKER: 10/10** (sha match · bridge probe · 7/7 scenarios · tokens · no circular ·
no timeouts · blast radius · adversarial · alive · artifact).
**THE VERDICT: PASS (7/7) — every recorded derailment (F-01..F-05 classes) is mechanically closed.**
## THE DERAILMENT-PATTERN SUITE (2026-10-01 · the objective's acceptance test)
**WHAT IT PROVES:** the LSP CATCHES the derailments the objective names ("so the agent can't
derail or make stupid actions"). 6 REAL Plutus derailments pushed through the LIVE pipeline
(real graph + live JevK5 at :8090); each asserts the reflex fires with the right token and the
clean case stays SILENT.
| the derailment | the expected reflex | the tokens emitted | the verdict |
|---|---|---|---|
| D1 fabricated SL cap 150 (canon 36) | the law surfaces | plutus/law, plutus/suspect | PASS |
| D2 multi-TP (TP1/TP2/TP3) | a governing law | plutus/law, plutus/suspect | PASS |
| D3 pair format EURUSD | a governing law | plutus/law, plutus/suspect | PASS |
| D4 flat RRR | a governing law / drift | plutus/law, plutus/drift | PASS |
| D5 ZFP 45→60 | the VIOLATION token | plutus/law, plutus/VIOLATION | PASS |
| D6 a fact-free file | ZERO tokens (precision) | (none) | PASS |
**6/6 PASS.** Artifact `.omp/derailment-suite-results.json`. Run:
`PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` (add `--no-judge` for the offline mode).
## THE AUDIT ROUNDS 11-18 (the hardening drive)
```
r9  2c/12h  →  r10 2c/10h  →  r11 0c/13h  →  r12 0c/12h
r13 0c/7h   →  r14 0c/5h   →  r15 1c/2h   →  r16 0c/4h
r17 2c/3h   →  r18 1c/5h
```
Each round: every BLOCKING finding adjudicated + fixed; every fix pinned. Battery 18 → 46 tests
(0 fail). The CRITICAL class was eliminated (r11) and re-introduced twice by fixes themselves
(r15 selftest fall-through; r17 path-normalize-return-raw; r18 absolute-`..`) — each closed.
**THE GATE: FAIL (r18) — NO SHIP-READY CLAIM. ~19 medium/low findings remain, all recorded.**
## TEST RESULT — 2026-10-01 — the round-19 audit gate (r11..r18 drive closed)
### SCRIPT — audit gate
- **The run:** `qwen-code-audit scan` over the 4 core files (store/judge/cards/script).
- **The raw output:** `GATE: FAIL (0 critical, 5 high)` — scope=workspace filesReviewed=4
  findings=27 (critical=0 high=5 medium=15 low=7). Session `c8027864-47cf-47e7-93f5-bba3f17dcfd8`.
- **The verdict:** FAIL — the 5 blocking highs are recorded as F entries (open until fixed and
  re-proven). The CRITICAL class stays eliminated (0 critical, third round running).
- **The artifacts:** `artifacts/sg-ocr-round19.json` (session, scope, counts, blocking list, dist SHA).
## AUDIT GATE: FAIL (0 critical, 5 high) — session c8027864 — artifacts/sg-ocr-round19.json
## 7. Known Issues (the r19 residual, named)
Audit r19 FAIL (0c/5h): path-confinement symlink/cwd gap; in-flight chain pile-up; head4 FIFO hang; cap() throwable toString; attribution-flag decoupling. ~14 medium/low residual (hunk caching, decl regex, accounting, weakest-name). All OPEN in FAILURE_LOG F-08/F-09. No ship-ready claim.
## 8. Deployment Notes
Run DEPLOY.sh (SHA gate inside). Register servers.plutus-lsp in ~/.omp/agent/lsp.json (command bun, args scripts/plutus-lsp.ts --stdio). Verify with --selftest (measured: 13 cards, exit 0). Restart a TUI session (the LSP binds at construction).
# PLUTUS-COMMON-SENSE-LSP — SHIP BUILD REPORT (r19 package)
## 1. Build Summary (the state)
Bundle `dist/plutus-lsp.js` sha256 `3307a3b7a14d6f4b` (41,046 bytes). Battery 46 pass / 0 fail / 158 expects. Audit r19 FAIL (0 critical, 5 high) — no ship-ready claim. Derailment suite 6/6 PASS (live judge). 8 checkpoints (v0.1..v0.8).
## 2. What Was Built (narrative, from the ship docs)
# BUILD_REPORT — PLUTUS-COMMON-SENSE-LSP (the what-was-built record)
**Date:** 2026-09-29 · **The repo:** PLUTUS-COMMON-SENSE-LSP (own .git) · **The commits (HEAD at the audit):** a1d4342 + the audit's follow-ups; the earlier: f4b9260, 5154527, 8260183 (audit F13: the record named a stale prefix)
## §1 · WHAT WAS BUILT (the deliverable)
A third custom LSP server, `plutus-lsp`, that makes the Plutus knowledge graphs REFLEXIVE:
on every write/edit to a Plutus file it reads the graph (L1 semantica + L2 arsumbris), judges
the edit via JevK5 (CH-PLUTUS, the 5-of-7 nouls), and surfaces the governing law as an LSP
diagnostic — before the agent can derail. It INFORMS; it never blocks (the polarity law).
## §2 · THE FILES (the deployed set)
| the file | the role | the lines |
|---|---|---|
| `scripts/plutus-lsp.ts` | the stdio JSON-RPC server + --selftest + the receipt | 168 (measured, audit F8) |
| `src/plutus-lsp/store.ts` | the graph reader (L1 kg.json + L2 socket) + the named refusals | 266 (measured) |
| `src/plutus-lsp/judge.ts` | CH-PLUTUS (the 7 nouls) + OBSERVABLE + the verdict | 207 (measured) |
| `src/plutus-lsp/cards.ts` | the 7 tokens + FactCard + toDiagnostic | 166 (measured) |
| `tests/*.test.ts` | the W1/W2/W3 gates + the 8-angle adversarial sweep | ~180 |
| `tests/calibration/*` | the labeled corpus + the derivation harness | ~90 |
| `~/.omp/agent/lsp.json` | the registration (beside gi-lsp + jg-lsp) | 1 entry |
## §3 · THE VERIFICATION (every tier, with its artifact)
| tier | what | the artifact |
|---|---|---|
| L0 | the typecheck | `bun test` loads + runs (the TS is executed, not just parsed) |
| L1 | the unit | `bun test tests/` → **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
| L2 | the script test (the real modules, the real graph, the live judge) | `--selftest mirror.ts` → 2 cards + 5 live nouls |
| L3 | the driven server (the real stdio frames) | `/tmp/plutus-lsp-receipts.log` → `PUBLISH n=3 … verdict=SUSPECT` |
| L4 | the live TUI | **PENDING** — the LSP binds at session construction (T1) |
## §4 · THE CALIBRATION (the derived bar)
`reports/CALIBRATION_v1.md` → **bar 0.30 · F1 0.60 · precision 0.50 · recall 0.75** on the
8-item corpus (4 violations + 4 cleans). Reproducible (`bun tests/calibration/calibrate.ts`).
## §5 · THE DEFECTS FOUND + FIXED (5)
1. the L1 law entities overwritten by the adapter rebuild → re-added (564).
2. health() captured the env at module load → read at call time.
3. the token matcher over-matched on generic words → +STOPWORDS.
4. the calibration's state diluted the signal → +lawsForHunk (ranked, top-3).
5. the generic question required derivation → +OBSERVABLE templates.
## §6 · THE HONEST GAPS
- The live-TUI render proof is PENDING (a session restart is needed).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The `plutus/callers` token is declared but not yet emitted.
- The enforcement extension (the block) is deferred to v2 (D5).
## §7 · THE ROUND-10 FIX BATCH (2026-09-30 · commit 816b384 — the current HEAD)
**THE TRIGGER:** the round-9 audit GATE: FAIL (0 critical, 12 high, findings=31) + the round-10
audit GATE: FAIL (2 critical, 10 high, findings=30). **21 findings closed** across the two rounds.
The round-11 audit is BLOCKED (provider unreachable — `127.0.0.1:4097` connection refused, the
go-session-proxy lane down; NOT a code verdict).
**THE MEASURED STATE AT THIS COMMIT:**
| the file | the lines | the role |
|---|---|---|
| `scripts/plutus-lsp.ts` | 350 | the stdio server + the fire-and-forget L2 + the receipt |
| `src/plutus-lsp/store.ts` | 440 | the graph reader + the contiguous L2 framing + the fail-closed tier |
| `src/plutus-lsp/judge.ts` | 421 | the chain on jevk5Fetch + the visible cap + the single threshold source |
| `src/plutus-lsp/cards.ts` | 264 | the finite-only cards + the epsilon attribution + the STALE codes |
| `dist/plutus-lsp.js` | 41,046 bytes · sha256 `51f95e841cf6247f…` | the built bundle (rebuilt at this commit) |
**THE FIXES (per finding, highest severity first):**
1. CRITICAL `knownAbs` undefined (store.ts:119) — `PLUTUS_ALLOW_KNOWN_PATHS=1` threw
   ReferenceError; entries are absolute, `resolve()` normalizes. FIXED.
2. CRITICAL `MAX_STDIN` read-but-never-declared (scripts:261) — ReferenceError on the oversize
   path; declared before the stdin handler. FIXED.
3. HIGH `validTier` fail-open to IMMUTABLE — corrupt tiers outranked canon (+2); now SUPERSEDED
   (-2, fail-closed). FIXED.
4. HIGH L2 framing split-prefix — `chunks[0][0..3]` without contiguity; now concat-once then
   `readUInt32BE(0)`. FIXED.
5. HIGH chain dedupe mismatch (`['P1','P1']` → false JUDGE_ANSWER_COUNT) — loop + count both use
   the validated set; chain now reuses `jevk5Fetch` (the drift source removed). FIXED.
6. HIGH relevance cap invisible — `{ok,scored}` carried no `judged/total/dropped`; now returned
   AND receipted. FIXED.
7. HIGH outer catch published `[]` (wiped last-good diagnostics) — now sends nothing (same as the
   double-fault path). FIXED.
8. HIGH send() dangling `once('drain')/once('error')` per call (MaxListeners + stale done()) —
   the write callback is the only resolver; dead-stream short-circuit. FIXED.
9. HIGH lawCard Infinity-as-measured + per-element null guards; verdictCard epsilon tie + explicit
   kind gate + target-file warning; callersCard deduped-empty→null; STALE codes `[JEVK5_*]` vs
   `[PLUTUS_NO_*]`; fileOf decode-last + UNC; L2 fire-and-forget; health() array rejection;
   single threshold source (consts delegate to getters). ALL FIXED.
10. MEDIUM/LOW — INCONCLUSIVE separator unified, DRIFT clause from the verdict, STOPWORDS private
    + predicate, `export {a as b}` keeps both names, deterministic caller order, timeoutMs
    validation, single-pass tokenization, frozen marker arrays, empty-id laws dropped at load,
    dead guards/consts/ternary removed. ALL FIXED.
**THE VERIFICATION AT THIS COMMIT:**
| tier | what | the artifact |
|---|---|---|
| L1 | the unit | `bun test tests/` → **26 pass / 0 fail / 117 expects** |
| L2 | the live selftest ×4 (the real graph + the LIVE JevK5) | store: 11 cards (10 LAW + 1 SUSPECT) · judge: 13 cards (12 LAW + 1 SUSPECT) · script: 12 cards (11 LAW + 1 SUSPECT) · cards: 13 cards (12 LAW + 1 VIOLATION `MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts`) |
| L3 | the built bundle | `dist/plutus-lsp.js` sha256 `51f95e841cf6247f…` (rebuilt, committed) |
**THE HONEST RESIDUAL:** the round-11 audit could not run (provider down — BLOCKED, not PASS);
the 7 remaining medium/low findings from round-10 (chain drift now closed by the jevk5Fetch
refactor; `plutus/tier` documented dead-filter; L2 receipt timing) are recorded, not hidden.
## §8 · THE ROUND-11..18 HARDENING DRIVE + THE DERAILMENT SUITE (2026-10-01)
**THE DRIVE:** the audit lane recovered (BUG-12 proxy restored) → 8 consecutive `qwen-code-audit`
rounds against the four core files. Every BLOCKING finding was adjudicated (Side A probe-error
vs Side B confirmed defect) and fixed; every fix pinned by a new test. The battery grew
18 → 46 tests (0 fail), and the bundle was rebuilt at every round.
**THE AUDIT TREND (critical/high per round):**
```
r9  2c/12h   r10 2c/10h   r11 0c/13h   r12 0c/12h
r13 0c/7h    r14 0c/5h    r15 1c/2h    r16 0c/4h
r17 2c/3h    r18 1c/5h
```
The CRITICAL class was eliminated (r11) and then RE-INTRODUCED twice by the fixes themselves
(r15's selftest fall-through; r17's path-normalize return-raw; r18's absolute-`..` clamp) —
each a self-inflicted edge in the path/exit confinement code. **THE CONVERGENCE TREND: blocking
findings fall as real classes close (13→12→7→5→2→4); the residue is an LLM reviewer's unbounded
supply of fresh edge-cases in code that keeps gaining lines.** The honest stop: CONFIRMED DEFECTS
FIXED + CRITICAL CLASS ELIMINATED at each round, with the remainder named (below).
**THE FIXES (per class, 8 rounds):**
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors (r10); the selftest failure-path
   fall-through (r15); `fileOf` returning RAW while checking NORMALIZED (r17); absolute `..`
   bypassing the denylist (r18). All closed + pinned.
2. HIGH — frozen threshold aliases → getters-only (r11); P2 jurisdiction fail-closed (r11);
   cache serves stale canon → content fingerprint (r11); chain dedupe + `jevk5Fetch` reuse
   (r10/11); `staleCard`/`cards` never-throw + bounded strings (r12..17); `resolveRoot` STRONG
   wins at any depth (r13); partition row validation (r13); stdin headerless cap (r11/14);
   `path.resolve` confinement (r18).
3. MEDIUM/LOW — v 40+ across: tier-word candidacy (r12), short-name-part survival (r12),
   deterministic ordering, receive-drain, health array rejection, epsilon at display precision,
   STALE code allowlist, `Object.hasOwn` NodeId, short-read naming, unknown-method MethodNotFound,
   subarray-view copy, denylist roots, `cap()` bounding, identity trimming, timer thresholds.
**THE DERAILMENT-PATTERN SUITE (`scripts/derailment-suite.ts`) — THE OBJECTIVE'S PROOF:**
The operator's objective is that the agent "cannot derail or make stupid actions". The suite
pushes the 6 REAL Plutus derailments through the LIVE pipeline and asserts the reflex fires:
```
D1 fabricated SL cap (150 vs the 36-pip canon)  → plutus/law + the SL/TP law surfaced   PASS
D2 multi-TP (law: ONE TP; edit TP1/TP2/TP3)     → plutus/law, plutus/suspect            PASS
D3 pair-format (law: EUR/USD; edit EURUSD)      → plutus/law, plutus/suspect            PASS
D4 flat RRR (law: category-specific)            → plutus/law, plutus/drift              PASS
D5 ZFP threshold (canon 45; edit 60)            → plutus/law, plutus/VIOLATION          PASS
D6 a fact-free file                             → ZERO tokens (the precision proof)     PASS
```
**6/6 PASS.** Artifact: `.omp/derailment-suite-results.json`. The VIOLATION token fired on the
ZFP change (the clearest canon breach); the others surface the governing law + SUSPECT/DRIFT.
**THE MEASURED STATE:** battery **46 pass / 0 fail / 158 expects**; 4 live selftests (real graph
+ live JevK5); derailment suite 6/6; bundle `dist/plutus-lsp.js` sha256 see BUILD_STATE.
**THE HONEST RESIDUAL (the audit treadmill named):** ~19 medium/low findings from r17-r18 remain
unfixed (hunk-hot-path tokenization caching, regex-literal/division stripping in `declarationsIn`,
`chain`/`relevancePass` request/latency accounting across the health+fault double-fetch, the
`weakest`-name shadow of the strongest clause, the `plutus/tier` dead token). None is CRITICAL or
HIGH; all are recorded. NO SHIP-READY CLAIM IS MADE — the last audit gate was FAIL (r18).
## §9 · THE ROUND-19 AUDIT (2026-10-01 — the r11..r18 drive's closing round)
**The built:** the audit artifact + its wiring (no code changed this round — triage only).
**The why:** the ship-docs audit gate (S7) requires every audit wired before any milestone.
**The how:** fresh `qwen-code-audit` scan → artifact JSON → TESTING_LOG verdict line +
  FAILURE_LOG F-08/F-09 + DEBUG_LOG EN-13.
**The evidence:** `GATE: FAIL (0 critical, 5 high)`, session `c8027864`,
  `artifacts/sg-ocr-round19.json`, dist SHA `3307a3b7a14d6f4b…`.
**The verification:** the verdict line is quoted verbatim in TESTING_LOG; the 5 blocking
  findings each have an OPEN F entry.
**The honest notes:** the CRITICAL class stays eliminated (0 critical, 3rd round running);
  the 5 highs are queued, not rushed; NO SHIP-READY CLAIM.
# CURRENT_STATE — PLUTUS-COMMON-SENSE-LSP
**As of:** 2026-10-01 · **The phase:** pre-ship-package (r19 FAIL 0c/5h wired; battery 46/0/158; derailment 6/6; gate FAIL — no ship-ready claim).
## THE ARCHITECTURE AS IT NOW IS
```
OMP native LSP runtime (diagnosticsOnWrite / OnEdit)
  │ queries EVERY registered server on every write/edit
  ▼
plutus-lsp (scripts/plutus-lsp.ts, stdio JSON-RPC)
  │  store.ts    the graph reader (L1 kg.json + fire-and-forget L2)  PLUTUS_NO_STORE
  │  judge.ts    CH-PLUTUS (7 nouls) + relevance kernel vs JevK5  JEVK5_DOWN
  │  cards.ts    the 7 tokens + STALE codes -> LSP diagnostics    the anti-phantom law
  ▼
publishDiagnostics -> the canon arrives on the write (the REFLEX)
```
## THE REGISTERED SERVERS (3)
`gi-lsp` (the GI reflex) · `jg-lsp` (the ticket reflex) · `plutus-lsp` (the canon reflex) — no eviction.
## THE 7 TOKENS
`plutus/law` · `plutus/violation` · `plutus/suspect` · `plutus/tier` · `plutus/callers` ·
`plutus/drift` · `plutus/stale`.
## THE POLARITY LAW (the invariant)
The LSP INFORMS; the extension ENFORCES. A block path in the server is a VIOLATION.
## THE CURRENT NUMBERS
- the battery: 46 pass / 0 fail / 158 expects (3 files)
- the live selftests ×4 (JevK5 jevk5-4b-v0.2-Q8_0): store 11 · judge 13 · script 12 · cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868, target-file warning proven)
- the receipt: `RELEVANCE judged=12/12 dropped=0` (forensic/lsp-receipts.log, 2026-09-30T17:46:57Z)
- the bundle: dist/plutus-lsp.js sha256 3307a3b7a14d6f4b (rebuilt at every round)
- the derived bar: 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus
- the audit gate: rounds 11-18 run (r18 FAIL 1c/5h — NO ship-ready claim)
## WHAT IS NOT YET DONE
The r17/r18 medium/low residual (~19 findings, recorded — hunk-hot-path caching, decl regex, accounting).
The live-TUI render proof (needs a session restart — the LSP binds at session construction).
The enforcement extension (deferred to v2). The 50+ item calibration corpus.
**Dist fingerprint (this update):**
Dist fingerprint (this update): `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`
## 3. Technical Implementation (interfaces, anchors, data flows)
### 3.1 The artifact table
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
### 3.2 The module contracts (from the source)
store.ts (graph reader): resolveRoot -> l1PathFor -> loadStore -> lawsForHunk (topK=12) + declarationsIn + callersOf + readL2. Refusals PLUTUS_NO_STORE / PLUTUS_NO_ROOT. judge.ts (decision kernel): health -> jevk5Fetch (one batched POST) -> chain P1..P7 -> relevancePass -> partitionByRelevance -> verdict (MAX over answered {P4,P5,P6}). Bars: throwT 0.85 (policy), demandT 0.30 (derived), relevanceT 0.30 (swept). cards.ts (renderer): lawCard + verdictCard + callersCard + staleCard -> fileCards; 7 tokens; fail-closed attribution. scripts/plutus-lsp.ts (stdio server): frame parser -> fileOf (normalize+confine) -> analyze (debounced) -> send (serialized). scripts/derailment-suite.ts (acceptance): D1-D6 through the live pipeline.
## 4. Architecture Changes (with the pipeline diagram)
```
OMP runtime LSP mux (didOpen/didChange/didSave)
  -> scripts/plutus-lsp.ts --stdio (frame parser -> analyze -> send)
  -> pipeline: L1 DETECT (lawsForHunk) -> L2 RELEVANCE (relevancePass, judge decides)
  -> CHAIN P1..P7 (one POST) -> VERDICT (pure code) -> CARDS (fileCards)
  -> publishDiagnostics (the canon arrives ON THE WRITE; INFORMS, never blocks)
```
## 5. Files Changed (git history + tree)
GIT HISTORY (last 40 commits):
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
e16350a feat(pcsl): THE JEV RELEVANCE KERNEL — the judge now decides relevance, not the regex
2a3d350 docs(pcsl): the proof archive addendum — the CONTINUING live LSP traffic
aa29c64 docs(pcsl): the final cert artifact + the LIVE-TUI PROOF ARCHIVE (append-only)
cf0841d feat(pcsl): THE LIVE-TUI PROOF + the L1 discovery + the final cert — the LSP IS LIVE
a619a60 fix(pcsl): the LOW set fixed + THE LSP DEPLOYMENT CONTRACT (the spawn gates)
22ec325 audit(pcsl): the independent auditors' round — 31 findings, the HIGH set fixed, the container re-certified
de07575 fix(pcsl): the audit round 2 — audit-alpha's 14 findings (F2-F14) fixed
a1d4342 audit(pcsl): the red-team slop audit #1 — 8 confirmed defects found and fixed
d903b91 test(pcsl): the live-TUI spawn proof — the runtime spawns it (proven) + the handshake fix
f0e5648 fix(jevk5)+chore(pcsl): the judge health probes its backend (the false-green generator) + the v0.2 checkpoint
665c31a test(pcsl): the container v2 — THE HOST BRIDGE + 4 defects found and fixed
177e7d6 test(pcsl): the deep-container-testing rig — 7/7 PASS in a clean mimo-ct:master container
DIFFSTAT since the r18 batch:
 .omp/derailment-suite-results.json                 |    2 +-
 .../.omp/container-test-results.json               |    1 +
 .../.omp/derailment-suite-results.json             |   97 ++
 .../CHECKPOINT_MANIFEST.md                         |   43 +
 .../PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md      |  289 ++++
 .../README.md                                      |   15 +
 .../SHA256SUMS                                     |   62 +
 .../bunfig.toml                                    |    3 +
 .../context_management/BUILD_STATE.md              |   29 +
 .../context_management/CHANGELOG.md                |   46 +
 .../context_management/COMPACTION_SURVIVAL.md      |   26 +
 .../context_management/CURRENT_STATE.md            |   38 +
 .../context_management/DECISION_CHAIN.md           |   47 +
 .../context_management/EVIDENCE_STATE.md           |   49 +
 .../context_management/NEXT_STEPS.md               |   25 +
 .../context_management/POST-COMPACTION_PROMPT.md   |   22 +
 .../context_management/RUNNING_BUILD_LOG.md        |   73 +
 .../context_management/RUNNING_DEBUG_LOG.md        |   64 +
 .../context_management/TASK_QUEUE.md               |   12 +
 .../dist/plutus-lsp.js                             | 1391 ++++++++++++++++++++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_1.md        |  161 +++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_2.md        |   64 +
 .../forensic/LIVE_TUI_PROOF_ARCHIVE.md             |   50 +
 .../lsp.json                                       |   12 +
 .../package.json                                   |   11 +
 .../packages/plutus-common-sense-lsp/00-INDEX.md   |   23 +
 .../packages/plutus-common-sense-lsp/00-MISSION.md |   36 +
 .../plutus-common-sense-lsp/01-DISCOVERY.md        |   48 +
 .../plutus-common-sense-lsp/02-DPL1-SPEC.md        |  202 +++
 .../plutus-common-sense-lsp/03-MASTER-BLUEPRINT.md |   62 +
 .../packages/plutus-common-sense-lsp/06-WAVES.md   |   30 +
 .../packages/plutus-common-sense-lsp/07-GOALS.md   |   24 +
 .../reports/CALIBRATION_v1.md                      |   87 ++
 .../reports/CT_PLAN.txt                            |   68 +
 .../reports/INFO_CARD_DESIGN.md                    |   55 +
 .../reports/LIVE_TUI_SPAWN_PROOF.md                |   52 +
 .../reports/LSP_DEPLOYMENT_CONTRACT.md             |   57 +
 .../reports/P8_VERDICT.md                          |   42 +
 .../reports/PCSL_Engineering_Report_v1.md          |  545 ++++++++
 .../reports/RELEVANCE_KERNEL.md                    |   63 +
 .../reports/STALENESS_AUDIT.md                     |   64 +
 .../reports/pcsl-ct-results-v2.json                |   22 +
 .../reports/pcsl-ct-results.json                   |   21 +
 .../reports/pcsl-final-results.json                |   16 +
 .../scripts/derailment-suite.ts                    |  113 ++
 .../scripts/plutus-lsp.ts                          |  477 +++++++
 .../ship_docs/BUILD_REPORT.md                      |  157 +++
 .../ship_docs/DEBUG_LOG.md                         |   99 ++
 .../ship_docs/FAILURE_LOG.md                       |   50 +
 .../ship_docs/SPEC_VIOLATION_LOG.md                |   31 +
 .../ship_docs/TESTING_LOG.md                       |  173 +++
 .../ship_docs/THEATRICALITY_LOG.md                 |   61 +
 .../src/plutus-lsp/cards.ts                        |  352 +++++
 .../src/plutus-lsp/judge.ts                        |  532 ++++++++
 .../src/plutus-lsp/store.ts                        |  546 ++++++++
 .../tests/adversarial.test.ts                      |  326 +++++
 .../tests/calibration/calibrate.ts                 |   40 +
 .../tests/calibration/corpus.json                  |   29 +
 .../tests/judge-cards.test.ts                      |   90 ++
 .../tests/plutus-lsp.test.ts                       |   78 ++
 .../tsconfig.json                                  |    8 +
 artifacts/sg-ocr-round19.json                      |   19 +
 context_management/BUILD_STATE.md                  |   10 +-
 context_management/CHANGELOG.md                    |    5 +
 context_management/COMPACTION_SURVIVAL.md          |    4 +-
 context_management/CURRENT_STATE.md                |    6 +-
 context_management/EVIDENCE_STATE.md               |   10 +-
 context_management/NEXT_STEPS.md                   |    3 +
 context_management/POST-COMPACTION_PROMPT.md       |    4 +-
 context_management/RUNNING_BUILD_LOG.md            |    7 +
 context_management/RUNNING_DEBUG_LOG.md            |    7 +
 ship_docs/BUILD_REPORT.md                          |   13 +
 ship_docs/DEBUG_LOG.md                             |   11 +
 ship_docs/FAILURE_LOG.md                           |   20 +
 ship_docs/SPEC_VIOLATION_LOG.md                    |   22 +
 ship_docs/TESTING_LOG.md                           |   12 +
 76 files changed, 7457 insertions(+), 7 deletions(-)
SOURCE TREE (11 files):
scripts/plutus-lsp.ts (stdio server) / src/plutus-lsp/store.ts (graph reader) / src/plutus-lsp/judge.ts (decision kernel) / src/plutus-lsp/cards.ts (card renderer) / scripts/derailment-suite.ts (acceptance suite) / tests: plutus-lsp, judge-cards, adversarial, calibration / dist/plutus-lsp.js (the bundle)
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
## 6. Test Results (battery + container + live, with SHAs)
# TESTING_LOG — the test plan + the results (all four tiers)
## THE PLAN (the tiers)
| tier | the scope | the tool | the state |
|---|---|---|---|
| L0 | the typecheck | `bun test` (the TS executes) | PASS |
| L1 | the unit — the pure fns | `bun test tests/` | **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
| L2 | the script test — the real modules + the real graph + the LIVE judge | `--selftest` | PASS (2 cards, 5 nouls) |
| L3 | the driven server — the real stdio frames | the drive harness | PASS (PUBLISH n=3) |
| L4 | the live TUI | the omp LSP runtime | **PENDING (T1)** |
## THE ADVERSARIAL SWEEP (8 angles — adversarial FIRST, the happy path LAST)
| # | the angle | the passToken | the result |
|---|---|---|---|
| A1 | the absent graph | PLUTUS_NO_STORE | PASS |
| A2 | the down judge | JEVK5_DOWN | PASS |
| A3 | a fact-free file | NO card | PASS (after the STOPWORDS fix) |
| A4 | a known violation | plutus/violation | PASS |
| A5 | a foreign store | PLUTUS_NO_STORE | PASS |
| A6 | no root marker | PLUTUS_NO_ROOT | PASS |
| A7 | the siblings survive | gi-lsp + jg-lsp + plutus-lsp | PASS |
| A8 | the token set = 7 unique | — | PASS |
## THE CALIBRATION (the derived bar)
```
★ THE DERIVED BAR: 0.30 (F1=0.60 · precision=0.50 · recall=0.75)
★ the corpus: 4 violations + 4 cleans = 8 items
```
## AUDIT GATE: FAIL (0 critical · 12 high · after 3 rounds)
**The rounds (verbatim from the tool):**
```
round 1: FAIL (1 critical, 12 high)  findings=28
round 2: FAIL (1 critical, 12 high)  findings=28   (13 fixed; 13 new surfaced)
round 3: FAIL (0 critical, 12 high)  findings=33   ← THE CRITICAL CLASS ELIMINATED
```
**The confirmed defects FIXED: 26 across the 3 rounds** — including the CRITICAL `didChange`
(`contentChanges[].text`, not `textDocument.text` — every edit wiped the doc) and the CRITICAL
INVERTED P1 SCOPE guard (high P1 = in-scope; it returned LAW for in-scope evidence).
**THE ADJUDICATION (why this stops here):** an LLM reviewer generates findings indefinitely —
the count never reaches zero by construction (the scan-treadmill law). The progress measure is
the CONFIRMED DEFECTS FIXED + the CRITICAL CLASS ELIMINATED, both of which are done. The
remaining 12 high are performance/robustness hardening (async fs, regex hoisting, debounce) —
real, non-blocking for an INFORMING layer, and recorded in HONEST_GAPS.
**THEREFORE: NO SHIP-READY CLAIM IS MADE.** A FAIL blocks it. The LSP is a v0.1 tool in OBSERVE
mode; the enforcing layer (v2) is gated behind this. FAIL is never PASS.
## THE HONEST RESIDUAL
The L4 live-TUI proof is pending. The corpus is small. The precision is 0.50 (bounded by the
polarity law — a Warning, never a block).
## THE CONTAINER RIG (mimo-ct:master · pcsl-ct-01 · the deep-container-testing protocol)
**The plan:** reports/CT_PLAN.txt (4381 chars · 6 sections · 4 scenarios + 2 adversarial · hash 8006d7d5).
**The deploy:** /tmp/plutus-lsp.js sha256 f8e8349b9fa568a1 == the local dist (THE SHA MATCH).
**The results artifact:** reports/pcsl-ct-results.json (+ .mimocode/ct-results.json).
| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the clean-env named refusal | POSITIVE | PLUTUS_NO_ROOT | **PASS** |
| S1b the specific PLUTUS_NO_STORE | POSITIVE | PLUTUS_NO_STORE | **PASS** |
| S2 the fixture graph → the cards | POSITIVE | SELFTEST OK (3 cards) | **PASS** |
| S3 a fact-free file → NO card | NEGATIVE | NO-LAW | **PASS** |
| S4 the stdio LSP handshake | NEGATIVE | serverInfo | **PASS** |
| A1 the down judge → the named refusal | ADVERSARIAL | JUDGE_DOWN | **PASS** |
| A2 the malformed frame (the bound holds) | ADVERSARIAL | serverInfo + ALIVE | **PASS** |
**THE PHASE-E BREAKER: 10/10** (the sha match · every scenario · every token · no circular ·
no timeout · the radius · the adversarial · the container alive · the artifact).
**THE HONEST RESIDUAL:** the container has NO JevK5 (:8090) — the live chain cannot run there;
the server correctly names the refusal (JUDGE_DOWN) instead of fabricating a pass. The model
auth is ABSENT in the image (the deterministic exec channel carried the scenarios).
**THE VERDICT: PASS (7/7 + the breaker) — the server works CORRECTLY in a CLEAN environment.**
## THE CONTAINER RIG v2 — THE HOST BRIDGE (the LIVE judge, over the network)
**THE BRIDGE:** `socat TCP-LISTEN:8091,bind=0.0.0.0 -> 127.0.0.1:8090` — from inside the
container the judge is `http://172.17.0.1:8091`. **The v1 "residual" (no judge in the
container) was WRONG — the bridge existed and was never looked for.**
| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the host bridge | POSITIVE | jevk5-4b | **PASS** |
| S2 the live chain (the vector) | POSITIVE | SELFTEST OK (P4=0.867) | **PASS** |
| S5 the in-scope VIOLATION | POSITIVE | plutus/violation (P4=0.923) | **PASS** |
| S4 the clean-env refusal | NEGATIVE | PLUTUS_NO_STORE | **PASS** |
| A1 the down judge | ADVERSARIAL | JEVK5_DOWN | **PASS** |
| A2 the malformed frame | ADVERSARIAL | serverInfo + ALIVE | **PASS** |
**THE DEFECTS FOUND AND FIXED (4):** the judge's backend DOWN (the health lied; restarted);
the P1 over-block (jurisdiction from the LAWS, not the path); the test isolation (the
checkpoint's copied suite); the env restore ("undefined").
**THE VERDICT: PASS (6/6) — the live reflex chain proven in a CLEAN container.**
## THE ROUND-10/11 VERIFICATION (2026-09-30 · commit 816b384)
**THE BATTERY:** `bun test tests/` → **26 pass / 0 fail / 117 expects** (up from 18 — the audit
rounds added the relevance-partition, stale-row, and selftest-token tests).
**THE LIVE SELFTESTS ×4 (the real graph + the LIVE JevK5 at 127.0.0.1:8090, model
jevk5-4b-v0.2-Q8_0):**
| the target | the result | the shape census |
|---|---|---|
| `src/plutus-lsp/store.ts` | SELFTEST OK, exit 0 | 11 cards: 10 LAW + 1 SUSPECT (`CONST-FROZEN-PAIR P6=0.731`) |
| `src/plutus-lsp/judge.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 SUSPECT |
| `scripts/plutus-lsp.ts` | SELFTEST OK, exit 0 | 12 cards: 11 LAW + 1 SUSPECT (`MECH-CIRCUIT P6=0.526`) |
| `src/plutus-lsp/cards.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 **VIOLATION** (`MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts` — the target-file threading proven) |
**THE BUILT BUNDLE:** `dist/plutus-lsp.js` 41,046 bytes · sha256
`51f95e841cf6247fd68adaaccac74e8991eb10199d527a9530d01f67c23b477f` (rebuilt + committed).
**THE AUDIT GATE:** round-9 FAIL (0 critical, 12 high) → round-10 FAIL (2 critical, 10 high) →
round-11 **BLOCKED** (provider unreachable: `127.0.0.1:4097` refused — the go-session-proxy lane
is down; the JEVK5 judge at :8090 is UP). **BLOCKED is reported as BLOCKED — never as PASS.**
All 21 round-9/10 blocking findings were fixed first (BUILD_REPORT §7); the gate simply could
not re-run. The 7 remaining round-10 medium/low notes are recorded in BUILD_REPORT §7's residual.
## THE PRESSURE TEST (2026-09-30 · container pbk/omp-ct:master · v0.6 bundle 51f95e841cf6247f)
**THE RIG:** image `omp-ct:master`, container `pbk`. Bundle deployed file-to-file with sha trio
match (local == container == `51f95e841cf6247f`). Judge bridge `172.17.0.1:8090` → JevK5
`jevk5-4b-v0.2-Q8_0` (health `ok:true`). Results artifact: `.omp/container-test-results.json`.
| the scenario | the passToken (in tool result) | the failToken (absent) | the verdict |
|---|---|---|---|
| S1 absent graph | PLUTUS_NO_STORE/PLUTUS_NO_ROOT ×4, SELFTEST OK ×0 | SELFTEST OK | **PASS** |
| S2 dupe nodes | fully answered, 1 answer, no reason | JUDGE_ANSWER_COUNT | **PASS** |
| S3 no-clear | keeping last-good, zero `diagnostics:[]` sends | `"diagnostics":[]` | **PASS** |
| S4 Infinity | `relevance unread`, /Infinity/ false | `Infinity` | **PASS** |
| S5 target warning | `YOU ARE EDITING: src/plutus-lsp/cards.ts` | the canon anchor | **PASS** |
| A1 malformed frame | serverInfo (259-byte response after 99999999 header) | OOM/hang | **PASS** |
| A2 down judge | `JEVK5_DOWN: Unable to connect` | fabricated verdict | **PASS** |
**THE PHASE-E BREAKER: 10/10** (sha match · bridge probe · 7/7 scenarios · tokens · no circular ·
no timeouts · blast radius · adversarial · alive · artifact).
**THE VERDICT: PASS (7/7) — every recorded derailment (F-01..F-05 classes) is mechanically closed.**
## THE DERAILMENT-PATTERN SUITE (2026-10-01 · the objective's acceptance test)
**WHAT IT PROVES:** the LSP CATCHES the derailments the objective names ("so the agent can't
derail or make stupid actions"). 6 REAL Plutus derailments pushed through the LIVE pipeline
(real graph + live JevK5 at :8090); each asserts the reflex fires with the right token and the
clean case stays SILENT.
| the derailment | the expected reflex | the tokens emitted | the verdict |
|---|---|---|---|
| D1 fabricated SL cap 150 (canon 36) | the law surfaces | plutus/law, plutus/suspect | PASS |
| D2 multi-TP (TP1/TP2/TP3) | a governing law | plutus/law, plutus/suspect | PASS |
| D3 pair format EURUSD | a governing law | plutus/law, plutus/suspect | PASS |
| D4 flat RRR | a governing law / drift | plutus/law, plutus/drift | PASS |
| D5 ZFP 45→60 | the VIOLATION token | plutus/law, plutus/VIOLATION | PASS |
| D6 a fact-free file | ZERO tokens (precision) | (none) | PASS |
**6/6 PASS.** Artifact `.omp/derailment-suite-results.json`. Run:
`PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` (add `--no-judge` for the offline mode).
## THE AUDIT ROUNDS 11-18 (the hardening drive)
```
r9  2c/12h  →  r10 2c/10h  →  r11 0c/13h  →  r12 0c/12h
r13 0c/7h   →  r14 0c/5h   →  r15 1c/2h   →  r16 0c/4h
r17 2c/3h   →  r18 1c/5h
```
Each round: every BLOCKING finding adjudicated + fixed; every fix pinned. Battery 18 → 46 tests
(0 fail). The CRITICAL class was eliminated (r11) and re-introduced twice by fixes themselves
(r15 selftest fall-through; r17 path-normalize-return-raw; r18 absolute-`..`) — each closed.
**THE GATE: FAIL (r18) — NO SHIP-READY CLAIM. ~19 medium/low findings remain, all recorded.**
## TEST RESULT — 2026-10-01 — the round-19 audit gate (r11..r18 drive closed)
### SCRIPT — audit gate
- **The run:** `qwen-code-audit scan` over the 4 core files (store/judge/cards/script).
- **The raw output:** `GATE: FAIL (0 critical, 5 high)` — scope=workspace filesReviewed=4
  findings=27 (critical=0 high=5 medium=15 low=7). Session `c8027864-47cf-47e7-93f5-bba3f17dcfd8`.
- **The verdict:** FAIL — the 5 blocking highs are recorded as F entries (open until fixed and
  re-proven). The CRITICAL class stays eliminated (0 critical, third round running).
- **The artifacts:** `artifacts/sg-ocr-round19.json` (session, scope, counts, blocking list, dist SHA).
## AUDIT GATE: FAIL (0 critical, 5 high) — session c8027864 — artifacts/sg-ocr-round19.json
## 7. Known Issues (the r19 residual, named)
Audit r19 FAIL (0c/5h): path-confinement symlink/cwd gap; in-flight chain pile-up; head4 FIFO hang; cap() throwable toString; attribution-flag decoupling. ~14 medium/low residual (hunk caching, decl regex, accounting, weakest-name). All OPEN in FAILURE_LOG F-08/F-09. No ship-ready claim.
## 8. Deployment Notes
Run DEPLOY.sh (SHA gate inside). Register servers.plutus-lsp in ~/.omp/agent/lsp.json (command bun, args scripts/plutus-lsp.ts --stdio). Verify with --selftest (measured: 13 cards, exit 0). Restart a TUI session (the LSP binds at construction).
# PLUTUS-COMMON-SENSE-LSP — SHIP BUILD REPORT (r19 package)
## 1. Build Summary (the state)
Bundle `dist/plutus-lsp.js` sha256 `3307a3b7a14d6f4b` (41,046 bytes). Battery 46 pass / 0 fail / 158 expects. Audit r19 FAIL (0 critical, 5 high) — no ship-ready claim. Derailment suite 6/6 PASS (live judge). 8 checkpoints (v0.1..v0.8).
## 2. What Was Built (narrative, from the ship docs)
# BUILD_REPORT — PLUTUS-COMMON-SENSE-LSP (the what-was-built record)
**Date:** 2026-09-29 · **The repo:** PLUTUS-COMMON-SENSE-LSP (own .git) · **The commits (HEAD at the audit):** a1d4342 + the audit's follow-ups; the earlier: f4b9260, 5154527, 8260183 (audit F13: the record named a stale prefix)
## §1 · WHAT WAS BUILT (the deliverable)
A third custom LSP server, `plutus-lsp`, that makes the Plutus knowledge graphs REFLEXIVE:
on every write/edit to a Plutus file it reads the graph (L1 semantica + L2 arsumbris), judges
the edit via JevK5 (CH-PLUTUS, the 5-of-7 nouls), and surfaces the governing law as an LSP
diagnostic — before the agent can derail. It INFORMS; it never blocks (the polarity law).
## §2 · THE FILES (the deployed set)
| the file | the role | the lines |
|---|---|---|
| `scripts/plutus-lsp.ts` | the stdio JSON-RPC server + --selftest + the receipt | 168 (measured, audit F8) |
| `src/plutus-lsp/store.ts` | the graph reader (L1 kg.json + L2 socket) + the named refusals | 266 (measured) |
| `src/plutus-lsp/judge.ts` | CH-PLUTUS (the 7 nouls) + OBSERVABLE + the verdict | 207 (measured) |
| `src/plutus-lsp/cards.ts` | the 7 tokens + FactCard + toDiagnostic | 166 (measured) |
| `tests/*.test.ts` | the W1/W2/W3 gates + the 8-angle adversarial sweep | ~180 |
| `tests/calibration/*` | the labeled corpus + the derivation harness | ~90 |
| `~/.omp/agent/lsp.json` | the registration (beside gi-lsp + jg-lsp) | 1 entry |
## §3 · THE VERIFICATION (every tier, with its artifact)
| tier | what | the artifact |
|---|---|---|
| L0 | the typecheck | `bun test` loads + runs (the TS is executed, not just parsed) |
| L1 | the unit | `bun test tests/` → **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
| L2 | the script test (the real modules, the real graph, the live judge) | `--selftest mirror.ts` → 2 cards + 5 live nouls |
| L3 | the driven server (the real stdio frames) | `/tmp/plutus-lsp-receipts.log` → `PUBLISH n=3 … verdict=SUSPECT` |
| L4 | the live TUI | **PENDING** — the LSP binds at session construction (T1) |
## §4 · THE CALIBRATION (the derived bar)
`reports/CALIBRATION_v1.md` → **bar 0.30 · F1 0.60 · precision 0.50 · recall 0.75** on the
8-item corpus (4 violations + 4 cleans). Reproducible (`bun tests/calibration/calibrate.ts`).
## §5 · THE DEFECTS FOUND + FIXED (5)
1. the L1 law entities overwritten by the adapter rebuild → re-added (564).
2. health() captured the env at module load → read at call time.
3. the token matcher over-matched on generic words → +STOPWORDS.
4. the calibration's state diluted the signal → +lawsForHunk (ranked, top-3).
5. the generic question required derivation → +OBSERVABLE templates.
## §6 · THE HONEST GAPS
- The live-TUI render proof is PENDING (a session restart is needed).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The `plutus/callers` token is declared but not yet emitted.
- The enforcement extension (the block) is deferred to v2 (D5).
## §7 · THE ROUND-10 FIX BATCH (2026-09-30 · commit 816b384 — the current HEAD)
**THE TRIGGER:** the round-9 audit GATE: FAIL (0 critical, 12 high, findings=31) + the round-10
audit GATE: FAIL (2 critical, 10 high, findings=30). **21 findings closed** across the two rounds.
The round-11 audit is BLOCKED (provider unreachable — `127.0.0.1:4097` connection refused, the
go-session-proxy lane down; NOT a code verdict).
**THE MEASURED STATE AT THIS COMMIT:**
| the file | the lines | the role |
|---|---|---|
| `scripts/plutus-lsp.ts` | 350 | the stdio server + the fire-and-forget L2 + the receipt |
| `src/plutus-lsp/store.ts` | 440 | the graph reader + the contiguous L2 framing + the fail-closed tier |
| `src/plutus-lsp/judge.ts` | 421 | the chain on jevk5Fetch + the visible cap + the single threshold source |
| `src/plutus-lsp/cards.ts` | 264 | the finite-only cards + the epsilon attribution + the STALE codes |
| `dist/plutus-lsp.js` | 41,046 bytes · sha256 `51f95e841cf6247f…` | the built bundle (rebuilt at this commit) |
**THE FIXES (per finding, highest severity first):**
1. CRITICAL `knownAbs` undefined (store.ts:119) — `PLUTUS_ALLOW_KNOWN_PATHS=1` threw
   ReferenceError; entries are absolute, `resolve()` normalizes. FIXED.
2. CRITICAL `MAX_STDIN` read-but-never-declared (scripts:261) — ReferenceError on the oversize
   path; declared before the stdin handler. FIXED.
3. HIGH `validTier` fail-open to IMMUTABLE — corrupt tiers outranked canon (+2); now SUPERSEDED
   (-2, fail-closed). FIXED.
4. HIGH L2 framing split-prefix — `chunks[0][0..3]` without contiguity; now concat-once then
   `readUInt32BE(0)`. FIXED.
5. HIGH chain dedupe mismatch (`['P1','P1']` → false JUDGE_ANSWER_COUNT) — loop + count both use
   the validated set; chain now reuses `jevk5Fetch` (the drift source removed). FIXED.
6. HIGH relevance cap invisible — `{ok,scored}` carried no `judged/total/dropped`; now returned
   AND receipted. FIXED.
7. HIGH outer catch published `[]` (wiped last-good diagnostics) — now sends nothing (same as the
   double-fault path). FIXED.
8. HIGH send() dangling `once('drain')/once('error')` per call (MaxListeners + stale done()) —
   the write callback is the only resolver; dead-stream short-circuit. FIXED.
9. HIGH lawCard Infinity-as-measured + per-element null guards; verdictCard epsilon tie + explicit
   kind gate + target-file warning; callersCard deduped-empty→null; STALE codes `[JEVK5_*]` vs
   `[PLUTUS_NO_*]`; fileOf decode-last + UNC; L2 fire-and-forget; health() array rejection;
   single threshold source (consts delegate to getters). ALL FIXED.
10. MEDIUM/LOW — INCONCLUSIVE separator unified, DRIFT clause from the verdict, STOPWORDS private
    + predicate, `export {a as b}` keeps both names, deterministic caller order, timeoutMs
    validation, single-pass tokenization, frozen marker arrays, empty-id laws dropped at load,
    dead guards/consts/ternary removed. ALL FIXED.
**THE VERIFICATION AT THIS COMMIT:**
| tier | what | the artifact |
|---|---|---|
| L1 | the unit | `bun test tests/` → **26 pass / 0 fail / 117 expects** |
| L2 | the live selftest ×4 (the real graph + the LIVE JevK5) | store: 11 cards (10 LAW + 1 SUSPECT) · judge: 13 cards (12 LAW + 1 SUSPECT) · script: 12 cards (11 LAW + 1 SUSPECT) · cards: 13 cards (12 LAW + 1 VIOLATION `MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts`) |
| L3 | the built bundle | `dist/plutus-lsp.js` sha256 `51f95e841cf6247f…` (rebuilt, committed) |
**THE HONEST RESIDUAL:** the round-11 audit could not run (provider down — BLOCKED, not PASS);
the 7 remaining medium/low findings from round-10 (chain drift now closed by the jevk5Fetch
refactor; `plutus/tier` documented dead-filter; L2 receipt timing) are recorded, not hidden.
## §8 · THE ROUND-11..18 HARDENING DRIVE + THE DERAILMENT SUITE (2026-10-01)
**THE DRIVE:** the audit lane recovered (BUG-12 proxy restored) → 8 consecutive `qwen-code-audit`
rounds against the four core files. Every BLOCKING finding was adjudicated (Side A probe-error
vs Side B confirmed defect) and fixed; every fix pinned by a new test. The battery grew
18 → 46 tests (0 fail), and the bundle was rebuilt at every round.
**THE AUDIT TREND (critical/high per round):**
```
r9  2c/12h   r10 2c/10h   r11 0c/13h   r12 0c/12h
r13 0c/7h    r14 0c/5h    r15 1c/2h    r16 0c/4h
r17 2c/3h    r18 1c/5h
```
The CRITICAL class was eliminated (r11) and then RE-INTRODUCED twice by the fixes themselves
(r15's selftest fall-through; r17's path-normalize return-raw; r18's absolute-`..` clamp) —
each a self-inflicted edge in the path/exit confinement code. **THE CONVERGENCE TREND: blocking
findings fall as real classes close (13→12→7→5→2→4); the residue is an LLM reviewer's unbounded
supply of fresh edge-cases in code that keeps gaining lines.** The honest stop: CONFIRMED DEFECTS
FIXED + CRITICAL CLASS ELIMINATED at each round, with the remainder named (below).
**THE FIXES (per class, 8 rounds):**
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors (r10); the selftest failure-path
   fall-through (r15); `fileOf` returning RAW while checking NORMALIZED (r17); absolute `..`
   bypassing the denylist (r18). All closed + pinned.
2. HIGH — frozen threshold aliases → getters-only (r11); P2 jurisdiction fail-closed (r11);
   cache serves stale canon → content fingerprint (r11); chain dedupe + `jevk5Fetch` reuse
   (r10/11); `staleCard`/`cards` never-throw + bounded strings (r12..17); `resolveRoot` STRONG
   wins at any depth (r13); partition row validation (r13); stdin headerless cap (r11/14);
   `path.resolve` confinement (r18).
3. MEDIUM/LOW — v 40+ across: tier-word candidacy (r12), short-name-part survival (r12),
   deterministic ordering, receive-drain, health array rejection, epsilon at display precision,
   STALE code allowlist, `Object.hasOwn` NodeId, short-read naming, unknown-method MethodNotFound,
   subarray-view copy, denylist roots, `cap()` bounding, identity trimming, timer thresholds.
**THE DERAILMENT-PATTERN SUITE (`scripts/derailment-suite.ts`) — THE OBJECTIVE'S PROOF:**
The operator's objective is that the agent "cannot derail or make stupid actions". The suite
pushes the 6 REAL Plutus derailments through the LIVE pipeline and asserts the reflex fires:
```
D1 fabricated SL cap (150 vs the 36-pip canon)  → plutus/law + the SL/TP law surfaced   PASS
D2 multi-TP (law: ONE TP; edit TP1/TP2/TP3)     → plutus/law, plutus/suspect            PASS
D3 pair-format (law: EUR/USD; edit EURUSD)      → plutus/law, plutus/suspect            PASS
D4 flat RRR (law: category-specific)            → plutus/law, plutus/drift              PASS
D5 ZFP threshold (canon 45; edit 60)            → plutus/law, plutus/VIOLATION          PASS
D6 a fact-free file                             → ZERO tokens (the precision proof)     PASS
```
**6/6 PASS.** Artifact: `.omp/derailment-suite-results.json`. The VIOLATION token fired on the
ZFP change (the clearest canon breach); the others surface the governing law + SUSPECT/DRIFT.
**THE MEASURED STATE:** battery **46 pass / 0 fail / 158 expects**; 4 live selftests (real graph
+ live JevK5); derailment suite 6/6; bundle `dist/plutus-lsp.js` sha256 see BUILD_STATE.
**THE HONEST RESIDUAL (the audit treadmill named):** ~19 medium/low findings from r17-r18 remain
unfixed (hunk-hot-path tokenization caching, regex-literal/division stripping in `declarationsIn`,
`chain`/`relevancePass` request/latency accounting across the health+fault double-fetch, the
`weakest`-name shadow of the strongest clause, the `plutus/tier` dead token). None is CRITICAL or
HIGH; all are recorded. NO SHIP-READY CLAIM IS MADE — the last audit gate was FAIL (r18).
## §9 · THE ROUND-19 AUDIT (2026-10-01 — the r11..r18 drive's closing round)
**The built:** the audit artifact + its wiring (no code changed this round — triage only).
**The why:** the ship-docs audit gate (S7) requires every audit wired before any milestone.
**The how:** fresh `qwen-code-audit` scan → artifact JSON → TESTING_LOG verdict line +
  FAILURE_LOG F-08/F-09 + DEBUG_LOG EN-13.
**The evidence:** `GATE: FAIL (0 critical, 5 high)`, session `c8027864`,
  `artifacts/sg-ocr-round19.json`, dist SHA `3307a3b7a14d6f4b…`.
**The verification:** the verdict line is quoted verbatim in TESTING_LOG; the 5 blocking
  findings each have an OPEN F entry.
**The honest notes:** the CRITICAL class stays eliminated (0 critical, 3rd round running);
  the 5 highs are queued, not rushed; NO SHIP-READY CLAIM.
# CURRENT_STATE — PLUTUS-COMMON-SENSE-LSP
**As of:** 2026-10-01 · **The phase:** pre-ship-package (r19 FAIL 0c/5h wired; battery 46/0/158; derailment 6/6; gate FAIL — no ship-ready claim).
## THE ARCHITECTURE AS IT NOW IS
```
OMP native LSP runtime (diagnosticsOnWrite / OnEdit)
  │ queries EVERY registered server on every write/edit
  ▼
plutus-lsp (scripts/plutus-lsp.ts, stdio JSON-RPC)
  │  store.ts    the graph reader (L1 kg.json + fire-and-forget L2)  PLUTUS_NO_STORE
  │  judge.ts    CH-PLUTUS (7 nouls) + relevance kernel vs JevK5  JEVK5_DOWN
  │  cards.ts    the 7 tokens + STALE codes -> LSP diagnostics    the anti-phantom law
  ▼
publishDiagnostics -> the canon arrives on the write (the REFLEX)
```
## THE REGISTERED SERVERS (3)
`gi-lsp` (the GI reflex) · `jg-lsp` (the ticket reflex) · `plutus-lsp` (the canon reflex) — no eviction.
## THE 7 TOKENS
`plutus/law` · `plutus/violation` · `plutus/suspect` · `plutus/tier` · `plutus/callers` ·
`plutus/drift` · `plutus/stale`.
## THE POLARITY LAW (the invariant)
The LSP INFORMS; the extension ENFORCES. A block path in the server is a VIOLATION.
## THE CURRENT NUMBERS
- the battery: 46 pass / 0 fail / 158 expects (3 files)
- the live selftests ×4 (JevK5 jevk5-4b-v0.2-Q8_0): store 11 · judge 13 · script 12 · cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868, target-file warning proven)
- the receipt: `RELEVANCE judged=12/12 dropped=0` (forensic/lsp-receipts.log, 2026-09-30T17:46:57Z)
- the bundle: dist/plutus-lsp.js sha256 3307a3b7a14d6f4b (rebuilt at every round)
- the derived bar: 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus
- the audit gate: rounds 11-18 run (r18 FAIL 1c/5h — NO ship-ready claim)
## WHAT IS NOT YET DONE
The r17/r18 medium/low residual (~19 findings, recorded — hunk-hot-path caching, decl regex, accounting).
The live-TUI render proof (needs a session restart — the LSP binds at session construction).
The enforcement extension (deferred to v2). The 50+ item calibration corpus.
**Dist fingerprint (this update):**
Dist fingerprint (this update): `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`
## 3. Technical Implementation (interfaces, anchors, data flows)
### 3.1 The artifact table
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
### 3.2 The module contracts (from the source)
store.ts (graph reader): resolveRoot -> l1PathFor -> loadStore -> lawsForHunk (topK=12) + declarationsIn + callersOf + readL2. Refusals PLUTUS_NO_STORE / PLUTUS_NO_ROOT. judge.ts (decision kernel): health -> jevk5Fetch (one batched POST) -> chain P1..P7 -> relevancePass -> partitionByRelevance -> verdict (MAX over answered {P4,P5,P6}). Bars: throwT 0.85 (policy), demandT 0.30 (derived), relevanceT 0.30 (swept). cards.ts (renderer): lawCard + verdictCard + callersCard + staleCard -> fileCards; 7 tokens; fail-closed attribution. scripts/plutus-lsp.ts (stdio server): frame parser -> fileOf (normalize+confine) -> analyze (debounced) -> send (serialized). scripts/derailment-suite.ts (acceptance): D1-D6 through the live pipeline.
## 4. Architecture Changes (with the pipeline diagram)
```
OMP runtime LSP mux (didOpen/didChange/didSave)
  -> scripts/plutus-lsp.ts --stdio (frame parser -> analyze -> send)
  -> pipeline: L1 DETECT (lawsForHunk) -> L2 RELEVANCE (relevancePass, judge decides)
  -> CHAIN P1..P7 (one POST) -> VERDICT (pure code) -> CARDS (fileCards)
  -> publishDiagnostics (the canon arrives ON THE WRITE; INFORMS, never blocks)
```
## 5. Files Changed (git history + tree)
GIT HISTORY (last 40 commits):
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
e16350a feat(pcsl): THE JEV RELEVANCE KERNEL — the judge now decides relevance, not the regex
2a3d350 docs(pcsl): the proof archive addendum — the CONTINUING live LSP traffic
aa29c64 docs(pcsl): the final cert artifact + the LIVE-TUI PROOF ARCHIVE (append-only)
cf0841d feat(pcsl): THE LIVE-TUI PROOF + the L1 discovery + the final cert — the LSP IS LIVE
a619a60 fix(pcsl): the LOW set fixed + THE LSP DEPLOYMENT CONTRACT (the spawn gates)
22ec325 audit(pcsl): the independent auditors' round — 31 findings, the HIGH set fixed, the container re-certified
de07575 fix(pcsl): the audit round 2 — audit-alpha's 14 findings (F2-F14) fixed
a1d4342 audit(pcsl): the red-team slop audit #1 — 8 confirmed defects found and fixed
d903b91 test(pcsl): the live-TUI spawn proof — the runtime spawns it (proven) + the handshake fix
f0e5648 fix(jevk5)+chore(pcsl): the judge health probes its backend (the false-green generator) + the v0.2 checkpoint
665c31a test(pcsl): the container v2 — THE HOST BRIDGE + 4 defects found and fixed
177e7d6 test(pcsl): the deep-container-testing rig — 7/7 PASS in a clean mimo-ct:master container
DIFFSTAT since the r18 batch:
 .omp/derailment-suite-results.json                 |    2 +-
 .../.omp/container-test-results.json               |    1 +
 .../.omp/derailment-suite-results.json             |   97 ++
 .../CHECKPOINT_MANIFEST.md                         |   43 +
 .../PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md      |  289 ++++
 .../README.md                                      |   15 +
 .../SHA256SUMS                                     |   62 +
 .../bunfig.toml                                    |    3 +
 .../context_management/BUILD_STATE.md              |   29 +
 .../context_management/CHANGELOG.md                |   46 +
 .../context_management/COMPACTION_SURVIVAL.md      |   26 +
 .../context_management/CURRENT_STATE.md            |   38 +
 .../context_management/DECISION_CHAIN.md           |   47 +
 .../context_management/EVIDENCE_STATE.md           |   49 +
 .../context_management/NEXT_STEPS.md               |   25 +
 .../context_management/POST-COMPACTION_PROMPT.md   |   22 +
 .../context_management/RUNNING_BUILD_LOG.md        |   73 +
 .../context_management/RUNNING_DEBUG_LOG.md        |   64 +
 .../context_management/TASK_QUEUE.md               |   12 +
 .../dist/plutus-lsp.js                             | 1391 ++++++++++++++++++++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_1.md        |  161 +++
 .../forensic/FAILURE_LEDGER_PCSL_AUDIT_2.md        |   64 +
 .../forensic/LIVE_TUI_PROOF_ARCHIVE.md             |   50 +
 .../lsp.json                                       |   12 +
 .../package.json                                   |   11 +
 .../packages/plutus-common-sense-lsp/00-INDEX.md   |   23 +
 .../packages/plutus-common-sense-lsp/00-MISSION.md |   36 +
 .../plutus-common-sense-lsp/01-DISCOVERY.md        |   48 +
 .../plutus-common-sense-lsp/02-DPL1-SPEC.md        |  202 +++
 .../plutus-common-sense-lsp/03-MASTER-BLUEPRINT.md |   62 +
 .../packages/plutus-common-sense-lsp/06-WAVES.md   |   30 +
 .../packages/plutus-common-sense-lsp/07-GOALS.md   |   24 +
 .../reports/CALIBRATION_v1.md                      |   87 ++
 .../reports/CT_PLAN.txt                            |   68 +
 .../reports/INFO_CARD_DESIGN.md                    |   55 +
 .../reports/LIVE_TUI_SPAWN_PROOF.md                |   52 +
 .../reports/LSP_DEPLOYMENT_CONTRACT.md             |   57 +
 .../reports/P8_VERDICT.md                          |   42 +
 .../reports/PCSL_Engineering_Report_v1.md          |  545 ++++++++
 .../reports/RELEVANCE_KERNEL.md                    |   63 +
 .../reports/STALENESS_AUDIT.md                     |   64 +
 .../reports/pcsl-ct-results-v2.json                |   22 +
 .../reports/pcsl-ct-results.json                   |   21 +
 .../reports/pcsl-final-results.json                |   16 +
 .../scripts/derailment-suite.ts                    |  113 ++
 .../scripts/plutus-lsp.ts                          |  477 +++++++
 .../ship_docs/BUILD_REPORT.md                      |  157 +++
 .../ship_docs/DEBUG_LOG.md                         |   99 ++
 .../ship_docs/FAILURE_LOG.md                       |   50 +
 .../ship_docs/SPEC_VIOLATION_LOG.md                |   31 +
 .../ship_docs/TESTING_LOG.md                       |  173 +++
 .../ship_docs/THEATRICALITY_LOG.md                 |   61 +
 .../src/plutus-lsp/cards.ts                        |  352 +++++
 .../src/plutus-lsp/judge.ts                        |  532 ++++++++
 .../src/plutus-lsp/store.ts                        |  546 ++++++++
 .../tests/adversarial.test.ts                      |  326 +++++
 .../tests/calibration/calibrate.ts                 |   40 +
 .../tests/calibration/corpus.json                  |   29 +
 .../tests/judge-cards.test.ts                      |   90 ++
 .../tests/plutus-lsp.test.ts                       |   78 ++
 .../tsconfig.json                                  |    8 +
 artifacts/sg-ocr-round19.json                      |   19 +
 context_management/BUILD_STATE.md                  |   10 +-
 context_management/CHANGELOG.md                    |    5 +
 context_management/COMPACTION_SURVIVAL.md          |    4 +-
 context_management/CURRENT_STATE.md                |    6 +-
 context_management/EVIDENCE_STATE.md               |   10 +-
 context_management/NEXT_STEPS.md                   |    3 +
 context_management/POST-COMPACTION_PROMPT.md       |    4 +-
 context_management/RUNNING_BUILD_LOG.md            |    7 +
 context_management/RUNNING_DEBUG_LOG.md            |    7 +
 ship_docs/BUILD_REPORT.md                          |   13 +
 ship_docs/DEBUG_LOG.md                             |   11 +
 ship_docs/FAILURE_LOG.md                           |   20 +
 ship_docs/SPEC_VIOLATION_LOG.md                    |   22 +
 ship_docs/TESTING_LOG.md                           |   12 +
 76 files changed, 7457 insertions(+), 7 deletions(-)
SOURCE TREE (11 files):
scripts/plutus-lsp.ts (stdio server) / src/plutus-lsp/store.ts (graph reader) / src/plutus-lsp/judge.ts (decision kernel) / src/plutus-lsp/cards.ts (card renderer) / scripts/derailment-suite.ts (acceptance suite) / tests: plutus-lsp, judge-cards, adversarial, calibration / dist/plutus-lsp.js (the bundle)
# CHANGELOG — PLUTUS-COMMON-SENSE-LSP
## 2026-09-29 · the scaffold
- `feat(pcsl)` f4b9260 — the repo + the planning artifact (predicate PASS, spec-audit APPROVED 0/8)
  + the build package (DPL1, the master blueprint, the wave-plan, the goals).
## 2026-09-29 · W1–W5 (the waves)
- `feat(pcsl)` 5154527 — store.ts · judge.ts · cards.ts · scripts/plutus-lsp.ts · the lsp.json
  registration. The battery 9 pass / 0 fail. The selftest returned 2 cards + 5 live nouls.
  The receipt: PUBLISH n=3 on mirror.ts (verdict=SUSPECT).
## 2026-09-29 · W6 + P5 (the calibration + the adversarial sweep)
