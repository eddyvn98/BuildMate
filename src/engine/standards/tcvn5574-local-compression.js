import { standardRef, standardResult } from './common.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

export function localCompressionStrength({RbMpa,loadedAreaMm2,maxEffectiveAreaMm2}) {
  const Rb=Number(RbMpa),Aloc=Number(loadedAreaMm2),Amax=Number(maxEffectiveAreaMm2);
  if (!(Rb>0)||!(Aloc>0)||!(Amax>=Aloc)) {
    throw new RangeError('RbMpa>0, loadedAreaMm2>0 and maxEffectiveAreaMm2>=loadedAreaMm2 are required');
  }
  const phiRaw=0.8*Math.sqrt(Amax/Aloc);
  const phi=Math.max(1,Math.min(2.5,phiRaw));
  const Rbloc=phi*Rb;
  return standardResult({
    value:round(Rbloc,4),unit:'MPa',formulaId:'TCVN5574-2018-Eq117-118',
    reference:standardRef({
      standard:'TCVN 5574:2018',
      clause:'8.1.5.2, equations (117)-(118)',
      formula:'Rb,loc=phi_b Rb; phi_b=0.8 sqrt(Ab,max/Ab,loc), limited to 1.0..2.5',
      sourceUrl:SOURCE,
    }),
    inputs:{RbMpa:Rb,loadedAreaMm2:Aloc,maxEffectiveAreaMm2:Amax,phiRaw:round(phiRaw,6),phiB:round(phi,6)},
  });
}

export function checkLocalCompression({
  localForceKn,RbMpa,loadedAreaMm2,maxEffectiveAreaMm2,distribution='uniform',
  effectiveAreaGeometrySource
}) {
  const N=Number(localForceKn),Aloc=Number(loadedAreaMm2);
  if (!(N>=0)) throw new RangeError('localForceKn must be >=0');
  if (!effectiveAreaGeometrySource) throw new TypeError('effectiveAreaGeometrySource is required');
  const psi=distribution==='uniform'?1:distribution==='nonuniform'?0.75:null;
  if (psi==null) throw new RangeError('distribution must be uniform or nonuniform');
  const strength=localCompressionStrength({RbMpa,loadedAreaMm2,maxEffectiveAreaMm2});
  const capacityKn=psi*strength.value*Aloc/1000;
  return {
    pass:N<=capacityKn,
    demandKn:N,capacityKn:round(capacityKn,4),utilization:capacityKn>0?round(N/capacityKn,5):Infinity,
    psi,distribution,effectiveAreaGeometrySource:String(effectiveAreaGeometrySource),
    level:'engineering-review',
    references:[
      standardRef({
        standard:'TCVN 5574:2018',
        clause:'8.1.5.2, equation (116)',
        formula:'N <= psi Rb,loc Ab,loc; psi=1.0 uniform, 0.75 nonuniform',
        sourceUrl:SOURCE,
      }),
      strength.reference,
      standardRef({
        standard:'TCVN 5574:2018',
        clause:'8.1.5.2, Figure 13 effective-area rules; 10.3.5.8 special anchorage',
        sourceUrl:SOURCE,
        note:'Special anchors/plates/nuts/angles/bulged ends must provide contact area satisfying local concrete compression. Ab,max geometry must share the loaded-area centroid and follow the Figure 13 boundary rules.',
      }),
    ],
    checks:{RbLocMpa:strength.value,phiB:strength.inputs.phiB},
  };
}

export function checkSpecialAnchorBearing(input) {
  return {
    anchorType:String(input?.anchorType ?? 'special-anchor'),
    ...checkLocalCompression(input),
  };
}

function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
