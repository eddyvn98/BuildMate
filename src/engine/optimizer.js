const SAFE_ACTIONS = Object.freeze([
  { id: 'finish', label: 'Giảm cấp hoàn thiện', category: 'finish', maxSavingRatio: 0.08 },
  { id: 'brands', label: 'Đổi thương hiệu/thiết bị cùng công năng', category: 'equipment', maxSavingRatio: 0.05 },
  { id: 'optional-scope', label: 'Hoãn hạng mục không bắt buộc', category: 'optional', maxSavingRatio: 0.06 },
  { id: 'area', label: 'Giảm diện tích sử dụng nếu chủ nhà chấp thuận', category: 'scope', maxSavingRatio: 0.10 },
]);

export const LOCKED_CATEGORIES = Object.freeze([
  'structure-safety',
  'fire-life-safety',
  'waterproofing-required',
  'electrical-protection',
  'legal-compliance',
]);

export function analyzeBudgetFit({ targetVnd, estimatedVnd }) {
  if (!(targetVnd > 0) || !(estimatedVnd > 0)) {
    return { status: 'unknown', gapVnd: null, gapRatio: null, actions: [] };
  }
  const gapVnd = targetVnd - estimatedVnd;
  const gapRatio = gapVnd / estimatedVnd;
  if (gapVnd >= 0) return { status: 'within-budget', gapVnd, gapRatio, actions: [] };

  const neededRatio = Math.abs(gapVnd) / estimatedVnd;
  let covered = 0;
  const actions = [];
  for (const action of SAFE_ACTIONS) {
    if (covered >= neededRatio) break;
    const appliedRatio = Math.min(action.maxSavingRatio, neededRatio - covered);
    actions.push({ ...action, appliedRatio, estimatedSavingVnd: Math.round(estimatedVnd * appliedRatio), requiresApproval: true });
    covered += appliedRatio;
  }
  return {
    status: covered >= neededRatio ? 'optimizable-with-tradeoffs' : 'budget-insufficient-after-safe-optimizations',
    gapVnd,
    gapRatio,
    actions,
  };
}
