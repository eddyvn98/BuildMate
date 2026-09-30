import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, setField } from '../src/engine/project.js';
import { calculateAreas } from '../src/engine/area.js';
import { estimateQuantities } from '../src/engine/quantity.js';
import { calculateBudget } from '../src/engine/budget.js';
import { buildCashflow } from '../src/engine/cashflow.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { analyzeBudgetFit } from '../src/engine/optimizer.js';
import { buildAlternatives } from '../src/engine/alternatives.js';
import { overridePriceBook } from '../src/engine/price-book.js';
import { createLedger, addActual, summarizeActuals } from '../src/engine/actuals.js';
import { canIssueConstructionReady } from '../src/engine/standards.js';

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

test('budget optimizer only proposes approval-required non-safety tradeoffs', () => {
  const fit = analyzeBudgetFit({ targetVnd: 2_400_000_000, estimatedVnd: 3_000_000_000 });
  assert.ok(fit.actions.length > 0);
  assert.ok(fit.actions.every((action) => action.requiresApproval));
  assert.ok(fit.actions.every((action) => !action.category.includes('safety')));
});

test('alternatives preserve locked safety scope', () => {
  const alternatives = buildAlternatives([
    { key: 'economy', label: 'Tiết kiệm', total: 2_500_000_000 },
    { key: 'balanced', label: 'Cân bằng', total: 3_000_000_000 },
  ], 2_800_000_000);
  assert.equal(alternatives[0].targetStatus, 'within-budget');
  assert.equal(alternatives[1].targetStatus, 'over-budget');
  assert.ok(alternatives.every((item) => item.lockedSafetyScope));
});

test('price override records provenance', () => {
  const book = overridePriceBook({ id: 'base', items: { rebar: 17000 } }, { rebar: 16500 }, { sourceLabel: 'supplier quote' });
  assert.equal(book.items.rebar, 16500);
  assert.equal(book.overrides.rebar.source, 'supplier quote');
  assert.equal(book.sourceLabel, 'supplier quote');
});

test('actual-cost ledger reports variance', () => {
  let ledger = createLedger();
  ledger = addActual(ledger, { id: 'a', amountVnd: 100_000_000, status: 'paid' });
  ledger = addActual(ledger, { id: 'b', amountVnd: 50_000_000, status: 'committed' });
  const summary = summarizeActuals(ledger, 500_000_000);
  assert.equal(summary.actualVnd, 150_000_000);
  assert.equal(summary.remainingVnd, 350_000_000);
});

test('formula-implemented standards modules can issue standards-backed results', () => {
  assert.equal(canIssueConstructionReady('rc-design'), true);
});
