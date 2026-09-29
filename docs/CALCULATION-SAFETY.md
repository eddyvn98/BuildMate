# Calculation Safety and Engineering Gates

## 1. Result levels

BuildMate classifies results into four levels:

1. `planning`: suitable for early planning and comparison.
2. `indicative`: deterministic estimate, but not sufficient for construction documents.
3. `engineering-review`: enough structured data for an engineer to review a calculation path.
4. `construction-ready`: reserved for modules that have verified standard implementations, complete required inputs, and professional review workflow.

V1 outputs only `planning` or `indicative` results.

## 2. Blocking examples

A structural foundation design cannot become construction-ready without project-specific geotechnical information or an explicitly accepted design basis.

A member reinforcement result cannot become construction-ready if geometry, loads, material strengths, boundary conditions, or the applicable verified design profile are missing.

An electrical cable/protection result cannot become construction-ready without load, installation method, conductor/material, protection, routing and verified standard-specific rules.

## 3. Assumptions

Assumptions are allowed to keep planning work moving, but each assumption must include:

- value;
- reason;
- affected results;
- risk/warning;
- replacement input needed.

## 4. Standards registry

The repository intentionally separates the standards registry from formulas. A standard name in the registry is not proof that a module is compliant with that standard.

Before enabling a verified module, maintainers must record:

- exact document/version;
- applicability;
- clause/formula mapping;
- independent test cases;
- reviewer and review date.

## 5. Budget optimization lock list

The optimizer may not reduce:

- required structural capacity;
- required fire/life-safety provisions;
- mandatory waterproofing scope;
- required electrical protection/earthing;
- minimum compliance items.

It may optimize finishes, brands, optional equipment, optional area, and user-approved scope.
