# plutus-lsp-r23 — README

Fingerprint (bundle): `f45727589b05caba`.

## What this is

The PLUTUS-COMMON-SENSE-LSP at the security-hardened, scope-gated state: the reflexive canon LSP
(graph reader + JevK5 decision kernel + card renderer + stdio server), its battery (59 tests), its
derailment suite (6/6, hermetic), its evidence (4 audit rounds, 56 findings fixed), its docs (ship +
canon + generated), and its history (13 checkpoints).

**THE SCOPE GATE:** the reflex runs ONLY inside a PLUTUS-scoped tree — a path SEGMENT literally
`PLUTUS`, or an explicit `plutus.yaml`/`.plutus` FILE below `$HOME`. Everything else is SILENT.
CONFIGURABLE: `PLUTUS_LSP_SCOPE` / `PLUTUS_LSP_SCOPE_FILES` (a re-host sets these + gets scoping).

## Deploy one-liner

```sh
sh DEPLOY.sh          # SHA-gates the bundle, then prints the registration + verify
sh DEPLOY.sh --verify-only
```

## Verification

1. `sh DEPLOY.sh --verify-only` → `SHA OK: f45727589b05caba`.
2. `PLUTUS_L1_PATH=<kg.json> bun scripts/plutus-lsp.ts --selftest src/plutus-lsp/cards.ts` → SELFTEST OK, 13 cards, exit 0.
3. `PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` → 6/6 PASS (hermetic).
4. `PLUTUS_L1_PATH=<kg.json> bun test ./tests/` → 59 pass / 0 fail.
5. Restart a TUI session to arm the LSP.

## Honest state

The ocr audit lane is provider-down (Go 403, zen-free 429); the audit gate is satisfied by
fresh-context agent auditors. The live-TUI render proof is pending. NO SHIP-READY CLAIM beyond the
measured gates (battery 59/0, derailment 6/6, scope 7/7, noise 0.00).

## The boilerplate + the skill (project scoping built in)

See `boilerplate/` (the reusable kernel machinery + the configurable scope) and the
`create-knowledge-kernel` skill. A fresh project re-hosts the kernel by copying `boilerplate/
machinery/`, renaming the `PLUTUS_*` refusals, and setting `PLUTUS_LSP_SCOPE` to its own name.
---

## THE MODULE CONTRACTS

### scripts/plutus-lsp.ts — the stdio JSON-RPC server
Frame parser (Content-Length; MAX_STDIN 32MB; a 4KB header cap; a headerless cap; a 30s idle sweep
against the slow-loris; copy-on-drain so skip paths never pin the peak buffer). `fileOf(uri)`:
file:// → path (decode-last, UNC refused, Windows-drive normalized, `resolve` clamps `..`),
`realpathSync` for symlink safety, `SYSTEM_DENY` + `PLUTUS_ALLOWED_ROOTS` (canonicalized) confinement,
returns the CHECKED path. `analyze(uri)`: the scope gate FIRST (out-of-scope = silent) → pipeline →
`toDiagnostic` → serialized send (one resolver + dead-stream short-circuit + 5s timeout). Failure
policy: NEVER clear last-good (send nothing on a transient error; lexical retry; double-fault keep).
Single-flight per uri + a dirty flag (a trailing edit re-runs). `receipt()` + `log()` capped at ONE
choke point (512 chars).

### src/plutus-lsp/store.ts — the graph reader
`resolveRoot` (STRONG markers win at any depth). `l1PathFor` (env → local → cache → the LAW-BEARING
ancestor climb → known, each gated by `lawCount` with a 16MB size gate). `loadStore` (regular-file +
O_NONBLOCK + short-read named + JSON guards; law text capped AT LOAD: name 256 / statement 4000 /
anchor+source 512). `lawsForHunk` (declaration + hunk-token + 3-char name-part admission with
stopword filtering; a tier-weighted rank; topK clamped). `callersOf` (both-direction segment-bounded,
sorted). `isPlutusScoped` — THE CONFIGURABLE SCOPE GATE (see below).

### src/plutus-lsp/judge.ts — the decision kernel
`health` (clamped timeout; a bounded key-inspect, never a full stringify). `jevk5Fetch` (ONE batched
POST; a 256KB Content-Length check; a 64-key cap; a key-length cap; [0,1]-validated answers).
`chain` (the 7 nouls P1..P7; deduped; hasOwn-validated; capped state). `relevancePass` (per-candidate
nouls; an IMMUTABLE-first prioritized cap; judged/total/dropped visible). `verdict` (PURE CODE:
fail-closed jurisdiction, MAX over answered {P4,P5,P6}). Bars: throwT 0.85 / demandT 0.30 /
relevanceT 0.30 (getters, env-overridable, validated).

### src/plutus-lsp/cards.ts — the card renderer
`lawCard` (clean counts, capped totals). `verdictCard` (VIOLATION with a vacuous-evidence downgrade /
DRIFT with the clause from the verdict / SUSPECT with epsilon ties / STALE coded). `callersCard`
(measured). `staleCard` (null-guarded, allowlisted codes). `fileCards` (targetFile threaded; the
degraded card surfaced first). `cap()` bounds every interpolated string and strips C0/C1/DEL + unicode
separators + bidi controls. 6 tokens: law · violation · callers · drift · suspect · stale.

---

## THE CONFIGURABLE SCOPE (project scoping built in — the reuse seam)

The reflex runs ONLY inside a scoped tree; everything else is SILENT (no card, no receipt noise).
The generic root markers can LOCATE a root but never AUTHORIZE the reflex. A fresh re-host sets ONE
env var and gets scoping:

```
PLUTUS_LSP_SCOPE="MYPROJECT"                     # the path SEGMENT(s) meaning "my tree" (comma-list)
PLUTUS_LSP_SCOPE_FILES="myproj.yaml,.myproj"     # optional explicit scope FILES
```

Defaults: `PLUTUS` / `plutus.yaml,.plutus`. The decisive test: a path SEGMENT equals a scope segment
(the BASENAME — never child-existence: a dir merely HAVING a `<PROJECT>/` child must not scope its
siblings), OR an ancestor carries an explicit scope FILE (`isFile()`) BELOW `$HOME` (a marker
at/above `$HOME` scopes the whole home — meaningless). Verified: default OUT / custom segment IN /
custom file IN.

---

## THE MEASURED STATE (the gates)

| the measure | the result |
|---|---|
| battery | 59 pass / 0 fail / 199 expects |
| derailment suite | 6/6 PASS (hermetic — its own mini-Plutus graph) |
| scope gate | 7/7 (configurable) |
| noise ratio | 0.00 (was 2.0: 49 REFUSE + 197 L2 vs 124 PUBLISH) |
| the receipt rotation | proven live (13107276 → 155958 bytes) |

---

## THE AUDIT HISTORY (56 findings, all fixed)

Four rounds, each a fresh-context independent reader (the ocr lane is provider-down):
the r19 flaw-report (an agent found it mid-other-task), the r20 reviewer audit, the r21-r22 reviewer
re-audit, the r23 security audit (0 critical / 3 high / 4 medium / 3 low). Every finding is fixed +
pinned (A1-A46). The recurring class: a cap that existed SOMEWHERE but not on the HOTTEST path of its
surface. The law: THE CAP GOES AT THE ALLOCATION SITE.

---

## THE BOILERPLATE + THE SKILL

`boilerplate/` carries the reusable kernel machinery (byte-identical to `src/`) + the configurable
scope + the battery + the references. The `create-knowledge-kernel` skill orchestrates minting a
kernel for ANY project from it. A re-host: copy `boilerplate/machinery/`, rename the `PLUTUS_*`
refusals, replace the OBSERVABLE table, point `KNOWN_L1_PATHS` at its graph, set `PLUTUS_LSP_SCOPE`
to its own name.

---

## THE CHECKPOINT LINEAGE

13 checkpoints (PCSL-v0.1 .. v0.13), each with a manifest + SHA256SUMS. A fresh agent rebuilds from
the latest alone: source + bundle + canon + ship docs + the results artifacts.

# plutus-lsp-r23 — README
Fingerprint (bundle): `f45727589b05caba`.
## What this is
The PLUTUS-COMMON-SENSE-LSP at the security-hardened, scope-gated state: the reflexive canon LSP
(graph reader + JevK5 decision kernel + card renderer + stdio server), its battery (59 tests), its
derailment suite (6/6, hermetic), its evidence (4 audit rounds, 56 findings fixed), its docs (ship +
canon + generated), and its history (13 checkpoints).
**THE SCOPE GATE:** the reflex runs ONLY inside a PLUTUS-scoped tree — a path SEGMENT literally
`PLUTUS`, or an explicit `plutus.yaml`/`.plutus` FILE below `$HOME`. Everything else is SILENT.
CONFIGURABLE: `PLUTUS_LSP_SCOPE` / `PLUTUS_LSP_SCOPE_FILES` (a re-host sets these + gets scoping).
## Deploy one-liner
```sh
sh DEPLOY.sh          # SHA-gates the bundle, then prints the registration + verify
sh DEPLOY.sh --verify-only
```
## Verification
1. `sh DEPLOY.sh --verify-only` → `SHA OK: f45727589b05caba`.
2. `PLUTUS_L1_PATH=<kg.json> bun scripts/plutus-lsp.ts --selftest src/plutus-lsp/cards.ts` → SELFTEST OK, 13 cards, exit 0.
3. `PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` → 6/6 PASS (hermetic).
4. `PLUTUS_L1_PATH=<kg.json> bun test ./tests/` → 59 pass / 0 fail.
5. Restart a TUI session to arm the LSP.
## Honest state
The ocr audit lane is provider-down (Go 403, zen-free 429); the audit gate is satisfied by
fresh-context agent auditors. The live-TUI render proof is pending. NO SHIP-READY CLAIM beyond the
measured gates (battery 59/0, derailment 6/6, scope 7/7, noise 0.00).
## The boilerplate + the skill (project scoping built in)
See `boilerplate/` (the reusable kernel machinery + the configurable scope) and the
`create-knowledge-kernel` skill. A fresh project re-hosts the kernel by copying `boilerplate/
machinery/`, renaming the `PLUTUS_*` refusals, and setting `PLUTUS_LSP_SCOPE` to its own name.
---
## THE MODULE CONTRACTS
### scripts/plutus-lsp.ts — the stdio JSON-RPC server
Frame parser (Content-Length; MAX_STDIN 32MB; a 4KB header cap; a headerless cap; a 30s idle sweep
against the slow-loris; copy-on-drain so skip paths never pin the peak buffer). `fileOf(uri)`:
file:// → path (decode-last, UNC refused, Windows-drive normalized, `resolve` clamps `..`),
`realpathSync` for symlink safety, `SYSTEM_DENY` + `PLUTUS_ALLOWED_ROOTS` (canonicalized) confinement,
returns the CHECKED path. `analyze(uri)`: the scope gate FIRST (out-of-scope = silent) → pipeline →
`toDiagnostic` → serialized send (one resolver + dead-stream short-circuit + 5s timeout). Failure
policy: NEVER clear last-good (send nothing on a transient error; lexical retry; double-fault keep).
Single-flight per uri + a dirty flag (a trailing edit re-runs). `receipt()` + `log()` capped at ONE
choke point (512 chars).
### src/plutus-lsp/store.ts — the graph reader
`resolveRoot` (STRONG markers win at any depth). `l1PathFor` (env → local → cache → the LAW-BEARING
ancestor climb → known, each gated by `lawCount` with a 16MB size gate). `loadStore` (regular-file +
O_NONBLOCK + short-read named + JSON guards; law text capped AT LOAD: name 256 / statement 4000 /
anchor+source 512). `lawsForHunk` (declaration + hunk-token + 3-char name-part admission with
stopword filtering; a tier-weighted rank; topK clamped). `callersOf` (both-direction segment-bounded,
sorted). `isPlutusScoped` — THE CONFIGURABLE SCOPE GATE (see below).
### src/plutus-lsp/judge.ts — the decision kernel
`health` (clamped timeout; a bounded key-inspect, never a full stringify). `jevk5Fetch` (ONE batched
POST; a 256KB Content-Length check; a 64-key cap; a key-length cap; [0,1]-validated answers).
`chain` (the 7 nouls P1..P7; deduped; hasOwn-validated; capped state). `relevancePass` (per-candidate
nouls; an IMMUTABLE-first prioritized cap; judged/total/dropped visible). `verdict` (PURE CODE:
fail-closed jurisdiction, MAX over answered {P4,P5,P6}). Bars: throwT 0.85 / demandT 0.30 /
relevanceT 0.30 (getters, env-overridable, validated).
### src/plutus-lsp/cards.ts — the card renderer
`lawCard` (clean counts, capped totals). `verdictCard` (VIOLATION with a vacuous-evidence downgrade /
DRIFT with the clause from the verdict / SUSPECT with epsilon ties / STALE coded). `callersCard`
(measured). `staleCard` (null-guarded, allowlisted codes). `fileCards` (targetFile threaded; the
degraded card surfaced first). `cap()` bounds every interpolated string and strips C0/C1/DEL + unicode
separators + bidi controls. 6 tokens: law · violation · callers · drift · suspect · stale.
---
## THE CONFIGURABLE SCOPE (project scoping built in — the reuse seam)
The reflex runs ONLY inside a scoped tree; everything else is SILENT (no card, no receipt noise).
The generic root markers can LOCATE a root but never AUTHORIZE the reflex. A fresh re-host sets ONE
env var and gets scoping:
```
PLUTUS_LSP_SCOPE="MYPROJECT"                     # the path SEGMENT(s) meaning "my tree" (comma-list)
PLUTUS_LSP_SCOPE_FILES="myproj.yaml,.myproj"     # optional explicit scope FILES
```
Defaults: `PLUTUS` / `plutus.yaml,.plutus`. The decisive test: a path SEGMENT equals a scope segment
(the BASENAME — never child-existence: a dir merely HAVING a `<PROJECT>/` child must not scope its
siblings), OR an ancestor carries an explicit scope FILE (`isFile()`) BELOW `$HOME` (a marker
at/above `$HOME` scopes the whole home — meaningless). Verified: default OUT / custom segment IN /
custom file IN.
---
## THE MEASURED STATE (the gates)
| the measure | the result |
|---|---|
| battery | 59 pass / 0 fail / 199 expects |
| derailment suite | 6/6 PASS (hermetic — its own mini-Plutus graph) |
| scope gate | 7/7 (configurable) |
| noise ratio | 0.00 (was 2.0: 49 REFUSE + 197 L2 vs 124 PUBLISH) |
| the receipt rotation | proven live (13107276 → 155958 bytes) |
---
## THE AUDIT HISTORY (56 findings, all fixed)
Four rounds, each a fresh-context independent reader (the ocr lane is provider-down):
the r19 flaw-report (an agent found it mid-other-task), the r20 reviewer audit, the r21-r22 reviewer
re-audit, the r23 security audit (0 critical / 3 high / 4 medium / 3 low). Every finding is fixed +
pinned (A1-A46). The recurring class: a cap that existed SOMEWHERE but not on the HOTTEST path of its
surface. The law: THE CAP GOES AT THE ALLOCATION SITE.
---
## THE BOILERPLATE + THE SKILL
`boilerplate/` carries the reusable kernel machinery (byte-identical to `src/`) + the configurable
scope + the battery + the references. The `create-knowledge-kernel` skill orchestrates minting a
kernel for ANY project from it. A re-host: copy `boilerplate/machinery/`, rename the `PLUTUS_*`
refusals, replace the OBSERVABLE table, point `KNOWN_L1_PATHS` at its graph, set `PLUTUS_LSP_SCOPE`
to its own name.
---
## THE CHECKPOINT LINEAGE
13 checkpoints (PCSL-v0.1 .. v0.13), each with a manifest + SHA256SUMS. A fresh agent rebuilds from
the latest alone: source + bundle + canon + ship docs + the results artifacts.
# plutus-lsp-r23 — README
Fingerprint (bundle): `f45727589b05caba`.
## What this is
The PLUTUS-COMMON-SENSE-LSP at the security-hardened, scope-gated state: the reflexive canon LSP
(graph reader + JevK5 decision kernel + card renderer + stdio server), its battery (59 tests), its
derailment suite (6/6, hermetic), its evidence (4 audit rounds, 56 findings fixed), its docs (ship +
canon + generated), and its history (13 checkpoints).
**THE SCOPE GATE:** the reflex runs ONLY inside a PLUTUS-scoped tree — a path SEGMENT literally
`PLUTUS`, or an explicit `plutus.yaml`/`.plutus` FILE below `$HOME`. Everything else is SILENT.
CONFIGURABLE: `PLUTUS_LSP_SCOPE` / `PLUTUS_LSP_SCOPE_FILES` (a re-host sets these + gets scoping).
## Deploy one-liner
```sh
sh DEPLOY.sh          # SHA-gates the bundle, then prints the registration + verify
sh DEPLOY.sh --verify-only
```
## Verification
1. `sh DEPLOY.sh --verify-only` → `SHA OK: f45727589b05caba`.
2. `PLUTUS_L1_PATH=<kg.json> bun scripts/plutus-lsp.ts --selftest src/plutus-lsp/cards.ts` → SELFTEST OK, 13 cards, exit 0.
3. `PLUTUS_L1_PATH=<kg.json> bun scripts/derailment-suite.ts` → 6/6 PASS (hermetic).
4. `PLUTUS_L1_PATH=<kg.json> bun test ./tests/` → 59 pass / 0 fail.
5. Restart a TUI session to arm the LSP.
## Honest state
The ocr audit lane is provider-down (Go 403, zen-free 429); the audit gate is satisfied by
fresh-context agent auditors. The live-TUI render proof is pending. NO SHIP-READY CLAIM beyond the
measured gates (battery 59/0, derailment 6/6, scope 7/7, noise 0.00).
## The boilerplate + the skill (project scoping built in)
See `boilerplate/` (the reusable kernel machinery + the configurable scope) and the
`create-knowledge-kernel` skill. A fresh project re-hosts the kernel by copying `boilerplate/
machinery/`, renaming the `PLUTUS_*` refusals, and setting `PLUTUS_LSP_SCOPE` to its own name.
---
## THE MODULE CONTRACTS
### scripts/plutus-lsp.ts — the stdio JSON-RPC server
Frame parser (Content-Length; MAX_STDIN 32MB; a 4KB header cap; a headerless cap; a 30s idle sweep
against the slow-loris; copy-on-drain so skip paths never pin the peak buffer). `fileOf(uri)`:
file:// → path (decode-last, UNC refused, Windows-drive normalized, `resolve` clamps `..`),
`realpathSync` for symlink safety, `SYSTEM_DENY` + `PLUTUS_ALLOWED_ROOTS` (canonicalized) confinement,
returns the CHECKED path. `analyze(uri)`: the scope gate FIRST (out-of-scope = silent) → pipeline →
`toDiagnostic` → serialized send (one resolver + dead-stream short-circuit + 5s timeout). Failure
policy: NEVER clear last-good (send nothing on a transient error; lexical retry; double-fault keep).
Single-flight per uri + a dirty flag (a trailing edit re-runs). `receipt()` + `log()` capped at ONE
choke point (512 chars).
### src/plutus-lsp/store.ts — the graph reader
`resolveRoot` (STRONG markers win at any depth). `l1PathFor` (env → local → cache → the LAW-BEARING
ancestor climb → known, each gated by `lawCount` with a 16MB size gate). `loadStore` (regular-file +
O_NONBLOCK + short-read named + JSON guards; law text capped AT LOAD: name 256 / statement 4000 /
anchor+source 512). `lawsForHunk` (declaration + hunk-token + 3-char name-part admission with
stopword filtering; a tier-weighted rank; topK clamped). `callersOf` (both-direction segment-bounded,
sorted). `isPlutusScoped` — THE CONFIGURABLE SCOPE GATE (see below).
### src/plutus-lsp/judge.ts — the decision kernel
`health` (clamped timeout; a bounded key-inspect, never a full stringify). `jevk5Fetch` (ONE batched
POST; a 256KB Content-Length check; a 64-key cap; a key-length cap; [0,1]-validated answers).
`chain` (the 7 nouls P1..P7; deduped; hasOwn-validated; capped state). `relevancePass` (per-candidate
nouls; an IMMUTABLE-first prioritized cap; judged/total/dropped visible). `verdict` (PURE CODE:
fail-closed jurisdiction, MAX over answered {P4,P5,P6}). Bars: throwT 0.85 / demandT 0.30 /
relevanceT 0.30 (getters, env-overridable, validated).
### src/plutus-lsp/cards.ts — the card renderer
`lawCard` (clean counts, capped totals). `verdictCard` (VIOLATION with a vacuous-evidence downgrade /
DRIFT with the clause from the verdict / SUSPECT with epsilon ties / STALE coded). `callersCard`
(measured). `staleCard` (null-guarded, allowlisted codes). `fileCards` (targetFile threaded; the
degraded card surfaced first). `cap()` bounds every interpolated string and strips C0/C1/DEL + unicode
separators + bidi controls. 6 tokens: law · violation · callers · drift · suspect · stale.
---
## THE CONFIGURABLE SCOPE (project scoping built in — the reuse seam)
The reflex runs ONLY inside a scoped tree; everything else is SILENT (no card, no receipt noise).
The generic root markers can LOCATE a root but never AUTHORIZE the reflex. A fresh re-host sets ONE
env var and gets scoping:
```
PLUTUS_LSP_SCOPE="MYPROJECT"                     # the path SEGMENT(s) meaning "my tree" (comma-list)
PLUTUS_LSP_SCOPE_FILES="myproj.yaml,.myproj"     # optional explicit scope FILES
```
Defaults: `PLUTUS` / `plutus.yaml,.plutus`. The decisive test: a path SEGMENT equals a scope segment
(the BASENAME — never child-existence: a dir merely HAVING a `<PROJECT>/` child must not scope its
siblings), OR an ancestor carries an explicit scope FILE (`isFile()`) BELOW `$HOME` (a marker
at/above `$HOME` scopes the whole home — meaningless). Verified: default OUT / custom segment IN /
custom file IN.
---
## THE MEASURED STATE (the gates)
| the measure | the result |
|---|---|
| battery | 59 pass / 0 fail / 199 expects |
| derailment suite | 6/6 PASS (hermetic — its own mini-Plutus graph) |
