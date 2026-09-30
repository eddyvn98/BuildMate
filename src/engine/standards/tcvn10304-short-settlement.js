import { standardRef, standardResult } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

const ROWS=Object.freeze({
  0.00:{kv:2.820,zeta0:0.455,mv:1.345},
  0.05:{kv:2.636,zeta0:0.437,mv:1.373},
  0.10:{kv:2.464,zeta0:0.419,mv:1.405},
  0.15:{kv:2.302,zeta0:0.400,mv:1.446},
  0.20:{kv:2.151,zeta0:0.380,mv:1.491},
  0.25:{kv:2.011,zeta0:0.361,mv:1.540},
  0.30:{kv:1.882,zeta0:0.340,mv:1.607},
  0.35:{kv:1.764,zeta0:0.319,mv:1.685},
  0.40:{kv:1.657,zeta0:0.297,mv:1.786},
  0.45:{kv:1.560,zeta0:0.274,mv:1.916},
  0.50:{kv:1.475,zeta0:0.250,mv:2.010},
});

export function shortPileTableRow(poissonRatio) {
  const key=Number(poissonRatio).toFixed(2);
  const row=ROWS[key];
  if (!row) throw new RangeError('poissonRatio must match a published TCVN 10304:2025 Table 17 row from 0.00 to 0.50 in 0.05 increments');
  return {
    poissonRatio:Number(key),...row,level:'engineering-review',
    reference:standardRef({standard:'TCVN 10304:2025',clause:'7.4.2.1, Table 17',sourceUrl:SOURCE,note:'Published coefficients for short-pile settlement branch.'}),
  };
}

export function shortPileSettlement({
  loadMN,G1Mpa,G2Mpa,poissonRatio,pileLengthM,pileDiameterM
}) {
  for (const [name,value] of Object.entries({G1Mpa,G2Mpa,pileLengthM,pileDiameterM})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  if (!(Number(loadMN)>=0)) throw new RangeError('loadMN must be >= 0');
  const L=Number(pileLengthM),d=Number(pileDiameterM),G1=Number(G1Mpa),G2=Number(G2Mpa);
  if (!(L/d>5)) throw new RangeError('TCVN 10304 7.4.2.1 requires L/d > 5');
  const k=G1*L/(G2*d);
  if (!(k>1&&k<=7.5)) throw new RangeError('short-pile branch requires 1 < k <= 7.5');
  const row=shortPileTableRow(poissonRatio);
  const zetaPrime=row.zeta0/(1+k/row.mv);
  const settlementM=zetaPrime*Number(loadMN)/(G2*d);
  return standardResult({
    value:round(settlementM*1000,4),unit:'mm',formulaId:'TCVN10304-2025-Eq34',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.4.2.1, equation (34) and Table 17',
      formula:"s=zeta' Nd,SLS/(G2 d); zeta'=zeta0/[1+(k/mv)]",
      sourceUrl:SOURCE,
    }),
    inputs:{loadMN:Number(loadMN),G1Mpa:G1,G2Mpa:G2,poissonRatio:row.poissonRatio,pileLengthM:L,pileDiameterM:d,k:round(k,6),zeta0:row.zeta0,mv:row.mv,zetaPrime:round(zetaPrime,6)},
  });
}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
