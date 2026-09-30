import test from 'node:test';
import assert from 'node:assert/strict';
import { pitchedRoofPressureCoefficient } from '../src/engine/standards/tcvn2737-roof.js';
import { symmetricMidspanDeflectionFromCurvature,checkDeflection } from '../src/engine/standards/tcvn5574-deflection.js';
import { preliminaryEqualPileLoad,checkPileGroupModelConvergence } from '../src/engine/standards/tcvn10304-group.js';

test('TCVN 2737 roof F.5a/F.5b exact rows are reproduced',()=>{
  assert.equal(pitchedRoofPressureCoefficient({windAngleDeg:0,slopeDeg:30,zone:'F',sign:'positive'}).value,0.7);
  assert.equal(pitchedRoofPressureCoefficient({windAngleDeg:0,slopeDeg:30,zone:'F',sign:'negative'}).value,-0.5);
  assert.equal(pitchedRoofPressureCoefficient({windAngleDeg:90,slopeDeg:45,zone:'G'}).value,-1.4);
  assert.throws(()=>pitchedRoofPressureCoefficient({windAngleDeg:0,slopeDeg:20,zone:'F'}));
});

test('TCVN 5574 Eq.179 deflection calculation is deterministic and gated by Eq.177',()=>{
  const r=symmetricMidspanDeflectionFromCurvature({
    spanM:6,segmentCount:6,leftSupportCurvature:0,rightSupportCurvature:0,
    symmetricPairs:[[0.0002,0.0002],[0.0004,0.0004]],
    midspanCurvature:0.0005,
  });
  assert.ok(r.value>0);
  assert.equal(checkDeflection({calculatedMm:r.value,allowableMm:30,allowableSource:'project applicable limit'}).pass,true);
});

test('TCVN 10304 pile group preliminary load and 10% convergence are explicit',()=>{
  assert.equal(preliminaryEqualPileLoad({foundationSlsLoadKn:1200,pileCount:4}).loadPerPileKn,300);
  assert.equal(checkPileGroupModelConvergence({geotechnicalPileForcesKn:[300,310],structuralPileForcesKn:[300,300]}).pass,true);
  assert.equal(checkPileGroupModelConvergence({geotechnicalPileForcesKn:[350],structuralPileForcesKn:[300]}).pass,false);
});
