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

const F = (n: string) => `${ROOT}/src/plutus-lsp/${n}`;

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
    file: `${ROOT}/src/xqzy.ts`,
    hunk: `const xqzy = 1; // nothing canonical here at all\n`,
    passToken: "NO-LAW",                 // the receipt line for a zero-candidate file
    clean: true,
  },
];

const results: Array<Record<string, unknown>> = [];
let pass = 0, fail = 0;

for (const c of CASES) {
  process.env.PLUTUS_L1_PATH = process.env.PLUTUS_L1_PATH ?? "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json";
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
