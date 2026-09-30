import { standardRef, standardResult } from './common.js';

const SOURCE='https://www.atld.vn/law/856/content';

const A_M3S=Object.freeze({
  175:18.96,200:9.273,225:4.822,250:2.583,300:0.9392,325:0.6088,350:0.4078,400:0.2062,
});
const K_LOW_VELOCITY=Object.freeze({
  0.2:1.41,0.3:1.28,0.4:1.20,0.5:1.15,0.6:1.115,0.7:1.085,
  0.8:1.06,0.9:1.04,1.0:1.035,1.1:1.015,1.2:1.0,
});

export function table14LargeResistanceA(diameterMm) {
  const A=A_M3S[Number(diameterMm)];
  if (A==null) throw new RangeError('TCVN 4513 Table 14(b) implemented diameters: 175,200,225,250,300,325,350,400 mm');
  return {
    value:A,diameterMm:Number(diameterMm),flowUnit:'m3/s',level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.14-6.15, Table 14(b)',sourceUrl:SOURCE,note:'Unit resistance A for steel/cast-iron pipe with q in m3/s.'}),
  };
}

export function lowVelocityCorrectionFactor(velocityMps) {
  const v=Number(velocityMps);
  if (!(v>0)) throw new RangeError('velocityMps must be > 0');
  if (v>=1.2) return {
    value:1,velocityMps:v,level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.15, Table 15',sourceUrl:SOURCE,note:'No K increase at velocity >= 1.2 m/s.'}),
  };
  const K=K_LOW_VELOCITY[v];
  if (K==null) throw new RangeError('velocity below 1.2 m/s must match a verified Table 15 row 0.2..1.1 m/s; interpolation is not assumed');
  return {
    value:K,velocityMps:v,level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.15, Table 15',sourceUrl:SOURCE,note:'Multiply Table 14 resistance A by K when velocity is below 1.2 m/s.'}),
  };
}

export function largePipeFrictionGradient({diameterMm,flowM3s,velocityMps}) {
  if (!(Number(flowM3s)>0)) throw new RangeError('flowM3s must be > 0');
  const resistance=table14LargeResistanceA(diameterMm);
  const correction=lowVelocityCorrectionFactor(velocityMps);
  const effectiveA=resistance.value*correction.value;
  const gradient=effectiveA*Number(flowM3s)**2;
  return standardResult({
    value:round(gradient,8),unit:'m/m',formulaId:'TCVN4513-1988-6.14-6.15-large',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.14-6.15, Tables 14(b)-15',formula:'i=(A*K)*q^2 for v<1.2m/s; K=1 at v>=1.2m/s',sourceUrl:SOURCE}),
    inputs:{diameterMm:Number(diameterMm),flowM3s:Number(flowM3s),velocityMps:Number(velocityMps),A:resistance.value,K:correction.value,effectiveA},
  });
}
function round(v,d=8){const f=10**d;return Math.round(v*f)/f;}
