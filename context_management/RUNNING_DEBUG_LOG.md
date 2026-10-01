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

## BUG-06..11 · the round-10 batch (found by the round-9/10 audits, 2026-09-30)
- BUG-06: knownAbs + MAX_STDIN ReferenceErrors — helpers never defined; the suite never ran those branches. FIX: resolve() + declaration. LESSON: the audit covers the branches the suite skips.
- BUG-07: validTier fail-open (unknown → IMMUTABLE +2). FIX: SUPERSEDED -2. LESSON: unknown must sink.
- BUG-08: chain raw-vs-deduped count (false JUDGE_ANSWER_COUNT) + inline reimplementation drift. FIX: validated set + reuse jevk5Fetch. LESSON: a helper prevents drift only if used.
- BUG-09: outer catch published [] (wiped last-good). FIX: send nothing. LESSON: one fallback policy, stated once.
- BUG-10: send() leaked drain/error listeners per frame. FIX: callback-only resolver. LESSON: one resolver per promise.
- BUG-11: YOU ARE EDITING named the canon file. FIX: targetFile threaded; live proof on cards.ts. LESSON: a warning naming the wrong file trains ignore.
- THE VERIFICATION: 26/0 battery + 4 live selftests + rebuilt bundle (51f95e841cf6247f).

## BUG-12 · the proxy file deleted, the unit crash-looping (found 2026-10-01)
- THE FINDING: every :4097 consumer refused; `systemctl --user status` showed restart counter
  ~19,428; journal: `MODULE_NOT_FOUND go-session-proxy.mjs` every 3s.
- THE ROOT CAUSE: the file the unit's ExecStart points at was deleted from the working tree
  (`D` in git status). `Restart=always` turned a missing file into a 19k-restart loop.
- THE FIX: restored the 469-line Shared_Workspace copy (not the 130-line committed one — it
  lacks the zen fingerprint: pinned UA, stable ses_ id, {bash,glob,grep,read} tool set).
  `node --check` clean → restart → `active`, `/healthz` ok, 4097/4098/8090 OPEN.
- THE LESSON: a crash-looping unit's FIRST diagnostic is "does the ExecStart target exist" —
  before any theory about ports, keys, or providers.
