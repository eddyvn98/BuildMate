# Changelog

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
