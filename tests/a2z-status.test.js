import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { projectAtoZStatus } from '../src/engine/a2z-status.js';

const PRICES={
  concrete:1500000,rebar:18000,masonry:300000,plaster:180000,
  paint:120000,electrical:900000,plumbing:1000000,
};

function baseProject(){
  const p=createProject();
  p.context.projectDate.value='2026-10-02';
  p.location.province.value='TP.HCM';
  p.land.widthM.value=4;
  p.land.lengthM.value=16;
  p.design.storeys.value=3;
  p.household.people.value=5;
  p.budget.totalVnd.value=3000000000;
  p.engineeringCalculations=[4,5,6,7,8,12].map(issue=>({id:'run-'+issue,issue,status:'ready'}));
  return p;
}

test('A-to-Z accepts a fresh market snapshot without forcing detailed manual prices',()=>{
  const p=baseProject();
  const s=projectAtoZStatus(p);
  assert.equal(s.ready,true);
  const budget=s.stages.find(x=>x.id==='budget');
  assert.equal(budget.status,'ready');
  assert.ok(budget.message.includes('snapshot thị trường'));
});

test('manual sourced price set remains a valid fallback after market snapshot becomes stale',()=>{
  const p=baseProject();
  p.context.projectDate.value='2027-02-01';
  let s=projectAtoZStatus(p);
  assert.equal(s.stages.find(x=>x.id==='budget').status,'blocked');

  p.pricing.sourceLabel.value='Supplier quotation';
  p.pricing.effectiveDate.value='2027-02-01';
  for (const [code,value] of Object.entries(PRICES)) p.pricing.items[code].value=value;
  s=projectAtoZStatus(p);
  assert.equal(s.ready,true);
});
