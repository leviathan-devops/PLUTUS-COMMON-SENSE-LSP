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

// ── THE ROOT MARKERS (the spawn gate 2 — a project root must carry one) ──────
export const ROOT_MARKERS = [".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT", "tsconfig.json"];

// ── THE NAMED REFUSALS ───────────────────────────────────────────────────────
export const PLUTUS_NO_STORE = "PLUTUS_NO_STORE";
export const PLUTUS_NO_ROOT = "PLUTUS_NO_ROOT";
export const JEVK5_DOWN = "JEVK5_DOWN";

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
    for (const m of ROOT_MARKERS) {
      if (existsSync(join(dir, m))) return dir;
    }
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
  const st = statSync(l1Path);
  if (st.size === 0) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} is empty (0 bytes)`);
  }
  let doc: { entities?: unknown[]; relationships?: unknown[] };
  try {
    doc = JSON.parse(readFileSync(l1Path, "utf8"));
  } catch (e) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} unparseable (${(e as Error).message})`);
  }
  const entities = Array.isArray(doc.entities) ? (doc.entities as Array<Record<string, unknown>>) : [];
  const relationships = Array.isArray(doc.relationships) ? (doc.relationships as Array<Record<string, unknown>>) : [];
  const laws: LawEntity[] = entities
    .filter((e) => String(e.type ?? "") === "law")
    .map((e) => ({
      id: String(e.id ?? ""),
      name: String(e.name ?? e.id ?? ""),
      statement: String(e.statement ?? ""),
      tier: (String(e.tier ?? "IMMUTABLE") as LawEntity["tier"]),
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
  const n = needle.toLowerCase();
  if (!n) return [];
  return store.laws.filter(
    (l) =>
      l.name.toLowerCase().includes(n) ||
      l.statement.toLowerCase().includes(n) ||
      l.id.toLowerCase().includes(n),
  );
}

/** The declarations in a TS-ish file (the L1 detect input). */
export function declarationsIn(source: string): string[] {
  const out = new Set<string>();
  const re = /export\s+(?:async\s+)?(?:function|const|class|interface|type|let)\s+([A-Za-z_$][\w$]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) out.add(m[1]);
  return [...out];
}

// ── L2 · the au daemon socket (optional; the documented fallback is L1-only) ──
export interface L2Result { ok: boolean; nodeCount?: number; edgeCount?: number; reason?: string }

/** A single read over the au-engine unix socket. Never throws — returns the NAMED reason. */
export async function readL2(socketPath: string, timeoutMs = 800): Promise<L2Result> {
  if (!existsSync(socketPath)) return { ok: false, reason: `${PLUTUS_NO_STORE}: socket absent (${socketPath})` };
  return await new Promise<L2Result>((res) => {
    const sock = connect(socketPath);
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
      if (b.length < 4) return;
      const n = b.readUInt32BE(0);
      if (b.length < 4 + n) return;
      clearTimeout(t);
      try {
        const j = JSON.parse(b.subarray(4, 4 + n).toString("utf8"));
        const g = j?.result?.overview?.graph_shape;
        finish({ ok: true, nodeCount: g?.node_count, edgeCount: g?.edge_count });
      } catch (e) { finish({ ok: false, reason: `L2_PARSE: ${(e as Error).message}` }); }
    });
    sock.on("error", (e) => { clearTimeout(t); finish({ ok: false, reason: `L2_ERROR: ${e.message}` }); });
  });
}

/** The default au socket for a root (fnv1a64 of the resolved path). */
export function l2SocketFor(root: string): string {
  const p = resolve(root);
  let h = 0xcbf29ce484222325n;
  for (const b of Buffer.from(p)) { h = ((h ^ BigInt(b)) * 0x100000001b3n) & 0xffffffffffffffffn; }
  const home = process.env.HOME ?? "/home/leviathan";
  return join(home, ".arsumbris", "au-engine", "run", `${h.toString(16).padStart(16, "0")}.sock`);
}

/** The generic tokens that must NOT match (the over-match defect, found by the adversarial sweep). */
export const STOPWORDS = new Set([
  "file", "files", "the", "and", "for", "with", "from", "this", "that", "type", "types",
  "name", "names", "value", "values", "data", "code", "test", "tests", "main", "index",
  "util", "utils", "core", "base", "src", "lib", "spec", "docs", "readme", "package",
  "const", "export", "function", "class", "interface", "return", "true", "false", "null",
]);

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
  const base = (filePath.split("/").pop() ?? "").replace(/\.[a-z]+$/, "");
  const needles = new Set<string>([...tokensOf(base), ...decls.flatMap(tokensOf)]);
  const seen = new Set<string>();
  const out: LawEntity[] = [];
  for (const n of needles) {
    for (const l of store.laws) {
      if (seen.has(l.id)) continue;
      const hay = `${l.name} ${l.statement} ${l.id}`.toLowerCase();
      if (hay.includes(n)) { seen.add(l.id); out.push(l); }
    }
  }
  return out.slice(0, 12);
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
  return scored.sort((a, b) => b.score - a.score).slice(0, topK).map((x) => x.l);
}
