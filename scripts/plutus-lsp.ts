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
import { loadStore, lawsForFile, declarationsIn } from "../src/plutus-lsp/store.ts";   // FIX (audit:15) dead imports removed
import { chain, verdict, buildState } from "../src/plutus-lsp/judge.ts";
import { fileCards, toDiagnostic, PLUTUS_LSP_TOKENS } from "../src/plutus-lsp/cards.ts";

const RECEIPT = process.env.PLUTUS_LSP_RECEIPT ?? "/tmp/plutus-lsp-receipts.log";
const receipt = (line: string) => { try { appendFileSync(RECEIPT, `${new Date().toISOString()} ${line}\n`); } catch {} };

const log = (m: string) => { try { appendFileSync("/tmp/plutus-lsp-stderr.log", `${new Date().toISOString()} ${m}\n`); } catch {} };

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
  const all = lawsForFile(store, file, decls);
  if (all.length === 0) { receipt(`NO-LAW file=${file} decls=${decls.length}`); return { tokens: [], cards: [], refused: null, vector: {} }; }

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
  const r = await pipeline(file, src, !process.argv.includes("--no-judge"));
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

  const analyze = async (uri: string) => {
    const file = fileOf(uri);
    const src = docs.get(uri) ?? "";
    try {   // FIX (audit:80): no unhandled rejection — a failure publishes [] and logs the reason
      const r = await pipeline(file, src, true);
      // FIX (audit:90): the VERDICT is threaded — the published diagnostics carry the judged card
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
        // FIX (audit scripts/plutus-lsp.ts:122 CRITICAL): didChange carries contentChanges[].text,
        // NOT textDocument.text (which only didOpen has). Applying a full-sync change here.
        const p = msg.params as {
          textDocument?: { uri?: string; text?: string };
          contentChanges?: Array<{ text?: string }>;
        } | undefined;
        const uri = p?.textDocument?.uri ?? "";
        const text = p?.contentChanges?.[0]?.text ?? p?.textDocument?.text ?? docs.get(uri) ?? "";
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
