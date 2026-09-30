# Roadmap

## Completed - v0.5.0 standards-first townhouse core

### Application platform

- Local-first/web workspace, persistent authenticated API and Docker deployment.
- Multi-project data, versions, actuals, sourced price overrides, immutable calculation runs and reports.
- QCVN 01 project-date/locality planning-rule resolution.

### Engineering evidence platform

- Standard/clause/formula/source metadata.
- Calculation evidence audit and proof payloads.
- Townhouse-core scope vs blocked extension model.
- Independent-review packets.
- Evidence fingerprints tied to commit/evidence.
- Persisted reviewer record and verification status.
- Per-project engineering readiness.

### Townhouse engineering core

- #4 Loads: TCVN 2737:2023 + QCVN 02 wind/load workflow for implemented townhouse cases.
- #5 RC: TCVN 5574:2018 rectangular beam/slab/column ULS/SLS/detailing workflow.
- #6 Foundations: TCVN 9362:2012 shallow-foundation and TCVN 10304:2025 pile/geotechnical workflow.
- #7 Electrical: QCVN 12 + TCVN 9206 + TCVN 7447 demand/cable/protection/earthing workflow.
- #8 Water/drainage: TCVN 4513 + TCVN 7957:2023 demand/hydraulic/pump/drainage workflow.
- #9 Locality-aware planning rules and QCVN 01 transition.
- #10 Backend/auth/collaboration boundary.

## Remaining gate before construction-ready

For issues #4-#8 the remaining mandatory gate is qualified independent review of the exact evidence fingerprint and verification of that reviewer record.

Cases listed as blocked extensions are not silently calculated. They require an additional standard branch/module before BuildMate may evaluate them.

## Release rule

A supported townhouse-core module may be marked construction-ready only when:

1. the project stays inside the declared supported scope;
2. all required project/source inputs are satisfied;
3. evidence audit passes;
4. automated reference cases pass;
5. the independent reviewer approves the exact evidence fingerprint;
6. the review record is independently verified and not revoked.
