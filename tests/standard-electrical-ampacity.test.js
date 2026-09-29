import test from 'node:test';
import assert from 'node:assert/strict';
import { pvcCopperAmpacity,chooseMinimumPvcCopperSection } from '../src/engine/standards/tcvn7447-5-52.js';

test('TCVN 7447-5-52 PVC copper B1/B2/C ampacity matches tables',()=>{
  assert.equal(pvcCopperAmpacity({sectionMm2:2.5,method:'B1',loadedConductors:2}).ampacityA,24);
  assert.equal(pvcCopperAmpacity({sectionMm2:2.5,method:'B1',loadedConductors:3}).ampacityA,21);
  assert.equal(pvcCopperAmpacity({sectionMm2:6,method:'C',loadedConductors:2}).ampacityA,46);
});

test('minimum PVC copper section selection applies correction factors before acceptance',()=>{
  const plain=chooseMinimumPvcCopperSection({designCurrentA:30,method:'B1',loadedConductors:2});
  assert.equal(plain.sectionMm2,4);
  const grouped=chooseMinimumPvcCopperSection({designCurrentA:30,method:'B1',loadedConductors:2,correctionFactors:[0.8]});
  assert.equal(grouped.sectionMm2,6);
});
