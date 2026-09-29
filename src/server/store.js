export class MemoryStore {
  constructor(seed = {}) {
    this.projects = new Map();
    this.runs = new Map();
    this.documents = new Map();
    this.priceBooks = Array.isArray(seed.priceBooks) ? structuredClone(seed.priceBooks) : [];
  }

  createProject(ownerId, project) {
    const record = { ownerId, project: structuredClone(project) };
    this.projects.set(project.id, record);
    return structuredClone(project);
  }

  listProjects(ownerId) {
    return [...this.projects.values()]
      .filter((record)=>record.ownerId===ownerId)
      .map((record)=>structuredClone(record.project));
  }

  getProject(ownerId, projectId) {
    const record=this.projects.get(projectId);
    if (!record || record.ownerId!==ownerId) throw notFound('project');
    return structuredClone(record.project);
  }

  saveProject(ownerId, project) {
    const record=this.projects.get(project.id);
    if (!record || record.ownerId!==ownerId) throw notFound('project');
    record.project=structuredClone(project);
    return structuredClone(project);
  }

  createRun(ownerId, run) {
    const key=`${run.projectId}:${run.id}`;
    this.runs.set(key,{ownerId,run:structuredClone(run)});
    return structuredClone(run);
  }

  getRun(ownerId, projectId, runId) {
    const record=this.runs.get(`${projectId}:${runId}`);
    if (!record || record.ownerId!==ownerId) throw notFound('run');
    return structuredClone(record.run);
  }

  addDocument(ownerId, projectId, document) {
    this.getProject(ownerId, projectId);
    const list=this.documents.get(projectId) ?? [];
    list.push(structuredClone(document));
    this.documents.set(projectId,list);
    return structuredClone(document);
  }

  listDocuments(ownerId, projectId) {
    this.getProject(ownerId, projectId);
    return structuredClone(this.documents.get(projectId) ?? []);
  }

  listPriceBooks({province,effectiveDate}={}) {
    return structuredClone(this.priceBooks.filter((book)=>{
      if (province && book.province && book.province!==province) return false;
      if (effectiveDate && book.effectiveDate && book.effectiveDate>effectiveDate) return false;
      return true;
    }));
  }
}

function notFound(kind) {
  const error=new Error(`${kind} not found`);
  error.statusCode=404;
  return error;
}
