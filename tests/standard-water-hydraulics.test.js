import test from 'node:test';
import assert from 'node:assert/strict';
import { steelCastIronFrictionGradient,localLossAllowance,fixturePressureCheck } from '../src/engine/standards/tcvn4513.js';
import { maximumFillRatio,minimumSelfCleansingVelocity,checkDrainVelocity } from '../src/engine/standards/tcvn7957.js';

test('TCVN 4513 pressure-loss chain is clause-backed',()=>{
  const i=steelCastIronFrictionGradient({resistanceA:0.01,flowLps:2});
  assert.equal(i.value,0.04);
  assert.equal(localLossAllowance({frictionHeadM:10,networkType:'domestic'}).value,3);
  assert.equal(fixturePressureCheck({availableHeadM:4,fixtureType:'shower'}).pass,true);
  assert.equal(fixturePressureCheck({availableHeadM:61,fixtureType:'general'}).maximumPass,false);
});

test('TCVN 7957 fill and velocity limits are enforced',()=>{
  assert.equal(maximumFillRatio(300).maximumFillRatio,0.6);
  assert.equal(maximumFillRatio(500).maximumFillRatio,0.75);
  assert.equal(minimumSelfCleansingVelocity(200).minimumVelocityMps,0.7);
  assert.equal(minimumSelfCleansingVelocity(1000).minimumVelocityMps,1.15);
  assert.equal(checkDrainVelocity({velocityMps:0.8,diameterMm:300,material:'nonmetal',flowType:'wastewater'}).pass,true);
  assert.equal(checkDrainVelocity({velocityMps:0.6,diameterMm:300,material:'nonmetal',flowType:'wastewater'}).minimumPass,false);
});
