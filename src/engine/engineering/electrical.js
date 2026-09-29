import { inputTrace, traceResult } from '../trace.js';

export function calculateServiceCurrent({
  connectedPowerW,
  demandFactor = 1,
  voltageV = 220,
  powerFactor = 1,
  phase = 'single',
}) {
  requirePositive('connectedPowerW', connectedPowerW);
  requirePositive('voltageV', voltageV);
  requireRatio('demandFactor', demandFactor);
  requireRatio('powerFactor', powerFactor);

  const demandPowerW = connectedPowerW * demandFactor;
  const divisor = phase === 'three' ? Math.sqrt(3) * voltageV * powerFactor : voltageV * powerFactor;
  const currentA = demandPowerW / divisor;

  return traceResult({
    id: 'engineering.electrical-current',
    label: 'Dòng điện nhu cầu sơ bộ',
    value: round(currentA),
    unit: 'A',
    level: 'engineering-review',
    formulaId: phase === 'three' ? 'P/(sqrt(3)*V*pf)' : 'P/(V*pf)',
    inputs: [
      inputTrace('connectedPower', connectedPowerW, 'W'),
      inputTrace('demandFactor', demandFactor, 'ratio', 'assumed'),
      inputTrace('voltage', voltageV, 'V', 'assumed'),
      inputTrace('powerFactor', powerFactor, 'ratio', 'assumed'),
      inputTrace('phase', phase, null, 'confirmed'),
    ],
    references: [
      { type: 'standard-context', id: 'QCVN 12:2014/BXD' },
      { type: 'standard-context', id: 'TCVN 9206:2012' },
    ],
    warnings: ['Chưa tự chọn tiết diện dây hoặc CB nếu chưa có profile lắp đặt/khả năng tải dòng được xác minh.'],
  });
}

export function checkCableAmpacity({ loadCurrentA, cableAmpacityA, breakerRatingA = null }) {
  requirePositive('loadCurrentA', loadCurrentA);
  requirePositive('cableAmpacityA', cableAmpacityA);
  const cablePass = cableAmpacityA >= loadCurrentA;
  const breakerPass = breakerRatingA == null ? null : breakerRatingA >= loadCurrentA && breakerRatingA <= cableAmpacityA;
  return { cablePass, breakerPass, loadCurrentA, cableAmpacityA, breakerRatingA, level: 'engineering-review' };
}

export function protectiveConductorAdiabaticArea({
  faultCurrentA,
  disconnectTimeS,
  materialFactorK,
}) {
  requirePositive('faultCurrentA', faultCurrentA);
  requirePositive('disconnectTimeS', disconnectTimeS);
  requirePositive('materialFactorK', materialFactorK);
  const areaMm2 = faultCurrentA * Math.sqrt(disconnectTimeS) / materialFactorK;
  return {
    minimumAreaMm2: round(areaMm2),
    formulaId: 'I*sqrt(t)/k',
    level: 'engineering-review',
    reference: 'TCVN 7447-5-54:2015 context; k and fault parameters must come from an approved design basis.',
  };
}

function requirePositive(name, value) {
  if (!(Number(value) > 0)) throw new RangeError(`${name} must be > 0`);
}

function requireNonNegative(name, value) {
  if (!(Number(value) >= 0)) throw new RangeError(`${name} must be >= 0`);
}

function requireRatio(name, value) {
  if (!(Number(value) > 0 && Number(value) <= 1)) throw new RangeError(`${name} must be > 0 and <= 1`);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}


export function calculateVoltageDrop({
  currentA,lengthM,resistanceOhmPerKm,reactanceOhmPerKm=0,powerFactor=1,voltageV,phase='single'
}) {
  requirePositive('currentA',currentA); requirePositive('lengthM',lengthM); requireNonNegative('resistanceOhmPerKm',resistanceOhmPerKm);
  requireNonNegative('reactanceOhmPerKm',reactanceOhmPerKm); requireRatio('powerFactor',powerFactor); requirePositive('voltageV',voltageV);
  const sinPhi=Math.sqrt(Math.max(0,1-Number(powerFactor)**2));
  const z=Number(resistanceOhmPerKm)*Number(powerFactor)+Number(reactanceOhmPerKm)*sinPhi;
  const factor=phase==='three' ? Math.sqrt(3) : 2;
  const dropV=factor*Number(currentA)*(Number(lengthM)/1000)*z;
  return {dropV:round(dropV),dropPercent:round(dropV/Number(voltageV)*100),level:'engineering-review',formulaId:'phaseFactor*I*L*(R*cosphi+X*sinphi)'};
}

export function checkProtectionDisconnection({faultCurrentA,clearingTimeS,maxClearingTimeS,source}) {
  requirePositive('faultCurrentA',faultCurrentA); requirePositive('clearingTimeS',clearingTimeS); requirePositive('maxClearingTimeS',maxClearingTimeS);
  if (!source) throw new TypeError('source is required');
  return {faultCurrentA:Number(faultCurrentA),clearingTimeS:Number(clearingTimeS),maxClearingTimeS:Number(maxClearingTimeS),pass:Number(clearingTimeS)<=Number(maxClearingTimeS),source:String(source),level:'engineering-review'};
}
