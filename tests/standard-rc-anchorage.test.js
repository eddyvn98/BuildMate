import test from 'node:test';
import assert from 'node:assert/strict';
import { bondStrength,basicAnchorageLength,anchorageAlpha1,requiredAnchorageLength,lapSpliceAlpha2,minimumLapLength } from '../src/engine/standards/tcvn5574.js';

test('TCVN 5574 anchorage chain follows clauses 10.3.5.4-10.3.5.5',()=>{
  const bond=bondStrength({RbtMpa:1.05,barType:'hotRolledRibbed',diameterMm:20});
  assert.equal(bond.value,2.625);
  const l0=basicAnchorageLength({barDiameterMm:20,RsMpa:350,RbtMpa:1.05,barType:'hotRolledRibbed'});
  assert.ok(l0.value>660&&l0.value<670);
  const alpha=anchorageAlpha1({stress:'tension'}).value;
  const lan=requiredAnchorageLength({baseAnchorageLengthMm:l0.value,barDiameterMm:20,alpha1:alpha,calculatedSteelAreaMm2:300,effectiveSteelAreaMm2:400});
  assert.ok(lan.requiredAnchorageLengthMm>=300);
});

test('TCVN 5574 lap splice alpha2 uses base 1.2 tension and 0.9 compression',()=>{
  assert.equal(lapSpliceAlpha2({stress:'tension',splicePercent:50,barSurface:'ribbed'}).value,1.2);
  assert.equal(lapSpliceAlpha2({stress:'tension',splicePercent:100,barSurface:'ribbed'}).value,2);
  assert.equal(lapSpliceAlpha2({stress:'compression',splicePercent:50}).value,0.9);
  assert.equal(lapSpliceAlpha2({stress:'compression',splicePercent:100}).value,1.2);
  const lap=minimumLapLength({barDiameterMm:20,baseAnchorageLengthMm:700,alpha2:1.2});
  assert.equal(lap.minimumLapLengthMm,400);
});
