import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { runStandardCalculation } from '../src/engine/engineering/standards-calculator.js';
import { createEngineeringCalculationRecord,calculationSetDigest } from '../src/engine/engineering-calculation-record.js';
import { reviewEvidenceFingerprint,createEngineeringReviewRecord,assessEngineeringReviewRecord } from '../src/engine/review-record.js';

test('calculation record hashes action input result and evidence digest',()=>{
  const p=createProject();
  const output=runStandardCalculation(p,{action:'water.design-flow',input:{fixtureEquivalentUnits:20,litersPerPersonDay:150}});
  const a=createEngineeringCalculationRecord({id:'run-a',action:'water.design-flow',issue:8,standard:output.standard,input:{fixtureEquivalentUnits:20,litersPerPersonDay:150},output});
  const b=createEngineeringCalculationRecord({id:'run-b',action:'water.design-flow',issue:8,standard:output.standard,input:{fixtureEquivalentUnits:20,litersPerPersonDay:150},output});
  assert.equal(a.calculationDigest,b.calculationDigest);
  assert.equal(calculationSetDigest([a],8).length,64);
});

test('verified review is invalidated when calculation set changes',()=>{
  const p=createProject();
  const output=runStandardCalculation(p,{action:'water.design-flow',input:{fixtureEquivalentUnits:20,litersPerPersonDay:150}});
  const calc=createEngineeringCalculationRecord({id:'c1',action:'water.design-flow',issue:8,standard:output.standard,input:{fixtureEquivalentUnits:20,litersPerPersonDay:150},output});
  p.engineeringCalculations=[calc];
  const fp=reviewEvidenceFingerprint(8,{commitSha:'abc',evidence:p.engineeringEvidence,calculations:p.engineeringCalculations});
  p.engineeringReviews=[createEngineeringReviewRecord({
    issue:8,reviewerName:'MEP reviewer',qualification:'MEP engineer',reviewedAt:'2026-09-30',
    outcome:'approved',independent:true,verificationStatus:'verified',verifiedBy:'admin',verifiedAt:'2026-09-30',
    evidenceFingerprint:fp,commitSha:'abc',
  })];
  assert.equal(assessEngineeringReviewRecord(p.engineeringReviews[0],{expectedFingerprint:fp}).constructionReady,true);
  const output2=runStandardCalculation(p,{action:'water.design-flow',input:{fixtureEquivalentUnits:30,litersPerPersonDay:150}});
  p.engineeringCalculations.push(createEngineeringCalculationRecord({id:'c2',action:'water.design-flow',issue:8,standard:output2.standard,input:{fixtureEquivalentUnits:30,litersPerPersonDay:150},output:output2}));
  const changed=reviewEvidenceFingerprint(8,{commitSha:'abc',evidence:p.engineeringEvidence,calculations:p.engineeringCalculations});
  assert.equal(assessEngineeringReviewRecord(p.engineeringReviews[0],{expectedFingerprint:changed}).constructionReady,false);
});
