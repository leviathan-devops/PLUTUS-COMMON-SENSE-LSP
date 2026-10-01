#!/usr/bin/env bun
// @bun

// scripts/plutus-lsp.ts
import { readFileSync as readFileSync2, appendFileSync, mkdirSync, existsSync as existsSync2, statSync as statSync2, realpathSync as realpathSync2, openSync as openSync2, readSync as readSync2, closeSync as closeSync2, writeFileSync } from "fs";
import { dirname as dirname2, resolve as resolve2 } from "path";
import { fileURLToPath } from "url";

// src/plutus-lsp/store.ts
import { existsSync, statSync, openSync, fstatSync, readSync, closeSync, readFileSync, realpathSync, constants as FS } from "fs";
import { join, dirname, resolve, basename } from "path";
import { connect } from "net";
import { homedir } from "os";
var ROOT_MARKERS = Object.freeze([".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT", "tsconfig.json"]);
var STRONG_MARKERS = Object.freeze([".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT"]);
var PLUTUS_NO_STORE = "PLUTUS_NO_STORE";
var PLUTUS_NO_ROOT = "PLUTUS_NO_ROOT";
var JEVK5_DOWN = "JEVK5_DOWN";
var TIERS = ["IMMUTABLE", "EVOLVING", "SUPERSEDED"];
function validTier(v) {
  const t = String(v ?? "").trim().toUpperCase();
  return TIERS.includes(t) ? t : "SUPERSEDED";
}
var HOME = homedir();
var PLUTUS_SCOPE_FILES = Object.freeze(["plutus.yaml", ".plutus"]);
function isPlutusScoped(startFile) {
  let dir = resolve(startFile);
  try {
    if (!statSync(dir).isDirectory())
      dir = dirname(dir);
  } catch {
    dir = dirname(dir);
  }
  try {
    dir = realpathSync(dir);
  } catch {}
  for (let i = 0;i < 16; i++) {
    if (basename(dir) === "PLUTUS")
      return true;
    if (dir !== HOME && !HOME.startsWith(dir + "/")) {
      for (const m of PLUTUS_SCOPE_FILES) {
        try {
          if (statSync(join(dir, m)).isFile())
            return true;
        } catch {}
      }
    }
    const parent = dirname(dir);
    if (parent === dir)
      break;
    dir = parent;
  }
  return false;
}
function resolveRoot(startFile) {
  let dir = resolve(startFile);
  try {
    if (!statSync(dir).isDirectory())
      dir = dirname(dir);
  } catch {
    dir = dirname(dir);
  }
  let generic = null;
  for (let i = 0;i < 12; i++) {
    for (const m of STRONG_MARKERS)
      if (existsSync(join(dir, m)))
        return dir;
    if (generic === null && i < 3) {
      for (const m of ROOT_MARKERS)
        if (existsSync(join(dir, m))) {
          generic = dir;
          break;
        }
    }
    const parent = dirname(dir);
    if (parent === dir)
      break;
    dir = parent;
  }
  if (generic !== null)
    return generic;
  throw new Error(`${PLUTUS_NO_ROOT}: no root marker (${ROOT_MARKERS.join(" | ")}) above ${startFile}`);
}
var KNOWN_L1_PATHS = Object.freeze([
  ".omp/wt/plutus-main-66dfa4c/PLUTUS/agent/.omp/graph-intelligence/layers/semantica/kg.json",
  "JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json"
]);
var L1_RESOLVED = new Map;
var LAW_COUNT_CACHE = new Map;
function lawCount(p) {
  try {
    const st = statSync(p);
    const hit = LAW_COUNT_CACHE.get(p);
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size)
      return hit.laws;
    const n = lawCountUncached(p);
    if (LAW_COUNT_CACHE.size >= 128) {
      const first = LAW_COUNT_CACHE.keys().next().value;
      if (first)
        LAW_COUNT_CACHE.delete(first);
    }
    LAW_COUNT_CACHE.set(p, { mtimeMs: st.mtimeMs, size: st.size, laws: n });
    return n;
  } catch {
    return -1;
  }
}
function lawCountUncached(p) {
  try {
    const d = JSON.parse(readFileSync(p, "utf8"));
    const ents = Array.isArray(d.entities) ? d.entities : [];
    return ents.filter((e) => String(e?.type ?? "") === "law").length;
  } catch {
    return -1;
  }
}
function head4(p) {
  try {
    const fd = openSync(p, FS.O_RDONLY | FS.O_NONBLOCK);
    try {
      const b = Buffer.alloc(4096);
      const n = readSync(fd, b, 0, 4096, 0);
      return `${n}:${b.subarray(0, n).toString("base64")}`;
    } finally {
      closeSync(fd);
    }
  } catch {
    return "";
  }
}
function l1PathFor(root) {
  const env = process.env.PLUTUS_L1_PATH;
  if (env)
    return env;
  const local = join(root, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
  const remember = (path) => {
    try {
      const st = statSync(path);
      L1_RESOLVED.set(root, { path, mtimeMs: st.mtimeMs, size: st.size, head: head4(path) });
    } catch {}
    return path;
  };
  if (lawCount(local) > 0)
    return remember(local);
  const hit = L1_RESOLVED.get(root);
  if (hit && lawCount(hit.path) > 0) {
    try {
      const st = statSync(hit.path);
      if (st.mtimeMs === hit.mtimeMs && st.size === hit.size && head4(hit.path) === hit.head)
        return hit.path;
    } catch {}
    L1_RESOLVED.delete(root);
  }
  let dir = root;
  for (let i = 0;i < 12; i++) {
    const parent = dirname(dir);
    if (parent === dir)
      break;
    dir = parent;
    const cand = join(dir, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
    if (lawCount(cand) > 0)
      return remember(cand);
  }
  if (process.env.PLUTUS_ALLOW_KNOWN_PATHS === "1") {
    for (const rel of KNOWN_L1_PATHS) {
      const known = resolve(homedir(), rel);
      if (lawCount(known) > 0)
        return remember(known);
    }
  }
  if (process.env.PLUTUS_ALLOW_KNOWN_PATHS === "1") {
    for (const rel of KNOWN_L1_PATHS) {
      const known = resolve(homedir(), rel);
      try {
        if (statSync(known).isFile())
          return remember(known);
      } catch {}
    }
  }
  return local;
}
function loadStore(startFile) {
  const root = resolveRoot(startFile);
  const l1Path = l1PathFor(root);
  if (!existsSync(l1Path)) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} absent (root=${root})`);
  }
  const MAX_L1_BYTES = 16 * 1024 * 1024;
  const envPath = process.env.PLUTUS_L1_PATH;
  if (envPath && !/\.json$/i.test(envPath.split("?")[0])) {
    throw new Error(`${PLUTUS_NO_STORE}: PLUTUS_L1_PATH must be a .json path (got ${envPath.slice(0, 80)})`);
  }
  let raw = "";
  try {
    const pre = statSync(l1Path);
    if (!pre.isFile())
      throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} is not a regular file`);
  } catch (e) {
    const err = e;
    if (err.code === undefined && err.message.startsWith(PLUTUS_NO_STORE))
      throw err;
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} unreadable (${err.code ?? err.message})`);
  }
  try {
    const fd = openSync(l1Path, FS.O_RDONLY | FS.O_NONBLOCK);
    try {
      const st = fstatSync(fd);
      if (!st.isFile())
        throw new Error(`not a regular file (mode ${st.mode.toString(8)})`);
      if (st.size === 0)
        throw new Error("0 bytes");
      if (st.size > MAX_L1_BYTES)
        throw new Error(`${st.size} bytes exceeds the 16MB cap`);
      const buf = Buffer.alloc(st.size);
      let off = 0;
      while (off < st.size) {
        const n = readSync(fd, buf, off, st.size - off, null);
        if (n <= 0)
          break;
        off += n;
      }
      if (off < st.size)
        throw new Error(`short read ${off}/${st.size} bytes (file changed during read)`);
      raw = buf.subarray(0, off).toString("utf8");
    } finally {
      closeSync(fd);
    }
  } catch (e) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} unreadable (${e.message})`);
  }
  let doc;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`the doc is ${Array.isArray(parsed) ? "an array" : typeof parsed}, not an object`);
    }
    doc = parsed;
  } catch (e) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} unparseable (${e.message})`);
  }
  const entities = (Array.isArray(doc.entities) ? doc.entities : []).filter((e) => typeof e === "object" && e !== null && !Array.isArray(e));
  const relationships = (Array.isArray(doc.relationships) ? doc.relationships : []).filter((r) => typeof r === "object" && r !== null && !Array.isArray(r));
  const laws = entities.filter((e) => String(e.type ?? "") === "law" && String(e.id ?? "").trim().length > 0).map((e) => ({
    id: String(e.id ?? "").trim(),
    name: String(e.name ?? e.id ?? "").trim(),
    statement: String(e.statement ?? ""),
    tier: validTier(e.tier),
    anchor: String(e.anchor ?? "").trim(),
    source: String(e.source ?? "").trim()
  }));
  return { root, l1Path, entities, relationships, laws, total: laws.length };
}
function declarationsIn(source) {
  const out = new Set;
  const code = source.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'A-Za-z0-9_$])\/\/[^\n]*/g, "$1 ");
  const re = /export\s+(?:default\s+)?(?:async\s+)?(?:declare\s+)?(?:abstract\s+)?(?:function\*?|const|let|var|class|interface|type|enum|namespace)\s+([A-Za-z_$][\w$]*)|export\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    if (m[1])
      out.add(m[1]);
    else if (m[2])
      for (const part of m[2].split(",")) {
        const bits = part.trim().split(/\s+as\s+/).map((x) => x.trim()).filter(Boolean);
        for (const n of bits)
          if (n && n !== "default" && /^[A-Za-z_$][\w$]*$/.test(n))
            out.add(n);
      }
  }
  return [...out];
}
async function readL2(socketPath, timeoutMs = 800) {
  const ms = Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 60000) : 800;
  if (!existsSync(socketPath))
    return { ok: false, reason: `${PLUTUS_NO_STORE}: socket absent (${socketPath})` };
  return await new Promise((res) => {
    let sock;
    try {
      sock = connect(socketPath);
    } catch (e) {
      return res({ ok: false, reason: `L2_ERROR: ${e.message}` });
    }
    let done = false;
    const finish = (r) => {
      if (!done) {
        done = true;
        clearTimeout(t);
        sock.destroy();
        res(r);
      }
    };
    const t = setTimeout(() => finish({ ok: false, reason: `L2_TIMEOUT (${ms}ms)` }), ms);
    sock.on("connect", () => {
      const req = Buffer.from(JSON.stringify({ read: "overview" }));
      const len = Buffer.alloc(4);
      len.writeUInt32BE(req.length);
      sock.write(Buffer.concat([len, req]), (err) => {
        if (err)
          finish({ ok: false, reason: `L2_WRITE: ${err.message}` });
      });
    });
    const chunks = [];
    let total = 0;
    sock.on("data", (c) => {
      const cb = c;
      chunks.push(cb);
      total += cb.length;
      if (total > 32 * 1024 * 1024) {
        finish({ ok: false, reason: `L2_OVERSIZE: ${total} bytes` });
        return;
      }
      if (total < 4)
        return;
      const head = chunks[0].length >= 4 ? chunks[0].readUInt32BE(0) : Buffer.concat(chunks, 4).readUInt32BE(0);
      const need = 4 + head;
      if (need > 16 * 1024 * 1024 + 4) {
        finish({ ok: false, reason: `L2_FRAME_TOO_LARGE` });
        return;
      }
      if (total < need)
        return;
      const b = Buffer.concat(chunks, total);
      const n = need - 4;
      clearTimeout(t);
      try {
        const j = JSON.parse(b.subarray(4, 4 + n).toString("utf8"));
        const g = j?.result?.overview?.graph_shape;
        const nc = g?.node_count, ec = g?.edge_count;
        if (!Number.isFinite(nc) || !Number.isFinite(ec)) {
          finish({ ok: false, reason: `L2_SHAPE_INVALID: node_count=${nc} edge_count=${ec}` });
        } else
          finish({ ok: true, nodeCount: nc, edgeCount: ec });
      } catch (e) {
        finish({ ok: false, reason: `L2_PARSE: ${e.message}` });
      }
    });
    sock.on("error", (e) => {
      finish({ ok: false, reason: `L2_ERROR: ${e.message}` });
    });
    sock.on("close", () => {
      finish({ ok: false, reason: "L2_CLOSED: the peer closed before a full frame" });
    });
    sock.on("end", () => {
      finish({ ok: false, reason: "L2_ENDED: the peer ended the stream" });
    });
  });
}
function l2SocketFor(root) {
  const p = resolve(root);
  let h = 0xcbf29ce484222325n;
  for (const b of Buffer.from(p)) {
    h = (h ^ BigInt(b)) * 0x100000001b3n & 0xffffffffffffffffn;
  }
  const home = homedir();
  return join(home, ".arsumbris", "au-engine", "run", `${h.toString(16).padStart(16, "0")}.sock`);
}
var STOPWORDS = new Set([
  "file",
  "files",
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "type",
  "types",
  "name",
  "names",
  "value",
  "values",
  "data",
  "code",
  "test",
  "tests",
  "main",
  "index",
  "util",
  "utils",
  "core",
  "base",
  "src",
  "lib",
  "spec",
  "docs",
  "readme",
  "package",
  "const",
  "export",
  "function",
  "class",
  "interface",
  "return",
  "true",
  "false",
  "null"
]);
function isStopword(t) {
  return STOPWORDS.has(t);
}
function wordRe(needle) {
  const t = needle.trim();
  if (!t || t.length > 64)
    return /(?!)/;
  return new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
}
function tokensOf(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^A-Za-z0-9]+/).map((t) => t.toLowerCase()).filter((t) => t.length >= 4 && !isStopword(t));
}
function lawsForFile(store, filePath, decls) {
  const base = (filePath.split(/[\\/]/).pop() ?? "").replace(/\.[A-Za-z0-9.]+$/, "");
  const needles = new Set([...tokensOf(base), ...decls.flatMap(tokensOf)]);
  const seen = new Set;
  const out = [];
  const compiled = [...needles].map((n) => wordRe(n));
  for (let k = 0;k < compiled.length; k++) {
    const re = compiled[k];
    for (const l of store.laws) {
      if (seen.has(l.id))
        continue;
      const hay = `${l.name} ${l.statement} ${l.id}`.toLowerCase();
      if (re.test(hay)) {
        seen.add(l.id);
        out.push(l);
      }
    }
  }
  return out;
}
function lawsForHunk(store, filePath, decls, hunk, topK = 3) {
  topK = typeof topK === "number" && Number.isFinite(topK) ? Math.max(1, Math.floor(topK)) : 3;
  const byName = lawsForFile(store, filePath, decls);
  const hunkTokens = new Set(tokensOf(hunk));
  const hunkLower = hunk.toLowerCase();
  const byHunk = store.laws.filter((l) => {
    const lt = tokensOf(`${l.name} ${l.statement}`);
    if (lt.some((t) => hunkTokens.has(t)))
      return true;
    for (const part of String(l.name).split(/[-_\s]+/)) {
      if (part.length >= 3 && wordRe(part.toLowerCase()).test(hunkLower))
        return true;
    }
    return false;
  });
  const seen = new Set;
  const hunkLower2 = hunk.toLowerCase();
  const namePartHit = (l) => String(l.name).split(/[-_\s]+/).some((part) => part.length >= 3 && !isStopword(part.toLowerCase()) && wordRe(part.toLowerCase()).test(hunkLower2));
  const ranked = [...byName, ...byHunk].filter((l) => {
    if (seen.has(l.id))
      return false;
    seen.add(l.id);
    return tokensOf(`${l.name} ${l.id} ${l.statement}`).some((t) => hunkTokens.has(t)) || namePartHit(l);
  });
  const lawToks = new Map(ranked.map((l) => [l.id, new Set(tokensOf(`${l.name} ${l.id} ${l.statement}`))]));
  const scored = ranked.map((l) => {
    const lt = lawToks.get(l.id) ?? new Set;
    const overlap = [...lt].filter((t) => hunkTokens.has(t)).length;
    const shortHit = namePartHit(l) ? 1 : 0;
    return { l, score: overlap * 2 + shortHit };
  });
  const TIER_W = { IMMUTABLE: 2, EVOLVING: 1 };
  const w = (t) => TIER_W[t] ?? -2;
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score + w(b.l.tier) - (a.score + w(a.l.tier))).slice(0, topK).map((x) => x.l);
}
function callersOf(store, filePath) {
  const norm = (p) => {
    const acc = [];
    for (const seg of String(p ?? "").replace(/\\/g, "/").split("/")) {
      if (seg.length === 0 || seg === ".")
        continue;
      if (seg === "..") {
        if (acc.length > 0 && acc[acc.length - 1] !== "..") {
          acc.pop();
        } else {
          acc.push("..");
        }
        continue;
      }
      acc.push(seg);
    }
    return acc.join("/");
  };
  const fp = norm(filePath);
  if (!fp)
    return [];
  const tail = fp;
  const hits = store.relationships.filter((r) => {
    if (r.type !== "imports")
      return false;
    const t = norm(r.target);
    if (!t)
      return false;
    if (t === fp)
      return true;
    return fp.length >= t.length ? fp.endsWith(`/${t}`) : t.endsWith(`/${fp}`);
  });
  return [...new Set(hits.map((r) => String(r.source ?? "")).filter((x) => x.trim().length > 0))].sort().slice(0, 20);
}

// src/plutus-lsp/judge.ts
var receipt = () => {};
function setReceipt(fn) {
  if (typeof fn === "function")
    receipt = fn;
}
var JEVK5_URL_DEFAULT = "http://127.0.0.1:8090/v1/systemone";
var JEVK5_HEALTH_DEFAULT = "http://127.0.0.1:8090/health";
var envOr = (v, dflt) => typeof v === "string" && v.trim().length > 0 ? v.trim() : dflt;
var jevk5Url = () => envOr(process.env.JEVK5_URL, JEVK5_URL_DEFAULT);
var jevk5Health = () => envOr(process.env.JEVK5_HEALTH, JEVK5_HEALTH_DEFAULT);
var CHAIN = {
  P1: { id: "P1", name: "SCOPE", q: "Is the target file inside the PLUTUS tree (a Plutus/Trident module or canon doc)?" },
  P2: { id: "P2", name: "LAW", q: "Does the supplied evidence show a governing law for this symbol?" },
  P3: { id: "P3", name: "TIER", q: "Is the governing law marked IMMUTABLE (a never-change canon law)?" },
  P4: { id: "P4", name: "VIOLATE", q: "Does the proposed change CONTRADICT the law's statement?" },
  P5: { id: "P5", name: "CONTRACT", q: "Does the change OVERRIDE a prior engine's data architecture (violating E1->E2->E3)?" },
  P6: { id: "P6", name: "ANTIPATTERN", q: "Does the change match a KNOWN bug or anti-pattern recorded in the canon?" },
  P7: { id: "P7", name: "DRIFT", q: "Does the change contradict a prior recorded ruling or decision?" }
};
async function jevk5Fetch(state, questions, timeoutMs) {
  const ms = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 60000) : 1500;
  const ctl = new AbortController;
  const t = setTimeout(() => ctl.abort(), ms);
  const started = Date.now();
  try {
    const r = await fetch(jevk5Url(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state, questions }),
      signal: ctl.signal
    });
    if (!r.ok)
      return { ok: false, reason: `${JEVK5_DOWN}: HTTP ${r.status}` };
    const j = await r.json();
    if (!j || typeof j !== "object")
      return { ok: false, reason: `${JEVK5_DOWN}: malformed body` };
    const raw = j.answers;
    if (raw === undefined)
      return { ok: false, reason: `${JEVK5_DOWN}: missing answers field` };
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      return { ok: false, reason: `${JEVK5_DOWN}: answers is ${Array.isArray(raw) ? "an array" : typeof raw}` };
    const answers = {};
    for (const [k, a] of Object.entries(raw)) {
      const v = a?.noul;
      if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1)
        answers[k] = v;
    }
    const lat = j.latency_ms;
    return { ok: true, value: { answers, requests: 1, latencyMs: typeof lat === "number" && Number.isFinite(lat) ? lat : Date.now() - started } };
  } catch (e) {
    return { ok: false, reason: `${JEVK5_DOWN}: ${e instanceof Error ? e.message : String(e)}` };
  } finally {
    clearTimeout(t);
  }
}
async function health(timeoutMs = 1500) {
  const ms = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 60000) : 1500;
  const errOf = (e) => e instanceof Error ? e.message : String(e);
  try {
    const ctl = new AbortController;
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(jevk5Health(), { signal: ctl.signal });
      if (!r.ok)
        return { ok: false, reason: `${JEVK5_DOWN}: health HTTP ${r.status}` };
      const j = await r.json();
      if (Array.isArray(j))
        return { ok: false, reason: `${JEVK5_DOWN}: health body is an array` };
      if (!j || typeof j !== "object")
        return { ok: false, reason: `${JEVK5_DOWN}: health body is ${typeof j}` };
      const ok = j.ok;
      return ok === true ? { ok: true } : { ok: false, reason: `${JEVK5_DOWN}: health says ${JSON.stringify(j).slice(0, 120)}` };
    } finally {
      clearTimeout(t);
    }
  } catch (e) {
    return { ok: false, reason: `${JEVK5_DOWN}: ${errOf(e)}` };
  }
}
async function chain(state, nodes = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], timeoutMs = 6000, p4Override) {
  if (typeof state !== "string")
    state = String(state ?? "");
  if (state.length > 4000)
    state = state.slice(0, 4000);
  if (!Array.isArray(nodes))
    return { ok: false, answers: {}, reason: "JUDGE_NO_NODES", requests: 0 };
  const seen = new Set;
  const deduped = nodes.filter((n) => seen.has(n) ? false : (seen.add(n), true));
  if (deduped.length === 0)
    return { ok: false, answers: {}, reason: "JUDGE_NO_NODES", requests: 0 };
  const h = await health();
  if (!h.ok)
    return { ok: false, answers: {}, reason: h.reason, requests: 0 };
  const valid = deduped.filter((id) => Object.hasOwn(CHAIN, id));
  const invalid = deduped.filter((id) => !Object.hasOwn(CHAIN, id));
  const note = (m) => {
    try {
      receipt(m);
    } catch {}
  };
  if (invalid.length > 0)
    note(`CHAIN invalid NodeId(s): ${invalid.join(",")} \u2014 filtered, never judged`);
  if (valid.length + invalid.length < nodes.length)
    note(`CHAIN deduped ${nodes.length} \u2192 ${valid.length + invalid.length} (duplicates collapsed)`);
  if (valid.length === 0)
    return { ok: false, answers: {}, reason: "JUDGE_NO_NODES", requests: 0 };
  const questions = {};
  for (const id of valid)
    questions[id] = { type: "noul", instructions: id === "P4" && typeof p4Override === "string" && p4Override.trim().length > 0 ? p4Override : CHAIN[id].q };
  const res = await jevk5Fetch(state, questions, timeoutMs);
  if (!res.ok)
    return { ok: false, answers: {}, reason: res.reason, requests: 1 };
  const answers = {};
  for (const id of valid) {
    const v = res.value.answers[id];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1)
      answers[id] = v;
  }
  const answered = Object.keys(answers).length;
  if (answered !== valid.length) {
    return { ok: false, answers, reason: `JUDGE_ANSWER_COUNT: ${answered}/${valid.length}`, requests: 1, latencyMs: res.value.latencyMs };
  }
  return { ok: true, answers, requests: 1, latencyMs: res.value.latencyMs };
}
var prioritizeImmutable = (laws) => [...laws].sort((a, b) => (a.tier === "IMMUTABLE" ? 0 : 1) - (b.tier === "IMMUTABLE" ? 0 : 1));
function buildState(target, laws, hunk) {
  if (typeof target !== "string")
    target = String(target ?? "(no target)");
  if (typeof hunk !== "string")
    hunk = "";
  laws = Array.isArray(laws) ? laws.filter((l) => l && typeof l.name === "string" && typeof l.statement === "string") : [];
  const ordered = prioritizeImmutable(laws);
  const kept = ordered.slice(0, 6);
  const lawText = kept.map((l) => `[${l.tier ?? "MUTABLE"}] ${l.name}: ${l.statement} (anchor ${l.anchor ?? "unknown"})`).join(`
`) + (laws.length > kept.length ? `
... [${laws.length - kept.length} more laws truncated]` : "");
  return [
    `TARGET FILE: ${target}`,
    `GOVERNING LAWS (${laws.length}):`,
    lawText || "(none)",
    `PROPOSED CHANGE (the diff hunk):`,
    (hunk.length > 1500 ? `${hunk.slice(0, 1500)}
... [hunk truncated at 1500 of ${hunk.length} chars]` : hunk) || "(none)"
  ].join(`
`);
}
var bar = (raw, dflt) => {
  const n = Number(raw);
  return raw !== undefined && Number.isFinite(n) && n > 0 && n < 1 ? n : dflt;
};
var throwT = () => bar(process.env.PLUTUS_THROW_T, 0.85);
var demandT = () => bar(process.env.PLUTUS_DEMAND_T, 0.3);
var relevanceT = () => bar(process.env.PLUTUS_RELEVANCE_T, 0.3);
var DECIDING = ["P4", "P5", "P6"];
function verdict(v) {
  if (!v || typeof v !== "object" || !v.ok)
    return { kind: "JUDGE_DOWN", weakest: null, vector: {}, reason: v?.reason };
  const raw = v.answers && typeof v.answers === "object" && !Array.isArray(v.answers) ? v.answers : {};
  const a = {};
  for (const [k, n] of Object.entries(raw)) {
    if (Object.hasOwn(CHAIN, k) && typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1)
      a[k] = n;
  }
  if (a.P2 === undefined || a.P2 < demandT())
    return { kind: "INCONCLUSIVE", weakest: "P2", vector: a };
  const answered = DECIDING.filter((id) => a[id] !== undefined);
  if (answered.length === 0)
    return { kind: "INCONCLUSIVE", weakest: null, vector: a };
  const wrong = answered.map((id) => a[id]);
  const maxWrong = Math.max(...wrong);
  const strongest = answered[wrong.indexOf(maxWrong)] ?? null;
  const p7 = a.P7;
  const TT = throwT(), DT = demandT();
  const immutable = a.P3 !== undefined && a.P3 >= DT;
  const throwBar = immutable ? TT * 0.9 : TT;
  if (maxWrong >= throwBar)
    return { kind: "VIOLATION", weakest: strongest, vector: a };
  if (p7 !== undefined && p7 >= TT)
    return { kind: "DRIFT", weakest: "P7", vector: a };
  if (maxWrong >= DT)
    return { kind: "SUSPECT", weakest: strongest, vector: a };
  return { kind: "LAW", weakest: null, vector: a };
}
var OBSERVABLE = [
  {
    match: /stop-?loss|sl cap|150 ?pip|sl_?cap/i,
    q: "Does the evidence state a stop-loss value GREATER than 36 pips? (36 is the D17 ceiling; read the number)"
  },
  {
    match: /one tp|tp1|take-?profit|single tp/i,
    q: "Does the evidence define MORE THAN ONE take-profit target (a TP1, TP2, or TP3)?"
  },
  {
    match: /pair format|EUR\/USD|slashes/i,
    q: "Does the evidence use a pair name WITHOUT the slash separator (e.g. EURUSD instead of EUR/USD)?"
  },
  {
    match: /rrr|risk-?reward|category-specific/i,
    q: "Does the evidence set a FLAT risk-reward ratio (the same value for every category)?"
  },
  {
    match: /zfp|threshold/i,
    q: "Does the evidence change the ZFP threshold away from 45?"
  }
];
function observableQuestion(laws) {
  if (!Array.isArray(laws))
    return CHAIN.P4.q;
  laws = laws.filter((l) => l && typeof l.name === "string" && typeof l.statement === "string");
  if (laws.length === 0)
    return CHAIN.P4.q;
  const lawToks = (l) => new Set(`${l.name} ${l.statement}`.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !isStopword(t)));
  let best = null;
  for (const l of laws) {
    const hay = `${l.name} ${l.statement}`;
    const toks = lawToks(l);
    for (const t of OBSERVABLE) {
      if (t.match.test(hay)) {
        const ql = t.q.toLowerCase();
        const score = [...toks].filter((w) => new RegExp(`(^|[^a-z0-9])${w}([^a-z0-9]|$)`, "i").test(ql)).length;
        if (!best || score > best.score)
          best = { q: t.q, score };
      }
    }
  }
  return best?.q ?? CHAIN.P4.q;
}
async function relevancePass(laws, filePath, hunk, timeoutMs = 20000) {
  if (!Array.isArray(laws))
    laws = [];
  const saneIn = laws.filter((l) => l && typeof l.id === "string" && typeof l.name === "string" && typeof l.statement === "string");
  const malformed = laws.length - saneIn.length;
  if (malformed > 0) {
    try {
      receipt(`RELEVANCE malformed=${malformed} entries dropped before judging`);
    } catch {}
  }
  laws = saneIn;
  if (laws.length === 0)
    return { ok: true, scored: [], requests: 0, judged: 0, total: 0, dropped: 0 };
  const h = await health();
  if (!h.ok)
    return { ok: false, scored: [], reason: h.reason, requests: 0, judged: 0, total: laws.length, dropped: 0 };
  const CAPPED = 12;
  const ordered = prioritizeImmutable(laws);
  const judged = ordered.slice(0, CAPPED);
  const dropped = laws.length - judged.length;
  if (typeof filePath !== "string" || filePath.length === 0)
    filePath = "(no file)";
  if (typeof hunk !== "string")
    hunk = "";
  laws = Array.isArray(laws) ? laws.filter((l) => l && typeof l.id === "string" && typeof l.statement === "string") : [];
  const normPath = filePath.replace(/\\/g, "/").replace(/\/+$/, "");
  const segs = normPath.split("/").filter(Boolean);
  const subject = segs.length > 1 ? `${segs[segs.length - 2]}/${segs[segs.length - 1]}` : segs[0] ?? filePath;
  const lines = judged.map((l, i) => `Candidate ${i + 1} [${l.tier ?? "MUTABLE"}] ${l.name}: ${l.statement.slice(0, 160)}`).join(`
`) + (dropped > 0 ? `
... [${dropped} more candidates truncated \u2014 never judged]` : "");
  const state = [
    `FILE BEING WRITTEN: ${subject}`,
    `DECLARATIONS IN THE HUNK:`,
    hunk.slice(0, 1200) || "(none)",
    `CANDIDATE LAWS:`,
    lines
  ].join(`
`);
  const questions = {};
  judged.forEach((_, i) => {
    questions[`R${i + 1}`] = {
      type: "noul",
      instructions: `Candidate ${i + 1}: does THIS law govern the code being written in ${subject}? ` + `A law governs if the hunk touches the SAME QUANTITY, RULE OR DOMAIN the law is about. ` + `\u2605 A DIFFERENT VALUE IS STILL GOVERNED \u2014 if the law fixes a constant or a rule and the ` + `hunk sets a different value for that same thing, the law governs THAT MOST: a ` + `disagreement is the case you must catch. Answer no ONLY when the law's subject is a ` + `different subject entirely (a stop-loss law vs a colour-palette edit).`
    };
  });
  const res = await jevk5Fetch(state, questions, timeoutMs);
  if (!res.ok)
    return { ok: false, scored: [], reason: res.reason, requests: 1, judged: judged.length, total: laws.length, dropped };
  const scored = [];
  judged.forEach((l, i) => {
    const v = res.value.answers[`R${i + 1}`];
    scored.push({ index: i, lawId: l.id, p: typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : -1 });
  });
  return { ok: true, scored, requests: 1, latencyMs: res.value.latencyMs, judged: judged.length, total: laws.length, dropped };
}
function partitionByRelevance(laws, rows) {
  if (!Array.isArray(laws))
    laws = [];
  if (!Array.isArray(rows))
    rows = [];
  laws = laws.filter((l) => l && typeof l.id === "string");
  const byId = new Map;
  for (const l of laws) {
    if (byId.has(l.id)) {
      try {
        receipt(`PARTITION duplicate lawId ${l.id} \u2014 keep-first`);
      } catch {}
      continue;
    }
    byId.set(l.id, l);
  }
  const relevant = [];
  const rejected = [];
  const unknown = [];
  const cutoff = relevanceT();
  let unmatched = 0;
  const placed = new Set;
  for (const r of rows) {
    if (!r || typeof r !== "object") {
      unmatched++;
      continue;
    }
    const law = byId.get(r.lawId);
    if (!law) {
      unmatched++;
      continue;
    }
    if (placed.has(law.id)) {
      unmatched++;
      continue;
    }
    placed.add(law.id);
    const p = r.p;
    if (typeof p !== "number" || !Number.isFinite(p) || p < 0 || p > 1)
      unknown.push(law);
    else if (p >= cutoff)
      relevant.push(law);
    else
      rejected.push({ law, p });
  }
  if (unmatched > 0) {
    try {
      receipt(`PARTITION unmatched=${unmatched}/${rows.length} rows (stale or hallucinated lawId)`);
    } catch {}
  }
  return { relevant, rejected, unknown };
}

// src/plutus-lsp/cards.ts
var PLUTUS_LSP_TOKENS = [
  "plutus/law",
  "plutus/violation",
  "plutus/callers",
  "plutus/drift",
  "plutus/suspect",
  "plutus/stale"
];
var SEVERITY = { Error: 1, Warning: 2, Information: 3, Hint: 4 };
var cap = (v, n = 240) => {
  let t;
  if (typeof v === "string")
    t = v;
  else if (v === null || v === undefined)
    t = "";
  else {
    try {
      t = String(v);
    } catch {
      t = "(unprintable)";
    }
  }
  const flat = t.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u200b-\u200f\u202a-\u202e\u2066-\u2069]+/g, " ");
  return flat.length > n ? `${flat.slice(0, n)}\u2026` : flat;
};
var srcOf = (law) => {
  const a = typeof law.anchor === "string" ? law.anchor.trim() : "";
  return a.length > 0 ? cap(a, 200) : "(anchor missing)";
};
function lawCard(kept, totalCandidates, judged) {
  if (!Array.isArray(kept) || kept.length === 0)
    return [];
  const clean = kept.filter((k) => k && k.law && typeof k.law.name === "string" && k.law.name.trim().length > 0 && typeof k.law.statement === "string" && k.law.statement.trim().length > 0);
  const tot = typeof totalCandidates === "number" && Number.isFinite(totalCandidates) && totalCandidates >= 0 ? Math.floor(totalCandidates) : 0;
  const n = clean.length;
  const shown = Math.min(n, 32);
  return clean.slice(0, 32).map(({ law, p }) => {
    const measured = typeof p === "number" && Number.isFinite(p) && p >= 0 && p <= 1;
    const prob = measured ? `relevance ${p.toFixed(2)}` : "relevance unread";
    const of = (tot > n ? ` \xB7 kept ${n} of ${tot} candidates` : "") + (n > shown ? ` \xB7 shown ${shown} of ${n}` : "");
    return {
      shape: "LAW",
      title: `${cap(law.name, 80)} \u2014 governs this code${judged ? ` (${prob}${of})` : " (lexical, no judge)"}`,
      rows: [
        `LAW: ${cap(law.statement, 400)}`,
        `TIER: ${cap(law.tier, 40) || "(tier missing)"}${law.tier === "IMMUTABLE" ? " \u2014 never change without a recorded ruling" : ""}`,
        `SOURCE: ${srcOf(law)}`,
        judged ? `JUDGE: ${prob}` : `LEXICAL: token match, not judged`
      ],
      severity: SEVERITY.Information,
      source: "plutus/law",
      total: n
    };
  });
}
function verdictCard(v, kept, targetFile) {
  if (!v)
    return null;
  const vector = v.vector && typeof v.vector === "object" && !Array.isArray(v.vector) ? v.vector : {};
  const pct = (n) => typeof n === "number" && Number.isFinite(n) ? n.toFixed(3) : "n/a";
  if (v.kind === "JUDGE_DOWN") {
    const raw = typeof v.reason === "string" && v.reason.length > 0 ? v.reason : "JEVK5_DOWN";
    const code = staleCode(raw, "JEVK5_DOWN");
    return {
      shape: "STALE",
      title: `the judge is down \u2014 the canon could not be consulted [${code}]`,
      rows: [`reason: ${cap(raw, 300)}`],
      severity: SEVERITY.Warning,
      source: "plutus/stale",
      total: 1
    };
  }
  if (v.kind === "INCONCLUSIVE") {
    return {
      shape: "SUSPECT",
      title: `INCONCLUSIVE \u2014 the judge could not reach a verdict (weakest clause ${cap(v.weakest, 16) || "none"})`,
      rows: [
        `the undecided clause: ${cap(v.weakest, 16) || "(no deciding clause answered)"}`,
        `VECTOR: ${Object.entries(vector).slice(0, 8).map(([k, n]) => `${cap(k, 16)}=${pct(n)}`).join("  ") || "(empty)"}`
      ],
      severity: SEVERITY.Hint,
      source: "plutus/suspect",
      total: 1
    };
  }
  if (v.kind === "LAW")
    return null;
  const keptArr = Array.isArray(kept) ? kept : [];
  const scored = keptArr.filter((k) => k && k.law && typeof k.law.name === "string" && typeof k.law.statement === "string" && typeof k.p === "number");
  const finiteTop = scored.filter((k) => Number.isFinite(k.p) && k.p >= 0 && k.p <= 1).sort((a, b) => b.p - a.p);
  const validLaw = (k) => !!k && typeof k.law?.name === "string" && k.law.name.trim().length > 0 && typeof k.law?.statement === "string" && k.law.statement.trim().length > 0;
  const top = finiteTop.find(validLaw);
  const picked = top ?? scored.find(validLaw) ?? keptArr.find(validLaw);
  const law = picked?.law;
  if (!law)
    return null;
  const EPS = 0.01;
  const topTied = finiteTop.length > 1 && Math.abs(finiteTop[0].p - finiteTop[1].p) < EPS;
  const attributed = !!top && picked === top && !topTied;
  const vecEntries = [];
  let vcount = 0;
  for (const k in vector) {
    if (vcount++ >= 8)
      break;
    vecEntries.push([k, vector[k]]);
  }
  const vecStr = vecEntries.map(([k, n]) => `${cap(k, 16)}=${pct(typeof n === "number" ? n : undefined)}`).join("  ") || "(empty)";
  const anchorFile = (() => {
    const strip = (v) => {
      if (typeof v !== "string")
        return "";
      return /^(.*?)(?::\d+(?::\d+)?)?$/.exec(v.trim())[1];
    };
    const t = strip(targetFile);
    if (t)
      return t;
    const a = strip(law.anchor);
    return a || "(anchor missing)";
  })();
  const known = v.kind === "VIOLATION" || v.kind === "DRIFT" ? v.kind : "SUSPECT";
  const kindNote = known === "SUSPECT" && v.kind !== "SUSPECT" ? ` (kind ${cap(v.kind, 32)} coerced)` : "";
  const effKind = !attributed ? "SUSPECT" : known;
  const weakScore = v.weakest ? vector[v.weakest] : undefined;
  const vacuous = v.weakest === null || v.weakest === undefined || typeof weakScore !== "number" || !Number.isFinite(weakScore);
  if (effKind === "VIOLATION" && v.kind === "VIOLATION" && !vacuous) {
    return {
      shape: "VIOLATION",
      title: `VIOLATION \u2014 this change contradicts ${cap(law.name, 80)} (${cap(v.weakest, 16)}=${pct(weakScore)})`,
      rows: [
        `LAW: ${cap(law.statement, 400)}`,
        `SOURCE: ${srcOf(law)}`,
        `YOU ARE EDITING: ${cap(anchorFile, 200)} \u2014 read the law before this edit lands`,
        `VECTOR: ${vecStr}`
      ],
      severity: SEVERITY.Error,
      source: "plutus/violation",
      total: 1
    };
  }
  if (effKind === "DRIFT" && v.kind === "DRIFT" && !vacuous) {
    const dc = v.weakest;
    return {
      shape: "DRIFT",
      title: `DRIFT \u2014 this change contradicts a prior decision (${cap(dc, 16)}=${pct(vector[dc])})`,
      rows: [`LAW: ${cap(law.statement, 400)}`, `SOURCE: ${srcOf(law)}`, `VECTOR: ${vecStr}`],
      severity: SEVERITY.Warning,
      source: "plutus/drift",
      total: 1
    };
  }
  return {
    shape: "SUSPECT",
    title: `SUSPECT \u2014 ${cap(law.name, 80)} may be breached (${cap(v.weakest, 16) || "none"}=${pct(v.weakest ? vector[v.weakest] : undefined)})${kindNote}; evidence required`,
    rows: [`LAW: ${cap(law.statement, 400)}`, `SOURCE: ${srcOf(law)}`, `VECTOR: ${vecStr}`],
    severity: SEVERITY.Warning,
    source: "plutus/suspect",
    total: 1
  };
}
function callersCard(callers) {
  if (!Array.isArray(callers) || callers.length === 0)
    return null;
  const clean = callers.filter((c) => typeof c === "string");
  const shown = [...new Set(clean.map((c) => c.trim()).filter((c) => c.length > 0))];
  if (shown.length === 0)
    return null;
  const rows = shown.slice(0, 8).map((c) => `imported by ${cap(c, 200)}`);
  if (shown.length > 8)
    rows.push(`\u2026 and ${shown.length - 8} more`);
  return {
    shape: "CALLERS",
    title: `this file \u2014 ${shown.length} importer${shown.length === 1 ? "" : "s"}`,
    rows,
    severity: SEVERITY.Information,
    source: "plutus/callers",
    total: shown.length
  };
}
var STALE_CODES = Object.freeze([
  "PLUTUS_NO_STORE",
  "PLUTUS_NO_ROOT",
  "JEVK5_DOWN",
  "JUDGE_DEGRADED",
  "JUDGE_NO_NODES",
  "JUDGE_ANSWER_COUNT",
  "L2_TIMEOUT",
  "L2_OVERSIZE",
  "L2_FRAME_TOO_LARGE",
  "L2_WRITE"
]);
var staleCode = (raw, dflt = "PLUTUS_NO_STORE") => {
  const head = /^([A-Z][A-Z0-9_]*)/.exec(raw.trim())?.[1] ?? "";
  return STALE_CODES.includes(head) ? head : dflt;
};
function staleCard(reason) {
  const rs = typeof reason === "string" && reason.trim().length > 0 ? reason : "PLUTUS_NO_STORE: unknown";
  const code = staleCode(rs);
  return {
    shape: "STALE",
    title: `the canon graph is unavailable [${code}]`,
    rows: [`reason: ${cap(rs, 300)}`],
    severity: SEVERITY.Warning,
    source: "plutus/stale",
    total: 1
  };
}
function fileCards(kept, totalCandidates, v, callers, judged, targetFile) {
  const out = [];
  out.push(...lawCard(kept ?? [], totalCandidates, judged));
  const cc = callersCard(callers ?? []);
  if (cc)
    out.push(cc);
  if (v) {
    const vc = verdictCard(v, kept ?? [], targetFile);
    if (vc)
      out.push(vc);
  }
  return out;
}

// scripts/plutus-lsp.ts
var HERE = dirname2(fileURLToPath(import.meta.url));
var FORENSIC = `${HERE}/../forensic`;
try {
  mkdirSync(FORENSIC, { recursive: true });
} catch (e) {
  try {
    process.stderr.write(`FORENSIC_DIR_FAIL: ${e.message} \u2014 the receipt channel is DOWN
`);
  } catch {}
}
var RECEIPT = process.env.PLUTUS_LSP_RECEIPT ?? `${FORENSIC}/lsp-receipts.log`;
function toDiagnostic(card, src, line = 0) {
  const lines = src.split(`
`);
  const at = Math.max(0, Math.min(line, lines.length - 1));
  const col = lines[at]?.length ?? 0;
  return {
    range: { start: { line: at, character: 0 }, end: { line: at, character: col } },
    severity: card.severity,
    source: card.source,
    code: card.shape,
    message: `${card.title}
${card.rows.map((r) => "  " + r).join(`
`)}`
  };
}
var receiptBuf = [];
var receiptFlush = () => {
  if (receiptBuf.length === 0)
    return;
  const batch = receiptBuf.join("");
  receiptBuf = [];
  try {
    appendFileSync(RECEIPT, batch);
  } catch (e) {
    try {
      process.stderr.write(`RECEIPT_WRITE_FAIL: ${e.message}
`);
    } catch {}
  }
};
setInterval(receiptFlush, 500).unref?.();
var receipt2 = (line) => {
  receiptBuf.push(`${new Date().toISOString()} ${clean(line)}
`);
  if (receiptBuf.length > 200)
    receiptFlush();
};
function rotateReceipt() {
  try {
    if (!existsSync2(RECEIPT))
      return;
    const size = statSync2(RECEIPT).size;
    if (size <= 12 * 1024 * 1024)
      return;
    const fd = openSync2(RECEIPT, "r");
    let tail = "";
    try {
      const start = Math.max(0, size - 256 * 1024);
      const b = Buffer.alloc(size - start);
      const n = readSync2(fd, b, 0, b.length, start);
      tail = b.subarray(0, Math.max(0, n)).toString("utf8").split(`
`).slice(-2000).join(`
`);
    } finally {
      closeSync2(fd);
    }
    writeFileSync(RECEIPT, `--- RECEIPT ROTATED (12MB cap) ---
${tail}
`);
    try {
      if (existsSync2(LOG) && statSync2(LOG).size > 4 * 1024 * 1024)
        writeFileSync(LOG, "");
    } catch (e) {
      try {
        process.stderr.write(`LOG_ROTATE_FAIL: ${e.message}
`);
      } catch {}
    }
    try {
      process.stderr.write(`RECEIPT_ROTATED: ${size} -> ${statSync2(RECEIPT).size} bytes
`);
    } catch {}
  } catch (e) {
    try {
      process.stderr.write(`RECEIPT_ROTATE_FAIL: ${e.message}
`);
    } catch {}
  }
}
rotateReceipt();
setReceipt((line) => receipt2(line));
var LOG = process.env.PLUTUS_LSP_LOG ?? `${FORENSIC}/lsp-stderr.log`;
var clean = (m) => m.replace(/[\r\n]+/g, " ");
var log = (m) => {
  try {
    appendFileSync(LOG, `${new Date().toISOString()} ${clean(m)}
`);
  } catch (e) {
    try {
      process.stderr.write(`LOG_WRITE_FAIL: ${e.message}
`);
    } catch {}
  }
};
async function pipeline(file, source, useJudge = true) {
  let degradedCard = null;
  if (!isPlutusScoped(file)) {
    receipt2(`OUT-OF-SCOPE file=${file}`);
    return { tokens: [], cards: [], refused: null, vector: {} };
  }
  let store;
  try {
    store = loadStore(file);
  } catch (e) {
    const msg = e.message;
    receipt2(`REFUSE ${msg.split(":")[0]} file=${file}`);
    if (msg.startsWith("PLUTUS_NO_ROOT"))
      return { tokens: [], cards: [], refused: msg, vector: {} };
    const sc = staleCard(msg);
    return { tokens: [sc.source], cards: [sc], refused: msg, vector: {} };
  }
  const decls = declarationsIn(source);
  const hunk = source.slice(0, 1200);
  const candidates = lawsForHunk(store, file, decls, hunk, 12);
  try {
    const sock = l2SocketFor(store.root);
    if (existsSync2(sock)) {
      readL2(sock, 400).then((l2) => receipt2(`L2 ${l2.ok ? `nodes=${l2.nodeCount} edges=${l2.edgeCount}` : l2.reason}`), (e) => receipt2(`L2_THROW: ${e.message}`));
    }
  } catch (e) {
    receipt2(`L2_THROW: ${e.message}`);
  }
  if (candidates.length === 0) {
    receipt2(`NO-LAW file=${file} decls=${decls.length}`);
    return { tokens: [], cards: [], refused: null, vector: {} };
  }
  let v = null;
  let vector = {};
  let all = candidates;
  let relevance = [];
  let judgedLaws = [];
  if (useJudge && candidates.length > 0) {
    const rel = await relevancePass(candidates, file, hunk);
    if (rel.ok) {
      receipt2(`RELEVANCE judged=${rel.judged}/${rel.total} dropped=${rel.dropped}`);
      const part = partitionByRelevance(candidates, rel.scored);
      all = [...part.relevant, ...part.unknown];
      if (part.unknown.length > 0)
        receipt2(`RELEVANCE unknown=${part.unknown.length} (judge-unreadable \u2014 carried as unread)`);
      relevance = rel.scored.map((r) => ({ lawId: r.lawId, p: r.p }));
      const byId = new Map(rel.scored.map((r) => [r.lawId, r.p]));
      judgedLaws = part.relevant.map((law) => ({ law, p: byId.get(law.id) ?? -1 }));
      receipt2(`RELEVANCE ok=${rel.scored.filter((r) => r.p >= relevanceT()).length}/${rel.scored.length} ` + `${part.rejected.map((x) => `${x.law.name}@${x.p.toFixed(2)}`).join(",") || "(none rejected)"}`);
      if (all.length === 0) {
        receipt2("RELEVANCE none \u2014 no card emitted");
        return { tokens: [], cards: [], refused: null, vector: {}, relevance };
      }
    } else {
      all = candidates.slice(0, 3);
      judgedLaws = all.map((law) => ({ law, p: -1 }));
      receipt2(`RELEVANCE degraded=${rel.reason}`);
      degradedCard = staleCard(`JUDGE_DEGRADED: ${rel.reason} \u2014 relevance kernel bypassed (lexical top-3)`);
    }
  } else if (candidates.length > 0) {
    all = candidates.slice(0, 3);
    judgedLaws = all.map((law) => ({ law, p: -1 }));
  }
  if (useJudge) {
    const res = await chain(buildState(file, all, hunk), ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], 6000, observableQuestion(all));
    v = verdict(res);
    vector = Object.fromEntries(Object.entries(res.answers).map(([k, n]) => [k, Number(n)]));
  }
  const cards = fileCards(judgedLaws, candidates.length, v, callersOf(store, file), useJudge && relevance.length > 0, file);
  if (degradedCard)
    cards.unshift(degradedCard);
  const tokens = [...new Set(cards.map((c) => c.source))];
  receipt2(`PUBLISH n=${cards.length} tokens=${tokens.join(",")} file=${file}${v ? ` verdict=${v.kind}` : ""}`);
  return { tokens, cards, refused: null, vector, relevance };
}
function applyRange(doc, f) {
  const ok = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
  const { start, end } = f.range ?? {};
  if (!start || !end || !ok(start.line) || !ok(start.character) || !ok(end.line) || !ok(end.character) || typeof f.text !== "string")
    return doc;
  const ls = doc.split(`
`);
  if (start.line > end.line || start.line === end.line && start.character > end.character)
    return doc;
  const sL = Math.min(start.line, ls.length - 1);
  const eL = Math.min(end.line, ls.length - 1);
  const head = ls.slice(0, sL);
  const tail = ls.slice(eL + 1);
  const prefix = (ls[sL] ?? "").slice(0, start.character);
  const suffix = (ls[eL] ?? "").slice(end.character);
  return [...head, prefix + f.text + suffix, ...tail].join(`
`);
}
var exitFlushed = (code) => {
  try {
    receiptFlush();
  } catch {}
  rotateReceipt();
  if (!sendChainRef) {
    process.exit(code);
    return;
  }
  let done = false;
  const finish = () => {
    if (!done) {
      done = true;
      process.exit(code);
    }
  };
  const guard = setTimeout(finish, 7000);
  Promise.resolve(sendChainRef).catch(() => {}).then(() => {
    clearTimeout(guard);
    finish();
  });
};
var sendChainRef = null;
if (process.argv.includes("--selftest")) {
  await (async () => {
    const i = process.argv.indexOf("--selftest");
    const file = process.argv.slice(i + 1).find((a) => !a.startsWith("--"));
    if (!file) {
      console.error("usage: --selftest <file> [--no-judge]");
      return exitFlushed(2);
    }
    let src = "";
    try {
      src = readFileSync2(file, "utf8");
    } catch (e) {
      console.error(`ENOENT: ${file} \u2014 ${e.message}`);
      return exitFlushed(2);
    }
    let r;
    try {
      r = await pipeline(file, src, !process.argv.includes("--no-judge"));
    } catch (e) {
      console.error(`PIPELINE_FAIL: ${e.message}`);
      return exitFlushed(1);
    }
    console.log(JSON.stringify(r, null, 1));
    if (r.refused) {
      console.error(`REFUSED: ${r.refused}`);
      return exitFlushed(1);
    }
    if (r.tokens.length === 0) {
      console.error("NO TOKENS \u2014 the reflex produced no card");
      return exitFlushed(1);
    }
    console.error(`SELFTEST OK \u2014 ${r.cards.length} card(s), tokens: ${r.tokens.join(", ")}`);
    return exitFlushed(0);
  })();
}
if (process.argv.includes("--stdio")) {
  receipt2(`INIT pid=${process.pid}`);
  const docs = new Map;
  const inFlight = new Set;
  const dirty = new Set;
  let buf = Buffer.alloc(0);
  let sendChain = Promise.resolve();
  const send = (obj) => {
    const j = JSON.stringify(obj);
    const frame = Buffer.from(`Content-Length: ${Buffer.byteLength(j)}\r
\r
${j}`);
    sendChain = sendChain.then(() => new Promise((resolve) => {
      if (process.stdout.destroyed || process.stdout.writableEnded) {
        log("SEND_DEAD_STREAM: resolving without write");
        resolve();
        return;
      }
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      const to = setTimeout(() => {
        log("SEND_TIMEOUT: stdout did not flush in 5s");
        done();
      }, 5000);
      try {
        process.stdout.write(frame, (err) => {
          if (err)
            log(`SEND_FAIL: ${err.message}`);
          clearTimeout(to);
          done();
        });
      } catch (e) {
        log(`SEND_THROW: ${e.message}`);
        clearTimeout(to);
        done();
      }
    })).catch((e) => {
      log(`SEND_FAIL: ${e.message}`);
    });
    sendChainRef = sendChain;
  };
  const SYSTEM_DENY = /^\/(etc|proc|sys|dev|root|boot|var\/lib|usr\/bin|usr\/sbin)(\/|$)/;
  const ALLOWED_ROOTS = (process.env.PLUTUS_ALLOWED_ROOTS ?? "").split(":").filter(Boolean);
  const fileOf = (uri) => {
    if (!/^file:/i.test(uri))
      throw new Error(`NON_FILE_SCHEME: ${uri.slice(0, 40)}`);
    const m = /^file:\/\/([^/?#]*)([^?#]*)/i.exec(uri);
    if (!m)
      throw new Error(`MALFORMED_FILE_URI: ${uri.slice(0, 60)}`);
    const [, auth, rawPath] = m;
    let p;
    try {
      p = decodeURIComponent(rawPath);
    } catch {
      throw new Error(`BAD_ENCODING: ${uri.slice(0, 60)}`);
    }
    if (auth && auth.toLowerCase() !== "localhost")
      throw new Error(`NON_LOCAL_AUTHORITY: ${uri.slice(0, 60)}`);
    if (/^\/[a-zA-Z]:[\/]/.test(p))
      p = p.slice(1);
    const np = resolve2(p);
    const isAbs = np.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(np);
    if (!isAbs)
      throw new Error(`PATH_NOT_ABSOLUTE: ${np.slice(0, 60)}`);
    let rp = np;
    try {
      rp = realpathSync2(np);
    } catch {}
    if (SYSTEM_DENY.test(rp))
      throw new Error(`PATH_REFUSED: ${rp.slice(0, 60)}`);
    if (ALLOWED_ROOTS.length > 0 && !ALLOWED_ROOTS.some((r) => rp === r || rp.startsWith(r.endsWith("/") ? r : r + "/")))
      throw new Error(`PATH_OUTSIDE_ROOTS: ${rp.slice(0, 60)}`);
    return rp;
  };
  const seq = new Map;
  const pending = new Map;
  const analyze = async (uri) => {
    if (inFlight.has(uri)) {
      dirty.add(uri);
      receipt2(`SKIP_INFLIGHT ${uri} (dirty \u2192 rerun)`);
      return;
    }
    inFlight.add(uri);
    dirty.delete(uri);
    try {
      let file;
      try {
        file = fileOf(uri);
      } catch (e) {
        log(`ANALYZE_FAIL ${uri}: ${e.message} \u2014 keeping last-good diagnostics`);
        return;
      }
      const src = docs.get(uri) ?? "";
      const my = (seq.get(uri) ?? 0) + 1;
      seq.set(uri, my);
      try {
        let r;
        try {
          r = await pipeline(file, src, true);
        } catch (e) {
          log(`PIPELINE_DEGRADED ${file}: ${e.message} \u2014 falling back to lexical cards`);
          try {
            r = await pipeline(file, src, false);
          } catch (e2) {
            log(`PIPELINE_DOUBLE_FAULT ${file}: ${e2.message} \u2014 keeping last-good diagnostics`);
            return;
          }
        }
        if (seq.get(uri) !== my) {
          log(`STALE_DROP ${file} (seq ${my} < ${seq.get(uri)})`);
          return;
        }
        const hunkLine = src.split(`
`).findIndex((l) => l.trim().length > 0);
        const diags = r.cards.map((c) => toDiagnostic(c, src, hunkLine < 0 ? 0 : hunkLine));
        send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: diags } });
      } catch (e) {
        log(`ANALYZE_FAIL ${file}: ${e.message} \u2014 keeping last-good diagnostics`);
      }
    } finally {
      inFlight.delete(uri);
      if (dirty.has(uri)) {
        dirty.delete(uri);
        scheduleAnalyze(uri);
      }
    }
  };
  const scheduleAnalyze = (uri) => {
    const prev = pending.get(uri);
    if (prev)
      clearTimeout(prev);
    pending.set(uri, setTimeout(() => {
      pending.delete(uri);
      analyze(uri).catch((e) => log(`ANALYZE_FAIL ${uri}: ${e.message}`));
    }, 250));
  };
  process.stdin.on("close", () => exitFlushed(0));
  process.stdin.on("end", () => exitFlushed(0));
  process.stdin.on("error", (e) => {
    log(`STDIN_ERROR: ${e.message}`);
    exitFlushed(1);
  });
  const MAX_STDIN = 32 * 1024 * 1024;
  process.stdin.on("data", (c) => {
    if (buf.length + c.length > MAX_STDIN + 65536) {
      log(`STDIN_OVERSIZE_RESET: ${buf.length + c.length} bytes \u2014 resetting`);
      buf = Buffer.alloc(0);
      return;
    }
    buf = Buffer.concat([buf, c]);
    if (buf.indexOf(`\r
\r
`) < 0 && buf.length > MAX_STDIN) {
      log(`STDIN_OVERSIZE_RESET: ${buf.length} headerless bytes \u2014 resetting`);
      buf = Buffer.alloc(0);
      return;
    }
    for (;; ) {
      const head = buf.indexOf(`\r
\r
`);
      if (head < 0)
        break;
      if (head > 4096) {
        log(`FRAME_SKIP: header ${head} bytes exceeds 4KB \u2014 skipping`);
        buf = buf.subarray(head + 4);
        continue;
      }
      const m = /Content-Length:\s*(\d+)/i.exec(buf.subarray(0, head).toString("ascii"));
      if (!m) {
        log("FRAME_SKIP: header without Content-Length");
        buf = buf.subarray(head + 4);
        continue;
      }
      const n = parseInt(m[1], 10);
      if (!Number.isFinite(n) || n < 0 || n > MAX_STDIN) {
        log(`FRAME_SKIP: malformed length at offset 0 (header=${m[1].slice(0, 24)})`);
        buf = buf.subarray(head + 4);
        continue;
      }
      if (buf.length < head + 4 + n) {
        if (buf.length > MAX_STDIN) {
          log(`STDIN_OVERSIZE_RESET: ${buf.length} bytes with no complete frame \u2014 resetting`);
          buf = Buffer.alloc(0);
        }
        break;
      }
      const body = buf.subarray(head + 4, head + 4 + n).toString("utf8");
      const rest = buf.subarray(head + 4 + n);
      buf = rest.length > 0 ? Buffer.from(rest) : Buffer.alloc(0);
      let msg = null;
      try {
        msg = JSON.parse(body);
      } catch (e) {
        log(`FRAME_PARSE_FAIL: ${e.message}`);
        continue;
      }
      if (!msg)
        continue;
      receipt2(`FRAME ${msg.method ?? "?"}`);
      if (msg.method === "initialize") {
        send({
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            capabilities: {
              textDocumentSync: { openClose: true, change: 1 },
              diagnosticProvider: { interFileDependencies: false, workspaceDiagnostics: false }
            },
            serverInfo: { name: "plutus-lsp", version: "0.1.0" }
          }
        });
      } else if (msg.method === "initialized") {} else if (msg.method === "shutdown") {
        send({ jsonrpc: "2.0", id: msg.id, result: null });
      } else if (msg.method === "exit") {
        exitFlushed(0);
        return;
      } else if (msg.method === "textDocument/didOpen" || msg.method === "textDocument/didChange") {
        const p = msg.params;
        const rawUri = p?.textDocument?.uri;
        const uri = typeof rawUri === "string" ? rawUri : "";
        if (rawUri !== undefined && uri === "") {
          log(`PARAMS_REJECTED: uri is ${typeof rawUri}`);
          continue;
        }
        const rawCC = p?.contentChanges;
        if (rawCC !== undefined && !Array.isArray(rawCC)) {
          log(`PARAMS_REJECTED ${uri}: contentChanges is ${typeof rawCC}`);
          continue;
        }
        const cc = Array.isArray(rawCC) ? rawCC : [];
        for (const frag of cc) {
          if (frag && typeof frag === "object" && !("text" in frag)) {
            log(`INCREMENTAL_REJECTED ${uri}: range edits unsupported (change:1 full-sync only)`);
          }
        }
        const full = cc.filter((f) => f && typeof f === "object" && f.range === undefined);
        const ranged = cc.filter((f) => f && typeof f === "object" && f.range !== undefined);
        if (ranged.length > 0)
          log(`INCREMENTAL_APPLIED ${uri}: ${ranged.length} ranged fragment(s)`);
        const lastText = full[full.length - 1]?.text;
        const openText = p?.textDocument?.text;
        const good = (x) => typeof x === "string";
        if (full.length > 0 && !good(lastText))
          log(`PARAMS_REJECTED ${uri}: fragment text is ${typeof lastText}`);
        if (full.length === 0 && openText !== undefined && !good(openText))
          log(`PARAMS_REJECTED ${uri}: open text is ${typeof openText}`);
        let text;
        if (full.length > 0 && good(lastText))
          text = lastText;
        else if (good(openText))
          text = openText;
        else {
          text = docs.get(uri) ?? "";
          for (const f of ranged)
            text = applyRange(text, f);
        }
        const MAX_DOC_BYTES = 1 * 1024 * 1024;
        if (uri) {
          const stored = text.length > MAX_DOC_BYTES ? (receipt2(`DOC_TRUNCATED ${uri}: ${text.length} -> ${MAX_DOC_BYTES} bytes`), text.slice(0, MAX_DOC_BYTES)) : text;
          docs.set(uri, stored);
          scheduleAnalyze(uri);
        }
      } else if (msg.method === "textDocument/diagnostic") {
        const p = msg.params;
        const rawUri = p?.textDocument?.uri;
        const uri = typeof rawUri === "string" ? rawUri : "";
        if (!uri) {
          send({ jsonrpc: "2.0", id: msg.id, error: { code: -32602, message: "InvalidParams: textDocument.uri required" } });
        } else {
          (async () => {
            if (inFlight.has(uri)) {
              send({ jsonrpc: "2.0", id: msg.id, error: { code: -32802, message: "analysis in progress" } });
              return;
            }
            inFlight.add(uri);
            try {
              const file = fileOf(uri);
              const src = docs.get(uri) ?? "";
              const r = await pipeline(file, src, true);
              send({ jsonrpc: "2.0", id: msg.id, result: { kind: "full", items: r.cards.map((c) => toDiagnostic(c, src, 0)) } });
            } catch (e) {
              const msgText = String(e?.message ?? e).slice(0, 200);
              send({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: `InternalError: ${msgText}` } });
            } finally {
              inFlight.delete(uri);
            }
          })();
        }
      } else if (msg.method === "textDocument/didSave") {
        const p = msg.params;
        const rawUri = p?.textDocument?.uri;
        const uri = typeof rawUri === "string" ? rawUri : "";
        if (uri)
          scheduleAnalyze(uri);
      } else if (msg.method === "workspace/didChangeConfiguration") {
        receipt2("CONFIG_IGNORED workspace/didChangeConfiguration (env-only config)");
      } else if (msg.method === "$/cancelRequest") {
        const id = msg.params?.id;
        receipt2(`CANCEL_REQUEST id=${String(id)} (best-effort; analyzes are short)`);
      } else if (msg.method === "textDocument/didClose") {
        const p = msg.params;
        const rawUri2 = p?.textDocument?.uri;
        const uri = typeof rawUri2 === "string" ? rawUri2 : "";
        if (uri === "")
          continue;
        docs.delete(uri);
        seq.delete(uri);
        inFlight.delete(uri);
        dirty.delete(uri);
        const pend = pending.get(uri);
        if (pend) {
          clearTimeout(pend);
          pending.delete(uri);
        }
        send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: [] } });
      } else if (msg.id !== undefined && msg.method) {
        send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `MethodNotFound: ${msg.method}` } });
      }
    }
  });
  log(`plutus-lsp stdio up; tokens=${PLUTUS_LSP_TOKENS.length}`);
}
export {
  pipeline
};
