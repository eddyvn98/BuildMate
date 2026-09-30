import { standardRef, standardResult } from './common.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

export function crackedConcreteReducedModulus({
  RbSerMpa,duration='short',relativeHumidityPercent=null,
  concreteType='heavy',densityKgM3=null
}) {
  const R=Number(RbSerMpa);
  if (!(R>0)) throw new RangeError('RbSerMpa must be > 0');
  let epsilon;
  if (duration==='short') {
    if (concreteType==='heavy') epsilon=0.0015;
    else if (concreteType==='lightweight') epsilon=0.0022;
    else throw new RangeError('short-term cracked reduced modulus implemented for heavy/lightweight concrete');
  } else if (duration==='long') {
    const rh=Number(relativeHumidityPercent);
    if (!(rh>=0&&rh<=100)) throw new RangeError('relativeHumidityPercent must be 0..100 for long-term modulus');
    epsilon=rh>75?0.0024:rh>=40?0.0028:0.0034;
    if (concreteType==='lightweight') {
      const rho=Number(densityKgM3);
      if (!(rho>0)) throw new RangeError('densityKgM3 is required for lightweight concrete');
      const factor=Math.max(0.7,0.4+0.6*rho/2200);
      epsilon*=factor;
    } else if (concreteType!=='heavy') {
      throw new RangeError('long-term aerated/hollow concrete deformation requires separate provisions');
    }
  } else {
    throw new RangeError('duration must be short or long');
  }
  return standardResult({
    value:round(R/epsilon,3),unit:'MPa',formulaId:'TCVN5574-2018-Eq13-cracked',
    reference:standardRef({
      standard:'TCVN 5574:2018',
      clause:'6.1.4.3 equation (13); 8.2.3.3.5',
      formula:'Eb,red = Rb,ser / epsilon_b1,red',
      sourceUrl:SOURCE,
    }),
    inputs:{RbSerMpa:R,duration,relativeHumidityPercent,concreteType,densityKgM3,epsilonB1Red:epsilon},
  });
}

export function psiSForBending({crackingMomentKnM,momentKnM}) {
  const Mcrc=Number(crackingMomentKnM),M=Number(momentKnM);
  if (!(Mcrc>=0)||!(M>0)) throw new RangeError('crackingMomentKnM must be >=0 and momentKnM >0');
  if (M<Mcrc) throw new RangeError('psi_s Eq.(176) bending shortcut applies after cracking: M >= Mcrc');
  const psi=1-0.8*Mcrc/M;
  return standardResult({
    value:round(psi,6),unit:'ratio',formulaId:'TCVN5574-2018-Eq176-bending',
    reference:standardRef({
      standard:'TCVN 5574:2018',
      clause:'8.2.2.3.4, equation (176) bending simplification',
      formula:'psi_s = 1 - 0.8 Mcrc/M',
      sourceUrl:SOURCE,
    }),
    inputs:{crackingMomentKnM:Mcrc,momentKnM:M},
  });
}

export function crackedSteelTransformation({
  EsMpa,EbRedMpa,psiS=1
}) {
  const Es=Number(EsMpa),Eb=Number(EbRedMpa),psi=Number(psiS);
  if (!(Es>0)||!(Eb>0)||!(psi>0)) throw new RangeError('EsMpa, EbRedMpa and psiS must be > 0');
  const EsRed=Es/psi;
  return {
    EsRedMpa:round(EsRed,3),
    alphaS1:round(Es/Eb,6),
    alphaS2:round(EsRed/Eb,6),
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.8, equations (202)-(204)',formula:'alpha_s1=Es/Eb,red; alpha_s2=Es,red/Eb,red; Es,red=Es/psi_s',sourceUrl:SOURCE}),
    ],
  };
}

export function crackedRectangularSectionRigidity({
  bMm,h0Mm,AsMm2,AsCompressionMm2=0,aPrimeMm=0,
  EsMpa,RbSerMpa,duration='short',relativeHumidityPercent=null,
  concreteType='heavy',densityKgM3=null,
  crackingMomentKnM=null,momentKnM=null,psiS=null,
  uncrackedRigidityNmm2=null
}) {
  for (const [name,value] of Object.entries({bMm,h0Mm,AsMm2,EsMpa,RbSerMpa})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  if (!(Number(AsCompressionMm2)>=0)||!(Number(aPrimeMm)>=0)) throw new RangeError('AsCompressionMm2 and aPrimeMm must be >= 0');
  const b=Number(bMm),h0=Number(h0Mm),As=Number(AsMm2),Asp=Number(AsCompressionMm2),ap=Number(aPrimeMm);

  const Eb=crackedConcreteReducedModulus({RbSerMpa,duration,relativeHumidityPercent,concreteType,densityKgM3});
  let psi=psiS==null?null:Number(psiS);
  let psiSource='explicit';
  if (psi==null) {
    if (crackingMomentKnM==null||momentKnM==null) {
      psi=1;
      psiSource='permitted-simplification';
    } else {
      psi=psiSForBending({crackingMomentKnM,momentKnM}).value;
      psiSource='Eq176';
    }
  }
  if (!(psi>0)) throw new RangeError('psiS must be > 0');

  const t=crackedSteelTransformation({EsMpa,EbRedMpa:Eb.value,psiS:psi});
  const mu=As/(b*h0);
  const mup=Asp/(b*h0);
  let x;
  let branch;
  if (Asp===0) {
    const u=mu*t.alphaS2;
    x=h0*(Math.sqrt(u*u+2*u)-u);
    branch='Eq195-tension-only';
  } else {
    if (!(ap<h0)) throw new RangeError('aPrimeMm must be < h0Mm');
    const u=mu*t.alphaS2+mup*t.alphaS1;
    const v=mu*t.alphaS2+mup*t.alphaS1*ap/h0;
    x=h0*(Math.sqrt(u*u+2*v)-u);
    branch='Eq196-tension-compression';
  }
  if (!(x>0&&x<h0)) throw new RangeError('calculated cracked compression-zone depth must be between 0 and h0');

  const Ib=b*x*x*x/3;
  const Is=As*(h0-x)**2;
  const Isp=Asp>0?Asp*(x-ap)**2:0;
  const Ired=Ib+t.alphaS2*Is+t.alphaS1*Isp;
  let D=Eb.value*Ired;
  let capped=false;
  if (uncrackedRigidityNmm2!=null) {
    const limit=Number(uncrackedRigidityNmm2);
    if (!(limit>0)) throw new RangeError('uncrackedRigidityNmm2 must be > 0');
    if (D>limit) { D=limit; capped=true; }
  }

  return {
    compressionZoneMm:round(x,3),
    muS:round(mu,8),muSCompression:round(mup,8),
    psiS:psi,psiSource,
    EbRedMpa:Eb.value,EsRedMpa:t.EsRedMpa,alphaS1:t.alphaS1,alphaS2:t.alphaS2,
    IcomponentsMm4:{concrete:round(Ib,2),tensionSteel:round(Is,2),compressionSteel:round(Isp,2)},
    IredMm4:round(Ired,2),
    rigidityNmm2:round(D,2),rigidityCappedByUncracked:capped,
    branch,level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.5, equation (193)',formula:'Ired=Ib+alpha_s2 Is+alpha_s1 Is_compression',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.6, equations (194)-(196)',formula:'rectangular cracked neutral-axis/compression-zone depth from transformed section equilibrium',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.8, equations (202)-(204)',formula:'steel transformation coefficients with psi_s tension-stiffening factor',sourceUrl:SOURCE}),
      Eb.reference,
    ],
    warning:capped?'Clause 8.2.3.3.5 limits cracked rigidity to not exceed uncracked rigidity.':null,
  };
}

export function crackedRectangularCurvature({
  momentKnM,...sectionInput
}) {
  const section=crackedRectangularSectionRigidity({...sectionInput,momentKnM});
  const curvaturePerM=Number(momentKnM)*1e6/section.rigidityNmm2*1000;
  return {
    value:curvaturePerM,unit:'1/m',formulaId:'TCVN5574-2018-Eq187-cracked',
    section,level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.3, equation (187)',formula:'1/r=M/D',sourceUrl:SOURCE}),
    inputs:{momentKnM:Number(momentKnM)},
  };
}

function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}


// Backward-compatible names retained so existing callers use the same TCVN solver.
export function crackTensionSteelFactor({momentKnM,crackingMomentKnM}) {
  return psiSForBending({momentKnM,crackingMomentKnM});
}

export function crackedRectangularSection(input) {
  const duration=input.duration==='short-term'?'short':input.duration==='long-term'?'long':input.duration;
  const result=crackedRectangularSectionRigidity({...input,duration});
  return {...result,neutralAxisMm:result.compressionZoneMm};
}

export function crackedSectionCurvature({momentKnM,section}) {
  if (!section?.rigidityNmm2) throw new TypeError('section with rigidityNmm2 is required');
  const value=Number(momentKnM)*1e6/Number(section.rigidityNmm2)*1000;
  return standardResult({
    value,unit:'1/m',formulaId:'TCVN5574-2018-Eq187-existing-section',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.3, equation (187)',formula:'1/r=M/D',sourceUrl:SOURCE}),
    inputs:{momentKnM:Number(momentKnM),rigidityNmm2:Number(section.rigidityNmm2)},
  });
}
