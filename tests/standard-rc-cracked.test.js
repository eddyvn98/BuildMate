import test from 'node:test';
import assert from 'node:assert/strict';
import { crackedConcreteReducedModulus,psiSForBending,crackedSteelTransformation,crackedRectangularSectionRigidity,crackedRectangularCurvature } from '../src/engine/standards/tcvn5574-cracked.js';

test('TCVN 5574 cracked reduced modulus uses Eq13 short and Table9 long strain',()=>{
  assert.equal(crackedConcreteReducedModulus({RbSerMpa:18.5,duration:'short'}).value,12333.333);
  assert.equal(crackedConcreteReducedModulus({RbSerMpa:18.5,duration:'long',relativeHumidityPercent:80}).value,7708.333);
});

test('TCVN 5574 psi_s and transformed steel follow Eq176 and 202-204',()=>{
  assert.equal(psiSForBending({crackingMomentKnM:20,momentKnM:40}).value,0.6);
  const t=crackedSteelTransformation({EsMpa:200000,EbRedMpa:10000,psiS:0.8});
  assert.equal(t.alphaS1,20);
  assert.equal(t.alphaS2,25);
});

test('TCVN 5574 cracked rectangular Eq195 computes Ired without manual input',()=>{
  const r=crackedRectangularSectionRigidity({
    bMm:250,h0Mm:450,AsMm2:1500,EsMpa:200000,RbSerMpa:18.5,
    duration:'short',crackingMomentKnM:25,momentKnM:100,
  });
  assert.equal(r.branch,'Eq195-tension-only');
  assert.ok(r.compressionZoneMm>0&&r.compressionZoneMm<450);
  assert.ok(r.IredMm4>0);
  assert.ok(r.rigidityNmm2>0);
});

test('TCVN 5574 cracked rectangular Eq196 includes compression steel and curvature',()=>{
  const section=crackedRectangularSectionRigidity({
    bMm:300,h0Mm:500,AsMm2:2000,AsCompressionMm2:800,aPrimeMm:40,
    EsMpa:200000,RbSerMpa:22,duration:'long',relativeHumidityPercent:60,
    crackingMomentKnM:30,momentKnM:120,
  });
  assert.equal(section.branch,'Eq196-tension-compression');
  const k=crackedRectangularCurvature({
    momentKnM:120,bMm:300,h0Mm:500,AsMm2:2000,AsCompressionMm2:800,aPrimeMm:40,
    EsMpa:200000,RbSerMpa:22,duration:'long',relativeHumidityPercent:60,
    crackingMomentKnM:30,
  });
  assert.ok(k.value>0);
});
