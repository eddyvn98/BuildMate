# Backend API Contract (planned)

The current browser app is local-first. This contract defines the backend boundary so persistence, collaboration and AI providers can be added without moving calculations into an LLM.

## Principles

- The server stores projects, versions, source documents, price books and calculation runs.
- Calculation engines remain deterministic and versioned.
- AI endpoints return **candidate field updates/explanations**, not authoritative engineering numbers.
- Every mutation has a project/version identifier.
- Calculation runs are immutable after creation.

## Proposed endpoints

```text
POST   /api/projects
GET    /api/projects
GET    /api/projects/{projectId}
PATCH  /api/projects/{projectId}
POST   /api/projects/{projectId}/versions
GET    /api/projects/{projectId}/versions

POST   /api/projects/{projectId}/intake/interpret
POST   /api/projects/{projectId}/calculate
GET    /api/projects/{projectId}/runs/{runId}

GET    /api/price-books?province=...&effectiveDate=...
POST   /api/projects/{projectId}/price-overrides

POST   /api/projects/{projectId}/actual-costs
DELETE /api/projects/{projectId}/actual-costs/{entryId}

POST   /api/projects/{projectId}/documents
GET    /api/projects/{projectId}/reports/{runId}
```

## Calculation request

```json
{
  "projectId": "uuid",
  "alternativeId": "uuid-or-null",
  "engineVersion": "0.3.x",
  "requestedModules": ["planning", "quantities", "budget", "engineering-preview"]
}
```

## Calculation response

```json
{
  "runId": "uuid",
  "status": "ready",
  "level": "indicative",
  "engineVersion": "0.3.x",
  "results": {},
  "issues": [],
  "gates": {},
  "sourceVersions": {
    "priceBook": "id",
    "standardProfiles": []
  }
}
```

## Future verified engineering endpoint

A verified standard profile must be explicitly selected. If the profile is not `verified`, the API must reject any request for `construction-ready` level output.
