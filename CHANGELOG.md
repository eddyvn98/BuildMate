# Changelog

## 0.4.0 - 2026-09-29

### Added

- Authenticated backend API with per-user project ownership.
- Immutable calculation runs and design-version endpoints.
- Persistent JSON-backed server store for projects, runs and document metadata.
- API persistence for sourced project price overrides and actual construction costs.
- AI intake API that returns candidate updates only; deterministic workflow remains calculator of record.
- Local-first project import path.
- Locality-aware planning rules with project-date-driven QCVN 01:2021/BXD to QCVN 01:2026/BXD transition.
- Engineering profile readiness gates for source/version, applicability, clause maps, reference cases and independent review.
- Explicit sourced load-combination and natural-condition primitives.
- RC demand/capacity review workflow without inferred material strengths/capacities.
- Foundation bearing-utilization and eccentricity checks from explicit inputs.
- Electrical voltage-drop and protection-disconnection checks.
- Water pipe velocity and drainage Manning-flow primitives.
- Static web + persistent API Docker Compose deployment.

### Completed backlog

- #9 locality-aware planning rules and QCVN 01 transition.
- #10 backend, authentication and collaboration API boundary.

### Engineering verification boundary

Issues #4 through #8 remain open because construction-ready status requires exact standard clause/formula mapping, validated reference cases and qualified independent professional review. BuildMate now enforces those requirements in code instead of silently treating review primitives as final design.

## 0.3.0 - 2026-09-29

### Added

- Multi-project local-first workspace with legacy migration.
- Guided homeowner intake with confirmed/suggested/assumed/missing/blocked field states.
- Deterministic planning-area, quantity, budget and cash-flow engines.
- Three budget alternatives and safe budget-gap optimization.
- Project-specific price overrides with source/effective-date provenance.
- Engineering preview workspace for loads, foundations, electrical, PE, water, HVAC and schedule primitives.
- Current Vietnam standards registry with explicit verification states.
- Simple functional block-plan view.
- Design-version checkpoints.
- Actual construction cost ledger.
- JSON backup/import, HTML report and BOQ CSV export.
- Syntax checks, automated tests and Docker/Nginx deployment packaging.
- Backend API contract for the next persistence/collaboration layer.

### Safety boundary

Version 0.3.0 is a software-complete planning/engineering-review prototype. Standard profiles remain blocked from construction-ready output until exact clause/formula mapping, project-specific inputs, reference cases and qualified independent review are completed.

### Tracked verification work

- #4 TCVN 2737:2023 load/action profile
- #5 TCVN 5574:2018 reinforced-concrete profile
- #6 TCVN 9362:2012 / TCVN 10304:2025 foundation profiles
- #7 QCVN 12 / TCVN 9206 / TCVN 7447-5-54 electrical profile
- #8 TCVN 4513 / TCVN 7957:2023 water and drainage profiles
- #9 locality-aware planning rules and QCVN 01 transition
- #10 backend, authentication and collaboration
