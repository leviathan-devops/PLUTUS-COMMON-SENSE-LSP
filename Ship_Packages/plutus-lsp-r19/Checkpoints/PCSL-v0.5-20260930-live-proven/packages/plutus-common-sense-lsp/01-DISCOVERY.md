# 01 · DISCOVERY — the measured inventory (2026-09-29)

## THE PRECEDENT SERVER 1 — `gi-lsp` (the GI kernel reflex)
- **Path:** `Graph_Intelligence/scripts/gi-lsp.ts` — **220 lines**, executable.
- **Reads:** `<root>/.omp/graph-intelligence/*-checkout/store.sqlite` (corbell → graphify → structural).
- **Tokens:** `GI_LSP_TOKENS = [gi-lsp/callers, gi-lsp/unwired, gi-lsp/conflict, gi-lsp/meaning, gi-lsp/scope]`.
- **The insight (its own header, `:5`):** "the 6 layers were a QUERYABLE LIBRARY … this server makes them a SENSE ORGAN: OMP's native runtime drives it on every open/change, and the fact cards arrive with NO agent action."
- **The card shape (`src/gi-lsp/cards.ts`):** `FactCard { shape, title, rows[], severity 1|2|3|4, source<Token>, total }` — 5 shapes: CALLERS · UNWIRED · CONFLICT · MEANING · SCOPE.
- **The judge import (`:23`):** `import { jevk5Probe } from "../src/omp/adapters/jevk5.ts"` — the live TSG judge.
- **The loud fail:** a missing store → the NAMED `GI_NO_STORE` (never a silent empty).

## THE PRECEDENT SERVER 2 — `jg-lsp` (the ticket reflex)
- **Path:** `Jev_Gates/scripts/jg-lsp.ts` — **207 lines**, executable.
- **Reads:** `<baseDir>/session-id` → `<baseDir>/tickets/<sid>.json` (one read-only json read per `didOpen`/`didChange`).
- **Tokens:** `JG_LSP_TOKENS = [jg/consumed, jg/no-row, jg/row, jg/scope, jg/shrink, jg/state]`.
- **The polarity law (its header `:6`):** "the extension stays the sole ENFORCER (the polarity law)."
- **The A6 ladder (`resolveSnapshot`):** baseDir → session-id → record → seal; the FIRST miss is the NAMED reason.
- **The arbitrary-path lesson:** the session-id flows into a `path.join` → guarded by `safeId` (rejects traversal shapes).

## THE REGISTRY (measured)
- `~/.omp/agent/lsp.json` → `servers = ['gi-lsp', 'jg-lsp']` (both registered, both live).
- Each entry: `{ command, args:["--stdio"], fileTypes[], rootMarkers[], warmupTimeoutMs, isLinter }`.

## THE JUDGE (measured live)
- `GET http://127.0.0.1:8090/health` → `{"ok": true, "model": "jevk5-4b-v0.2-Q8_0", "runtime": "gguf"}`.
- `GET http://127.0.0.1:8008/health` → `{"status":"ok"}`.
- **A live noul:** `POST :8090/v1/systemone {state, questions:{q1:{type:"noul",instructions}}}` → `{"answers":{"q1":{"noul":0.7869}},"latency_ms":334}`.
- The contract shape: `{"state":"<text>","questions":{"q":{"type":"noul","instructions":"<q>"}}}`.

## THE GRAPHS (measured, built this session)
- **L1 SEMANTICA** — the corpus: `1277 entities / 1141 relationships` at `MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json`; the TS tree: `3905 / 3496`.
- **L2 ARSUMBRIS** — `1323 nodes / 1162 edges`; the daemon at `~/.arsumbris/au-engine/run/3a3143c03eedd217.sock`; `564 law · 583 mechanism · 38 ruling · 16 hard-limit` typed cards; the `plutus-law` type: `id·tldr·statement·tier[IMMUTABLE|EVOLVING|SUPERSEDED]·anchor`.
- **The 7 source hubs:** bible40 · lexicon-mathexpr · macro-laws · reasoning-chain · handovers · tte-golden-2 · fractal-anchor-tvi.

## THE RUNTIME KEYS (the spawn gates — from `omp-lsp-render-proof`)
- `lsp.enabled` · `lsp.diagnosticsOnWrite` · `lsp.diagnosticsOnEdit` · `lsp.diagnosticsDeduplicate`.
- **The 4 gates:** (1) `lsp.json` exists + registers; (2) the project root carries a `rootMarker`; (3) `task.enableLsp = true` (the load-bearing one); (4) `lsp.diagnosticsOnEdit = true`.

## THE LIVE PROOF (observed this session)
- The `jg-lsp` fired a real diagnostic on a write to `/…/PLUTUS-COMMON-SENSE-LSP/PLANNING_SUITE_…md`:
  `[jg/state] no session-id file (the extension has not run — remedy: start a ticket session)`.
- **That IS the reflex mechanism working** — a registered server rendered a card on a live write,
  with zero tool calls. The build extends exactly this.

## WHAT WAS NOT READ
- The `au-mcp` kernel's tool surface (returns `tools/list = []` today — an unwired plugin mount).
- The JevK5 calibration curve (T=1.532 claimed; unverified here).
- The L2 daemon's read latency under edit-cadence load.
