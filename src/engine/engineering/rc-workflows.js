import { rectangularFlexuralCapacity,checkFlexuralMoment,rectangularShearCheck,checkCrackWidth } from '../standards/tcvn5574.js';
import { checkDeflection } from '../standards/tcvn5574-deflection.js';
import { rectangularEccentricCompressionCheck } from '../standards/tcvn5574-column.js';

export function beamWorkflow({loadTrace,flexure,shear,crack=null,deflection=null}) {
  requireTcvn2737Load(loadTrace);
  const capacity=rectangularFlexuralCapacity(flexure.capacity);
  const moment=checkFlexuralMoment({designMomentKnM:flexure.designMomentKnM,capacity});
  const shearResult=rectangularShearCheck({...shear,designShearKn:shear.designShearKn});
  return {
    memberType:'beam',loadTrace:structuredClone(loadTrace),capacity,moment,shear:shearResult,
    crack:crack?checkCrackWidth(crack):null,
    deflection:deflection?checkDeflection(deflection):null,
    level:'engineering-review',
  };
}

export function slabWorkflow({loadTrace,flexure,crack=null,deflection=null}) {
  requireTcvn2737Load(loadTrace);
  const capacity=rectangularFlexuralCapacity(flexure.capacity);
  return {
    memberType:'slab',loadTrace:structuredClone(loadTrace),capacity,
    moment:checkFlexuralMoment({designMomentKnM:flexure.designMomentKnM,capacity}),
    crack:crack?checkCrackWidth(crack):null,
    deflection:deflection?checkDeflection(deflection):null,
    level:'engineering-review',
    warning:'Punching/local support checks are separate and must be added where applicable.',
  };
}

export function columnWorkflow({loadTrace,column}) {
  requireTcvn2737Load(loadTrace);
  return {
    memberType:'column',loadTrace:structuredClone(loadTrace),
    strength:rectangularEccentricCompressionCheck(column),
    level:'engineering-review',
  };
}

function requireTcvn2737Load(loadTrace) {
  const refs=loadTrace?.reference?[loadTrace.reference]:(loadTrace?.references ?? []);
  if (!refs.some(ref=>String(ref.standard ?? '').includes('TCVN 2737:2023'))) {
    throw new TypeError('RC member workflow requires a TCVN 2737:2023 load trace');
  }
}
