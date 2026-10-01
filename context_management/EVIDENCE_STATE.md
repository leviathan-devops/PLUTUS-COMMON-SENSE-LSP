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

## THE ROUND-10 FIX BATCH (commit 816b384)
| the evidence | the artifact |
|---|---|
| the battery 26/0/117 | `bun test tests/` (3 files) |
| the live selftests ×4 | store 11 · judge 13 · script 12 · cards 13 (VIOLATION MECH-TOKEN-08 P6=0.868) |
| the bundle sha | `dist/plutus-lsp.js` 3307a3b7a14d6f4b |
| the receipt | `forensic/lsp-receipts.log` → `RELEVANCE judged=12/12 dropped=0` (2026-09-30T17:46:57Z) |
| the audit gate | round-11 BLOCKED (:4097 refused) — 21 round-9/10 findings fixed first |

## THE RAW RECEIPT (verbatim)
```
INIT pid=1466672
FRAME initialize · FRAME initialized · FRAME textDocument/didOpen
PUBLISH n=3 tokens=plutus/law,plutus/tier,plutus/suspect file=…/mirror.ts verdict=SUSPECT
```

## THE ROUND-11..18 EVIDENCE
| the evidence | the artifact |
|---|---|
| battery 46/0/158 | bun test v1.4.2 (744846f84) |
| the 4 live selftests | store 11 · judge 13 · cards 13 · script 13 cards |
| the derailment suite 6/6 |  (D5 VIOLATION, D6 silent) |
| the bundle sha |  |
| the audit trend | r11..r18 (r18 FAIL 1c/5h) |

## THE ROUND-19 EVIDENCE (2026-10-01)
- audit GATE FAIL (0 critical, 5 high), session c8027864: 
- battery 46 pass / 0 fail / 158 expects (bun test v1.4.2 (744846f84), re-run this turn)
- dist fingerprint: 
- derailment suite 6/6 (unchanged since seal):

Dist fingerprint (2026-10-01): `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`

## THE SECURITY-HARDENED STATE (2026-10-02)
- battery 59 pass / 0 fail / 199 expects
- derailment suite 6/6 (hermetic)
- scope gate 7/7 (configurable: PLUTUS_LSP_SCOPE / _FILES)
- noise ratio 0.00 (was 2.0)
- 4 audit rounds (r19 README-flaw, r20 reviewer, r21+r22 reviewer, r23 security): 56 findings, ALL fixed
- dist fingerprint:

Dist fingerprint (2026-10-02): `f45727589b05caba4894455f65e4ee34647ac665c38223aeb033ae9fb5ee0bfc`
