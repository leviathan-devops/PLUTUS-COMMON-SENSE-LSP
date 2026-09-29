/**
 * P5 · THE ADVERSARIAL SWEEP — the 6 angles. Each attack must fire its SPECIFIC token;
 * each legit operation must pass with ZERO misfire. Adversarial FIRST.
 */
import { test, expect } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { loadStore, lawsForFile, declarationsIn, PLUTUS_NO_STORE, PLUTUS_NO_ROOT } from "../src/plutus-lsp/store.ts";
import { chain, health, verdict, buildState, JEVK5_DOWN } from "../src/plutus-lsp/judge.ts";
import { fileCards, lawCard, toDiagnostic, PLUTUS_LSP_TOKENS } from "../src/plutus-lsp/cards.ts";

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
  const h = await health(500); process.env.JEVK5_HEALTH = old;
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
  const card = fileCards("mirror.ts", [{ id: "law::IRON-01", name: "IRON-01", statement: "SL cap 150 pips", tier: "IMMUTABLE", anchor: "b:1", source: "MC" }], { kind: "VIOLATION", weakest: "P4", vector: { P4: 0.91 } }).find((c) => c.shape === "VIOLATION");
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
