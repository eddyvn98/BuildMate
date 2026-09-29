import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { JsonFileStore } from '../src/server/file-store.js';
import { createProject } from '../src/engine/project.js';

test('JSON file store persists projects, runs and documents across instances',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'buildmate-'));
  const file=path.join(dir,'store.json');
  const first=new JsonFileStore(file);
  const project=createProject({name:'Persisted'});
  first.createProject('u1',project);
  first.createRun('u1',{id:'r1',projectId:project.id,status:'ready'});
  first.addDocument('u1',project.id,{id:'d1',name:'permit'});

  const second=new JsonFileStore(file);
  assert.equal(second.getProject('u1',project.id).name,'Persisted');
  assert.equal(second.getRun('u1',project.id,'r1').id,'r1');
  assert.equal(second.listDocuments('u1',project.id)[0].name,'permit');
});
