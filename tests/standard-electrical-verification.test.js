import test from 'node:test';
import assert from 'node:assert/strict';
import { quickMeasuredTnLoopCheck,evaluatedTnLoopFromMeasurements,earthElectrodeMeasurement } from '../src/engine/standards/tcvn7447-6.js';

test('TCVN 7447-6 C.61.3.6.2 conservative measured Zs uses 2/3 Uo/Ia',()=>{
  const ok=quickMeasuredTnLoopCheck({measuredLoopImpedanceOhm:0.6,uoV:230,tripCurrentA:200});
  assert.equal(ok.pass,true);
  assert.ok(Math.abs(ok.maximumMeasuredOhm-0.766667)<0.00001);
  assert.equal(quickMeasuredTnLoopCheck({measuredLoopImpedanceOhm:0.8,uoV:230,tripCurrentA:200}).pass,false);
});

test('TCVN 7447-6 detailed TN evaluation sums measured source phase PE with sourced heat corrections',()=>{
  const r=evaluatedTnLoopFromMeasurements({
    sourceLoopImpedanceOhm:0.2,uoV:230,tripCurrentA:200,
    segments:[
      {phaseResistanceOhm:0.1,peResistanceOhm:0.1,temperatureCorrectionFactor:1.2,measurementSource:'meter report',correctionSource:'fault temperature assessment'},
      {phaseResistanceOhm:0.05,peResistanceOhm:0.05,temperatureCorrectionFactor:1.2,measurementSource:'meter report',correctionSource:'fault temperature assessment'},
    ],
  });
  assert.equal(r.evaluatedLoopImpedanceOhm,0.56);
  assert.equal(r.pass,true);
});

test('earth electrode resistance input is measurement-provenanced',()=>{
  const r=earthElectrodeMeasurement({measuredResistanceOhm:15,measurementMethod:'3-point fall of potential',source:'commissioning report'});
  assert.equal(r.measuredResistanceOhm,15);
  assert.throws(()=>earthElectrodeMeasurement({measuredResistanceOhm:15}));
});
