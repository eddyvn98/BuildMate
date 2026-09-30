# Release Status

Status date: 2026-09-30
Application version: 0.6.0

## Engineering software status

For tracked engineering issues #4-#8, BuildMate's machine-readable standard coverage currently reports **zero remaining software calculation gaps** (`pending: []`).

This means the implemented engine contains the TCVN/QCVN calculation/table branches currently tracked by those profiles. It does **not** mean project-specific source evidence can be invented or that professional verification can be skipped.

The system separates three layers:

1. **Standard software coverage** — formulas, tables, applicability checks, provenance, conformance tests and golden reference benchmarks.
2. **Project evidence** — locality authority rows, geotechnical investigation/tests, manufacturer curves, commissioning measurements, pump test reports or specialist evidence where the standard requires them.
3. **Verification** — review of the exact code/evidence fingerprint. A changed project evidence set invalidates the previous review fingerprint.

## Standards drift control

The standards status snapshot was verified on 2026-09-30. The application exposes freshness health and requires re-verification when that snapshot becomes stale instead of assuming an old edition remains current.

## Engineering API surfaces

- `GET /api/standards/coverage`
- `GET /api/standards/status`
- `GET /api/engineering/review-packets`
- `GET /api/engineering/review-packets/{issue}`
- `POST /api/projects/{id}/engineering-evidence`
- `GET /api/projects/{id}/engineering-evidence`
- `GET /api/projects/{id}/engineering-reviews/fingerprint`
- `POST /api/projects/{id}/engineering-reviews`
- `GET /api/projects/{id}/engineering-reviews`
- `GET /api/projects/{id}/engineering-readiness`

## Current boundary

BuildMate does not substitute arbitrary constants when a TCVN/QCVN requires project-, test-, authority- or manufacturer-specific evidence. Such inputs are represented as evidence gates and are included in the signed project fingerprint.
