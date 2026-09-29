export const FIELD_STATES = Object.freeze({
  CONFIRMED: 'confirmed',
  SUGGESTED: 'suggested',
  ASSUMED: 'assumed',
  MISSING: 'missing',
  BLOCKED: 'blocked',
});

export function field(value, state = FIELD_STATES.MISSING, source = 'user', note = '') {
  return { value, state, source, note };
}

export function createProject(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: overrides.name ?? 'Nhà mới',
    location: {
      province: field('', FIELD_STATES.MISSING),
      district: field('', FIELD_STATES.MISSING),
    },
    land: {
      widthM: field(null, FIELD_STATES.MISSING),
      lengthM: field(null, FIELD_STATES.MISSING),
      roadWidthM: field(null, FIELD_STATES.MISSING),
    },
    household: {
      people: field(4, FIELD_STATES.ASSUMED, 'buildmate', 'Giả định khởi đầu'),
      bedrooms: field(3, FIELD_STATES.ASSUMED, 'buildmate', 'Giả định khởi đầu'),
      hasElderly: field(false, FIELD_STATES.MISSING),
      hasCar: field(false, FIELD_STATES.MISSING),
    },
    design: {
      storeys: field(3, FIELD_STATES.SUGGESTED, 'buildmate', 'Có thể thay đổi sau khi làm rõ nhu cầu'),
      footprintRatio: field(0.85, FIELD_STATES.SUGGESTED, 'buildmate'),
      finishLevel: field('balanced', FIELD_STATES.SUGGESTED, 'buildmate'),
    },
    budget: {
      totalVnd: field(null, FIELD_STATES.MISSING),
      includesInterior: field(true, FIELD_STATES.SUGGESTED, 'buildmate'),
    },
    technical: {
      geotechnicalAvailable: field(false, FIELD_STATES.MISSING),
      planningInfoVerified: field(false, FIELD_STATES.MISSING),
    },
    alternatives: [],
    createdAt: overrides.createdAt ?? now,
    updatedAt: now,
    ...overrides,
  };
}

export function setField(project, path, value, state = FIELD_STATES.CONFIRMED, source = 'user') {
  const clone = structuredClone(project);
  const parts = path.split('.');
  let cursor = clone;
  for (let i = 0; i < parts.length - 1; i += 1) cursor = cursor[parts[i]];
  const key = parts.at(-1);
  cursor[key] = { ...(cursor[key] ?? {}), value, state, source };
  clone.updatedAt = new Date().toISOString();
  return clone;
}

export function readValue(project, path, fallback = null) {
  const result = path.split('.').reduce((acc, key) => acc?.[key], project);
  return result?.value ?? fallback;
}
