# BUILD SPEC ARTIFACT — PLUTUS-COMMON-SENSE LSP
**Target:** `/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP`
**Generated:** 2026-09-29 · **Status:** PLANNING · **Artifact Type:** BUILD_SPEC (Layer 1 Prompt) · **Component id:** PCSL-00
**class:** system (an infra spine — a long-running LSP daemon, not a library)

---
## §A · CONTEXT (the evidence base)
The Plutus knowledge graphs exist and are queryable (L1 1277/1141, L2 1323/1162). The JevK5 judge
is live on `:8090` (a noul returned 0.7869 in 334 ms). Two custom LSP servers ship on this host
(`gi-lsp` 220 L, `jg-lsp` 207 L) and OMP's runtime drives both on every write/edit. What is MISSING
is the bridge: nothing makes the PLUTUS canon reflexive per-file. This component builds it, in its
own repo (`PLUTUS-COMMON-SENSE-LSP`), a sibling of `Jev_Gates` / `Graph_Intelligence`.

### References read (this session)
`Graph_Intelligence/scripts/gi-lsp.ts` · `Graph_Intelligence/src/gi-lsp/cards.ts` ·
`Graph_Intelligence/src/omp/adapters/jevk5.ts` · `Jev_Gates/scripts/jg-lsp.ts` ·
`Jev_Gates/reports/JevGates_TicketLSP_ShowMe_v1.md` · `~/.omp/agent/lsp.json` ·
`omp-custom-lsp-reflex-wiring/SKILL.md` · `omp-lsp-render-proof/SKILL.md`.

---
## §1 · PROBLEM STATEMENT (verbatim requirements first)
> "how we can build a Plutus-Common-Sense LSP that properly enforces these knowledge graphs through
> plutus build w/ Jev intelligence"

> "ensure this properly forks into its own repo so it doesn't get lost inside of the plutus agent"

### The differential (adjacent → what it does → what it does NOT do)
| adjacent | does | does NOT |
|---|---|---|
| `gi-lsp` | reads the 6 GI layers; 5 card shapes | does NOT read the PLUTUS canon; no law/tier model |
| `jg-lsp` | reads the ticket record; 6 card shapes | does NOT know the domain; anchors authorization, not meaning |
| `plutus-master-context` skill | loads the injector on demand | does NOT run automatically; not per-file; not a diagnostic |
| the L2 daemon | serves the typed graph | does NOT drive the editor; not wired to writes |
| the JevK5 judge | calibrated typed answers | does NOT touch code; no file awareness; no canon chain |
| `plutus-au` MCP | registers a kernel | does NOT serve tools today (`tools/list=[]`) |
**THE GAP:** nothing makes the canon arrive reflexively, per-file, on the write, judged.

---
## §2 · ARCHITECTURE
```
OMP native LSP runtime (lsp.diagnosticsOnWrite / OnEdit)
  │  queries EVERY registered server on every write/edit
  ▼
plutus-lsp (stdio JSON-RPC) ──reads──► the Plutus graphs (L1 kg.json + L2 socket)
  │                                          │  the laws for this symbol
  │                                          ▼
  │                                   JevK5 :8090/v1/systemone  (CH-PLUTUS, 7 nouls)
  │                                          │  {noul: 0.79}
  ▼                                          ▼
publishDiagnostics ──────────────► the law, in the editor (the reflex)
```
### The three layers (detect → judge → enforce)
- **L1 DETECT** — `store.ts` + `cards.ts`: the file's declarations → the graph's law cards. FREE, no model.
- **L2 JUDGE** — `judge.ts`: the CODE assembles the state from disk → CH-PLUTUS (7 nouls) → JevK5. ~334 ms.
- **L3 ENFORCE** — `cards.ts` + the server: the thresholds → the diagnostic. PURE CODE.
### The polarity law
THE LSP INFORMS; it never blocks. The block is an extension (`tool_call`). A stale card is a stale
HINT, never a stale authorization.

---
## §3 · DISCOVERY INTELLIGENCE (measured numbers only)
| the number | the value | the origin |
|---|---|---|
| the precedent servers | 220 L (`gi-lsp`) · 207 L (`jg-lsp`) | `wc -l` |
| the registration | `servers = ['gi-lsp','jg-lsp']` | `lsp.json` |
| the judge health | `{"ok":true,"model":"jevk5-4b-v0.2-Q8_0"}` | `curl :8090/health` |
| a noul latency | 334 ms | the live probe |
| L1 corpus | 1277 / 1141 | `kg.json` |
| L2 typed | 1323 / 1162 | the daemon |
| the law cards | 564 law · 583 mechanism · 38 ruling | `ls \| wc -l` |
| the chain | 7 nouls | CH-PLUTUS |

---
## §4 · CORE INSIGHT
The canon is a **PULL artifact** — queryable, never injected. Every derailment is a moment the law
was one query away and the agent did not make the query. Registering a server makes the law a
**reflex**: it arrives as a diagnostic on the write, before the edit commits.
```
CANON INERTNESS = A LAW THAT MUST BE FETCHED
CANON REFLEX    = A LAW THAT ARRIVES ON THE WRITE, JUDGED
HONESTY         = THE LSP ONLY INFORMS; THE EXTENSION ENFORCES
```
### The governing non-negotiables
1. INFORMS, never blocks (the polarity law). 2. State from disk, never typed. 3. Read-only.
4. The reflex is free (no agent decision). 5. Its own repo.

---
## §5 · SCOPE (the work items, ≤20; each ≤200 chars)
1. `src/plutus-lsp/store.ts` — the graph reader (L1 kg.json + L2 socket); the NAMED `PLUTUS_NO_STORE`.
2. `src/plutus-lsp/judge.ts` — CH-PLUTUS (7 nouls) against JevK5; the NAMED `JEVK5_DOWN`.
3. `src/plutus-lsp/cards.ts` — the 7 tokens + `toDiagnostic`; the `FactCard` shape.
4. `scripts/plutus-lsp.ts` — the stdio JSON-RPC server (the GI skeleton); `--selftest`.
5. `~/.omp/agent/lsp.json` — the `plutus-lsp` registration.
6. `tests/plutus-lsp.test.ts` — the card matrix + the negatives.
7. The receipt instrumentation (`/tmp/plutus-lsp-receipts.log`).
8. The calibration harness (W6) — DERIVE the bars on a labeled set.
### OUT OF SCOPE
The enforcement extension (v2) · the graph build (create-knowledge-graphs) · the MCP kernel · ui.

---
## §6 · SUCCESS CRITERIA (mechanical table)
| # | criterion | the command / the artifact |
|---|---|---|
| S1 | the daemon runs + listens + serves | `bun scripts/plutus-lsp.ts --selftest <file>` → exit 0 with ≥1 tokenized card |
| S2 | the graph read resolves | reads `kg.json`; a miss → `PLUTUS_NO_STORE` |
| S3 | the jev judge chain runs | the log shows a `:8090` call; a down judge → `JEVK5_DOWN` |
| S4 | the 7 tokens emit | `bun test tests/plutus-lsp.test.ts` green |
| S5 | the reflex render is PROVEN | `PUBLISH n=K` in the receipt log |
| S6 | the negative holds | a fact-free file → NO diagnostic; exit 0 |
| S7 | the registration is live | `lsp.json` carries `plutus-lsp`; `task.enableLsp=true` |
| S8 | no sibling regression | `gi-lsp` + `jg-lsp` still answer |

---
## §7 · PLAN-FIRST CONTAINER TEST CONTRACT (≥5 adversarial angles, tool-result-bound tokens)
| # | the angle | passToken | failToken |
|---|---|---|---|
| A1 | the graph is ABSENT | `PLUTUS_NO_STORE` | `[]` / a silent empty |
| A2 | the judge is DOWN | `JEVK5_DOWN` | a fabricated noul |
| A3 | a file with NO laws | no card emitted | a phantom card |
| A4 | a known VIOLATION | `plutus/violation` + `noul≥0.85` | a `law` card only |
| A5 | a foreign-store file | `plutus/stale` | a confident wrong answer |
| A6 | a sibling server's file | (`gi-lsp`/`jg-lsp` still emit) | eviction |
| A7 | fsync/frame integrity | the `Content-Length` frames parse | a malformed frame |
Evidence field: the receipt log + the test stdout. Threshold: each angle's passToken present + failToken absent.

---
## §8 · ANTI-PATTERN LEDGER (≥3 categories, MECHANICAL detections)
### ARCHITECTURAL
- the LSP BLOCKS → grep the server for a `tool_call`/throw path → must be 0.
- sibling eviction → S8.
- a write path in the LSP (not read-only) → grep for `writeFile`/`saveRecord` → 0.
### BEHAVIORAL
- agent-supplied state → every state field traces to a file read.
- the judged-everything cost blowup → the chain fires only on a candidate (a law card exists).
### PROCESS
- the phantom card → the `total` is measured; a fact-free file yields NO card.
- the theatrical render claim → the receipt (`PUBLISH n=K`); no receipt = not driven.
- the assumed threshold → W6 DERIVES the bars; an assumed bar is a FAIL.

---
## §9 · OPEN DECISIONS
| # | the fork | the default | needs the operator? |
|---|---|---|---|
| D1 | the gating node | P4 alone gates; P5–P7 inform | no |
| D2 | the file types | `.ts` + `.md` | no |
| D3 | the thresholds | 0.85/0.50, DERIVED in W6 | no |
| D4 | the graph read | L1+L2, L1-only fallback | **yes** |
| D5 | the enforcement half | v2 (defer) | **yes** |

---
## §B · DENSE BUILD PLAN
### Module map
- `store.ts` → reads the graph → `{laws[], anchors[]}`
- `judge.ts` → assembles state → 7 nouls → `{vector, verdict}`
- `cards.ts` → `FactCard[]` → LSP diagnostics
- `scripts/plutus-lsp.ts` → the JSON-RPC loop
### File manifest
NEW: `src/plutus-lsp/{store,judge,cards}.ts` · `scripts/plutus-lsp.ts` · `tests/plutus-lsp.test.ts` ·
`README.md` · `.gitignore` · `package.json` · `tsconfig.json`. EDITED: `~/.omp/agent/lsp.json`.

---
## §C · THE SPEC ILLUSTRATED (the master view)
```
┌──────────────────────────────────────────────────────────────────────┐
│ the agent WRITES a Plutus file                                        │
│        │                                                              │
│        ▼                                                              │
│ OMP native LSP runtime (diagnosticsOnWrite/OnEdit)                    │
│        │  queries every registered server                             │
│        ▼                                                              │
│ plutus-lsp ──► store.ts (the graph) ──► judge.ts (CH-PLUTUS) ──► cards │
│                  │                          │              │          │
│             L1 kg.json                JevK5 :8090    the diagnostic   │
│        ─────────────────────────────────────────────────────────────► │
│        publishDiagnostics ──► ▌ the law, in the editor (the reflex)   │
└──────────────────────────────────────────────────────────────────────┘
```

---
## §D · SCRIPT TESTING SUITE (pre-written)
- `tests/plutus-lsp.test.ts` — the card matrix (7 shapes), the negative (a fact-free file), the
  absent-graph (`PLUTUS_NO_STORE`), the down-judge (`JEVK5_DOWN`), the token set.
- Both halves: the adversarial fixtures fire their NAMED token; the clean shapes pass with 0 misfire.

---
## §E · DEEP CONTAINER TESTING SUITE + HANDOFF
The 6 rig angles (A1–A6) in a container: the graph mounted read-only, the judge a stub then live,
the receipt log captured. Phase E: the deploy sha match + the auth probe + every token asserted.
**HANDOFF:** this DPL1 → the build waves (06-WAVES); the build agent entry is `scripts/plutus-lsp.ts`.


---
## §Z · THE IMPLEMENTED REALITY (post-audit, 2026-09-30) — the spec/code reconciliation
**The audit (bravo F15) found the spec and the code disagreed. The resolution, with the reasons:**
| the spec said | the code does | why |
|---|---|---|
| D1: P4 alone gates; P5–P7 inform | **min over the ANSWERED deciding clauses [P4,P5,P6]** | the weakest-clause law (a wrongness verdict must not average away a contract breach) |
| D3: the bars 0.85/0.50 | **0.85 / 0.30** | DEMAND_T is the CALIBRATION's DERIVED bar (0.30, the tie-break rule documented in CALIBRATION_v1) |
| D2: the file types .ts + .md | **.ts, .tsx, .js, .md** | the registration's fileTypes (a TS project's .tsx/.js included) |
| S5/S7/S8: no asserting test | **S5 (the receipt) proven in the container; S7 the registration asserted; S8 the no-eviction asserted** | the audit's F1-S1 test added; the container artifacts carry S5 |
**THE RULE:** where this section and the body disagree, THIS section is the implemented truth — the
body is the PLANNING intent, retained as the record.
