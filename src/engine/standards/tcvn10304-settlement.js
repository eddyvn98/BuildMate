import { standardRef, standardResult } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

export function pileInteractionDelta({kv,G1Mpa,G2Mpa,pileLengthM,spacingM}) {
  for (const [name,value] of Object.entries({kv,G1Mpa,G2Mpa,pileLengthM,spacingM})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  const ratio=Number(kv)*Number(G1Mpa)*Number(pileLengthM)
    /(2*Number(G2Mpa)*Number(spacingM));
  const delta=ratio>1?0.17*Math.log(ratio):0;
  return standardResult({
    value:round(delta,6),unit:'ratio',formulaId:'TCVN10304-2025-Eq37',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.4.3.1, equation (37)',
      formula:'delta = 0.17 ln(kv G1 L / (2 G2 a)) when ratio > 1; delta = 0 otherwise',sourceUrl:SOURCE,
    }),
    inputs:{kv:Number(kv),G1Mpa:Number(G1Mpa),G2Mpa:Number(G2Mpa),pileLengthM:Number(pileLengthM),spacingM:Number(spacingM),ratio:round(ratio,6)},
  });
}

export function additionalSettlementFromPile({loadMN,G1Mpa,pileLengthM,delta}) {
  for (const [name,value] of Object.entries({G1Mpa,pileLengthM})) if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  if (!(Number(loadMN)>=0)||!(Number(delta)>=0)) throw new RangeError('loadMN and delta must be >= 0');
  const settlementM=Number(delta)*Number(loadMN)/(Number(G1Mpa)*Number(pileLengthM));
  return standardResult({
    value:round(settlementM*1000,4),unit:'mm',formulaId:'TCVN10304-2025-Eq36',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.4.3.1, equation (36)',
      formula:'sad = delta * Nd,SLS / (G1 L)',sourceUrl:SOURCE,
    }),
    inputs:{loadMN:Number(loadMN),G1Mpa:Number(G1Mpa),pileLengthM:Number(pileLengthM),delta:Number(delta)},
  });
}

export function pileGroupSettlementAtPile({
  singlePileSettlementMm,pileIndex,pileLoadsMN,pileCoordinatesM,kv,G1Mpa,G2Mpa,pileLengthM
}) {
  if (!(Number(singlePileSettlementMm)>=0)) throw new RangeError('singlePileSettlementMm must be >= 0');
  if (!Array.isArray(pileLoadsMN)||!Array.isArray(pileCoordinatesM)||pileLoadsMN.length!==pileCoordinatesM.length||pileLoadsMN.length<2) {
    throw new TypeError('pileLoadsMN and pileCoordinatesM must have equal length >=2');
  }
  const i=Number(pileIndex);
  if (!Number.isInteger(i)||i<0||i>=pileLoadsMN.length) throw new RangeError('invalid pileIndex');
  const source=pileCoordinatesM[i];
  if (!Array.isArray(source)||source.length!==2) throw new TypeError('pile coordinates must be [x,y]');
  let additionalMm=0;
  const interactions=[];
  for (let j=0;j<pileLoadsMN.length;j+=1) {
    if (j===i) continue;
    const p=pileCoordinatesM[j];
    if (!Array.isArray(p)||p.length!==2) throw new TypeError('pile coordinates must be [x,y]');
    const spacing=Math.hypot(Number(source[0])-Number(p[0]),Number(source[1])-Number(p[1]));
    if (!(spacing>0)) throw new RangeError('pile axes must not coincide');
    const d=pileInteractionDelta({kv,G1Mpa,G2Mpa,pileLengthM,spacingM:spacing});
    const sad=additionalSettlementFromPile({loadMN:Number(pileLoadsMN[j]),G1Mpa,pileLengthM,delta:d.value});
    additionalMm+=sad.value;
    interactions.push({fromPile:j,spacingM:round(spacing,4),delta:d.value,additionalSettlementMm:sad.value});
  }
  const total=Number(singlePileSettlementMm)+additionalMm;
  return {
    value:round(total,4),unit:'mm',formulaId:'TCVN10304-2025-Eq38',
    singlePileSettlementMm:Number(singlePileSettlementMm),additionalSettlementMm:round(additionalMm,4),
    interactions,level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.4.3.1, equation (38)',
      formula:'si = s(Nd,SLS,i) + sum(delta_ij * Nd,SLS,j / (G1 L))',sourceUrl:SOURCE,
    }),
    inputs:{pileIndex:i,pileLoadsMN:[...pileLoadsMN],pileCoordinatesM:structuredClone(pileCoordinatesM),kv:Number(kv),G1Mpa:Number(G1Mpa),G2Mpa:Number(G2Mpa),pileLengthM:Number(pileLengthM)},
  };
}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
