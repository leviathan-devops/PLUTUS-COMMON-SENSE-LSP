# POST-COMPACTION_PROMPT — read this first

You are resuming PLUTUS-COMMON-SENSE-LSP. Read, in order:
1. `context_management/CURRENT_STATE.md` — the architecture as it now is.
2. `context_management/EVIDENCE_STATE.md` — every verdict with its artifact.
3. `context_management/NEXT_STEPS.md` — the queued work (T1 is the operator's).
4. `reports/CALIBRATION_v1.md` — the derived bar + the honest residual.
5. `packages/plutus-common-sense-lsp/` — the DPL1 + the wave-plan.

## THE STATE IN ONE LINE
The server is BUILT + REGISTERED + TESTED (26 pass, 4 live selftests, bundle 3307a3b7a14d6f4b);
the calibration bar is DERIVED (0.30); the round-11 audit re-run + the live-TUI render proof +
the checkpoint seal are the remaining gates.

## THE LAWS THAT SURVIVE
The polarity (INFORMS) · the state from disk · the bar DERIVED · the observable question ·
the anti-phantom card · the named refusals (PLUTUS_NO_STORE / JEVK5_DOWN / PLUTUS_NO_ROOT) ·
the single fallback policy (never clear) · fail-closed defaults · BLOCKED-is-not-a-verdict.

## THE TRAPS
The LSP binds at session construction (a restart is needed for a new server).
The 8-item corpus is small. The judge's ceiling is the question's writeability.

Dist fingerprint (2026-10-01): `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`
