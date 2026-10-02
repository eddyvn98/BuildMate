import { ENGINEERING_EVIDENCE_TYPES,evidenceDataExample } from './engineering-tools.js';
import { guidedCalculatorSpec,guidedCalculatorSpecs } from './guided-calculator.js';
import { explainCalculation } from './calculation-explain.js';
import { escapeHtml,icon,metric } from './common.js';
import { money,number } from './render.js';
import { journeyNextStep } from './journey-next.js';

export function engineeringPanel(project,workflow,{calculatorCapabilities=[],calculatorState={},guidedState={},evidenceState={}}={}) {
  const engineering=workflow.results?.engineering;
  const spec=guidedCalculatorSpec(guidedState.action??'loads.permanent');
  const recent=(project.engineeringCalculations??[]).slice().reverse();
  return `
    <section class="panel-block">
      <div class="section-head"><div><h2>Kiểm tra kỹ thuật</h2><p class="hint">Mỗi nhóm chỉ được đánh dấu đã có kết quả khi BuildMate đã tính bằng dữ liệu phù hợp. Mục thiếu dữ liệu sẽ được báo rõ để bạn biết cần bổ sung gì.</p></div></div>
      <div class="engineering-grid">${engineeringCards(engineering)}</div>
    </section>

    <section class="panel-block guided-calculator">
      <div class="section-head">
        <div><span class="eyebrow">TÍNH THEO TIÊU CHUẨN</span><h2>Chọn phép tính cần kiểm tra</h2><p class="hint">${escapeHtml(spec.description)}</p></div>
        <span class="badge">${escapeHtml(spec.group)}</span>
      </div>
      <div class="guided-tabs">${guidedCalculatorSpecs().map(item=>`
        <button class="${item.id===spec.id?'active':''}" data-guided-action="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join('')}</div>
      ${spec.warning?'<div class="alert">'+escapeHtml(spec.warning)+'</div>':''}
      <form id="guided-calculator-form" class="guided-form content-form" data-guided-action="${escapeHtml(spec.id)}">
        ${spec.fields.map(field=>guidedField(field,guidedState.values??{})).join('')}
        <div class="guided-submit"><button type="submit" class="guided-primary-action" title="Tính theo tiêu chuẩn" aria-label="Tính theo tiêu chuẩn">${icon('calculator')}<span>Tính theo tiêu chuẩn</span></button><small>Kết quả sẽ tự lưu vào lịch sử dự án.</small></div>
      </form>
      ${guidedState.error?'<div class="alert">'+escapeHtml(guidedState.error)+'</div>':''}
      ${guidedState.output?guidedResult(guidedState.record??null,guidedState.output):''}
    </section>

    <section class="panel-block">
      <div class="section-head"><div><h2>Lịch sử tính toán</h2><p class="hint">Mở từng kết quả để xem tiêu chuẩn, dữ liệu đã dùng và cách BuildMate tính.</p></div><span>${recent.length} kết quả</span></div>
      <div class="calculation-history">${recent.length?recent.map(calculationCard).join(''):'<p class="empty-state">Chưa có kết quả tính toán. Chọn một phép tính ở trên để bắt đầu.</p>'}</div>
    </section>

    <section class="panel-block">
      <details class="advanced expert-zone">
        <summary>Chế độ chuyên gia · JSON + hồ sơ chứng minh</summary>
        ${expertCalculator(calculatorCapabilities,calculatorState)}
        ${evidencePanel(project,evidenceState)}
      </details>
    </section>\n\n    ${journeyNextStep(project,{currentView:'engineering'})}`;
}

function engineeringCards(engineering) {
  if (!engineering||engineering.status!=='ready') return '<p class="empty-state">Cần nhập quy mô cơ bản trước.</p>';
  const m=engineering.modules;
  return [
    card('Tải trọng',m.structure),
    card('Móng',m.foundation),
    card('Điện',m.electrical),
    card('Nước',m.water),
    card('Thông gió / điều hòa',m.hvac),
  ].join('');
}

function card(label,module) {
  const status=module?.status??'blocked';
  const value=module?.result?.value!==undefined?String(module.result.value)+' '+String(module.result.unit??''):'';
  return `<article class="engineering-card"><div><strong>${escapeHtml(label)}</strong><span class="badge engineering-status ${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span></div><p>${escapeHtml(value||module?.message||'Chưa có kết quả')}</p></article>`;
}

function guidedField(field,values) {
  const value=values[field.key]??field.defaultValue??'';
  if (field.type==='select') {
    return `<label class="field-control field-select"><span class="field-label"><span>${escapeHtml(field.label)}</span></span><select data-guided-key="${escapeHtml(field.key)}">${field.options.map(([v,l])=>`<option value="${escapeHtml(v)}" ${String(v)===String(value)?'selected':''}>${escapeHtml(l)}</option>`).join('')}</select></label>`;
  }
  const suffix=field.unit?'<span class="field-unit">'+escapeHtml(field.unit)+'</span>':'';
  return `<label class="field-control ${field.type==='number'?'field-number numeric-field':'field-text'}"><span class="field-label"><span>${escapeHtml(field.label)}</span></span><div class="input-with-unit"><input data-guided-key="${escapeHtml(field.key)}" type="${field.type}" value="${escapeHtml(value)}" ${field.min!==undefined?`min="${field.min}"`:''} ${field.max!==undefined?`max="${field.max}"`:''} ${field.step!==undefined?`step="${field.step}"`:''} placeholder="${escapeHtml(field.placeholder??'')}">${suffix}</div></label>`;
}

function guidedResult(record,output) {
  const explain=record?explainCalculation(record):null;
  if (output.status==='blocked') return '<div class="alert">Chưa thể tính: '+escapeHtml(output.reason??'Thiếu dữ liệu chứng minh')+'</div>';
  if (!explain) return '<div class="calc-output"><pre>'+escapeHtml(JSON.stringify(output.result,null,2))+'</pre></div>';
  return `<div class="explain-box"><div class="section-head"><div><b>Kết quả</b><small>${escapeHtml(explain.standard)}</small></div><span class="badge">Theo tiêu chuẩn</span></div>
    <div class="explain-metrics">${explain.summary.map(x=>metric(x.label,escapeHtml(x.value)+' '+escapeHtml(x.unit))).join('')}</div>
    ${explain.formula?'<div class="formula">'+escapeHtml(explain.formula)+'</div>':''}
    <ol>${explain.steps.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')}</ol>
  </div>`;
}

function calculationCard(record) {
  const explain=explainCalculation(record);
  return `<details class="calculation-card"><summary><span><b>${escapeHtml(titleFor(record.action))}</b><small>${escapeHtml(record.standard)}</small></span><span class="badge engineering-status ${escapeHtml(record.status)}">${escapeHtml(statusLabel(record.status))}</span></summary>
    <div class="explain-metrics">${explain.summary.map(x=>metric(x.label,escapeHtml(x.value)+' '+escapeHtml(x.unit))).join('')}</div>
    ${explain.formula?'<div class="formula">'+escapeHtml(explain.formula)+'</div>':''}
    <ol>${explain.steps.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')}</ol>
    <small>Ngày tính: ${escapeHtml(record.createdAt)}</small>
    <details class="raw-detail"><summary>Dữ liệu đầu vào / kết quả thô</summary><pre>${escapeHtml(JSON.stringify({input:record.input,result:record.result,evidenceAudit:record.evidenceAudit,calculationDigest:record.calculationDigest},null,2))}</pre></details>
  </details>`;
}

function titleFor(action) {
  return guidedCalculatorSpecs().find(x=>x.id===action)?.label??action;
}

function expertCalculator(capabilities,state) {
  const selected=capabilities.find(x=>x.id===state.action)??capabilities[0];
  return `<div class="expert-block"><h3>Raw standards calculator</h3>
    <form id="standard-calculator-form" class="standard-tool-grid">
      <label>Workflow<select id="standard-calculator-action">${capabilities.map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===state.action?'selected':''}>${escapeHtml(x.id)} · #${x.issue}</option>`).join('')}</select></label>
      <div class="evidence-requirement"><b>Evidence bắt buộc</b><span>${selected?.requiredEvidenceTypes?.length?selected.requiredEvidenceTypes.map(x=>'<code>'+escapeHtml(x)+'</code>').join(' '):'Không có external evidence bắt buộc'}</span></div>
      <label class="wide-field">Input JSON<textarea id="standard-calculator-input" spellcheck="false">${escapeHtml(state.inputText??'{}')}</textarea></label>
      <div><button type="submit" class="icon-button primary-icon" title="Chạy raw calculator" aria-label="Chạy raw calculator">${icon('play')}</button></div>
    </form>
    ${state.error?'<div class="alert">'+escapeHtml(state.error)+'</div>':''}
    ${state.output?'<pre class="raw-output">'+escapeHtml(JSON.stringify(state.output,null,2))+'</pre>':''}
  </div>`;
}

function evidencePanel(project,state) {
  const evidence=project.engineeringEvidence??[];
  const defaultType=ENGINEERING_EVIDENCE_TYPES[0][0];
  return `<div class="expert-block"><h3>Project engineering evidence (${evidence.length})</h3>
    ${state.error?'<div class="alert">'+escapeHtml(state.error)+'</div>':''}
    <form id="engineering-evidence-form" class="evidence-form content-form">
      <label class="field-control field-select"><span class="field-label"><span>Loại</span></span><select id="engineering-evidence-type">${ENGINEERING_EVIDENCE_TYPES.map(([v,l])=>'<option value="'+escapeHtml(v)+'">'+escapeHtml(l)+'</option>').join('')}</select></label>
      <label class="field-control field-text"><span class="field-label"><span>Nguồn</span></span><input id="engineering-evidence-source" required></label>
      <label class="field-control field-text"><span class="field-label"><span>Mã tài liệu</span></span><input id="engineering-evidence-document-id" required></label>
      <label class="field-control field-date"><span class="field-label"><span>Ngày phát hành</span></span><input id="engineering-evidence-issued-at" type="date" required value="${new Date().toISOString().slice(0,10)}"></label>
      <label class="field-control field-text field-text-wide"><span class="field-label"><span>Phương pháp/điều khoản</span></span><input id="engineering-evidence-method" required></label>
      <label class="wide-field">Data JSON<textarea id="engineering-evidence-data">${escapeHtml(JSON.stringify(evidenceDataExample(defaultType),null,2))}</textarea></label>
      <input id="engineering-evidence-manufacturer" hidden><input id="engineering-evidence-model" hidden><input id="engineering-evidence-instrument" hidden><input id="engineering-evidence-calibration" hidden>
      <div><button type="submit" class="icon-button primary-icon" title="Thêm evidence" aria-label="Thêm evidence">${icon('plus')}</button></div>
    </form>
    <div class="evidence-list">${evidence.map(item=>`<article><div><b>#${item.issue} · ${escapeHtml(item.type)}</b><small>${escapeHtml(item.source)} · ${escapeHtml(item.documentId)}</small></div><button class="ghost danger icon-button" data-remove-engineering-evidence="${item.id}" title="Xóa evidence" aria-label="Xóa evidence">${icon('trash')}</button></article>`).join('')}</div>
  </div>`;
}


function statusLabel(status) {
  return ({
    ready:'Đã có kết quả',
    blocked:'Cần dữ liệu',
    warning:'Cần kiểm tra',
    complete:'Đã hoàn tất',
  })[status]??status;
}
