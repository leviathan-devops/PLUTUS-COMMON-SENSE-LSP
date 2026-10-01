# THEATRICALITY_LOG — the append-only form-without-substance journal

**THE LAW:** every artifact whose FORM was verification without its SUBSTANCE goes here — on
subagents and on this session itself. The OPERATOR-CAUGHT count is the metric to drive to zero.
An entry is: WHAT looked like proof + WHY it was not + THE FIX + THE RE-VERIFICATION.

## T-01 · "S1-S7 MET" with S1 not existing (2026-09-30 · caught by the audit, not the operator)
WHAT: SPEC_VIOLATION_LOG claimed "S1-S8 MET" while `test_lsp_selftest_emits_token` (S1) had never
been written. WHY THEATRE: a compliance table filled from memory, not from `grep`. THE FIX: the
audit's FIX D wrote the test; the line now reads "MET after the audit's FIX D" and the original
false claim is retained as the defect record. RE-VERIFIED: the test passes in the 26-pass battery.

## T-02 · the scan-treadmill treated as progress (2026-09-30 · self-caught)
WHAT: rounds 1-3 each "fixed 13" while findings stayed 28→28→33 — activity reported as advance.
WHY THEATRE: an LLM reviewer generates findings indefinitely; the count cannot reach zero. THE FIX:
the progress measure is now CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED (26 + the
ReferenceError class), and the gate line reads FAIL-until-green instead of "almost passing".
RE-VERIFIED: BUILD_REPORT §7 lists each fix against its finding id.

## T-03 · the L2 "never blocking" comment while awaited inline (2026-09-30 · caught by round-10)
WHAT: the code comment said "never blocking; L1 is primary" while `await readL2(...,400)` ran
inline on every debounced keystroke. WHY THEATRE: the contract described the intent, not the path.
THE FIX: fire-and-forget (`void readL2(...).then(receipt)`) — the comment now describes the path.
RE-VERIFIED: the pipeline no longer awaits the probe (grep: zero `await readL2` in pipeline).

## T-04 · the relevance cap "MARKED" only in prompt text (2026-09-30 · caught by round-10)
WHAT: the truncation was "marked" inside the judge prompt (which no caller reads) while the return
`{ok,scored}` carried no `dropped` field. WHY THEATRE: a marker visible to nobody is not a marker.
THE FIX: `judged/total/dropped` in the return type AND on the receipt line. RE-VERIFIED: `forensic/lsp-receipts.log` carries `RELEVANCE judged=12/12 dropped=0`
(measured 2026-09-30T17:46:57Z, live selftest on store.ts).

## T-05 · the v1 "no judge in the container" residual (caught earlier · retained as the pattern)
WHAT: TESTING_LOG recorded "the container has NO JevK5" as an honest residual — while the socat
host bridge (`:8091 → :8090`) existed and was never looked for. WHY THEATRE: a residual declared
without checking the environment is an assumption wearing honesty. THE FIX: the v2 rig found the
bridge and proved the live chain in-container (6/6). RE-VERIFIED: `pcsl-ct-results-v2.json`.

## THE OPERATOR-CAUGHT COUNT: 0
No entry above was caught by the operator. The audit + the probes caught T-01..T-05. The count
stays visible here so it cannot drift silently.
