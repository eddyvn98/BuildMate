import { STANDARD_CLAUSE_COVERAGE } from './standards/coverage.js';
import { townhouseCoreScope } from './townhouse-scope.js';

export function buildIndependentReviewPacket(issue,{commitSha=null,reviewer=null}={}) {
  const n=Number(issue);
  const coverage=STANDARD_CLAUSE_COVERAGE.find(x=>x.issue===n);
  const scope=townhouseCoreScope(n);
  if (!coverage||!scope) throw new RangeError('Unknown engineering issue/profile');
  return {
    issue:n,
    profile:scope.name,
    supportedScope:scope.supported,
    blockedExtensions:scope.extensions,
    implementedClauses:[...coverage.implemented],
    automatedReferenceCases:true,
    commitSha,
    reviewer:reviewer??null,
    requiredReviewChecks:[
      'Confirm exact standard/version and applicability to 1-5 storey townhouse scope.',
      'Recalculate selected reference cases independently from the cited clauses/tables.',
      'Check units, sign conventions, formula-domain gates and interpolation rules.',
      'Check project-input provenance gates and blocked unsupported cases.',
      'Record reviewer name/qualification/date and outcome.',
    ],
    approval:{
      outcome:'pending',
      constructionReady:false,
      reason:'independent-review-not-recorded',
    },
  };
}
