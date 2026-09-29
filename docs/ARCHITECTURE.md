# Architecture

## 1. Shape

BuildMate uses a layered architecture:

```text
UI / conversation
      |
Intake interpreter
      |
Project domain model
      |
Workflow + validation
      |
Deterministic engines
      |
Trace + warnings + scenario outputs
```

## 2. Hard boundary

AI is not a calculator of record. An AI provider can turn language into candidate field updates and explanations, but all numeric outputs displayed as BuildMate results must come from deterministic modules.

## 3. V1 modules

- `src/engine/project.js`: canonical project and field-state helpers.
- `src/engine/validation.js`: required-input checks and engineering gates.
- `src/engine/area.js`: planning-area calculation.
- `src/engine/quantity.js`: indicative quantity takeoff with versioned coefficients.
- `src/engine/budget.js`: price/scenario calculations.
- `src/engine/cashflow.js`: construction-stage allocation.
- `src/engine/trace.js`: uniform calculation trace records.
- `src/ai/intake.js`: deterministic natural-language hints for V1; replaceable with an LLM provider later.
- `src/ui/*`: browser UI.

## 4. Persistence

V1 uses browser `localStorage` through a small repository adapter. The domain model is storage-agnostic so a database API can replace it later.

Planned backend entities:

- users
- projects
- alternatives
- project_fields
- calculation_runs
- calculation_results
- assumptions
- price_books
- price_items
- products
- standards_registry
- schedules
- actual_costs (Phase 2)

## 5. Versioning

A calculation run references versions of:

- engine;
- coefficient set;
- price book;
- standard/profile metadata.

Changing one of those creates a new run; old results remain inspectable.

## 6. Future engineering modules

Engineering modules must be independently testable and standard-specific:

- loads/actions;
- reinforced concrete member checks;
- foundations/geotechnical;
- electrical load/protection/cable sizing;
- water supply;
- drainage;
- ventilation/air-conditioning.

A module is not marked `verified` until its formulas, unit handling, test cases, and standard references have been independently reviewed.
