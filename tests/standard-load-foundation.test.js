import test from 'node:test';
import assert from 'node:assert/strict';
import { singleFloorAreaReduction,multiFloorAreaReduction } from '../src/engine/standards/tcvn2737.js';
import { adjustConventionalResistance,checkFoundationDeformation } from '../src/engine/standards/tcvn9362.js';

test('TCVN 2737 area reduction follows equations 3-6',()=>{
  const p1=singleFloorAreaReduction({areaM2:36,category:'A-B'});
  assert.ok(p1.factor>=0.6&&p1.factor<1);
  const p3=multiFloorAreaReduction({singleFloorFactor:p1.factor,floorCount:4,category:'A-B'});
  assert.ok(p3.factor>=0.5&&p3.factor<=p1.factor);
  assert.equal(singleFloorAreaReduction({areaM2:9,category:'A-B'}).factor,1);
});

test('TCVN 9362 Appendix D resistance adjustment and deformation check are deterministic',()=>{
  const shallow=adjustConventionalResistance({r0Kpa:300,foundationWidthM:1.5,embedmentDepthM:1.5,soilGroup:'coarseSand'});
  assert.ok(shallow.valueKpa>0);
  const deep=adjustConventionalResistance({r0Kpa:300,foundationWidthM:1.5,embedmentDepthM:3,soilGroup:'coarseSand',soilUnitWeightKnM3:18});
  assert.ok(deep.valueKpa>shallow.valueKpa);
  assert.equal(checkFoundationDeformation({calculated:20,allowable:25}).pass,true);
});
