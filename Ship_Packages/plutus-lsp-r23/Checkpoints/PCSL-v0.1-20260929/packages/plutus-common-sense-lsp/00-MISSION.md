# 00 · THE MISSION — the Plutus-Common-Sense LSP

## THE MISSION (verbatim)
> "tell me how we can build a Plutus-Common-Sense LSP that properly enforces these knowledge
> graphs through plutus build w/ Jev intelligence" — and: "ensure this properly forks into its own
> repo so it doesn't get lost inside of the plutus agent".

## THE RESTATED UNDERSTANDING
Build a third custom LSP server (beside `gi-lsp` and `jg-lsp`) that makes the **Plutus knowledge
graphs reflexive**: on every write/edit to a Plutus file, it reads the graph (L1 semantica + L2
arsumbris), asks the **live JevK5 judge** whether the edit obeys the canon, and surfaces the
governing law as an LSP diagnostic — before the agent can derail. It **INFORMS**; it never blocks
(the block is an extension). It lives in its **own repo**, a sibling of `Jev_Gates` and
`Graph_Intelligence` — never inside the Plutus agent tree.

## THE SCALE CLASS
**system** (an infra spine — a long-running daemon, not a library). The design is ARCHITECTURAL.

## THE NON-NEGOTIABLES
1. **The polarity law** — the LSP INFORMS, the extension ENFORCES; never the reverse.
2. **The state builder** — every judge state field is READ FROM DISK BY CODE, never typed by the agent.
3. **The anti-gaming shape** — the LSP is read-only; it never mutates a record or re-seals.
4. **The reflex** — zero tool calls, zero agent decisions; OMP's runtime drives it on every write/edit.
5. **The own repo** — the operator's mandate: a sibling of `Jev_Gates` / `Graph_Intelligence`.

## THE FORBIDDEN LIST
- No blocking from the LSP (the polarity violation).
- No agent-supplied state (the gameable-state class).
- No phantom card (a fact asserted, not measured).
- No sibling eviction (the third server must not break `gi-lsp` / `jg-lsp`).
- No build inside the Plutus agent tree.

## THE OPEN QUESTIONS (max 5 — none block the architecture)
1. **D4** — the graph read: L1 `kg.json` only (fast) vs L1+L2 socket (richer)? *Default: L1+L2, L1-only fallback.*
2. **D5** — the enforcement half: build the extension now or defer to v2? *Default: defer — v1 INFORMS.*
3. The `.md` canon handling — what is a diagnostic on a canon doc? *Default: a drift card.*
