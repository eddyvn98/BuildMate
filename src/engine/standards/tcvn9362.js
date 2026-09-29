import { standardRef } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9362%3A2012';
const FULL_TEXT='https://tcvn.info/data/2017/08/285481_tcvn9362-2012.pdf';

export function checkEccentricFoundationPressures({designResistanceKpa,edgePressureKpa,cornerPressureKpa=null}) {
  requirePositive('designResistanceKpa',designResistanceKpa);
  requireNonNegative('edgePressureKpa',edgePressureKpa);
  if (cornerPressureKpa!=null) requireNonNegative('cornerPressureKpa',cornerPressureKpa);
  const edgeLimit=1.2*Number(designResistanceKpa);
  const cornerLimit=1.5*Number(designResistanceKpa);
  return {
    edge:{pressureKpa:Number(edgePressureKpa),limitKpa:round(edgeLimit),pass:Number(edgePressureKpa)<=edgeLimit},
    corner:cornerPressureKpa==null?null:{pressureKpa:Number(cornerPressureKpa),limitKpa:round(cornerLimit),pass:Number(cornerPressureKpa)<=cornerLimit},
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'4.6.19',formula:'edge pressure ≤ 1.2R; corner pressure ≤ 1.5R',sourceUrl:FULL_TEXT}),
  };
}

export function preliminaryFoundationPressureTarget({conventionalResistanceKpa}) {
  requirePositive('conventionalResistanceKpa',conventionalResistanceKpa);
  return {
    targetAveragePressureKpa:Number(conventionalResistanceKpa),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'4.6.18',formula:'preliminary foundation size from average base pressure equal to conventional R0',sourceUrl:FULL_TEXT}),
    warning:'Clause 4.6.18 is a preliminary sizing basis and does not replace settlement/deformation checks.',
  };
}

export const TCVN9362_METADATA={standard:'TCVN 9362:2012',statusSource:SOURCE,fullTextSource:FULL_TEXT};
function requirePositive(n,v){if(!(Number(v)>0))throw new RangeError(`${n} must be > 0`);}
function requireNonNegative(n,v){if(!(Number(v)>=0))throw new RangeError(`${n} must be >= 0`);}
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}
