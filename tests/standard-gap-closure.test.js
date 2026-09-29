import test from 'node:test';
import assert from 'node:assert/strict';
import { rectangularShearCheck } from '../src/engine/standards/tcvn5574.js';
import { fixtureUnitSchedule,checkDomesticSteelPipeVelocity } from '../src/engine/standards/tcvn4513.js';
import { residentialPowerFactor } from '../src/engine/standards/tcvn9206.js';

test('TCVN 5574 shear simplified branch is clause-backed',()=>{
  const r=rectangularShearCheck({designShearKn:100,bMm:300,h0Mm:500,RbMpa:14.5,RbtMpa:1.05,RswMpa:280,AswMm2:157,stirrupSpacingMm:150});
  assert.equal(r.concreteStrip.pass,true);
  assert.equal(r.transverseReinforcement.counted,true);
  assert.ok(r.simplifiedInclinedSection.capacityKn>100);
});

test('TCVN 4513 fixture-unit schedule and velocity checks are deterministic',()=>{
  const s=fixtureUnitSchedule([{type:'wcCistern',count:2},{type:'washBasinTap',count:2},{type:'dwellingShower',count:2}]);
  assert.equal(s.totalEquivalent,3);
  assert.equal(checkDomesticSteelPipeVelocity({velocityMps:1.8,segmentType:'main-riser'}).pass,true);
  assert.equal(checkDomesticSteelPipeVelocity({velocityMps:2.6,segmentType:'fixture-branch'}).pass,false);
});

test('TCVN 9206 residential power factor only accepts clause 5.8 range',()=>{
  assert.equal(residentialPowerFactor(0.82).value,0.82);
  assert.throws(()=>residentialPowerFactor(0.9));
});
