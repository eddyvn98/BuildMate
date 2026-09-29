import test from 'node:test';
import assert from 'node:assert/strict';
import { checkTnFaultLoop,checkTtRcdEarthResistance } from '../src/engine/standards/tcvn7447-4-41.js';

test('TCVN 7447-4-41 TN fault-loop condition enforces Zs Ia <= Uo',()=>{
  assert.equal(checkTnFaultLoop({loopImpedanceOhm:0.8,tripCurrentA:200,uoV:230,tripCurrentSource:'manufacturer curve at required time'}).pass,true);
  assert.equal(checkTnFaultLoop({loopImpedanceOhm:1.5,tripCurrentA:200,uoV:230,tripCurrentSource:'manufacturer curve at required time'}).pass,false);
  assert.throws(()=>checkTnFaultLoop({loopImpedanceOhm:0.8,tripCurrentA:200,uoV:230}));
});

test('TCVN 7447-4-41 TT RCD condition checks touch voltage and time',()=>{
  const ok=checkTtRcdEarthResistance({earthResistanceOhm:100,rcdRatedResidualCurrentA:0.03,uoV:230,currentA:20,actualTimeS:0.15});
  assert.equal(ok.voltagePass,true);
  assert.equal(ok.time.pass,true);
  assert.equal(ok.pass,true);
  const bad=checkTtRcdEarthResistance({earthResistanceOhm:2000,rcdRatedResidualCurrentA:0.03,uoV:230,currentA:20,actualTimeS:0.15});
  assert.equal(bad.voltagePass,false);
});
