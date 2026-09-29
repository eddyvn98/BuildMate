# Engineering Modules

## Design rule

BuildMate has two separate layers:

### Mechanics primitives

Pure calculations that can be independently tested, such as:

- gravity-load aggregation from explicit area/load assumptions;
- simply supported beam reactions/moment under uniform load;
- load divided by explicit allowable bearing pressure;
- service-current calculation from explicit electrical inputs;
- adiabatic PE area from explicit fault current, clearing time and material factor;
- water volume, pump head and cooling planning calculations.

These calculations are deterministic and traceable, but are not automatically compliant design.

### Standard profiles

A standard profile maps actual clauses, coefficients, combinations, limits, material models and detailing rules to those primitives. A profile can only become `verified` after reference cases and independent review.

## V2 outputs

The current engineering workspace can produce:

- building gravity-load preview;
- equivalent foundation bearing-area preview if allowable bearing pressure is supplied;
- conceptual pile count if working pile capacity is supplied;
- electrical demand current if connected load is supplied;
- domestic water/storage planning;
- HVAC capacity planning;
- schedule productivity calculations.

## Hard blockers

BuildMate must not infer:

- soil bearing capacity;
- working pile capacity;
- fault current;
- protection clearing time;
- cable ampacity;
- material k-factor;
- structural material strengths;
- design load combinations;
- rebar detailing;
- local planning approval.

Those values must come from verified profiles, project documents, supplier data, measurements or qualified engineering inputs.
