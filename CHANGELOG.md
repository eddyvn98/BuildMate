# Changelog

## 0.5.0 - 2026-09-30

### Standards-first engineering

- Replaced engineering placeholders with source-backed QCVN/TCVN inputs and blocked missing provenance.
- Added machine-readable standard/clause/formula/source metadata and calculation evidence audit.
- Added explicit townhouse-core engineering scope for 1-5 storey Vietnam townhouses; unsupported extensions fail closed.
- Added independent-review packets, evidence fingerprints, project review records, verification status and project readiness reporting.

### Loads - TCVN 2737:2023 / QCVN 02:2022/BXD

- Load combination factors, live-load tables and area/storey reduction.
- Permanent-load reliability factors from sourced material layers.
- Wind W0, terrain k(ze), rigid-structure gust factor, rectangular wall coefficients, pitched-roof F.5 coefficients and bounded interpolation.
- HCMC QCVN 02 wind-zone rows; other localities can still use explicit sourced wind-zone input.

### Reinforced concrete - TCVN 5574:2018

- Concrete/rebar material tables.
- Rectangular flexure, simplified shear and eccentric-compression column checks.
- Column second-order rigidity, Ncr and eta.
- Crack width, deflection acceptance/curvature workflow.
- Cover, clear spacing, transverse spacing, minimum reinforcement, anchorage and lap-splice rules.
- Separate beam/slab/column workflows requiring TCVN 2737 load trace.

### Foundations - TCVN 9362:2012 / TCVN 10304:2025

- Bearing/eccentricity, conventional resistance adjustment and Appendix C settlement workflow.
- Rectangular stress-influence alpha interpolation within verified domain.
- End-bearing and driven/pressed friction pile capacity from sourced geotechnical inputs.
- Geotechnical investigation document gate.
- Preliminary pile-group loading, model convergence and sourced external group-settlement adapter.

### Electrical - QCVN 12 / TCVN 9206 / TCVN 7447 series

- Demand/coincidence, residential power factor and voltage-drop limits.
- Copper PVC A1/A2/B1/B2/C/D1/D2 ampacity profiles and correction factors.
- QCVN overload and short-circuit breaking-capacity checks.
- TN/TT disconnection/fault-loop checks.
- PE section and adiabatic sizing.
- Source-backed manufacturer trip-curve interpolation.

### Water and drainage - TCVN 4513 / TCVN 7957:2023

- Fixture-unit demand, pipe sizing/velocity/pressure and DN10-DN150 friction workflow.
- Pump duty point and source-backed Q-H curve checks.
- Gravity drainage Manning, fill, minimum self-cleansing velocity, maximum velocity, diameter and slope rules.

### Construction-ready boundary

Software evidence for the defined townhouse core is now packaged for independent engineering review. No profile becomes construction-ready until a review is approved, independently verified and still matches the signed evidence fingerprint.

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
