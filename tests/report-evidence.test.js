import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject,setField } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { buildProjectReport,reportToHtml } from '../src/report/project-report.js';
import { STANDARD_CLAUSE_COVERAGE } from '../src/engine/standards/coverage.js';

test('project report exposes standards coverage and evidence audit',()=>{
  let project=createProject({name:'Evidence report'});
  project=setField(project,'location.province','TP.HCM');
  project=setField(project,'land.widthM',5);
  project=setField(project,'land.lengthM',20);
  const workflow=runPlanningWorkflow(project);
  const report=buildProjectReport(project,workflow);
  assert.equal(report.standardCoverage.length,6);
  assert.ok(Array.isArray(report.engineeringEvidenceAudit));
  assert.ok(reportToHtml(report).includes('Phạm vi điều khoản tiêu chuẩn'));
});

test('every engineering issue has machine-readable implemented coverage and explicit gap/external-requirement arrays',()=>{
  for (const issue of [4,5,6,7,8,12]) {
    const item=STANDARD_CLAUSE_COVERAGE.find(x=>x.issue===issue);
    assert.ok(item);
    assert.ok(item.implemented.length>0);
    assert.ok(Array.isArray(item.pending));
    assert.ok(Array.isArray(item.externalRequirements ?? []));
  }
});
