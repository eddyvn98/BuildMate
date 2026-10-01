import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { calculatorExample } from '../src/ui/engineering-tools.js';
import { guidedDefaultValues } from '../src/ui/guided-calculator.js';
import { shell } from '../src/ui/panels.js';

function ctx(activeView='overview'){
  const p=createProject();
  p.location.province.value='TP.HCM';
  p.land.widthM.value=5;
  p.land.lengthM.value=20;
  const workflow=runPlanningWorkflow(p);
  return {
    p,
    html:shell({
      project:p,projects:[p],workflow,activeView,
      calculatorCapabilities:standardCalculatorCapabilities(),
      calculatorState:{action:'water.design-flow',inputText:JSON.stringify(calculatorExample('water.design-flow')),output:null,error:null},
      guidedState:{action:'water.design-flow',values:guidedDefaultValues('water.design-flow'),output:null,error:null,record:null},
      evidenceState:{error:null},
    }),
  };
}

test('homeowner shell exposes journey navigation and prioritized next actions',()=>{
  const {html}=ctx('overview');
  assert.ok(html.includes('BuildMate AI'));
  assert.ok(html.includes('Nhà của tôi'));
  assert.ok(html.includes('Hôm nay nên làm gì?'));
  assert.ok(html.includes('Nạp demo 4×16'));
});

test('engineering view exposes guided calculators and keeps raw JSON in expert mode',()=>{
  const {html}=ctx('engineering');
  assert.ok(html.includes('Tính mà không cần JSON'));
  assert.ok(html.includes('Lưu lượng nước thiết kế'));
  assert.ok(html.includes('Chế độ chuyên gia'));
  assert.ok(html.includes('Raw standards calculator'));
  assert.ok(html.includes('water.design-flow'));
  assert.ok(!html.includes('Tĩnh tải giả định'));
});
