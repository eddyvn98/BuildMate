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
      <div class="section-head"><div><span class="eyebrow">ƯỚC TÍNH NGÂN SÁCH</span><h2>Chi phí xây nhà dự kiến</h2><p class="hint">Dựa trên giá tham khảo gần đây, BuildMate luôn hiển thị một khoảng thay vì tạo cảm giác chính xác giả.</p></div><div class="price-source">${market?.snapshot?.turnkeyM2?`${market.snapshot.turnkeyM2.sourceCount} nguồn · ${confidenceLabel(market.snapshot.turnkeyM2.confidence)}`:'Chưa đủ dữ liệu giá mới'}</div></div>
      ${quick?.status==='ready'?quickCards(quick):'<div class="alert">Dữ liệu giá hiện tại chưa đủ mới để tạo ước tính đáng tin cậy.</div>'}
    </section>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Lịch sử giá</h2><p class="hint">Theo dõi mức giá tham khảo thay đổi theo thời gian.</p></div></div>
        ${trendPanel(trend)}
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Vật liệu đang theo dõi</h2><p class="hint">Giúp nhận biết vật liệu nào biến động mạnh; BuildMate không áp một biến động vật liệu cho toàn bộ căn nhà.</p></div></div>
        <div class="material-grid">${Object.entries(market?.snapshot?.materials??{}).map(([code,row])=>`<div class="material-row"><span>${escapeHtml(MATERIAL_LABELS[code]??code)}</span><b>${number(row.center,row.unit)}</b><small>${row.sourceCount} nguồn · ${confidenceLabel(row.confidence)}</small></div>`).join('')}</div>
      </section>
    </div>

    <section class="panel-block">
      <details class="advanced">
        <summary>Xem nguồn giá tham khảo</summary>
        <div class="source-table">${market?.snapshot?.turnkeyM2?.sources?.map(s=>`<a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer"><span><b>${escapeHtml(s.name)}</b><small>${escapeHtml(s.sourceDate??s.verifiedAt??s.observedAt??'')} · ${escapeHtml(freshnessLabel(s.freshness))}</small></span><strong>${money(s.min)} – ${money(s.max)}/m²</strong></a>`).join('')??''}</div>
        ${market?.snapshot?.officialAnchors?.[0]?`<p class="hint">Mốc tham chiếu chính thức: ${escapeHtml(market.snapshot.officialAnchors[0].name)} · ${escapeHtml(market.snapshot.officialAnchors[0].sourceDate)}</p>`:''}
      </details>
    </section>

    <section class="panel-block">
      <details class="quote-details" ${book?.sourceLabel?'open':''}>
        <summary><strong>Tôi đã có báo giá riêng từ nhà thầu</strong><span>Dùng báo giá thật của dự án để thay cho mức tham khảo chung.</span></summary>
        <div class="quote-details-body">
          <div class="section-head"><div><h2>Báo giá riêng của dự án</h2><p class="hint">Các đơn giá bạn nhập ở đây sẽ được ưu tiên khi BuildMate tính chi phí kỹ thuật.</p></div><div class="price-source">${escapeHtml(book?.sourceLabel??'')} ${book?.effectiveDate?'· '+escapeHtml(book.effectiveDate):''}</div></div>
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
        </div>
      </details>
    </section>`;
}

function quickCards(quick) {
  return `<div class="metrics dashboard-metrics">
    ${metric('Mức dự kiến',money(quick.centerVnd),'ước tính tham khảo')}
    ${metric('Khoảng tham khảo',money(quick.lowVnd)+' – '+money(quick.highVnd),'chưa phải báo giá nhà thầu')}
    ${metric('Đơn giá tham khảo',number(quick.pricePerM2.center,'đ/m²'),quick.sourceCount+' nguồn')}
    ${metric('Độ tin cậy',confidenceLabel(quick.confidence),'dựa trên dữ liệu hiện có')}
  </div>
  <div class="estimate-note">Diện tích quy đổi: <b>${quick.convertedAreaM2} m²</b> · móng ${Math.round(quick.areaAssumptions.foundationFactor*100)}% · mái ${Math.round(quick.areaAssumptions.roofFactor*100)}%.</div>`;
}

function trendPanel(trend) {
  if (trend.status==='empty') return '<p class="empty-state">Chưa có lịch sử.</p>';
  if (trend.status==='building-history') {
    return `<div class="trend-state"><strong>${money(trend.latest.turnkeyM2.center)}/m²</strong><span>Mốc đầu tiên · ${escapeHtml(trend.latest.date)}</span><p>BuildMate đang tích lũy thêm các mốc giá. Khi có từ 2 mốc trở lên, hệ thống sẽ hiển thị phần trăm thay đổi.</p></div>`;
  }
  const direction=trend.turnkeyChangePercent>0?'↑':trend.turnkeyChangePercent<0?'↓':'→';
  return `<div class="trend-state"><strong>${direction} ${Math.abs(trend.turnkeyChangePercent)}%</strong><span>${escapeHtml(trend.previous.date)} → ${escapeHtml(trend.latest.date)}</span>
    <p>${money(trend.previous.turnkeyM2.center)}/m² → ${money(trend.latest.turnkeyM2.center)}/m²</p>
    <div class="material-drift">${trend.materialDrift.slice(0,3).map(x=>`<span>${escapeHtml(MATERIAL_LABELS[x.code]??x.code)} <b>${x.changePercent>0?'+':''}${x.changePercent}%</b></span>`).join('')}</div>
  </div>`;
}


function confidenceLabel(value) {
  return ({high:'Cao',medium:'Trung bình',low:'Thấp'})[String(value??'').toLowerCase()]??String(value??'Chưa xác định');
}

function freshnessLabel(value) {
  return ({fresh:'Còn mới',stale:'Đã cũ',expired:'Hết hạn'})[String(value??'').toLowerCase()]??String(value??'');
}
