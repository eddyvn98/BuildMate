import test from 'node:test';
import assert from 'node:assert/strict';
import { localCompressionStrength,checkLocalCompression,checkSpecialAnchorBearing } from '../src/engine/standards/tcvn5574-local-compression.js';
import { qcvn06BeamFireRequirement,qcvn06ColumnFireRequirement,qcvn06SolidSlabFireRequirement,combineDurabilityAndFireCover,checkBeamFireGeometry,checkColumnFireGeometry,checkSolidSlabFireGeometry } from '../src/engine/standards/qcvn06-rc-fire.js';

test('TCVN 5574 Eq117-118 local compression phi is bounded 1.0..2.5',()=>{
  assert.equal(localCompressionStrength({RbMpa:14.5,loadedAreaMm2:10000,maxEffectiveAreaMm2:10000}).inputs.phiB,1);
  assert.equal(localCompressionStrength({RbMpa:14.5,loadedAreaMm2:10000,maxEffectiveAreaMm2:160000}).inputs.phiB,2.5);
});

test('TCVN 5574 Eq116 checks uniform and nonuniform local compression',()=>{
  const uniform=checkLocalCompression({localForceKn:200,RbMpa:14.5,loadedAreaMm2:20000,maxEffectiveAreaMm2:80000,distribution:'uniform',effectiveAreaGeometrySource:'Figure 13 geometry'});
  assert.equal(uniform.pass,true);
  const nonuniform=checkSpecialAnchorBearing({anchorType:'bearing-plate',localForceKn:500,RbMpa:14.5,loadedAreaMm2:20000,maxEffectiveAreaMm2:80000,distribution:'nonuniform',effectiveAreaGeometrySource:'Figure 13 geometry'});
  assert.equal(nonuniform.pass,false);
});

test('QCVN 06 Table F.3 beam values are exact and simultaneous',()=>{
  const r=qcvn06BeamFireRequirement({ratingMinutes:120,protection:'silicaUnprotected'});
  assert.equal(r.minimumAverageCoverMm,45);
  assert.equal(r.minimumBeamWidthMm,180);
  assert.equal(checkBeamFireGeometry({beamWidthMm:180,averageCoverMm:45,requirement:r}).pass,true);
});

test('QCVN 06 Tables F.5/F.6 column values are exact',()=>{
  const four=qcvn06ColumnFireRequirement({ratingMinutes:60,fireFaces:4,protection:'silicaUnprotected'});
  assert.equal(four.minimumSectionDimensionMm,200);
  assert.equal(checkColumnFireGeometry({minimumSectionDimensionMm:190,requirement:four}).pass,false);
  const one=qcvn06ColumnFireRequirement({ratingMinutes:120,fireFaces:1,protection:'silicaUnprotected'});
  assert.equal(one.minimumSectionDimensionMm,100);
});

test('QCVN 06 Table F.9 slab and TCVN 5574 durability cover combine by governing maximum',()=>{
  const slab=qcvn06SolidSlabFireRequirement({ratingMinutes:120});
  assert.equal(slab.minimumAverageCoverMm,20);
  assert.equal(slab.minimumTotalDepthMm,125);
  assert.equal(checkSolidSlabFireGeometry({totalDepthMm:130,averageCoverMm:25,requirement:slab}).pass,true);
  assert.equal(combineDurabilityAndFireCover({tcvn5574MinimumCoverMm:30,fireRequirement:slab}).governingMinimumCoverMm,30);
});
