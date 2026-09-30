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

test('calculator capability API is public',async()=>{
  await withServer(async(base)=>{
    const caps=await fetch(base+'/api/engineering/calculators').then(r=>r.json());
    assert.ok(caps.some(x=>x.id==='water.design-flow'));
    assert.ok(caps.some(x=>x.id==='foundation.pile-spt-capacity'));
  });
});
