import test from 'node:test';
import assert from 'node:assert/strict';
import { rectangularStressInfluenceAlpha,additionalVerticalPressure } from '../src/engine/standards/tcvn9362.js';

test('TCVN 9362 Table C.1 exact rectangular lookup points match published table',()=>{
  assert.equal(rectangularStressInfluenceAlpha({m:0.8,n:1}).value,0.8);
  assert.equal(rectangularStressInfluenceAlpha({m:2.4,n:3.2}).value,0.449);
  assert.equal(rectangularStressInfluenceAlpha({m:4,n:5}).value,0.285);
});

test('TCVN 9362 Table C.1 interpolates only inside verified domain',()=>{
  const a=rectangularStressInfluenceAlpha({m:1,n:1.2}).value;
  assert.ok(a>0.606&&a<0.8);
  assert.throws(()=>rectangularStressInfluenceAlpha({m:4.4,n:2}));
  assert.throws(()=>rectangularStressInfluenceAlpha({m:2,n:6}));
});

test('additional pressure uses alpha times base additional pressure',()=>{
  const r=additionalVerticalPressure({foundationWidthM:2,foundationLengthM:2,depthBelowBaseM:0.8,baseAdditionalPressureKpa:200});
  assert.equal(r.inputs.m,0.8);
  assert.equal(r.inputs.n,1);
  assert.equal(r.value,160);
});
