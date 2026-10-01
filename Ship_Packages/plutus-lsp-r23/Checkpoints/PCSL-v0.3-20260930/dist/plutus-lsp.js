#!/usr/bin/env bun
// @bun

// scripts/plutus-lsp.ts
import { readFileSync as readFileSync2, appendFileSync } from "fs";

// src/plutus-lsp/store.ts
import { readFileSync, existsSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
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
function l1PathFor(root) {
  const env = process.env.PLUTUS_L1_PATH;
  if (env)
    return env;
  return join(root, ".omp", "graph-intelligence", "layers", "semantica", "kg.json");
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
var THROW_T = 0.85;
var DEMAND_T = 0.5;
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
  const p7 = a.P7 ?? 0;
  const immutable = (a.P3 ?? 0) >= DEMAND_T;
  const throwBar = immutable ? THROW_T * 0.9 : THROW_T;
  if (minWrong >= throwBar)
    return { kind: "VIOLATION", weakest, vector: a };
  if (p7 >= THROW_T)
    return { kind: "DRIFT", weakest: "P7", vector: a };
  if (minWrong >= DEMAND_T)
    return { kind: "SUSPECT", weakest, vector: a };
  return { kind: "LAW", weakest: null, vector: a };
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
    severity: 3,
    source: "plutus/law",
    total: laws.length
  };
}
function verdictCard(target, v, laws) {
  const pct = (n) => typeof n === "number" ? n.toFixed(3) : "n/a";
  if (v.kind !== "LAW" && v.kind !== "JUDGE_DOWN" && laws.length === 0)
    return null;
  if (v.kind === "JUDGE_DOWN") {
    return {
      shape: "STALE",
      title: `the judge is DOWN \u2014 the canon could not be consulted`,
      rows: [v.reason ?? "JEVK5_DOWN"],
      severity: SEVERITY.Warning,
      source: "plutus/stale",
      total: 0
    };
  }
  if (v.kind === "LAW")
    return null;
  if (v.kind !== "VIOLATION" && v.kind !== "DRIFT" && v.kind !== "SUSPECT")
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
      severity: 1,
      source: "plutus/violation",
      total: 1
    };
  }
  if (v.kind === "DRIFT") {
    return {
      shape: "DRIFT",
      title: `DRIFT \u2014 the change contradicts a prior decision (P7=${pct(v.vector.P7)})`,
      rows: [`vector: P7=${pct(v.vector.P7)}`, `law: ${law?.name ?? "n/a"} \u2014 ${law?.anchor ?? ""}`],
      severity: 2,
      source: "plutus/drift",
      total: 1
    };
  }
  return {
    shape: "SUSPECT",
    title: `SUSPECT \u2014 the law may be breached (P4=${pct(v.vector.P4)}); evidence required`,
    rows: [`law: [${law?.tier}] ${law?.name}`, `anchor: ${law?.anchor}`, `vector: P4=${pct(v.vector.P4)}`],
    severity: 2,
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
    severity: 3,
    source: "plutus/tier",
    total: imm.length
  };
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
function fileCards(target, laws, v) {
  const out = [];
  const lc = lawCard(target, laws);
  if (lc)
    out.push(lc);
  const tc = tierCard(laws);
  if (tc)
    out.push(tc);
  if (v) {
    const vc = verdictCard(target, v, laws);
    if (vc)
      out.push(vc);
  }
  return out;
}

// scripts/plutus-lsp.ts
var RECEIPT = process.env.PLUTUS_LSP_RECEIPT ?? "/tmp/plutus-lsp-receipts.log";
var receipt = (line) => {
  try {
    appendFileSync(RECEIPT, `${new Date().toISOString()} ${clean(line)}
`);
  } catch {}
};
var LOG = process.env.PLUTUS_LSP_LOG ?? "/tmp/plutus-lsp-stderr.log";
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
    return { tokens: [], cards: [], refused: msg, vector: {} };
  }
  const decls = declarationsIn(source);
  const all = lawsForFile(store, file, decls);
  if (all.length === 0) {
    receipt(`NO-LAW file=${file} decls=${decls.length}`);
    return { tokens: [], cards: [], refused: null, vector: {} };
  }
  let v = null;
  let vector = {};
  if (useJudge) {
    const hunk = source.slice(0, 1200);
    const res = await chain(buildState(file, all, hunk), ["P1", "P2", "P3", "P4", "P7"]);
    v = verdict(res);
    vector = Object.fromEntries(Object.entries(res.answers).map(([k, n]) => [k, Number(n)]));
  }
  const cards = fileCards(file, all, v);
  const tokens = [...new Set(cards.map((c) => c.source))];
  receipt(`PUBLISH n=${cards.length} tokens=${tokens.join(",")} file=${file}${v ? ` verdict=${v.kind}` : ""}`);
  return { tokens, cards, refused: null, vector };
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
      } catch {
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
