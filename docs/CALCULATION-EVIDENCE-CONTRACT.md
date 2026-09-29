# Calculation Evidence Contract

Every BuildMate engineering result intended for technical review must be reproducible.

Required evidence:

1. **Standard** — exact QCVN/TCVN identifier and version.
2. **Clause** — clause/table/equation supporting the calculation or acceptance check.
3. **Source URL** — official source where available; otherwise record the exact accessible copy used alongside the official registry source.
4. **Formula** — formula identifier or formula text.
5. **Inputs** — every numerical input used by the engine.
6. **Provenance** — project/geotechnical/manufacturer/test source for values not fixed by the standard.
7. **Checks** — intermediate values and applicability/domain checks when the formula has limits.

`src/engine/evidence-audit.js` enforces this contract in automated tests.

`src/engine/calculation-proof.js` turns an engineering result into an inspectable proof payload for API/report presentation.

A result with missing evidence must not be promoted to construction-ready status.
