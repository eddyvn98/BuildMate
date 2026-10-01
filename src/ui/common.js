import { money,number,statusBadge } from './render.js';

export { money,number,statusBadge };

const ICONS=Object.freeze({
  home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  house:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/>',
  calculator:'<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="8" y1="10" y2="10"/><line x1="12" x2="12" y1="10" y2="10"/><line x1="16" x2="16" y1="10" y2="10"/><line x1="8" x2="8" y1="14" y2="14"/><line x1="12" x2="12" y1="14" y2="14"/><line x1="16" x2="16" y1="14" y2="14"/><line x1="8" x2="8" y1="18" y2="18"/><line x1="12" x2="12" y1="18" y2="18"/><line x1="16" x2="16" y1="18" y2="18"/>',
  clipboard:'<rect width="16" height="18" x="4" y="4" rx="2"/><path d="M9 4V2h6v2"/><path d="M9 12h6"/><path d="M9 16h6"/>',
  wallet:'<path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V7"/><path d="M16 14h4"/>',
  fileText:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>',
  play:'<path d="m7 4 13 8-13 8Z"/>',
  flask:'<path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>',
  plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  upload:'<path d="M12 21V9"/><path d="m17 14-5-5-5 5"/><path d="M5 3h14"/>',
  trash:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/>',
  save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  chevronRight:'<path d="m9 18 6-6-6-6"/>',
  external:'<path d="M15 3h6v6"/><path d="m10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
});

export function icon(name,size=18) {
  const body=ICONS[name]??ICONS.fileText;
  return '<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
}

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
  const numeric=type==='number'?' numeric-field':'';
  return '<label class="field-control'+numeric+'"><span class="field-label"><span>'+escapeHtml(label)+'</span>'+statusBadge(obj?.state??'missing')+'</span><input data-path="'+escapeHtml(path)+'" type="'+type+'" value="'+escapeHtml(value)+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>';
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
