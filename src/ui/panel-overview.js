import { projectAtoZStatus } from '../engine/a2z-status.js';
import { homeownerNextActions } from '../engine/homeowner-next-actions.js';
import { functionalPlan,money,number } from './render.js';
import { escapeHtml,metric,stageTone } from './common.js';

export function overviewPanel(project,workflow) {
  const status=projectAtoZStatus(project);
  const actions=homeownerNextActions(project);
  const results=workflow.results;
  const primary=results?.primaryBudget;
  const quick=results?.marketPricing?.quickEstimate;
  const floors=functionalPlan(project);
  const source=project.referenceCase;

  return `
    <section class="dashboard-hero">
      <div>
        <span class="eyebrow">Homeowner Beta · v0.8</span>
        <h1>${escapeHtml(project.name)}</h1>
        <p>${escapeHtml(project.location?.district?.value||'')} ${project.location?.province?.value?'· '+escapeHtml(project.location.province.value):''} · ${project.land?.widthM?.value||'—'}×${project.land?.lengthM?.value||'—'} m · ${project.design?.storeys?.value||'—'} tầng</p>
      </div>
      <div class="progress-orb"><strong>${status.progressPercent}%</strong><span>A→Z ready</span></div>
    </section>

    <div class="metrics dashboard-metrics">
      ${metric('Ước tính hiện tại',primary?money(primary.centerVnd):'—',primary?.basis==='market-quick'?'Giá thị trường':'BOQ')}
      ${metric('Khoảng ngân sách',primary?money(primary.lowVnd)+' – '+money(primary.highVnd):'—',primary?.confidence??'')}
      ${metric('Diện tích sàn',results?.areas?number(results.areas.floorArea.value,'m²'):'—','planning')}
      ${metric('Nguồn giá',quick?String(quick.sourceCount):'—',quick?'nguồn · '+quick.confidence:'')}
    </div>

    <section class="panel-block">
      <div class="section-head"><div><h2>Việc nên làm tiếp</h2><p class="hint">BuildMate ưu tiên việc đang chặn tiến độ A→Z.</p></div></div>
      <div class="next-actions">${actions.map((item,index)=>`
        <button class="next-action-card" data-go-view="${escapeHtml(item.view)}" ${item.guidedAction?`data-guided-action="${escapeHtml(item.guidedAction)}"`:''}>
          <span class="step-index">${index+1}</span>
          <span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.body)}</small></span>
          <span class="arrow">→</span>
        </button>`).join('')}</div>
    </section>

    <section class="panel-block">
      <div class="section-head"><div><h2>Tiến độ dự án</h2><p class="hint">${status.complete}/${status.total} stage đã sẵn sàng.</p></div></div>
      <div class="stage-grid">${status.stages.map(item=>`
        <article class="stage-card ${stageTone(item.status)}">
          <div><span class="status-dot"></span><strong>${escapeHtml(item.label)}</strong></div>
          <small>${escapeHtml(item.message)}</small>
        </article>`).join('')}</div>
    </section>

    <div class="two-col">
      <section class="panel-block">
        <div class="section-head"><div><h2>Công năng sơ bộ</h2><p class="hint">Sơ đồ khối để trao đổi, không phải bản vẽ thi công.</p></div></div>
        <div class="plan compact-plan">${floors.map(f=>`<div class="floor"><strong>${escapeHtml(f.name)}</strong>${f.rooms.map(r=>`<span>${escapeHtml(r)}</span>`).join('')}</div>`).join('')}</div>
      </section>
      <section class="panel-block">
        <div class="section-head"><div><h2>Nguồn tham chiếu</h2><p class="hint">${source?'Dự án demo có provenance công khai.':'Dự án người dùng.'}</p></div></div>
        ${source?referenceCard(source):'<p class="empty-state">Dự án này không phải fixture công khai.</p>'}
      </section>
    </div>`;
}

function referenceCard(source) {
  return `<div class="reference-card"><span class="badge">PUBLIC DEMO</span><p>${escapeHtml(source.note)}</p>
    <div class="reference-links">${(source.sources??[]).map(s=>`<a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer"><b>${escapeHtml(s.label)}</b><small>${escapeHtml((s.facts??[]).join(' · '))}</small></a>`).join('')}</div>
  </div>`;
}
