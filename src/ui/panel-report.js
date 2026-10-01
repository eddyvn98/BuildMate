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
      <div class="section-head"><div><span class="eyebrow">TỔNG KẾT DỰ ÁN</span><h2>Báo cáo dự án</h2><p class="hint">Lưu phương án hiện tại để có mốc so sánh, sau đó xuất báo cáo hoặc BOQ khi cần chia sẻ.</p></div><button id="save-version" class="report-save-action" title="Lưu phương án hiện tại" aria-label="Lưu phương án hiện tại">${icon('save')}<span>Lưu phương án</span></button></div>
      <div class="metrics">
        ${metric('Ngân sách hiện tại',money(budgetVnd),'ước tính đang dùng')}
        ${metric('Đã thanh toán',money(actual.paidVnd),'chi phí thực tế')}
        ${metric('Đã cam kết',money(actual.committedVnd),'đã chốt nhưng chưa thanh toán')}
        ${metric('Còn lại',money(actual.remainingVnd),'so với ngân sách')}
      </div>
    </section>

    <section class="panel-block report-export-card">
      <div>
        <span class="eyebrow">CHIA SẺ / LƯU TRỮ</span>
        <h2>Xuất hồ sơ dự án</h2>
        <p class="hint">Báo cáo HTML phù hợp để xem và chia sẻ; BOQ CSV phù hợp để tiếp tục làm việc với bảng tính.</p>
      </div>
      <div class="report-export-actions">
        <button type="button" data-report-export="html">${icon('download')}<span>Xuất báo cáo HTML</span></button>
        <button type="button" class="ghost" data-report-export="csv">${icon('download')}<span>Tải BOQ CSV</span></button>
      </div>
    </section>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Phiên bản thiết kế</h2><p class="hint">So sánh quy mô/ngân sách qua các lần thay đổi.</p></div><span>${versions.length} phiên bản</span></div>
        <div class="version-list">${versions.length?versions.slice().reverse().map(v=>`<article><strong>${escapeHtml(v.label)}</strong><span>${v.inputs.storeys} tầng · ${v.summary.floorAreaM2} m²</span><b>${money(v.summary.estimatedBudgetVnd)}</b></article>`).join(''):'<p class="empty-state">Chưa lưu checkpoint nào.</p>'}</div>
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Chi phí thực tế</h2><p class="hint">Theo dõi khoản đã thanh toán và khoản đã cam kết so với ngân sách hiện tại.</p></div></div>
        <form id="actual-form" class="actual-form"><input id="actual-description" placeholder="Hạng mục / hóa đơn" required><input id="actual-amount" type="number" min="1" placeholder="Số tiền" required><select id="actual-status"><option value="paid">Đã thanh toán</option><option value="committed">Đã cam kết</option></select><button class="icon-button primary-icon" title="Thêm chi phí" aria-label="Thêm chi phí">${icon('plus')}</button></form>
        <div class="actual-list">${project.actuals.entries.length?project.actuals.entries.map(item=>`<div><span><b>${escapeHtml(item.description||item.category)}</b><small>${escapeHtml(item.date)} · ${escapeHtml(actualStatusLabel(item.status))}</small></span><strong>${money(item.amountVnd)}</strong><button class="ghost danger icon-button" data-remove-actual="${item.id}" title="Xóa chi phí" aria-label="Xóa chi phí">${icon('trash')}</button></div>`).join(''):'<p class="empty-state">Chưa có chi phí thực tế.</p>'}</div>
      </section>
    </div>

    <section class="panel-block">
      <div class="section-head"><div><h2>Kiểm tra trước khi chia sẻ</h2><p class="hint">BuildMate giữ rõ những điều kiện chưa đủ thay vì tự điền hoặc suy đoán.</p></div></div>
      ${workflow.issues.map(i=>`<p class="issue ${escapeHtml(i.severity)}">${escapeHtml(i.message)}</p>`).join('')}
      ${Object.entries(workflow.gates).map(([key,g])=>`<div class="gate"><b>${escapeHtml(key)}</b><span>${escapeHtml(gateStatusLabel(g.status))}</span><p>${escapeHtml(g.message)}</p></div>`).join('')}
    </section>

    <section class="panel-block">
      <details class="advanced"><summary>Dữ liệu truy vết planning / BOQ</summary>${trace(workflow)}</details>
    </section>`;
}

function trace(workflow) {
  if (!workflow.results) return '<p class="empty-state">Chưa có kết quả.</p>';
  const {areas,quantities,budgets}=workflow.results;
  const rows=[areas.landArea,areas.footprint,areas.floorArea,...quantities.items,...budgets.map(x=>x.result)];
  return `<div class="trace-table">${rows.map(r=>`<details><summary><b>${escapeHtml(r.label)}</b><span>${escapeHtml(r.value)} ${escapeHtml(r.unit)}</span><em>${escapeHtml(r.level)}</em></summary><pre>${escapeHtml(JSON.stringify(r,null,2))}</pre></details>`).join('')}</div>`;
}


function actualStatusLabel(status) {
  return ({paid:'Đã thanh toán',committed:'Đã cam kết'})[status]??status;
}

function gateStatusLabel(status) {
  return ({ready:'Sẵn sàng',blocked:'Cần bổ sung',warning:'Cần kiểm tra',pass:'Đạt'})[status]??status;
}
