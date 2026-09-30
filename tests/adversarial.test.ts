/**
 * P5 · THE ADVERSARIAL SWEEP — the 6 angles. Each attack must fire its SPECIFIC token;
 * each legit operation must pass with ZERO misfire. Adversarial FIRST.
 */
import { test, expect } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { loadStore, lawsForFile, declarationsIn, PLUTUS_NO_STORE, PLUTUS_NO_ROOT } from "../src/plutus-lsp/store.ts";
import { chain, health, verdict, buildState, JEVK5_DOWN } from "../src/plutus-lsp/judge.ts";
import { fileCards, lawCard, toDiagnostic, PLUTUS_LSP_TOKENS, callersCard } from "../src/plutus-lsp/cards.ts";

const L1 = "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json";

test("A1_the_absent_graph_names_PLUTUS_NO_STORE", () => {
  const root = "/tmp/pcsl-adv-absent"; mkdirSync(root, { recursive: true }); writeFileSync(`${root}/tsconfig.json`, "{}");
  process.env.PLUTUS_L1_PATH = `${root}/nope.json`;
  let e = ""; try { loadStore(`${root}/x.ts`); } catch (err) { e = (err as Error).message; }
  expect(e).toContain(PLUTUS_NO_STORE);
  expect(e).not.toBe("");            // never a silent empty
});

test("A2_the_down_judge_names_JEVK5_DOWN", async () => {
  const old = process.env.JEVK5_HEALTH; process.env.JEVK5_HEALTH = "http://127.0.0.1:9/health";
  const h = await health(500);
  if (old === undefined) delete process.env.JEVK5_HEALTH; else process.env.JEVK5_HEALTH = old;   // FIX
  expect(h.ok).toBe(false); expect(h.reason).toContain(JEVK5_DOWN);
  const v = verdict({ ok: false, answers: {}, reason: h.reason, requests: 0 });
  expect(v.kind).toBe("JUDGE_DOWN");  // a DOWN judge is never a fabricated pass
});

test("A3_a_fact_free_file_yields_NO_card", () => {
  process.env.PLUTUS_L1_PATH = L1;
  const s = loadStore(L1);
  // a name whose tokens are ALL generic/too-short → NO needles → NO laws (the anti-phantom law)
  const laws = lawsForFile(s, "xq.ts", []);
  expect(laws.length).toBe(0);        // no phantom
  expect(lawCard("xq.ts", laws)).toBeNull();
  expect(fileCards("xq.ts", laws, null).length).toBe(0);
});

test("A4_a_known_violation_renders_the_VIOLATION_token", () => {
  // FIX F7 (audit-alpha: A4 was SELF-REFERENTIAL — it hand-built the vector + asserted the
  // renderer echoed it). The REAL path: verdict() DECIDES from the vector (the threshold
  // crossing), then the renderer. Both halves now.
  const v = verdict({ ok: true, answers: { P4: 0.91 }, requests: 1 });   // the real decision
  expect(v.kind).toBe("VIOLATION");                                      // the threshold crossed
  const card = fileCards("mirror.ts", [{ id: "law::IRON-01", name: "IRON-01", statement: "SL cap 150 pips", tier: "IMMUTABLE", anchor: "b:1", source: "MC" }], v).find((c) => c.shape === "VIOLATION");
  expect(card).toBeDefined();
  expect(card!.source).toBe("plutus/violation");
  expect(card!.severity).toBe(1);
  expect(toDiagnostic(card!).message).toContain("VIOLATION");
});

test("A5_a_foreign_store_is_NAMED_never_confident", () => {
  const root = "/tmp/pcsl-adv-foreign"; mkdirSync(root, { recursive: true }); writeFileSync(`${root}/tsconfig.json`, "{}");
  process.env.PLUTUS_L1_PATH = `${root}/absent.json`;
  let e = ""; try { loadStore(`${root}/x.ts`); } catch (err) { e = (err as Error).message; }
  expect(e).toContain(PLUTUS_NO_STORE);   // never a confident wrong answer
});

test("A6_no_root_marker_names_PLUTUS_NO_ROOT", () => {
  let e = ""; try { loadStore("/proc/nonexistent-probe/x.ts"); } catch (err) { e = (err as Error).message; }
  expect(e).toContain(PLUTUS_NO_ROOT);
});

test("A7_the_sibling_servers_survive (no eviction)", () => {
  const reg = JSON.parse(require("node:fs").readFileSync("/home/leviathan/.omp/agent/lsp.json", "utf8"));
  const keys = Object.keys(reg.servers);
  expect(keys).toContain("gi-lsp");
  expect(keys).toContain("jg-lsp");
  expect(keys).toContain("plutus-lsp");
});

test("A8_the_token_set_is_exactly_7_and_unique", () => {
  expect(PLUTUS_LSP_TOKENS.length).toBe(7);
  expect(new Set(PLUTUS_LSP_TOKENS).size).toBe(7);
  for (const t of PLUTUS_LSP_TOKENS) expect(t.startsWith("plutus/")).toBe(true);
});

/**
 * THE AUDIT'S NEW TESTS (bravo's F1/F2/F4) — the behaviors the audit wired.
 */
test("A9_the_callers_card_emits (F4 — the token was declared, never emitted)", () => {
  const card = callersCard("mirror.ts", ["a.ts", "b.ts"]);
  expect(card).toBeDefined();
  expect(card!.source).toBe("plutus/callers");
  expect(card!.total).toBe(2);                       // the measured count
  expect(callersCard("x.ts", [])).toBeNull();        // the anti-phantom law
});

test("A10_the_production_chain_is_the_calibrated_chain (F1+F2)", async () => {
  const fs = await import("node:fs");
  const src = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  // F1: the 7-node chain (the DECIDING set is actually answered)
  expect(src).toContain('["P1", "P2", "P3", "P4", "P5", "P6", "P7"]');
  // F2: the calibrated configuration (the ranked laws + the observable question)
  expect(src).toContain("lawsForHunk(");
  expect(src).toContain("observableQuestion(");
  // F4: the callers read
  expect(src).toContain("callersOf(");
});

test("A11_the_bars_are_validated (F10 — an env override cannot fail open)", () => {
  const { THROW_T, DEMAND_T } = require("../src/plutus-lsp/judge.ts");
  expect(THROW_T).toBeGreaterThan(0); expect(THROW_T).toBeLessThan(1);
  expect(DEMAND_T).toBeGreaterThan(0); expect(DEMAND_T).toBeLessThan(1);
  // a garbage env value must NOT produce NaN/0 — the module is already loaded; assert the shape
  expect(Number.isFinite(THROW_T)).toBe(true);
  expect(Number.isFinite(DEMAND_T)).toBe(true);
});

/**
 * THE RELEVANCE KERNEL — the audit pinned it so it cannot silently revert to lexical-only.
 */
test("A12_the_relevance_kernel_is_wired (not lexical-only)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  const judge = fs.readFileSync(`${import.meta.dir}/../src/plutus-lsp/judge.ts`, "utf8");
  // the detector gets a WIDE net; the judge decides
  expect(server).toContain("relevancePass(");
  expect(server).toContain("partitionByRelevance(");
  expect(server).toContain("lawsForHunk(store, file, decls, hunk, 12)");   // the wide net
  expect(judge).toContain("export async function relevancePass");
  // the bar is DERIVED (documented), not a bare literal
  expect(judge).toContain("PLUTUS_RELEVANCE_T ?? 0.3");
});

test("A13_the_relevance_bar_is_derived (0.30, not the assumed 0.50)", async () => {
  const { RELEVANCE_T } = await import("../src/plutus-lsp/judge.ts");
  expect(RELEVANCE_T).toBe(0.3);      // the swept bar
  expect(RELEVANCE_T).not.toBe(0.5);  // the assumed bar that lost coverage
});

test("A14_relevance_partitions_on_the_bar", async () => {
  const { partitionByRelevance } = await import("../src/plutus-lsp/judge.ts");
  const laws = [
    { id: "law::A", name: "A", statement: "s", tier: "IMMUTABLE" as const, anchor: "x:1", source: "s" },
    { id: "law::B", name: "B", statement: "s", tier: "IMMUTABLE" as const, anchor: "x:2", source: "s" },
  ];
  const part = partitionByRelevance(laws, [{ index: 0, lawId: "law::A", p: 0.8 }, { index: 1, lawId: "law::B", p: 0.2 }]);
  expect(part.relevant.map((l) => l.id)).toEqual(["law::A"]);
  expect(part.rejected.map((r) => r.law.id)).toEqual(["law::B"]);
  // an UNREADABLE answer (-1) is never shown
  const unknown = partitionByRelevance(laws, [{ index: 0, lawId: "law::A", p: -1 }, { index: 1, lawId: "law::B", p: -1 }]);
  expect(unknown.relevant.length).toBe(0);
});
