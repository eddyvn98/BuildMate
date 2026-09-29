import test from 'node:test';
import assert from 'node:assert/strict';
import { addActual, createLedger, removeActual, summarizeActuals } from '../src/engine/actuals.js';
import { createDesignVersion, addDesignVersion } from '../src/engine/design-versions.js';
import { createProject, setField, hydrateProject } from '../src/engine/project.js';
import { buildProjectPriceBook } from '../src/engine/project-price-book.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { buildProjectReport, quantitiesToCsv, reportToHtml } from '../src/report/project-report.js';

function readyProject() {
  let project = createProject({ id: 'report-project', name: 'Nhà test' });
  project = setField(project, 'location.province', 'TP.HCM');
  project = setField(project, 'land.widthM', 4);
  project = setField(project, 'land.lengthM', 15);
  project = setField(project, 'budget.totalVnd', 2_000_000_000);
  return project;
}

test('old project shapes hydrate into current fields', () => {
  const hydrated = hydrateProject({ id: 'old', name: 'Old', land: { widthM: { value: 4, state: 'confirmed' } } });
  assert.equal(hydrated.land.widthM.value, 4);
  assert.ok(hydrated.engineering);
  assert.ok(hydrated.mep);
  assert.ok(hydrated.pricing);
  assert.deepEqual(hydrated.designVersions, []);
});

test('project price overrides retain provenance', () => {
  let project = readyProject();
  project = setField(project, 'pricing.items.rebar', 16000);
  project = setField(project, 'pricing.sourceLabel', 'Báo giá cửa hàng');
  project = setField(project, 'pricing.effectiveDate', '2026-09-29');
  const book = buildProjectPriceBook(project);
  assert.equal(book.items.rebar, 16000);
  assert.equal(book.overrides.rebar.source, 'Báo giá cửa hàng');
});

test('design version snapshots current result', () => {
  const project = readyProject();
  const workflow = runPlanningWorkflow(project);
  const version = createDesignVersion(project, workflow, 'PA test');
  const updated = addDesignVersion(project, version);
  assert.equal(updated.designVersions.length, 1);
  assert.equal(version.label, 'PA test');
  assert.ok(version.summary.estimatedBudgetVnd > 0);
});

test('actual ledger can add, summarize and remove entries', () => {
  let ledger = createLedger();
  ledger = addActual(ledger, { id: 'one', amountVnd: 100, status: 'paid' });
  ledger = addActual(ledger, { id: 'two', amountVnd: 50, status: 'committed' });
  assert.equal(summarizeActuals(ledger, 500).remainingVnd, 350);
  ledger = removeActual(ledger, 'one');
  assert.equal(ledger.entries.length, 1);
});

test('project report contains assumptions, pricing, engineering and exportable quantities', () => {
  const project = readyProject();
  const workflow = runPlanningWorkflow(project);
  const report = buildProjectReport(project, workflow);
  assert.equal(report.project.name, 'Nhà test');
  assert.ok(report.assumptions.length > 0);
  assert.equal(report.engineering.status, 'ready');
  assert.ok(report.priceBook);
  assert.ok(reportToHtml(report).includes('BuildMate'));
  assert.ok(quantitiesToCsv(report).includes('qty.concrete'));
});
