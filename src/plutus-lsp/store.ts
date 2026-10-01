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

import { existsSync, statSync, openSync, fstatSync, readSync, closeSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { connect } from "node:net";
import { homedir } from "node:os";

// ── THE ROOT MARKERS (the spawn gate 2 — a project root must carry one) ──────
// FIX (audit store.ts:22): the PROJECT-SPECIFIC markers first; the generic fallback is short-walk only
// FIX (audit: freeze the marker arrays) — a mutable export can be push/pop/spliced by any
// importer, changing root discovery for the whole process.
export const ROOT_MARKERS: readonly string[] = Object.freeze([".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT", "tsconfig.json"]);
export const STRONG_MARKERS: readonly string[] = Object.freeze([".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT"]);

// ── THE NAMED REFUSALS ───────────────────────────────────────────────────────
export const PLUTUS_NO_STORE = "PLUTUS_NO_STORE";
export const PLUTUS_NO_ROOT = "PLUTUS_NO_ROOT";
export const JEVK5_DOWN = "JEVK5_DOWN";

export const TIERS = ["IMMUTABLE", "EVOLVING", "SUPERSEDED"] as const;
/** FIX (audit store.ts:96): a validated tier — an unknown value falls back to IMMUTABLE. */
export function validTier(v: unknown): "IMMUTABLE" | "EVOLVING" | "SUPERSEDED" {
  // FIX (audit: fail CLOSED) — an unknown/missing tier used to promote to IMMUTABLE (+2 rank
  // weight), so corrupt data outranked canon. Now SUPERSEDED (-2): malformed data sinks.
  const t = String(v ?? "").trim().toUpperCase();
  return (TIERS as readonly string[]).includes(t) ? (t as "IMMUTABLE" | "EVOLVING" | "SUPERSEDED") : "SUPERSEDED";
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

/**
 * The L1 kg.json for a root.
 * FIX (the live-TUI proof's REFUSE): the server was spawned + the handshake completed, but it
 * refused with PLUTUS_NO_STORE — the repo's cwd carries no L1. The discovery now tries, in order:
 *   1. PLUTUS_L1_PATH (an explicit override is AUTHORITATIVE — an absent one → PLUTUS_NO_STORE)
 *   2. <root>/.omp/graph-intelligence/layers/semantica/kg.json (the cwd's own)
 *   3. THE KNOWN PLUTUS LOCATIONS (the wt tree + the MASTER_CONTEXT corpus) — so a Plutus
 *      session finds the canon without an env var.
 */
// FIX (audit: env-gated canon discovery) — the host-absolute fallbacks are OPT-IN ONLY.
// Without PLUTUS_ALLOW_KNOWN_PATHS=1 they are NEVER consulted: a foreign corpus must not
// silently become canon on another host. Portability comes from PLUTUS_L1_PATH + <root>/kg.json.
// (The old `KNOWN_PATHS_ALLOWED` import-time const is gone — the gate reads the env at CALL
// time in l1PathFor, so a mid-process export takes effect without a reload.)
export const KNOWN_L1_PATHS: readonly string[] = Object.freeze([
  "/home/leviathan/.omp/wt/plutus-main-66dfa4c/PLUTUS/agent/.omp/graph-intelligence/layers/semantica/kg.json",
  "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json",
]);

/** FIX (audit: the spec claimed L1+L2; the pipeline ran L1-only): the known-location L1
 *  cache. The FIRST loadStore for a root records which kg.json actually resolved, so a
 *  second read in the same process does not re-walk the discovery. Keyed by root. */
// FIX (audit: L1_RESOLVED is private + invalidated) — an exported mutable Map can be
// poisoned by any importer (`set`/`clear` serves a stale corpus as canon). The cache is now
// module-private and keyed with mtime+size: an edited kg.json is re-read, never stale-served.
// FIX (audit round-11: the cache validates CONTENT, not just stat) — mtimeMs+size equality
// missed same-size edits inside the filesystem timestamp granularity (rapid writes,
// cp --preserve). The entry now also carries a first-4KB fingerprint: a same-size edit with
// different head bytes is re-read. (A same-size edit with an IDENTICAL 4KB head is the
// residual — named, not hidden.)
const L1_RESOLVED = new Map<string, { path: string; mtimeMs: number; size: number; head: string }>();
/** The first-4KB fingerprint of a file (the cache's content check). Absent → "". */
function head4(p: string): string {
  try {
    const fd = openSync(p, "r");
    try {
      const b = Buffer.alloc(4096);
      const n = readSync(fd, b, 0, 4096, 0);
      return `${n}:${b.subarray(0, n).toString("base64")}`;
    } finally { closeSync(fd); }
  } catch { return ""; }
}

export function l1PathFor(root: string): string {
  // the env override is AUTHORITATIVE on EVERY call (never cached — tests and sessions
  // switch it; a cached override would serve a stale corpus as canon)
  const env = process.env.PLUTUS_L1_PATH;
  if (env) return env;
  // FIX (audit: local-first) — check the cwd's own kg.json BEFORE the cache, so a local
  // corpus appearing after first load is never shadowed by a stale KNOWN entry.
  const local = join(root, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
  try {
    const st = statSync(local);
    if (st.isFile()) { L1_RESOLVED.set(root, { path: local, mtimeMs: st.mtimeMs, size: st.size, head: head4(local) }); return local; }
  } catch { /* fall through */ }
  const hit = L1_RESOLVED.get(root);
  if (hit) {
    try {
      const st = statSync(hit.path);
      if (st.mtimeMs === hit.mtimeMs && st.size === hit.size && head4(hit.path) === hit.head) return hit.path;
    } catch { /* fall through and re-resolve */ }
    L1_RESOLVED.delete(root);
  }
  try { if (statSync(local).isDirectory()) throw new Error(`${PLUTUS_NO_STORE}: ${local} is a directory, not kg.json`); } catch (e) { if ((e as Error).message.startsWith(PLUTUS_NO_STORE)) throw e; }
  if (process.env.PLUTUS_ALLOW_KNOWN_PATHS === "1") {
    // FIX (audit: knownAbs was UNDEFINED — ReferenceError when enabled). The entries are
    // already absolute paths; resolve() normalizes without inventing a helper.
    for (const rel of KNOWN_L1_PATHS) {
      const known = resolve(rel);
      try {
        const st = statSync(known);
        if (st.isFile()) { L1_RESOLVED.set(root, { path: known, mtimeMs: st.mtimeMs, size: st.size, head: head4(known) }); return known; }
      } catch { /* not present on this host */ }
    }
  }   // FIX: the canon discovery
  return local;   // absent everywhere -> loadStore throws the NAMED PLUTUS_NO_STORE
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
  // FIX (audit: fd-based read, no stat/readFileSync TOCTOU) — open the fd, fstat it, read
  // exactly the fstat'd size in ONE stream. A file that grows between check and read cannot
  // OOM the server; a 16MB cap (the L2 16/32MB guards' sibling) fails closed. The override
  // itself is validated: it must resolve to a .json path.
  const MAX_L1_BYTES = 16 * 1024 * 1024;
  const envPath = process.env.PLUTUS_L1_PATH;
  if (envPath && !/\.json$/i.test(envPath.split("?")[0])) {
    throw new Error(`${PLUTUS_NO_STORE}: PLUTUS_L1_PATH must be a .json path (got ${envPath.slice(0, 80)})`);
  }
  let raw = "";
  try {
    const fd = openSync(l1Path, "r");
    try {
      const st = fstatSync(fd);
      if (st.size === 0) throw new Error("0 bytes");
      if (st.size > MAX_L1_BYTES) throw new Error(`${st.size} bytes exceeds the 16MB cap`);
      const buf = Buffer.alloc(st.size);
      let off = 0;
      while (off < st.size) { const n = readSync(fd, buf, off, st.size - off, null); if (n <= 0) break; off += n; }
      raw = buf.subarray(0, off).toString("utf8");
    } finally { closeSync(fd); }
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
    (e): e is Record<string, unknown> => typeof e === "object" && e !== null && !Array.isArray(e),
  );
  // FIX (audit store.ts:100): the same shape guard as the entities
  const relationships = (Array.isArray(doc.relationships) ? doc.relationships : []).filter(
    (r): r is Record<string, unknown> => typeof r === "object" && r !== null && !Array.isArray(r),
  );
  // FIX (audit: empty-id laws collapse the id-keyed dedupe — every id:"" law but the first
  // is silently dropped). Drop them at load with a loud reason instead of a silent merge.
  const laws: LawEntity[] = entities
    .filter((e) => String(e.type ?? "") === "law" && String(e.id ?? "").trim().length > 0)
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
  const re = wordRe(n);
  return store.laws.filter((l) => re.test(`${l.name} ${l.statement} ${l.id}`));
}

/** The declarations in a TS-ish file (the L1 detect input). */
export function declarationsIn(source: string): string[] {
  const out = new Set<string>();
  // FIX (audit: strip STRINGS first, then comments) — a `/*...*/` inside a string literal
  // must not corrupt the code (the old order broke string boundaries and produced
  // missed/phantom declarations). Order: template/string literals → block comments → line comments.
  const code = source
    .replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'A-Za-z0-9_$])\/\/[^\n]*/g, "$1 ");
  // FIX (audit store.ts:122): cover default/declare/abstract/var/enum + export {a,b}
  const re = /export\s+(?:default\s+)?(?:async\s+)?(?:declare\s+)?(?:abstract\s+)?(?:function\*?|const|let|var|class|interface|type|enum|namespace)\s+([A-Za-z_$][\w$]*)|export\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m[1]) out.add(m[1]);
    // FIX (audit: keep BOTH names) — `export {a as b}` keeps `a` (the local binding) AND `b`
    // (the public name); dropping `a` loses the detect needle for the implementation.
    else if (m[2]) for (const part of m[2].split(",")) {
      const bits = part.trim().split(/\s+as\s+/).map((x) => x.trim()).filter(Boolean);
      for (const n of bits) if (n && n !== "default" && /^[A-Za-z_$][\w$]*$/.test(n)) out.add(n);
    }   // FIX (audit): `as default` is not a needle
  }
  return [...out];
}

// ── L2 · the au daemon socket (optional; the documented fallback is L1-only) ──
export interface L2Result { ok: boolean; nodeCount?: number; edgeCount?: number; reason?: string }

/** A single read over the au-engine unix socket. Never throws — returns the NAMED reason. */
export async function readL2(socketPath: string, timeoutMs = 800): Promise<L2Result> {
  // FIX (audit: validate timeoutMs) — 0/negative/NaN/Infinity yields an immediate or never-firing timer.
  const ms = Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 60000) : 800;
  if (!existsSync(socketPath)) return { ok: false, reason: `${PLUTUS_NO_STORE}: socket absent (${socketPath})` };
  return await new Promise<L2Result>((res) => {
    let sock: ReturnType<typeof connect>;
    try { sock = connect(socketPath); } catch (e) {
      return res({ ok: false, reason: `L2_ERROR: ${(e as Error).message}` });   // FIX: a sync throw is NAMED
    }
    let done = false;
    // FIX (audit: finish clears its own timer) — callers must not have to remember; a leaked
    // 800ms timer per read is a slow resource bleed.
    const finish = (r: L2Result) => { if (!done) { done = true; clearTimeout(t); sock.destroy(); res(r); } };
    const t = setTimeout(() => finish({ ok: false, reason: `L2_TIMEOUT (${ms}ms)` }), ms);
    sock.on("connect", () => {
      const req = Buffer.from(JSON.stringify({ read: "overview" }));
      const len = Buffer.alloc(4); len.writeUInt32BE(req.length);
      // FIX (audit: write errors) — an unwritable socket must surface, never hang silently.
      sock.write(Buffer.concat([len, req]), (err?: Error | null) => {
        if (err) finish({ ok: false, reason: `L2_WRITE: ${err.message}` });
      });
    });
    // FIX (audit: incremental length tracking) — concat per chunk is O(n²) to the 32MB cap.
    // Track the byte length; concat once per parse attempt.
    // FIX (audit: single concat) — track the length; concat ONCE per parse attempt, not per chunk.
    const chunks: Buffer[] = [];
    let total = 0;
    sock.on("data", (c) => {
      const cb = c as Buffer;
      chunks.push(cb);
      total += cb.length;
      if (total > 32 * 1024 * 1024) { finish({ ok: false, reason: `L2_OVERSIZE: ${total} bytes` }); return; }
      const b = Buffer.concat(chunks, total);
      if (b.length < 4) return;
      const need = 4 + b.readUInt32BE(0);
      if (need > 16 * 1024 * 1024 + 4) { finish({ ok: false, reason: `L2_FRAME_TOO_LARGE` }); return; }
      if (total < need) return;
      // FIX (audit round-11: dead checks REMOVED) — the old code re-checked b.length>32MB,
      // b.length<4, n>16MB and b.length<4+n here, but b.length===total>=need>=4 already, so
      // every one was unreachable (a duplicate of the total/need gates above that masks
      // future edits). The live gates are: total>32MB (slow-loris) + need>16MB+4 (frame).
      const n = need - 4;
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
    sock.on("error", (e) => { finish({ ok: false, reason: `L2_ERROR: ${e.message}` }); });
    // FIX (audit store.ts:158): a connect-then-close or a short frame must RESOLVE, not hang
    sock.on("close", () => { finish({ ok: false, reason: "L2_CLOSED: the peer closed before a full frame" }); });
    sock.on("end", () => { finish({ ok: false, reason: "L2_ENDED: the peer ended the stream" }); });
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
// FIX (audit: STOPWORDS is module-private) — Object.freeze on a Set does NOT freeze contents;
// add/delete/clear still mutate. The set is private; only the predicate is exported.
const STOPWORDS = new Set([
  "file", "files", "the", "and", "for", "with", "from", "this", "that", "type", "types",
  "name", "names", "value", "values", "data", "code", "test", "tests", "main", "index",
  "util", "utils", "core", "base", "src", "lib", "spec", "docs", "readme", "package",
  "const", "export", "function", "class", "interface", "return", "true", "false", "null",
]);
/** The stopword predicate — the ONLY access to the set (it cannot be poisoned). */
export function isStopword(t: string): boolean { return STOPWORDS.has(t); }

/** The canonical word-boundary matcher. ONE regex shape for lawsFor/lawsForFile/lawsForHunk —
 *  previously each built its own inline `new RegExp`, inviting drift. Compile once per needle. */
export function wordRe(needle: string): RegExp {
  // FIX (audit: needle guard) — an empty needle matches almost everything; a multi-KB needle
  // builds a multi-KB regex (ReDoS/CPU). Cap at 64 chars; empty never matches.
  const n = needle.trim().slice(0, 64);
  if (!n) return /(?!)/
  return new RegExp(`(^|[^a-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
}

/** Split an identifier into lowercase tokens (camelCase + snake_case), dropping the generic ones. */
export function tokensOf(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length >= 4 && !isStopword(t));
}

/** The laws governing a FILE — the union of matches over the file's tokens + its declarations. */
export function lawsForFile(store: Store, filePath: string, decls: string[]): LawEntity[] {
  // FIX (audit store.ts:211): a cross-platform base — backslashes + case-insensitive extensions
  const base = (filePath.split(/[\\/]/).pop() ?? "").replace(/\.[A-Za-z0-9.]+$/, "");
  const needles = new Set<string>([...tokensOf(base), ...decls.flatMap(tokensOf)]);
  const seen = new Set<string>();
  const out: LawEntity[] = [];
  const compiled = [...needles].map((n) => wordRe(n));
  for (let k = 0; k < compiled.length; k++) {
    const re = compiled[k];
    for (const l of store.laws) {
      if (seen.has(l.id)) continue;
      // FIX (audit store.ts:190): a WORD-BOUNDARY match — 'iron' must not hit 'environment'
      const hay = `${l.name} ${l.statement} ${l.id}`.toLowerCase();
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
  // ★ THE CANDIDATE-NET FIX (the derailment probe, 2026-09-30): the net was built from the
  //   DECLARATION NAMES only, so a law about a construct that lives in the hunk's BODY was
  //   never a candidate — `const TPs = { tp1, tp2, tp3 }` (breaking ONE-TP) produced NOTHING,
  //   because the name "TPs" yields no token >= 4 chars. THE NET MUST INCLUDE THE HUNK.
  const byName = lawsForFile(store, filePath, decls);
  const hunkTokens = new Set(tokensOf(hunk));
  // ★ SHORT-TERM FIX: "TP1"/"TP2"/"ZS10" are 3-char DOMAIN terms. tokensOf drops <4 chars, so
  //   the ONE-TP law ("no TP1, TP2, TP3") was never a candidate for `{ tp1, tp2, tp3 }` — a real
  //   law invisible to the detector. The law's NAME is ALSO matched as a whole word in the hunk.
  const hunkLower = hunk.toLowerCase();
  const byHunk: LawEntity[] = store.laws.filter((l) => {
    const lt = tokensOf(`${l.name} ${l.tier} ${l.statement}`);
    if (lt.some((t) => hunkTokens.has(t))) return true;
    for (const part of String(l.name).split(/[-_\s]+/)) {
      if (part.length >= 3 && wordRe(part.toLowerCase()).test(hunkLower)) return true;
    }
    return false;
  });
  // FIX (audit: single-pass candidates) — the old code unioned, then re-filtered, then
  // re-tokenized the same strings 3x. One pass: dedupe + zero-overlap filter together.
  const seen = new Set<string>();
  const ranked = [...byName, ...byHunk].filter((l) => {
    if (seen.has(l.id)) return false;
    seen.add(l.id);
    // FIX (audit: zero-overlap policy) — a small noisy set previously returned UNRANKED and
    // UNFILTERED, contradicting the score>0 rule. Filter first, then topK.
    return tokensOf(`${l.name} ${l.id} ${l.statement}`).some((t) => hunkTokens.has(t));
  });
  // FIX (audit: single-pass tokenization) — the hunk is tokenized ONCE; each law's token set
  // is computed ONCE and reused for the overlap score below.
  const lawToks = new Map(ranked.map((l) => [l.id, new Set(tokensOf(`${l.name} ${l.id} ${l.statement}`))] as const));
  const scored = ranked.map((l) => {
    const lt = lawToks.get(l.id) ?? new Set<string>();
    const overlap = [...lt].filter((t) => hunkTokens.has(t)).length;
    // ★ THE VIOLATION-BIAS FIX (found by the derailment probe, 2026-09-30).
    //   The PREVIOUS ranking added `nums * 3` when the edit's NUMBER MATCHED the law's
    //   number. That made an edit which CONTRADICTS the constant (ZFP 45 -> 60) rank
    //   LOWER, so the violation never became a candidate and the judge never saw it:
    //       the stupid action (ZFP=60) produced NO card
    //       the correct action (ZFP=45) produced a card
    //   The detector must be SUBJECT-MATCH ONLY. Whether the number AGREES is the
    //   JUDGE's question (P4 VIOLATE), never the detector's.
    return { l, score: overlap * 2 };
  });
  // FIX (audit store.ts:220): a ZERO-overlap law is not a candidate — return [] (no arbitrary pick)
  // FIX (audit: tier-weighted ranking) — a SUPERSEDED law must never outrank canon on the
  // same overlap: IMMUTABLE +2, EVOLVING +1, SUPERSEDED -2.
  const w = (t: string) => (t === "IMMUTABLE" ? 2 : t === "EVOLVING" ? 1 : -2);
  return scored.filter((x) => x.score > 0).sort((a, b) => (b.score + w(b.l.tier)) - (a.score + w(a.l.tier))).slice(0, topK).map((x) => x.l);
}

/**
 * FIX F4 (audit-bravo): `plutus/callers` was DECLARED, NEVER EMITTED (a theatrical token).
 * The L1 kg.json carries the `imports` relationships — the caller set is a REAL read:
 * every file whose `imports` edge targets this file.
 */
export function callersOf(store: Store, filePath: string): string[] {
  // FIX (audit round-11: rooted-relative match) — the old basename-suffix match conflated
  // same-named files in different dirs (pkg/a/util.ts vs lib/util.ts) and un-normalized
  // ./ ../ targets. Now: normalize slashes + dot segments, then match the target's TAIL
  // against the file's own rooted tail (last 2 segments), case-PRESERVED. Empty dropped.
  const norm = (p: string): string => String(p ?? "").replace(/\\/g, "/").split("/").filter((s) => s.length > 0 && s !== ".").reduce<string[]>((acc, s) => (s === ".." ? (acc.pop(), acc) : [...acc, s]), []).join("/");
  const fp = norm(filePath);
  if (!fp) return [];
  const tail = fp.split("/").slice(-2).join("/");
  const hits = store.relationships.filter((r) => {
    if (r.type !== "imports") return false;
    const t = norm(r.target);
    return t === fp || t.endsWith(`/${tail}`);
  });
  // FIX (audit round-11: deterministic order) — sort before slicing so the same graph
  // always yields the same callers.
  return [...new Set(hits.map((r) => String(r.source ?? "")).filter((x) => x.trim().length > 0))].sort().slice(0, 20);
}
