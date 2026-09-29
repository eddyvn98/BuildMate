import { standardRef, standardResult } from './common.js';

const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+2737%3A2023';
const FULL_TEXT='https://icci.vn/storage/documents/September2023/TCVN2737_2023_920293.pdf';

export const TCVN2737_RESIDENTIAL_LIVE_LOADS=Object.freeze({
  'A1-floor':1.5,
  'A1-balcony':2.0,
  'A2-circulation':3.0,
  'H-roof-maintenance':0.3,
});

export function residentialCharacteristicLiveLoad(areaClass) {
  const value=TCVN2737_RESIDENTIAL_LIVE_LOADS[areaClass];
  if (value==null) throw new RangeError('Unsupported TCVN 2737 residential area class');
  return standardResult({
    value,unit:'kN/m²',formulaId:'TCVN2737:2023-Table4',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'8.3.1, Table 4',sourceUrl:FULL_TEXT,note:'Characteristic uniformly distributed short-term load.'}),
    inputs:{areaClass},
  });
}

export function reducedCharacteristicLiveLoad(characteristicKnM2) {
  requireNonNegative('characteristicKnM2',characteristicKnM2);
  return standardResult({
    value:round(Number(characteristicKnM2)*0.35),unit:'kN/m²',formulaId:'qk,per=0.35*qk,t',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'8.3.3',formula:'qk,per = η qk,t; η = 0.35',sourceUrl:FULL_TEXT}),
    inputs:{characteristicKnM2:Number(characteristicKnM2),eta:0.35},
  });
}

export function designDistributedLiveLoad(characteristicKnM2) {
  requireNonNegative('characteristicKnM2',characteristicKnM2);
  return standardResult({
    value:round(Number(characteristicKnM2)*1.3),unit:'kN/m²',formulaId:'qd=gammaf*qk',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'8.3.5(a)',formula:'γf = 1.3 for 8.3.1 distributed loads',sourceUrl:FULL_TEXT}),
    inputs:{characteristicKnM2:Number(characteristicKnM2),gammaF:1.3},
  });
}

export function basicCombinationPsi({longTermCount=0,shortTermCount=0}) {
  if (!Number.isInteger(longTermCount)||longTermCount<0||!Number.isInteger(shortTermCount)||shortTermCount<0) throw new RangeError('counts must be non-negative integers');
  const longTerm=Array.from({length:longTermCount},(_,i)=>i===0?1:0.95);
  const shortTerm=Array.from({length:shortTermCount},(_,i)=>i===0?1:i===1?0.9:0.7);
  return {
    longTerm,shortTerm,level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 2737:2023',clause:'6.3',formula:'ψL,1=1.0; ψL,2...=0.95',sourceUrl:FULL_TEXT}),
      standardRef({standard:'TCVN 2737:2023',clause:'6.4',formula:'ψt,1=1.0; ψt,2=0.9; ψt,3...=0.7',sourceUrl:FULL_TEXT}),
    ],
  };
}

export function specialCombinationShortTermPsi(count) {
  if (!Number.isInteger(count)||count<0) throw new RangeError('count must be a non-negative integer');
  return {
    factors:Array.from({length:count},(_,i)=>i===0?0.5:0.3),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'6.5',formula:'ψt,1=0.5; ψt,2...=0.3',sourceUrl:FULL_TEXT}),
  };
}

export const TCVN2737_METADATA={standard:'TCVN 2737:2023',statusSource:SOURCE,fullTextSource:FULL_TEXT};

function requireNonNegative(name,v){if(!(Number(v)>=0))throw new RangeError(`${name} must be >= 0`);}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}


export function singleFloorAreaReduction({areaM2,category}) {
  if (!(Number(areaM2)>0)) throw new RangeError('areaM2 must be > 0');
  const A=Number(areaM2);
  let factor=1;
  let formula='';
  let clause='';
  if (category==='A-B') {
    factor=A>9?Math.max(0.6,0.4+0.6/Math.sqrt(A/9)):1;
    formula='φ1=0.4+0.6/√(A/A1) ≥ 0.6; A1=9m²';
    clause='6.7(a), equation (3)';
  } else if (category==='C-D') {
    factor=A>36?Math.max(0.6,0.5+0.5/Math.sqrt(A/36)):1;
    formula='φ2=0.5+0.5/√(A/A2) ≥ 0.6; A2=36m²';
    clause='6.7(b), equation (4)';
  } else {
    throw new RangeError('category must be A-B or C-D');
  }
  return {
    factor:round(factor,5),areaM2:A,category,level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause,formula,sourceUrl:FULL_TEXT}),
  };
}

export function multiFloorAreaReduction({singleFloorFactor,floorCount,category}) {
  const phi=Number(singleFloorFactor);
  const n=Number(floorCount);
  if (!(phi>0&&phi<=1)) throw new RangeError('singleFloorFactor must be >0 and <=1');
  if (!Number.isInteger(n)||n<2) throw new RangeError('floorCount must be integer >=2');
  let factor,formula,clause;
  if (category==='A-B') {
    factor=Math.max(0.5,0.4+(phi-0.4)/Math.sqrt(n));
    formula='φ3=0.4+(φ1-0.4)/√n ≥ 0.5';
    clause='6.8(a), equation (5)';
  } else if (category==='C-D') {
    factor=Math.max(0.5,0.5+(phi-0.5)/Math.sqrt(n));
    formula='φ4=0.5+(φ2-0.5)/√n ≥ 0.5';
    clause='6.8(b), equation (6)';
  } else {
    throw new RangeError('category must be A-B or C-D');
  }
  return {
    factor:round(factor,5),floorCount:n,category,level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause,formula,sourceUrl:FULL_TEXT}),
  };
}


const PERMANENT_GAMMA=Object.freeze({
  metal:1.05,
  concreteHeavy:1.1,
  reinforcedConcrete:1.1,
  masonry:1.1,
  timber:1.1,
  lightweightConcreteFactory:1.2,
  finishFactory:1.2,
  lightweightConcreteSite:1.3,
  finishSite:1.3,
  naturalSoil:1.1,
  fillSoil:1.15,
});

export function permanentLoadReliabilityFactor(materialClass) {
  const factor=PERMANENT_GAMMA[materialClass];
  if (factor==null) throw new RangeError('Unsupported TCVN 2737 Table 1 permanent-load class');
  return {
    factor,materialClass,level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'7.2, Table 1',sourceUrl:FULL_TEXT,note:'Load reliability factor for structural self-weight and soil.'}),
  };
}

export function permanentLayerAreaLoad({layers}) {
  if (!Array.isArray(layers)||layers.length===0) throw new TypeError('layers are required');
  const rows=layers.map((layer)=>{
    const thickness=Number(layer.thicknessM),unitWeight=Number(layer.unitWeightKnM3);
    if (!(thickness>0)) throw new RangeError('layer.thicknessM must be > 0');
    if (!(unitWeight>0)) throw new RangeError('layer.unitWeightKnM3 must be > 0');
    if (!layer.source) throw new TypeError('layer.source is required');
    const gamma=permanentLoadReliabilityFactor(layer.materialClass);
    const characteristic=thickness*unitWeight;
    return {
      name:String(layer.name ?? layer.materialClass),thicknessM:thickness,unitWeightKnM3:unitWeight,
      source:String(layer.source),materialClass:layer.materialClass,gammaF:gamma.factor,
      characteristicKnM2:round(characteristic),designKnM2:round(characteristic*gamma.factor),
      reference:gamma.reference,
    };
  });
  return {
    characteristicKnM2:round(rows.reduce((s,x)=>s+x.characteristicKnM2,0)),
    designKnM2:round(rows.reduce((s,x)=>s+x.designKnM2,0)),
    layers:rows,level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'7.1-7.2, Table 1',sourceUrl:FULL_TEXT,note:'Self-weight must come from standards/drawings/manufacturer data or design dimensions with sourced unit weights; gamma_f follows Table 1.'}),
  };
}

export function basicWindPressureByZone(zone) {
  const values={I:65,II:95,III:125,IV:155,V:185};
  const value=values[String(zone).toUpperCase()];
  if (value==null) throw new RangeError('wind zone must be I, II, III, IV or V');
  return {
    valueDaNm2:value,zone:String(zone).toUpperCase(),level:'engineering-review',
    reference:standardRef({standard:'QCVN 02:2022/BXD',clause:'5.2.2 and Table 5.1',sourceUrl:'https://moc.gov.vn/Images/editor/files/Quy%20Chu%E1%BA%A9n/BXD_02-2022-TT-BXD_26092022%281%29.pdf',note:'Basic wind pressure W0 by wind-pressure zone; locality must be resolved from Table 5.1 or the official map.'}),
  };
}

export function standardWindPressure({windZone,kZe,aerodynamicCoefficient,gustFactor,coefficientSources={}}) {
  const w0=basicWindPressureByZone(windZone);
  for (const [name,value] of Object.entries({kZe,aerodynamicCoefficient,gustFactor})) {
    if (!Number.isFinite(Number(value))) throw new RangeError(`${name} must be finite`);
  }
  if (!(Number(kZe)>0)||!(Number(gustFactor)>0)) throw new RangeError('kZe and gustFactor must be > 0');
  for (const key of ['kZe','aerodynamicCoefficient','gustFactor']) {
    if (!coefficientSources[key]) throw new TypeError(`coefficientSources.${key} is required`);
  }
  const w3s10=0.852*w0.valueDaNm2;
  const wk=w3s10*Number(kZe)*Number(aerodynamicCoefficient)*Number(gustFactor);
  return standardResult({
    value:round(wk),unit:'daN/m²',formulaId:'TCVN2737-2023-Eq10',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'10.2.2-10.2.3, equation (10)',formula:'Wk=(0.852 W0)·k(ze)·c·Gf',sourceUrl:FULL_TEXT}),
    inputs:{windZone:w0.zone,w0DaNm2:w0.valueDaNm2,gammaT:0.852,kZe:Number(kZe),aerodynamicCoefficient:Number(aerodynamicCoefficient),gustFactor:Number(gustFactor),coefficientSources},
  });
}


const TERRAIN_K_TABLE=Object.freeze({
  A:[[5,1.05],[10,1.18],[15,1.27],[20,1.33],[30,1.43],[40,1.50],[50,1.56],[60,1.61],[80,1.69],[100,1.76],[150,1.89],[200,1.99],[250,1.99],[300,1.99],[350,1.99],[400,1.99]],
  B:[[5,0.87],[10,1.00],[15,1.09],[20,1.16],[30,1.26],[40,1.34],[50,1.40],[60,1.46],[80,1.55],[100,1.63],[150,1.77],[200,1.88],[250,1.97],[300,1.97],[350,1.97],[400,1.97]],
  C:[[5,0.59],[10,0.72],[15,0.81],[20,0.88],[30,0.98],[40,1.07],[50,1.14],[60,1.20],[80,1.30],[100,1.39],[150,1.56],[200,1.69],[250,1.80],[300,1.90],[350,1.98],[400,1.98]],
});

export function terrainPressureFactor({terrain,zeM}) {
  const rows=TERRAIN_K_TABLE[String(terrain).toUpperCase()];
  if (!rows) throw new RangeError('terrain must be A, B or C');
  const z=Number(zeM);
  if (!(z>0&&z<=400)) throw new RangeError('zeM must be >0 and <=400 m for implemented Table 9 range');
  const first=rows[0],last=rows.at(-1);
  if (z<=first[0]) return terrainKResult(terrain,z,first[1]);
  if (z>=last[0]) return terrainKResult(terrain,z,last[1]);
  for (let i=1;i<rows.length;i+=1) {
    const [z2,k2]=rows[i],[z1,k1]=rows[i-1];
    if (z<=z2) {
      const k=k1+(k2-k1)*(z-z1)/(z2-z1);
      return terrainKResult(terrain,z,round(k,5));
    }
  }
}

export function rigidStructureGustFactor(firstNaturalPeriodS) {
  const t=Number(firstNaturalPeriodS);
  if (!(t>0)) throw new RangeError('firstNaturalPeriodS must be > 0');
  if (t>1) throw new RangeError('TCVN 2737 clause 10.2.7.2 rigid shortcut applies only when T1 <= 1 s');
  return {
    value:0.85,firstNaturalPeriodS:t,level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'10.2.7.2',formula:'Gf=0.85 for rigid structures with T1≤1s',sourceUrl:FULL_TEXT}),
  };
}

export function hcmWindZone({district}) {
  const normalized=String(district ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').trim();
  if (!normalized) throw new TypeError('district is required');
  const isCuChi=/\bcu chi\b/.test(normalized);
  return {
    zone:isCuChi?'I':'II',
    valueDaNm2:isCuChi?65:95,
    locality:{province:'Thành phố Hồ Chí Minh',district:String(district)},
    level:'engineering-review',
    reference:standardRef({standard:'QCVN 02:2022/BXD',clause:'5.2.3-5.2.4, Table 5.1 — Thành phố Hồ Chí Minh',sourceUrl:'https://moc.gov.vn/Images/editor/files/Quy%20Chu%E1%BA%A9n/BXD_02-2022-TT-BXD_26092022%281%29.pdf',note:'All HCMC cities/districts including Thu Duc except Cu Chi are zone II; Cu Chi is zone I.'}),
  };
}

function terrainKResult(terrain,zeM,value) {
  return {
    value,terrain:String(terrain).toUpperCase(),zeM:Number(zeM),level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'10.2.5, Table 9',sourceUrl:FULL_TEXT,note:'Linear interpolation is permitted for intermediate equivalent heights.'}),
  };
}


export function rectangularBuildingWallPressureCoefficient({heightM,depthAlongWindM,zone}) {
  if (!(Number(heightM)>0)||!(Number(depthAlongWindM)>0)) throw new RangeError('heightM and depthAlongWindM must be > 0');
  const hd=Number(heightM)/Number(depthAlongWindM);
  if (hd>5) throw new RangeError('TCVN 2737 Appendix F.4 Table F.4 profile is implemented only for h/d <= 5');
  const z=String(zone).toUpperCase();
  const fixed={A:-1.2,B:-0.8,C:-0.5};
  if (z in fixed) return wallCeResult(fixed[z],hd,z,'Table F.4 constant zone coefficient');

  if (!['D','E'].includes(z)) throw new RangeError('zone must be A, B, C, D or E');
  const rows=z==='D'
    ? [[0.25,0.7],[1,0.8],[5,0.8]]
    : [[0.25,-0.3],[1,-0.5],[5,-0.7]];
  const effectiveHd=Math.max(0.25,hd);
  const value=linearTable(rows,effectiveHd);
  return wallCeResult(round(value,4),hd,z,'Table F.4 coefficient with linear interpolation by h/d');
}

export function enclosedBuildingInternalPressureCoefficient({openingRatioPercent}) {
  const mu=Number(openingRatioPercent);
  if (!(mu>=0&&mu<=100)) throw new RangeError('openingRatioPercent must be 0..100');
  if (mu<=5) {
    return {
      values:[-0.2,0.2],openingRatioPercent:mu,level:'engineering-review',
      reference:standardRef({standard:'TCVN 2737:2023',clause:'Appendix F, F.12.1-F.12.2',formula:'mu <= 5%: ci = +/-0.2, select adverse sign',sourceUrl:FULL_TEXT}),
    };
  }
  if (mu>=30) {
    return {
      values:[-0.5,0.8],openingRatioPercent:mu,level:'engineering-review',
      reference:standardRef({standard:'TCVN 2737:2023',clause:'Appendix F, F.12.1-F.12.2',formula:'mu >= 30%: ci1=-0.5; ci2=0.8',sourceUrl:FULL_TEXT}),
    };
  }
  return {
    blocked:true,openingRatioPercent:mu,reason:'TCVN F.12 intermediate-opening case requires the applicable interpolation/case treatment; not inferred by BuildMate',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'Appendix F, F.12',sourceUrl:FULL_TEXT}),
  };
}

function wallCeResult(value,hd,zone,note) {
  return {
    value,hOverD:round(hd,4),zone,level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'Appendix F, F.4.1.1, Table F.4',sourceUrl:FULL_TEXT,note}),
  };
}

function linearTable(rows,x) {
  if (x<=rows[0][0]) return rows[0][1];
  for (let i=1;i<rows.length;i+=1) {
    const [x2,y2]=rows[i],[x1,y1]=rows[i-1];
    if (x<=x2) return y1+(y2-y1)*(x-x1)/(x2-x1);
  }
  return rows.at(-1)[1];
}
