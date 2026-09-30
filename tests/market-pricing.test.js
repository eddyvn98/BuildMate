import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMarketSnapshot,quickTownhouseEstimate,projectMarketPricingReady } from '../src/engine/market-pricing.js';
import { MARKET_PRICE_META } from '../src/engine/market-price-seed.js';
import { createProject,setField } from '../src/engine/project.js';

test('HCMC quick-market snapshot keeps robust range, provenance and freshness invariants',()=>{
  const snapshot=buildMarketSnapshot({province:'TP.HCM',asOf:MARKET_PRICE_META.refreshedAt});
  assert.ok(snapshot.turnkeyM2);
  assert.ok(snapshot.turnkeyM2.sourceCount>=2);
  assert.ok(['high','medium'].includes(snapshot.turnkeyM2.confidence));
  assert.ok(snapshot.turnkeyM2.range.low<=snapshot.turnkeyM2.center);
  assert.ok(snapshot.turnkeyM2.center<=snapshot.turnkeyM2.range.high);
  assert.ok(snapshot.turnkeyM2.sources.every(x=>['fresh','aging'].includes(x.freshness)));
  assert.ok(snapshot.officialAnchors.some(x=>x.id==='hcm-official-vlxd'));
});

test('quick townhouse estimate derives values from the active snapshot instead of a frozen market number',()=>{
  const snapshot=buildMarketSnapshot({province:'TP.HCM',asOf:MARKET_PRICE_META.refreshedAt});
  const estimate=quickTownhouseEstimate({footprintM2:54.4,storeys:3,finishLevel:'balanced',snapshot});
  assert.equal(estimate.convertedAreaM2,212.16);
  assert.equal(estimate.centerVnd,Math.round(212.16*snapshot.turnkeyM2.center));
  assert.equal(estimate.lowVnd,Math.round(212.16*snapshot.turnkeyM2.range.low));
  assert.equal(estimate.highVnd,Math.round(212.16*snapshot.turnkeyM2.range.high));
  assert.equal(estimate.confidence,snapshot.turnkeyM2.confidence);
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

test('historical snapshots never consume future-dated market sources',()=>{
  const sources=[
    {id:'a',kind:'contractor',name:'A',url:'https://example.test/a',sourceDate:'2026-10-05',verifiedAt:'2026-10-05',observedAt:'2026-10-05'},
    {id:'b',kind:'contractor',name:'B',url:'https://example.test/b',sourceDate:'2026-10-05',verifiedAt:'2026-10-05',observedAt:'2026-10-05'},
  ];
  const observations=[
    {code:'turnkey-m2',min:5_500_000,max:5_700_000,unit:'VND/m²',sourceId:'a',dateBasis:'explicit',province:'TP.HCM'},
    {code:'turnkey-m2',min:5_800_000,max:6_000_000,unit:'VND/m²',sourceId:'b',dateBasis:'explicit',province:'TP.HCM'},
  ];
  assert.equal(buildMarketSnapshot({province:'TP.HCM',asOf:'2026-09-30',sources,observations}).turnkeyM2,null);
});

test('market pricing fails closed when the refreshed snapshot becomes stale',()=>{
  let p=createProject();
  p=setField(p,'location.province','TP.HCM');
  p=setField(p,'context.projectDate',addDays(MARKET_PRICE_META.refreshedAt,100));
  const status=projectMarketPricingReady(p);
  assert.equal(status.ready,false);
  assert.equal(status.snapshot.turnkeyM2,null);
});

function addDays(iso,days){
  const d=new Date(iso+'T00:00:00Z');
  d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString().slice(0,10);
}
