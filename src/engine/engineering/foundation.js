import { inputTrace, traceResult } from '../trace.js';

export function estimateEquivalentFoundationArea({
  serviceLoadKn,
  allowableBearingKpa,
  loadAllowanceRatio = 0.1,
}) {
  requirePositive('serviceLoadKn', serviceLoadKn);
  requirePositive('allowableBearingKpa', allowableBearingKpa);
  requireNonNegative('loadAllowanceRatio', loadAllowanceRatio);

  const designServiceKn = serviceLoadKn * (1 + loadAllowanceRatio);
  const areaM2 = designServiceKn / allowableBearingKpa;

  return traceResult({
    id: 'engineering.foundation-area',
    label: 'Tổng diện tích chịu tải nền tương đương',
    value: round(areaM2),
    unit: 'm²',
    level: 'indicative',
    formulaId: 'serviceLoad*(1+allowance)/allowableBearingPressure',
    inputs: [
      inputTrace('serviceLoad', serviceLoadKn, 'kN'),
      inputTrace('loadAllowance', loadAllowanceRatio, 'ratio', 'assumed'),
      inputTrace('allowableBearingPressure', allowableBearingKpa, 'kPa', 'confirmed'),
    ],
    references: [{ type: 'standard-context', id: 'TCVN 9362:2012' }],
    warnings: [
      'Chỉ là cân bằng tải trọng/áp lực nền ở mức khái niệm; không thay thế tính lún, lệch tâm, chọc thủng, trượt hoặc khảo sát địa kỹ thuật.',
    ],
  });
}

export function estimatePileCountConcept({
  serviceLoadKn,
  workingCapacityPerPileKn,
  reserveRatio = 0.1,
}) {
  requirePositive('serviceLoadKn', serviceLoadKn);
  requirePositive('workingCapacityPerPileKn', workingCapacityPerPileKn);
  requireNonNegative('reserveRatio', reserveRatio);

  const required = Math.ceil(serviceLoadKn * (1 + reserveRatio) / workingCapacityPerPileKn);
  return {
    pileCount: required,
    level: 'indicative',
    formulaId: 'ceil(serviceLoad*(1+reserve)/workingCapacityPerPile)',
    reference: 'TCVN 10304:2025 context only',
    warning: 'Sức chịu tải làm việc của cọc phải đến từ tính toán/khảo sát/thử tải phù hợp; BuildMate không tự suy đoán giá trị này.',
  };
}

function requirePositive(name, value) {
  if (!(Number(value) > 0)) throw new RangeError(`${name} must be > 0`);
}

function requireNonNegative(name, value) {
  if (!(Number(value) >= 0)) throw new RangeError(`${name} must be >= 0`);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}


export function checkFoundationBearing({serviceLoadKn,areaM2,allowableBearingKpa,source}) {
  requirePositive('serviceLoadKn',serviceLoadKn);
  requirePositive('areaM2',areaM2);
  requirePositive('allowableBearingKpa',allowableBearingKpa);
  if (!source) throw new TypeError('source is required');
  const appliedKpa=Number(serviceLoadKn)/Number(areaM2);
  return {
    appliedBearingKpa:round(appliedKpa),
    allowableBearingKpa:Number(allowableBearingKpa),
    utilization:round(appliedKpa/Number(allowableBearingKpa),4),
    pass:appliedKpa<=Number(allowableBearingKpa),
    source:String(source),
    level:'engineering-review',
    warning:'Settlement, eccentricity and geotechnical failure modes require the verified foundation profile and site investigation.',
  };
}

export function checkFoundationEccentricity({resultantEccentricityM,foundationWidthM,limitRatio=1/6}) {
  requireNonNegative('resultantEccentricityM',resultantEccentricityM);
  requirePositive('foundationWidthM',foundationWidthM);
  requirePositive('limitRatio',limitRatio);
  const limitM=Number(foundationWidthM)*Number(limitRatio);
  return {eccentricityM:Number(resultantEccentricityM),limitM:round(limitM),pass:Number(resultantEccentricityM)<=limitM,level:'engineering-review'};
}
