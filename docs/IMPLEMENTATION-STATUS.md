# Implementation Status

Status date: 2026-09-30  
Application version: 0.7.0

## Complete and usable now

- Multi-project local-first workspace and authenticated persistent API.
- Guided natural-language intake plus editable structured fields.
- Explicit confirmed/suggested/assumed/missing/blocked input states.
- Deterministic planning area, quantity, budget and cash-flow engines.
- Project price overrides with source/effective-date provenance.
- Design-version snapshots and actual construction cost tracking.
- A-to-Z project readiness board.
- Standards calculator with immutable calculation records and digests.
- Project engineering evidence records.
- HTML report, BOQ CSV and JSON backup/import.
- Syntax checks, automated tests, Docker and CI.

## Standards-backed engineering core

Tracked townhouse engineering coverage now includes:

- #4 Loads/actions — TCVN 2737:2023 + QCVN 02.
- #5 Reinforced concrete — TCVN 5574:2018 + applicable QCVN 06 checks.
- #6 Foundations — TCVN 9362:2012 + TCVN 10304:2025.
- #7 Electrical — QCVN 12 + TCVN 9206 + TCVN 7447 series.
- #8 Water/drainage/pumps — TCVN 4513 + TCVN 7957:2023 + TCVN 9222.
- #12 Residential HVAC/ventilation — TCVN 5687:2024.

Each tracked profile has machine-readable coverage, clause/formula provenance, conformance tests and a golden/reference benchmark. Software readiness does not depend on an independent-review record.

## Required project evidence remains gated

BuildMate still blocks a project calculation when its governing workflow requires evidence that cannot be inferred safely, including examples such as:

- official/locality climate or wind data;
- geotechnical investigation, SPT/CPT or pile-test data;
- manufacturer protective-device curves;
- field commissioning measurements;
- manufacturer pump/HVAC performance data.

This is a data/evidence requirement of the calculation workflow, not an independent-review requirement.

## v0.7 product objective

The product now tracks one project through:

brief → planning → budget/pricing → loads → RC → foundations → electrical → water/drainage → HVAC → report.

The next product-validation step is to run this flow with a real townhouse project dataset and improve input UX around the blockers that appear.
