# BuildMate

BuildMate is a Vietnam-focused townhouse planning, standards-backed calculation and construction-control assistant for homeowners.

The product has one hard boundary:

> AI interprets and explains. Deterministic, versioned engines produce BuildMate numbers.

## Current v0.8.1 — Homeowner Beta

- Homeowner dashboard with clear navigation: Overview, Home Info, Engineering, Pricing and Report.
- Public 4×16 m / 3-storey / 4-bedroom reference fixture with explicit source provenance and demo-only assumptions.
- Guided engineering forms for loads, RC beam, shallow-foundation settlement, cable sizing, domestic water flow and residential outdoor air; raw JSON remains available in Expert mode.
- Multi-project homeowner workspace with guided natural-language intake.
- Confirmed / suggested / assumed / missing / blocked input states.
- Planning area, indicative quantities, Economy / Balanced / Comfort budgets and stage cash flow.
- Fresh TP.HCM market pricing with source/date provenance, robust price ranges, daily price-history capture and project-specific overrides.
- Daily market-price refresh with fail-closed freshness gates, design versions and actual-cost tracking.
- A-to-Z readiness board plus prioritized "what to do next" actions from project brief to technical calculations and report.
- Standards-backed calculation workflows for loads, reinforced concrete, foundations, electrical, water/drainage/pumps and residential HVAC.
- TCVN/QCVN clause/formula/source/input provenance, executable conformance tests and golden reference benchmarks.
- Project evidence gates for data that the applicable standard requires from the site, authority, manufacturer or test/commissioning records.
- Optional engineering audit/review records and evidence fingerprints; review is not a mandatory software-readiness gate.
- JSON backup/import, HTML report and BOQ CSV export.
- Authenticated API, persistent storage, Docker packaging and CI.

## Readiness model

A calculation/profile is **standards-ready** when its tracked standard coverage has:

1. an identified document/version and applicability;
2. implemented clause/formula/table mappings;
3. explicit units and input provenance;
4. executable conformance/reference tests;
5. no tracked software calculation gap.

A project calculation may still be blocked when the standard requires project-specific evidence such as locality data, geotechnical investigation, manufacturer curves or commissioning measurements. BuildMate does not replace those inputs with assumptions.

Independent review remains available as an optional audit trail and fingerprint, but is not required to close a software implementation gap.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Test

```bash
npm run check
npm test
```

## Refresh market prices

```bash
npm run refresh:prices
```

The default-branch GitHub Actions workflow checks the supported TP.HCM pricing sources every day at 00:15 UTC (07:15 Vietnam time). A source is refreshed only when its parser can recover a valid price/date. Failed sources keep their previous value but do not get a new `verifiedAt`; stale data therefore expires naturally. The refresh job refuses to write a snapshot when its minimum source-quality gate is not met.

See `docs/PRICING-REFRESH.md` for source tiers, freshness rules and failure behavior.

## Backend API

```bash
AUTH_SECRET=replace-me DATA_FILE=./data/buildmate.json npm run start:api
```

The API listens on port `3000` by default.

## Public demo project

Use **Nạp demo 4×16** in the web UI to load a public composite townhouse fixture. **Chạy demo A→Z** executes one standards-backed calculation in each of the six tracked engineering domains. The fixture clearly separates public facts from BuildMate assumptions and synthetic engineering test inputs; it is for product validation, not construction.

## Docker

```bash
AUTH_SECRET=replace-me docker compose up --build
```

The static app and persistent API are packaged together; API data persists in the `buildmate-data` volume.

## Main documentation

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ENGINEERING-MODULES.md`
- `docs/STANDARDS-REGISTRY.md`
- `docs/RELEASE-STATUS.md`
- `docs/ROADMAP.md`
- `docs/API-CONTRACT.md`
