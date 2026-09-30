import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicReferenceProject,publicReferenceCalculationInputs,PUBLIC_REFERENCE_CASE } from '../src/demo/public-reference-project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { runStandardCalculation } from '../src/engine/engineering/standards-calculator.js';
import { createEngineeringCalculationRecord } from '../src/engine/engineering-calculation-record.js';
import { projectAtoZStatus } from '../src/engine/a2z-status.js';

test('public reference fixture preserves source-derived facts and explicit demo assumptions',()=>{
  const p=createPublicReferenceProject();
  assert.equal(p.land.widthM.value,4);
  assert.equal(p.land.widthM.state,'confirmed');
  assert.equal(p.land.lengthM.value,16);
  assert.equal(p.design.storeys.value,3);
  assert.equal(p.household.bedrooms.value,4);
  assert.equal(p.household.people.state,'assumed');
  assert.equal(p.design.footprintRatio.state,'assumed');
  assert.equal(p.referenceCase.id,PUBLIC_REFERENCE_CASE.id);
  assert.equal(p.referenceCase.sources.length,2);
});

test('public reference fixture can run the six-domain A-to-Z demo without claiming real project evidence',()=>{
  const p=createPublicReferenceProject();
  for (const [action,input] of publicReferenceCalculationInputs()) {
    const output=runStandardCalculation(p,{action,input});
    assert.equal(output.status,'ready',action);
    p.engineeringCalculations.push(createEngineeringCalculationRecord({
      action,issue:output.issue,standard:output.standard,input,output,
    }));
  }
  const workflow=runPlanningWorkflow(p);
  assert.equal(workflow.results.marketPricing.quickEstimate.status,'ready');
  const status=projectAtoZStatus(p);
  assert.equal(status.ready,true);
  assert.equal(status.progressPercent,100);
  assert.ok(p.referenceCase.note.includes('không phải hồ sơ'));
});
