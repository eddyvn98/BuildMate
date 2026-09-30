import { assessEngineeringEvidence } from '../engine/engineering-evidence.js';
import { STANDARD_REFERENCE_BENCHMARKS } from '../engine/standards/reference-benchmarks.js';
import { STANDARD_CONFORMANCE_MATRIX } from '../engine/standards/conformance.js';
import { standardsSnapshotHealth } from '../engine/standards/status-registry.js';
import { projectEngineeringReadiness } from '../engine/project-readiness.js';
import { auditEngineeringEvidence } from '../engine/evidence-audit.js';
import { STANDARD_CLAUSE_COVERAGE } from '../engine/standards/coverage.js';
export function buildProjectReport(project, workflow) {
  if (!workflow?.results) throw new Error('Ready workflow results are required');

  const assumptions = collectAssumptions(project);
  const result = workflow.results;
  return {
    schema: 'buildmate-report-v1',
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      province: project.location.province.value,
      district: project.location.district.value,
    },
    overview: {
      landAreaM2: result.areas.landArea.value,
      footprintM2: result.areas.footprint.value,
      floorAreaM2: result.areas.floorArea.value,
      budgetScenarios: result.budgets.map(({ key, label, total }) => ({ key, label, totalVnd: total })),
      preferredScenario: result.preferredScenario,
      primaryBudget: structuredClone(result.primaryBudget ?? null),
      marketPricing: structuredClone(result.marketPricing ?? null),
    },
    priceBook: result.priceBook,
    technicalPackage: structuredClone(result.technicalPackage ?? null),
    engineering: result.engineering,
    engineeringReviewStatus: projectEngineeringReadiness(project),
    engineeringProjectEvidence: [4,5,6,7,8,12].map((issue)=>assessEngineeringEvidence(project.engineeringEvidence ?? [],issue)),
    engineeringCalculations: structuredClone(project.engineeringCalculations ?? []),
    engineeringEvidenceAudit: auditEngineeringEvidence(result.engineering),
    standardCoverage: structuredClone(STANDARD_CLAUSE_COVERAGE),
    standardStatusHealth: standardsSnapshotHealth(),
    standardConformance: structuredClone(STANDARD_CONFORMANCE_MATRIX),
    standardReferenceBenchmarks: structuredClone(STANDARD_REFERENCE_BENCHMARKS),
    gates: workflow.gates,
    issues: workflow.issues,
    assumptions,
    quantities: result.quantities.items,
    cashflow: result.cashflow,
    designVersions: project.designVersions ?? [],
    actualCosts: project.actuals?.entries ?? [],
  };
}

export function reportToHtml(report) {
  const budgetRows = report.overview.budgetScenarios
    .map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${money(item.totalVnd)}</td></tr>`)
    .join('');
  const assumptions = report.assumptions
    .map((item) => `<li><b>${escapeHtml(item.path)}</b>: ${escapeHtml(String(item.value))} <em>(${escapeHtml(item.state)})</em></li>`)
    .join('');
  const quantityRows = report.quantities
    .map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${item.value}</td><td>${escapeHtml(item.unit)}</td><td>${escapeHtml(item.level)}</td></tr>`)
    .join('');
  const technical=report.technicalPackage;
  const memberRows=technical ? [
    ...technical.model.structural.slabs.map(x=>['Sàn',x.id,x.level,x.areaM2+' m²','d='+x.thicknessMm+' mm']),
    ...technical.model.structural.beams.map(x=>['Dầm',x.id,x.quantity,x.totalLengthM+' m',x.bMm+'×'+x.hMm+' mm']),
    ...technical.model.structural.columns.map(x=>['Cột',x.id,x.quantity,x.segmentHeightM+' m',x.bMm+'×'+x.hMm+' mm']),
    ...technical.model.structural.foundations.map(x=>['Móng',x.id,x.quantity,x.lengthM+'×'+x.widthM+' m','d='+x.thicknessM+' m']),
  ].map(r=>'<tr>'+r.map(x=>'<td>'+escapeHtml(x)+'</td>').join('')+'</tr>').join('') : '';
  const takeoffRows=technical ? technical.takeoff.items.map(x=>`<tr><td>${escapeHtml(x.section)}</td><td>${escapeHtml(x.label)}</td><td>${escapeHtml(x.value)}</td><td>${escapeHtml(x.unit)}</td></tr>`).join('') : '';
  const boqRows=technical ? technical.boq.rows.map(x=>`<tr><td>${escapeHtml(x.section)}</td><td>${escapeHtml(x.label)}</td><td>${escapeHtml(x.quantity)}</td><td>${escapeHtml(x.unit)}</td><td>${x.unitPriceVnd==null?'—':money(x.unitPriceVnd)}</td><td>${x.amountVnd==null?'—':money(x.amountVnd)}</td></tr>`).join('') : '';

  return `<!doctype html><html lang="vi"><meta charset="utf-8"><title>${escapeHtml(report.project.name)} - BuildMate</title>
  <style>body{font-family:system-ui;max-width:900px;margin:40px auto;padding:0 20px;color:#18212b}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left}.warn{background:#fff7e6;padding:12px;border-radius:8px}small,em{color:#66717f}</style>
  <h1>${escapeHtml(report.project.name)}</h1><p>${escapeHtml(report.project.province || '')} ${escapeHtml(report.project.district || '')}</p>
  <p class="warn">BuildMate distinguishes planning outputs from standards-backed calculations. Project-specific evidence required by an applicable standard must still be present; this report is not automatically a construction drawing or signed engineering design.</p>
  <h2>Tổng quan</h2><p>Diện tích đất: <b>${report.overview.landAreaM2} m²</b> · Tổng sàn dự kiến: <b>${report.overview.floorAreaM2} m²</b></p>
  <h2>Giá nhanh hiện tại</h2><p><b>${money(report.overview.primaryBudget?.centerVnd)}</b> · ${escapeHtml(report.overview.primaryBudget?.basis ?? '')} · confidence ${escapeHtml(report.overview.primaryBudget?.confidence ?? '')}</p>
  <p>Khoảng: ${money(report.overview.primaryBudget?.lowVnd)} – ${money(report.overview.primaryBudget?.highVnd)}</p>
  <h2>Đơn giá BOQ</h2><p><b>${escapeHtml(report.priceBook.sourceLabel || '')}</b> · hiệu lực ${escapeHtml(report.priceBook.effectiveDate || '')}</p>
  <h2>Ngân sách BOQ tham khảo</h2><table><thead><tr><th>Phương án</th><th>Tổng</th></tr></thead><tbody>${budgetRows}</tbody></table>
  <h2>Khối lượng sơ bộ V1</h2><table><thead><tr><th>Hạng mục</th><th>Giá trị</th><th>Đơn vị</th><th>Mức</th></tr></thead><tbody>${quantityRows}</tbody></table>
  ${technical?`<h2>Technical Package v0.9</h2><p class="warn">Component schedule và BOQ dưới đây ở mức <b>${escapeHtml(technical.level)}</b>. Kích thước preliminary phải được thay bằng thiết kế/calc/evidence dự án trước khi thi công.</p>
  <h3>Schedule cấu kiện</h3><table><thead><tr><th>Loại</th><th>Mã</th><th>SL/Tầng</th><th>Quy mô</th><th>Kích thước</th></tr></thead><tbody>${memberRows}</tbody></table>
  <h3>Bóc khối lượng chi tiết</h3><table><thead><tr><th>Nhóm</th><th>Hạng mục</th><th>Khối lượng</th><th>ĐVT</th></tr></thead><tbody>${takeoffRows}</tbody></table>
  <h3>BOQ có đơn giá</h3><table><thead><tr><th>Nhóm</th><th>Hạng mục</th><th>KL</th><th>ĐVT</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${boqRows}</tbody></table>
  <p><b>Tạm tính các dòng đã có giá:</b> ${money(technical.boq.pricedSubtotalVnd)} · còn ${technical.boq.unpricedCount} dòng chưa có đơn giá.</p>`:''}
  <h2>Giả định</h2><ul>${assumptions}</ul>
  <h2>Trạng thái sẵn sàng kỹ thuật</h2><pre>${escapeHtml(JSON.stringify(report.engineeringReviewStatus, null, 2))}</pre>
  <h2>Evidence dự án</h2><pre>${escapeHtml(JSON.stringify(report.engineeringProjectEvidence, null, 2))}</pre>
  <h2>Calculation runs</h2><pre>${escapeHtml(JSON.stringify(report.engineeringCalculations, null, 2))}</pre>
  <h2>Bằng chứng tính toán kỹ thuật</h2><p>Audit evidence: <b>${report.engineeringEvidenceAudit.length === 0 ? 'PASS' : 'CÓ THIẾU SÓT'}</b></p><pre>${escapeHtml(JSON.stringify(report.engineeringEvidenceAudit, null, 2))}</pre>
  <h2>Tình trạng phiên bản tiêu chuẩn</h2><pre>${escapeHtml(JSON.stringify(report.standardStatusHealth, null, 2))}</pre>
  <h2>Phạm vi điều khoản tiêu chuẩn</h2><pre>${escapeHtml(JSON.stringify(report.standardCoverage, null, 2))}</pre>
  <h2>Conformance tests</h2><pre>${escapeHtml(JSON.stringify(report.standardConformance, null, 2))}</pre>
  <h2>Golden reference benchmarks</h2><pre>${escapeHtml(JSON.stringify(report.standardReferenceBenchmarks, null, 2))}</pre>
  <h2>Cổng kỹ thuật</h2><pre>${escapeHtml(JSON.stringify(report.gates, null, 2))}</pre>
  <small>Generated by BuildMate at ${escapeHtml(report.generatedAt)}</small></html>`;
}

export function quantitiesToCsv(report) {
  if (report.technicalPackage) {
    const technical=technicalPackageToCsv(report.technicalPackage);
    const legacy=(report.quantities??[]).map(item=>[
      'planning-v1',item.label,item.value,item.unit,'','','',item.id
    ].map(csvCell).join(','));
    return [technical,...legacy].join('\n');
  }
  const lines = [['id', 'label', 'value', 'unit', 'level']];
  for (const item of report.quantities) lines.push([item.id, item.label, item.value, item.unit, item.level]);
  return lines.map((row) => row.map(csvCell).join(',')).join('\n');
}

export function technicalPackageToCsv(pack) {
  const lines=[['section','item','quantity','unit','unit_price_vnd','amount_vnd','price_source','source_component']];
  const priced=new Map((pack.boq?.rows??[]).map(x=>[x.id,x]));
  for(const item of pack.takeoff?.items??[]) {
    const row=priced.get(item.id);
    lines.push([
      item.section,item.label,item.value,item.unit,
      row?.unitPriceVnd??'',row?.amountVnd??'',row?.priceSource??'',item.sourceComponentId??''
    ]);
  }
  return lines.map(row=>row.map(csvCell).join(',')).join('\n');
}

function collectAssumptions(value, path = '', output = []) {
  if (!value || typeof value !== 'object') return output;
  if ('state' in value && 'value' in value) {
    if (value.state !== 'confirmed') output.push({ path, value: value.value, state: value.state, note: value.note ?? '' });
    return output;
  }
  for (const [key, child] of Object.entries(value)) {
    if (['actuals', 'designVersions', 'alternatives'].includes(key)) continue;
    collectAssumptions(child, path ? `${path}.${key}` : key, output);
  }
  return output;
}

function money(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
