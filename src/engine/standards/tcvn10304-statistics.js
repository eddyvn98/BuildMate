import { standardRef } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

const OUTLIER_V=Object.freeze({
  3:1.16,4:1.48,5:1.72,6:1.89,7:2.02,8:2.13,9:2.22,10:2.29,11:2.36,12:2.41,13:2.46,14:2.51,15:2.55,16:2.59,17:2.62,18:2.65,
  19:2.68,20:2.71,21:2.73,22:2.76,23:2.78,24:2.80,25:2.82,26:2.84,27:2.86,28:2.88,29:2.89,30:2.91,31:2.92,32:2.94,
  33:2.95,34:2.97,35:2.98,36:2.99,37:3.00,38:3.01,39:3.02,40:3.04,41:3.05,42:3.06,43:3.07,44:3.08,45:3.09,46:3.10,
  47:3.11,48:3.12,49:3.13,50:3.14,
});

const T95=Object.freeze({
  3:2.35,4:2.13,5:2.01,6:1.94,7:1.90,8:1.86,9:1.83,10:1.81,11:1.80,12:1.78,13:1.77,14:1.76,15:1.75,16:1.75,17:1.74,
  18:1.73,19:1.73,20:1.72,25:1.71,30:1.70,40:1.68,60:1.67,
});

export function appendixGStatistics95(values,{rejectOutliers=true}={}) {
  if (!Array.isArray(values)||values.length<3) throw new RangeError('Appendix G statistics require at least 3 values');
  let work=values.map(Number);
  if (!work.every(v=>Number.isFinite(v))) throw new RangeError('all values must be finite');
  const removed=[];

  if (rejectOutliers) {
    let changed=true;
    while (changed) {
      changed=false;
      const n=work.length;
      if (n<3||n>50) break;
      const criterion=OUTLIER_V[n];
      if (criterion==null) break;
      const mean=average(work),sd=sampleSd(work,mean);
      if (!(sd>0)) break;
      const candidates=work.map((value,index)=>({value,index,score:Math.abs(mean-value)/sd}))
        .filter(x=>x.score>criterion).sort((a,b)=>b.score-a.score);
      if (candidates.length) {
        const hit=candidates[0];
        removed.push({value:hit.value,score:round(hit.score,5),criterion});
        work=work.filter((_,i)=>i!==hit.index);
        changed=true;
      }
    }
  }

  const n=work.length;
  if (n<3) throw new RangeError('fewer than 3 values remain after outlier rejection');
  const mean=average(work),sd=sampleSd(work,mean);
  const V=mean===0?0:Math.abs(sd/mean);
  const K=n-1;
  const t=lookupT95(K);
  const rho=t*V/Math.sqrt(n);
  if (!(rho<1)) throw new RangeError('Appendix G reliability expression requires rho_alpha < 1');
  const gammaG=1/(1-rho);
  const design=mean/gammaG;

  return {
    retained:[...work],removed,n,
    standardValue:round(mean,6),
    standardDeviation:round(sd,6),
    variationCoefficient:round(V,6),
    tAlpha95:t,rhoAlpha:round(rho,6),
    gammaG:round(gammaG,6),
    designValue:round(design,6),
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 10304:2025',clause:'Appendix G, G.2.2-G.2.6 equations (G.1)-(G.7)',formula:'Xn=mean; S; V=S/Xn; rho=t_alpha V/sqrt(n); gamma_g=1/(1-rho); X=Xn/gamma_g',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 10304:2025',clause:'Appendix G, Tables G.1-G.2',sourceUrl:SOURCE,note:'Outlier criterion v and one-sided alpha=0.95 t_alpha.'}),
    ],
  };
}

function lookupT95(K) {
  if (T95[K]!=null) return T95[K];
  throw new RangeError('Table G.2 does not tabulate alpha=0.95 for this exact degree-of-freedom row; BuildMate does not invent interpolation');
}
function average(v){return v.reduce((a,b)=>a+b,0)/v.length;}
function sampleSd(v,mean){return Math.sqrt(v.reduce((s,x)=>s+(x-mean)**2,0)/(v.length-1));}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
