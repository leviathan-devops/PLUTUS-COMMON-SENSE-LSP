# GUARDRAIL_SPEC — mechanical enforcement for the knowledge LSP kernel

Advisory rules do not hold; these are MECHANICAL (a predicate that exits nonzero).

## G-1 — THE REGISTRATION FILE-TYPE GUARD (the #1 misfire)
**Predicate:** `jq -r '.servers["plutus-lsp"].fileTypes' ~/.omp/agent/lsp.json | grep -c '"\.md"'` → 0.
**Blocks:** the `.md` over-fire (32/49 refusals). **Remedy:** drop `.md` or gate on the root marker.

## G-2 — THE L2-GATE GUARD
**Predicate:** grep `server.ts` for the L2 probe; assert it is guarded by a `store.root` socket
existence check. **Blocks:** 197 dead L2 rows.

## G-3 — THE DIST-SHA GUARD (every checkpoint + package)
**Predicate:** `sha256sum dist/plutus-lsp.js | cut -c1-16` == the recorded SHA in the manifest.
**Blocks:** SHA drift (a stale dist shipped as current).

## G-4 — THE BATTERY GATE
**Predicate:** `PLUTUS_L1_PATH=<kg.json> bun test tests/` exits 0 with 46 pass / 0 fail.
**Blocks:** a regression shipped.

## G-5 — THE DERAILMENT-SUITE GATE (the objective)
**Predicate:** `PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` exits 0 (6/6).
**Blocks:** a kernel that no longer catches its derailments.

## G-6 — THE AUDIT GATE
**Predicate:** the latest `qwen-code-audit` verdict is PASS (0 critical/high) before any ship-ready
claim. **Blocks:** a ship claim on a red gate. A BLOCKED run is never PASS.

## G-7 — THE POLARITY GUARD
**Predicate:** grep the server for any block path (`return { block` / an LSP `code` that suppresses
edits). **Blocks:** a violation of the polarity law (INFORMS, never blocks).

## G-8 — THE NO-SECRET GUARD
**Predicate:** `grep -rE 'sk-[A-Za-z0-9]{20,}' <package>` → 0 hits.
**Blocks:** key material in the package/state.
