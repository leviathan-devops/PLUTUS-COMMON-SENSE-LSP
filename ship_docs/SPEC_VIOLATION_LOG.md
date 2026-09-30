# SPEC_VIOLATION_LOG — the spec-section mapping

## THE SPEC (the binding authority)
`packages/plutus-common-sense-lsp/02-DPL1-SPEC.md` — the DPL1.

## THE SECTION-BY-SECTION COMPLIANCE
| the spec section | the requirement | the state | the evidence |
|---|---|---|---|
| §3 the architecture | detect → judge → enforce | MET | store.ts / judge.ts / cards.ts |
| §3.2 the polarity | INFORMS, never blocks | MET | no block path in the server (grep) |
| §3.3 the 7 tokens | all seven | MET | test_cards_seven_tokens |
| §3.4 CH-PLUTUS | the 7 nouls, cheapest-first | MET | the live judge returned 5-of-7 in ONE pass |
| §3.5 the verdict | the weakest clause, pure code | MET | judge.ts verdict() |
| §3.6 the state from disk | no agent-typed state | MET | buildState takes the laws + the hunk |
| §3.9 the own repo | a sibling, never inside Plutus | MET | the repo path |
| §6 S1-S8 | the success criteria | S1-S8 MET **after the audit's FIX D** | the battery (18 pass) + the receipt |

## THE AUDIT CORRECTION (2026-09-30)
**S1 (`test_lsp_selftest_emits_token`) DID NOT EXIST when this line first claimed "S1-S7 MET"** —
an unmet requirement reported met (the audit's finding H). The test was WRITTEN by the audit's
FIX D and now passes. The line above is corrected; the original claim is retained here as the
record of the defect.
| §7 the container angles | A1-A6 | MET (A7, A8 added) | the adversarial sweep |
| §9 D1-D5 | the open decisions | the defaults taken | D5 deferred (v2) |

## THE VIOLATIONS
NONE recorded. The spec was authored this session and the build followed it.

## THE HONEST NOTE
The spec's §6 S5 (the render proof) is MET at the DRIVEN level; the LIVE-TUI level is PENDING
(T1). That distinction is recorded in TESTING_LOG's AUDIT GATE line.
