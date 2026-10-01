# knowledge-lsp-kernel-boilerplate

**The plug-and-play knowledge-graph-anchored LSP intelligence kernel.** Extract a project's
knowledge graph, wire a decision kernel to it, and get a reflexive LSP that surfaces the canon on
every write — the exact system built for PLUTUS (the round-19 package), generalized to any project.

**Provenance.** Extracted from `PLUTUS-COMMON-SENSE-LSP` @ commit `902ee22`, dist
`3307a3b7a14d6f4b`, built 2026-09-29..2026-10-01. Law-faithful COPY (no logic improved). The
source project shipped 8 checkpoints, a 46/0 battery, a 6/6 derailment suite, 19 audit rounds.

---

## 1 · What this is (one paragraph)

An LSP server that makes a knowledge graph REFLEXIVE. On every write the runtime spawns the
server; the server reads the project's knowledge graph (a `kg.json` of typed entities + the
laws/rules that govern the code), builds a WIDE candidate net from the edit, hands the candidates
to a LOCAL decision model (any `/v1/systemone`-compatible judge — a "pointer-readout" model that
returns calibrated probabilities per yes/no question), which FIRST decides relevance (which laws
govern this edit at all) and THEN answers a small chain of decision clauses; pure code turns the
probabilities into a verdict, and a renderer emits LSP diagnostics carrying the governing law's
verbatim statement, its file:line anchor, and the judge's own measured probability. It INFORMS; it
never blocks.

---

## 2 · The architecture

```
┌──────────────────────────────────────────────────────────────┐
│OMP runtime — the LSP mux                                     │
│fires didOpen · didChange · didSave on every write            │
└──────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│machinery/server.ts — the stdio JSON-RPC server               │
│frame parser → analyze(uri) → send(publishDiagnostics)        │
└──────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│pipeline: L1 DETECT → L2 RELEVANCE → CHAIN → CARDS            │
│  store.ts   the graph reader (kg.json → laws, refusals)      │
│  judge.ts   the decision kernel (relevance + the chain)      │
│  cards.ts   the renderer (verdict → LSP diagnostics)         │
└──────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│publishDiagnostics(uri, [FactCard…]) → the editor             │
│the canon arrives ON THE WRITE — INFORMS, never blocks        │
└──────────────────────────────────────────────────────────────┘
```

---

## 3 · THE LAWS (verbatim from the source — the extraction's value)

**L1 · THE NAMED-REFUSAL LAW.** An absent substrate returns a NAMED code (`{APP}_NO_STORE`,
`{APP}_NO_ROOT`, `JUDGE_DOWN`), never a silent empty. Mechanism: `store.ts` throws named errors;
`judge.ts` health returns `JUDGE_DOWN`; `cards.ts` renders a STALE card. VIOLATION: a caller reads
an empty array as "nothing governs this" when the graph was merely absent — a false green.

**L2 · THE DETECTOR/DECIDER SPLIT.** The detector (regex/token/declaration scan) produces a WIDE
net with ZERO opinion; the decision kernel marks relevance; pure code decides the verdict.
Mechanism: `lawsForHunk` (topK=12) → `relevancePass` → `partitionByRelevance` → `verdict`.
VIOLATION: the detector decides relevance lexically → it sprays every fuzzy match and the judge
never gets to answer "which laws govern this at all".

**L3 · THE FAIL-CLOSED DEFAULT LAW.** An unknown tier sinks (`SUPERSEDED` −2); an unanswered clause
is UNKNOWN (never 0); a missing jurisdiction clause is INCONCLUSIVE; a non-finite score is
unreadable. Mechanism: `validTier`, `verdict`, `partitionByRelevance`. VIOLATION: a corrupt record
floats to the top of the ranking, or a missing answer reads as a "no".

**L4 · THE NEVER-THROW CARD LAW.** Every renderer guards null/non-array/non-string; a refusal path
never throws. Mechanism: `cards.ts` guards + `staleCard`. VIOLATION: one malformed graph entry
loses EVERY card for the file.

**L5 · THE BOUNDED-OUTPUT LAW.** Every interpolated graph/judge string is `cap()`-bounded and
control-char-stripped. Mechanism: `cap()` in `cards.ts`. VIOLATION: an unbounded graph field blows
up the diagnostic payload or spoofs the editor.

**L6 · THE ONE-FALLBACK-POLICY LAW.** A transient failure sends NOTHING (keeps last-good); it never
publishes an empty wipe. Mechanism: `server.ts` analyze outer-catch. VIOLATION: a transient error
clears the client's last-good diagnostics — the agent loses the canon silently.

**L7 · THE SINGLE-HELPER LAW.** One fetch helper (`jevk5Fetch`) shared by every caller, so the
paths cannot drift. Mechanism: `judge.ts`. VIOLATION: the two call sites drift (different timeouts,
different validation) and one path lies.

**L8 · THE POLARITY LAW.** The LSP INFORMS; a separate enforcement layer (v2) ENFORCES. A block
path in the server is a VIOLATION. Mechanism: no block path exists; the cards are diagnostics.
VIOLATION: the informing layer arms a block before its precision is trusted.

**L9 · THE SCOPE LAW.** The reflex runs ONLY inside a scoped tree (a path SEGMENT named for the
project, or an explicit scope FILE below $HOME). Out-of-scope = SILENT — no card, no receipt
noise. Mechanism: `isPlutusScoped` (CONFIGURABLE via PLUTUS_LSP_SCOPE / _FILES) FIRST in the pipeline. VIOLATION: a global registration that
"blind-fires on literally everything like uncalibrated slop."

**L10 · THE LAW-BEARING LAW.** Graph resolution is by CONTENT, never proximity: a kg.json with
zero law entities is a graph of SYMBOLS, not a canon, and the pipeline must climb to the nearest
LAW-BEARING graph (or the known paths) rather than serve it. Mechanism: `lawCount()` in
`l1PathFor`. VIOLATION: a silent no-op on the project's own primary tree.

---

## 4 · The why-wired ledger (law → mechanism → reason)

| Law | Mechanism | Why it exists |
|---|---|---|
| L1 named-refusal | `PLUTUS_NO_STORE` etc. | an empty array and a wrong-scope array are the same bytes |
| L2 split | `lawsForHunk` → `relevancePass` | a lexical filter cannot answer "does this govern" |
| L3 fail-closed | `validTier`, `verdict` | a corrupt record must sink, not float |
| L4 never-throw | `cards.ts` guards | a refusal path that throws loses every card |
| L5 bounded | `cap()` | a hostile graph string must not blow the payload |
| L6 one-fallback | analyze catch | a transient error must not wipe last-good |
| L7 single-helper | `jevk5Fetch` | two call sites drift; one helper cannot |
| L8 polarity | no block path | informing != enforcing; the block waits on trusted precision |

---

## 5 · THE PLUG-IN GUIDE (numbered — the exact recipe)

### Step 1 — Build the knowledge graph (`kg.json`)
The graph is the substrate. Two layers are the proven pattern:
- **L1 `kg.json`** — the typed entity store. Shape:
  `{ "entities": [{ "id", "type", "name", "statement", "tier", "anchor", "source" }], "relationships": [...] }`.
  `type: "law"` entities carry the rules; `tier` in `{IMMUTABLE, EVOLVING, SUPERSEDED}` weights
  rank. `anchor` is a `file:line` into the source bible. Aim for hundreds of laws (the Plutus
  graph: 559 laws + 1277 docs, 1141 relationships).
- **L2 (optional)** — a live graph daemon (an au-engine unix socket) for typed counts. Fire-and-
  forget probe; the L1 is primary.

To BUILD the graph: see `references/GRAPH_BUILD.md` (the semantica/arsumbris pipeline: L1 ingest →
L2 arsumbris typed graph → the review gates → the wiring). Prereq skills: `create-knowledge-graphs`
+ `arsumbris-*`.

### Step 2 — Stand up the decision judge
Any `/v1/systemone`-compatible model (a local GGUF "pointer-readout" / decision model served on a
port). Contract: `POST { state, questions } → { answers: {id: {noul: p}} }` with `p` in `[0,1]`. A
local `jevk5`/`kev`/`decider` GGUF via llama.cpp works. Health at `/health`. Set `JEVK5_URL` /
`JEVK5_HEALTH` env to override. The bars (`RELEVANCE_T`, `THROW_T`, `DEMAND_T`) are env-overridable
and validated.

### Step 3 — Adapt the machinery
Copy `machinery/{store,judge,cards}.ts` + `machinery/server.ts`. Rename the `PLUTUS_*` refusals to
`{YOURAPP}_*`. Replace the `OBSERVABLE` table (5 templates in `judge.ts`) with YOUR project's
observable questions (one per law family — a question that is a DIRECT READ of the evidence).
Replace `KNOWN_L1_PATHS` with your graph's homedir-relative locations. The CHAIN nodes (P1 SCOPE …
P7 DRIFT) are the generic 7; retune the questions to your domain.

### Step 4 — Register the LSP
Copy `templates/lsp-entry.json` into `~/.omp/agent/lsp.json` under `servers.<name>`. Set `command:
bun`, `args: [<repo>/machinery/server.ts, --stdio]`, `fileTypes` (see the MISFIRE NOTE), and
`rootMarkers` (your graph's root marker).

### Step 5 — Prove it
Run the battery (`battery/*.test.ts` — 46 tests in the source) with your graph path set. Run the
derailment suite (`battery/derailment-suite.ts`) — push YOUR project's real derailments and assert
the reflex fires. A green battery + a green derailment suite = the kernel works.

### Step 6 — Deploy + observe
Restart a TUI session (the LSP binds at construction). Watch the receipt
(`forensic/lsp-receipts.log`) for `FRAME` / `RELEVANCE` / `PUBLISH` rows.

---

## 6 · MISFIRE NOTE (the known defects — fix these in your port)

Observed in the source (49 REFUSE rows, 32 on `.md` files):
1. **`fileTypes` includes `.md`** → every markdown write emits `PLUTUS_NO_STORE` (a visible
   Warning) because markdown files are rarely under a graph root. FIX: drop `.md` OR fire only when
   a root marker is present.
2. **The L2 probe fires unconditionally** (197 dead `L2 PLUTUS_NO_STORE` rows) even when L1 is
   absent. FIX: probe L2 only after L1 resolves.
3. **The refusal is `SEVERITY.Warning`** → a non-canon file shows a visible warning. FIX: when the
   root carries NO graph marker at all, stay SILENT (out-of-scope != "canon unavailable").
See `references/MISFIRES.md` for the full list + the fixes.

---

## 6b · THE CONFIGURABLE SCOPE (project scoping built in)

The reflex runs ONLY inside a scoped tree; everything else is SILENT (no card, no receipt noise).
The generic root markers can LOCATE a root but never AUTHORIZE the reflex. A fresh re-host sets ONE
env var and gets scoping:

```
PLUTUS_LSP_SCOPE="MYPROJECT"                    # the path SEGMENT(s) meaning "my tree" (comma-list)
PLUTUS_LSP_SCOPE_FILES="myproj.yaml,.myproj"    # optional explicit scope FILES
```

Defaults: `PLUTUS` / `plutus.yaml,.plutus`. The decisive test: a path SEGMENT equals a scope segment
(the BASENAME — never child-existence: a dir merely HAVING a `<PROJECT>/` child must not scope its
siblings), OR an ancestor carries an explicit scope FILE (`isFile()`) BELOW `$HOME`. Verified:
default OUT / custom segment IN / custom file IN. Mechanism: `isPlutusScoped` FIRST in the pipeline.

## 7 · Provenance + audit

**Source:** `PLUTUS-COMMON-SENSE-LSP` @ `902ee22`, dist `3307a3b7a14d6f4b`. **Deltas:** none
(verbatim copy). **What was LEFT OUT:** the Plutus-specific OBSERVABLE table and the Plutus canon
path defaults — a re-host supplies its own. **Audit:** the source passed 19 `qwen-code-audit`
rounds (the r19 gate FAIL 0c/5h is the residual, named in the package).

| file | SHA-16 |
|---|---|
| `machinery/store.ts` | `f0febce8aa8696a2` |
| `machinery/judge.ts` | `49a9e899fe8ad6da` |
| `machinery/cards.ts` | `498b6076038a3eb4` |
| `machinery/server.ts` | `2f946a2857c9b2bd` |
| `battery/derailment-suite.ts` | `aa5a1c72ff49ed25` |
| `templates/lsp-entry.json` | `b3d78f60962fed1f` |

---

## 8 · THE MISFIRE LEDGER (observed in the source — fix in your port)

Measured from `forensic/lsp-receipts.log` (the source project, 2026-10-01):

| # | the misfire | the evidence | the root cause | the fix |
|---|---|---|---|---|
| M1 | fires on markdown files | 32/49 REFUSE rows are `.md` | `fileTypes` includes `.md`; markdown is rarely under a graph root, so every doc write emits `{APP}_NO_STORE` | drop `.md`, OR gate on the root marker before probing |
| M2 | the L2 probe is dead weight | 197 `L2 PLUTUS_NO_STORE` rows | the L2 socket probe fires unconditionally, even when L1 never resolved | probe L2 only AFTER L1 resolves |
| M3 | refusals are visible warnings | `staleCard` = `SEVERITY.Warning` | a non-canon file shows a warning where it should be silent | when the root has NO graph marker, emit NOTHING (out-of-scope != unavailable) |
| M4 | noise on every checkpoint/manifest write | REFUSE rows on `CHECKPOINT_MANIFEST.md`, `THEATRICALITY_LOG.md` | the same `.md` registration | same fix as M1 |
| M5 | the receipt grows unbounded | every FRAME/PUBLISH/L2/NO-LAW appends | no rotation | rotate by size or age |
| M6 | `NO-LAW` is receipt-only (correct) | 68 rows | a fact-free file yields zero candidates — the intended precision | (no fix — the silence is correct) |

**The measured distribution:** 124 PUBLISH · 49 REFUSE · 68 NO-LAW · 197 L2 · 39 RELEVANCE.
**The noise ratio:** (49 REFUSE + 197 L2) / 124 PUBLISH ≈ **2:1 noise-to-signal** — the `.md`
registration (M1) and the unconditional L2 probe (M2) are the two biggest contributors.

---

## 9 · THE GRAPH BUILD (the substrate — how to make the `kg.json`)

The kernel is only as good as its graph. The proven pipeline (PLUTUS, via `create-knowledge-graphs`):

```
  the source corpus (docs/bibles/specs)
        │
        ▼
  L1 · SEMANTICA INGEST       typed entities (laws, docs, components) + relationships
        │                     → .omp/graph-intelligence/layers/semantica/kg.json
        ▼
  L2 · ARSUMBRIS TYPED GRAPH  the curated, typed, linked graph (the au-engine daemon)
        │                     → ~/.arsumbris/au-engine/run/<hash>.sock
        ▼
  THE REVIEW GATES            diagnostic_counts(scope:all) must reach 0
        │                     the wikilink → source-hub resolution (27 -> 1162 edges)
        ▼
  THE MAPPING + WIRING        the human-readable map + the MCP kernel binding
```

**The critical graph lessons (from the PLUTUS build):**
1. **Edges are the value, not nodes.** A graph with nodes but no edges is a list. The source-hub
   resolution pattern (every card links to a source hub -> the hub links to the cards) took edges
   from 27 to 1162. Without edges, `callersOf`/relevance cannot work.
2. **`type: "law"` entities carry the rules.** The detector scans `name + id + statement`; the
   `anchor` (`file:line`) is what the card shows the agent. A law without an anchor is a claim.
3. **`tier` weights rank.** `IMMUTABLE` +2, `EVOLVING` +1, `SUPERSEDED` −2 (fail-closed default).
4. **`diagnostic_counts` must reach 0.** A dangling anchor, an unbacked number, an empty anchor —
   each is a graph defect that propagates into every card.
5. **Build the graph for the LSP's questions.** If the kernel asks "does the edit change the ZFP
   threshold", the graph must carry the ZFP law with its value. Graph and OBSERVABLE table co-design.

Prereq skills: `create-knowledge-graphs`, `arsumbris-kg-setup`, `arsumbris-markdown-corpus-graph`,
`arsumbris-canon-graph-build`, `semantica-*`. Full recipe: `references/GRAPH_BUILD.md`.

---

## 10 · THE DECISION KERNEL (how the judge is wired)

The judge is a LOCAL decision model (not an LLM chat model) — a "pointer-readout" model that, given
a `state` (the evidence text) and `questions` (a map of id -> a single yes/no), returns calibrated
probabilities. Contract (verified against `jevk5-4b-v0.2-Q8_0` on `:8090`):

```
POST {JEVK5_URL}  body: { state: "<the evidence, assembled FROM DISK>",
                          questions: { "R1": { type:"noul", instructions:"..." }, ... } }
-> { answers: { "R1": { noul: 0.87 }, ... }, latency_ms }
```

**The two passes:**
1. **RELEVANCE (`relevancePass`)** — one noul PER CANDIDATE law: "does THIS law govern the code
   being written?" The bar (`RELEVANCE_T`, default 0.30) is DERIVED, not assumed (the sweep: 0.50
   lost coverage; 0.30 recovers every measured positive; 0.20 identical). Only relevant laws reach
   the verdict pass. **This is the fix that makes the kernel intelligent** — before it, the
   detector decided relevance lexically and sprayed fuzzy matches.
2. **THE CHAIN (`chain`)** — the 7 generic clauses in ONE POST: P1 SCOPE · P2 LAW (jurisdiction) ·
   P3 TIER · P4 VIOLATE · P5 CONTRACT · P6 ANTIPATTERN · P7 DRIFT. Pure code then decides: MAX over
   the answered wrongness clauses {P4,P5,P6}; `THROW_T` 0.85 (policy) -> VIOLATION; `DEMAND_T` 0.30
   (derived) -> SUSPECT; P7 -> DRIFT; missing P2 -> INCONCLUSIVE.

**The calibration law:** the bar is DERIVED by sweeping a labeled corpus (violations + cleans),
never picked. The PLUTUS corpus: 8 items -> bar 0.30 (F1 0.60 · precision 0.50 · recall 0.75). A
50+ item corpus stabilizes it. Full recipe: `references/DECISION_KERNEL.md`.

---

## 11 · THE BATTERY (what to prove before shipping)

| the test | what it pins |
|---|---|
| `plutus-lsp.test.ts` (12 unit gates) | store resolves; refusals named; lawsFor matches; declarationsIn reads exports; the selftest emits a token |
| `judge-cards.test.ts` | the 7-noul chain; the down judge named; one card per law; the verdict names the law; measured callers; no phantom; thresholds |
| `adversarial.test.ts` (A1-A34) | absent graph; down judge; fact-free silence; known violation; foreign store; no root; siblings survive; 7 unique tokens; calibrated chain; validated bars; relevance wired + derived + partitioned; stale-row drop; missing-P2 INCONCLUSIVE; vacuous downgrade; never-throw cards; emitted counts; incremental never doc; headerless capped; NaN vector; non-array kept; short-name survival; topK clamp; partition rows; fallback validated; STRONG-root preference; observable never throws; bounded cards; short read; p>1 rejected; selftest halts; system paths refused; unknown method answered |
| `derailment-suite.ts` (D1-D6) | the OBJECTIVE: push real derailments through the live pipeline; assert the reflex fires + the clean case stays silent |

**Run:** `PLUTUS_L1_PATH=<kg.json> bun test tests/` (expect 46/0/158) ·
`PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` (expect 6/6).

---

## 12 · THE OBSERVATION PROTOCOL (how to know it works)

The receipt (`forensic/lsp-receipts.log`) is the forensic channel:
```
INIT pid=…                              the server spawned
FRAME <method>                          a JSON-RPC frame arrived
RELEVANCE judged=N/M dropped=K          the relevance pass ran (K laws never judged)
PUBLISH n=K tokens=… verdict=…          the cards were emitted
REFUSE <CODE> file=…                    a named refusal (no graph)
NO-LAW file=… decls=N                   zero candidates (the precision proof)
L2 nodes=N edges=M | L2 <reason>        the L2 probe result
```
**A healthy run:** PUBLISH rows carry `<app>/law` + a verdict; RELEVANCE rows show
`judged=12/12 dropped=0`; REFUSE rows appear ONLY for genuinely non-canon files (see M1/M3 — the
source over-refuses on `.md`).

---

## 13 · WHAT WAS LEFT OUT (the honest boundary)

- **The Plutus OBSERVABLE table** (5 templates: stop-loss/pip, one-TP, pair-format, RRR, ZFP) —
  project-specific; a re-host writes its own.
- **The Plutus canon path defaults** (`KNOWN_L1_PATHS`) — replace with your graph's locations.
- **The L2 au-engine socket coupling** — the L2 probe is optional; a re-host may drop it entirely.
- **The 50+ calibration corpus** — the source ships 8 items; a production host wants more.
- **The v2 enforcement extension** — PARKED in the source (the polarity law); not in this
  boilerplate.

---

## 14 · FILE MAP

```
knowledge-lsp-kernel-boilerplate/
├── README.md                     this file (the plug-in guide + the laws + the misfires)
├── machinery/
│   ├── store.ts                  the graph reader (L1 kg.json + L2 socket)
│   ├── judge.ts                  the decision kernel (relevance + the 7-noul chain)
│   ├── cards.ts                  the renderer (verdict -> LSP diagnostics, 7 tokens)
│   └── server.ts                 the stdio JSON-RPC server (the entry)
├── battery/
│   ├── plutus-lsp.test.ts        the W1 unit gates
│   ├── judge-cards.test.ts       the W2+W3 gates
│   ├── adversarial.test.ts       the A1-A34 sweep
│   └── derailment-suite.ts       the D1-D6 objective proof (live judge)
├── references/
│   ├── GRAPH_BUILD.md            the semantica/arsumbris pipeline
│   ├── DECISION_KERNEL.md        the judge wiring + the calibration
│   ├── MISFIRES.md               the observed defects + the fixes
│   ├── CALIBRATION_v1.md         the derived bar + the corpus
│   ├── RELEVANCE_KERNEL.md       the relevance architecture
│   └── LSP_DEPLOYMENT_CONTRACT.md the spawn gates + the registration
└── templates/
    └── lsp-entry.json            the registration entry (copy into ~/.omp/agent/lsp.json)
```

**Companion skill:** `create-knowledge-kernel` (mints a kernel for any project; loads this
boilerplate + the prereq skills).
