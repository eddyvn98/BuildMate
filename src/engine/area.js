import { inputTrace, traceResult } from './trace.js';
import { readValue } from './project.js';

export function calculateAreas(project) {
  const width = Number(readValue(project, 'land.widthM', 0));
  const length = Number(readValue(project, 'land.lengthM', 0));
  const storeys = Number(readValue(project, 'design.storeys', 1));
  const ratio = Number(readValue(project, 'design.footprintRatio', 0.85));
  const landArea = width * length;
  const footprint = landArea * ratio;
  const floorArea = footprint * storeys;

  return {
    landArea: traceResult({
      id: 'area.land', label: 'Diện tích đất', value: round(landArea), unit: 'm²', formulaId: 'width*length',
      inputs: [inputTrace('width', width, 'm'), inputTrace('length', length, 'm')],
    }),
    footprint: traceResult({
      id: 'area.footprint', label: 'Diện tích chiếm đất dự kiến', value: round(footprint), unit: 'm²', formulaId: 'landArea*footprintRatio',
      inputs: [inputTrace('landArea', landArea, 'm²'), inputTrace('footprintRatio', ratio, 'ratio')],
      warnings: ['Tỷ lệ chiếm đất là giả định thiết kế, không thay thế chỉ tiêu quy hoạch được phê duyệt.'],
    }),
    floorArea: traceResult({
      id: 'area.floor', label: 'Tổng diện tích sàn dự kiến', value: round(floorArea), unit: 'm²', formulaId: 'footprint*storeys',
      inputs: [inputTrace('footprint', footprint, 'm²'), inputTrace('storeys', storeys, 'floor')],
    }),
  };
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
