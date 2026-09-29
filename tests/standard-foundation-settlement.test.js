import test from 'node:test';
import assert from 'node:assert/strict';
import { layerSummationSettlement,checkSettlementLimit } from '../src/engine/standards/tcvn9362.js';

test('TCVN 9362 Appendix C.1.6 settlement sums sourced soil layers',()=>{
  const r=layerSummationSettlement({layers:[
    {averageAdditionalPressureKpa:180,thicknessM:0.5,deformationModulusKpa:15000,pressureSource:'Appendix C stress calc',modulusSource:'geotech test'},
    {averageAdditionalPressureKpa:120,thicknessM:0.5,deformationModulusKpa:12000,pressureSource:'Appendix C stress calc',modulusSource:'geotech test'},
  ]});
  assert.equal(r.value,8.8);
  assert.equal(checkSettlementLimit({settlementMm:r.value,allowableMm:80,allowableSource:'TCVN 9362 Table 16 applicable building row'}).pass,true);
  assert.throws(()=>layerSummationSettlement({layers:[{averageAdditionalPressureKpa:100,thicknessM:1,deformationModulusKpa:10000}]}));
});
