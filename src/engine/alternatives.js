export function buildAlternatives(budgets, targetVnd = null) {
  return budgets.map((budget) => ({
    id: `alt-${budget.key}`,
    name: budget.label,
    finishLevel: budget.key,
    totalVnd: budget.total,
    deltaToTargetVnd: targetVnd ? targetVnd - budget.total : null,
    targetStatus: targetVnd ? (budget.total <= targetVnd ? 'within-budget' : 'over-budget') : 'unknown',
    lockedSafetyScope: true,
  }));
}

export function compareAlternatives(alternatives) {
  return [...alternatives].sort((a, b) => a.totalVnd - b.totalVnd);
}
