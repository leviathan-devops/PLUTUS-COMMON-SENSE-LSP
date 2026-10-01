# META_OBSERVATIONS — the PLUTUS-COMMON-SENSE-LSP build (pattern extraction)

Harvested from the ship docs (BUILD_REPORT, DEBUG_LOG, FAILURE_LOG, TESTING_LOG, THEATRICALITY_LOG)
+ git (47 commits) + the battery (46 tests). MODE 1: the build is believed; harvest the lessons.

## THE SUCCESSFUL LOOP (what worked, test-verified)

1. **SPEC → SPEC-AUDIT → BUILD → BATTERY → CONTAINER → AUDIT → FIX → REPIN.** The build ran the
   full ladder; every round ended with a green battery and a fresh pin. The battery grew
   18 → 26 → 32 → 36 → 39 → 42 → 46 across the rounds; zero regressions.
2. **THE INDEPENDENT AUDIT FOUND WHAT THE SUITE COULD NOT.** 19 `qwen-code-audit` rounds found
   60+ defects the 46-test battery never exercised (ReferenceErrors on untaken branches, path
   confinement, FIFO hangs, NaN vectors). The lesson: a green suite proves the paths it writes;
   the audit proves the branches it skips.
3. **THE DERAILMENT SUITE CLOSED THE OBJECTIVE.** The battery proved the MECHANISM; the objective
   ("the agent cannot derail") needed REAL derailments through the pipeline. 6/6 PASS (D5 fired
   VIOLATION; D6 stayed silent). A green battery is not the objective's proof.
4. **THE CHECKPOINT PER MILESTONE.** 8 checkpoints (v0.1..v0.8), each with a manifest + SHA256SUMS.
   A fresh agent rebuilds from v0.8 alone.
5. **THE RECEIPT AS THE FORENSIC CHANNEL.** `forensic/lsp-receipts.log` (FRAME/RELEVANCE/PUBLISH)
   proved the LSP fired on live session writes — the live-reflex evidence no unit test produces.

## WHAT FAILED (patterns that drew corrections)

| the failure | the class | the mechanism | the remedy |
|---|---|---|---|
| 3 structural edits with no graph query | process failure | treated the new repo as "no graph" | symlink anchor + ripwire |
| the calibration showed no discrimination | instrument failure | 12 fuzzy laws diluted the state | probe the STATE first; +lawsForHunk |
| the write tool refused the package files | write-channel failure | the doc gate classifies by filename | the bash-heredoc channel |
| "S1-S7 MET" with S1 not existing | theatricality | a compliance table filled from memory | the test written; the claim corrected |
| the scan-treadmill read as progress | theatricality | an LLM reviewer generates findings indefinitely | the stop = confirmed-fixes + critical-class |
| the L2 "never blocking" comment while awaited | theatricality | the comment described the intent, not the path | fire-and-forget |

## WHAT RECURS (needs a systemic fix)

1. **THE CONFINEMENT SUBSYSTEM IS THE DEFECT FARM.** The path/exit/confinement code re-introduced
   a CRITICAL at r15 (selftest fall-through), r17 (normalize-return-raw), r18 (absolute-`..`). Each
   fix added lines to the SAME subsystem and a new edge. **Systemic fix: every confinement fix
   needs its own adversarial pin set (symlink, `..`, UNC, drive, empty, non-string) BEFORE the
   round closes.**
2. **THE AUDIT COUNT DOES NOT CONVERGE.** The blocking count fell (13→12→7→5→2) while fixes added
   criticals. **Systemic fix: stop on CONFIRMED-DEFECTS-FIXED + CRITICAL-CLASS-ELIMINATED, never a
   zero count (D-11).**
3. **THE `.md` REGISTRATION OVER-FIRES.** 32/49 refusals are markdown files (the source's #1
   misfire). **Systemic fix: register code fileTypes only; out-of-scope = SILENT.**
4. **THE L2 PROBE IS DEAD WEIGHT.** 197 dead `L2 PLUTUS_NO_STORE` rows. **Systemic fix: probe L2
   only after L1 resolves.**

## PROCESS PATTERNS (from the derailments)

| the pattern | the detection | the prevention |
|---|---|---|
| scope inference | writes to a repo not named in the goal | scope jail + escalation |
| convergent scan | new findings on unchanged code | the stop condition (D-11) |
| lane flake | a lane failing >50% | the proxy restore (BUG-12) |
| provenance confusion | a string match treated as a dep analysis | classify before cleaning |
| fix-density re-introduction | a fix adds a CRITICAL in the same subsystem | per-subsystem adversarial pins |

## NOTES FOR FUTURE AGENTS

- The battery is the regression guard; the audit is the independent reader; the derailment suite is
  the objective's proof. Three different instruments; none substitutes for another.
- The receipt is the only live-firing evidence. A source read is not a runtime test.
- The polarity law holds: the LSP informs; a block needs trusted precision (v2, parked).
- The confinement subsystem demands its own adversarial pin set on every change.
