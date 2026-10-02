import { functionalPlan } from './render.js';
import { escapeHtml,icon,input,option } from './common.js';
import { journeyNextStep } from './journey-next.js';

export function projectPanel(project,{documentImportState={status:'idle'}}={}) {
  return `
    <section class="panel-block">
      <div class="section-head"><div><h2>Mô tả ngôi nhà bằng lời</h2><p class="hint">Nhập những gì bạn biết; BuildMate sẽ tách thành dữ liệu có trạng thái.</p></div></div>
      <p class="question" id="next-question"></p>
      <form id="chat-form" class="chat-form"><textarea id="chat-text" placeholder="Ví dụ: đất 4x16 ở TP.HCM, 5 người, 3 tầng, 4 phòng ngủ, ngân sách 1,5 tỷ"></textarea><button class="icon-button primary-icon" title="Phân tích thông tin" aria-label="Phân tích thông tin">${icon('send')}</button></form>
      <div class="document-import-bar">
        <div><strong>Bổ sung từ tài liệu</strong><span>PDF · Excel · ảnh · TXT/CSV/JSON · luôn review trước khi ghi vào dự án.</span></div>
        <button type="button" id="pick-document-import" class="ghost">${icon('upload')}<span>Chọn tài liệu</span></button>
        <input id="document-import-file" type="file" accept=".pdf,.xlsx,.xls,.txt,.csv,.tsv,.json,.md,image/*" hidden>
      </div>
      ${documentImportView(documentImportState)}
    </section>

    <section class="panel-block compact-panel">
      <div class="section-head"><div><h2>Thông tin cơ bản</h2><p class="hint">Đây là các biến ảnh hưởng trực tiếp tới quy mô và ngân sách.</p></div></div>
      <div class="form-grid compact-form content-form">
        ${input('Tỉnh/thành','location.province',project.location.province)}
        ${input('Quận/huyện','location.district',project.location.district)}
        ${input('Rộng đất (m)','land.widthM',project.land.widthM,'number')}
        ${input('Dài đất (m)','land.lengthM',project.land.lengthM,'number')}
        ${input('Số tầng','design.storeys',project.design.storeys,'number','1','5')}
        ${input('Tỷ lệ chiếm đất','design.footprintRatio',project.design.footprintRatio,'number','0.4','1','0.05')}
        ${input('Số người','household.people',project.household.people,'number')}
        ${input('Phòng ngủ','household.bedrooms',project.household.bedrooms,'number')}
        ${input('Ngân sách mục tiêu','budget.totalVnd',project.budget.totalVnd,'number')}
        <label class="field-control field-select"><span class="field-label"><span>Mức hoàn thiện</span></span><select data-path="design.finishLevel">
          ${option(project.design.finishLevel.value,'economy','Tiết kiệm')}
          ${option(project.design.finishLevel.value,'balanced','Cân bằng')}
          ${option(project.design.finishLevel.value,'comfort','Thoải mái')}
        </select></label>
        <div class="compact-checks">
          <label class="check"><input data-path="household.hasCar" type="checkbox" ${project.household.hasCar.value?'checked':''}> Có ô tô</label>
          <label class="check"><input data-path="technical.geotechnicalAvailable" type="checkbox" ${project.technical.geotechnicalAvailable.value?'checked':''}> Đã có dữ liệu địa chất</label>
        </div>
      </div>
    </section>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Công năng</h2><p class="hint">BuildMate sinh sơ đồ khối từ nhu cầu hiện tại.</p></div></div>
        <div class="plan">${functionalPlan(project).map(f=>`<div class="floor"><strong>${escapeHtml(f.name)}</strong>${f.rooms.map(r=>`<span>${escapeHtml(r)}</span>`).join('')}</div>`).join('')}</div>
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Dữ liệu nguồn</h2><p class="hint">Giữ ranh giới giữa dữ liệu công khai, giả định và dữ liệu dự án thật.</p></div></div>
        ${referenceDetails(project.referenceCase)}
      </section>
    </div>

    <section class="panel-block compact-panel">
      <details class="advanced">
        <summary>Đầu vào kỹ thuật có nguồn</summary>
        <div class="form-grid compact-form content-form compact-technical-inputs">
          ${input('Tĩnh tải tổng hợp (kN/m²)','engineering.deadLoadKnM2',project.engineering.deadLoadKnM2,'number','0','','0.1')}
          ${input('Nguồn tĩnh tải','engineering.deadLoadSource',project.engineering.deadLoadSource)}
          <label class="field-control field-select field-select-wide"><span class="field-label"><span>Loại khu vực hoạt tải</span></span><select data-path="engineering.liveLoadClass">
            ${option(project.engineering.liveLoadClass.value,'A1-floor','A1 · sàn nhà ở 1.5 kN/m²')}
            ${option(project.engineering.liveLoadClass.value,'A1-balcony','A1 · ban công/lô gia 2.0 kN/m²')}
            ${option(project.engineering.liveLoadClass.value,'A2-circulation','A2 · giao thông/cầu thang 3.0 kN/m²')}
            ${option(project.engineering.liveLoadClass.value,'H-roof-maintenance','H · mái chỉ bảo trì 0.3 kN/m²')}
          </select></label>
          ${input('Áp lực nền cơ sở (kPa)','engineering.allowableBearingKpa',project.engineering.allowableBearingKpa,'number')}
          ${input('Nguồn địa kỹ thuật','engineering.allowableBearingSource',project.engineering.allowableBearingSource)}
          ${input('Công suất điện kết nối (W)','mep.connectedPowerW',project.mep.connectedPowerW,'number')}
          ${input('Hệ số nhu cầu','mep.demandFactor',project.mep.demandFactor,'number','0.1','1','0.05')}
          ${input('Nguồn hệ số nhu cầu','mep.demandFactorSource',project.mep.demandFactorSource)}
          ${input('Hệ số công suất','mep.powerFactor',project.mep.powerFactor,'number','0.1','1','0.01')}
          ${input('Tổng đương lượng thiết bị vệ sinh','mep.fixtureEquivalentUnits',project.mep.fixtureEquivalentUnits,'number')}
          ${input('Mức dùng nước (L/người.ngày)','mep.waterLitersPerPersonDay',project.mep.waterLitersPerPersonDay,'number')}
        </div>
      </details>
    </section>\n\n    ${journeyNextStep(project,{currentView:'project'})}`;
}

function referenceDetails(reference) {
  if (!reference) return '<p class="empty-state">Không có nguồn tham chiếu công khai; dữ liệu do người dùng nhập.</p>';
  return `<div class="reference-card"><span class="badge">COMPOSITE DEMO</span><p>${escapeHtml(reference.note)}</p>
    ${(reference.sources??[]).map(source=>`<a class="source-row" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><b>${escapeHtml(source.label)}</b><small>${escapeHtml((source.facts??[]).join(' · '))}</small></a>`).join('')}
    <h3>Công năng lấy từ nguồn</h3>
    ${(reference.floorProgram??[]).map(f=>`<div class="source-row"><b>${escapeHtml(f.floor)}</b><small>${escapeHtml(f.rooms.join(' · '))}</small></div>`).join('')}
  </div>`;
}


function documentImportView(state) {
  if(!state||state.status==='idle') return '';
  if(state.status==='processing') {
    const progress=Math.max(0,Math.min(100,Math.round(Number(state.progress??0)*100)));
    return `<div class="document-import-state">
      <div class="import-status-row"><strong>${escapeHtml(state.fileName??'Tài liệu')}</strong><span id="document-import-message">${escapeHtml(state.message??'Đang xử lý…')}</span></div>
      <div class="import-progress"><i id="document-import-progress" style="width:${progress}%"></i></div>
    </div>`;
  }
  if(state.status==='error') return `<div class="document-import-state import-error">
    <div><strong>Không thể đọc tài liệu</strong><span>${escapeHtml(state.error??'Lỗi không xác định')}</span></div>
    <button type="button" id="cancel-document-import" class="ghost">Đóng</button>
  </div>`;
  if(state.status==='success') return `<div class="document-import-state import-success">
    <div><strong>Đã cập nhật ${Number(state.appliedCount??0)} dữ liệu</strong><span>Nguồn: ${escapeHtml(state.fileName??'tài liệu')}</span></div>
    <button type="button" id="cancel-document-import" class="ghost">Xong</button>
  </div>`;
  if(state.status!=='ready') return '';

  const candidates=state.candidates??[];
  return `<div class="document-import-review">
    <div class="import-review-head">
      <div><strong>Kiểm tra dữ liệu trích từ ${escapeHtml(state.fileName??'tài liệu')}</strong><span>${candidates.length} giá trị đề xuất · bỏ chọn mục nào không đúng.</span></div>
      <button type="button" id="cancel-document-import" class="ghost">Hủy</button>
    </div>
    ${candidates.length?`<div class="import-candidate-list">${candidates.map((item,index)=>candidateRow(item,index)).join('')}</div>
      <div class="import-review-actions"><button type="button" id="apply-document-import">Xác nhận dữ liệu đã chọn</button></div>`
      :'<p class="empty-state">Chưa nhận diện được trường dữ liệu phù hợp. Bạn có thể dùng ô mô tả bằng lời ở phía trên hoặc thử tài liệu khác.</p>'}
  </div>`;
}

function candidateRow(item,index) {
  const type=item.kind==='number'?'number':item.path?.endsWith('Date')?'date':'text';
  return `<label class="import-candidate-row">
    <input type="checkbox" data-import-select="${index}" ${item.selected===false?'':'checked'}>
    <span class="import-candidate-copy"><strong>${escapeHtml(item.label??item.path)}</strong><small>${escapeHtml(confidenceLabel(item.confidence))} · ${escapeHtml(item.reason??'')}</small></span>
    <input class="import-candidate-value ${type==='number'?'numeric-cell':''}" data-import-value="${index}" type="${type}" value="${escapeHtml(item.value??'')}">
  </label>`;
}

function confidenceLabel(value) {
  return ({high:'Tin cậy cao',medium:'Cần kiểm tra',low:'Ước đoán'})[value]??'Cần kiểm tra';
}
