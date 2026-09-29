# BuildMate Product Requirements Document

## 1. Product statement

BuildMate helps a homeowner in Vietnam plan a 1-5 storey townhouse from early needs through design choices, quantities, budget, schedule, and eventually construction tracking.

The user is not expected to know construction terminology. The system asks progressively clearer questions, explains unknowns, records assumptions, and maps answers into deterministic workflows.

## 2. Product principles

1. AI understands people; calculation engines produce numbers.
2. Unknown information is never silently invented.
3. Every engineering or cost result is traceable.
4. Safety, code compliance, and required technical checks are not sacrificed to meet a budget.
5. Results progress from overview to detail.
6. Multiple design/budget alternatives are first-class objects.
7. Pricing is locality- and time-sensitive, with source metadata and user override.
8. A homeowner can use the app; an engineer can inspect how a result was produced.

## 3. Target user and scope

- Primary user: homeowner without specialist construction knowledge.
- Country: Vietnam.
- Initial building type: townhouses, 1-5 storeys.
- Price context: province/city, district where available, effective date, source.
- Phase 1: planning, design options, deterministic estimates, BOQ-oriented quantities, budget and cash flow.
- Phase 2: actual construction tracking, invoices, contracts, progress, changes, inspections, photos.

## 4. Core journey

1. Create project.
2. Describe land and location.
3. Describe household and usage needs.
4. Capture planning/legal constraints known by the user.
5. Capture budget and scope of budget.
6. Generate build-size and functional-layout options.
7. Display a simple 2D functional diagram.
8. Create a conceptual structural model.
9. Run only calculations whose required inputs are satisfied.
10. Produce quantity takeoff and material/equipment choices.
11. Apply locality-aware unit prices.
12. Generate three budget scenarios: economy, balanced, comfort.
13. Optimize allowed items if the target budget is exceeded.
14. Build stage schedule and cash-flow view.
15. Export/share a traceable report.

## 5. Information states

Every important input carries one state:

- confirmed: explicitly supplied or approved by user.
- suggested: proposed by BuildMate but not yet approved.
- assumed: temporary value used to continue an indicative calculation.
- missing: optional information not yet supplied.
- blocked: required before a specific calculation can proceed.

The UI must never collapse assumed/suggested values into confirmed values.

## 6. AI responsibilities

AI may:

- understand natural-language descriptions;
- map answers into form fields;
- ask targeted follow-up questions;
- explain technical terms at the user's level;
- propose alternatives;
- summarize trade-offs;
- identify missing or contradictory inputs.

AI must not:

- fabricate engineering inputs;
- silently change confirmed technical values;
- emit final calculated numbers outside deterministic engines;
- downgrade safety/code requirements to satisfy budget;
- present an indicative result as construction-ready.

## 7. Calculation and trace requirements

Each calculated output must store:

- result id and value;
- unit;
- input values and their states;
- formula or algorithm id;
- coefficient/version id;
- source or standard metadata where applicable;
- timestamp/version;
- warnings and blocked dependencies.

## 8. Budget scenarios

BuildMate produces three scenarios by default:

- Economy: reduce finish/equipment spend and optional scope.
- Balanced: target the user's stated priorities with moderate finishes.
- Comfort: preserve desired features and increase finish/equipment allowance.

Structural safety, mandatory waterproofing, electrical protection, and legal requirements are locked from budget optimization.

## 9. V1 acceptance criteria

- Project data can be entered using guided fields with unknowns allowed.
- App shows status for every important input.
- App calculates planning floor area deterministically.
- App generates indicative quantities from versioned coefficients.
- App generates three cost scenarios and stage cash flow.
- User can override locality price assumptions.
- App shows trace details for every calculated number.
- App blocks construction-grade structural/MEP conclusions when prerequisites are missing or unverified.
- Test suite covers core deterministic calculations and safety gates.
- No source file should exceed roughly 300 lines without a strong reason.
