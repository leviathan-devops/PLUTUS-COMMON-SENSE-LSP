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
import { loadStore, lawsFor, lawsForFile, declarationsIn, PLUTUS_NO_STORE } from "../src/plutus-lsp/store.ts";
import { chain, verdict, buildState } from "../src/plutus-lsp/judge.ts";
import { fileCards, toDiagnostic, PLUTUS_LSP_TOKENS } from "../src/plutus-lsp/cards.ts";

const RECEIPT = process.env.PLUTUS_LSP_RECEIPT ?? "/tmp/plutus-lsp-receipts.log";
const receipt = (line: string) => { try { appendFileSync(RECEIPT, `${new Date().toISOString()} ${line}\n`); } catch {} };

const log = (m: string) => { try { appendFileSync("/tmp/plutus-lsp-stderr.log", `${new Date().toISOString()} ${m}\n`); } catch {} };

// ── THE PIPELINE (one file → the cards) ──────────────────────────────────────
export interface PipelineResult { tokens: string[]; cards: number; refused: string | null; vector: Record<string, number> }

export async function pipeline(file: string, source: string, useJudge = true): Promise<PipelineResult> {
  let store;
  try {
    store = loadStore(file);
  } catch (e) {
    const msg = (e as Error).message;
    receipt(`REFUSE ${msg.split(":")[0]} file=${file}`);
    return { tokens: [], cards: 0, refused: msg, vector: {} };
  }
  const decls = declarationsIn(source);
  const all = lawsForFile(store, file, decls);
  if (all.length === 0) { receipt(`NO-LAW file=${file} decls=${decls.length}`); return { tokens: [], cards: 0, refused: null, vector: {} }; }

  let v = null;
  let vector: Record<string, number> = {};
  if (useJudge) {
    const hunk = source.slice(0, 1200);
    const res = await chain(buildState(file, all, hunk), ["P1", "P2", "P3", "P4", "P7"]);
    v = verdict(res);
    vector = Object.fromEntries(Object.entries(res.answers).map(([k, n]) => [k, Number(n)]));
  }
  const cards = fileCards(file, all, v);
  const tokens = [...new Set(cards.map((c) => c.source))];
  receipt(`PUBLISH n=${cards.length} tokens=${tokens.join(",")} file=${file}${v ? ` verdict=${v.kind}` : ""}`);
  return { tokens, cards: cards.length, refused: null, vector };
}

// ── THE SELFTEST (the W4 gate) ───────────────────────────────────────────────
if (process.argv.includes("--selftest")) {
  const i = process.argv.indexOf("--selftest");
  const file = process.argv[i + 1];
  if (!file) { console.error("usage: --selftest <file>"); process.exit(2); }
  let src = "";
  try { src = readFileSync(file, "utf8"); } catch { src = ""; }
  const r = await pipeline(file, src, !process.argv.includes("--no-judge"));
  console.log(JSON.stringify(r, null, 1));
  if (r.refused) { console.error(`REFUSED: ${r.refused}`); process.exit(1); }
  if (r.tokens.length === 0) { console.error("NO TOKENS — the reflex produced no card"); process.exit(1); }
  console.error(`SELFTEST OK — ${r.cards} card(s), tokens: ${r.tokens.join(", ")}`);
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

  const analyze = async (uri: string) => {
    const file = uri.replace(/^file:\/\//, "");
    const src = docs.get(uri) ?? "";
    const r = await pipeline(file, src, true);
    const diags = r.refused
      ? []
      : (r.tokens.length > 0 ? buildDiags(file, src, r) : []);
    send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: diags } });
  };

  const buildDiags = (file: string, src: string, r: PipelineResult) => {
    try {
      const store = loadStore(file);
      const all = lawsForFile(store, file, declarationsIn(src));
      const cards = fileCards(file, all, null);
      return cards.map(toDiagnostic);
    } catch { return []; }
  };

  process.stdin.on("data", (c: Buffer) => {
    buf = Buffer.concat([buf, c]);
    for (;;) {
      const head = buf.indexOf("\r\n\r\n");
      if (head < 0) break;
      const m = /Content-Length:\s*(\d+)/i.exec(buf.subarray(0, head).toString("ascii"));
      if (!m) { buf = buf.subarray(head + 4); continue; }
      const n = parseInt(m[1], 10);
      if (buf.length < head + 4 + n) break;
      const body = buf.subarray(head + 4, head + 4 + n).toString("utf8");
      buf = buf.subarray(head + 4 + n);
      let msg: { id?: number; method?: string; params?: Record<string, unknown> } | null = null;
      try { msg = JSON.parse(body); } catch { continue; }
      if (!msg) continue;
      receipt(`FRAME ${msg.method ?? "?"}`);
      if (msg.method === "initialize") {
        send({ jsonrpc: "2.0", id: msg.id, result: { capabilities: { textDocumentSync: 1, diagnosticProvider: {} }, serverInfo: { name: "plutus-lsp", version: "0.1.0" } } });
      } else if (msg.method === "initialized") {
        // no-op
      } else if (msg.method === "shutdown") {
        send({ jsonrpc: "2.0", id: msg.id, result: null });
      } else if (msg.method === "exit") {
        process.exit(0);
      } else if (msg.method === "textDocument/didOpen" || msg.method === "textDocument/didChange") {
        const p = msg.params as { textDocument?: { uri?: string; text?: string } } | undefined;
        const uri = p?.textDocument?.uri ?? "";
        const text = p?.textDocument?.text ?? "";
        if (uri) { docs.set(uri, text); void analyze(uri); }
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
