import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { projectAtoZStatus } from '../src/engine/a2z-status.js';

test('A-to-Z status stays blocked until project data, sourced pricing and engineering runs exist',()=>{
  const p=createProject();
  let s=projectAtoZStatus(p);
  assert.equal(s.ready,false);
  assert.ok(s.progressPercent<100);

  p.location.province.value='TP.HCM';
  p.land.widthM.value=4;
  p.land.lengthM.value=16;
  p.design.storeys.value=3;
  p.household.people.value=5;
  p.budget.totalVnd.value=3000000000;
  p.pricing.sourceLabel.value='Project quotations';
  p.pricing.effectiveDate.value='2026-09-30';
  p.engineeringCalculations=[4,5,6,7,8,12].map(issue=>({id:'run-'+issue,issue,status:'ready'}));

  s=projectAtoZStatus(p);
  assert.equal(s.ready,true);
  assert.equal(s.progressPercent,100);
  assert.equal(s.stages.at(-1).id,'report');
});
