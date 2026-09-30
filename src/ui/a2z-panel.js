import { projectAtoZStatus } from '../engine/a2z-status.js';

export function a2zPanel(project) {
  const status=projectAtoZStatus(project);
  return `<div class="section-head"><div><h2>Tiến độ A→Z</h2><p class="hint">Mục tiêu v0.7: một căn nhà đi xuyên suốt từ dữ liệu đầu vào đến báo cáo.</p></div><div><b>${status.progressPercent}%</b> · ${status.complete}/${status.total}</div></div>
    <div class="engineering-grid">${status.stages.map(item=>`<article class="engineering-card"><div><strong>${item.label}</strong><span class="badge">${item.status}</span></div><p>${escapeHtml(item.message)}</p></article>`).join('')}</div>`;
}

function escapeHtml(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
