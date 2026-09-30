#!/usr/bin/env bun
/**
 * plutus-lsp · the stdio JSON-RPC server (W4)
 *
 * OMP's native LSP runtime spawns this and drives it on every open/change — the REFLEX.
 * It INFORMS (publishDiagnostics); it NEVER blocks (the polarity law).
 *
 *   bun scripts/plutus-lsp.ts --stdio            # the server (the LSP runtime spawns this)
 *   bun scripts/plutus-lsp.ts --selftest <file>  # the gate: >=1 token -> exit 0
 *
 * The receipt: every frame + PUBLISH n=K appends to /tmp/plutus-lsp-receipts.log (the render proof).
 */

import { readFileSync, appendFileSync } from "node:fs";
import { loadStore, lawsForHunk, declarationsIn, callersOf } from "../src/plutus-lsp/store.ts";
import { chain, verdict, buildState, observableQuestion } from "../src/plutus-lsp/judge.ts";
import { fileCards, toDiagnostic, PLUTUS_LSP_TOKENS } from "../src/plutus-lsp/cards.ts";

// FIX F4 (audit-alpha): the receipt MUST be durable — /tmp is ephemeral and the spawn
// proof was irreproducible. Default: the repo's forensic/ dir (an env override allowed).
const RECEIPT = process.env.PLUTUS_LSP_RECEIPT ?? "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP/forensic/lsp-receipts.log";
// FIX F11 (audit-bravo): a bare catch{} swallows the failure. The receipt failure goes to stderr.
const receipt = (line: string) => { try { appendFileSync(RECEIPT, `${new Date().toISOString()} ${clean(line)}\n`); } catch (e) { try { process.stderr.write(`RECEIPT_WRITE_FAIL: ${(e as Error).message}\n`); } catch {} } };

const LOG = process.env.PLUTUS_LSP_LOG ?? "/home/leviathan/JARVIS_WORKSPACE/Shared_Workspace/PLUTUS-COMMON-SENSE-LSP/forensic/lsp-stderr.log";
// FIX (audit:22): strip CR/LF so a crafted URI cannot forge a receipt line
const clean = (m: string) => m.replace(/[\r\n]+/g, " ");
const log = (m: string) => { try { appendFileSync(LOG, `${new Date().toISOString()} ${clean(m)}\n`); } catch {} };

// ── THE PIPELINE (one file → the cards) ──────────────────────────────────────
export interface PipelineResult { tokens: string[]; cards: import("../src/plutus-lsp/cards.ts").FactCard[]; refused: string | null; vector: Record<string, number> }

export async function pipeline(file: string, source: string, useJudge = true): Promise<PipelineResult> {
  let store;
  try {
    store = loadStore(file);
  } catch (e) {
    const msg = (e as Error).message;
    receipt(`REFUSE ${msg.split(":")[0]} file=${file}`);
    return { tokens: [], cards: [], refused: msg, vector: {} };
  }
  const decls = declarationsIn(source);
  const hunk = source.slice(0, 1200);
  // FIX F1+F2 (audit-bravo): the PRODUCTION pipeline is now EXACTLY the CALIBRATED pipeline —
  // lawsForHunk (ranked top-3) + observableQuestion + ALL 7 nodes. The calibration's numbers
  // now describe the thing that ships.
  const all = lawsForHunk(store, file, decls, hunk, 3);
  if (all.length === 0) { receipt(`NO-LAW file=${file} decls=${decls.length}`); return { tokens: [], cards: [], refused: null, vector: {} }; }

  let v = null;
  let vector: Record<string, number> = {};
  if (useJudge) {
    // FIX F1: ALL 7 nodes — the DECIDING set [P4,P5,P6] is now actually answered.
    // FIX F2: the observable question (the calibration's configuration).
    const res = await chain(buildState(file, all, hunk), ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], 6000, observableQuestion(all));
    v = verdict(res);
    vector = Object.fromEntries(Object.entries(res.answers).map(([k, n]) => [k, Number(n)]));
  }
  const cards = fileCards(file, all, v, callersOf(store, file));   // FIX F4: the callers read
  const tokens = [...new Set(cards.map((c) => c.source))];
  receipt(`PUBLISH n=${cards.length} tokens=${tokens.join(",")} file=${file}${v ? ` verdict=${v.kind}` : ""}`);
  return { tokens, cards, refused: null, vector };
}

// ── THE SELFTEST (the W4 gate) ───────────────────────────────────────────────
if (process.argv.includes("--selftest")) {
  const i = process.argv.indexOf("--selftest");
  const file = process.argv[i + 1];
  // FIX (audit:59): the first NON-FLAG arg after --selftest is the file
  if (!file || file.startsWith("--")) { console.error("usage: --selftest <file>"); process.exit(2); }
  let src = "";
  try { src = readFileSync(file, "utf8"); } catch (e) { console.error(`ENOENT: ${file} — ${(e as Error).message}`); process.exit(2); }
  let r: PipelineResult;
  try { r = await pipeline(file, src, !process.argv.includes("--no-judge")); }
  catch (e) { console.error(`PIPELINE_FAIL: ${(e as Error).message}`); process.exit(1); }   // FIX (audit:62)
  console.log(JSON.stringify(r, null, 1));
  if (r.refused) { console.error(`REFUSED: ${r.refused}`); process.exit(1); }
  if (r.tokens.length === 0) { console.error("NO TOKENS — the reflex produced no card"); process.exit(1); }
  console.error(`SELFTEST OK — ${r.cards.length} card(s), tokens: ${r.tokens.join(", ")}`);
  process.exit(0);
}

// ── THE STDIO SERVER ─────────────────────────────────────────────────────────
if (process.argv.includes("--stdio")) {
  receipt(`INIT pid=${process.pid}`);
  const docs = new Map<string, string>();
  let buf = Buffer.alloc(0);

  const send = (obj: unknown) => {
    const j = JSON.stringify(obj);
    process.stdout.write(`Content-Length: ${Buffer.byteLength(j)}\r\n\r\n${j}`);
  };

  /** FIX (audit:81): a real file-URL decode (spaces/unicode), not a naive strip. */
  const fileOf = (uri: string): string => {
    try { return decodeURIComponent(uri.replace(/^file:\/\/(localhost)?/, "")); }
    catch { return uri.replace(/^file:\/\//, ""); }
  };

  const seq = new Map<string, number>();   // FIX (audit:133): the per-uri sequence guard
  const analyze = async (uri: string) => {
    const file = fileOf(uri);
    const src = docs.get(uri) ?? "";
    const my = (seq.get(uri) ?? 0) + 1; seq.set(uri, my);
    try {   // FIX (audit:80): no unhandled rejection — a failure publishes [] and logs the reason
      const r = await pipeline(file, src, true);
      if (seq.get(uri) !== my) { log(`STALE_DROP ${file} (seq ${my} < ${seq.get(uri)})`); return; }   // FIX (audit:133)
      const diags = r.refused ? [] : r.cards.map((c) => toDiagnostic(c, c.range));
      send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: diags } });
    } catch (e) {
      log(`ANALYZE_FAIL ${file}: ${(e as Error).message}`);
      send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: [] } });
    }
  };

  process.stdin.on("data", (c: Buffer) => {
    buf = Buffer.concat([buf, c]);
    for (;;) {
      const head = buf.indexOf("\r\n\r\n");
      if (head < 0) break;
      const m = /Content-Length:\s*(\d+)/i.exec(buf.subarray(0, head).toString("ascii"));
      if (!m) { buf = buf.subarray(head + 4); continue; }
      const n = parseInt(m[1], 10);
      // FIX (audit:106): a malformed header or an unbounded length must not mis-slice / OOM
      if (!Number.isFinite(n) || n < 0 || n > 32 * 1024 * 1024) { buf = buf.subarray(head + 4); continue; }
      if (buf.length < head + 4 + n) break;
      const body = buf.subarray(head + 4, head + 4 + n).toString("utf8");
      buf = buf.subarray(head + 4 + n);
      let msg: { id?: number; method?: string; params?: Record<string, unknown> } | null = null;
      try { msg = JSON.parse(body); } catch (e) { log(`FRAME_PARSE_FAIL: ${(e as Error).message}`); continue; }   // FIX F11
      if (!msg) continue;
      receipt(`FRAME ${msg.method ?? "?"}`);
      if (msg.method === "initialize") {
        // FIX (the container's stuck-handshake): a VALID initialize result. An empty
        // diagnosticProvider is malformed (the spec requires interFileDependencies +
        // workspaceDiagnostics) and the client rejects the handshake -> the server stays
        // in the "starting" state forever.
        send({
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            capabilities: {
              textDocumentSync: { openClose: true, change: 1 },
              diagnosticProvider: { interFileDependencies: false, workspaceDiagnostics: false },
            },
            serverInfo: { name: "plutus-lsp", version: "0.1.0" },
          },
        });
      } else if (msg.method === "initialized") {
        // no-op
      } else if (msg.method === "shutdown") {
        send({ jsonrpc: "2.0", id: msg.id, result: null });
      } else if (msg.method === "exit") {
        process.exit(0);
      } else if (msg.method === "textDocument/didOpen" || msg.method === "textDocument/didChange") {
        // FIX (audit scripts/plutus-lsp.ts:122 CRITICAL): didChange carries contentChanges[].text,
        // NOT textDocument.text (which only didOpen has). Applying a full-sync change here.
        const p = msg.params as {
          textDocument?: { uri?: string; text?: string };
          contentChanges?: Array<{ text?: string }>;
        } | undefined;
        const uri = p?.textDocument?.uri ?? "";
        // FIX (audit scripts:132): the LAST change is authoritative in a batched full-sync
        const cc = p?.contentChanges ?? [];
        const text = cc.length > 0 ? (cc[cc.length - 1]?.text ?? docs.get(uri) ?? "") : (p?.textDocument?.text ?? docs.get(uri) ?? "");
        if (uri) { docs.set(uri, text); void analyze(uri).catch((e) => log(`ANALYZE_FAIL ${uri}: ${(e as Error).message}`)); }
      } else if (msg.method === "textDocument/didClose") {
        const p = msg.params as { textDocument?: { uri?: string } } | undefined;
        const uri = p?.textDocument?.uri ?? "";
        docs.delete(uri);
        send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: [] } });
      }
    }
  });
  log(`plutus-lsp stdio up; tokens=${PLUTUS_LSP_TOKENS.length}`);
}
