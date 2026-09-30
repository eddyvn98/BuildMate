import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { projectEngineeringReadiness,allTownhouseEngineeringReady } from '../src/engine/project-readiness.js';

test('standard coverage is ready but project readiness waits for project calculation runs',()=>{
  const p=createProject();
  const status=projectEngineeringReadiness(p);
  assert.equal(status.length,6);
  assert.ok(status.every(x=>x.standardsReady===true));
  assert.ok(status.every(x=>x.constructionReady===false));
  assert.equal(allTownhouseEngineeringReady(p).ready,false);
});

test('ready calculation runs make the exact standards-backed project profiles ready',()=>{
  const p=createProject();
  p.engineeringCalculations=[4,5,6,7,8,12].map(issue=>({id:'run-'+issue,issue,status:'ready'}));
  const status=projectEngineeringReadiness(p);
  assert.ok(status.every(x=>x.constructionReady===true));
  assert.equal(allTownhouseEngineeringReady(p).ready,true);
});

test('a blocked evidence-dependent calculation keeps its profile blocked',()=>{
  const p=createProject();
  p.engineeringCalculations=[{id:'run-6',issue:6,status:'blocked'}];
  const row=projectEngineeringReadiness(p).find(x=>x.issue===6);
  assert.equal(row.constructionReady,false);
  assert.ok(row.blockers.includes('project-input-or-evidence-blocked'));
});
