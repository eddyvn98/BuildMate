import test from 'node:test';
import assert from 'node:assert/strict';
import { minimumLapLength,lapSpliceAlpha2 } from '../src/engine/standards/tcvn5574.js';

test('TCVN 5574 lap splice alpha2 follows 10.3.6.2 interpolation',()=>{
  assert.equal(lapSpliceAlpha2({stress:'tension',splicePercent:50}).value,1.2);
  assert.equal(lapSpliceAlpha2({stress:'tension',splicePercent:100}).value,2);
  assert.equal(lapSpliceAlpha2({stress:'tension',splicePercent:75}).value,1.6);
  assert.equal(lapSpliceAlpha2({stress:'compression',splicePercent:100}).value,1.2);
});

test('TCVN 5574 minimum lap length enforces all lower bounds',()=>{
  const r=minimumLapLength({barDiameterMm:20,baseAnchorageLengthMm:800,alpha2:1.5});
  assert.equal(r.minimumLapLengthMm,480);
  const low=minimumLapLength({barDiameterMm:12,baseAnchorageLengthMm:300,alpha2:1});
  assert.equal(low.minimumLapLengthMm,250);
  assert.throws(()=>minimumLapLength({barDiameterMm:50,baseAnchorageLengthMm:1000,alpha2:1}));
});
