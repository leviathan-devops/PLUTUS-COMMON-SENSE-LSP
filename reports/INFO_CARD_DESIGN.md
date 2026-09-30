# THE INFO-CARD REBUILD — the GI design, applied

## WHAT YOU CAUGHT
The first cut rendered a per-file blob:
```
"2 canon law(s) govern this file\n[IMMUTABLE] SL-CAP: … — engine3:307\n[IMMUTABLE] ZFP: …"
```
**No subject, no per-law separation, no measured probability, no verdict linkage.** An agent
cannot act on a wall of text — it is the slop you named.

## THE GI CONTRACT I COPIED (Graph_Intelligence/src/gi-lsp/cards.ts)
```
ONE SERVER, ONE CONSUMER: the LSP emits the cards as Diagnostics.
A card is built from a MEASURED store row — never a guess.
A card that asserts a count it did not measure is the FABRICATION anti-pattern.

interface FactCard { shape · title · rows[] · severity 1-4 · source<Token> · total }
  · the TITLE NAMES THE SUBJECT
  · the rows are EVIDENCE (real file:line, real measured numbers), NEVER empty
  · `code` = the shape, so a consumer filters on it
  · null when nothing measured — SILENCE, never a fabricated card
toDiagnostic(): code=shape, the title on line 1, the rows indented beneath
```

## THE CARDS AS THEY NOW RENDER (measured, container, judge live)
```
[code=LAW]    severity=3   SL-CAP — governs this code (relevance 0.37)
  LAW:    the stop-loss must never exceed 150 pips
  TIER:   IMMUTABLE — never change without a recorded ruling
  SOURCE: engine3_trade.py:307
  JUDGE:  relevance 0.37

[code=DRIFT]  severity=2   DRIFT — this change contradicts a prior decision (P7=0.880)
  LAW:    the stop-loss must never exceed 150 pips
  SOURCE: engine3_trade.py:307
  VECTOR: P1=0.259 P2=0.422 P3=0.749 P4=0.857 P5=0.300 P6=0.781 P7=0.880

[code=SUSPECT] severity=2  SUSPECT — SL-CAP may be breached (P5=0.392); evidence required
```
**What changed:** one card per law · the title names it · the judge's own probability is a
row · the whole vector is carried so the agent sees WHICH clause fired · `code` is filterable ·
nothing is asserted that was not measured.

## THE REGRESSION THIS CAUGHT (the audit's A7)
Rewiring the registry for the card work, `jg-lsp` had been EVICTED from `~/.omp/agent/lsp.json`
(only `gi-lsp` + `plutus-lsp` remained). **A7 asserted the siblings survive and it fired.**
`jg-lsp` is RESTORED — `[gi-lsp, plutus-lsp, jg-lsp]`.

## THE DEFECT THE CARDS EXPOSED (NOT YET FIXED)
Case B — a file named for stop-loss but containing MathExpr — still receives the **SL-CAP**
card at relevance 0.35 (above the 0.30 bar). The judge *preferred* MATHEXPR in the earlier
probe (0.458 vs 0.275) but the lexical detector here only surfaced SL-CAP as a candidate, so
the judge never got to choose between them. **The detector's candidate net, not the judge, is
the binding constraint on this case.** The fix is a mixed-candidate fixture in CI plus
tighter candidate generation — named, not claimed done.
