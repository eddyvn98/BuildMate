# BuildMate v0.6.0

Release date: 2026-09-30

v0.6.0 marks completion of the tracked standards-software gaps for engineering issues #4-#8.

The release extends the earlier townhouse core into the additional calculation branches identified during clause-by-clause review: flexible wind response, T/I RC flexure, full tracked shear search, cracked-section rigidity, both column eccentricity branches, full shallow-foundation influence tables, direct/SPT/CPT pile workflows, long/short/group pile settlement, full tracked cable table families and pump acceptance/NPSH checks.

The key distinction is now explicit:

- `pending=[]` means no known missing software calculation branch in the tracked profile;
- `externalRequirements` means the standard itself requires project/authority/test/manufacturer evidence;
- verified review remains tied to the exact code + project-evidence fingerprint.

This release also adds standards-edition freshness monitoring, executable conformance catalog validation and hand-derived golden benchmarks.
