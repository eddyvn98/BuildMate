# Implementation Status

## Completed in current V1

- Guided homeowner intake and unknown-field workflow.
- Explicit confirmed/suggested/assumed/missing/blocked field states.
- Deterministic area calculation with trace metadata.
- Versioned indicative quantity profile.
- Three budget scenarios and construction-stage cash flow.
- Budget-target gap analysis and safe optimization suggestions.
- Alternative comparison model with safety scope locked.
- Price-book override model with provenance.
- Phase 2 actual-cost ledger and variance engine.
- Standards/module registry that prevents unverified modules from becoming construction-ready.
- Browser persistence and simple functional-plan display.
- Node test suite and GitHub Actions CI.

## Deliberately not represented as complete engineering design

The following domains have architecture and safety gates, but do not yet claim construction-ready calculations:

- code/local planning verification;
- loads/actions;
- reinforced-concrete member design;
- foundation/geotechnical design;
- electrical sizing/protection;
- water/drainage sizing;
- HVAC sizing.

Each requires exact applicable documents, formula/clause mapping, reference cases, project-specific inputs, and independent engineering review before the module status can become `verified`.
