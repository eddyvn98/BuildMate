import test from 'node:test';
import assert from 'node:assert/strict';
import { rectangularBuildingWallPressureCoefficient,enclosedBuildingInternalPressureCoefficient } from '../src/engine/standards/tcvn2737.js';

test('TCVN 2737 Table F.4 wall coefficients match rectangular building table',()=>{
  assert.equal(rectangularBuildingWallPressureCoefficient({heightM:10,depthAlongWindM:10,zone:'A'}).value,-1.2);
  assert.equal(rectangularBuildingWallPressureCoefficient({heightM:10,depthAlongWindM:10,zone:'D'}).value,0.8);
  assert.equal(rectangularBuildingWallPressureCoefficient({heightM:10,depthAlongWindM:10,zone:'E'}).value,-0.5);
  assert.equal(rectangularBuildingWallPressureCoefficient({heightM:2.5,depthAlongWindM:10,zone:'D'}).value,0.7);
});

test('TCVN 2737 Table F.4 interpolates E and blocks h/d over profile range',()=>{
  const e=rectangularBuildingWallPressureCoefficient({heightM:25,depthAlongWindM:10,zone:'E'});
  assert.ok(e.value<-0.5&&e.value>-0.7);
  assert.throws(()=>rectangularBuildingWallPressureCoefficient({heightM:60,depthAlongWindM:10,zone:'D'}));
});

test('TCVN 2737 F.12 internal pressure endpoint cases remain adverse-case pairs',()=>{
  assert.deepEqual(enclosedBuildingInternalPressureCoefficient({openingRatioPercent:5}).values,[-0.2,0.2]);
  assert.deepEqual(enclosedBuildingInternalPressureCoefficient({openingRatioPercent:30}).values,[-0.5,0.8]);
  assert.equal(enclosedBuildingInternalPressureCoefficient({openingRatioPercent:15}).blocked,true);
});
