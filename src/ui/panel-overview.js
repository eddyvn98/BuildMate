import { projectAtoZStatus } from '../engine/a2z-status.js';
import { homeownerNextActions } from '../engine/homeowner-next-actions.js';
import { functionalPlan,money,number } from './render.js';
import { escapeHtml,icon,stageTone } from './common.js';

export function overviewPanel(project,workflow) {
  const status=projectAtoZStatus(project);
  const actions=homeownerNextActions(project);
  const results=workflow.results;
  const primary=results?.primaryBudget;
  const quick=results?.marketPricing?.quickEstimate;
  const floors=functionalPlan(project);
  const source=project.referenceCase;
  const currentStage=status.stages.find(item=>item.status!=='complete'&&item.status!=='ready')??status.stages.at(-1);
  const location=[project.location?.district?.value,project.location?.province?.value].filter(Boolean).join(' · ');

  return `
    <section class="home-welcome">
      <div class="welcome-copy">
        <span class="welcome-kicker">🏡 Hành trình xây nhà</span>
        <h1>${escapeHtml(project.name)}</h1>
        <p>${escapeHtml(location||'Hãy bổ sung vị trí ngôi nhà')} · ${project.land?.widthM?.value||'—'}×${project.land?.lengthM?.value||'—'} m · ${project.design?.storeys?.value||'—'} tầng</p>
        <div class="current-stage-pill"><span>Đang ở bước</span><strong>${escapeHtml(currentStage?.label||'Chuẩn bị dự án')}</strong></div>
      </div>
      <div class="house-visual" aria-hidden="true">
        <div class="sun-dot"></div><div class="house-roof"></div><div class="house-body"><i></i><i></i><b></b></div>
        <div class="house-ground"></div>
      </div>
      <div class="journey-progress">
        <div><strong>${status.progressPercent}%</strong><span>đã sẵn sàng</span></div>
        <div class="progress-track"><i style="width:${status.progressPercent}%"></i></div>
        <small>${status.complete}/${status.total} chặng trong BuildMate</small>
      </div>
    </section>

    <section class="home-glance">
      <button class="glance-card money-card" data-go-view="pricing">
        <span class="glance-icon">₫</span><span><small>Ngân sách dự kiến</small><strong>${primary?money(primary.centerVnd):'Chưa đủ dữ liệu'}</strong><em>${primary?money(primary.lowVnd)+' – '+money(primary.highVnd):'Bổ sung thông tin để ước tính'}</em></span>
      </button>
      <button class="glance-card" data-go-view="project">
        <span class="glance-icon">⌂</span><span><small>Quy mô ngôi nhà</small><strong>${results?.areas?number(results.areas.floorArea.value,'m²'):'—'}</strong><em>${project.design?.storeys?.value||'—'} tầng dự kiến</em></span>
      </button>
      <button class="glance-card" data-go-view="pricing">
        <span class="glance-icon">◫</span><span><small>Dữ liệu thị trường</small><strong>${quick?quick.sourceCount:'—'} nguồn giá</strong><em>${quick?'Độ tin cậy '+quick.confidence:'Chưa có ước tính'}</em></span>
      </button>
    </section>

    <div class="home-main-grid">
      <section class="journey-card">
        <div class="friendly-head"><div><span class="section-kicker">LỘ TRÌNH CỦA BẠN</span><h2>Từ ý tưởng đến ngôi nhà hoàn thiện</h2><p>BuildMate sẽ dẫn bạn qua từng bước. Chỉ cần tập trung vào bước hiện tại.</p></div><span class="route-badge">${status.complete}/${status.total}</span></div>
        <div class="journey-list">${status.stages.map((item,index)=>`
          <article class="journey-step ${stageTone(item.status)}">
            <div class="journey-marker"><span>${item.status==='complete'||item.status==='ready'?'✓':index+1}</span>${index<status.stages.length-1?'<i></i>':''}</div>
            <div class="journey-step-copy"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.message)}</small></div>
            <span class="journey-state">${item.status==='complete'||item.status==='ready'?'Xong':item===currentStage?'Đang làm':'Tiếp theo'}</span>
          </article>`).join('')}</div>
      </section>

      <aside class="assistant-card">
        <div class="assistant-title"><span class="assistant-spark">✦</span><div><span>BuildMate AI</span><small>Trợ lý xây nhà</small></div></div>
        <h2>Hôm nay nên làm gì?</h2>
        <p>Tôi đã xem tình trạng dự án và ưu tiên những việc đang cản bước tiếp theo.</p>
        <div class="assistant-actions">${actions.slice(0,3).map((item,index)=>`
          <button data-go-view="${escapeHtml(item.view)}" ${item.guidedAction?`data-guided-action="${escapeHtml(item.guidedAction)}"`:''}>
            <span>${index+1}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.body)}</small></div>${icon('chevronRight')}
          </button>`).join('')}</div>
        <small class="assistant-note">Gợi ý dựa trên dữ liệu hiện có trong dự án, không thay thế phê duyệt chuyên môn.</small>
      </aside>
    </div>

    <section class="home-secondary">
      <div class="friendly-head"><div><span class="section-kicker">KHÔNG GIAN SỐNG</span><h2>Công năng đang hình thành</h2><p>Sơ đồ nhanh để bạn hình dung ngôi nhà, không phải bản vẽ thi công.</p></div><button class="text-action" data-go-view="project">Chỉnh thông tin →</button></div>
      <div class="floor-journey">${floors.map((f,index)=>`<article><span class="floor-number">0${index+1}</span><div><strong>${escapeHtml(f.name)}</strong><p>${f.rooms.map(escapeHtml).join(' · ')}</p></div></article>`).join('')}</div>
    </section>

    ${source?`<details class="source-drawer"><summary>Nguồn tham chiếu của dự án demo</summary>${referenceCard(source)}</details>`:''}
  `;
}

function referenceCard(source) {
  return `<div class="reference-card"><span class="badge">PUBLIC DEMO</span><p>${escapeHtml(source.note)}</p>
    <div class="reference-links">${(source.sources??[]).map(s=>`<a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer"><b>${escapeHtml(s.label)}</b><small>${escapeHtml((s.facts??[]).join(' · '))}</small></a>`).join('')}</div>
  </div>`;
}
