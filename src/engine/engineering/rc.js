export function checkMemberDemandCapacity({
  memberType,
  demandMomentKnM,
  demandShearKn,
  momentCapacityKnM,
  shearCapacityKn,
  capacitySource,
}) {
  if (!['beam','slab','column'].includes(memberType)) throw new RangeError('memberType must be beam, slab or column');
  requireNonNegative('demandMomentKnM',demandMomentKnM);
  requireNonNegative('demandShearKn',demandShearKn);
  requirePositive('momentCapacityKnM',momentCapacityKnM);
  requirePositive('shearCapacityKn',shearCapacityKn);
  if (!capacitySource) throw new TypeError('capacitySource is required');
  const momentRatio=Number(demandMomentKnM)/Number(momentCapacityKnM);
  const shearRatio=Number(demandShearKn)/Number(shearCapacityKn);
  return {
    memberType,
    moment:{demandKnM:Number(demandMomentKnM),capacityKnM:Number(momentCapacityKnM),utilization:round(momentRatio),pass:momentRatio<=1},
    shear:{demandKn:Number(demandShearKn),capacityKn:Number(shearCapacityKn),utilization:round(shearRatio),pass:shearRatio<=1},
    capacitySource:String(capacitySource),
    level:'engineering-review',
    warning:'Capacity values must come from a verified RC design profile; this function does not derive TCVN 5574 capacities.',
  };
}

export function requireRcDesignInputs(input) {
  const required=['concreteStrengthMpa','steelStrengthMpa','coverMm','memberWidthMm','effectiveDepthMm'];
  const missing=required.filter((key)=>!(Number(input?.[key])>0));
  return {ready:missing.length===0,missing};
}

function requirePositive(name,value){if (!(Number(value)>0)) throw new RangeError(`${name} must be > 0`);}
function requireNonNegative(name,value){if (!(Number(value)>=0)) throw new RangeError(`${name} must be >= 0`);}
function round(value,d=4){const f=10**d;return Math.round(value*f)/f;}
