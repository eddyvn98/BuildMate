export const STANDARD_CLAUSE_COVERAGE=Object.freeze([
  {
    issue:4,standard:'TCVN 2737:2023',
    implemented:['6.3','6.4','6.5','6.7 Eq.(3)-(4)','6.8 Eq.(5)-(6)','7.1-7.2/Table 1 permanent-load provenance and gamma_f','8.3.1/Table 4 residential subset','8.3.3','8.3.5(a)','10.2.2 Eq.(10) wind pressure','10.2.3 + QCVN 02:2022/BXD 5.2.2 wind-zone W0','10.2.5/Table 9 terrain k(ze) interpolation','10.2.7.2 rigid Gf=0.85','QCVN 02 Table 5.1 HCMC locality rows'],
    pending:['full aerodynamic coefficient cases','flexible-structure gust-factor Eq.(13)-(19) workflow','QCVN 02 locality ingestion outside verified HCMC rows','full reference-case review'],
  },
  {
    issue:5,standard:'TCVN 5574:2018',
    implemented:['6.1.4/Table 7 concrete Rb/Rbt subset','6.1.5/Table 10 concrete Eb subset','6.2.2/Table 13 rebar Rs/Rsc subset','6.2.2/Table 14 rebar Rsw subset','6.2.3.3 rebar Es','8.1.2 equations (33)-(35) rectangular flexure','8.1.3.2 Eq.(88)','8.1.3.3.1 Eq.(92)-(96) simplified shear branch','8.2.2.1.3 Eq.(155)/Table 17 crack limits','8.2.2.3.1 Eq.(166) crack width','10.3.2 minimum clear bar spacing','10.3.3.1 minimum longitudinal reinforcement','10.3.4.3 transverse reinforcement spacing','10.3.4.4 compression-bar restraint spacing','10.3.6.2 lap-splice alpha2 and minimum lap length'],
    pending:['remaining material classes/condition factors','T/I sections','full inclined-section search','columns/second-order','deflection curvature workflow','cover requirements','base anchorage length L0,an calculation from 10.3.5.5','full reference-case review'],
  },
  {
    issue:6,standard:'TCVN 9362:2012 + TCVN 10304:2025',
    implemented:['TCVN 9362 4.6.6 Eq.(14)','TCVN 9362 Appendix C C.1.6 layer-summation settlement','TCVN 9362 4.6.18','TCVN 9362 4.6.19','TCVN 9362 Appendix D D.1-D.2','TCVN 10304 7.1.7 Eq.(4)','TCVN 10304 7.2.1 Eq.(5)-(6) end-bearing pile','TCVN 10304 7.2.2 driven/pressed friction pile capacity from explicit sourced qb/fi/factors'],
    pending:['Appendix C stress-distribution coefficient table/interpolation to derive pi in-app','pile group effects','CPT/SPT/static-test table ingestion','full reference-case review'],
  },
  {
    issue:7,standard:'QCVN 12:2014/BXD + TCVN 9206:2012 + TCVN 7447-4-41:2010 + TCVN 7447-5-52:2010 + TCVN 7447-5-54:2015',
    implemented:['QCVN 12 2.6.3.1 Eq.(3)-(4)','QCVN 12 2.6.5.1','TCVN 9206 4.5','TCVN 9206 5.8','TCVN 9206 5.11/Table 8','TCVN 9206 5.12/Table 9','TCVN 7447-4-41 411.3.2.2/Table 41.1','TCVN 7447-5-52 Appendix B Tables B.52.2/B.52.4 copper PVC B1/B2/C','TCVN 7447-5-52 Appendix C Table C.52.2 D1/D2 copper subset','TCVN 7447-5-52 Table C.52.3 grouping item 1','TCVN 7447-5-52 B.52.14 ambient-air temperature correction','TCVN 7447-5-52 B.52.15 soil-temperature correction','TCVN 7447-5-52 B.52.16 soil thermal-resistivity correction','TCVN 7447-5-54 543.1.1/Table 54.2','TCVN 7447-5-54 543.1.2'],
    pending:['A1/A2 and full XLPE/aluminium ampacity profiles','fault-loop impedance calculation/verification','breaker manufacturer trip-curve ingestion','complete reference cases'],
  },
  {
    issue:8,standard:'TCVN 4513:1988 + TCVN 7957:2023',
    implemented:['TCVN 4513 3.5/Table 2 fixture-unit schedule','TCVN 4513 3.8-3.9 fixture pressure limits','TCVN 4513 6.3 pressure requirement','TCVN 4513 6.5 velocity limits','TCVN 4513 6.6/Table 8','TCVN 4513 6.7 Eq.(2)/Tables 9-10','TCVN 4513 6.14/Table 14(a) DN10-DN150 resistance lookup and friction gradient i=Aq²','TCVN 4513 project pump duty-point and sourced manufacturer-curve acceptance','TCVN 4513 6.16 local-loss allowances','TCVN 4513 7.1 booster requirement','TCVN 4513 7.7 pump flow basis','TCVN 4513 8.1 tank limit','TCVN 7957 5.3.2/Table 9 Manning','TCVN 7957 5.3.4/Table 10 minimum diameters','TCVN 7957 5.3.5/Table 11 maximum fill','TCVN 7957 5.3.6/Table 12 self-cleansing velocity','TCVN 7957 5.3.9 maximum velocity','TCVN 7957 5.3.11 rain-inlet connection slope'],
    pending:['TCVN 4513 Table 14 large-diameter m³/s branch beyond DN150','manufacturer Q-H curve digitization/interpolation plus efficiency/NPSH checks','complete reference-case review'],
  },
]);

export function standardGapSummary(issue) {
  return structuredClone(STANDARD_CLAUSE_COVERAGE.find((item)=>item.issue===Number(issue)) ?? null);
}
