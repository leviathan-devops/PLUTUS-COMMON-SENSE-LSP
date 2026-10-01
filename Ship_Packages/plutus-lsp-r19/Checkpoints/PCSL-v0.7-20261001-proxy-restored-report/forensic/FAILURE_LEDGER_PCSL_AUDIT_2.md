# FAILURE LEDGER #2 — the independent auditors' round (audit-alpha + audit-bravo)
**Date:** 2026-09-30 · **The dist:** 4b31eddd1d249c15 · **The battery:** 21 pass / 0 fail

## §0 · METHOD + THE AUDITORS + THEIR INSTRUMENT FAILURES
**Two independent auditors (the author is never the auditor):**
- **audit-alpha** (the fabricated-evidence lens): 14 findings.
- **audit-bravo** (the generic-slop lens): 17 findings.
**THEIR RECORDED INSTRUMENT FAILURES:**
- alpha: a test flakiness (17/1 vs 18/0) that was MY fix landing mid-run; a selftest probe's
  PLUTUS_NO_ROOT (their harness error); no literal x-x tautology found (F7 is functional).
- bravo: the magic-grep matched the Checkpoints copies (scoped to the live tree); a stale
  DEMAND_T read (re-read verbatim); no shell (their commands are reads — zero suites run).

## §1 · THE VERDICT
**REFUTED for "100% ready" (round 2).** 31 findings across the two auditors; the HIGH ones
FIXED; the container re-certified against the audited dist.

## §2 · THE FIXED (the high-value set)
| the id | the defect | the fix | the proof |
|---|---|---|---|
| alpha-F2 | the calibration's sweep table STALE | regenerated from the live run + the state-dependence disclosed | the doc now cites the live re-run |
| alpha-F3 | the 4-way F1 TIE undisclosed | the tie + the tie-break rule (the lowest bar with max F1) documented | the doc |
| alpha-F4 | THE SPAWN RECEIPT GONE (/tmp ephemeral) | the receipts moved to the REPO's forensic/ | forensic/lsp-receipts.log (durable) |
| alpha-F5 | P8's "34 pass" with no provenance | corrected to 18 + the defect recorded | the doc |
| alpha-F6 | the VACUOUS PASS (judge down → 0 assertions) | the judge-down now FAILS the test | the test |
| alpha-F7 | A4 SELF-REFERENTIAL (echoed its input) | now drives verdict() (the real decision) | the test |
| alpha-F8/F13 | the stale line counts + the commit list | corrected with the measured numbers | the docs |
| **bravo-F1** | **the prod pipeline judged 5 nodes — P5/P6 NEVER answered** | **the 7-node chain live** | the container: the vector = [P1..P7] |
| **bravo-F2** | **THE CALIBRATION'S CONFIG NEVER REACHED PROD** | **lawsForHunk + observableQuestion wired into the server** | the container + the A10 test |
| bravo-F4 | plutus/callers declared, never emitted | callersOf() (the L1 import edges) + the card + the test | A9 |
| bravo-F7 | total:0 vs the ONE-fact comment | 1 | the code |
| bravo-F8 | the verdict docstring vs the body | the docstring matches | the code |
| bravo-F10 | the env bars unvalidated (NaN/0 → fail-open) | a validated bar() (finite, (0,1)) | the code + A11 |
| bravo-F11 | the bare catch{} + the silent frame drop | logged | the code |
| bravo-F15 | THE SPEC/CODE DRIFT (D1/D2/D3) | the §Z IMPLEMENTED-REALITY section | the spec |

## §3 · THE STILL-OPEN (honestly named)
| the id | the defect | the state |
|---|---|---|
| bravo-F3 | readL2/l2SocketFor dead (the L2 socket read unwired) | OPEN — the spec claims L1+L2; the pipeline is L1-only. **The honest fix: the spec's §Z names L1 as the live read; wiring the L2 read is T-next.** |
| bravo-F5 | staleCard() zero callers | OPEN (a small dead function; the pipeline returns [] on a refusal) |
| bravo-F6/F13/F14/F16 | the half-raw severities · the ReadonlySet overclaim · the magic numbers · the probe residue | LOW — recorded, not yet swept |
| bravo-F9 | THROW_T*0.9 underived | OPEN — the calibration never exercises it (it asks [P4,P7]; P3 undefined) |
| bravo-F12 | the zero-overlap early-return bypass in lawsForHunk | OPEN — `candidates<=topK` returns unranked laws |
| bravo-F17 | the IMMUTABLE fallback + the unanswered-P2 gap | OPEN (documented) |
| THE LIVE-TUI HANDSHAKE | the fresh-container warmup stalls at "connecting" | OPEN (the capability fixed; the broker/timeout probes remain) |

## §4 · THE VERBATIM PROBES (the certification)
```
the sha:          sha256sum /tmp/plutus-lsp.js -> 4b31eddd1d249c15 == the local
the 7 nodes:      the vector nodes: ['P1','P2','P3','P4','P5','P6','P7']   ← bravo-F1 fixed
the violation:    SELFTEST OK — 4 card(s) (law, tier, callers, violation)
the refusal:      PLUTUS_NO_STORE
the down judge:   JEVK5_DOWN
the frame:        ALIVE: True | serverInfo: True
the battery:      21 pass / 0 fail
```

## §5 · THE ROOT-CAUSE SYNTHESIS (round 2)
**The auditors found the class round 1 could not see: THE PIPELINE SPLIT.** The calibration
measured one pipeline; the server ran ANOTHER (F1+F2). The calibration's numbers were TRUE
about a configuration that never shipped. **The class: the UNWIRED MEASUREMENT — a measurement
whose subject is not the production path.** The guard: the A10 test asserts the production
server's source carries the calibrated calls.
