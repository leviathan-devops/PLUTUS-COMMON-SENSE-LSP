# P8 · THE VERDICT — the legal stop (2026-09-29)

## THE 8 PHASE GATES
| phase | the gate | the state | the evidence |
|---|---|---|---|
| P0 | the baseline measured | **GREEN** | f4b9260; gi-lsp 522238b0626dfea7; L1 1277+564/1141; the judge live |
| P1 | the DPL1 + the wave-plan | **GREEN** | packages/plutus-common-sense-lsp/ (predicate PASS, spec-audit 0/8) |
| P2 | the 4 spawn gates | **GREEN** | lsp.json ✓ · the rootMarkers ✓ · enableLsp=default · diagnosticsOnEdit |
| P3 | the waves audited | **GREEN** | W1–W6 built; the battery 18 pass / 0 fail (the audit's FIX D added one; the OLD '34' had no producing command — audit-alpha's F5); the per-wave gates each a tool result |
| P4 | the runtime receipt | **GREEN (driven)** | `PUBLISH n=3 … verdict=SUSPECT` in /tmp/plutus-lsp-receipts.log |
| P5 | the adversarial sweep | **GREEN** | 8 angles; A3 found a defect → fixed → re-run PASS; the final pass is clean |
| P6 | the docs + the audit line | **GREEN** | the 11 canon + the 5 ship docs; `AUDIT GATE: FAIL (0 critical · 12 high)` |
| P7 | the checkpoint | **GREEN** | Checkpoints/PCSL-v0.1-20260929/ · 40 files · 37 SHA entries |

## THE RECEIPT (the legal-stop set)
- **the baseline diff** — the pin's numbers re-measured: all matched; the tree 0 → 4 src files.
- **the battery** — `bun test tests/` → **18 pass / 0 fail**.
- **the audit verdict** — `AUDIT GATE: FAIL (0 critical, 12 high)` after 3 rounds; 26 confirmed
  defects fixed; the CRITICAL class eliminated. **NO SHIP-READY CLAIM.**
- **the runtime ledger** — the selftest (2 cards + 5 live nouls in ONE pass); the drive (the LSP
  handshake + PUBLISH); the judge's discrimination probe (Δ 0.38–0.63 with a clean state).
- **the receipt log** — `/tmp/plutus-lsp-receipts.log` (PUBLISH n=3).
- **the checkpoint path** — `Checkpoints/PCSL-v0.1-20260929/`.

## THE GOAL'S 3 CONDITIONS
1. **The render receipt exists** — ✓ (`PUBLISH n=3 tokens=plutus/law,plutus/tier,plutus/suspect`).
2. **The calibration bars are DERIVED** — ✓ (0.30 · F1 0.60 · P 0.50 · R 0.75 · recorded with the corpus).
3. **The checkpoint seals** — ✓ (37 SHA entries).

## THE HONEST REMAINDER (the operator's + the next session's)
- **T1 · the live-TUI proof** — the LSP binds at SESSION CONSTRUCTION; a running session does not
  pick up a new server. On the next session start, open a Plutus file and read
  `/tmp/plutus-lsp-receipts.log` for `FRAME initialize` from pid≠the driver's. The mechanism is
  already proven in-session (the sibling `gi-lsp`/`jg-lsp` fired on the agent's own writes).
- **T2 · the 50+ item calibration corpus** — the F1 plateau (0.55–0.60) is the small-n signature.
- **T3 · the enforcement extension (v2)** — the block, gated behind the audit gate's clearance.
- **THE AUDIT GATE IS FAIL** — no ship-ready / production-grade / merge claim is made. The v0.1
  is an OBSERVE-mode tool.

## THE VERDICT
**THE LEGAL STOP IS MET** — all 8 phase gates green, the seal written, the receipt posted.
The honest remainder is named, never hidden. The run may close.
