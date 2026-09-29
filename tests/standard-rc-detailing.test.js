import test from 'node:test';
import assert from 'node:assert/strict';
import { minimumClearBarSpacing,transverseReinforcementMaxSpacing,compressionBarRestraintSpacing } from '../src/engine/standards/tcvn5574.js';

test('TCVN 5574 clear bar spacing follows clause 10.3.2',()=>{
  assert.equal(minimumClearBarSpacing({barDiameterMm:20,position:'bottom',layerCount:1}).minimumClearSpacingMm,25);
  assert.equal(minimumClearBarSpacing({barDiameterMm:32,position:'top',layerCount:1}).minimumClearSpacingMm,32);
  assert.equal(minimumClearBarSpacing({barDiameterMm:16,position:'vertical',layerCount:1}).minimumClearSpacingMm,50);
});

test('TCVN 5574 transverse spacing follows 10.3.4.3 and 10.3.4.4',()=>{
  assert.equal(transverseReinforcementMaxSpacing({effectiveDepthMm:500,memberHeightMm:600,shearRequiresStirrups:true}).maximumSpacingMm,250);
  assert.equal(transverseReinforcementMaxSpacing({effectiveDepthMm:500,memberHeightMm:600,shearRequiresStirrups:false}).maximumSpacingMm,375);
  assert.equal(compressionBarRestraintSpacing({longitudinalBarDiameterMm:20,compressionSteelRatioPercent:1}).maximumSpacingMm,300);
  assert.equal(compressionBarRestraintSpacing({longitudinalBarDiameterMm:20,compressionSteelRatioPercent:2}).maximumSpacingMm,200);
});
