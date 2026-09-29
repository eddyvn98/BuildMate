# Standards Registry

BuildMate separates **reference confirmation** from **formula verification**. A document can be current and relevant without the corresponding BuildMate module being approved for construction-ready output.

Implementation date for this registry: **2026-09-29**.

## Confirmed current references

| Domain | Reference | Registry state | Notes |
|---|---|---|---|
| Planning | QCVN 01:2021/BXD | reference-confirmed | Current baseline through 2026-12-31. |
| Planning successor | QCVN 01:2026/BXD | future | Issued 2026-06-30, effective 2027-01-01. |
| Natural conditions | QCVN 02:2022/BXD | reference-confirmed | 2026 amendment work was still in draft/review during implementation. |
| Fire safety | QCVN 06:2022/BXD + Sửa đổi 1:2023 | reference-confirmed | Applicability depends on building characteristics/use. |
| Loads/actions | TCVN 2737:2023 | reference-confirmed | Replaces TCVN 2737:1995. |
| RC structures | TCVN 5574:2018 | reference-confirmed | Loading cross-reference must account for TCVN 2737:2023 updates. |
| Shallow foundation | TCVN 9362:2012 | reference-confirmed | Not a pile-foundation design standard. |
| Pile foundation | TCVN 10304:2025 | reference-confirmed | Replaces TCVN 10304:2014. |
| Building electrical | QCVN 12:2014/BXD | reference-confirmed | Mandatory regulation context. |
| Electrical equipment | TCVN 9206:2012 | reference-confirmed | Active according to VSQI lookup. |
| Earthing / PE | TCVN 7447-5-54:2015 | reference-confirmed | Active; equivalent to IEC 60364-5-54:2011. |
| Internal water | TCVN 4513:1988 | reference-confirmed | Active according to VSQI lookup. |
| External drainage | TCVN 7957:2023 | reference-confirmed | Replaces TCVN 7957:2008. |

## Source links

The machine-readable registry in `src/engine/standards.js` contains the source URL for every item. Prefer Ministry of Construction and VSQI pages.

## Verification ladder

1. `reference-confirmed`: document/status checked.
2. `formula-implemented`: formulas/clauses mapped to code with units.
3. `reviewed`: reference examples and edge cases reviewed independently.
4. `verified`: approved profile can emit construction-ready results.

No V2 engineering module is automatically construction-ready merely because the underlying standard is current.
