import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createBuildMateServer } from '../src/server/server.js';
import { issueToken } from '../src/server/auth.js';

const secret='test-secret';

async function withServer(fn) {
  const server=createBuildMateServer({authSecret:secret});
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const base=`http://127.0.0.1:${server.address().port}`;
  try { await fn(base); } finally { server.close(); await once(server,'close'); }
}

function headers(user='u1') {
  return {'content-type':'application/json',authorization:`Bearer ${issueToken(user,secret)}`};
}

test('API enforces ownership and persists immutable calculation runs', async () => {
  await withServer(async (base)=>{
    const created=await fetch(`${base}/api/projects`,{method:'POST',headers:headers(),body:JSON.stringify({
      name:'Test house',
      location:{province:{value:'HCM',state:'confirmed'}},
      land:{widthM:{value:5,state:'confirmed'},lengthM:{value:20,state:'confirmed'}},
      budget:{totalVnd:{value:3000000000,state:'confirmed'}}
    })}).then(r=>r.json());
    assert.ok(created.id);

    const forbidden=await fetch(`${base}/api/projects/${created.id}`,{headers:headers('u2')});
    assert.equal(forbidden.status,404);

    const runResponse=await fetch(`${base}/api/projects/${created.id}/calculate`,{method:'POST',headers:headers(),body:'{}'});
    assert.equal(runResponse.status,201);
    const run=await runResponse.json();
    const fetched=await fetch(`${base}/api/projects/${created.id}/runs/${run.id}`,{headers:headers()}).then(r=>r.json());
    assert.equal(fetched.id,run.id);
    assert.equal(fetched.projectId,created.id);
  });
});

test('AI intake returns candidate updates and import creates new identity', async () => {
  await withServer(async (base)=>{
    const created=await fetch(`${base}/api/projects`,{method:'POST',headers:headers(),body:'{}'}).then(r=>r.json());
    const intake=await fetch(`${base}/api/projects/${created.id}/intake/interpret`,{
      method:'POST',headers:headers(),body:JSON.stringify({text:'nhà 5x20, ngân sách 3 tỷ'})
    }).then(r=>r.json());
    assert.equal(intake.authoritative,false);
    assert.ok(intake.updates.length>=2);

    const imported=await fetch(`${base}/api/import`,{method:'POST',headers:headers(),body:JSON.stringify(created)}).then(r=>r.json());
    assert.notEqual(imported.id,created.id);
  });
});
