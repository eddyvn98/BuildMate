import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { runStandardCalculation } from '../src/engine/engineering/standards-calculator.js';
import { buildGuidedInput,guidedCalculatorSpecs,guidedDefaultValues } from '../src/ui/guided-calculator.js';

test('guided calculator exposes one homeowner flow for each tracked domain',()=>{
  const ids=guidedCalculatorSpecs().map(x=>x.id);
  assert.deepEqual(ids,[
    'loads.permanent','rc.beam','foundation.shallow-settlement',
    'electrical.xlpe-cable','water.design-flow','hvac.outdoor-air'
  ]);
});

test('guided defaults produce valid standard calculations except foundation source gate',()=>{
  const p=createProject();
  for (const action of ['loads.permanent','rc.beam','electrical.xlpe-cable','water.design-flow','hvac.outdoor-air']) {
    const input=buildGuidedInput(action,guidedDefaultValues(action));
    const output=runStandardCalculation(p,{action,input});
    assert.equal(output.status,'ready',action);
  }
});

test('foundation guided flow requires an explicit geotechnical source',()=>{
  const defaults=guidedDefaultValues('foundation.shallow-settlement');
  assert.throws(()=>buildGuidedInput('foundation.shallow-settlement',defaults),/nguồn địa kỹ thuật/i);
  const input=buildGuidedInput('foundation.shallow-settlement',{
    ...defaults,geotechSource:'Borehole BH-01 / laboratory report',
  });
  const output=runStandardCalculation(createProject(),{action:'foundation.shallow-settlement',input});
  assert.equal(output.status,'ready');
  assert.ok(output.result.value>0);
});
