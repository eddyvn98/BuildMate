import { escapeHtml,metric,input } from './common.js';
import { money,number } from './render.js';

export function technicalPanel(project,workflow) {
  const pack=workflow.results?.technicalPackage;
  if(!pack) return '<section class="panel-block"><p class="empty-state">Chưa có technical package.</p></section>';
  const m=pack.model,t=pack.takeoff,b=pack.boq;
  return `
    <section class="panel-block technical-hero">
      <div class="section-head"><div><span class="eyebrow">v1.0 Technical Package</span><h2>Hồ sơ kỹ thuật sơ bộ</h2><p class="hint">Cấu kiện → vật tư → BOQ được bóc từ mô hình hình học. Các cấu kiện chưa có calculation riêng vẫn mang mức preliminary.</p></div><span class="badge">${escapeHtml(pack.level)}</span></div>
      <div class="metrics">
        ${metric('Bê tông',number(t.summary.concreteM3,'m³'),'từ cấu kiện')}
        ${metric('Thép',number(t.summary.rebarKg,'kg'),'theo Ø')}
        ${metric('Cốp pha',number(t.summary.formworkM2,'m²'),'theo hình học')}
        ${metric('BOQ đã có giá',money(b.pricedSubtotalVnd),b.pricedRowCount+' dòng')}
      </div>
    </section>

    <section class="panel-block">
      <details class="advanced" open>
        <summary>Chỉnh phương án cấu kiện preliminary</summary>
        <p class="hint">Các ô này điều khiển trực tiếp schedule → bóc vật tư → BOQ. Thay đổi không biến chúng thành thiết kế thi công; calculation/evidence vẫn là bước xác nhận.</p>
        <div class="form-grid">
          ${input('Chiều cao tầng (m)','technicalModel.floorHeightM',project.technicalModel.floorHeightM,'number','2.6','5','0.1')}
          ${input('Sàn dày (mm)','technicalModel.slabThicknessMm',project.technicalModel.slabThicknessMm,'number','80','250','5')}
          ${input('Thép sàn Ø (mm)','technicalModel.slabBarDiameterMm',project.technicalModel.slabBarDiameterMm,'number','6','20','1')}
          ${input('Bước thép sàn (mm)','technicalModel.slabBarSpacingMm',project.technicalModel.slabBarSpacingMm,'number','80','300','10')}
          ${input('Dầm b (mm)','technicalModel.beamWidthMm',project.technicalModel.beamWidthMm,'number','150','500','10')}
          ${input('Dầm h (mm)','technicalModel.beamDepthMm',project.technicalModel.beamDepthMm,'number','250','900','10')}
          ${input('Thép dọc dầm - số thanh','technicalModel.beamMainCount',project.technicalModel.beamMainCount,'number','2','12','1')}
          ${input('Thép dọc dầm Ø (mm)','technicalModel.beamMainDiameterMm',project.technicalModel.beamMainDiameterMm,'number','10','32','1')}
          ${input('Đai dầm Ø (mm)','technicalModel.beamStirrupDiameterMm',project.technicalModel.beamStirrupDiameterMm,'number','6','14','1')}
          ${input('Bước đai dầm (mm)','technicalModel.beamStirrupSpacingMm',project.technicalModel.beamStirrupSpacingMm,'number','80','300','10')}
          ${input('Cột dưới b (mm)','technicalModel.lowerColumnWidthMm',project.technicalModel.lowerColumnWidthMm,'number','180','600','10')}
          ${input('Cột dưới h (mm)','technicalModel.lowerColumnDepthMm',project.technicalModel.lowerColumnDepthMm,'number','180','600','10')}
          ${input('Cột trên b (mm)','technicalModel.upperColumnWidthMm',project.technicalModel.upperColumnWidthMm,'number','180','600','10')}
          ${input('Cột trên h (mm)','technicalModel.upperColumnDepthMm',project.technicalModel.upperColumnDepthMm,'number','180','600','10')}
          ${input('Móng dài (m)','technicalModel.footingLengthM',project.technicalModel.footingLengthM,'number','0.6','4','0.1')}
          ${input('Móng rộng (m)','technicalModel.footingWidthM',project.technicalModel.footingWidthM,'number','0.6','4','0.1')}
          ${input('Móng dày (m)','technicalModel.footingThicknessM',project.technicalModel.footingThicknessM,'number','0.2','1.2','0.05')}
          ${input('Thép móng Ø (mm)','technicalModel.footingBarDiameterMm',project.technicalModel.footingBarDiameterMm,'number','8','25','1')}
          ${input('Bước thép móng (mm)','technicalModel.footingBarSpacingMm',project.technicalModel.footingBarSpacingMm,'number','80','300','10')}
          ${input('Tường dày (mm)','technicalModel.wallThicknessMm',project.technicalModel.wallThicknessMm,'number','80','220','10')}
        </div>
      </details>
    </section>

    <section class="panel-block">
      <div class="section-head"><div><h2>Lưới & kích thước cấu kiện</h2><p class="hint">${m.grid.longitudinalBays} nhịp dọc × ${m.grid.transverseBays} nhịp ngang · ${m.grid.columnGridPoints} điểm cột.</p></div></div>
      ${memberSchedule('Sàn',m.structural.slabs,'slab')}
      ${memberSchedule('Dầm',m.structural.beams,'beam')}
      ${memberSchedule('Cột',m.structural.columns,'column')}
      ${memberSchedule('Móng',m.structural.foundations,'foundation')}
      ${memberSchedule('Giằng móng',m.structural.tieBeams,'beam')}
      ${memberSchedule('Cầu thang',m.structural.stairs,'stair')}
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
      <div class="section-head"><div><h2>Package status</h2><p class="hint">Software package: ready · calculation domain ${pack.softwareCompletion.calculationDomainPercent}% · priced takeoff ${pack.softwareCompletion.pricedTakeoffPercent}%. Chưa đồng nghĩa từng cấu kiện đã được thiết kế/duyệt.</p></div></div>
      <div class="blocker-list">${pack.blockers.map(x=>'<div class="alert">'+escapeHtml(x)+'</div>').join('')}</div>
    </section>`;
}

function scheduleTable(title,rows,keys,labels){
  if(!rows?.length) return '';
  return `<h3>${escapeHtml(title)}</h3><div class="table-wrap"><table class="technical-table"><thead><tr>${labels.map(x=>'<th>'+escapeHtml(x)+'</th>').join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+keys.map(k=>'<td>'+escapeHtml(formatValue(row[k]))+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;
}
function memberSchedule(title,rows,type){
  if(!rows?.length) return '';
  const body=rows.map(row=>`<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(memberQuantity(row,type))}</td><td>${escapeHtml(memberSize(row,type))}</td><td>${escapeHtml(rebarDetail(row,type))}</td><td><small>${escapeHtml(row.basis??'')}</small></td></tr>`).join('');
  return `<h3>${escapeHtml(title)}</h3><div class="table-wrap"><table class="technical-table"><thead><tr><th>Mã</th><th>SL/Quy mô</th><th>Kích thước</th><th>Cốt thép sơ bộ</th><th>Mức</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function memberQuantity(r,type){
  if(type==='slab') return (r.level??'')+' · '+(r.areaM2??'')+' m²';
  if(type==='beam') return (r.quantity??0)+' đoạn · '+(r.totalLengthM??0)+' m';
  if(type==='column') return (r.quantity??0)+' đoạn · '+(r.segmentHeightM??0)+' m/đoạn';
  if(type==='foundation') return (r.quantity??0)+' móng';
  if(type==='stair') return (r.quantity??0)+' bộ';
  return String(r.quantity??'');
}
function memberSize(r,type){
  if(type==='slab') return 'd='+r.thicknessMm+' mm';
  if(type==='beam'||type==='column') return r.bMm+'×'+r.hMm+' mm';
  if(type==='foundation') return r.lengthM+'×'+r.widthM+'×'+r.thicknessM+' m';
  if(type==='stair') return 'rộng '+r.widthM+' m · d='+r.thicknessMm+' mm';
  return '—';
}
function rebarDetail(r,type){
  if(type==='slab') return 'Dưới Ø'+r.reinforcement.bottom.diameterMm+'a'+r.reinforcement.bottom.spacingMm+' 2 phương · gối Ø'+r.reinforcement.supportTop.diameterMm+'a'+r.reinforcement.supportTop.spacingMm;
  if(type==='beam') return r.mainBars.count+'Ø'+r.mainBars.diameterMm+(r.extraTop?' + '+r.extraTop.count+'Ø'+r.extraTop.diameterMm:'')+' · đai Ø'+r.stirrups.diameterMm+'a'+r.stirrups.spacingMm;
  if(type==='column') return r.verticalBars.count+'Ø'+r.verticalBars.diameterMm+' · đai Ø'+r.ties.diameterMm+'a'+r.ties.spacingMm;
  if(type==='foundation') return 'Đáy Ø'+r.bottomMesh.diameterMm+'a'+r.bottomMesh.spacingMm+' 2 phương';
  if(type==='stair') return 'Chịu lực Ø'+r.mainBars.diameterMm+'a'+r.mainBars.spacingMm+' · phân bố Ø'+r.distributionBars.diameterMm+'a'+r.distributionBars.spacingMm;
  return '—';
}
function simpleRows(rows){
  return '<div class="material-grid">'+rows.map(r=>'<div class="material-row"><span>'+escapeHtml(r[0])+'</span><b>'+escapeHtml(r[1])+'</b><small>'+escapeHtml(r[2]??'')+'</small></div>').join('')+'</div>';
}
function formatValue(v){return v==null?'—':typeof v==='object'?JSON.stringify(v):String(v);}
function fixtureLabel(k){return ({toilets:'Bồn cầu',washBasins:'Lavabo',showers:'Vòi sen',kitchenSinks:'Chậu bếp',washingMachines:'Máy giặt',floorDrains:'Phễu sàn'})[k]??k;}
