import test from 'node:test';
import assert from 'node:assert/strict';
import { protectiveConductorAdiabaticArea,copperPeByPhaseSection } from '../src/engine/standards/tcvn7447-5-54.js';
import { createProject,setField } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';

test('TCVN 7447 protective conductor functions carry clause evidence',()=>{
  const ad=protectiveConductorAdiabaticArea({faultCurrentA:5000,disconnectTimeS:0.2,k:115});
  assert.ok(ad.value>19&&ad.value<20);
  assert.equal(copperPeByPhaseSection(25).minimumPeMm2,16);
  assert.throws(()=>protectiveConductorAdiabaticArea({faultCurrentA:5000,disconnectTimeS:6,k:115}));
});

test('engineering workflow blocks unsourced placeholder calculations',()=>{
  let p=createProject();
  p=setField(p,'location.province','TP.HCM');
  p=setField(p,'land.widthM',5);
  p=setField(p,'land.lengthM',20);
  const w=runPlanningWorkflow(p);
  assert.equal(w.results.engineering.modules.structure.status,'blocked');
  assert.equal(w.results.engineering.modules.electrical.status,'blocked');
  assert.equal(w.results.engineering.modules.water.status,'blocked');
  assert.equal(w.results.engineering.modules.hvac.status,'blocked');
});
