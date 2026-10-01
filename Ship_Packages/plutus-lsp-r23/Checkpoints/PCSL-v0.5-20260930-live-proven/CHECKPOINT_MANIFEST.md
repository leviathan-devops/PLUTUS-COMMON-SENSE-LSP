# CHECKPOINT MANIFEST — PCSL v0.5 (2026-09-30, LIVE-PROVEN)

## THE DIST
`dist/plutus-lsp.js` sha256 **7312b76c5d3994df** — certified in the container
(reports/pcsl-final-results.json: 7/7) AND live-proven on the host.

## THE LIVE-TUI PROOF (the headline — the last blocker, closed)
```
INIT pid=3468796 · FRAME initialize · FRAME initialized · FRAME didChangeConfiguration
FRAME textDocument/didOpen · REFUSE PLUTUS_NO_STORE · FRAME didChangeWatchedFiles · didSave
the parent: /home/leviathan/.bun/bin/omp __omp_worker_lsp_mux   ← THE RUNTIME'S OWN LSP MUX
```
**The omp runtime spawns the server, completes the FULL handshake, opens the file, and the
server RUNS ITS PIPELINE. THE REFLEX IS LIVE.** The root cause of the prior "no spawn" was
`lsp.diagnosticsOnEdit: false` (off by default — and the agent's primary tool is `edit`).

## WHAT CHANGED FROM v0.4
- THE L1 DISCOVERY: the server finds the canon without an env var (the known Plutus locations).
- THE LIVE-TUI PROOF (the runtime's mux spawn + the full handshake + the pipeline).
- THE DEPLOYMENT CONTRACT (reports/LSP_DEPLOYMENT_CONTRACT.md — the four spawn gates).
- THE FINAL CONTAINER CERT: 7/7 on 7312b76c5d3994df.

## THE REMAINING (enhancements, not blockers)
- the calibration corpus 8 items (a 50+ corpus stabilizes the bar)
- the enforcement extension (v2 — the block; the LSP informs)
- THE AUDIT GATE: FAIL (0 critical, 12 high) — the hardening residual; no ship-ready claim.
