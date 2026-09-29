import test from 'node:test';
import assert from 'node:assert/strict';
import { minimumConcreteCover } from '../src/engine/standards/tcvn5574.js';

test('TCVN 5574 Table 19 concrete cover is governed by environment and bar diameter',()=>{
  assert.equal(minimumConcreteCover({environment:'indoorNormal',barDiameterMm:16}).minimumCoverMm,20);
  assert.equal(minimumConcreteCover({environment:'indoorNormal',barDiameterMm:28}).minimumCoverMm,28);
  assert.equal(minimumConcreteCover({environment:'outdoor',barDiameterMm:20}).minimumCoverMm,30);
  assert.equal(minimumConcreteCover({environment:'soilWithBlinding',barDiameterMm:20}).minimumCoverMm,40);
});

test('TCVN 5574 permitted cover reductions still obey diameter and 10 mm floor',()=>{
  assert.equal(minimumConcreteCover({environment:'indoorNormal',barDiameterMm:12,precast:true}).minimumCoverMm,15);
  assert.equal(minimumConcreteCover({environment:'indoorNormal',barDiameterMm:12,reinforcementRole:'constructive'}).minimumCoverMm,15);
  assert.equal(minimumConcreteCover({environment:'indoorNormal',barDiameterMm:16,precast:true,reinforcementRole:'constructive'}).minimumCoverMm,16);
});
