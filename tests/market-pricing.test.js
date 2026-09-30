import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMarketSnapshot,quickTownhouseEstimate,projectMarketPricingReady } from '../src/engine/market-pricing.js';
import { createProject,setField } from '../src/engine/project.js';

test('HCMC quick-market snapshot uses refreshed sources, robust median/range and freshness',()=>{
  const snapshot=buildMarketSnapshot({province:'TP.HCM',asOf:'2026-09-30'});
  assert.equal(snapshot.refreshedAt,'2026-09-30');
  assert.equal(snapshot.turnkeyM2.center,5_900_000);
  assert.equal(snapshot.turnkeyM2.range.low,5_690_000);
  assert.equal(snapshot.turnkeyM2.range.high,6_070_000);
  assert.equal(snapshot.turnkeyM2.sourceCount,4);
  assert.equal(snapshot.turnkeyM2.confidence,'medium');
  assert.ok(snapshot.officialAnchors.some(x=>x.id==='hcm-official-vlxd'));
  assert.ok(snapshot.turnkeyM2.sources.every(x=>x.verifiedAt==='2026-09-30'));
});

test('quick townhouse estimate converts footprint with explicit foundation/roof assumptions',()=>{
  const snapshot=buildMarketSnapshot({province:'TP.HCM',asOf:'2026-09-30'});
  const estimate=quickTownhouseEstimate({footprintM2:54.4,storeys:3,finishLevel:'balanced',snapshot});
  assert.equal(estimate.convertedAreaM2,212.16);
  assert.equal(estimate.centerVnd,1_251_744_000);
  assert.equal(estimate.lowVnd,1_207_190_400);
  assert.equal(estimate.highVnd,1_287_811_200);
  assert.equal(estimate.confidence,'medium');
});

test('verifiedAt keeps undated sources fresh but they still go stale if refresh stops',()=>{
  const sources=[
    {id:'a',kind:'contractor',name:'A',url:'https://example.test/a',sourceDate:null,verifiedAt:'2026-09-30',observedAt:'2026-08-01'},
    {id:'b',kind:'contractor',name:'B',url:'https://example.test/b',sourceDate:null,verifiedAt:'2026-09-30',observedAt:'2026-08-01'},
  ];
  const observations=[
    {code:'turnkey-m2',min:5_500_000,max:5_700_000,unit:'VND/m²',sourceId:'a',dateBasis:'verified',province:'TP.HCM'},
    {code:'turnkey-m2',min:5_800_000,max:6_000_000,unit:'VND/m²',sourceId:'b',dateBasis:'verified',province:'TP.HCM'},
  ];
  assert.ok(buildMarketSnapshot({province:'TP.HCM',asOf:'2026-10-15',sources,observations}).turnkeyM2);
  assert.equal(buildMarketSnapshot({province:'TP.HCM',asOf:'2026-12-01',sources,observations}).turnkeyM2,null);
});

test('market pricing fails closed when the refreshed snapshot becomes stale',()=>{
  let p=createProject();
  p=setField(p,'location.province','TP.HCM');
  p=setField(p,'context.projectDate','2027-02-01');
  const status=projectMarketPricingReady(p);
  assert.equal(status.ready,false);
  assert.equal(status.snapshot.turnkeyM2,null);
});
