# THE JEV RELEVANCE KERNEL — why it was missing, and what it changed

## THE DEFECT YOU NAMED (it was real)
**"why is there not a jev decision making kernel wired into the detection to assess relevance"**

The code, verbatim, before the fix (`scripts/plutus-lsp.ts`):
```
50 : const all = lawsForHunk(store, file, decls, hunk, 3);   // ← RELEVANCE DECIDED HERE (lexical)
64 : await chain(buildState(file, all, hunk), [P1..P7], ..., observableQuestion(all));
```
`lawsForHunk` = token overlap (`overlap*2 + nums*3`). **So the LEXICON decided relevance, and
the judge was handed a pre-filtered top-3 and asked only "does this breach a law you were
already given."** The judge never got asked the question that matters: *which laws govern here.*
That is the exact inversion `jev-decision-gate-firewall` exists to prevent
(**THE REGEX DETECTS. JEV DECIDES. CODE ENFORCES.**)

## THE MEASURED CONSEQUENCE (before the fix)
```
A-RELEVANT-SL        cards=2
B-RELEVANT-ZFP       cards=2
C-RELEVANT-MATHEXPR  cards=2   ← a MathExpr file got the stop-loss + ZFP laws (the over-match)
D-NEUTRAL            cards=0
E-UNRELATED          cards=0
```

## THE FIX — the judge now decides relevance
```
L1 DETECTOR   lawsForHunk(..., 12)   a WIDE net · no opinion · free · zero intelligence
L2 JUDGE      relevancePass(candidates, file, hunk)
              ONE state · ONE noul PER CANDIDATE · ONE batched pass · ~1s
              partitionByRelevance(candidates, rows) at RELEVANCE_T
              ↓ only the laws the judge marks relevant survive
L2 JUDGE      chain(...) — the violation pass, narrowed to the survivors
L3 ENFORCER   cards -> publishDiagnostics
```
**FAIL-CLOSED ON NOISE / FAIL-OPEN ON COVERAGE:** if the judge is down we do NOT spray the
unfiltered net — we keep the lexical top-3 and stamp `RELEVANCE degraded=<reason>` in the receipt.

## THE DERIVED BAR (measured, not assumed)
```
the positive distribution:  SL-CAP=0.345 · IRON-01=0.597 · MATHEXPR-SYNTAX=0.473
0.50 → A=0 cards, C=0 cards     FALSE NEGATIVES (the judge under-reads; coverage lost)
0.30 → A=3(SL-CAP) B=2(IRON-01) C=2(MATHEXPR) D/E=0    ← each file gets ITS OWN law
0.20 → identical to 0.30 (nothing further crosses)
⇒ RELEVANCE_T = 0.30 — the LOWEST bar recovering every measured positive while the neutral
  and unrelated files still emit nothing.
```

## THE MEASURED RESULT (after)
```
A-SL-RELEVANT          cards=3  the SL-CAP law      ✓ its own law
B-ZFP-RELEVANT         cards=2  the IRON-01 law     ✓ its own law
C-MATHEXPR-RELEVANT    cards=2  the MATHEXPR law    ✓ NOT the SL/ZFP laws (the over-match is gone)
D-NEUTRAL              cards=0                     ✓ no noise
E-UNRELATED            cards=0                     ✓ no noise
```
**THE OVER-MATCH IS FIXED BY THE JUDGE, NOT BY A REGEX.**

## THE LIMIT (stated, not hidden)
The bar is derived on the **POSITIVE** side. In this corpus the detector produced NO candidates
for the neutral/unrelated files, so the judge's NEGATIVE discrimination (a file that lexically
matches one law but is about another) is not yet exercised. **That is the next measurement** — a
mixed-candidate fixture. I am not calling it done until that runs.
