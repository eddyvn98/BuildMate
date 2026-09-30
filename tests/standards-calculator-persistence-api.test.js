import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createBuildMateServer } from '../src/server/server.js';
import { issueToken } from '../src/server/auth.js';

const secret='test-secret';
function headers(){return {'content-type':'application/json',authorization:'Bearer '+issueToken('calc-user',secret)};}
async function withServer(fn){
  const server=createBuildMateServer({authSecret:secret});
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  try{await fn(base);}finally{server.close();await once(server,'close');}
}

test('standard calculation API persists immutable run and matching project calculation record',async()=>{
  await withServer(async(base)=>{
    const project=await fetch(base+'/api/projects',{method:'POST',headers:headers(),body:'{}'}).then(r=>r.json());
    const response=await fetch(base+'/api/projects/'+project.id+'/engineering/calculate',{
      method:'POST',headers:headers(),
      body:JSON.stringify({action:'water.design-flow',input:{fixtureEquivalentUnits:20,litersPerPersonDay:150}})
    });
    assert.equal(response.status,201);
    const run=await response.json();
    assert.equal(run.status,'ready');
    assert.equal(run.results.standardCalculation.result.value,1.963);

    const storedProject=await fetch(base+'/api/projects/'+project.id,{headers:headers()}).then(r=>r.json());
    assert.equal(storedProject.engineeringCalculations.length,1);
    const ref=storedProject.engineeringCalculations[0];
    assert.equal(ref.id,run.id);
    assert.equal(ref.action,'water.design-flow');
    assert.equal(ref.issue,8);
    assert.equal(ref.calculationDigest.length,64);

    const fetchedRun=await fetch(base+'/api/projects/'+project.id+'/runs/'+run.id,{headers:headers()}).then(r=>r.json());
    assert.equal(fetchedRun.id,ref.id);
    assert.equal(fetchedRun.results.standardCalculation.projectEvidenceDigest,ref.projectEvidenceDigest);
  });
});
