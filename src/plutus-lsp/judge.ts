/**
 * plutus-lsp · judge.ts — CH-PLUTUS, the 7-noul chain (W2)
 *
 * THE LAW (jev-algorithmic-reasoning + jev-decision-gate-firewall):
 *   L1 DETECT (store.ts) → L2 JUDGE (this file) → L3 ENFORCE (cards.ts).
 *   The CODE assembles the state from disk; the model answers numbers; the CODE decides.
 *   ONE batched pass — a chain of 7 nouls costs the same as one.
 *   A down judge is the NAMED `JEVK5_DOWN`, never a fabricated answer.
 *   wrongness = MAX over the ANSWERED wrongness clauses (this layer INFORMS; a missed
 *   violation is the expensive error — see verdict() for the composition fix)
 */

import { JEVK5_DOWN, type LawEntity } from "./store.ts";
export { JEVK5_DOWN } from "./store.ts";   // re-export (the judge owns the refusal)

// FIX (audit: loud, never silent) — the library has no stderr channel of its own; the host
// (scripts/plutus-lsp.ts) installs its receipt writer here. Until installed, notes go nowhere
// (a no-op), never throw. Every "loud" fix in this file routes through this hook.
export let receipt: (line: string) => void = () => {};
export function setReceipt(fn: (line: string) => void): void { receipt = fn; }

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

/**
 * THE SHARED JEV FETCH — one helper for health()/chain()/relevancePass(): AbortController +
 * setTimeout + fetch + the JEVK5_DOWN mapping + the [0,1] answer validation. Added because the
 * three call sites drifted (the relevance timeout, the answer validation, the cleanup).
 */
export interface JevAnswer { answers: Record<string, number>; requests: number; latencyMs: number }
export async function jevk5Fetch(
  state: string,
  questions: Record<string, { type: "noul"; instructions: string }>,
  timeoutMs: number,
): Promise<{ ok: true; value: JevAnswer } | { ok: false; reason: string }> {
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
    if (!r.ok) return { ok: false, reason: `${JEVK5_DOWN}: HTTP ${r.status}` };
    const j = (await r.json()) as { answers?: Record<string, { noul?: unknown }>; latency_ms?: number } | null;
    if (!j || typeof j !== "object") return { ok: false, reason: `${JEVK5_DOWN}: malformed body` };
    // FIX (audit: answers must be a PLAIN object) — `?? {}` masked a missing/invalid field as
    // empty success (ok:true, zero answers → every relevance -1). An array/null answers is a
    // malformed body, named loudly.
    const raw = (j as { answers?: unknown }).answers;
    if (raw === undefined) return { ok: false, reason: `${JEVK5_DOWN}: missing answers field` };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, reason: `${JEVK5_DOWN}: answers is ${Array.isArray(raw) ? "an array" : typeof raw}` };
    const answers: Record<string, number> = {};
    for (const [k, a] of Object.entries(raw as Record<string, { noul?: unknown }>)) {
      const v = (a as { noul?: unknown } | undefined)?.noul;
      if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1) answers[k] = v;
    }
    return { ok: true, value: { answers, requests: 1, latencyMs: j.latency_ms ?? Date.now() - started } };
  } catch (e) {
    return { ok: false, reason: `${JEVK5_DOWN}: ${e instanceof Error ? e.message : String(e)}` };
  } finally { clearTimeout(t); }
}

/** The health probe. Absent → the NAMED JEVK5_DOWN (never a fabricated noul). */
export async function health(timeoutMs = 1500): Promise<{ ok: boolean; reason?: string }> {
  const errOf = (e: unknown): string => (e instanceof Error ? e.message : String(e));   // FIX (audit: instanceof fallback)
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(jevk5Health(), { signal: ctl.signal });
      if (!r.ok) return { ok: false, reason: `${JEVK5_DOWN}: health HTTP ${r.status}` };
      const j = (await r.json()) as unknown;   // FIX (audit: null guard) — a null/non-object body must not throw
      // FIX (audit: arrays rejected EXPLICITLY) — typeof [] is "object", so the old single
      // check let arrays fall through to the generic path. An array health body is malformed.
      if (Array.isArray(j)) return { ok: false, reason: `${JEVK5_DOWN}: health body is an array` };
      if (!j || typeof j !== "object") return { ok: false, reason: `${JEVK5_DOWN}: health body is ${typeof j}` };
      const ok = (j as { ok?: unknown }).ok;
      return ok === true ? { ok: true } : { ok: false, reason: `${JEVK5_DOWN}: health says ${JSON.stringify(j).slice(0, 120)}` };
    } finally { clearTimeout(t); }   // FIX (audit judge.ts:42): cleared on EVERY path
  } catch (e) {
    return { ok: false, reason: `${JEVK5_DOWN}: ${errOf(e)}` };
  }
}

/**
 * THE CHAIN — one batched pass over the 7 nouls.
 * The state is the EVIDENCE TEXT assembled by the caller FROM DISK (the anti-gaming core).
 */
export async function chain(state: string, nodes: NodeId[] = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], timeoutMs = 6000, p4Override?: string): Promise<JudgeVector> {
  // FIX (audit: empty-nodes first) — a vacuous input must not cost a network round-trip,
  // and a JUDGE_NO_NODES must never be masked as JEVK5_DOWN.
  const seen = new Set<NodeId>();
  const deduped = nodes.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));   // FIX (audit: dedupe nodes)
  if (deduped.length === 0) return { ok: false, answers: {}, reason: "JUDGE_NO_NODES", requests: 0 };
  const h = await health();
  if (!h.ok) return { ok: false, answers: {}, reason: h.reason, requests: 0 };

  // FIX (audit: validate the NodeId) — CHAIN[id].q throws TypeError on a runtime-invalid id
  // (via cast), rejecting the promise instead of returning a JudgeVector. Invalid ids are
  // filtered with a loud receipt, never a throw.
  const valid = deduped.filter((id) => id in CHAIN);
  const invalid = deduped.filter((id) => !(id in CHAIN));
  if (invalid.length > 0) receipt(`CHAIN invalid NodeId(s): ${invalid.join(",")} — filtered, never judged`);
  if (valid.length === 0) return { ok: false, answers: {}, reason: "JUDGE_NO_NODES", requests: 0 };
  const questions: Record<string, { type: "noul"; instructions: string }> = {};
  for (const id of valid) questions[id] = { type: "noul", instructions: id === "P4" && p4Override ? p4Override : CHAIN[id].q };

  // FIX (audit: chain reuses jevk5Fetch) — the old body reimplemented AbortController+fetch+
  // [0,1] validation inline and had already drifted (entries-loop vs per-node loop, different
  // malformed-body handling). One helper, one validation, no drift. The per-node [0,1] filter
  // runs on the helper's validated answers so a corrupt judge still cannot force a verdict.
  const res = await jevk5Fetch(state, questions, timeoutMs);
  if (!res.ok) return { ok: false, answers: {}, reason: res.reason, requests: 1 };
  const answers: Partial<Record<NodeId, number>> = {};
  for (const id of valid) {
    const v = res.value.answers[id];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1) answers[id] = v;
  }
  const answered = Object.keys(answers).length;
  if (answered !== valid.length) {
    return { ok: false, answers, reason: `JUDGE_ANSWER_COUNT: ${answered}/${valid.length}`, requests: 1, latencyMs: res.value.latencyMs };
  }
  return { ok: true, answers, requests: 1, latencyMs: res.value.latencyMs };
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
// FIX (audit: single threshold source) — the old consts froze at import while the getters
// re-read env at call time: a hot-retune reached verdict() but NOT a consumer importing the
// const. The consts now delegate to the same getters verdict()/partitionByRelevance() use.
// FIX (audit: lazy thresholds) — the getters read env at CALL time, consistent with
// jevk5Url(). Hot-retune works. The consts below delegate to the getters (single source).
export const throwT = () => bar(process.env.PLUTUS_THROW_T, 0.85);
export const demandT = () => bar(process.env.PLUTUS_DEMAND_T, 0.30);
export const relevanceT = () => bar(process.env.PLUTUS_RELEVANCE_T, 0.3);
export const THROW_T = throwT();   // the VIOLATION bar (policy) — compat alias, same source
export const DEMAND_T = demandT(); // the SUSPECT bar (DERIVED) — compat alias, same source

export interface Verdict {
  kind: "VIOLATION" | "SUSPECT" | "DRIFT" | "LAW" | "INCONCLUSIVE" | "JUDGE_DOWN";
  weakest: NodeId | null;
  vector: Partial<Record<NodeId, number>>;
  reason?: string;
}

/**
 * THE VERDICT — pure code. The DECIDING clauses are the WRONGNESS set {P4 VIOLATE, P5 CONTRACT,
 * P6 ANTIPATTERN} plus P7 DRIFT; the INFORMING clauses are {P1 SCOPE, P2 LAW, P3 TIER}.
 * The wrongness = MAX over the ANSWERED wrongness clauses (this layer INFORMNS; a missed
 * violation is the expensive error — see the composition fix below).
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
  if (a.P2 !== undefined && a.P2 < demandT()) return { kind: "INCONCLUSIVE", weakest: "P2", vector: a };
  // ★ THE COMPOSITION FIX (the derailment probe, 2026-09-30). The rule was min() over the
  //   wrongness clauses — the "weakest clause, never an average" law. MEASURED, that law is
  //   BACKWARDS for this layer: the clauses are about DIFFERENT law kinds, so an inapplicable
  //   one (P5 CONTRACT = the E1->E2->E3 engine architecture) dragged a real numeric breach
  //   down — P4=0.879 (a clear ZFP violation) was diluted to 0.418 by P5 and the card said
  //   "SUSPECT" instead of VIOLATION. THIS LAYER INFORMS; a missed violation is the
  //   expensive error, a spurious one costs a card the agent can dismiss. So the wrongness
  //   signal is the MAX over the ANSWERED wrongness clauses (any one saying "this
  //   contradicts" is enough to say so), and an UNANSWERED clause is never a zero.
  const answered = DECIDING.filter((id) => a[id] !== undefined);
  if (answered.length === 0) return { kind: "INCONCLUSIVE", weakest: null, vector: a };  // fail-closed
  const wrong = answered.map((id) => a[id] as number);
  const maxWrong = Math.max(...wrong);
  const strongest = answered[wrong.indexOf(maxWrong)] ?? null;
  // FIX B (the audit: the SILENT DEFAULTS were fail-open). An UNANSWERED clause is
  // UNKNOWN — never 0. The drift check runs ONLY on an answered P7; the tier bonus
  // applies ONLY on an answered P3. The vector carries what was actually judged.
  const p7 = a.P7;                                          // undefined = unanswered
  // FIX (audit: NO import-time snapshots) — THROW_T/DEMAND_T freeze at import; the getters
  // read env at call time, so a hot-retune reaches VIOLATION/DRIFT/SUSPECT too.
  const TT = throwT(), DT = demandT();
  const immutable = a.P3 !== undefined && a.P3 >= DT;
  const throwBar = immutable ? TT * 0.9 : TT;             // a canon law tolerates less
  // THE PRIORITY (documented): a wrongness verdict outranks drift; both are in the vector
  if (maxWrong >= throwBar) return { kind: "VIOLATION", weakest: strongest, vector: a };
  if (p7 !== undefined && p7 >= TT) return { kind: "DRIFT", weakest: "P7", vector: a };
  if (maxWrong >= DT) return { kind: "SUSPECT", weakest: strongest, vector: a };
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
export const RELEVANCE_T = relevanceT();   // compat alias — same single source as the getter

export async function relevancePass(
  laws: LawEntity[],
  filePath: string,
  hunk: string,
  // ★ 20s: the relevance question is deliberately long (it teaches the judge that a value
  //   DISAGREEMENT is the most-governed case), so the batch needs real headroom. The
  //   6s default aborted and degraded to "lexical, no judge" — a silent intelligence loss.
  timeoutMs = 20000,
): Promise<{ ok: boolean; scored: RelevanceRow[]; reason?: string; requests: number; latencyMs?: number; judged: number; total: number; dropped: number }> {
  // FIX (audit: the cap is VISIBLE) — the return carries judged/total/dropped so a caller
  // with 20 candidates sees 12 rows AND knows the tail was never judged (fail-open
  // partial-as-complete is banned).
  if (laws.length === 0) return { ok: true, scored: [], requests: 0, judged: 0, total: 0, dropped: 0 };   // the anti-phantom law
  const h = await health();
  if (!h.ok) return { ok: false, scored: [], reason: h.reason, requests: 0, judged: 0, total: laws.length, dropped: 0 };

  // FIX (audit: cap the relevance batch) — the state is one batched pass; an uncapped
  // candidate list risks an oversized request. Cap at 12 (the detector's wide net) and
  // MARK the truncation so the caller knows the tail was never judged.
  const CAPPED = 12;
  const judged = laws.slice(0, CAPPED);
  const dropped = laws.length - judged.length;

  // FIX (audit: cross-platform subject) — backslashes split, trailing slashes yield no
  // empty base, and the parent dir is preserved so same-basename files disambiguate.
  const normPath = filePath.replace(/\\/g, "/").replace(/\/+$/, "");
  const segs = normPath.split("/").filter(Boolean);
  const subject = segs.length > 1 ? `${segs[segs.length - 2]}/${segs[segs.length - 1]}` : (segs[0] ?? filePath);
  const lines = judged
    .map((l, i) => `Candidate ${i + 1} [${l.tier}] ${l.name}: ${l.statement.slice(0, 160)}`)
    .join("\n") + (dropped > 0 ? `\n... [${dropped} more candidates truncated — never judged]` : "");
  const state = [
    `FILE BEING WRITTEN: ${subject}`,
    `DECLARATIONS IN THE HUNK:`,
    hunk.slice(0, 1200) || "(none)",
    `CANDIDATE LAWS:`,
    lines,
  ].join("\n");

  const questions: Record<string, { type: "noul"; instructions: string }> = {};
  judged.forEach((_, i) => {
    questions[`R${i + 1}`] = {
      type: "noul",
      instructions:
        `Candidate ${i + 1}: does THIS law govern the code being written in ${subject}? ` +
        `A law governs if the hunk touches the SAME QUANTITY, RULE OR DOMAIN the law is about. ` +
        `★ A DIFFERENT VALUE IS STILL GOVERNED — if the law fixes a constant or a rule and the ` +
        `hunk sets a different value for that same thing, the law governs THAT MOST: a ` +
        `disagreement is the case you must catch. Answer no ONLY when the law's subject is a ` +
        `different subject entirely (a stop-loss law vs a colour-palette edit).`,
    };
  });

  const res = await jevk5Fetch(state, questions, timeoutMs);
  if (!res.ok) return { ok: false, scored: [], reason: res.reason, requests: 1, judged: judged.length, total: laws.length, dropped };
  const scored: RelevanceRow[] = [];
  judged.forEach((l, i) => {
    const v = res.value.answers[`R${i + 1}`];
    // an unreadable answer is UNKNOWN, never a silent 0 (the engine's law)
    scored.push({ index: i, lawId: l.id, p: typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : -1 });
  });
  return { ok: true, scored, requests: 1, latencyMs: res.value.latencyMs, judged: judged.length, total: laws.length, dropped };
}

export interface RelevancePartition {
  relevant: LawEntity[];
  rejected: Array<{ law: LawEntity; p: number }>;
  /** candidates the judge could not read (p = -1) — judge-said-no is NOT the same verdict */
  unknown: LawEntity[];
}

/** Split the candidates into (relevant, irrelevant) at the bar. An UNKNOWN (-1) is never shown. */
export function partitionByRelevance(
  laws: LawEntity[],
  rows: RelevanceRow[],
): RelevancePartition {
  const byId = new Map(laws.map((l) => [l.id, l]));
  const relevant: LawEntity[] = [];
  const rejected: Array<{ law: LawEntity; p: number }> = [];
  const unknown: LawEntity[] = [];
  let unmatched = 0;
  for (const r of rows) {
    // FIX (audit: unmatched rows are COUNTED) — a stale/misordered row (wrong lawId) is still
    // never assigned, but the count surfaces in the receipt so a hallucinated judge reply
    // (wrong lawId, missing Rk) cannot disappear silently.
    const law = byId.get(r.lawId);
    if (!law) { unmatched++; continue; }
    if (r.p < 0) unknown.push(law);
    else if (r.p >= relevanceT()) relevant.push(law); else rejected.push({ law, p: r.p });
  }
  if (unmatched > 0) receipt(`PARTITION unmatched=${unmatched}/${rows.length} rows (stale or hallucinated lawId)`);
  return { relevant, rejected, unknown };
}
