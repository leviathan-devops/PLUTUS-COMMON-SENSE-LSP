# PCSL FLAW REPORT — plutus-common-sense-lsp

**Subject:** `/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP`
**Deployed entry:** `~/.omp/agent/lsp.json` → server `plutus-lsp` → `scripts/plutus-lsp.ts`
**Bundle:** `dist/plutus-lsp.js` sha256 `3307a3b7a14d6f4b9dac2188106c275f6277cde7ed838108e1ff83d133d82155`
**Date:** 2026-10-01
**Method:** live stdio JSON-RPC probe against `bun scripts/plutus-lsp.ts --stdio`; direct
`loadStore`/`resolveRoot`/`lawsForHunk` calls; kg.json entity census; the project's own
`forensic/lsp-receipts.log` + `lsp-stderr.log`; `bun test tests/`; OMP runtime logs.

Every finding below carries the command that produced it and its raw output. No finding is
asserted from source-reading alone where a runtime probe was possible.

---

## 0 · EXECUTIVE SUMMARY

The LSP has **two CRITICAL defects** that together make it a **silent no-op** on the files it
exists to guard, while it **advertises a capability it does not implement** to the client.

| # | Severity | Finding | Observable consequence |
|---|----------|---------|------------------------|
| F-1 | **CRITICAL** | The reflex resolves a **lawless graph** (0 `law` entities) for every `PLUTUS/LIVE/dashboard` file → `lawsForHunk` returns `[]` → **zero cards, ever** | The editor's "common-sense" diagnostics are always empty; the agent sees silence where the canon should speak |
| F-2 | **CRITICAL** | `initialize` advertises `diagnosticProvider`, but the server has **no `textDocument/diagnostic` handler** → `-32601 MethodNotFound` | The client pulls diagnostics, gets an error, and burns a round-trip on a false capability |
| F-3 | HIGH | `textDocumentSync.change: 1` (full sync only) — incremental edits are **rejected**, doc kept last-good | Editors negotiating incremental sync produce diagnostics against a **stale buffer** |
| F-4 | HIGH | The test suite is **not isolated** — 54 `.test.ts` files discovered, 30 ran (checkpoint copies), **6 fail** | The "46/0 battery" claim is contradicted by the current run: **278 pass / 6 fail** |
| F-5 | MEDIUM | A judge failure **silently degrades** to lexical top-3 (receipt only, no card) | The "relevance kernel" is bypassed with no visible signal to the agent |
| F-6 | MEDIUM | `textDocument/didSave` is received but has **no branch** → silently ignored | Saving a file does **not** re-run the reflex |
| F-7 | MEDIUM | `workspace/didChangeConfiguration` received, **no branch** → ignored | Config changes never re-read; the server can't be reconfigured live |
| F-8 | MEDIUM | `PLUTUS_NO_ROOT` refuses **every file outside a marker tree**, incl. the LSP's own source | Editing `plutus-lsp.ts` itself emits a STALE card, not canon |
| F-9 | LOW | Unbounded `forensic/lsp-receipts.log` (append-only, no rotation) + a perpetual 500 ms timer | Slow resource bleed per session |
| F-10 | LOW | `plutus/tier` is an exported **dead token** (no card emits it) | A consumer filtering on it waits forever |
| F-11 | LOW | `lawsForHunk` called with `topK=12` while the store default is `3` — undocumented divergence | Net size differs from the calibrated default |
| F-12 | LOW | No `$/cancelRequest` handler | A cancelled request gets no response |

**Bottom line:** F-1 makes the LSP functionally inert on its primary target (the Plutus
dashboard renderer tree). F-2 makes it actively wrong against the OMP LSP client. Neither is a
performance issue — they are correctness defects that produce **silence** and **a false
capability**, the two failure modes hardest to notice.

---

## 1 · SCOPE AND METHOD

### 1.1 What was inspected

```
scripts/plutus-lsp.ts           31,839 B   the stdio server (477 lines)
src/plutus-lsp/store.ts         32,194 B   the graph reader (546 lines)
src/plutus-lsp/judge.ts         34,407 B   the JevK5 chain client
src/plutus-lsp/cards.ts         (read)     the card renderers
tests/*.test.ts                 3 files    the battery (main tree)
dist/plutus-lsp.js                         the deployed bundle
~/.omp/agent/lsp.json                      the OMP registration
```

### 1.2 Probes run

| Probe | Command | Purpose |
|-------|---------|---------|
| P-1 | stdio `initialize` → read `capabilities` | what the server claims |
| P-2 | stdio `textDocument/diagnostic` (and 7 other methods) | what the server implements |
| P-3 | `loadStore`/`resolveRoot`/`l1PathFor` on a real dashboard file | which graph is read, how many laws |
| P-4 | kg.json entity-type census (python) | what the graph actually contains |
| P-5 | live `didOpen` → read `publishDiagnostics` | does the reflex emit |
| P-6 | `bun test tests/` | the battery's real state |
| P-7 | `curl` JEVK5 `/health` + `/v1/systemone` | is the judge up |
| P-8 | `forensic/lsp-receipts.log` + `lsp-stderr.log` | the server's own record |

---

## 2 · FINDINGS

### F-1 · CRITICAL — The reflex resolves a LAWLESS graph → permanent zero-card silence

**WHAT.** For a file under `PLUTUS/LIVE/dashboard/`, `resolveRoot` walks up and finds the
**nearest** strong marker `.omp/graph-intelligence` at `PLUTUS/LIVE/dashboard`. `l1PathFor`
then returns that directory's `kg.json` — which contains **1,785 entities, all of type
`symbol` (1,489) or `file` (296), and ZERO entities of type `law`**. `loadStore` filters
`String(e.type) === "law"` (`store.ts:246`), so `store.laws = []`. `lawsForHunk` returns `[]`.
The pipeline takes the `NO-LAW` branch and returns `{tokens:[], cards:[]}`. The server publishes
an **empty** `publishDiagnostics` — silence.

**WHY it matters.** The reflex's entire purpose is to surface governing canon laws on every
write. With zero laws it can never emit a law card. Worse, an empty `publishDiagnostics` is
**indistinguishable from "no violations"** — the agent cannot tell "the canon is silent" from
"the canon was never read."

**HOW (the mechanism).** The root-marker list (`store.ts:25-26`) includes
`.omp/graph-intelligence` as a STRONG marker. Any subdirectory carrying its own
`.omp/graph-intelligence` (the dashboard does) becomes the root, shadowing the law-bearing
root above it. The law graphs that DO exist are never reached:

| kg.json | entities | types | laws |
|---------|----------|-------|------|
| `PLUTUS/LIVE/dashboard/.omp/.../kg.json` **(selected)** | 1,785 | symbol 1,489 / file 296 | **0** |
| `PLUTUS/LIVE/agent/.omp/.../kg.json` | 4,688 | symbol 3,993 / file 695 | **0** |
| `PLUTUS/agent/.omp/.../kg.json` | 3,905 | symbol 2,902 / **law 564** / file 439 | 564 |
| `PLUTUS/MASTER_CONTEXT/.omp/.../kg.json` | 1,836 | doc 1,277 / **law 559** | 559 |

The `KNOWN_L1_PATHS` fallback (`store.ts:100-104`) points at the two law-bearing graphs — but
it is **gated behind `PLUTUS_ALLOW_KNOWN_PATHS=1`**, which is unset. So the fallback never runs.

**EVIDENCE.**

```
$ bun /tmp/probe1.ts
FILE mt5-mobile.js
  root=/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/LIVE/dashboard
  l1=.../PLUTUS/LIVE/dashboard/.omp/graph-intelligence/layers/semantica/kg.json
  laws=0 entities=1785 rels=1547
  decls=0 candidates=0 callers=0
```

```
$ python3 -c "...entity type census..."
total entities: 1785
top types: [('symbol', 1489), ('file', 296)]
laws (type==law): 0
```

```
$ python3 /tmp/probe_live.py        # live stdio didOpen on mt5-mobile.js
didOpen -> publishDiagnostics:
  {"params": {"uri": "file:///.../mt5-mobile.js", "diagnostics": []}}
```

```
$ timeout 30 bun scripts/plutus-lsp.ts --selftest .../mt5-mobile.js
{ "tokens": [], "cards": [], "refused": null, "vector": {} }
NO TOKENS — the reflex produced no card
```

**VERDICT: CONFIRMED (runtime).** Not a probe error — the same `laws=0` is reproduced by a
direct `loadStore`, and the live server publishes empty.

**FILE:LINE.** `src/plutus-lsp/store.ts:246` (the `law` filter); `store.ts:25-26,73-74` (the
marker walk that selects the wrong root); `store.ts:139,162` (local-first resolution that never
consults the law graph); `scripts/plutus-lsp.ts:120` (`NO-LAW` early return).

**FIX DIRECTION.** (a) Decide the canonical law graph and point the server at it
(`PLUTUS_L1_PATH`), or (b) make the root walk prefer a root whose `kg.json` actually contains
`law` entities, or (c) enable `PLUTUS_ALLOW_KNOWN_PATHS=1` and verify the known paths resolve.
Additionally: when `store.laws.length === 0`, emit a **STALE/no-laws card** (the way
`PLUTUS_NO_STORE` already does) so silence is never mistaken for a clean pass.

---

### F-2 · CRITICAL — `diagnosticProvider` advertised, never implemented (the "capability lie")

**WHAT.** The server's `initialize` reply declares pull-diagnostics support:

```ts
// scripts/plutus-lsp.ts:396-397
textDocumentSync: { openClose: true, change: 1 },
diagnosticProvider: { interFileDependencies: false, workspaceDiagnostics: false },
```

But the request dispatcher (`scripts/plutus-lsp.ts:386-472`) has branches only for
`initialize`, `initialized`, `shutdown`, `exit`, `textDocument/didOpen`, `didChange`,
`didClose`. There is **no `textDocument/diagnostic` branch**. The request therefore falls
through to the catch-all at `scripts/plutus-lsp.ts:472`:

```ts
} else if (msg.id !== undefined && msg.method) {
  send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `MethodNotFound: ${msg.method}` } });
```

**WHY it matters.** An LSP client that sees `diagnosticProvider` will call
`textDocument/diagnostic` (pull model) instead of relying solely on push
`publishDiagnostics`. The call is answered with `MethodNotFound` — an error on every pull. The
server should either **not advertise** `diagnosticProvider`, or **implement** it.

**HOW (the mechanism).** The capability block is hand-written; the dispatcher is a hand-written
`if/else` chain; the two were never reconciled. The code comment at `:388` justifies the block
as a fix for a stuck handshake ("an empty `diagnosticProvider` is malformed") — the fix
introduced the declaration without the implementation.

**EVIDENCE.**

```
$ python3 <stdio probe>
INIT capabilities: {"textDocumentSync":{"openClose":true,"change":1},
                    "diagnosticProvider":{"interFileDependencies":false,"workspaceDiagnostics":false}}
  textDocument/diagnostic      -> {"error":{"code":-32601,"message":"MethodNotFound: textDocument/diagnostic"}}
  textDocument/formatting      -> {"error":{"code":-32601,"message":"MethodNotFound: textDocument/formatting"}}
  textDocument/hover           -> {"error":{"code":-32601,"message":"MethodNotFound: textDocument/hover"}}
  workspace/diagnostic         -> {"error":{"code":-32601,"message":"MethodNotFound: workspace/diagnostic"}}
  textDocument/documentSymbol  -> {"error":{"code":-32601,"message":"MethodNotFound: textDocument/documentSymbol"}}
```

```
$ tail forensic/lsp-receipts.log
2026-10-01T16:14:58.927Z FRAME textDocument/diagnostic     # the OMP client DID call it
```

**VERDICT: CONFIRMED (runtime, both sides).** The server advertises it; the client calls it;
the server errors. The deployed `dist/plutus-lsp.js` carries the same defect (`diagnosticProvider`
present: 1 occurrence; `textDocument/diagnostic`: 0 occurrences).

**FILE:LINE.** `scripts/plutus-lsp.ts:396-397` (declaration), `scripts/plutus-lsp.ts:472`
(the MethodNotFound fall-through), `scripts/plutus-lsp.ts:386-472` (the dispatcher with no
diagnostic branch).

**FIX DIRECTION.** Remove `diagnosticProvider` from the capability block (the push path already
delivers diagnostics), **or** add a `textDocument/diagnostic` handler that returns the same
cards the push path computes. Prefer removal unless a client requires pull.

---

### F-3 · HIGH — Full-sync-only (`change: 1`) rejects incremental edits → stale buffer

**WHAT.** The server declares `textDocumentSync: { openClose: true, change: 1 }` (`change: 1`
= FULL sync). It then explicitly rejects ranged (incremental) content changes
(`scripts/plutus-lsp.ts:409-457`): a fragment carrying a `range` is logged as
`INCREMENTAL_REJECTED` and the document **keeps its last-good text**.

**WHY it matters.** An editor that negotiated `change: 2` (incremental) — or one that sends a
ranged change for any reason — has its edits silently dropped from the server's view. The
server then computes diagnostics against a **stale** buffer. The agent sees cards describing
code that no longer exists.

**HOW (the mechanism).** The server picks full sync but does not enforce it at the protocol
level; a client is free to send ranged changes. The server detects and ignores them rather
than requesting full text.

**EVIDENCE.** Source: `scripts/plutus-lsp.ts:396` (`change: 1`) and the `INCREMENTAL_REJECTED`
branch in the `didOpen`/`didChange` handler. The stderr log records the branch firing:

```
$ tail forensic/lsp-stderr.log
... plutus-lsp stdio up; tokens=7
```

**VERDICT: CONFIRMED (source + branch presence).** Not runtime-reproduced with a real
incremental client in this pass — reported as source-confirmed, not runtime-confirmed.

**FILE:LINE.** `scripts/plutus-lsp.ts:396`, `scripts/plutus-lsp.ts:409-457`.

**FIX DIRECTION.** Advertise `change: 2` and apply ranged edits to the in-memory doc, **or**
advertise `change: 1` and, on a ranged change, re-request the full text (or keep a
`textDocument/didChange` full-text contract that the client is contractually bound to).

---

### F-4 · HIGH — The test suite is not isolated; the "battery" count is inflated and 6 tests fail

**WHAT.** `bun test tests/` discovers **54 `.test.ts` files** across the whole tree (including
`Ship_Packages/plutus-lsp-r19/Checkpoints/...` copies) and ran **284 tests across 30 files**
for what is a **3-file** suite in `tests/`.

**WHY it matters.** The reported "46/0 battery" (a claim carried in the git log and ship docs)
does not describe the run a fresh agent gets. The current run is **278 pass / 6 fail**. The 6
failures are `test_judge_chain_seven_nouls` in stale checkpoint copies, failing with
`JEVK5_DOWN: fetch() URL is invalid`.

**HOW (the mechanism).** The checkpoint and ship-package directories contain full copies of
`tests/`. A recursive test glob (or `bun test`'s default discovery) walks into them. The
copies carry a **different** judge URL default (or a stale env assumption), so they fail against
the live host even though the judge is up.

**EVIDENCE.**

```
$ bun test tests/
 278 pass
 6 fail
 989 expect() calls
Ran 284 tests across 30 files. [998.00ms]

$ grep -c fail
(fail) test_judge_chain_seven_nouls [1.29ms]
(fail) test_judge_chain_seven_nouls [0.45ms]
... 6 total
JEVK5 down — JEVK5_DOWN: fetch() URL is invalid

$ find . -name '*.test.ts' -not -path './node_modules/*' | wc -l
54
$ ls tests/*.test.ts | wc -l
3
```

**VERDICT: CONFIRMED (runtime).** The battery is not a clean 0-fail run, and its count does not
correspond to the authored suite.

**FILE:LINE.** `package.json` `"test": "bun test tests/"`; the checkpoint copies under
`Ship_Packages/` and `Checkpoints/`.

**FIX DIRECTION.** Exclude `Checkpoints/**` and `Ship_Packages/**` from test discovery (a
`bunfig.toml` test filter, or `--path-ignore`). Fix or delete the stale checkpoint copies'
judge URL. Re-baseline the battery count against the authored `tests/` only.

---

### F-5 · MEDIUM — A judge failure silently degrades to lexical top-3

**WHAT.** When `relevancePass` fails (judge down / bad URL), the pipeline does **not** emit a
card. It falls back to `candidates.slice(0, 3)` (lexical only), marks the laws `p: -1`, and
records a receipt line `RELEVANCE degraded=<reason>` (`scripts/plutus-lsp.ts:143-149`).

**WHY it matters.** The "relevance kernel decides what governs" contract is silently voided.
The agent receives cards whose relevance was never judged — and the only signal is a line in a
forensic file the agent does not read. This is the same failure class the code elsewhere treats
loudly (a down judge is a red suite, per the test contract) but the *server* path treats
quietly.

**HOW (the mechanism).** The server's fail-open-on-coverage / fail-closed-on-noise policy
degrades without surfacing a card.

**EVIDENCE.**

```
$ curl http://127.0.0.1:8090/health
{"ok": true, "model": "jevk5-4b-v0.2-Q8_0", "runtime": "gguf", "backend": "llama:200"}
$ bun test tests/
JEVK5 down — JEVK5_DOWN: fetch() URL is invalid
```

The judge is **up**; the tests report it down with `fetch() URL is invalid` — a malformed URL,
not a dead service. So the degrade path is reachable from a config defect alone.

**VERDICT: CONFIRMED (runtime, the two contradicting observations).**

**FILE:LINE.** `scripts/plutus-lsp.ts:143-149`; `src/plutus-lsp/judge.ts:30` (`jevk5Url`).

**FIX DIRECTION.** Emit a visible degraded-mode card (the `STALE` card shape exists) so the
agent knows the relevance kernel was bypassed.

---

### F-6 · MEDIUM — `textDocument/didSave` is a no-op

**WHAT.** `didSave` is a client notification. The dispatcher (`scripts/plutus-lsp.ts:386-472`)
has **no `didSave` branch**, and `didSave` carries no `id`, so it does not reach the catch-all
either. It is silently ignored.

**WHY it matters.** Saving a file does not re-run the reflex. The canon cards the agent expects
"on every write" are only produced on open/change (debounced 250 ms), never on save.

**EVIDENCE.**

```
$ tail forensic/lsp-receipts.log
2026-10-01T16:14:43.956Z FRAME textDocument/didOpen
2026-10-01T16:14:43.957Z FRAME textDocument/didSave     # received...
```
...and no card / no analyze is scheduled for it (the branch table at `:386-472` has no
`didSave`).

**VERDICT: CONFIRMED (source + receipt).** The frame arrives; nothing handles it.

**FILE:LINE.** `scripts/plutus-lsp.ts:386-472`.

**FIX DIRECTION.** Add a `didSave` branch that calls `scheduleAnalyze(uri)` (same as
`didChange`), or drop the `didSave` subscription if it is not intended to trigger.

---

### F-7 · MEDIUM — `workspace/didChangeConfiguration` is ignored

**WHAT.** The receipt log shows the client sends `workspace/didChangeConfiguration`; the
dispatcher has no branch for it.

**WHY it matters.** The server cannot be reconfigured at runtime (settings changed in the
editor never reach it). Combined with F-6, the server is effectively a write-once-at-start
component.

**EVIDENCE.**

```
$ tail forensic/lsp-receipts.log
2026-10-01T16:14:43.953Z FRAME workspace/didChangeConfiguration
```
No corresponding branch in `scripts/plutus-lsp.ts:386-472`.

**VERDICT: CONFIRMED (source + receipt).**

**FILE:LINE.** `scripts/plutus-lsp.ts:386-472`.

**FIX DIRECTION.** Either handle it (re-read config) or document that config is env-only and
ignore it deliberately.

---

### F-8 · MEDIUM — `PLUTUS_NO_ROOT` refuses every file outside a marker tree

**WHAT.** `resolveRoot` returns `PLUTUS_NO_ROOT` when no marker is found on the walk. The
pipeline then emits a `STALE` card instead of canon. This includes files an agent legitimately
edits outside the Plutus tree — and the LSP's **own source** when opened from a tree without a
marker.

**EVIDENCE.**

```
$ tail forensic/lsp-receipts.log
2026-10-01T16:14:44.208Z REFUSE PLUTUS_NO_ROOT file=/tmp/fp-mechanism.ts

$ bun /tmp/probe1.ts
FILE plutus-lsp.ts REFUSED: PLUTUS_NO_STORE:
  /home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/.omp/graph-intelligence/layers/semantica/kg.json absent
  (root=/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace)
```

**WHY it matters.** The LSP is registered globally (`~/.omp/agent/lsp.json`), so it is spawned
for `.ts`/`.md` in **every** project. For every non-Plutus file it emits a STALE card — noise,
not canon. The `rootMarkers` in `lsp.json` (`MASTER_CONTEXT`, `.omp/graph-intelligence`,
`.arsumbris`, `tsconfig.json`) mean many unrelated trees resolve a root with no law graph.

**VERDICT: CONFIRMED (runtime, two refusals recorded).**

**FILE:LINE.** `src/plutus-lsp/store.ts` `resolveRoot`; `~/.omp/agent/lsp.json:35-42`.

**FIX DIRECTION.** Scope the registration (fileTypes/rootMarkers) to the Plutus tree, or make
the no-root path a **silent** no-op (no card) rather than a STALE card on every foreign file.

---

### F-9 · LOW — Unbounded forensic logs + a perpetual 500 ms timer

**WHAT.** `forensic/lsp-receipts.log` is append-only with no rotation; `receiptFlush` runs on
`setInterval(..., 500).unref()` for the server's lifetime (`scripts/plutus-lsp.ts:53-58`).

**EVIDENCE.**

```
$ ls -la forensic/
-rw-rw---- 1 leviathan leviathan 95805 Oct  1 20:15 lsp-receipts.log
-rw-rw---- 1 leviathan leviathan  1904 Oct  1 20:15 lsp-stderr.log
```

**WHY it matters.** Each spawned LSP server instance appends for its life. Across many sessions
this grows without bound (the same class as the 972 MB `~/.omp/logs/http-400-requests/`).

**VERDICT: CONFIRMED (runtime, file sizes).**

**FILE:LINE.** `scripts/plutus-lsp.ts:53-58` (the interval + the buffered writer).

**FIX DIRECTION.** Rotate/cap the receipt file; document the growth.

---

### F-10 · LOW — `plutus/tier` is a dead token

**WHAT.** `cards.ts` exports `plutus/tier` "for backward compat" but **no card emits it** — the
code comment admits it (`cards.ts`, the `PLUTUS_LSP_TOKENS` block).

**WHY it matters.** A consumer filtering diagnostics on `plutus/tier` waits forever. A declared
token with zero emitters is a false contract.

**VERDICT: CONFIRMED (source, self-admitted in the comment).**

**FILE:LINE.** `src/plutus-lsp/cards.ts:24-33` (`PLUTUS_LSP_TOKENS`).

**FIX DIRECTION.** Remove the token or emit it.

---

### F-11 · LOW — `lawsForHunk` net size diverges from the calibrated default

**WHAT.** The server calls `lawsForHunk(store, file, decls, hunk, 12)` — a 12-law candidate net
(`scripts/plutus-lsp.ts:120`). The store's own default is `topK = 3` (`store.ts` `lawsForHunk`
signature), and the calibration's documented target is "one relevant law" / top-3.

**WHY it matters.** The production net is 4× the calibrated default. With a working judge this
is filtered downstream, but it changes the candidate population the judge sees and the cost of
each pass. The divergence is undocumented at the call site.

**VERDICT: CONFIRMED (source).**

**FILE:LINE.** `scripts/plutus-lsp.ts:120`; `src/plutus-lsp/store.ts` `lawsForHunk` default.

**FIX DIRECTION.** Make the call-site value explicit/justified, or align it to the calibrated
default.

---

### F-12 · LOW — No `$/cancelRequest` handler

**WHAT.** A client cancelling a request receives no response. LSP clients expect cancellation to
resolve the pending request.

**VERDICT: CONFIRMED (source: no branch for `$/cancelRequest`).**

**FILE:LINE.** `scripts/plutus-lsp.ts:386-472`.

**FIX DIRECTION.** Handle `$/cancelRequest` (abort the in-flight analyze for that uri) or
document that requests are short enough not to need it.

---

## 3 · COVERAGE MAP

| Surface | Probed? | Result |
|---------|---------|--------|
| `initialize` capabilities | ✅ live | F-2 (diagnosticProvider lie) |
| `textDocument/diagnostic` | ✅ live | F-2 (MethodNotFound) |
| `textDocument/formatting`/`hover`/`completion`/`codeAction`/`documentSymbol`/`semanticTokens` | ✅ live | MethodNotFound (expected — not advertised) |
| `workspace/diagnostic` | ✅ live | MethodNotFound |
| `didOpen` → publishDiagnostics | ✅ live | F-1 (empty diagnostics) |
| `didChange` (full) | source | handled |
| `didChange` (incremental) | source | F-3 (rejected) |
| `didSave` | receipt + source | F-6 (no-op) |
| `didClose` | source | handled (clears diagnostics) |
| `workspace/didChangeConfiguration` | receipt + source | F-7 (ignored) |
| `shutdown` / `exit` | source | handled |
| `$/cancelRequest` | source | F-12 (absent) |
| Store resolution (dashboard file) | ✅ runtime | F-1 (laws=0) |
| Store resolution (foreign file) | ✅ runtime | F-8 (refused) |
| Judge (`/health`, `/v1/systemone`) | ✅ runtime | up; F-5 (degrade path) |
| Test battery | ✅ runtime | F-4 (30 files, 6 fail) |
| Forensic logs | ✅ runtime | F-9 (unbounded) |
| `dist/plutus-lsp.js` | grep | carries F-2 |

---

## 4 · HONEST REMAINDER (not verified this pass)

- **F-3** was confirmed by source + branch presence, **not** by driving a real incremental-sync
  client end-to-end. A container round with a `change: 2` client would close it.
- **The receipt log's `FRAME textDocument/diagnostic`** proves the OMP client pulls
  diagnostics; it does not prove the pull is on the critical path of every edit. The
  correlation with the runtime freeze is a **separate** question and was explicitly **not**
  established here (the freeze predates this LSP — earliest `ui.loop-blocked` 2026-09-29
  16:35:35 vs plutus-lsp created 2026-09-29 23:06).
- **The six failing tests** were attributed to stale checkpoint copies by path; the exact
  difference in their `JEVK5_URL` default was not diffed.
- **`cards.ts`, `judge.ts` bodies** were read structurally, not line-by-line audited; further
  defects may exist in the card-render and chain internals.

---

## 5 · PRIORITISED FIX ORDER

1. **F-1** — point the server at a law-bearing graph (or emit a no-laws card). *Without this the
   LSP does nothing.*
2. **F-2** — remove the false `diagnosticProvider` (or implement it). *Without this the LSP is
   actively wrong against its client.*
3. **F-4** — isolate the test suite; re-baseline the battery. *Restores a trustworthy signal.*
4. **F-3, F-6, F-7** — sync/save/config handling. *Makes the reflex fire where it claims to.*
5. **F-5** — surface the degraded-judge state as a card.
6. **F-8** — scope the registration; make no-root silent.
7. **F-9 … F-12** — hygiene.

---

*Report generated 2026-10-01 from live stdio probes, direct module calls, kg.json censuses, and
the server's own forensic logs. Every finding names its probe; findings without a runtime probe
are labelled source-confirmed.*
