/**
 * W2 + W3 GATES — the judge chain (CH-PLUTUS) and the card renderer.
 * Both halves: the positive (the live judge answers 7) and the negative (a down judge is NAMED).
 */
import { test, expect } from "bun:test";
import { chain, verdict, buildState, health, JEVK5_DOWN, THROW_T, DEMAND_T } from "../src/plutus-lsp/judge.ts";
import { fileCards, lawCard, verdictCard, tierCard, toDiagnostic, PLUTUS_LSP_TOKENS } from "../src/plutus-lsp/cards.ts";
import type { LawEntity } from "../src/plutus-lsp/store.ts";

const LAW: LawEntity = { id: "law::IRON-01", name: "IRON-01", statement: "ZFP threshold = 45 -- the tipping point", tier: "IMMUTABLE", anchor: "bible40:2997", source: "MASTER_CONTEXT" };

test("test_judge_chain_seven_nouls", async () => {
  // FIX F6 (audit-alpha): the OLD form returned with ZERO assertions when the judge was
  // down — a VACUOUS PASS. The live test now FAILS with the named reason (the suite
  // requires the judge; a down judge is a red suite, never a green one).
  const h = await health();
  expect(h.ok).toBe(true);   // the judge must be up — a down judge FAILS this test
  if (!h.ok) throw new Error(`the judge is down: ${h.reason}`);
  const r = await chain(buildState("mirror.ts", [LAW], "export function computeMirrorSL() { const sl = 200; }"));
  expect(r.ok).toBe(true);
  expect(Object.keys(r.answers).length).toBe(7);      // all seven answered
  expect(r.requests).toBe(1);                         // ONE batched pass
  for (const [, n] of Object.entries(r.answers)) { expect(n).toBeGreaterThanOrEqual(0); expect(n).toBeLessThanOrEqual(1); }
});

test("test_judge_down_is_named", async () => {
  const old = process.env.JEVK5_HEALTH;
  process.env.JEVK5_HEALTH = "http://127.0.0.1:9/health";   // a closed port
  const h = await health(600);
  process.env.JEVK5_HEALTH = old;
  expect(h.ok).toBe(false);
  expect(h.reason).toContain(JEVK5_DOWN);             // the NAMED refusal, never a fabricated noul
});

test("test_cards_seven_tokens", () => {
  expect(PLUTUS_LSP_TOKENS.length).toBe(7);
  expect(new Set(PLUTUS_LSP_TOKENS).size).toBe(7);    // no duplicates
  const cards = fileCards("mirror.ts", [LAW], { kind: "VIOLATION", weakest: "P4", vector: { P4: 0.91 } });
  expect(cards.length).toBeGreaterThan(0);
  const vc = cards.find((c) => c.shape === "VIOLATION");
  expect(vc).toBeDefined();
  expect(vc!.severity).toBe(1);                        // Error
  expect(vc!.source).toBe("plutus/violation");
  expect(vc!.rows.length).toBeGreaterThan(0);          // real evidence rows
  const d = toDiagnostic(vc!);
  expect(d.source).toBe("plutus/violation");
  expect(d.message).toContain("VIOLATION");
});

test("test_negative_no_phantom", () => {
  expect(lawCard("x.ts", [])).toBeNull();              // no laws → NO card
  expect(tierCard([])).toBeNull();
  expect(verdictCard("x.ts", { kind: "LAW", weakest: null, vector: {} }, [LAW])).toBeNull();  // LAW is silent (the law card informs)
  expect(fileCards("x.ts", [], null).length).toBe(0);  // a fact-free file yields NOTHING
});

test("test_verdict_thresholds", () => {
  const v = (p4: number, p7 = 0) => verdict({ ok: true, answers: { P4: p4, P7: p7 }, requests: 1 });
  expect(v(0.9).kind).toBe("VIOLATION");
  expect(v(0.6).kind).toBe("SUSPECT");
  // FIX A (the audit): DEMAND_T is now the DERIVED bar (0.30, CALIBRATION_v1) — a 0.30
  // score is AT the bar (SUSPECT); below it (0.2) is LAW.
  expect(v(0.30).kind).toBe("SUSPECT");
  expect(v(0.2).kind).toBe("LAW");
  expect(v(0.1, 0.9).kind).toBe("DRIFT");
  expect(verdict({ ok: false, answers: {}, reason: JEVK5_DOWN, requests: 0 }).kind).toBe("JUDGE_DOWN");
  expect(THROW_T).toBeGreaterThan(DEMAND_T);
});
