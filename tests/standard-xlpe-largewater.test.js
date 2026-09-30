import test from 'node:test';
import assert from 'node:assert/strict';
import { xlpeAmpacity,chooseMinimumXlpeSection } from '../src/engine/standards/tcvn7447-5-52-xlpe.js';
import { table14LargeResistanceA,lowVelocityCorrectionFactor,largePipeFrictionGradient } from '../src/engine/standards/tcvn4513-large.js';

test('TCVN 7447-5-52 XLPE copper B.52.3/B.52.5 cells are exact',()=>{
  assert.equal(xlpeAmpacity({conductor:'copper',sectionMm2:2.5,method:'A1',loadedConductors:2}).ampacityA,26);
  assert.equal(xlpeAmpacity({conductor:'copper',sectionMm2:6,method:'C',loadedConductors:3}).ampacityA,52);
  assert.equal(xlpeAmpacity({conductor:'copper',sectionMm2:300,method:'D2',loadedConductors:2}).ampacityA,502);
});

test('TCVN 7447-5-52 XLPE aluminium table cells and section selection are exact',()=>{
  assert.equal(xlpeAmpacity({conductor:'aluminium',sectionMm2:25,method:'B1',loadedConductors:2}).ampacityA,105);
  assert.equal(xlpeAmpacity({conductor:'aluminium',sectionMm2:95,method:'C',loadedConductors:3}).ampacityA,211);
  assert.equal(chooseMinimumXlpeSection({conductor:'copper',designCurrentA:60,method:'B1',loadedConductors:3}).sectionMm2,10);
});

test('TCVN 4513 Table 14b and Table 15 values are exact',()=>{
  assert.equal(table14LargeResistanceA(200).value,9.273);
  assert.equal(table14LargeResistanceA(400).value,0.2062);
  assert.equal(lowVelocityCorrectionFactor(0.8).value,1.06);
  assert.equal(lowVelocityCorrectionFactor(1.2).value,1);
  assert.throws(()=>lowVelocityCorrectionFactor(0.85));
});

test('TCVN 4513 large pipe friction applies K below 1.2 m/s',()=>{
  const r=largePipeFrictionGradient({diameterMm:200,flowM3s:0.05,velocityMps:0.8});
  assert.ok(r.value>0);
  assert.equal(r.inputs.A,9.273);
  assert.equal(r.inputs.K,1.06);
});
