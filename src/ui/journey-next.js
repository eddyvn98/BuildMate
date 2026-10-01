import { homeownerNextActions } from '../engine/homeowner-next-actions.js';
import { escapeHtml,icon } from './common.js';

const VIEW_LABELS=Object.freeze({
  project:'Thông tin nhà',
  pricing:'Chi phí',
  engineering:'Tính toán',
  technical:'Hồ sơ',
  report:'Báo cáo',
});

export function journeyNextStep(project,{currentView}={}) {
  const action=homeownerNextActions(project,{limit:1})[0];
  if (!action) return '';
  const sameView=action.view===currentView;
  if (sameView&&currentView==='report'&&!action.guidedAction) return '';

  const button=action.guidedAction
    ? `<button class="flow-next-action" data-go-view="${escapeHtml(action.view)}" data-guided-action="${escapeHtml(action.guidedAction)}">Mở phép tính này ${icon('chevronRight')}</button>`
    : sameView
      ? ''
      : `<button class="flow-next-action" data-go-view="${escapeHtml(action.view)}">Sang ${escapeHtml(VIEW_LABELS[action.view]??'bước tiếp theo')} ${icon('chevronRight')}</button>`;

  return `
    <section class="flow-next-card ${sameView?'is-current':''}">
      <div class="flow-next-copy">
        <span>${sameView?'BƯỚC HIỆN TẠI':'BƯỚC TIẾP THEO'}</span>
        <strong>${escapeHtml(action.title)}</strong>
        <p>${escapeHtml(action.body)}</p>
      </div>
      ${button}
    </section>`;
}
