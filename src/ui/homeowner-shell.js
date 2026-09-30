import { overviewPanel } from './panel-overview.js';
import { projectPanel } from './panel-project.js';
import { engineeringPanel } from './panel-engineering.js';
import { pricingPanel } from './panel-pricing.js';
import { reportPanel } from './panel-report.js';
import { escapeHtml } from './common.js';

const NAV=[
  ['overview','Tổng quan','⌂'],
  ['project','Thông tin nhà','▤'],
  ['engineering','Kỹ thuật','⌁'],
  ['pricing','Giá & ngân sách','₫'],
  ['report','Báo cáo','□'],
];

export function shell({
  project,projects,workflow,calculatorCapabilities=[],calculatorState={},
  guidedState={},evidenceState={},activeView='overview'
}) {
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">B</span><div><b>BuildMate</b><small>Homeowner Beta</small></div></div>
        <nav class="side-nav">${NAV.map(([id,label,icon])=>`
          <button type="button" data-view="${id}" class="${activeView===id?'active':''}" aria-current="${activeView===id?'page':'false'}"><span>${icon}</span>${label}</button>`).join('')}</nav>
        <div class="sidebar-foot"><small>Standards-backed · VN townhouse</small></div>
      </aside>
      <div class="workspace">
        ${topbar(project,projects)}
        <main class="page-content">
          ${viewContent(activeView,{project,workflow,calculatorCapabilities,calculatorState,guidedState,evidenceState})}
        </main>
      </div>
    </div>`;
}

function topbar(project,projects) {
  return `<header class="topbar">
    <div class="project-switcher">
      <select id="project-select">${projects.map(item=>`<option value="${item.id}" ${item.id===project.id?'selected':''}>${escapeHtml(item.name)}</option>`).join('')}</select>
      <input id="project-name" value="${escapeHtml(project.name)}" aria-label="Tên dự án">
    </div>
    <div class="top-actions">
      <button type="button" id="load-public-demo" class="ghost">Nạp demo 4×16</button>
      <button type="button" id="run-demo-a2z" class="ghost">Chạy demo A→Z</button>
      <button type="button" id="new-project" class="ghost">Dự án mới</button>
      <details class="menu-pop"><summary aria-label="Thêm tác vụ" title="Thêm tác vụ">•••</summary><div>
        <button id="export-html" class="ghost">Báo cáo HTML</button>
        <button id="export-csv" class="ghost">BOQ CSV</button>
        <button id="export-json" class="ghost">Xuất JSON</button>
        <button id="import-json" class="ghost">Nhập JSON</button>
        <button id="delete-project" class="ghost danger">Xóa dự án</button>
      </div></details>
      <input id="import-json-file" type="file" accept="application/json" hidden>
    </div>
  </header>`;
}

function viewContent(view,ctx) {
  switch(view){
    case 'project': return projectPanel(ctx.project);
    case 'engineering': return engineeringPanel(ctx.project,ctx.workflow,ctx);
    case 'pricing': return pricingPanel(ctx.project,ctx.workflow);
    case 'report': return reportPanel(ctx.project,ctx.workflow);
    default: return overviewPanel(ctx.project,ctx.workflow);
  }
}
