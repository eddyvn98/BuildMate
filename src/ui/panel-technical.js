import { escapeHtml,metric,input } from './common.js';
import { money,number } from './render.js';
import { journeyNextStep } from './journey-next.js';
import { homeownerNextActions } from '../engine/homeowner-next-actions.js';

export function technicalPanel(project,workflow) {
  const pack=workflow.results?.technicalPackage;
  if(!pack) return '<section class="panel-block"><p class="empty-state">Chưa có hồ sơ kỹ thuật.</p></section>';
  const m=pack.model,t=pack.takeoff,b=pack.boq;
  const beam=m.structural.beams[0];
  const lowerColumn=m.structural.columns[0];
  const footing=m.structural.foundations[0];
  const slab=m.structural.slabs[0];
  const boqGroups=groupBoq(b.rows);
  const nextDataActions=homeownerNextActions(project,{limit:3});

  return `
    <section class="panel-block technical-hero">
      <div class="section-head">
        <div>
          <span class="eyebrow">Hồ sơ kỹ thuật</span>
          <h2>Tổng quan căn nhà</h2>
          <p class="hint">BuildMate ưu tiên phần bạn cần biết trước. Bảng tính và thông số chuyên sâu vẫn còn, nhưng được thu gọn bên dưới.</p>
        </div>
        <span class="badge">Sơ bộ</span>
      </div>
      <div class="metrics">
        ${metric('Bê tông',number(t.summary.concreteM3,'m³'),'toàn nhà')}
        ${metric('Thép',number(t.summary.rebarKg,'kg'),'toàn nhà')}
        ${metric('Chi phí đã tính',money(b.pricedSubtotalVnd),b.pricedRowCount+' dòng có giá')}
        ${metric('Nhóm đã có tính toán',Math.round(pack.softwareCompletion.calculationDomainPercent*6/100)+' / 6','không phải mức sẵn sàng thi công')}
      </div>
      <div class="technical-readiness">
        <div><strong>Hồ sơ này dùng để lập kế hoạch sơ bộ</strong><span>BuildMate đã tổng hợp cấu kiện, vật tư và chi phí từ dữ liệu hiện có. Đây chưa phải hồ sơ đủ điều kiện thi công.</span></div>
        <span class="technical-readiness-count">${pack.blockers.length} mục cần bổ sung</span>
      </div>
      ${pack.blockers.length?'<div class="technical-next-gap"><b>Cần bổ sung tiếp:</b> '+escapeHtml(pack.blockers[0])+(pack.blockers.length>1?' · và '+(pack.blockers.length-1)+' mục khác':'')+'</div>':''}
      ${supplementActions(nextDataActions)}
    </section>

    <section class="panel-block">
      <div class="section-head">
        <div><h2>Cấu kiện chính</h2><p class="hint">Kích thước sơ bộ để bạn hình dung phương án. Chi tiết cốt thép nằm trong phần mở rộng bên dưới.</p></div>
      </div>
      <div class="technical-summary-grid">
        ${memberCard('Sàn',slab?'d '+slab.thicknessMm+' mm':'—','Kích thước sơ bộ')}
        ${memberCard('Dầm chính',beam?beam.bMm+' × '+beam.hMm+' mm':'—','Kích thước sơ bộ')}
        ${memberCard('Cột tầng dưới',lowerColumn?lowerColumn.bMm+' × '+lowerColumn.hMm+' mm':'—','Kích thước sơ bộ')}
        ${memberCard('Móng',footing?footing.lengthM+' × '+footing.widthM+' × '+footing.thicknessM+' m':'—','Kích thước sơ bộ')}
      </div>
      <details class="technical-details">
        <summary>Xem bảng cấu kiện đầy đủ</summary>
        <div class="details-body">
          <p class="hint">${m.grid.longitudinalBays} nhịp dọc × ${m.grid.transverseBays} nhịp ngang · ${m.grid.columnGridPoints} điểm cột.</p>
          ${memberSchedule('Sàn',m.structural.slabs,'slab')}
          ${memberSchedule('Dầm',m.structural.beams,'beam')}
          ${memberSchedule('Cột',m.structural.columns,'column')}
          ${memberSchedule('Móng',m.structural.foundations,'foundation')}
          ${memberSchedule('Giằng móng',m.structural.tieBeams,'beam')}
          ${memberSchedule('Cầu thang',m.structural.stairs,'stair')}
        </div>
      </details>
    </section>

    <div class="two-col technical-simple-grid">
      <section class="panel-block">
        <div class="section-head"><div><h2>Vật tư chính</h2><p class="hint">Các nhóm ảnh hưởng lớn nhất đến khối lượng và chi phí.</p></div></div>
        <div class="material-highlight-grid">
          ${materialHighlight('Bê tông',number(t.summary.concreteM3,'m³'))}
          ${materialHighlight('Thép',number(t.summary.rebarKg,'kg'))}
          ${materialHighlight('Cốp pha',number(t.summary.formworkM2,'m²'))}
          ${materialHighlight('Tường xây',number(t.summary.masonryM2,'m²'))}
        </div>
        <details class="technical-details">
          <summary>Xem vật tư chi tiết</summary>
          <div class="details-body two-col">
            <div>
              <h3>Thép theo đường kính</h3>
              ${simpleRows(t.items.filter(x=>x.kind==='rebar').map(x=>[x.label,number(x.value,'kg'),x.lengthM?number(x.lengthM,'m'):'']))}
            </div>
            <div>
              <h3>Hoàn thiện</h3>
              ${simpleRows(t.items.filter(x=>['masonry','plaster','paint','tile','waterproofing','brick','mortar'].includes(x.kind)).map(x=>[x.label,number(x.value,x.unit),'']))}
            </div>
          </div>
        </details>
      </section>

      <section class="panel-block">
        <div class="section-head"><div><h2>Điện & nước</h2><p class="hint">Xem nhanh số điểm và quy mô hệ thống.</p></div></div>
        <div class="material-highlight-grid">
          ${materialHighlight('Điểm điện',String(m.mep.electrical.totalPoints))}
          ${materialHighlight('Mạch điện',String(m.mep.electrical.circuits.reduce((a,x)=>a+x.count,0)))}
          ${materialHighlight('Thiết bị nước',String(m.mep.plumbing.totalFixtures))}
          ${materialHighlight('Bồn nước',number(m.mep.plumbing.waterTankLiters,'L'))}
        </div>
        <details class="technical-details">
          <summary>Xem điện & nước chi tiết</summary>
          <div class="details-body">
            ${scheduleTable('Mạch điện',m.mep.electrical.circuits,['id','label','count','cableMm2','breakerA'],['Mã','Nhóm','SL','Cáp mm²','CB A'])}
            <div class="two-col">
              <div>
                <h3>Cáp</h3>
                ${simpleRows(t.items.filter(x=>x.section==='electrical'&&x.kind==='cable').map(x=>[x.label,number(x.value,'m'),'']))}
              </div>
              <div>
                <h3>Ống nước</h3>
                ${simpleRows(t.items.filter(x=>x.section==='plumbing'&&x.kind==='pipe').map(x=>[x.label,number(x.value,'m'),'']))}
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>

    <section class="panel-block">
      <div class="section-head">
        <div><h2>Chi phí kỹ thuật</h2><p class="hint">Tổng các dòng đã có đơn giá hiện tại. Dòng chưa có giá vẫn được giữ lại để bổ sung sau.</p></div>
        <strong class="technical-total">${money(b.pricedSubtotalVnd)}</strong>
      </div>
      <div class="boq-group-grid">
        ${boqGroups.map(x=>boqGroupCard(x.label,money(x.amountVnd),x.rows+' dòng')).join('')}
      </div>
      <div class="technical-cost-note">${b.unpricedCount} dòng chưa có đơn giá.</div>
      <details class="technical-details">
        <summary>Xem BOQ đầy đủ</summary>
        <div class="details-body">
          <div class="table-wrap borderless-table-wrap"><table class="technical-table boq-table"><colgroup><col class="col-group"><col class="col-item"><col class="col-qty"><col class="col-unit"><col class="col-price"><col class="col-total"><col class="col-source"></colgroup><thead><tr><th>Nhóm</th><th>Hạng mục</th><th class="numeric-cell">KL</th><th class="center-cell">ĐVT</th><th class="numeric-cell">Đơn giá</th><th class="numeric-cell">Thành tiền</th><th>Nguồn giá</th></tr></thead><tbody>
          ${b.rows.map(r=>`<tr><td>${escapeHtml(sectionLabel(r.section))}</td><td>${escapeHtml(r.label)}</td><td class="numeric-cell">${escapeHtml(r.quantity)}</td><td class="center-cell">${escapeHtml(r.unit)}</td><td class="numeric-cell">${r.unitPriceVnd==null?'—':money(r.unitPriceVnd)}</td><td class="numeric-cell">${r.amountVnd==null?'—':money(r.amountVnd)}</td><td><small>${escapeHtml(r.priceSource??'')}</small></td></tr>`).join('')}
          </tbody></table></div>
          <details class="advanced"><summary>Dòng chưa có đơn giá (${b.unpricedItems.length})</summary>${simpleRows(b.unpricedItems.map(x=>[x.label,number(x.quantity,x.unit),sectionLabel(x.section)]))}</details>
        </div>
      </details>
    </section>

    <section class="panel-block technical-advanced-zone">
      <details class="technical-details">
        <summary>Tùy chỉnh phương án nâng cao</summary>
        <div class="details-body">
          <p class="hint">Chỉ cần dùng khi bạn muốn thử thay đổi kích thước cấu kiện. Mỗi thay đổi sẽ tự cập nhật vật tư và BOQ.</p>
          <div class="parameter-groups">
            <section class="parameter-group"><h3>Chung & sàn</h3><div class="form-grid compact-form technical-parameter-grid">
              ${input('Chiều cao tầng (m)','technicalModel.floorHeightM',project.technicalModel.floorHeightM,'number','2.6','5','0.1')}
              ${input('Sàn dày (mm)','technicalModel.slabThicknessMm',project.technicalModel.slabThicknessMm,'number','80','250','5')}
              ${input('Thép sàn Ø (mm)','technicalModel.slabBarDiameterMm',project.technicalModel.slabBarDiameterMm,'number','6','20','1')}
              ${input('Bước thép sàn (mm)','technicalModel.slabBarSpacingMm',project.technicalModel.slabBarSpacingMm,'number','80','300','10')}
            </div></section>
            <section class="parameter-group"><h3>Dầm</h3><div class="form-grid compact-form technical-parameter-grid">
              ${input('Dầm b (mm)','technicalModel.beamWidthMm',project.technicalModel.beamWidthMm,'number','150','500','10')}
              ${input('Dầm h (mm)','technicalModel.beamDepthMm',project.technicalModel.beamDepthMm,'number','250','900','10')}
              ${input('Thép dọc - số thanh','technicalModel.beamMainCount',project.technicalModel.beamMainCount,'number','2','12','1')}
              ${input('Thép dọc Ø (mm)','technicalModel.beamMainDiameterMm',project.technicalModel.beamMainDiameterMm,'number','10','32','1')}
              ${input('Đai Ø (mm)','technicalModel.beamStirrupDiameterMm',project.technicalModel.beamStirrupDiameterMm,'number','6','14','1')}
              ${input('Bước đai (mm)','technicalModel.beamStirrupSpacingMm',project.technicalModel.beamStirrupSpacingMm,'number','80','300','10')}
            </div></section>
            <section class="parameter-group"><h3>Cột</h3><div class="form-grid compact-form technical-parameter-grid">
              ${input('Cột dưới b (mm)','technicalModel.lowerColumnWidthMm',project.technicalModel.lowerColumnWidthMm,'number','180','600','10')}
              ${input('Cột dưới h (mm)','technicalModel.lowerColumnDepthMm',project.technicalModel.lowerColumnDepthMm,'number','180','600','10')}
              ${input('Cột trên b (mm)','technicalModel.upperColumnWidthMm',project.technicalModel.upperColumnWidthMm,'number','180','600','10')}
              ${input('Cột trên h (mm)','technicalModel.upperColumnDepthMm',project.technicalModel.upperColumnDepthMm,'number','180','600','10')}
            </div></section>
            <section class="parameter-group"><h3>Móng & tường</h3><div class="form-grid compact-form technical-parameter-grid">
              ${input('Móng dài (m)','technicalModel.footingLengthM',project.technicalModel.footingLengthM,'number','0.6','4','0.1')}
              ${input('Móng rộng (m)','technicalModel.footingWidthM',project.technicalModel.footingWidthM,'number','0.6','4','0.1')}
              ${input('Móng dày (m)','technicalModel.footingThicknessM',project.technicalModel.footingThicknessM,'number','0.2','1.2','0.05')}
              ${input('Thép móng Ø (mm)','technicalModel.footingBarDiameterMm',project.technicalModel.footingBarDiameterMm,'number','8','25','1')}
              ${input('Bước thép móng (mm)','technicalModel.footingBarSpacingMm',project.technicalModel.footingBarSpacingMm,'number','80','300','10')}
              ${input('Tường dày (mm)','technicalModel.wallThicknessMm',project.technicalModel.wallThicknessMm,'number','80','220','10')}
            </div></section>
          </div>
        </div>
      </details>

      <details class="technical-details">
        <summary>Các dữ liệu còn cần bổ sung</summary>
        <div class="details-body">
          <p class="hint">BuildMate đã tạo đủ dữ liệu sơ bộ để lập kế hoạch. Các mục dưới đây chỉ cần khi muốn tiến gần hơn tới hồ sơ thi công.</p>
          <div class="blocker-list">${pack.blockers.map(x=>'<div class="alert">'+escapeHtml(x)+'</div>').join('')}</div>
        </div>
      </details>
    </section>\n\n    ${journeyNextStep(project,{currentView:'technical'})}`;
}

function memberCard(label,size,detail){
  return `<article class="technical-summary-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(size)}</strong><small>${escapeHtml(detail)}</small></article>`;
}
function materialHighlight(label,value){
  return `<div class="material-highlight"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}
function boqGroupCard(label,value,meta){
  return `<div class="boq-group-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(meta)}</small></div>`;
}
function groupBoq(rows){
  const map=new Map();
  for(const row of rows??[]){
    if(row.amountVnd==null) continue;
    const key=row.section;
    const current=map.get(key)??{section:key,amountVnd:0,rows:0};
    current.amountVnd+=Number(row.amountVnd||0);
    current.rows+=1;
    map.set(key,current);
  }
  return [...map.values()].sort((a,b)=>b.amountVnd-a.amountVnd).map(x=>({...x,label:sectionLabel(x.section)}));
}
function sectionLabel(section){
  return ({structure:'Kết cấu',foundation:'Móng',architecture:'Xây dựng',finishes:'Hoàn thiện',electrical:'Điện',plumbing:'Nước'})[section]??section;
}
function scheduleTable(title,rows,keys,labels){
  if(!rows?.length) return '';
  const numericKeys=new Set(['count','cableMm2','breakerA']);
  return `<h3>${escapeHtml(title)}</h3><div class="table-wrap borderless-table-wrap"><table class="technical-table compact-data-table"><thead><tr>${labels.map((x,index)=>'<th class="'+(numericKeys.has(keys[index])?'numeric-cell':'')+'">'+escapeHtml(x)+'</th>').join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+keys.map(k=>'<td class="'+(numericKeys.has(k)?'numeric-cell':'')+'">'+escapeHtml(formatValue(row[k]))+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;
}
function memberSchedule(title,rows,type){
  if(!rows?.length) return '';
  const body=rows.map(row=>`<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(memberQuantity(row,type))}</td><td class="numeric-cell">${escapeHtml(memberSize(row,type))}</td><td>${escapeHtml(rebarDetail(row,type))}</td></tr>`).join('');
  return `<h3>${escapeHtml(title)}</h3><div class="table-wrap borderless-table-wrap"><table class="technical-table member-schedule-table"><colgroup><col class="member-code"><col class="member-qty"><col class="member-size"><col class="member-rebar"></colgroup><thead><tr><th>Mã</th><th>SL/Quy mô</th><th class="numeric-cell">Kích thước</th><th>Cốt thép</th></tr></thead><tbody>${body}</tbody></table></div>`;
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
  if(type==='slab') return 'Ø'+r.reinforcement.bottom.diameterMm+'a'+r.reinforcement.bottom.spacingMm+' 2 phương';
  if(type==='beam') return r.mainBars.count+'Ø'+r.mainBars.diameterMm+(r.extraTop?' + '+r.extraTop.count+'Ø'+r.extraTop.diameterMm:'')+' · đai Ø'+r.stirrups.diameterMm+'a'+r.stirrups.spacingMm;
  if(type==='column') return r.verticalBars.count+'Ø'+r.verticalBars.diameterMm+' · đai Ø'+r.ties.diameterMm+'a'+r.ties.spacingMm;
  if(type==='foundation') return 'Ø'+r.bottomMesh.diameterMm+'a'+r.bottomMesh.spacingMm+' 2 phương';
  if(type==='stair') return 'Ø'+r.mainBars.diameterMm+'a'+r.mainBars.spacingMm+' · phân bố Ø'+r.distributionBars.diameterMm+'a'+r.distributionBars.spacingMm;
  return '—';
}
function simpleRows(rows){
  return '<div class="material-grid">'+rows.map(r=>'<div class="material-row"><span>'+escapeHtml(r[0])+'</span><b class="numeric-cell">'+escapeHtml(r[1])+'</b><small>'+escapeHtml(r[2]??'')+'</small></div>').join('')+'</div>';
}

function supplementActions(actions){
  if(!actions?.length) return '';
  return `<div class="data-supplement-bar"><div><strong>Bổ sung dữ liệu</strong><span>Đi thẳng tới nơi nhập dữ liệu đang thiếu.</span></div><div class="data-supplement-actions">${actions.map(action=>`<button type="button" class="ghost" data-go-view="${escapeHtml(action.view)}" ${action.guidedAction?`data-guided-action="${escapeHtml(action.guidedAction)}"`:''}>${escapeHtml(action.title)}</button>`).join('')}</div></div>`;
}
function formatValue(v){return v==null?'—':typeof v==='object'?JSON.stringify(v):String(v);}
