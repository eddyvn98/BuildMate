import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePriceSource } from '../scripts/market-price-parsers.mjs';

test('official HCMC bulletin parser selects the newest published material-price notice',()=>{
  const adapter={
    id:'hcm-official-vlxd',type:'official',
    entryPattern:/Công bố giá Vật liệu xây dựng trên địa bàn Thành phố Hồ Chí Minh tháng (?<month>\d{1,2}\/\d{4})\s+(?<number>[0-9A-Z/-]+)\s+(?<date>\d{1,2}\/\d{1,2}\/\d{4})/gi,
  };
  const html=`<table>
    <tr><td>Công bố giá Vật liệu xây dựng trên địa bàn Thành phố Hồ Chí Minh tháng 7/2026</td><td>28977/TB-SXD-KTVLXD</td><td>10/08/2026</td></tr>
    <tr><td>Công bố giá Vật liệu xây dựng trên địa bàn Thành phố Hồ Chí Minh tháng 8/2026</td><td>32431/TB-SXD-KTVLXD</td><td>09/09/2026</td></tr>
  </table>`;
  const result=parsePriceSource(adapter,html,{checkedAt:'2026-09-30'});
  assert.equal(result.sourcePatch.sourceDate,'2026-09-09');
  assert.ok(result.sourcePatch.note.includes('8/2026'));
  assert.equal(result.observationPatch,null);
});

test('turnkey parser can select the middle package near a contractor marker',()=>{
  const adapter={
    id:'khanggia-turnkey',type:'observation',code:'turnkey-m2',unit:'VND/m²',
    extract:{type:'range-near',marker:'NHÀ PHỐ 1 MẶT TIỀN',rangeIndex:1,minValue:4_000_000,maxValue:10_000_000},
  };
  const html='<p>NHÀ PHỐ 1 MẶT TIỀN | 4.750.000 – 5.050.000Đ/M² | 5.350.000 – 5.550.000Đ/M² | 5.850.000 – 6.150.000Đ/M²</p>';
  const result=parsePriceSource(adapter,html,{checkedAt:'2026-09-30'});
  assert.equal(result.observationPatch.min,5_350_000);
  assert.equal(result.observationPatch.max,5_550_000);
  assert.equal(result.observationPatch.dateBasis,'verified');
});

test('steel parser rejects unrelated large values and keeps the current per-kg band',()=>{
  const adapter={
    id:'mtp-rebar-hcm',type:'observation',code:'rebar',unit:'VND/kg',
    datePatterns:[/cập nhật[^0-9]{0,40}(?<date>\d{1,2}\/\d{1,2}\/\d{4})/i],
    extract:{type:'numeric-band',marker:'Bảng báo giá sắt thép',window:2000,minValue:14_000,maxValue:22_000},
  };
  const html='<h2>Bảng báo giá sắt thép cập nhật 11/09/2026</h2><p>16.300 17.650 767.008 1.257.520</p>';
  const result=parsePriceSource(adapter,html,{checkedAt:'2026-09-30'});
  assert.equal(result.sourcePatch.sourceDate,'2026-09-11');
  assert.equal(result.observationPatch.min,16_300);
  assert.equal(result.observationPatch.max,17_650);
});

test('monthly source dates normalize to first day of month and preserve period basis',()=>{
  const adapter={
    id:'mekong-concrete',type:'observation',code:'concrete-m250',unit:'VND/m³',periodDate:true,
    datePatterns:[/cập nhật(?: lần cuối)?:?\s*(?:tháng\s*)?(?<date>\d{1,2}\/\d{4})/i],
    extract:{type:'exact-near',marker:'M250 R28',minValue:900_000,maxValue:2_500_000},
  };
  const html='<p>Cập nhật lần cuối: tháng 09/2026</p><p>M250 R28 | 10 ± 2 | 1.200.000</p>';
  const result=parsePriceSource(adapter,html,{checkedAt:'2026-09-30'});
  assert.equal(result.sourcePatch.sourceDate,'2026-09-01');
  assert.equal(result.observationPatch.min,1_200_000);
  assert.equal(result.observationPatch.dateBasis,'period');
});
