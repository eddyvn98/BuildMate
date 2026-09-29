import fs from 'node:fs';
import path from 'node:path';
import { MemoryStore } from './store.js';

export class JsonFileStore extends MemoryStore {
  constructor(filePath) {
    const seed=readSeed(filePath);
    super({priceBooks:seed.priceBooks ?? []});
    this.filePath=filePath;
    for (const [id,record] of seed.projects ?? []) this.projects.set(id,record);
    for (const [id,record] of seed.runs ?? []) this.runs.set(id,record);
    for (const [id,list] of seed.documents ?? []) this.documents.set(id,list);
  }

  createProject(ownerId,project) {
    const value=super.createProject(ownerId,project); this.persist(); return value;
  }
  saveProject(ownerId,project) {
    const value=super.saveProject(ownerId,project); this.persist(); return value;
  }
  createRun(ownerId,run) {
    const value=super.createRun(ownerId,run); this.persist(); return value;
  }
  addDocument(ownerId,projectId,document) {
    const value=super.addDocument(ownerId,projectId,document); this.persist(); return value;
  }

  persist() {
    const dir=path.dirname(this.filePath);
    fs.mkdirSync(dir,{recursive:true});
    const payload={
      schema:'buildmate-store-v1',
      projects:[...this.projects.entries()],
      runs:[...this.runs.entries()],
      documents:[...this.documents.entries()],
      priceBooks:this.priceBooks,
    };
    const temp=`${this.filePath}.tmp`;
    fs.writeFileSync(temp,JSON.stringify(payload,null,2),'utf8');
    fs.renameSync(temp,this.filePath);
  }
}

function readSeed(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const raw=JSON.parse(fs.readFileSync(filePath,'utf8'));
  if (raw.schema && raw.schema!=='buildmate-store-v1') throw new Error('Unsupported BuildMate store schema');
  return raw;
}
