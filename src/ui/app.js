import { createEngineeringCalculationRecord } from '../engine/engineering-calculation-record.js';
import { calculatorExample,evidenceDataExample } from './engineering-tools.js';
import { guidedDefaultValues,buildGuidedInput } from './guided-calculator.js';
import { createEngineeringEvidenceRecord } from '../engine/engineering-evidence.js';
import { standardCalculatorCapabilities,runStandardCalculation } from '../engine/engineering/standards-calculator.js';
import { createPublicReferenceProject,publicReferenceCalculationInputs } from '../demo/public-reference-project.js';
import { interpretHomeownerText,nextQuestion } from '../ai/intake.js';
import { extractDocumentCandidates } from '../ai/document-intake.js';
import { extractFileText } from './file-text-extractor.js';
import { addActual,removeActual } from '../engine/actuals.js';
import { addDesignVersion,createDesignVersion } from '../engine/design-versions.js';
import { createProject,renameProject,setField,FIELD_STATES } from '../engine/project.js';
import { runPlanningWorkflow } from '../engine/workflow.js';
import { downloadText } from '../report/download.js';
import { buildProjectReport,quantitiesToCsv,reportToHtml } from '../report/project-report.js';
import { activateProject,deleteProject,exportProjectsJson,importProjectsJson,listProjects,loadProject,saveProject } from '../storage.js';
import { shell } from './panels.js';

const storedProject=loadProject();
let project=storedProject??createAndSave();
let workflow=runPlanningWorkflow(project);
let activeView=storedProject?'overview':'project';
const calculatorCapabilities=standardCalculatorCapabilities();
let calculatorState={
  action:'water.design-flow',
  inputText:JSON.stringify(calculatorExample('water.design-flow'),null,2),
  output:null,error:null,
};
let guidedState=initialGuided('loads.permanent');
let evidenceState={error:null};
let documentImportState={status:'idle',candidates:[]};
const el=id=>document.getElementById(id);

function createAndSave() {
  const created=createProject();
  saveProject(created);
  return created;
}

function initialGuided(action) {
  return {action,values:guidedDefaultValues(action),output:null,record:null,error:null};
}

function update(path,value,parser=v=>v) {
  project=setField(project,path,parser(value));
  saveProject(project);
  render();
}

function render() {
  workflow=runPlanningWorkflow(project);
  el('app').innerHTML=shell({
    project,projects:listProjects(),workflow,calculatorCapabilities,
    calculatorState,guidedState,evidenceState,documentImportState,activeView,
  });
  const question=el('next-question');
  if (question) question.textContent=nextQuestion(project);
  bindFieldInputs();
  bindActions();
}

function bindFieldInputs() {
  document.querySelectorAll('[data-path]').forEach(input=>{
    input.addEventListener('change',()=>update(
      input.dataset.path,
      input.type==='checkbox'?input.checked:input.value,
      input.type==='number'?Number:v=>v,
    ));
  });
}

function bindActions() {
  document.querySelectorAll('[data-view],[data-go-view]').forEach(button=>{
    button.addEventListener('click',()=>{
      activeView=button.dataset.view??button.dataset.goView??'overview';
      if (button.dataset.guidedAction) guidedState=initialGuided(button.dataset.guidedAction);
      render();
    });
  });
  document.querySelectorAll('[data-guided-action]').forEach(button=>{
    if (button.dataset.goView) return;
    button.addEventListener('click',()=>{
      activeView='engineering';
      guidedState=initialGuided(button.dataset.guidedAction);
      render();
    });
  });

  el('load-public-demo')?.addEventListener('click',loadPublicDemo);
  el('run-demo-a2z')?.addEventListener('click',runPublicDemoAtoZ);
  el('chat-form')?.addEventListener('submit',onChat);
  el('project-select')?.addEventListener('change',event=>switchProject(event.target.value));
  el('project-name')?.addEventListener('change',event=>{
    project=renameProject(project,event.target.value);
    saveProject(project); render();
  });
  el('new-project')?.addEventListener('click',()=>{
    project=createAndSave(); documentImportState={status:'idle',candidates:[]}; activeView='project'; render();
  });
  el('delete-project')?.addEventListener('click',()=>{
    const ok=typeof globalThis.confirm==='function'
      ? globalThis.confirm('Xóa project "'+project.name+'"? Thao tác này xóa dữ liệu local của project này.')
      : true;
    if (!ok) return;
    deleteProject(project.id);
    project=loadProject()??createAndSave();
    activeView='overview'; render();
  });
  el('save-version')?.addEventListener('click',()=>{
    if (!workflow.results) return;
    project=addDesignVersion(project,createDesignVersion(project,workflow));
    saveProject(project); render();
  });
  el('actual-form')?.addEventListener('submit',onActual);
  document.querySelectorAll('[data-remove-actual]').forEach(button=>button.addEventListener('click',()=>{
    project={...project,actuals:removeActual(project.actuals,button.dataset.removeActual)};
    saveProject(project); render();
  }));
  bindImportExport();
  bindDocumentImport();
  bindGuidedCalculator();
  bindEngineeringTools();
}

function bindDocumentImport() {
  el('pick-document-import')?.addEventListener('click',()=>el('document-import-file')?.click());
  el('document-import-file')?.addEventListener('change',onDocumentImportFile);
  el('cancel-document-import')?.addEventListener('click',()=>{
    documentImportState={status:'idle',candidates:[]};
    render();
  });
  document.querySelectorAll('[data-import-select]').forEach(input=>{
    input.addEventListener('change',()=>{
      const index=Number(input.dataset.importSelect);
      if(documentImportState.candidates?.[index]) documentImportState.candidates[index].selected=input.checked;
    });
  });
  document.querySelectorAll('[data-import-value]').forEach(input=>{
    input.addEventListener('change',()=>{
      const index=Number(input.dataset.importValue);
      const candidate=documentImportState.candidates?.[index];
      if(!candidate) return;
      candidate.value=candidate.kind==='number'?Number(input.value):input.value;
    });
  });
  el('apply-document-import')?.addEventListener('click',()=>{
    const selected=(documentImportState.candidates??[]).filter(item=>item.selected!==false);
    for(const item of selected) {
      project=setField(
        project,item.path,item.value,FIELD_STATES.CONFIRMED,
        'document:'+String(documentImportState.fileName??'import')
      );
    }
    saveProject(project);
    documentImportState={
      status:'success',fileName:documentImportState.fileName,
      appliedCount:selected.length,candidates:[],
    };
    render();
  });
}

async function onDocumentImportFile(event) {
  const file=event.target.files?.[0];
  if(!file) return;
  documentImportState={
    status:'processing',fileName:file.name,candidates:[],
    progress:0,message:'Đang chuẩn bị đọc tài liệu…',
  };
  render();
  try {
    const extracted=await extractFileText(file,{onProgress:updateDocumentImportProgress});
    const candidates=extractDocumentCandidates(extracted.text,{fileName:file.name})
      .map(item=>({...item,selected:true}));
    documentImportState={
      status:'ready',fileName:file.name,candidates,
      method:extracted.method,progress:1,message:'Đã trích dữ liệu.',
    };
  } catch(error) {
    documentImportState={
      status:'error',fileName:file.name,candidates:[],
      error:error?.message??String(error),
    };
  }
  render();
}

function updateDocumentImportProgress(info={}) {
  documentImportState={
    ...documentImportState,
    progress:Number(info.progress??documentImportState.progress??0),
    message:info.message??documentImportState.message,
  };
  const bar=el('document-import-progress');
  const message=el('document-import-message');
  if(bar) bar.style.width=Math.round(documentImportState.progress*100)+'%';
  if(message) message.textContent=documentImportState.message??'Đang xử lý…';
}

function bindGuidedCalculator() {
  el('guided-calculator-form')?.addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const action=event.currentTarget.dataset.guidedAction;
      const values={};
      event.currentTarget.querySelectorAll('[data-guided-key]').forEach(input=>{
        values[input.dataset.guidedKey]=input.type==='number'?Number(input.value):input.value;
      });
      const input=buildGuidedInput(action,values);
      const {output,record}=persistCalculation(action,input);
      guidedState={action,values,output,record,error:null};
    } catch(error) {
      guidedState={...guidedState,error:error.message,output:null,record:null};
    }
    render();
  });
}

function persistCalculation(action,input) {
  const output=runStandardCalculation(project,{action,input});
  const record=createEngineeringCalculationRecord({
    action,issue:output.issue,standard:output.standard,input,output,engineVersion:'1.0.0',
  });
  project={
    ...project,
    engineeringCalculations:[...(project.engineeringCalculations??[]),record],
    updatedAt:new Date().toISOString(),
  };
  saveProject(project);
  return {output,record};
}

function loadPublicDemo() {
  documentImportState={status:'idle',candidates:[]};
  project=createPublicReferenceProject();
  saveProject(project);
  activeView='overview';
  guidedState=initialGuided('loads.permanent');
  render();
}

function runPublicDemoAtoZ() {
  if (!project.referenceCase) project=createPublicReferenceProject();
  project={...project,engineeringCalculations:[]};
  for (const [action,input] of publicReferenceCalculationInputs()) {
    const output=runStandardCalculation(project,{action,input});
    const record=createEngineeringCalculationRecord({
      action,issue:output.issue,standard:output.standard,input,output,engineVersion:'1.0.0',
      createdAt:new Date().toISOString(),
    });
    project.engineeringCalculations.push(record);
  }
  project.updatedAt=new Date().toISOString();
  saveProject(project);
  activeView='overview';
  render();
}

function bindEngineeringTools() {
  el('standard-calculator-action')?.addEventListener('change',event=>{
    calculatorState={action:event.target.value,inputText:JSON.stringify(calculatorExample(event.target.value),null,2),output:null,error:null};
    render();
  });
  el('standard-calculator-form')?.addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const action=el('standard-calculator-action').value;
      const input=JSON.parse(el('standard-calculator-input').value||'{}');
      const {output}=persistCalculation(action,input);
      calculatorState={action,inputText:JSON.stringify(input,null,2),output,error:null};
    } catch(error) {
      calculatorState={...calculatorState,inputText:el('standard-calculator-input')?.value??'{}',error:error.message,output:null};
    }
    render();
  });
  el('engineering-evidence-type')?.addEventListener('change',event=>{
    const data=el('engineering-evidence-data');
    if (data) data.value=JSON.stringify(evidenceDataExample(event.target.value),null,2);
  });
  el('engineering-evidence-form')?.addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const type=el('engineering-evidence-type').value;
      const record=createEngineeringEvidenceRecord({
        type,source:el('engineering-evidence-source').value,
        documentId:el('engineering-evidence-document-id').value,
        issuedAt:el('engineering-evidence-issued-at').value,
        methodRef:el('engineering-evidence-method').value,
        manufacturer:el('engineering-evidence-manufacturer')?.value||null,
        model:el('engineering-evidence-model')?.value||null,
        instrumentId:el('engineering-evidence-instrument')?.value||null,
        calibrationDate:el('engineering-evidence-calibration')?.value||null,
        data:JSON.parse(el('engineering-evidence-data').value||'{}'),
      });
      project={...project,engineeringEvidence:[...(project.engineeringEvidence??[]),record],updatedAt:new Date().toISOString()};
      saveProject(project); evidenceState={error:null};
    } catch(error) { evidenceState={error:error.message}; }
    render();
  });
  document.querySelectorAll('[data-remove-engineering-evidence]').forEach(button=>button.addEventListener('click',()=>{
    project={...project,engineeringEvidence:(project.engineeringEvidence??[]).filter(x=>x.id!==button.dataset.removeEngineeringEvidence),updatedAt:new Date().toISOString()};
    saveProject(project); render();
  }));
}

function bindImportExport() {
  const exportHtml=()=>{
    if (!workflow.results) return;
    downloadText(safeName(project.name)+'-buildmate.html',reportToHtml(buildProjectReport(project,workflow)),'text/html;charset=utf-8');
  };
  const exportCsv=()=>{
    if (!workflow.results) return;
    downloadText(safeName(project.name)+'-boq.csv',quantitiesToCsv(buildProjectReport(project,workflow)),'text/csv;charset=utf-8');
  };
  el('export-json')?.addEventListener('click',()=>downloadText('buildmate-projects.json',exportProjectsJson(),'application/json'));
  el('export-html')?.addEventListener('click',exportHtml);
  el('export-csv')?.addEventListener('click',exportCsv);
  document.querySelectorAll('[data-report-export="html"]').forEach(button=>button.addEventListener('click',exportHtml));
  document.querySelectorAll('[data-report-export="csv"]').forEach(button=>button.addEventListener('click',exportCsv));
  el('import-json')?.addEventListener('click',()=>el('import-json-file')?.click());
  el('import-json-file')?.addEventListener('change',async event=>{
    const file=event.target.files?.[0]; if (!file) return;
    importProjectsJson(await file.text());
    project=loadProject()??createAndSave(); render();
  });
}

function onChat(event) {
  event.preventDefault();
  const text=el('chat-text').value.trim(); if (!text) return;
  const parsed=interpretHomeownerText(text);
  for (const item of parsed.updates) project=setField(project,item.path,item.value);
  saveProject(project); render();
}

function onActual(event) {
  event.preventDefault();
  const amountVnd=Number(el('actual-amount').value);
  const description=el('actual-description').value.trim();
  if (!(amountVnd>0)||!description) return;
  project={...project,actuals:addActual(project.actuals,{amountVnd,description,status:el('actual-status').value,category:'construction'}),updatedAt:new Date().toISOString()};
  saveProject(project); render();
}

function switchProject(id) {
  documentImportState={status:'idle',candidates:[]};
  activateProject(id);
  project=loadProject();
  activeView='overview';
  render();
}

function safeName(value) {
  return String(value||'buildmate').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-_]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
}

render();
