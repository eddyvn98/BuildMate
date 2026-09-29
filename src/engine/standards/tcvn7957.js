import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7957%3A2023';
const TEXT='https://www.atld.vn/law/2710/content';

export const MANNING_N=Object.freeze({
  reinforcedConcrete:0.013,
  castIron:0.012,
  steel:0.012,
  plasticMin:0.011,
  plasticMax:0.0115,
});

export function manningVelocity({hydraulicRadiusM,hydraulicSlope,manningN}) {
  requirePositive('hydraulicRadiusM',hydraulicRadiusM); requirePositive('hydraulicSlope',hydraulicSlope); requirePositive('manningN',manningN);
  const v=(1/Number(manningN))*Number(hydraulicRadiusM)**(2/3)*Math.sqrt(Number(hydraulicSlope));
  return standardResult({
    value:round(v,4),unit:'m/s',formulaId:'TCVN7957-2023-Manning',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.2, Table 9',formula:'v=(1/n)·R^(2/3)·i^(1/2)',sourceUrl:TEXT}),
    inputs:{hydraulicRadiusM:Number(hydraulicRadiusM),hydraulicSlope:Number(hydraulicSlope),manningN:Number(manningN)},
    warnings:['Gravity sewer velocity must also satisfy the self-cleansing requirement stated in clause 5.3.2.'],
  });
}

export function manningNForMaterial(material) {
  if (!(material in MANNING_N)) throw new RangeError('Unsupported TCVN 7957 Table 9 material');
  const value=MANNING_N[material];
  return {
    value,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.2, Table 9',sourceUrl:TEXT,note:'Manning coefficient by conduit material.'}),
  };
}

export const TCVN7957_METADATA={standard:'TCVN 7957:2023',statusSource:SOURCE,textSource:TEXT};
function requirePositive(n,v){if(!(Number(v)>0))throw new RangeError(`${n} must be > 0`);}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
