# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)

## 1. Project Identity

PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.

## 2. Architecture Overview

```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```

## 3. Key Files Reference

| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |

scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).

## 4. Design Decisions (verbatim rulings)

# DECISION_CHAIN — the rulings this build produced

## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.

## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).

## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.

## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.

## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.

## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.

## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).

## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.

## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.

## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.

## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.

## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.


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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors

## 5. Implementation Patterns

Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.

## 6. Known Bugs (the r19 residual)

See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).

## 7. Operational Knowledge

PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.

## 8. Compaction Recovery Guide

Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
1. CRITICALs — `knownAbs`/`MAX_STDIN` ReferenceErrors
## 5. Implementation Patterns
Fail-closed everywhere: unknown tiers sink (SUPERSEDED -2); unanswered clauses are UNKNOWN (never 0); missing P2 is INCONCLUSIVE; non-finite p is unreadable; malformed entries filtered before sort/map; non-arrays degrade to empty states. Never-throw cards: every renderer guards null/non-array/non-string. Bounded strings: cap() on every interpolated store/judge string. Receipts buffered + flushed on exit; the send chain drained before exit.
## 6. Known Bugs (the r19 residual)
See BUILD_REPORT section 7 (the same named residual). Plus the ~14 medium/low list in artifacts/sg-ocr-round19.json (session c8027864).
## 7. Operational Knowledge
PLUTUS_L1_PATH overrides the canon path (authoritative per call). PLUTUS_ALLOW_KNOWN_PATHS=1 opts into homedir-relative known paths. PLUTUS_ALLOWED_ROOTS confines fileOf. The LSP binds at session construction (restart the TUI to arm). The receipt lives at forensic/lsp-receipts.log (PLUTUS_LSP_RECEIPT overrides). The judge must be UP (:8090 health ok:true) or every verdict degrades to lexical/JUDGE_DOWN.
## 8. Compaction Recovery Guide
Read context_management in order: POST-COMPACTION_PROMPT (entry) -> CURRENT_STATE (truth) -> EVIDENCE_STATE (proof) -> NEXT_STEPS (work) -> TASK_QUEUE (gates). The dist fingerprint is in BUILD_STATE + all 5 read-first docs (U2 green). The battery re-runs with PLUTUS_L1_PATH set. The derailment suite re-proves the objective.
# PLUTUS-COMMON-SENSE-LSP — FULL BUILD CONTEXT (r19 package)
## 1. Project Identity
PLUTUS-COMMON-SENSE-LSP: the third custom OMP LSP server (sibling of gi-lsp, jg-lsp). It makes the Plutus knowledge graph REFLEXIVE: on every write the canon arrives as diagnostics. Own repo, own .git, own Checkpoints/. Bundle 3307a3b7a14d6f4b. Battery 46/0/158.
## 2. Architecture Overview
```
L1 semantica kg.json (1836 entities: 1277 docs + 559 laws; 1141 rels)
L2 arsumbris socket (fire-and-forget probe, receipt only)
JevK5-4b :8090 (relevancePass + chain P1..P7, one POST each)
pipeline -> verdict (MAX over {P4,P5,P6}) -> cards (7 tokens) -> publishDiagnostics
```
## 3. Key Files Reference
| path | KB | SHA-16 | role |
|---|---|---|---|
| `dist/plutus-lsp.js` | 50 | `3307a3b7a14d6f4b` | the deployed bundle |
| `src/plutus-lsp/store.ts` | 31 | `fa72c398102ae5a6` | the graph reader |
| `src/plutus-lsp/judge.ts` | 33 | `49a9e899fe8ad6da` | the decision kernel |
| `src/plutus-lsp/cards.ts` | 20 | `1e4ab157e09afc7a` | the card renderer |
| `scripts/plutus-lsp.ts` | 31 | `228ad6e5e53ac15d` | the stdio server |
| `scripts/derailment-suite.ts` | 4 | `406e3edf3ee9a259` | the acceptance suite |
scripts/plutus-lsp.ts:64 pipeline · :161 --stdio guard · :248 MAX_STDIN · fileOf (normalize+confine) · analyze (debounced, single-policy never-clear) · send (serialized, one resolver).
src/plutus-lsp/store.ts:62 resolveRoot (STRONG wins at depth) · :101 l1PathFor (env->local->cache->known) · :140 loadStore (regular-file + O_NONBLOCK + short-read named) · :373 lawsForHunk (wide net, topK=12) · :430 callersOf (both-direction suffix).
src/plutus-lsp/judge.ts:54 jevk5Fetch (shared helper) · :90 health (clamped) · :115 chain (deduped, validated) · :215 verdict (fail-closed jurisdiction, MAX wrongness) · :329 relevancePass (prioritized cap, visible judged/total/dropped).
src/plutus-lsp/cards.ts:75 lawCard (clean counts) · :110 verdictCard (epsilon attribution, vacuous downgrade) · :213 callersCard (measured) · :235 staleCard (coded) · :252 fileCards (targetFile threaded).
## 4. Design Decisions (verbatim rulings)
# DECISION_CHAIN — the rulings this build produced
## D-01 · THE POLARITY (inherited, not re-litigated)
The LSP INFORMS; the extension ENFORCES. Evidence: the gi-lsp header + the jg-lsp header + this build's cards.
## D-02 · THE STATE IS READ FROM DISK
Every judge state field comes from a file/socket read. The agent cannot type the state.
Evidence: store.ts (loadStore/lawsForHunk) + judge.ts (buildState takes the laws + the hunk).
## D-03 · THE OBSERVABLE QUESTION (found by the calibration)
The generic "does this contradict the law?" requires the judge to DERIVE → no discrimination.
An OBSERVABLE question (a direct value read) discriminates (Δ 0.38–0.63). Evidence: the probe + CALIBRATION_v1.
## D-04 · THE PRECISE L1 (found by the calibration)
12 fuzzy laws dilute the state; 3 ranked laws sharpen it. Evidence: lawsForHunk + the sweep.
## D-05 · THE BAR IS DERIVED, NEVER ASSUMED
bar 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus, recorded WITH it. The false-positive
cost is BOUNDED by the polarity law (a Warning, never a block). Evidence: reports/CALIBRATION_v1.md.
## D-06 · THE STOPWORDS (found by the adversarial sweep)
Generic tokens ('file') over-match. Evidence: the A3 failure → +STOPWORDS → the pass.
## D-07 · THE SINGLE FALLBACK POLICY (found by round-10)
A transient failure sends NOTHING (the client keeps last-good); publishing [] is a second policy
and it contradicts the first. Evidence: the outer-catch fix + the double-fault path (one policy).
## D-08 · FAIL-CLOSED DEFAULTS (found by round-10)
An unknown tier sinks (SUPERSEDED -2), never floats (IMMUTABLE +2). An unanswered clause is
UNKNOWN, never 0. Evidence: validTier + verdict() guards.
## D-09 · THE WARNING NAMES THE TARGET (found by round-10)
A warning derived from the law's anchor names the canon file, not the file being edited — worse
than silence. Evidence: targetFile threading, live proof `YOU ARE EDITING: src/plutus-lsp/cards.ts`.
## D-10 · BLOCKED IS NOT A VERDICT (found by round-11)
A gate that cannot run has said nothing. "No new findings" from a dead lane is not "clean".
Evidence: round-11 BLOCKED (:4097 refused) with 21 fixes already landed and verified locally.
## D-11 · THE AUDIT COUNT IS NOT CONVERGENCE (rounds 11-18)
The blocking count fell (13->12->7->5->2) while the fixes re-introduced CRITICALs (r15/r17/r18).
The stop condition is CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a zero count.
Evidence: the trend + the three self-inflicted criticals.
## D-12 · THE OBJECTIVE'S ACCEPTANCE TEST IS A DERAILMENT SUITE
A green battery proves the MECHANISM; the objective ("the agent cannot derail") needs REAL
derailments pushed through the pipeline. Evidence: scripts/derailment-suite.ts, 6/6 PASS.
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
