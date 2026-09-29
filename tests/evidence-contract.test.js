import test from 'node:test';
import assert from 'node:assert/strict';
import { auditEngineeringEvidence,assertEngineeringEvidence } from '../src/engine/evidence-audit.js';
import { calculationProof } from '../src/engine/calculation-proof.js';
import { designDistributedLiveLoad,standardWindPressure } from '../src/engine/standards/tcvn2737.js';
import { rectangularFlexuralCapacity } from '../src/engine/standards/tcvn5574.js';
import { protectiveConductorAdiabaticArea } from '../src/engine/standards/tcvn7447-5-54.js';
import { housingDesignFlow } from '../src/engine/standards/tcvn4513.js';

test('standard-derived calculation results pass evidence audit',()=>{
  const results=[
    designDistributedLiveLoad(1.5),
    standardWindPressure({windZone:'II',kZe:1,aerodynamicCoefficient:0.8,gustFactor:1.5,coefficientSources:{kZe:'clause',aerodynamicCoefficient:'clause',gustFactor:'clause'}}),
    rectangularFlexuralCapacity({bMm:200,h0Mm:450,RbMpa:14.5,RsMpa:350,AsMm2:1000,xiR:0.5,materialSource:'TCVN tables'}),
    protectiveConductorAdiabaticArea({faultCurrentA:5000,disconnectTimeS:0.2,k:115}),
    housingDesignFlow({fixtureEquivalentUnits:20,litersPerPersonDay:150}),
  ];
  for (const result of results) assert.equal(assertEngineeringEvidence(result),true);
});

test('audit rejects engineering result without standard proof',()=>{
  const issues=auditEngineeringEvidence({level:'engineering-review',value:10,unit:'kN'});
  assert.ok(issues.some(x=>x.code==='missing-reference'));
  assert.ok(issues.some(x=>x.code==='missing-formula-id'));
  assert.ok(issues.some(x=>x.code==='missing-input-trace'));
});

test('calculation proof exposes source, formula and inputs for reproduction',()=>{
  const result=designDistributedLiveLoad(1.5);
  const proof=calculationProof(result);
  assert.equal(proof.reproducible,true);
  assert.equal(proof.sources[0].standard,'TCVN 2737:2023');
  assert.ok(proof.sources[0].clause.includes('8.3.5'));
});
