/**
 * plutus-lsp · store.ts — THE GRAPH READER (W1)
 *
 * Reads the Plutus knowledge graphs:
 *   L1 SEMANTICA  <root>/.omp/graph-intelligence/layers/semantica/kg.json
 *   L2 ARSUMBRIS  the au daemon socket (optional; L1-only is the documented fallback)
 *
 * THE LAW (this file):
 *   L-NAMED-FAIL — an absent graph is the NAMED `PLUTUS_NO_STORE`, never a silent empty.
 *   L-READONLY   — this module never writes.
 *   STATE-FROM-DISK — every field returned here comes from a file/socket read.
 *
 * The precedent: Graph_Intelligence/scripts/gi-lsp.ts (the GI reflex, 220 L).
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { connect } from "node:net";
import { homedir } from "node:os";

// ── THE ROOT MARKERS (the spawn gate 2 — a project root must carry one) ──────
// FIX (audit store.ts:22): the PROJECT-SPECIFIC markers first; the generic fallback is short-walk only
export const ROOT_MARKERS = [".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT", "tsconfig.json"];
export const STRONG_MARKERS = [".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT"];

// ── THE NAMED REFUSALS ───────────────────────────────────────────────────────
export const PLUTUS_NO_STORE = "PLUTUS_NO_STORE";
export const PLUTUS_NO_ROOT = "PLUTUS_NO_ROOT";
export const JEVK5_DOWN = "JEVK5_DOWN";

export const TIERS = ["IMMUTABLE", "EVOLVING", "SUPERSEDED"] as const;
/** FIX (audit store.ts:96): a validated tier — an unknown value falls back to IMMUTABLE. */
export function validTier(v: unknown): "IMMUTABLE" | "EVOLVING" | "SUPERSEDED" {
  const t = String(v ?? "").toUpperCase();
  return (TIERS as readonly string[]).includes(t) ? (t as "IMMUTABLE" | "EVOLVING" | "SUPERSEDED") : "IMMUTABLE";
}

export interface LawEntity {
  id: string;          // e.g. "law::IRON-01"
  name: string;        // e.g. "IRON-01"
  statement: string;   // the verbatim law text
  tier: "IMMUTABLE" | "EVOLVING" | "SUPERSEDED";
  anchor: string;      // file:line
  source: string;
}

export interface Store {
  root: string;
  l1Path: string;
  entities: Array<Record<string, unknown>>;
  relationships: Array<Record<string, unknown>>;
  laws: LawEntity[];
  /** the count actually read — a card asserts only what it measured */
  total: number;
}

/** Resolve the project root by walking up for a root marker. Absent → PLUTUS_NO_ROOT. */
export function resolveRoot(startFile: string): string {
  let dir = dirname(resolve(startFile));
  for (let i = 0; i < 12; i++) {
    // FIX (audit store.ts:22): a STRONG marker wins at any depth; a generic one only within 3 levels
    for (const m of STRONG_MARKERS) if (existsSync(join(dir, m))) return dir;
    if (i < 3) for (const m of ROOT_MARKERS) if (existsSync(join(dir, m))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`${PLUTUS_NO_ROOT}: no root marker (${ROOT_MARKERS.join(" | ")}) above ${startFile}`);
}

/** The L1 kg.json for a root. Env override: PLUTUS_L1_PATH. */
export function l1PathFor(root: string): string {
  const env = process.env.PLUTUS_L1_PATH;
  if (env) return env;   // an explicit override is AUTHORITATIVE (an absent one → PLUTUS_NO_STORE)
  return join(root, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
}

/**
 * Load the graph. A missing/empty kg.json is the NAMED `PLUTUS_NO_STORE` — never `[]`.
 * The `total` is the MEASURED count (the anti-phantom law).
 */
export function loadStore(startFile: string): Store {
  const root = resolveRoot(startFile);
  const l1Path = l1PathFor(root);
  if (!existsSync(l1Path)) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} absent (root=${root})`);
  }
  // FIX (audit store.ts:83): stat+read in ONE try — any fs error maps to the NAMED refusal
  let raw = "";
  try {
    const st = statSync(l1Path);
    if (st.size === 0) throw new Error("0 bytes");
    raw = readFileSync(l1Path, "utf8");
  } catch (e) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} unreadable (${(e as Error).message})`);
  }
  let doc: { entities?: unknown[]; relationships?: unknown[] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    // FIX (audit store.ts:90): a non-object doc (null/42/"str"/[]) → the NAMED refusal
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`the doc is ${Array.isArray(parsed) ? "an array" : typeof parsed}, not an object`);
    }
    doc = parsed as { entities?: unknown[]; relationships?: unknown[] };
  } catch (e) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} unparseable (${(e as Error).message})`);
  }
  // FIX (audit store.ts:88): guard every entry's shape — a [null, 42] array must not crash
  const entities = (Array.isArray(doc.entities) ? doc.entities : []).filter(
    (e): e is Record<string, unknown> => typeof e === "object" && e !== null,
  );
  // FIX (audit store.ts:100): the same shape guard as the entities
  const relationships = (Array.isArray(doc.relationships) ? doc.relationships : []).filter(
    (r): r is Record<string, unknown> => typeof r === "object" && r !== null,
  );
  const laws: LawEntity[] = entities
    .filter((e) => String(e.type ?? "") === "law")
    .map((e) => ({
      id: String(e.id ?? ""),
      name: String(e.name ?? e.id ?? ""),
      statement: String(e.statement ?? ""),
      tier: validTier(e.tier),
      anchor: String(e.anchor ?? ""),
      source: String(e.source ?? ""),
    }));
  return { root, l1Path, entities, relationships, laws, total: laws.length };
}

/**
 * The laws governing a SYMBOL or a FILE — the L1 detect (free, no model).
 * Matches on the law's `name`, its `statement`, or the entity id.
 * A symbol with NO laws returns [] — and the caller emits NO card (the anti-phantom law).
 */
export function lawsFor(store: Store, needle: string): LawEntity[] {
  const n = needle.trim().toLowerCase();
  if (!n) return [];
  // FIX (audit store.ts:122): a word-boundary match + a trimmed needle (no whitespace phantom)
  const re = new RegExp(`(^|[^a-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
  return store.laws.filter((l) => re.test(`${l.name} ${l.statement} ${l.id}`));
}

/** The declarations in a TS-ish file (the L1 detect input). */
export function declarationsIn(source: string): string[] {
  const out = new Set<string>();
  // FIX (audit store.ts:122): cover default/declare/abstract/var/enum + export {a,b}
  const re = /export\s+(?:default\s+)?(?:async\s+)?(?:declare\s+)?(?:abstract\s+)?(?:function\*?|const|let|var|class|interface|type|enum|namespace)\s+([A-Za-z_$][\w$]*)|export\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    if (m[1]) out.add(m[1]);
    else if (m[2]) for (const part of m[2].split(",")) { const n = part.trim().split(/\s+as\s+/).pop()?.trim(); if (n && /^[A-Za-z_$][\w$]*$/.test(n)) out.add(n); }
  }
  return [...out];
}

// ── L2 · the au daemon socket (optional; the documented fallback is L1-only) ──
export interface L2Result { ok: boolean; nodeCount?: number; edgeCount?: number; reason?: string }

/** A single read over the au-engine unix socket. Never throws — returns the NAMED reason. */
export async function readL2(socketPath: string, timeoutMs = 800): Promise<L2Result> {
  if (!existsSync(socketPath)) return { ok: false, reason: `${PLUTUS_NO_STORE}: socket absent (${socketPath})` };
  return await new Promise<L2Result>((res) => {
    let sock: ReturnType<typeof connect>;
    try { sock = connect(socketPath); } catch (e) {
      return res({ ok: false, reason: `L2_ERROR: ${(e as Error).message}` });   // FIX: a sync throw is NAMED
    }
    let done = false;
    const finish = (r: L2Result) => { if (!done) { done = true; sock.destroy(); res(r); } };
    const t = setTimeout(() => finish({ ok: false, reason: `L2_TIMEOUT (${timeoutMs}ms)` }), timeoutMs);
    sock.on("connect", () => {
      const req = Buffer.from(JSON.stringify({ read: "overview" }));
      const len = Buffer.alloc(4); len.writeUInt32BE(req.length);
      sock.write(Buffer.concat([len, req]));
    });
    const chunks: Buffer[] = [];
    sock.on("data", (c) => {
      chunks.push(c as Buffer);
      const b = Buffer.concat(chunks);
      // FIX (audit store.ts:172): a CUMULATIVE cap — a slow-loris cannot force an OOM
      if (b.length > 32 * 1024 * 1024) { clearTimeout(t); finish({ ok: false, reason: `L2_OVERSIZE: ${b.length} bytes` }); return; }
      if (b.length < 4) return;
      const n = b.readUInt32BE(0);
      // FIX (audit store.ts:165): a bounded frame — a corrupt peer cannot force an OOM
      if (n > 16 * 1024 * 1024) { clearTimeout(t); finish({ ok: false, reason: `L2_FRAME_TOO_LARGE: ${n} bytes` }); return; }
      if (b.length < 4 + n) return;
      clearTimeout(t);
      try {
        const j = JSON.parse(b.subarray(4, 4 + n).toString("utf8"));
        const g = j?.result?.overview?.graph_shape;
        // FIX (audit store.ts:182): fail CLOSED — a missing/non-numeric count is NOT a healthy overview
        const nc = g?.node_count, ec = g?.edge_count;
        if (!Number.isFinite(nc) || !Number.isFinite(ec)) {
          finish({ ok: false, reason: `L2_SHAPE_INVALID: node_count=${nc} edge_count=${ec}` });
        } else finish({ ok: true, nodeCount: nc, edgeCount: ec });
      } catch (e) { finish({ ok: false, reason: `L2_PARSE: ${(e as Error).message}` }); }
    });
    sock.on("error", (e) => { clearTimeout(t); finish({ ok: false, reason: `L2_ERROR: ${e.message}` }); });
    // FIX (audit store.ts:158): a connect-then-close or a short frame must RESOLVE, not hang
    sock.on("close", () => { clearTimeout(t); finish({ ok: false, reason: "L2_CLOSED: the peer closed before a full frame" }); });
    sock.on("end", () => { clearTimeout(t); finish({ ok: false, reason: "L2_ENDED: the peer ended the stream" }); });
  });
}

/** The default au socket for a root (fnv1a64 of the resolved path). */
export function l2SocketFor(root: string): string {
  const p = resolve(root);
  let h = 0xcbf29ce484222325n;
  for (const b of Buffer.from(p)) { h = ((h ^ BigInt(b)) * 0x100000001b3n) & 0xffffffffffffffffn; }
  const home = homedir();   // FIX (audit store.ts:167): portable, no username leak
  return join(home, ".arsumbris", "au-engine", "run", `${h.toString(16).padStart(16, "0")}.sock`);
}

/** The generic tokens that must NOT match (the over-match defect, found by the adversarial sweep). */
export const STOPWORDS: ReadonlySet<string> = new Set([
  "file", "files", "the", "and", "for", "with", "from", "this", "that", "type", "types",
  "name", "names", "value", "values", "data", "code", "test", "tests", "main", "index",
  "util", "utils", "core", "base", "src", "lib", "spec", "docs", "readme", "package",
  "const", "export", "function", "class", "interface", "return", "true", "false", "null",
]);   // FIX (audit store.ts:193): ReadonlySet — a caller cannot corrupt the global matcher

/** Split an identifier into lowercase tokens (camelCase + snake_case), dropping the generic ones. */
export function tokensOf(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}

/** The laws governing a FILE — the union of matches over the file's tokens + its declarations. */
export function lawsForFile(store: Store, filePath: string, decls: string[]): LawEntity[] {
  // FIX (audit store.ts:211): a cross-platform base — backslashes + case-insensitive extensions
  const base = (filePath.split(/[\\/]/).pop() ?? "").replace(/\.[A-Za-z0-9.]+$/, "");
  const needles = new Set<string>([...tokensOf(base), ...decls.flatMap(tokensOf)]);
  const seen = new Set<string>();
  const out: LawEntity[] = [];
  for (const n of needles) {
    for (const l of store.laws) {
      if (seen.has(l.id)) continue;
      // FIX (audit store.ts:190): a WORD-BOUNDARY match — 'iron' must not hit 'environment'
      const hay = `${l.name} ${l.statement} ${l.id}`.toLowerCase();
      const re = new RegExp(`(^|[^a-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
      if (re.test(hay)) { seen.add(l.id); out.push(l); }
    }
  }
  return out;   // FIX (audit store.ts:190): NO pre-truncation — the ranker decides
}

/**
 * THE HUNK-AWARE RANKING — the calibration's fix (measured: one relevant law -> Δ 0.38-0.63;
 * twelve fuzzy laws -> Δ ~0.0). Rank the candidate laws by their token overlap with the HUNK,
 * keep the top K. The L1 detect must be PRECISE, not broad.
 */
export function lawsForHunk(store: Store, filePath: string, decls: string[], hunk: string, topK = 3): LawEntity[] {
  const candidates = lawsForFile(store, filePath, decls);
  if (candidates.length <= topK) return candidates;
  const ht = new Set(tokensOf(hunk));
  const scored = candidates.map((l) => {
    const lt = tokensOf(`${l.name} ${l.statement}`);
    const overlap = lt.filter((t) => ht.has(t)).length;
    // also reward an exact numeric mention (a law about 150 pips vs a hunk with 150)
    const nums = (hunk.match(/\d+(?:\.\d+)?/g) ?? []).filter((n) => l.statement.includes(n)).length;
    return { l, score: overlap * 2 + nums * 3 };
  });
  // FIX (audit store.ts:220): a ZERO-overlap law is not a candidate — return [] (no arbitrary pick)
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, topK).map((x) => x.l);
}
