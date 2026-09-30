import { standardRef, standardResult } from './common.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

export function checkDeflection({calculatedMm,allowableMm,allowableSource}) {
  if (!(Number(calculatedMm)>=0)) throw new RangeError('calculatedMm must be >= 0');
  if (!(Number(allowableMm)>0)) throw new RangeError('allowableMm must be > 0');
  if (!allowableSource) throw new TypeError('allowableSource is required');
  return {
    calculatedMm:Number(calculatedMm),
    allowableMm:Number(allowableMm),
    pass:Number(calculatedMm)<=Number(allowableMm),
    allowableSource:String(allowableSource),
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 5574:2018',
      clause:'8.2.3.2.1, equation (177)',
      formula:'f <= fu',
      sourceUrl:SOURCE,
    }),
  };
}

export function symmetricMidspanDeflectionFromCurvature({
  spanM,segmentCount,leftSupportCurvature,rightSupportCurvature,
  symmetricPairs,midspanCurvature
}) {
  const L=Number(spanM),n=Number(segmentCount);
  if (!(L>0)) throw new RangeError('spanM must be > 0');
  if (!Number.isInteger(n)||n<6||n%2!==0) throw new RangeError('segmentCount must be an even integer >= 6');
  if (!Array.isArray(symmetricPairs)||symmetricPairs.length!==n/2-1) {
    throw new RangeError('symmetricPairs length must equal segmentCount/2 - 1');
  }
  const curvatures=[leftSupportCurvature,rightSupportCurvature,midspanCurvature,...symmetricPairs.flat()];
  if (!curvatures.every(v=>Number.isFinite(Number(v)))) throw new RangeError('all curvatures must be finite');

  let weighted=Number(leftSupportCurvature)+Number(rightSupportCurvature);
  for (let i=1;i<=n/2-1;i+=1) {
    const pair=symmetricPairs[i-1];
    weighted+=6*i*(Number(pair[0])+Number(pair[1]));
  }
  weighted+=(3*n-2)*Number(midspanCurvature);
  const deflectionM=L/(12*n*n)*weighted;

  return standardResult({
    value:round(deflectionM*1000,4),unit:'mm',formulaId:'TCVN5574-2018-Eq179',
    reference:standardRef({
      standard:'TCVN 5574:2018',
      clause:'8.2.3.2.2, equation (179)',
      formula:'fm = L/(12 n^2) * curvature-weighted sum',
      sourceUrl:SOURCE,
    }),
    inputs:{
      spanM:L,segmentCount:n,leftSupportCurvature:Number(leftSupportCurvature),
      rightSupportCurvature:Number(rightSupportCurvature),
      symmetricPairs:structuredClone(symmetricPairs),
      midspanCurvature:Number(midspanCurvature),
    },
    warnings:['Curvatures must be calculated from the applicable cracked/uncracked section rules in 8.2.3.3/8.2.3.4; this function does not infer them.'],
  });
}

function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
