import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { STANDARD_STATUS_SNAPSHOT,standardsSnapshotHealth,standardStatus } from '../src/engine/standards/status-registry.js';
import { STANDARD_CONFORMANCE_MATRIX } from '../src/engine/standards/conformance.js';
import { STANDARD_CLAUSE_COVERAGE } from '../src/engine/standards/coverage.js';

test('standards status snapshot is fresh on the verification date and becomes stale later',()=>{
  const fresh=standardsSnapshotHealth({asOfDate:'2026-09-30',maxAgeDays:120});
  assert.equal(fresh.healthy,true);
  assert.equal(standardStatus('TCVN 10304:2025').status,'active');
  assert.ok(STANDARD_STATUS_SNAPSHOT.length>=15);
  const stale=standardsSnapshotHealth({asOfDate:'2027-02-15',maxAgeDays:120});
  assert.equal(stale.healthy,false);
  assert.ok(stale.blockers.some(x=>x.reason==='status-reverification-required'));
});

test('every conformance catalog test file actually exists',()=>{
  for (const group of STANDARD_CONFORMANCE_MATRIX) {
    assert.ok(group.testFiles.length>0);
    for (const file of group.testFiles) {
      assert.equal(existsSync(new URL('./'+file,import.meta.url)),true,group.id+' missing '+file);
    }
  }
});

test('every zero-gap engineering issue has conformance groups',()=>{
  for (const issue of [4,5,6,7,8]) {
    const coverage=STANDARD_CLAUSE_COVERAGE.find(x=>x.issue===issue);
    assert.deepEqual(coverage.pending,[]);
    assert.ok(STANDARD_CONFORMANCE_MATRIX.some(x=>x.issue===issue));
  }
});
