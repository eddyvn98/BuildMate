import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/engine/project.js';
import { reviewEvidenceFingerprint,createEngineeringReviewRecord } from '../src/engine/review-record.js';
import { projectEngineeringReadiness,allTownhouseEngineeringReady } from '../src/engine/project-readiness.js';

test('project readiness is false without independently verified reviews',()=>{
  const p=createProject();
  const status=projectEngineeringReadiness(p);
  assert.equal(status.length,5);
  assert.ok(status.every(x=>x.constructionReady===false));
  assert.equal(allTownhouseEngineeringReady(p).ready,false);
});

test('verified review makes only its exact profile ready',()=>{
  const p=createProject();
  const fp=reviewEvidenceFingerprint(4,{commitSha:'abc'});
  p.engineeringReviews=[createEngineeringReviewRecord({
    issue:4,reviewerName:'Engineer',qualification:'Structural engineer',
    reviewedAt:'2026-09-30',outcome:'approved',independent:true,
    verificationStatus:'verified',verifiedBy:'org-admin',verifiedAt:'2026-09-30',
    evidenceFingerprint:fp,commitSha:'abc',
  })];
  const status=projectEngineeringReadiness(p);
  assert.equal(status.find(x=>x.issue===4).constructionReady,true);
  assert.equal(status.find(x=>x.issue===5).constructionReady,false);
});
