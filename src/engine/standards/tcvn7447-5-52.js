import { standardRef } from './common.js';

const STATUS='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-52%3A2010';
const TEXT='https://vanbanphapluat.co/tcvn-7447-5-52-2010-he-thong-lap-dat-dien-ha-ap-he-thong-di-day';

const CU_D1_D2=Object.freeze({
  1.5:[22,18,26,22],2.5:[29,24,34,29],4:[38,31,44,37],6:[47,39,56,46],
  10:[63,52,73,61],16:[81,67,95,79],25:[104,86,121,101],35:[125,103,146,122],
  50:[148,122,173,144],70:[183,151,213,178],95:[216,179,252,211],120:[246,203,287,240],
  150:[278,230,324,271],185:[312,258,363,304],240:[361,297,419,351],300:[408,336,474,396],
});

const GROUPING_BUNDLED=Object.freeze({1:1,2:0.8,3:0.7,4:0.65,6:0.55,9:0.5,12:0.45,16:0.4,20:0.4});

export function d1d2CopperAmpacity({sectionMm2,insulation='PVC',loadedConductors=2}) {
  const row=CU_D1_D2[Number(sectionMm2)];
  if (!row) throw new RangeError('Unsupported D1/D2 copper section');
  const index=insulation==='PVC'?(loadedConductors===2?0:loadedConductors===3?1:-1)
    :insulation==='XLPE'?(loadedConductors===2?2:loadedConductors===3?3:-1):-1;
  if (index<0) throw new RangeError('insulation must be PVC/XLPE and loadedConductors 2/3');
  return {
    ampacityA:row[index],sectionMm2:Number(sectionMm2),insulation,loadedConductors,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-52:2010',clause:'Appendix C, Table C.52.2',sourceUrl:TEXT,note:'D1/D2 installation method, copper conductor current-carrying capacity.'}),
  };
}

export function bundledGroupingFactor(circuitCount) {
  const n=Number(circuitCount);
  if (!(n in GROUPING_BUNDLED)) throw new RangeError('Use a Table C.52.3 circuit count: 1,2,3,4,6,9,12,16,20');
  return {
    factor:GROUPING_BUNDLED[n],circuitCount:n,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-52:2010',clause:'Appendix C, Table C.52.3 item 1',sourceUrl:TEXT,note:'Grouped/bundled circuits in air, on a surface, embedded or enclosed.'}),
  };
}

export function correctedAmpacity({baseAmpacityA,correctionFactors=[]}) {
  if (!(Number(baseAmpacityA)>0)) throw new RangeError('baseAmpacityA must be > 0');
  if (!Array.isArray(correctionFactors)) throw new TypeError('correctionFactors must be an array');
  let value=Number(baseAmpacityA);
  for (const factor of correctionFactors) {
    if (!(Number(factor)>0&&Number(factor)<=1)) throw new RangeError('correction factors must be >0 and <=1');
    value*=Number(factor);
  }
  return {ampacityA:round(value),baseAmpacityA:Number(baseAmpacityA),correctionFactors:[...correctionFactors],level:'engineering-review'};
}

export const TCVN7447_5_52_METADATA={standard:'TCVN 7447-5-52:2010',statusSource:STATUS,textSource:TEXT};
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}
