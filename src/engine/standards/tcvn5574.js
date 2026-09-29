import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5574%3A2018';
const FULL_TEXT='https://kiemdinheverest.vn/storage/documents/November2019/03.TCVN5574_2018_917896.pdf';

export function rectangularFlexuralCapacity({
  bMm,h0Mm,RbMpa,RsMpa,AsMm2,RscMpa=0,AsCompressionMm2=0,aPrimeMm=0,xiR,materialSource
}) {
  for (const [n,v] of Object.entries({bMm,h0Mm,RbMpa,RsMpa,AsMm2})) requirePositive(n,v);
  requireNonNegative('RscMpa',RscMpa); requireNonNegative('AsCompressionMm2',AsCompressionMm2); requireNonNegative('aPrimeMm',aPrimeMm);
  if (!(Number(xiR)>0&&Number(xiR)<1)) throw new RangeError('xiR must be a sourced value between 0 and 1');
  if (!materialSource) throw new TypeError('materialSource is required');
  const x=(Number(RsMpa)*Number(AsMm2)-Number(RscMpa)*Number(AsCompressionMm2))/(Number(RbMpa)*Number(bMm));
  const xi=x/Number(h0Mm);
  const muNmm=Number(RbMpa)*Number(bMm)*x*(Number(h0Mm)-0.5*x)
    +Number(RscMpa)*Number(AsCompressionMm2)*(Number(h0Mm)-Number(aPrimeMm));
  const muKnM=muNmm/1e6;
  const domainPass=xi<=Number(xiR);
  return standardResult({
    value:round(muKnM),unit:'kN·m',formulaId:'TCVN5574-2018-Eq34-35',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.1.2, equations (33)-(35)',formula:'M≤Mu; Mu=Rb*b*x*(h0-0.5x)+Rsc*As\'*(h0-a\'); x=(Rs*As-Rsc*As\')/(Rb*b)',sourceUrl:FULL_TEXT}),
    inputs:{bMm,h0Mm,RbMpa,RsMpa,AsMm2,RscMpa,AsCompressionMm2,aPrimeMm,xiR,materialSource},
    checks:{xi:round(xi,5),xiR:Number(xiR),domainPass},
    warnings:domainPass?[]:['Equation (34) domain requires ξ=x/h0 ≤ ξR; use the applicable TCVN 5574 branch when exceeded.'],
  });
}

export function checkFlexuralMoment({designMomentKnM,capacity}) {
  requireNonNegative('designMomentKnM',designMomentKnM);
  if (!capacity?.checks?.domainPass) return {pass:false,blocked:true,reason:'capacity-formula-domain-not-satisfied',reference:capacity?.reference};
  const ratio=Number(designMomentKnM)/Number(capacity.value);
  return {
    pass:ratio<=1,blocked:false,utilization:round(ratio,4),
    demandKnM:Number(designMomentKnM),capacityKnM:Number(capacity.value),
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.1.2, equation (33)',formula:'M ≤ Mu',sourceUrl:FULL_TEXT}),
  };
}

export const TCVN5574_METADATA={standard:'TCVN 5574:2018',statusSource:SOURCE,fullTextSource:FULL_TEXT};
function requirePositive(n,v){if(!(Number(v)>0))throw new RangeError(`${n} must be > 0`);}
function requireNonNegative(n,v){if(!(Number(v)>=0))throw new RangeError(`${n} must be >= 0`);}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}


export function rectangularShearCheck({
  designShearKn,bMm,h0Mm,RbMpa,RbtMpa,RswMpa,AswMm2,stirrupSpacingMm
}) {
  for (const [n,v] of Object.entries({bMm,h0Mm,RbMpa,RbtMpa})) requirePositive(n,v);
  requireNonNegative('designShearKn',designShearKn);
  requireNonNegative('RswMpa',RswMpa);
  requireNonNegative('AswMm2',AswMm2);
  requirePositive('stirrupSpacingMm',stirrupSpacingMm);

  const concreteStripCapacityKn=0.3*Number(RbMpa)*Number(bMm)*Number(h0Mm)/1000;
  const qsw=Number(RswMpa)*Number(AswMm2)/Number(stirrupSpacingMm);
  const qswMin=0.25*Number(RbtMpa)*Number(bMm);
  const stirrupsCounted=qsw>=qswMin;
  const qb1Kn=0.5*Number(RbtMpa)*Number(bMm)*Number(h0Mm)/1000;
  const qsw1Kn=(stirrupsCounted?qsw:0)*Number(h0Mm)/1000;
  const simplifiedCapacityKn=qb1Kn+qsw1Kn;

  return {
    designShearKn:Number(designShearKn),
    concreteStrip:{capacityKn:round(concreteStripCapacityKn),pass:Number(designShearKn)<=concreteStripCapacityKn},
    transverseReinforcement:{qswNPerMm:round(qsw),minimumQswNPerMm:round(qswMin),counted:stirrupsCounted},
    simplifiedInclinedSection:{capacityKn:round(simplifiedCapacityKn),qb1Kn:round(qb1Kn),qsw1Kn:round(qsw1Kn),pass:Number(designShearKn)<=simplifiedCapacityKn},
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'8.1.3.2, equation (88)',formula:'Q ≤ 0.3 Rb b h0',sourceUrl:FULL_TEXT}),
      standardRef({standard:'TCVN 5574:2018',clause:'8.1.3.3.1, equations (92)-(96)',formula:'qsw=Rsw Asw/sw; Q1≤Qb,1+Qsw,1; Qb,1=0.5Rbtbh0; Qsw,1=qswh0; qsw≥0.25Rbtb',sourceUrl:FULL_TEXT}),
    ],
    warnings:stirrupsCounted?[]:['Transverse reinforcement does not satisfy equation (96), so Qsw is not counted in this simplified check.'],
  };
}
