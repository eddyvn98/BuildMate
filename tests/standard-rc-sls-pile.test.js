import test from 'node:test';
import assert from 'node:assert/strict';
import { crackWidth,checkCrackWidth,minimumLongitudinalReinforcement } from '../src/engine/standards/tcvn5574.js';
import { drivenFrictionPileCharacteristicCapacity } from '../src/engine/standards/tcvn10304.js';

test('TCVN 5574 SLS crack and minimum reinforcement rules are traceable',()=>{
  const w=crackWidth({phi1:1,phi2:1,phi3:1,psiS:0.8,sigmaSMpa:200,EsMpa:200000,crackSpacingMm:150});
  assert.equal(w.value,0.12);
  assert.equal(checkCrackWidth({calculatedMm:w.value,reinforcementGroup:'commonBars',duration:'longTerm'}).pass,true);
  const amin=minimumLongitudinalReinforcement({memberType:'flexural',bMm:200,h0Mm:450});
  assert.equal(amin.minimumRatioPercent,0.1);
  assert.equal(amin.minimumAreaMm2,90);
});

test('TCVN 10304 friction pile capacity sums sourced toe and shaft resistance',()=>{
  const r=drivenFrictionPileCharacteristicCapacity({
    toeResistanceKpa:3000,toeAreaM2:0.09,toeResistanceFactor:1,toeWorkingFactor:1,
    perimeterM:1.2,pileWorkingFactor:1,
    layers:[
      {unitShaftResistanceKpa:30,thicknessM:5,resistanceFactor:1,workingFactor:1,source:'TCVN/geotech layer 1'},
      {unitShaftResistanceKpa:40,thicknessM:4,resistanceFactor:1,workingFactor:1,source:'TCVN/geotech layer 2'},
    ],
  });
  assert.equal(r.checks.toeKn,270);
  assert.equal(r.checks.shaftKn,372);
  assert.equal(r.value,642);
});
