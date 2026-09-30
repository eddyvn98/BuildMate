export function assessPileGeotechnicalBasis(input={}) {
  const documents=Array.isArray(input.documents)?input.documents:[];
  const types=new Set(documents.map(d=>d.type));
  const blockers=[];

  if (!types.has('borehole-log')) blockers.push('borehole-log-missing');
  if (!types.has('laboratory-soil-tests')) blockers.push('laboratory-soil-tests-missing');
  if (!types.has('SPT')&&!types.has('CPT')) blockers.push('SPT-or-CPT-missing');

  const unsourced=documents.filter(d=>!d.source||!d.date||!d.id).map(d=>d.type ?? 'unknown');
  if (unsourced.length) blockers.push('document-provenance-missing');

  return {
    ready:blockers.length===0,
    blockers,
    documents:structuredClone(documents),
    requiredBy:{
      standard:'TCVN 10304:2025',
      clauses:['5.1','5.2','5.3'],
      sourceUrl:'https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx',
      note:'Borehole/sample description, laboratory investigation, and CPT/SPT are core investigation activities for pile-foundation design.',
    },
  };
}

export function assertPileGeotechnicalBasis(input) {
  const assessment=assessPileGeotechnicalBasis(input);
  if (!assessment.ready) {
    const error=new Error('Pile geotechnical basis is incomplete: '+assessment.blockers.join(', '));
    error.statusCode=409;
    error.assessment=assessment;
    throw error;
  }
  return assessment;
}
