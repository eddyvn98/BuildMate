# Implementation Status

Status date: 2026-09-29  
Application version: 0.3.0

## Complete and usable now

- Multi-project homeowner workspace.
- Natural-language intake plus editable structured fields.
- Explicit confirmed/suggested/assumed/missing/blocked states.
- Deterministic planning area calculations.
- Indicative quantity takeoff with trace metadata.
- Economy / balanced / comfort budget scenarios.
- Safe budget-fit analysis.
- Project-specific price overrides with provenance.
- Construction-stage cash-flow view.
- Engineering preview workspace.
- Functional block-plan view.
- Design-version snapshots.
- Actual construction cost tracking.
- JSON backup/import.
- HTML project report and BOQ CSV export.
- Syntax checking, automated tests and Docker deployment package.

## Engineering calculations available for planning/review

- Gravity-load aggregation from explicit area/load assumptions.
- Simple-beam reaction and moment primitive for a simply supported uniformly loaded model.
- Equivalent bearing-area estimate from supplied allowable soil pressure.
- Conceptual pile count from supplied working pile capacity.
- Electrical demand-current calculation.
- Cable ampacity comparison from supplied ampacity.
- Protective-conductor adiabatic-area calculation from supplied fault current, clearing time and material factor.
- Domestic water/storage estimate.
- Pump-head arithmetic.
- HVAC planning-capacity estimate.
- Productivity-based duration estimate.

## Deliberately gated

The app does not label structural, foundation, electrical, water/drainage, HVAC, fire-safety or parcel-planning outputs construction-ready until a verified standard profile and required project inputs exist.

Tracked work: GitHub issues #4 through #10.

This is a correctness boundary, not an unimplemented fallback: BuildMate must not replace missing geotechnical data, fault current, standard coefficients, local planning approvals or professional review with AI guesses.
