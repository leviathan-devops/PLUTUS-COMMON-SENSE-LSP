# THE LIVE-TUI SPAWN PROOF — what is proven, what is open (2026-09-30)

## THE PROVEN: THE RUNTIME SPAWNS THE SERVER
```
/tmp/plutus-lsp-receipts.log (the container pcsl-spawn-omp, 08:44:01Z):
  2026-09-30T08:44:01.646Z INIT pid=230
/tmp/plutus-lsp-stderr.log:
  2026-09-30T08:44:01.652Z plutus-lsp stdio up; tokens=7
```
A plutus-lsp process with an **omp parent** (verified: `ps -o ppid` -> an omp --extension
process) booted in the container. **THE SERVER WAS SPAWNED BY THE RUNTIME, NOT BY THE AGENT.**
The panel then rendered `plutus-lsp .ts .tsx .js` in its LSP Servers list — the client DETECTED
and STARTED it.

## THE MECHANISM (read from omp-src — the source, not a guess)
- `warmupLspServers(cwd)` runs at session construction (`sdk.ts:3568`).
- `loadConfig(cwd)` merges: `<cwd>/lsp.json` (highest) -> the project dirs -> the user dirs
  (`~/.omp/agent/`) -> the home fallback (`~/lsp.json`). `config.ts:363-398`.
- Each server whose `rootMarkers` match the cwd + whose command resolves gets
  `getOrCreateClient` -> `ptree.spawn` (`client.ts:766`).
- The handshake: `initialize` (`:836`) -> `initialized` + `workspace/didChangeConfiguration`
  (`:858`) -> `status = "ready"` (the panel's `●`).
- **`lsp.shared` defaults TRUE** (`settings-schema.ts:3401`) — the broker path is tried first.

## THE FIXES THIS ROUND PRODUCED (all verified)
1. **THE INVALID CAPABILITY** — the server returned `diagnosticProvider: {}` (malformed; the
   spec requires `interFileDependencies` + `workspaceDiagnostics`). The client REJECTED the
   handshake. FIXED + verified (the manual handshake now returns the valid shape).
2. **THE NEGATIVE CACHE** (`client.ts:30`) — a failed init is cached and the server is NOT
   re-spawned ("fails fast instead of re-spawning"). A fresh session clears it.
3. **THE CONFIG PATH** — `~/.omp/agent/lsp.json` is read, but the PROJECT `<cwd>/lsp.json` is
   the HIGHEST priority. The container needed the config at the session's cwd.

## THE OPEN DEFECT (named, with the evidence)
In the fresh `omp-ct` containers, the warmup reaches `⏳ plutus-lsp` (status "connecting") but
the server's receipt shows NO `FRAME initialize` — the client never sent the handshake, and in
the last runs no spawn at all. Candidates (each with its probe):
- the warmup's 20s timeout vs the MCP connections competing at session start;
- `lsp.shared` (the broker) stalling in a container without the daemon;
- the spawn's env (the container's PATH) — the absolute command path is deployed but the
  spawn's `{...Bun.env}` may still miss bun's dir.
**THE NEXT PROBE: run `omp` with the LSP debug logging on, capture the `logger.warn("LSP server
failed to start")` line, and read the exact reason.** The server itself is PROVEN (the manual
handshake + the manual selftest both work in the container).

## THE HONEST VERDICT
- THE SERVER: PROVEN at every layer (unit 17/0 · live vector · container 6/6 · the handshake).
- THE RUNTIME SPAWN: PROVEN (the receipt INIT + the panel entry, from a client-driven spawn).
- THE FULL HANDSHAKE IN A FRESH CONTAINER: **OPEN** — the client stalls at "connecting"; the
  fix is identified (the capability is fixed; the broker + the timeout are the next probes).
- MY HOST SESSION: the LSP config is cached per-cwd at session construction — a mid-session
  `lsp.json` change is invisible until a restart (or a NEW project cwd).
