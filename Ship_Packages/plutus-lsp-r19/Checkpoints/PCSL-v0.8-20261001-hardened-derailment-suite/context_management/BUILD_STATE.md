# BUILD_STATE — the dist + the evidence

## THE DIST
`dist/plutus-lsp.js` — 41,046 bytes · sha256 `3307a3b7a14d6f4b`
(rebuilt + committed at 816b384 via `bun build scripts/plutus-lsp.ts --target bun --format esm`).
The LSP runtime spawns `bun scripts/plutus-lsp.ts --stdio` (source); the dist is the sealed artifact.

## THE FILE MANIFEST (the deployed set)
```
scripts/plutus-lsp.ts        the stdio JSON-RPC server (the entry)
src/plutus-lsp/store.ts      the graph reader
src/plutus-lsp/judge.ts      CH-PLUTUS (the chain)
src/plutus-lsp/cards.ts      the 7 tokens
tests/plutus-lsp.test.ts     the W1 gate
tests/judge-cards.test.ts    the W2+W3 gate
tests/adversarial.test.ts    the P5 sweep (8 angles)
tests/calibration/{corpus.json,calibrate.ts}  the W6 harness
package.json · tsconfig.json
```

## THE REGISTRATION (the deploy)
`~/.omp/agent/lsp.json` → `servers.plutus-lsp` (command bun, args [... --stdio], fileTypes
[.ts,.tsx,.js,.md], rootMarkers [MASTER_CONTEXT, .omp/graph-intelligence, .arsumbris, tsconfig.json]).

## THE BATTERY (measured)
`bun test tests/` -> **46 pass / 0 fail / 158 expects** (3 files, r18 batch).

## THE RUNTIME KEYS (the spawn gates)
`task.enableLsp` (the load-bearing one) · `lsp.diagnosticsOnEdit` · `lsp.diagnosticsOnWrite`.
