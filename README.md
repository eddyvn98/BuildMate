# BuildMate

BuildMate is a Vietnam-focused townhouse planning and construction calculation assistant for homeowners.

## V1 goals

- Guide non-technical homeowners from needs to a structured project brief.
- Keep assumptions explicit: confirmed, assumed, suggested, missing, or blocked.
- Generate multiple budget scenarios without trading away safety.
- Use deterministic calculation modules for numbers; AI only interprets, explains, and proposes.
- Trace every calculated result back to inputs, formulas, coefficients, and source metadata.
- Support Vietnam locality-aware pricing through replaceable price datasets.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Test

```bash
node --test
```

## Current scope

V1 implements guided intake, project assumptions, planning-area calculation, indicative quantity takeoff, budget scenarios, stage cash flow, trace output, and engineering gates. Construction-grade structural/MEP design is intentionally gated until the required inputs and verified standard-specific modules are available.

See `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/CALCULATION-SAFETY.md`, and `docs/ROADMAP.md`.
