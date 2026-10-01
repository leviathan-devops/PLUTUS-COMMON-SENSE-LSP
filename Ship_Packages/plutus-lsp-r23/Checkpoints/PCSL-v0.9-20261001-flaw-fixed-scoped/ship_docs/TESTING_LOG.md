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

## THE ROUND-10/11 VERIFICATION (2026-09-30 · commit 816b384)

**THE BATTERY:** `bun test tests/` → **26 pass / 0 fail / 117 expects** (up from 18 — the audit
rounds added the relevance-partition, stale-row, and selftest-token tests).

**THE LIVE SELFTESTS ×4 (the real graph + the LIVE JevK5 at 127.0.0.1:8090, model
jevk5-4b-v0.2-Q8_0):**
| the target | the result | the shape census |
|---|---|---|
| `src/plutus-lsp/store.ts` | SELFTEST OK, exit 0 | 11 cards: 10 LAW + 1 SUSPECT (`CONST-FROZEN-PAIR P6=0.731`) |
| `src/plutus-lsp/judge.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 SUSPECT |
| `scripts/plutus-lsp.ts` | SELFTEST OK, exit 0 | 12 cards: 11 LAW + 1 SUSPECT (`MECH-CIRCUIT P6=0.526`) |
| `src/plutus-lsp/cards.ts` | SELFTEST OK, exit 0 | 13 cards: 12 LAW + 1 **VIOLATION** (`MECH-TOKEN-08 P6=0.868`, `YOU ARE EDITING: src/plutus-lsp/cards.ts` — the target-file threading proven) |

**THE BUILT BUNDLE:** `dist/plutus-lsp.js` 41,046 bytes · sha256
`51f95e841cf6247fd68adaaccac74e8991eb10199d527a9530d01f67c23b477f` (rebuilt + committed).

**THE AUDIT GATE:** round-9 FAIL (0 critical, 12 high) → round-10 FAIL (2 critical, 10 high) →
round-11 **BLOCKED** (provider unreachable: `127.0.0.1:4097` refused — the go-session-proxy lane
is down; the JEVK5 judge at :8090 is UP). **BLOCKED is reported as BLOCKED — never as PASS.**
All 21 round-9/10 blocking findings were fixed first (BUILD_REPORT §7); the gate simply could
not re-run. The 7 remaining round-10 medium/low notes are recorded in BUILD_REPORT §7's residual.

## THE PRESSURE TEST (2026-09-30 · container pbk/omp-ct:master · v0.6 bundle 51f95e841cf6247f)

**THE RIG:** image `omp-ct:master`, container `pbk`. Bundle deployed file-to-file with sha trio
match (local == container == `51f95e841cf6247f`). Judge bridge `172.17.0.1:8090` → JevK5
`jevk5-4b-v0.2-Q8_0` (health `ok:true`). Results artifact: `.omp/container-test-results.json`.

| the scenario | the passToken (in tool result) | the failToken (absent) | the verdict |
|---|---|---|---|
| S1 absent graph | PLUTUS_NO_STORE/PLUTUS_NO_ROOT ×4, SELFTEST OK ×0 | SELFTEST OK | **PASS** |
| S2 dupe nodes | fully answered, 1 answer, no reason | JUDGE_ANSWER_COUNT | **PASS** |
| S3 no-clear | keeping last-good, zero `diagnostics:[]` sends | `"diagnostics":[]` | **PASS** |
| S4 Infinity | `relevance unread`, /Infinity/ false | `Infinity` | **PASS** |
| S5 target warning | `YOU ARE EDITING: src/plutus-lsp/cards.ts` | the canon anchor | **PASS** |
| A1 malformed frame | serverInfo (259-byte response after 99999999 header) | OOM/hang | **PASS** |
| A2 down judge | `JEVK5_DOWN: Unable to connect` | fabricated verdict | **PASS** |

**THE PHASE-E BREAKER: 10/10** (sha match · bridge probe · 7/7 scenarios · tokens · no circular ·
no timeouts · blast radius · adversarial · alive · artifact).
**THE VERDICT: PASS (7/7) — every recorded derailment (F-01..F-05 classes) is mechanically closed.**

## THE DERAILMENT-PATTERN SUITE (2026-10-01 · the objective's acceptance test)

**WHAT IT PROVES:** the LSP CATCHES the derailments the objective names ("so the agent can't
derail or make stupid actions"). 6 REAL Plutus derailments pushed through the LIVE pipeline
(real graph + live JevK5 at :8090); each asserts the reflex fires with the right token and the
clean case stays SILENT.

| the derailment | the expected reflex | the tokens emitted | the verdict |
|---|---|---|---|
| D1 fabricated SL cap 150 (canon 36) | the law surfaces | plutus/law, plutus/suspect | PASS |
| D2 multi-TP (TP1/TP2/TP3) | a governing law | plutus/law, plutus/suspect | PASS |
| D3 pair format EURUSD | a governing law | plutus/law, plutus/suspect | PASS |
| D4 flat RRR | a governing law / drift | plutus/law, plutus/drift | PASS |
| D5 ZFP 45→60 | the VIOLATION token | plutus/law, plutus/VIOLATION | PASS |
| D6 a fact-free file | ZERO tokens (precision) | (none) | PASS |

**6/6 PASS.** Artifact `.omp/derailment-suite-results.json`. Run:
`PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` (add `--no-judge` for the offline mode).

## THE AUDIT ROUNDS 11-18 (the hardening drive)

```
r9  2c/12h  →  r10 2c/10h  →  r11 0c/13h  →  r12 0c/12h
r13 0c/7h   →  r14 0c/5h   →  r15 1c/2h   →  r16 0c/4h
r17 2c/3h   →  r18 1c/5h
```
Each round: every BLOCKING finding adjudicated + fixed; every fix pinned. Battery 18 → 46 tests
(0 fail). The CRITICAL class was eliminated (r11) and re-introduced twice by fixes themselves
(r15 selftest fall-through; r17 path-normalize-return-raw; r18 absolute-`..`) — each closed.
**THE GATE: FAIL (r18) — NO SHIP-READY CLAIM. ~19 medium/low findings remain, all recorded.**

## TEST RESULT — 2026-10-01 — the round-19 audit gate (r11..r18 drive closed)

### SCRIPT — audit gate
- **The run:** `qwen-code-audit scan` over the 4 core files (store/judge/cards/script).
- **The raw output:** `GATE: FAIL (0 critical, 5 high)` — scope=workspace filesReviewed=4
  findings=27 (critical=0 high=5 medium=15 low=7). Session `c8027864-47cf-47e7-93f5-bba3f17dcfd8`.
- **The verdict:** FAIL — the 5 blocking highs are recorded as F entries (open until fixed and
  re-proven). The CRITICAL class stays eliminated (0 critical, third round running).
- **The artifacts:** `artifacts/sg-ocr-round19.json` (session, scope, counts, blocking list, dist SHA).

## AUDIT GATE: FAIL (0 critical, 5 high) — session c8027864 — artifacts/sg-ocr-round19.json

## TEST RESULT — 2026-10-01 — the flaw-report fix verification (battery + live probes)

### SCRIPT + HOST (live)
- **The run:** `PLUTUS_L1_PATH=<kg.json> bun test ./tests/` → 52 pass / 0 fail / 171 expects.
  `bun scripts/derailment-suite.ts` → 6/6 PASS. The scope probe (`/tmp/scope-probe.ts`) → 7/7.
  The pull probe (`/tmp/pull-probe.ts`) → `{"id":2,"result":{"kind":"full"}}`, no -32601.
  The F-1 probe → dashboard file resolves 564 laws (was 0).
- **The verdict:** PASS — F-1/F-2/F-3/F-6/F-10 + the SCOPE GATE all verified live.
- **The artifacts:** the probes (`/tmp/scope-probe.ts`, `/tmp/pull-probe.ts`, `/tmp/f1-probe.ts`);
  the battery output; the rebuilt bundle (SHA below).

## TEST RESULT — 2026-10-01 — the r20 fix sweep + the BLOCKED r21 audit

### SCRIPT + HOST
- **The run:** `bun test ./tests/` → **52 pass / 0 fail / 173 expects**. The derailment suite →
  **6/6 PASS (hermetic — the fixture carries its own mini-Plutus graph)**. The scope probe → 7/7.
  The F-5 probe → the degraded card surfaces first. The boilerplate machinery → builds clean.
- **The verdict:** PASS for every code change.

### SCRIPT — audit gate (r21)
- **The run:** `qwen-code-audit scan` ×2 + a direct health probe.
- **The raw output:** `GATE: BLOCKED (OCR_JSON_ABSENT)`; the health probe: `POST
  http://127.0.0.1:4097/zen/go/v1/responses: 403 Forbidden — An active OpenCode Go subscription is
  required to use Go models`; the zen-free lane: `FreeUsageLimitError: Rate limit exceeded`.
- **The verdict:** BLOCKED — no LLM was reached; NO verdict exists. **Never PASS.**
- **The artifacts:** `artifacts/sg-ocr-round21.json` (the reason + the retry condition).

## AUDIT GATE: BLOCKED (provider-unavailable) — artifacts/sg-ocr-round21.json
