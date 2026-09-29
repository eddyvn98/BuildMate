import { interpretHomeownerText, nextQuestion } from '../ai/intake.js';
import { addDesignVersion, createDesignVersion } from '../engine/design-versions.js';
import { createProject, renameProject, setField } from '../engine/project.js';
import { runPlanningWorkflow } from '../engine/workflow.js';
import { downloadText } from '../report/download.js';
import { buildProjectReport, quantitiesToCsv, reportToHtml } from '../report/project-report.js';
import { activateProject, deleteProject, exportProjectsJson, listProjects, loadProject, saveProject } from '../storage.js';
import { shell } from './panels.js';

let project = loadProject() ?? createAndSave();
let workflow = runPlanningWorkflow(project);
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
  el('app').innerHTML = shell({ project, projects: listProjects(), workflow });
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
  el('project-select')?.addEventListener('change', (event) => {
    activateProject(event.target.value);
    project = loadProject();
    render();
  });
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
  el('export-json')?.addEventListener('click', () => downloadText('buildmate-projects.json', exportProjectsJson(), 'application/json'));
  el('export-html')?.addEventListener('click', () => {
    if (!workflow.results) return;
    const report = buildProjectReport(project, workflow);
    downloadText(`${safeName(project.name)}-buildmate.html`, reportToHtml(report), 'text/html;charset=utf-8');
    downloadText(`${safeName(project.name)}-boq.csv`, quantitiesToCsv(report), 'text/csv;charset=utf-8');
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

function safeName(value) {
  return String(value || 'buildmate').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

render();
