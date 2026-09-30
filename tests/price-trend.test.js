import test from 'node:test';
import assert from 'node:assert/strict';
import { marketPriceTrend } from '../src/engine/price-trend.js';

test('price trend reports building-history with one point',()=>{
  const trend=marketPriceTrend({history:[
    {date:'2026-09-30',province:'TP.HCM',turnkeyM2:{center:5900000,low:5600000,high:6200000},materials:{}}
  ]});
  assert.equal(trend.status,'building-history');
  assert.equal(trend.turnkeyChangePercent,null);
});

test('price trend compares latest point with prior market history and material drift',()=>{
  const trend=marketPriceTrend({history:[
    {date:'2026-08-31',province:'TP.HCM',turnkeyM2:{center:5700000,low:5400000,high:6000000},materials:{rebar:{center:16000,unit:'VND/kg'}}},
    {date:'2026-09-30',province:'TP.HCM',turnkeyM2:{center:5900000,low:5600000,high:6200000},materials:{rebar:{center:17000,unit:'VND/kg'}}},
  ]});
  assert.equal(trend.status,'ready');
  assert.equal(trend.turnkeyChangePercent,3.5);
  assert.equal(trend.materialDrift[0].code,'rebar');
  assert.equal(trend.materialDrift[0].changePercent,6.3);
});
