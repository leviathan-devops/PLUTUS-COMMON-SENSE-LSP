# BOILERPLATE MANIFEST — plutus-lsp-r23/boilerplate

The reusable knowledge-LSP-kernel machinery, byte-identical to the source `src/` + `scripts/`,
with the CONFIGURABLE SCOPE built in. A fresh project re-hosts by copying `machinery/`.

## Provenance
Canonical store: `/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/agent_plugin_boilerplates/knowledge-lsp-kernel-boilerplate`.
Source: the r23 security-hardened bundle.

## Files (path | SHA-16)

- `BOILERPLATE_MANIFEST.md` | `72eb33f434857fb3`
- `README.md` | `219542e682939529`
- `machinery/cards.ts` | `6d20afe17709b72c`
- `machinery/judge.ts` | `8ea6084de06cf048`
- `machinery/server.ts` | `8cf8fa2833dcb1bb`
- `machinery/store.ts` | `a66016bc0cc9945c`
- `battery/adversarial.test.ts` | `510ec3190d0de440`
- `battery/derailment-suite.ts` | `aa5a1c72ff49ed25`
- `battery/judge-cards.test.ts` | `dc1b8f5883a9d86e`
- `battery/plutus-lsp.test.ts` | `8f7fcfef834ba864`
- `references/CALIBRATION_v1.md` | `e2c7ceb983ef69ac`
- `references/DECISION_KERNEL.md` | `3bd2afd1ecb13251`
- `references/GRAPH_BUILD.md` | `9e11d897be73cf8a`
- `references/LSP_DEPLOYMENT_CONTRACT.md` | `8a361e01ecd349e0`
- `references/MISFIRES.md` | `15b0b75ba2717904`
- `references/RELEVANCE_KERNEL.md` | `4a0ab93d127c322b`
- `templates/lsp-entry.json` | `b3d78f60962fed1f`

## The reuse recipe (a fresh project re-hosts in 4 steps)

1. Copy `machinery/{store,judge,cards,server}.ts` into the project.
2. Rename the `PLUTUS_*` refusals to `{YOURAPP}_*`.
3. Set `PLUTUS_LSP_SCOPE="YOURPROJECT"` (the path segment) + replace the OBSERVABLE table + point `KNOWN_L1_PATHS` at your graph.
4. Register in `~/.omp/agent/lsp.json` + copy `templates/lsp-entry.json`.

## The laws carried (verbatim)

L1 named-refusal · L2 detector/decider split · L3 fail-closed defaults · L4 never-throw cards ·
L5 bounded output · L6 one-fallback policy · L7 single helper · L8 polarity (INFORMS) ·
L9 scope (configurable) · L10 law-bearing resolution. See references/MISFIRES.md + the skill.

## Deltas from the source
None (verbatim). LEFT OUT: the Plutus OBSERVABLE table + the canon paths.
