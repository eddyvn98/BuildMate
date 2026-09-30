import test from 'node:test';
import assert from 'node:assert/strict';
import { assessPileGeotechnicalBasis } from '../src/engine/engineering/geotech-gate.js';
import { createSourcedCurve,interpolateSourcedCurve } from '../src/engine/sourced-curve.js';
import { checkShortCircuitBreakingCapacity } from '../src/engine/standards/qcvn12.js';
import { createBreakerTripCurve,tripTimeAtCurrent,createPumpQhCurve,pumpHeadAtFlow } from '../src/engine/engineering/device-curves.js';

test('TCVN 10304 geotechnical gate requires borehole lab and SPT/CPT provenance',()=>{
  const bad=assessPileGeotechnicalBasis({documents:[{id:'b1',type:'borehole-log',source:'consultant',date:'2026-09-01'}]});
  assert.equal(bad.ready,false);
  const ok=assessPileGeotechnicalBasis({documents:[
    {id:'b1',type:'borehole-log',source:'consultant',date:'2026-09-01'},
    {id:'l1',type:'laboratory-soil-tests',source:'lab',date:'2026-09-02'},
    {id:'s1',type:'SPT',source:'consultant',date:'2026-09-01'},
  ]});
  assert.equal(ok.ready,true);
});

test('sourced curves interpolate only within documented range',()=>{
  const c=createSourcedCurve({id:'c',source:'manufacturer datasheet rev A',points:[{x:10,y:5},{x:20,y:3}]});
  assert.equal(interpolateSourcedCurve(c,15).value,4);
  assert.equal(interpolateSourcedCurve(c,25).blocked,true);
});

test('QCVN 12 requires protective device breaking capacity >= prospective short circuit current',()=>{
  assert.equal(checkShortCircuitBreakingCapacity({prospectiveShortCircuitCurrentA:5000,deviceBreakingCapacityA:6000,deviceSource:'datasheet'}).pass,true);
  assert.equal(checkShortCircuitBreakingCapacity({prospectiveShortCircuitCurrentA:7000,deviceBreakingCapacityA:6000,deviceSource:'datasheet'}).pass,false);
});

test('breaker and pump curves retain manufacturer source',()=>{
  const breaker=createBreakerTripCurve({id:'MCB-A',source:'manufacturer curve',points:[{x:100,y:1},{x:200,y:0.2}]});
  assert.equal(tripTimeAtCurrent({curve:breaker,currentA:150}).value,0.6);
  const pump=createPumpQhCurve({id:'P1',source:'pump datasheet',points:[{x:0,y:30},{x:10,y:20}]});
  assert.equal(pumpHeadAtFlow({curve:pump,flow:5}).value,25);
});
