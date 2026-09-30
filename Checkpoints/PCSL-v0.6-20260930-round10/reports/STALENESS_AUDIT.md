# THE STALENESS AUDIT — what the graph carried that it should not have

## WHAT THE OPERATOR CAUGHT
`"150 pips" - 15 pips. this is from the old 5 pip math era. pip math is 4 decimal points`

**The finding is worse than a stale number — it was a FABRICATION.**
```
THE CANON SAYS (Bible 4.5, the LIVE authority):
  line 59 :  SL ceiling 36 pips HARD (D17)
  line 337 : D17 SL ceiling = 36 pips HARD (mirror.ts:79)
            Law-7 pair buffers: EUR 2 / GBP 3 / AUD 3 / DXY 5
            GOLDEN_SL_MAX_PIPS = 9.5
THE 4-DECIMAL CONVENTION (Bible 4.0:2405-2414): 1 pip = 0.0001 for FX; DXY = 0.01
THE UNIT MATH: 150 pips x 0.0001 = 0.0150 price = 1500 POINTS
                15 pips x 0.0001 = 0.0015 price =  150 POINTS
  ⇒ the "150" was a POINTS count relabelled "pips" — off by 10x, from the 5-decimal era.

WHERE IT CAME FROM: MY OWN PROBE FIXTURE. The value "150 pips" appears in
  tests/plutus-lsp.test.ts, tests/adversarial.test.ts, src/plutus-lsp/judge.ts:189
  (the OBSERVABLE question template), store.ts:276 (a comment).
  THE CANON NEVER STATED IT. I invented it, and the card renderer printed it as canon.
```
**The lesson (the class, not the instance):** an LLM-authored probe fixture becomes a
"fact" the card layer faithfully renders. **The renderer is only as honest as its input.**
So the input must be sourced, or the card must declare it is a probe.

## THE REPAIRS
```
1  the fabricated constant removed from the tests + the OBSERVABLE template + the report
2  the OBSERVABLE question re-templated to the canon's real law:
     "Does the evidence state a stop-loss value GREATER than 36 pips? (36 is the D17
      ceiling; read the number)"
3  INFO_CARD_DESIGN.md's rendered sample corrected to the canon's 36-pip ceiling
```

## THE GRAPH-WIDE STALENESS SWEEP (the operator's ask: no stale context)
```
THE DANGLING ANCHORS, before:
  127 cards anchored to a DELETED tree:
    /home/leviathan/.omp/wt/plutus-main-66dfa4c/PLUTUS/agent/MASTER_CONTEXT/…
  318 cards with an EMPTY anchor (extracted from the corpus, source line never captured)
  119 cards whose anchor did not resolve to a real file

THE REPAIR:
  127  repointed onto the live corpus root   (MASTER_CONTEXT/<basename>)
  119  repointed by BASENAME lookup onto the live file
  318  marked `anchor: "UNANCHORED — extracted from the canon corpus, source line not
       captured"` + `provenance: "UNCITED"` — the knowledge is kept, the MISSING PROVENANCE
       is declared. An uncited card is honest; a fabricated one is not.

THE FINAL CENSUS (measured):
  the law cards                                564
  CITED and resolving to a real file           246
  UNCITED (honestly marked)                    318
  DANGLING (neither)                             0   ← the class that fires is closed
```

## THE STANDING RULE (the fix that prevents the class)
```
A CARD MAY NOT RENDER A CONSTANT THAT IS NOT TRACEABLE TO A `file:line` IN THE GRAPH.
The relevance kernel's state carries the law's `anchor`; the judge quotes the statement.
If the anchor is UNANCHORED, the card says so — the agent can then demand the source
instead of trusting a number. NO CARD SILENTLY ASSERTS AN UNSOURCED CONSTANT.
```
