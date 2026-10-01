#!/usr/bin/env bun
/**
 * THE DERAILMENT-PATTERN SUITE — does the LSP actually CATCH the derailments it exists for?
 *
 * Each D-case is a REAL Plutus derailment (the canon's laws vs an edit that violates them).
 * The LSP must emit the right VERDICT + TOKEN for each, and must stay SILENT on the clean case.
 * passToken = the required token/verdict in the OUTPUT; failToken = a token that must NOT appear.
 *
 *   bun scripts/derailment-suite.ts            # the LIVE judge (:8090)
 *   bun scripts/derailment-suite.ts --no-judge # lexical only (the offline mode)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = `${HERE}/..`;
const NOJUDGE = process.argv.includes("--no-judge");

// the pipeline is exported by the server module
const { pipeline } = await import(`${HERE}/plutus-lsp.ts`);

interface Case {
  id: string;
  what: string;              // the derailment
  file: string;              // the file being edited (drives the L1 detector)
  hunk: string;              // the edit that should trip the law
  passToken: string;         // MUST appear in the output (a token, a shape, or a title fragment)
  failToken?: string;        // MUST NOT appear
  clean?: boolean;           // a CLEAN edit — the LSP must stay SILENT (the precision proof)
}

// THE SCOPE-AWARE FIXTURE ROOT (2026-10-01) — the scope gate silences files outside a
// Plutus-scoped tree, so the suite's fixtures live under a root carrying `plutus.yaml`
// (the explicit scope marker). The derailment hunks are unchanged; only the carrier moves.
const FIXTURE_ROOT = "/tmp/pcsl-derailment";
mkdirSync(`${FIXTURE_ROOT}/.omp/graph-intelligence/layers/semantica`, { recursive: true });
writeFileSync(`${FIXTURE_ROOT}/plutus.yaml`, "scope: plutus\n");           // the SCOPE marker
writeFileSync(`${FIXTURE_ROOT}/tsconfig.json`, "{}");                       // the ROOT marker
// THE HERMETIC LAW FIXTURE — the suite carries its OWN mini-Plutus graph (no host dependency):
// one law per derailment class, each with the tokens the hunks carry.
const LAWS = [
  { id: "D17", type: "law", name: "SL-CEILING", statement: "stop-loss ceiling = 36 pips HARD; SL cap in pips never exceeds 36", tier: "IMMUTABLE", anchor: "engine3:307", source: "MASTER_CONTEXT" },
  { id: "ONE-TP", type: "law", name: "SINGLE-TP", statement: "exactly ONE take-profit per trade; no TP1 TP2 TP3 ladder", tier: "IMMUTABLE", anchor: "bible40:2997", source: "MASTER_CONTEXT" },
  { id: "PAIR-FMT", type: "law", name: "PAIR-FORMAT", statement: "currency pairs use the slash form EUR/USD, never EURUSD", tier: "IMMUTABLE", anchor: "bible12:88", source: "MASTER_CONTEXT" },
  { id: "RRR-1", type: "law", name: "CATEGORY-RRR", statement: "risk-reward ratio is category-specific; a flat RRR across categories is forbidden", tier: "EVOLVING", anchor: "bible27:410", source: "MASTER_CONTEXT" },
  { id: "IRON-01", type: "law", name: "ZFP-THRESHOLD", statement: "ZFP threshold = 45; changing the zone-formation threshold is a canon breach", tier: "IMMUTABLE", anchor: "bible40:2997", source: "MASTER_CONTEXT" },
];
writeFileSync(`${FIXTURE_ROOT}/.omp/graph-intelligence/layers/semantica/kg.json`,
  JSON.stringify({ entities: LAWS, relationships: [] }));
const FIXTURE_GRAPH = `${FIXTURE_ROOT}/.omp/graph-intelligence/layers/semantica/kg.json`;
const F = (n: string) => {
  const dest = `${FIXTURE_ROOT}/${n}`;
  try { writeFileSync(dest, readFileSync(`${ROOT}/src/plutus-lsp/${n}`, "utf8")); } catch { writeFileSync(dest, "// fixture\n"); }
  return dest;
};
const SCRATCH = (n: string) => `${FIXTURE_ROOT}/${n}`;

const CASES: Case[] = [
  {
    id: "D1", what: "the fabricated SL cap (the canon ceiling is 36 pip; the edit sets 150)",
    file: F("judge.ts"),
    hunk: `// stop-loss cap\nconst SL_CAP_PIPS = 150; // the SL ceiling for every pair\n`,
    passToken: "plutus/law", failToken: "SELFTEST OK",
  },
  {
    id: "D2", what: "the multi-TP violation (the law: ONE TP; the edit defines TP1/TP2/TP3)",
    file: F("store.ts"),
    hunk: `const TPs = { tp1: 0.5, tp2: 1.0, tp3: 2.0 }; // three take-profit targets\n`,
    passToken: "plutus/law", 
  },
  {
    id: "D3", what: "the pair-format violation (the law: EUR/USD; the edit uses EURUSD)",
    file: F("cards.ts"),
    hunk: `const pair = "EURUSD"; // pair format without the slash\n`,
    passToken: "plutus/law",
  },
  {
    id: "D4", what: "the flat RRR (the law: category-specific; the edit sets one ratio)",
    file: F("judge.ts"),
    hunk: `const RRR = 2.0; // the risk-reward ratio, same for every category\n`,
    passToken: "plutus/law",
  },
  {
    id: "D5", what: "the ZFP threshold change (the canon: 45; the edit sets 60)",
    file: F("store.ts"),
    hunk: `const ZFP_THRESHOLD = 60; // the zone-formation threshold\n`,
    passToken: "plutus/law",
  },
  {
    id: "D6", what: "a fact-free file — the LSP must stay SILENT (the precision proof)",
    // a scratch path with NO canonical tokens; the hunk has none either
    file: SCRATCH("xqzy.ts"),
    hunk: `const xqzy = 1; // nothing canonical here at all\n`,
    passToken: "NO-LAW",                 // the receipt line for a zero-candidate file
    clean: true,
  },
];

const results: Array<Record<string, unknown>> = [];
let pass = 0, fail = 0;

for (const c of CASES) {
  process.env.PLUTUS_L1_PATH = FIXTURE_GRAPH;   // hermetic: the suite's own graph
  try { writeFileSync(c.file.includes("xqzy") ? c.file : `${FIXTURE_ROOT}/_target.ts`, c.file.includes("xqzy") ? "// fact free\n" : ""); } catch { /* best effort */ }
  let out = "";
  let verdict = "NONE";
  let tokens: string[] = [];
  try {
    const src = readFileSync(c.file, "utf8").slice(0, 400) + "\n" + c.hunk;
    const r = await pipeline(c.file, src, !NOJUDGE);
    tokens = r.tokens;
    verdict = (r as { vector?: unknown }).refused ? "REFUSED" : "OK";
    out = JSON.stringify(r);
  } catch (e) {
    out = `THROW: ${(e as Error).message}`;
  }
  const hay = out.toLowerCase();
  const passHit = hay.includes(c.passToken.toLowerCase()) || (c.clean === true && tokens.length === 0);
  const failHit = c.failToken ? hay.includes(c.failToken.toLowerCase()) : false;
  // round-18: keep the full output for forensics (which law surfaced, what the card said)
  const outTrim = out.slice(0, 2000);
  const ok = c.clean ? (tokens.length === 0) : (passHit && !failHit);
  if (ok) pass++; else fail++;
  results.push({ id: c.id, what: c.what, tokens, verdict, passToken: c.passToken, passHit: passHit === true, failToken: c.failToken ?? null, failHit, outTrim, verdictStr: ok ? "PASS" : "FAIL" });
  console.log(`${ok ? "PASS" : "FAIL"} ${c.id} ${c.what}`);
  console.log(`      tokens=[${tokens.join(",")}] passToken(${c.passToken})=${passHit}${c.failToken ? ` failToken(${c.failToken})=${failHit}` : ""}`);
}

mkdirSync(`${ROOT}/.omp`, { recursive: true });
const report = {
  suite: "derailment-patterns", liveJudge: !NOJUDGE, generated: new Date().toISOString(),
  pass, fail, total: CASES.length, results,
};
writeFileSync(`${ROOT}/.omp/derailment-suite-results.json`, JSON.stringify(report, null, 2));
console.log(`\nDERAILMENT SUITE: ${pass}/${CASES.length} PASS, ${fail} FAIL`);
console.log(`artifact: .omp/derailment-suite-results.json`);
process.exit(fail === 0 ? 0 : 1);
