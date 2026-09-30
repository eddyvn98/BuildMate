# Engineering Independent Review Packets

BuildMate's initial engineering scope is the PRD-defined Vietnam townhouse profile: 1-5 storeys.

The software now separates:
- **supported townhouse core** — implemented clauses, deterministic formulas, provenance gates and automated reference cases;
- **blocked extensions** — cases outside the implemented core that must not fall back to guessed coefficients;
- **independent review** — the remaining approval step before any profile can be labelled construction-ready.

Use `buildIndependentReviewPacket(issue)` to generate the checklist/evidence bundle for issues #4-#8.

A qualified reviewer should:
1. verify the exact standard versions and applicability;
2. independently recompute representative and edge reference cases;
3. inspect formula domains, units and interpolation;
4. confirm source/project input provenance;
5. confirm unsupported cases are blocked;
6. record reviewer identity, qualification, date and approval/rejection.

No software flag can substitute for that review.
