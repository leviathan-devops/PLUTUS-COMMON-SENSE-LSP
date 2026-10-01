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

import { existsSync, statSync, openSync, fstatSync, readSync, closeSync, readFileSync, realpathSync, constants as FS } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
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

/** THE SCOPE MARKERS — PLUTUS-SPECIFIC (the workspace-scoped-state law, generalized).
 *  A file is IN SCOPE only when an ancestor carries one of these. The generic markers below
 *  (tsconfig.json etc.) match EVERY node project, so they can locate a root but can NEVER
 *  authorize the reflex — that is how the old build "blind-fired on literally everything."
 *  The reflex runs ONLY under a Plutus-scoped tree; everything else is SILENT. */
// FIX (F-8 + the scope ask, take 3 — the decisive test). Two earlier cuts were TOO LOOSE:
//   (1) `existsSync(join(dir,"PLUTUS"))` fired for any ancestor merely HAVING a PLUTUS subdir
//       (Shared_Workspace/PLUTUS exists → every repo under Shared_Workspace matched);
//   (2) `/home/leviathan/.plutus/` (a stale DIRECTORY from a prior session) scoped the ENTIRE
//       home dir via the marker-file branch.
// The decisive rule: a file is Plutus-scoped iff a path SEGMENT is literally `PLUTUS` (the
// tree), OR an ancestor carries an explicit `plutus.yaml`/`.plutus` FILE (not dir) BELOW $HOME
// (a marker at/above $HOME scopes the whole home — meaningless as a scope signal).
const HOME = homedir();
export const PLUTUS_SCOPE_FILES: readonly string[] = Object.freeze(["plutus.yaml", ".plutus"]);

/** Is the file IN a Plutus-scoped tree? The reflex runs ONLY here — everything else is
 *  SILENT (no card, no receipt noise). The decisive test. */
export function isPlutusScoped(startFile: string): boolean {
  let dir = resolve(startFile);
  try { if (!statSync(dir).isDirectory()) dir = dirname(dir); } catch { dir = dirname(dir); }
  // FIX (round-20 M: symlink-safe) — canonicalize the START once so a symlinked dir cannot
  // escape the scope decision (the scope tests the REAL location, not the link path).
  try { dir = realpathSync(dir); } catch { /* not present — the resolved path stands */ }
  for (let i = 0; i < 16; i++) {
    // (a) the segment is literally PLUTUS — the unambiguous tree marker
    if (basename(dir) === "PLUTUS") return true;
    // (b) an explicit scope FILE, but never at/above $HOME (bounded scope)
    if (dir !== HOME && !HOME.startsWith(dir + "/")) {
      for (const m of PLUTUS_SCOPE_FILES) {
        try { if (statSync(join(dir, m)).isFile()) return true; } catch { /* not present */ }
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return false;
}

/** Resolve the project root by walking up for a root marker. Absent → PLUTUS_NO_ROOT. */
export function resolveRoot(startFile: string): string {
  // FIX (audit round-13: STRONG wins at ANY depth) — the old loop returned a NEAR generic
  // marker (tsconfig.json at level 0) without ever looking higher for a STRONG one
  // (.arsumbris 5 levels up), contradicting the comment. Now: walk all 12 levels collecting
  // the nearest generic, but a STRONG at ANY level wins immediately.
  // FIX (audit round-15: test the START dir too) — dirname() assumed a file; a caller passing
  // a DIRECTORY never had a marker in that dir tested. If startFile is a dir, start there.
  let dir = resolve(startFile);
  try { if (!statSync(dir).isDirectory()) dir = dirname(dir); } catch { dir = dirname(dir); }
  let generic: string | null = null;
  for (let i = 0; i < 12; i++) {
    for (const m of STRONG_MARKERS) if (existsSync(join(dir, m))) return dir;
    if (generic === null && i < 3) for (const m of ROOT_MARKERS) if (existsSync(join(dir, m))) { generic = dir; break; }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (generic !== null) return generic;
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
// FIX (audit round-12: no hardcoded username) — the old entries baked /home/leviathan into
// the module (PII in the repo; a foreign host with the flag on would trust a stranger's path).
// Entries are homedir-relative and resolved at CALL time on THIS host.
export const KNOWN_L1_PATHS: readonly string[] = Object.freeze([
  ".omp/wt/plutus-main-66dfa4c/PLUTUS/agent/.omp/graph-intelligence/layers/semantica/kg.json",
  "JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json",
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
/** F-1 FIX: the law count in a kg.json (cheap: read + count type==="law"). -1 = unreadable.
 *  The reflex is only meaningful against a LAW-BEARING graph; a symbol/file-only graph has
 *  zero laws and makes the pipeline a silent no-op. This is the scoping test. */
// FIX (round-20 H6: the law-count is CACHED by (path, mtime, size)) — the first cut parsed the
// whole kg.json for the local + up to 12 ancestors + the known paths on EVERY resolve,
// blocking the event loop N times per edit. A tiny memo keyed on stat identity.
const LAW_COUNT_CACHE = new Map<string, { mtimeMs: number; size: number; laws: number }>();
function lawCount(p: string): number {
  try {
    const st = statSync(p);
    const hit = LAW_COUNT_CACHE.get(p);
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.laws;
    const n = lawCountUncached(p);
    // AUDIT-9 FIX — the map grew without bound in a long-lived server (one entry per probed
    // path). Bounded: evict the oldest insertion past 128.
    if (LAW_COUNT_CACHE.size >= 128) { const first = LAW_COUNT_CACHE.keys().next().value; if (first) LAW_COUNT_CACHE.delete(first); }
    LAW_COUNT_CACHE.set(p, { mtimeMs: st.mtimeMs, size: st.size, laws: n });
    return n;
  } catch { return -1; }
}
function lawCountUncached(p: string): number {
  try {
    const d = JSON.parse(readFileSync(p, "utf8")) as { entities?: unknown };
    const ents = Array.isArray((d as { entities?: unknown[] }).entities) ? (d as { entities: unknown[] }).entities : [];
    return ents.filter((e) => String((e as Record<string, unknown>)?.type ?? "") === "law").length;
  } catch { return -1; }
}

/** The first-4KB fingerprint of a file (the cache's content check). Absent → "". */
function head4(p: string): string {
  try {
    // FIX (r19 H3: the FIFO hang) — a plain openSync BLOCKS on a FIFO; the cache's content
    // check must never hang the server. O_NONBLOCK (the same discipline loadStore got).
    const fd = openSync(p, FS.O_RDONLY | FS.O_NONBLOCK);
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
  const local = join(root, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
  const remember = (path: string): string => {
    try { const st = statSync(path); L1_RESOLVED.set(root, { path, mtimeMs: st.mtimeMs, size: st.size, head: head4(path) }); } catch { /* best effort */ }
    return path;
  };
  // FIX (F-1 CRITICAL, the lawless-root silence) — the OLD code returned the nearest kg.json
  // whatever it contained. A `PLUTUS/LIVE/dashboard` file resolved a graph of 1,785 SYMBOL/FILE
  // entities and ZERO laws → `lawsForHunk` returned [] → the pipeline was a silent no-op while
  // the LAW-BEARING graphs (MASTER_CONTEXT 559 laws, the agent tree 564) sat one level up.
  // THE FIX: the reflex only runs against a LAW-BEARING graph. Order:
  //   1. the local kg.json IF it carries laws
  //   2. the cached path IF still valid AND law-bearing
  //   3. the NEAREST ANCESTOR whose kg.json carries laws (the climb)
  //   4. the KNOWN law-bearing paths (homedir-relative) — ON BY DEFAULT for the law case
  //       (the opt-in gate stays for the plain-existence fallback below)
  //   5. the local path (lawless → loadStore yields 0 laws → the pipeline stays SILENT)
  if (lawCount(local) > 0) return remember(local);
  const hit = L1_RESOLVED.get(root);
  if (hit && lawCount(hit.path) > 0) {
    try {
      const st = statSync(hit.path);
      if (st.mtimeMs === hit.mtimeMs && st.size === hit.size && head4(hit.path) === hit.head) return hit.path;
    } catch { /* fall through and re-resolve */ }
    L1_RESOLVED.delete(root);
  }
  let dir = root;
  for (let i = 0; i < 12; i++) {
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
    const cand = join(dir, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
    if (lawCount(cand) > 0) return remember(cand);
  }
  // FIX (round-20 H5: BOTH loops are opt-in) — the law-bearing loop returned a homedir corpus
  // WITHOUT the PLUTUS_ALLOW_KNOWN_PATHS gate, contradicting the OPT-IN ONLY law above it: on a
  // foreign host a stale ~/.omp/wt/... kg.json silently became canon.
  if (process.env.PLUTUS_ALLOW_KNOWN_PATHS === "1") {
    for (const rel of KNOWN_L1_PATHS) {
      const known = resolve(homedir(), rel);
      if (lawCount(known) > 0) return remember(known);
    }
  }
  if (process.env.PLUTUS_ALLOW_KNOWN_PATHS === "1") {
    for (const rel of KNOWN_L1_PATHS) {
      const known = resolve(homedir(), rel);
      try { if (statSync(known).isFile()) return remember(known); } catch { /* not present */ }
    }
  }
  return local;   // lawless/absent everywhere -> 0 laws (SILENT) or PLUTUS_NO_STORE
}

/**
 * Load the graph. A missing/empty kg.json is the NAMED `PLUTUS_NO_STORE` — never `[]`.
 * The `total` is the MEASURED count (the anti-phantom law).
 */
export function loadStore(startFile: string): Store {
  const root = resolveRoot(startFile);
  const l1Path = l1PathFor(root);
  // (round-14: the read below distinguishes an EMPTY file from a special/pipe file; a short
  // read past EOF is reported as INCOMPLETE rather than silently parsed as truncated JSON.)
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
  // FIX (audit round-17: refuse non-regular files BEFORE open) — openSync BLOCKS on a FIFO,
  // so the post-open isFile check was too late (a planted FIFO hung the server). stat first.
  // FIX (audit round-18: O_NONBLOCK defeats the FIFO TOCTOU) — stat-then-open races a
  // swap-to-FIFO; openSync(path,'r') BLOCKS on a FIFO. O_NONBLOCK makes the open fail
  // immediately (EAGAIN/ENXIO) on a FIFO/device instead of hanging the server. A regular
  // file opens normally (O_NONBLOCK is a no-op for regular files).
  // FIX (round-20 M: classify by ERROR CODE, never the message string) — the old branches
  // string-matched "not a regular file"/ENOENT; a translated message or a different errno fell
  // into the generic bucket. e.code is the contract.
  try {
    const pre = statSync(l1Path);
    if (!pre.isFile()) throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} is not a regular file`);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === undefined && err.message.startsWith(PLUTUS_NO_STORE)) throw err;   // our own throw
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} unreadable (${err.code ?? err.message})`);
  }
  try {
    // O_RDONLY | O_NONBLOCK: a FIFO/device fails the open fast instead of blocking.
    const fd = openSync(l1Path, FS.O_RDONLY | FS.O_NONBLOCK);
    try {
      const st = fstatSync(fd);
      // FIX (audit round-15: REGULAR FILE only) — openSync blocks on a FIFO and a device
      // bypasses the size intent. A kg.json must be a regular file; anything else is refused
      // BEFORE any read.
      if (!st.isFile()) throw new Error(`not a regular file (mode ${st.mode.toString(8)})`);
      if (st.size === 0) throw new Error("0 bytes");
      if (st.size > MAX_L1_BYTES) throw new Error(`${st.size} bytes exceeds the 16MB cap`);
      const buf = Buffer.alloc(st.size);
      let off = 0;
      while (off < st.size) { const n = readSync(fd, buf, off, st.size - off, null); if (n <= 0) break; off += n; }
      // FIX (audit round-14: a SHORT read is named, never parsed as truncated JSON) — if the
      // file shrank mid-read (concurrent truncation), the partial bytes are NOT a valid doc.
      if (off < st.size) throw new Error(`short read ${off}/${st.size} bytes (file changed during read)`);
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
    // FIX (audit round-16: identity fields TRIMMED) — an id like `  IRON-01  ` passed the
    // filter yet broke dedupe keys + wordRe matching. Trim the identity fields.
    .map((e) => ({
      id: String(e.id ?? "").trim(),
      name: String(e.name ?? e.id ?? "").trim(),
      statement: String(e.statement ?? ""),
      tier: validTier(e.tier),
      anchor: String(e.anchor ?? "").trim(),
      source: String(e.source ?? "").trim(),
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
      // FIX (audit round-14: concat-once, ONLY when needed) — the old code concat\'d on EVERY
      // data event just to read the 4-byte prefix (O(n²) to the cap). The prefix is read from
      // the first 4 bytes once buffered; the full concat runs only when the frame is complete.
      if (total < 4) return;
      // round-16: read the 4-byte prefix WITHOUT concat (chunks[0] is >= 4 bytes in practice;
      // only concat the tiny head when it straddles chunks)
      const head = chunks[0].length >= 4 ? chunks[0].readUInt32BE(0) : Buffer.concat(chunks, 4).readUInt32BE(0);
      const need = 4 + head;
      if (need > 16 * 1024 * 1024 + 4) { finish({ ok: false, reason: `L2_FRAME_TOO_LARGE` }); return; }
      if (total < need) return;
      const b = Buffer.concat(chunks, total);
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
  const t = needle.trim();
  if (!t || t.length > 64) return /(?!)/
  return new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
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
  // FIX (audit round-12: topK clamped) — negative/NaN/Infinity flowed into slice(0, topK):
  // slice(0,-1) silently dropped the top hit, slice(0,NaN) returned []. Positive int only.
  topK = typeof topK === "number" && Number.isFinite(topK) ? Math.max(1, Math.floor(topK)) : 3;
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
  // FIX (audit round-12: tier never creates candidacy) — including the tier word in the
  // searchable text matched every IMMUTABLE law on any hunk containing "immutable". Tier
  // WEIGHTS the ranking only (the +2/+1/-2 below); it never admits a candidate.
  const byHunk: LawEntity[] = store.laws.filter((l) => {
    const lt = tokensOf(`${l.name} ${l.statement}`);
    if (lt.some((t) => hunkTokens.has(t))) return true;
    for (const part of String(l.name).split(/[-_\s]+/)) {
      if (part.length >= 3 && wordRe(part.toLowerCase()).test(hunkLower)) return true;
    }
    return false;
  });
  // FIX (audit: single-pass candidates) — the old code unioned, then re-filtered, then
  // re-tokenized the same strings 3x. One pass: dedupe + zero-overlap filter together.
  // FIX (audit round-12: short-name laws SURVIVE the filter) — byHunk admits laws via 3-char
  // name parts (TP1/ZS10), but the old zero-overlap filter + overlap*2 score (both >=4 chars
  // only) dropped them again with score 0. A law admitted by name-part now scores >= 1.
  const seen = new Set<string>();
  const hunkLower2 = hunk.toLowerCase();
  // FIX (audit round-12b: the filter honors BOTH admission channels) — the old filter kept
  // the >=4-char token-overlap gate AFTER byHunk admitted via 3-char name parts, so a
  // short-only law (TP1/ZS10 with no long shared token) was admitted then dropped. A law
  // passes when it overlaps on tokens OR on a 3-char name part — the same two channels.
  // round-20 M: a 3-char part must not be a generic stopword (ONE, THE, AND, LAW…) — the
  // short-name channel admitted noisy candidates on common words.
  const namePartHit = (l: LawEntity): boolean =>
    String(l.name).split(/[-_\s]+/).some((part) => part.length >= 3 && !isStopword(part.toLowerCase()) && wordRe(part.toLowerCase()).test(hunkLower2));
  const ranked = [...byName, ...byHunk].filter((l) => {
    if (seen.has(l.id)) return false;
    seen.add(l.id);
    // FIX (audit: zero-overlap policy) — a small noisy set previously returned UNRANKED and
    // UNFILTERED, contradicting the score>0 rule. Filter first, then topK.
    return tokensOf(`${l.name} ${l.id} ${l.statement}`).some((t) => hunkTokens.has(t)) || namePartHit(l);
  });
  // FIX (audit: single-pass tokenization) — the hunk is tokenized ONCE; each law's token set
  // is computed ONCE and reused for the overlap score below.
  const lawToks = new Map(ranked.map((l) => [l.id, new Set(tokensOf(`${l.name} ${l.id} ${l.statement}`))] as const));
  const scored = ranked.map((l) => {
    const lt = lawToks.get(l.id) ?? new Set<string>();
    const overlap = [...lt].filter((t) => hunkTokens.has(t)).length;
    // a short-name-part hit (the TP1/ZS10 class) counts even when token overlap is 0
    const shortHit = namePartHit(l) ? 1 : 0;
    // ★ THE VIOLATION-BIAS FIX (found by the derailment probe, 2026-09-30).
    //   The PREVIOUS ranking added `nums * 3` when the edit's NUMBER MATCHED the law's
    //   number. That made an edit which CONTRADICTS the constant (ZFP 45 -> 60) rank
    //   LOWER, so the violation never became a candidate and the judge never saw it:
    //       the stupid action (ZFP=60) produced NO card
    //       the correct action (ZFP=45) produced a card
    //   The detector must be SUBJECT-MATCH ONLY. Whether the number AGREES is the
    //   JUDGE's question (P4 VIOLATE), never the detector's.
    return { l, score: overlap * 2 + shortHit };
  });
  // FIX (audit store.ts:220): a ZERO-overlap law is not a candidate — return [] (no arbitrary pick)
  // FIX (audit: tier-weighted ranking) — a SUPERSEDED law must never outrank canon on the
  // same overlap: IMMUTABLE +2, EVOLVING +1, SUPERSEDED -2.
  // FIX (audit round-12: the weight is a NAMED map) — the nested ternary hid the fail-closed
  // default (unknown tier → -2, sinks). A map states it; validTier() owns the same default.
  const TIER_W: Record<string, number> = { IMMUTABLE: 2, EVOLVING: 1 };
  const w = (t: string): number => TIER_W[t] ?? -2;
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
  // FIX (audit round-13: full-tail match + O(n) norm) — 2 segments still conflated
  // pkg/a/util.ts vs lib/a/util.ts, and [...acc,s] rebuilt per segment (O(n²)). Now: the
  // FULL normalized path must match or be a suffix on a SEGMENT boundary (never mid-name),
  // and norm() pushes in place (O(n)).
  const norm = (p: string): string => {
    const acc: string[] = [];
    for (const seg of String(p ?? "").replace(/\\/g, "/").split("/")) {
      if (seg.length === 0 || seg === ".") continue;
      if (seg === "..") { if (acc.length > 0 && acc[acc.length - 1] !== "..") { acc.pop(); } else { acc.push(".."); } continue; }
      acc.push(seg);
    }
    return acc.join("/");
  };
  const fp = norm(filePath);
  if (!fp) return [];
  const tail = fp;
  const hits = store.relationships.filter((r) => {
    if (r.type !== "imports") return false;
    const t = norm(r.target);
    if (!t) return false;
    // FIX (audit round-16: BOTH directions) — when fp is absolute (/home/.../src/foo.ts) and
    // the graph target is repo-relative (src/foo.ts), the old one-way suffix never matched.
    // Now the shorter of the two must be a segment-bounded suffix of the longer.
    if (t === fp) return true;
    return fp.length >= t.length ? fp.endsWith(`/${t}`) : t.endsWith(`/${fp}`);

  });
  // FIX (audit round-11: deterministic order) — sort before slicing so the same graph
  // always yields the same callers.
  return [...new Set(hits.map((r) => String(r.source ?? "")).filter((x) => x.trim().length > 0))].sort().slice(0, 20);
}
