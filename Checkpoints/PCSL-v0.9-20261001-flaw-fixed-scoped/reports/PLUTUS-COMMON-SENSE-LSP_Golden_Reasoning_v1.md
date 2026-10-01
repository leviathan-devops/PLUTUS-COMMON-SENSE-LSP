# PLUTUS-COMMON-SENSE-LSP — Golden Reasoning Report v1

**Subject:** the knowledge-graph-anchored LSP intelligence kernel. **Artifact:** the repo @
`902ee22`, dist `3307a3b7a14d6f4b`. **Session window:** 2026-09-29 .. 2026-10-01 (the scaffold →
the round-19 audit). **Author:** the omp agent. **Extraction date:** 2026-10-01.

**Trace sources (trust-ranked):** the write order (47 commits) · the operator's corrections · the
audit findings (19 rounds) · the ship docs' moment-of-work entries.

---

## §1 · THE OBJECT

The artifact is a working knowledge-graph-anchored LSP: 4 machinery files (~1,900 lines), a
46-test battery, a 6/6 derailment suite, 8 checkpoints. The reasoning that produced it lived as a
trajectory across 19 audit rounds and one operator correction (the 150-pip fabrication).

## §2 · THE TRACE (the witnesses)

- **Writes (the order):** `f4b9260` (scaffold) → `5154527` (W1-W5) → `8260183` (W6+P5) → the 4
  audit rounds (`a1d4342`..`22ec325`) → `e16350a` (the JEV relevance kernel) → `795cb20` (the
  info-card rebuild) → `d8f51ae` (the 150-pip purge) → the r9..r19 drive (`308d133`..`60635bc`).
- **Operator corrections:** the 150-pip fabrication (`badd111`/`d8f51ae`); the "muse only" rulings.
- **Audit findings:** 19 rounds; 60+ defects.
- **The abandoned path:** the lexical relevance (replaced by the JEV relevance kernel at `e16350a`).

## §3 · THE TRAJECTORY (the decision sequence)

```
  D1 (the shape: an LSP, not a hook) ──► D2 (the polarity: INFORMS not BLOCKS)
       │
       ├──► D3 (the state FROM DISK, not agent prose)
       │
       └──► D4 (the judge DECIDES relevance — the e16350a fix) ──► D5 (the observable question)
                 │
                 └──► D6 (fail-closed defaults) ──► D7 (never-throw + bounded cards)
                           │
                           └──► D8 (the derailment suite — the objective's proof)
```
The dependency edges: D4 was a CONSEQUENCE of D3 (if the state is from disk, the detector can
afford to be wide and the judge must decide) — not a peer decision. D5 followed D4 (once the judge
decides, the question must be answerable). D6/D7 are the hardening D4's edge-cases forced.

## §4 · THE GOLDEN DECISIONS (each with the 8 fields)

### D1 · THE SHAPE — an LSP, not a hook
- **Options:** (a) an LSP server; (b) a tool-call hook; (c) a prompt-time context injector.
- **Chosen:** (a) an LSP server.
- **Rejected:** (b) a hook — a hook fires on the agent's OWN tool calls (it can see the agent's
  intent, which is gameable); (c) a prompt injector — it cannot see the EDIT.
- **Why it lost:** an LSP fires on the WRITE with the file's real bytes; a hook fires on the agent's
  request (prose); a prompt injector fires before the edit. The LSP sees the ACTUAL change.
- **Counterfactual:** a hook would fire on "I will edit cards.ts" (the agent's claim), not on the
  bytes — the reflex would depend on the agent's honesty.
- **Cost of reversal:** the whole architecture (the graph reader, the frame parser, the cards).
- **Trace witness:** `f4b9260` (the scaffold is an LSP repo) + the sibling gi-lsp/jg-lsp.

### D2 · THE POLARITY — INFORMS, never BLOCKS
- **Options:** (a) inform (diagnostics); (b) block (reject the edit).
- **Chosen:** (a) inform.
- **Rejected:** (b) block — a block needs precision the judge did not have (the calibration F1 0.60).
- **Why it lost:** blocking at 60% precision blocks legitimate edits 40% of the time — worse than
  silence. The informing layer must be trusted before the enforcing layer arms.
- **Counterfactual:** a block path would have shipped a 40%-false-refusal firewall; the agent would
  disable it in a day.
- **Cost of reversal:** the enforcement extension (v2, parked).
- **Trace witness:** the gi-lsp/jg-lsp headers (the polarity is inherited) + the source has no block path.

### D3 · THE STATE FROM DISK — never agent prose
- **Options:** (a) assemble the judge state from disk reads; (b) accept the agent's stated intent.
- **Chosen:** (a) disk reads.
- **Rejected:** (b) agent prose — the agent states what it INTENDS; the edit shows what it DOES.
- **Why it lost:** an agent that lies about its intent (or is wrong) passes a prose-gated check; the
  disk cannot lie.
- **Counterfactual:** a prose-gated judge would pass "I'm setting SL to 40" while the diff sets 150.
- **Cost of reversal:** the whole `buildState`/`loadStore` path.
- **Trace witness:** `store.ts` `loadStore` + `judge.ts` `buildState` (both read from disk).

### D4 · THE JUDGE DECIDES RELEVANCE (the e16350a fix — the intelligence)
- **Options:** (a) the detector decides relevance (token overlap); (b) the judge decides (one noul
  per candidate).
- **Chosen:** (b) the judge.
- **Rejected:** (a) the detector — measured: a MATHEXPR file received the stop-loss + ZFP laws
  (case C). The detector sprayed fuzzy matches; the judge never answered "which laws govern this".
- **Why it lost:** token overlap cannot distinguish "mentions a number" from "governs the number".
- **Counterfactual:** without D4 the LSP emits the wrong laws (the case-C failure) — a
  confident-looking card about a law that does not govern the edit.
- **Cost of reversal:** the relevance pass (the kernel's intelligence).
- **Trace witness:** `e16350a` "THE JEV RELEVANCE KERNEL — the judge now decides relevance, not the regex".

### D5 · THE OBSERVABLE QUESTION (the calibration fix)
- **Options:** (a) the generic question ("does this contradict the law?"); (b) an observable
  question (a direct read of a specific value).
- **Chosen:** (b) observable.
- **Rejected:** (a) generic — measured Δ ~0.0 (no discrimination; the judge must DERIVE the
  contradiction).
- **Why it lost:** derivation is hard for the judge; a direct read is easy (Δ 0.59-0.63).
- **Counterfactual:** the generic question gives no discrimination — the calibration plateau.
- **Cost of reversal:** the OBSERVABLE table + the calibration.
- **Trace witness:** `8260183` (the calibration found 3 defects, incl. the generic question).

### D6 · FAIL-CLOSED DEFAULTS (the hardening)
- **Options:** (a) an unknown tier floats (default IMMUTABLE +2); (b) sinks (SUPERSEDED −2).
- **Chosen:** (b) sinks.
- **Rejected:** (a) float — a corrupt record outranks canon.
- **Counterfactual:** corrupt data leads the ranking; the agent sees a garbage law as the top card.
- **Trace witness:** the r10 audit finding (`validTier` fail-open).

### D7 · NEVER-THROW + BOUNDED CARDS (the hardening)
- **Options:** (a) let a malformed entry throw; (b) guard every renderer + bound every string.
- **Chosen:** (b).
- **Rejected:** (a) — one malformed graph entry loses EVERY card for the file.
- **Trace witness:** the r12/r14/r17 audit findings (cards.ts guards + cap()).

### D8 · THE DERAILMENT SUITE (the objective's proof)
- **Options:** (a) the battery alone; (b) a battery + a derailment suite.
- **Chosen:** (b).
- **Rejected:** (a) — a green battery proves the MECHANISM; the objective ("the agent cannot
  derail") needs REAL derailments through the pipeline.
- **Counterfactual:** without D8 the claim "the LSP catches derailments" rests on unit tests that
  never push a real derailment — the theatrical-verification class.
- **Trace witness:** `scripts/derailment-suite.ts` (D1-D6, 6/6 PASS).

## §5 · THE INCIDENTAL (one line each — completeness, not weight)

- The file is named `SKILL.md` / `README.md` — convention. The section numbers — arbitrary.
- The 7 tokens (law/violation/tier/callers/drift/suspect/stale) — the taxonomy, not a fork.

## §6 · THE OPERATOR RULINGS (verbatim)

**R-1 · THE 150-PIP FABRICATION.** The operator caught a fabricated constant (a test baked
`SL cap 150 pip`; the canon says 36). Trigger: a probe invented a value. Ruling: the real authority
(Bible 4.5) governs; the fabricated constant purged from code + tests (`badd111`/`d8f51ae`). The
GENERAL LAW: **a test fixture must not invent a canon constant; read the authority.**

**R-2 · THE POLARITY (inherited).** The LSP INFORMS; the extension ENFORCES. The general law:
**never arm an enforcement layer before its precision is trusted.**

## §7 · THE IRON LAWS (the invariants the reasoning earned)

- **L1 · ALWAYS assemble the judge state from disk.** VIOLATION: the reflex depends on the agent's honesty.
- **L2 · ALWAYS let the judge decide relevance; the detector only DETECTS.** VIOLATION: the wrong laws.
- **L3 · ALWAYS fail closed** (unknown sinks; unanswered is UNKNOWN; missing jurisdiction is INCONCLUSIVE). VIOLATION: corrupt data leads; a missing answer reads as a "no".
- **L4 · NEVER let a renderer throw.** VIOLATION: one malformed entry loses every card.
- **L5 · ALWAYS bound interpolated strings.** VIOLATION: a hostile graph string blows the payload.
- **L6 · NEVER clear last-good on a transient error.** VIOLATION: the agent loses the canon silently.
- **L7 · ALWAYS use one fetch helper.** VIOLATION: the call sites drift.
- **L8 · NEVER arm a block in the informing layer.** VIOLATION: a 40%-false-refusal firewall.
- **L9 · ALWAYS prove the OBJECTIVE with real derailments, not the battery.** VIOLATION: the theatrical-verification class.
- **L10 · ALWAYS derive a bar from a labeled corpus; never pick it.** VIOLATION: a guess wearing a number.

## §8 · THE RESIDUAL

- **NOT EXTRACTED:** why the chain is exactly 7 nodes (P1..P7) — no witness; the trace shows the
  nodes, not the derivation. PROPOSED: the 7 cover scope/jurisdiction/tier/wrongness×3/drift.
- **NOT EXTRACTED:** the first draft's structure (no write survives; the scaffold is the first commit).
- **NOT IN TRACE:** the operator's reasoning behind the polarity (it is inherited from gi-lsp/jg-lsp).
- **PROPOSED:** the choice of a unix-socket L2 over an HTTP L2 — inferred from the au-engine coupling.

## §9 · THE REPRODUCTION (instrument 3)

A fresh agent given ONLY this report + the boilerplate can reproduce the kernel's KIND: the
`create-knowledge-kernel` skill encodes the phases; the boilerplate carries the machinery. The
reproduction test's result: the skill + boilerplate = the CARRIED extraction; the residual (§8) =
what the report did not cover.
