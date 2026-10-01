# FAILURE_LOG — the derailment ledger

## F-01 · the graph gate (a process failure)
WHAT: 3 structural edits (store.ts, judge.ts, cards.ts) with no ripwire/graph query.
THE MECHANISM: I treated the new repo as "no graph exists" and skipped the query — but the gate
counts DRIFT, not store-existence. THE REMEDY: the symlink anchor + `ripwire verb=map`.
THE LESSON: the gate is right; a blind edit is the derailment.

## F-02 · the calibration's first run (an instrument failure)
WHAT: the chain showed no discrimination (F1 0.67, a clean outscoring a violation).
THE MECHANISM: the STATE (12 fuzzy laws) diluted the signal; the generic question required
derivation. THE REMEDY: the probe → +lawsForHunk + OBSERVABLE. THE LESSON: when a judge looks
broken, probe the STATE first.

## F-03 · the doc-density gate (a write-channel failure)
WHAT: the write tool refused the package files (GENERIC < 200 lines).
THE MECHANISM: the host's doc gate classifies by filename; package files read as GENERIC.
THE REMEDY: the bash-heredoc channel (the sanctioned workaround). THE LESSON: know the host's
write channels.

## THE HONEST COUNT
3 derailments; all 3 remedied with a named mechanism; none required a retry-as-erasure.

## F-04 · the audit-lane outage misread as a verdict (a measurement failure, caught)
WHAT: the round-11 audit returned BLOCKED (provider `127.0.0.1:4097` refused) twice in a row.
THE MECHANISM: the ocr lane rides the go-session-proxy; the proxy process is alive but its
:4097 listener is gone — the lane is down while the JEVK5 judge (:8090) is UP. THE REMEDY: report
BLOCKED-as-BLOCKED, fix-then-verify locally (battery + 4 live selftests + rebuilt bundle), and
re-run the gate when the lane recovers — never treat the absence of a FAIL as a PASS. THE LESSON:
a gate that cannot run has said nothing; "no new findings" from a dead lane is not "clean".

## F-05 · the stream-interruption mid-batch (an infra failure, recovered)
WHAT: a provider stream cut killed a multi-edit batch halfway (the L2-framing + tokenization +
dead-line fixes). THE MECHANISM: one giant heredoc = one failure domain. THE REMEDY: re-ran as
three small asserted batches (each `assert old in s` before replace), re-verified with the
battery after each. THE LESSON: small asserted batches survive interruptions; giant ones do not.
THE HONEST COUNT: 5 derailments; all 5 remedied with a named mechanism.

## F-06 · the audit lane crash-loop misdiagnosed as a code verdict (2026-10-01, caught)
WHAT: 3 rounds reported "GATE: BLOCKED (provider unreachable)" with the code blamed implicitly.
THE MECHANISM: the proxy's ExecStart file was DELETED → 19k-restart loop → :4097 never bound.
THE REMEDY: check the ExecStart target exists FIRST; restored the file; the lane ran. THE LESSON:
a BLOCKED gate is an INFRA failure until the infra is proven healthy.

## F-07 · the 8-round audit read as convergence while fixes added criticals (2026-10-01, caught)
WHAT: rounds 11-18 handled 60+ findings but r15/r17/r18 EACH introduced a fresh CRITICAL.
THE MECHANISM: the fixes touched the same path/exit/confinement code — each fix added lines and a
new edge (return-raw, `throw` in `: never`, `..` clamp). THE REMEDY: report the trend WITH the
re-introductions; stop on CONFIRMED-DEFECTS-FIXED, not a zero count. THE LESSON: fix-density in
one subsystem re-introduces defects; the audit count is not a convergence proof.

### F-08 — round-19 audit: 5 blocking highs (2026-10-01)
- **What happened:** `GATE: FAIL (0 critical, 5 high)` — session c8027864, 4 files, 27 findings.
- **Found:** the fresh qwen-code-audit scan (the r11..r18 drive's closing round).
- **Root cause (per finding):** (1) path confinement: `resolve(p)` uses cwd + no realpath, a
  symlink passes the prefix check; (2) in-flight judge chains pile up under rapid typing (no
  single-flight); (3) `head4` reintroduces the FIFO hang (blocking openSync, no O_NONBLOCK);
  (4) `cap()` can throw via a caller-controlled `toString()`; (5) the attribution flag is
  computed from `finiteTop[0..1]` while the picked law may come from a weaker fallback.
- **Impact:** none shipped — the gate stays FAIL; no ship-ready claim.
- **Disposition:** OPEN — each maps to a DEBUG_LOG EN entry on fix; re-proven by re-scan + battery.

### F-09 — the CRITICAL class re-introduced by the r18 fix itself (2026-10-01)
- **What happened:** round-18 closed the path-normalize criticals; round-19 names a FRESH
  critical-adjacent edge in the same confinement code (symlink + cwd-relative resolve).
- **Found:** the round-19 scan (finding: scripts/plutus-lsp.ts:273).
- **Root cause:** each fix adds lines to the same subsystem; the reviewer's supply of edges is
  unbounded. The count is not convergence (FAILURE_LOG F-07 stands).
- **Impact:** the gate stays FAIL; the fix is queued, not rushed.
- **Disposition:** OPEN.

### F-10 — the independent flaw report (2026-10-01 — an agent found this mid-other-task)
- **What happened:** an independent agent, searching for a DIFFERENT task, hit the LSP's own
  refusal noise and wrote `reports/PCSL_FLAW_REPORT_2026-10-01.md` (12 findings, 2 CRITICAL).
- **Found:** by a foreign session's live probes (stdio, loadStore, census, receipts) — NOT by us.
- **Root cause:** the reflex was built and tested against the MASTER_CONTEXT graph but DEPLOYED
  against every tree: lawless dashboard graphs (F-1), an advertised-but-missing pull handler
  (F-2), no didSave (F-6), a dead tier token (F-10), and a global registration with no scope gate.
- **Impact:** the LSP was a silent no-op on its primary target (the dashboard tree) while
  emitting noise on every foreign file — the worst combination: silent where it matters, loud
  where it does not.
- **Disposition:** FIXED+PROVEN this turn (F-1/F-2/F-3/F-6/F-10 + the SCOPE GATE; battery 52/0;
  derailment suite re-run; live re-proofs). F-4 (test isolation) verified already-isolated via
  bunfig; F-5 (silent degrade) queued; F-7/F-9/F-11/F-12 fixed inline.

### F-11 — sample.ts committed twice (the untracked-debris class)
- **What happened:** a 2-line scratch file (`export const x…`) was committed in `e8fbcc8` via
  `git add -A` (it was untracked debris from an earlier probe), removed, then reappeared and
  committed AGAIN — because the second `git add -A` ran while the file still existed.
- **Root cause:** `git add -A` stages untracked scratch. Two removals were needed because the
  file was never deleted from disk between them.
- **Disposition:** FIXED (deleted + committed). LESSON: never `git add -A` — stage explicit
  paths (the skill's own law, violated twice).

### F-12 — the r19 audit's 5 blocking highs + F-4/F-5 (2026-10-01)
- **What happened:** the r19 gate FAIL (0 critical, 5 high) stood unfixed; a re-audit of the fixes
  ALSO surfaced that F-5's first repair was a DEAD LOCAL (the card built, never surfaced) and F-4's
  `package.json` test script used the bun FILTER trap (`bun test tests/` → 284 tests/30 files).
- **Found:** this session's own verification (the F-5 probe returned CARD_COUNT 0; the test count
  jumped to 284).
- **Root cause:** (H1) `resolve()` cwd-dependent + symlink-blind; (H2) no single-flight, chains
  stacked; (H3) `head4` plain `openSync` blocks on a FIFO; (H4) `String(v)` invokes a hostile
  `toString`; (H5) the attribution flag read the top-of-list, not the picked law.
- **Impact:** none shipped — the gate stayed FAIL; the defects were latent.
- **Disposition:** FIXED+PROVEN — battery 52/0/171; derailment 6/6 (now HERMETIC: the suite carries
  its own mini-Plutus graph, so it no longer depends on the host canon); scope probe 7/7.

### F-13 — the scope gate's two loose cuts (self-inflicted, caught by the probe)
- **What happened:** the first scope cut (`existsSync(join(dir,"PLUTUS"))`) scoped every repo under
  `Shared_Workspace` (it HAS a PLUTUS child); the second still scoped everything under `$HOME` (a
  stale `~/.plutus/` DIRECTORY matched the marker-file branch).
- **Found:** the 7-case scope probe (5/7 on cut 1, still failing on cut 2).
- **Root cause:** a scope test on CHILD-EXISTENCE is a scope test on the PARENT.
- **Disposition:** FIXED+PROVEN — the decisive test: a path SEGMENT literally `PLUTUS`, or an
  explicit `plutus.yaml`/`.plutus` FILE (`isFile()`) BELOW `$HOME`. 7/7.

### F-14 — the audit lane BLOCKED at r21 (2026-10-01)
- **What happened:** `qwen-code-audit scan` returned `BLOCKED (OCR_JSON_ABSENT)` twice; the health
  probe returned `403 — An active OpenCode Go subscription is required to use Go models`; the
  zen-free fallback returned `FreeUsageLimitError: Rate limit exceeded`.
- **Found:** the r21 convergence check (after the r20 fix sweep).
- **Root cause:** a PROVIDER outage (the Go subscription lapsed; the free lane is rate-limited).
  Not a code verdict, not a lane wiring defect.
- **Impact:** the r20 fixes are un-audited by the independent reader — the fixes are proven by the
  battery + the derailment suite + the probes, NOT by the audit.
- **Disposition:** BLOCKED — recorded with its retry condition (`artifacts/sg-ocr-round21.json`).
  NO SHIP-READY CLAIM. The retry fires when the Go subscription is active or the free lane resets.

### F-15 — the independent audit's HIGH: the receipt rotation was DEAD for two rounds (2026-10-01)
- **What happened:** the F-9 rotation called `openSync/readSync/closeSync/writeFileSync` with NONE
  of them imported. Every attempt threw `ReferenceError: openSync is not defined` INSIDE a silent
  `catch { /* best-effort */ }` — the 12MB cap never held and the file grew unbounded.
- **Found:** TWICE independently — my own F-9 probe (which I wrote because the first fix "looked
  right") and the independent reviewer subagent (its priority-1 finding).
- **Root cause:** two compounding classes: (a) a silent catch around a best-effort side task; (b)
  a fix that used functions the module never imported (the build does NOT catch this — it is a
  runtime-only ReferenceError).
- **Impact:** the receipt grew without bound; the failure was invisible for two rounds.
- **Disposition:** FIXED+PROVEN — imports completed, the rotation made LOUD
  (`RECEIPT_ROTATE_FAIL`), the sibling stderr LOG capped too, pinned (A40), proven live
  (`13107276 -> 155958 bytes`).

### F-16 — the "best-effort catch" as a class (2026-10-01)
- **What happened:** the same silent-catch pattern (5 sites) hid the dead rotation AND would hide
  any future failure of the cap, the L2 probe, the receipt writer, and the degraded card.
- **Root cause:** `catch { /* best-effort */ }` turns a LOUD FAIL into a SILENT one — the
  loud-fail-or-clear-pass law violated at the side-effect layer.
- **Disposition:** FIXED for the rotation (loud). The remaining sites are named here; each is
  logged as a candidate (the skill's declined-finding rule: silence reads as "never found").

### F-17 — the SECURITY audit: 10 findings, all resource-exhaustion/hardening (2026-10-01)
- **What happened:** a fresh-context `security-reviewer` subagent probed the 4 files and returned
  **0 critical, 3 high, 4 medium, 3 low** — every one a resource-exhaustion or hardening gap,
  none an exploit in the confinement logic (that came back CLEAN).
- **The 3 highs:** (H1) the law-count PRE-FILTER read candidate kg.json files with NO size cap — a
  planted 2GB graph OOM'd the server before loadStore's 16MB gate ever ran; (H2) the judge response
  was parsed with no byte cap and walked with no key cap; (H3) attacker-controlled method/uri/file
  strings entered the buffered receipt UNCAPPED (7 x 30MB frames retained ~200MB and defeated the
  rotation).
- **Root cause (the class):** every cap existed SOMEWHERE but not on the HOTTEST path of its
  surface — the discovery pre-filter, the network parse, the observability sink, the doc table's
  cardinality, the per-keystroke tokenizer, the partial-frame wait, the allowlist's raw side.
- **Impact:** none shipped; the LSP was reachable only by a local client, but the gaps were real.
- **Disposition:** ALL 10 FIXED + PINNED (A45), battery 58/0/196, dist 0638723b85a564e0.
