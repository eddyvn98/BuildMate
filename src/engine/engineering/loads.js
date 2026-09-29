import { inputTrace, traceResult } from '../trace.js';

export function estimateBuildingGravityLoad({
  floorAreaM2,
  storeys,
  deadLoadKnM2,
  liveLoadKnM2,
}) {
  requirePositive('floorAreaM2', floorAreaM2);
  requirePositive('storeys', storeys);
  requireNonNegative('deadLoadKnM2', deadLoadKnM2);
  requireNonNegative('liveLoadKnM2', liveLoadKnM2);

  const serviceKnPerFloor = floorAreaM2 * (deadLoadKnM2 + liveLoadKnM2);
  const totalServiceKn = serviceKnPerFloor * storeys;

  return traceResult({
    id: 'engineering.gravity-service',
    label: 'Tải trọng đứng sử dụng sơ bộ toàn nhà',
    value: round(totalServiceKn),
    unit: 'kN',
    level: 'indicative',
    formulaId: 'floorArea*(deadLoad+liveLoad)*storeys',
    inputs: [
      inputTrace('floorArea', floorAreaM2, 'm²'),
      inputTrace('storeys', storeys, 'floor'),
      inputTrace('deadLoad', deadLoadKnM2, 'kN/m²', 'assumed'),
      inputTrace('liveLoad', liveLoadKnM2, 'kN/m²', 'assumed'),
    ],
    references: [{ type: 'standard-context', id: 'TCVN 2737:2023' }],
    warnings: [
      'Đây là mô hình tải trọng sơ bộ theo giả định người dùng/profile, chưa phải tổ hợp tải trọng thiết kế.',
    ],
  });
}

export function simpleBeamUniformLoad({ spanM, lineLoadKnM }) {
  requirePositive('spanM', spanM);
  requireNonNegative('lineLoadKnM', lineLoadKnM);
  const reactionKn = lineLoadKnM * spanM / 2;
  const maxMomentKnM = lineLoadKnM * spanM ** 2 / 8;

  return {
    reactionEachKn: round(reactionKn),
    maxShearKn: round(reactionKn),
    maxMomentKnM: round(maxMomentKnM),
    model: 'simply-supported-uniform-load',
    level: 'engineering-review',
    warning: 'Nội lực cơ học cơ bản; chưa bao gồm hệ số/tổ hợp/điều kiện biên của mô hình kết cấu thực.',
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
