# Release Status

Status date: 2026-09-29
Application version: 0.4.0

## Deployable software

BuildMate now has two deployable surfaces:

- static homeowner planning UI via Nginx;
- authenticated Node.js backend API with optional JSON-file persistence.

The repository includes Docker packaging for the web app and API plus a Compose stack with a persistent data volume.

## Product and workflow capabilities

- multi-project workspace and import/export;
- homeowner intake with explicit information states;
- deterministic planning-area, quantity, budget and cash-flow engines;
- sourced project-specific price overrides;
- design-version snapshots;
- construction actual-cost ledger;
- immutable backend calculation runs;
- document metadata storage;
- HTML reports and BOQ CSV export;
- project-date/locality-aware planning-rule resolution;
- QCVN 01:2021/BXD baseline through 2026-12-31 and QCVN 01:2026/BXD baseline from 2027-01-01.

## Engineering-review primitives implemented

- sourced explicit load combinations;
- sourced natural-condition inputs;
- gravity-load aggregation and simple-beam mechanics;
- RC demand/capacity verification against supplied capacities;
- foundation equivalent-area, bearing-utilization and eccentricity checks;
- conceptual pile count from supplied working capacity;
- service-current and cable ampacity checks;
- voltage-drop calculation;
- protection clearing-time check;
- PE adiabatic area from supplied fault current/time/k;
- domestic water/storage and pump-head arithmetic;
- pipe velocity and Manning full-pipe drainage flow;
- HVAC planning capacity;
- productivity-based duration.

## Construction-ready gate

No structural, foundation, electrical or water/drainage profile is marked construction-ready yet.

The code requires all of the following before a profile can pass:

1. exact standard and version;
2. applicability;
3. source;
4. verified clause/formula mapping and units;
5. automated reference cases;
6. recorded qualified independent review.

Issues #4 through #8 remain open specifically for that verification work. The missing independent professional review is an external approval step, not something BuildMate should fabricate or auto-approve.
