import test from 'node:test';
import assert from 'node:assert/strict';
import { pvcCopperA1A2Ampacity } from '../src/engine/standards/tcvn7447-5-52-a1a2.js';
import { interpolatePitchedRoofPressureCoefficient } from '../src/engine/standards/tcvn2737-roof.js';

test('TCVN 7447-5-52 A1/A2 PVC copper ampacity follows B.52.2/B.52.4',()=>{
  assert.equal(pvcCopperA1A2Ampacity({sectionMm2:2.5,method:'A1',loadedConductors:2}).ampacityA,19.5);
  assert.equal(pvcCopperA1A2Ampacity({sectionMm2:2.5,method:'A1',loadedConductors:3}).ampacityA,18);
  assert.equal(pvcCopperA1A2Ampacity({sectionMm2:6,method:'A2',loadedConductors:3}).ampacityA,29);
});

test('TCVN 2737 F.5 interpolation is only allowed between same-sign rows',()=>{
  const r=interpolatePitchedRoofPressureCoefficient({windAngleDeg:90,slopeDeg:22.5,zone:'F',sign:'negative'});
  assert.ok(r.value< -1.1 && r.value> -1.3);
  assert.equal(interpolatePitchedRoofPressureCoefficient({windAngleDeg:0,slopeDeg:0,zone:'F',sign:'negative'}).blocked,true);
});
