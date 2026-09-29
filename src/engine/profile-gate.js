export function createEngineeringProfile(input) {
  if (!input?.id || !input?.standard || !input?.version) throw new TypeError('id, standard and version are required');
  return {
    id:String(input.id),
    domain:String(input.domain ?? 'engineering'),
    standard:String(input.standard),
    version:String(input.version),
    applicability:String(input.applicability ?? ''),
    sourceUrl:String(input.sourceUrl ?? ''),
    clauseMap:Array.isArray(input.clauseMap) ? structuredClone(input.clauseMap) : [],
    referenceCases:Array.isArray(input.referenceCases) ? structuredClone(input.referenceCases) : [],
    independentReviews:Array.isArray(input.independentReviews) ? structuredClone(input.independentReviews) : [],
    pendingGaps:Array.isArray(input.pendingGaps) ? structuredClone(input.pendingGaps) : [],
    status:String(input.status ?? 'reference-confirmed'),
  };
}

export function assessProfileReadiness(profile) {
  const blockers=[];
  if (!profile.standard || !profile.version) blockers.push('standard-version-missing');
  if (!profile.sourceUrl) blockers.push('source-missing');
  if (!profile.applicability) blockers.push('applicability-missing');
  if (!Array.isArray(profile.clauseMap) || profile.clauseMap.length===0) blockers.push('clause-map-missing');
  if (!Array.isArray(profile.referenceCases) || profile.referenceCases.length===0) blockers.push('reference-cases-missing');
  if ((profile.pendingGaps ?? []).length>0) blockers.push('standard-coverage-incomplete');
  const approved=(profile.independentReviews ?? []).some((review)=>review.outcome==='approved' && review.reviewer && review.reviewedAt);
  if (!approved) blockers.push('independent-review-missing');
  return {
    profileId:profile.id,
    constructionReady:blockers.length===0,
    blockers,
    level:blockers.length===0 ? 'construction-ready' : 'engineering-review',
  };
}

export function addClauseMapping(profile,mapping) {
  if (!mapping?.clause || !mapping?.formulaId || !mapping?.units) throw new TypeError('clause, formulaId and units are required');
  return {...profile,clauseMap:[...(profile.clauseMap ?? []),structuredClone(mapping)]};
}

export function addReferenceCase(profile,referenceCase) {
  if (!referenceCase?.id || referenceCase.expected===undefined) throw new TypeError('reference case id and expected are required');
  return {...profile,referenceCases:[...(profile.referenceCases ?? []),structuredClone(referenceCase)]};
}

export function recordIndependentReview(profile,review) {
  if (!review?.reviewer || !review?.reviewedAt || !review?.outcome) throw new TypeError('reviewer, reviewedAt and outcome are required');
  return {...profile,independentReviews:[...(profile.independentReviews ?? []),structuredClone(review)]};
}
