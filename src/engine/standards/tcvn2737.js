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
