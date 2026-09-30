import test from 'node:test';
import assert from 'node:assert/strict';
import { shortTermUncrackedConcreteModulus,transformedSectionRigidity,curvatureFromMoment,totalCurvatureUncracked,totalCurvatureCracked,shearStrain } from '../src/engine/standards/tcvn5574-curvature.js';
import { pileInteractionDelta,additionalSettlementFromPile,pileGroupSettlementAtPile } from '../src/engine/standards/tcvn10304-settlement.js';

test('TCVN 5574 equations 185-188 and 191 form a reproducible curvature chain',()=>{
  const E=shortTermUncrackedConcreteModulus(30000);
  assert.equal(E.value,25500);
  const D=transformedSectionRigidity({Eb1Mpa:E.value,IredMm4:1e9,Eb1Source:E.reference.clause,IredSource:'transformed section calculation'});
  const k=curvatureFromMoment({momentKnM:100,rigidityNmm2:D.value});
  assert.ok(k.value>0);
  assert.equal(totalCurvatureUncracked({shortTermVariablePerM:0.001,longTermPermanentAndLongVariablePerM:0.002}).value,0.003);
  assert.equal(totalCurvatureCracked({shortTermTotalPerM:0.004,shortTermPermanentAndLongVariablePerM:0.002,longTermPermanentAndLongVariablePerM:0.003}).value,0.005);
  assert.ok(shearStrain({shearKn:50,Gmpa:12000,bMm:200,h0Mm:450}).value>0);
});

test('TCVN 10304 equations 36-38 calculate pile interaction settlement',()=>{
  const d=pileInteractionDelta({kv:5,G1Mpa:20,G2Mpa:10,pileLengthM:20,spacingM:1.5});
  assert.ok(d.value>0);
  const sad=additionalSettlementFromPile({loadMN:0.5,G1Mpa:20,pileLengthM:20,delta:d.value});
  assert.ok(sad.value>0);
  const group=pileGroupSettlementAtPile({
    singlePileSettlementMm:5,pileIndex:0,pileLoadsMN:[0.5,0.5,0.5],
    pileCoordinatesM:[[0,0],[1.5,0],[0,1.5]],kv:5,G1Mpa:20,G2Mpa:10,pileLengthM:20,
  });
  assert.ok(group.value>5);
  assert.equal(group.interactions.length,2);
});
