import { createEngineeringCalculationRecord } from '../engine/engineering-calculation-record.js';
import { calculatorExample,evidenceDataExample } from './engineering-tools.js';
import { guidedDefaultValues,buildGuidedInput } from './guided-calculator.js';
import { createEngineeringEvidenceRecord } from '../engine/engineering-evidence.js';
import { standardCalculatorCapabilities,runStandardCalculation } from '../engine/engineering/standards-calculator.js';
import { createPublicReferenceProject,publicReferenceCalculationInputs } from '../demo/public-reference-project.js';
import { interpretHomeownerText,nextQuestion } from '../ai/intake.js';
import { addActual,removeActual } from '../engine/actuals.js';
import { addDesignVersion,createDesignVersion } from '../engine/design-versions.js';
import { createProject,renameProject,setField } from '../engine/project.js';
import { runPlanningWorkflow } from '../engine/workflow.js';
import { downloadText } from '../report/download.js';
import { buildProjectReport,quantitiesToCsv,reportToHtml } from '../report/project-report.js';
import { activateProject,deleteProject,exportProjectsJson,importProjectsJson,listProjects,loadProject,saveProject } from '../storage.js';
import { shell } from './panels.js';

let project=loadProject()??createAndSave();
let workflow=runPlanningWorkflow(project);
let activeView='overview';
const calculatorCapabilities=standardCalculatorCapabilities();
let calculatorState={
  action:'water.design-flow',
  inputText:JSON.stringify(calculatorExample('water.design-flow'),null,2),
  output:null,error:null,
};
let guidedState=initialGuided('loads.permanent');
let evidenceState={error:null};
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
    calculatorState,guidedState,evidenceState,activeView,
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
    project=createAndSave(); activeView='overview'; render();
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
  bindGuidedCalculator();
  bindEngineeringTools();
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
    action,issue:output.issue,standard:output.standard,input,output,engineVersion:'0.9.0',
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
      action,issue:output.issue,standard:output.standard,input,output,engineVersion:'0.9.0',
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
  el('export-json')?.addEventListener('click',()=>downloadText('buildmate-projects.json',exportProjectsJson(),'application/json'));
  el('export-html')?.addEventListener('click',()=>{
    if (!workflow.results) return;
    downloadText(safeName(project.name)+'-buildmate.html',reportToHtml(buildProjectReport(project,workflow)),'text/html;charset=utf-8');
  });
  el('export-csv')?.addEventListener('click',()=>{
    if (!workflow.results) return;
    downloadText(safeName(project.name)+'-boq.csv',quantitiesToCsv(buildProjectReport(project,workflow)),'text/csv;charset=utf-8');
  });
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
  activateProject(id);
  project=loadProject();
  activeView='overview';
  render();
}

function safeName(value) {
  return String(value||'buildmate').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-_]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
}

render();
