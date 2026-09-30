import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject,setField } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';

function baseProject(){
  let p=createProject();
  p=setField(p,'location.province','TP.HCM');
  p=setField(p,'land.widthM',5);
  p=setField(p,'land.lengthM',20);
  return p;
}

test('engineering preview never emits conceptual foundation area or pile count as design result',()=>{
  let p=baseProject();
  p=setField(p,'engineering.deadLoadKnM2',4);
  p=setField(p,'engineering.deadLoadSource','project material takeoff');
  p=setField(p,'engineering.allowableBearingKpa',180);
  p=setField(p,'engineering.allowableBearingSource','geotechnical report GEO-01');
  p=setField(p,'engineering.pileWorkingCapacityKn',300);
  p=setField(p,'engineering.pileCapacitySource','TCVN 10304 calculation P-01');
  const eng=runPlanningWorkflow(p).results.engineering;
  assert.equal(eng.modules.structure.status,'ready-review');
  assert.equal(eng.modules.foundation.status,'input-ready');
  assert.equal(eng.modules.foundation.result,undefined);
  assert.equal(eng.modules.pile.status,'input-ready');
  assert.equal(eng.modules.pile.result,undefined);
  assert.ok(eng.modules.foundation.message.includes('TCVN 9362'));
  assert.ok(eng.modules.pile.message.includes('TCVN 10304'));
});

test('sourced dead and live load traces are marked confirmed in preview',()=>{
  let p=baseProject();
  p=setField(p,'engineering.deadLoadKnM2',4);
  p=setField(p,'engineering.deadLoadSource','project material takeoff');
  const structure=runPlanningWorkflow(p).results.engineering.modules.structure;
  assert.equal(structure.result.inputs.find(x=>x.key==='deadLoad').state,'confirmed');
  assert.equal(structure.result.inputs.find(x=>x.key==='liveLoad').state,'confirmed');
});


test('HVAC preview becomes standards-backed only after a ready TCVN 5687 calculation record exists',()=>{
  const p=baseProject();
  let hvac=runPlanningWorkflow(p).results.engineering.modules.hvac;
  assert.equal(hvac.status,'blocked');
  assert.ok(hvac.message.includes('TCVN 5687:2024'));

  p.engineeringCalculations=[{
    id:'hvac-1',issue:12,status:'ready',action:'hvac.outdoor-air',
    standard:'TCVN 5687:2024 6.1.5 + Appendix E/G',
    result:{value:70,unit:'m³/h'},calculationDigest:'a'.repeat(64),projectEvidenceDigest:'b'.repeat(64),
  }];
  hvac=runPlanningWorkflow(p).results.engineering.modules.hvac;
  assert.equal(hvac.status,'standards-backed');
  assert.equal(hvac.result.value,70);
  assert.equal(hvac.calculationId,'hvac-1');
});
