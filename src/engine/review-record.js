import { engineeringEvidenceDigest } from './engineering-evidence.js';
import { sha256Hex,canonicalJson } from './hash.js';
import { buildIndependentReviewPacket } from './review-packet.js';

export function reviewEvidenceFingerprint(issue,{commitSha=null,evidence=[]}={}) {
  const packet=buildIndependentReviewPacket(issue,{commitSha});
  const canonical=JSON.stringify({
    issue:packet.issue,
    profile:packet.profile,
    supportedScope:packet.supportedScope,
    blockedExtensions:packet.blockedExtensions,
    implementedClauses:packet.implementedClauses,
    commitSha:packet.commitSha,
    projectEvidenceDigest:engineeringEvidenceDigest(evidence,issue),
  });
  return sha256Hex(canonicalJson(JSON.parse(canonical)));
}

export function createEngineeringReviewRecord(input) {
  const issue=Number(input?.issue);
  if (![4,5,6,7,8].includes(issue)) throw new RangeError('issue must be 4..8');
  for (const key of ['reviewerName','qualification','reviewedAt','outcome','evidenceFingerprint']) {
    if (!String(input?.[key]??'').trim()) throw new TypeError(key+' is required');
  }
  if (!['approved','rejected','changes-required'].includes(input.outcome)) throw new RangeError('invalid review outcome');
  if (input.independent!==true) throw new TypeError('independent must be true');
  const verificationStatus=input.verificationStatus ?? 'unverified';
  if (!['unverified','verified','revoked'].includes(verificationStatus)) throw new RangeError('invalid verificationStatus');
  return {
    id:input.id ?? crypto.randomUUID(),
    issue,
    reviewerName:String(input.reviewerName),
    qualification:String(input.qualification),
    reviewedAt:String(input.reviewedAt),
    outcome:String(input.outcome),
    independent:true,
    verificationStatus,
    verifiedBy:input.verifiedBy ? String(input.verifiedBy) : null,
    verifiedAt:input.verifiedAt ? String(input.verifiedAt) : null,
    evidenceFingerprint:String(input.evidenceFingerprint),
    commitSha:input.commitSha ? String(input.commitSha) : null,
    notes:input.notes ? String(input.notes) : '',
    createdAt:new Date().toISOString(),
  };
}

export function assessEngineeringReviewRecord(record,{expectedFingerprint}) {
  const blockers=[];
  if (!record?.independent) blockers.push('not-independent');
  if (!record?.qualification) blockers.push('qualification-missing');
  if (record?.outcome!=='approved') blockers.push('review-not-approved');
  if (record?.verificationStatus!=='verified') blockers.push('review-not-verified');
  if (!record?.verifiedBy||!record?.verifiedAt) blockers.push('verification-provenance-missing');
  if (expectedFingerprint && record?.evidenceFingerprint!==expectedFingerprint) blockers.push('evidence-fingerprint-mismatch');
  return {constructionReady:blockers.length===0,blockers};
}
