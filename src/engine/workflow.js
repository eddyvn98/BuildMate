import { calculateAreas } from './area.js';
import { calculateBudget } from './budget.js';
import { buildCashflow } from './cashflow.js';
import { readValue } from './project.js';
import { estimateQuantities } from './quantity.js';
import { engineeringGates, validatePlanningInputs } from './validation.js';

export function runPlanningWorkflow(project) {
  const issues = validatePlanningInputs(project);
  if (issues.some((issue) => issue.severity === 'blocked')) {
    return { status: 'blocked', issues, gates: engineeringGates(project), results: null };
  }

  const areas = calculateAreas(project);
  const bathrooms = Math.max(1, Math.ceil(Number(readValue(project, 'household.bedrooms', 3)) / 2));
  const quantities = estimateQuantities({ floorAreaM2: areas.floorArea.value, bathrooms });
  const budgets = calculateBudget({ floorAreaM2: areas.floorArea.value, quantities });
  const preferred = budgets.find((scenario) => scenario.key === readValue(project, 'design.finishLevel', 'balanced')) ?? budgets[1];
  const cashflow = buildCashflow(preferred.total);

  return {
    status: 'ready', issues, gates: engineeringGates(project),
    results: { areas, quantities, budgets, cashflow, preferredScenario: preferred.key },
  };
}
