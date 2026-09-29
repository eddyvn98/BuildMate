# Standard Evidence Ledger

Principle: every engineering calculation exposed by BuildMate must carry a standard identifier, clause/table/formula reference, source URL, units and explicit inputs. A calculation is blocked when a required coefficient or project value is not sourced.

## TCVN 2737:2023 — Loads and Actions

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+2737%3A2023

Implemented evidence:
- 6.3: long-term variable-load combination factors.
- 6.4: basic-combination short-term factors.
- 6.5: special-combination short-term factors.
- 8.3.1 / Table 4: townhouse-relevant A1/A2/H uniformly distributed live loads.
- 8.3.3: reduced characteristic live load η = 0.35.
- 8.3.5(a): γf = 1.3 for distributed loads in 8.3.1.

## TCVN 5574:2018 — Concrete and reinforced concrete

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5574%3A2018

Implemented evidence:
- 8.1.2, Eq. (33): M ≤ Mu.
- Eq. (34): rectangular flexural resistance.
- Eq. (35): concrete compression-zone depth for the Eq. (34) branch.
- The engine rejects Eq. (34) when ξ > ξR rather than silently applying the wrong branch.

## TCVN 9362:2012 — Foundation soils

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9362%3A2012

Implemented evidence:
- 4.6.18: preliminary sizing basis using conventional resistance R0.
- 4.6.19: eccentric-foundation edge pressure ≤ 1.2R and corner pressure ≤ 1.5R.

## TCVN 10304:2025 — Pile foundations

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+10304%3A2025

Implemented evidence:
- 7.1.7 Eq. (4): deformation check s ≤ su.
- 7.2.1 Eq. (5)-(6): end-bearing pile characteristic resistance branch.

## TCVN 9206:2012 — Electrical equipment in dwellings/public buildings

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9206%3A2012

Implemented evidence:
- 4.5: voltage-loss limits by load/mode.
- 5.11 / Table 8: distribution-board coincidence factor by circuit count.
- 5.12 / Table 9: coincidence factor by circuit function.

## TCVN 7447-5-54:2015 — Earthing/protective conductors

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-54%3A2015

Implemented evidence:
- 543.1.1 / Table 54.2: minimum Cu protective-conductor section by phase-conductor section.
- 543.1.2: adiabatic protective-conductor equation for disconnection time ≤ 5 s.

## TCVN 4513:1988 — Internal water supply

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+4513%3A1988

Implemented evidence:
- 6.6 / Table 8: pipe diameter lookup for total fixture equivalent units N ≤ 20.
- 6.7 / Eq. (2), Tables 9-10: housing design flow q = 0.2 α √N + K N.

## TCVN 7957:2023 — External drainage

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7957%3A2023

Implemented evidence:
- 5.3.2: Manning velocity equation.
- Table 9: Manning n values by conduit/channel material.

## Remaining rule

Implemented clauses are not equivalent to a complete verified design profile. Items still listed in `src/engine/standards/coverage.js` stay blocked until their source clauses and reference cases are implemented and independently reviewed.
