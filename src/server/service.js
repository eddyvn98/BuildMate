import { addActual, removeActual } from '../engine/actuals.js';
import { createDesignVersion, addDesignVersion } from '../engine/design-versions.js';
import { createProject, hydrateProject, renameProject, setField } from '../engine/project.js';
import { runPlanningWorkflow } from '../engine/workflow.js';
import { interpretHomeownerText } from '../ai/intake.js';
import { buildProjectReport } from '../report/project-report.js';

export class BuildMateService {
  constructor(store) { this.store=store; }

  createProject(ownerId,input={}) {
    const project=createProject(input.project ?? input);
    if (input.name) project.name=String(input.name);
    return this.store.createProject(ownerId,project);
  }

  listProjects(ownerId) { return this.store.listProjects(ownerId); }
  getProject(ownerId,id) { return this.store.getProject(ownerId,id); }

  patchProject(ownerId,id,patch={}) {
    let project=this.store.getProject(ownerId,id);
    if (typeof patch.name==='string') project=renameProject(project,patch.name);
    for (const update of patch.fields ?? []) {
      project=setField(project,update.path,update.value,update.state ?? 'confirmed',update.source ?? 'api');
    }
    return this.store.saveProject(ownerId,project);
  }

  createVersion(ownerId,id,label='') {
    let project=this.store.getProject(ownerId,id);
    const workflow=runPlanningWorkflow(project);
    if (!workflow.results) throw conflict('Project is not ready for version snapshot');
    const version=createDesignVersion(project,workflow,label);
    project=addDesignVersion(project,version);
    this.store.saveProject(ownerId,project);
    return version;
  }

  listVersions(ownerId,id) {
    return this.store.getProject(ownerId,id).designVersions ?? [];
  }

  interpret(ownerId,id,text) {
    this.store.getProject(ownerId,id);
    const result=interpretHomeownerText(String(text ?? ''));
    return { ...result, authoritative:false, applyRequired:true };
  }

  calculate(ownerId,id,request={}) {
    const project=this.store.getProject(ownerId,id);
    const workflow=runPlanningWorkflow(project);
    const run={
      id:crypto.randomUUID(),
      projectId:id,
      createdAt:new Date().toISOString(),
      engineVersion:String(request.engineVersion ?? '0.4.0'),
      requestedModules:request.requestedModules ?? ['planning','quantities','budget','engineering-preview'],
      alternativeId:request.alternativeId ?? null,
      status:workflow.status,
      level:'indicative',
      results:workflow.results,
      issues:workflow.issues,
      gates:workflow.gates,
      sourceVersions:{
        priceBook:workflow.results?.priceBook?.id ?? null,
        standardProfiles:[],
      },
    };
    return this.store.createRun(ownerId,run);
  }

  getRun(ownerId,id,runId) { return this.store.getRun(ownerId,id,runId); }

  addPriceOverrides(ownerId,id,input={}) {
    let project=this.store.getProject(ownerId,id);
    if (input.sourceLabel) project=setField(project,'pricing.sourceLabel',input.sourceLabel,'confirmed','api');
    if (input.effectiveDate) project=setField(project,'pricing.effectiveDate',input.effectiveDate,'confirmed','api');
    for (const [code,value] of Object.entries(input.items ?? {})) {
      project=setField(project,`pricing.items.${code}`,Number(value),'confirmed','api');
    }
    return this.store.saveProject(ownerId,project).pricing;
  }

  addActualCost(ownerId,id,input) {
    const project=this.store.getProject(ownerId,id);
    project.actuals=addActual(project.actuals ?? {entries:[]},input);
    this.store.saveProject(ownerId,project);
    return project.actuals.entries.at(-1);
  }

  deleteActualCost(ownerId,id,entryId) {
    const project=this.store.getProject(ownerId,id);
    project.actuals=removeActual(project.actuals ?? {entries:[]},entryId);
    this.store.saveProject(ownerId,project);
    return {deleted:true};
  }

  addDocument(ownerId,id,input={}) {
    const document={
      id:crypto.randomUUID(), name:String(input.name ?? 'document'),
      kind:String(input.kind ?? 'other'), sourceUrl:input.sourceUrl ? String(input.sourceUrl) : null,
      effectiveDate:input.effectiveDate ?? null, sha256:input.sha256 ?? null,
      createdAt:new Date().toISOString(),
    };
    return this.store.addDocument(ownerId,id,document);
  }

  report(ownerId,id,runId) {
    const project=this.store.getProject(ownerId,id);
    const run=this.store.getRun(ownerId,id,runId);
    return buildProjectReport(project,{results:run.results,gates:run.gates,issues:run.issues});
  }

  importProject(ownerId,raw) {
    const project=hydrateProject(raw?.project ?? raw);
    project.id=crypto.randomUUID();
    project.createdAt=new Date().toISOString();
    project.updatedAt=project.createdAt;
    return this.store.createProject(ownerId,project);
  }
}

function conflict(message) {
  const error=new Error(message); error.statusCode=409; return error;
}
