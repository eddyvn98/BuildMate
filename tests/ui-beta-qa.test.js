import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPublicReferenceProject } from '../src/demo/public-reference-project.js';
import { functionalPlan } from '../src/ui/render.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { shell } from '../src/ui/panels.js';
import { standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { guidedDefaultValues } from '../src/ui/guided-calculator.js';

test('public demo functional plan uses sourced floor program instead of generic allocation',()=>{
  const p=createPublicReferenceProject();
  const plan=functionalPlan(p);
  assert.deepEqual(plan.map(x=>x.name),['Tầng 1','Tầng 2','Tầng 3']);
  assert.ok(plan[0].rooms.includes('1 phòng ngủ'));
  assert.ok(plan[1].rooms.includes('2 phòng ngủ'));
  assert.ok(plan[2].rooms.includes('1 phòng ngủ'));
  assert.ok(plan[2].rooms.includes('Phòng thờ'));
});

test('overview labels progress as BuildMate workflow and explicitly avoids construction-approval wording',()=>{
  const p=createPublicReferenceProject();
  const html=shell({
    project:p,projects:[p],workflow:runPlanningWorkflow(p),activeView:'overview',
    calculatorCapabilities:standardCalculatorCapabilities(),
    calculatorState:{},
    guidedState:{action:'loads.permanent',values:guidedDefaultValues('loads.permanent')},
    evidenceState:{},
  });
  assert.ok(html.includes('Luồng BuildMate'));
  assert.ok(html.includes('không phải phê duyệt'));
  assert.ok(!html.includes('A→Z ready'));
  assert.ok(html.includes('aria-current="page"'));
  assert.ok(html.includes('aria-label="Thêm tác vụ"'));
});

test('mobile CSS keeps demo A-to-Z action accessible and adds keyboard focus visibility',async()=>{
  const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.ok(css.includes(':focus-visible'));
  assert.ok(css.includes('.top-actions{justify-content:flex-start;width:100%;overflow-x:auto;flex-wrap:nowrap'));
  assert.ok(!css.includes('.top-actions #run-demo-a2z{display:none}'));
});
