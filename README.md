# BuildMate

BuildMate is a Vietnam-focused townhouse planning, calculation and construction-control assistant for homeowners.

The product is designed around one hard boundary:

> AI interprets and explains. Deterministic, versioned engines produce BuildMate numbers.

## Current V2

- Multiple house projects in one browser.
- Guided natural-language intake + editable fields.
- Confirmed / suggested / assumed / missing / blocked data states.
- Planning area and indicative quantity takeoff.
- Economy / balanced / comfort budgets.
- User price overrides with source and effective date.
- Safe budget optimization that never cuts locked safety scope.
- Construction-stage cash flow.
- Engineering preview for structure, foundations, electrical, water and HVAC.
- Simple 2D functional block plan.
- Saved design versions.
- Actual construction cost tracking.
- JSON backup/import, HTML report and BOQ CSV export.
- Current Vietnam standards registry with construction-ready gates.
- Automated tests, syntax checks and Docker packaging.

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

## Backend API

```bash
AUTH_SECRET=replace-me DATA_FILE=./data/buildmate.json npm run start:api
```

The API listens on port `3000` by default. When `DATA_FILE` is set, projects, immutable calculation runs and document metadata survive restarts.

## Docker

```bash
docker build -t buildmate .
docker run --rm -p 8080:80 buildmate
```

Open `http://localhost:8080`; health check is `/healthz`.

For the static web + persistent API together:

```bash
AUTH_SECRET=replace-me docker compose up --build
```

The API is then available on `http://localhost:3000` and persists data in the `buildmate-data` volume.

## Important engineering status

V2 is software-complete as a planning/engineering-review prototype. It intentionally does **not** mark structural or MEP modules construction-ready until exact standard clauses/formulas, project inputs, reference cases and qualified review are completed.

See:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ENGINEERING-MODULES.md`
- `docs/STANDARDS-REGISTRY.md`
- `docs/RELEASE-STATUS.md`
- `docs/API-CONTRACT.md`
