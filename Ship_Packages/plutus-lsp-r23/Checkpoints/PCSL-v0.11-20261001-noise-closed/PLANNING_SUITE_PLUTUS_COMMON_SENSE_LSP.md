# PLANNING SUITE — THE PLUTUS-COMMON-SENSE LSP

**Series:** the Plutus-Common-Sense-LSP design (a NEW sibling repo). **Date:** 2026-09-29.
**Repo:** `/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP` (own `.git`).
**class:** system (an infra spine — a long-running LSP daemon that serves diagnostics over stdio, NOT a library)
**Owner skill (handoff):** `build-package`.
**The read receipt (the 5 source skills, read this session):**
- `brainstorming`: READ — the law I carry is the HARD GATE (no impl before approval) + the 3-path classification.
- `blueprinting`: READ — the law I carry is MOVE 2 (the `does NOT` column IS the spec) + MOVE 3 (ONE reduced mechanism) + MOVE 5 (the instrument that reports the deficiency) + MOVE 16 (the named residual).
- `focus`: READ — the law I carry is "read the artifact, never the status field" + the measure≫write ratio.
- `fable-plan`: READ — the law I carry is the parallel evidence fan-out in ONE message + the decision gate.
- `trident-problem-solving`: READ — the law I carry is the 3-cycle hard bound + the mechanism-not-scapegoat root cause.

## THE SCOPE

**The mission nouns:** `plutus`, `common-sense`, `lsp`, `graph`, `knowledge`, `jev`, `reflex`.
The scope: build the **plutus common-sense lsp** — a long-running LSP daemon that reads the plutus
knowledge graph (L1 semantica + L2 arsumbris), consults the **jev** judge, and makes the canon
**reflexive** on every write. In scope: the `graph` read, the `knowledge` cards, the `jev` chain,
the `reflex` render, the registration. Out of scope: enforcement (an extension), the graph build.


---

## 0 · THE CLASSIFICATION

**ARCHITECTURAL** — a new subsystem (classified architectural). A new subsystem (a third custom LSP server) + a **new repo** (forked out of the
Plutus agent tree, per the operator's mandate: *"ensure this properly forks into its own repo so it
doesn't get lost inside of the plutus agent"*). The heavier path is taken; the ratchet is one-way.

**THE INTENT (restated).** Make the Plutus knowledge graphs **reflexive** — on every write/edit to a
Plutus file, a registered LSP server reads the graph (L1 semantica + L2 arsumbris), asks the **live
JevK5 judge** whether the edit obeys the canon, and surfaces the governing law as a diagnostic
**before** the agent can derail. The precedent is proven twice on this host: `gi-lsp` (the GI kernel
reflex) and `jg-lsp` (the ticket reflex), both live in `~/.omp/agent/lsp.json`.

**THE HARD GATE:** design first (this artifact) → operator approval → then the build pass. No
implementation action before approval.

---

## 1 · THE DIFFERENTIAL (the `does NOT` column IS the spec)

| the adjacent thing | what it DOES | what it does **NOT** do |
|---|---|---|
| `gi-lsp` (`Graph_Intelligence/scripts/gi-lsp.ts`, 220 L) | reads the 6 GI layers; emits 5 card shapes (callers/unwired/conflict/meaning/scope) on write | does **NOT** read the PLUTUS canon (it reads the GI stores under `.omp/graph-intelligence/`); has no law/tier model; never judges an edit against a law |
| `jg-lsp` (`Jev_Gates/scripts/jg-lsp.ts`, 207 L) | reads the ticket record; emits 6 card shapes (row/no-row/consumed/shrink/scope/state) | does **NOT** know the domain; it anchors AUTHORIZATION, not MEANING; no graph access |
| the `plutus-master-context` skill | loads the injector + the navigation manifest, on demand | does **NOT** run automatically; not tied to a file; not a diagnostic; the session must CHOOSE it |
| the L2 arsumbris daemon | serves the typed graph over a socket (read verbs) | does **NOT** drive the editor; not wired to writes; the agent must call it |
| the JevK5 judge (`:8090`) | returns calibrated probabilities for typed questions | does **NOT** touch code; no file awareness; no chain authored for the canon |
| `plutus-au` (the MCP entry) | registers a kernel for the graph | does **NOT** serve tools today (`tools/list = []`); not a reflex |

**THE GAP (the empty cell that IS the spec):** nothing makes the Plutus canon arrive **reflexively,
per-file, on the write, judged**. The three ingredients all exist (graphs + judge + LSP runtime) and
are wired to each other by nothing.

---

## 2 · THE REDUCED CORE (ONE mechanism)

**The mechanism:** the operator re-explains the canon because **the canon is a PULL artifact** — it
is queryable, never injected. Every derailment is a moment where the law was one query away and the
agent did not make the query.

```
CANON INERTNESS = A LAW THAT MUST BE FETCHED
CANON REFLEX    = A LAW THAT ARRIVES ON THE WRITE, JUDGED, BEFORE THE EDIT COMMITS
HONESTY         = THE GRAPH IS THE JUDGE'S SUBSTRATE, AND THE LSP ONLY INFORMS
```

**The inversion (MOVE 5 — the instrument, not an adjective):** we do NOT ask the agent to "remember
the law". We register a server that reports the law **as a diagnostic** — the deficiency arrives as
an OUTPUT, not as an instruction to be careful.

**Test of the reduction (does it explain unmentioned instances):** it explains the
`plutus-master-context` skill's on-demand design, the `plutus-au tools/list=[]` gap, and the "after
compaction the session holds less canon" finding — three defects the operator never enumerated.

---

## 3 · THE DESIGN (the blueprint canon)

### §3.0 THE FIRST-PRINCIPLES CORE
The canon must become a **sense organ**: the LSP runtime queries every registered server on every
write/edit (OMP's `lsp.diagnosticsOnWrite` / `lsp.diagnosticsOnEdit`), so a registered server makes
the law reflexive **with zero tool calls and zero agent decisions**. This is the GI kernel's own
insight (`gi-lsp.ts:5` — *"the layers were a QUERYABLE LIBRARY … this server makes them a SENSE
ORGAN"*), applied to the Plutus canon.

### §3.1 THE THREE LAYERS (the firewall law: detect → judge → enforce)
```
L1 THE DETECTOR   mechanical · free · zero intelligence
   the file's declarations → the graph's law cards for those symbols
   output: a CANDIDATE { symbol, laws[], anchors[] }   NOTHING BLOCKS
L2 THE JUDGE      JevK5 · the intelligent backend · ~334 ms (measured)
   CODE assembles the STATE from disk; typed noul questions; calibrated probabilities
L3 THE ENFORCER   code · thresholds · the diagnostic
   ≥0.85 VIOLATION(1) · 0.50-0.85 SUSPECT(2) · <0.50 LAW(3)
```

### §3.2 THE CRITICAL POLARITY (inherited from both precedents)
**THE LSP INFORMS — IT NEVER BLOCKS.** It is a *read surface*; OMP queries it for diagnostics. The
block lives in an extension (`tool_call` hook), never here. A stale card is a stale HINT, never a
stale authorization. (jq: the `jg-lsp` DPL1 §4 — the polarity law.)

### §3.3 THE CARD SET (the 7 tokens)
| the graph+judge fact | severity | the token |
|---|---|---|
| the laws governing this symbol | Information | `plutus/law` |
| an edit VIOLATES an IMMUTABLE law | Error | `plutus/violation` |
| the law is SUSPECT (0.50–0.85) | Warning | `plutus/suspect` |
| the symbol's tier | Information | `plutus/tier` |
| who calls this symbol (blast) | Information | `plutus/callers` |
| the edit contradicts a prior decision | Warning | `plutus/drift` |
| the graph is stale vs the tree | Warning | `plutus/stale` |

**The card shape** (inherited verbatim from GI's `FactCard`, `cards.ts`):
`{ shape, title, rows[], severity 1|2|3|4, source<Token>, total }`.

### §3.4 THE CHAIN — CH-PLUTUS (7 nouls, cheapest-first)
```
P1 SCOPE      is the target inside the Plutus tree?          state: the file path
P2 LAW        does the graph hold a law for this symbol?      state: L2 instances_of
P3 TIER       is the governing law IMMUTABLE?                 state: the card tier
P4 VIOLATE    does the edit CONTRADICT the law text?          state: law statement + hunk
P5 CONTRACT   does it respect E1→E2→E3 (no override)?         state: IRON-05/R02 + module
P6 ANTIPATTERN does it match a BUG-01..05?                    state: BUG cards + hunk
P7 DRIFT      does it contradict a prior ruling (R01..)?      state: ruling cards + edit
★ overall = min(all clauses) — the WEAKEST clause, never an average
★ the verdict carries the VECTOR (per-node scores)
```

### §3.5 THE VERDICT (pure code — the model answers numbers, the code decides)
```
P4 ≥ 0.85  → VIOLATION (sev 1, the law quoted)   · P4 0.5–0.85 → SUSPECT (sev 2)
P7 ≥ 0.85  → DRIFT     (sev 2, the ruling quoted) · all < 0.5  → LAW (sev 3, INFORM)
```

### §3.6 THE STATE BUILDER (the anti-gaming core)
EVERY state field is READ FROM DISK BY CODE — never typed by the agent:
`the_target <- the file path · the_laws <- the L2 instances_of rows · the_hunk <- the diff since
the last read · the_anchor <- the card's file:line`.

### §3.7 THE FALSIFICATION INSTRUMENTS (MOVE 9)
- I1 **the receipt probe** — an instrumented frame log (`/tmp/plutus-lsp-receipts.log`); `PUBLISH n=K` IS the render proof.
- I2 **the selftest** — `--selftest <file>` → ≥1 tokenized card → exit 0; the named miss → exit 1.
- I3 **the negative control** — a file with NO facts produces NO card (never a phantom).
- I4 **the live judge probe** — `curl :8090/v1/systemone` returns a noul; a down judge is `JEVK5_DOWN`.

### §3.8 THE COMPOSITION MAP (owns / hands off)
```
OWNS:   the Plutus canon reflex · the 7 tokens · CH-PLUTUS · the card renderer
HANDS OFF: the ENFORCEMENT (an extension, tool_call) · the GI layers (gi-lsp) ·
           the ticket boundary (jg-lsp) · the graph build (create-knowledge-graphs)
NO-DUP LAW: never re-implement a sibling server's shape; never rebuild the graph.
```

### §3.9 FILE LAYOUT + DEPLOYMENT (the new repo)
```
PLUTUS-COMMON-SENSE-LSP/   (own .git — a SIBLING of Jev_Gates / Graph_Intelligence)
  scripts/plutus-lsp.ts          the stdio JSON-RPC server (GI's skeleton)
  src/plutus-lsp/{store,judge,cards}.ts
  tests/plutus-lsp.test.ts
  packages/                      the build package
  reports/                       the maps/reports
  README.md · .gitignore · package.json · tsconfig.json
```
DEPLOY = one entry in `~/.omp/agent/lsp.json` (the `plutus-lsp` server), beside `gi-lsp` + `jg-lsp`.

---

## 4 · THE EVIDENCE (cited, measured this session)

- `gi-lsp.ts` — 220 lines; the scaffold precedent; reads `.omp/graph-intelligence/*-checkout/store.sqlite`; `GI_LSP_TOKENS = [gi-lsp/callers, gi-lsp/unwired, gi-lsp/conflict, gi-lsp/meaning, gi-lsp/scope]`.
- `jg-lsp.ts` — 207 lines; the ticket precedent; `JG_LSP_TOKENS = [jg/consumed, jg/no-row, jg/row, jg/scope, jg/shrink, jg/state]`.
- `~/.omp/agent/lsp.json` — `servers = ['gi-lsp', 'jg-lsp']` (both registered, both live).
- The `FactCard` shape — `{ shape, title, rows, severity, source, total }` (`cards.ts`).
- The live judge — `GET :8090/health` → `{"ok": true, "model": "jevk5-4b-v0.2-Q8_0", "runtime": "gguf"}`.
- A live noul — `POST :8090/v1/systemone` (`SL 200 vs cap 150`) → `{"noul": 0.7869}` in `334 ms`.
- L1 SEMANTICA — `1277 entities / 1141 relationships` (the corpus).
- L2 ARSUMBRIS — `1323 nodes / 1162 edges` (the typed canon).
- The 4 spawn gates — `~/.omp/agent/managed-skills/omp-lsp-render-proof/SKILL.md` (lsp.json · rootMarker · task.enableLsp · diagnosticsOnEdit).

---

## 5 · THE APPROACHES (2–3 with trade-offs; the chosen one)

**A — the OMP LSP server (CHOSEN).** A registered stdio JSON-RPC server; OMP's runtime queries it
on every write/edit. *Pros:* the reflex is free (no agent decision); the precedent is proven twice;
the render is provable by receipt. *Cons:* informs only (cannot block — by design, and the block
belongs to an extension); a one-beat stale window.
**B — an MCP tool.** *Rejected:* a tool is a PULL — the agent must choose it, the exact inertness
being killed.
**C — a `tool_call` hook extension.** *Rejected as the primary* (it fires only when the agent calls
a tool and OMP's hook surface blocks/refuses there); *retained as the ENFORCER half* — the LSP
informs, an extension may block.

---

## 6 · SUCCESS CRITERIA (mechanical, command-checkable)

| # | criterion | the command / the artifact |
|---|---|---|
| S1 | the plutus common-sense lsp **runs as a long-running daemon** that **listens** on stdio and **serves** diagnostics | `bun scripts/plutus-lsp.ts --selftest <file>` → exit 0 with ≥1 tokenized card; the receipt log shows the live `run` |
| S2 | the **graph** read resolves against the plutus knowledge store | the server reads `.omp/…/layers/semantica/kg.json`; a miss names `PLUTUS_NO_STORE` |
| S3 | the **jev** chain runs on the live judge | the log shows a `:8090/v1/systemone` call returning a noul; a down judge names `JEVK5_DOWN` |
| S4 | the **knowledge** cards emit — all 7 tokens | `bun test tests/plutus-lsp.test.ts` green; the card matrix asserts 7 shapes |
| S5 | the **reflex** render is PROVEN | `PUBLISH n=K` in `/tmp/plutus-lsp-receipts.log` after a live TUI write — observed in a tool result |
| S6 | the negative holds (no phantom card) | a fact-free file → NO diagnostic; observed in a tool result, exit code 0 |
| S7 | the registration is live | `~/.omp/agent/lsp.json` carries `plutus-lsp`; `task.enableLsp=true`; `lsp.diagnosticsOnEdit=true` |
| S8 | no sibling regression | `gi-lsp` + `jg-lsp` still answer (the daemon side-by-side) |

## 7 · THE EXECUTION PLAN (the checklist + the gates)

```
W1 THE STORE READER   src/plutus-lsp/store.ts    gate: reads L1 kg.json + L2 socket; names PLUTUS_NO_STORE
W2 THE JUDGE CHAIN    src/plutus-lsp/judge.ts    gate: the live K5 returns 7 nouls; JEVK5_DOWN on absence
W3 THE CARDS          src/plutus-lsp/cards.ts    gate: the 7 tokens; both halves (violation + clean)
W4 THE SERVER         scripts/plutus-lsp.ts      gate: --selftest <file> → ≥1 token → exit 0
W5 THE REGISTRATION   ~/.omp/agent/lsp.json      gate: the RECEIPT proves a live render
W6 THE CALIBRATION    a labeled control set      gate: the bars DERIVED (precision/recall), not assumed
```
Every wave: disjoint files. Every gate: a tool result. No wave starts with its predecessor's gate unmet.

---

## 8 · THE ANTI-PATTERNS (this design's failure classes + detections)

| the anti-pattern | the detection (mechanical) |
|---|---|
| the server BLOCKS (violates the polarity law) | grep the server for a `tool_call`/throw path → 0 (it may only publishDiagnostics) |
| the agent supplies the state | every state field traces to a file read, never to prose (grep for a typed state) |
| the judge runs on every span (cost blowup) | the chain fires only when L1 yields a law card (a candidate), never unconditionally |
| the phantom card (a fact asserted, not measured) | the card's `total` is measured; a fact-free file yields NO card |
| a fabrication (a card citing an unmeasured count) | every `rows[]` entry is a real `file:line`; `total` from the DB |
| sibling eviction (the third server breaks the two) | the S8 regression check |
| the stale authorization | the LSP is read-only; grep it mutates nothing (no `writeFile`, no `saveRecord`) |
| the theatrical render claim | the receipt log carries `PUBLISH n=K`; no receipt = not driven |

**Adversarial-first:** the negative tests (fact-free file, down judge, foreign store, unsafe id)
land before the happy path.

---

## 9 · OPEN DECISIONS (forks + defaults + the operator's rulings)

| # | the fork | the default (taken, overrule-ready) | needs the operator? |
|---|---|---|---|
| D1 | the gating node | **P4 alone gates**; P5–P7 inform | no |
| D2 | the file types | **`.ts` + `.md`** (the code + the canon) | no |
| D3 | the thresholds | **0.85 / 0.50, DERIVED in W6** before arming | no |
| D4 | the graph read | the L1 `kg.json` (fast, file) + the L2 socket (typed) | **yes** — L1-only is faster; L1+L2 is richer |
| D5 | the enforcement half | an extension `tool_call` hook, as a **separate** build | **yes** — v1 INFORMS; v2 ENFORCES |

---

## 10 · THE RESIDUAL (named — what remains unexercised/unspecified)

- **The calibration is UNRUN.** The 0.85/0.50 bars are PROPOSED; W6 must DERIVE them on a labeled
  control set (a known violation + a known clean) and RECORD the corpus. Until then, the bars are
  defaults, not measurements.
- **The judge's discrimination is UNMEASURED for P4/P7.** A single noul returned `0.7869` for a
  clean-cut SL-cap question; a 7-node chain's false-positive rate on the REAL Plutus corpus is not
  yet measured.
- **The `.md` file handling is unspecified.** The canon is markdown; the LSP must decide what a
  "diagnostic" means on a canon doc (a drift card, likely) — deferred to W3.
- **The enforcement half (D5) is NOT in v1.** The LSP informs; the block is a v2 extension.
- **The one-beat staleness** is structural (the card reflects the last read) — a stale HINT, never a
  stale authorization.
- **The L2 socket latency** (a read per edit) is unmeasured; if it taxes the edit cadence, the L1
  `kg.json` alone is the fallback (D4).

---

## 11 · THE HANDOFF

**Owner skill:** `build-package` — mint the DPL1 spec + the master blueprint + the canon docs + the
wave structure + the goal prompts for `PLUTUS-COMMON-SENSE-LSP`, from THIS artifact.
**Then:** `create` — mint the `/goal` pin that drives the build (the pin is VOID without the package).
**The repo:** `/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP` (its own
`.git` — a sibling of `Jev_Gates` / `Graph_Intelligence`, NEVER inside the Plutus agent tree).

---

## THE PREDICATE (run before handoff)
```bash
bash ~/.omp/agent/managed-skills/create-planning/scripts/check.sh \
  /home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP/PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md
```
