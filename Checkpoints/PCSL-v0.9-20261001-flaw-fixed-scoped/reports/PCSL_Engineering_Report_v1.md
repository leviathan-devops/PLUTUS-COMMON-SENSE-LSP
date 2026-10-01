# PLUTUS-COMMON-SENSE-LSP — ENGINEERING REPORT v1

**Series:** PCSL (the common-sense LSP lineage; first in series)
**Project:** PLUTUS-COMMON-SENSE-LSP — the reflexive canon LSP
**Date:** 2026-10-01 **Author:** omp agent
**Baseline:** master @ 9d0ab6cd0028
**Bundle:** dist/plutus-lsp.js sha256 `51f95e841cf6247f…` (41,046 bytes)
**Container:** pbk · **Image:** omp-ct:master · **Judge:** jevk5-4b

---

## ONE-PARAGRAPH SUMMARY

PLUTUS-COMMON-SENSE-LSP is a third custom OMP LSP server (a sibling of
gi-lsp and jg-lsp) that makes the Plutus knowledge graph REFLEXIVE. On every
write/edit the OMP runtime's LSP mux spawns `bun scripts/plutus-lsp.ts
--stdio`, the server reads the L1 semantica kg.json (1,836 entities: 1,277
docs + 559 laws; 1,141 relationships) and optionally probes the L2 arsumbris
socket, builds a WIDE candidate net from the hunk (`lawsForHunk`, topK=12),
then hands the candidates to a LOCAL decision kernel — JevK5-4b on `:8090` —
which FIRST decides relevance (one batched noul per candidate,
`relevancePass`) and THEN answers the 7-noul CH-PLUTUS chain (P1 SCOPE … P7
DRIFT) in ONE POST. Pure code turns the returned probabilities into a
verdict (MAX over the answered wrongness clauses {P4,P5,P6}), and `cards.ts`
renders it as LSP diagnostics carrying the governing law's verbatim
statement, its file:line anchor, the tier, and the judge's own measured
probability. It INFORMS; it never blocks (the polarity law). The measured
state: battery 26 pass / 0 fail / 117 expects; 4 live selftests against the
running judge; a 7/7 in-container pressure test; 21 audit findings closed
across rounds 9–10; a sealed checkpoint (PCSL-v0.6). Round-11 audit is
BLOCKED (lane down).

---

## THE LIFECYCLE MAP

```
┌──────────────────────────────────────────────────────────────┐
│OMP runtime — the LSP mux                                     │
│fires didOpen · didChange · didSave · didChangeWatched        │
└──────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│scripts/plutus-lsp.ts — the stdio JSON-RPC server (350 lines) │
│frame parser → analyze(uri) → send(publishDiagnostics)        │
└──────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│pipeline(file, source, useJudge) — the 4-stage chain          │
│L1 DETECT → L2 RELEVANCE → CHAIN P1..P7 → CARDS               │
└──────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│publishDiagnostics(uri, [FactCard…]) → the editor             │
│the canon arrives ON THE WRITE — INFORMS, never blocks        │
└──────────────────────────────────────────────────────────────┘
```

Stage anchors: server entry `scripts/plutus-lsp.ts:161` (`--stdio` guard);
the pipeline `scripts/plutus-lsp.ts:64`; L1 detect
`src/plutus-lsp/store.ts:373`; L2 relevance `src/plutus-lsp/judge.ts:329`;
chain `src/plutus-lsp/judge.ts:115`; verdict `src/plutus-lsp/judge.ts:215`;
cards `src/plutus-lsp/cards.ts:252`.

---

## THE ARCHITECTURE (per module)

### 1 · `src/plutus-lsp/store.ts` — the graph reader (440 lines)

```
┌──────────────────────────────────────────────────────────────┐
│src/plutus-lsp/store.ts  (440 lines) — THE GRAPH READER       │
│resolveRoot(startFile)  walk up ≤12 for a root marker         │
│l1PathFor(root)         env → local kg.json → cache → known   │
│loadStore(startFile)    read kg.json → {laws, rels, root}     │
│lawsForFile(...)        the file's governing laws (union)     │
│lawsForHunk(...)        the WIDE candidate net (topK=12)      │
│declarationsIn(source)  the export/decl needles               │
│callersOf(store, file)  the import-edge blast radius          │
│readL2(socket, ms)      the au-daemon typed counts (opt)      │
│REFUSALS: PLUTUS_NO_STORE · PLUTUS_NO_ROOT                    │
└──────────────────────────────────────────────────────────────┘
```

**Interfaces.** `Store { root, laws: LawEntity[], relationships, total }`;
`LawEntity { id, name, statement, tier, anchor, source }`. Exports at
`store.ts:25,35,62,101,140,209,218,246,309,327,331,340,349,373,430`.
**Data flow.** `startFile → resolveRoot → l1PathFor → JSON.parse(kg.json) →
{laws, rels}`. `lawsForHunk` folds `lawsForFile` (declaration needles) with
a hunk-token scan, filters zero-overlap, ranks `overlap*2 + tierWeight`,
slices topK.
**Failure modes.** Absent kg.json → `PLUTUS_NO_STORE` (never `[]`); no root
marker → `PLUTUS_NO_ROOT`; a corrupt `tier` fails CLOSED to `SUPERSEDED`
(weight −2, so malformed data sinks below canon — `validTier` at
`store.ts:35`).
**Constants.** `TIERS = [IMMUTABLE, EVOLVING, SUPERSEDED]` (`:33`); tier
weight `+2 / +1 / −2` in the ranker (`store.ts:373`); the 4-byte L2 frame
cap 16 MB.

### 2 · `src/plutus-lsp/judge.ts` — the decision kernel (421 lines)

```
┌──────────────────────────────────────────────────────────────┐
│src/plutus-lsp/judge.ts  (421 lines) — THE DECISION KERNEL    │
│health()            probe :8090/health → JEVK5_DOWN           │
│jevk5Fetch()        ONE batched POST (state + questions)      │
│chain(state, nodes) the 7 nouls P1..P7 in ONE pass            │
│relevancePass()     the wide net → judge marks relevance      │
│partitionByRelevance  (relevant, rejected, unknown)           │
│verdict(v)          PURE CODE: MAX over {P4,P5,P6}            │
│buildState()        the evidence text FROM DISK               │
│BARS: throwT 0.85 (policy) · demandT 0.30 (derived)           │
└──────────────────────────────────────────────────────────────┘
```

**Interfaces.** `CHAIN` = the 7 nodes (`judge.ts:29–36`); `JudgeVector { ok,
answers, reason, requests, latencyMs }`; `Verdict { kind, weakest, vector,
reason }` with kind ∈ {VIOLATION, SUSPECT, DRIFT, LAW, INCONCLUSIVE,
JUDGE_DOWN}.
**Data flow.** `state (from disk) → jevk5Fetch → answers{NodeId: p} →
verdict → kind`. The relevance pass runs BEFORE the chain: `laws →
per-candidate noul → p[] → partitionByRelevance` at bar 0.30.
**Failure modes.** Judge down → `JEVK5_DOWN` (named, never fabricated);
unanswered clause → UNKNOWN, never 0 (`verdict` at `judge.ts:215`);
duplicate nodes deduped before the answer-count check (`chain` at
`judge.ts:115`).
**Constants.** `THROW_T` 0.85 (policy), `DEMAND_T` 0.30 (derived,
CALIBRATION_v1), `RELEVANCE_T` 0.30 (swept). All env-overridable and
validated (`bar()` at `judge.ts:189`).

### 3 · `src/plutus-lsp/cards.ts` — the card renderer (264 lines)

```
┌──────────────────────────────────────────────────────────────┐
│src/plutus-lsp/cards.ts  (264 lines) — THE CARD RENDERER      │
│lawCard()     one card per law + its relevance                │
│verdictCard() VIOLATION | DRIFT | SUSPECT | STALE             │
│callersCard() the import-edge blast radius (measured)         │
│staleCard()   a named refusal → a LOUD card                   │
│fileCards()   the full set for one file                       │
│7 TOKENS: law · violation · tier · callers · drift ·          │
│          suspect · stale                                     │
└──────────────────────────────────────────────────────────────┘
```

**Interfaces.** `FactCard { shape, title, rows, severity, source, total }`;
`PLUTUS_LSP_TOKENS` (7, `cards.ts:24`); `SEVERITY =
{Error:1,Warning:2,Information:3, Hint:4}` (`:35`). `toDiagnostic(card, src,
line)` lives in the server.
**Data flow.** `JudgedLaw[] + Verdict → lawCard[] + verdictCard +
callersCard → FactCard[]`.
**Failure modes.** No measured law → `null` (silence, never a guess);
Infinity/NaN relevance → rendered `relevance unread` (never `Infinity`); a
tie at the top → the card DOWNGRADES to SUSPECT (never asserts a guessed
attribution).
**Constants.** The 7 token strings; the epsilon tie `1e-9` (`cards.ts:110`).

### 4 · `scripts/plutus-lsp.ts` — the stdio server (350 lines)

```
┌──────────────────────────────────────────────────────────────┐
│scripts/plutus-lsp.ts  (350 lines) — THE STDIO SERVER         │
│frame parser   Content-Length → JSON-RPC frames               │
│fileOf(uri)    file:// → path (decode-last, UNC kept)         │
│analyze(uri)   pipeline → toDiagnostic → send                 │
│scheduleAnalyze 250ms debounce, one in-flight per uri         │
│send(obj)      serialized write chain, one resolver           │
│--selftest <file>  the L2 harness · --stdio  the server       │
└──────────────────────────────────────────────────────────────┘
```

**Interfaces.** `pipeline(file, source, useJudge) → PipelineResult { tokens,
cards, refused, vector, relevance }`; `toDiagnostic(card, src, line)`
(`:40`).
**Data flow.** `stdin bytes → frame loop → JSON-RPC msg → dispatch → analyze
→ send`. The L2 probe is fire-and-forget (`void readL2(...).then(receipt)`,
`:83`).
**Failure modes.** Oversize frame → `FRAME_SKIP`/`STDIN_OVERSIZE_RESET`;
transient analyze error → sends NOTHING (keeps last-good, never wipes with
`[]`); dead stdout → `SEND_DEAD_STREAM` short-circuit; pipeline throw →
lexical retry, then double-fault keep.
**Constants.** `MAX_STDIN` 32 MB (`:248`); debounce 250 ms; send timeout
5000 ms.

---

## THE CALL TREE (hot path, from the code)

```
┌──────────────────────────┐
│ pipeline                 │
│ scripts/plutus-lsp.ts:64 │
└────────────┬─────────────┘
             │
             ▼
  loadStore            src/plutus-lsp/store.ts:140
    resolveRoot        src/plutus-lsp/store.ts:62
    l1PathFor          src/plutus-lsp/store.ts:101
  lawsForHunk          src/plutus-lsp/store.ts:373
    lawsForFile        src/plutus-lsp/store.ts:349
    tokensOf           src/plutus-lsp/store.ts:340
    wordRe             src/plutus-lsp/store.ts:331
  relevancePass        src/plutus-lsp/judge.ts:329
    health             src/plutus-lsp/judge.ts:90
    jevk5Fetch         src/plutus-lsp/judge.ts:54
  chain                src/plutus-lsp/judge.ts:115
    jevk5Fetch ~       src/plutus-lsp/judge.ts:54
  verdict              src/plutus-lsp/judge.ts:215
  fileCards            src/plutus-lsp/cards.ts:252
    lawCard            src/plutus-lsp/cards.ts:75
    verdictCard        src/plutus-lsp/cards.ts:110
    callersCard        src/plutus-lsp/cards.ts:213
```

`~` marks a second caller of the same symbol (chain and relevancePass share
`jevk5Fetch` — the single fetch helper, so the two paths cannot drift).

---

## THE FILE TREE

```
┌──────────────────────────────────────────────────────────────┐
│PLUTUS-COMMON-SENSE-LSP/                                      │
│├─ scripts/plutus-lsp.ts  stdio server                        │
│├─ src/plutus-lsp/                                            │
││  ├─ store.ts   graph reader                                 │
││  ├─ judge.ts   the decision kernel                          │
││  └─ cards.ts   the card renderer                            │
│├─ tests/  3 files, 26 tests                                  │
│├─ dist/plutus-lsp.js  the built bundle                       │
│├─ Checkpoints/PCSL-v0.6-…  the seal                          │
│├─ reports/  calibration + CT results                         │
│├─ ship_docs/  the 6 docs                                     │
│└─ context_management/  the 11 canon docs                     │
└──────────────────────────────────────────────────────────────┘
```

---

## THE RUNTIME TRACE (the agent edits `src/plutus-lsp/cards.ts`)

### PART 1 — TIMELINE (context sources converging)

```
T-BEFORE: the canon + the judge + the registration exist
┌───────────────┐   ┌──────────────────────────────────────┐
│ kg.json       │──►│ L1 semantica: 1836 ents / 559 laws   │
│ MASTER_CONTEXT│   │ 1141 relationships                   │
└───────────────┘   └──────────────────────────────────────┘
┌───────────────┐   ┌──────────────────────────────────────┐
│ JevK5 :8090   │──►│ jevk5-4b-v0.2-Q8_0  (health ok:true) │
└───────────────┘   └──────────────────────────────────────┘
┌───────────────┐   ┌──────────────────────────────────────┐
│ lsp.json      │──►│ plutus-lsp registered (sibling of    │
│ ~/.omp/agent  │   │ gi-lsp + jg-lsp)                     │
└───────────────┘   └──────────────────────────────────────┘
```

### PART 2 — STEP-BY-STEP EXECUTION TRACE

```
STEP 1 · the mux fires
  textDocument/didChange { uri: file://…/cards.ts, text }
  → the server buffers, splits the Content-Length frame, JSON.parse

STEP 2 · analyze(uri)
  fileOf(uri) → /…/PLUTUS-COMMON-SENSE-LSP/src/plutus-lsp/cards.ts
  scheduleAnalyze → 250ms debounce → analyze

STEP 3 · L1 DETECT
  loadStore(file) → 559 laws, 1141 rels
  lawsForHunk(store, file, decls, hunk, 12) → 12 candidates

STEP 4 · L2 RELEVANCE  (the judge decides WHAT governs)
  relevancePass(candidates, file, hunk)
  → jevk5Fetch(state, {R1..R12}) → ONE POST
  → receipt: RELEVANCE judged=12/12 dropped=0

STEP 5 · CHAIN  (the judge answers the 7 nouls)
  chain(buildState(all, hunk), [P1..P7]) → ONE POST
  → answers {P1..P7} each a number in [0,1]

STEP 6 · VERDICT  (pure code decides)
  verdict(v): wrong = MAX over answered {P4,P5,P6}
  → kind = VIOLATION | DRIFT | SUSPECT | INCONCLUSIVE

STEP 7 · CARDS + DELIVER
  fileCards(judgedLaws, n, v, callersOf(store,file), judged, file)
  → send publishDiagnostics(uri, [FactCard…])
```

### PART 3 — ROUTING DECISION (the relevance gate evaluates)

```
PER-CANDIDATE noul (same state, ONE batch):
  R1: MECH-TOKEN-08 govern cards.ts?  → p 0.87  ≥ 0.30 → RELEVANT
  R2: COMP-ORCHESTRATOR govern it?    → p 0.22  < 0.30 → rejected
  R3: LAW-PAPER-ANCHOR-BAN govern?    → p 0.36  ≥ 0.30 → RELEVANT
  … R12

IF the judge is DOWN:
  → fail-CLOSED on noise: keep the lexical top-3, mark p=-1
  → the card reads 'lexical, no judge' (never a fabricated number)
```

### PART 4 — RESULT DELIVERY

```
publishDiagnostics → the OMP editor renders the card
  shape=VIOLATION severity=Error source=plutus/violation
  title: VIOLATION — this change contradicts MECH-TOKEN-08 (P6=0.868)
  rows:  LAW: <the law's verbatim statement>
         SOURCE: <the bible>:line
         YOU ARE EDITING: src/plutus-lsp/cards.ts
         VECTOR: P1=0.90  P2=0.95  …  P6=0.868

the agent reads the canon BEFORE the edit lands (INFORMS, never blocks)
```

### PART 5 — OBSERVER ACTIVITY (the safety layer, incl. the quiet case)

```
OBSERVER — the forensic receipt (forensic/lsp-receipts.log):
  INIT pid=…  FRAME initialize  FRAME textDocument/didChange
  RELEVANCE judged=12/12 dropped=0
  PUBLISH n=13 tokens=plutus/law,plutus/violation verdict=VIOLATION
  L2 nodes=1323 edges=1162   (or the named L2 reason)

QUIET CASE — a fact-free file:
  lawsForHunk → 0 candidates → receipt 'NO-LAW'
  → cards [] → publishDiagnostics [] (no noise)
  ZERO cards. The silence IS the proof the detector is precise.
```

---

## THE MECHANISM (pseudocode, control shape)

```
┌──────────────────────────────────────────────────────────────┐
│pipeline(file, source, useJudge)                              │
│  store = loadStore(file)                                     │
│  if no store → staleCard(refusal), return                    │
│  decls = declarationsIn(source)                              │
│  hunk  = source.slice(0, 1200)                               │
│  cands = lawsForHunk(store, file, decls, hunk, 12)           │
│  if cands empty → return NO card                             │
│  if useJudge                                                 │
│    rel = relevancePass(cands, file, hunk)                    │
│    if rel.ok → all = partitionByRelevance(rel).relevant      │
│    else      → all = cands[0..3], p=-1 (degraded)            │
│    res = chain(buildState(file, all, hunk), P1..P7)          │
│    v   = verdict(res)                                        │
│  cards = fileCards(judged, n, v, callersOf(store,file))      │
│  return { tokens, cards, refused, vector, relevance }        │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│verdict(v)                                                    │
│  if not v.ok → JUDGE_DOWN(reason)                            │
│  if P2 answered and P2 < demandT → INCONCLUSIVE              │
│  wrong = MAX over answered {P4, P5, P6}                      │
│  if no wrongness clause answered → INCONCLUSIVE              │
│  if wrong >= throwT → VIOLATION                              │
│  if P7 answered and fires → DRIFT                            │
│  if wrong >= demandT → SUSPECT                               │
│  else → LAW (informs only)                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## THE BUG LEDGER

| # | bug | root cause | fix |
|---|---|---|---|
| 01 | laws overwritten | adapter: all type:doc | re-added 559 |
| 02 | health() froze env | export const at import | read per call |
| 03 | matcher over-matched | 'file' is 4 chars | +STOPWORDS |
| 04 | no discrimination | 12 fuzzy laws diluted | +lawsForHunk |
| 05 | graph gate fired | 3 edits, no query | symlink+ripwire |
| 06 | 2 ReferenceErrors | helpers never defined | resolve+declare |
| 07 | validTier fail-open | default = top tier | SUPERSEDED -2 |
| 08 | false ANSWER_COUNT | raw vs deduped | jevk5Fetch reuse |
| 09 | catch wiped state | published [] | send nothing |
| 10 | send leaked listens | once() not removed | callback resolver |
| 11 | warning wrong file | anchor-derived | targetFile |

### Detail box — BUG-06 (the two CRITICAL ReferenceErrors)

```
┌──────────────────────────────────────────────────────────────┐
│BUG-06 · knownAbs + MAX_STDIN                                 │
│WHAT  two paths throw ReferenceError at runtime               │
│WHY   knownAbs() had no import/def; MAX_STDIN was             │
│      read at :261 but declared nowhere                       │
│WHY GREEN  the suite never sets the env flag and              │
│      never sends an oversize frame                           │
│FIX   resolve(rel) (entries are absolute); declare            │
│      const MAX_STDIN = 32MB before the handler               │
│VERIFY battery 26/0 + both lines grepped present              │
└──────────────────────────────────────────────────────────────┘
```

### Detail box — BUG-11 (the warning named the wrong file)

```
┌──────────────────────────────────────────────────────────────┐
│BUG-11 · YOU ARE EDITING named the canon                      │
│WHAT  the row said the agent was editing the bible            │
│WHY   anchorFile derived from law.anchor                      │
│FIX   targetFile threaded pipeline → fileCards →              │
│      verdictCard; the row names the target                   │
│VERIFY live selftest on cards.ts →                            │
│      'YOU ARE EDITING: src/plutus-lsp/cards.ts'              │
└──────────────────────────────────────────────────────────────┘
```

---

## THE TESTING LEDGER

| test | scope | how | result |
|---|---|---|---|
| L1 unit | pure fns + cards | `bun test tests/` | 26 pass / 0 fail |
| L2 live ×4 | real graph + live JevK5 | `--selftest <f>` | 4× SELFTEST OK |
| L3 built | the bundle | `bun build` + sha | 51f95e841cf6247f |
| CT pressure | 5 scenarios + 2 adv | container `pbk` | 7/7 PASS |

### The 4 live selftests (measured this session)

```
store.ts   → 11 cards: 10 LAW + 1 SUSPECT
judge.ts   → 13 cards: 12 LAW + 1 SUSPECT
script.ts  → 12 cards: 11 LAW + 1 SUSPECT
cards.ts   → 13 cards: 12 LAW + 1 VIOLATION (MECH-TOKEN-08 P6=0.868)
```

### The container pressure test (pbk / omp-ct:master)

```
S1 absent graph     → PLUTUS_NO_STORE      PASS
S2 dupe nodes       → fully answered /1    PASS
S3 no-clear         → no `diagnostics:[]`  PASS
S4 Infinity         → 'relevance unread'   PASS
S5 target warning   → YOU ARE EDITING: …   PASS
A1 malformed frame  → serverInfo (ALIVE)   PASS
A2 down judge       → JEVK5_DOWN           PASS
Phase-E breaker: 10/10 · artifact: .omp/container-test-results.json
```

---

## THE SPEC MANDATE → ENGINEERING MAP

| the operator said | what was built | evidence |
|---|---|---|
| full knowledge graphs | L1 kg.json + L2 socket | `jq` counts |
| LSP built CLEAN | 21 findings closed, battery 26/0 | BUILD_REPORT §7 |
| jev as decision kernel | relevancePass + chain | 4 live selftests |
| real-time relevance | debounced analyze on every write | receipt FRAME |
| inject graph/info cards | lawCard/verdictCard | live card JSON |
| the agent cannot derail | canon before the edit | VIOLATION card |

---

## THE NUMBERS (every value measured)

```
┌──────────────────────────────────────────────────────┐
│METRIC                   VALUE               SOURCE   │
├──────────────────────────────────────────────────────┤
│battery pass / fail      26 / 0              bun test │
│expect() calls           117                 bun test │
│source lines (4 files)   1475                wc -l    │
│test lines (3 files)     313                 wc -l    │
│bundle bytes             41046               ls -l    │
│bundle sha256 (16)       51f95e841cf6247f    sha256sum│
│L1 entities              1836                jq       │
│L1 laws                  559                 jq       │
│L1 relationships         1141                jq       │
│L2 sockets live          2                   ls       │
│judge model              jevk5-4b-v0.2       :8090    │
│audit round-10           2 crit / 10 high    ocr      │
│audit round-11           BLOCKED (lane)      ocr      │
│container pressure       7/7 PASS            ct       │
│checkpoint               PCSL-v0.6-20260930  ls       │
└──────────────────────────────────────────────────────┘
```

---

## THE FILE MANIFEST

```
┌──────────────────────────────────────────────────────────────┐
│the file                          role                        │
│scripts/plutus-lsp.ts             stdio server                │
│src/plutus-lsp/store.ts           graph reader                │
│src/plutus-lsp/judge.ts           decision kernel             │
│src/plutus-lsp/cards.ts           card renderer               │
│tests/plutus-lsp.test.ts          W1 gate                     │
│tests/judge-cards.test.ts         W2+W3 gate                  │
│tests/adversarial.test.ts         A1..A14 sweep               │
│dist/plutus-lsp.js                the built bundle            │
│~/.omp/agent/lsp.json             the registration            │
│Checkpoints/PCSL-v0.6-…           the seal                    │
│ship_docs/ (6)                    build/debug/test            │
│context_management/ (11)          the canon                   │
└──────────────────────────────────────────────────────────────┘
```

---

## WHAT'S NEEDED FROM THE OPERATOR

1. **Restart a TUI session** to arm the LSP (it binds at session
construction) — the live-TUI render proof is the one gate not runnable from
inside a session.
2. **The audit lane** (`127.0.0.1:4097`, the go-session-proxy) must recover
before the round-11 audit can re-run — BLOCKED, not PASS.
3. **A ruling on v2** — the enforcement extension (the block) is deferred;
the LSP informs only. Arming a block needs the precision trusted first.

---

## THE HONEST GAPS

| gap | state | why |
|---|---|---|
| live-TUI render | PENDING | LSP binds at session construction |
| round-11 audit | BLOCKED | the ocr lane :4097 is down |
| calibration corpus | 8 items | a 50+ corpus stabilizes the bar |
| enforcement (v2) | PARKED | the block waits on trusted precision |
| `plutus/tier` token | declared-dead | folded into law cards |
| L2 in the pipeline | fire-and-forget | receipt only, non-blocking |

**The polarity invariant holds:** a block path in the server is a violation.
The server publishes diagnostics; the extension (v2) is the only place a
block may live.

