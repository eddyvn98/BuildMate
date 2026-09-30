import { marketPriceTrend } from '../engine/price-trend.js';
import { escapeHtml,input,metric } from './common.js';
import { money,number } from './render.js';

const MATERIAL_LABELS=Object.freeze({
  rebar:'Thép',
  'concrete-m250':'Bê tông M250',
  'cement-pcb40-50kg':'Xi măng PCB40',
  'sand-plaster':'Cát xây tô',
  'sand-concrete':'Cát bê tông',
});

export function pricingPanel(project,workflow) {
  const market=workflow.results?.marketPricing;
  const quick=market?.quickEstimate;
  const book=workflow.results?.priceBook;
  const trend=marketPriceTrend({province:project.location?.province?.value||'TP.HCM'});
  return `
    <section class="panel-block pricing-hero">
      <div class="section-head"><div><span class="eyebrow">Quick market price</span><h2>Giá gần hiện tại</h2><p class="hint">Không giả chính xác đến từng đồng. BuildMate hiển thị mốc giữa + khoảng giá + confidence.</p></div><div class="price-source">${market?.snapshot?.turnkeyM2?`${market.snapshot.turnkeyM2.sourceCount} nguồn · ${market.snapshot.turnkeyM2.confidence}`:'Không có snapshot fresh'}</div></div>
      ${quick?.status==='ready'?quickCards(quick):'<div class="alert">Snapshot hiện tại không đủ fresh để ước tính.</div>'}
    </section>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Lịch sử giá</h2><p class="hint">Được tích lũy tự động sau mỗi lần refresh.</p></div></div>
        ${trendPanel(trend)}
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Vật liệu đang theo dõi</h2><p class="hint">Dùng để phát hiện drift lớn; không cộng thẳng mọi biến động vào toàn bộ căn nhà.</p></div></div>
        <div class="material-grid">${Object.entries(market?.snapshot?.materials??{}).map(([code,row])=>`<div class="material-row"><span>${escapeHtml(MATERIAL_LABELS[code]??code)}</span><b>${number(row.center,row.unit)}</b><small>${row.sourceCount} nguồn · ${row.confidence}</small></div>`).join('')}</div>
      </section>
    </div>

    <section class="panel-block">
      <details class="advanced" open>
        <summary>Nguồn giá đang dùng</summary>
        <div class="source-table">${market?.snapshot?.turnkeyM2?.sources?.map(s=>`<a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer"><span><b>${escapeHtml(s.name)}</b><small>${escapeHtml(s.sourceDate??s.verifiedAt??s.observedAt??'')} · ${escapeHtml(s.freshness)}</small></span><strong>${money(s.min)} – ${money(s.max)}/m²</strong></a>`).join('')??''}</div>
        ${market?.snapshot?.officialAnchors?.[0]?`<p class="hint">Official anchor: ${escapeHtml(market.snapshot.officialAnchors[0].name)} · ${escapeHtml(market.snapshot.officialAnchors[0].sourceDate)}</p>`:''}
      </details>
    </section>

    <section class="panel-block">
      <div class="section-head"><div><h2>Báo giá riêng của dự án</h2><p class="hint">Tùy chọn. Khi có báo giá thật, nó mạnh hơn snapshot thị trường chung.</p></div><div class="price-source">${escapeHtml(book?.sourceLabel??'')} ${book?.effectiveDate?'· '+escapeHtml(book.effectiveDate):''}</div></div>
      <div class="form-grid">
        ${input('Nguồn báo giá','pricing.sourceLabel',project.pricing.sourceLabel)}
        ${input('Ngày báo giá','pricing.effectiveDate',project.pricing.effectiveDate,'date')}
        ${input('Bê tông (VND/m³)','pricing.items.concrete',project.pricing.items.concrete,'number')}
        ${input('Thép (VND/kg)','pricing.items.rebar',project.pricing.items.rebar,'number')}
        ${input('Xây tường (VND/m²)','pricing.items.masonry',project.pricing.items.masonry,'number')}
        ${input('Tô trát (VND/m²)','pricing.items.plaster',project.pricing.items.plaster,'number')}
        ${input('Sơn (VND/m²)','pricing.items.paint',project.pricing.items.paint,'number')}
        ${input('Điểm điện','pricing.items.electrical',project.pricing.items.electrical,'number')}
        ${input('Điểm nước','pricing.items.plumbing',project.pricing.items.plumbing,'number')}
      </div>
    </section>`;
}

function quickCards(quick) {
  return `<div class="metrics dashboard-metrics">
    ${metric('Mốc giữa',money(quick.centerVnd),'ước tính nhanh')}
    ${metric('Khoảng thấp',money(quick.lowVnd),'không phải giá chào thầu')}
    ${metric('Khoảng cao',money(quick.highVnd),quick.confidence+' confidence')}
    ${metric('Đơn giá giữa',number(quick.pricePerM2.center,'đ/m²'),quick.sourceCount+' nguồn')}
  </div>
  <div class="estimate-note">Diện tích quy đổi: <b>${quick.convertedAreaM2} m²</b> · móng ${Math.round(quick.areaAssumptions.foundationFactor*100)}% · mái ${Math.round(quick.areaAssumptions.roofFactor*100)}%.</div>`;
}

function trendPanel(trend) {
  if (trend.status==='empty') return '<p class="empty-state">Chưa có lịch sử.</p>';
  if (trend.status==='building-history') {
    return `<div class="trend-state"><strong>${money(trend.latest.turnkeyM2.center)}/m²</strong><span>Mốc đầu tiên · ${escapeHtml(trend.latest.date)}</span><p>Lịch sử đang được tích lũy từ cron hằng ngày. Khi đủ ≥2 mốc, BuildMate sẽ hiển thị % thay đổi.</p></div>`;
  }
  const direction=trend.turnkeyChangePercent>0?'↑':trend.turnkeyChangePercent<0?'↓':'→';
  return `<div class="trend-state"><strong>${direction} ${Math.abs(trend.turnkeyChangePercent)}%</strong><span>${escapeHtml(trend.previous.date)} → ${escapeHtml(trend.latest.date)}</span>
    <p>${money(trend.previous.turnkeyM2.center)}/m² → ${money(trend.latest.turnkeyM2.center)}/m²</p>
    <div class="material-drift">${trend.materialDrift.slice(0,3).map(x=>`<span>${escapeHtml(MATERIAL_LABELS[x.code]??x.code)} <b>${x.changePercent>0?'+':''}${x.changePercent}%</b></span>`).join('')}</div>
  </div>`;
}
