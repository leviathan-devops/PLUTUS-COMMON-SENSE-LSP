# CURRENT_STATE — PLUTUS-COMMON-SENSE-LSP

**As of:** 2026-10-01 · **The phase:** pre-ship-package (r19 FAIL 0c/5h wired; battery 46/0/158; derailment 6/6; gate FAIL — no ship-ready claim).

## THE ARCHITECTURE AS IT NOW IS
```
OMP native LSP runtime (diagnosticsOnWrite / OnEdit)
  │ queries EVERY registered server on every write/edit
  ▼
plutus-lsp (scripts/plutus-lsp.ts, stdio JSON-RPC)
  │  store.ts    the graph reader (L1 kg.json + fire-and-forget L2)  PLUTUS_NO_STORE
  │  judge.ts    CH-PLUTUS (7 nouls) + relevance kernel vs JevK5  JEVK5_DOWN
  │  cards.ts    the 7 tokens + STALE codes -> LSP diagnostics    the anti-phantom law
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
- the battery: 46 pass / 0 fail / 158 expects (3 files)
- the live selftests ×4 (JevK5 jevk5-4b-v0.2-Q8_0): store 11 · judge 13 · script 12 · cards 13 (1 VIOLATION MECH-TOKEN-08 P6=0.868, target-file warning proven)
- the receipt: `RELEVANCE judged=12/12 dropped=0` (forensic/lsp-receipts.log, 2026-09-30T17:46:57Z)
- the bundle: dist/plutus-lsp.js sha256 3307a3b7a14d6f4b (rebuilt at every round)
- the derived bar: 0.30 (F1 0.60 · P 0.50 · R 0.75) on the 8-item corpus
- the audit gate: rounds 11-18 run (r18 FAIL 1c/5h — NO ship-ready claim)

## WHAT IS NOT YET DONE
The r17/r18 medium/low residual (~19 findings, recorded — hunk-hot-path caching, decl regex, accounting).
The live-TUI render proof (needs a session restart — the LSP binds at session construction).
The enforcement extension (deferred to v2). The 50+ item calibration corpus.

**Dist fingerprint (this update):**

Dist fingerprint (this update): `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`
