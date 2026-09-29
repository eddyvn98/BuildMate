import test from 'node:test';
import assert from 'node:assert/strict';
import { table14ResistanceA,pipeFrictionHead,requiredPumpDuty,checkPumpCandidate,localLossAllowance } from '../src/engine/standards/tcvn4513.js';

test('TCVN 4513 Table 14 common pipe resistance values are embedded with trace',()=>{
  assert.equal(table14ResistanceA(50).value,0.01108);
  assert.equal(table14ResistanceA(70).value,0.002993);
  const h=pipeFrictionHead({diameterMm:50,flowLps:5,lengthM:10});
  assert.ok(Math.abs(h.value-2.77)<0.001);
});

test('pump candidate must satisfy sourced hydraulic duty point',()=>{
  const friction=pipeFrictionHead({diameterMm:50,flowLps:2,lengthM:20}).value;
  const local=localLossAllowance({frictionHeadM:friction,networkType:'domestic'}).value;
  const duty=requiredPumpDuty({designFlow:7.2,flowUnit:'m3/h',staticHeadM:15,frictionHeadM:friction,localLossM:local,residualHeadM:4});
  assert.equal(checkPumpCandidate({duty,pumpFlow:8,pumpHeadM:25,manufacturerCurveSource:'manufacturer Q-H curve rev A'}).pass,true);
  assert.equal(checkPumpCandidate({duty,pumpFlow:8,pumpHeadM:10,manufacturerCurveSource:'manufacturer Q-H curve rev A'}).headPass,false);
  assert.throws(()=>checkPumpCandidate({duty,pumpFlow:8,pumpHeadM:25}));
});
