import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { standardCalculatorCapabilities,runStandardCalculation } from '../src/engine/engineering/standards-calculator.js';
import { createEngineeringEvidenceRecord } from '../src/engine/engineering-evidence.js';

test('standards calculator exposes high-level actions across the townhouse engineering scope',()=>{
  const caps=standardCalculatorCapabilities();
  assert.ok(caps.length>=20);
  assert.deepEqual([...new Set(caps.map(x=>x.issue))].sort((a,b)=>a-b),[4,5,6,7,8,12]);
});

test('standard calculation can run a source-independent TCVN calculation',()=>{
  const p=createProject();
  const out=runStandardCalculation(p,{action:'water.design-flow',input:{fixtureEquivalentUnits:20,litersPerPersonDay:150}});
  assert.equal(out.status,'ready');
  assert.equal(out.result.value,1.963);
  assert.equal(out.result.unit,'L/s');
});

test('SPT calculation is blocked until required geotechnical evidence exists',()=>{
  const p=createProject();
  const blocked=runStandardCalculation(p,{action:'foundation.pile-spt-capacity',input:{}});
  assert.equal(blocked.status,'blocked');
  assert.deepEqual(blocked.evidence.missingTypes.sort(),['SPT','borehole-log','laboratory-soil-tests'].sort());

  p.engineeringEvidence=[
    createEngineeringEvidenceRecord({issue:6,type:'borehole-log',source:'consultant',documentId:'B1',issuedAt:'2026-09-30',methodRef:'TCVN 10304 5.1',data:{depthM:30}}),
    createEngineeringEvidenceRecord({issue:6,type:'laboratory-soil-tests',source:'lab',documentId:'L1',issuedAt:'2026-09-30',methodRef:'TCVN 10304 5.2',data:{tests:['shear','compression']}}),
    createEngineeringEvidenceRecord({issue:6,type:'SPT',source:'consultant',documentId:'S1',issuedAt:'2026-09-30',methodRef:'TCVN 9351',data:{measurements:[{depthM:10,N:20}]}}),
  ];
  const ready=runStandardCalculation(p,{action:'foundation.pile-spt-capacity',input:{
    toeSoil:'granular',toeN:20,eta:1,toeAreaM2:0.09,perimeterM:1.2,layers:[{soil:'granular',Ns:15,thicknessM:5}]
  }});
  assert.equal(ready.status,'ready');
  assert.ok(ready.result.value>0);
});

test('measured TN loop action requires both commissioning measurement and device curve evidence',()=>{
  const p=createProject();
  const out=runStandardCalculation(p,{action:'electrical.tn-loop-measured',input:{measuredLoopImpedanceOhm:0.5,uoV:230,tripCurrentA:200}});
  assert.equal(out.status,'blocked');
  assert.deepEqual(out.evidence.missingTypes.sort(),['commissioning-loop-test','protective-device-curve'].sort());
});
