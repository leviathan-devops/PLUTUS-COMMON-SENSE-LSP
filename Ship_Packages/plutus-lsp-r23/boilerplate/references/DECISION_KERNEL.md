# DECISION_KERNEL — wiring the judge + the calibration

The kernel's intelligence is the JUDGE: a local decision model that answers yes/no questions with
calibrated probabilities. This is how it is wired + how the bars are derived.

## The judge contract (verified)

The judge is a "pointer-readout" / decision model — NOT an LLM chat model. Given a `state` (the
evidence text) and a map of `questions` (id -> a single yes/no), it returns a probability per
question in `[0,1]`.

```
POST {JEVK5_URL}   # e.g. http://127.0.0.1:8090/v1/systemone
  body: {
    "state": "<the evidence, assembled FROM DISK (never agent prose)>",
    "questions": {
      "R1": { "type": "noul", "instructions": "does THIS law govern the code being written?" },
      ...
    }
  }
-> { "answers": { "R1": { "noul": 0.87 }, ... }, "latency_ms": 120 }
```

Local servers that work: `jevk5-4b-v0.2-Q8_0` (llama.cpp, the PLUTUS judge), `kev-0.6b`, the
`decider-*` GGUFs. Health: `GET {JEVK5_HEALTH}` -> `{"ok": true}`.

## The two passes

### Pass 1 — RELEVANCE (the intelligence fix)
`relevancePass(laws, file, hunk)` sends ONE noul per CANDIDATE law: "does this law govern the code
being written in <subject>? A DIFFERENT VALUE IS STILL GOVERNED." The judge marks each law
relevant/irrelevant; `partitionByRelevance` splits at the bar; only relevant laws reach pass 2.

**Why this exists:** before it, the DETECTOR decided relevance lexically (token overlap). The judge
ran downstream on a pre-filtered top-3 and could only answer "does this change violate a law you
were already given" — it never answered "WHICH laws govern this at all". The measured consequence:
a MATHEXPR file received the stop-loss + ZFP laws (the probe's case C).

### Pass 2 — THE CHAIN (the 7 clauses, ONE POST)
```
P1 SCOPE        is the target inside the project tree?
P2 LAW          does the evidence show a governing law?      (the jurisdiction gate)
P3 TIER         is the governing law IMMUTABLE?
P4 VIOLATE      does the change CONTRADICT the law's statement?
P5 CONTRACT     does the change OVERRIDE a prior data architecture?
P6 ANTIPATTERN  does the change match a KNOWN bug/anti-pattern?
P7 DRIFT        does the change contradict a prior recorded ruling?
```
`verdict()` is PURE CODE: MAX over the answered wrongness clauses {P4,P5,P6}; P2 missing/low ->
INCONCLUSIVE; P7 -> DRIFT.

## The bars (DERIVED, never picked)

| bar | default | how it was derived |
|---|---|---|
| `RELEVANCE_T` | 0.30 | swept over the corpus: 0.50 lost coverage (false negatives); 0.30 recovers every measured positive while neutral/unrelated files emit nothing; 0.20 identical to 0.30 |
| `DEMAND_T` | 0.30 | derived from `reports/CALIBRATION_v1.md` (F1 0.60 · precision 0.50 · recall 0.75 on the 8-item corpus) |
| `THROW_T` | 0.85 | policy (a high bar for Error severity; the calibration top was 0.61 — a 0.30 Error would fire on half the cleans) |

All env-overridable + validated (`bar()` rejects empty/NaN/out-of-range → the default).

## The calibration procedure (reproduce it for your project)

1. **Build a labeled corpus** — N violations + N cleans (the PLUTUS: 8 items).
2. **Sweep the bar** — run the judge at 4+ thresholds; record F1/precision/recall per threshold.
3. **Pick the operating point** — the lowest bar that recovers every positive while the negatives
   still emit nothing. Record the corpus WITH the bar (a bar without its corpus is a guess).
4. **The limit, stated:** the positive side is derived; the negative side needs a mixed-candidate
   fixture (a file that lexically matches one law but is about another). The PLUTUS calibration
   derived the positive side only — the honest residual.

## The observable-question law

The generic question ("does this contradict the law?") requires the judge to DERIVE the
contradiction (measured Δ ~0.0 — no discrimination). An OBSERVABLE question about a specific value
discriminates (Δ 0.59-0.63). `observableQuestion()` picks the template whose QUESTION contains the
most of the LAW's own vocabulary (the specificity fix). Write one template per law family; each is
a DIRECT READ of the evidence.

## The prereq skills
- `decider-*` / `llamacpp-pointer-readout-serving` — serve the judge GGUF.
- `jev-manager-*` / `judge-question-authoring` — author + calibrate the questions.
- `decider-question-validation` — validate a question before wiring it.
- `batch-judging-and-flake-discriminators` — batch N items in ONE request.
