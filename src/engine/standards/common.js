export function standardRef({standard,clause,formula=null,sourceUrl,note=''}) {
  if (!standard || !clause || !sourceUrl) throw new TypeError('standard, clause and sourceUrl are required');
  return {standard,clause,formula,sourceUrl,note};
}

export function standardResult({value,unit,formulaId,reference,inputs={},checks={},warnings=[]}) {
  return {
    value, unit, formulaId,
    level:'engineering-review',
    reference,
    inputs:structuredClone(inputs),
    checks:structuredClone(checks),
    warnings:[...warnings],
  };
}
