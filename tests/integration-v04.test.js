import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, setField } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { engineeringProfileStatus } from '../src/engine/engineering-profiles.js';

test('planning workflow selects baseline from project date and exposes standards-ready profiles',()=>{
  let project=createProject();
  project=setField(project,'location.province','Hồ Chí Minh');
  project=setField(project,'land.widthM',5);
  project=setField(project,'land.lengthM',20);
  project=setField(project,'budget.totalVnd',3000000000);
  project=setField(project,'context.projectDate','2027-01-02');
  const workflow=runPlanningWorkflow(project);
  assert.equal(workflow.results.planningRules.baseline.standard,'QCVN 01:2026/BXD');
  assert.ok(workflow.results.engineering.profiles.every((p)=>!p.blockers.includes('independent-review-missing')));
});

test('zero-gap profile catalog reports standards-ready without mandatory independent review',()=>{
  assert.ok(engineeringProfileStatus().every((profile)=>profile.standardsReady===true));
  assert.ok(engineeringProfileStatus().every((profile)=>profile.constructionReady===true));
});
