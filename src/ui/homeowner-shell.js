import { overviewPanel } from './panel-overview.js';
import { projectPanel } from './panel-project.js';
import { engineeringPanel } from './panel-engineering.js';
import { pricingPanel } from './panel-pricing.js';
import { technicalPanel } from './panel-technical.js';
import { reportPanel } from './panel-report.js';
import { escapeHtml,icon } from './common.js';

const NAV=[
  ['overview','Nhà của tôi','home'],
  ['project','Thông tin nhà','house'],
  ['pricing','Chi phí','wallet'],
  ['technical','Hồ sơ','clipboard'],
  ['engineering','Tính toán','calculator'],
  ['report','Báo cáo','fileText'],
];

export function shell({
  project,projects,workflow,calculatorCapabilities=[],calculatorState={},
  guidedState={},evidenceState={},activeView='overview'
}) {
  return `
    <div class="app-shell journey-shell">
      <aside class="sidebar journey-sidebar">
        <div class="brand journey-brand" title="BuildMate" aria-label="BuildMate">
          <span class="brand-mark">B</span><span class="brand-name">BuildMate</span>
        </div>
        <nav class="side-nav journey-nav">${NAV.map(([id,label,iconName])=>`
          <button type="button" data-view="${id}" class="${activeView===id?'active':''}" aria-current="${activeView===id?'page':'false'}" title="${label}" aria-label="${label}">
            <span class="nav-icon">${icon(iconName)}</span><span class="nav-label">${label}</span>
          </button>`).join('')}</nav>
        <div class="sidebar-guide">
          <span>✨</span><div><strong>BuildMate AI</strong><small>Trợ lý xây nhà của bạn</small></div>
        </div>
      </aside>
      <div class="workspace">
        ${topbar(project,projects)}
        <main class="page-content journey-content">
          ${viewContent(activeView,{project,workflow,calculatorCapabilities,calculatorState,guidedState,evidenceState})}
        </main>
      </div>
    </div>`;
}

function topbar(project,projects) {
  return `<header class="topbar journey-topbar">
    <div class="project-switcher journey-project-switcher">
      <span class="project-home-icon">⌂</span>
      <div><small>Ngôi nhà của bạn</small>
      <select id="project-select">${projects.map(item=>`<option value="${item.id}" ${item.id===project.id?'selected':''}>${escapeHtml(item.name)}</option>`).join('')}</select></div>
      <input id="project-name" value="${escapeHtml(project.name)}" aria-label="Tên dự án">
    </div>
    <div class="top-actions">
      <button type="button" id="load-public-demo" class="ghost icon-button" title="Nạp demo 4×16" aria-label="Nạp demo 4×16">${icon('flask')}</button>
      <button type="button" id="run-demo-a2z" class="ghost icon-button" title="Chạy demo A→Z" aria-label="Chạy demo A→Z">${icon('play')}</button>
      <button type="button" id="new-project" class="ghost icon-button" title="Dự án mới" aria-label="Dự án mới">${icon('plus')}</button>
      <details class="menu-pop"><summary aria-label="Thêm tác vụ" title="Thêm tác vụ">${icon('more')}</summary><div>
        <button id="export-html" class="ghost menu-action">${icon('download')}<span>HTML</span></button>
        <button id="export-csv" class="ghost menu-action">${icon('download')}<span>BOQ CSV</span></button>
        <button id="export-json" class="ghost menu-action">${icon('download')}<span>JSON</span></button>
        <button id="import-json" class="ghost menu-action">${icon('upload')}<span>Nhập</span></button>
        <button id="delete-project" class="ghost danger menu-action">${icon('trash')}<span>Xóa</span></button>
      </div></details>
      <input id="import-json-file" type="file" accept="application/json" hidden>
    </div>
  </header>`;
}

function viewContent(view,ctx) {
  switch(view){
    case 'project': return projectPanel(ctx.project);
    case 'engineering': return engineeringPanel(ctx.project,ctx.workflow,ctx);
    case 'technical': return technicalPanel(ctx.project,ctx.workflow);
    case 'pricing': return pricingPanel(ctx.project,ctx.workflow);
    case 'report': return reportPanel(ctx.project,ctx.workflow);
    default: return overviewPanel(ctx.project,ctx.workflow);
  }
}
