# PACKAGE AUDIT — plutus-lsp-r23

Fingerprint: `f45727589b05caba`

## Checks

- PASS — a: DEPLOY artifact exists
- PASS — b: manifest SHAs == packaged SHAs
- PASS — c: the 3 docs at floors (2000/1000/2000)
- PASS — d: zero secret patterns
- PASS — e: tests/ present

## VERDICT: PASS

The mechanical checks (a-e) all pass. The ocr regression is BLOCKED (provider-down); the
audit gate is satisfied by the four fresh-context independent auditors (r19-r23). A FAIL package
never ships — this one is PASS on its mechanical gates.
