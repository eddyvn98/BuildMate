import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5574%3A2018';
const FULL_TEXT='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

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


const CONCRETE=Object.freeze({
  B15:{Rb:8.5,Rbt:0.75,Eb:24000},
  B20:{Rb:11.5,Rbt:0.90,Eb:27500},
  B25:{Rb:14.5,Rbt:1.05,Eb:30000},
  B30:{Rb:17.0,Rbt:1.15,Eb:32500},
  B35:{Rb:19.5,Rbt:1.30,Eb:34500},
  B40:{Rb:22.0,Rbt:1.40,Eb:36000},
  B45:{Rb:25.0,Rbt:1.50,Eb:37000},
  B50:{Rb:27.5,Rbt:1.60,Eb:38000},
  B55:{Rb:30.0,Rbt:1.70,Eb:39000},
  B60:{Rb:33.0,Rbt:1.80,Eb:39500},
});

const REBAR=Object.freeze({
  'CB240-T':{Rs:210,Rsc:210,Rsw:170,Es:200000},
  'CB300-T':{Rs:260,Rsc:260,Rsw:210,Es:200000},
  'CB300-V':{Rs:260,Rsc:260,Rsw:210,Es:200000},
  'CB400-V':{Rs:350,Rsc:350,Rsw:280,Es:200000},
  'CB500-V':{Rs:435,Rsc:435,Rsw:300,Es:200000},
});

export function concreteDesignProperties(strengthClass) {
  const row=CONCRETE[strengthClass];
  if (!row) throw new RangeError('Unsupported concrete class in implemented TCVN 5574 table subset');
  return {
    strengthClass,...row,unit:'MPa',level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'6.1.4, Table 7',sourceUrl:FULL_TEXT,note:'Design strengths Rb and Rbt for ULS.'}),
      standardRef({standard:'TCVN 5574:2018',clause:'6.1.5, Table 10',sourceUrl:FULL_TEXT,note:'Initial modulus of elasticity Eb.'}),
    ],
  };
}

export function rebarDesignProperties(steelClass) {
  const row=REBAR[steelClass];
  if (!row) throw new RangeError('Unsupported reinforcement class in implemented TCVN 5574 table subset');
  return {
    steelClass,...row,unit:'MPa',level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'6.2.2, Table 13',sourceUrl:FULL_TEXT,note:'Design tensile/compressive strengths Rs/Rsc for ULS.'}),
      standardRef({standard:'TCVN 5574:2018',clause:'6.2.2, Table 14',sourceUrl:FULL_TEXT,note:'Design transverse reinforcement strength Rsw.'}),
      standardRef({standard:'TCVN 5574:2018',clause:'6.2.3.3',formula:'Es=2.0×10^5 MPa for reinforcing bars',sourceUrl:FULL_TEXT}),
    ],
  };
}


const CRACK_LIMITS=Object.freeze({
  commonBars:{longTermMm:0.3,shortTermMm:0.4},
  highStrengthBars:{longTermMm:0.2,shortTermMm:0.3},
  smallSevenWireStrand:{longTermMm:0.1,shortTermMm:0.2},
  watertightness:{longTermMm:0.2,shortTermMm:0.3},
});

export function crackWidth({
  phi1,phi2,phi3,psiS,sigmaSMpa,EsMpa,crackSpacingMm
}) {
  for (const [n,v] of Object.entries({phi1,phi2,phi3,psiS,sigmaSMpa,EsMpa,crackSpacingMm})) requirePositive(n,v);
  const width=Number(phi1)*Number(phi2)*Number(phi3)*Number(psiS)*(Number(sigmaSMpa)/Number(EsMpa))*Number(crackSpacingMm);
  return standardResult({
    value:round(width,4),unit:'mm',formulaId:'TCVN5574-2018-Eq166',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.2.2.3.1, equation (166)',formula:'acrc=φ1·φ2·φ3·ψs·(σs/Es)·Ls',sourceUrl:FULL_TEXT}),
    inputs:{phi1:Number(phi1),phi2:Number(phi2),phi3:Number(phi3),psiS:Number(psiS),sigmaSMpa:Number(sigmaSMpa),EsMpa:Number(EsMpa),crackSpacingMm:Number(crackSpacingMm)},
  });
}

export function crackWidthLimit({reinforcementGroup='commonBars',duration='longTerm'}) {
  const row=CRACK_LIMITS[reinforcementGroup];
  if (!row) throw new RangeError('Unsupported TCVN 5574 Table 17 reinforcementGroup');
  const key=duration==='longTerm'?'longTermMm':duration==='shortTerm'?'shortTermMm':null;
  if (!key) throw new RangeError('duration must be longTerm or shortTerm');
  return {
    limitMm:row[key],reinforcementGroup,duration,level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.2.2.1.3, equation (155), Table 17',formula:'acrc ≤ acrc,u',sourceUrl:FULL_TEXT}),
  };
}

export function checkCrackWidth({calculatedMm,reinforcementGroup='commonBars',duration='longTerm'}) {
  requireNonNegative('calculatedMm',calculatedMm);
  const limit=crackWidthLimit({reinforcementGroup,duration});
  return {...limit,calculatedMm:Number(calculatedMm),pass:Number(calculatedMm)<=limit.limitMm};
}

export function minimumLongitudinalReinforcement({
  memberType='flexural',bMm,h0Mm,slenderness=null
}) {
  requirePositive('bMm',bMm); requirePositive('h0Mm',h0Mm);
  let percent;
  if (memberType==='flexural'||memberType==='eccentricTension') {
    percent=0.1;
  } else if (memberType==='eccentricCompression') {
    if (!(Number(slenderness)>=0)) throw new RangeError('slenderness is required for eccentricCompression');
    const lambda=Number(slenderness);
    if (lambda<=17) percent=0.1;
    else if (lambda>=87) percent=0.25;
    else percent=0.1+(lambda-17)*(0.15/70);
  } else {
    throw new RangeError('memberType must be flexural, eccentricTension or eccentricCompression');
  }
  const area=Number(bMm)*Number(h0Mm)*percent/100;
  return {
    minimumRatioPercent:round(percent,4),minimumAreaMm2:round(area,2),level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.3.1',formula:'μs=(As/(b h0))·100%; minimum 0.1% for flexure/eccentric tension and interpolation to 0.25% for eccentric compression slenderness',sourceUrl:FULL_TEXT}),
  };
}


export function minimumClearBarSpacing({barDiameterMm,position='bottom',layerCount=1}) {
  requirePositive('barDiameterMm',barDiameterMm);
  if (!Number.isInteger(layerCount)||layerCount<1) throw new RangeError('layerCount must be integer >= 1');
  let codeMinimum;
  if (position==='bottom'&&layerCount<=2) codeMinimum=25;
  else if (position==='top'&&layerCount<=2) codeMinimum=30;
  else if ((position==='bottom'&&layerCount>=3)||position==='vertical') codeMinimum=50;
  else throw new RangeError('Unsupported TCVN 5574 clause 10.3.2 position/layer case');
  return {
    minimumClearSpacingMm:Math.max(Number(barDiameterMm),codeMinimum),
    barDiameterMm:Number(barDiameterMm),position,layerCount,codeMinimumMm:codeMinimum,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.2',formula:'clear spacing ≥ max(bar diameter, code minimum)',sourceUrl:FULL_TEXT}),
  };
}

export function transverseReinforcementMaxSpacing({
  effectiveDepthMm,concreteClass='B25',shearRequiresStirrups=true,memberHeightMm=300
}) {
  requirePositive('effectiveDepthMm',effectiveDepthMm);
  requirePositive('memberHeightMm',memberHeightMm);
  const highStrength=/^B(7[0-9]|8[0-9]|9[0-9]|100)$/.test(concreteClass);
  let maxSpacing;
  let clause;
  if (shearRequiresStirrups) {
    maxSpacing=Math.min(0.5*Number(effectiveDepthMm),highStrength?250:300);
    clause='10.3.4.3 first paragraph';
  } else {
    const exempt=Number(memberHeightMm)<150;
    if (exempt) {
      return {
        required:false,reason:'beam/rib height < 150 mm and concrete alone carries design shear',
        level:'engineering-review',
        reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.4.3',sourceUrl:FULL_TEXT}),
      };
    }
    maxSpacing=Math.min(0.75*Number(effectiveDepthMm),highStrength?400:500);
    clause='10.3.4.3 third paragraph';
  }
  return {
    required:true,maximumSpacingMm:round(maxSpacing,2),effectiveDepthMm:Number(effectiveDepthMm),concreteClass,shearRequiresStirrups,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause,sourceUrl:FULL_TEXT}),
  };
}

export function compressionBarRestraintSpacing({
  longitudinalBarDiameterMm,compressionSteelRatioPercent=0,concreteClass='B25'
}) {
  requirePositive('longitudinalBarDiameterMm',longitudinalBarDiameterMm);
  requireNonNegative('compressionSteelRatioPercent',compressionSteelRatioPercent);
  const highStrength=/^B(7[0-9]|8[0-9]|9[0-9]|100)$/.test(concreteClass);
  const highRatio=Number(compressionSteelRatioPercent)>1.5;
  const multiple=highRatio?10:15;
  const absolute=highRatio?(highStrength?250:300):(highStrength?400:500);
  return {
    maximumSpacingMm:Math.min(multiple*Number(longitudinalBarDiameterMm),absolute),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.4.4',formula:`s≤${multiple}d and s≤${absolute}mm for selected case`,sourceUrl:FULL_TEXT}),
  };
}


export function minimumLapLength({
  barDiameterMm,baseAnchorageLengthMm,alpha2,hasSupplementaryAnchorage=false
}) {
  requirePositive('barDiameterMm',barDiameterMm);
  requirePositive('baseAnchorageLengthMm',baseAnchorageLengthMm);
  requirePositive('alpha2',alpha2);
  if (Number(barDiameterMm)>40) throw new RangeError('TCVN 5574:2018 clause 10.3.6.2 lap splice applies to bars with diameter <= 40 mm');
  let calculated=0.4*Number(alpha2)*Number(baseAnchorageLengthMm);
  if (hasSupplementaryAnchorage) calculated*=0.7;
  const minimum=Math.max(calculated,20*Number(barDiameterMm),250);
  return {
    minimumLapLengthMm:round(minimum,2),
    components:{calculatedMm:round(calculated,2),twentyDiametersMm:20*Number(barDiameterMm),absoluteMinimumMm:250},
    barDiameterMm:Number(barDiameterMm),alpha2:Number(alpha2),hasSupplementaryAnchorage,
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 5574:2018',
      clause:'10.3.6.2',
      formula:'Llap >= max(0.4·alpha2·L0,an, 20ds, 250 mm); supplementary anchorage may reduce lap length by no more than 30%',
      sourceUrl:FULL_TEXT,
    }),
    warning:'baseAnchorageLengthMm (L0,an) and alpha2 must be determined from the applicable anchorage/splice provisions; this function does not infer them.',
  };
}

export function lapSpliceAlpha2({
  stress='tension',splicePercent,barSurface='ribbed'
}) {
  const p=Number(splicePercent);
  if (!(p>=0&&p<=100)) throw new RangeError('splicePercent must be 0..100');
  if (!['ribbed','plain'].includes(barSurface)) throw new RangeError('barSurface must be ribbed or plain');

  if (stress==='tension') {
    const threshold=barSurface==='ribbed'?50:25;
    if (p<=threshold) return lapAlphaResult(1.2,p,stress,`base alpha2=1.2; permitted percentage threshold ${threshold}% for ${barSurface} tension bars`);
    const value=1.2+(p-threshold)*(2.0-1.2)/(100-threshold);
    return lapAlphaResult(round(value,4),p,stress,'linear interpolation to alpha2=2.0 at 100% tension bars spliced');
  }
  if (stress==='compression') {
    if (p<=50) return lapAlphaResult(0.9,p,stress,'base alpha2=0.9 for compression bars');
    const value=0.9+(p-50)*(1.2-0.9)/50;
    return lapAlphaResult(round(value,4),p,stress,'linear interpolation to alpha2=1.2 at 100% compression bars spliced');
  }
  throw new RangeError('stress must be tension or compression');
}

function lapAlphaResult(value,splicePercent,stress,note) {
  return {
    value,splicePercent,stress,level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.6.2',sourceUrl:FULL_TEXT,note}),
  };
}


export function bondStrength({RbtMpa,barType='hotRolledRibbed',diameterMm,prestressed=false}) {
  requirePositive('RbtMpa',RbtMpa);
  requirePositive('diameterMm',diameterMm);
  let eta1;
  if (prestressed) {
    const map={coldRibbedWire:1.8,smooth7or19WireStrand:2.2,ribbed7WireStrand:2.4,hotRolledOrThermomechanical:2.5};
    eta1=map[barType];
  } else {
    const map={plainBar:1.5,coldRibbed:2.0,hotRolledRibbed:2.5,thermomechanicalRibbed:2.5};
    eta1=map[barType];
  }
  if (eta1==null) throw new RangeError('Unsupported barType for TCVN 5574 clause 10.3.5.4');
  const eta2=prestressed?1:(Number(diameterMm)<=32?1:0.9);
  const value=eta1*eta2*Number(RbtMpa);
  return standardResult({
    value:round(value,4),unit:'MPa',formulaId:'TCVN5574-2018-bond',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.5.4, equation following (255)',formula:'Rbond = eta1·eta2·Rbt',sourceUrl:FULL_TEXT}),
    inputs:{RbtMpa:Number(RbtMpa),barType,diameterMm:Number(diameterMm),prestressed,eta1,eta2},
  });
}

export function basicAnchorageLength({
  barDiameterMm,RsMpa,RbtMpa,barType='hotRolledRibbed',prestressed=false
}) {
  requirePositive('barDiameterMm',barDiameterMm);
  requirePositive('RsMpa',RsMpa);
  const bond=bondStrength({RbtMpa,barType,diameterMm:barDiameterMm,prestressed});
  const d=Number(barDiameterMm);
  const As=Math.PI*d*d/4;
  const us=Math.PI*d;
  const length=Number(RsMpa)*As/(bond.value*us);
  return standardResult({
    value:round(length,2),unit:'mm',formulaId:'TCVN5574-2018-Eq255',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.5.4, equation (255)',formula:'L0,an = Rs·As / (Rbond·us)',sourceUrl:FULL_TEXT}),
    inputs:{barDiameterMm:d,RsMpa:Number(RsMpa),RbtMpa:Number(RbtMpa),barType,prestressed,AsMm2:round(As,3),perimeterMm:round(us,3),RbondMpa:bond.value},
  });
}

export function requiredAnchorageLength({
  baseAnchorageLengthMm,barDiameterMm,alpha1,
  calculatedSteelAreaMm2,effectiveSteelAreaMm2,
  supplementaryAnchorageReduction=0
}) {
  for (const [n,v] of Object.entries({baseAnchorageLengthMm,barDiameterMm,alpha1,calculatedSteelAreaMm2,effectiveSteelAreaMm2})) requirePositive(n,v);
  const reduction=Number(supplementaryAnchorageReduction);
  if (!(reduction>=0&&reduction<=0.3)) throw new RangeError('supplementaryAnchorageReduction must be 0..0.30');
  const raw=Number(alpha1)*Number(baseAnchorageLengthMm)*(Number(calculatedSteelAreaMm2)/Number(effectiveSteelAreaMm2));
  const reduced=raw*(1-reduction);
  const minimum=Math.max(reduced,15*Number(barDiameterMm),200,0.3*Number(baseAnchorageLengthMm));
  return {
    requiredAnchorageLengthMm:round(minimum,2),
    components:{rawMm:round(raw,2),afterReductionMm:round(reduced,2),fifteenDiametersMm:15*Number(barDiameterMm),absoluteMinimumMm:200,thirtyPercentBaseMm:round(0.3*Number(baseAnchorageLengthMm),2)},
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.5.5',formula:'Lan=alpha1·L0,an·As,cal/As,ef; actual >= max(15ds,200mm,0.3L0,an); permitted supplementary reduction <=30%',sourceUrl:FULL_TEXT}),
  };
}

export function anchorageAlpha1({stress='tension',prestressed=false}) {
  if (prestressed) return {value:1,level:'engineering-review',reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.5.5',sourceUrl:FULL_TEXT,note:'alpha1=1.0 for prestressed reinforcement'})};
  const value=stress==='tension'?1:stress==='compression'?0.75:null;
  if (value==null) throw new RangeError('stress must be tension or compression');
  return {value,level:'engineering-review',reference:standardRef({standard:'TCVN 5574:2018',clause:'10.3.5.5',sourceUrl:FULL_TEXT,note:'Straight ribbed/nonprestressed anchorage or hooked/plain case without supplementary anchorage'})};
}
