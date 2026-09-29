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
