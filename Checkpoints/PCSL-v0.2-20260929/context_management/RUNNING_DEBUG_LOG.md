# RUNNING_DEBUG_LOG — the bug/fix/lesson record

## BUG-01 · the L1 law entities overwritten (found by the W1 gate)
- THE FINDING: `bun test` → 3 fail; `lawsFor("ZFP")` returned 0.
- THE ROOT CAUSE: my final markdown-adapter L1 rebuild set EVERY entity to `{type:"doc"}` —
  overwriting the 564 law entities added earlier. The adapter had no law-preservation step.
- THE FIX: re-added the law entities from laws/*.md → 1841 total.
- THE LESSON: a rebuild must PRESERVE the enriched entities, or re-derive them — an adapter
  that overwrites is a data-loss bug wearing a rebuild's clothes.

## BUG-02 · health() captured the env at module load (found by the W2 gate)
- THE FINDING: test_judge_down_is_named failed — the env change had no effect.
- THE ROOT CAUSE: `export const JEVK5_HEALTH = process.env...` evaluates at IMPORT time.
- THE FIX: `jevk5Health()` reads at CALL time.
- THE LESSON: an env-overridable endpoint must be read per-call, or the override is dead code.

## BUG-03 · the token matcher over-matched (found by the adversarial A3)
- THE FINDING: a "fact-free" file returned 5 laws.
- THE ROOT CAUSE: tokensOf kept generic words ('file', 4 chars) which appear in law text.
- THE FIX: +STOPWORDS (the generic set) + length ≥ 4.
- THE LESSON: a detector's false-positive rate lives in its generic terms — the adversarial
  case found it; the happy path never would.

## BUG-04 · the calibration showed NO discrimination (found by W6)
- THE FINDING: best F1 0.67; a clean scored higher than a violation.
- THE ROOT CAUSE (measured, not blamed): the STATE (12 fuzzy laws) diluted the signal; the
  generic question required the judge to DERIVE. The probe proved the question works with
  ONE law (Δ 0.38-0.63).
- THE FIX: +lawsForHunk (ranked, top-3) + OBSERVABLE question templates.
- THE LESSON: when a judge looks broken, probe the STATE before rewriting the QUESTION.

## BUG-05 · the graph gate fired (the process defect)
- THE FINDING: GRAPH_GATE_DRIFT_HIGH after 3 structural edits.
- THE ROOT CAUSE: I wrote 3 files without a ripwire/graph query (the pin's law).
- THE FIX: the symlink anchor (.pcsl-anchor) + ripwire map (the cwd-confinement remedy).
- THE LESSON: the gate is right — a structural edit without a query is a blind edit.
