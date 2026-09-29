# Roadmap

## Completed - v0.4.0 application platform

### Product foundation

- Product requirements and homeowner-first workflow.
- Explicit confirmed/suggested/assumed/missing/blocked information states.
- Deterministic-engine / AI boundary.
- Calculation trace and engineering safety levels.
- Multiple projects, versions, actual costs and report exports.

### Planning and cost

- Land/floor-area calculations.
- Indicative quantity takeoff.
- Economy / balanced / comfort budgets.
- Safe budget-gap optimization.
- Construction-stage cash flow.
- Sourced project price overrides.
- Project-date and locality-aware planning rule ingestion.
- QCVN 01 transition handling.

### Backend and deployment

- Bearer authentication boundary.
- Per-user project ownership.
- Project/version CRUD.
- Immutable calculation runs.
- Price override, actual-cost and document metadata persistence.
- AI candidate-intake endpoint.
- Local-first JSON migration/import.
- JSON-file persistent server store.
- Static web and API containers with Compose deployment.
- CI syntax, test and Docker validation.

### Engineering software layer

- Profile readiness gate.
- Explicit load-combination engine.
- Natural-condition provenance requirement.
- RC demand/capacity review workflow.
- Foundation bearing and eccentricity checks.
- Electrical demand, ampacity, voltage drop, protection timing and PE primitives.
- Water demand/storage, pump head, pipe velocity and drainage-flow primitives.

## Remaining verification backlog - construction-ready profiles

These issues remain open because they require verified standard content and independent professional review:

- #4 TCVN 2737:2023 load/action clause mapping, reference cases and review.
- #5 TCVN 5574:2018 RC clause/formula implementation, reference cases and review.
- #6 TCVN 9362:2012 / TCVN 10304:2025 foundation verification and review.
- #7 QCVN 12 / TCVN 9206 / TCVN 7447-5-54 electrical verification and review.
- #8 TCVN 4513 / TCVN 7957:2023 water/drainage verification and review.

## Completed tracked work

- #9 locality-aware planning rule ingestion and QCVN 01 transition.
- #10 backend/auth/collaboration API boundary.

## Release rule

A module may move to `construction-ready` only when its exact standard version, applicability, clause/formula mapping, units, reference cases and independent professional review are recorded. Until then BuildMate labels the output planning, indicative or engineering-review.
