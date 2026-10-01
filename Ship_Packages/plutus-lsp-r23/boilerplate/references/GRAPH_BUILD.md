# GRAPH_BUILD — building the knowledge graph that anchors the kernel

The kernel reads a graph; the graph is the substrate. This is the proven pipeline from the PLUTUS
build (via the `create-knowledge-graphs` skill + the arsumbris/semantica stack).

## The two layers

```
L1 · SEMANTICA (the typed entity store)
    a single kg.json: { entities: [...], relationships: [...] }
    entities: { id, type, name, statement, tier, anchor, source }
    types:    "law" (the rules) · "doc" (the corpus) · "component" (the code units)
    the LSP reads this. Aim: hundreds of laws.

L2 · ARSUMBRIS (the curated typed graph)
    the au-engine daemon (a unix socket), the typed+linked graph
    the LSP probes it (optional, fire-and-forget) for typed counts
```

## The pipeline (5 stages)

### Stage 1 — L1 ingest (the markdown/code adapter)
Read the source corpus (bibles, specs, laws) and emit typed entities. The PLUTUS L1:
`{ "entities": [ {id, type, name, statement, tier, anchor, source} ], "relationships": [ {source, target, type} ] }`.
- **`type: "law"`** — the rules. `name` = the law id (e.g. `IRON-01`, `MECH-TOKEN-08`);
  `statement` = the rule text (the card shows this verbatim); `anchor` = `file:line` into the bible;
  `tier` in `{IMMUTABLE, EVOLVING, SUPERSEDED}`.
- **`type: "doc"`** — the corpus (the docs the laws live in).
- **`relationships`** — the edges. The kernel's `callersOf` + relevance need edges; a node-only
  graph is a list.

### Stage 2 — L2 arsumbris (the typed graph)
The `arsumbris` engine builds a curated, typed, LINKED graph over the same corpus. The review gates:
- **`diagnostic_counts(scope:all)` must reach 0** — a dangling anchor, an unbacked number, an empty
  anchor, a stale constant each fires a diagnostic.
- **The wikilink → source-hub resolution** — the single most important graph fix: every card links
  to a SOURCE HUB, and the hub links back to its cards. Measured on PLUTUS: edges 27 → 1162.

### Stage 3 — the review gates
Run the arsumbris diagnostics; fix every non-zero count. A graph with diagnostics is a graph with
lies that propagate into every card.

### Stage 4 — the map + the wiring
- **The human-readable map** — regenerate it from the live engine (verbatim cards + ToC links +
  connection footnotes). See `plutus-kg-map`.
- **The MCP kernel binding** — wire the graph to the agent via the MCP kernel so the agent can
  query it.

### Stage 5 — the LSP binding
Point `KNOWN_L1_PATHS` (in `store.ts`) at the built `kg.json`. Set `PLUTUS_L1_PATH` for tests.
Register the LSP (see the boilerplate README step 4).

## The five graph lessons (from the PLUTUS build)

1. **EDGES ARE THE VALUE, NOT NODES.** A graph with 735 isolated nodes is a list. The source-hub
   resolution (every card → its hub → back) took edges from 27 to 1162. Without edges, relevance
   and callers cannot work.
2. **A LAW WITHOUT AN ANCHOR IS A CLAIM.** The card shows `SOURCE: <anchor>`; an empty anchor means
   the agent cannot verify the law. Anchor every law to a `file:line`.
3. **`tier` WEIGHTS RANK (fail-closed).** `IMMUTABLE` +2, `EVOLVING` +1, `SUPERSEDED` −2 (the
   default for an unknown tier). A corrupt tier must sink, never float.
4. **`diagnostic_counts` MUST REACH 0.** Every non-zero diagnostic is a defect that propagates.
5. **BUILD THE GRAPH FOR THE LSP's QUESTIONS.** The kernel asks observable questions ("does the
   edit change the ZFP threshold?"); the graph must carry the ZFP law WITH its value. The graph and
   the OBSERVABLE table are co-designed — a law the kernel asks about must exist in the graph.

## The prereq skills (the full pipeline)
- `create-knowledge-graphs` — the end-to-end (L1 semantica + L2 arsumbris + MCP + gates + map).
- `arsumbris-kg-setup` — stand up the engine + daemon + MCP + host UI.
- `arsumbris-markdown-corpus-graph` — the markdown adapter + the source-hub link-resolution law.
- `arsumbris-canon-graph-build` — the card → source-hub pattern (edges 27 → 1162).
- `semantica-*` (MCP tools) — the L1 typed store.
- `kg-graph-build-sop-gotchas` — the measured traps (moved tree, ghost paths, wikilink-to-ID).

## The graph shape (a worked slice)

```
{
  "entities": [
    { "id": "IRON-01", "type": "law", "name": "IRON-01",
      "statement": "ZFP threshold = 45 -- the tipping point",
      "tier": "IMMUTABLE", "anchor": "PLUTUS_MASTER_CONTEXT/bible40.md:2997",
      "source": "MASTER_CONTEXT" },
    { "id": "doc::bible40", "type": "doc", "name": "bible40", ... }
  ],
  "relationships": [
    { "source": "doc::bible40", "target": "IRON-01", "type": "links" }
  ]
}
```
The kernel's `lawsForHunk` scans `name + id + statement`; `callersOf` follows the `links` edges;
`verdict` weights by `tier`. A graph in this shape is all the kernel needs.
