import test from 'node:test';
import assert from 'node:assert/strict';
import { poissonKv,soilShearModulusFromE0,longFrictionPileSettlement } from '../src/engine/standards/tcvn10304-single-settlement.js';
import { rectangularEccentricCompressionCheck } from '../src/engine/standards/tcvn5574-column.js';

test('TCVN 10304 Eq.33 kv and permitted G approximations are deterministic',()=>{
  assert.equal(poissonKv(0).value,2.82);
  assert.ok(poissonKv(0.3).value>1.8);
  assert.equal(soilShearModulusFromE0({E0Mpa:20,usePermittedApproximation:true}).value,8);
  assert.ok(soilShearModulusFromE0({E0Mpa:20,poissonRatio:0.3}).value>7);
});

test('TCVN 10304 Eq.30-33 long friction pile settlement closes single-pile input chain',()=>{
  const r=longFrictionPileSettlement({
    loadMN:0.5,G1Mpa:12,G2Mpa:8,nu1:0.3,nu2:0.3,
    pileLengthM:25,pileDiameterM:0.35,pileElasticModulusMpa:30000,pileAreaM2:0.096,
  });
  assert.ok(r.value>0);
  assert.ok(r.inputs.k>=7.5);
  assert.ok(r.inputs.kv>0);
});

test('TCVN 5574 eccentric compression uses Eq43 when Eq42 gives xi above xiR',()=>{
  const r=rectangularEccentricCompressionCheck({
    axialLoadKn:1200,firstOrderMomentKnM:90,eta:1.1,bMm:300,hMm:400,h0Mm:360,aPrimeMm:40,
    RbMpa:11.5,RsMpa:260,RscMpa:260,AsMm2:710,AsCompressionMm2:710,xiR:0.58,
  });
  assert.equal(r.blocked,false);
  assert.equal(r.branch,'Eq43-small-eccentricity-transition');
  assert.ok(r.transition.xEq43Mm>0);
});
