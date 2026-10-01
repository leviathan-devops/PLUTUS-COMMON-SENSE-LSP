# SUGGESTED_IMPROVEMENTS — the PLUTUS-COMMON-SENSE-LSP

Each: the problem · why worth tokens · the ASCII diagram · the steps · the cost if wrong.

## SI-1 — FIX THE `.md` OVER-FIRE (the #1 noise source)

**Problem.** `fileTypes: [.ts,.tsx,.js,.md]` → 32/49 refusals are markdown files.
**Why worth tokens.** ~2:1 noise-to-signal in the receipt; every doc write shows a false warning.
**Diagram.**
```
  write foo.md  →  loadStore(foo.md's root)  →  no kg.json  →  PLUTUS_NO_STORE  →  WARNING
```
**Steps.** (1) drop `.md` from `fileTypes`; (2) OR gate: `resolveRoot` → if no marker, return
silently. **Cost if wrong.** A `.md` canon file loses its reflex — acceptable (the reflex is for
code; the docs are the SOURCE of the graph, not the target).

## SI-2 — GATE THE L2 PROBE ON L1

**Problem.** 197 dead `L2 PLUTUS_NO_STORE` rows (the L2 socket keyed to a different root).
**Why worth tokens.** 197 of the ~246 noise rows.
**Steps.** Only `readL2` when `store.root`'s socket exists; skip when L1 resolved via the env
override. **Cost if wrong.** A live L2 count is missed when the env override is set — minor.

## SI-3 — OUT-OF-SCOPE = SILENT

**Problem.** `staleCard` = `SEVERITY.Warning`; a non-canon file shows a warning.
**Why worth tokens.** The warning implies the canon is broken when the file is simply out of scope.
**Steps.** Distinguish "no marker" (out-of-scope → silence) from "marker exists, store missing"
(→ Warning). **Cost if wrong.** A genuinely broken graph on a marker-bearing root might be missed
if the distinction is wrong — pin it.

## SI-4 — ROTATE THE RECEIPT

**Problem.** `forensic/lsp-receipts.log` grows unbounded.
**Steps.** Rotate at 10MB; throttle FRAME rows (highest volume, lowest value). **Cost if wrong.**
None (a rotated receipt is still auditable).

## SI-5 — SINGLE-FLIGHT THE JUDGE CHAINS

**Problem.** Rapid typing piles up overlapping `relevancePass` (20s) + `chain` (6s) chains; only
the last `seq` publishes (r19 finding).
**Steps.** Add an in-flight guard per uri (skip or abort the prior chain). **Cost if wrong.** A
stale diagnostic if the guard drops a newer edit — pin it.

## SI-6 — THE 50+ CALIBRATION CORPUS

**Problem.** The 8-item corpus gives a flat plateau (F1 0.55-0.60 across bars 0.30-0.45).
**Steps.** Add the near-miss, the bait, the paraphrase, the boundary cases. **Cost if wrong.** None.
