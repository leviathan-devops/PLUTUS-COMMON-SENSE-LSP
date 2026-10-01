# FAILURE LEDGER — PLUTUS-COMMON-SENSE-LSP · the red-team slop audit #1
**Date:** 2026-09-30 · **The dist under audit:** 90f7a0626a7a691b · **The battery:** 18 pass / 0 fail

## §0 · METHOD + INSTRUMENTS + MY OWN INSTRUMENT FAILURES
**Method:** the red-team-slop-audit 8-step protocol. STEP 0 (authority + liveness) → 2 independent
auditors dispatched (Alpha: fabricated evidence; Bravo: generic slop) → my own 7 hunt lists → the
claim verification → the container re-test → this ledger.
**Instruments:** grep/python3/bun/docker via the container-testing tool + the omp LSP source read.
**MY OWN INSTRUMENT FAILURES (recorded, never deleted):**
1. **H2's tautology regex** matched a DOCSTRING line (`* W2 + W3 GATES — the judge chain…`) — a
   false positive; the pattern `(x − x)` hit an em-dash in prose. DISCARDED, recorded.
2. **H6's wrong-tree grep** flagged the tests' `/tmp/pcsl-*` FIXTURE roots as "wrong-tree scans" —
   those are DELIBERATE test fixtures (a rootMarker probe), not scans of a copy. DISCARDED.
3. **My first read of the container's `⏳` panel state** assumed the spawn had failed — the
   receipt later proved the spawn HAD occurred (INIT pid=230). The panel glyph is not the process
   truth. RECORDED (this is why §4 quotes the receipt, not the panel).

## §1 · THE CHARGE + THE VERDICT
**The charge (verbatim):** *"get the full plutus LSP 100% ready for live build use extensively test
and debug this in the container."*
**THE VERDICT: REFUTED for "100% ready" — 8 confirmed defects found, all FIXED + re-proven.**
The build is now CERTIFIED at the container level against the CURRENT dist; the LIVE-TUI handshake
remains OPEN (named in §9).

## §2 · THE AUTHORITY + ITS LIVENESS
| the authority | the status | the liveness |
|---|---|---|
| packages/plutus-common-sense-lsp/02-DPL1-SPEC.md | `**Status:** PLANNING` | **LIVE** (no supersession marker found) |
| packages/plutus-common-sense-lsp/06-WAVES.md | (no status field) | LIVE |
| PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md | (no status field) | LIVE (predicate PASS, spec-audit 0/8) |
**THE LIVENESS CHECK (STEP 0.1):** no supersession/retirement marker anywhere in the tree
(grep -iE 'supersed|abandon|obsolet|retired|replaced by' → only an unrelated doc line).
**GRADE AGAINST THE LIVE SPEC ONLY.** The compliance measurement is in §3 (finding H).

## §3 · THE FINDINGS (8 confirmed, each fixed)
### F-A · THE UNWIRED CALIBRATION (HIGH · shape-without-reachability)
- **location:** src/plutus-lsp/judge.ts:118-119
- **WHAT:** `DEMAND_T = 0.5` — but reports/CALIBRATION_v1.md DERIVED bar 0.30 (F1 0.60 · P 0.50 ·
  R 0.75). The calibration's OUTPUT had **ZERO production consumers**.
- **COMMAND:** `grep -m1 "DERIVED BAR" reports/CALIBRATION_v1.md` → `★ THE DERIVED BAR: 0.30`;
  `grep -n "DEMAND_T = " src/plutus-lsp/judge.ts` → `119:export const DEMAND_T = 0.5;`
- **OUTPUT:** the two numbers disagree; no code path reads the calibration.
- **FIX:** DEMAND_T = 0.30 (the DERIVED bar, the corpus cited) + env-overridable; THROW_T stays a
  POLICY bar (documented: the calibration's top score was 0.61 — an Error at 0.30 fires on half
  the cleans). **RE-PROVEN:** the threshold test updated + 18/0.

### F-B · THE SILENT DEFAULTS (HIGH · silent fallback)
- **location:** src/plutus-lsp/judge.ts:149,151 (pre-fix)
- **WHAT:** `const p7 = a.P7 ?? 0;` — an UNANSWERED P7 read as 0 → the drift check silently passed.
  `const immutable = (a.P3 ?? 0) >= DEMAND_T;` — an unanswered P3 → the stricter bar never applied.
- **COMMAND:** `sed -n '149,151p' src/plutus-lsp/judge.ts` (pre-fix)
- **FIX:** `const p7 = a.P7;` (undefined = unanswered) + `if (p7 !== undefined && p7 >= THROW_T)`.
  **RE-PROVEN:** 18/0.

### F-C · THE SILENT INCONCLUSIVE (MEDIUM · pass-by-absence)
- **location:** src/plutus-lsp/cards.ts (pre-fix: no INCONCLUSIVE branch)
- **WHAT:** an INCONCLUSIVE verdict emitted **ZERO cards** — the agent never learned the judgment
  failed. A silent pass.
- **COMMAND:** `grep -n "INCONCLUSIVE" src/plutus-lsp/cards.ts` → (no output, pre-fix)
- **FIX:** an INCONCLUSIVE card (severity Hint) carrying the undecided clause + the vector.
  **RE-PROVEN:** 18/0.

### F-D · THE MISSING S1 TEST (HIGH · unmet-requirement-reported-met)
- **location:** the spec's §6 S1 vs tests/ (pre-fix)
- **WHAT:** `test_lsp_selftest_emits_token` existed in **ZERO test files** while the docs claimed
  "S1-S7 MET".
- **COMMAND:** `for s in test_lsp_selftest_emits_token; do grep -rc "$s" tests/*.ts; done` → 0
- **FIX:** the test written (spawns the selftest against a fixture graph → exit 0 + the token).
  **RE-PROVEN:** 5 pass in that file.

### F-E · THE STALE TEST COUNT (MEDIUM · SHA/doc drift)
- **location:** ship_docs/BUILD_REPORT.md:26 · TESTING_LOG.md:7
- **WHAT:** "17 pass / 0 fail" — the truth was 18 after FIX D.
- **FIX:** the docs updated to 18.

### F-F · THE STALE CONTAINER ARTIFACT (HIGH · the proof-contract contradiction)
- **location:** reports/pcsl-ct-results-v2.json `distSha: 7a3daf3eadd6f673`
- **WHAT:** the v2 container PASS certified a dist that is **STALE** vs the live
  90f7a0626a7a691b. **The PASS did not certify the build that would ship.**
- **COMMAND:** `sha256sum dist/plutus-lsp.js` → `90f7a0626a7a691b` vs the artifact's `7a3daf…`
- **FIX:** the container re-run against the CURRENT dist → reports/pcsl-audit-results.json
  (**5/5 PASS**, the sha match asserted).

### F-G · THE STALE CHECKPOINT (MEDIUM)
- **location:** Checkpoints/PCSL-v0.2-20260929/dist/plutus-lsp.js
- **WHAT:** the checkpoint's dist (7a3daf…) ≠ the live (90f7a0…).
- **FIX:** the v0.3 checkpoint re-sealed (46 files, 42 sha entries, judge.ts verified fresh).

### F-H · THE FALSE S1-S7 MET CLAIM (HIGH · self-certifying comment)
- **location:** ship_docs/SPEC_VIOLATION_LOG.md:16
- **WHAT:** "S1-S7 MET" while S1's test did not exist.
- **FIX:** the line corrected + the defect recorded in the same doc (the append-only record).

## §4 · THE VERBATIM PROBES (the reproductions)
```
the deploy sha:      sha256sum /tmp/plutus-lsp.js → 90f7a0626a7a691b == the local ✓
the violation:       SELFTEST OK — 3 card(s), tokens: plutus/law,plutus/tier,plutus/violation
                     the receipt: verdict=VIOLATION
the refusal:         PLUTUS_NO_ROOT (the named refusal, never a silent empty)
the down judge:      JEVK5_DOWN (never a fabricated pass)
the malformed frame: ALIVE: True | serverInfo present: True
the battery:         18 pass / 0 fail
```

## §5 · THE SLOP TAXONOMY (the classes this audit caught)
| # | the class | the finding |
|---|---|---|
| 1 | shape-without-reachability | F-A (the calibration's output, zero consumers) |
| 2 | silent fallback | F-B (P7/P3 ?? 0) |
| 3 | pass-by-absence | F-C (the INCONCLUSIVE emitted nothing) |
| 4 | unmet-requirement-reported-met | F-D (S1's test absent) |
| 5 | proof-contract contradiction | F-F (the artifact's stale sha) |
| 6 | SHA/doc drift | F-E, F-G |
| 7 | self-certifying comment | F-H ("S1-S7 MET") |

## §6 · THE REBUILD REQUIREMENTS (each tracing to a finding)
| # | the requirement | traces to | the mechanical check |
|---|---|---|---|
| R1 | every derived threshold is read from its calibration artifact | F-A | `grep DEMAND_T src/plutus-lsp/judge.ts` cites CALIBRATION_v1 |
| R2 | no `?? 0` on a judge clause | F-B | `grep -nE 'a\.P[0-9] \?\? 0' src/` → 0 |
| R3 | every verdict kind emits a card | F-C | a card-matrix test asserts all 6 kinds |
| R4 | every spec S-number has a named test | F-D | `for s in S1..S8; grep the test id` |
| R5 | the container artifact's distSha == the live dist | F-F | `sha256sum dist` vs the artifact |
| R6 | the checkpoint's dist == the live dist | F-G | `diff` the dist + the src |
| R7 | no "MET" claim without the named test | F-H | `grep -c 'MET' SPEC_VIOLATION_LOG` vs the test census |

## §7 · THE HONEST SURVIVE LIST (what actually works — with evidence)
```
✓ THE PIPELINE     the graph read → the judge → the cards → the stdio protocol (the container 5/5)
✓ THE NAMED REFUSALS  PLUTUS_NO_STORE · PLUTUS_NO_ROOT · JEVK5_DOWN (all observed verbatim)
✓ THE POLARITY     the LSP INFORMS; zero block paths (grep-verified)
✓ THE LIVE JUDGE   the vector P1..P7 returned over the host bridge in the container
✓ THE VIOLATION    the plutus/violation card fired at P4 >= THROW_T (the receipt verdict)
✓ THE BATTERY      18 pass / 0 fail
```

## §8 · THE INDEPENDENT AUDITORS
(Alpha + Bravo dispatched; their returns appended on arrival.)

## §9 · COVERAGE + THE GAPS I DID NOT EXAMINE
**Read:** the 4 src files, the server, the 3 test files, the calibration harness, the 5 ship docs,
the 3 authority docs, the checkpoints, the container artifacts.
**NOT examined:** the omp LSP client's internals beyond the spawn/handshake paths; the judge
server's full source; the L2 socket read (readL2 — never exercised in production); the `.md` canon
handling (unimplemented); the enforcement extension (v2, absent).
**THE FRONTIER:** the live-TUI handshake completion in a fresh session.

## §10 · THE ROOT-CAUSE SYNTHESIS
The 8 findings share ONE root: **the build's artifacts were produced at different TIMES and never
re-unified.** The calibration was derived AFTER the code's thresholds were written; the docs were
written BEFORE the audit's fixes; the container artifact certified an OLDER dist. **The class is
the STALE-PROOF: a proof that was true when written and false when read.** The mechanical guard:
every artifact carries the sha it certifies, and a re-verify compares.

## §11 · THE SEVERITY LEDGER + THE ANSWER
| severity | count | the findings |
|---|---|---|
| CRITICAL | 0 | — |
| HIGH | 4 | F-A, F-B, F-D, F-F, F-H (5) |
| MEDIUM | 3 | F-C, F-E, F-G |
| **the answer** | **8 found · 8 fixed · 0 open from this audit** | the live-TUI handshake remains the named OPEN (a prior finding) |
