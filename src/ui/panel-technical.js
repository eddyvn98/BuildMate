import { escapeHtml,metric } from './common.js';
import { money,number } from './render.js';

export function technicalPanel(project,workflow) {
  const pack=workflow.results?.technicalPackage;
  if(!pack) return '<section class="panel-block"><p class="empty-state">Chưa có technical package.</p></section>';
  const m=pack.model,t=pack.takeoff,b=pack.boq;
  return `
    <section class="panel-block technical-hero">
      <div class="section-head"><div><span class="eyebrow">v0.9 Technical Package</span><h2>Hồ sơ kỹ thuật sơ bộ</h2><p class="hint">Cấu kiện → vật tư → BOQ được bóc từ mô hình hình học. Các cấu kiện chưa có calculation riêng vẫn mang mức preliminary.</p></div><span class="badge">${escapeHtml(pack.level)}</span></div>
      <div class="metrics">
        ${metric('Bê tông',number(t.summary.concreteM3,'m³'),'từ cấu kiện')}
        ${metric('Thép',number(t.summary.rebarKg,'kg'),'theo Ø')}
        ${metric('Cốp pha',number(t.summary.formworkM2,'m²'),'theo hình học')}
        ${metric('BOQ đã có giá',money(b.pricedSubtotalVnd),b.pricedRowCount+' dòng')}
      </div>
    </section>

    <section class="panel-block">
      <div class="section-head"><div><h2>Lưới & kích thước cấu kiện</h2><p class="hint">${m.grid.longitudinalBays} nhịp dọc × ${m.grid.transverseBays} nhịp ngang · ${m.grid.columnGridPoints} điểm cột.</p></div></div>
      ${scheduleTable('Sàn',m.structural.slabs,['id','level','areaM2','thicknessMm'],['Mã','Tầng','Diện tích m²','d mm'])}
      ${scheduleTable('Dầm',m.structural.beams,['id','quantity','totalLengthM','bMm','hMm'],['Mã','SL','Tổng dài m','b mm','h mm'])}
      ${scheduleTable('Cột',m.structural.columns,['id','quantity','segmentHeightM','bMm','hMm'],['Mã','SL đoạn','Cao đoạn m','b mm','h mm'])}
      ${scheduleTable('Móng',m.structural.foundations,['id','type','quantity','lengthM','widthM','thicknessM'],['Mã','Loại','SL','Dài m','Rộng m','d m'])}
      ${scheduleTable('Giằng móng',m.structural.tieBeams,['id','quantity','totalLengthM','bMm','hMm'],['Mã','SL','Tổng dài m','b mm','h mm'])}
      ${scheduleTable('Cầu thang',m.structural.stairs,['id','quantity','widthM','thicknessMm'],['Mã','SL','Rộng m','d mm'])}
    </section>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Thép theo đường kính</h2><p class="hint">Đã cộng 3% hao hụt sau detailing sơ bộ.</p></div></div>
        ${simpleRows(t.items.filter(x=>x.kind==='rebar').map(x=>[x.label,number(x.value,'kg'),x.lengthM?number(x.lengthM,'m'):'']))}
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Kiến trúc & hoàn thiện</h2><p class="hint">Bóc từ footprint + wall model.</p></div></div>
        ${simpleRows(t.items.filter(x=>['masonry','plaster','paint','tile','waterproofing','brick','mortar'].includes(x.kind)).map(x=>[x.label,number(x.value,x.unit),'']))}
      </section>
    </div>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Điện</h2><p class="hint">${m.mep.electrical.totalPoints} điểm · ${m.mep.electrical.circuits.reduce((a,x)=>a+x.count,0)} circuit sơ bộ.</p></div></div>
        ${scheduleTable('Circuit',m.mep.electrical.circuits,['id','label','count','cableMm2','breakerA'],['Mã','Nhóm','SL','Cáp mm²','CB A'])}
        ${simpleRows(t.items.filter(x=>x.section==='electrical'&&x.kind==='cable').map(x=>[x.label,number(x.value,'m'),'']))}
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Nước</h2><p class="hint">${m.mep.plumbing.totalFixtures} fixture · bồn sơ bộ ${m.mep.plumbing.waterTankLiters} L.</p></div></div>
        ${simpleRows(Object.entries(m.mep.plumbing.fixtures).map(([k,v])=>[fixtureLabel(k),String(v),'']))}
        ${simpleRows(t.items.filter(x=>x.section==='plumbing'&&x.kind==='pipe').map(x=>[x.label,number(x.value,'m'),'']))}
      </section>
    </div>

    <section class="panel-block">
      <div class="section-head"><div><h2>BOQ theo hạng mục</h2><p class="hint">Dòng có giá dùng market snapshot/project price book; dòng chưa có giá được giữ unpriced thay vì tự đoán.</p></div><span>${b.unpricedCount} dòng chưa có giá</span></div>
      <div class="table-wrap"><table class="technical-table"><thead><tr><th>Nhóm</th><th>Hạng mục</th><th>KL</th><th>ĐVT</th><th>Đơn giá</th><th>Thành tiền</th><th>Nguồn giá</th></tr></thead><tbody>
      ${b.rows.map(r=>`<tr><td>${escapeHtml(r.section)}</td><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.quantity)}</td><td>${escapeHtml(r.unit)}</td><td>${r.unitPriceVnd==null?'—':money(r.unitPriceVnd)}</td><td>${r.amountVnd==null?'—':money(r.amountVnd)}</td><td><small>${escapeHtml(r.priceSource??'')}</small></td></tr>`).join('')}
      </tbody></table></div>
      <details class="advanced"><summary>Dòng chưa có đơn giá (${b.unpricedItems.length})</summary>${simpleRows(b.unpricedItems.map(x=>[x.label,number(x.quantity,x.unit),x.section]))}</details>
    </section>

    <section class="panel-block">
      <div class="section-head"><div><h2>Calculation coverage</h2><p class="hint">${pack.calculationCoverage.readyDomains}/6 domain có representative calculation run; chưa đồng nghĩa từng cấu kiện đã được thiết kế.</p></div></div>
      <div class="blocker-list">${pack.blockers.map(x=>'<div class="alert">'+escapeHtml(x)+'</div>').join('')}</div>
    </section>`;
}

function scheduleTable(title,rows,keys,labels){
  if(!rows?.length) return '';
  return `<h3>${escapeHtml(title)}</h3><div class="table-wrap"><table class="technical-table"><thead><tr>${labels.map(x=>'<th>'+escapeHtml(x)+'</th>').join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+keys.map(k=>'<td>'+escapeHtml(formatValue(row[k]))+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;
}
function simpleRows(rows){
  return '<div class="material-grid">'+rows.map(r=>'<div class="material-row"><span>'+escapeHtml(r[0])+'</span><b>'+escapeHtml(r[1])+'</b><small>'+escapeHtml(r[2]??'')+'</small></div>').join('')+'</div>';
}
function formatValue(v){return v==null?'—':typeof v==='object'?JSON.stringify(v):String(v);}
function fixtureLabel(k){return ({toilets:'Bồn cầu',washBasins:'Lavabo',showers:'Vòi sen',kitchenSinks:'Chậu bếp',washingMachines:'Máy giặt',floorDrains:'Phễu sàn'})[k]??k;}
