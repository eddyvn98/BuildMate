import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewEvidenceFingerprint,createEngineeringReviewRecord,assessEngineeringReviewRecord } from '../src/engine/review-record.js';

test('engineering review signs an exact evidence fingerprint',()=>{
  const fingerprint=reviewEvidenceFingerprint(5,{commitSha:'abc'});
  assert.equal(fingerprint.length,64);
  const record=createEngineeringReviewRecord({
    issue:5,reviewerName:'Engineer A',qualification:'Licensed structural engineer',
    reviewedAt:'2026-09-30',outcome:'approved',independent:true,
    evidenceFingerprint:fingerprint,commitSha:'abc',
  });
  const unverified=assessEngineeringReviewRecord(record,{expectedFingerprint:fingerprint});
  assert.equal(unverified.constructionReady,false);
  assert.ok(unverified.blockers.includes('review-not-verified'));

  const verified={...record,verificationStatus:'verified',verifiedBy:'org-admin',verifiedAt:'2026-09-30'};
  assert.equal(assessEngineeringReviewRecord(verified,{expectedFingerprint:fingerprint}).constructionReady,true);
});

test('review becomes invalid when evidence fingerprint changes',()=>{
  const fingerprint=reviewEvidenceFingerprint(7,{commitSha:'old'});
  const record=createEngineeringReviewRecord({
    issue:7,reviewerName:'Engineer B',qualification:'Electrical engineer',
    reviewedAt:'2026-09-30',outcome:'approved',independent:true,
    evidenceFingerprint:fingerprint,commitSha:'old',verificationStatus:'verified',
    verifiedBy:'org-admin',verifiedAt:'2026-09-30',
  });
  assert.equal(assessEngineeringReviewRecord(record,{expectedFingerprint:reviewEvidenceFingerprint(7,{commitSha:'new'})}).constructionReady,false);
});
