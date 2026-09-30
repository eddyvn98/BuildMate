import { STANDARD_CLAUSE_COVERAGE } from './standards/coverage.js';
import { townhouseCoreScope } from './townhouse-scope.js';

export function buildIndependentReviewPacket(issue,{commitSha=null,reviewer=null}={}) {
  const n=Number(issue);
  const coverage=STANDARD_CLAUSE_COVERAGE.find(x=>x.issue===n);
  const scope=townhouseCoreScope(n);
  if (!coverage||!scope) throw new RangeError('Unknown engineering issue/profile');
  const standardsReady=(coverage.pending??[]).length===0;
  return {
    issue:n,
    profile:scope.name,
    supportedScope:scope.supported,
    blockedExtensions:scope.extensions,
    implementedClauses:[...coverage.implemented],
    automatedReferenceCases:true,
    commitSha,
    reviewer:reviewer??null,
    reviewRequired:false,
    auditChecks:[
      'Confirm exact standard/version and applicability to the townhouse scope.',
      'Recalculate selected reference cases from the cited clauses/tables when an optional audit is performed.',
      'Check units, sign conventions, formula-domain gates and interpolation rules.',
      'Check project-input provenance gates and blocked unsupported cases.',
      'Record auditor identity/date/outcome when an optional audit is performed.',
    ],
    approval:{
      required:false,
      outcome:'not-required',
      standardsReady,
      constructionReady:standardsReady,
      reason:standardsReady?'standard-coverage-complete':'standard-coverage-incomplete',
    },
  };
}
