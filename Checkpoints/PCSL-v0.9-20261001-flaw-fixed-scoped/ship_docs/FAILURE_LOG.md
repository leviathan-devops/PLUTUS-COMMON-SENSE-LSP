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
