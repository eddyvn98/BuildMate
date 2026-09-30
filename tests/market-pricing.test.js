import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMarketSnapshot,quickTownhouseEstimate,projectMarketPricingReady } from '../src/engine/market-pricing.js';
import { createProject,setField } from '../src/engine/project.js';

test('HCMC quick-market snapshot uses robust median/range and freshness',()=>{
  const snapshot=buildMarketSnapshot({province:'TP.HCM',asOf:'2026-09-30'});
  assert.equal(snapshot.turnkeyM2.center,5_950_000);
  assert.equal(snapshot.turnkeyM2.range.low,5_400_000);
  assert.equal(snapshot.turnkeyM2.range.high,6_460_000);
  assert.equal(snapshot.turnkeyM2.sourceCount,5);
  assert.equal(snapshot.turnkeyM2.confidence,'medium');
  assert.ok(snapshot.officialAnchors.some(x=>x.id==='hcm-official-vlxd-2026-08'));
});

test('quick townhouse estimate converts footprint with explicit foundation/roof assumptions',()=>{
  const snapshot=buildMarketSnapshot({province:'TP.HCM',asOf:'2026-09-30'});
  const estimate=quickTownhouseEstimate({footprintM2:54.4,storeys:3,finishLevel:'balanced',snapshot});
  assert.equal(estimate.convertedAreaM2,212.16);
  assert.equal(estimate.centerVnd,1_262_352_000);
  assert.equal(estimate.lowVnd,1_145_664_000);
  assert.equal(estimate.highVnd,1_370_553_600);
  assert.equal(estimate.confidence,'medium');
});

test('market pricing fails closed when the curated snapshot becomes stale',()=>{
  let p=createProject();
  p=setField(p,'location.province','TP.HCM');
  p=setField(p,'context.projectDate','2027-02-01');
  const status=projectMarketPricingReady(p);
  assert.equal(status.ready,false);
  assert.equal(status.snapshot.turnkeyM2,null);
});
