import { sha256Hex,canonicalJson } from './hash.js';

export function createEngineeringCalculationRecord({
  id=null,action,issue,standard,input,output,engineVersion='1.0.0',createdAt=null
}) {
  if (!action||!standard) throw new TypeError('action and standard are required');
  if (![4,5,6,7,8,12].includes(Number(issue))) throw new RangeError('unsupported engineering issue');
  const payload={
    action:String(action),issue:Number(issue),standard:String(standard),
    engineVersion:String(engineVersion),input:structuredClone(input ?? {}),
    status:String(output?.status ?? 'unknown'),
    projectEvidenceDigest:output?.projectEvidenceDigest ?? output?.evidence?.digest ?? null,
    result:structuredClone(output?.result ?? null),
    evidenceAudit:structuredClone(output?.evidenceAudit ?? []),
    blockers:structuredClone(output?.evidence?.missingTypes ?? []),
  };
  return {
    id:String(id ?? crypto.randomUUID()),
    ...payload,
    calculationDigest:sha256Hex(canonicalJson(payload)),
    createdAt:String(createdAt ?? new Date().toISOString()),
  };
}

export function calculationSetDigest(records,issue) {
  const canonical=(records ?? [])
    .filter(x=>Number(x.issue)===Number(issue))
    .map(x=>({
      id:x.id,action:x.action,issue:Number(x.issue),standard:x.standard,
      engineVersion:x.engineVersion,status:x.status,
      projectEvidenceDigest:x.projectEvidenceDigest ?? null,
      calculationDigest:x.calculationDigest,
    }))
    .sort((a,b)=>a.id.localeCompare(b.id));
  return sha256Hex(canonicalJson(canonical));
}

export function calculationsForIssue(records,issue) {
  return structuredClone((records ?? []).filter(x=>Number(x.issue)===Number(issue)));
}
