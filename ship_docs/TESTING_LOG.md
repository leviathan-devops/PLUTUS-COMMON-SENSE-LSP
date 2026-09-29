# TESTING_LOG — the test plan + the results (all four tiers)

## THE PLAN (the tiers)
| tier | the scope | the tool | the state |
|---|---|---|---|
| L0 | the typecheck | `bun test` (the TS executes) | PASS |
| L1 | the unit — the pure fns | `bun test tests/` | **17 pass / 0 fail** |
| L2 | the script test — the real modules + the real graph + the LIVE judge | `--selftest` | PASS (2 cards, 5 nouls) |
| L3 | the driven server — the real stdio frames | the drive harness | PASS (PUBLISH n=3) |
| L4 | the live TUI | the omp LSP runtime | **PENDING (T1)** |

## THE ADVERSARIAL SWEEP (8 angles — adversarial FIRST, the happy path LAST)
| # | the angle | the passToken | the result |
|---|---|---|---|
| A1 | the absent graph | PLUTUS_NO_STORE | PASS |
| A2 | the down judge | JEVK5_DOWN | PASS |
| A3 | a fact-free file | NO card | PASS (after the STOPWORDS fix) |
| A4 | a known violation | plutus/violation | PASS |
| A5 | a foreign store | PLUTUS_NO_STORE | PASS |
| A6 | no root marker | PLUTUS_NO_ROOT | PASS |
| A7 | the siblings survive | gi-lsp + jg-lsp + plutus-lsp | PASS |
| A8 | the token set = 7 unique | — | PASS |

## THE CALIBRATION (the derived bar)
```
★ THE DERIVED BAR: 0.30 (F1=0.60 · precision=0.50 · recall=0.75)
★ the corpus: 4 violations + 4 cleans = 8 items
```

## AUDIT GATE: BLOCKED — the code-audit lane (qwen-code-audit) has not been run on this tree.
The tree is a NEW repo (3 commits) — the audit needs the ocr lane + a quota window. BLOCKED is
NEVER PASS. The ship-ready claim is therefore NOT made.

## THE HONEST RESIDUAL
The L4 live-TUI proof is pending. The corpus is small. The precision is 0.50 (bounded by the
polarity law — a Warning, never a block).
