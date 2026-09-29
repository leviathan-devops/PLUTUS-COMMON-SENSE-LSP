/**
 * plutus-lsp · cards.ts — the 7 tokens + the card renderer (W3)
 *
 * THE LAW: every card asserts only what it MEASURED (`total`); a fact-free file yields NO card
 * (the anti-phantom law). The card shape is inherited from the GI precedent (FactCard).
 */

import type { LawEntity } from "./store.ts";
import type { Verdict } from "./judge.ts";

// ── THE 7 TOKENS ─────────────────────────────────────────────────────────────
export const PLUTUS_LSP_TOKENS = [
  "plutus/law",
  "plutus/violation",
  "plutus/suspect",
  "plutus/tier",
  "plutus/callers",
  "plutus/drift",
  "plutus/stale",
] as const;
export type PlutusLspToken = (typeof PLUTUS_LSP_TOKENS)[number];

export const SEVERITY = { Error: 1, Warning: 2, Information: 3, Hint: 4 } as const;

export interface FactCard {
  shape: "LAW" | "VIOLATION" | "SUSPECT" | "TIER" | "CALLERS" | "DRIFT" | "STALE";
  title: string;
  rows: string[];
  severity: 1 | 2 | 3 | 4;
  source: PlutusLspToken;
  total: number;
}

// ── THE RENDERERS ────────────────────────────────────────────────────────────
export function lawCard(target: string, laws: LawEntity[]): FactCard | null {
  if (laws.length === 0) return null;                 // the anti-phantom law
  return {
    shape: "LAW",
    title: `${laws.length} canon law(s) govern this file`,
    rows: laws.slice(0, 5).map((l) => `[${l.tier}] ${l.name}: ${l.statement.slice(0, 96)} — ${l.anchor}`),
    severity: 3,
    source: "plutus/law",
    total: laws.length,
  };
}

export function verdictCard(target: string, v: Verdict, laws: LawEntity[]): FactCard | null {
  const pct = (n?: number) => (typeof n === "number" ? n.toFixed(3) : "n/a");
  if (v.kind === "JUDGE_DOWN") {
    return {
      shape: "STALE",
      title: `the judge is DOWN — the canon could not be consulted`,
      rows: [v.reason ?? "JEVK5_DOWN"],
      severity: 2,
      source: "plutus/stale",
      total: -1,
    };
  }
  if (v.kind === "LAW") return null;                  // the law card already informs
  const law = laws[0];
  if (v.kind === "VIOLATION") {
    return {
      shape: "VIOLATION",
      title: `VIOLATION — the change contradicts ${law?.name ?? "the canon"} (P4=${pct(v.vector.P4)})`,
      rows: [
        `law: [${law?.tier}] ${law?.name}: ${law?.statement.slice(0, 90)}`,
        `anchor: ${law?.anchor}`,
        `vector: P4=${pct(v.vector.P4)} P5=${pct(v.vector.P5)} P6=${pct(v.vector.P6)} P7=${pct(v.vector.P7)}`,
      ],
      severity: 1,
      source: "plutus/violation",
      total: laws.length,
    };
  }
  if (v.kind === "DRIFT") {
    return {
      shape: "DRIFT",
      title: `DRIFT — the change contradicts a prior decision (P7=${pct(v.vector.P7)})`,
      rows: [`vector: P7=${pct(v.vector.P7)}`, `law: ${law?.name ?? "n/a"} — ${law?.anchor ?? ""}`],
      severity: 2,
      source: "plutus/drift",
      total: laws.length,
    };
  }
  return {
    shape: "SUSPECT",
    title: `SUSPECT — the law may be breached (P4=${pct(v.vector.P4)}); evidence required`,
    rows: [`law: [${law?.tier}] ${law?.name}`, `anchor: ${law?.anchor}`, `vector: P4=${pct(v.vector.P4)}`],
    severity: 2,
    source: "plutus/suspect",
    total: laws.length,
  };
}

export function tierCard(laws: LawEntity[]): FactCard | null {
  const imm = laws.filter((l) => l.tier === "IMMUTABLE");
  if (imm.length === 0) return null;
  return {
    shape: "TIER",
    title: `${imm.length} IMMUTABLE law(s) — never change without a recorded ruling`,
    rows: imm.slice(0, 4).map((l) => `${l.name} — ${l.anchor}`),
    severity: 3,
    source: "plutus/tier",
    total: imm.length,
  };
}

export function staleCard(reason: string): FactCard {
  return { shape: "STALE", title: `the graph is stale or absent`, rows: [reason], severity: 2, source: "plutus/stale", total: -1 };
}

// ── THE LSP MAPPING ──────────────────────────────────────────────────────────
export interface LspDiagnostic {
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  severity: 1 | 2 | 3 | 4;
  source: string;
  message: string;
}

export function toDiagnostic(card: FactCard): LspDiagnostic {
  return {
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
    severity: card.severity,
    source: card.source,
    message: `${card.title}\n${card.rows.join("\n")}`,
  };
}

/** The full file pipeline: laws → cards (the L1 detect + L3 enforce). */
export function fileCards(target: string, laws: LawEntity[], v: Verdict | null): FactCard[] {
  const out: FactCard[] = [];
  const lc = lawCard(target, laws); if (lc) out.push(lc);
  const tc = tierCard(laws); if (tc) out.push(tc);
  if (v) { const vc = verdictCard(target, v, laws); if (vc) out.push(vc); }
  return out;
}
