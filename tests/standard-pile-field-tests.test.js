import test from 'node:test';
import assert from 'node:assert/strict';
import { appendixGStatistics95 } from '../src/engine/standards/tcvn10304-statistics.js';
import { drivenPressedSptPoint,sptCharacteristicCapacity,drivenCptPoint } from '../src/engine/standards/tcvn10304-field-tests.js';

test('TCVN 10304 Appendix D driven/pressed SPT row calculates toe and shaft terms',()=>{
  const r=drivenPressedSptPoint({
    toeSoil:'granular',toeN:40,eta:1,toeAreaM2:0.09,perimeterM:1.2,
    layers:[
      {soil:'granular',thicknessM:5,Ns:20},
      {soil:'cohesive',thicknessM:4,Nc:8},
    ],
  });
  assert.equal(r.checks.qbKpa,12000);
  assert.ok(r.checks.RuFsKn>0);
  assert.ok(r.checks.RuFcKn>0);
  assert.ok(r.value>1000);
});

test('TCVN 10304 Appendix D n<6 uses minimum Ru and n>=6 uses Appendix G',()=>{
  assert.equal(sptCharacteristicCapacity([1000,900,1100]).RkKn,900);
  const s=sptCharacteristicCapacity([900,950,1000,1050,1100,980]);
  assert.equal(s.method,'Appendix G alpha=0.95');
  assert.ok(s.gammaCg1>=1);
});

test('TCVN 10304 Appendix G equations G1-G7 produce traceable statistics',()=>{
  const r=appendixGStatistics95([10,11,10.5,9.5,10.2,10.8]);
  assert.equal(r.n,6);
  assert.ok(r.standardValue>0);
  assert.ok(r.gammaG>=1);
  assert.ok(r.designValue<=r.standardValue);
});

test('TCVN 10304 CPT equations 25-28 accept sourced Table 15 coefficients',()=>{
  const mech=drivenCptPoint({toeAreaM2:0.09,perimeterM:1.2,embedmentM:12,qsKpa:5000,beta1Driven:0.27,probeType:'I',fsKpa:60,beta2:1.2});
  assert.ok(mech.value>0);
  const elec=drivenCptPoint({toeAreaM2:0.09,perimeterM:1.2,embedmentM:5,qsKpa:5000,beta1Driven:0.27,probeType:'II',layers:[
    {fsiKpa:40,thicknessM:2,betaI:0.6},{fsiKpa:60,thicknessM:3,betaI:0.55},
  ]});
  assert.ok(elec.value>0);
});
