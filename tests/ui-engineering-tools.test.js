import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { calculatorExample } from '../src/ui/engineering-tools.js';
import { shell } from '../src/ui/panels.js';

test('local UI exposes standards calculator and project evidence panel',()=>{
  const p=createProject();
  p.location.province.value='TP.HCM';
  p.land.widthM.value=5;
  p.land.lengthM.value=20;
  const workflow=runPlanningWorkflow(p);
  const html=shell({
    project:p,projects:[p],workflow,
    calculatorCapabilities:standardCalculatorCapabilities(),
    calculatorState:{action:'water.design-flow',inputText:JSON.stringify(calculatorExample('water.design-flow')),output:null,error:null},
    evidenceState:{error:null},
  });
  assert.ok(html.includes('TCVN / QCVN Calculator'));
  assert.ok(html.includes('water.design-flow'));
  assert.ok(html.includes('Project engineering evidence'));
  assert.ok(!html.includes('Tĩnh tải giả định'));
  assert.ok(html.includes('Loại khu vực hoạt tải TCVN 2737'));
});
