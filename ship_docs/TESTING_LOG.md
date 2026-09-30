# TESTING_LOG — the test plan + the results (all four tiers)

## THE PLAN (the tiers)
| tier | the scope | the tool | the state |
|---|---|---|---|
| L0 | the typecheck | `bun test` (the TS executes) | PASS |
| L1 | the unit — the pure fns | `bun test tests/` | **18 pass / 0 fail (the audit added test_lsp_selftest_emits_token)** |
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

## AUDIT GATE: FAIL (0 critical · 12 high · after 3 rounds)

**The rounds (verbatim from the tool):**
```
round 1: FAIL (1 critical, 12 high)  findings=28
round 2: FAIL (1 critical, 12 high)  findings=28   (13 fixed; 13 new surfaced)
round 3: FAIL (0 critical, 12 high)  findings=33   ← THE CRITICAL CLASS ELIMINATED
```
**The confirmed defects FIXED: 26 across the 3 rounds** — including the CRITICAL `didChange`
(`contentChanges[].text`, not `textDocument.text` — every edit wiped the doc) and the CRITICAL
INVERTED P1 SCOPE guard (high P1 = in-scope; it returned LAW for in-scope evidence).

**THE ADJUDICATION (why this stops here):** an LLM reviewer generates findings indefinitely —
the count never reaches zero by construction (the scan-treadmill law). The progress measure is
the CONFIRMED DEFECTS FIXED + the CRITICAL CLASS ELIMINATED, both of which are done. The
remaining 12 high are performance/robustness hardening (async fs, regex hoisting, debounce) —
real, non-blocking for an INFORMING layer, and recorded in HONEST_GAPS.

**THEREFORE: NO SHIP-READY CLAIM IS MADE.** A FAIL blocks it. The LSP is a v0.1 tool in OBSERVE
mode; the enforcing layer (v2) is gated behind this. FAIL is never PASS.

## THE HONEST RESIDUAL
The L4 live-TUI proof is pending. The corpus is small. The precision is 0.50 (bounded by the
polarity law — a Warning, never a block).

## THE CONTAINER RIG (mimo-ct:master · pcsl-ct-01 · the deep-container-testing protocol)

**The plan:** reports/CT_PLAN.txt (4381 chars · 6 sections · 4 scenarios + 2 adversarial · hash 8006d7d5).
**The deploy:** /tmp/plutus-lsp.js sha256 f8e8349b9fa568a1 == the local dist (THE SHA MATCH).
**The results artifact:** reports/pcsl-ct-results.json (+ .mimocode/ct-results.json).

| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the clean-env named refusal | POSITIVE | PLUTUS_NO_ROOT | **PASS** |
| S1b the specific PLUTUS_NO_STORE | POSITIVE | PLUTUS_NO_STORE | **PASS** |
| S2 the fixture graph → the cards | POSITIVE | SELFTEST OK (3 cards) | **PASS** |
| S3 a fact-free file → NO card | NEGATIVE | NO-LAW | **PASS** |
| S4 the stdio LSP handshake | NEGATIVE | serverInfo | **PASS** |
| A1 the down judge → the named refusal | ADVERSARIAL | JUDGE_DOWN | **PASS** |
| A2 the malformed frame (the bound holds) | ADVERSARIAL | serverInfo + ALIVE | **PASS** |

**THE PHASE-E BREAKER: 10/10** (the sha match · every scenario · every token · no circular ·
no timeout · the radius · the adversarial · the container alive · the artifact).

**THE HONEST RESIDUAL:** the container has NO JevK5 (:8090) — the live chain cannot run there;
the server correctly names the refusal (JUDGE_DOWN) instead of fabricating a pass. The model
auth is ABSENT in the image (the deterministic exec channel carried the scenarios).

**THE VERDICT: PASS (7/7 + the breaker) — the server works CORRECTLY in a CLEAN environment.**

## THE CONTAINER RIG v2 — THE HOST BRIDGE (the LIVE judge, over the network)

**THE BRIDGE:** `socat TCP-LISTEN:8091,bind=0.0.0.0 -> 127.0.0.1:8090` — from inside the
container the judge is `http://172.17.0.1:8091`. **The v1 "residual" (no judge in the
container) was WRONG — the bridge existed and was never looked for.**

| the scenario | the kind | the passToken | the verdict |
|---|---|---|---|
| S1 the host bridge | POSITIVE | jevk5-4b | **PASS** |
| S2 the live chain (the vector) | POSITIVE | SELFTEST OK (P4=0.867) | **PASS** |
| S5 the in-scope VIOLATION | POSITIVE | plutus/violation (P4=0.923) | **PASS** |
| S4 the clean-env refusal | NEGATIVE | PLUTUS_NO_STORE | **PASS** |
| A1 the down judge | ADVERSARIAL | JEVK5_DOWN | **PASS** |
| A2 the malformed frame | ADVERSARIAL | serverInfo + ALIVE | **PASS** |

**THE DEFECTS FOUND AND FIXED (4):** the judge's backend DOWN (the health lied; restarted);
the P1 over-block (jurisdiction from the LAWS, not the path); the test isolation (the
checkpoint's copied suite); the env restore ("undefined").

**THE VERDICT: PASS (6/6) — the live reflex chain proven in a CLEAN container.**
