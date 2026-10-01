# CHECKPOINT MANIFEST — PCSL v0.12 (2026-10-01, SECURITY-HARDENED)

## THE CHECKPOINT
Name: `PCSL-v0.12-20261001-security-hardened` (hyphens only, no spaces).
Date: 2026-10-01. Source HEAD at seal: `d9a7bfb`.

## THE DIST
`dist/plutus-lsp.js` sha256 **0638723b85a564e0** — checkpoint copy SHA == project SHA (verified).

## THE STATE (the measured ledger)
| # | the measure | the result |
|---|---|---|
| 1 | the battery | **58 pass / 0 fail / 196 expects** (pins A1-A45) |
| 2 | the derailment suite | **6/6 PASS, HERMETIC** |
| 3 | the scope gate | **7/7 correct** |
| 4 | the noise ratio | **0.00** (was 2.0) |
| 5 | the F-9 rotation | **SHRANK: true** |
| 6 | the end-to-end | a Plutus file -> 13 cards, exit 0 |

## WHAT CHANGED FROM v0.11 — TWO INDEPENDENT AUDITS, 19 FINDINGS, ALL FIXED

**THE REVIEWER AUDIT (9 findings):** the receipt rotation's missing fs imports (the HIGH —
`openSync is not defined`, hidden by a silent catch for TWO rounds), the kept/shown disclosure
ternary, the dropped UNKNOWN relevance split, the pull's false-clean, the didClose leak, the
unbounded doc bytes, the non-Error catch, the unbounded stale codes, the unbounded law cache.

**THE SECURITY AUDIT (10 findings, 0 critical / 3 high / 4 medium / 3 low):**
- **H1** the law-count PRE-FILTER read candidate kg.json with no size cap (a planted 2GB graph
  OOM'd before loadStore's 16MB gate) → the same gate in the pre-filter.
- **H2** the judge response parsed with no byte/key cap → a 256KB Content-Length check + a 64-key
  cap + a key-length cap.
- **H3** attacker strings entered the buffered receipt UNCAPPED (7 x 30MB frames = ~200MB) → one
  choke-point cap (512 chars) on `receipt()` AND `log()`.
- **M1** the doc-table cardinality (5000 didOpen = 5GB) → `MAX_OPEN_DOCS` 256 + loud eviction.
- **M2** an uncapped law statement → per-keystroke 8MB tokenization → capped AT LOAD
  (name 256 / statement 4000 / anchor+source 512).
- **M3** the stdin slow-loris (a claimed-large Content-Length + a trickle) → a 30s idle sweep.
- **M4** `ALLOWED_ROOTS` prefix-compared RAW while `rp` was canonical → canonicalized once.
- **L1** the FRAME_SKIP paths pinned the peak backing store → copies on all three.
- **L2** the health path stringified the whole hostile body → a bounded key-inspect.
- **L3** buildState built a multi-MB transient before the cap → capped at the interpolation.

**THE CLASS (both audits):** every cap existed SOMEWHERE but not on the HOTTEST path of its
surface. Now: pinned by A45.

## THE CONTENTS
- `src/ scripts/ tests/` · `dist/` · `context_management/` (11) · `ship_docs/` (6, F-15/F-16/F-17 +
  the r22/r23 gates) · `reports/` · `.omp/` + `artifacts/` (r19/r21/r22/r23).
- Verify: `sha256sum -c SHA256SUMS`. Secret pre-scan: clean.

## THE HONEST GAPS
- The ocr lane remains provider-down (Go 403, zen-free 429); BOTH independent readers were
  fresh-context subagents (the same zero-context independence criterion), not ocr.
- The live-TUI render proof is PENDING (needs a session restart). The calibration corpus is 8
  items. The enforcement extension PARKED (v2). The seal: NO LOCK (Mode B).
