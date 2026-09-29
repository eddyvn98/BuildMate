import { standardRef } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9362%3A2012';
const FULL_TEXT='https://tcvn.info/data/2017/08/285481_tcvn9362-2012.pdf';

export function checkEccentricFoundationPressures({designResistanceKpa,edgePressureKpa,cornerPressureKpa=null}) {
  requirePositive('designResistanceKpa',designResistanceKpa);
  requireNonNegative('edgePressureKpa',edgePressureKpa);
  if (cornerPressureKpa!=null) requireNonNegative('cornerPressureKpa',cornerPressureKpa);
  const edgeLimit=1.2*Number(designResistanceKpa);
  const cornerLimit=1.5*Number(designResistanceKpa);
  return {
    edge:{pressureKpa:Number(edgePressureKpa),limitKpa:round(edgeLimit),pass:Number(edgePressureKpa)<=edgeLimit},
    corner:cornerPressureKpa==null?null:{pressureKpa:Number(cornerPressureKpa),limitKpa:round(cornerLimit),pass:Number(cornerPressureKpa)<=cornerLimit},
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'4.6.19',formula:'edge pressure ≤ 1.2R; corner pressure ≤ 1.5R',sourceUrl:FULL_TEXT}),
  };
}

export function preliminaryFoundationPressureTarget({conventionalResistanceKpa}) {
  requirePositive('conventionalResistanceKpa',conventionalResistanceKpa);
  return {
    targetAveragePressureKpa:Number(conventionalResistanceKpa),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'4.6.18',formula:'preliminary foundation size from average base pressure equal to conventional R0',sourceUrl:FULL_TEXT}),
    warning:'Clause 4.6.18 is a preliminary sizing basis and does not replace settlement/deformation checks.',
  };
}

export const TCVN9362_METADATA={standard:'TCVN 9362:2012',statusSource:SOURCE,fullTextSource:FULL_TEXT};
function requirePositive(n,v){if(!(Number(v)>0))throw new RangeError(`${n} must be > 0`);}
function requireNonNegative(n,v){if(!(Number(v)>=0))throw new RangeError(`${n} must be >= 0`);}
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}


export function adjustConventionalResistance({
  r0Kpa,foundationWidthM,embedmentDepthM,soilGroup,soilUnitWeightKnM3=null
}) {
  requirePositive('r0Kpa',r0Kpa);
  requirePositive('foundationWidthM',foundationWidthM);
  requirePositive('embedmentDepthM',embedmentDepthM);
  const b=Number(foundationWidthM),h=Number(embedmentDepthM),R0=Number(r0Kpa);
  const b1=1,h1=2;
  const groups={
    coarseSand:{k1:0.125,k2:0.25},
    siltySand:{k1:0.05,k2:0.25},
    sandyLoam:{k1:0.05,k2:0.2},
    loam:{k1:0.05,k2:0.2},
    clay:{k1:0.05,k2:0.15},
  };
  const g=groups[soilGroup];
  if (!g) throw new RangeError('Unsupported Appendix D soilGroup');
  let R,formula,clause;
  if (h<=2) {
    R=R0*(1+g.k1*((b-b1)/b1))*((h+h1)/(2*h1));
    formula='R=R0·[1+k1·(b-b1)/b1]·(h+h1)/(2h1)';
    clause='Appendix D, D.2 equation (D.1)';
  } else {
    requirePositive('soilUnitWeightKnM3',soilUnitWeightKnM3);
    R=R0*(1+g.k1*((b-b1)/b1))+g.k2*Number(soilUnitWeightKnM3)*(h-h1);
    formula='R=R0·[1+k1·(b-b1)/b1]+k2·γII·(h-h1)';
    clause='Appendix D, D.2 equation (D.2)';
  }
  return {
    valueKpa:round(R),inputs:{r0Kpa:R0,foundationWidthM:b,embedmentDepthM:h,soilGroup,soilUnitWeightKnM3,k1:g.k1,k2:g.k2,b1,h1},
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause,formula,sourceUrl:FULL_TEXT}),
    warning:'Appendix D R0 method is limited to the cases permitted by clause 4.6.18 and Appendix D; verify applicability before final sizing.',
  };
}

export function checkFoundationDeformation({calculated,allowable,kind='settlement',unit='mm'}) {
  requireNonNegative('calculated',calculated); requirePositive('allowable',allowable);
  return {
    kind,calculated:Number(calculated),allowable:Number(allowable),unit,pass:Number(calculated)<=Number(allowable),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'4.6.6, equation (14)',formula:'S ≤ Su',sourceUrl:FULL_TEXT}),
  };
}


export function layerSummationSettlement({layers,beta=0.8}) {
  if (!Array.isArray(layers)||layers.length===0) throw new TypeError('layers are required');
  if (Number(beta)!==0.8) throw new RangeError('TCVN 9362:2012 Appendix C.1.6 uses beta = 0.8');
  let settlementM=0;
  const detail=layers.map((layer,i)=>{
    const p=Number(layer.averageAdditionalPressureKpa);
    const h=Number(layer.thicknessM);
    const E=Number(layer.deformationModulusKpa);
    if (!(p>=0)) throw new RangeError(`layers[${i}].averageAdditionalPressureKpa must be >= 0`);
    if (!(h>0)) throw new RangeError(`layers[${i}].thicknessM must be > 0`);
    if (!(E>0)) throw new RangeError(`layers[${i}].deformationModulusKpa must be > 0`);
    if (!layer.pressureSource) throw new TypeError(`layers[${i}].pressureSource is required`);
    if (!layer.modulusSource) throw new TypeError(`layers[${i}].modulusSource is required`);
    const s=0.8*p*h/E;
    settlementM+=s;
    return {...layer,settlementMm:round(s*1000,4)};
  });
  return standardResult({
    value:round(settlementM*1000,3),unit:'mm',formulaId:'TCVN9362-2012-C.1.6',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'Appendix C, C.1.6',formula:'S=β·Σ(pi·hi/Ei), β=0.8',sourceUrl:FULL_TEXT}),
    inputs:{beta:0.8,layers:detail},
    warnings:['pi must be the average additional vertical pressure for each layer derived according to Appendix C stress distribution; Ei must come from the geotechnical investigation/test basis.'],
  });
}

export function checkSettlementLimit({settlementMm,allowableMm,allowableSource}) {
  requireNonNegative('settlementMm',settlementMm);
  requirePositive('allowableMm',allowableMm);
  if (!allowableSource) throw new TypeError('allowableSource is required');
  return {
    settlementMm:Number(settlementMm),allowableMm:Number(allowableMm),pass:Number(settlementMm)<=Number(allowableMm),
    allowableSource:String(allowableSource),level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'4.6.6 equation (14); allowable deformation per 4.6.21-4.6.27/Table 16 as applicable',formula:'S≤Su',sourceUrl:FULL_TEXT}),
  };
}
