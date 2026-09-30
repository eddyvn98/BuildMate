import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngineeringEvidenceRecord,engineeringEvidenceDigest,assessEngineeringEvidence } from '../src/engine/engineering-evidence.js';
import { createProject } from '../src/engine/project.js';
import { reviewEvidenceFingerprint,createEngineeringReviewRecord } from '../src/engine/review-record.js';
import { projectEngineeringReadiness } from '../src/engine/project-readiness.js';

test('engineering evidence types enforce domain-specific provenance',()=>{
  const geo=createEngineeringEvidenceRecord({
    issue:6,type:'SPT',source:'Geotech consultant',documentId:'GEO-SPT-01',issuedAt:'2026-09-30',
    methodRef:'TCVN 9351 / TCVN 10304:2025',data:{measurements:[{depthM:5,N:12}]},
  });
  assert.equal(geo.issue,6);
  assert.throws(()=>createEngineeringEvidenceRecord({
    issue:7,type:'protective-device-curve',source:'catalog',documentId:'CB1',issuedAt:'2026-09-30',
    methodRef:'manufacturer curve',data:{points:[{x:1,y:1},{x:2,y:0.2}]},
  }));
});

test('evidence digest is stable to record ordering and changes with engineering data',()=>{
  const a=createEngineeringEvidenceRecord({
    id:'a',issue:7,type:'commissioning-loop-test',source:'site test',documentId:'EL-01',issuedAt:'2026-09-30',
    methodRef:'TCVN 7447-6:2011',instrumentId:'M1',calibrationDate:'2026-08-01',data:{loopImpedanceOhm:0.8},
  });
  const b=createEngineeringEvidenceRecord({
    id:'b',issue:7,type:'protective-device-curve',source:'manufacturer',documentId:'CB-01',issuedAt:'2026-09-30',
    methodRef:'manufacturer trip curve',manufacturer:'Vendor',model:'CB20',data:{points:[{x:100,y:1},{x:200,y:0.2}]},
  });
  assert.equal(engineeringEvidenceDigest([a,b],7),engineeringEvidenceDigest([b,a],7));
  const b2={...b,data:{points:[{x:100,y:1},{x:200,y:0.1}]}};
  assert.notEqual(engineeringEvidenceDigest([a,b],7),engineeringEvidenceDigest([a,b2],7));
  assert.equal(assessEngineeringEvidence([a,b],7,{requiredTypes:['commissioning-loop-test','protective-device-curve']}).ready,true);
});

test('verified review is invalidated when project engineering evidence changes',()=>{
  const p=createProject();
  const curve=createEngineeringEvidenceRecord({
    id:'curve',issue:7,type:'protective-device-curve',source:'manufacturer',documentId:'CB-01',issuedAt:'2026-09-30',
    methodRef:'manufacturer trip curve',manufacturer:'Vendor',model:'CB20',data:{points:[{x:100,y:1},{x:200,y:0.2}]},
  });
  p.engineeringEvidence=[curve];
  const fp=reviewEvidenceFingerprint(7,{commitSha:'abc',evidence:p.engineeringEvidence});
  p.engineeringReviews=[createEngineeringReviewRecord({
    issue:7,reviewerName:'Engineer',qualification:'Electrical engineer',reviewedAt:'2026-09-30',
    outcome:'approved',independent:true,verificationStatus:'verified',verifiedBy:'admin',verifiedAt:'2026-09-30',
    evidenceFingerprint:fp,commitSha:'abc',
  })];
  assert.equal(projectEngineeringReadiness(p).find(x=>x.issue===7).constructionReady,true);
  p.engineeringEvidence[0]={...curve,data:{points:[{x:100,y:1},{x:200,y:0.1}]}};
  assert.equal(projectEngineeringReadiness(p).find(x=>x.issue===7).constructionReady,false);
});
