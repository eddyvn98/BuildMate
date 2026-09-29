import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-54%3A2015';
const TEXT='https://vanbanphapluat.co/tcvn-7447-5-54-2015-he-thong-lap-dat-dien-ha-ap-bo-tri-noi-dat-day-bao-ve';

export function protectiveConductorAdiabaticArea({faultCurrentA,disconnectTimeS,k}) {
  requirePositive('faultCurrentA',faultCurrentA); requirePositive('disconnectTimeS',disconnectTimeS); requirePositive('k',k);
  if (Number(disconnectTimeS)>5) throw new RangeError('TCVN 7447-5-54:2015 clause 543.1.2 formula applies only for disconnect time <= 5 s');
  const area=Number(faultCurrentA)*Math.sqrt(Number(disconnectTimeS))/Number(k);
  return standardResult({
    value:round(area,3),unit:'mm²',formulaId:'TCVN7447-5-54-543.1.2',
    reference:standardRef({standard:'TCVN 7447-5-54:2015',clause:'543.1.2',formula:'S = I·√t / k',sourceUrl:TEXT}),
    inputs:{faultCurrentA:Number(faultCurrentA),disconnectTimeS:Number(disconnectTimeS),k:Number(k)},
    warnings:['If the calculated size is non-standard, clause 543.1.2 requires the next larger standard conductor size.'],
  });
}

export function copperPeByPhaseSection(phaseSectionMm2) {
  requirePositive('phaseSectionMm2',phaseSectionMm2);
  const S=Number(phaseSectionMm2);
  const pe=S<=16?S:S<=35?16:S/2;
  return {
    minimumPeMm2:pe,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-54:2015',clause:'543.1.1, Table 54.2',formula:'Cu same material: S_PE=S for S≤16; 16 for 16<S≤35; S/2 for S>35',sourceUrl:TEXT}),
  };
}

export const TCVN7447_5_54_METADATA={standard:'TCVN 7447-5-54:2015',statusSource:SOURCE,textSource:TEXT};
function requirePositive(n,v){if(!(Number(v)>0))throw new RangeError(`${n} must be > 0`);}
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}
