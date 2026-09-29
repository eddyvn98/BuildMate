export function auditEngineeringEvidence(value,path='root',issues=[]) {
  if (value==null || typeof value!=='object') return issues;
  if (isEngineeringResult(value)) {
    if (!value.reference && !Array.isArray(value.references)) {
      issues.push({path,code:'missing-reference'});
    } else {
      const refs=value.reference?[value.reference]:value.references;
      for (const [i,ref] of refs.entries()) {
        const refPath=`${path}.reference[${i}]`;
        if (!ref?.standard) issues.push({path:refPath,code:'missing-standard'});
        if (!ref?.clause) issues.push({path:refPath,code:'missing-clause'});
        if (!ref?.sourceUrl) issues.push({path:refPath,code:'missing-source-url'});
      }
    }
    if (value.value!==undefined && !value.formulaId && !value.formula && !value.reference?.formula) {
      issues.push({path,code:'missing-formula-id'});
    }
    if (value.value!==undefined && value.inputs===undefined) {
      issues.push({path,code:'missing-input-trace'});
    }
  }
  for (const [key,child] of Object.entries(value)) {
    if (key==='reference'||key==='references') continue;
    auditEngineeringEvidence(child,`${path}.${key}`,issues);
  }
  return issues;
}

export function assertEngineeringEvidence(value) {
  const issues=auditEngineeringEvidence(value);
  if (issues.length) {
    const error=new Error(`Engineering evidence audit failed: ${issues.map(x=>x.path+':'+x.code).join(', ')}`);
    error.issues=issues;
    throw error;
  }
  return true;
}

function isEngineeringResult(value) {
  return ['engineering-review','construction-ready'].includes(value.level)
    && (value.value!==undefined || value.pass!==undefined || value.capacityKn!==undefined
      || value.minimumAreaMm2!==undefined || value.minimumPeMm2!==undefined
      || value.limitPercent!==undefined || value.factor!==undefined);
}
