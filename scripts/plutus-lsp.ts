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
 * The receipt: every frame + PUBLISH n=K appends to forensic/lsp-receipts.log (the render proof),
 * overridable via PLUTUS_LSP_RECEIPT.
 */

import { readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadStore, lawsForHunk, declarationsIn, callersOf, readL2, l2SocketFor } from "../src/plutus-lsp/store.ts";
import { chain, verdict, buildState, observableQuestion, relevancePass, partitionByRelevance, relevanceT, setReceipt as setJudgeReceipt } from "../src/plutus-lsp/judge.ts";
import { fileCards, staleCard, PLUTUS_LSP_TOKENS, type FactCard } from "../src/plutus-lsp/cards.ts";

// FIX (audit: portable paths) — the receipt/log default to the repo's own forensic/ dir
// resolved from THIS file (never a single-user absolute path), with mkdirSync(recursive)
// at startup so a missing dir is created, not a silent write hole. Env overrides kept.
// FIX (audit: fileURLToPath) — import.meta.url stays percent-encoded, so a repo path with
// spaces/unicode (%20) produced a wrong forensic dir.
const HERE = dirname(fileURLToPath(import.meta.url));
const FORENSIC = `${HERE}/../forensic`;
try { mkdirSync(FORENSIC, { recursive: true }); } catch { /* best effort; receipt() reports failures */ }
const RECEIPT = process.env.PLUTUS_LSP_RECEIPT ?? `${FORENSIC}/lsp-receipts.log`;
// FIX F11 (audit-bravo): a bare catch{} swallows the failure. The receipt failure goes to stderr.
/** ★ A card → an LSP Diagnostic. Mirrors gi-lsp.ts: `code` = the card shape (so a
 *  consumer filters on it), the title on line 1, the evidence rows indented beneath.
 *  line is the 0-based line of the violation evidence when the caller can supply it
 *  (the card carries the law anchor, not a position); callers that know the position
 *  pass it, otherwise the file header. */
function toDiagnostic(card: FactCard, src: string, line = 0): Record<string, unknown> {
  const lines = src.split("\n");
  const at = Math.max(0, Math.min(line, lines.length - 1));
  const col = lines[at]?.length ?? 0;
  return {
    range: { start: { line: at, character: 0 }, end: { line: at, character: col } },
    severity: card.severity,
    source: card.source,
    code: card.shape,
    message: `${card.title}\n${card.rows.map((r) => "  " + r).join("\n")}`,
  };
}

// FIX (audit round-12: receipts are BUFFERED, never sync per line) — the old appendFileSync
// on every FRAME/PUBLISH/RELEVANCE/L2 line blocked the event loop under hot typing (6s judged
// chains + 250ms debounce behind one sync write each). Lines buffer; a 500ms timer flushes
// async. A failed flush falls back to stderr, never silent.
let receiptBuf: string[] = [];
const receiptFlush = () => {
  if (receiptBuf.length === 0) return;
  const batch = receiptBuf.join("");
  receiptBuf = [];
  try { appendFileSync(RECEIPT, batch); }
  catch (e) { try { process.stderr.write(`RECEIPT_WRITE_FAIL: ${(e as Error).message}\n`); } catch {} }
};
setInterval(receiptFlush, 500).unref?.();
const receipt = (line: string) => { receiptBuf.push(`${new Date().toISOString()} ${clean(line)}\n`); if (receiptBuf.length > 200) receiptFlush(); };
setJudgeReceipt((line: string) => receipt(line));   // FIX (audit: loud library) — the judge's
// CHAIN/PARTITION notes land in the same receipt file as the pipeline's own lines.

const LOG = process.env.PLUTUS_LSP_LOG ?? `${FORENSIC}/lsp-stderr.log`;
// FIX (audit:22): strip CR/LF so a crafted URI cannot forge a receipt line
const clean = (m: string) => m.replace(/[\r\n]+/g, " ");
// FIX (audit: log mirrors failures to stderr like receipt() does) — a full/ro forensic dir
// must not lose all observability silently.
const log = (m: string) => { try { appendFileSync(LOG, `${new Date().toISOString()} ${clean(m)}\n`); } catch (e) { try { process.stderr.write(`LOG_WRITE_FAIL: ${(e as Error).message}\n`); } catch {} } };

// ── THE PIPELINE (one file → the cards) ──────────────────────────────────────
export interface PipelineResult { tokens: string[]; cards: import("../src/plutus-lsp/cards.ts").FactCard[]; refused: string | null; vector: Record<string, number>; relevance?: Array<{ lawId: string; p: number }> }

export async function pipeline(file: string, source: string, useJudge = true): Promise<PipelineResult> {
  let store;
  try {
    store = loadStore(file);
  } catch (e) {
    const msg = (e as Error).message;
    receipt(`REFUSE ${msg.split(":")[0]} file=${file}`);
    // FIX F5 (audit-bravo: staleCard had zero callers): a refused store emits the STALE card
    // so the agent SEES the graph problem instead of silence.
    const sc = staleCard(msg);
    return { tokens: [sc.source], cards: [sc], refused: msg, vector: {} };
  }
  const decls = declarationsIn(source);
  const hunk = source.slice(0, 1200);
  // FIX F1+F2 (audit-bravo): the PRODUCTION pipeline is now EXACTLY the CALIBRATED pipeline —
  // lawsForHunk (ranked top-3) + observableQuestion + ALL 7 nodes. The calibration's numbers
  // now describe the thing that ships.
  // L1 · THE DETECTOR — a WIDE candidate net, NO relevance opinion (zero intelligence, free)
  const candidates = lawsForHunk(store, file, decls, hunk, 12);
  // FIX (audit: L2 is fire-and-forget) — the old code awaited the probe inline (up to 400ms)
  // on every debounced keystroke, delaying publishDiagnostics despite the "never blocking"
  // contract. The probe now races the pipeline: its receipt lands when it lands.
  // FIX (audit round-11: the sync throw is CAUGHT) — l2SocketFor(root) was evaluated
  // inside the readL2() ARGUMENTS, so a sync throw (bad root → resolve/homedir throws)
  // escaped the .then(_, onRejected) handler. The socket path resolves inside try first.
  try {
    const sock = l2SocketFor(store.root);
    void readL2(sock, 400).then(
      (l2) => receipt(`L2 ${l2.ok ? `nodes=${l2.nodeCount} edges=${l2.edgeCount}` : l2.reason}`),
      (e) => receipt(`L2_THROW: ${(e as Error).message}`),
    );
  } catch (e) { receipt(`L2_THROW: ${(e as Error).message}`); }
  if (candidates.length === 0) { receipt(`NO-LAW file=${file} decls=${decls.length}`); return { tokens: [], cards: [], refused: null, vector: {} }; }

  let v = null;
  let vector: Record<string, number> = {};

  // L2 · THE RELEVANCE PASS — THE JEV KERNEL DECIDES WHAT GOVERNS (before any violation talk)
  let all = candidates;
  let relevance: Array<{ lawId: string; p: number }> = [];
  let judgedLaws: import("../src/plutus-lsp/cards.ts").JudgedLaw[] = [];
  if (useJudge && candidates.length > 0) {
    const rel = await relevancePass(candidates, file, hunk);
    if (rel.ok) {
      // FIX (audit: the cap is RECEIPTED) — judged/total/dropped ride the receipt so a
      // truncated tail is visible in forensics, not just in the return type.
      receipt(`RELEVANCE judged=${rel.judged}/${rel.total} dropped=${rel.dropped}`);
      const part = partitionByRelevance(candidates, rel.scored);
      all = part.relevant;
      relevance = rel.scored.map((r) => ({ lawId: r.lawId, p: r.p }));
      // join by lawId (identity), never indexOf on law objects (aliasing + O(n²))
      const byId = new Map(rel.scored.map((r) => [r.lawId, r.p]));
      judgedLaws = part.relevant.map((law) => ({ law, p: byId.get(law.id) ?? -1 }));
      receipt(`RELEVANCE ok=${rel.scored.filter((r) => r.p >= relevanceT()).length}/${rel.scored.length} ` +
        `${part.rejected.map((x) => `${x.law.name}@${x.p.toFixed(2)}`).join(",") || "(none rejected)"}`);
      // the judge's verdict IS the filter: if NOTHING is relevant, emit nothing (no noise)
      if (all.length === 0) { receipt("RELEVANCE none — no card emitted"); return { tokens: [], cards: [], refused: null, vector: {}, relevance }; }
    } else {
      // fail-CLOSED on noise, fail-OPEN on coverage: if the judge is down we do NOT spray the
      // unfiltered net — we keep the lexical top-3 and MARK the degraded mode.
      all = candidates.slice(0, 3);
      judgedLaws = all.map((law) => ({ law, p: -1 }));   // the lexical fallback, marked unread
      receipt(`RELEVANCE degraded=${rel.reason}`);
    }
  } else if (candidates.length > 0) {
    all = candidates.slice(0, 3);   // the --no-judge path (the unit tests): lexical only
    judgedLaws = all.map((law) => ({ law, p: -1 }));
  }

  if (useJudge) {
    // FIX F1: ALL 7 nodes — the DECIDING set [P4,P5,P6] is now actually answered.
    // FIX F2: the observable question (the calibration's configuration).
    const res = await chain(buildState(file, all, hunk), ["P1", "P2", "P3", "P4", "P5", "P6", "P7"], 6000, observableQuestion(all));
    v = verdict(res);
    vector = Object.fromEntries(Object.entries(res.answers).map(([k, n]) => [k, Number(n)]));
  }
  const cards = fileCards(judgedLaws, candidates.length, v, callersOf(store, file), useJudge && relevance.length > 0, file);   // FIX F4: the callers read; the warning names the TARGET file
  const tokens = [...new Set(cards.map((c) => c.source))];
  receipt(`PUBLISH n=${cards.length} tokens=${tokens.join(",")} file=${file}${v ? ` verdict=${v.kind}` : ""}`);
  return { tokens, cards, refused: null, vector, relevance };
}

// FIX (audit round-13: receipts flush on exit) — the buffered writer lost the last ~500ms
// on every process.exit path (selftest 0/1/2, shutdown, stdin close/end/error). Flush first.
// FIX (audit round-14: drain the send chain before exit) — send() serializes on sendChain,
// but the old exitFlushed called process.exit() immediately, dropping the shutdown response
// and the last publishDiagnostics. Flush receipts, then await the chain (bounded), then exit.
const exitFlushed = (code: number): void => {
  try { receiptFlush(); } catch { /* best-effort */ }
  // FIX (audit round-15 CRITICAL: HALT when there is no chain) — the round-14 drain-only
  // version SCHEDULED the exit and returned, so the selftest's failure paths FELL THROUGH
  // (`if (!file) { exitFlushed(2); }` then readFileSync(undefined)). With no send chain (every
  // non-stdio path) the exit is IMMEDIATE and halts. Only the stdio shutdown path (a live
  // chain) drains, and it is the last statement in its handler.
  if (!sendChainRef) { process.exit(code); return; }
  let done = false;
  const finish = () => { if (!done) { done = true; process.exit(code); } };
  const guard = setTimeout(finish, 1500);
  Promise.resolve(sendChainRef).catch(() => {}).then(() => { clearTimeout(guard); finish(); });
};
// the stdio block installs its serialized write chain here so exits can drain it
let sendChainRef: Promise<void> | null = null;
// ── THE SELFTEST (the W4 gate) ───────────────────────────────────────────────
if (process.argv.includes("--selftest")) {
  const i = process.argv.indexOf("--selftest");
  // FIX (audit:59 + flag order) — take the first NON-FLAG arg after --selftest, so
  // `--selftest --no-judge <file>` works the same as `--selftest <file> --no-judge`.
  const file = process.argv.slice(i + 1).find((a) => !a.startsWith("--"));
  if (!file) { console.error("usage: --selftest <file> [--no-judge]"); exitFlushed(2); }
  let src = "";
  try { src = readFileSync(file, "utf8"); } catch (e) { console.error(`ENOENT: ${file} — ${(e as Error).message}`); exitFlushed(2); }
  let r: PipelineResult;
  try { r = await pipeline(file, src, !process.argv.includes("--no-judge")); }
  catch (e) { console.error(`PIPELINE_FAIL: ${(e as Error).message}`); exitFlushed(1); }   // FIX (audit:62)
  console.log(JSON.stringify(r, null, 1));
  if (r.refused) { console.error(`REFUSED: ${r.refused}`); exitFlushed(1); }
  if (r.tokens.length === 0) { console.error("NO TOKENS — the reflex produced no card"); exitFlushed(1); }
  console.error(`SELFTEST OK — ${r.cards.length} card(s), tokens: ${r.tokens.join(", ")}`);
  exitFlushed(0);
}

// ── THE STDIO SERVER ─────────────────────────────────────────────────────────
if (process.argv.includes("--stdio")) {
  receipt(`INIT pid=${process.pid}`);
  const docs = new Map<string, string>();
  let buf = Buffer.alloc(0);

  // FIX (audit: send backpressure + errors) — an unchecked stdout.write can interleave frames
  // under concurrency or die silently on EPIPE. The queue serializes writes; a write failure
  // is logged, never silent.
  let sendChain: Promise<void> = Promise.resolve();
  const send = (obj: unknown) => {
    const j = JSON.stringify(obj);
    const frame = Buffer.from(`Content-Length: ${Buffer.byteLength(j)}\r\n\r\n${j}`);
    // FIX (audit: no double-resolve) — the write callback fires with err on failure, so
    // resolve EXACTLY once: on callback success, or on drain after a false return.
    // FIX (audit: send timeout + EPIPE) — if the callback never fires (destroyed stream,
    // swallowed EPIPE), the chain must not stall forever: a 5s timeout resolves AND the
    // stream is checked alive first. A dead stream resolves immediately, never queues.
    // FIX (audit: no dangling listeners) — the write callback is the ONLY resolver. The
    // previous code ALSO attached once('drain')/once('error') on the fast path, which lingered
    // past MaxListeners and fired stale done() on unrelated later events. Backpressure is
    // handled by the serialized chain itself (one frame in flight); the 5s timeout bounds it.
    sendChain = sendChain.then(() => new Promise<void>((resolve) => {
      if (process.stdout.destroyed || process.stdout.writableEnded) { log("SEND_DEAD_STREAM: resolving without write"); resolve(); return; }
      let settled = false;
      const done = () => { if (!settled) { settled = true; resolve(); } };
      const to = setTimeout(() => { log("SEND_TIMEOUT: stdout did not flush in 5s"); done(); }, 5000);
      try {
        process.stdout.write(frame, (err?: Error | null) => { if (err) log(`SEND_FAIL: ${err.message}`); clearTimeout(to); done(); });
      } catch (e) { log(`SEND_THROW: ${(e as Error).message}`); clearTimeout(to); done(); }
    })).catch((e) => { log(`SEND_FAIL: ${(e as Error).message}`); });
    sendChainRef = sendChain;   // round-14: exits drain the LIVE chain before process.exit
  };

  /** FIX (audit: decode LAST, UNC preserved, non-file refused) — strip the scheme, then
   *  split query/fragment OFF THE ENCODED text (a literal %3F/%23 in a filename must not
   *  decode-then-strip), preserve a UNC authority (file://host/share), normalize a Windows
   *  drive, and decode only the path. Non-file schemes throw LOUDLY.
   */
  // FIX (audit round-15: system paths refused) — the LSP client is the editor (trusted), but
  // a misbehaving client must not probe the host. System dirs are refused outright; a
  // PLUTUS_ALLOWED_ROOTS allowlist (colon-separated) confines further when set.
  const SYSTEM_DENY = /^\/(etc|proc|sys|dev|root|boot|var\/lib|usr\/bin|usr\/sbin)(\/|$)/;
  const ALLOWED_ROOTS = (process.env.PLUTUS_ALLOWED_ROOTS ?? "").split(":").filter(Boolean);
  const fileOf = (uri: string): string => {
    if (!/^file:/i.test(uri)) throw new Error(`NON_FILE_SCHEME: ${uri.slice(0, 40)}`);
    // FIX (audit: UNC + decode order) — split scheme/authority/path/query/fragment on the RAW
    // (still-encoded) text FIRST, so a literal %3F/%23 in a filename is never corrupted by
    // decode-then-strip. UNC authorities (file://host/share) are preserved as //host/share.
    const m = /^file:\/\/([^/?#]*)([^?#]*)/i.exec(uri);
    if (!m) throw new Error(`MALFORMED_FILE_URI: ${uri.slice(0, 60)}`);
    const [, auth, rawPath] = m;
    let p: string;
    try { p = decodeURIComponent(rawPath); }
    catch { throw new Error(`BAD_ENCODING: ${uri.slice(0, 60)}`); }
    // FIX (audit round-14: UNC refused) — the server reads LOCAL files; a `//host/share` path
    // resolves outside the workspace and probes the filesystem. Non-localhost authority is a
    // NON_FILE_SCHEME-class refusal, never a path handed to loadStore.
    if (auth && auth.toLowerCase() !== "localhost") throw new Error(`NON_LOCAL_AUTHORITY: ${uri.slice(0, 60)}`);
    if (/^\/[a-zA-Z]:[\/]/.test(p)) return p.slice(1);                      // /c:/x -> c:/x
    if (SYSTEM_DENY.test(p)) throw new Error(`PATH_REFUSED: ${p.slice(0, 60)}`);
    if (ALLOWED_ROOTS.length > 0 && !ALLOWED_ROOTS.some((r) => p === r || p.startsWith(r.endsWith("/") ? r : r + "/"))) throw new Error(`PATH_OUTSIDE_ROOTS: ${p.slice(0, 60)}`);
    return p;
  };

  const seq = new Map<string, number>();   // FIX (audit:133): the per-uri sequence guard
  const pending = new Map<string, ReturnType<typeof setTimeout>>();  // FIX (audit: debounce) — one in-flight analyze per uri
  const analyze = async (uri: string) => {
    // FIX (audit round-12: fileOf INSIDE the try) — the old call sat OUTSIDE, so a
    // NON_FILE_SCHEME/MALFORMED/BAD_ENCODING throw escaped the keep-last-good handler and
    // only the outer .catch saw it. The inner path now owns every throw below it.
    let file: string;
    try { file = fileOf(uri); }
    catch (e) { log(`ANALYZE_FAIL ${uri}: ${(e as Error).message} — keeping last-good diagnostics`); return; }
    const src = docs.get(uri) ?? "";
    const my = (seq.get(uri) ?? 0) + 1; seq.set(uri, my);
    try {   // FIX (audit:80): no unhandled rejection — a failure publishes [] and logs the reason
      // FIX (audit: degraded fallback that CANNOT clear) — if the judged pipeline throws,
      // retry LEXICAL; if THAT throws too, KEEP the previous diagnostics (send nothing new)
      // instead of publishing [] which clears the client's last-good state.
      let r;
      try { r = await pipeline(file, src, true); }
      catch (e) {
        log(`PIPELINE_DEGRADED ${file}: ${(e as Error).message} — falling back to lexical cards`);
        try { r = await pipeline(file, src, false); }
        catch (e2) {
          log(`PIPELINE_DOUBLE_FAULT ${file}: ${(e2 as Error).message} — keeping last-good diagnostics`);
          return;   // send nothing: the client keeps its last-good state
        }
      }
      if (seq.get(uri) !== my) { log(`STALE_DROP ${file} (seq ${my} < ${seq.get(uri)})`); return; }   // FIX (audit:133)
      // thread the evidence line: the first non-empty line of the analyzed hunk, so the
      // cards land where the agent is looking instead of stacking at line 0
      const hunkLine = src.split("\n").findIndex((l) => l.trim().length > 0);
      // FIX (audit: a refused store's STALE card must REACH the client) — mapping r.refused
      // to [] discarded the staleCard() the pipeline built, so the agent saw silence while
      // the receipt said REFUSE. The refusal is now the diagnostic.
      // (The old refused-ternary is gone: both sides mapped identically. A refusal's STALE
      // card IS the diagnostic — no special case needed.)
      const diags = r.cards.map((c) => toDiagnostic(c, src, hunkLine < 0 ? 0 : hunkLine));
      send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: diags } });
    } catch (e) {
      // FIX (audit: never clear on transient failure) — publishing [] WIPES the client's
      // last-good diagnostics. A transient error (fileOf throw, toDiagnostic throw, seq
      // throw) sends NOTHING: the client keeps its last-good state. Same as the double-fault path.
      log(`ANALYZE_FAIL ${file}: ${(e as Error).message} — keeping last-good diagnostics`);
    }
  };
  // FIX (audit:218): coalesce rapid edits — schedule, don't fire: a new didChange for the same
  // uri cancels the pending analyze so overlapping judge chains never pile up.
  const scheduleAnalyze = (uri: string) => {
    const prev = pending.get(uri);
    if (prev) clearTimeout(prev);
    pending.set(uri, setTimeout(() => { pending.delete(uri); void analyze(uri).catch((e) => log(`ANALYZE_FAIL ${uri}: ${(e as Error).message}`)); }, 250));
  };

  // FIX (audit: stdin close/end) — if the client dies the server exits instead of hanging forever.
  process.stdin.on("close", () => exitFlushed(0));
  process.stdin.on("end", () => exitFlushed(0));
  process.stdin.on("error", (e) => { log(`STDIN_ERROR: ${(e as Error).message}`); exitFlushed(1); });
  // FIX (audit: MAX_STDIN was READ but never DECLARED — ReferenceError on the oversize
  // path). One cap for the whole stdin buffer, shared by the separator check and the frame check.
  const MAX_STDIN = 32 * 1024 * 1024;
  process.stdin.on("data", (c: Buffer) => {
    // FIX (audit round-12: framing hardened) — the old path concat-per-chunk (O(n^2)), ran the
    // Content-Length regex on an unbounded header, and duplicated the 32MB literal instead of
    // MAX_STDIN. Now: an over-cap pre-check resets LOUDLY before concat; the literal is MAX_STDIN.
    if (buf.length + c.length > MAX_STDIN + 65536) { log(`STDIN_OVERSIZE_RESET: ${buf.length + c.length} bytes — resetting`); buf = Buffer.alloc(0); return; }
    buf = Buffer.concat([buf, c]);
    // FIX (audit round-11: the headerless path is CAPPED too) — the old code only enforced
    // MAX_STDIN after a header was found. A peer streaming bytes with no separator grew buf
    // unbounded (Buffer.concat until OOM). A headerless buffer past the cap is reset LOUDLY.
    if (buf.indexOf("\r\n\r\n") < 0 && buf.length > MAX_STDIN) {
      log(`STDIN_OVERSIZE_RESET: ${buf.length} headerless bytes — resetting`);
      buf = Buffer.alloc(0);
      return;
    }
    for (;;) {
      const head = buf.indexOf("\r\n\r\n");
      if (head < 0) break;
      // FIX (audit round-15: the header scan is CAPPED) — the regex ran on up to 32MB per
      // iteration. A >4KB header block is malformed; skip it (drain past the separator).
      if (head > 4096) { log(`FRAME_SKIP: header ${head} bytes exceeds 4KB — skipping`); buf = buf.subarray(head + 4); continue; }
      const m = /Content-Length:\s*(\d+)/i.exec(buf.subarray(0, head).toString("ascii"));
      if (!m) { log("FRAME_SKIP: header without Content-Length"); buf = buf.subarray(head + 4); continue; }
      const n = parseInt(m[1], 10);
      // FIX (audit:106 + drain-first): a malformed header must not mis-slice / OOM — and the
      // cap must not silently discard a partial valid frame. Complete frames are drained
      // FIRST; only an oversize remainder with no complete frame is reset.
      if (!Number.isFinite(n) || n < 0 || n > MAX_STDIN) {
        log(`FRAME_SKIP: malformed length at offset 0 (header=${m[1].slice(0, 24)})`);
        buf = buf.subarray(head + 4); continue;
      }
      if (buf.length < head + 4 + n) {
        if (buf.length > MAX_STDIN) {
          // oversize remainder with NO complete frame: the client is misbehaving — reset
          // LOUDLY (the receipt records the loss) rather than growing unbounded.
          log(`STDIN_OVERSIZE_RESET: ${buf.length} bytes with no complete frame — resetting`);
          buf = Buffer.alloc(0);
        }
        break;
      }
      const body = buf.subarray(head + 4, head + 4 + n).toString("utf8");
      // FIX (audit round-15: copy the remainder) — a subarray VIEW pins the whole backing
      // ArrayBuffer (up to 32MB) for the server's life even after the logical buffer shrinks.
      // Buffer.from copies, releasing the peak allocation.
      const rest = buf.subarray(head + 4 + n);
      buf = rest.length > 0 ? Buffer.from(rest) : Buffer.alloc(0);
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
        exitFlushed(0);
        return;   // round-15: never fall through the drain into the frame loop
      } else if (msg.method === "textDocument/didOpen" || msg.method === "textDocument/didChange") {
        // FIX (audit scripts/plutus-lsp.ts:122 CRITICAL): didChange carries contentChanges[].text,
        // NOT textDocument.text (which only didOpen has). Applying a full-sync change here.
        const p = msg.params as {
          textDocument?: { uri?: string; text?: string };
          contentChanges?: Array<{ text?: string }>;
        } | undefined;
        // FIX (audit round-14: uri typeof-checked) — a numeric/object uri passed `if(uri)`,
        // corrupted the Map and coerced through fileOf. Non-strings are dropped.
        const rawUri = (p as { textDocument?: { uri?: unknown } } | undefined)?.textDocument?.uri;
        const uri = typeof rawUri === "string" ? rawUri : "";
        if (rawUri !== undefined && uri === "") { log(`PARAMS_REJECTED: uri is ${typeof rawUri}`); continue; }
        // FIX (audit scripts:132 + incremental validation): the server advertises full-sync
        // (change:1). A fragment WITHOUT `text` (an incremental range edit) would corrupt the
        // doc if applied blindly — LOG it and keep the last known good text instead.
        // FIX (audit round-12: params validated) — a non-array contentChanges threw inside
        // the stdin handler (server crash); a non-string text poisoned docs (src.split threw
        // later); a non-string uri threw in fileOf. Garbage params are REJECTED, never stored.
        const rawCC = (p as { contentChanges?: unknown } | undefined)?.contentChanges;
        // FIX (audit round-14: the frame is ALREADY drained) — the body was consumed via
        // `buf = buf.subarray(head + 4 + n)` BEFORE this validation, so re-slicing with the
        // stale `head` (round-13's fix) discarded queued valid frames behind the bad one.
        // Just `continue`: the bad frame is already out of buf.
        if (rawCC !== undefined && !Array.isArray(rawCC)) { log(`PARAMS_REJECTED ${uri}: contentChanges is ${typeof rawCC}`); continue; }
        const cc = (Array.isArray(rawCC) ? rawCC : []) as Array<{ text?: unknown; range?: unknown }>;
        for (const frag of cc) {
          if (frag && typeof frag === "object" && !("text" in frag)) {
            log(`INCREMENTAL_REJECTED ${uri}: range edits unsupported (change:1 full-sync only)`);
          }
        }
        // FIX (audit round-11: incremental NEVER becomes the doc) — the old line applied
        // cc[last].text as the whole document even for incremental clients: a partial range
        // edit's `text` REPLACED the file. Full-sync (change:1) means ONLY a fragment with NO
        // range is a whole document; a ranged fragment is REJECTED (last-good kept).
        const full = cc.filter((f) => f && typeof f === "object" && (f as { range?: unknown }).range === undefined);
        const partial = cc.length - full.length;
        if (partial > 0) log(`INCREMENTAL_REJECTED ${uri}: ${partial} ranged fragment(s) — last-good kept`);
        // FIX (audit round-13: text typeof-checked) — a crafted {text:123} is not nullish, so
        // `?? docs.get` did NOT apply and docs.set(uri, 123) poisoned the Map (src.split threw
        // later). Non-string text is REJECTED; last-good kept.
        const lastText = (full[full.length - 1] as { text?: unknown } | undefined)?.text;
        const openText = (p as { textDocument?: { text?: unknown } } | undefined)?.textDocument?.text;
        const good = (x: unknown): x is string => typeof x === "string";
        if (full.length > 0 && !good(lastText)) log(`PARAMS_REJECTED ${uri}: fragment text is ${typeof lastText}`);
        if (full.length === 0 && openText !== undefined && !good(openText)) log(`PARAMS_REJECTED ${uri}: open text is ${typeof openText}`);
        let text: string;
        if (full.length > 0) text = good(lastText) ? lastText : docs.get(uri) ?? "";
        else text = good(openText) ? openText : docs.get(uri) ?? "";
        if (uri) { docs.set(uri, text); scheduleAnalyze(uri); }
      } else if (msg.method === "textDocument/didClose") {
        const p = msg.params as { textDocument?: { uri?: string } } | undefined;
        const uri = p?.textDocument?.uri ?? "";
        docs.delete(uri);
        seq.delete(uri);   // FIX (audit:222): the per-uri seq entry is cleaned on close
        const pend = pending.get(uri);
        if (pend) { clearTimeout(pend); pending.delete(uri); }
        send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: [] } });
      } else if (msg.id !== undefined && msg.method) {
        // FIX (audit round-15: unknown requests are ANSWERED) — per JSON-RPC/LSP a request
        // (has an id) must get a response or the client hangs until timeout. MethodNotFound.
        send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `MethodNotFound: ${msg.method}` } });
      }
    }
  });
  log(`plutus-lsp stdio up; tokens=${PLUTUS_LSP_TOKENS.length}`);
}
