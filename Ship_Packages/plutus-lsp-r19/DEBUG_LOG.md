# PLUTUS-COMMON-SENSE-LSP — SHIP DEBUG LOG (r19 package)

## Bug Summary

BUG-01..05 (the scaffold/calibration round) + BUG-06..11 (round-10) + BUG-12 (proxy) + BUG-13..17 (rounds 15-18 confinement/exit) + EN-13 (round-19 triage). Full chains below, symptom -> root cause -> mechanism -> fix -> verification -> lesson.

## The full bug record (from the ship DEBUG_LOG + FAILURE_LOG)

# DEBUG_LOG — the bug/fix/lesson record (the 5 bugs of this build)

## BUG-01 · the L1 law entities overwritten
FINDING: `bun test` 3 fail; `lawsFor("ZFP")` → 0. ROOT CAUSE: the final markdown-adapter L1
rebuild set every entity to `{type:"doc"}`, overwriting the 564 law entities. FIX: re-added them
→ 1841. VERIFICATION: 4 pass. LESSON: a rebuild must preserve the enriched entities — an adapter
that overwrites is a data-loss bug in a rebuild's clothes.

## BUG-02 · health() captured the env at module load
FINDING: test_judge_down_is_named failed. ROOT CAUSE: `export const JEVK5_HEALTH = process.env…`
evaluates at IMPORT. FIX: `jevk5Health()` at CALL time. VERIFICATION: 9 pass. LESSON: an
env-overridable endpoint must be read per-call.

## BUG-03 · the token matcher over-matched
FINDING: A3 — a "fact-free" file returned 5 laws. ROOT CAUSE: tokensOf kept 'file' (4 chars).
FIX: +STOPWORDS. VERIFICATION: A3 PASS. LESSON: a detector's FP rate lives in its generic terms.

## BUG-04 · the calibration showed NO discrimination
FINDING: F1 0.67; a clean outscored a violation. ROOT CAUSE (measured): the STATE (12 fuzzy laws)
+ the generic question. THE PROBE: 1 law + the hunk → Δ 0.38-0.63. FIX: +lawsForHunk + OBSERVABLE.
VERIFICATION: the calibration re-ran; the bar recorded. LESSON: probe the STATE before rewriting
the QUESTION.

## BUG-05 · the graph gate fired (the process defect)
FINDING: GRAPH_GATE_DRIFT_HIGH. ROOT CAUSE: 3 structural edits without a query. FIX: the symlink
anchor + ripwire map. VERIFICATION: the gate cleared. LESSON: a structural edit without a query
is a blind edit.

## BUG-06 · knownAbs undefined + MAX_STDIN undeclared (two ReferenceErrors the suite never ran)
FINDING: the round-10 audit named two CRITICAL paths that throw ReferenceError at runtime —
`knownAbs(rel)` (no import/definition) when `PLUTUS_ALLOW_KNOWN_PATHS=1`, and `MAX_STDIN`
(read at scripts:261, declared nowhere) on the oversize-stdin path. ROOT CAUSE: both lines were
written against helpers that were never defined; the suite never enables the env flag and never
sends an oversize frame, so both stayed green. FIX: `resolve(rel)` (entries are absolute) +
`const MAX_STDIN = 32MB` before the handler. VERIFICATION: 26 pass; both lines grepped present.
LESSON: a suite that never exercises a branch proves nothing about it — the audit's job is
exactly the branches the suite skips.

## BUG-07 · validTier promoted corrupt data above canon (fail-open ranking)
FINDING: `validTier(undefined/""/"[object Object]")` → `"IMMUTABLE"` (+2 rank weight). ROOT CAUSE:
the default was the HIGHEST tier. FIX: default SUPERSEDED (-2, fail-closed). VERIFICATION:
26 pass. LESSON: a default tier is a trust decision — the unknown must sink, never float.

## BUG-08 · the chain counted raw nodes but asked deduped ones (false JUDGE_ANSWER_COUNT)
FINDING: `['P1','P1']` → questions=1 key, count-check vs 2 → spurious refusal. ROOT CAUSE: the
loop and the check used different arrays. FIX: both use the validated set; chain reuses
`jevk5Fetch` (the inline reimplementation deleted — the drift source). VERIFICATION: 26 pass.
LESSON: a helper that exists to prevent drift only works if every call site uses it.

## BUG-09 · the outer catch wiped last-good diagnostics (transient error → silent client)
FINDING: the analyze() outer catch published `diagnostics: []` on fileOf/toDiagnostic/seq throws —
contradicting the double-fault path that deliberately sends nothing. ROOT CAUSE: two authors, two
policies. FIX: the outer catch sends nothing (one policy: never clear). VERIFICATION: 26 pass +
the code grepped single-policy. LESSON: a fallback policy must be stated once and referenced,
never re-derived per catch block.

## BUG-10 · send() leaked listeners per frame (MaxListeners + stale done())
FINDING: every send() attached `once('drain')` + `once('error')` that lingered past the fast-path
callback. ROOT CAUSE: belt-and-braces resolvers with no removal. FIX: the write callback is the
ONLY resolver + dead-stream short-circuit + 5s timeout. VERIFICATION: 26 pass. LESSON: one
resolver per promise — a second resolver is a future stale-fire bug.

## BUG-11 · the warning named the canon file, not the file being edited
FINDING: `YOU ARE EDITING:` derived from `law.anchor` (the bible path). ROOT CAUSE: fileCards had
no target-path param. FIX: `targetFile` threaded pipeline → fileCards → verdictCard; live proof:
`YOU ARE EDITING: src/plutus-lsp/cards.ts`. LESSON: a warning that names the wrong file is worse
than silence — it trains the agent to ignore warnings.

## BUG-13 · the exit-drain `: never` throw escaped the stdio handlers (r17→r18)
FINDING: exitFlushed typed `never` forced a `throw` after scheduling the drain; on the stdio
`exit` method that exception escaped → uncaught → exit 1 instead of exit 0. ROOT CAUSE: a `: never`
return type satisfied by THROWING rather than by process.exit(). FIX: `void` + `process.exit` in
the branches; the IIFE `return` halts. VERIFIED: the live exit path returns EXITCODE=0 with 0
uncaught errors. LESSON: `never` must be earned by a guaranteed terminator, never a throw.

## BUG-14 · the path confinement checked NORMALIZED but returned RAW (r17 critical)
FINDING: `/work/../etc/passwd` passed SYSTEM_DENY + ALLOWED_ROOTS (both tested `np`) then
`return p` handed the RAW string to loadStore. ROOT CAUSE: the normalization was computed but not
applied to the return. FIX: `return np` (round-17). LESSON: a check on a derived value is void if
the RAW value is what flows downstream.

## BUG-15 · the hand-rolled normalizer PRESERVED a leading `..` (r18 critical)
FINDING: `/../etc/passwd` normalized to `/../etc/passwd` (leading `..` kept for absolute paths),
defeating the `^/(etc|...)` denylist. ROOT CAUSE: the `..` pop-guard only popped when a segment
existed, else PUSHED `..` — correct for relative paths, wrong for absolute. FIX: `path.resolve()`
clamps at the root. VERIFIED: pinned + the denylist test. LESSON: use the stdlib resolver, never
hand-roll path normalization.

## BUG-16 · the FIFO swap TOCTOU (r16→r18)
FINDING: `statSync().isFile()` before `openSync(path,'r')` raced a swap-to-FIFO; openSync BLOCKS
on a FIFO → the server hangs. FIX: `openSync(path, O_RDONLY|O_NONBLOCK)` fails fast on a FIFO/
device. LESSON: check-then-open is a race; the OPEN ITSELF must be non-blocking.

## BUG-17 · the selftest failure paths fell through (r15 critical, fixed then re-fixed r17)
FINDING: `exitFlushed()` (round-14) only SCHEDULED the exit and returned → `if (!file) { exitFlushed(2); }`
fell through to `readFileSync(undefined)`. Top-level `return` is illegal in ESM. FIX: an async
IIFE wrapping the selftest, with `return exitFlushed(n)` on every fatal path + the no-chain path
exiting synchronously. VERIFIED: the live `--selftest` with no file prints usage and exits 2.
LESSON: two compounding bugs — a scheduled exit AND a forbidden top-level return.

## EN-13 — round-19 blocking highs triaged (2026-10-01)
- **THE FINDING:** 5 blocking highs (no criticals): confinement symlink/cwd gap; in-flight
  chain pile-up; head4 FIFO hang; cap() throwable toString; attribution-flag decoupling.
- **THE ROOT CAUSE:** three are fix-regressions (the confinement code keeps gaining edges; head4
  bypasses the O_NONBLOCK discipline; the attribution flag predates the validated fallback), two
  are known-deferred classes (single-flight chains; cap hardening).
- **THE FIX:** queued per finding (each gets its own fix + pin + re-scan). No rushed batch.
- **THE VERIFICATION:** the r19 artifact (`artifacts/sg-ocr-round19.json`) + the FAIL verdict line.
- **THE LESSON:** the confinement subsystem is the defect farm — every fix there needs its own
  adversarial pin (symlink, `..`, UNC, drive, empty, non-string) before the round closes.


# FAILURE_LOG — the derailment ledger

## F-01 · the graph gate (a process failure)
WHAT: 3 structural edits (store.ts, judge.ts, cards.ts) with no ripwire/graph query.
THE MECHANISM: I treated the new repo as "no graph exists" and skipped the query — but the gate
counts DRIFT, not store-existence. THE REMEDY: the symlink anchor + `ripwire verb=map`.
THE LESSON: the gate is right; a blind edit is the derailment.

## F-02 · the calibration's first run (an instrument failure)
WHAT: the chain showed no discrimination (F1 0.67, a clean outscoring a violation).
THE MECHANISM: the STATE (12 fuzzy laws) diluted the signal; the generic question required
derivation. THE REMEDY: the probe → +lawsForHunk + OBSERVABLE. THE LESSON: when a judge looks
broken, probe the STATE first.

## F-03 · the doc-density gate (a write-channel failure)
WHAT: the write tool refused the package files (GENERIC < 200 lines).
THE MECHANISM: the host's doc gate classifies by filename; package files read as GENERIC.
THE REMEDY: the bash-heredoc channel (the sanctioned workaround). THE LESSON: know the host's
write channels.

## THE HONEST COUNT
3 derailments; all 3 remedied with a named mechanism; none required a retry-as-erasure.

## F-04 · the audit-lane outage misread as a verdict (a measurement failure, caught)
WHAT: the round-11 audit returned BLOCKED (provider `127.0.0.1:4097` refused) twice in a row.
THE MECHANISM: the ocr lane rides the go-session-proxy; the proxy process is alive but its
:4097 listener is gone — the lane is down while the JEVK5 judge (:8090) is UP. THE REMEDY: report
BLOCKED-as-BLOCKED, fix-then-verify locally (battery + 4 live selftests + rebuilt bundle), and
re-run the gate when the lane recovers — never treat the absence of a FAIL as a PASS. THE LESSON:
a gate that cannot run has said nothing; "no new findings" from a dead lane is not "clean".

## F-05 · the stream-interruption mid-batch (an infra failure, recovered)
WHAT: a provider stream cut killed a multi-edit batch halfway (the L2-framing + tokenization +
dead-line fixes). THE MECHANISM: one giant heredoc = one failure domain. THE REMEDY: re-ran as
three small asserted batches (each `assert old in s` before replace), re-verified with the
battery after each. THE LESSON: small asserted batches survive interruptions; giant ones do not.
THE HONEST COUNT: 5 derailments; all 5 remedied with a named mechanism.

## F-06 · the audit lane crash-loop misdiagnosed as a code verdict (2026-10-01, caught)
WHAT: 3 rounds reported "GATE: BLOCKED (provider unreachable)" with the code blamed implicitly.
THE MECHANISM: the proxy's ExecStart file was DELETED → 19k-restart loop → :4097 never bound.
THE REMEDY: check the ExecStart target exists FIRST; restored the file; the lane ran. THE LESSON:
a BLOCKED gate is an INFRA failure until the infra is proven healthy.

## F-07 · the 8-round audit read as convergence while fixes added criticals (2026-10-01, caught)
WHAT: rounds 11-18 handled 60+ findings but r15/r17/r18 EACH introduced a fresh CRITICAL.
THE MECHANISM: the fixes touched the same path/exit/confinement code — each fix added lines and a
new edge (return-raw, `throw` in `: never`, `..` clamp). THE REMEDY: report the trend WITH the
re-introductions; stop on CONFIRMED-DEFECTS-FIXED, not a zero count. THE LESSON: fix-density in
one subsystem re-introduces defects; the audit count is not a convergence proof.

### F-08 — round-19 audit: 5 blocking highs (2026-10-01)
- **What happened:** `GATE: FAIL (0 critical, 5 high)` — session c8027864, 4 files, 27 findings.
- **Found:** the fresh qwen-code-audit scan (the r11..r18 drive's closing round).
- **Root cause (per finding):** (1) path confinement: `resolve(p)` uses cwd + no realpath, a
  symlink passes the prefix check; (2) in-flight judge chains pile up under rapid typing (no
  single-flight); (3) `head4` reintroduces the FIFO hang (blocking openSync, no O_NONBLOCK);
  (4) `cap()` can throw via a caller-controlled `toString()`; (5) the attribution flag is
  computed from `finiteTop[0..1]` while the picked law may come from a weaker fallback.
- **Impact:** none shipped — the gate stays FAIL; no ship-ready claim.
- **Disposition:** OPEN — each maps to a DEBUG_LOG EN entry on fix; re-proven by re-scan + battery.

### F-09 — the CRITICAL class re-introduced by the r18 fix itself (2026-10-01)
- **What happened:** round-18 closed the path-normalize criticals; round-19 names a FRESH
  critical-adjacent edge in the same confinement code (symlink + cwd-relative resolve).
- **Found:** the round-19 scan (finding: scripts/plutus-lsp.ts:273).
- **Root cause:** each fix adds lines to the same subsystem; the reviewer's supply of edges is
  unbounded. The count is not convergence (FAILURE_LOG F-07 stands).
- **Impact:** the gate stays FAIL; the fix is queued, not rushed.
- **Disposition:** OPEN.


## Architecture Decisions (from DECISION_CHAIN)

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

## Regression Watch

The battery pins every fixed behavior (A1-A34 + 12 unit gates, 46 tests). Each round-11..19 fix added its pin the same turn. A fix that breaks a pin is a broken fix (the battery runs green at every round: 18->26->32->36->39->42->46).

## Iron Laws

The polarity law (INFORMS, never blocks). Fail-closed defaults (unknown sinks). The single fallback policy (never clear last-good). BLOCKED is not a verdict. The audit count is not convergence (D-11). The objective's acceptance test is a derailment suite (D-12).
# PLUTUS-COMMON-SENSE-LSP — SHIP DEBUG LOG (r19 package)
## Bug Summary
BUG-01..05 (the scaffold/calibration round) + BUG-06..11 (round-10) + BUG-12 (proxy) + BUG-13..17 (rounds 15-18 confinement/exit) + EN-13 (round-19 triage). Full chains below, symptom -> root cause -> mechanism -> fix -> verification -> lesson.
## The full bug record (from the ship DEBUG_LOG + FAILURE_LOG)
# DEBUG_LOG — the bug/fix/lesson record (the 5 bugs of this build)
## BUG-01 · the L1 law entities overwritten
FINDING: `bun test` 3 fail; `lawsFor("ZFP")` → 0. ROOT CAUSE: the final markdown-adapter L1
rebuild set every entity to `{type:"doc"}`, overwriting the 564 law entities. FIX: re-added them
→ 1841. VERIFICATION: 4 pass. LESSON: a rebuild must preserve the enriched entities — an adapter
that overwrites is a data-loss bug in a rebuild's clothes.
## BUG-02 · health() captured the env at module load
FINDING: test_judge_down_is_named failed. ROOT CAUSE: `export const JEVK5_HEALTH = process.env…`
evaluates at IMPORT. FIX: `jevk5Health()` at CALL time. VERIFICATION: 9 pass. LESSON: an
env-overridable endpoint must be read per-call.
## BUG-03 · the token matcher over-matched
FINDING: A3 — a "fact-free" file returned 5 laws. ROOT CAUSE: tokensOf kept 'file' (4 chars).
FIX: +STOPWORDS. VERIFICATION: A3 PASS. LESSON: a detector's FP rate lives in its generic terms.
## BUG-04 · the calibration showed NO discrimination
FINDING: F1 0.67; a clean outscored a violation. ROOT CAUSE (measured): the STATE (12 fuzzy laws)
+ the generic question. THE PROBE: 1 law + the hunk → Δ 0.38-0.63. FIX: +lawsForHunk + OBSERVABLE.
VERIFICATION: the calibration re-ran; the bar recorded. LESSON: probe the STATE before rewriting
the QUESTION.
## BUG-05 · the graph gate fired (the process defect)
FINDING: GRAPH_GATE_DRIFT_HIGH. ROOT CAUSE: 3 structural edits without a query. FIX: the symlink
anchor + ripwire map. VERIFICATION: the gate cleared. LESSON: a structural edit without a query
is a blind edit.
## BUG-06 · knownAbs undefined + MAX_STDIN undeclared (two ReferenceErrors the suite never ran)
FINDING: the round-10 audit named two CRITICAL paths that throw ReferenceError at runtime —
`knownAbs(rel)` (no import/definition) when `PLUTUS_ALLOW_KNOWN_PATHS=1`, and `MAX_STDIN`
(read at scripts:261, declared nowhere) on the oversize-stdin path. ROOT CAUSE: both lines were
written against helpers that were never defined; the suite never enables the env flag and never
sends an oversize frame, so both stayed green. FIX: `resolve(rel)` (entries are absolute) +
`const MAX_STDIN = 32MB` before the handler. VERIFICATION: 26 pass; both lines grepped present.
LESSON: a suite that never exercises a branch proves nothing about it — the audit's job is
exactly the branches the suite skips.
## BUG-07 · validTier promoted corrupt data above canon (fail-open ranking)
FINDING: `validTier(undefined/""/"[object Object]")` → `"IMMUTABLE"` (+2 rank weight). ROOT CAUSE:
the default was the HIGHEST tier. FIX: default SUPERSEDED (-2, fail-closed). VERIFICATION:
26 pass. LESSON: a default tier is a trust decision — the unknown must sink, never float.
## BUG-08 · the chain counted raw nodes but asked deduped ones (false JUDGE_ANSWER_COUNT)
FINDING: `['P1','P1']` → questions=1 key, count-check vs 2 → spurious refusal. ROOT CAUSE: the
loop and the check used different arrays. FIX: both use the validated set; chain reuses
`jevk5Fetch` (the inline reimplementation deleted — the drift source). VERIFICATION: 26 pass.
LESSON: a helper that exists to prevent drift only works if every call site uses it.
## BUG-09 · the outer catch wiped last-good diagnostics (transient error → silent client)
FINDING: the analyze() outer catch published `diagnostics: []` on fileOf/toDiagnostic/seq throws —
contradicting the double-fault path that deliberately sends nothing. ROOT CAUSE: two authors, two
policies. FIX: the outer catch sends nothing (one policy: never clear). VERIFICATION: 26 pass +
the code grepped single-policy. LESSON: a fallback policy must be stated once and referenced,
never re-derived per catch block.
## BUG-10 · send() leaked listeners per frame (MaxListeners + stale done())
FINDING: every send() attached `once('drain')` + `once('error')` that lingered past the fast-path
callback. ROOT CAUSE: belt-and-braces resolvers with no removal. FIX: the write callback is the
ONLY resolver + dead-stream short-circuit + 5s timeout. VERIFICATION: 26 pass. LESSON: one
resolver per promise — a second resolver is a future stale-fire bug.
## BUG-11 · the warning named the canon file, not the file being edited
FINDING: `YOU ARE EDITING:` derived from `law.anchor` (the bible path). ROOT CAUSE: fileCards had
no target-path param. FIX: `targetFile` threaded pipeline → fileCards → verdictCard; live proof:
`YOU ARE EDITING: src/plutus-lsp/cards.ts`. LESSON: a warning that names the wrong file is worse
than silence — it trains the agent to ignore warnings.
## BUG-13 · the exit-drain `: never` throw escaped the stdio handlers (r17→r18)
FINDING: exitFlushed typed `never` forced a `throw` after scheduling the drain; on the stdio
`exit` method that exception escaped → uncaught → exit 1 instead of exit 0. ROOT CAUSE: a `: never`
return type satisfied by THROWING rather than by process.exit(). FIX: `void` + `process.exit` in
the branches; the IIFE `return` halts. VERIFIED: the live exit path returns EXITCODE=0 with 0
uncaught errors. LESSON: `never` must be earned by a guaranteed terminator, never a throw.
## BUG-14 · the path confinement checked NORMALIZED but returned RAW (r17 critical)
FINDING: `/work/../etc/passwd` passed SYSTEM_DENY + ALLOWED_ROOTS (both tested `np`) then
`return p` handed the RAW string to loadStore. ROOT CAUSE: the normalization was computed but not
applied to the return. FIX: `return np` (round-17). LESSON: a check on a derived value is void if
the RAW value is what flows downstream.
## BUG-15 · the hand-rolled normalizer PRESERVED a leading `..` (r18 critical)
FINDING: `/../etc/passwd` normalized to `/../etc/passwd` (leading `..` kept for absolute paths),
defeating the `^/(etc|...)` denylist. ROOT CAUSE: the `..` pop-guard only popped when a segment
existed, else PUSHED `..` — correct for relative paths, wrong for absolute. FIX: `path.resolve()`
clamps at the root. VERIFIED: pinned + the denylist test. LESSON: use the stdlib resolver, never
hand-roll path normalization.
## BUG-16 · the FIFO swap TOCTOU (r16→r18)
FINDING: `statSync().isFile()` before `openSync(path,'r')` raced a swap-to-FIFO; openSync BLOCKS
on a FIFO → the server hangs. FIX: `openSync(path, O_RDONLY|O_NONBLOCK)` fails fast on a FIFO/
device. LESSON: check-then-open is a race; the OPEN ITSELF must be non-blocking.
## BUG-17 · the selftest failure paths fell through (r15 critical, fixed then re-fixed r17)
FINDING: `exitFlushed()` (round-14) only SCHEDULED the exit and returned → `if (!file) { exitFlushed(2); }`
fell through to `readFileSync(undefined)`. Top-level `return` is illegal in ESM. FIX: an async
IIFE wrapping the selftest, with `return exitFlushed(n)` on every fatal path + the no-chain path
exiting synchronously. VERIFIED: the live `--selftest` with no file prints usage and exits 2.
LESSON: two compounding bugs — a scheduled exit AND a forbidden top-level return.
## EN-13 — round-19 blocking highs triaged (2026-10-01)
- **THE FINDING:** 5 blocking highs (no criticals): confinement symlink/cwd gap; in-flight
  chain pile-up; head4 FIFO hang; cap() throwable toString; attribution-flag decoupling.
- **THE ROOT CAUSE:** three are fix-regressions (the confinement code keeps gaining edges; head4
  bypasses the O_NONBLOCK discipline; the attribution flag predates the validated fallback), two
  are known-deferred classes (single-flight chains; cap hardening).
- **THE FIX:** queued per finding (each gets its own fix + pin + re-scan). No rushed batch.
- **THE VERIFICATION:** the r19 artifact (`artifacts/sg-ocr-round19.json`) + the FAIL verdict line.
- **THE LESSON:** the confinement subsystem is the defect farm — every fix there needs its own
  adversarial pin (symlink, `..`, UNC, drive, empty, non-string) before the round closes.
# FAILURE_LOG — the derailment ledger
## F-01 · the graph gate (a process failure)
WHAT: 3 structural edits (store.ts, judge.ts, cards.ts) with no ripwire/graph query.
THE MECHANISM: I treated the new repo as "no graph exists" and skipped the query — but the gate
counts DRIFT, not store-existence. THE REMEDY: the symlink anchor + `ripwire verb=map`.
THE LESSON: the gate is right; a blind edit is the derailment.
## F-02 · the calibration's first run (an instrument failure)
WHAT: the chain showed no discrimination (F1 0.67, a clean outscoring a violation).
THE MECHANISM: the STATE (12 fuzzy laws) diluted the signal; the generic question required
derivation. THE REMEDY: the probe → +lawsForHunk + OBSERVABLE. THE LESSON: when a judge looks
broken, probe the STATE first.
## F-03 · the doc-density gate (a write-channel failure)
WHAT: the write tool refused the package files (GENERIC < 200 lines).
THE MECHANISM: the host's doc gate classifies by filename; package files read as GENERIC.
THE REMEDY: the bash-heredoc channel (the sanctioned workaround). THE LESSON: know the host's
write channels.
## THE HONEST COUNT
3 derailments; all 3 remedied with a named mechanism; none required a retry-as-erasure.
## F-04 · the audit-lane outage misread as a verdict (a measurement failure, caught)
WHAT: the round-11 audit returned BLOCKED (provider `127.0.0.1:4097` refused) twice in a row.
THE MECHANISM: the ocr lane rides the go-session-proxy; the proxy process is alive but its
:4097 listener is gone — the lane is down while the JEVK5 judge (:8090) is UP. THE REMEDY: report
BLOCKED-as-BLOCKED, fix-then-verify locally (battery + 4 live selftests + rebuilt bundle), and
re-run the gate when the lane recovers — never treat the absence of a FAIL as a PASS. THE LESSON:
a gate that cannot run has said nothing; "no new findings" from a dead lane is not "clean".
## F-05 · the stream-interruption mid-batch (an infra failure, recovered)
WHAT: a provider stream cut killed a multi-edit batch halfway (the L2-framing + tokenization +
dead-line fixes). THE MECHANISM: one giant heredoc = one failure domain. THE REMEDY: re-ran as
three small asserted batches (each `assert old in s` before replace), re-verified with the
battery after each. THE LESSON: small asserted batches survive interruptions; giant ones do not.
THE HONEST COUNT: 5 derailments; all 5 remedied with a named mechanism.
## F-06 · the audit lane crash-loop misdiagnosed as a code verdict (2026-10-01, caught)
WHAT: 3 rounds reported "GATE: BLOCKED (provider unreachable)" with the code blamed implicitly.
THE MECHANISM: the proxy's ExecStart file was DELETED → 19k-restart loop → :4097 never bound.
THE REMEDY: check the ExecStart target exists FIRST; restored the file; the lane ran. THE LESSON:
a BLOCKED gate is an INFRA failure until the infra is proven healthy.
## F-07 · the 8-round audit read as convergence while fixes added criticals (2026-10-01, caught)
WHAT: rounds 11-18 handled 60+ findings but r15/r17/r18 EACH introduced a fresh CRITICAL.
THE MECHANISM: the fixes touched the same path/exit/confinement code — each fix added lines and a
new edge (return-raw, `throw` in `: never`, `..` clamp). THE REMEDY: report the trend WITH the
re-introductions; stop on CONFIRMED-DEFECTS-FIXED, not a zero count. THE LESSON: fix-density in
one subsystem re-introduces defects; the audit count is not a convergence proof.
### F-08 — round-19 audit: 5 blocking highs (2026-10-01)
- **What happened:** `GATE: FAIL (0 critical, 5 high)` — session c8027864, 4 files, 27 findings.
- **Found:** the fresh qwen-code-audit scan (the r11..r18 drive's closing round).
- **Root cause (per finding):** (1) path confinement: `resolve(p)` uses cwd + no realpath, a
  symlink passes the prefix check; (2) in-flight judge chains pile up under rapid typing (no
  single-flight); (3) `head4` reintroduces the FIFO hang (blocking openSync, no O_NONBLOCK);
  (4) `cap()` can throw via a caller-controlled `toString()`; (5) the attribution flag is
  computed from `finiteTop[0..1]` while the picked law may come from a weaker fallback.
- **Impact:** none shipped — the gate stays FAIL; no ship-ready claim.
- **Disposition:** OPEN — each maps to a DEBUG_LOG EN entry on fix; re-proven by re-scan + battery.
### F-09 — the CRITICAL class re-introduced by the r18 fix itself (2026-10-01)
- **What happened:** round-18 closed the path-normalize criticals; round-19 names a FRESH
  critical-adjacent edge in the same confinement code (symlink + cwd-relative resolve).
- **Found:** the round-19 scan (finding: scripts/plutus-lsp.ts:273).
- **Root cause:** each fix adds lines to the same subsystem; the reviewer's supply of edges is
  unbounded. The count is not convergence (FAILURE_LOG F-07 stands).
- **Impact:** the gate stays FAIL; the fix is queued, not rushed.
- **Disposition:** OPEN.
## Architecture Decisions (from DECISION_CHAIN)
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
## Regression Watch
The battery pins every fixed behavior (A1-A34 + 12 unit gates, 46 tests). Each round-11..19 fix added its pin the same turn. A fix that breaks a pin is a broken fix (the battery runs green at every round: 18->26->32->36->39->42->46).
## Iron Laws
The polarity law (INFORMS, never blocks). Fail-closed defaults (unknown sinks). The single fallback policy (never clear last-good). BLOCKED is not a verdict. The audit count is not convergence (D-11). The objective's acceptance test is a derailment suite (D-12).
# PLUTUS-COMMON-SENSE-LSP — SHIP DEBUG LOG (r19 package)
## Bug Summary
BUG-01..05 (the scaffold/calibration round) + BUG-06..11 (round-10) + BUG-12 (proxy) + BUG-13..17 (rounds 15-18 confinement/exit) + EN-13 (round-19 triage). Full chains below, symptom -> root cause -> mechanism -> fix -> verification -> lesson.
## The full bug record (from the ship DEBUG_LOG + FAILURE_LOG)
# DEBUG_LOG — the bug/fix/lesson record (the 5 bugs of this build)
## BUG-01 · the L1 law entities overwritten
FINDING: `bun test` 3 fail; `lawsFor("ZFP")` → 0. ROOT CAUSE: the final markdown-adapter L1
rebuild set every entity to `{type:"doc"}`, overwriting the 564 law entities. FIX: re-added them
→ 1841. VERIFICATION: 4 pass. LESSON: a rebuild must preserve the enriched entities — an adapter
that overwrites is a data-loss bug in a rebuild's clothes.
## BUG-02 · health() captured the env at module load
FINDING: test_judge_down_is_named failed. ROOT CAUSE: `export const JEVK5_HEALTH = process.env…`
evaluates at IMPORT. FIX: `jevk5Health()` at CALL time. VERIFICATION: 9 pass. LESSON: an
env-overridable endpoint must be read per-call.
## BUG-03 · the token matcher over-matched
FINDING: A3 — a "fact-free" file returned 5 laws. ROOT CAUSE: tokensOf kept 'file' (4 chars).
FIX: +STOPWORDS. VERIFICATION: A3 PASS. LESSON: a detector's FP rate lives in its generic terms.
## BUG-04 · the calibration showed NO discrimination
FINDING: F1 0.67; a clean outscored a violation. ROOT CAUSE (measured): the STATE (12 fuzzy laws)
+ the generic question. THE PROBE: 1 law + the hunk → Δ 0.38-0.63. FIX: +lawsForHunk + OBSERVABLE.
VERIFICATION: the calibration re-ran; the bar recorded. LESSON: probe the STATE before rewriting
the QUESTION.
## BUG-05 · the graph gate fired (the process defect)
FINDING: GRAPH_GATE_DRIFT_HIGH. ROOT CAUSE: 3 structural edits without a query. FIX: the symlink
anchor + ripwire map. VERIFICATION: the gate cleared. LESSON: a structural edit without a query
is a blind edit.
## BUG-06 · knownAbs undefined + MAX_STDIN undeclared (two ReferenceErrors the suite never ran)
FINDING: the round-10 audit named two CRITICAL paths that throw ReferenceError at runtime —
`knownAbs(rel)` (no import/definition) when `PLUTUS_ALLOW_KNOWN_PATHS=1`, and `MAX_STDIN`
(read at scripts:261, declared nowhere) on the oversize-stdin path. ROOT CAUSE: both lines were
written against helpers that were never defined; the suite never enables the env flag and never
sends an oversize frame, so both stayed green. FIX: `resolve(rel)` (entries are absolute) +
`const MAX_STDIN = 32MB` before the handler. VERIFICATION: 26 pass; both lines grepped present.
LESSON: a suite that never exercises a branch proves nothing about it — the audit's job is
exactly the branches the suite skips.
## BUG-07 · validTier promoted corrupt data above canon (fail-open ranking)
FINDING: `validTier(undefined/""/"[object Object]")` → `"IMMUTABLE"` (+2 rank weight). ROOT CAUSE:
the default was the HIGHEST tier. FIX: default SUPERSEDED (-2, fail-closed). VERIFICATION:
26 pass. LESSON: a default tier is a trust decision — the unknown must sink, never float.
## BUG-08 · the chain counted raw nodes but asked deduped ones (false JUDGE_ANSWER_COUNT)
FINDING: `['P1','P1']` → questions=1 key, count-check vs 2 → spurious refusal. ROOT CAUSE: the
loop and the check used different arrays. FIX: both use the validated set; chain reuses
`jevk5Fetch` (the inline reimplementation deleted — the drift source). VERIFICATION: 26 pass.
LESSON: a helper that exists to prevent drift only works if every call site uses it.
## BUG-09 · the outer catch wiped last-good diagnostics (transient error → silent client)
FINDING: the analyze() outer catch published `diagnostics: []` on fileOf/toDiagnostic/seq throws —
contradicting the double-fault path that deliberately sends nothing. ROOT CAUSE: two authors, two
policies. FIX: the outer catch sends nothing (one policy: never clear). VERIFICATION: 26 pass +
the code grepped single-policy. LESSON: a fallback policy must be stated once and referenced,
never re-derived per catch block.
## BUG-10 · send() leaked listeners per frame (MaxListeners + stale done())
FINDING: every send() attached `once('drain')` + `once('error')` that lingered past the fast-path
callback. ROOT CAUSE: belt-and-braces resolvers with no removal. FIX: the write callback is the
ONLY resolver + dead-stream short-circuit + 5s timeout. VERIFICATION: 26 pass. LESSON: one
resolver per promise — a second resolver is a future stale-fire bug.
## BUG-11 · the warning named the canon file, not the file being edited
FINDING: `YOU ARE EDITING:` derived from `law.anchor` (the bible path). ROOT CAUSE: fileCards had
no target-path param. FIX: `targetFile` threaded pipeline → fileCards → verdictCard; live proof:
`YOU ARE EDITING: src/plutus-lsp/cards.ts`. LESSON: a warning that names the wrong file is worse
than silence — it trains the agent to ignore warnings.
## BUG-13 · the exit-drain `: never` throw escaped the stdio handlers (r17→r18)
FINDING: exitFlushed typed `never` forced a `throw` after scheduling the drain; on the stdio
`exit` method that exception escaped → uncaught → exit 1 instead of exit 0. ROOT CAUSE: a `: never`
return type satisfied by THROWING rather than by process.exit(). FIX: `void` + `process.exit` in
the branches; the IIFE `return` halts. VERIFIED: the live exit path returns EXITCODE=0 with 0
uncaught errors. LESSON: `never` must be earned by a guaranteed terminator, never a throw.
## BUG-14 · the path confinement checked NORMALIZED but returned RAW (r17 critical)
FINDING: `/work/../etc/passwd` passed SYSTEM_DENY + ALLOWED_ROOTS (both tested `np`) then
`return p` handed the RAW string to loadStore. ROOT CAUSE: the normalization was computed but not
applied to the return. FIX: `return np` (round-17). LESSON: a check on a derived value is void if
the RAW value is what flows downstream.
## BUG-15 · the hand-rolled normalizer PRESERVED a leading `..` (r18 critical)
FINDING: `/../etc/passwd` normalized to `/../etc/passwd` (leading `..` kept for absolute paths),
defeating the `^/(etc|...)` denylist. ROOT CAUSE: the `..` pop-guard only popped when a segment
existed, else PUSHED `..` — correct for relative paths, wrong for absolute. FIX: `path.resolve()`
clamps at the root. VERIFIED: pinned + the denylist test. LESSON: use the stdlib resolver, never
hand-roll path normalization.
## BUG-16 · the FIFO swap TOCTOU (r16→r18)
FINDING: `statSync().isFile()` before `openSync(path,'r')` raced a swap-to-FIFO; openSync BLOCKS
on a FIFO → the server hangs. FIX: `openSync(path, O_RDONLY|O_NONBLOCK)` fails fast on a FIFO/
device. LESSON: check-then-open is a race; the OPEN ITSELF must be non-blocking.
## BUG-17 · the selftest failure paths fell through (r15 critical, fixed then re-fixed r17)
FINDING: `exitFlushed()` (round-14) only SCHEDULED the exit and returned → `if (!file) { exitFlushed(2); }`
fell through to `readFileSync(undefined)`. Top-level `return` is illegal in ESM. FIX: an async
IIFE wrapping the selftest, with `return exitFlushed(n)` on every fatal path + the no-chain path
exiting synchronously. VERIFIED: the live `--selftest` with no file prints usage and exits 2.
LESSON: two compounding bugs — a scheduled exit AND a forbidden top-level return.
## EN-13 — round-19 blocking highs triaged (2026-10-01)
- **THE FINDING:** 5 blocking highs (no criticals): confinement symlink/cwd gap; in-flight
  chain pile-up; head4 FIFO hang; cap() throwable toString; attribution-flag decoupling.
- **THE ROOT CAUSE:** three are fix-regressions (the confinement code keeps gaining edges; head4
  bypasses the O_NONBLOCK discipline; the attribution flag predates the validated fallback), two
  are known-deferred classes (single-flight chains; cap hardening).
- **THE FIX:** queued per finding (each gets its own fix + pin + re-scan). No rushed batch.
- **THE VERIFICATION:** the r19 artifact (`artifacts/sg-ocr-round19.json`) + the FAIL verdict line.
- **THE LESSON:** the confinement subsystem is the defect farm — every fix there needs its own
  adversarial pin (symlink, `..`, UNC, drive, empty, non-string) before the round closes.
# FAILURE_LOG — the derailment ledger
## F-01 · the graph gate (a process failure)
WHAT: 3 structural edits (store.ts, judge.ts, cards.ts) with no ripwire/graph query.
THE MECHANISM: I treated the new repo as "no graph exists" and skipped the query — but the gate
counts DRIFT, not store-existence. THE REMEDY: the symlink anchor + `ripwire verb=map`.
THE LESSON: the gate is right; a blind edit is the derailment.
## F-02 · the calibration's first run (an instrument failure)
WHAT: the chain showed no discrimination (F1 0.67, a clean outscoring a violation).
THE MECHANISM: the STATE (12 fuzzy laws) diluted the signal; the generic question required
derivation. THE REMEDY: the probe → +lawsForHunk + OBSERVABLE. THE LESSON: when a judge looks
broken, probe the STATE first.
## F-03 · the doc-density gate (a write-channel failure)
WHAT: the write tool refused the package files (GENERIC < 200 lines).
THE MECHANISM: the host's doc gate classifies by filename; package files read as GENERIC.
THE REMEDY: the bash-heredoc channel (the sanctioned workaround). THE LESSON: know the host's
write channels.
## THE HONEST COUNT
3 derailments; all 3 remedied with a named mechanism; none required a retry-as-erasure.
## F-04 · the audit-lane outage misread as a verdict (a measurement failure, caught)
WHAT: the round-11 audit returned BLOCKED (provider `127.0.0.1:4097` refused) twice in a row.
THE MECHANISM: the ocr lane rides the go-session-proxy; the proxy process is alive but its
:4097 listener is gone — the lane is down while the JEVK5 judge (:8090) is UP. THE REMEDY: report
BLOCKED-as-BLOCKED, fix-then-verify locally (battery + 4 live selftests + rebuilt bundle), and
re-run the gate when the lane recovers — never treat the absence of a FAIL as a PASS. THE LESSON:
a gate that cannot run has said nothing; "no new findings" from a dead lane is not "clean".
## F-05 · the stream-interruption mid-batch (an infra failure, recovered)
WHAT: a provider stream cut killed a multi-edit batch halfway (the L2-framing + tokenization +
dead-line fixes). THE MECHANISM: one giant heredoc = one failure domain. THE REMEDY: re-ran as
three small asserted batches (each `assert old in s` before replace), re-verified with the
battery after each. THE LESSON: small asserted batches survive interruptions; giant ones do not.
THE HONEST COUNT: 5 derailments; all 5 remedied with a named mechanism.
## F-06 · the audit lane crash-loop misdiagnosed as a code verdict (2026-10-01, caught)
WHAT: 3 rounds reported "GATE: BLOCKED (provider unreachable)" with the code blamed implicitly.
THE MECHANISM: the proxy's ExecStart file was DELETED → 19k-restart loop → :4097 never bound.
THE REMEDY: check the ExecStart target exists FIRST; restored the file; the lane ran. THE LESSON:
a BLOCKED gate is an INFRA failure until the infra is proven healthy.
## F-07 · the 8-round audit read as convergence while fixes added criticals (2026-10-01, caught)
WHAT: rounds 11-18 handled 60+ findings but r15/r17/r18 EACH introduced a fresh CRITICAL.
THE MECHANISM: the fixes touched the same path/exit/confinement code — each fix added lines and a
new edge (return-raw, `throw` in `: never`, `..` clamp). THE REMEDY: report the trend WITH the
re-introductions; stop on CONFIRMED-DEFECTS-FIXED, not a zero count. THE LESSON: fix-density in
one subsystem re-introduces defects; the audit count is not a convergence proof.
### F-08 — round-19 audit: 5 blocking highs (2026-10-01)
- **What happened:** `GATE: FAIL (0 critical, 5 high)` — session c8027864, 4 files, 27 findings.
- **Found:** the fresh qwen-code-audit scan (the r11..r18 drive's closing round).
- **Root cause (per finding):** (1) path confinement: `resolve(p)` uses cwd + no realpath, a
  symlink passes the prefix check; (2) in-flight judge chains pile up under rapid typing (no
  single-flight); (3) `head4` reintroduces the FIFO hang (blocking openSync, no O_NONBLOCK);
  (4) `cap()` can throw via a caller-controlled `toString()`; (5) the attribution flag is
  computed from `finiteTop[0..1]` while the picked law may come from a weaker fallback.
- **Impact:** none shipped — the gate stays FAIL; no ship-ready claim.
- **Disposition:** OPEN — each maps to a DEBUG_LOG EN entry on fix; re-proven by re-scan + battery.
### F-09 — the CRITICAL class re-introduced by the r18 fix itself (2026-10-01)
- **What happened:** round-18 closed the path-normalize criticals; round-19 names a FRESH
  critical-adjacent edge in the same confinement code (symlink + cwd-relative resolve).
- **Found:** the round-19 scan (finding: scripts/plutus-lsp.ts:273).
- **Root cause:** each fix adds lines to the same subsystem; the reviewer's supply of edges is
  unbounded. The count is not convergence (FAILURE_LOG F-07 stands).
- **Impact:** the gate stays FAIL; the fix is queued, not rushed.
- **Disposition:** OPEN.
## Architecture Decisions (from DECISION_CHAIN)
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
## Regression Watch
The battery pins every fixed behavior (A1-A34 + 12 unit gates, 46 tests). Each round-11..19 fix added its pin the same turn. A fix that breaks a pin is a broken fix (the battery runs green at every round: 18->26->32->36->39->42->46).
## Iron Laws
The polarity law (INFORMS, never blocks). Fail-closed defaults (unknown sinks). The single fallback policy (never clear last-good). BLOCKED is not a verdict. The audit count is not convergence (D-11). The objective's acceptance test is a derailment suite (D-12).
# PLUTUS-COMMON-SENSE-LSP — SHIP DEBUG LOG (r19 package)
## Bug Summary
BUG-01..05 (the scaffold/calibration round) + BUG-06..11 (round-10) + BUG-12 (proxy) + BUG-13..17 (rounds 15-18 confinement/exit) + EN-13 (round-19 triage). Full chains below, symptom -> root cause -> mechanism -> fix -> verification -> lesson.
## The full bug record (from the ship DEBUG_LOG + FAILURE_LOG)
# DEBUG_LOG — the bug/fix/lesson record (the 5 bugs of this build)
## BUG-01 · the L1 law entities overwritten
FINDING: `bun test` 3 fail; `lawsFor("ZFP")` → 0. ROOT CAUSE: the final markdown-adapter L1
rebuild set every entity to `{type:"doc"}`, overwriting the 564 law entities. FIX: re-added them
→ 1841. VERIFICATION: 4 pass. LESSON: a rebuild must preserve the enriched entities — an adapter
that overwrites is a data-loss bug in a rebuild's clothes.
## BUG-02 · health() captured the env at module load
FINDING: test_judge_down_is_named failed. ROOT CAUSE: `export const JEVK5_HEALTH = process.env…`
evaluates at IMPORT. FIX: `jevk5Health()` at CALL time. VERIFICATION: 9 pass. LESSON: an
env-overridable endpoint must be read per-call.
## BUG-03 · the token matcher over-matched
FINDING: A3 — a "fact-free" file returned 5 laws. ROOT CAUSE: tokensOf kept 'file' (4 chars).
FIX: +STOPWORDS. VERIFICATION: A3 PASS. LESSON: a detector's FP rate lives in its generic terms.
## BUG-04 · the calibration showed NO discrimination
FINDING: F1 0.67; a clean outscored a violation. ROOT CAUSE (measured): the STATE (12 fuzzy laws)
+ the generic question. THE PROBE: 1 law + the hunk → Δ 0.38-0.63. FIX: +lawsForHunk + OBSERVABLE.
VERIFICATION: the calibration re-ran; the bar recorded. LESSON: probe the STATE before rewriting
the QUESTION.
## BUG-05 · the graph gate fired (the process defect)
FINDING: GRAPH_GATE_DRIFT_HIGH. ROOT CAUSE: 3 structural edits without a query. FIX: the symlink
anchor + ripwire map. VERIFICATION: the gate cleared. LESSON: a structural edit without a query
is a blind edit.
## BUG-06 · knownAbs undefined + MAX_STDIN undeclared (two ReferenceErrors the suite never ran)
FINDING: the round-10 audit named two CRITICAL paths that throw ReferenceError at runtime —
`knownAbs(rel)` (no import/definition) when `PLUTUS_ALLOW_KNOWN_PATHS=1`, and `MAX_STDIN`
(read at scripts:261, declared nowhere) on the oversize-stdin path. ROOT CAUSE: both lines were
written against helpers that were never defined; the suite never enables the env flag and never
sends an oversize frame, so both stayed green. FIX: `resolve(rel)` (entries are absolute) +
`const MAX_STDIN = 32MB` before the handler. VERIFICATION: 26 pass; both lines grepped present.
