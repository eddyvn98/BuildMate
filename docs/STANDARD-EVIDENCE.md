# Standard Evidence Ledger

Principle: every engineering calculation exposed by BuildMate must carry a standard identifier, clause/table/formula reference, source URL, units and explicit inputs. A calculation is blocked when a required coefficient or project value is not sourced.

## TCVN 2737:2023 — Loads and Actions

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+2737%3A2023

Implemented evidence:
- 6.3: long-term variable-load combination factors.
- 6.4: basic-combination short-term factors.
- 6.5: special-combination short-term factors.
- 6.7 Eq. (3)-(4): one-floor tributary-area load-reduction factors φ1/φ2.
- 6.8 Eq. (5)-(6): multi-floor load-reduction factors φ3/φ4.
- 7.1-7.2 / Table 1: permanent-load provenance and reliability factors for structural self-weight/soil.
- 10.2.2 Eq. (10): standard wind pressure Wk=(0.852W0)k(ze)cGf.
- 10.2.5 / Table 9: terrain/height factor k(ze), including permitted linear interpolation.
- 10.2.7.2: Gf=0.85 for rigid structures with T1≤1s.
- Appendix F.4.1.1 / Table F.4: external pressure coefficients for vertical walls of rectangular buildings with h/d≤5.
- Appendix F.12: internal-pressure endpoint cases for wall opening ratio ≤5% and ≥30%.
- 10.2.3 with QCVN 02:2022/BXD 5.2.2/Table 5.1: W0 comes from the official wind-pressure zone, not a BuildMate default.
- QCVN 02 Table 5.1 HCMC rows: all HCMC districts/cities including Thu Duc are zone II except Cu Chi, which is zone I.
- 8.3.1 / Table 4: townhouse-relevant A1/A2/H uniformly distributed live loads.
- 8.3.3: reduced characteristic live load η = 0.35.
- 8.3.5(a): γf = 1.3 for distributed loads in 8.3.1.

## TCVN 5574:2018 — Concrete and reinforced concrete

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5574%3A2018

Implemented evidence:
- 6.1.4 / Table 7: common concrete design strengths Rb/Rbt.
- 6.1.5 / Table 10: common concrete elastic modulus Eb.
- 6.2.2 / Tables 13-14: common reinforcement Rs/Rsc/Rsw.
- 6.2.3.3: Es = 2.0×10^5 MPa for reinforcing bars.
- 8.1.2, Eq. (33): M ≤ Mu.
- Eq. (34): rectangular flexural resistance.
- Eq. (35): concrete compression-zone depth for the Eq. (34) branch.
- 8.1.3.2 Eq. (88): concrete strip shear limit.
- 8.1.3.3.1 Eq. (92)-(96): transverse-reinforcement force per length and simplified shear checks.
- 8.2.2.1.3 Eq. (155) / Table 17: crack-width acceptance limits.
- 8.2.2.3.1 Eq. (166): direct crack-width equation from sourced coefficients/stress/spacing.
- 10.3.1.2 / Table 19: minimum concrete cover by environment, with permitted precast/constructive reductions and absolute lower bounds from bar diameter/10 mm.
- 10.3.2: minimum clear spacing between reinforcement bars.
- 10.3.3.1: minimum longitudinal reinforcement ratio.
- 10.3.4.3: transverse-reinforcement spacing by shear requirement.
- 10.3.4.4: transverse restraint spacing for longitudinal compression bars.
- 10.3.5.4 Eq. (255): basic anchorage length L0,an=RsAs/(Rbond us), with Rbond=eta1 eta2 Rbt and explicit bar-surface/diameter factors.
- 10.3.5.5: required anchorage length with alpha1, As,cal/As,ef and lower bounds 15ds, 200 mm, 0.3L0,an.
- 10.3.6.2: lap splice limited to bars ≤40 mm; base alpha2=1.2 tension / 0.9 compression, percentage-dependent interpolation, and minimum lap length max(0.4 alpha2 L0,an, 20ds, 250 mm).
- The engine rejects Eq. (34) when ξ > ξR rather than silently applying the wrong branch.

## TCVN 9362:2012 — Foundation soils

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9362%3A2012

Implemented evidence:
- 4.6.18: preliminary sizing basis using conventional resistance R0.
- 4.6.19: eccentric-foundation edge pressure ≤ 1.2R and corner pressure ≤ 1.5R.
- 4.6.6 Eq. (14): calculated deformation S ≤ allowable Su.
- Appendix C / Table C.1: rectangular-footing stress influence coefficient alpha with bounded interpolation for verified rows m=0..4 and n=1..5.
- Appendix C stress distribution: p0z=alpha p0 for additional vertical pressure.
- Appendix C, C.1.6: layer-summation settlement S=0.8Σ(pi hi/Ei), with Ei required as sourced geotechnical input.
- Appendix D, D.2 Eq. (D.1)-(D.2): conventional resistance adjustment for width/depth within the Appendix D applicability envelope.

## TCVN 10304:2025 — Pile foundations

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+10304%3A2025

Implemented evidence:
- 7.1.7 Eq. (4): deformation check s ≤ su.
- 7.2.1 Eq. (5)-(6): end-bearing pile characteristic resistance branch.
- 7.2.2: driven/pressed friction-pile capacity as sourced toe resistance plus sourced shaft resistance by soil layer; no qb/fi/factor inference.

## TCVN 9206:2012 — Electrical equipment in dwellings/public buildings

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9206%3A2012

Implemented evidence:
- 4.5: voltage-loss limits by load/mode.
- 5.11 / Table 8: distribution-board coincidence factor by circuit count.
- 5.8: residential calculation power factor 0.80 to 0.85.
- 5.12 / Table 9: coincidence factor by circuit function.

## TCVN 7447-5-54:2015 — Earthing/protective conductors

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-54%3A2015

Implemented evidence:
- 543.1.1 / Table 54.2: minimum Cu protective-conductor section by phase-conductor section.
- 543.1.2: adiabatic protective-conductor equation for disconnection time ≤ 5 s.

## TCVN 4513:1988 — Internal water supply

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+4513%3A1988

Implemented evidence:
- 3.5 / Table 2: fixture-unit equivalents, individual fixture flows and connection diameters.
- 6.3: required pressure at the highest/most remote fixture.
- 6.5: domestic steel-pipe velocity limits.
- 6.6 / Table 8: pipe diameter lookup for total fixture equivalent units N ≤ 20.
- 3.8-3.9: minimum fixture free-head requirements and 60 m maximum working head.
- 6.7 / Eq. (2), Tables 9-10: housing design flow q = 0.2 α √N + K N.
- 6.14 / Table 14(a): DN10-DN150 steel/cast-iron resistance A lookup for L/s and friction gradient i=Aq².
- 6.3/6.14/6.16 + 7.1/7.2/7.7: pump duty point assembled from required pressure and losses; candidate acceptance requires a manufacturer Q-H curve source.
- 6.16: local-loss allowance as a prescribed percentage of longitudinal friction loss.
- 7.1: booster pumping required when external-network pressure is insufficient.
- 7.7: pump design flow basis with/without storage tank.
- 8.1 note 2: individual pressure-tank volume not over 20-25 m³.

## TCVN 7957:2023 — External drainage

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7957%3A2023

Implemented evidence:
- 5.3.2: Manning velocity equation.
- Table 9: Manning n values by conduit/channel material.
- 5.3.4 / Table 10: minimum drain diameters.
- 5.3.5 / Table 11: maximum design fill ratio by sewer diameter.
- 5.3.6 / Table 12: minimum self-cleansing wastewater velocity by diameter.
- 5.3.9: maximum wastewater/stormwater velocities by pipe material.
- 5.3.11: minimum 0.02 slope for rainwater-inlet connection to sewer.

## Remaining rule

Implemented clauses are not equivalent to a complete verified design profile. Items still listed in `src/engine/standards/coverage.js` stay blocked until their source clauses and reference cases are implemented and independently reviewed.


## QCVN 12:2014/BXD — Mandatory building electrical requirements

Official legal source: https://vbpl.vn/FileData/TW/Lists/vbpq/Attachments/111843/VanBanGoc_QC%2012-2014-BXD.pdf

Implemented evidence:
- 2.6.3.1 Eq. (3)-(4): overload protection must satisfy IB ≤ In ≤ Iz and I2 ≤ 1.45 Iz.
- 2.6.5.1: prospective short-circuit current at relevant points must be determined by calculation or measurement.

## TCVN 7447-4-41:2010 — Protection against electric shock

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-4-41%3A2010

Implemented evidence:
- 411.3.2.2 / Table 41.1: maximum disconnection times for TN/TT final circuits ≤ 32 A.

## TCVN 7447-5-52:2010 — Wiring systems

Official status/source: https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-52%3A2010

Implemented evidence:
- Appendix B / Tables B.52.2 and B.52.4: copper/PVC current-carrying capacities for installation methods B1/B2/C, two/three loaded conductors.
- Appendix C / Table C.52.2: D1/D2 copper current-carrying capacities for PVC/XLPE, two/three loaded conductors.
- Table C.52.3 item 1: grouping factors for bundled/enclosed circuits.
- Other installation methods and correction tables remain explicit coverage gaps.


Additional TCVN 7447-5-52 evidence:
- Table B.52.14: air-temperature correction factors for PVC/XLPE.
- Table B.52.15: soil-temperature correction factors for PVC/XLPE.
- Table B.52.16: soil thermal-resistivity correction factors for buried cables.


Additional TCVN 7447-4-41 evidence:
- 411.4.4: TN automatic-disconnection loop condition Zs·Ia ≤ Uo; Ia must come from the protective-device characteristic for the required time.
- 411.5.3: TT system with RCD must satisfy RA·IΔn ≤ 50 V and the applicable disconnection time.


Additional evidence implemented:
- TCVN 2737:2023 Appendix F Tables F.5a/F.5b: exact pitched-roof external pressure coefficient rows for theta=0/90 degrees; dual-sign cases remain separate load cases.
- TCVN 5574:2018 8.2.3.2.1 Eq.(177): f <= fu; 8.2.3.2.2 Eq.(179): curvature-based midspan deflection for even segment count n>=6.
- TCVN 10304:2025 7.4.3.1: preliminary equal pile load Nd,mean=Nd,f/n and final-model force convergence requirement <=10%.


Additional completed tables:
- TCVN 7447-5-52:2010 Tables B.52.3/B.52.5: XLPE/EPR current-carrying capacity for copper and aluminium conductors across A1/A2/B1/B2/C/D1/D2, two/three loaded conductors.
- TCVN 4513:1988 Table 14(b): DN175-DN400 unit resistance A with q in m3/s.
- TCVN 4513:1988 6.15/Table 15: low-velocity correction K for steel/cast-iron pipe below 1.2 m/s.


Additional completed formula chains:
- TCVN 5574:2018 Eq.(185)-(188): total curvature for cracked/uncracked sections, curvature M/D and transformed stiffness D=Eb1*Ired; Eq.(191) short-term uncracked Eb1=0.85Eb; Eq.(182) shear strain.
- TCVN 10304:2025 7.4.3.1 Eq.(36)-(38): pairwise pile interaction coefficient and additional/group settlement from known single-pile settlements, SLS loads and sourced kv/G1/G2.


Additional closed calculation branches:
- TCVN 5574:2018 8.1.2.3.3 Eq.(36)-(38): T/I-section flexural capacity with neutral-axis branch in compression flange or web; 8.1.2.3.5 xiR limiting rule.
- TCVN 5574:2018 8.1.3.3.1 Eq.(89)-(92): full dangerous inclined-section shear search over h0 <= C <= 2h0, with Eq.(96) transverse-reinforcement eligibility.
- TCVN 10304:2025 7.4.2.1 Eq.(34)/Table 17: short-pile settlement for 1 < k <= 7.5 using published zeta0 and mv coefficients.


Wind dynamic closure:
- TCVN 2737:2023 10.2.7.3 Eq.(13)-(24) and Table 10 are implemented for flexible structures T1>1s, including turbulence intensity/length, background response, resonance response, peak factors and aerodynamic admittance functions.
- Appendix F.12.2 does not prescribe an interpolation rule for 5%<opening ratio<30%; BuildMate explicitly blocks this interval rather than manufacture a coefficient.


RC material/deformation closure:
- TCVN 5574:2018 Table 6/7/10 heavy-concrete properties are implemented from B3.5 through B100.
- 6.1.2.3 gamma_b1..gamma_b4 working-condition factors are explicit.
- Table 11 creep phi_b,cr and Eq.(192) long-term modulus Eb/(1+phi_b,cr) are implemented.
- Table 9 long-term strains include the B70-B100 multiplier (270-B)/210.
- Eq.(13), Eq.(176), Eq.(193)-(196), Eq.(202)-(204) now close the rectangular cracked-section Eb,red/x/Ired/psi_s stiffness chain.


Pile field-test closure:
- TCVN 10304:2025 Appendix D Eq.(D.1)-(D.6) + Table D.1 row 5: driven/pressed pile SPT capacity from N/Ns/cu with published caps.
- 7.3.4.2 Eq.(25)-(28): driven-pile CPT capacity is implemented from sourced Table 15 beta coefficients.
- Appendix G Eq.(G.1)-(G.7), Tables G.1/G.2: alpha=0.95 statistics, outlier rejection, variation, reliability and design-value processing are implemented for exact tabulated degrees of freedom.
