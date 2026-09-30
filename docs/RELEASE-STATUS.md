# Release Status

Status date: 2026-09-30  
Application version: 1.0.0

## v1.0 software-complete status

The planned homeowner A-to-Z software loop is complete: intake, current pricing, engineering calculators, editable technical schedules, detailed material takeoff, BOQ, actual-cost tracking, reports/exports and hosted deployment are all present.

This does **not** mean a project is construction-design ready. Geotechnical data, member-by-member structural analysis, approved architectural/MEP layouts, manufacturer data and professional/legal deliverables remain project-specific inputs/evidence.

## Technical Package status

v0.9 adds a preliminary full-house technical package: component schedules, material takeoff and BOQ. It is intended for planning, coordination and cost preparation; member sizes/detailing remain preliminary until replaced by project-specific structural/MEP design inputs and calculation evidence.

## Product status

BuildMate v0.8 is the **Homeowner Beta**: the engineering core is unchanged in scope, while the web UI is reorganized around homeowner decisions, guided calculations and traceability.

- Dashboard first screen: budget range, A→Z progress, blockers and next actions.
- Public sourced 4×16 m / 3-storey / 4-bedroom demo fixture.
- Guided forms for six primary engineering workflows.
- Raw JSON/evidence tools retained in Expert mode.
- Daily market-price history capture and trend UI.

## Engineering software status

The tracked townhouse engineering profiles #4, #5, #6, #7, #8 and #12 report **zero tracked software calculation gaps** (`pending: []`).

BuildMate now separates three concerns:

1. **Standards software readiness** — standard/version, applicability, clause/formula/table implementation, units, provenance, conformance tests and golden/reference benchmarks.
2. **Project evidence readiness** — authority/locality data, geotechnical tests, manufacturer curves/performance data, commissioning measurements and other project-specific inputs required by a calculation.
3. **Optional audit/review** — review records and fingerprints remain supported, but do not block the software profile from being standards-ready.

A profile being standards-ready does not authorize BuildMate to invent missing project evidence. Evidence-dependent calculations fail closed until the required records exist.

## HVAC v0.7

Residential HVAC/ventilation adds TCVN 5687:2024 workflows for:

- residential comfort-condition registry;
- sourced outdoor design conditions and design class;
- residential outdoor-air rates;
- mechanical ventilation by air-change rate;
- Appendix G sensible-heat and people/area/ACH airflow paths;
- source-backed component cooling load;
- source-backed equipment-capacity acceptance.

The legacy W/m² estimator remains planning-only and is marked deprecated for standards-backed HVAC work.

## Standards drift control

The standards status snapshot is date-stamped and exposes freshness health. BuildMate requires status re-verification when the snapshot becomes stale rather than assuming an old edition remains current.

## Current boundary

BuildMate produces deterministic and traceable software calculations. Project-specific permits, approvals, signed design deliverables or other obligations outside the calculation engine remain separate project/legal deliverables where applicable.
