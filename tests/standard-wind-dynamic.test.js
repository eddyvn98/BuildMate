import test from 'node:test';
import assert from 'node:assert/strict';
import { windDynamicTerrainCoefficients,flexibleStructureGustFactor } from '../src/engine/standards/tcvn2737-dynamic.js';
import { enclosedBuildingInternalPressureCoefficient } from '../src/engine/standards/tcvn2737.js';

test('TCVN 2737 Table 10 terrain coefficients are exact',()=>{
  assert.deepEqual(
    Object.fromEntries(Object.entries(windDynamicTerrainCoefficients('B')).filter(([k])=>['cr','lM','epsilon','bBar','alpha'].includes(k))),
    {cr:0.2,lM:152.4,epsilon:0.2,bBar:0.65,alpha:1/6.5}
  );
});

test('TCVN 2737 flexible-structure Gf Eq13-24 is fully reproducible',()=>{
  const r=flexibleStructureGustFactor({
    heightM:120,widthM:30,depthM:20,firstNaturalFrequencyHz:0.25,
    v3s50Mps:44,terrain:'C',structuralType:'reinforcedConcrete',
  });
  assert.ok(r.value>0);
  assert.ok(r.inputs.R>0);
  assert.equal(r.inputs.beta,0.02);
});

test('F.12 does not invent interpolation for opening ratio 5-30 percent',()=>{
  const r=enclosedBuildingInternalPressureCoefficient({openingRatioPercent:15});
  assert.equal(r.blocked,true);
  assert.ok(r.reason.includes('no interpolation rule'));
});
