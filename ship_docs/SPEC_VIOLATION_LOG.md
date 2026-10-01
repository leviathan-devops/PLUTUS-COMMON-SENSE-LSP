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

## THE ROUND-19 MAPPING (2026-10-01 — audit session c8027864, FAIL 0c/5h)

| ID | the spec § / ruling | the spec REQUIRES | what actually happened | VERDICT | the evidence |
|---|---|---|---|---|---|
| V-19-1 | §3.2 the polarity (INFORMS, never blocks) | no block path in the server | the 5 blocking highs are all fail-closed refusals / degradations, none a block | PASSED | the r19 finding list (all 5 are named refusals, degraded modes, or accounting) |
| V-19-2 | §3.4 CH-PLUTUS (the judge decides) | the judge answers; the code decides | the attribution-flag finding (cards.ts:200) shows a guess CAN reach Error severity | VIOLATED MEDIUM | the finding text + the queued fix (flag coupled to the picked law) |
| V-19-3 | §3.6 the state from disk | every judge state field from a read | `cap()` throwing via `toString()` loses every card (a hostile object breaks the read path) | VIOLATED MEDIUM | the finding text (cards.ts:43) + the queued try/catch |
| V-19-4 | §6 S1-S8 (the success criteria) | S1-S8 MET after FIX D | the battery is 46/0; the derailment suite 6/6; the selftests 4× SELFTEST OK | PASSED | `bun test tests/` 46 pass; `.omp/derailment-suite-results.json` |
| P-19-1 | the degraded-audit rule | BLOCKED is never PASS | r19 is FAIL (not BLOCKED) with a saved artifact + verdict line | PASSED | `artifacts/sg-ocr-round19.json` + the TESTING_LOG verdict line |

## THE CURRENT-STATE CORRECTION (2026-10-01 — the stale §6/§7 lines above)
The §6 line ("the battery (18 pass)") and the §7 line ("A1-A6 … A7, A8 added") describe the
2026-09-30 state, not the current one. The current state: **battery 46 pass / 0 fail / 158
expects** (tests A1..A34 + the 12 unit gates); the adversarial sweep covers **A1-A34** (A15-A34
pin the round-11..18 behavior fixes); the derailment suite covers **D1-D6** (6/6 PASS, live
judge). The stale lines are retained as history; V-19-4 above is the current record.

## THE AUDIT-TREND RECORD (2026-10-01)
r9 2c/12h → r10 2c/10h → r11 0c/13h → r12 0c/12h → r13 0c/7h → r14 0c/5h → r15 1c/2h →
r16 0c/4h → r17 2c/3h → r18 1c/5h → **r19 0c/5h** (session c8027864). The CRITICAL class stays
eliminated (3rd round running). The 5 blocking highs are F-08 (OPEN). NO SHIP-READY CLAIM.
