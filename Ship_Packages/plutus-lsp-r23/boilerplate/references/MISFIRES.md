# MISFIRES — the observed defects in the PLUTUS-COMMON-SENSE-LSP (fix in your port)

Source: `forensic/lsp-receipts.log` @ 2026-10-01. The kernel works, but it over-fires. Each entry:
the misfire · the evidence · the root cause (traced to code) · the fix.

## M1 — FIRES ON MARKDOWN FILES (the biggest noise source)
- **The misfire:** every `.md` write in a non-graph-root tree emits a `PLUTUS_NO_STORE` warning.
- **The evidence:** 32 of 49 REFUSE rows are `.md` files — `PLUTUS_VISION_COMPONENTS.md`,
  `Plutus_Vision_ShowMe.md`, `THEATRICALITY_LOG.md`, `CHECKPOINT_MANIFEST.md`.
- **The root cause:** the registration `lsp.json` has `fileTypes: [.ts, .tsx, .js, .md]`. The
  Plutus canon is a code corpus; markdown files almost never sit under a graph root, so the root
  resolution fails and the refusal fires. `scripts/plutus-lsp.ts` `analyze()` → `fileOf()` →
  `loadStore()` throws `PLUTUS_NO_STORE` → a STALE card → a visible diagnostic.
- **The fix:** drop `.md` from `fileTypes` (the reflex is for CODE, not docs), OR gate: probe the
  root marker FIRST and emit nothing when no marker exists.

## M2 — THE L2 PROBE IS DEAD WEIGHT (197 no-op rows)
- **The misfire:** the L2 socket probe fires on every analyze and returns `PLUTUS_NO_STORE` 197
  times — because the au-engine socket is keyed to a DIFFERENT root than the one being analyzed.
- **The evidence:** `grep -o "L2 PLUTUS_NO_STORE" | wc -l` → 197.
- **The root cause:** `scripts/plutus-lsp.ts:83` fires `readL2(l2SocketFor(store.root))`
  unconditionally after `loadStore` succeeds. But `loadStore` succeeded via the ENV override
  (`PLUTUS_L1_PATH`), while `l2SocketFor(store.root)` computes a socket for the analyzed file's
  root — a different tree → no socket → refusal.
- **The fix:** probe L2 only when the root's own socket exists; or skip L2 entirely when the L1
  resolved via the env override (the socket belongs to the root, not the override).

## M3 — REFUSALS ARE VISIBLE WARNINGS (should be silent when out of scope)
- **The misfire:** a file that is simply NOT in the canon shows a warning, implying the canon is
  broken.
- **The evidence:** `staleCard` sets `severity: SEVERITY.Warning` (`cards.ts:164`).
- **The root cause:** the refusal and the "canon genuinely unavailable" case are the SAME card.
  But "this file is not governed by any canon" (out-of-scope) and "the canon exists but is
  unreachable" (a real problem) are DIFFERENT states.
- **The fix:** when the root carries NO graph marker at all → emit NOTHING (out-of-scope). Only
  when a marker EXISTS but the store is missing → emit the Warning (a real defect).

## M4 — NOISE ON EVERY CHECKPOINT/MANIFEST WRITE
- **The misfire:** writing `CHECKPOINT_MANIFEST.md` or `THEATRICALITY_LOG.md` triggers a refusal.
- **The evidence:** REFUSE rows on both files (the checkpoint + ship-docs writes).
- **The root cause:** the same `.md` registration (M1).
- **The fix:** same as M1.

## M5 — THE RECEIPT GROWS UNBOUNDED
- **The misfire:** `forensic/lsp-receipts.log` appends on every FRAME/PUBLISH/RELEVANCE/L2/NO-LAW
  row with no rotation.
- **The root cause:** `receipt()` (buffered + flushed async) never rotates.
- **The fix:** rotate by size (e.g. 10MB) or age; or throttle FRAME rows (they are the highest
  volume and the least informative).

## M6 — `NO-LAW` IS CORRECT (no fix)
- **The observed:** 68 `NO-LAW` rows.
- **The verdict:** a fact-free file yields zero candidates — the INTENDED precision. The LSP stays
  silent (no card). This is the anti-phantom law working. No fix.

## The measured distribution + the noise ratio
```
124 PUBLISH · 49 REFUSE · 68 NO-LAW · 197 L2 · 39 RELEVANCE
noise (REFUSE + L2) / signal (PUBLISH) ≈ 246 / 124 ≈ 2.0
```
The `.md` registration (M1/M4) and the unconditional L2 probe (M2) account for ~97% of the noise.
Fixing M1 + M2 + M3 would take the ratio from 2.0 to near 0.

---

## THE 2026-10-01 FLAW-REPORT FIXES (an independent agent found these — carry them in your port)

An independent agent, searching for a DIFFERENT task, hit this LSP's noise and produced
`reports/PCSL_FLAW_REPORT_2026-10-01.md` (12 findings, 2 CRITICAL). All are now fixed in the
source AND in this boilerplate's machinery. The two that matter most for a port:

### F-1 (was CRITICAL) — THE LAWLESS-GRAPH SILENCE
- **The misfire:** the resolver returned the NEAREST `kg.json` whatever it contained. A file under
  `PLUTUS/LIVE/dashboard` resolved a graph of 1,785 SYMBOL/FILE entities and **ZERO laws** →
  `lawsForHunk` returned `[]` → the pipeline was a **silent no-op** — while the LAW-BEARING graphs
  (MASTER_CONTEXT 559 laws, the agent tree 564) sat one level up.
- **The fix (IN the boilerplate):** `lawCount(p)` + a law-bearing resolution order in `l1PathFor`:
  local IF law-bearing → the cached path IF still valid AND law-bearing → the NEAREST ANCESTOR
  whose kg.json carries laws → the KNOWN law-bearing paths → else the local path (lawless → SILENT).
- **The lesson:** a graph with nodes and no EDGES/LAWS is a list, not a canon. Resolution must be
  by CONTENT (laws present), never by proximity of the file.

### F-2 (was CRITICAL) — THE CAPABILITY LIE
- **The misfire:** `initialize` advertised `diagnosticProvider` (pull) while no
  `textDocument/diagnostic` handler existed → `-32601 MethodNotFound` on every pull.
- **The fix:** the pull handler is IMPLEMENTED (it runs the same analyze path and answers with
  the same cards the push path emits).

### THE SCOPE GATE (the operator's law: "only fires when the session is actively focused on <project>")
- **The misfire:** a GLOBAL registration (generic `rootMarkers`: `tsconfig.json`,
  `.omp/graph-intelligence`) fired the reflex in EVERY node project — "blind firing on literally
  everything like uncalibrated slop."
- **The fix:** `isPlutusScoped(file)` (CONFIGURABLE: `PLUTUS_LSP_SCOPE` / `PLUTUS_LSP_SCOPE_FILES`) — a decisive test that runs FIRST in the pipeline. A file is
  in scope iff a path SEGMENT is literally `PLUTUS` (or the port's project name), OR an ancestor
  carries an explicit `plutus.yaml`/`.plutus` FILE **below $HOME**. Out-of-scope → **SILENT**
  (no card, no receipt noise).
- **TWO LOOSE CUTS CAUGHT BY THE PROBE (do not repeat):** (1) `existsSync(join(dir,"PLUTUS"))`
  fires for any ancestor merely HAVING a PLUTUS CHILD — `Shared_Workspace/PLUTUS` exists, so every
  repo under `Shared_Workspace` matched; (2) a stale `~/.plutus/` DIRECTORY scoped the entire home.
  The test must be the SEGMENT (basename), never the CHILD, and marker FILES must be `isFile()`
  checked below $HOME.
- **The lesson:** a scope test on child-existence is a scope test on the PARENT.

### F-5 — THE DEAD-LOCAL DEGRADE (a self-inflicted bug worth naming)
- **The misfire:** the first F-5 fix built a `staleCard` into a local variable and **never
  surfaced it** — the "judge degraded" warning stayed silent (the dead-local class: code that
  looks like it does something and is garbage-collected).
- **The fix:** the card is carried out of the pipeline and `unshift`ed to the published cards.

### F-4 — THE TEST ISOLATION (the bun filter trap)
- **The misfire:** `package.json` said `bun test tests/` — WITHOUT `./`, bun treats the arg as a
  **FILTER**, not a path: it globbed 284 tests across 30 files (including the copied Checkpoints +
  Ship_Packages suites) instead of the authored 46.
- **The fix:** `bun test ./tests/` + `bunfig.toml` `pathIgnorePatterns` covering
  `Checkpoints/**`, `Ship_Packages/**`, `node_modules/**`, `dist/**`.

### THE r19 AUDIT HIGHS (fixed in this boilerplate's machinery)
- H1 path confinement: `resolve()` is cwd-dependent + never follows symlinks → now requires an
  ABSOLUTE path and applies `realpathSync` before the denylist/allowlist checks.
- H2 in-flight chains: rapid typing stacked 6-20s judge chains → single-flight per uri
  (`inFlight` Set + `finally` release; the trailing edit re-schedules).
- H3 `head4` FIFO hang → `O_RDONLY | O_NONBLOCK` (the same discipline `loadStore` got).
- H4 `cap()` could throw via a hostile `toString()` → the string conversion is guarded.
- H5 attribution decoupling: the `attributed` flag came from the top-of-list while the PICKED law
  could be a weaker fallback → the flag is now COUPLED to the pick (`picked === top`).
