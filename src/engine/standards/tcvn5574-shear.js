import { standardRef } from './common.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

export function inclinedShearCapacity({
  bMm,h0Mm,RbtMpa,RswMpa=0,AswMm2=0,stirrupSpacingMm=null,
  axialStressFactor=1
}) {
  for (const [name,value] of Object.entries({bMm,h0Mm,RbtMpa,axialStressFactor})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  const b=Number(bMm),h0=Number(h0Mm),Rbt=Number(RbtMpa);
  const phiN=Number(axialStressFactor);
  if (!(phiN>0)) throw new RangeError('axialStressFactor must be > 0');

  let qsw=0;
  let stirrupsCounted=false;
  let stirrupMinimum=0.25*Rbt*b;
  if (Number(AswMm2)>0||Number(RswMpa)>0||stirrupSpacingMm!=null) {
    if (!(Number(AswMm2)>0&&Number(RswMpa)>0&&Number(stirrupSpacingMm)>0)) {
      throw new RangeError('RswMpa, AswMm2 and stirrupSpacingMm must all be > 0 when stirrups are supplied');
    }
    qsw=Number(RswMpa)*Number(AswMm2)/Number(stirrupSpacingMm);
    stirrupsCounted=qsw>=stirrupMinimum;
  }

  const A=1.5*Rbt*b*h0*h0*phiN;
  const B=stirrupsCounted?0.75*qsw:0;
  const candidates=[h0,2*h0];
  if (B>0) {
    const optimum=Math.sqrt(A/B);
    if (optimum>=h0&&optimum<=2*h0) candidates.push(optimum);
  }

  const evaluations=candidates.map(C=>evaluate(C,{A,B,b,h0,Rbt,phiN}));
  const governing=evaluations.reduce((a,b)=>b.capacityKn<a.capacityKn?b:a);

  return {
    capacityKn:governing.capacityKn,
    governingProjectionMm:governing.Cmm,
    concreteKn:governing.QbKn,
    stirrupKn:governing.QswKn,
    qswNPerMm:round(qsw,4),
    minimumQswNPerMm:round(stirrupMinimum,4),
    stirrupsCounted,
    evaluations,
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'8.1.3.3.1, equations (89)-(92)',formula:'Q <= Qb+Qsw; Qb=1.5 Rbt b h0^2/C within [0.5,2.5]Rbt b h0; Qsw=0.75 qsw C; qsw=Rsw Asw/sw; h0<=C<=2h0',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 5574:2018',clause:'8.1.3.3.1, equation (96)',formula:'qsw >= 0.25 Rbt b to count transverse reinforcement without Eq.(97) reduction',sourceUrl:SOURCE}),
    ],
    warning:(!stirrupsCounted&&qsw>0)
      ? 'Stirrups are not counted because Eq.(96) is not satisfied; Eq.(97) reduced-concrete branch is not invoked by this function.'
      : null,
  };
}

export function checkInclinedShear({designShearKn,...capacityInput}) {
  if (!(Number(designShearKn)>=0)) throw new RangeError('designShearKn must be >= 0');
  const capacity=inclinedShearCapacity(capacityInput);
  return {
    pass:Number(designShearKn)<=capacity.capacityKn,
    demandKn:Number(designShearKn),
    utilization:capacity.capacityKn>0?round(Number(designShearKn)/capacity.capacityKn,5):Infinity,
    capacity,
    level:'engineering-review',
  };
}

function evaluate(C,{A,B,b,h0,Rbt,phiN}) {
  let qb=A/C;
  const minQb=0.5*Rbt*b*h0*phiN;
  const maxQb=2.5*Rbt*b*h0*phiN;
  qb=Math.max(minQb,Math.min(maxQb,qb));
  const qsw=B*C;
  return {Cmm:round(C,3),QbKn:round(qb/1000,4),QswKn:round(qsw/1000,4),capacityKn:round((qb+qsw)/1000,4)};
}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
