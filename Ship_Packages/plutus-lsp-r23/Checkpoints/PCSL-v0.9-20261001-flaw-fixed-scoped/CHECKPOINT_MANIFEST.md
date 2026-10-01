# CHECKPOINT MANIFEST — PCSL v0.9 (2026-10-01, FLAW-FIXED + SCOPED + r20)

## THE CHECKPOINT
Name: `PCSL-v0.9-20261001-flaw-fixed-scoped` (hyphens only, no spaces).
Date: 2026-10-01. Source HEAD at seal: `5f24e81`.

## THE DIST
`dist/plutus-lsp.js` sha256 **a1b73cf11e88dac2** — checkpoint copy SHA == project SHA (verified).

## THE STATE (what is validated)
- THE BATTERY: `bun test ./tests/` -> **52 pass / 0 fail / 173 expects**.
- THE DERAILMENT SUITE: **6/6 PASS — now HERMETIC** (the suite carries its own mini-Plutus graph;
  no host-canon dependency). Artifact `.omp/derailment-suite-results.json`.
- THE SCOPE GATE: **7/7** — Plutus trees IN (564/559 laws), foreign trees OUT (silent).
- THE F-5 PROOF: judge down -> a visible `plutus/stale` card ("JUDGE_DEGRADED") surfaces FIRST.
- THE F-1 PROOF: the dashboard file resolves **564 laws** (was 0 — the silent no-op).
- THE F-2 PROOF: the pull answers `{"id":2,"result":{"kind":"full"}}`, no `-32601`.
- THE BOILERPLATE: the fixed machinery synced + builds clean (4/4 modules).

## WHAT CHANGED FROM v0.8 (the flaw report + two audit rounds)
- **THE FLAW REPORT FIXES (12 findings, an independent agent found them):** F-1 law-bearing graph
  resolution; F-2 the pull handler IMPLEMENTED; F-3 ranged edits applied; F-4 the test script +
  bunfig ignores; F-5 the degraded card SURFACED (a dead-local repaired); F-6 didSave; F-7 config
  logged; F-8 silent out-of-scope; F-9 receipt rotation (TRUNCATING, fixed twice); F-10 the dead
  token retired (6 tokens); F-11 documented; F-12 `$/cancelRequest`.
- **THE SCOPE GATE** (`isPlutusScoped`): a path SEGMENT literally `PLUTUS`, or an explicit
  `plutus.yaml`/`.plutus` FILE (`isFile()`) BELOW `$HOME`. Out-of-scope = SILENT. TWO loose cuts
  caught by the probe and fixed (child-existence; the stale `~/.plutus/` dir).
- **THE r19 HIGHS:** H1 absolute+realpath; H2 single-flight; H3 `head4` O_NONBLOCK; H4 `cap()`
  guarded; H5 attribution coupled to the pick.
- **THE r20 SWEEP (7 highs + 13 mediums):** the receipt rotation TRUNCATES (was growing); the
  CHECKED path is returned (was raw `np`); the dirty-rerun single-flight (trailing edits re-run);
  `applyRange` validates offsets; the known-paths opt-in gate; the CACHED `lawCount`; JUDGE_DOWN
  decoupled from `kept`; the card-cap disclosed; the vector iteration bounded; error codes not
  messages; the symlink-safe scope walk; the stopword-filtered name parts; A23 corrected.

## THE CONTENTS
- `src/ scripts/ tests/`: 9 .ts files. `dist/`: the bundle (SHA above).
- `context_management/`: 11 canon docs. `ship_docs/`: 6 ship docs.
- `reports/`: calibration, CT results, the engineering report, the FLAW REPORT, the meta-patterns
  trio, the golden-reasoning report.
- `.omp/`: container + derailment results. `artifacts/`: the r19 FAIL + the r21 BLOCKED JSONs.
- Verify: `sha256sum -c SHA256SUMS`. Secret pre-scan: clean.

## THE HONEST GAPS
- **THE AUDIT GATE: r21 BLOCKED (provider-unavailable: Go 403, zen-free 429).** The r20 fixes are
  un-audited by the independent reader — proven by the battery + the derailment suite + the probes
  only. NO SHIP-READY CLAIM. Retry: when the Go subscription is active or the free lane resets.
- The live-TUI render proof is PENDING (needs a session restart).
- The calibration corpus is 8 items. The enforcement extension is PARKED (v2).
- The seal: NO LOCK (Mode B — a mutable working snapshot).
