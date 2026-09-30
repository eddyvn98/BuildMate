import { reviewEvidenceFingerprint,assessEngineeringReviewRecord } from './review-record.js';
import { townhouseCoreScope } from './townhouse-scope.js';

export function projectEngineeringReadiness(project) {
  const reviews=project?.engineeringReviews ?? [];
  return [4,5,6,7,8].map((issue)=>{
    const issueReviews=reviews.filter(r=>Number(r.issue)===issue);
    const assessed=issueReviews.map((record)=>{
      const expectedFingerprint=reviewEvidenceFingerprint(issue,{commitSha:record.commitSha ?? null,evidence:project?.engineeringEvidence ?? []});
      return {...record,assessment:assessEngineeringReviewRecord(record,{expectedFingerprint})};
    });
    const approved=assessed.find(r=>r.assessment.constructionReady) ?? null;
    return {
      issue,
      profile:townhouseCoreScope(issue)?.name ?? null,
      constructionReady:Boolean(approved),
      approvedReviewId:approved?.id ?? null,
      reviews:assessed,
    };
  });
}

export function allTownhouseEngineeringReady(project) {
  const status=projectEngineeringReadiness(project);
  return {ready:status.every(x=>x.constructionReady),profiles:status};
}
