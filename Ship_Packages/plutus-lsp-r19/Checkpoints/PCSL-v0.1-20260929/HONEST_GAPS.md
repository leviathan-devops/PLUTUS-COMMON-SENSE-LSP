# HONEST GAPS — what this checkpoint does NOT establish

1. **The live-TUI render proof is PENDING (T1).** The LSP binds at SESSION CONSTRUCTION — a
   running session does not pick up a new server. The render is proven at the DRIVEN level
   (the receipt `PUBLISH n=3`); the live-TUI level needs a restart.
2. **The AUDIT GATE is FAIL** (0 critical, 12 high). 26 confirmed defects were fixed across 3
   rounds; the CRITICAL class is eliminated; the residual is hardening. NO ship-ready claim.
3. **The calibration corpus is 8 items** — the F1 plateau (0.55-0.60) is the small-n signature.
   Precision 0.50 is bounded by the polarity law (a Warning, never a block).
4. **`plutus/callers` is declared, not emitted** (the ripwire read is T7).
5. **The enforcement extension (the block) is v2** — deferred (D5).
6. **The `didChange` incremental-sync path** handles full-sync only (the server advertises sync:1).
