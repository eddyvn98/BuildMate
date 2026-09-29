# Engineering Verification Matrix

The machine-readable source is `src/engine/standards/coverage.js`.

BuildMate now synchronizes each engineering profile with:

- implemented clause/table/formula groups;
- automated reference-case test identifiers;
- explicit remaining standard-coverage gaps;
- independent professional review records.

A profile is blocked from `construction-ready` when either:

1. any standard-coverage gap remains, or
2. no qualified independent review with an approved outcome has been recorded.

This prevents an implementation from appearing verified merely because some equations and tests exist.
