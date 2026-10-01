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

## D-13 · THE CONFIGURABLE SCOPE (2026-10-02)
The scope gate reads PLUTUS_LSP_SCOPE (the path segment) + PLUTUS_LSP_SCOPE_FILES (the explicit
files) with PLUTUS defaults. A re-host sets ONE env var and gets scoping — the boilerplate's reuse
seam. Evidence: /tmp/scope-custom.ts (default OUT, custom segment IN, custom file IN).

## D-14 · THE CAP AT THE ALLOCATION SITE (2026-10-02)
10 security findings, every one a cap that existed elsewhere but not on the HOTTEST path of its
surface. The law: the cap goes AT the allocation/interpolation site, never one layer up.
Evidence: F-17 + A45.
