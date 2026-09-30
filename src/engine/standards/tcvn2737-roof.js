import { standardRef } from './common.js';

const SOURCE='https://icci.vn/storage/documents/September2023/TCVN2737_2023_920293.pdf';

const F5A=Object.freeze({
  '-45':{F:-0.6,G:-0.6,H:-0.8,I:-0.7,J:-1.0},
  '-30':{F:-1.1,G:-2.0,H:-0.8,I:-0.6,J:-0.8},
  '-15':{F:-2.5,G:-1.3,H:-0.9,I:-0.5,J:-0.7},
  '-5':{F:-2.3,G:-1.2,H:-0.8,I:[-0.6,0.2],J:[-0.6,0.2]},
  '5':{F:[-1.7,0],G:[-1.2,0],H:[-0.6,0],I:-0.6,J:[-0.6,0.2]},
  '15':{F:[-0.9,0.2],G:[-0.8,0.2],H:[-0.3,0.2],I:-0.4,J:-1.0},
  '30':{F:[-0.5,0.7],G:[-0.5,0.7],H:[-0.2,0.4],I:-0.4,J:-0.5},
  '45':{F:[0,0.7],G:[0,0.7],H:[0,0.6],I:[-0.2,0],J:[-0.3,0]},
  '60':{F:0.7,G:0.7,H:0.7,I:-0.2,J:-0.3},
  '75':{F:0.8,G:0.8,H:0.8,I:-0.2,J:-0.3},
});

const F5B=Object.freeze({
  '-45':{F:-1.4,G:-1.2,H:-1.0,I:-0.9},
  '-30':{F:-1.5,G:-1.2,H:-1.0,I:-0.9},
  '-15':{F:-1.9,G:-1.2,H:-0.8,I:-0.8},
  '-5':{F:-1.8,G:-1.2,H:-0.7,I:-0.6},
  '5':{F:-1.6,G:-1.3,H:-0.7,I:-0.6},
  '15':{F:-1.3,G:-1.3,H:-0.6,I:-0.5},
  '30':{F:-1.1,G:-1.4,H:-0.8,I:-0.5},
  '45':{F:-1.1,G:-1.4,H:-0.9,I:-0.5},
  '60':{F:-1.1,G:-1.2,H:-0.8,I:-0.5},
  '75':{F:-1.1,G:-1.2,H:-0.8,I:-0.5},
});

export function pitchedRoofPressureCoefficient({windAngleDeg,slopeDeg,zone,sign='adverse'}) {
  const theta=Number(windAngleDeg);
  if (![0,90].includes(theta)) throw new RangeError('windAngleDeg must be 0 or 90 for implemented F.5 tables');
  const table=theta===0?F5A:F5B;
  const z=String(zone).toUpperCase();
  const slopes=Object.keys(table).map(Number).sort((a,b)=>a-b);
  if (!slopes.includes(Number(slopeDeg))) {
    throw new RangeError('slopeDeg must match a verified F.5 table row; interpolation is intentionally blocked unless same-sign handling is implemented');
  }
  const raw=table[String(Number(slopeDeg))]?.[z];
  if (raw==null) throw new RangeError('zone '+z+' is not available for theta='+theta);
  const value=Array.isArray(raw)?selectSigned(raw,sign):raw;
  return {
    value,
    alternatives:Array.isArray(raw)?[...raw]:[raw],
    windAngleDeg:theta,slopeDeg:Number(slopeDeg),zone:z,sign,
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 2737:2023',
      clause:theta===0?'Appendix F, Table F.5a':'Appendix F, Table F.5b',
      sourceUrl:SOURCE,
      note:theta===0
        ? 'Where both signs are tabulated, positive and negative load cases must be considered separately and not mixed on one roof surface.'
        : 'External roof pressure coefficient for theta=90 degrees.',
    }),
  };
}

function selectSigned(values,sign) {
  if (sign==='positive') return Math.max(...values);
  if (sign==='negative') return Math.min(...values);
  if (sign==='adverse') return values.reduce((a,b)=>Math.abs(b)>Math.abs(a)?b:a);
  throw new RangeError('sign must be positive, negative or adverse');
}
