import { createHash } from 'node:crypto';

const TYPES=Object.freeze({
  'qcvn02-locality':4,
  'specialist-wind':4,
  'fire-calculation-test':5,
  'borehole-log':6,
  'laboratory-soil-tests':6,
  SPT:6,
  CPT:6,
  'static-pile-test':6,
  'protective-device-curve':7,
  'commissioning-loop-test':7,
  'pump-test-report':8,
});

export function createEngineeringEvidenceRecord(input={}) {
  const type=String(input.type ?? '');
  const expectedIssue=TYPES[type];
  if (!expectedIssue) throw new RangeError('unsupported engineering evidence type');
  const issue=Number(input.issue ?? expectedIssue);
  if (issue!==expectedIssue) throw new RangeError(type+' belongs to engineering issue '+expectedIssue);
  for (const key of ['source','documentId','issuedAt','methodRef']) {
    if (!String(input[key]??'').trim()) throw new TypeError(key+' is required');
  }
  const record={
    id:String(input.id ?? crypto.randomUUID()),
    issue,type,
    source:String(input.source),
    documentId:String(input.documentId),
    issuedAt:String(input.issuedAt),
    methodRef:String(input.methodRef),
    sourceUrl:input.sourceUrl?String(input.sourceUrl):null,
    sha256:input.sha256?String(input.sha256):null,
    manufacturer:input.manufacturer?String(input.manufacturer):null,
    model:input.model?String(input.model):null,
    instrumentId:input.instrumentId?String(input.instrumentId):null,
    calibrationDate:input.calibrationDate?String(input.calibrationDate):null,
    data:structuredClone(input.data ?? {}),
    createdAt:String(input.createdAt ?? new Date().toISOString()),
  };
  const validation=validateEngineeringEvidenceRecord(record);
  if (!validation.valid) {
    const error=new Error('engineering evidence invalid: '+validation.blockers.join(', '));
    error.validation=validation;
    throw error;
  }
  return record;
}

export function validateEngineeringEvidenceRecord(record) {
  const blockers=[];
  const issue=TYPES[record?.type];
  if (!issue) blockers.push('unsupported-type');
  if (issue&&Number(record?.issue)!==issue) blockers.push('issue-type-mismatch');
  for (const key of ['source','documentId','issuedAt','methodRef']) if (!String(record?.[key]??'').trim()) blockers.push(key+'-missing');

  const d=record?.data ?? {};
  switch(record?.type) {
    case 'qcvn02-locality':
      if (!d.zone) blockers.push('wind-zone-missing');
      if (!d.sourceRow&&!d.authorityReference) blockers.push('qcvn02-row-or-authority-reference-missing');
      break;
    case 'specialist-wind':
      if (!d.geometryCase) blockers.push('geometry-case-missing');
      if (!d.method) blockers.push('specialist-method-missing');
      break;
    case 'fire-calculation-test':
      if (!(Number(d.requiredFireResistanceMinutes)>0)) blockers.push('fire-resistance-target-missing');
      if (!d.result) blockers.push('fire-result-missing');
      break;
    case 'borehole-log':
      if (!(Number(d.depthM)>0)) blockers.push('borehole-depth-missing');
      break;
    case 'laboratory-soil-tests':
      if (!Array.isArray(d.tests)||d.tests.length===0) blockers.push('soil-test-list-missing');
      break;
    case 'SPT':
    case 'CPT':
      if (!Array.isArray(d.measurements)||d.measurements.length===0) blockers.push('field-measurements-missing');
      break;
    case 'static-pile-test':
      if (!Array.isArray(d.loadSettlementPoints)||d.loadSettlementPoints.length<2) blockers.push('load-settlement-curve-missing');
      break;
    case 'protective-device-curve':
      if (!record.manufacturer) blockers.push('manufacturer-missing');
      if (!record.model) blockers.push('model-missing');
      if (!Array.isArray(d.points)||d.points.length<2) blockers.push('trip-curve-points-missing');
      break;
    case 'commissioning-loop-test':
      if (!(Number(d.loopImpedanceOhm)>0)) blockers.push('measured-loop-impedance-missing');
      if (!record.instrumentId) blockers.push('instrument-id-missing');
      if (!record.calibrationDate) blockers.push('calibration-date-missing');
      break;
    case 'pump-test-report':
      if (!record.manufacturer) blockers.push('manufacturer-missing');
      if (!record.model) blockers.push('model-missing');
      if (!Array.isArray(d.points)||d.points.length<2) blockers.push('pump-test-points-missing');
      if (!String(record.methodRef).includes('TCVN 9222')) blockers.push('tcvn9222-method-reference-missing');
      break;
  }
  return {valid:blockers.length===0,blockers,issue:issue??null,type:record?.type??null};
}

export function evidenceForIssue(records,issue) {
  return structuredClone((records ?? []).filter(x=>Number(x.issue)===Number(issue)));
}

export function engineeringEvidenceDigest(records,issue) {
  const canonical=evidenceForIssue(records,issue)
    .map(x=>({
      id:x.id,issue:Number(x.issue),type:x.type,source:x.source,documentId:x.documentId,
      issuedAt:x.issuedAt,methodRef:x.methodRef,sourceUrl:x.sourceUrl??null,sha256:x.sha256??null,
      manufacturer:x.manufacturer??null,model:x.model??null,instrumentId:x.instrumentId??null,
      calibrationDate:x.calibrationDate??null,data:x.data??{},
    }))
    .sort((a,b)=>a.id.localeCompare(b.id));
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

export function assessEngineeringEvidence(records,issue,{requiredTypes=[]}={}) {
  const issueRecords=evidenceForIssue(records,issue);
  const validation=issueRecords.map(record=>({id:record.id,...validateEngineeringEvidenceRecord(record)}));
  const present=new Set(issueRecords.map(x=>x.type));
  const missing=requiredTypes.filter(x=>!present.has(x));
  return {
    ready:missing.length===0&&validation.every(x=>x.valid),
    issue:Number(issue),missingTypes:missing,validation,records:issueRecords,
    digest:engineeringEvidenceDigest(records,issue),
  };
}
