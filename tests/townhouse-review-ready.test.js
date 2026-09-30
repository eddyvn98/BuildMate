import test from 'node:test';
import assert from 'node:assert/strict';
import { townhouseCoreScope } from '../src/engine/townhouse-scope.js';
import { acceptSourcedPileGroupSettlement } from '../src/engine/standards/tcvn10304-external.js';
import { buildIndependentReviewPacket } from '../src/engine/review-packet.js';

test('townhouse core scope is explicit for all engineering issues',()=>{
  for (const n of [4,5,6,7,8]) {
    const scope=townhouseCoreScope(n);
    assert.ok(scope.supported.length>0);
    assert.ok(scope.extensions.length>0);
  }
});

test('external pile group settlement is accepted only with TCVN method/model provenance',()=>{
  const r=acceptSourcedPileGroupSettlement({
    settlementMm:22,allowableMm:80,modelName:'verified geotechnical solver',
    modelSource:'calculation package rev A',inputSetId:'GEO-001',methodClause:'7.4.3',
  });
  assert.equal(r.pass,true);
  assert.throws(()=>acceptSourcedPileGroupSettlement({settlementMm:22,allowableMm:80,modelName:'x',inputSetId:'i',methodClause:'7.4.3'}));
});

test('review packet is an optional audit and does not block zero-gap standards coverage',()=>{
  const packet=buildIndependentReviewPacket(7,{commitSha:'abc'});
  assert.equal(packet.profile,'electrical');
  assert.equal(packet.reviewRequired,false);
  assert.equal(packet.approval.constructionReady,true);
  assert.equal(packet.approval.required,false);
  assert.ok(packet.implementedClauses.length>5);
});
