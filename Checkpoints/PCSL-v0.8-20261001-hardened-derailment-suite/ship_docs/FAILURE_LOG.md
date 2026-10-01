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
