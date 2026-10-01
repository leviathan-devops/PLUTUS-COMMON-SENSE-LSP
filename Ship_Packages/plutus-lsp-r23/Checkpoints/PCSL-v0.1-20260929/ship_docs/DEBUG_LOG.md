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
