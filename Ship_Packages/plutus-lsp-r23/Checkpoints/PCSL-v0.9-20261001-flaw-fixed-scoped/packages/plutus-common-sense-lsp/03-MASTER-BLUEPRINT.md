# 03 · MASTER BLUEPRINT — the Plutus-Common-Sense LSP (9 sections)

## 1 · THE MACRO
A third custom LSP server, in its own repo, that reads the Plutus knowledge graphs + judges edits
via JevK5, surfacing the canon reflexively on every write.

## 2 · THE LIFECYCLE
```
initialize → bind the project root (rootMarkers) → open the graph read-only (once)
   │
   ├─ per didOpen/didChange(file):
   │    declarationsIn(file) → lawsForSymbol (L1/L2) → jevK5Chain (CH-PLUTUS) → cards → publish
   │
   └─ didClose → clear the diagnostics (the LSP convention)
```

## 3 · THE DISPATCH TRACE (a real edit)
```
T1  the agent opens game.js                 → didOpen(game.js)
T2  plutus-lsp reads the graph              → laws for updateAI()
T3  CH-PLUTUS: P4 (violate) on the hunk     → {noul: 0.91}
T4  the verdict: VIOLATION                  → publishDiagnostics(sev 1)
T5  ▌ "(plutus/violation) SL cap 150 — IRON-… bible40:2997"  ← the reflex
★ zero tool calls; the law arrived on the write.
```

## 4 · THE TYPES + CHECKS
```
type FactCard = { shape: "LAW"|"VIOLATION"|"SUSPECT"|"TIER"|"CALLERS"|"DRIFT"|"STALE",
                  title: string, rows: string[], severity: 1|2|3|4,
                  source: PlutusLspToken, total: number }
```
Checks: every `rows[]` entry is a real `file:line`; `total` is measured (a fact-free file → NO card).

## 5 · THE CHAIN PSEUDOCODE (CH-PLUTUS)
```
state ← { target: the file path, laws: the L2 rows, hunk: the diff }
answers ← POST :8090/v1/systemone { state, questions: { P1..P7 (noul) } }   ← ONE pass
verdict ← min(P4, P7) mapped by the thresholds → VIOLATION|SUSPECT|LAW
```

## 6 · THE TREES
```
plutus-lsp (the server)
  ├─ store.ts     the graph reader (L1 kg.json + L2 socket)
  ├─ judge.ts     CH-PLUTUS (7 nouls)
  └─ cards.ts     the 7 tokens + toDiagnostic
```

## 7 · THE LAWS
- L-POLARITY: the LSP INFORMS, the extension ENFORCES. Forbidden: a block from the server.
- L-STATE: the state is read from disk. Forbidden: agent-supplied state.
- L-READONLY: the server never writes. Forbidden: `writeFile`/`saveRecord`.
- L-NAMED-FAIL: a down judge / absent graph is a NAMED refusal. Forbidden: a silent empty.
- L-NO-PHANTOM: a card asserts only what it measured. Forbidden: an unmeasured `total`.

## 8 · THE ERROR VOCABULARY
`PLUTUS_NO_STORE` · `JEVK5_DOWN` · `PLUTUS_NO_ROOT` · `PLUTUS_BAD_SESSION`.

## 9 · THE BACKWARDS MAP + PROVENANCE
Every element traces to a precedent: the scaffold → `gi-lsp.ts`; the polarity → `jg-lsp.ts`; the
card shape → `cards.ts`; the judge wire → `jevk5.ts`; the registration → `lsp.json`.
