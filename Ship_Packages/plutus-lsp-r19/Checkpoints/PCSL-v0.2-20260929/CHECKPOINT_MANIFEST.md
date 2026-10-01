# CHECKPOINT MANIFEST — PCSL v0.2 (2026-09-29)

## WHAT CHANGED FROM v0.1
- THE P1 FIX: jurisdiction comes from the LAWS (P2), not the model's path read.
- THE TEST ISOLATION (bunfig.toml) + THE ENV RESTORE fix.
- THE CONTAINER v2: 6/6 PASS with the LIVE judge over the host bridge (172.17.0.1:8091).
- THE DIST: 7a3daf3eadd6f673 (rebuilt with the fixes).

## THE EVIDENCE
- the host suite: 17 pass / 0 fail
- the container: 6/6 (incl. the VIOLATION card at P4=0.923)
- the judge: the health now PROBES its backend (the false-green generator fixed)

## THE OPEN BLOCKERS (NOT ship-ready)
1. THE LIVE-TUI PROOF: the OMP runtime has NEVER spawned plutus-lsp (it binds at session
   construction). NEEDS: a session restart + one write → the receipt shows the runtime's spawn.
2. THE AUDIT GATE: FAIL (0 critical, 12 high).
3. THE CALIBRATION: 8 items (F1 0.60, P 0.50).
4. plutus/callers: declared, not emitted.
5. THE ENFORCEMENT (v2): absent (the LSP informs only).
