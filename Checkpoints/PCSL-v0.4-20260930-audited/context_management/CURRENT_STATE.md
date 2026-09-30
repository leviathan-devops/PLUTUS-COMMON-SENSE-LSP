# CURRENT_STATE — PLUTUS-COMMON-SENSE-LSP

**As of:** 2026-09-29 · **The phase:** P3–P6 (the waves landed; the docs + the seal pending).

## THE ARCHITECTURE AS IT NOW IS
```
OMP native LSP runtime (diagnosticsOnWrite / OnEdit)
  │ queries EVERY registered server on every write/edit
  ▼
plutus-lsp (scripts/plutus-lsp.ts, stdio JSON-RPC)
  │  store.ts    the graph reader (L1 kg.json + the L2 socket)   PLUTUS_NO_STORE
  │  judge.ts    CH-PLUTUS (5-of-7 nouls) vs JevK5 :8090          JEVK5_DOWN
  │  cards.ts    the 7 tokens -> LSP diagnostics                  the anti-phantom law
  ▼
publishDiagnostics -> the canon arrives on the write (the REFLEX)
```
## THE REGISTERED SERVERS (3)
`gi-lsp` (the GI reflex) · `jg-lsp` (the ticket reflex) · `plutus-lsp` (the canon reflex) — no eviction.

## THE 7 TOKENS
`plutus/law` · `plutus/violation` · `plutus/suspect` · `plutus/tier` · `plutus/callers` ·
`plutus/drift` · `plutus/stale`.

## THE POLARITY LAW (the invariant)
The LSP INFORMS; the extension ENFORCES. A block path in the server is a VIOLATION.

## THE CURRENT NUMBERS
- the battery: 17 pass / 0 fail (3 files)
- the selftest: 2-3 cards on a real Plutus file; 5 live nouls in ONE pass
- the receipt: PUBLISH n=3 on `mirror.ts` (verdict=SUSPECT)
- the derived bar: 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus

## WHAT IS NOT YET DONE
The live-TUI render proof (needs a session restart — the LSP binds at session construction).
The enforcement extension (deferred to v2). The 50+ item calibration corpus.
