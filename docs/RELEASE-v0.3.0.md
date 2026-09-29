# BuildMate 0.3.0 Release Manifest

Release date: 2026-09-29  
Release type: software-complete planning / engineering-review prototype

## Verification

The release branch and merged main branch are required to pass:

- JavaScript syntax check;
- Node built-in automated test suite;
- Docker image build.

GitHub Actions is the release gate.

## Scope delivered

BuildMate now covers the homeowner workflow from initial needs through planning geometry, indicative quantities, budget alternatives, sourced price overrides, engineering previews, design-version comparison, cash flow, actual construction spending and report/export.

## Deployment

Static:
```bash
python3 -m http.server 4173
```

Container:
```bash
docker build -t buildmate:0.3.0 .
docker run --rm -p 8080:80 buildmate:0.3.0
```

Health:
```text
GET /healthz -> ok
```

## Known hard gates

Construction-ready standard profiles are not released in 0.3.0. Their acceptance criteria are tracked in issues #4-#9. Backend/cloud collaboration is tracked in #10.

This manifest intentionally distinguishes a complete software prototype from a signed engineering design system.
