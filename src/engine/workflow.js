import { calculateAreas } from './area.js';
import { calculateBudget } from './budget.js';
import { buildCashflow } from './cashflow.js';
import { readValue } from './project.js';
import { estimateQuantities } from './quantity.js';
import { engineeringGates, validatePlanningInputs } from './validation.js';
import { buildAlternatives } from './alternatives.js';
import { analyzeBudgetFit } from './optimizer.js';
import { runEngineeringPreview } from './engineering-preview.js';
import { buildProjectPriceBook } from './project-price-book.js';
import { resolvePlanningRules } from './planning-rules.js';

export function runPlanningWorkflow(project) {
  const issues = validatePlanningInputs(project);
  if (issues.some((issue) => issue.severity === 'blocked')) {
    return { status: 'blocked', issues, gates: engineeringGates(project), results: null };
  }

  const areas = calculateAreas(project);
  const bathrooms = Math.max(1, Math.ceil(Number(readValue(project, 'household.bedrooms', 3)) / 2));
  const quantities = estimateQuantities({ floorAreaM2: areas.floorArea.value, bathrooms });
  const priceBook = buildProjectPriceBook(project);
  const budgets = calculateBudget({ floorAreaM2: areas.floorArea.value, quantities, priceBook });
  const preferred = budgets.find((scenario) => scenario.key === readValue(project, 'design.finishLevel', 'balanced')) ?? budgets[1];
  const cashflow = buildCashflow(preferred.total);
  const targetVnd = Number(readValue(project, 'budget.totalVnd', 0));
  const alternatives = buildAlternatives(budgets, targetVnd || null);
  const budgetFit = analyzeBudgetFit({ targetVnd, estimatedVnd: preferred.total });
  const planningResults = {
    areas,
    quantities,
    priceBook: {
      id: priceBook.id,
      locality: priceBook.locality,
      effectiveDate: priceBook.effectiveDate,
      sourceLabel: priceBook.sourceLabel,
      overrides: priceBook.overrides ?? {},
    },
    budgets,
    alternatives,
    budgetFit,
    cashflow,
    preferredScenario: preferred.key,
  };
  const projectDate = readValue(project, 'context.projectDate', project.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const planningRules = resolvePlanningRules({
    projectDate,
    locality: {
      province: readValue(project, 'location.province', ''),
      district: readValue(project, 'location.district', ''),
      ward: readValue(project, 'location.ward', ''),
      parcel: readValue(project, 'location.parcel', ''),
    },
    rules: project.planningRules ?? [],
  });
  const engineering = runEngineeringPreview(project, planningResults);

  return {
    status: 'ready',
    issues,
    gates: engineeringGates(project),
    results: { ...planningResults, planningRules, engineering },
  };
}
