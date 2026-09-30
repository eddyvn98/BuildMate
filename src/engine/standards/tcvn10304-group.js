import { standardRef } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

export function preliminaryEqualPileLoad({foundationSlsLoadKn,pileCount}) {
  const total=Number(foundationSlsLoadKn),n=Number(pileCount);
  if (!(total>=0)) throw new RangeError('foundationSlsLoadKn must be >= 0');
  if (!Number.isInteger(n)||n<1) throw new RangeError('pileCount must be integer >= 1');
  return {
    loadPerPileKn:round(total/n,3),
    pileCount:n,foundationSlsLoadKn:total,
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 10304:2025',
      clause:'7.4.3.1',
      formula:'Nd,mean = Nd,f / n for preliminary flexible-cap modelling',
      sourceUrl:SOURCE,
    }),
    warning:'This equal-load assumption is preliminary only. Final analysis must consider pile-cap and superstructure stiffness and pile interaction.',
  };
}

export function checkPileGroupModelConvergence({geotechnicalPileForcesKn,structuralPileForcesKn}) {
  if (!Array.isArray(geotechnicalPileForcesKn)||!Array.isArray(structuralPileForcesKn)
    ||geotechnicalPileForcesKn.length===0||geotechnicalPileForcesKn.length!==structuralPileForcesKn.length) {
    throw new TypeError('force arrays must be non-empty and have equal length');
  }
  const rows=geotechnicalPileForcesKn.map((g,i)=>{
    const s=Number(structuralPileForcesKn[i]),gg=Number(g);
    if (!Number.isFinite(gg)||!Number.isFinite(s)) throw new RangeError('pile forces must be finite');
    const denominator=Math.max(Math.abs(s),1e-9);
    const differencePercent=Math.abs(gg-s)/denominator*100;
    return {index:i,geotechnicalKn:gg,structuralKn:s,differencePercent:round(differencePercent,3),pass:differencePercent<=10};
  });
  return {
    pass:rows.every(x=>x.pass),
    maximumDifferencePercent:round(Math.max(...rows.map(x=>x.differencePercent)),3),
    rows,level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 10304:2025',
      clause:'7.4.3.1',
      formula:'difference between pile internal forces from geotechnical and global structural models <= 10%',
      sourceUrl:SOURCE,
    }),
  };
}
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}
