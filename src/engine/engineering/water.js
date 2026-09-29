import { inputTrace, traceResult } from '../trace.js';

export function estimateDomesticWater({
  people,
  litersPerPersonDay,
  storageDays = 1,
  reserveRatio = 0.15,
}) {
  requirePositive('people', people);
  requirePositive('litersPerPersonDay', litersPerPersonDay);
  requirePositive('storageDays', storageDays);
  requireNonNegative('reserveRatio', reserveRatio);

  const dailyLiters = people * litersPerPersonDay;
  const storageLiters = dailyLiters * storageDays * (1 + reserveRatio);

  return {
    daily: traceResult({
      id: 'engineering.water-daily',
      label: 'Nhu cầu nước sinh hoạt sơ bộ',
      value: round(dailyLiters),
      unit: 'L/day',
      level: 'indicative',
      formulaId: 'people*litersPerPersonDay',
      inputs: [
        inputTrace('people', people, 'person'),
        inputTrace('litersPerPersonDay', litersPerPersonDay, 'L/person/day', 'assumed'),
      ],
      references: [{ type: 'standard-context', id: 'TCVN 4513:1988' }],
      warnings: ['Suất dùng nước đang là giả định dự án, cần thay bằng giá trị phù hợp hồ sơ thiết kế áp dụng.'],
    }),
    storage: traceResult({
      id: 'engineering.water-storage',
      label: 'Dung tích trữ nước sơ bộ',
      value: round(storageLiters),
      unit: 'L',
      level: 'indicative',
      formulaId: 'dailyWater*storageDays*(1+reserve)',
      inputs: [
        inputTrace('dailyWater', dailyLiters, 'L/day'),
        inputTrace('storageDays', storageDays, 'day', 'assumed'),
        inputTrace('reserveRatio', reserveRatio, 'ratio', 'assumed'),
      ],
    }),
  };
}

export function estimatePumpHead({ staticHeadM, frictionLossM, requiredResidualHeadM }) {
  requireNonNegative('staticHeadM', staticHeadM);
  requireNonNegative('frictionLossM', frictionLossM);
  requireNonNegative('requiredResidualHeadM', requiredResidualHeadM);
  return {
    totalHeadM: round(staticHeadM + frictionLossM + requiredResidualHeadM),
    level: 'engineering-review',
    formulaId: 'staticHead+frictionLoss+residualHead',
  };
}

function requirePositive(name, value) {
  if (!(Number(value) > 0)) throw new RangeError(`${name} must be > 0`);
}

function requireNonNegative(name, value) {
  if (!(Number(value) >= 0)) throw new RangeError(`${name} must be >= 0`);
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}


export function calculatePipeVelocity({flowLitersPerSecond,internalDiameterMm}) {
  requirePositive('flowLitersPerSecond',flowLitersPerSecond);
  requirePositive('internalDiameterMm',internalDiameterMm);
  const flowM3s=Number(flowLitersPerSecond)/1000;
  const diameterM=Number(internalDiameterMm)/1000;
  const area=Math.PI*diameterM**2/4;
  return {velocityMps:round(flowM3s/area,3),flowLitersPerSecond:Number(flowLitersPerSecond),internalDiameterMm:Number(internalDiameterMm),level:'engineering-review'};
}

export function calculateFullPipeManning({internalDiameterMm,slope,manningN}) {
  requirePositive('internalDiameterMm',internalDiameterMm);
  requirePositive('slope',slope);
  requirePositive('manningN',manningN);
  const d=Number(internalDiameterMm)/1000;
  const area=Math.PI*d**2/4;
  const hydraulicRadius=d/4;
  const flowM3s=(1/Number(manningN))*area*hydraulicRadius**(2/3)*Number(slope)**0.5;
  return {flowLitersPerSecond:round(flowM3s*1000,3),level:'engineering-review',formulaId:'Manning-full-pipe',warning:'Use only with project/profile values for slope and Manning n; this is not an automatic TCVN 7957 pipe selection.'};
}
