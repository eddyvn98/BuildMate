import { standardRef, standardResult } from './common.js';
import { equivalentConcreteModulus } from './tcvn5574-material.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

export function crackTensionSteelFactor({momentKnM,crackingMomentKnM}) {
  const M=Math.abs(Number(momentKnM)),Mcrc=Math.abs(Number(crackingMomentKnM));
  if (!(M>0)||!(Mcrc>=0)) throw new RangeError('momentKnM must be non-zero and crackingMomentKnM >= 0');
  const psi=1-0.8*Mcrc/M;
  return standardResult({
    value:clamp(psi,0,1),unit:'ratio',formulaId:'TCVN5574-2018-Eq176',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.2.2.3.4, equation (176)',
      formula:'psi_s = 1 - 0.8 Mcrc/M for flexural members',sourceUrl:SOURCE,
    }),
    inputs:{momentKnM:Number(momentKnM),crackingMomentKnM:Number(crackingMomentKnM)},
  });
}

export function crackedRectangularSection({
  bMm,h0Mm,aPrimeMm=0,AsMm2,AsCompressionMm2=0,EsMpa=200000,
  RbSerMpa,duration='short-term',strengthClass=null,relativeHumidityPercent=null,
  psiS=1,concreteType='heavy'
}) {
  for (const [name,value] of Object.entries({bMm,h0Mm,AsMm2,EsMpa,RbSerMpa,psiS})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  if (!(Number(AsCompressionMm2)>=0)||!(Number(aPrimeMm)>=0)) throw new RangeError('compression steel area and aPrimeMm must be >=0');
  if (!(Number(psiS)<=1)) throw new RangeError('psiS must be <= 1');

  const EbRed=equivalentConcreteModulus({RbSerMpa,duration,strengthClass,relativeHumidityPercent,concreteType});
  const alphaS1=Number(EsMpa)/EbRed.value;
  const EsRed=Number(EsMpa)/Number(psiS);
  const alphaS2=EsRed/EbRed.value;
  const b=Number(bMm),h0=Number(h0Mm),As=Number(AsMm2),Asp=Number(AsCompressionMm2),ap=Number(aPrimeMm);
  const muS=As/(b*h0);
  const muSp=Asp/(b*h0);

  let x;
  let equation;
  if (Asp===0) {
    const z=muS*alphaS2;
    x=h0*(Math.sqrt(z*z+2*z)-z);
    equation='195';
  } else {
    const A=muS*alphaS2+muSp*alphaS1;
    const B=muS*alphaS2+muSp*alphaS1*(ap/h0);
    x=h0*(Math.sqrt(A*A+2*B)-A);
    equation='196';
  }
  if (!(x>0&&x<h0)) throw new RangeError('calculated neutral-axis depth is outside 0..h0');

  const Ib=b*x**3/3;
  const Is=As*(h0-x)**2;
  const Isp=Asp*(x-ap)**2;
  const Ired=Ib+alphaS2*Is+alphaS1*Isp;
  const rigidity=EbRed.value*Ired;

  return {
    neutralAxisMm:round(x,4),IredMm4:round(Ired,3),rigidityNmm2:rigidity,
    alphaS1:round(alphaS1,6),alphaS2:round(alphaS2,6),EsRedMpa:round(EsRed,4),
    components:{IbMm4:round(Ib,3),IsMm4:round(Is,3),IsCompressionMm4:round(Isp,3),muS:round(muS,8),muSCompression:round(muSp,8)},
    EbRedMpa:EbRed.value,psiS:Number(psiS),equation,
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.5, equations (193)-(196)',formula:'Ired=Ib+alpha_s2 Is+alpha_s1 Is_prime; rectangular neutral axis by Eq.(195)/(196)',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.6, equations (202)-(204)',formula:'alpha_s1=Es/Eb,red; alpha_s2=Es,red/Eb,red; Es,red=Es/psi_s',sourceUrl:SOURCE}),
      EbRed.reference,
    ],
  };
}

export function crackedSectionCurvature({momentKnM,section}) {
  const M=Number(momentKnM);
  if (!Number.isFinite(M)||!(section?.rigidityNmm2>0)) throw new RangeError('momentKnM must be finite and section rigidity >0');
  return standardResult({
    value:M*1e6/section.rigidityNmm2*1000,unit:'1/m',formulaId:'TCVN5574-2018-Eq187-cracked',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.3 equations (187)-(188)',formula:'1/r=M/D; D=Eb,red Ired',sourceUrl:SOURCE}),
    inputs:{momentKnM:M,rigidityNmm2:section.rigidityNmm2,neutralAxisMm:section.neutralAxisMm,IredMm4:section.IredMm4,EbRedMpa:section.EbRedMpa},
  });
}

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
