# Release Status

## Software-complete prototype

BuildMate V2 is a deployable local-first web application with:

- multi-project persistence;
- homeowner intake;
- explicit field states;
- planning-area calculation;
- indicative quantities;
- project price overrides with provenance;
- budget alternatives and safe budget-gap analysis;
- cash-flow staging;
- engineering preview workspace;
- simple functional block plan;
- design-version checkpoints;
- construction actual-cost ledger;
- JSON project backup/restore;
- HTML report and BOQ CSV export;
- syntax checking and automated tests;
- Docker/Nginx deployment packaging.

## Engineering modules implemented as review/planning primitives

- gravity load aggregation;
- simple-beam mechanics primitive;
- equivalent foundation bearing-area calculation from **supplied** allowable pressure;
- conceptual pile count from **supplied** working pile capacity;
- service-current calculation;
- cable ampacity check from **supplied** ampacity;
- PE adiabatic area from **supplied** fault current/time/k;
- domestic water/storage planning;
- pump-head arithmetic;
- HVAC capacity planning;
- productivity-based schedule duration.

## Intentionally blocked from construction-ready status

BuildMate does not claim final design compliance for:

- local parcel planning/legal approval;
- load combinations and natural-condition actions;
- RC member sizing/reinforcement/detailing;
- shallow/pile foundation final design;
- cable/CB/earthing final selection;
- water/drainage pipe sizing;
- HVAC equipment/system design;
- fire-safety design.

Why: public standard metadata confirms which documents are current, but full clause/formula implementation, licensed source access where needed, project-specific inputs, independent reference cases and qualified engineering review are still required.

The application enforces this distinction in its standard registry and gates rather than presenting a planning calculation as a signed design.
