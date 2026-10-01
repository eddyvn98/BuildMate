import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicReferenceProject } from '../src/demo/public-reference-project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { shell } from '../src/ui/panels.js';
import { standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { guidedDefaultValues } from '../src/ui/guided-calculator.js';

function renderTechnical(){
  const p=createPublicReferenceProject();
  const workflow=runPlanningWorkflow(p);
  return shell({
    project:p,projects:[p],workflow,activeView:'technical',
    calculatorCapabilities:standardCalculatorCapabilities(),
    calculatorState:{},
    guidedState:{action:'loads.permanent',values:guidedDefaultValues('loads.permanent')},
    evidenceState:{},
  });
}

test('normal technical view starts with four homeowner-facing summaries',()=>{
  const html=renderTechnical();
  for(const label of ['Cấu kiện chính','Vật tư chính','Điện & nước','Chi phí kỹ thuật']) {
    assert.ok(html.includes(label),label);
  }
  assert.ok(html.includes('Dầm chính'));
  assert.ok(html.includes('Cột tầng dưới'));
  assert.ok(html.includes('Móng'));
});

test('expert-density content remains available but behind progressive disclosure',()=>{
  const html=renderTechnical();
  assert.ok(html.includes('<summary>Xem bảng cấu kiện đầy đủ</summary>'));
  assert.ok(html.includes('<summary>Xem vật tư chi tiết</summary>'));
  assert.ok(html.includes('<summary>Xem điện & nước chi tiết</summary>'));
  assert.ok(html.includes('<summary>Xem BOQ đầy đủ</summary>'));
  assert.ok(html.includes('<summary>Tùy chỉnh phương án nâng cao</summary>'));
  assert.ok(html.includes('<summary>Các dữ liệu còn cần bổ sung</summary>'));
  assert.ok(!html.includes('<details class="advanced" open>'));
});

test('technical UI replaces jargon-heavy section labels with homeowner language',()=>{
  const html=renderTechnical();
  assert.ok(html.includes('Sơ bộ'));
  assert.ok(html.includes('Nhóm đã có tính toán'));
  assert.ok(html.includes('dòng chưa có đơn giá'));
  assert.ok(!html.includes('preliminary-technical-package'));
  assert.ok(!html.includes('Calculation coverage'));
});
