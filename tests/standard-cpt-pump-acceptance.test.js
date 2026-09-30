import test from 'node:test';
import assert from 'node:assert/strict';
import { cptBeta1,cptSideCoefficient,boredCptCoefficient,boredPileCptCapacity } from '../src/engine/standards/tcvn10304-cpt-tables.js';
import { pumpAcceptanceTolerances,checkGuaranteedPumpPoint,checkPumpNpshAcceptance,pumpHydraulicEfficiency } from '../src/engine/standards/tcvn9222-pump.js';

test('TCVN 10304 Table 15 exact CPT selectors do not invent interpolation',()=>{
  assert.equal(cptBeta1({qsKpa:5000,pileType:'driven'}).value,0.65);
  assert.equal(cptBeta1({qsKpa:2500,pileType:'screwTension'}).value,0.38);
  assert.equal(cptSideCoefficient({fsKpa:60,probeType:'I',soil:'sand'}).value,1.2);
  assert.equal(cptSideCoefficient({fsKpa:100,probeType:'III',soil:'clay'}).value,0.4);
  assert.throws(()=>cptBeta1({qsKpa:6000,pileType:'driven'}));
});

test('TCVN 10304 Table 16 bored-pile CPT allows linear interpolation',()=>{
  assert.equal(boredCptCoefficient({qcKpa:5000,soil:'sand',kind:'toe'}).value,900);
  assert.equal(boredCptCoefficient({qcKpa:6250,soil:'sand',kind:'toe'}).value,1000);
  const r=boredPileCptCapacity({toeQcKpa:7500,toeSoil:'sand',toeAreaM2:0.5,perimeterM:2.5,embedmentM:12,layers:[
    {qcKpa:7500,soil:'sand',thicknessM:5},{qcKpa:10000,soil:'clay',thicknessM:4},
  ]});
  assert.ok(r.value>0);
});

test('TCVN 9222 Table 10 pump acceptance tolerances are exact',()=>{
  assert.deepEqual({...pumpAcceptanceTolerances(1),reference:undefined,level:undefined},{grade:1,flowPercent:4.5,headPercent:3,efficiencyMinusPercent:3,reference:undefined,level:undefined});
  assert.equal(pumpAcceptanceTolerances(2).flowPercent,8);
  const r=checkGuaranteedPumpPoint({guaranteedFlow:10,guaranteedHeadM:30,guaranteedEfficiencyPercent:70,testedFlow:10.2,testedHeadM:29.5,testedEfficiencyPercent:68,grade:1,testReportSource:'TCVN 9222 certified test'});
  assert.equal(r.pass,true);
});

test('TCVN 9222 NPSH and hydraulic efficiency use sourced pump test data',()=>{
  assert.equal(checkPumpNpshAcceptance({npshAvailableM:5,npshRequiredM:3.5,requiredNpshSource:'manufacturer TCVN 9222 test curve',operatingFlow:10}).pass,true);
  const eta=pumpHydraulicEfficiency({densityKgM3:1000,flowM3s:0.01,headM:20,inputPowerKw:3});
  assert.ok(eta.efficiencyPercent>60&&eta.efficiencyPercent<70);
});
