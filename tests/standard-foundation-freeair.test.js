import test from 'node:test';
import assert from 'node:assert/strict';
import { tableC1Alpha,circularAdditionalPressure,rectangularAdditionalPressureFull,regularPolygonEquivalentRadius } from '../src/engine/standards/tcvn9362-table-c1.js';
import { freeAirAmpacity } from '../src/engine/standards/tcvn7447-5-52-freeair.js';

test('TCVN 9362 full Table C.1 reproduces circle rectangle and strip rows',()=>{
  assert.equal(tableC1Alpha({m:4,shape:'circle'}).value,0.087);
  assert.equal(tableC1Alpha({m:6.4,shape:'rectangle',n:2.4}).value,0.098);
  assert.equal(tableC1Alpha({m:12,shape:'strip'}).value,0.104);
  assert.equal(tableC1Alpha({m:10,shape:'rectangle',n:5}).value,0.079);
});

test('TCVN 9362 Table C.1 linearly interpolates intermediate m and n',()=>{
  const r=tableC1Alpha({m:4.2,shape:'rectangle',n:1.2});
  assert.ok(r.value>0.091&&r.value<0.145);
  const circle=circularAdditionalPressure({radiusM:2,depthBelowBaseM:2,baseAdditionalPressureKpa:200});
  assert.equal(circle.inputs.m,1);
  assert.ok(circle.value>0);
  const rect=rectangularAdditionalPressureFull({widthM:2,lengthM:12,depthBelowBaseM:2,baseAdditionalPressureKpa:200});
  assert.equal(rect.inputs.n,6);
  assert.ok(rect.value>0);
  assert.ok(regularPolygonEquivalentRadius(12).radiusM>1);
});

test('TCVN 7447-5-52 free-air PVC copper/aluminium exact table cells',()=>{
  assert.equal(freeAirAmpacity({insulation:'PVC',conductor:'copper',sectionMm2:25,arrangement:'F-two-loaded-touching'}).ampacityA,131);
  assert.equal(freeAirAmpacity({insulation:'PVC',conductor:'aluminium',sectionMm2:95,arrangement:'G-three-loaded-flat-spaced-horizontal'}).ampacityA,265);
});

test('TCVN 7447-5-52 free-air XLPE copper/aluminium exact table cells',()=>{
  assert.equal(freeAirAmpacity({insulation:'XLPE',conductor:'copper',sectionMm2:300,arrangement:'G-three-loaded-flat-spaced-vertical'}).ampacityA,833);
  assert.equal(freeAirAmpacity({insulation:'XLPE',conductor:'aluminium',sectionMm2:400,arrangement:'F-two-loaded-touching'}).ampacityA,740);
  assert.equal(freeAirAmpacity({insulation:'XLPE',conductor:'aluminium',sectionMm2:630,arrangement:'G-three-loaded-flat-spaced-horizontal'}).ampacityA,1154);
});
