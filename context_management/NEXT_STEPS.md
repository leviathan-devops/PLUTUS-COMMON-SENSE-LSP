# NEXT_STEPS — the queued work

## P0 · THE ROUND-11 AUDIT RE-RUN (the open gate)
The lane (`127.0.0.1:4097`) is down; the 21 round-9/10 fixes are landed + locally verified
(26/0 battery, 4 live selftests, rebuilt bundle). Re-run the scan when the lane recovers.

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

## P3 · THE L2 SOCKET READ IN THE PIPELINE — DONE (2026-09-30)
The probe is fire-and-forget (`void readL2(...).then(receipt)`) — the receipt carries the typed
counts without blocking the keystroke path.

## NOW - THE SHIP PACKAGE (this turn)
Assemble per the ship-package skill: blocks from the docs -> dist gate -> native assembly -> audit. Gate FAIL stays FAIL.

## THE SHIP PACKAGE (2026-10-02)
Assembled at Ship_Packages/plutus-lsp-r23 with the configurable-scope machinery + the boilerplate.
Gate: the ship-package PACKAGE_AUDIT reads PASS; the ocr regression is BLOCKED (provider-down).
