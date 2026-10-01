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
