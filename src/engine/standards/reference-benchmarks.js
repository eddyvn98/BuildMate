export const STANDARD_REFERENCE_BENCHMARKS=Object.freeze([
  {
    id:'loads-wind-zone-II-rigid',
    issue:4,
    standard:'TCVN 2737:2023 + QCVN 02:2022/BXD',
    clause:'TCVN 2737 Eq.(10); QCVN 02 W0 zone II',
    inputs:{windZone:'II',kZe:1,aerodynamicCoefficient:0.8,gustFactor:0.85},
    expected:{value:55.0392,unit:'daN/m²',tolerance:0.0001},
    derivation:'0.852 * 95 * 1.0 * 0.8 * 0.85',
  },
  {
    id:'rc-b25-rectangular-flexure',
    issue:5,
    standard:'TCVN 5574:2018',
    clause:'8.1.2 Eq.(34)-(35)',
    inputs:{bMm:200,h0Mm:450,RbMpa:14.5,RsMpa:350,AsMm2:1000,xiR:0.5,materialSource:'TCVN 5574 Tables 7/13'},
    expected:{value:136.37931,unit:'kN·m',tolerance:0.0001},
    derivation:'x=350*1000/(14.5*200)=120.689655 mm; Mu=14.5*200*x*(450-0.5*x)',
  },
  {
    id:'foundation-layer-summation',
    issue:6,
    standard:'TCVN 9362:2012',
    clause:'Appendix C C.1.6',
    inputs:{layers:[
      {averageAdditionalPressureKpa:180,thicknessM:0.5,deformationModulusKpa:15000,pressureSource:'benchmark stress',modulusSource:'benchmark geotech'},
      {averageAdditionalPressureKpa:120,thicknessM:0.5,deformationModulusKpa:12000,pressureSource:'benchmark stress',modulusSource:'benchmark geotech'},
    ]},
    expected:{value:8.8,unit:'mm',tolerance:0.0001},
    derivation:'0.8*(180*0.5/15000 + 120*0.5/12000)*1000',
  },
  {
    id:'electrical-pe-adiabatic',
    issue:7,
    standard:'TCVN 7447-5-54:2015',
    clause:'543.1.2',
    inputs:{faultCurrentA:5000,disconnectTimeS:0.2,k:115},
    expected:{value:19.444,unit:'mm²',tolerance:0.001},
    derivation:'5000*sqrt(0.2)/115',
  },
  {
    id:'water-housing-design-flow',
    issue:8,
    standard:'TCVN 4513:1988',
    clause:'6.7 Eq.(2), Tables 9-10',
    inputs:{fixtureEquivalentUnits:20,litersPerPersonDay:150},
    expected:{value:1.963,unit:'L/s',tolerance:0.001},
    derivation:'0.2*2.15*sqrt(20)+0.002*20',
  },
  {
    id:'hvac-bedroom-outdoor-air',
    issue:12,
    standard:'TCVN 5687:2024',
    clause:'6.1.5 + Appendix E Table E.1 + Appendix G Eq.(G.7)',
    inputs:{spaceType:'bedroom',people:2,areaM2:18},
    expected:{value:70,unit:'m³/h',tolerance:0.0001},
    derivation:'2 people * 35 m³/(h·person)',
  },
]);

export function benchmarksForIssue(issue) {
  return structuredClone(STANDARD_REFERENCE_BENCHMARKS.filter(x=>x.issue===Number(issue)));
}
