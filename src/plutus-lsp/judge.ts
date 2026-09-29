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
    const r = await fetch(jevk5Health(), { signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) return { ok: false, reason: `${JEVK5_DOWN}: health HTTP ${r.status}` };
    const j = (await r.json()) as { ok?: boolean; model?: string };
    return j.ok ? { ok: true } : { ok: false, reason: `${JEVK5_DOWN}: health says ${JSON.stringify(j)}` };
  } catch (e) {
    return { ok: false, reason: `${JEVK5_DOWN}: ${(e as Error).message}` };
  }
}

/**
 * THE CHAIN — one batched pass over the 7 nouls.
 * The state is the EVIDENCE TEXT assembled by the caller FROM DISK (the anti-gaming core).
 */
export async function chain(state: string, nodes: NodeId[] = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], timeoutMs = 6000): Promise<JudgeVector> {
  const h = await health();
  if (!h.ok) return { ok: false, answers: {}, reason: h.reason, requests: 0 };

  const questions: Record<string, { type: "noul"; instructions: string }> = {};
  for (const id of nodes) questions[id] = { type: "noul", instructions: CHAIN[id].q };

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const started = Date.now();
    const r = await fetch(jevk5Url(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state, questions }),
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!r.ok) return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: HTTP ${r.status}`, requests: 1 };
    const j = (await r.json()) as { answers?: Record<string, { noul?: number }>; latency_ms?: number };
    const answers: Partial<Record<NodeId, number>> = {};
    for (const id of nodes) {
      const v = j.answers?.[id]?.noul;
      if (typeof v === "number") answers[id] = v;
    }
    const answered = Object.keys(answers).length;
    if (answered !== nodes.length) {
      return { ok: false, answers, reason: `JUDGE_ANSWER_COUNT: ${answered}/${nodes.length}`, requests: 1, latencyMs: j.latency_ms ?? (Date.now() - started) };
    }
    return { ok: true, answers, requests: 1, latencyMs: j.latency_ms ?? (Date.now() - started) };
  } catch (e) {
    return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: ${(e as Error).message}`, requests: 1 };
  }
}

/** The evidence text — assembled FROM DISK by the caller (never agent prose). */
export function buildState(target: string, laws: LawEntity[], hunk: string): string {
  const lawText = laws.slice(0, 6).map((l) => `[${l.tier}] ${l.name}: ${l.statement} (anchor ${l.anchor})`).join("\n");
  return [
    `TARGET FILE: ${target}`,
    `GOVERNING LAWS (${laws.length}):`,
    lawText || "(none)",
    `PROPOSED CHANGE (the diff hunk):`,
    hunk.slice(0, 1500) || "(none)",
  ].join("\n");
}

/** The verdict — PURE CODE (the model answers numbers; the code decides). */
export const THROW_T = 0.85;
export const DEMAND_T = 0.5;

export interface Verdict {
  kind: "VIOLATION" | "SUSPECT" | "DRIFT" | "LAW" | "JUDGE_DOWN";
  weakest: NodeId | null;
  vector: Partial<Record<NodeId, number>>;
  reason?: string;
}

export function verdict(v: JudgeVector): Verdict {
  if (!v.ok) return { kind: "JUDGE_DOWN", weakest: null, vector: {}, reason: v.reason };
  const a = v.answers;
  const p4 = a.P4 ?? 0;
  const p7 = a.P7 ?? 0;
  if (p4 >= THROW_T) return { kind: "VIOLATION", weakest: "P4", vector: a };
  if (p7 >= THROW_T) return { kind: "DRIFT", weakest: "P7", vector: a };
  if (p4 >= DEMAND_T) return { kind: "SUSPECT", weakest: "P4", vector: a };
  return { kind: "LAW", weakest: null, vector: a };
}
