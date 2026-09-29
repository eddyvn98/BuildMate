import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, setField } from '../src/engine/project.js';
import { calculateAreas } from '../src/engine/area.js';
import { estimateQuantities } from '../src/engine/quantity.js';
import { calculateBudget } from '../src/engine/budget.js';
import { buildCashflow } from '../src/engine/cashflow.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';

function readyProject() {
  let p = createProject({ id: 'test-project' });
  p = setField(p, 'location.province', 'TP.HCM');
  p = setField(p, 'land.widthM', 4);
  p = setField(p, 'land.lengthM', 15);
  p = setField(p, 'design.storeys', 3);
  p = setField(p, 'design.footprintRatio', 0.85);
  return p;
}

test('area calculation is deterministic', () => {
  const areas = calculateAreas(readyProject());
  assert.equal(areas.landArea.value, 60);
  assert.equal(areas.footprint.value, 51);
  assert.equal(areas.floorArea.value, 153);
});

test('workflow blocks when dimensions are missing', () => {
  const output = runPlanningWorkflow(createProject({ id: 'blocked' }));
  assert.equal(output.status, 'blocked');
  assert.ok(output.issues.some((issue) => issue.path === 'land.widthM'));
});

test('quantity outputs include warnings and trace metadata', () => {
  const quantities = estimateQuantities({ floorAreaM2: 153, bathrooms: 2 });
  assert.equal(quantities.profile, 'townhouse-indicative-v0.1');
  assert.ok(quantities.items.every((item) => item.engineVersion && item.formulaId));
  assert.ok(quantities.items.every((item) => item.warnings.length > 0));
  assert.equal(quantities.items[0].inputs[0].value, 153);
});

test('budget scenarios increase from economy to comfort', () => {
  const quantities = estimateQuantities({ floorAreaM2: 153, bathrooms: 2 });
  const budgets = calculateBudget({ floorAreaM2: 153, quantities });
  assert.equal(budgets.length, 3);
  assert.ok(budgets[0].total < budgets[1].total);
  assert.ok(budgets[1].total < budgets[2].total);
});

test('cashflow reconciles exactly to total', () => {
  const total = 3_000_000_000;
  const flow = buildCashflow(total);
  assert.equal(flow.at(-1).accumulated, total);
  assert.equal(flow.reduce((sum, item) => sum + item.amount, 0), total);
});
