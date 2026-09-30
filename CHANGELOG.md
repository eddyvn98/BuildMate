# Changelog

## 0.9.0 - 2026-09-30

### Technical Package

- Added parametric schedules for slabs, beams, columns, footings, foundation tie beams and stairs.
- Added reinforcement detailing display for each member type.
- Added geometry/detailing-based quantity takeoff: concrete, formwork, rebar by diameter, masonry, finishes, electrical cables/points and plumbing fixtures/pipes.
- Added preliminary technical BOQ using current market rates where supported, with unpriced rows preserved explicitly.
- Added Technical Package homeowner view and detailed HTML/CSV exports.
- Bumped calculation provenance defaults to engine version 0.9.0.
- Preserved legacy planning quantity rows in BOQ CSV for audit/backward compatibility.


## 0.8.1 - 2026-09-30

### Beta UI QA

- Public demo functional plan now follows its sourced floor program instead of the generic room allocator.
- Renamed the dashboard completion label to "Luồng BuildMate" and clarified that it is not construction approval.
- Kept the A-to-Z demo action available on mobile instead of hiding it.
- Added keyboard focus visibility and larger mobile touch targets.
- Added confirmation before deleting a local project.
- Added regression tests for demo-plan fidelity, workflow wording and mobile accessibility.


## 0.8.0 - 2026-09-30

### Homeowner Beta

- Reorganized the web UI into Overview, Home Info, Engineering, Pricing and Report views.
- Added a public composite 4x16 m / 3-storey / 4-bedroom demo fixture with explicit source provenance and demo assumptions.
- Added prioritized homeowner next actions from the A-to-Z readiness model.
- Added guided forms for permanent load, RC beam, shallow settlement, XLPE cable sizing, domestic water flow and residential outdoor air.
- Kept raw JSON calculator and engineering-evidence entry under Expert mode.
- Added human-readable calculation explanations with formula/basis, key results, steps and immutable digest.
- Added daily market-price history recording and trend/material-drift UI.
- Bumped application/package version to 0.8.0; deterministic engineering formulas remain the existing standards-backed core.


## 0.7.0 - 2026-09-30

### Standards-backed readiness

- Removed independent engineering review as a mandatory software-readiness blocker.
- Profiles become standards-ready from identified standard/version, applicability, clause/formula mapping, executable reference cases and zero tracked software gaps.
- Project/site/manufacturer/test evidence remains mandatory when required by the calculation workflow.
- Independent review records and evidence fingerprints remain available as optional audit history.

### Residential HVAC / TCVN 5687:2024

- Added residential comfort conditions, HVAC design classes and sourced outdoor design conditions.
- Added residential outdoor-air, ACH and Appendix G sensible-heat/people/area/ACH airflow calculations.
- Replaced standards-backed W/m² cooling sizing with source-backed component cooling-load aggregation.
- Added source-backed equipment-capacity acceptance.
- Added HVAC project-evidence records, conformance tests and a golden outdoor-air benchmark.

### A-to-Z product flow

- Added project progress from brief and pricing through loads, RC, foundations, electrical, water/drainage, HVAC and final report.
- Expanded API/report/readiness coverage from five to six engineering profiles.
- Bumped deterministic engine/package version to 0.7.0.


## 0.6.0 - 2026-09-30

### Tracked TCVN/QCVN calculation coverage reaches zero software gaps

For engineering issues #4-#8, the machine-readable standard coverage now has `pending: []`. Remaining requirements are explicitly classified as project/manufacturer/test evidence or independent verification rather than missing formulas.

### Loads and wind

- Completed TCVN 2737:2023 rigid and flexible wind workflows, including Eq.(13)-(24), Table 10, wall/roof aerodynamic cases and bounded interpolation rules.
- QCVN 02 locality registry validates W0/V metrics and supports sourced official rows without guessing.
- F.12 opening-ratio interval without a prescribed interpolation rule remains explicitly blocked as a standard-defined evidence gap, not filled by invention.

### Reinforced concrete

- Completed rectangular and T/I flexure, both eccentric-compression branches, dangerous inclined-section shear search, crack and deflection workflows.
- Added automatic cracked-section neutral axis, transformed inertia/rigidity and curvature.
- Consolidated concrete material/creep/working-condition formulas behind one canonical TCVN 5574 registry while retaining backward-compatible API wrappers.
- Added local compression/anchorage/detailing and QCVN 06 nominal fire geometry/cover checks.

### Foundations

- Completed full TCVN 9362 Appendix C influence-table workflow used by the engine.
- Completed TCVN 10304 SPT/CPT/static-test processing, long/short pile settlement and pile-group interaction settlement.
- Geotechnical test data remain explicit project evidence, not software assumptions.

### Electrical

- Completed PVC/XLPE-EPR copper/aluminium ampacity families used by the tracked profile, including free-air E/F/G and correction factors.
- Added source-network/field loop verification workflow under TCVN 7447-6.
- Manufacturer trip curves and commissioning measurements are persisted as project engineering evidence.

### Water, drainage and pumps

- Completed small and large TCVN 4513 hydraulic resistance branches and TCVN 7957 gravity-drainage checks.
- Added TCVN 9222 Q/H/efficiency and NPSH/cavitation acceptance workflow.
- Manufacturer pump reports are persisted as source evidence.

### Proof and drift control

- Added active-standard status snapshot and freshness health endpoint.
- Added executable conformance catalog whose referenced test files must exist.
- Added golden hand-derived TCVN/QCVN benchmark cases for issues #4-#8.
- Project technical reports now include standard-version health, conformance groups, golden benchmarks, project-evidence digests and review state.
- Independent review fingerprints now include project engineering evidence; changing geology, device curves, commissioning measurements or pump reports invalidates the old review automatically.

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
