import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { projectAtoZStatus } from '../src/engine/a2z-status.js';

const PRICES={
  concrete:1500000,rebar:18000,masonry:300000,plaster:180000,
  paint:120000,electrical:900000,plumbing:1000000,
};

test('A-to-Z pricing stays blocked until the complete sourced project price set exists',()=>{
  const p=createProject();
  p.location.province.value='TP.HCM';
  p.land.widthM.value=4;
  p.land.lengthM.value=16;
  p.design.storeys.value=3;
  p.household.people.value=5;
  p.budget.totalVnd.value=3000000000;
  p.pricing.sourceLabel.value='Sample supplier quotation';
  p.pricing.effectiveDate.value='2026-09-30';

  let s=projectAtoZStatus(p);
  const budget=s.stages.find(x=>x.id==='budget');
  assert.equal(budget.status,'blocked');
  assert.ok(budget.message.includes('concrete'));

  for (const [code,value] of Object.entries(PRICES)) p.pricing.items[code].value=value;
  p.engineeringCalculations=[4,5,6,7,8,12].map(issue=>({id:'run-'+issue,issue,status:'ready'}));

  s=projectAtoZStatus(p);
  assert.equal(s.ready,true);
  assert.equal(s.progressPercent,100);
  assert.equal(s.stages.at(-1).id,'report');
});
