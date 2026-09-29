import test from 'node:test';
import assert from 'node:assert/strict';
import { requireBoosterPump,pumpDesignFlowBasis,pressureTankCapacityLimit } from '../src/engine/standards/tcvn4513.js';
import { minimumDrainDiameter,checkRainInletConnectionSlope } from '../src/engine/standards/tcvn7957.js';

test('TCVN 4513 pump and tank rules are clause-backed',()=>{
  assert.equal(requireBoosterPump({availablePressureM:12,requiredPressureM:20}).boosterRequired,true);
  assert.equal(pumpDesignFlowBasis({hasStorageTank:true,hourlyMaximumFlowM3h:4}).basis,'maximum-hour-flow');
  assert.equal(pumpDesignFlowBasis({hasStorageTank:false,secondDesignFlowLps:1.2}).basis,'second-design-flow');
  assert.equal(pressureTankCapacityLimit(26).splitRequired,true);
});

test('TCVN 7957 minimum drain diameters and rain inlet slope are enforced',()=>{
  assert.equal(minimumDrainDiameter({system:'sanitary',location:'site'}).minimumDiameterMm,150);
  assert.equal(minimumDrainDiameter({system:'storm',location:'street'}).minimumDiameterMm,400);
  assert.equal(checkRainInletConnectionSlope(0.02).pass,true);
  assert.equal(checkRainInletConnectionSlope(0.015).pass,false);
});
