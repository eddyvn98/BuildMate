import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { runStandardCalculation,standardCalculatorCapabilities } from '../src/engine/engineering/standards-calculator.js';
import { createEngineeringCalculationRecord } from '../src/engine/engineering-calculation-record.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { shell } from '../src/ui/panels.js';
import { calculatorExample } from '../src/ui/engineering-tools.js';
import { guidedDefaultValues } from '../src/ui/guided-calculator.js';

test('local engineering calculation history renders human explanation and immutable digest',()=>{
  const p=createProject();
  p.location.province.value='TP.HCM';
  p.land.widthM.value=5;
  p.land.lengthM.value=20;
  const input={fixtureEquivalentUnits:20,litersPerPersonDay:150};
  const output=runStandardCalculation(p,{action:'water.design-flow',input});
  p.engineeringCalculations=[createEngineeringCalculationRecord({id:'local-1',action:'water.design-flow',issue:8,standard:output.standard,input,output})];
  const html=shell({
    project:p,projects:[p],workflow:runPlanningWorkflow(p),activeView:'engineering',
    calculatorCapabilities:standardCalculatorCapabilities(),
    calculatorState:{action:'water.design-flow',inputText:JSON.stringify(calculatorExample('water.design-flow')),output,error:null},
    guidedState:{action:'water.design-flow',values:guidedDefaultValues('water.design-flow'),output:null,error:null,record:null},
    evidenceState:{error:null},
  });
  assert.ok(html.includes('Lịch sử tính toán'));
  assert.ok(html.includes('Lưu lượng nước thiết kế'));
  assert.ok(html.includes(p.engineeringCalculations[0].calculationDigest.slice(0,20)));
});
