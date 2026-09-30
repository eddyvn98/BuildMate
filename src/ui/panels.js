import { ENGINEERING_EVIDENCE_TYPES, evidenceDataExample } from './engineering-tools.js';
import { summarizeActuals } from '../engine/actuals.js';
import { functionalPlan, money, number, statusBadge } from './render.js';

export function shell({ project, projects, workflow, calculatorCapabilities=[], calculatorState={}, evidenceState={} }) {
  return `
    <header class="hero">
      <div><span class="eyebrow">BuildMate V2</span><h1>Xây nhà từ nhu cầu đến kiểm soát kỹ thuật</h1><p>AI làm rõ nhu cầu; engine deterministic chịu trách nhiệm con số và trace.</p></div>
      <div class="hero-actions"><button id="new-project" class="ghost">Dự án mới</button><button id="import-json" class="ghost">Nhập JSON</button><input id="import-json-file" type="file" accept="application/json" hidden><button id="export-json" class="ghost">Xuất JSON</button><button id="export-csv" class="ghost">BOQ CSV</button><button id="export-html">Báo cáo HTML</button></div>
    </header>
    <main class="grid">
      <section class="card wide">${projectBar(project, projects)}</section>
      <section class="card">${chatPanel()}</section>
      <section class="card">${projectForm(project)}</section>
      <section class="card wide">${resultsPanel(workflow)}</section>
      <section class="card wide">${engineeringPanel(workflow)}</section>
      <section class="card wide">${standardsToolsPanel(project,calculatorCapabilities,calculatorState,evidenceState)}</section>
      <section class="card">${assumptionsPanel(workflow)}</section>
      <section class="card">${planPanel(project)}</section>
      <section class="card wide">${pricingPanel(project, workflow)}</section>
      <section class="card wide">${versionsPanel(project)}</section>
      <section class="card wide">${actualsPanel(project, workflow)}</section>
      <section class="card wide">${tracePanel(workflow)}</section>
    </main>`;
}

function projectBar(project, projects) {
  return `<div class="project-bar"><label>Dự án<select id="project-select">${projects.map((item) => `<option value="${item.id}" ${item.id === project.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>
    <label>Tên dự án<input id="project-name" value="${escapeHtml(project.name)}"></label>
    <button id="delete-project" class="danger ghost">Xóa dự án</button></div>`;
}

function chatPanel() {
  return `<h2>Trợ lý làm rõ</h2><p class="question" id="next-question"></p>
    <form id="chat-form"><textarea id="chat-text" placeholder="Ví dụ: đất 4x16 ở TP.HCM, 5 người, 3 tỷ, có ô tô"></textarea><button>Phân tích thông tin</button></form>
    <p class="hint">Biết gì nhập nấy; phần còn thiếu sẽ được giữ trạng thái rõ ràng.</p>`;
}

function projectForm(p) {
  return `<h2>Thông tin dự án</h2><div class="form-grid">
    ${input('Tỉnh/thành', 'location.province', p.location.province)}
    ${input('Quận/huyện', 'location.district', p.location.district)}
    ${input('Rộng đất (m)', 'land.widthM', p.land.widthM, 'number')}
    ${input('Dài đất (m)', 'land.lengthM', p.land.lengthM, 'number')}
    ${input('Số tầng', 'design.storeys', p.design.storeys, 'number', '1', '5')}
    ${input('Tỷ lệ chiếm đất', 'design.footprintRatio', p.design.footprintRatio, 'number', '0.4', '1', '0.05')}
    ${input('Số người', 'household.people', p.household.people, 'number')}
    ${input('Phòng ngủ', 'household.bedrooms', p.household.bedrooms, 'number')}
    ${input('Ngân sách (VND)', 'budget.totalVnd', p.budget.totalVnd, 'number')}
    <label>Mức hoàn thiện<select data-path="design.finishLevel"><option value="economy" ${selected(p, 'economy')}>Tiết kiệm</option><option value="balanced" ${selected(p, 'balanced')}>Cân bằng</option><option value="comfort" ${selected(p, 'comfort')}>Thoải mái</option></select></label>
    <label class="check"><input data-path="household.hasCar" type="checkbox" ${p.household.hasCar.value ? 'checked' : ''}> Có ô tô</label>
    <label class="check"><input data-path="technical.geotechnicalAvailable" type="checkbox" ${p.technical.geotechnicalAvailable.value ? 'checked' : ''}> Có dữ liệu địa chất</label>
  </div><details class="advanced"><summary>Đầu vào kỹ thuật có nguồn</summary><div class="form-grid">
    ${input('Tĩnh tải tổng hợp (kN/m²)', 'engineering.deadLoadKnM2', p.engineering.deadLoadKnM2, 'number', '0', '', '0.1')}
    ${input('Nguồn tĩnh tải', 'engineering.deadLoadSource', p.engineering.deadLoadSource)}
    <label>Loại khu vực hoạt tải TCVN 2737<select data-path="engineering.liveLoadClass">
      ${option(p.engineering.liveLoadClass.value,'A1-floor','A1 · sàn nhà ở 1.5 kN/m²')}
      ${option(p.engineering.liveLoadClass.value,'A1-balcony','A1 · ban công/lô gia 2.0 kN/m²')}
      ${option(p.engineering.liveLoadClass.value,'A2-circulation','A2 · giao thông/cầu thang 3.0 kN/m²')}
      ${option(p.engineering.liveLoadClass.value,'H-roof-maintenance','H · mái chỉ bảo trì 0.3 kN/m²')}
    </select></label>
    ${input('Áp lực nền cơ sở (kPa)', 'engineering.allowableBearingKpa', p.engineering.allowableBearingKpa, 'number')}
    ${input('Nguồn địa kỹ thuật cho áp lực nền', 'engineering.allowableBearingSource', p.engineering.allowableBearingSource)}
    ${input('Sức chịu tải làm việc/cọc (kN)', 'engineering.pileWorkingCapacityKn', p.engineering.pileWorkingCapacityKn, 'number')}
    ${input('Nguồn sức chịu tải cọc', 'engineering.pileCapacitySource', p.engineering.pileCapacitySource)}
    ${input('Công suất điện kết nối (W)', 'mep.connectedPowerW', p.mep.connectedPowerW, 'number')}
    ${input('Hệ số nhu cầu', 'mep.demandFactor', p.mep.demandFactor, 'number', '0.1', '1', '0.05')}
    ${input('Nguồn hệ số nhu cầu', 'mep.demandFactorSource', p.mep.demandFactorSource)}
    ${input('Hệ số công suất', 'mep.powerFactor', p.mep.powerFactor, 'number', '0.1', '1', '0.01')}
    ${input('Tổng đương lượng thiết bị vệ sinh', 'mep.fixtureEquivalentUnits', p.mep.fixtureEquivalentUnits, 'number')}
    ${input('Mức dùng nước TCVN 4513 (L/người.ngày)', 'mep.waterLitersPerPersonDay', p.mep.waterLitersPerPersonDay, 'number')}
  </div></details>`;
}

function pricingPanel(p, workflow) {
  const book = workflow.results?.priceBook;
  return `<div class="section-head"><div><h2>Đơn giá dự án</h2><p class="hint">Để trống để dùng profile demo; nhập báo giá thật để override và lưu nguồn.</p></div><div class="price-source">${book ? `${escapeHtml(book.sourceLabel)} · ${escapeHtml(book.effectiveDate)}` : ''}</div></div>
    <div class="form-grid">
      ${input('Nguồn báo giá', 'pricing.sourceLabel', p.pricing.sourceLabel)}
      ${input('Ngày báo giá', 'pricing.effectiveDate', p.pricing.effectiveDate, 'date')}
      ${input('Bê tông (VND/m³)', 'pricing.items.concrete', p.pricing.items.concrete, 'number')}
      ${input('Thép (VND/kg)', 'pricing.items.rebar', p.pricing.items.rebar, 'number')}
      ${input('Xây tường (VND/m²)', 'pricing.items.masonry', p.pricing.items.masonry, 'number')}
      ${input('Tô trát (VND/m²)', 'pricing.items.plaster', p.pricing.items.plaster, 'number')}
      ${input('Sơn (VND/m²)', 'pricing.items.paint', p.pricing.items.paint, 'number')}
      ${input('Điểm điện (VND/điểm)', 'pricing.items.electrical', p.pricing.items.electrical, 'number')}
      ${input('Điểm nước (VND/điểm)', 'pricing.items.plumbing', p.pricing.items.plumbing, 'number')}
    </div>`;
}

function input(label, path, obj, type = 'text', min = '', max = '', step = '') {
  return `<label>${label}<input data-path="${path}" type="${type}" value="${obj.value ?? ''}" min="${min}" max="${max}" step="${step}">${statusBadge(obj.state)}</label>`;
}

function option(current,value,label) {
  return `<option value="${value}" ${current===value?'selected':''}>${escapeHtml(label)}</option>`;
}

function selected(project, value) {
  return project.design.finishLevel.value === value ? 'selected' : '';
}

function resultsPanel(workflow) {
  if (!workflow.results) return `<h2>Kết quả</h2><div class="alert">${workflow.issues.map((i) => i.message).join(' ')}</div>`;
  const { areas, budgets, alternatives, budgetFit, cashflow } = workflow.results;
  return `<h2>Tổng quan</h2><div class="metrics">
    ${metric('Đất', number(areas.landArea.value, 'm²'))}${metric('Sàn dự kiến', number(areas.floorArea.value, 'm²'))}${metric('PA cân bằng', money(budgets[1].total))}${metric('Dự phòng', '8%')}
  </div><h3>Phương án ngân sách</h3><div class="scenario-grid">${alternatives.map((b) => `<article><strong>${b.name}</strong><span>${money(b.totalVnd)}</span><small>${targetLabel(b.targetStatus)}</small></article>`).join('')}</div>
  ${budgetFitPanel(budgetFit)}
  <h3>Dòng tiền theo giai đoạn</h3><div class="cashflow">${cashflow.map((s) => `<div><span>${s.order}. ${s.name}</span><b>${money(s.amount)}</b></div>`).join('')}</div>`;
}

function engineeringPanel(workflow) {
  const eng = workflow.results?.engineering;
  if (!eng || eng.status !== 'ready') return '<h2>Kỹ thuật</h2><p class="hint">Cần đủ thông tin quy mô cơ bản.</p>';
  const m = eng.modules;
  return `<h2>Kỹ thuật theo nguồn</h2><p class="hint">Preview chỉ hiển thị phép tính khi đầu vào có nguồn. Calculator TCVN/QCVN đầy đủ nằm ở panel bên dưới.</p>
    <div class="engineering-grid">
      ${engineeringCard('Tải trọng', m.structure.status, m.structure.result ? `${number(m.structure.result.value, 'kN')} tải đứng sơ bộ từ tải có nguồn` : m.structure.message)}
      ${engineeringCard('Móng nông', m.foundation.status, m.foundation.result ? `${number(m.foundation.result.value, 'm²')} cân bằng áp lực sơ bộ` : m.foundation.message)}
      ${engineeringCard('Móng cọc', m.pile.status, m.pile.result ? `${m.pile.result.pileCount} cọc từ sức chịu tải đã cung cấp` : m.pile.message)}
      ${engineeringCard('Điện', m.electrical.status, m.electrical.result ? `${number(m.electrical.result.value, 'A')} dòng nhu cầu` : m.electrical.message)}
      ${engineeringCard('Nước', m.water.status, m.water.result ? `${number(m.water.result.value, m.water.result.unit)} lưu lượng thiết kế` : m.water.message)}
      ${engineeringCard('HVAC', m.hvac.status, m.hvac.message)}
    </div>`;
}

function engineeringCard(title, status, body) {
  return `<article class="engineering-card"><div><strong>${title}</strong><span class="badge">${status}</span></div><p>${escapeHtml(body || '')}</p></article>`;
}

function standardsToolsPanel(project,capabilities,state,evidenceState) {
  const selected=capabilities.find(x=>x.id===state.action) ?? capabilities[0];
  const evidence=project.engineeringEvidence ?? [];
  const defaultEvidenceType=ENGINEERING_EVIDENCE_TYPES[0][0];
  return `<div class="section-head"><div><h2>TCVN / QCVN Calculator</h2><p class="hint">Chạy trực tiếp engine tiêu chuẩn. Action cần hồ sơ sẽ tự block nếu project evidence chưa đủ.</p></div><span class="badge">${escapeHtml(selected?.standard ?? '')}</span></div>
    <form id="standard-calculator-form" class="standard-tool-grid">
      <label>Workflow<select id="standard-calculator-action">${capabilities.map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===state.action?'selected':''}>${escapeHtml(x.id)} · #${x.issue}</option>`).join('')}</select></label>
      <div class="evidence-requirement"><b>Evidence bắt buộc</b><span>${selected?.requiredEvidenceTypes?.length ? selected.requiredEvidenceTypes.map(x=>`<code>${escapeHtml(x)}</code>`).join(' ') : 'Không có evidence ngoài bắt buộc'}</span></div>
      <label class="wide-field">Input JSON<textarea id="standard-calculator-input" spellcheck="false">${escapeHtml(state.inputText ?? '{}')}</textarea></label>
      <div><button type="submit">Tính theo tiêu chuẩn</button></div>
    </form>
    ${state.error?`<div class="alert">${escapeHtml(state.error)}</div>`:''}
    ${state.output?`<div class="calc-output ${state.output.status==='blocked'?'blocked':''}"><div><b>Kết quả: ${escapeHtml(state.output.status)}</b><span>${escapeHtml(state.output.standard ?? '')}</span></div><pre>${escapeHtml(JSON.stringify(state.output,null,2))}</pre></div>`:''}
    <details class="advanced" open><summary>Project engineering evidence (${evidence.length})</summary>
      ${evidenceState.error?`<div class="alert">${escapeHtml(evidenceState.error)}</div>`:''}
      <form id="engineering-evidence-form" class="evidence-form">
        <label>Loại evidence<select id="engineering-evidence-type">${ENGINEERING_EVIDENCE_TYPES.map(([value,label])=>`<option value="${value}">${escapeHtml(label)}</option>`).join('')}</select></label>
        <label>Nguồn<input id="engineering-evidence-source" required placeholder="Đơn vị khảo sát / hãng / cơ quan"></label>
        <label>Mã tài liệu<input id="engineering-evidence-document-id" required placeholder="GEO-01 / CB-01 ..."></label>
        <label>Ngày phát hành<input id="engineering-evidence-issued-at" type="date" required value="${new Date().toISOString().slice(0,10)}"></label>
        <label>Phương pháp / điều khoản<input id="engineering-evidence-method" required placeholder="TCVN 10304:2025 5.1 ..."></label>
        <label>Hãng (nếu có)<input id="engineering-evidence-manufacturer"></label>
        <label>Model (nếu có)<input id="engineering-evidence-model"></label>
        <label>Thiết bị đo (nếu có)<input id="engineering-evidence-instrument"></label>
        <label>Ngày hiệu chuẩn<input id="engineering-evidence-calibration" type="date"></label>
        <label class="wide-field">Data JSON<textarea id="engineering-evidence-data" spellcheck="false">${escapeHtml(JSON.stringify(evidenceDataExample(defaultEvidenceType),null,2))}</textarea></label>
        <div><button type="submit">Thêm evidence</button></div>
      </form>
      <div class="evidence-list">${evidence.length?evidence.map(item=>`<article><div><b>#${item.issue} · ${escapeHtml(item.type)}</b><span>${escapeHtml(item.source)} · ${escapeHtml(item.documentId)}</span><small>${escapeHtml(item.methodRef)}</small></div><button class="ghost danger" data-remove-engineering-evidence="${item.id}">Xóa</button></article>`).join(''):'<p class="hint">Chưa có evidence kỹ thuật dự án.</p>'}</div>
    </details>
    <details class="advanced"><summary>Calculation history (${(project.engineeringCalculations ?? []).length})</summary>
      <div class="evidence-list">${(project.engineeringCalculations ?? []).length ? project.engineeringCalculations.slice().reverse().map(item=>`<article><div><b>#${item.issue} · ${escapeHtml(item.action)}</b><span>${escapeHtml(item.status)} · ${escapeHtml(item.standard)}</span><small>digest: ${escapeHtml(item.calculationDigest.slice(0,16))}… · ${escapeHtml(item.createdAt)}</small></div></article>`).join('') : '<p class="hint">Chưa có calculation run local.</p>'}</div>
    </details>`;
}


function assumptionsPanel(workflow) {
  return `<h2>Giả định & cổng kỹ thuật</h2>${workflow.issues.map((i) => `<p class="issue ${i.severity}">${i.message}</p>`).join('')}
    ${Object.entries(workflow.gates).map(([key, g]) => `<div class="gate"><b>${key}</b><span>${g.status}</span><p>${g.message}</p></div>`).join('')}`;
}

function planPanel(project) {
  return `<h2>Mặt bằng công năng sơ bộ</h2><div class="plan">${functionalPlan(project).map((f) => `<div class="floor"><strong>${f.name}</strong>${f.rooms.map((r) => `<span>${r}</span>`).join('')}</div>`).join('')}</div><p class="hint">Sơ đồ khối để thảo luận công năng, không phải bản vẽ kiến trúc thi công.</p>`;
}

function versionsPanel(project) {
  const versions = project.designVersions ?? [];
  return `<div class="section-head"><div><h2>Phiên bản thiết kế</h2><p class="hint">Lưu checkpoint để so sánh quy mô và ngân sách.</p></div><button id="save-version">Lưu phương án hiện tại</button></div>
    <div class="version-list">${versions.length ? versions.map((v) => `<article><strong>${escapeHtml(v.label)}</strong><span>${v.inputs.storeys} tầng · ${v.summary.floorAreaM2} m²</span><b>${money(v.summary.estimatedBudgetVnd)}</b></article>`).join('') : '<p class="hint">Chưa lưu phương án nào.</p>'}</div>`;
}

function actualsPanel(project, workflow) {
  const preferred = workflow.results?.budgets?.find((item) => item.key === workflow.results.preferredScenario);
  const summary = summarizeActuals(project.actuals, preferred?.total ?? 0);
  return `<div class="section-head"><div><h2>Thi công thực tế</h2><p class="hint">Theo dõi đã chi/đã cam kết so với phương án đang chọn.</p></div><div><b>${money(summary.actualVnd)}</b> / ${money(summary.budgetVnd)}</div></div>
    <div class="actual-metrics">${metric('Đã thanh toán', money(summary.paidVnd))}${metric('Đã cam kết', money(summary.committedVnd))}${metric('Còn lại', money(summary.remainingVnd))}</div>
    <form id="actual-form" class="actual-form"><input id="actual-description" placeholder="Hạng mục / hóa đơn" required><input id="actual-amount" type="number" min="1" placeholder="Số tiền" required><select id="actual-status"><option value="paid">Đã thanh toán</option><option value="committed">Đã cam kết</option></select><button>Thêm chi phí</button></form>
    <div class="actual-list">${project.actuals.entries.length ? project.actuals.entries.map((item) => `<div><span><b>${escapeHtml(item.description || item.category)}</b><small>${escapeHtml(item.date)} · ${escapeHtml(item.status)}</small></span><strong>${money(item.amountVnd)}</strong><button class="ghost danger" data-remove-actual="${item.id}">Xóa</button></div>`).join('') : '<p class="hint">Chưa có chi phí thực tế.</p>'}</div>`;
}

function tracePanel(workflow) {
  if (!workflow.results) return '<h2>Trace</h2><p>Chưa có kết quả để trace.</p>';
  const { areas, quantities, budgets } = workflow.results;
  const rows = [areas.landArea, areas.footprint, areas.floorArea, ...quantities.items, ...budgets.map((b) => b.result)];
  return `<h2>Trace tính toán</h2><div class="trace-table">${rows.map((r) => `<details><summary><b>${r.label}</b><span>${r.value} ${r.unit}</span><em>${r.level}</em></summary><pre>${escapeHtml(JSON.stringify(r, null, 2))}</pre></details>`).join('')}</div>`;
}

function budgetFitPanel(fit) {
  if (fit.status === 'unknown') return '<h3>Tối ưu ngân sách</h3><p class="hint">Nhập ngân sách mục tiêu để phân tích khoảng chênh.</p>';
  if (fit.status === 'within-budget') return `<h3>Tối ưu ngân sách</h3><div class="budget-fit ok">Đang trong ngân sách, còn ${money(fit.gapVnd)} biên.</div>`;
  return `<h3>Tối ưu ngân sách</h3><div class="budget-fit"><b>Chênh lệch: ${money(Math.abs(fit.gapVnd))}</b><p>Chỉ đề xuất giảm hạng mục được phép; an toàn kết cấu và yêu cầu bắt buộc bị khóa.</p>${fit.actions.map((a) => `<div class="action"><span>${a.label}</span><b>~${money(a.estimatedSavingVnd)}</b></div>`).join('')}</div>`;
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function targetLabel(status) {
  return ({ 'over-budget': 'Vượt ngân sách', 'within-budget': 'Trong ngân sách', unknown: 'Chưa có mục tiêu' })[status] ?? status;
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
