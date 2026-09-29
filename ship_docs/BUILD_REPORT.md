# BUILD_REPORT — PLUTUS-COMMON-SENSE-LSP (the what-was-built record)

**Date:** 2026-09-29 · **The repo:** PLUTUS-COMMON-SENSE-LSP (own .git) · **The commits:** f4b9260, 5154527, 8260183

## §1 · WHAT WAS BUILT (the deliverable)
A third custom LSP server, `plutus-lsp`, that makes the Plutus knowledge graphs REFLEXIVE:
on every write/edit to a Plutus file it reads the graph (L1 semantica + L2 arsumbris), judges
the edit via JevK5 (CH-PLUTUS, the 5-of-7 nouls), and surfaces the governing law as an LSP
diagnostic — before the agent can derail. It INFORMS; it never blocks (the polarity law).

## §2 · THE FILES (the deployed set)
| the file | the role | the lines |
|---|---|---|
| `scripts/plutus-lsp.ts` | the stdio JSON-RPC server + --selftest + the receipt | ~150 |
| `src/plutus-lsp/store.ts` | the graph reader (L1 kg.json + L2 socket) + the named refusals | ~190 |
| `src/plutus-lsp/judge.ts` | CH-PLUTUS (the 7 nouls) + OBSERVABLE + the verdict | ~150 |
| `src/plutus-lsp/cards.ts` | the 7 tokens + FactCard + toDiagnostic | ~130 |
| `tests/*.test.ts` | the W1/W2/W3 gates + the 8-angle adversarial sweep | ~180 |
| `tests/calibration/*` | the labeled corpus + the derivation harness | ~90 |
| `~/.omp/agent/lsp.json` | the registration (beside gi-lsp + jg-lsp) | 1 entry |

## §3 · THE VERIFICATION (every tier, with its artifact)
| tier | what | the artifact |
|---|---|---|
| L0 | the typecheck | `bun test` loads + runs (the TS is executed, not just parsed) |
| L1 | the unit | `bun test tests/` → **17 pass / 0 fail** |
| L2 | the script test (the real modules, the real graph, the live judge) | `--selftest mirror.ts` → 2 cards + 5 live nouls |
| L3 | the driven server (the real stdio frames) | `/tmp/plutus-lsp-receipts.log` → `PUBLISH n=3 … verdict=SUSPECT` |
| L4 | the live TUI | **PENDING** — the LSP binds at session construction (T1) |

## §4 · THE CALIBRATION (the derived bar)
`reports/CALIBRATION_v1.md` → **bar 0.30 · F1 0.60 · precision 0.50 · recall 0.75** on the
8-item corpus (4 violations + 4 cleans). Reproducible (`bun tests/calibration/calibrate.ts`).

## §5 · THE DEFECTS FOUND + FIXED (5)
1. the L1 law entities overwritten by the adapter rebuild → re-added (564).
2. health() captured the env at module load → read at call time.
3. the token matcher over-matched on generic words → +STOPWORDS.
4. the calibration's state diluted the signal → +lawsForHunk (ranked, top-3).
5. the generic question required derivation → +OBSERVABLE templates.

## §6 · THE HONEST GAPS
- The live-TUI render proof is PENDING (a session restart is needed).
- The calibration corpus is 8 items (a 50+ corpus stabilizes the bar).
- The `plutus/callers` token is declared but not yet emitted.
- The enforcement extension (the block) is deferred to v2 (D5).
