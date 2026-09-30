# THE LSP DEPLOYMENT CONTRACT — the spawn gates (measured 2026-09-30)

## THE ONE-SENTENCE LAW
**A registered LSP server spawns ONLY when FOUR gates are all open. Three of them are
off-by-default or path-dependent — and a closed gate is SILENT.**

## THE FOUR GATES (each verified against the omp source)
| # | the gate | the default | the failure if closed |
|---|---|---|---|
| 1 | `lsp.json` registers the server | — | the server never exists |
| 2 | the session cwd carries a `rootMarker` | — | `hasRootMarkers` false -> the server is FILTERED OUT (silently) |
| 3 | `lsp.diagnosticsOnWrite` | **TRUE** | a write does not trigger diagnostics |
| 4 | **`lsp.diagnosticsOnEdit`** | **FALSE** ← THE TRAP | **an EDIT does not trigger diagnostics — and the agent's primary tool is `edit`** |
Plus: `resolveCommand(command, cwd)` must find the binary (`$which`), else the server is filtered.

## THE MECHANISM (read from the source, not guessed)
- `loadConfig(cwd)` merges `<cwd>/lsp.json` + `~/.omp/agent/lsp.json` + the defaults
  (`config.ts`). **`hasOverrides` decides:** with NO user servers found, the AUTO-DETECT path
  returns ONLY the built-in defaults.
- **The config is CACHED per-cwd, never invalidated** (`servers.ts`'s `configCache`) — a
  mid-session `lsp.json` change is INVISIBLE until a new session or a new cwd.
- The spawn is LAZY (per file-open/edit), not at startup — `getOrCreateClient` runs when a
  file of a matching type is opened.
- **`client.ts:30` — THE NEGATIVE CACHE:** a failed init is remembered and the server is NOT
  re-spawned in that session.

## THE DEPLOYMENT CHECKLIST (the operational recipe)
```yaml
# ~/.omp/agent/config.yml — REQUIRED for the edit path
lsp:
  diagnosticsOnEdit: true
```
```json
// <project>/lsp.json — the highest-priority config
{ "servers": { "plutus-lsp": {
    "command": "bun",
    "args": ["/abs/path/scripts/plutus-lsp.ts", "--stdio"],
    "fileTypes": [".ts", ".tsx", ".js", ".md"],
    "rootMarkers": ["tsconfig.json"] } } }
```
**VERIFY (in this order):**
1. `omp's own loader`: a probe importing `loadConfig(cwd)` → the server appears in the list.
2. A FRESH session in the cwd (a restart — the config cache).
3. A **WRITE** (not just an edit) to a matching file → the receipt's INIT line.
4. The receipt: `<project>/forensic/lsp-receipts.log` (durable, never /tmp).

## THE RECEIPT (the proof channel)
The server writes `INIT pid=N` + `FRAME <method>` + `PUBLISH n=K` to
`<project>/forensic/lsp-receipts.log`. **No receipt = no spawn.** The panel's LSP list is a
SUBSET (it showed only the detected defaults while gi-lsp/jg-lsp ran) — **the process list +
the receipt are the evidence, never the panel.**

## THE AUDIT'S FINDINGS THIS CONTRACT CLOSES
- the `diagnosticsOnEdit: false` default (found by driving a real edit in a fresh session);
- the config cache (why a mid-session registration is invisible);
- the negative cache (why a fixed server does not re-spawn in the same session);
- the durable receipt (the /tmp proof loss — audit-alpha's F4).
