# Release Status

Status date: 2026-09-30
Application version: 0.5.0

## Product status

BuildMate is a deployable Vietnam townhouse planning and engineering-review application for the PRD scope of 1-5 storey townhouses.

The engineering core now follows a standards-first rule:

- no technical placeholder silently becomes an engineering input;
- every implemented engineering calculation carries standard, clause/table/equation, source URL, formula/algorithm and explicit inputs;
- project/geotechnical/manufacturer values require provenance;
- unsupported standard branches fail closed.

## Townhouse-core review readiness

Issues #4-#8 now have:

- versioned standards and applicability;
- implemented clause maps;
- automated reference cases;
- evidence audit;
- explicit supported townhouse scope and blocked extensions;
- independent-review packets exposed by API;
- evidence fingerprinting and persisted review records;
- project readiness reporting that invalidates review when signed evidence changes.

The remaining construction-ready blocker is a real independent professional review and its verification. BuildMate does not fabricate that approval.

## Engineering API surfaces

- `GET /api/standards/coverage`
- `GET /api/engineering/review-packets`
- `GET /api/engineering/review-packets/{issue}`
- `GET /api/projects/{id}/engineering-reviews/fingerprint`
- `POST /api/projects/{id}/engineering-reviews`
- `GET /api/projects/{id}/engineering-reviews`
- `GET /api/projects/{id}/engineering-readiness`

## Broader extensions

The engine intentionally blocks cases outside the initial townhouse-core scope instead of guessing. Examples include flexible/high-dynamic wind cases, uncommon aerodynamic geometry, RC section branches not yet implemented, broad aluminium/XLPE cable families, and large/special foundation numerical models.
