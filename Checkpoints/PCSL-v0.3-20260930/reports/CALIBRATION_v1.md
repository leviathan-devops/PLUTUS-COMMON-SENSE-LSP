# CALIBRATION v1 — the DERIVED BARS (W6)

**Date:** 2026-09-29 · **The instrument:** CH-PLUTUS (the 5-of-7 nouls) vs JevK5-4b-v0.2-Q8_0 (`:8090`)
**The corpus:** `tests/calibration/corpus.json` — 4 labeled violations + 4 labeled cleans (8 items)
**The harness:** `tests/calibration/calibrate.ts` (re-runnable; ~3 s)

## THE DERIVED BAR (measured, never assumed)

```
★ THE DERIVED BAR: 0.30   (F1=0.60 · precision=0.50 · recall=0.75)
```

The sweep (P4 ≥ bar → VIOLATION), verbatim from the run:

| bar | TP/4 | FP/4 | precision | recall | F1 |
|---|---|---|---|---|---|
| 0.30 | 3 | 3 | 0.50 | 0.75 | **0.60** ← the optimum |
| 0.45 | 3 | 3 | 0.50 | 0.75 | 0.60 |
| 0.50 | 2 | 1 | 0.67 | 0.50 | 0.57 |
| 0.60 | 1 | 0 | 1.00 | 0.25 | 0.40 |
| ≥0.65 | 0 | 0 | 0.00 | 0.00 | 0.00 |

**Above 0.60 the instrument goes BLIND** — no violation scores that high on this corpus. The
operating point is **0.30** (the recall-favoring end).

## THE PER-ITEM MEASUREMENT (verbatim)

| id | label | P4 | P7 | what it is |
|---|---|---|---|---|
| C1 | violation | 0.610 | 0.648 | SL 200 exceeds the 150-pip cap |
| C2 | violation | 0.588 | 0.556 | three TPs (IRON-03: ONE TP) |
| C3 | violation | 0.310 | 0.275 | the pair renamed EURUSD (IRON-02) |
| C4 | violation | 0.491 | 0.420 | a flat RRR (IRON-04) |
| C5 | clean | 0.563 | 0.671 | SL = zone edge − buffer (conformant) |
| C6 | clean | 0.477 | 0.430 | ONE TP at the nearest zone |
| C7 | clean | 0.252 | 0.372 | E1→E2→E3 linear |
| C8 | clean | 0.497 | 0.415 | the canon constants, unchanged |

## THE THREE DEFECTS THE CALIBRATION FOUND (and the fixes)

```
DEFECT 1  the GENERIC question requires the judge to DERIVE the contradiction.
          The discrimination probe (1 law + the hunk): VIOL vs CLEAN Delta 0.38-0.63.
          FIX: +OBSERVABLE question templates (the per-law DIRECT READ) — judge.ts.
DEFECT 2  lawsForFile fed 12 fuzzy laws, DILUTING the state.
          FIX: +lawsForHunk (rank by token + numeric overlap, top-3) — store.ts.
DEFECT 3  the token matcher over-matched on generic words ('file' -> 5 laws).
          FIX: +STOPWORDS — store.ts.
```

## THE HONEST RESIDUAL (named, never hidden)

1. **The corpus is SMALL (8 items).** The F1 plateau (0.55-0.60 across bars 0.30-0.45) is the
   small-n signature — a 50+ item corpus is needed for a stable bar.
2. **Precision 0.50** — half the cleans are flagged. **BOUNDED BY THE POLARITY LAW:** a flagged
   clean is a *Warning* (SUSPECT, severity 2) — a HINT the agent may dismiss, NEVER a block.
   The false-positive cost is a dismissed warning, not a stopped build.
3. **C5's clean hunk carries no numeric value** (`zone.bottom - 2.5 * PIP`) — the judge cannot
   read a stop-loss magnitude, so it reads uncertain (0.563). **The state, not the question, is
   the limit:** the evidence must carry the observable value.
4. **The instrument's ceiling is the question's writeability** (the skill's boundary law): the
   engineered decisions work; the un-engineered remainder stays with the LLM.

## THE OPERATING DECISION (recorded)

```
THROW_T  = 0.85  (a hard VIOLATION — unused on this corpus; the top score was 0.610)
DEMAND_T = 0.30  (the DERIVED bar — the recall-favoring operating point)
Deployed in OBSERVE mode: the LSP INFORMS; the extension would enforce.
```
