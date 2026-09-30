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
/** FIX F4 (audit-bravo): `plutus/callers` IS NOW EMITTED — see callersCard() below. */

export const SEVERITY = { Error: 1, Warning: 2, Information: 3, Hint: 4 } as const;
type Sev = (typeof SEVERITY)[keyof typeof SEVERITY];

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
    severity: SEVERITY.Information,
    source: "plutus/law",
    total: laws.length,
  };
}

export function verdictCard(target: string, v: Verdict, laws: LawEntity[]): FactCard | null {
  const pct = (n?: number) => (typeof n === "number" ? n.toFixed(3) : "n/a");
  // FIX (audit cards.ts:61): a wrongness verdict with NO laws is a JUDGE artifact, not a law card
  if (v.kind !== "LAW" && v.kind !== "JUDGE_DOWN" && v.kind !== "INCONCLUSIVE" && laws.length === 0) return null;
  if (v.kind === "JUDGE_DOWN") {
    return {
      shape: "STALE",
      title: `the judge is DOWN — the canon could not be consulted`,
      rows: [v.reason ?? "JEVK5_DOWN"],
      severity: SEVERITY.Warning,
      source: "plutus/stale",
      total: 1,   // FIX F7 (audit-bravo): the ONE-fact comment said 1 while the value said 0
    };
  }
  // FIX C (the audit: an INCONCLUSIVE verdict emitted ZERO cards — a SILENT pass).
  // The agent must SEE that the judgment could not be reached.
  if (v.kind === "INCONCLUSIVE") {
    return {
      shape: "SUSPECT",
      title: `INCONCLUSIVE — the judge could not reach a verdict (weakest: ${v.weakest ?? "none"})`,
      rows: [
        `the unanswered/undecided clause: ${v.weakest ?? "(no deciding clause answered)"}`,
        `vector: ${Object.entries(v.vector).map(([k, n]) => `${k}=${Number(n).toFixed(3)}`).join(" ") || "(empty)"}`,
      ],
      severity: SEVERITY.Hint,   // an INFO — the agent knows the judgment failed
      source: "plutus/suspect",
      total: 1,
    };
  }
  if (v.kind === "LAW") return null;                  // the law card already informs
  // FIX (audit cards.ts:85): an explicit kind check — an unknown kind yields NO card
  if (v.kind !== "VIOLATION" && v.kind !== "DRIFT" && v.kind !== "SUSPECT" && v.kind !== "INCONCLUSIVE") return null;
  // FIX (audit cards.ts:67): attribute by the WEAKEST clause — P4/P5/P6 = wrongness (an IMMUTABLE
  // law preferred), P7 = drift (a ruling). The weakest node decides the cited law.
  const law = v.weakest && v.weakest !== "P7"
    ? (laws.find((l) => l.tier === "IMMUTABLE") ?? laws[0])
    : (laws[0] ?? laws.find((l) => l.tier === "IMMUTABLE"));
  if (!law) return null;
  if (v.kind === "VIOLATION") {
    return {
      shape: "VIOLATION",
      title: `VIOLATION — the change contradicts ${law?.name ?? "the canon"} (P4=${pct(v.vector.P4)})`,
      rows: [
        `law: [${law?.tier}] ${law?.name}: ${law?.statement.slice(0, 90)}`,
        `anchor: ${law?.anchor}`,
        `vector: P4=${pct(v.vector.P4)} P5=${pct(v.vector.P5)} P6=${pct(v.vector.P6)} P7=${pct(v.vector.P7)}`,
      ],
      severity: SEVERITY.Error,
      source: "plutus/violation",
      total: 1,   // FIX (audit cards.ts:78): the verdict is ONE measured fact
    };
  }
  if (v.kind === "DRIFT") {
    return {
      shape: "DRIFT",
      title: `DRIFT — the change contradicts a prior decision (P7=${pct(v.vector.P7)})`,
      rows: [`vector: P7=${pct(v.vector.P7)}`, `law: ${law?.name ?? "n/a"} — ${law?.anchor ?? ""}`],
      severity: SEVERITY.Warning,
      source: "plutus/drift",
      total: 1,   // FIX (audit cards.ts:78)
    };
  }
  return {
    shape: "SUSPECT",
    title: `SUSPECT — the law may be breached (P4=${pct(v.vector.P4)}); evidence required`,
    rows: [`law: [${law?.tier}] ${law?.name}`, `anchor: ${law?.anchor}`, `vector: P4=${pct(v.vector.P4)}`],
    severity: SEVERITY.Warning,
    source: "plutus/suspect",
    total: 1,   // FIX (audit cards.ts:78)
  };
}

export function tierCard(laws: LawEntity[]): FactCard | null {
  const imm = laws.filter((l) => l.tier === "IMMUTABLE");
  if (imm.length === 0) return null;
  return {
    shape: "TIER",
    title: `${imm.length} IMMUTABLE law(s) — never change without a recorded ruling`,
    rows: imm.slice(0, 4).map((l) => `${l.name} — ${l.anchor}`),
    severity: SEVERITY.Information,
    source: "plutus/tier",
    total: imm.length,
  };
}

export function staleCard(reason: string): FactCard {
  return { shape: "STALE", title: `the graph is stale or absent`, rows: [reason], severity: SEVERITY.Warning, source: "plutus/stale", total: 1 };
}

// ── THE LSP MAPPING ──────────────────────────────────────────────────────────
export interface LspDiagnostic {
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  severity: 1 | 2 | 3 | 4;
  source: string;
  message: string;
}

/** FIX (audit cards.ts:120): a real range — the card's anchor line when known, else 0. */
export function toDiagnostic(card: FactCard, range?: { line: number; character: number }): LspDiagnostic {
  const line = range?.line ?? 0;
  return {
    range: { start: { line, character: range?.character ?? 0 }, end: { line, character: (range?.character ?? 0) + 1 } },
    severity: card.severity,
    source: card.source,
    message: `${card.title}\n${card.rows.join("\n")}`,
  };
}

/** FIX F4 (audit-bravo): the CALLERS card — a REAL read (the L1 import edges), never a promise. */
export function callersCard(target: string, callers: string[]): FactCard | null {
  if (callers.length === 0) return null;   // the anti-phantom law
  return {
    shape: "CALLERS",
    title: `${callers.length} file(s) import this one — a change here reaches them`,
    rows: callers.slice(0, 6),
    severity: SEVERITY.Information,
    source: "plutus/callers",
    total: callers.length,
  };
}

/** The full file pipeline: laws → cards (the L1 detect + L3 enforce). */
export function fileCards(target: string, laws: LawEntity[], v: Verdict | null, callers: string[] = []): FactCard[] {
  const out: FactCard[] = [];
  const lc = lawCard(target, laws); if (lc) out.push(lc);
  const tc = tierCard(laws); if (tc) out.push(tc);
  const cc = callersCard(target, callers); if (cc) out.push(cc);   // FIX F4
  if (v) { const vc = verdictCard(target, v, laws); if (vc) out.push(vc); }
  return out;
}
// definitive probe
// re-proof

