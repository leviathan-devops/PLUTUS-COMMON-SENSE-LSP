# EVIDENCE_STATE — every verdict with its artifact

## THE WAVE GATES
| wave | the gate | the evidence |
|---|---|---|
| W1 | a miss names PLUTUS_NO_STORE | `bun test tests/plutus-lsp.test.ts` → 4 pass |
| W2 | the live K5 returns 7; a down judge names JEVK5_DOWN | `bun test tests/judge-cards.test.ts` → 5 pass |
| W3 | the 7 tokens + the negative | the same file (test_cards_seven_tokens, test_negative_no_phantom) |
| W4 | --selftest → ≥1 token → exit 0 | `bun scripts/plutus-lsp.ts --selftest …/mirror.ts` → SELFTEST OK |
| W5 | the RECEIPT (PUBLISH n=K) | `/tmp/plutus-lsp-receipts.log` → `PUBLISH n=3 … verdict=SUSPECT` |
| W6 | the bars DERIVED | `reports/CALIBRATION_v1.md` → bar 0.30 (F1 0.60 · P 0.50 · R 0.75) |

## THE ADVERSARIAL SWEEP (the 8 angles)
| angle | the token | the result |
|---|---|---|
| A1 the absent graph | PLUTUS_NO_STORE | PASS |
| A2 the down judge | JEVK5_DOWN | PASS |
| A3 a fact-free file | NO card | PASS |
| A4 a known violation | plutus/violation | PASS |
| A5 a foreign store | PLUTUS_NO_STORE | PASS |
| A6 no root marker | PLUTUS_NO_ROOT | PASS |
| A7 the siblings survive | gi-lsp + jg-lsp + plutus-lsp | PASS |
| A8 the token set = 7 unique | — | PASS |
`bun test tests/adversarial.test.ts` → 8 pass.

## THE RAW RECEIPT (verbatim)
```
INIT pid=1466672
FRAME initialize · FRAME initialized · FRAME textDocument/didOpen
PUBLISH n=3 tokens=plutus/law,plutus/tier,plutus/suspect file=…/mirror.ts verdict=SUSPECT
```
