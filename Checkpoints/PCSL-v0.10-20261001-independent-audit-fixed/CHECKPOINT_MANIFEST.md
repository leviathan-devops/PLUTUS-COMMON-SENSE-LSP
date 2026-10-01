# CHECKPOINT MANIFEST — PCSL v0.10 (2026-10-01, INDEPENDENT-AUDIT-FIXED)

## THE CHECKPOINT
Name: `PCSL-v0.10-20261001-independent-audit-fixed` (hyphens only, no spaces).
Date: 2026-10-01. Source HEAD at seal: `3d1051b` (the F-16 loud-catch commit).

## THE DIST
`dist/plutus-lsp.js` sha256 **533b62916ed4f0f6** — checkpoint copy SHA == project SHA (verified).

## THE STATE (what is validated)
- THE BATTERY: `bun test ./tests/` -> **57 pass / 0 fail / 184 expects** (5 files of pins A1-A44).
- THE DERAILMENT SUITE: **6/6 PASS, HERMETIC**.
- THE SCOPE GATE: **7/7** — Plutus trees IN, foreign trees SILENT.
- THE F-9 ROTATION: **PROVEN LIVE** (`13107276 -> 155958 bytes`, `SHRANK: true`).
- THE PULL: `{"id":2,...}` no -32601; mid-chain it returns `-32802 analysis in progress` (never a false-clean).
- THE F-5 CARD: the judge-down case surfaces `plutus/stale` first.
- THE END-TO-END: a real Plutus file -> 13 cards (12 LAW + 1 SUSPECT), exit 0.

## WHAT CHANGED FROM v0.9 (the independent audit + the silent-catch class)
- **THE INDEPENDENT AUDIT (9 findings, a fresh-context reviewer subagent — the ocr lane is
  provider-down):**
  - HIGH: the receipt rotation called `openSync/readSync/closeSync/writeFileSync` with NONE
    imported; a silent `catch` swallowed the ReferenceError for TWO rounds (the cap never held).
    FIXED: imports completed, the rotation LOUD (`RECEIPT_ROTATE_FAIL`), the sibling stderr LOG
    capped, pinned A40, PROVEN live.
  - MEDIUM×5: the kept/shown disclosure concatenates (was one ternary — a count fabrication); the
    UNKNOWN relevance split is SURFACED + receipted (was dropped — deciding without evidence); the
    pull returns an ERROR mid-chain (was a false-clean `[]`); `didClose` clears `inFlight`/`dirty`
    (was re-analyzing closed docs); `MAX_DOC_BYTES` caps the doc store (was unbounded).
  - LOW×3: the pull catch handles non-Error rejections; `staleCode` ALLOWLISTED; `LAW_COUNT_CACHE`
    bounded at 128.
- **THE F-16 SILENT-CATCH CLASS:** the forensic-dir + log-rotate failures are now LOUD (the
  remaining silent catches are the "not present" stat probes — where absence IS the answer).
- **A44/A40-A44 pins**; the audit artifact `artifacts/sg-ocr-round22.json`.

## THE CONTENTS
- `src/ scripts/ tests/`: 10 .ts files. `dist/`: the bundle (SHA above).
- `context_management/` (11) · `ship_docs/` (6, F-15/F-16 + the r22 gate wired).
- `reports/`: the FLAW REPORT + the meta-patterns trio + the golden-reasoning report + calibration.
- `.omp/` + `artifacts/`: the pressure + derailment results + the r19/r21/r22 audit JSONs.
- Verify: `sha256sum -c SHA256SUMS`. Secret pre-scan: clean.

## THE HONEST GAPS
- The SECOND independent auditor (the security-reviewer probe) was still running at seal — its
  findings are NOT in this checkpoint (v0.11 will carry them).
- The ocr lane remains provider-down (Go 403, zen-free 429); the audit GATE is satisfied by the
  host reviewer agent (the same zero-independence criterion), NOT by ocr.
- The live-TUI render proof is PENDING (needs a session restart). The calibration corpus is 8
  items. The enforcement extension is PARKED (v2). The seal: NO LOCK (Mode B).
