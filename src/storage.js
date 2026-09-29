const KEY = 'buildmate.project.v1';

export function loadProject() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProject(project) {
  localStorage.setItem(KEY, JSON.stringify(project));
}

export function clearProject() {
  localStorage.removeItem(KEY);
}
