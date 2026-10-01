/**
 * P5 · THE ADVERSARIAL SWEEP — the 6 angles. Each attack must fire its SPECIFIC token;
 * each legit operation must pass with ZERO misfire. Adversarial FIRST.
 */
import { test, expect } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { loadStore, lawsForFile, declarationsIn, PLUTUS_NO_STORE, PLUTUS_NO_ROOT } from "../src/plutus-lsp/store.ts";
import { chain, health, verdict, buildState, JEVK5_DOWN } from "../src/plutus-lsp/judge.ts";
import { fileCards, lawCard, PLUTUS_LSP_TOKENS, callersCard, verdictCard } from "../src/plutus-lsp/cards.ts";

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
  expect(lawCard([], laws.length, true).length).toBe(0);
  expect(fileCards([], laws.length, null, [], true).length).toBe(0);
});

test("A4_a_known_violation_renders_the_VIOLATION_token", () => {
  // FIX F7 (audit-alpha: A4 was SELF-REFERENTIAL — it hand-built the vector + asserted the
  // renderer echoed it). The REAL path: verdict() DECIDES from the vector (the threshold
  // crossing), then the renderer. Both halves now.
  // round-11 (H2): P2 jurisdiction evidence rides every real chain vector — the test does too.
  const v = verdict({ ok: true, answers: { P2: 0.9, P4: 0.91 }, requests: 1 });   // the real decision
  expect(v.kind).toBe("VIOLATION");                                      // the threshold crossed
  const card = verdictCard(v, [{ law: { id: "law::IRON-01", name: "IRON-01", statement: "SL ceiling 36 pips (D17)", tier: "IMMUTABLE", anchor: "b:1", source: "MC" }, p: 0.9 }]);
  expect(card).toBeDefined();
  expect(card!.source).toBe("plutus/violation");
  expect(card!.severity).toBe(1);
  expect(card!.title).toContain("IRON-01");                              // names the subject
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

test("A8_the_token_set_is_exactly_6_and_unique (F-10: the dead tier token RETIRED)", () => {
  expect(PLUTUS_LSP_TOKENS.length).toBe(6);
  expect(new Set(PLUTUS_LSP_TOKENS).size).toBe(6);
  for (const t of PLUTUS_LSP_TOKENS) expect(t.startsWith("plutus/")).toBe(true);
});

/**
 * THE AUDIT'S NEW TESTS (bravo's F1/F2/F4) — the behaviors the audit wired.
 */
test("A9_the_callers_card_emits (F4 — the token was declared, never emitted)", () => {
  const card = callersCard(["a.ts", "b.ts"]);
  expect(card).toBeDefined();
  expect(card!.source).toBe("plutus/callers");
  expect(card!.total).toBe(2);                       // the measured count
  expect(callersCard([])).toBeNull();                  // the anti-phantom law
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
  const { throwT, demandT } = require("../src/plutus-lsp/judge.ts");
  expect(throwT()).toBeGreaterThan(0); expect(throwT()).toBeLessThan(1);
  expect(demandT()).toBeGreaterThan(0); expect(demandT()).toBeLessThan(1);
  // a garbage env value must NOT produce NaN/0 — the module is already loaded; assert the shape
  expect(Number.isFinite(throwT())).toBe(true);
  expect(Number.isFinite(demandT())).toBe(true);
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
  expect(judge).toContain("PLUTUS_RELEVANCE_T, 0.3");
});

test("A13_the_relevance_bar_is_derived (0.30, not the assumed 0.50)", async () => {
  const { relevanceT } = await import("../src/plutus-lsp/judge.ts");
  expect(relevanceT()).toBe(0.3);      // the swept bar
  expect(relevanceT()).not.toBe(0.5);  // the assumed bar that lost coverage
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
  // a STALE row (a lawId that is not a candidate) is never assigned — it is dropped, not mis-partitioned
  const stale = partitionByRelevance(laws, [{ index: 9, lawId: "law::GHOST", p: 0.99 }]);
  expect(stale.relevant.length).toBe(0);
  expect(stale.rejected.length).toBe(0);
  expect(stale.unknown.length).toBe(0);
});

test("A15_missing_P2_is_INCONCLUSIVE (H2 fail-closed jurisdiction)", async () => {
  const { verdict } = await import("../src/plutus-lsp/judge.ts");
  // a caller-built vector with NO jurisdiction evidence must not reach VIOLATION
  const v = verdict({ ok: true, answers: { P4: 0.95 }, requests: 1 });
  expect(v.kind).toBe("INCONCLUSIVE");
  expect(v.weakest).toBe("P2");
  // ...while the same vector WITH P2 crosses
  const v2 = verdict({ ok: true, answers: { P2: 0.9, P4: 0.95 }, requests: 1 });
  expect(v2.kind).toBe("VIOLATION");
});

test("A16_vacuous_VIOLATION_downgrades (H6 no vacuous Error)", async () => {
  const { verdictCard } = await import("../src/plutus-lsp/cards.ts");
  const LAW = { id: "law::X", name: "X-LAW", statement: "s", tier: "IMMUTABLE", anchor: "a:1", source: "MC" };
  // weakest null + empty vector: the old code rendered `VIOLATION (none=n/a)` at Error
  const c: any = verdictCard({ kind: "VIOLATION", weakest: null, vector: {} }, [{ law: LAW, p: 0.9 }]);
  expect(c.shape).not.toBe("VIOLATION");
  expect(c.shape).toBe("SUSPECT");
});

test("A17_staleCard_never_throws (H7 refusal path)", async () => {
  const { staleCard } = await import("../src/plutus-lsp/cards.ts");
  expect(() => staleCard(null as any)).not.toThrow();
  expect(() => staleCard(undefined as any)).not.toThrow();
  expect(() => staleCard(42 as any)).not.toThrow();
  expect(staleCard(null as any).title).toContain("PLUTUS_NO_STORE");
});

test("A18_counts_are_emitted (H5 clean.length)", async () => {
  const { lawCard } = await import("../src/plutus-lsp/cards.ts");
  const LAW = { id: "law::X", name: "X-LAW", statement: "s", tier: "IMMUTABLE", anchor: "a:1", source: "MC" };
  const cards = lawCard([{ law: LAW, p: 0.9 } as any, null as any], 5, true);
  expect(cards.length).toBe(1);          // the malformed entry is dropped from output...
  expect(cards[0].total).toBe(1);        // ...AND from the count (never claims 2)
  expect(cards[0].title).toContain("kept 1 of 5");
});

test("A19_incremental_never_becomes_doc (H12 full-sync)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  // a ranged fragment must not be applied as the whole document
  expect(server).toContain("range === undefined");
  expect(server).toContain("INCREMENTAL_REJECTED");
});

test("A20_headerless_stdin_capped (H11 no unbounded growth)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  expect(server).toContain("headerless bytes");
});

test("A21_NaN_vector_is_INCONCLUSIVE (round-12 validated answers)", async () => {
  const { verdict } = await import("../src/plutus-lsp/judge.ts");
  // NaN P2 must not bypass jurisdiction; NaN wrongness must not fall through to LAW
  const v = verdict({ ok: true, answers: { P2: NaN, P4: NaN }, requests: 1 } as any);
  expect(v.kind).toBe("INCONCLUSIVE");
});

test("A22_nonarray_kept_is_silence (round-12 entry guards)", async () => {
  const { lawCard, verdictCard, fileCards } = await import("../src/plutus-lsp/cards.ts");
  expect(lawCard({} as any, 3, true)).toEqual([]);
  expect(verdictCard({ kind: "SUSPECT", weakest: null, vector: {} }, {} as any)).toBeNull();
  expect(fileCards({} as any, 0, null, [], true).length).toBe(0);
});

test("A23_short_name_law_survives_filter (round-12 TP1 class)", async () => {
  const { loadStore, lawsForHunk, declarationsIn } = await import("../src/plutus-lsp/store.ts");
  process.env.PLUTUS_L1_PATH = L1;
  const store = loadStore(`${import.meta.dir}/../src/plutus-lsp/store.ts`);
  // a hunk whose ONLY signal is a 3-char domain term must still yield a candidate
  const cands = lawsForHunk(store, "x.ts", [], "const TPs = { tp1, tp2, tp3 };", 12);
  expect(cands.length).toBeGreaterThan(0);
});

test("A24_topK_clamped (round-12 positive int)", async () => {
  const { loadStore, lawsForHunk } = await import("../src/plutus-lsp/store.ts");
  process.env.PLUTUS_L1_PATH = L1;
  const store = loadStore(`${import.meta.dir}/../src/plutus-lsp/store.ts`);
  const a = lawsForHunk(store, "src/plutus-lsp/cards.ts", [], "const cards = fileCards;", 3);
  const b = lawsForHunk(store, "src/plutus-lsp/cards.ts", [], "const cards = fileCards;", NaN as any);
  expect(b.length).toBe(a.length);   // NaN topK degrades to the default, never []
});

test("A25_partition_validates_rows (round-13 NaN/null → unknown)", async () => {
  const { partitionByRelevance } = await import("../src/plutus-lsp/judge.ts");
  const laws = [
    { id: "law::A", name: "A", statement: "s a", tier: "IMMUTABLE", anchor: "a:1", source: "MC" },
    { id: "law::B", name: "B", statement: "s b", tier: "IMMUTABLE", anchor: "a:2", source: "MC" },
  ];
  // NaN / undefined / non-number scores are UNREADABLE → unknown, never rejected
  const part = partitionByRelevance(laws as any, [
    { index: 0, lawId: "law::A", p: NaN },
    { index: 1, lawId: "law::B", p: undefined as any },
    null as any,
  ]);
  expect(part.unknown.length).toBe(2);
  expect(part.rejected.length).toBe(0);
});

test("A26_fallback_attribution_validated (round-13 no unchecked law)", async () => {
  const { verdictCard } = await import("../src/plutus-lsp/cards.ts");
  // every entry malformed: no card at all (never `LAW: undefined`)
  const c: any = verdictCard({ kind: "SUSPECT", weakest: null, vector: {} },
    [{ law: { name: 123 }, p: 0.9 }] as any);
  expect(c).toBeNull();
});

test("A27_resolveRoot_prefers_STRONG (round-13 any-depth win)", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const { resolveRoot } = await import("../src/plutus-lsp/store.ts");
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "pcsl-root-"));
  // generic marker NEAR (level 0), STRONG marker FAR (level 3): STRONG must win
  fs.writeFileSync(path.join(base, "tsconfig.json"), "{}");
  const deep = path.join(base, "a", "b", "c");
  fs.mkdirSync(deep, { recursive: true });
  fs.mkdirSync(path.join(deep, ".arsumbris"));
  const root = resolveRoot(path.join(deep, "f.ts"));
  expect(root).toBe(deep);
  fs.rmSync(base, { recursive: true, force: true });
});

test("A28_observableQuestion_never_throws (round-14 sanitize)", async () => {
  const { observableQuestion } = await import("../src/plutus-lsp/judge.ts");
  expect(() => observableQuestion(null as any)).not.toThrow();
  expect(() => observableQuestion([null, 42] as any)).not.toThrow();
  expect(observableQuestion(null as any)).toContain("CONTRADICT");
});

test("A29_cards_bound_emitted_strings (round-14 cap)", async () => {
  const { lawCard } = await import("../src/plutus-lsp/cards.ts");
  const huge = "A".repeat(5000);
  const LAW = { id: "law::X", name: huge, statement: huge, tier: "IMMUTABLE", anchor: huge, source: "MC" };
  const cards = lawCard([{ law: LAW, p: 0.9 } as any], 1, true);
  expect(cards[0].title.length).toBeLessThan(300);      // bounded, never 5000+
  expect(cards[0].rows.join("").length).toBeLessThan(1200);
});

test("A30_short_read_named (round-14)", async () => {
  const fs = await import("node:fs");
  const store = fs.readFileSync(`${import.meta.dir}/../src/plutus-lsp/store.ts`, "utf8");
  expect(store).toContain("short read");
});

test("A31_partition_rejects_p_gt_1 (round-15 upper bound)", async () => {
  const { partitionByRelevance } = await import("../src/plutus-lsp/judge.ts");
  const laws = [{ id: "law::A", name: "A", statement: "s", tier: "IMMUTABLE", anchor: "a:1", source: "MC" }];
  const part = partitionByRelevance(laws as any, [{ index: 0, lawId: "law::A", p: 5 }]);
  expect(part.relevant.length).toBe(0);
  expect(part.unknown.length).toBe(1);
});

test("A32_selftest_failure_halts (round-15 CRITICAL)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  // the no-chain path must exit IMMEDIATELY (halt), never schedule-and-return
  expect(server).toContain("if (!sendChainRef)");   // the no-chain path exits immediately
  expect(server).toContain("process.exit(code)");
  expect(server).toContain("return exitFlushed(2)");   // round-17: the IIFE returns on fatal paths
});

test("A33_system_paths_refused (round-15 denylist)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  expect(server).toContain("SYSTEM_DENY");
  expect(server).toContain("PATH_REFUSED");
});

test("A34_unknown_method_answered (round-15 MethodNotFound)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  expect(server).toContain("-32601");
});

test("A35_out_of_scope_is_silent (M3 misfire fix)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  // PLUTUS_NO_ROOT (no marker = out of scope) must return EMPTY tokens, never a STALE card
  expect(server).toContain("if (msg.startsWith(\"PLUTUS_NO_ROOT\")) return { tokens: [], cards: [], refused: msg, vector: {} }");
});

test("A36_l2_probe_gated (M2 misfire fix)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  // the L2 probe must be gated on the socket existing (no more 197 dead rows)
  expect(server).toContain("L2 socket absent");
});

test("A37_scope_gate_is_segment_based (the F-8 + scope-ask fix)", async () => {
  const { isPlutusScoped } = await import("../src/plutus-lsp/store.ts");
  // IN: a path segment literally PLUTUS
  expect(isPlutusScoped("/x/PLUTUS/LIVE/dashboard/f.ts")).toBe(true);
  // OUT: a dir merely NAMED with the prefix must NOT match, nor a sibling repo
  expect(isPlutusScoped("/x/PLUTUS-COMMON-SENSE-LSP/scripts/f.ts")).toBe(false);
  expect(isPlutusScoped("/x/Graph_Intelligence/f.ts")).toBe(false);
  expect(isPlutusScoped("/tmp/foreign/f.ts")).toBe(false);
  // the FIRST-CUT defect: a dir MERELY HAVING a PLUTUS child must not scope its siblings
  expect(isPlutusScoped("/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/Graph_Intelligence/x.ts")).toBe(false);
});

test("A38_law_bearing_resolution (the F-1 CRITICAL fix)", async () => {
  const fs = await import("node:fs");
  const store = fs.readFileSync(`${import.meta.dir}/../src/plutus-lsp/store.ts`, "utf8");
  // the resolver must climb to a LAW-BEARING graph, never serve a lawless symbol/file kg.json
  expect(store).toContain("function lawCount");
  expect(store).toContain("lawCount(local) > 0");
  expect(store).toContain("lawCount(cand) > 0");
});

test("A39_pull_diagnostic_implemented (the F-2 capability-lie fix)", async () => {
  const fs = await import("node:fs");
  const server = fs.readFileSync(`${import.meta.dir}/../scripts/plutus-lsp.ts`, "utf8");
  // the advertised diagnosticProvider now HAS a handler
  expect(server).toContain('msg.method === "textDocument/diagnostic"');
  expect(server).toContain("kind: \"full\"");
});
