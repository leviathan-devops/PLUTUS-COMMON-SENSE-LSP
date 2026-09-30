#!/usr/bin/env bun
// @bun

// scripts/plutus-lsp.ts
import { readFileSync as readFileSync2, appendFileSync } from "fs";

// src/plutus-lsp/store.ts
import { readFileSync, existsSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
import { connect } from "net";
import { homedir } from "os";
var ROOT_MARKERS = [".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT", "tsconfig.json"];
var STRONG_MARKERS = [".arsumbris", ".omp/graph-intelligence", "MASTER_CONTEXT"];
var PLUTUS_NO_STORE = "PLUTUS_NO_STORE";
var PLUTUS_NO_ROOT = "PLUTUS_NO_ROOT";
var JEVK5_DOWN = "JEVK5_DOWN";
var TIERS = ["IMMUTABLE", "EVOLVING", "SUPERSEDED"];
function validTier(v) {
  const t = String(v ?? "").toUpperCase();
  return TIERS.includes(t) ? t : "IMMUTABLE";
}
function resolveRoot(startFile) {
  let dir = dirname(resolve(startFile));
  for (let i = 0;i < 12; i++) {
    for (const m of STRONG_MARKERS)
      if (existsSync(join(dir, m)))
        return dir;
    if (i < 3) {
      for (const m of ROOT_MARKERS)
        if (existsSync(join(dir, m)))
          return dir;
    }
    const parent = dirname(dir);
    if (parent === dir)
      break;
    dir = parent;
  }
  throw new Error(`${PLUTUS_NO_ROOT}: no root marker (${ROOT_MARKERS.join(" | ")}) above ${startFile}`);
}
var KNOWN_L1_PATHS = [
  "/home/leviathan/.omp/wt/plutus-main-66dfa4c/PLUTUS/agent/.omp/graph-intelligence/layers/semantica/kg.json",
  "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS/MASTER_CONTEXT/.omp/graph-intelligence/layers/semantica/kg.json"
];
function l1PathFor(root) {
  const env = process.env.PLUTUS_L1_PATH;
  if (env)
    return env;
  const local = join(root, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
  if (existsSync(local))
    return local;
  for (const known of KNOWN_L1_PATHS)
    if (existsSync(known))
      return known;
  return local;
}
function loadStore(startFile) {
  const root = resolveRoot(startFile);
  const l1Path = l1PathFor(root);
  if (!existsSync(l1Path)) {
    throw new Error(`${PLUTUS_NO_STORE}: ${l1Path} absent (root=${root})`);
  }
  let raw = "";
  try {
    const st = statSync(l1Path);
    if (st.size === 0)
      throw new Error("0 bytes");
    raw = readFileSync(l1Path, "utf8");
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
  const entities = (Array.isArray(doc.entities) ? doc.entities : []).filter((e) => typeof e === "object" && e !== null);
  const relationships = (Array.isArray(doc.relationships) ? doc.relationships : []).filter((r) => typeof r === "object" && r !== null);
  const laws = entities.filter((e) => String(e.type ?? "") === "law").map((e) => ({
    id: String(e.id ?? ""),
    name: String(e.name ?? e.id ?? ""),
    statement: String(e.statement ?? ""),
    tier: validTier(e.tier),
    anchor: String(e.anchor ?? ""),
    source: String(e.source ?? "")
  }));
  return { root, l1Path, entities, relationships, laws, total: laws.length };
}
function declarationsIn(source) {
  const out = new Set;
  const re = /export\s+(?:default\s+)?(?:async\s+)?(?:declare\s+)?(?:abstract\s+)?(?:function\*?|const|let|var|class|interface|type|enum|namespace)\s+([A-Za-z_$][\w$]*)|export\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    if (m[1])
      out.add(m[1]);
    else if (m[2])
      for (const part of m[2].split(",")) {
        const n = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (n && /^[A-Za-z_$][\w$]*$/.test(n))
          out.add(n);
      }
  }
  return [...out];
}
async function readL2(socketPath, timeoutMs = 800) {
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
        sock.destroy();
        res(r);
      }
    };
    const t = setTimeout(() => finish({ ok: false, reason: `L2_TIMEOUT (${timeoutMs}ms)` }), timeoutMs);
    sock.on("connect", () => {
      const req = Buffer.from(JSON.stringify({ read: "overview" }));
      const len = Buffer.alloc(4);
      len.writeUInt32BE(req.length);
      sock.write(Buffer.concat([len, req]));
    });
    const chunks = [];
    sock.on("data", (c) => {
      chunks.push(c);
      const b = Buffer.concat(chunks);
      if (b.length > 32 * 1024 * 1024) {
        clearTimeout(t);
        finish({ ok: false, reason: `L2_OVERSIZE: ${b.length} bytes` });
        return;
      }
      if (b.length < 4)
        return;
      const n = b.readUInt32BE(0);
      if (n > 16 * 1024 * 1024) {
        clearTimeout(t);
        finish({ ok: false, reason: `L2_FRAME_TOO_LARGE: ${n} bytes` });
        return;
      }
      if (b.length < 4 + n)
        return;
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
      clearTimeout(t);
      finish({ ok: false, reason: `L2_ERROR: ${e.message}` });
    });
    sock.on("close", () => {
      clearTimeout(t);
      finish({ ok: false, reason: "L2_CLOSED: the peer closed before a full frame" });
    });
    sock.on("end", () => {
      clearTimeout(t);
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
var STOPWORDS = Object.freeze(new Set([
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
]));
function tokensOf(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^A-Za-z0-9]+/).map((t) => t.toLowerCase()).filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}
function lawsForFile(store, filePath, decls) {
  const base = (filePath.split(/[\\/]/).pop() ?? "").replace(/\.[A-Za-z0-9.]+$/, "");
  const needles = new Set([...tokensOf(base), ...decls.flatMap(tokensOf)]);
  const seen = new Set;
  const out = [];
  for (const n of needles) {
    for (const l of store.laws) {
      if (seen.has(l.id))
        continue;
      const hay = `${l.name} ${l.statement} ${l.id}`.toLowerCase();
      const re = new RegExp(`(^|[^a-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
      if (re.test(hay)) {
        seen.add(l.id);
        out.push(l);
      }
    }
  }
  return out;
}
function lawsForHunk(store, filePath, decls, hunk, topK = 3) {
  const candidates = lawsForFile(store, filePath, decls);
  if (candidates.length <= topK)
    return candidates;
  const ht = new Set(tokensOf(hunk));
  const scored = candidates.map((l) => {
    const lt = tokensOf(`${l.name} ${l.statement}`);
    const overlap = lt.filter((t) => ht.has(t)).length;
    const nums = (hunk.match(/\d+(?:\.\d+)?/g) ?? []).filter((n) => l.statement.includes(n)).length;
    return { l, score: overlap * 2 + nums * 3 };
  });
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, topK).map((x) => x.l);
}
function callersOf(store, filePath) {
  const base = filePath.split(/[\\/]/).pop() ?? "";
  if (!base)
    return [];
  const hits = store.relationships.filter((r) => {
    const t = String(r.target ?? "");
    return r.type === "imports" && (t === base || t.endsWith(`/${base}`) || t.includes(base));
  });
  return [...new Set(hits.map((r) => String(r.source ?? "")))].slice(0, 20);
}

// src/plutus-lsp/judge.ts
var JEVK5_URL_DEFAULT = "http://127.0.0.1:8090/v1/systemone";
var JEVK5_HEALTH_DEFAULT = "http://127.0.0.1:8090/health";
var jevk5Url = () => process.env.JEVK5_URL ?? JEVK5_URL_DEFAULT;
var jevk5Health = () => process.env.JEVK5_HEALTH ?? JEVK5_HEALTH_DEFAULT;
var CHAIN = {
  P1: { id: "P1", name: "SCOPE", q: "Is the target file inside the PLUTUS tree (a Plutus/Trident module or canon doc)?" },
  P2: { id: "P2", name: "LAW", q: "Does the supplied evidence show a governing law for this symbol?" },
  P3: { id: "P3", name: "TIER", q: "Is the governing law marked IMMUTABLE (a never-change canon law)?" },
  P4: { id: "P4", name: "VIOLATE", q: "Does the proposed change CONTRADICT the law's statement?" },
  P5: { id: "P5", name: "CONTRACT", q: "Does the change OVERRIDE a prior engine's data architecture (violating E1->E2->E3)?" },
  P6: { id: "P6", name: "ANTIPATTERN", q: "Does the change match a KNOWN bug or anti-pattern recorded in the canon?" },
  P7: { id: "P7", name: "DRIFT", q: "Does the change contradict a prior recorded ruling or decision?" }
};
async function health(timeoutMs = 1500) {
  try {
    const ctl = new AbortController;
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(jevk5Health(), { signal: ctl.signal });
      if (!r.ok)
        return { ok: false, reason: `${JEVK5_DOWN}: health HTTP ${r.status}` };
      const j = await r.json();
      return j.ok ? { ok: true } : { ok: false, reason: `${JEVK5_DOWN}: health says ${JSON.stringify(j)}` };
    } finally {
      clearTimeout(t);
    }
  } catch (e) {
    return { ok: false, reason: `${JEVK5_DOWN}: ${e.message}` };
  }
}
async function chain(state, nodes = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], timeoutMs = 6000, p4Override) {
  const h = await health();
  if (!h.ok)
    return { ok: false, answers: {}, reason: h.reason, requests: 0 };
  const questions = {};
  for (const id of nodes)
    questions[id] = { type: "noul", instructions: id === "P4" && p4Override ? p4Override : CHAIN[id].q };
  try {
    if (nodes.length === 0)
      return { ok: false, answers: {}, reason: "JUDGE_NO_NODES", requests: 0 };
    const ctl = new AbortController;
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const started = Date.now();
    try {
      const r = await fetch(jevk5Url(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state, questions }),
        signal: ctl.signal
      });
      if (!r.ok)
        return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: HTTP ${r.status}`, requests: 1 };
      const j = await r.json();
      if (j === null || typeof j !== "object")
        return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: malformed body`, requests: 1 };
      const answers = {};
      for (const id of nodes) {
        const v = j.answers?.[id]?.noul;
        if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1)
          answers[id] = v;
      }
      const answered = Object.keys(answers).length;
      if (answered !== nodes.length) {
        return { ok: false, answers, reason: `JUDGE_ANSWER_COUNT: ${answered}/${nodes.length}`, requests: 1, latencyMs: j.latency_ms ?? Date.now() - started };
      }
      return { ok: true, answers, requests: 1, latencyMs: j.latency_ms ?? Date.now() - started };
    } finally {
      clearTimeout(t);
    }
  } catch (e) {
    return { ok: false, answers: {}, reason: `${JEVK5_DOWN}: ${e instanceof Error ? e.message : String(e)}`, requests: 1 };
  }
}
function buildState(target, laws, hunk) {
  const ordered = [...laws].sort((a, b) => (a.tier === "IMMUTABLE" ? 0 : 1) - (b.tier === "IMMUTABLE" ? 0 : 1));
  const kept = ordered.slice(0, 6);
  const lawText = kept.map((l) => `[${l.tier}] ${l.name}: ${l.statement} (anchor ${l.anchor})`).join(`
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
var THROW_T = bar(process.env.PLUTUS_THROW_T, 0.85);
var DEMAND_T = bar(process.env.PLUTUS_DEMAND_T, 0.3);
var DECIDING = ["P4", "P5", "P6"];
function verdict(v) {
  if (!v.ok)
    return { kind: "JUDGE_DOWN", weakest: null, vector: {}, reason: v.reason };
  const a = v.answers;
  if (a.P2 !== undefined && a.P2 < DEMAND_T)
    return { kind: "INCONCLUSIVE", weakest: "P2", vector: a };
  const answered = DECIDING.filter((id) => a[id] !== undefined);
  if (answered.length === 0)
    return { kind: "INCONCLUSIVE", weakest: null, vector: a };
  const wrong = answered.map((id) => a[id]);
  const minWrong = Math.min(...wrong);
  const weakest = answered[wrong.indexOf(minWrong)] ?? null;
  const p7 = a.P7;
  const immutable = a.P3 !== undefined && a.P3 >= DEMAND_T;
  const throwBar = immutable ? THROW_T * 0.9 : THROW_T;
  if (minWrong >= throwBar)
    return { kind: "VIOLATION", weakest, vector: a };
  if (p7 !== undefined && p7 >= THROW_T)
    return { kind: "DRIFT", weakest: "P7", vector: a };
  if (minWrong >= DEMAND_T)
    return { kind: "SUSPECT", weakest, vector: a };
  return { kind: "LAW", weakest: null, vector: a };
}
var OBSERVABLE = [
  {
    match: /stop-?loss|sl cap|150 ?pip|sl_?cap/i,
    q: "Does the evidence state a stop-loss value GREATER than 150 pips? (150 is the cap; read the number)"
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
  let best = null;
  for (const l of laws) {
    const hay = `${l.name} ${l.statement}`;
    for (const t of OBSERVABLE) {
      if (t.match.test(hay)) {
        const score = (t.q.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => hay.toLowerCase().includes(w)).length;
        if (!best || score > best.score)
          best = { q: t.q, score };
      }
    }
  }
  return best?.q ?? CHAIN.P4.q;
}
var RELEVANCE_T = bar(process.env.PLUTUS_RELEVANCE_T ?? 0.3);
async function relevancePass(laws, filePath, hunk, timeoutMs = 6000) {
  if (laws.length === 0)
    return { ok: true, scored: [], requests: 0 };
  const h = await health();
  if (!h.ok)
    return { ok: false, scored: [], reason: h.reason, requests: 0 };
  const subject = filePath.split("/").pop() ?? filePath;
  const lines = laws.map((l, i) => `Candidate ${i + 1} [${l.tier}] ${l.name}: ${l.statement.slice(0, 160)}`).join(`
`);
  const state = [
    `FILE BEING WRITTEN: ${subject}`,
    `DECLARATIONS IN THE HUNK:`,
    hunk.slice(0, 1200) || "(none)",
    `CANDIDATE LAWS:`,
    lines
  ].join(`
`);
  const questions = {};
  laws.forEach((_, i) => {
    questions[`R${i + 1}`] = {
      type: "noul",
      instructions: `Candidate ${i + 1}: does THIS law govern the code being written in ${subject}? ` + `A law governs only if the code's subject matter is the same thing the law is about ` + `(the same quantity, rule, or domain). Answer no if the law's subject is unrelated ` + `to what this file's hunk actually touches.`
    };
  });
  try {
    const ctl = new AbortController;
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const started = Date.now();
    try {
      const r = await fetch(jevk5Url(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state, questions }),
        signal: ctl.signal
      });
      if (!r.ok)
        return { ok: false, scored: [], reason: `${JEVK5_DOWN}: HTTP ${r.status}`, requests: 1 };
      const j = await r.json();
      if (!j || typeof j !== "object")
        return { ok: false, scored: [], reason: `${JEVK5_DOWN}: malformed body`, requests: 1 };
      const scored = [];
      for (const l of laws) {
        const key = `R${laws.indexOf(l) + 1}`;
        const v = j.answers?.[key]?.noul;
        scored.push({ index: laws.indexOf(l), lawId: l.id, p: typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : -1 });
      }
      return { ok: true, scored, requests: 1, latencyMs: j.latency_ms ?? Date.now() - started };
    } finally {
      clearTimeout(t);
    }
  } catch (e) {
    return { ok: false, scored: [], reason: `${JEVK5_DOWN}: ${e instanceof Error ? e.message : String(e)}`, requests: 1 };
  }
}
function partitionByRelevance(laws, rows) {
  const relevant = [];
  const rejected = [];
  laws.forEach((l, i) => {
    const row = rows.find((r) => r.index === i);
    const p = row ? row.p : -1;
    if (p >= RELEVANCE_T)
      relevant.push(l);
    else
      rejected.push({ law: l, p });
  });
  return { relevant, rejected };
}

// src/plutus-lsp/cards.ts
var PLUTUS_LSP_TOKENS = [
  "plutus/law",
  "plutus/violation",
  "plutus/suspect",
  "plutus/tier",
  "plutus/callers",
  "plutus/drift",
  "plutus/stale"
];
var SEVERITY = { Error: 1, Warning: 2, Information: 3, Hint: 4 };
function lawCard(target, laws) {
  if (laws.length === 0)
    return null;
  return {
    shape: "LAW",
    title: `${laws.length} canon law(s) govern this file`,
    rows: laws.slice(0, 5).map((l) => `[${l.tier}] ${l.name}: ${l.statement.slice(0, 96)} \u2014 ${l.anchor}`),
    severity: SEVERITY.Information,
    source: "plutus/law",
    total: laws.length
  };
}
function verdictCard(target, v, laws) {
  const pct = (n) => typeof n === "number" ? n.toFixed(3) : "n/a";
  if (v.kind !== "LAW" && v.kind !== "JUDGE_DOWN" && v.kind !== "INCONCLUSIVE" && laws.length === 0)
    return null;
  if (v.kind === "JUDGE_DOWN") {
    return {
      shape: "STALE",
      title: `the judge is DOWN \u2014 the canon could not be consulted`,
      rows: [v.reason ?? "JEVK5_DOWN"],
      severity: SEVERITY.Warning,
      source: "plutus/stale",
      total: 1
    };
  }
  if (v.kind === "INCONCLUSIVE") {
    return {
      shape: "SUSPECT",
      title: `INCONCLUSIVE \u2014 the judge could not reach a verdict (weakest: ${v.weakest ?? "none"})`,
      rows: [
        `the unanswered/undecided clause: ${v.weakest ?? "(no deciding clause answered)"}`,
        `vector: ${Object.entries(v.vector).map(([k, n]) => `${k}=${Number(n).toFixed(3)}`).join(" ") || "(empty)"}`
      ],
      severity: SEVERITY.Hint,
      source: "plutus/suspect",
      total: 1
    };
  }
  if (v.kind === "LAW")
    return null;
  if (v.kind !== "VIOLATION" && v.kind !== "DRIFT" && v.kind !== "SUSPECT" && v.kind !== "INCONCLUSIVE")
    return null;
  const law = v.weakest && v.weakest !== "P7" ? laws.find((l) => l.tier === "IMMUTABLE") ?? laws[0] : laws[0] ?? laws.find((l) => l.tier === "IMMUTABLE");
  if (!law)
    return null;
  if (v.kind === "VIOLATION") {
    return {
      shape: "VIOLATION",
      title: `VIOLATION \u2014 the change contradicts ${law?.name ?? "the canon"} (P4=${pct(v.vector.P4)})`,
      rows: [
        `law: [${law?.tier}] ${law?.name}: ${law?.statement.slice(0, 90)}`,
        `anchor: ${law?.anchor}`,
        `vector: P4=${pct(v.vector.P4)} P5=${pct(v.vector.P5)} P6=${pct(v.vector.P6)} P7=${pct(v.vector.P7)}`
      ],
      severity: SEVERITY.Error,
      source: "plutus/violation",
      total: 1
    };
  }
  if (v.kind === "DRIFT") {
    return {
      shape: "DRIFT",
      title: `DRIFT \u2014 the change contradicts a prior decision (P7=${pct(v.vector.P7)})`,
      rows: [`vector: P7=${pct(v.vector.P7)}`, `law: ${law?.name ?? "n/a"} \u2014 ${law?.anchor ?? ""}`],
      severity: SEVERITY.Warning,
      source: "plutus/drift",
      total: 1
    };
  }
  return {
    shape: "SUSPECT",
    title: `SUSPECT \u2014 the law may be breached (P4=${pct(v.vector.P4)}); evidence required`,
    rows: [`law: [${law?.tier}] ${law?.name}`, `anchor: ${law?.anchor}`, `vector: P4=${pct(v.vector.P4)}`],
    severity: SEVERITY.Warning,
    source: "plutus/suspect",
    total: 1
  };
}
function tierCard(laws) {
  const imm = laws.filter((l) => l.tier === "IMMUTABLE");
  if (imm.length === 0)
    return null;
  return {
    shape: "TIER",
    title: `${imm.length} IMMUTABLE law(s) \u2014 never change without a recorded ruling`,
    rows: imm.slice(0, 4).map((l) => `${l.name} \u2014 ${l.anchor}`),
    severity: SEVERITY.Information,
    source: "plutus/tier",
    total: imm.length
  };
}
function staleCard(reason) {
  return { shape: "STALE", title: `the graph is stale or absent`, rows: [reason], severity: SEVERITY.Warning, source: "plutus/stale", total: 1 };
}
function toDiagnostic(card, range) {
  const line = range?.line ?? 0;
  return {
    range: { start: { line, character: range?.character ?? 0 }, end: { line, character: (range?.character ?? 0) + 1 } },
    severity: card.severity,
    source: card.source,
    message: `${card.title}
${card.rows.join(`
`)}`
  };
}
function callersCard(target, callers) {
  if (callers.length === 0)
    return null;
  return {
    shape: "CALLERS",
    title: `${callers.length} file(s) import this one \u2014 a change here reaches them`,
    rows: callers.slice(0, 6),
    severity: SEVERITY.Information,
    source: "plutus/callers",
    total: callers.length
  };
}
function fileCards(target, laws, v, callers = []) {
  const out = [];
  const lc = lawCard(target, laws);
  if (lc)
    out.push(lc);
  const tc = tierCard(laws);
  if (tc)
    out.push(tc);
  const cc = callersCard(target, callers);
  if (cc)
    out.push(cc);
  if (v) {
    const vc = verdictCard(target, v, laws);
    if (vc)
      out.push(vc);
  }
  return out;
}

// scripts/plutus-lsp.ts
var RECEIPT = process.env.PLUTUS_LSP_RECEIPT ?? "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP/forensic/lsp-receipts.log";
var receipt = (line) => {
  try {
    appendFileSync(RECEIPT, `${new Date().toISOString()} ${clean(line)}
`);
  } catch (e) {
    try {
      process.stderr.write(`RECEIPT_WRITE_FAIL: ${e.message}
`);
    } catch {}
  }
};
var LOG = process.env.PLUTUS_LSP_LOG ?? "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP/forensic/lsp-stderr.log";
var clean = (m) => m.replace(/[\r\n]+/g, " ");
var log = (m) => {
  try {
    appendFileSync(LOG, `${new Date().toISOString()} ${clean(m)}
`);
  } catch {}
};
async function pipeline(file, source, useJudge = true) {
  let store;
  try {
    store = loadStore(file);
  } catch (e) {
    const msg = e.message;
    receipt(`REFUSE ${msg.split(":")[0]} file=${file}`);
    const sc = staleCard(msg);
    return { tokens: [sc.source], cards: [sc], refused: msg, vector: {} };
  }
  const decls = declarationsIn(source);
  const hunk = source.slice(0, 1200);
  const candidates = lawsForHunk(store, file, decls, hunk, 12);
  try {
    const l2 = await readL2(l2SocketFor(store.root), 400);
    receipt(`L2 ${l2.ok ? `nodes=${l2.nodeCount} edges=${l2.edgeCount}` : l2.reason}`);
  } catch {}
  if (candidates.length === 0) {
    receipt(`NO-LAW file=${file} decls=${decls.length}`);
    return { tokens: [], cards: [], refused: null, vector: {} };
  }
  let v = null;
  let vector = {};
  let all = candidates;
  let relevance = [];
  if (useJudge && candidates.length > 0) {
    const rel = await relevancePass(candidates, file, hunk);
    if (rel.ok) {
      const part = partitionByRelevance(candidates, rel.scored);
      all = part.relevant;
      relevance = rel.scored.map((r) => ({ lawId: r.lawId, p: r.p }));
      receipt(`RELEVANCE ok=${rel.scored.filter((r) => r.p >= RELEVANCE_T).length}/${rel.scored.length} ` + `${part.rejected.map((x) => `${x.law.name}@${x.p.toFixed(2)}`).join(",") || "(none rejected)"}`);
      if (all.length === 0) {
        receipt("RELEVANCE none \u2014 no card emitted");
        return { tokens: [], cards: [], refused: null, vector: {}, relevance };
      }
    } else {
      all = candidates.slice(0, 3);
      receipt(`RELEVANCE degraded=${rel.reason}`);
    }
  } else if (candidates.length > 0) {
    all = candidates.slice(0, 3);
  }
  if (useJudge) {
    const res = await chain(buildState(file, all, hunk), ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], 6000, observableQuestion(all));
    v = verdict(res);
    vector = Object.fromEntries(Object.entries(res.answers).map(([k, n]) => [k, Number(n)]));
  }
  const cards = fileCards(file, all, v, callersOf(store, file));
  const tokens = [...new Set(cards.map((c) => c.source))];
  receipt(`PUBLISH n=${cards.length} tokens=${tokens.join(",")} file=${file}${v ? ` verdict=${v.kind}` : ""}`);
  return { tokens, cards, refused: null, vector, relevance };
}
if (process.argv.includes("--selftest")) {
  const i = process.argv.indexOf("--selftest");
  const file = process.argv[i + 1];
  if (!file || file.startsWith("--")) {
    console.error("usage: --selftest <file>");
    process.exit(2);
  }
  let src = "";
  try {
    src = readFileSync2(file, "utf8");
  } catch (e) {
    console.error(`ENOENT: ${file} \u2014 ${e.message}`);
    process.exit(2);
  }
  let r;
  try {
    r = await pipeline(file, src, !process.argv.includes("--no-judge"));
  } catch (e) {
    console.error(`PIPELINE_FAIL: ${e.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(r, null, 1));
  if (r.refused) {
    console.error(`REFUSED: ${r.refused}`);
    process.exit(1);
  }
  if (r.tokens.length === 0) {
    console.error("NO TOKENS \u2014 the reflex produced no card");
    process.exit(1);
  }
  console.error(`SELFTEST OK \u2014 ${r.cards.length} card(s), tokens: ${r.tokens.join(", ")}`);
  process.exit(0);
}
if (process.argv.includes("--stdio")) {
  receipt(`INIT pid=${process.pid}`);
  const docs = new Map;
  let buf = Buffer.alloc(0);
  const send = (obj) => {
    const j = JSON.stringify(obj);
    process.stdout.write(`Content-Length: ${Buffer.byteLength(j)}\r
\r
${j}`);
  };
  const fileOf = (uri) => {
    try {
      return decodeURIComponent(uri.replace(/^file:\/\/(localhost)?/, ""));
    } catch {
      return uri.replace(/^file:\/\//, "");
    }
  };
  const seq = new Map;
  const analyze = async (uri) => {
    const file = fileOf(uri);
    const src = docs.get(uri) ?? "";
    const my = (seq.get(uri) ?? 0) + 1;
    seq.set(uri, my);
    try {
      const r = await pipeline(file, src, true);
      if (seq.get(uri) !== my) {
        log(`STALE_DROP ${file} (seq ${my} < ${seq.get(uri)})`);
        return;
      }
      const diags = r.refused ? [] : r.cards.map((c) => toDiagnostic(c, c.range));
      send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: diags } });
    } catch (e) {
      log(`ANALYZE_FAIL ${file}: ${e.message}`);
      send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: [] } });
    }
  };
  process.stdin.on("data", (c) => {
    buf = Buffer.concat([buf, c]);
    for (;; ) {
      const head = buf.indexOf(`\r
\r
`);
      if (head < 0)
        break;
      const m = /Content-Length:\s*(\d+)/i.exec(buf.subarray(0, head).toString("ascii"));
      if (!m) {
        buf = buf.subarray(head + 4);
        continue;
      }
      const n = parseInt(m[1], 10);
      if (!Number.isFinite(n) || n < 0 || n > 32 * 1024 * 1024) {
        buf = buf.subarray(head + 4);
        continue;
      }
      if (buf.length < head + 4 + n)
        break;
      const body = buf.subarray(head + 4, head + 4 + n).toString("utf8");
      buf = buf.subarray(head + 4 + n);
      let msg = null;
      try {
        msg = JSON.parse(body);
      } catch (e) {
        log(`FRAME_PARSE_FAIL: ${e.message}`);
        continue;
      }
      if (!msg)
        continue;
      receipt(`FRAME ${msg.method ?? "?"}`);
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
        process.exit(0);
      } else if (msg.method === "textDocument/didOpen" || msg.method === "textDocument/didChange") {
        const p = msg.params;
        const uri = p?.textDocument?.uri ?? "";
        const cc = p?.contentChanges ?? [];
        const text = cc.length > 0 ? cc[cc.length - 1]?.text ?? docs.get(uri) ?? "" : p?.textDocument?.text ?? docs.get(uri) ?? "";
        if (uri) {
          docs.set(uri, text);
          analyze(uri).catch((e) => log(`ANALYZE_FAIL ${uri}: ${e.message}`));
        }
      } else if (msg.method === "textDocument/didClose") {
        const p = msg.params;
        const uri = p?.textDocument?.uri ?? "";
        docs.delete(uri);
        send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: [] } });
      }
    }
  });
  log(`plutus-lsp stdio up; tokens=${PLUTUS_LSP_TOKENS.length}`);
}
export {
  pipeline
};
