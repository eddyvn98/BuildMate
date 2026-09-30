import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createBuildMateServer } from '../src/server/server.js';

async function withServer(fn) {
  const server=createBuildMateServer({authSecret:'test'});
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  try { await fn(base); } finally { server.close(); await once(server,'close'); }
}

test('review packet API exposes all townhouse engineering profiles',async()=>{
  await withServer(async(base)=>{
    const list=await fetch(base+'/api/engineering/review-packets').then(r=>r.json());
    assert.equal(list.length,6);
    assert.deepEqual(list.map(x=>x.issue),[4,5,6,7,8,12]);
    assert.ok(list.every(x=>x.reviewRequired===false));
    assert.ok(list.every(x=>x.approval.constructionReady===true));
    const rc=await fetch(base+'/api/engineering/review-packets/5').then(r=>r.json());
    assert.equal(rc.profile,'rc-design');
    assert.ok(rc.implementedClauses.length>5);
  });
});
