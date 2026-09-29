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
