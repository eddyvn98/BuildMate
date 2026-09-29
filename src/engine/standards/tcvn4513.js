import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+4513%3A1988';
const FULL_TEXT='https://icci.vn/download/452/aHR0cHM6Ly9pY2NpLnZuL3N0b3JhZ2UvdXBsb2Fkcy9kb2N1bWVudC8xNi90Y3ZuLTQ1MTMtMTk4OC5wZGY%3D';

const ALPHA=Object.freeze({100:2.2,125:2.16,150:2.15,200:2.14,250:2.05,300:2.0,350:1.9,400:1.85});

export function housingDesignFlow({fixtureEquivalentUnits,litersPerPersonDay}) {
  const N=Number(fixtureEquivalentUnits);
  if (!(N>0&&N<=5000)) throw new RangeError('fixtureEquivalentUnits must be >0 and <=5000');
  const alpha=ALPHA[Number(litersPerPersonDay)];
  if (alpha==null) throw new RangeError('litersPerPersonDay must match TCVN 4513 Table 9 values');
  const K=N<=300?0.002:N<=500?0.003:N<=800?0.004:N<=1200?0.005:0.006;
  const q=0.2*alpha*Math.sqrt(N)+K*N;
  return standardResult({
    value:round(q,3),unit:'L/s',formulaId:'TCVN4513-1988-Eq2',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.7, equation (2), Tables 9-10',formula:'q=0.2·α·√N+K·N',sourceUrl:FULL_TEXT}),
    inputs:{fixtureEquivalentUnits:N,litersPerPersonDay:Number(litersPerPersonDay),alpha,K},
  });
}

export function smallFixturePipeDiameter(fixtureEquivalentUnits) {
  const N=Number(fixtureEquivalentUnits);
  if (!(N>0&&N<=20)) throw new RangeError('TCVN 4513 Table 8 applies for N <= 20');
  const steps=[[1,10],[3,15],[6,20],[12,25],[20,32]];
  const pair=steps.find(([limit])=>N<=limit);
  return {
    nominalDiameterMm:pair[1],level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.6, Table 8',sourceUrl:FULL_TEXT,note:'Permitted pipe diameter lookup when total fixture equivalent units are 20 or less.'}),
  };
}

export const TCVN4513_METADATA={standard:'TCVN 4513:1988',statusSource:SOURCE,fullTextSource:FULL_TEXT};
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}
