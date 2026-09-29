import test from 'node:test';
import assert from 'node:assert/strict';
import { permanentLoadReliabilityFactor,permanentLayerAreaLoad,basicWindPressureByZone,standardWindPressure } from '../src/engine/standards/tcvn2737.js';

test('TCVN 2737 permanent loads use sourced unit weights and Table 1 gamma factors',()=>{
  assert.equal(permanentLoadReliabilityFactor('reinforcedConcrete').factor,1.1);
  const load=permanentLayerAreaLoad({layers:[
    {name:'RC slab',thicknessM:0.12,unitWeightKnM3:25,materialClass:'reinforcedConcrete',source:'project material schedule'},
    {name:'site finish',thicknessM:0.05,unitWeightKnM3:20,materialClass:'finishSite',source:'project finish specification'},
  ]});
  assert.equal(load.characteristicKnM2,4);
  assert.equal(load.designKnM2,4.6);
  assert.throws(()=>permanentLayerAreaLoad({layers:[{thicknessM:0.1,unitWeightKnM3:25,materialClass:'reinforcedConcrete'}]}));
});

test('QCVN 02 wind zones feed TCVN 2737 equation 10 with sourced coefficients',()=>{
  assert.equal(basicWindPressureByZone('II').valueDaNm2,95);
  const wind=standardWindPressure({
    windZone:'II',kZe:1,aerodynamicCoefficient:0.8,gustFactor:1.5,
    coefficientSources:{kZe:'TCVN 2737 10.2.5 case',aerodynamicCoefficient:'TCVN 2737 10.2.6 case',gustFactor:'TCVN 2737 10.2.7 case'},
  });
  assert.ok(Math.abs(wind.value-97.128)<0.001);
  assert.throws(()=>standardWindPressure({windZone:'II',kZe:1,aerodynamicCoefficient:0.8,gustFactor:1.5,coefficientSources:{}}));
});
