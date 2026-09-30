import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject,setField } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { buildProjectReport,reportToHtml } from '../src/report/project-report.js';

test('technical report carries standards version, conformance, benchmarks and project evidence digest',()=>{
  let p=createProject({name:'Audit report'});
  p=setField(p,'location.province','TP.HCM');
  p=setField(p,'land.widthM',5);
  p=setField(p,'land.lengthM',20);
  const workflow=runPlanningWorkflow(p);
  const report=buildProjectReport(p,workflow);
  assert.equal(report.standardStatusHealth.healthy,true);
  assert.ok(report.standardConformance.length>=9);
  assert.equal(report.standardReferenceBenchmarks.length,5);
  assert.equal(report.engineeringProjectEvidence.length,5);
  assert.ok(report.engineeringProjectEvidence.every(x=>x.digest.length===64));
  const html=reportToHtml(report);
  assert.ok(html.includes('Tình trạng phiên bản tiêu chuẩn'));
  assert.ok(html.includes('Golden reference benchmarks'));
});
