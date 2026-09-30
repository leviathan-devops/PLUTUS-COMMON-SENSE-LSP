# THE LIVE-TUI PROOF — THE ARCHIVED VERBATIM EVIDENCE (2026-09-30)

**The spawn's receipt lines (captured 09:50:35Z, the probe session's edit):**
```
2026-09-30T09:50:35.938Z INIT pid=3468796
2026-09-30T09:50:35.945Z FRAME initialize
2026-09-30T09:50:35.947Z FRAME initialized
2026-09-30T09:50:35.947Z FRAME workspace/didChangeConfiguration
2026-09-30T09:50:35.980Z FRAME textDocument/didOpen
2026-09-30T09:50:35.981Z REFUSE PLUTUS_NO_STORE file=…/src/plutus-lsp/cards.ts
2026-09-30T09:50:35.982Z FRAME workspace/didChangeWatchedFiles
2026-09-30T09:50:35.982Z FRAME textDocument/didSave
```
**The process + the parent (the runtime's own mux):**
```
3468796 /home/leviathan/.bun/bin/bun …/PLUTUS-COMMON-SENSE-LSP/scripts/plutus-lsp.ts --stdio
3468707 /home/leviathan/.bun/bin/omp __omp_worker_lsp_mux
```
**WHAT THIS PROVES:** the omp runtime (via its LSP mux) SPAWNED plutus-lsp, completed the FULL
handshake (initialize → initialized → didChangeConfiguration), opened the file (didOpen), and
the server RAN ITS PIPELINE (the REFUSE line = the store read attempted + the named refusal).
The frames continued (didChangeWatchedFiles + didSave) — a live session.

**THE ROOT CAUSE OF THE PRIOR NO-SPAWN:** `lsp.diagnosticsOnEdit` DEFAULTS FALSE
(settings-schema.ts:3435-3437) — and the agent's primary tool is `edit`. The fix:
`lsp: { diagnosticsOnEdit: true }` in ~/.omp/agent/config.yml.

**WHY THIS FILE EXISTS:** the receipt (/tmp and the repo's forensic/) is a LIVE log — a later
test overwrote the spawn lines once (the audit's lesson: /tmp is ephemeral). THIS file is the
append-only archive of the proof.
