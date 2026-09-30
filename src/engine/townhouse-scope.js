export const TOWNHOUSE_CORE_SCOPE=Object.freeze({
  building:{country:'Vietnam',type:'townhouse',storeys:{min:1,max:5}},
  profiles:{
    4:{
      name:'loads',
      supported:[
        'TCVN 2737:2023 basic/special combinations',
        'permanent loads from sourced material layers',
        'residential live loads',
        'rigid-building wind with sourced QCVN 02 W0',
        'rectangular wall F.4 and pitched-roof F.5 cases',
      ],
      extensions:[
        'flexible structures requiring dynamic gust workflow',
        'non-rectangular or uncommon aerodynamic geometries',
        'automatic QCVN 02 locality lookup outside implemented rows; sourced wind zone remains accepted',
      ],
    },
    5:{
      name:'rc-design',
      supported:[
        'rectangular RC beam/slab flexure and simplified shear branches',
        'rectangular eccentric-compression column branch xi<=xiR',
        'crack width and curvature-supplied deflection checks',
        'cover, spacing, anchorage and lap rules implemented in clause map',
      ],
      extensions:[
        'T/I flexural sections',
        'eccentric-compression xi>xiR Eq.(43) branch',
        'full inclined-section search and uncommon local actions',
        'special fire/exposure cover governed by additional standards',
      ],
    },
    6:{
      name:'foundations',
      supported:[
        'rectangular shallow footing pressure/eccentricity and layer-summation settlement',
        'end-bearing and driven/pressed friction pile capacity from sourced geotechnical inputs',
        'pile geotechnical document gate',
        'small pile-group preliminary loading and model convergence',
        'externally solved pile-group settlement accepted only with TCVN clause/method provenance',
      ],
      extensions:[
        'large pile groups / piled raft nonlinear numerical modelling',
        'automatic CPT/SPT table ingestion for all pile/soil cases',
        'circular/strip shallow-footing stress tables outside implemented interpolation domain',
      ],
    },
    7:{
      name:'electrical',
      supported:[
        'residential demand/coincidence and voltage-drop checks',
        'copper PVC A1/A2/B1/B2/C and D1/D2 ampacity profiles',
        'temperature/grouping/soil correction factors',
        'QCVN overload and short-circuit breaking-capacity checks',
        'TN/TT disconnection and sourced device trip curves',
        'PE sizing by Table 54.2 and adiabatic equation',
      ],
      extensions:[
        'full aluminium and XLPE table families',
        'automatic network fault-loop derivation without project/source-network inputs',
      ],
    },
    8:{
      name:'water-drainage',
      supported:[
        'fixture-unit demand and domestic design flow',
        'DN10-DN150 steel/cast-iron resistance lookup and pressure-loss workflow',
        'pump duty point with sourced manufacturer Q-H curve',
        'gravity drainage Manning, fill ratio, self-cleansing/max velocity, diameter and slope checks',
      ],
      extensions:[
        'large-diameter internal-water Table 14 branches beyond DN150',
        'automatic pump efficiency/NPSH curve processing',
      ],
    },
    12:{
      name:'hvac-residential',
      supported:[
        'TCVN 5687:2024 residential comfort conditions from Appendix A',
        'HVAC design classes I/II/III with sourced outdoor design conditions',
        'residential outdoor-air rates from Appendix E',
        'mechanical ventilation by Appendix F air-change rates',
        'Appendix G airflow paths including sensible-heat, ACH, area and people',
        'source-backed component cooling-load aggregation',
        'source-backed equipment capacity acceptance at stated rating conditions',
      ],
      extensions:[
        'smoke-control and fire makeup-air design governed by QCVN 06 and project fire strategy',
        'industrial/process ventilation outside the townhouse residential scope',
        'automatic climate-table lookup without sourced project locality/design-condition evidence',
      ],
    },
  },
});

export function townhouseCoreScope(issue) {
  return structuredClone(TOWNHOUSE_CORE_SCOPE.profiles[Number(issue)] ?? null);
}
