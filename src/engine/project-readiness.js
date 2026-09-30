import { calculationsForIssue } from './engineering-calculation-record.js';
import { STANDARD_CLAUSE_COVERAGE } from './standards/coverage.js';
import { townhouseCoreScope } from './townhouse-scope.js';

const CORE_ISSUES=Object.freeze([4,5,6,7,8,12]);

export function projectEngineeringReadiness(project) {
  const calculations=project?.engineeringCalculations ?? [];
  return CORE_ISSUES.map((issue)=>{
    const coverage=STANDARD_CLAUSE_COVERAGE.find(x=>x.issue===issue);
    const issueCalculations=calculationsForIssue(calculations,issue);
    const blocked=issueCalculations.filter(x=>x.status==='blocked');
    const readyRuns=issueCalculations.filter(x=>x.status==='ready');
    const standardsReady=Boolean(coverage&&(coverage.pending??[]).length===0);
    const blockers=[];
    if (!standardsReady) blockers.push('standard-coverage-incomplete');
    if (issueCalculations.length===0) blockers.push('project-calculation-missing');
    if (blocked.length>0) blockers.push('project-input-or-evidence-blocked');
    return {
      issue,
      profile:townhouseCoreScope(issue)?.name??null,
      standardsReady,
      projectInputsReady:readyRuns.length>0&&blocked.length===0,
      constructionReady:standardsReady&&readyRuns.length>0&&blocked.length===0,
      blockers,
      calculationCount:issueCalculations.length,
      readyCalculationCount:readyRuns.length,
      blockedCalculationIds:blocked.map(x=>x.id),
    };
  });
}

export function allTownhouseEngineeringReady(project) {
  const status=projectEngineeringReadiness(project);
  return {ready:status.every(x=>x.constructionReady),profiles:status};
}
