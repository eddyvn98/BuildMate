import { calculatorExample, evidenceDataExample } from './engineering-tools.js';
import { createEngineeringEvidenceRecord } from '../engine/engineering-evidence.js';
import { standardCalculatorCapabilities, runStandardCalculation } from '../engine/engineering/standards-calculator.js';
import { interpretHomeownerText, nextQuestion } from '../ai/intake.js';
import { addActual, removeActual } from '../engine/actuals.js';
import { addDesignVersion, createDesignVersion } from '../engine/design-versions.js';
import { createProject, renameProject, setField } from '../engine/project.js';
import { runPlanningWorkflow } from '../engine/workflow.js';
import { downloadText } from '../report/download.js';
import { buildProjectReport, quantitiesToCsv, reportToHtml } from '../report/project-report.js';
import { activateProject, deleteProject, exportProjectsJson, importProjectsJson, listProjects, loadProject, saveProject } from '../storage.js';
import { shell } from './panels.js';

let project = loadProject() ?? createAndSave();
let workflow = runPlanningWorkflow(project);
const calculatorCapabilities = standardCalculatorCapabilities();
let calculatorState = {
  action:'water.design-flow',
  inputText:JSON.stringify(calculatorExample('water.design-flow'),null,2),
  output:null,error:null,
};
let evidenceState = {error:null};
const el = (id) => document.getElementById(id);

function createAndSave() {
  const created = createProject();
  saveProject(created);
  return created;
}

function update(path, value, parser = (v) => v) {
  project = setField(project, path, parser(value));
  saveProject(project);
  render();
}

function render() {
  workflow = runPlanningWorkflow(project);
  el('app').innerHTML = shell({ project, projects: listProjects(), workflow, calculatorCapabilities, calculatorState, evidenceState });
  el('next-question').textContent = nextQuestion(project);
  bindFieldInputs();
  bindActions();
}

function bindFieldInputs() {
  document.querySelectorAll('[data-path]').forEach((input) => {
    input.addEventListener('change', () => update(
      input.dataset.path,
      input.type === 'checkbox' ? input.checked : input.value,
      input.type === 'number' ? Number : (v) => v,
    ));
  });
}

function bindActions() {
  el('chat-form')?.addEventListener('submit', onChat);
  el('project-select')?.addEventListener('change', (event) => switchProject(event.target.value));
  el('project-name')?.addEventListener('change', (event) => {
    project = renameProject(project, event.target.value);
    saveProject(project);
    render();
  });
  el('new-project')?.addEventListener('click', () => {
    project = createAndSave();
    render();
  });
  el('delete-project')?.addEventListener('click', () => {
    deleteProject(project.id);
    project = loadProject() ?? createAndSave();
    render();
  });
  el('save-version')?.addEventListener('click', () => {
    if (!workflow.results) return;
    project = addDesignVersion(project, createDesignVersion(project, workflow));
    saveProject(project);
    render();
  });
  el('actual-form')?.addEventListener('submit', onActual);
  document.querySelectorAll('[data-remove-actual]').forEach((button) => button.addEventListener('click', () => {
    project = { ...project, actuals: removeActual(project.actuals, button.dataset.removeActual) };
    saveProject(project);
    render();
  }));
  bindImportExport();
  bindEngineeringTools();
}

function bindEngineeringTools() {
  el('standard-calculator-action')?.addEventListener('change',(event)=>{
    calculatorState={action:event.target.value,inputText:JSON.stringify(calculatorExample(event.target.value),null,2),output:null,error:null};
    render();
  });
  el('standard-calculator-form')?.addEventListener('submit',(event)=>{
    event.preventDefault();
    try {
      const action=el('standard-calculator-action').value;
      const input=JSON.parse(el('standard-calculator-input').value || '{}');
      const output=runStandardCalculation(project,{action,input});
      calculatorState={action,inputText:JSON.stringify(input,null,2),output,error:null};
    } catch (error) {
      calculatorState={...calculatorState,inputText:el('standard-calculator-input').value,error:error.message,output:null};
    }
    render();
  });
  el('engineering-evidence-type')?.addEventListener('change',(event)=>{
    const data=el('engineering-evidence-data');
    if (data) data.value=JSON.stringify(evidenceDataExample(event.target.value),null,2);
  });
  el('engineering-evidence-form')?.addEventListener('submit',(event)=>{
    event.preventDefault();
    try {
      const type=el('engineering-evidence-type').value;
      const record=createEngineeringEvidenceRecord({
        type,
        source:el('engineering-evidence-source').value,
        documentId:el('engineering-evidence-document-id').value,
        issuedAt:el('engineering-evidence-issued-at').value,
        methodRef:el('engineering-evidence-method').value,
        manufacturer:el('engineering-evidence-manufacturer').value || null,
        model:el('engineering-evidence-model').value || null,
        instrumentId:el('engineering-evidence-instrument').value || null,
        calibrationDate:el('engineering-evidence-calibration').value || null,
        data:JSON.parse(el('engineering-evidence-data').value || '{}'),
      });
      project={...project,engineeringEvidence:[...(project.engineeringEvidence ?? []),record],updatedAt:new Date().toISOString()};
      saveProject(project);
      evidenceState={error:null};
    } catch (error) {
      evidenceState={error:error.message};
    }
    render();
  });
  document.querySelectorAll('[data-remove-engineering-evidence]').forEach((button)=>button.addEventListener('click',()=>{
    project={...project,engineeringEvidence:(project.engineeringEvidence ?? []).filter(x=>x.id!==button.dataset.removeEngineeringEvidence),updatedAt:new Date().toISOString()};
    saveProject(project);
    render();
  }));
}

function bindImportExport() {
  el('export-json')?.addEventListener('click', () => downloadText('buildmate-projects.json', exportProjectsJson(), 'application/json'));
  el('export-html')?.addEventListener('click', () => {
    if (!workflow.results) return;
    const report = buildProjectReport(project, workflow);
    downloadText(`${safeName(project.name)}-buildmate.html`, reportToHtml(report), 'text/html;charset=utf-8');
  });
  el('export-csv')?.addEventListener('click', () => {
    if (!workflow.results) return;
    const report = buildProjectReport(project, workflow);
    downloadText(`${safeName(project.name)}-boq.csv`, quantitiesToCsv(report), 'text/csv;charset=utf-8');
  });
  el('import-json')?.addEventListener('click', () => el('import-json-file').click());
  el('import-json-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importProjectsJson(await file.text());
    project = loadProject() ?? createAndSave();
    render();
  });
}

function onChat(event) {
  event.preventDefault();
  const text = el('chat-text').value.trim();
  if (!text) return;
  const parsed = interpretHomeownerText(text);
  for (const item of parsed.updates) project = setField(project, item.path, item.value);
  saveProject(project);
  render();
}

function onActual(event) {
  event.preventDefault();
  const amountVnd = Number(el('actual-amount').value);
  const description = el('actual-description').value.trim();
  const status = el('actual-status').value;
  if (!(amountVnd > 0) || !description) return;
  project = {
    ...project,
    actuals: addActual(project.actuals, { amountVnd, description, status, category: 'construction' }),
    updatedAt: new Date().toISOString(),
  };
  saveProject(project);
  render();
}

function switchProject(id) {
  activateProject(id);
  project = loadProject();
  render();
}

function safeName(value) {
  return String(value || 'buildmate').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

render();
