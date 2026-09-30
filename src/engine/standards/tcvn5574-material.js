import {
  concreteWorkingConditionFactors as canonicalWorkingFactors,
  adjustedConcreteDesignStrengths,
  concreteCreepFactor,
  longTermConcreteStrains as canonicalLongTermStrains,
  longTermConcreteModulus as modulusFromCreep,
  equivalentConcreteModulus as canonicalEquivalentModulus,
} from './tcvn5574-materials.js';

export function concreteWorkingConditionFactors({
  loadDuration='all',
  concreteKind='reinforcedConcrete',
  verticalPourLayerHeightM=0,
  cellularMoisturePercent=null,
}) {
  if (!['all','permanent-long'].includes(loadDuration)) throw new RangeError('loadDuration must be all or permanent-long');
  const cellular=['cellular','porous'].includes(concreteKind);
  const canonical=canonicalWorkingFactors({
    concreteType:cellular?'aerated':'heavy',
    loadDuration:loadDuration==='all'?'allLoads':'longOnly',
    plainConcrete:concreteKind==='plainConcrete',
    verticalCastHeightM:Number(verticalPourLayerHeightM),
    aeratedHumidityPercent:cellular?cellularMoisturePercent:null,
  });
  return {
    ...canonical,
    compressionFactor:canonical.RbFactor,
    tensionFactor:canonical.RbtFactor,
  };
}

export function applyConcreteWorkingConditions({RbMpa,RbtMpa,...conditions}) {
  if (!(Number(RbMpa)>0)||!(Number(RbtMpa)>0)) throw new RangeError('RbMpa and RbtMpa must be >0');
  const f=concreteWorkingConditionFactors(conditions);
  const adjusted=adjustedConcreteDesignStrengths({
    properties:{Rb:Number(RbMpa),Rbt:Number(RbtMpa)},
    workingConditions:{...f,RbFactor:f.compressionFactor,RbtFactor:f.tensionFactor},
  });
  return {
    RbMpa:adjusted.RbMpa,RbtMpa:adjusted.RbtMpa,
    base:{RbMpa:Number(RbMpa),RbtMpa:Number(RbtMpa)},
    factors:f,level:'engineering-review',reference:f.reference,
  };
}

export function creepCoefficient({strengthClass,relativeHumidityPercent}) {
  return concreteCreepFactor({strengthClass,relativeHumidityPercent,type:'heavy'});
}

export function longTermConcreteStrains(input) {
  return canonicalLongTermStrains(input);
}

export function longTermConcreteModulus({EbMpa,strengthClass,relativeHumidityPercent}) {
  const phi=creepCoefficient({strengthClass,relativeHumidityPercent});
  const result=modulusFromCreep({EbMpa,creepFactor:phi.value});
  return {...result,inputs:{...result.inputs,strengthClass,relativeHumidityPercent:Number(relativeHumidityPercent),phiBcr:phi.value}};
}

export function equivalentConcreteModulus(input) {
  return canonicalEquivalentModulus(input);
}
