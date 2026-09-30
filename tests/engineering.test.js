import test from 'node:test';
import assert from 'node:assert/strict';
import { protectiveConductorAdiabaticArea, calculateServiceCurrent } from '../src/engine/engineering/electrical.js';
import { estimateEquivalentFoundationArea, estimatePileCountConcept } from '../src/engine/engineering/foundation.js';
import { estimateCoolingCapacity, kwToBtuPerHour } from '../src/engine/engineering/hvac.js';
import { estimateBuildingGravityLoad, simpleBeamUniformLoad } from '../src/engine/engineering/loads.js';
import { estimateWorkDuration } from '../src/engine/engineering/schedule.js';
import { estimateDomesticWater, estimatePumpHead } from '../src/engine/engineering/water.js';
import { applicableStandards, canIssueConstructionReady, standardById } from '../src/engine/standards.js';

test('gravity load preview is deterministic', () => {
  const result = estimateBuildingGravityLoad({ floorAreaM2: 50, storeys: 3, deadLoadKnM2: 3.5, liveLoadKnM2: 2 });
  assert.equal(result.value, 825);
  assert.equal(result.level, 'indicative');
});

test('simple beam mechanics returns expected reactions and moment', () => {
  const result = simpleBeamUniformLoad({ spanM: 4, lineLoadKnM: 10 });
  assert.equal(result.reactionEachKn, 20);
  assert.equal(result.maxMomentKnM, 20);
});

test('foundation area uses provided geotechnical bearing pressure only', () => {
  const result = estimateEquivalentFoundationArea({ serviceLoadKn: 1000, allowableBearingKpa: 200, loadAllowanceRatio: 0.1 });
  assert.equal(result.value, 5.5);
});

test('pile concept never invents pile capacity', () => {
  const result = estimatePileCountConcept({ serviceLoadKn: 1000, workingCapacityPerPileKn: 300, reserveRatio: 0.1 });
  assert.equal(result.pileCount, 4);
});

test('electrical current supports single and three phase', () => {
  const single = calculateServiceCurrent({ connectedPowerW: 8800, demandFactor: 1, voltageV: 220, powerFactor: 1, phase: 'single' });
  const three = calculateServiceCurrent({ connectedPowerW: 19052.56, demandFactor: 1, voltageV: 380, powerFactor: 1, phase: 'three' });
  assert.equal(single.value, 40);
  assert.ok(Math.abs(three.value - 28.95) < 0.02);
});

test('PE adiabatic calculator uses explicit fault inputs', () => {
  const result = protectiveConductorAdiabaticArea({ faultCurrentA: 5000, disconnectTimeS: 0.2, materialFactorK: 115 });
  assert.ok(result.minimumAreaMm2 > 19 && result.minimumAreaMm2 < 20);
});

test('water, pump and cooling previews calculate from explicit assumptions', () => {
  const water = estimateDomesticWater({ people: 5, litersPerPersonDay: 150, storageDays: 1 });
  assert.equal(water.daily.value, 750);
  assert.equal(water.storage.value, 862.5);
  assert.equal(estimatePumpHead({ staticHeadM: 15, frictionLossM: 5, requiredResidualHeadM: 10 }).totalHeadM, 30);
  const cooling = estimateCoolingCapacity({ conditionedAreaM2: 100, wattsPerM2: 150 });
  assert.equal(cooling.value, 15);
  assert.equal(kwToBtuPerHour(15), 51182);
});

test('schedule preview returns buffered calendar days', () => {
  const result = estimateWorkDuration({ quantity: 100, productivityPerCrewDay: 10, crews: 2, bufferRatio: 0.2 });
  assert.equal(result.productiveDays, 5);
  assert.equal(result.calendarDays, 6);
});

test('standards registry reflects current pile standard and future planning transition', () => {
  assert.equal(standardById('pile-foundation').standard, 'TCVN 10304:2025');
  assert.equal(canIssueConstructionReady('pile-foundation'), true);
  const now = applicableStandards('2026-09-29').map((item) => item.standard);
  assert.ok(now.includes('QCVN 01:2021/BXD'));
  const nextYear = applicableStandards('2027-01-02').map((item) => item.standard);
  assert.ok(!nextYear.includes('QCVN 01:2021/BXD'));
});
