# Roadmap

## Completed - v0.3.0 software prototype

### Product foundation

- Product requirements and homeowner-first workflow.
- Explicit information states and assumption handling.
- Deterministic-engine / AI boundary.
- Calculation trace and engineering safety levels.

### Planning and cost

- Land/floor-area calculations.
- Indicative quantity takeoff.
- Three budget scenarios.
- Safe budget-gap optimization.
- Construction-stage cash flow.
- Sourced project price overrides.

### Engineering workspace

- Current-reference standards registry.
- Gravity-load aggregation.
- Simple beam mechanics primitive.
- Equivalent shallow-foundation bearing-area preview from supplied soil input.
- Conceptual pile count from supplied pile capacity.
- Electrical service-current, ampacity-check and PE adiabatic primitives.
- Water/storage and pump-head primitives.
- HVAC planning load.
- Productivity-based duration primitive.

### Product lifecycle

- Multiple projects.
- Design versions.
- Actual construction spending/commitment ledger.
- JSON backup/import.
- HTML report and BOQ CSV export.
- Docker/Nginx package and CI.

## Verification backlog - construction-ready profiles

These are explicit engineering/review work items rather than hidden unfinished code:

- #4 Verify TCVN 2737:2023 load/action profile.
- #5 Implement/review TCVN 5574:2018 RC design profile.
- #6 Verify TCVN 9362:2012 and TCVN 10304:2025 foundation profiles.
- #7 Verify electrical profile for QCVN 12, TCVN 9206 and TCVN 7447-5-54.
- #8 Verify water/drainage profiles for TCVN 4513 and TCVN 7957:2023.
- #9 Implement locality-aware planning rule ingestion and QCVN 01 transition.
- #10 Add backend/auth/collaboration API.

## Release rule

A module may move to `construction-ready` only when its exact standard version, applicability, clause/formula mapping, units, reference cases and independent professional review are recorded. Until then BuildMate must continue to label the result planning/indicative/engineering-review.
