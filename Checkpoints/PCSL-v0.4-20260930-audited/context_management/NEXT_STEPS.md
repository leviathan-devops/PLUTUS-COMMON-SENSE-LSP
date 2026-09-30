# NEXT_STEPS — the queued work

## P1 · THE LIVE-TUI RENDER PROOF (the remaining gate)
The LSP binds at SESSION CONSTRUCTION — a running session does not pick up a new server.
The proof: restart the TUI, open a Plutus file, read `/tmp/plutus-lsp-receipts.log` for
`FRAME initialize` + `PUBLISH n=K`. Until then the render is proven only via the driven server.

## P1 · THE CALIBRATION CORPUS → 50+ ITEMS
The 8-item corpus gives a flatter plateau (F1 0.55-0.60 across bars 0.30-0.45). A 50+ item
corpus (with the near-miss + the bait + the paraphrase + the boundary) stabilizes the bar.

## P2 · THE ENFORCEMENT EXTENSION (v2, D5)
The block lives in an extension (`tool_call`), never the LSP. Only after the LSP's precision is
trusted (the informing layer must be quiet before the enforcing layer arms).

## P2 · THE OBSERVABLE QUESTION LIBRARY
The OBSERVABLE table has 5 templates; the canon has 564 laws. Grow the library per law family.

## P3 · THE L2 SOCKET READ IN THE PIPELINE
store.ts has readL2; the pipeline uses L1 only today. Wire the L2 read for the typed counts.
