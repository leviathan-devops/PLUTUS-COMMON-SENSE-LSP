/**
 * plutus-lsp · cards.ts — THE INFO CARDS (the design mirrors GI Kernels' gi-lsp/cards.ts)
 *
 * ★ ONE SERVER, ONE CONSUMER: the LSP emits these as Diagnostics. A card is built from a
 *   MEASURED graph row + a MEASURED judge probability — never a guess. A card that asserts
 *   a count or a probability it did not measure is the FABRICATION anti-pattern.
 *
 * ★ WHAT CHANGED FROM THE FIRST CUT (the operator caught it: "this is unintelligible slop"):
 *   BEFORE: one blob per file — "2 canon law(s) govern this file\n[IMMUTABLE] SL-CAP: …". The
 *           agent cannot act on a wall of text with no subject, no anchor, and no verdict.
 *   AFTER:  ONE CARD PER GOVERNING LAW, per the GI CALLERS/UNWIRED shape —
 *             · the title NAMES THE SUBJECT (the law id + what it governs)
 *             · the rows are EVIDENCE: the statement, the file:line, the tier,
 *               and the JUDGE'S OWN probability (traceable to the model that produced it)
 *             · the card's source is a single token the LSP consumer filters on
 *             · null when nothing was measured — silence, never a fabricated card
 */

// ── THE TOKENS (a single-card filterable source, mirroring GI_LSP_TOKENS) ─────────────────
export const PLUTUS_LSP_TOKENS = [
  "plutus/law",       // one governing law, with the judge's relevance probability
  "plutus/violation", // the judged breach of a governing law
  "plutus/tier",      // the immutability notice (folded into law cards now)
  "plutus/callers",   // the import-edge blast radius
  "plutus/drift",     // the judged conflict with a prior decision
  "plutus/suspect",   // the marginal / inconclusive
  "plutus/stale",     // a named refusal (no graph, judge down)
] as const;
export type PlutusLspToken = (typeof PLUTUS_LSP_TOKENS)[number];

export const SEVERITY = { Error: 1, Warning: 2, Information: 3, Hint: 4 } as const;
type Sev = (typeof SEVERITY)[keyof typeof SEVERITY];

export type CardShape = "LAW" | "VIOLATION" | "DRIFT" | "CALLERS" | "SUSPECT" | "STALE";

/** ★ THE CARD — the GI FactCard shape, unchanged. The consumer is the LSP runtime. */
export interface FactCard {
  shape: CardShape;
  /** NAMES THE SUBJECT — "SL-CAP — stop-loss cap · 2/12 candidate laws kept" */
  title: string;
  /** the EVIDENCE rows — real file:line, real measured numbers. NEVER empty. */
  rows: string[];
  /** LSP severity: 1 Error · 2 Warning · 3 Information · 4 Hint. Cards are INFORMATIONAL. */
  severity: Sev;
  /** the single filterable token. */
  source: PlutusLspToken;
  /** the count this card measured (for `shown=N total=M`); -1 when not a counted shape. */
  total: number;
}

// ── THE GRAPH ROW (what a law card is built from — a MEASURED store row) ───────────────────
import type { LawEntity } from "./store.ts";
import type { Verdict } from "./judge.ts";

/** A law + the judge's measured relevance probability (the kernel's output). */
export interface JudgedLaw {
  law: LawEntity;
  /** the judge's relevance noul, 0..1, or -1 when UNREADABLE (never shown as a number). */
  p: number;
}

/**
 * LAW — ★ ONE CARD PER GOVERNING LAW (the design fix). The title names the law AND what the
 * kernel decided; the rows carry the verbatim statement, the file:line anchor, the tier, and
 * the judge's own probability — so every claim is traceable to a read and to the model.
 *
 * @param kept   the laws the relevance kernel KEPT (measured)
 * @param total  how many candidates the detector raised (measured) — "kept/total" is the
 *               kernel's precision, shown so the agent can see the filter was narrow
 */
export function lawCard(kept: JudgedLaw[], totalCandidates: number, judged: boolean): FactCard[] {
  if (kept.length === 0) return [];                 // the anti-phantom law: silence, not a card
  return kept.map(({ law, p }) => {
    const prob = p >= 0 ? `relevance ${p.toFixed(2)}` : "relevance unread";
    const of = totalCandidates > kept.length ? ` · kept ${kept.length} of ${totalCandidates} candidates` : "";
    return {
      shape: "LAW" as const,
      title: `${law.name} — governs this code${judged ? ` (${prob}${of})` : " (lexical, no judge)"}`,
      rows: [
        `LAW: ${law.statement}`,
        `TIER: ${law.tier}${law.tier === "IMMUTABLE" ? " — never change without a recorded ruling" : ""}`,
        `SOURCE: ${law.anchor}`,
        `JUDGE: ${prob}`,
      ],
      severity: SEVERITY.Information,
      source: "plutus/law" as const,
      total: kept.length,
    };
  });
}

/**
 * VIOLATION / DRIFT / SUSPECT — the JUDGED outcome on the laws that survived relevance.
 * The title names the breaching law; the rows carry the whole vector so the agent sees
 * WHICH clause fired and how strongly (the GI meaningCard pattern: the model is named).
 */
export function verdictCard(v: Verdict, kept: JudgedLaw[]): FactCard | null {
  const pct = (n?: number) => (typeof n === "number" ? n.toFixed(3) : "n/a");
  if (v.kind === "JUDGE_DOWN") {
    return {
      shape: "STALE",
      title: "the judge is down — the canon could not be consulted",
      rows: [`reason: ${v.reason ?? "JEVK5_DOWN"}`],
      severity: SEVERITY.Warning,
      source: "plutus/stale",
      total: 1,
    };
  }
  if (v.kind === "INCONCLUSIVE") {
    return {
      shape: "SUSPECT",
      title: `INCONCLUSIVE — the judge could not reach a verdict (weakest clause ${v.weakest ?? "none"})`,
      rows: [
        `the undecided clause: ${v.weakest ?? "(no deciding clause answered)"}`,
        `vector: ${Object.entries(v.vector).map(([k, n]) => `${k}=${pct(n)}`).join(" ") || "(empty)"}`,
      ],
      severity: SEVERITY.Hint,
      source: "plutus/suspect",
      total: 1,
    };
  }
  if (v.kind === "LAW") return null;                // the law cards already inform

  // attribute to the law the verdict actually evaluated
  const law = v.weakest && v.weakest !== "P7" ? (kept.find((k) => k.law.tier === "IMMUTABLE") ?? kept[0])?.law : kept[0]?.law;
  if (!law) return null;                            // no measured law → no card, never a guess

  const vector = Object.entries(v.vector).map(([k, n]) => `${k}=${pct(n)}`).join("  ");
  if (v.kind === "VIOLATION") {
    return {
      shape: "VIOLATION",
      title: `VIOLATION — this change contradicts ${law.name} (${v.weakest}=${pct(v.vector[v.weakest as keyof typeof v.vector])})`,
      rows: [
        `LAW: ${law.statement}`,
        `SOURCE: ${law.anchor}`,
        `YOU ARE EDITING: ${law.anchor.split(":")[0]} — read the law before this edit lands`,
        `VECTOR: ${vector}`,
      ],
      severity: SEVERITY.Error,
      source: "plutus/violation",
      total: 1,
    };
  }
  if (v.kind === "DRIFT") {
    return {
      shape: "DRIFT",
      title: `DRIFT — this change contradicts a prior decision (P7=${pct(v.vector.P7)})`,
      rows: [`LAW: ${law.statement}`, `SOURCE: ${law.anchor}`, `VECTOR: ${vector}`],
      severity: SEVERITY.Warning,
      source: "plutus/drift",
      total: 1,
    };
  }
  return {
    shape: "SUSPECT",
    title: `SUSPECT — ${law.name} may be breached (${v.weakest}=${pct(v.vector[v.weakest as keyof typeof v.vector])}); evidence required`,
    rows: [`LAW: ${law.statement}`, `SOURCE: ${law.anchor}`, `VECTOR: ${vector}`],
    severity: SEVERITY.Warning,
    source: "plutus/suspect",
    total: 1,
  };
}

/** CALLERS — the import-edge blast radius (the real read; a measured count). */
export function callersCard(callers: string[]): FactCard | null {
  if (callers.length === 0) return null;
  return {
    shape: "CALLERS",
    title: `this file — ${callers.length} importer${callers.length === 1 ? "" : "s"}`,
    rows: callers.slice(0, 8).map((c) => `imported by ${c}`),
    severity: SEVERITY.Information,
    source: "plutus/callers",
    total: callers.length,
  };
}

/** STALE — a named refusal (no graph, judge down). A loud card, never a silent pass. */
export function staleCard(reason: string): FactCard {
  return {
    shape: "STALE",
    title: "the canon graph is unavailable",
    rows: [`reason: ${reason}`],
    severity: SEVERITY.Warning,
    source: "plutus/stale",
    total: 1,
  };
}

/** The full card set for one file: one card per governing law + the judged outcome + the callers. */
export function fileCards(
  kept: JudgedLaw[],
  totalCandidates: number,
  v: Verdict | null,
  callers: string[],
  judged: boolean,
): FactCard[] {
  const out: FactCard[] = [];
  out.push(...lawCard(kept, totalCandidates, judged));
  const cc = callersCard(callers); if (cc) out.push(cc);
  if (v) { const vc = verdictCard(v, kept); if (vc) out.push(vc); }
  return out;
}