# 07 · THE GOAL PROMPTS + THE HYDRA ORGANIZATION

## THE GOAL (each desk runs the W-goal; the stop condition the judge verifies)
```
GOAL:      wire the <Wk> module of the Plutus-Common-Sense LSP.
ANCHORS:   the DPL1 (02-DPL1-SPEC) §B; the precedent gi-lsp.ts; the judge wire jevk5.ts.
LAWS:      the polarity law (INFORMS); the state from disk; read-only; NAMED fails.
BATTERY:   bun test tests/plutus-lsp.test.ts
STOP:      the wave's gate token is present in a tool result + the failToken absent.
FORBIDDEN: a block path in the server; agent-supplied state; a phantom card.
```

## THE HYDRA ORGANIZATION
```
the orchestrator (the primary agent)
  ├─ W1 desk (store)      mode: build   → src/plutus-lsp/store.ts
  ├─ W2 desk (judge)      mode: build   → src/plutus-lsp/judge.ts
  ├─ W3 desk (cards)      mode: build   → src/plutus-lsp/cards.ts
  ├─ W4 desk (server)     mode: build   → scripts/plutus-lsp.ts
  ├─ W5 desk (register)   mode: ops     → ~/.omp/agent/lsp.json
  └─ W6 desk (calibrate)  mode: test    → the labeled corpus
escalation: a gate red → the desk is re-armed with the named shortfall; 2 strikes → the orchestrator
            builds it; the polarity violation (a block path) → REJECT + re-issue.
```
