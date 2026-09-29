/**
 * W1 GATE — the store reader. Both halves: the positive (the graph resolves) and the
 * negative (an absent graph is the NAMED PLUTUS_NO_STORE, never a silent empty).
 * Test ids: test_store_resolves_graph · test_store_names_plutus_no_store
 */
import { test, expect } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { loadStore, lawsFor, declarationsIn, l1PathFor, resolveRoot, PLUTUS_NO_STORE } from "../src/plutus-lsp/store.ts";

const CORPUS_L1 = "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json";

test("test_store_resolves_graph", () => {
  process.env.PLUTUS_L1_PATH = CORPUS_L1;
  const s = loadStore(CORPUS_L1);
  expect(s.total).toBeGreaterThan(0);            // the measured count (anti-phantom)
  expect(s.laws.length).toBe(s.total);
  const iron = s.laws.find((l) => l.name === "IRON-01");
  expect(iron).toBeDefined();                    // the real law is in the graph
  expect(iron!.statement.toLowerCase()).toContain("zfp");
  expect(iron!.tier).toBe("IMMUTABLE");
  expect(iron!.anchor).toContain(":2997");       // the file:line anchor survives
});

test("test_store_names_plutus_no_store", () => {
  // a REAL root (a marker) with NO kg.json → the store's own NAMED refusal
  const root = "/tmp/pcsl-nostore-probe";
  mkdirSync(root, { recursive: true });
  writeFileSync(`${root}/tsconfig.json`, "{}");
  process.env.PLUTUS_L1_PATH = `${root}/absent-kg.json`;   // authoritative, absent
  let err = "";
  try { loadStore(`${root}/probe.ts`); } catch (e) { err = (e as Error).message; }
  expect(err).toContain(PLUTUS_NO_STORE);        // the NAMED refusal, not []
  expect(err).not.toContain("PLUTUS_NO_ROOT");   // the marker resolved — the STORE is what failed
});

test("test_laws_for_symbol_matches", () => {
  process.env.PLUTUS_L1_PATH = CORPUS_L1;
  const s = loadStore(CORPUS_L1);
  const hits = lawsFor(s, "ZFP");
  expect(hits.length).toBeGreaterThan(0);        // a real match
  const none = lawsFor(s, "zzz-not-a-law-zzz");
  expect(none.length).toBe(0);                   // no phantom — a miss is []
});

test("test_declarations_in_reads_exports", () => {
  const src = `export function computeMirrorSL() {}\nexport const RRR_FLOOR = 2.5;\nexport class Trade {}\nfunction privateFn() {}`;
  const d = declarationsIn(src);
  expect(d).toContain("computeMirrorSL");
  expect(d).toContain("RRR_FLOOR");
  expect(d).toContain("Trade");
  expect(d).not.toContain("privateFn");          // the negative half
});
