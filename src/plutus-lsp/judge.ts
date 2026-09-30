/**
 * plutus-lsp · judge.ts — CH-PLUTUS, the 7-noul chain (W2)
 *
 * THE LAW (jev-algorithmic-reasoning + jev-decision-gate-firewall):
 *   L1 DETECT (store.ts) → L2 JUDGE (this file) → L3 ENFORCE (cards.ts).
 *   The CODE assembles the state from disk; the model answers numbers; the CODE decides.
 *   ONE batched pass — a chain of 7 nouls costs the same as one.
 *   A down judge is the NAMED `JEVK5_DOWN`, never a fabricated answer.
 *   overall = min(all clauses) — the WEAKEST clause, never an average.
 */

import { JEVK5_DOWN, type LawEntity } from "./store.ts";
export { JEVK5_DOWN } from "./store.ts";   // re-export (the judge owns the refusal)

export const JEVK5_URL_DEFAULT = "http://127.0.0.1:8090/v1/systemone";
export const JEVK5_HEALTH_DEFAULT = "http://127.0.0.1:8090/health";
/** Read at CALL time — an env override must take effect without a reload. */
export const jevk5Url = () => process.env.JEVK5_URL ?? JEVK5_URL_DEFAULT;
export const jevk5Health = () => process.env.JEVK5_HEALTH ?? JEVK5_HEALTH_DEFAULT;

/** The 7 chain nodes — cheapest-first; each is ONE observable binary. */
export const CHAIN = {
  P1: { id: "P1", name: "SCOPE", q: "Is the target file inside the PLUTUS tree (a Plutus/Trident module or canon doc)?" },
  P2: { id: "P2", name: "LAW", q: "Does the supplied evidence show a governing law for this symbol?" },
  P3: { id: "P3", name: "TIER", q: "Is the governing law marked IMMUTABLE (a never-change canon law)?" },
  P4: { id: "P4", name: "VIOLATE", q: "Does the proposed change CONTRADICT the law's statement?" },
  P5: { id: "P5", name: "CONTRACT", q: "Does the change OVERRIDE a prior engine's data architecture (violating E1->E2->E3)?" },
  P6: { id: "P6", name: "ANTIPATTERN", q: "Does the change match a KNOWN bug or anti-pattern recorded in the canon?" },
  P7: { id: "P7", name: "DRIFT", q: "Does the change contradict a prior recorded ruling or decision?" },
} as const;
export type NodeId = keyof typeof CHAIN;

export interface JudgeVector {
  ok: boolean;
  answers: Partial<Record<NodeId, number>>;
  reason?: string;
  latencyMs?: number;
  requests: number;
}

/** The health probe. Absent → the NAMED JEVK5_DOWN (never a fabricated noul). */
export async function health(timeoutMs = 1500): Promise<{ ok: boolean; reason?: string }> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(jevk5Health(), { signal: ctl.signal });
      if (!r.ok) return { ok: false, reason: `${JEVK5_DOWN}: health HTTP ${r.status}` };
      const j = (await r.json()) as { ok?: boolean; model?: string };
      return j.ok ? { ok: true } : { ok: false, reason: `${JEVK5_DOWN}: health says ${JSON.stringify(j)}` };
    } finally { clearTimeout(t); }   // FIX (audit judge.ts:42): cleared on EVERY path
  } catch (e) {
    return { ok: false, reason: `${JEVK5_DOWN}: ${(e as Error).message}` };
  }
}

/**
 * THE CHAIN — one batched pass over the 7 nouls.
 * The state is the EVIDENCE TEXT assembled by the caller FROM DISK (the anti-gaming core).
 */
export async function chain(state: string, nodes: NodeId[] = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], timeoutMs = 6000, p4Override?: string): Promise<JudgeVector> {
  const h = await health();
  if (!h.ok) return { ok: false, answers: {}, reason: h.reason, requests: 0 };

  const questions: Record<string, { type: "noul"; instructions: string }> = {};
  for (const id of nodes) questions[id] = { type: "noul", instructions: id === "P4" && p4Override ? p4Override : CHAIN[id].q };

  try {
    if (nodes.length === 0) return { ok: false, answers: {}, reason: "JUDGE_NO_NODES", requests: 0 };  // FIX (audit:61) no vacuous ok
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const started = Date.now();
    try {
      const r = await fetch(jevk5Url(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state, questions }),
        signal: ctl.signal,
      });
      if (!r.ok) return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: HTTP ${r.status}`, requests: 1 };
      const j = (await r.json()) as { answers?: Record<string, { noul?: unknown }>; latency_ms?: number } | null;
      if (j === null || typeof j !== "object") return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: malformed body`, requests: 1 };
      const answers: Partial<Record<NodeId, number>> = {};
      for (const id of nodes) {
        const v = (j.answers as Record<string, { noul?: unknown }> | undefined)?.[id]?.noul;
        // FIX (audit judge.ts:79): a finite number in [0,1] only — a corrupt judge cannot force a verdict
        if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1) answers[id] = v;
      }
      const answered = Object.keys(answers).length;
      if (answered !== nodes.length) {
        return { ok: false, answers, reason: `JUDGE_ANSWER_COUNT: ${answered}/${nodes.length}`, requests: 1, latencyMs: j.latency_ms ?? (Date.now() - started) };
      }
      return { ok: true, answers, requests: 1, latencyMs: j.latency_ms ?? (Date.now() - started) };
    } finally { clearTimeout(t); }   // FIX (audit judge.ts:72): cleared on EVERY path
  } catch (e) {
    return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: ${e instanceof Error ? e.message : String(e)}`, requests: 1 };
  }
}

/** The evidence text — assembled FROM DISK by the caller (never agent prose). */
export function buildState(target: string, laws: LawEntity[], hunk: string): string {
  // FIX (audit judge.ts:96): an explicit marker — a silent cut risks a false LAW
  // FIX (audit judge.ts:101): IMMUTABLE first — a truncation must not drop the governing law
  const ordered = [...laws].sort((a, b) => (a.tier === "IMMUTABLE" ? 0 : 1) - (b.tier === "IMMUTABLE" ? 0 : 1));
  const kept = ordered.slice(0, 6);
  const lawText = kept.map((l) => `[${l.tier}] ${l.name}: ${l.statement} (anchor ${l.anchor})`).join("\n")
    + (laws.length > kept.length ? `\n... [${laws.length - kept.length} more laws truncated]` : "");
  return [
    `TARGET FILE: ${target}`,
    `GOVERNING LAWS (${laws.length}):`,
    lawText || "(none)",
    `PROPOSED CHANGE (the diff hunk):`,
    (hunk.length > 1500 ? `${hunk.slice(0, 1500)}\n... [hunk truncated at 1500 of ${hunk.length} chars]` : hunk) || "(none)",
  ].join("\n");
}

/** The verdict — PURE CODE (the model answers numbers; the code decides). */
/**
 * THE THRESHOLDS.
 * FIX A (the audit: the calibration's derived bar had ZERO production consumers):
 * DEMAND_T is the DERIVED operating point from reports/CALIBRATION_v1.md —
 * bar 0.30 (F1 0.60 · precision 0.50 · recall 0.75) on the 8-item corpus
 * (tests/calibration/corpus.json, 4 violations + 4 cleans). Reproduce:
 *   bun tests/calibration/calibrate.ts
 * THROW_T stays a POLICY bar (a high bar for an Error-severity verdict; the
 * calibration's top score was 0.61 — an Error at 0.30 would fire on half the
 * cleans). Env-overridable so a re-calibration can retune without a rebuild.
 */
// FIX F10 (audit-bravo): an env override must be VALIDATED — an empty string parses to 0 and
// garbage to NaN, both fail-open. A valid override is a finite number in (0,1).
const bar = (raw: string | undefined, dflt: number): number => {
  const n = Number(raw);
  return raw !== undefined && Number.isFinite(n) && n > 0 && n < 1 ? n : dflt;
};
export const THROW_T = bar(process.env.PLUTUS_THROW_T, 0.85);   // the VIOLATION bar (policy)
export const DEMAND_T = bar(process.env.PLUTUS_DEMAND_T, 0.30); // the SUSPECT bar (DERIVED)

export interface Verdict {
  kind: "VIOLATION" | "SUSPECT" | "DRIFT" | "LAW" | "INCONCLUSIVE" | "JUDGE_DOWN";
  weakest: NodeId | null;
  vector: Partial<Record<NodeId, number>>;
  reason?: string;
}

/**
 * THE VERDICT — pure code. The DECIDING clauses are the WRONGNESS set {P4 VIOLATE, P5 CONTRACT,
 * P6 ANTIPATTERN} plus P7 DRIFT; the INFORMING clauses are {P1 SCOPE, P2 LAW, P3 TIER}.
 * The wrongness = min over the ANSWERED deciding clauses (the weakest clause, never an average).
 * THE GUARD (F8: the docstring now matches the body): P2 LAW is the jurisdiction gate — a low
 * P2 yields INCONCLUSIVE. P1 is recorded in the vector but does NOT block (the container S5:
 * jurisdiction comes from the LAWS, not the model's path read).
 */
export const DECIDING: NodeId[] = ["P4", "P5", "P6"];
export function verdict(v: JudgeVector): Verdict {
  if (!v.ok) return { kind: "JUDGE_DOWN", weakest: null, vector: {}, reason: v.reason };
  const a = v.answers;
  // THE GUARDS (informing).
  // FIX (the container S5, measured): jurisdiction comes from THE LAWS, not the model's path read.
  // A file that matched canon laws IS in-scope BY CONSTRUCTION — P1 is recorded in the vector
  // (it informs) but does NOT block the verdict; P2 (the law presence) is the real gate.
  if (a.P2 !== undefined && a.P2 < DEMAND_T) return { kind: "INCONCLUSIVE", weakest: "P2", vector: a };
  // the min over the ANSWERED deciding clauses (an unjudged clause is not a zero)
  const answered = DECIDING.filter((id) => a[id] !== undefined);
  if (answered.length === 0) return { kind: "INCONCLUSIVE", weakest: null, vector: a };  // FIX (audit:136) fail-closed
  const wrong = answered.map((id) => a[id] as number);
  const minWrong = Math.min(...wrong);
  const weakest = answered[wrong.indexOf(minWrong)] ?? null;
  // FIX B (the audit: the SILENT DEFAULTS were fail-open). An UNANSWERED clause is
  // UNKNOWN — never 0. The drift check runs ONLY on an answered P7; the tier bonus
  // applies ONLY on an answered P3. The vector carries what was actually judged.
  const p7 = a.P7;                                          // undefined = unanswered
  const immutable = a.P3 !== undefined && a.P3 >= DEMAND_T;
  const throwBar = immutable ? THROW_T * 0.9 : THROW_T;     // a canon law tolerates less
  // THE PRIORITY (documented): a wrongness verdict outranks drift; both are in the vector
  if (minWrong >= throwBar) return { kind: "VIOLATION", weakest, vector: a };
  if (p7 !== undefined && p7 >= THROW_T) return { kind: "DRIFT", weakest: "P7", vector: a };
  if (minWrong >= DEMAND_T) return { kind: "SUSPECT", weakest, vector: a };
  return { kind: "LAW", weakest: null, vector: a };
}

/**
 * THE OBSERVABLE QUESTION TEMPLATES — the calibration's second fix.
 * MEASURED: the generic "does this contradict the law?" needs the judge to DERIVE the
 * contradiction (Δ ~0.0 on the corpus). An OBSERVABLE question about the specific value
 * discriminates (Δ 0.59-0.63). Each law maps to a DIRECT READ of the evidence.
 */
export const OBSERVABLE: Array<{ match: RegExp; q: string }> = [
  { match: /stop-?loss|sl cap|150 ?pip|sl_?cap/i,
    q: "Does the evidence state a stop-loss value GREATER than 36 pips? (36 is the D17 ceiling; read the number)" },
  { match: /one tp|tp1|take-?profit|single tp/i,
    q: "Does the evidence define MORE THAN ONE take-profit target (a TP1, TP2, or TP3)?" },
  { match: /pair format|EUR\/USD|slashes/i,
    q: "Does the evidence use a pair name WITHOUT the slash separator (e.g. EURUSD instead of EUR/USD)?" },
  { match: /rrr|risk-?reward|category-specific/i,
    q: "Does the evidence set a FLAT risk-reward ratio (the same value for every category)?" },
  { match: /zfp|threshold/i,
    q: "Does the evidence change the ZFP threshold away from 45?" },
];

/** The best observable question for a set of laws — the FIRST template that matches, else the generic. */
export function observableQuestion(laws: LawEntity[]): string {
  // FIX (audit judge.ts:149): score every law x template; the MOST-SPECIFIC match wins
  // (a template that matches a law whose text is closest to the template's own keywords).
  let best: { q: string; score: number } | null = null;
  for (const l of laws) {
    const hay = `${l.name} ${l.statement}`;
    for (const t of OBSERVABLE) {
      if (t.match.test(hay)) {
        const score = (t.q.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => hay.toLowerCase().includes(w)).length;
        if (!best || score > best.score) best = { q: t.q, score };
      }
    }
  }
  return best?.q ?? CHAIN.P4.q;   // the generic fallback
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * L2 · THE RELEVANCE PASS — THE JEV KERNEL INSIDE THE DETECTION (the fix)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * THE ARCHITECTURE LAW (jev-decision-gate-firewall): THE LEXICON DETECTS. JEV DECIDES.
 *
 * BEFORE (the defect this replaces): relevance was DECIDED LEXICALLY — token overlap
 * + numeric coincidence in `lawsForHunk`. The judge ran DOWNSTREAM, handed a pre-filtered
 * top-3, and could only answer "does this change violate a law you were already given?"
 * It NEVER got to answer the question that matters: WHICH LAWS GOVERN THIS AT ALL.
 * Measured consequence: a MATHEXPR file received the stop-loss + ZFP laws (the probe's case C).
 *
 * AFTER: the detector produces a WIDE candidate net (cheap, zero intelligence, no opinion).
 * THE JUDGE decides relevance — one batched noul PER CANDIDATE, same state, ONE pass.
 * Only the laws the judge marks relevant reach the violation pass.
 */

export interface RelevanceRow { index: number; lawId: string; p: number }

/**
 * THE RELEVANCE BAR — DERIVED, not assumed (measured 2026-09-30, container, judge live).
 *
 * THE MEASURED POSITIVE DISTRIBUTION (a law that DOES govern the file being written):
 *   SL-CAP=0.345 · IRON-01=0.597 · MATHEXPR-SYNTAX=0.473
 * THE SWEEP (the five probe files x three bars):
 *   0.50 → A=0 cards, C=0 cards   (FALSE NEGATIVES — the judge under-reads; coverage lost)
 *   0.30 → A=3 SL-CAP, B=2 IRON-01, C=2 MATHEXPR, D/E=0   (each file gets ITS OWN law)
 *   0.20 → identical to 0.30 (no additional rows cross)
 * ⇒ 0.30 is the LOWEST bar that recovers every measured positive while the neutral and
 *   unrelated files still emit nothing. Below it nothing changes; above it we lose coverage.
 *
 * THE LIMIT (stated, not hidden): this is derived on the POSITIVE side only. In this corpus the
 * detector produced NO candidates for the neutral/unrelated files, so the judge's NEGATIVE
 * discrimination is not yet exercised — a mixed-candidate fixture (a file that lexically matches
 * one law but is actually about another) is the next measurement.
 */
export const RELEVANCE_T = bar(process.env.PLUTUS_RELEVANCE_T ?? 0.3);

export async function relevancePass(
  laws: LawEntity[],
  filePath: string,
  hunk: string,
  timeoutMs = 6000,
): Promise<{ ok: boolean; scored: RelevanceRow[]; reason?: string; requests: number; latencyMs?: number }> {
  if (laws.length === 0) return { ok: true, scored: [], requests: 0 };   // the anti-phantom law
  const h = await health();
  if (!h.ok) return { ok: false, scored: [], reason: h.reason, requests: 0 };

  // ONE state, ONE noul per candidate — the batched pass.
  const subject = filePath.split("/").pop() ?? filePath;
  const lines = laws
    .map((l, i) => `Candidate ${i + 1} [${l.tier}] ${l.name}: ${l.statement.slice(0, 160)}`)
    .join("\n");
  const state = [
    `FILE BEING WRITTEN: ${subject}`,
    `DECLARATIONS IN THE HUNK:`,
    hunk.slice(0, 1200) || "(none)",
    `CANDIDATE LAWS:`,
    lines,
  ].join("\n");

  const questions: Record<string, { type: "noul"; instructions: string }> = {};
  laws.forEach((_, i) => {
    questions[`R${i + 1}`] = {
      type: "noul",
      instructions:
        `Candidate ${i + 1}: does THIS law govern the code being written in ${subject}? ` +
        `A law governs only if the code's subject matter is the same thing the law is about ` +
        `(the same quantity, rule, or domain). Answer no if the law's subject is unrelated ` +
        `to what this file's hunk actually touches.`,
    };
  });

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const started = Date.now();
    try {
      const r = await fetch(jevk5Url(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state, questions }),
        signal: ctl.signal,
      });
      if (!r.ok) return { ok: false, scored: [], reason: `${JEVK5_DOWN}: HTTP ${r.status}`, requests: 1 };
      const j = (await r.json()) as { answers?: Record<string, { noul?: unknown }>; latency_ms?: number } | null;
      if (!j || typeof j !== "object") return { ok: false, scored: [], reason: `${JEVK5_DOWN}: malformed body`, requests: 1 };
      const scored: RelevanceRow[] = [];
      for (const l of laws) {
        const key = `R${laws.indexOf(l) + 1}`;
        const v = (j.answers as Record<string, { noul?: unknown }> | undefined)?.[key]?.noul;
        // an unreadable answer is UNKNOWN, never a silent 0 (the engine's law)
        scored.push({ index: laws.indexOf(l), lawId: l.id, p: typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : -1 });
      }
      return { ok: true, scored, requests: 1, latencyMs: j.latency_ms ?? Date.now() - started };
    } finally { clearTimeout(t); }
  } catch (e) {
    return { ok: false, scored: [], reason: `${JEVK5_DOWN}: ${e instanceof Error ? e.message : String(e)}`, requests: 1 };
  }
}

/** Split the candidates into (relevant, irrelevant) at the bar. An UNKNOWN (-1) is never shown. */
export function partitionByRelevance(
  laws: LawEntity[],
  rows: RelevanceRow[],
): { relevant: LawEntity[]; rejected: Array<{ law: LawEntity; p: number }> } {
  const relevant: LawEntity[] = [];
  const rejected: Array<{ law: LawEntity; p: number }> = [];
  laws.forEach((l, i) => {
    const row = rows.find((r) => r.index === i);
    const p = row ? row.p : -1;
    if (p >= RELEVANCE_T) relevant.push(l); else rejected.push({ law: l, p });
  });
  return { relevant, rejected };
}
