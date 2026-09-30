import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicReferenceProject } from '../src/demo/public-reference-project.js';
import { setField,hydrateProject } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { shell } from '../src/ui/panels.js';
import { standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { guidedDefaultValues } from '../src/ui/guided-calculator.js';

test('technical parameters are part of the persisted project schema and hydrate into old projects',()=>{
  const old={id:'old',name:'Old project'};
  const hydrated=hydrateProject(old);
  assert.equal(hydrated.technicalModel.slabThicknessMm.value,120);
  assert.equal(hydrated.technicalModel.beamDepthMm.value,400);
  assert.equal(hydrated.technicalModel.footingLengthM.value,1.4);
});

test('editing member parameters recalculates member schedule and material takeoff',()=>{
  let p=createPublicReferenceProject();
  const before=runPlanningWorkflow(p).results.technicalPackage;
  p=setField(p,'technicalModel.slabThicknessMm',150);
  p=setField(p,'technicalModel.beamDepthMm',500);
  p=setField(p,'technicalModel.footingLengthM',1.8);
  p=setField(p,'technicalModel.footingWidthM',1.8);
  const after=runPlanningWorkflow(p).results.technicalPackage;
  assert.equal(after.version,'1.0');
  assert.equal(after.model.structural.slabs[0].thicknessMm,150);
  assert.equal(after.model.structural.beams[0].hMm,500);
  assert.equal(after.model.structural.foundations[0].lengthM,1.8);
  assert.ok(after.takeoff.summary.concreteM3>before.takeoff.summary.concreteM3);
  assert.ok(after.boq.pricedSubtotalVnd>before.boq.pricedSubtotalVnd);
  assert.equal(after.softwareCompletion.ready,true);
});

test('technical UI exposes editable preliminary parameters and package completion',()=>{
  const p=createPublicReferenceProject();
  const workflow=runPlanningWorkflow(p);
  const html=shell({
    project:p,projects:[p],workflow,activeView:'technical',
    calculatorCapabilities:standardCalculatorCapabilities(),
    calculatorState:{},guidedState:{action:'loads.permanent',values:guidedDefaultValues('loads.permanent')},evidenceState:{}
  });
  assert.ok(html.includes('Tùy chỉnh phương án nâng cao'));
  assert.ok(html.includes('technicalModel.slabThicknessMm'));
  assert.ok(html.includes('technicalModel.footingLengthM'));
  assert.ok(html.includes('Trạng thái kỹ thuật & các việc còn thiếu'));
});
