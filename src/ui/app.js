import { interpretHomeownerText, nextQuestion } from '../ai/intake.js';
import { createProject, setField } from '../engine/project.js';
import { runPlanningWorkflow } from '../engine/workflow.js';
import { clearProject, loadProject, saveProject } from '../storage.js';
import { functionalPlan, money, number, statusBadge } from './render.js';

let project = loadProject() ?? createProject();
let workflow = runPlanningWorkflow(project);

const el = (id) => document.getElementById(id);

function update(path, value, parser = (v) => v) {
  project = setField(project, path, parser(value));
  saveProject(project);
  render();
}

function bindInputs() {
  document.querySelectorAll('[data-path]').forEach((input) => {
    input.addEventListener('change', () => update(
      input.dataset.path,
      input.type === 'checkbox' ? input.checked : input.value,
      input.type === 'number' ? Number : (v) => v,
    ));
  });
}

function render() {
  workflow = runPlanningWorkflow(project);
  el('app').innerHTML = `
    <header class="hero">
      <div><span class="eyebrow">BuildMate V1</span><h1>Xây nhà rõ ràng từ nhu cầu đến ngân sách</h1><p>AI làm rõ nhu cầu. Engine deterministic chịu trách nhiệm con số.</p></div>
      <button id="reset" class="ghost">Tạo lại dự án</button>
    </header>
    <main class="grid">
      <section class="card chat-card">${chatPanel()}</section>
      <section class="card">${projectForm()}</section>
      <section class="card wide">${resultsPanel()}</section>
      <section class="card">${assumptionsPanel()}</section>
      <section class="card">${planPanel()}</section>
      <section class="card wide">${tracePanel()}</section>
    </main>`;

  bindInputs();
  el('chat-form')?.addEventListener('submit', onChat);
  el('reset')?.addEventListener('click', () => {
    clearProject();
    project = createProject();
    render();
  });
}

function chatPanel() {
  return `<h2>Trợ lý làm rõ</h2><p class="question">${nextQuestion(project)}</p>
    <form id="chat-form"><textarea id="chat-text" placeholder="Ví dụ: đất 4x16 ở TP.HCM, 5 người, 3 tỷ, có ô tô"></textarea><button>Phân tích thông tin</button></form>
    <p class="hint">Bạn có thể biết một phần, phần còn lại BuildMate sẽ đánh dấu và hỏi tiếp.</p>`;
}

function projectForm() {
  const p = project;
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
    <label>Mức hoàn thiện<select data-path="design.finishLevel"><option value="economy" ${selected('economy')}>Tiết kiệm</option><option value="balanced" ${selected('balanced')}>Cân bằng</option><option value="comfort" ${selected('comfort')}>Thoải mái</option></select></label>
    <label class="check"><input data-path="household.hasCar" type="checkbox" ${p.household.hasCar.value ? 'checked' : ''}> Có ô tô</label>
    <label class="check"><input data-path="technical.geotechnicalAvailable" type="checkbox" ${p.technical.geotechnicalAvailable.value ? 'checked' : ''}> Có dữ liệu địa chất</label>
  </div>`;
}

function input(label, path, obj, type = 'text', min = '', max = '', step = '') {
  return `<label>${label}<input data-path="${path}" type="${type}" value="${obj.value ?? ''}" min="${min}" max="${max}" step="${step}">${statusBadge(obj.state)}</label>`;
}

function selected(value) {
  return project.design.finishLevel.value === value ? 'selected' : '';
}

function resultsPanel() {
  if (!workflow.results) return `<h2>Kết quả</h2><div class="alert">${workflow.issues.map((i) => i.message).join(' ')}</div>`;
  const { areas, budgets, alternatives, budgetFit, cashflow } = workflow.results;
  return `<h2>Tổng quan tính toán</h2><div class="metrics">
    ${metric('Đất', number(areas.landArea.value, 'm²'))}${metric('Sàn dự kiến', number(areas.floorArea.value, 'm²'))}${metric('PA cân bằng', money(budgets[1].total))}${metric('Dự phòng đã gồm', '8%')}
  </div><h3>3 phương án ngân sách</h3><div class="scenario-grid">${alternatives.map((b) => `<article><strong>${b.name}</strong><span>${money(b.totalVnd)}</span><small>${b.targetStatus === 'over-budget' ? 'Vượt ngân sách mục tiêu' : b.targetStatus === 'within-budget' ? 'Trong ngân sách' : 'Chưa có ngân sách mục tiêu'}</small></article>`).join('')}</div>
  ${budgetFitPanel(budgetFit)}
  <h3>Dòng tiền theo giai đoạn</h3><div class="cashflow">${cashflow.map((s) => `<div><span>${s.order}. ${s.name}</span><b>${money(s.amount)}</b></div>`).join('')}</div>`;
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function budgetFitPanel(fit) {
  if (fit.status === 'unknown') return '<h3>Tối ưu ngân sách</h3><p class="hint">Nhập ngân sách mục tiêu để BuildMate phân tích khoảng chênh.</p>';
  if (fit.status === 'within-budget') return `<h3>Tối ưu ngân sách</h3><div class="budget-fit ok">Phương án đang trong ngân sách, còn ${money(fit.gapVnd)} biên dự phòng.</div>`;
  return `<h3>Tối ưu ngân sách</h3><div class="budget-fit"><b>Chênh lệch: ${money(Math.abs(fit.gapVnd))}</b><p>BuildMate chỉ đề xuất cắt giảm các hạng mục được phép; an toàn kết cấu và yêu cầu bắt buộc bị khóa.</p>${fit.actions.map((a) => `<div class="action"><span>${a.label}</span><b>~${money(a.estimatedSavingVnd)}</b></div>`).join('')}</div>`;
}

function assumptionsPanel() {
  return `<h2>Giả định & cổng kỹ thuật</h2>${workflow.issues.map((i) => `<p class="issue ${i.severity}">${i.message}</p>`).join('')}
    ${Object.entries(workflow.gates).map(([key, g]) => `<div class="gate"><b>${key}</b><span>${g.status}</span><p>${g.message}</p></div>`).join('')}`;
}

function planPanel() {
  return `<h2>Mặt bằng công năng sơ bộ</h2><div class="plan">${functionalPlan(project).map((f) => `<div class="floor"><strong>${f.name}</strong>${f.rooms.map((r) => `<span>${r}</span>`).join('')}</div>`).join('')}</div><p class="hint">Sơ đồ khối để thảo luận công năng, không phải bản vẽ kiến trúc thi công.</p>`;
}

function tracePanel() {
  if (!workflow.results) return '<h2>Trace</h2><p>Chưa có kết quả để trace.</p>';
  const { areas, quantities, budgets } = workflow.results;
  const rows = [areas.landArea, areas.footprint, areas.floorArea, ...quantities.items, ...budgets.map((b) => b.result)];
  return `<h2>Trace tính toán</h2><div class="trace-table">${rows.map((r) => `<details><summary><b>${r.label}</b><span>${r.value} ${r.unit}</span><em>${r.level}</em></summary><pre>${escapeHtml(JSON.stringify(r, null, 2))}</pre></details>`).join('')}</div>`;
}

function onChat(event) {
  event.preventDefault();
  const text = el('chat-text').value.trim();
  if (!text) return;
  const parsed = interpretHomeownerText(text);
  for (const item of parsed.updates) project = setField(project, item.path, item.value);
  saveProject(project);
  render();
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

render();
