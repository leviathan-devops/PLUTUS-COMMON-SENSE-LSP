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
