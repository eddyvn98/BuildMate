import { inputTrace, traceResult } from './trace.js';

export const QUANTITY_PROFILE = Object.freeze({
  id: 'townhouse-indicative-v0.1',
  level: 'indicative',
  coefficients: {
    concreteM3PerM2: 0.32,
    rebarKgPerM2: 42,
    masonryM2PerM2: 1.15,
    plasterM2PerM2: 2.4,
    paintM2PerM2: 2.25,
    electricalPointPerM2: 0.42,
    plumbingPointPerBathroom: 7,
  },
});

export function estimateQuantities({ floorAreaM2, bathrooms = 3 }) {
  const c = QUANTITY_PROFILE.coefficients;
  const items = [
    result('qty.concrete', 'Bê tông kết cấu dự kiến', floorAreaM2, floorAreaM2 * c.concreteM3PerM2, 'm³', 'floorArea*concreteCoefficient', c.concreteM3PerM2),
    result('qty.rebar', 'Thép cốt bê tông dự kiến', floorAreaM2, floorAreaM2 * c.rebarKgPerM2, 'kg', 'floorArea*rebarCoefficient', c.rebarKgPerM2),
    result('qty.masonry', 'Xây tường quy đổi', floorAreaM2, floorAreaM2 * c.masonryM2PerM2, 'm²', 'floorArea*masonryCoefficient', c.masonryM2PerM2),
    result('qty.plaster', 'Tô trát quy đổi', floorAreaM2, floorAreaM2 * c.plasterM2PerM2, 'm²', 'floorArea*plasterCoefficient', c.plasterM2PerM2),
    result('qty.paint', 'Sơn hoàn thiện quy đổi', floorAreaM2, floorAreaM2 * c.paintM2PerM2, 'm²', 'floorArea*paintCoefficient', c.paintM2PerM2),
    result('qty.electrical', 'Điểm điện sơ bộ', floorAreaM2, floorAreaM2 * c.electricalPointPerM2, 'điểm', 'floorArea*electricalPointCoefficient', c.electricalPointPerM2),
    traceResult({
      id: 'qty.plumbing', label: 'Điểm cấp/thoát nước sơ bộ', value: Math.round(bathrooms * c.plumbingPointPerBathroom), unit: 'điểm',
      level: 'indicative', formulaId: 'bathrooms*plumbingPointCoefficient',
      inputs: [inputTrace('bathrooms', bathrooms, 'room'), inputTrace('coefficient', c.plumbingPointPerBathroom, 'point/bathroom', 'assumed')],
      warnings: warning(),
    }),
  ];
  return { profile: QUANTITY_PROFILE.id, items };
}

function result(id, label, floorAreaM2, raw, unit, formulaId, coefficient) {
  return traceResult({
    id, label, value: Math.round(raw * 10) / 10, unit, level: 'indicative', formulaId,
    inputs: [inputTrace('floorArea', floorAreaM2, 'm²'), inputTrace('coefficient', coefficient, null, 'assumed')],
    references: [{ type: 'coefficient-profile', id: QUANTITY_PROFILE.id }],
    warnings: warning(),
  });
}

function warning() {
  return ['Hệ số V1 dùng cho so sánh/lập kế hoạch, chưa phải BOQ thi công. Cần thay bằng mô hình hình học và cấu kiện thực tế.'];
}
