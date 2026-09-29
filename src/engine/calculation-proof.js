export function calculationProof(result) {
  if (!result || typeof result!=='object') throw new TypeError('result is required');
  const refs=result.reference?[result.reference]:(result.references ?? []);
  return {
    formulaId:result.formulaId ?? null,
    formula:result.reference?.formula ?? refs.find((x)=>x?.formula)?.formula ?? null,
    inputs:structuredClone(result.inputs ?? {}),
    checks:structuredClone(result.checks ?? {}),
    sources:refs.map((ref)=>({
      standard:ref.standard ?? null,
      clause:ref.clause ?? null,
      formula:ref.formula ?? null,
      sourceUrl:ref.sourceUrl ?? null,
      note:ref.note ?? '',
    })),
    reproducible:Boolean((result.formulaId||result.reference?.formula) && result.inputs && refs.length),
  };
}
