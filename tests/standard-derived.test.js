import test from 'node:test';
import assert from 'node:assert/strict';
import { residentialCharacteristicLiveLoad,reducedCharacteristicLiveLoad,designDistributedLiveLoad,basicCombinationPsi } from '../src/engine/standards/tcvn2737.js';
import { rectangularFlexuralCapacity,checkFlexuralMoment } from '../src/engine/standards/tcvn5574.js';
import { checkEccentricFoundationPressures } from '../src/engine/standards/tcvn9362.js';
import { endBearingPileCharacteristicCapacity,checkPileDeformation } from '../src/engine/standards/tcvn10304.js';
import { distributionBoardCoincidenceFactor,functionalCoincidenceFactor,checkVoltageDropAgainstTcvn9206 } from '../src/engine/standards/tcvn9206.js';
import { housingDesignFlow,smallFixturePipeDiameter } from '../src/engine/standards/tcvn4513.js';
import { manningVelocity,manningNForMaterial } from '../src/engine/standards/tcvn7957.js';

test('TCVN 2737 residential loads and combination factors are clause-backed',()=>{
  assert.equal(residentialCharacteristicLiveLoad('A1-floor').value,1.5);
  assert.equal(reducedCharacteristicLiveLoad(2).value,0.7);
  assert.equal(designDistributedLiveLoad(1.5).value,1.95);
  assert.deepEqual(basicCombinationPsi({longTermCount:3,shortTermCount:4}),{longTerm:[1,0.95,0.95],shortTerm:[1,0.9,0.7,0.7],level:'engineering-review',references:basicCombinationPsi({longTermCount:3,shortTermCount:4}).references});
});

test('TCVN 5574 rectangular flexural equations 33-35 calculate and gate xi domain',()=>{
  const capacity=rectangularFlexuralCapacity({bMm:200,h0Mm:450,RbMpa:11.5,RsMpa:350,AsMm2:1000,xiR:0.5,materialSource:'project material schedule'});
  assert.ok(capacity.value>130&&capacity.value<140);
  assert.equal(capacity.checks.domainPass,true);
  assert.equal(checkFlexuralMoment({designMomentKnM:100,capacity}).pass,true);
});

test('TCVN 9362 eccentric pressure limits use 1.2R and 1.5R',()=>{
  const r=checkEccentricFoundationPressures({designResistanceKpa:200,edgePressureKpa:230,cornerPressureKpa:290});
  assert.equal(r.edge.limitKpa,240); assert.equal(r.edge.pass,true);
  assert.equal(r.corner.limitKpa,300); assert.equal(r.corner.pass,true);
});

test('TCVN 10304 end-bearing and deformation checks expose formulas',()=>{
  assert.equal(endBearingPileCharacteristicCapacity({unitToeResistanceKpa:5000,toeAreaM2:0.09,source:'geotech'}).value,450);
  assert.equal(checkPileDeformation({calculated:20,limit:25}).pass,true);
});

test('TCVN 9206 coincidence and voltage limits are table/clause backed',()=>{
  assert.equal(distributionBoardCoincidenceFactor(10).value,0.6);
  assert.equal(functionalCoincidenceFactor('lighting').value,1);
  assert.equal(functionalCoincidenceFactor('socket',{socketFactor:0.7}).value,0.7);
  assert.equal(checkVoltageDropAgainstTcvn9206({dropPercent:4.9,loadType:'working-lighting'}).pass,true);
});

test('TCVN 4513 housing flow and small fixture pipe lookup follow clauses 6.6-6.7',()=>{
  const q=housingDesignFlow({fixtureEquivalentUnits:20,litersPerPersonDay:150});
  assert.ok(q.value>1.9&&q.value<2);
  assert.equal(smallFixturePipeDiameter(12).nominalDiameterMm,25);
});

test('TCVN 7957 Manning velocity uses clause 5.3.2 and Table 9 n',()=>{
  const n=manningNForMaterial('reinforcedConcrete').value;
  const v=manningVelocity({hydraulicRadiusM:0.025,hydraulicSlope:0.01,manningN:n});
  assert.ok(v.value>0);
  assert.equal(n,0.013);
});
