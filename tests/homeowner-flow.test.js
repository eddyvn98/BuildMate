import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { interpretHomeownerText } from '../src/ai/intake.js';
import { homeownerNextActions } from '../src/engine/homeowner-next-actions.js';
import { createEngineeringCalculationRecord } from '../src/engine/engineering-calculation-record.js';
import { runStandardCalculation } from '../src/engine/engineering/standards-calculator.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { createProject } from '../src/engine/project.js';
import { createPublicReferenceProject,publicReferenceCalculationInputs } from '../src/demo/public-reference-project.js';
import { shell } from '../src/ui/panels.js';

test('homeowner intake understands the default natural-language example',()=>{
  const parsed=interpretHomeownerText('đất 4x16 ở TP.HCM, 5 người, 3 tầng, 4 phòng ngủ, ngân sách 1,5 tỷ');
  const values=Object.fromEntries(parsed.updates.map(item=>[item.path,item.value]));
  assert.equal(values['land.widthM'],4);
  assert.equal(values['land.lengthM'],16);
  assert.equal(values['location.province'],'TP.HCM');
  assert.equal(values['household.people'],5);
  assert.equal(values['design.storeys'],3);
  assert.equal(values['household.bedrooms'],4);
  assert.equal(values['budget.totalVnd'],1_500_000_000);
});

test('project view shows a clear current or next journey action',()=>{
  const p=createProject();
  const html=shell({project:p,projects:[p],workflow:runPlanningWorkflow(p),activeView:'project'});
  assert.ok(html.includes('flow-next-card'));
  assert.ok(html.includes('BƯỚC HIỆN TẠI'));
  assert.ok(html.includes('Hoàn thiện thông tin đầu vào'));
});

test('completed A-to-Z project leads to report instead of looping back to technical view',()=>{
  const p=createPublicReferenceProject();
  p.engineeringCalculations=[];
  for (const [action,input] of publicReferenceCalculationInputs()) {
    const output=runStandardCalculation(p,{action,input});
    p.engineeringCalculations.push(createEngineeringCalculationRecord({
      action,issue:output.issue,standard:output.standard,input,output,engineVersion:'1.0.0',
    }));
  }
  const action=homeownerNextActions(p,{limit:1})[0];
  assert.equal(action.id,'report');
  assert.equal(action.view,'report');
  assert.ok(action.title.includes('báo cáo'));
});

test('report exposes final HTML and BOQ export actions',()=>{
  const p=createPublicReferenceProject();
  const html=shell({project:p,projects:[p],workflow:runPlanningWorkflow(p),activeView:'report'});
  assert.ok(html.includes('Xuất hồ sơ dự án'));
  assert.ok(html.includes('data-report-export="html"'));
  assert.ok(html.includes('data-report-export="csv"'));
});

test('new project action opens intake instead of adding an overview detour',async()=>{
  const source=await readFile(new URL('../src/ui/app.js',import.meta.url),'utf8');
  assert.ok(source.includes("project=createAndSave(); activeView='project'; render();"));
});


test('project inputs render compact labels with numeric alignment hooks',()=>{
  const p=createProject();
  const html=shell({project:p,projects:[p],workflow:runPlanningWorkflow(p),activeView:'project'});
  assert.ok(html.includes('form-grid compact-form'));
  assert.ok(html.includes('class="field-label"'));
  assert.ok(html.includes('numeric-field'));
});
