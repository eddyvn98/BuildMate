import test from 'node:test';
import assert from 'node:assert/strict';
import { ENGINEERING_PROFILES,engineeringProfileStatus } from '../src/engine/engineering-profiles.js';

test('engineering profiles are synchronized with implemented clause coverage and automated cases',()=>{
  for (const profile of ENGINEERING_PROFILES) {
    assert.ok(profile.clauseMap.length>0);
    assert.ok(profile.referenceCases.length>0);
    assert.ok(Array.isArray(profile.pendingGaps));
  }
});

test('zero-gap profiles become standards-ready without mandatory independent review',()=>{
  for (const profile of engineeringProfileStatus()) {
    assert.ok(!profile.blockers.includes('clause-map-missing'));
    assert.ok(!profile.blockers.includes('reference-cases-missing'));
    assert.ok(!profile.blockers.includes('independent-review-missing'));
    if (profile.pendingGaps.length>0) {
      assert.equal(profile.constructionReady,false);
      assert.ok(profile.blockers.includes('standard-coverage-incomplete'));
    } else {
      assert.equal(profile.constructionReady,true);
      assert.equal(profile.standardsReady,true);
      assert.ok(!profile.blockers.includes('standard-coverage-incomplete'));
    }
  }
});
