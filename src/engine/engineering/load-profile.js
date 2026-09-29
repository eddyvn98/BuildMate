function requireSourced(item,name) {
  if (!item || !Number.isFinite(Number(item.value))) throw new TypeError(`${name}.value is required`);
  if (!item.unit) throw new TypeError(`${name}.unit is required`);
  if (!item.source) throw new TypeError(`${name}.source is required`);
}

export function combineLoadActions({actions,combination}) {
  if (!Array.isArray(actions) || actions.length===0) throw new TypeError('actions are required');
  if (!Array.isArray(combination) || combination.length===0) throw new TypeError('combination factors are required');
  const byId=new Map(actions.map((action)=>{
    requireSourced(action,action.id ?? 'action');
    if (!action.id) throw new TypeError('action.id is required');
    return [action.id,action];
  }));
  let total=0;
  const terms=[];
  for (const factor of combination) {
    if (!factor?.actionId || !Number.isFinite(Number(factor.factor))) throw new TypeError('combination actionId and factor are required');
    const action=byId.get(factor.actionId);
    if (!action) throw new RangeError(`Unknown action ${factor.actionId}`);
    const contribution=Number(action.value)*Number(factor.factor);
    total+=contribution;
    terms.push({actionId:action.id,value:Number(action.value),unit:action.unit,factor:Number(factor.factor),contribution,source:action.source});
  }
  const unit=terms[0].unit;
  if (!terms.every((term)=>term.unit===unit)) throw new RangeError('All load actions must use the same unit');
  return {value:round(total),unit,terms,level:'engineering-review',formulaId:'sum(action*factor)'};
}

export function sourcedNaturalCondition({name,value,unit,source,effectiveDate=null,location=null}) {
  requireSourced({value,unit,source},name);
  return {name:String(name),value:Number(value),unit:String(unit),source:String(source),effectiveDate,location};
}

function round(value,digits=4) {
  const f=10**digits; return Math.round(value*f)/f;
}
