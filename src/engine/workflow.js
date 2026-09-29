import { calculateAreas } from './area.js';
import { calculateBudget } from './budget.js';
import { buildCashflow } from './cashflow.js';
import { readValue } from './project.js';
import { estimateQuantities } from './quantity.js';
import { engineeringGates, validatePlanningInputs } from './validation.js';
import { buildAlternatives } from './alternatives.js';
import { analyzeBudgetFit } from './optimizer.js';
import { runEngineeringPreview } from './engineering-preview.js';

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
  const targetVnd = Number(readValue(project, 'budget.totalVnd', 0));
  const alternatives = buildAlternatives(budgets, targetVnd || null);
  const budgetFit = analyzeBudgetFit({ targetVnd, estimatedVnd: preferred.total });
  const planningResults = { areas, quantities, budgets, alternatives, budgetFit, cashflow, preferredScenario: preferred.key };
  const engineering = runEngineeringPreview(project, planningResults);

  return {
    status: 'ready',
    issues,
    gates: engineeringGates(project),
    results: { ...planningResults, engineering },
  };
}
