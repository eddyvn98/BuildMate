import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicReferenceProject } from '../src/demo/public-reference-project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { shell } from '../src/ui/panels.js';
import { icon } from '../src/ui/common.js';
import { standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { guidedDefaultValues } from '../src/ui/guided-calculator.js';

test('shared icon helper renders accessible-safe inline svg',()=>{
  const svg=icon('home');
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('aria-hidden="true"'));
  assert.ok(svg.includes('viewBox="0 0 24 24"'));
});

test('shell uses svg icons for navigation and compact top actions',()=>{
  const project=createPublicReferenceProject();
  const html=shell({
    project,
    projects:[project],
    workflow:runPlanningWorkflow(project),
    activeView:'overview',
  });

  for(const label of ['Tổng quan','Thông tin nhà','Tính toán','Hồ sơ kỹ thuật','Giá & ngân sách','Báo cáo']) {
    assert.ok(html.includes('aria-label="'+label+'"'),label);
  }
  for(const action of ['Nạp demo 4×16','Chạy demo A→Z','Dự án mới','Thêm tác vụ']) {
    assert.ok(html.includes('aria-label="'+action+'"'),action);
  }
  assert.ok(html.includes('class="ui-icon"'));
  assert.ok(!html.includes('⌂'));
  assert.ok(!html.includes('▤'));
  assert.ok(!html.includes('⌁'));
});


test('project, engineering and report primary actions use compact svg controls',()=>{
  const project=createPublicReferenceProject();
  const workflow=runPlanningWorkflow(project);
  const common={
    project,projects:[project],workflow,
    calculatorCapabilities:standardCalculatorCapabilities(),
    calculatorState:{action:'water.design-flow',inputText:'{}'},
    guidedState:{action:'loads.permanent',values:guidedDefaultValues('loads.permanent')},
    evidenceState:{},
  };
  const projectHtml=shell({...common,activeView:'project'});
  assert.ok(projectHtml.includes('aria-label="Phân tích thông tin"'));
  assert.ok(projectHtml.includes('class="icon-button primary-icon"'));

  const engineeringHtml=shell({...common,activeView:'engineering'});
  for(const label of ['Tính theo tiêu chuẩn','Chạy raw calculator','Thêm evidence']) {
    assert.ok(engineeringHtml.includes('aria-label="'+label+'"'),label);
  }

  const reportHtml=shell({...common,activeView:'report'});
  for(const label of ['Lưu phương án hiện tại','Thêm chi phí']) {
    assert.ok(reportHtml.includes('aria-label="'+label+'"'),label);
  }
});
