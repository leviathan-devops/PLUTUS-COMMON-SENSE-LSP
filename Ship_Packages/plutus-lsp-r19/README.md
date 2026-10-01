# PLUTUS-COMMON-SENSE-LSP

The reflexive Plutus canon LSP — a third custom LSP server (beside `gi-lsp` / `jg-lsp`) that reads
the Plutus knowledge graphs (L1 semantica + L2 arsumbris), judges edits via JevK5 (CH-PLUTUS), and
surfaces the canon on every write. It INFORMS; it never blocks (the polarity law).

## Build status
The build package: `packages/plutus-common-sense-lsp/`. The planning artifact:
`PLANNING_SUITE_PLUTUS_COMMON_SENSE_LSP.md` (predicate PASS · spec-audit APPROVED 0/8).
The build entry: `scripts/plutus-lsp.ts` (built by the W1→W6 waves).

## The precedent
`Graph_Intelligence/scripts/gi-lsp.ts` (the GI reflex) · `Jev_Gates/scripts/jg-lsp.ts` (the ticket reflex).

<!-- the live-TUI spawn probe -->
## Module contracts (what each file does)

### scripts/plutus-lsp.ts — the stdio JSON-RPC server (31 KB)
Frame parser (Content-Length, MAX_STDIN 32MB, headerless/header caps, drain-first).
`fileOf(uri)`: file:// → path, decode-LAST, UNC refused, Windows-drive normalized,
path.resolve() clamps `..` at root, SYSTEM_DENY + PLUTUS_ALLOWED_ROOTS confinement,
returns the NORMALIZED path. `analyze(uri)`: pipeline → toDiagnostic → serialized send
(one resolver, dead-stream short-circuit, 5s timeout). `scheduleAnalyze`: 250ms debounce,
one in-flight per uri. Failure policy: NEVER clear last-good (send nothing on transient
error; lexical retry; double-fault keep). Receipts buffered, flushed async + on exit; the
send chain drained before exit. Unknown methods with an id get MethodNotFound (-32601).
Entry: `--stdio` (the server) / `--selftest <file>` (the gate, exit 0 on ≥1 token).

### src/plutus-lsp/store.ts — the graph reader (31 KB)
`resolveRoot`: STRONG markers win at any depth (12 levels), generic within 3. `l1PathFor`:
env PLUTUS_L1_PATH (authoritative per call) → local kg.json → mtime+size+head4 cache →
homedir-relative known paths (OPT-IN via PLUTUS_ALLOW_KNOWN_PATHS=1). `loadStore`: regular-file
pre-check + O_NONBLOCK open (no FIFO hang) + short-read named + JSON shape guards.
`lawsForHunk`: declaration needles + hunk tokens + 3-char name parts, tier-weighted rank,
topK=12 clamped. `callersOf`: both-direction segment-bounded suffix, sorted, top-20.
Refusals: PLUTUS_NO_STORE / PLUTUS_NO_ROOT (never silent empties).

### src/plutus-lsp/judge.ts — the decision kernel (33 KB)
`health()`: clamped-timeout probe → JEVK5_DOWN (named, never fabricated). `jevk5Fetch()`: ONE
batched POST (state + questions), [0,1]-validated answers, latency validated. `chain()`: the 7
nouls P1..P7 in ONE pass (deduped, hasOwn-validated, empty→JUDGE_NO_NODES). `relevancePass()`:
per-candidate nouls, IMMUTABLE-first prioritized cap (judged/total/dropped visible).
`verdict()`: PURE CODE — P2 jurisdiction fail-closed, MAX over answered {P4,P5,P6},
throwT 0.85 / demandT 0.30 / relevanceT 0.30 (getters, env-overridable, validated).
`observableQuestion()`: law-vocabulary specificity (not template-word counting).

### src/plutus-lsp/cards.ts — the card renderer (20 KB)
`lawCard`: one card per law + measured relevance (clean counts, validated totals).
`verdictCard`: VIOLATION (Error, vacuous-evidence downgrade) / DRIFT (clause from the verdict)
/ SUSPECT (Warning, epsilon ties, kind-coercion noted) / STALE (coded [JEVK5_*]/[PLUTUS_NO_*]).
`callersCard`: the measured importer count. `staleCard`: null-guarded named refusal.
`fileCards`: the full set, targetFile threaded (the warning names the EDITED file).
7 tokens: law · violation · tier · callers · drift · suspect · stale. `cap()` bounds every
interpolated string (C0/C1/DEL + unicode separators + bidi stripped); `srcOf`/`staleCode` shared.

### scripts/derailment-suite.ts — the acceptance suite (4 KB)
D1 fabricated SL cap → law surfaces. D2 multi-TP → law. D3 pair format → law.
D4 flat RRR → law/drift. D5 ZFP 45→60 → VIOLATION. D6 fact-free → ZERO tokens.
Measured 2026-10-01: 6/6 PASS against the live judge (:8090).

## Verification evidence (measured this turn, not remembered)

Battery: `bun test tests/` → 46 pass / 0 fail / 158 expects (3 files: plutus-lsp,
judge-cards, adversarial A1-A34 + 12 unit gates). Re-run with PLUTUS_L1_PATH set to the
canon kg.json; without it the store tests refuse with PLUTUS_NO_STORE (by design).
Live selftests (real graph + live JevK5 jevk5-4b-v0.2-Q8_0): store 11 cards (10 LAW + 1
SUSPECT), judge 13 (12 LAW + 1 SUSPECT), cards 13 (12 LAW + 1 VIOLATION MECH-TOKEN-08
P6=0.868 — the target-file warning proven), script 13 (12 LAW + 1 SUSPECT). Each SELFTEST
OK, exit 0. Derailment suite: 6/6 PASS, artifact .omp/derailment-suite-results.json.
Container pressure: 7/7 PASS (pbk/omp-ct:master), artifact .omp/container-test-results.json.
Host reflex: 310+ FRAME textDocument rows in forensic/lsp-receipts.log — the LSP fired on
live session writes during this build. Audit r19: FAIL (0 critical, 5 high), session
c8027864, artifact artifacts/sg-ocr-round19.json — the 5 blocking highs are OPEN (F-08/F-09).

## Registration and operation

`~/.omp/agent/lsp.json` → servers.plutus-lsp: command `bun`, args
[`<repo>/scripts/plutus-lsp.ts`, `--stdio`], fileTypes [.ts,.tsx,.js,.md], rootMarkers
[MASTER_CONTEXT, .omp/graph-intelligence, .arsumbris, tsconfig.json]. The runtime spawns
one server per root; 250ms debounce coalesces keystrokes; the L2 probe is fire-and-forget
(receipt only, never blocks the write). Env knobs: PLUTUS_L1_PATH (authoritative canon path),
PLUTUS_ALLOW_KNOWN_PATHS=1 (homedir-relative known paths), PLUTUS_ALLOWED_ROOTS (colon list
confines fileOf), PLUTUS_LSP_RECEIPT / PLUTUS_LSP_LOG (receipt/log paths), PLUTUS_THROW_T /
PLUTUS_DEMAND_T / PLUTUS_RELEVANCE_T (validated bars), JEVK5_URL / JEVK5_HEALTH (judge endpoints).
The LSP binds at session construction — restart the TUI to arm a new registration.

## Calibration and bars

RELEVANCE_T 0.30: swept (0.50 lost coverage with false negatives; 0.30 recovers every measured
positive while neutral/unrelated files emit nothing; 0.20 identical to 0.30). DEMAND_T 0.30:
derived (F1 0.60 · precision 0.50 · recall 0.75 on the 8-item corpus, reports/CALIBRATION_v1.md).
THROW_T 0.85: policy (a high bar for Error severity; the calibration top was 0.61). The FP cost
is bounded by the polarity law (a Warning, never a block). Corpus: 8 items (4 violations + 4
cleans); a 50+ corpus stabilizes the bar (open item).

## Known state and honest gaps

Gate r19 FAIL (0c/5h) — NO SHIP-READY CLAIM. Blocking: confinement symlink/cwd gap, in-flight
chain pile-up, head4 FIFO hang, cap() throwable toString, attribution-flag decoupling (all OPEN).
Residual medium/low (~14): hunk-hot-path caching, decl-regex literals, chain/relevance request +
latency accounting, the `weakest`-name shadow, the `plutus/tier` dead token (kept for compat).
Pending: live-TUI render proof (session restart), 50+ calibration corpus, v2 enforcement
extension (the block; the LSP informs only). Operator-caught count: 0.

## File inventory (top-level package scope)

dist/plutus-lsp.js · src/plutus-lsp/{store,judge,cards}.ts · scripts/{plutus-lsp,derailment-suite}.ts
· tests/{plutus-lsp,judge-cards,adversarial}.test.ts + tests/calibration/ · context_management/ (11)
· ship_docs/ (6) · reports/ (calibration, CT plans/results, engineering report v1, RELEVANCE_KERNEL,
LIVE_TUI_SPAWN_PROOF, LSP_DEPLOYMENT_CONTRACT, P8_VERDICT, STALENESS_AUDIT) · Checkpoints/ (8, each
with manifest) · artifacts/sg-ocr-round19.json · .omp/{container-test-results,derailment-suite-results}.json
· packages/plutus-common-sense-lsp/ (DPL1 spec + wave plan) · forensic/ (receipts) · lsp.json ·
BUILD_REPORT.md · DEBUG_LOG.md · FULL_BUILD_CONTEXT.md · SHIP_MANIFEST.md · DEPLOY.sh · README.md
(this file) · MASTER_INDEX.md · PACKAGE_AUDIT.md · GIT_HISTORY.md · boilerplate/.
## Per-wave record (what each round proved)

r9 (2c/12h): the scan-treadmill named — progress = CONFIRMED-DEFECTS-FIXED, not count-zero.
r10 (2c/10h): `knownAbs` + `MAX_STDIN` ReferenceErrors closed; validTier fail-closed; chain
dedupe-consistent; relevance cap visible; outer catch never-clears; send single-resolver.
r11 (0c/13h): frozen aliases deleted (getters-only); P2 jurisdiction fail-closed; cache content
fingerprint; chain on jevk5Fetch; 6 pins. CRITICAL class eliminated.
r12 (0c/12h): Array.isArray entry guards; short-name-part survival (TP1/ZS10); topK clamped;
tier-word candidacy removed; homedir-relative known paths; 10 pins.
r13 (0c/7h): STRONG-marker any-depth win; partition row validation; duplicate-lawId loud dedupe;
receipt-never-throws; prioritized cap; 13 pins.
r14 (0c/5h): cap() bounding; sanitize-first observableQuestion; one staleCode helper; shared srcOf;
single prioritizer; short-read named; uri/UNC confinement; 16 pins.
r15 (1c/2h): the selftest failure-path fall-through (self-inflicted by the round-14 drain-only
exit) — closed via the async IIFE with explicit returns; live fail+good paths verified.
r16 (0c/4h): path normalization + SYSTEM_DENY/ALLOWED_ROOTS confinement; FIFO pre-check;
both-direction callers; identity trimming; selftest halts verified live.
r17 (2c/3h): normalize-but-return-raw (self-inflicted) → return np; Windows-drive early return →
normalize-into-p; FIFO TOCTOU → O_NONBLOCK; exitFlushed `: never` throw → void + IIFE returns.
r18 (1c/5h): absolute-`..` clamp via path.resolve (self-inflicted hand normalizer) → resolve;
chain() up-front guards; 4 live selftests re-run (11/13/13/13 cards).
r19 (0c/5h): triage only — no code changed; the 5 blocking highs queued as F-08/F-09 with EN-13.
The CRITICAL class: eliminated at r11, re-introduced by fixes at r15/r17/r18, eliminated again
at r19 (0 critical, 3rd round running). The count is not convergence (D-11); the stop is
CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED.

## The derailment suite in detail (the objective's proof)

D1 pushes `const SL_CAP_PIPS = 150` (the fabricated cap; the canon ceiling is 36 pip) through
the LIVE pipeline: the L1 detector raises the SL/TP laws, the judge marks relevance, the cards
surface the governing law. Measured: plutus/law + plutus/suspect tokens. D2 pushes
`{ tp1, tp2, tp3 }` (the ONE-TP law): the short-name-part channel admits the law even though no
≥4-char token overlaps — the round-12 fix proven live. D3 pushes `EURUSD` (the pair-format law).
D4 pushes a flat RRR (category-specific law) → drift. D5 pushes ZFP 60 (canon 45) → VIOLATION
(the clearest canon breach; Error severity). D6 pushes a fact-free hunk on a scratch path → ZERO
tokens (the precision proof: the detector does not spray). Run: PLUTUS_L1_PATH=<kg.json>
bun scripts/derailment-suite.ts [--no-judge for the offline lexical mode].

## Threat model and non-goals

The LSP defends the AGENT against its own derailments (fabricated constants, multi-TP edits,
format drift, flat ratios, threshold changes) by surfacing the canon BEFORE the edit lands. It
does NOT defend against a hostile editor (the client is trusted; confinement is defense-in-depth:
SYSTEM_DENY + ALLOWED_ROOTS + O_NONBLOCK + bounded strings). It does NOT block (polarity law) —
an enforcement extension (v2) would own any block, gated on trusted precision. It does NOT
replace the battery (46 tests guard regressions) or the audit (the independent reader).

## Reproducing this package from source

1. `bun build scripts/plutus-lsp.ts --target bun --format esm --outfile dist/plutus-lsp.js`
2. `sha256sum dist/plutus-lsp.js` must print 3307a3b7a14d6f4b… (else the tree moved — rebuild).
3. `PLUTUS_L1_PATH=<kg.json> bun test tests/` must print 46 pass / 0 fail.
4. `PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` must print 6/6 PASS.
5. Copy dist/plutus-lsp.js over this package's dist/ and re-run DEPLOY.sh --verify-only.
## Battery map (what the 46 tests guard)

plutus-lsp.test.ts (12 unit gates): store resolves the graph; PLUTUS_NO_STORE named; lawsFor
matches symbols; declarationsIn reads exports; the selftest emits ≥1 token (exit 0).
judge-cards.test.ts: the 7-noul chain; the down judge named; one card per governing law; the
verdict names the breaching law; the callers count measured; no phantom on fact-free; thresholds
(throwT > demandT; 0.30 AT the bar is SUSPECT; 0.2 is LAW; P7 0.9 is DRIFT).
adversarial.test.ts (A1-A34): absent graph; down judge; fact-free silence; known violation;
foreign store; no root; siblings survive; exactly-7-unique tokens; callers emitted; calibrated
chain; validated bars; relevance wired + derived + partitioned; stale-row drop; missing-P2
INCONCLUSIVE; vacuous downgrade; staleCard never throws; emitted counts; incremental never doc;
headerless capped; NaN vector; non-array kept; short-name survival; topK clamp; partition rows;
fallback validated; STRONG-root preference; observable never throws; bounded cards; short read;
p>1 rejected; selftest halts; system paths refused; unknown method answered.
tests/calibration/: the 8-item corpus + the sweep harness behind CALIBRATION_v1 (bar 0.30).

## Container and host evidence carried in this package

.omp/container-test-results.json: the 7/7 pressure test (S1 absent graph; S2 dupe nodes; S3
no-clear; S4 Infinity→unread; S5 target warning; A1 malformed frame ALIVE; A2 down judge named).
.omp/derailment-suite-results.json: the 6/6 derailment suite with per-case tokens + verdicts.
forensic/lsp-receipts.log: the live host receipt stream (FRAME/RELEVANCE/PUBLISH/L2 rows) —
310+ FRAME rows were observed during this build's own session. reports/: the CT plans, the v1/v2
container results, the final results, the live-TUI spawn proof, the deployment contract, P8,
RELEVANCE_KERNEL, STALENESS_AUDIT, CALIBRATION_v1, and PCSL_Engineering_Report_v1 (545 lines).

## Checkpoint lineage carried in this package

Checkpoints/PCSL-v0.1 (scaffold) → v0.2 → v0.3 → v0.4-audited → v0.5-live-proven → v0.6-round10 →
v0.7-proxy-restored-report → v0.8-hardened-derailment-suite. Each with its manifest + SHA256SUMS.
The v0.8 manifest records: dist 3307a3b7a14d6f4b, battery 46/0/158, derailment 6/6, the honest gaps.
A fresh agent rebuilds from v0.8 alone: source + bundle + canon + ship docs + results artifacts.

## Operator asks (the three that gate the next work)

1. Restart a TUI session to arm the LSP (binds at construction) — the live-TUI render proof.
2. Rule on the 5 blocking highs: fix now (a round-20 wave) or accept as residual (recorded).
3. Rule on v2: the enforcement extension (the block) stays PARKED until precision is trusted.

## License and provenance

Built in-session by the omp agent (2026-09-29..2026-10-01) from the Plutus canon
(MASTER_CONTEXT bibles + semantica kg.json + arsumbris L2) with JevK5-4b as the decision kernel.
No third-party code vendored; the only runtime deps are bun + node:fs/path/url/os/net.
Provenance for every claim: the ship docs (evidence) + the canon (state) + the git history
(40 commits, r9..r19 audits) — all carried in this package.

