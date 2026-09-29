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
