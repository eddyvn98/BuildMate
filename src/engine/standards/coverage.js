export const STANDARD_CLAUSE_COVERAGE=Object.freeze([
  {
    issue:4,standard:'TCVN 2737:2023',
    implemented:['6.3','6.4','6.5','8.3.1/Table 4 residential subset','8.3.3','8.3.5(a)'],
    pending:['permanent-load source tables for project materials','wind/natural-condition project profile','area-reduction clauses 6.7-6.8','full reference-case review'],
  },
  {
    issue:5,standard:'TCVN 5574:2018',
    implemented:['8.1.2 equations (33)-(35) rectangular flexure','8.1.3.2 Eq.(88)','8.1.3.3.1 Eq.(92)-(96) simplified shear branch'],
    pending:['material tables/profile','T/I sections','full inclined-section search','columns/second-order','SLS/crack/deflection','detailing','full reference-case review'],
  },
  {
    issue:6,standard:'TCVN 9362:2012 + TCVN 10304:2025',
    implemented:['TCVN 9362 4.6.18','TCVN 9362 4.6.19','TCVN 10304 7.1.7 Eq.(4)','TCVN 10304 7.2.1 Eq.(5)-(6) end-bearing pile'],
    pending:['settlement profile','friction pile clauses','group effects','CPT/SPT/static-test workflows','full reference-case review'],
  },
  {
    issue:7,standard:'TCVN 9206:2012 + TCVN 7447-5-54:2015',
    implemented:['TCVN 9206 4.5','TCVN 9206 5.8','TCVN 9206 5.11/Table 8','TCVN 9206 5.12/Table 9','TCVN 7447-5-54 543.1.1/Table 54.2','TCVN 7447-5-54 543.1.2'],
    pending:['ampacity tables/installation methods from applicable cable standard','fault-loop/disconnection coordination profile','complete reference cases'],
  },
  {
    issue:8,standard:'TCVN 4513:1988 + TCVN 7957:2023',
    implemented:['TCVN 4513 3.5/Table 2 fixture-unit schedule','TCVN 4513 6.5 velocity limits','TCVN 4513 6.6/Table 8','TCVN 4513 6.7 Eq.(2)/Tables 9-10','TCVN 7957 5.3.2/Table 9 Manning'],
    pending:['pressure-loss network workflow','pump selection clauses','self-cleansing/minimum slope rules by diameter','complete reference cases'],
  },
]);

export function standardGapSummary(issue) {
  return structuredClone(STANDARD_CLAUSE_COVERAGE.find((item)=>item.issue===Number(issue)) ?? null);
}
