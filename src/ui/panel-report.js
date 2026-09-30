import { summarizeActuals } from '../engine/actuals.js';
import { escapeHtml,icon,metric } from './common.js';
import { money } from './render.js';

export function reportPanel(project,workflow) {
  const results=workflow.results;
  const budgetVnd=results?.primaryBudget?.centerVnd??0;
  const actual=summarizeActuals(project.actuals,budgetVnd);
  const versions=project.designVersions??[];
  return `
    <section class="panel-block report-hero">
      <div class="section-head"><div><span class="eyebrow">Project output</span><h2>Báo cáo & checkpoint</h2><p class="hint">Lưu phương án trước khi thay đổi lớn, rồi xuất báo cáo HTML/BOQ để rà soát.</p></div><button id="save-version" class="icon-button primary-icon" title="Lưu phương án hiện tại" aria-label="Lưu phương án hiện tại">${icon('save')}</button></div>
      <div class="metrics">
        ${metric('Ngân sách hiện tại',money(budgetVnd),results?.primaryBudget?.basis??'')}
        ${metric('Đã thanh toán',money(actual.paidVnd),'actual')}
        ${metric('Đã cam kết',money(actual.committedVnd),'actual')}
        ${metric('Còn lại',money(actual.remainingVnd),'budget - actual')}
      </div>
    </section>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Phiên bản thiết kế</h2><p class="hint">So sánh quy mô/ngân sách qua các lần thay đổi.</p></div><span>${versions.length} phiên bản</span></div>
        <div class="version-list">${versions.length?versions.slice().reverse().map(v=>`<article><strong>${escapeHtml(v.label)}</strong><span>${v.inputs.storeys} tầng · ${v.summary.floorAreaM2} m²</span><b>${money(v.summary.estimatedBudgetVnd)}</b></article>`).join(''):'<p class="empty-state">Chưa lưu checkpoint nào.</p>'}</div>
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Chi phí thực tế</h2><p class="hint">Theo dõi paid/committed so với ngân sách hiện tại.</p></div></div>
        <form id="actual-form" class="actual-form"><input id="actual-description" placeholder="Hạng mục / hóa đơn" required><input id="actual-amount" type="number" min="1" placeholder="Số tiền" required><select id="actual-status"><option value="paid">Đã thanh toán</option><option value="committed">Đã cam kết</option></select><button>Thêm</button></form>
        <div class="actual-list">${project.actuals.entries.length?project.actuals.entries.map(item=>`<div><span><b>${escapeHtml(item.description||item.category)}</b><small>${escapeHtml(item.date)} · ${escapeHtml(item.status)}</small></span><strong>${money(item.amountVnd)}</strong><button class="ghost danger icon-button" data-remove-actual="${item.id}" title="Xóa chi phí" aria-label="Xóa chi phí">${icon('trash')}</button></div>`).join(''):'<p class="empty-state">Chưa có chi phí thực tế.</p>'}</div>
      </section>
    </div>

    <section class="panel-block">
      <div class="section-head"><div><h2>Cổng & cảnh báo</h2><p class="hint">Các điều kiện chưa đủ được giữ rõ thay vì BuildMate tự đoán.</p></div></div>
      ${workflow.issues.map(i=>`<p class="issue ${escapeHtml(i.severity)}">${escapeHtml(i.message)}</p>`).join('')}
      ${Object.entries(workflow.gates).map(([key,g])=>`<div class="gate"><b>${escapeHtml(key)}</b><span>${escapeHtml(g.status)}</span><p>${escapeHtml(g.message)}</p></div>`).join('')}
    </section>

    <section class="panel-block">
      <details class="advanced"><summary>Trace planning / BOQ</summary>${trace(workflow)}</details>
    </section>`;
}

function trace(workflow) {
  if (!workflow.results) return '<p class="empty-state">Chưa có kết quả.</p>';
  const {areas,quantities,budgets}=workflow.results;
  const rows=[areas.landArea,areas.footprint,areas.floorArea,...quantities.items,...budgets.map(x=>x.result)];
  return `<div class="trace-table">${rows.map(r=>`<details><summary><b>${escapeHtml(r.label)}</b><span>${escapeHtml(r.value)} ${escapeHtml(r.unit)}</span><em>${escapeHtml(r.level)}</em></summary><pre>${escapeHtml(JSON.stringify(r,null,2))}</pre></details>`).join('')}</div>`;
}
