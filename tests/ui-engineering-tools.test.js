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
  assert.ok(html.includes('Việc nên làm ngay'));
  assert.ok(html.includes('Nạp demo 4×16'));
  assert.ok(html.includes('class="project-name-input"'));
  assert.ok(html.includes('BƯỚC TIẾP THEO'));
});

test('engineering view exposes guided calculators and keeps raw JSON in expert mode',()=>{
  const {html}=ctx('engineering');
  assert.ok(html.includes('Chọn phép tính cần kiểm tra'));
  assert.ok(html.includes('Lưu lượng nước thiết kế'));
  assert.ok(html.includes('Chế độ chuyên gia'));
  assert.ok(html.includes('Raw standards calculator'));
  assert.ok(html.includes('water.design-flow'));
  assert.ok(!html.includes('Tĩnh tải giả định'));
});


test('pricing view uses homeowner language and hides internal market terminology',()=>{
  const {html}=ctx('pricing');
  assert.ok(html.includes('Chi phí xây nhà dự kiến'));
  assert.ok(html.includes('Khoảng tham khảo'));
  assert.ok(html.includes('Tôi đã có báo giá riêng từ nhà thầu'));
  assert.ok(!html.includes('Quick market price'));
  assert.ok(!html.includes(' confidence'));
  assert.ok(!html.includes('snapshot fresh'));
});

test('technical view distinguishes planning package from construction readiness',()=>{
  const {html}=ctx('technical');
  assert.ok(html.includes('Hồ sơ này dùng để lập kế hoạch sơ bộ'));
  assert.ok(html.includes('Nhóm đã có tính toán'));
  assert.ok(html.includes('không phải mức sẵn sàng thi công'));
  assert.ok(html.includes('Các dữ liệu còn cần bổ sung'));
});
