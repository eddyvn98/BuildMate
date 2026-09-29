import { hydrateProject } from './engine/project.js';

const LEGACY_KEY = 'buildmate.project.v1';
const COLLECTION_KEY = 'buildmate.projects.v2';
const ACTIVE_KEY = 'buildmate.active-project.v2';

export function listProjects() {
  const projects = readCollection().map(hydrateProject);
  if (projects.length > 0) return projects;

  const legacy = safeParse(localStorage.getItem(LEGACY_KEY));
  if (!legacy) return [];
  const migrated = hydrateProject(legacy);
  writeCollection([migrated]);
  localStorage.setItem(ACTIVE_KEY, migrated.id);
  return [migrated];
}

export function loadProject() {
  const projects = listProjects();
  if (projects.length === 0) return null;
  const activeId = localStorage.getItem(ACTIVE_KEY);
  return projects.find((item) => item.id === activeId) ?? projects[0];
}

export function saveProject(project) {
  const hydrated = hydrateProject(project);
  const projects = listProjects();
  const index = projects.findIndex((item) => item.id === hydrated.id);
  if (index >= 0) projects[index] = hydrated;
  else projects.push(hydrated);
  writeCollection(projects);
  localStorage.setItem(ACTIVE_KEY, hydrated.id);
}

export function activateProject(projectId) {
  const exists = listProjects().some((item) => item.id === projectId);
  if (!exists) return false;
  localStorage.setItem(ACTIVE_KEY, projectId);
  return true;
}

export function deleteProject(projectId) {
  const remaining = listProjects().filter((item) => item.id !== projectId);
  writeCollection(remaining);
  if (localStorage.getItem(ACTIVE_KEY) === projectId) {
    if (remaining[0]) localStorage.setItem(ACTIVE_KEY, remaining[0].id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
}

export function clearProject() {
  const active = loadProject();
  if (active) deleteProject(active.id);
}

export function exportProjectsJson() {
  return JSON.stringify({ schema: 'buildmate-projects-v2', projects: listProjects() }, null, 2);
}

export function importProjectsJson(text) {
  const parsed = safeParse(text);
  if (parsed?.schema !== 'buildmate-projects-v2' || !Array.isArray(parsed.projects)) {
    throw new Error('Không đúng định dạng BuildMate projects v2.');
  }
  const current = listProjects();
  const merged = new Map(current.map((item) => [item.id, item]));
  for (const raw of parsed.projects) {
    const project = hydrateProject(raw);
    merged.set(project.id, project);
  }
  const projects = [...merged.values()];
  writeCollection(projects);
  if (projects[0]) localStorage.setItem(ACTIVE_KEY, projects[0].id);
  return projects.length;
}

function readCollection() {
  const parsed = safeParse(localStorage.getItem(COLLECTION_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

function writeCollection(projects) {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(projects));
}

function safeParse(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}
