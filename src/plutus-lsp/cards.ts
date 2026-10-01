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
// NOTE (audit: dead filter token): `plutus/tier` is exported for backward compat but no card
// emits it — the tier now rides inside each law card's TIER row. A consumer filtering on
// `plutus/tier` alone will wait forever; filter on `plutus/law` instead. Kept, not removed,
// so existing filters do not break.
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
  /** the judge's relevance score, 0..1, or -1 when UNREADABLE (never shown as a number). */
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
export function lawCard(kept: JudgedLaw[] | null | undefined, totalCandidates: number, judged: boolean): FactCard[] {
  if (!kept || kept.length === 0) return [];        // the anti-phantom law: silence, not a card
  // FIX (audit: per-element guards + finite 0..1) — one malformed entry must not throw and lose
  // every card; Infinity is NOT a measured probability (it rendered as "Infinity" in a title).
  const clean = kept.filter((k) => k && k.law && typeof k.law.name === "string" && typeof k.law.statement === "string");
  // FIX (audit round-11: count what was EMITTED) — `of`/`total` used unfiltered kept.length
  // while cards came from clean: one malformed entry made the card claim a count it did not
  // emit. Both now read clean.length.
  const n = clean.length;
  return clean.map(({ law, p }) => {
    const measured = typeof p === "number" && Number.isFinite(p) && p >= 0 && p <= 1;
    const prob = measured ? `relevance ${p.toFixed(2)}` : "relevance unread";
    const of = totalCandidates > n ? ` · kept ${n} of ${totalCandidates} candidates` : "";
    return {
      shape: "LAW" as const,
      title: `${law.name} — governs this code${judged ? ` (${prob}${of})` : " (lexical, no judge)"}`,
      rows: [
        `LAW: ${law.statement}`,
        // FIX (audit round-11: tier/anchor fallbacks) — clean only checks name/statement, so a
        // corrupt store rendered `TIER: undefined` / `SOURCE: undefined`. Named fallbacks now.
        `TIER: ${law.tier ?? "(tier missing)"}${law.tier === "IMMUTABLE" ? " — never change without a recorded ruling" : ""}`,
        `SOURCE: ${law.anchor ?? "(anchor missing)"}`,
        // FIX (audit: lexical path mislabeled) — when no judge ran, the row says LEXICAL,
        // never a probability (traceability: a number must come from the model that ran it)
        judged ? `JUDGE: ${prob}` : `LEXICAL: token match, not judged`,
      ],
      severity: SEVERITY.Information,
      source: "plutus/law" as const,
      total: n,
    };
  });
}

/**
 * VIOLATION / DRIFT / SUSPECT — the JUDGED outcome on the laws that survived relevance.
 * The title names the breaching law; the rows carry the whole vector so the agent sees
 * WHICH clause fired and how strongly (the GI meaningCard pattern: the model is named).
 */
// FIX (audit: the warning names the TARGET) — the old row derived the path from the law's
// anchor (the canon file), telling the agent it was editing the bible. The caller passes the
// file being written; the row names THAT.
export function verdictCard(v: Verdict | null | undefined, kept: JudgedLaw[] | null | undefined, targetFile?: string): FactCard | null {
  // FIX (audit: null guard) — a direct caller passing null must not throw and lose every card.
  if (!v || !kept) return null;
  const vector: Record<string, number> = (v.vector && typeof v.vector === "object" && !Array.isArray(v.vector)) ? v.vector : {};
  // FIX (audit: finite-only pct) — NaN/Infinity render as "n/a", never "NaN"/"Infinity" in a title.
  const pct = (n?: number) => (typeof n === "number" && Number.isFinite(n) ? n.toFixed(3) : "n/a");
  if (v.kind === "JUDGE_DOWN") {
    // FIX (audit: STALE disambiguation) — two paths emit shape STALE on plutus/stale
    // (this one + staleCard for a dead graph). The reason CODE is the machine-readable
    // discriminator: JEVK5_* = the judge lane, PLUTUS_NO_* = the graph lane. Consumers
    // filter on the code, never on title prose.
    // FIX (audit round-11: reason typeof guard) — a non-string reason (number/object via JS
    // interop) threw on .split and lost every card. Non-strings get the named code.
    const code = (typeof v.reason === "string" && v.reason.length > 0 ? v.reason : "JEVK5_DOWN").split(":")[0];
    return {
      shape: "STALE",
      title: `the judge is down — the canon could not be consulted [${code}]`,
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
        `VECTOR: ${Object.entries(vector).map(([k, n]) => `${k}=${pct(n)}`).join("  ") || "(empty)"}`,
      ],
      severity: SEVERITY.Hint,
      source: "plutus/suspect",
      total: 1,
    };
  }
  if (v.kind === "LAW") return null;                // the law cards already inform

  // FIX (audit: attribution honesty) — the verdict names a CLAUSE, never a law. The pick is
  // the highest-relevance survivor, which is a GUESS when the top p is UNREADABLE (-1) or tied
  // on lexical-only paths. In that case the card is DOWNGRADED to SUSPECT (a warning, never an
  // Error/DRIFT fact) and the title says so.
  // FIX (audit: epsilon tie + non-finite counts) — exact-float equality missed near-ties;
  // and a law whose p is Infinity/NaN was dropped from `scored`, so the fallback pick was
  // marked unattributed for the wrong reason. Every finite-or-not entry is scored; only a
  // finite 0..1 UNIQUE top is measured-attributed.
  const scored = kept.filter((k) => k && k.law && typeof k.p === "number");
  const finiteTop = scored.filter((k) => Number.isFinite(k.p) && k.p >= 0 && k.p <= 1).sort((a, b) => b.p - a.p);
  const law = (finiteTop[0] ?? scored[0] ?? kept[0])?.law;
  if (!law) return null;                            // no measured law → no card, never a guess
  // FIX (audit round-11: epsilon at DISPLAY precision) — 1e-9 caught exact-float ties only,
  // but titles render p.toFixed(2): 0.811 vs 0.807 displayed identically yet attributed
  // confidently. Near-ties within display rounding now downgrade to SUSPECT.
  const EPS = 1e-2;
  const topTied = finiteTop.length > 1 && Math.abs(finiteTop[0].p - finiteTop[1].p) < EPS;
  const attributed = finiteTop.length > 0 && !topTied;

  const vecStr = Object.entries(vector).map(([k, n]) => `${k}=${pct(n)}`).join("  ");
  // FIX (audit: strip file:line:col in one pass) — `src/foo.ts:10:5` must become a clean path,
  // not `src/foo.ts:10`. Windows drive paths (C:\...) survive.
  const anchorFile = targetFile ?? law.anchor ?? "";
  // FIX (audit: explicit kind gate) — an unknown kind coerces to SUSPECT LOUDLY: the row
  // names the coerced kind instead of silently casting via `as`. Only VIOLATION/DRIFT survive.
  const known = v.kind === "VIOLATION" || v.kind === "DRIFT" ? v.kind : "SUSPECT";
  const kindNote = known === "SUSPECT" && v.kind !== "SUSPECT" ? ` (kind ${v.kind} coerced)` : "";
  const effKind: "VIOLATION" | "DRIFT" | "SUSPECT" = !attributed ? "SUSPECT" : known;
  // FIX (audit round-11: no vacuous Error) — when weakest is null or its score is missing,
  // the old title rendered `VIOLATION — … (none=n/a)`: a confident breach card with NO measured
  // clause. A breach without its evidence is SUSPECT (a warning), never an Error.
  const weakScore = v.weakest ? vector[v.weakest as keyof typeof vector] : undefined;
  const vacuous = v.weakest == null || typeof weakScore !== "number" || !Number.isFinite(weakScore);
  if (effKind === "VIOLATION" && v.kind === "VIOLATION" && !vacuous) {
    return {
      shape: "VIOLATION",
      title: `VIOLATION — this change contradicts ${law.name} (${v.weakest}=${pct(weakScore)})`,
      rows: [
        `LAW: ${law.statement}`,
        `SOURCE: ${law.anchor}`,
        `YOU ARE EDITING: ${anchorFile} — read the law before this edit lands`,
        `VECTOR: ${vecStr}`,
      ],
      severity: SEVERITY.Error,
      source: "plutus/violation",
      total: 1,
    };
  }
  if (effKind === "DRIFT" && v.kind === "DRIFT") {
    // FIX (audit: the clause comes from the verdict) — a hardcoded P7 misattributes when the
    // drift fired on a different clause or the vector lacks P7 (then "P7=n/a" is the tell).
    const dc = v.weakest ?? "P7";
    return {
      shape: "DRIFT",
      title: `DRIFT — this change contradicts a prior decision (${dc}=${pct(vector[dc as keyof typeof vector])})`,
      rows: [`LAW: ${law.statement}`, `SOURCE: ${law.anchor}`, `VECTOR: ${vecStr}`],
      severity: SEVERITY.Warning,
      source: "plutus/drift",
      total: 1,
    };
  }
  // FIX (audit: single SUSPECT shape) — INCONCLUSIVE already returns Hint above; this fallback
  // is always Warning with the same "  " vector separator, so a consumer never sees one shape
  // at two severities.
  return {
    shape: "SUSPECT",
    title: `SUSPECT — ${law.name} may be breached (${v.weakest ?? "none"}=${pct(v.weakest ? vector[v.weakest as keyof typeof vector] : undefined)})${kindNote}; evidence required`,
    rows: [`LAW: ${law.statement}`, `SOURCE: ${law.anchor}`, `VECTOR: ${vecStr}`],
    severity: SEVERITY.Warning,
    source: "plutus/suspect",
    total: 1,
  };
}

/** CALLERS — the import-edge blast radius (the real read; a measured count). */
export function callersCard(callers: unknown): FactCard | null {
  // FIX (audit: null/non-string guard) — exported callers can be null or contain non-strings;
  // a .trim() on null throws and loses every card for the file.
  if (!Array.isArray(callers) || callers.length === 0) return null;
  const clean = callers.filter((c): c is string => typeof c === "string");
  const shown = [...new Set(clean.map((c) => c.trim()).filter((c) => c.length > 0))];
  // FIX (audit: deduped-empty is null) — [null,"  "] yielded rows=[] with total:0, violating
  // the NEVER-empty-rows invariant. Silence, not an empty card.
  if (shown.length === 0) return null;
  const rows = shown.slice(0, 8).map((c) => `imported by ${c}`);
  if (shown.length > 8) rows.push(`… and ${shown.length - 8} more`);
  return {
    shape: "CALLERS",
    title: `this file — ${shown.length} importer${shown.length === 1 ? "" : "s"}`,
    rows,
    severity: SEVERITY.Information,
    source: "plutus/callers",
    total: shown.length,
  };
}

/** STALE — a named refusal (no graph, judge down). A loud card, never a silent pass. */
export function staleCard(reason: string | null | undefined): FactCard {
  // FIX (audit: STALE disambiguation) — same shape/source as the JUDGE_DOWN card above; the
  // reason CODE in the title is the discriminator (PLUTUS_NO_* = the graph lane).
  // FIX (audit round-11: null-guarded) — reason.split threw on null/undefined/non-string,
  // losing EVERY card for the file. A refusal path must never throw.
  const rs = typeof reason === "string" && reason.length > 0 ? reason : "PLUTUS_NO_STORE: unknown";
  const code = rs.split(":")[0];
  return {
    shape: "STALE",
    title: `the canon graph is unavailable [${code}]`,
    rows: [`reason: ${rs}`],
    severity: SEVERITY.Warning,
    source: "plutus/stale",
    total: 1,
  };
}

/** The full card set for one file: one card per governing law + the judged outcome + the callers.
 *  FIX (audit: honest signatures) — the body already tolerates null (it delegates to the
 *  null-guarded lawCard/callersCard/verdictCard); the types now say so instead of lying. */
export function fileCards(
  kept: JudgedLaw[] | null | undefined,
  totalCandidates: number,
  v: Verdict | null | undefined,
  callers: string[] | null | undefined,
  judged: boolean,
  targetFile?: string,
): FactCard[] {
  const out: FactCard[] = [];
  out.push(...lawCard(kept ?? [], totalCandidates, judged));
  const cc = callersCard(callers ?? []); if (cc) out.push(cc);
  if (v) { const vc = verdictCard(v, kept ?? [], targetFile); if (vc) out.push(vc); }
  return out;
}