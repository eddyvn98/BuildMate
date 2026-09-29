import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+10304%3A2025';
const TEXT='https://thuvienphapluat.vn/page/tim-van-ban.aspx?area=0&fields=&keyword=TCVN+10304%3A2025';

export function endBearingPileCharacteristicCapacity({unitToeResistanceKpa,toeAreaM2,workingConditionFactor=1,source}) {
  requirePositive('unitToeResistanceKpa',unitToeResistanceKpa); requirePositive('toeAreaM2',toeAreaM2); requirePositive('workingConditionFactor',workingConditionFactor);
  if (!source) throw new TypeError('source is required for qb');
  const value=Number(workingConditionFactor)*Number(unitToeResistanceKpa)*Number(toeAreaM2);
  return standardResult({
    value:round(value),unit:'kN',formulaId:'TCVN10304-2025-Eq5-6',
    reference:standardRef({standard:'TCVN 10304:2025',clause:'7.2.1, equations (5)-(6)',formula:'Rk=Rk,b; Rk,b=γc·qb·A',sourceUrl:TEXT}),
    inputs:{unitToeResistanceKpa,toeAreaM2,workingConditionFactor,source},
    warnings:['Applicable only to end-bearing pile cases covered by clause 7.2.1; friction piles require the corresponding clauses.'],
  });
}

export function checkPileDeformation({calculated,limit,unit='mm'}) {
  requireNonNegative('calculated',calculated); requirePositive('limit',limit);
  return {
    pass:Number(calculated)<=Number(limit),calculated:Number(calculated),limit:Number(limit),unit,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 10304:2025',clause:'7.1.7, equation (4)',formula:'s ≤ su',sourceUrl:TEXT}),
  };
}

export const TCVN10304_METADATA={standard:'TCVN 10304:2025',statusSource:SOURCE,textSource:TEXT};
function requirePositive(n,v){if(!(Number(v)>0))throw new RangeError(`${n} must be > 0`);}
function requireNonNegative(n,v){if(!(Number(v)>=0))throw new RangeError(`${n} must be >= 0`);}
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}


export function drivenFrictionPileCharacteristicCapacity({
  toeResistanceKpa,toeAreaM2,toeResistanceFactor,toeWorkingFactor=1,
  perimeterM,layers,pileWorkingFactor=1
}) {
  for (const [n,v] of Object.entries({toeResistanceKpa,toeAreaM2,toeResistanceFactor,toeWorkingFactor,perimeterM,pileWorkingFactor})) requirePositive(n,v);
  if (!Array.isArray(layers)||layers.length===0) throw new TypeError('layers are required');

  const toe=Number(toeResistanceFactor)*Number(toeWorkingFactor)*Number(toeResistanceKpa)*Number(toeAreaM2);
  let shaft=0;
  const detail=layers.map((layer,i)=>{
    const fi=Number(layer.unitShaftResistanceKpa),hi=Number(layer.thicknessM);
    const resistanceFactor=Number(layer.resistanceFactor),workingFactor=Number(layer.workingFactor);
    for (const [n,v] of Object.entries({unitShaftResistanceKpa:fi,thicknessM:hi,resistanceFactor,workingFactor})) requirePositive(`layers[${i}].${n}`,v);
    if (!layer.source) throw new TypeError(`layers[${i}].source is required`);
    const contribution=resistanceFactor*workingFactor*fi*hi*Number(perimeterM);
    shaft+=contribution;
    return {...layer,contributionKn:round(contribution)};
  });
  const total=Number(pileWorkingFactor)*(toe+shaft);
  return standardResult({
    value:round(total),unit:'kN',formulaId:'TCVN10304-2025-driven-friction-pile',
    reference:standardRef({standard:'TCVN 10304:2025',clause:'7.2.2, equation for driven/pressed friction pile characteristic capacity',formula:'Rk=γc·(γR,R·γC,R·qb·Ab + up·Σ(γR,fi·γC,fi·fi·hi))',sourceUrl:TEXT}),
    inputs:{toeResistanceKpa:Number(toeResistanceKpa),toeAreaM2:Number(toeAreaM2),toeResistanceFactor:Number(toeResistanceFactor),toeWorkingFactor:Number(toeWorkingFactor),perimeterM:Number(perimeterM),pileWorkingFactor:Number(pileWorkingFactor),layers:detail},
    checks:{toeKn:round(toe),shaftKn:round(shaft)},
    warnings:['qb, fi and all working/resistance factors must come from the applicable TCVN 10304 tables, CPT/SPT/static-test workflow or a sourced geotechnical design basis; BuildMate does not infer them.'],
  });
}
