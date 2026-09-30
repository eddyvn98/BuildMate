import { standardRef, standardResult } from './common.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

export function columnFlexuralRigidity({
  kb,EbMpa,concreteInertiaMm4,EsMpa,steelInertiaMm4,ks=0.7,kbSource
}) {
  for (const [name,value] of Object.entries({kb,EbMpa,concreteInertiaMm4,EsMpa,steelInertiaMm4,ks})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  if (!kbSource) throw new TypeError('kbSource is required');
  const D=Number(kb)*Number(EbMpa)*Number(concreteInertiaMm4)
    +Number(ks)*Number(EsMpa)*Number(steelInertiaMm4);
  return standardResult({
    value:D,unit:'N·mm²',formulaId:'TCVN5574-2018-Eq46',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.1.2.4.2, equation (46)',
      formula:'D = kb Eb I + ks Es Is; ks=0.7',sourceUrl:SOURCE,
    }),
    inputs:{kb:Number(kb),EbMpa:Number(EbMpa),concreteInertiaMm4:Number(concreteInertiaMm4),EsMpa:Number(EsMpa),steelInertiaMm4:Number(steelInertiaMm4),ks:Number(ks),kbSource},
  });
}

export function columnCriticalLoad({rigidityNmm2,effectiveLengthMm}) {
  if (!(Number(rigidityNmm2)>0)||!(Number(effectiveLengthMm)>0)) throw new RangeError('rigidityNmm2 and effectiveLengthMm must be > 0');
  const ncrN=Math.PI**2*Number(rigidityNmm2)/Number(effectiveLengthMm)**2;
  return standardResult({
    value:round(ncrN/1000,4),unit:'kN',formulaId:'TCVN5574-2018-Eq45',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.1.2.4.2, equation (45)',
      formula:'Ncr = pi^2 D / L0^2',sourceUrl:SOURCE,
    }),
    inputs:{rigidityNmm2:Number(rigidityNmm2),effectiveLengthMm:Number(effectiveLengthMm)},
  });
}

export function secondOrderEta({axialLoadKn,criticalLoadKn}) {
  const N=Number(axialLoadKn),Ncr=Number(criticalLoadKn);
  if (!(N>=0)||!(Ncr>0)) throw new RangeError('axialLoadKn must be >=0 and criticalLoadKn >0');
  if (N>=Ncr) return {blocked:true,reason:'N >= Ncr',axialLoadKn:N,criticalLoadKn:Ncr};
  const eta=1/(1-N/Ncr);
  return standardResult({
    value:round(eta,5),unit:'ratio',formulaId:'TCVN5574-2018-Eq44',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.1.2.4.2, equation (44)',
      formula:'eta = 1 / (1 - N/Ncr)',sourceUrl:SOURCE,
    }),
    inputs:{axialLoadKn:N,criticalLoadKn:Ncr},
  });
}

export function rectangularEccentricCompressionCheck({
  axialLoadKn,firstOrderMomentKnM,eta,bMm,hMm,h0Mm,aPrimeMm,
  RbMpa,RsMpa,RscMpa,AsMm2,AsCompressionMm2,xiR
}) {
  for (const [name,value] of Object.entries({axialLoadKn,bMm,hMm,h0Mm,RbMpa,RsMpa,RscMpa,AsMm2,xiR,eta})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  if (!(Number(firstOrderMomentKnM)>=0)||!(Number(aPrimeMm)>=0)||!(Number(AsCompressionMm2)>=0)) {
    throw new RangeError('moment/aPrime/AsCompression must be non-negative');
  }
  const Nn=Number(axialLoadKn)*1000;
  const x=(Nn+Number(RsMpa)*Number(AsMm2)-Number(RscMpa)*Number(AsCompressionMm2))
    /(Number(RbMpa)*Number(bMm));
  const xi=x/Number(h0Mm);
  const e0Mm=Number(firstOrderMomentKnM)*1e6/Nn;
  let xUsed=x;
  let branch='Eq42-large-eccentricity';
  let transition=null;
  if (xi>Number(xiR)) {
    const epsilon0=e0Mm/Number(hMm);
    xUsed=(Number(xiR)+(1-Number(xiR))/(1+50*epsilon0*epsilon0))*Number(h0Mm);
    branch='Eq43-small-eccentricity-transition';
    transition={epsilon0:round(epsilon0,6),xFromEq42Mm:round(x,3),xEq43Mm:round(xUsed,3)};
  }
  const xiUsed=xUsed/Number(h0Mm);
  const eMm=e0Mm*Number(eta)+Number(hMm)/2-Number(aPrimeMm);
  const demandKnM=Number(axialLoadKn)*eMm/1000;
  const capacityNmm=Number(RbMpa)*Number(bMm)*xUsed*(Number(h0Mm)-0.5*xUsed)
    +Number(RscMpa)*Number(AsCompressionMm2)*(Number(h0Mm)-Number(aPrimeMm));
  const capacityKnM=capacityNmm/1e6;
  return {
    pass:demandKnM<=capacityKnM,blocked:false,
    demandKnM:round(demandKnM,4),capacityKnM:round(capacityKnM,4),
    utilization:round(demandKnM/capacityKnM,5),
    xMm:round(xUsed,3),xi:round(xiUsed,5),xiFromEq42:round(xi,5),xiR:Number(xiR),e0Mm:round(e0Mm,3),eMm:round(eMm,3),
    branch,transition,
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'8.1.2.4.1, equations (40)-(43)',formula:'Eq.(42) when xi<=xiR; Eq.(43) transition x=[xiR+(1-xiR)/(1+50 epsilon0^2)]h0 when xi>xiR, epsilon0=e0/h',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 5574:2018',clause:'8.1.2.4.1, equation (41)',formula:'e=e0*eta+h/2-a\'',sourceUrl:SOURCE}),
    ],
  };
}

function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
