import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicReferenceProject,publicReferenceCalculationInputs } from '../src/demo/public-reference-project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { runStandardCalculation } from '../src/engine/engineering/standards-calculator.js';
import { createEngineeringCalculationRecord } from '../src/engine/engineering-calculation-record.js';
import { buildProjectReport,quantitiesToCsv } from '../src/report/project-report.js';
import { shell } from '../src/ui/panels.js';
import { standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { guidedDefaultValues } from '../src/ui/guided-calculator.js';

function demoWithCalculations(){
  const p=createPublicReferenceProject();
  for(const [action,input] of publicReferenceCalculationInputs()){
    const output=runStandardCalculation(p,{action,input});
    p.engineeringCalculations.push(createEngineeringCalculationRecord({
      action,issue:output.issue,standard:output.standard,input,output,engineVersion:'0.9.0'
    }));
  }
  return p;
}

test('4x16 public demo generates explicit member schedules instead of only area coefficients',()=>{
  const p=demoWithCalculations();
  const w=runPlanningWorkflow(p);
  const pack=w.results.technicalPackage;
  assert.equal(pack.version,'1.0');
  assert.equal(pack.model.grid.longitudinalBays,4);
  assert.equal(pack.model.grid.transverseBays,1);
  assert.equal(pack.model.grid.columnGridPoints,10);
  assert.equal(pack.model.structural.slabs.length,3);
  assert.equal(pack.model.structural.beams[0].quantity,39);
  assert.equal(pack.model.structural.columns.reduce((a,x)=>a+x.quantity,0),30);
  assert.equal(pack.model.structural.foundations[0].quantity,10);
  assert.equal(pack.calculationCoverage.percent,100);
});

test('technical takeoff contains concrete, formwork and rebar split by diameter',()=>{
  const pack=runPlanningWorkflow(demoWithCalculations()).results.technicalPackage;
  assert.ok(pack.takeoff.summary.concreteM3>0);
  assert.ok(pack.takeoff.summary.rebarKg>0);
  assert.ok(pack.takeoff.summary.formworkM2>0);
  const diameters=pack.takeoff.items.filter(x=>x.kind==='rebar').map(x=>x.diameterMm).sort((a,b)=>a-b);
  assert.ok(diameters.includes(8));
  assert.ok(diameters.includes(10));
  assert.ok(diameters.includes(12));
  assert.ok(diameters.includes(16));
  assert.ok(diameters.includes(18));
  assert.ok(pack.takeoff.items.some(x=>x.label==='Cáp Cu 4 mm²'));
  assert.ok(pack.takeoff.items.some(x=>x.label==='Ống PPR DN20'));
});

test('technical BOQ prices known items and leaves unknown materials explicitly unpriced',()=>{
  const pack=runPlanningWorkflow(demoWithCalculations()).results.technicalPackage;
  assert.ok(pack.boq.pricedSubtotalVnd>0);
  assert.ok(pack.boq.rows.some(x=>x.priceCode==='rebar'&&x.unitPriceVnd>0));
  assert.ok(pack.boq.rows.some(x=>x.priceCode==='concrete'&&x.unitPriceVnd>0));
  assert.ok(pack.boq.unpricedCount>0);
  assert.ok(pack.boq.unpricedItems.some(x=>x.label.includes('Cốp pha')));
});

test('technical package appears in homeowner UI, report and BOQ CSV',()=>{
  const p=demoWithCalculations();
  const workflow=runPlanningWorkflow(p);
  const html=shell({
    project:p,projects:[p],workflow,activeView:'technical',
    calculatorCapabilities:standardCalculatorCapabilities(),
    calculatorState:{},guidedState:{action:'loads.permanent',values:guidedDefaultValues('loads.permanent')},evidenceState:{}
  });
  assert.ok(html.includes('Tổng quan căn nhà'));
  assert.ok(html.includes('Xem vật tư chi tiết'));
  assert.ok(html.includes('Xem BOQ đầy đủ'));
  assert.ok(html.includes('Xem bảng cấu kiện đầy đủ'));
  assert.ok(html.includes('Giằng móng'));
  assert.ok(html.includes('4Ø18'));
  assert.ok(html.includes('đai Ø8a150'));
  const report=buildProjectReport(p,workflow);
  assert.equal(report.technicalPackage.version,'1.0');
  const csv=quantitiesToCsv(report);
  assert.ok(csv.includes('unit_price_vnd'));
  assert.ok(csv.includes('Thép Ø18'));
  assert.ok(csv.includes('Cáp Cu 4 mm²'));
});
