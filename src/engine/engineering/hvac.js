import { inputTrace, traceResult } from '../trace.js';

const BTU_PER_HOUR_PER_KW = 3412.142;

export function estimateCoolingCapacity({ conditionedAreaM2, wattsPerM2 }) {
  if (!(Number(conditionedAreaM2) > 0)) throw new RangeError('conditionedAreaM2 must be > 0');
  if (!(Number(wattsPerM2) > 0)) throw new RangeError('wattsPerM2 must be > 0');

  const kw = conditionedAreaM2 * wattsPerM2 / 1000;
  return traceResult({
    id: 'engineering.cooling-load',
    label: 'Công suất lạnh sơ bộ',
    value: round(kw),
    unit: 'kW',
    level: 'indicative',
    formulaId: 'conditionedArea*wattsPerM2/1000',
    inputs: [
      inputTrace('conditionedArea', conditionedAreaM2, 'm²'),
      inputTrace('planningLoadDensity', wattsPerM2, 'W/m²', 'assumed'),
    ],
    warnings: ['Chỉ dùng để lập kế hoạch; thiết kế HVAC phải xét hướng nắng, kính, người, thiết bị, thông gió và điều kiện trong/ngoài nhà.'],
    references: [],
  });
}

export function kwToBtuPerHour(kw) {
  if (!(Number(kw) >= 0)) throw new RangeError('kw must be >= 0');
  return Math.round(kw * BTU_PER_HOUR_PER_KW);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
