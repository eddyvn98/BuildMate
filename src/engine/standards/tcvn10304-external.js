import { standardRef } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

export function acceptSourcedPileGroupSettlement({
  settlementMm,allowableMm,modelName,modelSource,inputSetId,methodClause='7.4.3'
}) {
  if (!(Number(settlementMm)>=0)||!(Number(allowableMm)>0)) throw new RangeError('settlementMm must be >=0 and allowableMm >0');
  for (const [name,value] of Object.entries({modelName,modelSource,inputSetId,methodClause})) {
    if (!String(value??'').trim()) throw new TypeError(name+' is required');
  }
  if (!/^7\.4\.(3|4|5)/.test(String(methodClause))) {
    throw new RangeError('methodClause must identify an applicable TCVN 10304 settlement/group method in 7.4.3-7.4.5');
  }
  return {
    pass:Number(settlementMm)<=Number(allowableMm),
    settlementMm:Number(settlementMm),allowableMm:Number(allowableMm),
    model:{name:String(modelName),source:String(modelSource),inputSetId:String(inputSetId)},
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 10304:2025',
      clause:String(methodClause),
      formula:'externally solved pile/group settlement; result accepted only with model and input provenance',
      sourceUrl:SOURCE,
    }),
    warning:'This adapter does not replace the solver. The reviewer must verify that the cited model implements the selected TCVN 10304 method and that the input set matches the project geotechnical basis.',
  };
}
