import { money,number,statusBadge } from './render.js';

export { money,number,statusBadge };

export function escapeHtml(value) {
  return String(value??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}

export function metric(label,value,meta='') {
  return '<div class="metric"><span>'+escapeHtml(label)+'</span><strong>'+value+'</strong>'+(meta?'<small>'+escapeHtml(meta)+'</small>':'')+'</div>';
}

export function input(label,path,obj,type='text',min='',max='',step='') {
  const value=obj?.value??'';
  return '<label>'+escapeHtml(label)+'<input data-path="'+escapeHtml(path)+'" type="'+type+'" value="'+escapeHtml(value)+'" min="'+min+'" max="'+max+'" step="'+step+'">'+statusBadge(obj?.state??'missing')+'</label>';
}

export function option(current,value,label) {
  return '<option value="'+escapeHtml(value)+'" '+(String(current)===String(value)?'selected':'')+'>'+escapeHtml(label)+'</option>';
}

export function targetLabel(status) {
  return ({'over-budget':'Vượt ngân sách','within-budget':'Trong ngân sách',unknown:'Chưa có mục tiêu'})[status]??status;
}

export function stageTone(status) {
  return status==='ready'?'good':status==='blocked'?'bad':'warn';
}
