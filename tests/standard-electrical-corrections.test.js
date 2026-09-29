import test from 'node:test';
import assert from 'node:assert/strict';
import { ambientAirTemperatureFactor,soilTemperatureFactor,soilThermalResistivityFactor,chooseMinimumPvcCopperSection } from '../src/engine/standards/tcvn7447-5-52.js';

test('TCVN 7447-5-52 temperature correction factors match B.52.14/B.52.15',()=>{
  assert.equal(ambientAirTemperatureFactor({temperatureC:40,insulation:'PVC'}).factor,0.87);
  assert.equal(ambientAirTemperatureFactor({temperatureC:50,insulation:'XLPE'}).factor,0.82);
  assert.equal(soilTemperatureFactor({temperatureC:30,insulation:'PVC'}).factor,0.89);
  assert.equal(soilTemperatureFactor({temperatureC:40,insulation:'XLPE'}).factor,0.85);
});

test('TCVN 7447-5-52 soil thermal resistivity factor matches B.52.16',()=>{
  assert.equal(soilThermalResistivityFactor({thermalResistivityCmPerW:3,burial:'duct'}).factor,0.96);
  assert.equal(soilThermalResistivityFactor({thermalResistivityCmPerW:1.5,burial:'direct'}).factor,1.28);
});

test('temperature and grouping factors can be applied before cable section acceptance',()=>{
  const air=ambientAirTemperatureFactor({temperatureC:40,insulation:'PVC'}).factor;
  const result=chooseMinimumPvcCopperSection({designCurrentA:30,method:'B1',loadedConductors:2,correctionFactors:[air,0.8]});
  assert.equal(result.sectionMm2,10);
});
