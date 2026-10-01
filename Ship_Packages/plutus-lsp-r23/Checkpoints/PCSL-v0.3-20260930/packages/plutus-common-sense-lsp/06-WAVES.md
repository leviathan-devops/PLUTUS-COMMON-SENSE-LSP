# 06 · THE WAVE STRUCTURE (disjoint files, per-wave gates)

```
W1  THE STORE READER        src/plutus-lsp/store.ts
    entry: the graphs exist.  desks: 1.
    gate: reads L1 kg.json + L2 socket; a miss names PLUTUS_NO_STORE (asserted by the selftest).

W2  THE JUDGE CHAIN         src/plutus-lsp/judge.ts
    entry: W1 green.  desks: 1.
    gate: the live K5 returns 7 nouls; a down judge names JEVK5_DOWN; ONE batched pass.

W3  THE CARDS               src/plutus-lsp/cards.ts
    entry: W2 green.  desks: 1.
    gate: the 7 tokens; both halves (a violation card + a clean file with 0 misfire).

W4  THE SERVER              scripts/plutus-lsp.ts
    entry: W3 green.  desks: 1.
    gate: --selftest <file> → ≥1 token → exit 0; the JSON-RPC handshake answers.

W5  THE REGISTRATION        ~/.omp/agent/lsp.json
    entry: W4 green.  desks: 1.
    gate: the RECEIPT (/tmp/plutus-lsp-receipts.log) shows initialize → didOpen → PUBLISH n=K
          after a real TUI write. No receipt = not driven.

W6  THE CALIBRATION         tests/calibration
    entry: W5 green.  desks: 1.
    gate: the bars (0.85/0.50) DERIVED on a labeled set (a known violation + a known clean);
          precision/recall recorded WITH the corpus.
```
Every wave: disjoint files. Every gate: a tool result. No wave starts with its predecessor's gate unmet.
