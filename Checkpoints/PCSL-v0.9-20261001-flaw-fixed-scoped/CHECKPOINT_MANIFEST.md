# CHECKPOINT MANIFEST — PCSL v0.9 (2026-10-01, FLAW-FIXED + SCOPED)

## THE CHECKPOINT
Name: `PCSL-v0.9-20261001-flaw-fixed-scoped` (hyphens only, no spaces).
Date: 2026-10-01. Source HEAD at seal: see `git log` (post flaw-fix commit).

## THE DIST
`dist/plutus-lsp.js` sha256 **6332e68445636f5f** — checkpoint copy SHA == project SHA (verified).

## THE STATE (what is validated)
- THE BATTERY: `bun test ./tests/` -> **52 pass / 0 fail / 171 expects** (the authored 3-file
  suite; `bunfig.toml` ignores Checkpoints/** + Ship_Packages/**).
- THE DERAILMENT SUITE: **6/6 PASS** (live judge). Artifact `.omp/derailment-suite-results.json`.
- THE SCOPE GATE: **7/7** (`/tmp/scope-probe.ts`) — Plutus trees IN (564/559 laws), foreign trees OUT.
- THE PULL PATH: `{"id":2,"result":{"kind":"full"}}`, no -32601 (`/tmp/pull-probe.ts`).
- THE F-1 PROOF: the dashboard file resolves **564 laws** (was 0).
- THE PROXY: active; :4097/:4098/:8090 OPEN.

## WHAT CHANGED FROM v0.8
- F-1 law-bearing resolution (`lawCount>0`: local -> cache -> ancestor climb -> known paths).
- F-2 the `textDocument/diagnostic` pull handler (same analyze path, async) + the capability
  re-advertised (now true).
- F-3 ranged edits APPLIED (never a stale buffer); F-6 didSave schedules analyze; F-7 config
  logged; F-12 `$/cancelRequest` answered.
- F-10 the dead tier token RETIRED (6-token set; pins updated).
- THE SCOPE GATE (`isPlutusScoped`): a path SEGMENT literally `PLUTUS` or an explicit
  `plutus.yaml`/`.plutus` FILE below $HOME. Out-of-scope = SILENT (no card, no receipt noise).
  Two loose cuts caught by the probe (child-existence + the stale `~/.plutus/` dir) and fixed.
- A37/A38/A39 pins. The flaw report itself is carried (`reports/PCSL_FLAW_REPORT_2026-10-01.md`).

## THE CONTENTS
- `src/ scripts/ tests/`: 9 .ts files (source + battery + the derailment suite).
- `dist/`: the bundle (SHA above).
- `context_management/`: 11 canon docs.
- `ship_docs/`: 6 ship docs (F-10/F-11 + EN-15 + §11 + the r19 wiring).
- `reports/`: calibration, CT plans/results, the engineering report v1, the FLAW REPORT,
  META_OBSERVATIONS, SUGGESTED_IMPROVEMENTS, GUARDRAIL_SPEC, the golden-reasoning report.
- `.omp/`: the container pressure + derailment results. `artifacts/sg-ocr-round19.json`.
- `packages/`, `forensic/`, lsp.json, configs, README, the planning suite.
- Verify: `sha256sum -c SHA256SUMS`. Secret pre-scan: clean.

## THE HONEST GAPS
- THE AUDIT GATE: r19 FAIL (0 critical, 5 high) + the flaw report's F-5 (silent lexical degrade,
  queued) + F-9 (receipt rotation, queued) — NO SHIP-READY CLAIM.
- The live-TUI render proof is PENDING (needs a session restart).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The enforcement extension is PARKED (v2; the LSP informs only).
- The seal: NO LOCK (Mode B — a mutable working snapshot).
